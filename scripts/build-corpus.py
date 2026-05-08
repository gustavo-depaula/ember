#!/usr/bin/env python3
"""Hearth v2 corpus builder.

Walks the flat content tree, splits per-language where appropriate (OF Mass
propers and OF library files), canonicalizes JSON, hashes blobs, emits
per-item manifests + a top-level catalog.json into the output directory.

Usage:
    python3 scripts/build-corpus.py [output_dir]

Default output: _site/hearth/v2/

The output is suitable for serving over static hosting (GitHub Pages):

    {output}/catalog.json
    {output}/blobs/{ab}/{cd}/{full-sha256}

Every catalog item references its manifest blob by hash. Manifests reference
content blobs by hash. Updates are blob-grained: a typo fix in one prayer
emits one new prayer-content blob + one new prayer-manifest blob and updates
catalog.json — clients fetch only the changed bytes.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

# Languages used in OF Mass propers and OF library files (per-language splittable).
OF_LANGS: set[str] = {"la", "es", "en", "pt-BR", "it", "fr", "de"}

# Languages used elsewhere in the corpus (kept multilingual, treated as one blob).
APP_LANGS: set[str] = {"en-US", "pt-BR", "la"}

# Combined language detection set — any dict whose keys are a non-empty subset
# of this is treated as a localized leaf during per-language splitting.
ALL_LANGS: set[str] = OF_LANGS | APP_LANGS


# ---------------------------------------------------------------------------
# Canonicalization & hashing
# ---------------------------------------------------------------------------

def canonical_json(obj: Any) -> bytes:
    """Stable bytes for hashing: sorted keys, no whitespace, ensure_ascii=False."""
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ---------------------------------------------------------------------------
# Builder state
# ---------------------------------------------------------------------------

class Builder:
    def __init__(self, output: Path):
        self.output = output
        self.blobs_dir = output / "blobs"
        self.blobs_dir.mkdir(parents=True, exist_ok=True)

        # Hashes already written to disk (skip duplicate writes).
        self.written_hashes: set[str] = set()

        # Catalog items: id -> entry
        self.catalog: dict[str, dict] = {}

        # Stats
        self.blobs_written = 0
        self.bytes_written = 0
        self.items_emitted = 0

    def write_blob(self, data: bytes) -> tuple[str, int]:
        """Write a blob if not already on disk; return (hash, size)."""
        h = sha256_hex(data)
        if h not in self.written_hashes:
            path = self.blobs_dir / h[:2] / h[2:4] / h
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
                self.blobs_written += 1
                self.bytes_written += len(data)
            self.written_hashes.add(h)
        return h, len(data)

    def write_json_blob(self, obj: Any) -> tuple[str, int]:
        return self.write_blob(canonical_json(obj))

    def add_catalog(self, item_id: str, entry: dict) -> None:
        if item_id in self.catalog:
            raise ValueError(f"duplicate catalog id: {item_id}")
        self.catalog[item_id] = entry
        self.items_emitted += 1

    def finalize(self) -> None:
        """Write catalog.json."""
        catalog = {
            "version": 2,
            "generated": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "items": dict(sorted(self.catalog.items())),
        }
        catalog_path = self.output / "catalog.json"
        catalog_path.write_bytes(canonical_json(catalog))


# ---------------------------------------------------------------------------
# Per-language splitter
# ---------------------------------------------------------------------------

def is_localized_leaf(obj: Any) -> bool:
    """A dict with keys that are all language codes (and at least one)."""
    if not isinstance(obj, dict) or not obj:
        return False
    return all(k in ALL_LANGS for k in obj.keys())


def split_languages(obj: Any) -> tuple[Any, dict[str, Any]]:
    """Return (shape, {lang: per-lang-tree}).

    The shape is `obj` with every localized leaf replaced by `None`.
    Each per-lang tree is `obj` with every localized leaf collapsed to that
    language's value (string), if present.
    """
    # Discover all languages used anywhere in obj
    found_langs: set[str] = set()
    def discover(o: Any) -> None:
        if is_localized_leaf(o):
            found_langs.update(o.keys())
        elif isinstance(o, dict):
            for v in o.values():
                discover(v)
        elif isinstance(o, list):
            for v in o:
                discover(v)
    discover(obj)

    def shape_walk(o: Any) -> Any:
        if is_localized_leaf(o):
            return None
        if isinstance(o, dict):
            return {k: shape_walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [shape_walk(v) for v in o]
        return o

    def lang_walk(o: Any, lang: str) -> Any:
        if is_localized_leaf(o):
            return o.get(lang)  # may be None
        if isinstance(o, dict):
            return {k: lang_walk(v, lang) for k, v in o.items()}
        if isinstance(o, list):
            return [lang_walk(v, lang) for v in o]
        return o

    shape = shape_walk(obj)
    per_lang = {lang: lang_walk(obj, lang) for lang in sorted(found_langs)}
    return shape, per_lang


# ---------------------------------------------------------------------------
# Per-kind walkers
# ---------------------------------------------------------------------------

def build_prayers(b: Builder) -> None:
    src = CONTENT / "prayers"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        pid = f.stem
        with f.open(encoding="utf-8") as fh:
            payload = json.load(fh)
        manifest = {"id": f"prayer/{pid}", **payload}
        h, size = b.write_json_blob(manifest)
        # Discover languages in title/body for catalog metadata
        langs = sorted(_discover_langs(payload))
        b.add_catalog(f"prayer/{pid}", {
            "kind": "prayer",
            "hash": h,
            "size": size,
            **({"langs": langs} if langs else {}),
        })


def build_practices(b: Builder) -> None:
    """Each practice's catalog blob is the original `manifest.json` body merged
    with resource hashes (flow / fragments / data / tracks / per-day / images).
    One fetch gives clients everything they need to render the practice card and
    know what blobs to load on demand."""
    src = CONTENT / "practices"
    if not src.is_dir():
        return
    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        pid = d.name
        manifest_path = d / "manifest.json"
        if not manifest_path.is_file():
            print(f"  warn: practice {pid} has no manifest.json")
            continue
        with manifest_path.open(encoding="utf-8") as fh:
            manifest_data = json.load(fh)

        flow_entry = None
        flow_path = d / "flow.json"
        if flow_path.is_file():
            with flow_path.open(encoding="utf-8") as fh:
                flow_data = json.load(fh)
            fh_hash, fh_size = b.write_json_blob(flow_data)
            flow_entry = {"hash": fh_hash, "size": fh_size}

        fragments = []
        frag_dir = d / "fragments"
        if frag_dir.is_dir():
            for ff in sorted(frag_dir.glob("*.json")):
                with ff.open(encoding="utf-8") as fh:
                    fdata = json.load(fh)
                fhh, fhs = b.write_json_blob(fdata)
                fragments.append({"id": ff.stem, "hash": fhh, "size": fhs})

        data_files = []
        data_dir = d / "data"
        if data_dir.is_dir():
            for ff in sorted(data_dir.rglob("*.json")):
                rel = ff.relative_to(data_dir).as_posix()
                with ff.open(encoding="utf-8") as fh:
                    dd = json.load(fh)
                dh, ds = b.write_json_blob(dd)
                data_files.append({"name": rel, "hash": dh, "size": ds})

        tracks_files = []
        tracks_dir = d / "tracks"
        if tracks_dir.is_dir():
            for ff in sorted(tracks_dir.rglob("*.json")):
                rel = ff.relative_to(tracks_dir).as_posix()
                with ff.open(encoding="utf-8") as fh:
                    td = json.load(fh)
                th, ts = b.write_json_blob(td)
                tracks_files.append({"name": rel, "hash": th, "size": ts})

        per_day = {}
        programs_dir = d / "programs"
        if programs_dir.is_dir():
            days_dir = programs_dir / "days"
            if days_dir.is_dir():
                for ff in sorted(days_dir.glob("*.json")):
                    day_key = ff.stem
                    with ff.open(encoding="utf-8") as fh:
                        dd = json.load(fh)
                    dh, ds = b.write_json_blob(dd)
                    per_day[day_key] = {"hash": dh, "size": ds}

        images = []
        img_dir = d / "images"
        if img_dir.is_dir():
            for ff in sorted(img_dir.rglob("*")):
                if ff.is_file() and ff.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}:
                    rel = ff.relative_to(img_dir).as_posix()
                    ih, isize = b.write_blob(ff.read_bytes())
                    images.append({"rel": rel, "hash": ih, "size": isize, "mime": _mime_for(ff)})

        # Merge: original manifest body + resource hashes. Drop legacy path-based
        # fields (`flow`, `data`, `tracks`) since v2 uses hash-based lookups.
        item_manifest = {**manifest_data, "id": f"practice/{pid}"}
        for legacy in ("flow", "data", "tracks"):
            item_manifest.pop(legacy, None)
        if flow_entry is not None:
            item_manifest["flowHash"] = flow_entry
        if fragments:
            item_manifest["fragments"] = fragments
        if data_files:
            item_manifest["dataHashes"] = data_files
        if tracks_files:
            item_manifest["trackHashes"] = tracks_files
        if per_day:
            item_manifest["perDay"] = per_day
        if images:
            item_manifest["images"] = images

        ih, isize = b.write_json_blob(item_manifest)

        catalog_entry = {"kind": "practice", "hash": ih, "size": isize}
        if isinstance(manifest_data.get("name"), dict):
            catalog_entry["name"] = manifest_data["name"]
        if "icon" in manifest_data:
            catalog_entry["icon"] = manifest_data["icon"]
        if "tags" in manifest_data:
            catalog_entry["tags"] = manifest_data["tags"]
        if "categories" in manifest_data and isinstance(manifest_data["categories"], list):
            catalog_entry["tags"] = list(set((catalog_entry.get("tags") or []) + manifest_data["categories"]))
        b.add_catalog(f"practice/{pid}", catalog_entry)


def build_chapters(b: Builder) -> None:
    src = CONTENT / "chapters"
    if not src.is_dir():
        return
    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        cid = d.name

        chap_meta = d / "chapter.json"
        if not chap_meta.is_file():
            print(f"  warn: chapter {cid} has no chapter.json")
            continue
        with chap_meta.open(encoding="utf-8") as fh:
            meta = json.load(fh)

        content_entry = None
        content_path = d / "content.json"
        if content_path.is_file():
            with content_path.open(encoding="utf-8") as fh:
                content_data = json.load(fh)
            ch, cs = b.write_json_blob(content_data)
            content_entry = {"hash": ch, "size": cs}

        prose: list[dict] = []
        sections_dir = d / "sections"
        if sections_dir.is_dir():
            for ff in sorted(sections_dir.glob("*.md")):
                stem = ff.stem
                if "." in stem:
                    base, lang = stem.rsplit(".", 1)
                else:
                    base, lang = stem, ""
                bh, bs = b.write_blob(ff.read_bytes())
                prose.append({"file": base, "lang": lang, "hash": bh, "size": bs})

        item_manifest = {**meta, "id": f"chapter/{cid}"}
        if content_entry:
            item_manifest["contentHash"] = content_entry
        if prose:
            item_manifest["prose"] = prose

        ih, isize = b.write_json_blob(item_manifest)
        catalog_entry = {"kind": "chapter", "hash": ih, "size": isize}
        if isinstance(meta.get("title"), dict):
            catalog_entry["title"] = meta["title"]
        if "tags" in meta:
            catalog_entry["tags"] = meta["tags"]
        b.add_catalog(f"chapter/{cid}", catalog_entry)


def build_books(b: Builder) -> None:
    src = CONTENT / "books"
    if not src.is_dir():
        return
    book_css = CONTENT / "book.css"
    style_entry = None
    if book_css.is_file():
        sh, ss = b.write_blob(book_css.read_bytes())
        style_entry = {"hash": sh, "size": ss}

    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        bid = d.name
        book_meta_path = d / "book.json"
        if not book_meta_path.is_file():
            print(f"  warn: book {bid} has no book.json")
            continue
        with book_meta_path.open(encoding="utf-8") as fh:
            meta = json.load(fh)

        chapters_by_lang: dict[str, dict[str, dict]] = {}
        for sub in sorted(d.iterdir()):
            if sub.is_dir() and sub.name not in {"images", "fonts"}:
                lang = sub.name
                for ff in sorted(sub.glob("*.md")):
                    chap_id = ff.stem
                    bh, bs = b.write_blob(ff.read_bytes())
                    chapters_by_lang.setdefault(chap_id, {})[lang] = {"hash": bh, "size": bs}
                for ff in sorted(sub.glob("*.html")):
                    chap_id = ff.stem
                    bh, bs = b.write_blob(ff.read_bytes())
                    chapters_by_lang.setdefault(chap_id, {})[lang] = {"hash": bh, "size": bs, "format": "html"}

        images = []
        img_dir = d / "images"
        if img_dir.is_dir():
            for ff in sorted(img_dir.rglob("*")):
                if ff.is_file() and ff.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}:
                    rel = ff.relative_to(img_dir).as_posix()
                    ih, isize = b.write_blob(ff.read_bytes())
                    images.append({"rel": rel, "hash": ih, "size": isize, "mime": _mime_for(ff)})

        item_manifest = {**meta, "id": f"book/{bid}", "chapters": chapters_by_lang}
        if style_entry:
            item_manifest["style"] = style_entry
        if images:
            item_manifest["images"] = images

        ih, isize = b.write_json_blob(item_manifest)
        catalog_entry = {"kind": "book", "hash": ih, "size": isize}
        if isinstance(meta.get("name"), dict):
            catalog_entry["name"] = meta["name"]
        if "author" in meta:
            catalog_entry["author"] = meta["author"]
        if "languages" in meta:
            catalog_entry["langs"] = meta["languages"]
        if "tags" in meta:
            catalog_entry["tags"] = meta["tags"]
        b.add_catalog(f"book/{bid}", catalog_entry)


def build_masses(b: Builder) -> None:
    """OF Mass propers — split shape + per-language."""
    src = CONTENT / "masses" / "of"
    if not src.is_dir():
        return
    for f in sorted(src.rglob("*.json")):
        rel = f.relative_to(CONTENT / "masses").with_suffix("")
        item_id = f"mass/{rel.as_posix()}"
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        shape, per_lang = split_languages(data)
        sh, ss = b.write_json_blob(shape)
        langs_dict = {}
        for lang, payload in per_lang.items():
            lh, lsize = b.write_json_blob(payload)
            langs_dict[lang] = {"hash": lh, "size": lsize}

        item_manifest = {
            "id": item_id,
            "shape": {"hash": sh, "size": ss},
            "langs": langs_dict,
        }
        # Pull out language-independent metadata for catalog hints
        ih, isize = b.write_json_blob(item_manifest)
        catalog_entry = {
            "kind": "mass",
            "hash": ih,
            "size": isize,
            "langs": sorted(langs_dict.keys()),
        }
        for k in ("group", "season", "rite", "rank", "liturgicalColor"):
            if k in data and not isinstance(data[k], dict):
                catalog_entry[k] = data[k]
        b.add_catalog(item_id, catalog_entry)


def build_of_library(b: Builder) -> None:
    """OF library files: ordinary, preface, eucharistic-prayer."""
    src = CONTENT / "of-library"
    if not src.is_dir():
        return
    for kind_dir in sorted(p for p in src.iterdir() if p.is_dir()):
        kind = kind_dir.name  # ordinary | preface | eucharistic-prayer
        catalog_kind = f"of-{kind}"
        for f in sorted(kind_dir.rglob("*.json")):
            rel = f.relative_to(kind_dir).with_suffix("")
            item_id = f"of/{kind}/{rel.as_posix()}"
            with f.open(encoding="utf-8") as fh:
                data = json.load(fh)
            shape, per_lang = split_languages(data)
            sh, ss = b.write_json_blob(shape)
            langs_dict = {}
            for lang, payload in per_lang.items():
                lh, lsize = b.write_json_blob(payload)
                langs_dict[lang] = {"hash": lh, "size": lsize}

            item_manifest = {
                "id": item_id,
                "shape": {"hash": sh, "size": ss},
                "langs": langs_dict,
            }
            ih, isize = b.write_json_blob(item_manifest)
            b.add_catalog(item_id, {
                "kind": catalog_kind,
                "hash": ih,
                "size": isize,
                "langs": sorted(langs_dict.keys()),
            })


def build_of_data(b: Builder) -> None:
    """OF data: calendar, saints, IGMR, sacerdotale.

    These are mostly metadata-heavy. Emit each file as a single multilingual blob.
    """
    src = CONTENT / "of-data"
    if not src.is_dir():
        return
    for f in sorted(src.rglob("*.json")):
        rel = f.relative_to(src).with_suffix("")
        item_id = f"of-data/{rel.as_posix()}"
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        h, size = b.write_json_blob(data)
        item_manifest = {
            "id": item_id,
            "data": {"hash": h, "size": size},
        }
        ih, isize = b.write_json_blob(item_manifest)
        b.add_catalog(item_id, {"kind": "of-data", "hash": ih, "size": isize})


def build_collections(b: Builder) -> None:
    src = CONTENT / "collections"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        cid = f.stem
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        # Ensure id is set
        data["id"] = f"collection/{cid}"
        h, size = b.write_json_blob(data)
        catalog_entry = {"kind": "collection", "hash": h, "size": size}
        if isinstance(data.get("name"), dict):
            catalog_entry["name"] = data["name"]
        if isinstance(data.get("description"), dict):
            catalog_entry["description"] = data["description"]
        if "tags" in data:
            catalog_entry["tags"] = data["tags"]
        if "icon" in data:
            catalog_entry["icon"] = data["icon"]
        catalog_entry["itemCount"] = len(data.get("items", []))
        b.add_catalog(f"collection/{cid}", catalog_entry)


def build_checkup(b: Builder) -> None:
    """Spiritual-checkup data — published as `checkup/<name>` corpus items."""
    src = CONTENT / "checkup"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        name = f.stem
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        h, size = b.write_json_blob(data)
        item_manifest = {"id": f"checkup/{name}", "data": {"hash": h, "size": size}}
        ih, isize = b.write_json_blob(item_manifest)
        b.add_catalog(f"checkup/{name}", {"kind": "checkup", "hash": ih, "size": isize})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _discover_langs(obj: Any) -> set[str]:
    """Find all language codes used as dict keys anywhere in obj."""
    found: set[str] = set()
    def walk(o: Any) -> None:
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ALL_LANGS:
                    found.add(k)
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(obj)
    return found


def _mime_for(p: Path) -> str:
    s = p.suffix.lower()
    return {
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".md": "text/markdown",
        ".html": "text/html",
        ".css": "text/css",
        ".json": "application/json",
    }.get(s, "application/octet-stream")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(argv: list[str]) -> int:
    output = Path(argv[1]) if len(argv) > 1 else (ROOT / "_site" / "hearth" / "v2")
    output = output.resolve()
    print(f"[corpus] output: {output}")

    if not CONTENT.is_dir():
        print(f"error: {CONTENT} not found", file=sys.stderr)
        return 1

    output.mkdir(parents=True, exist_ok=True)
    b = Builder(output)

    t0 = time.time()
    print("[corpus] prayers...")
    build_prayers(b)
    print("[corpus] practices...")
    build_practices(b)
    print("[corpus] chapters...")
    build_chapters(b)
    print("[corpus] books...")
    build_books(b)
    print("[corpus] masses (per-language splitting)...")
    build_masses(b)
    print("[corpus] of-library (per-language splitting)...")
    build_of_library(b)
    print("[corpus] of-data...")
    build_of_data(b)
    print("[corpus] collections...")
    build_collections(b)
    print("[corpus] checkup...")
    build_checkup(b)
    b.finalize()
    elapsed = time.time() - t0

    catalog_size = (output / "catalog.json").stat().st_size
    blob_count = sum(1 for _ in b.blobs_dir.rglob("*") if _.is_file())
    print()
    print(f"[corpus] done in {elapsed:.1f}s")
    print(f"  items in catalog: {b.items_emitted}")
    print(f"  blobs written:    {b.blobs_written}")
    print(f"  blobs total:      {blob_count}")
    print(f"  bytes written:    {b.bytes_written:,}")
    print(f"  catalog.json:     {catalog_size:,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
