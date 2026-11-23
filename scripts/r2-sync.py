#!/usr/bin/env python3
"""Mirror a local directory into an R2 bucket, sending only what changed.

    r2-sync.py <dir> [--prefix hearth/v2] [--delete] [--last '*.html'] [--dry-run]
    r2-sync.py --get <key> <file>     fetch one object, if it exists
    r2-sync.py --put <key> <file>     store one object

Reads R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_ENDPOINT and R2_BUCKET
(default `ember`) from the environment.

A file is sent when the bucket lacks it or holds different bytes (size, then
MD5 against the object's ETag). Files matching --last go up after everything
else, so a page or a catalog never points at something that is not there yet;
--delete removes what the directory no longer has, after the uploads.

Standard library only: the deploy runs this on a bare runner, and signing an
S3 request is less code than installing a client.
"""

from __future__ import annotations

import argparse
import datetime
import fnmatch
import hashlib
import hmac
import http.client
import json
import mimetypes
import os
import re
import sys
import threading
import time
import urllib.parse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# What the stock table lacks or gets wrong. A corpus blob has no extension and
# is JSON or markdown: `text/plain` lets Cloudflare compress it on the way out.
CONTENT_TYPES = {
    "": "text/plain; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".webmanifest": "application/manifest+json",
    ".gabc": "text/plain; charset=utf-8",
    ".wasm": "application/wasm",
    ".epub": "application/epub+zip",
}

# A corpus blob is named by the SHA-256 of its bytes: present means identical.
CONTENT_ADDRESSED = re.compile(r"(^|/)blobs/[0-9a-f]{2}/[0-9a-f]{2}/[0-9a-f]{64}$")

REGION = "auto"
WORKERS = 48
ATTEMPTS = 5


def sniff_image(path: Path) -> str | None:
    head = path.open("rb").read(12)
    if head.startswith(b"\x89PNG"):
        return "image/png"
    if head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "image/webp"
    return None


def content_type(key: str, path: Path) -> str:
    ext = os.path.splitext(key)[1].lower()
    # A corpus blob has no extension, and a book's pictures are blobs too.
    if not ext and (image := sniff_image(path)):
        return image
    return CONTENT_TYPES.get(ext) or mimetypes.guess_type(key)[0] or "application/octet-stream"


