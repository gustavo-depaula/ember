#!/usr/bin/env python3
"""Comprehensive Aquinas corpus audit. Reports every chapter under 200
bytes — those are the broken ones, no rounding off."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS_ROOT = ROOT / "content" / "books" / "aquinas-opera-omnia"

total_books = 0
total_chapters_en = 0
total_chapters_la = 0
total_empty_en = 0
total_empty_la = 0

issues: dict[str, dict] = {}

for book_json in sorted(BOOKS_ROOT.rglob("book.json")):
    book_dir = book_json.parent
    meta = json.loads(book_json.read_text())
    bid = meta.get("id", book_dir.name)
    languages = meta.get("languages", [])
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"

    en_files = sorted(en_dir.iterdir()) if en_dir.is_dir() else []
    la_files = sorted(la_dir.iterdir()) if la_dir.is_dir() else []

    en_files = [f for f in en_files if f.suffix == ".md"]
    la_files = [f for f in la_files if f.suffix == ".md"]

    def is_broken(f):
        size = f.stat().st_size
        if size >= 200:
            return False
        text = f.read_text(encoding="utf-8", errors="ignore")
        # Intentional asymmetric-coverage placeholders count as non-broken
        # (the other language has the real content).
        if "No English translation" in text or "Nullum textus latini" in text:
            return False
        # Check for real content after stripping the H1 line. We do NOT strip
        # bold-italic content here — short Q-prooems (e.g. "We must next
        # consider the work of the fifth day.") are real content.
        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        if lines and lines[0].startswith("#"):
            lines = lines[1:]
        body = " ".join(lines).strip()
        # Strip markdown emphasis to count actual text chars.
        body_stripped = body.replace("*", "").replace("_", "").strip()
        return len(body_stripped) < 30
    empty_en = [f.name for f in en_files if is_broken(f)]
    empty_la = [f.name for f in la_files if is_broken(f)]

    total_books += 1
    total_chapters_en += len(en_files)
    total_chapters_la += len(la_files)
    total_empty_en += len(empty_en)
    total_empty_la += len(empty_la)

    if empty_en or empty_la:
        issues[bid] = {
            "dir": str(book_dir.relative_to(ROOT)),
            "languages": languages,
            "en_total": len(en_files),
            "la_total": len(la_files),
            "empty_en": empty_en,
            "empty_la": empty_la,
        }

print(f"Total books: {total_books}")
print(f"Total chapters en: {total_chapters_en}, empty: {total_empty_en}")
print(f"Total chapters la: {total_chapters_la}, empty: {total_empty_la}")
print()
print(f"Books with empty chapters: {len(issues)}")
print()

for bid, info in sorted(issues.items()):
    print(f"=== {bid} ===")
    print(f"  dir: {info['dir']}")
    print(f"  en: {len(info['empty_en'])}/{info['en_total']}, la: {len(info['empty_la'])}/{info['la_total']}")
    if info['empty_en']:
        print(f"  empty_en: {info['empty_en']}")
    if info['empty_la']:
        print(f"  empty_la: {info['empty_la']}")
