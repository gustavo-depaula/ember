#!/usr/bin/env python3
"""
Download public-domain sacred art from Wikimedia Commons,
convert to WebP, and emit attribution manifests.

Usage:
    python scripts/download-sacred-art.py <curation.json>

The curation file is a JSON array of entries:
    [
      {
        "practice": "rosary",
        "slug": "joyful-1-annunciation",
        "commons_file": "Fra_Angelico_-_The_Annunciation_-_WGA00533.jpg",
        "artist": "Fra Angelico",
        "title": "The Annunciation",
        "year": "c. 1440",
        "license": "Public Domain"
      },
      ...
    ]

Images go to content/libraries/base/practices/<practice>/images/<slug>.webp.
Attribution is emitted to content/libraries/base/practices/<practice>/images/_attribution.json
and is keyed by slug.
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
LIBRARY_BASE = REPO_ROOT / "content" / "libraries" / "base" / "practices"
USER_AGENT = "EmberPrayerApp/1.0 (+https://github.com/gustavo-depaula/prayer) sacred-art-downloader"
TARGET_WIDTH = 1600
WEBP_QUALITY = 85


def wm_api_image_info(filename: str) -> dict:
    """Query Wikimedia Commons API for file metadata + direct URL."""
    api = (
        "https://commons.wikimedia.org/w/api.php"
        f"?action=query&titles=File:{quote(filename)}"
        "&prop=imageinfo&iiprop=url|size|mime|extmetadata"
        "&format=json&formatversion=2"
    )
    req = Request(api, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read())
    pages = payload.get("query", {}).get("pages", [])
    if not pages or "imageinfo" not in pages[0]:
        raise RuntimeError(f"No imageinfo for File:{filename}. Check the name on Commons.")
    return pages[0]["imageinfo"][0]


def download_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=120) as resp:
        return resp.read()


def to_webp(raw: bytes, width: int = TARGET_WIDTH, quality: int = WEBP_QUALITY) -> bytes:
    img = Image.open(io.BytesIO(raw))
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.width > width:
        ratio = width / img.width
        img = img.resize((width, int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, method=6)
    return buf.getvalue()


def process_entry(entry: dict) -> tuple[Path, dict]:
    practice = entry["practice"]
    slug = entry["slug"]
    images_dir = LIBRARY_BASE / practice / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    out_path = images_dir / f"{slug}.webp"
    info = wm_api_image_info(entry["commons_file"])
    print(f"  fetching {entry['commons_file']} ({info['width']}x{info['height']}, {info['mime']})", flush=True)
    raw = download_bytes(info["url"])
    webp = to_webp(raw)
    out_path.write_bytes(webp)

    meta = info.get("extmetadata", {})
    attribution = {
        "slug": slug,
        "commons_file": entry["commons_file"],
        "commons_url": info.get("descriptionurl"),
        "source_url": info["url"],
        "artist": entry.get("artist") or strip_html(meta.get("Artist", {}).get("value", "")),
        "title": entry.get("title") or strip_html(meta.get("ObjectName", {}).get("value", "")),
        "year": entry.get("year") or meta.get("DateTimeOriginal", {}).get("value", ""),
        "license": entry.get("license") or meta.get("LicenseShortName", {}).get("value", ""),
        "license_url": meta.get("LicenseUrl", {}).get("value", ""),
        "credit": meta.get("Credit", {}).get("value", ""),
    }
    print(f"    → {out_path.relative_to(REPO_ROOT)}  ({len(webp) // 1024} KB)", flush=True)
    return out_path, attribution


def strip_html(s: str) -> str:
    """Quick-and-dirty strip of HTML tags from Commons metadata."""
    import re
    return re.sub(r"<[^>]+>", "", s).strip()


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2

    curation_path = Path(sys.argv[1])
    entries = json.loads(curation_path.read_text())

    by_practice: dict[str, list[dict]] = {}
    for entry in entries:
        print(f"[{entry['practice']}/{entry['slug']}]", flush=True)
        try:
            _, attribution = process_entry(entry)
            by_practice.setdefault(entry["practice"], []).append(attribution)
        except Exception as e:
            print(f"  ERROR: {e}", file=sys.stderr, flush=True)

    for practice, items in by_practice.items():
        manifest_path = LIBRARY_BASE / practice / "images" / "_attribution.json"
        manifest_path.write_text(json.dumps({"images": items}, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {manifest_path.relative_to(REPO_ROOT)} ({len(items)} entries)", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