def sign(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()


class Bucket:
    def __init__(self, endpoint: str, bucket: str, access_key: str, secret_key: str):
        self.host = urllib.parse.urlparse(endpoint).netloc
        self.bucket = bucket
        self.access_key = access_key
        self.secret_key = secret_key
        self.local = threading.local()

    def request(
        self,
        method: str,
        key: str = "",
        query: dict[str, str] | None = None,
        body: bytes = b"",
        headers: dict[str, str] | None = None,
    ) -> bytes:
        path = "/" + self.bucket + ("/" + urllib.parse.quote(key, safe="/-_.~") if key else "")
        canonical_query = "&".join(
            f"{urllib.parse.quote(k, safe='-_.~')}={urllib.parse.quote(v, safe='-_.~')}"
            for k, v in sorted((query or {}).items())
        )
        for attempt in range(ATTEMPTS):
            now = datetime.datetime.now(datetime.timezone.utc)
            stamp, day = now.strftime("%Y%m%dT%H%M%SZ"), now.strftime("%Y%m%d")
            signed = {
                "host": self.host,
                "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
                "x-amz-date": stamp,
                **{k.lower(): v for k, v in (headers or {}).items()},
            }
            names = ";".join(sorted(signed))
            canonical = "\n".join(
                [
                    method,
                    path,
                    canonical_query,
                    "".join(f"{k}:{signed[k]}\n" for k in sorted(signed)),
                    names,
                    "UNSIGNED-PAYLOAD",
                ]
            )
            scope = f"{day}/{REGION}/s3/aws4_request"
            to_sign = "\n".join(
                ["AWS4-HMAC-SHA256", stamp, scope, hashlib.sha256(canonical.encode()).hexdigest()]
            )
            k = sign(("AWS4" + self.secret_key).encode(), day)
            for part in (REGION, "s3", "aws4_request"):
                k = sign(k, part)
            signature = hmac.new(k, to_sign.encode(), hashlib.sha256).hexdigest()
            auth = (
                f"AWS4-HMAC-SHA256 Credential={self.access_key}/{scope}, "
                f"SignedHeaders={names}, Signature={signature}"
            )
            try:
                conn = getattr(self.local, "conn", None)
                if conn is None:
                    conn = self.local.conn = http.client.HTTPSConnection(self.host, timeout=120)
                conn.request(
                    method,
                    path + ("?" + canonical_query if canonical_query else ""),
                    body=body,
                    headers={**signed, "authorization": auth},
                )
                res = conn.getresponse()
                data = res.read()
                if res.status < 300:
                    return data
                if res.status < 500 and res.status != 429:
                    raise SystemExit(f"{method} {key or '?' + canonical_query}: {res.status} {data[:300]!r}")
                error: Exception = RuntimeError(f"{res.status} {data[:200]!r}")
            except (OSError, http.client.HTTPException) as e:
                error = e
            self.local.conn = None
            if attempt == ATTEMPTS - 1:
                raise SystemExit(f"{method} {key}: {error}")
            time.sleep(2**attempt)
        raise AssertionError("unreachable")

    def list(self, prefix: str) -> dict[str, tuple[int, str]]:
        found: dict[str, tuple[int, str]] = {}
        token = ""
        ns = "{http://s3.amazonaws.com/doc/2006-03-01/}"
        while True:
            query = {"list-type": "2", "prefix": prefix, "max-keys": "1000"}
            if token:
                query["continuation-token"] = token
            root = ET.fromstring(self.request("GET", query=query))
            for item in root.iter(f"{ns}Contents"):
                found[item.findtext(f"{ns}Key") or ""] = (
                    int(item.findtext(f"{ns}Size") or 0),
                    (item.findtext(f"{ns}ETag") or "").strip('"'),
                )
            token = root.findtext(f"{ns}NextContinuationToken") or ""
            if not token:
                return found


def md5(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir", type=Path, nargs="?")
    ap.add_argument("--get", nargs=2, metavar=("KEY", "FILE"))
    ap.add_argument("--put", nargs=2, metavar=("KEY", "FILE"))
    ap.add_argument("--keep", action="append", default=[], help="glob of relative paths --delete spares")
    ap.add_argument("--keep-list", type=Path, help="file of relative paths --delete spares")
    ap.add_argument("--must-exist", type=Path, help="index cache whose blobs the bucket must hold")
    ap.add_argument("--prefix", default="", help="key prefix in the bucket")
    ap.add_argument("--delete", action="store_true", help="remove objects the directory lacks")
    ap.add_argument("--last", action="append", default=[], help="glob of keys to upload after the rest")
    ap.add_argument("--exclude", action="append", default=[], help="glob of relative paths to leave alone")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    bucket = Bucket(
        os.environ["R2_S3_ENDPOINT"],
        os.environ.get("R2_BUCKET", "ember"),
        os.environ["R2_ACCESS_KEY_ID"],
        os.environ["R2_SECRET_ACCESS_KEY"],
    )
    if args.get:
        key, file = args.get
        if key in bucket.list(key):
            Path(file).write_bytes(bucket.request("GET", key))
            print(f"[r2-sync] fetched {key}")
        else:
            print(f"[r2-sync] no {key} yet")
        return
    if args.put:
        key, file = args.put
        bucket.request("PUT", key, body=Path(file).read_bytes(), headers={"content-type": "application/json"})
        return
    if args.dir is None:
        ap.error("a directory is required")

    prefix = args.prefix.strip("/")
    prefix = prefix + "/" if prefix else ""

    started = time.time()
    with ThreadPoolExecutor(2) as pool:
        remote_future = pool.submit(bucket.list, prefix)
        local: dict[str, Path] = {}
        for root, _, files in os.walk(args.dir):
            for name in files:
                path = Path(root, name)
                rel = path.relative_to(args.dir).as_posix()
                if not any(fnmatch.fnmatch(rel, g) for g in args.exclude):
                    local[prefix + rel] = path
        remote = remote_future.result()
    excluded = {k for k in remote if any(fnmatch.fnmatch(k[len(prefix) :], g) for g in args.exclude)}

    def changed(item: tuple[str, Path]) -> bool:
        key, path = item
        if key not in remote:
            return True
        if CONTENT_ADDRESSED.search(key):
            return False
        size, etag = remote[key]
        return size != path.stat().st_size or etag != md5(path)

    with ThreadPoolExecutor(os.cpu_count() or 4) as pool:
        items = list(local.items())
        uploads = [key for (key, _), yes in zip(items, pool.map(changed, items)) if yes]
    kept = set(args.keep_list.read_text().split("\n")) if args.keep_list else set()
    spared = lambda key: key[len(prefix) :] in kept or any(  # noqa: E731
        fnmatch.fnmatch(key[len(prefix) :], g) for g in args.keep
    )
    deletes = [k for k in sorted(set(remote) - set(local) - excluded) if not spared(k)] if args.delete else []

    # A reused search index is not rebuilt, so its blob exists only in the bucket.
    if args.must_exist:
        cache = json.loads(args.must_exist.read_text(encoding="utf-8"))
        hashes = {r["hash"] for b in cache["books"].values() for r in b["indexes"].values()}
        keys = {f"{prefix}blobs/{h[:2]}/{h[2:4]}/{h}" for h in hashes}
        missing = keys - set(remote) - set(local)
        if missing:
            raise SystemExit(
                f"{len(missing)} search-index blobs are in neither the bucket nor this build "
                f"(e.g. {sorted(missing)[0]}): remove _build/index-cache.json from the bucket and rebuild"
            )
    is_last = lambda key: any(fnmatch.fnmatch(key, g) for g in args.last)  # noqa: E731
    first = [k for k in uploads if not is_last(k)]
    last = [k for k in uploads if is_last(k)]
    size = sum(local[k].stat().st_size for k in uploads)
    print(
        f"[r2-sync] {len(local)} local, {len(remote)} in bucket: "
        f"{len(uploads)} to upload ({size / 1e6:.1f} MB), {len(deletes)} to delete "
        f"({time.time() - started:.0f}s to compare)",
        flush=True,
    )
    if args.dry_run:
        for k in (first + last)[:40]:
            print("  +", k)
        for k in deletes[:40]:
            print("  -", k)
        return

    done = 0
    lock = threading.Lock()

    def put(key: str) -> None:
        nonlocal done
        bucket.request("PUT", key, body=local[key].read_bytes(), headers={"content-type": content_type(key, local[key])})
        with lock:
            done += 1
            if done % 5000 == 0:
                print(f"[r2-sync] {done}/{len(uploads)} uploaded", flush=True)

    with ThreadPoolExecutor(WORKERS) as pool:
        list(pool.map(put, first))
        list(pool.map(put, last))
        list(pool.map(lambda key: bucket.request("DELETE", key), deletes))
    print(f"[r2-sync] done in {time.time() - started:.0f}s", flush=True)


if __name__ == "__main__":
    if len(sys.argv) == 1:
        raise SystemExit(__doc__)
    main()
