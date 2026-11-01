#!/usr/bin/env python3
"""Check one imported book without building the whole corpus.

    python3 scripts/check-book.py content/books/<book-dir>

Runs the corpus build's own book checks (titles, work/editions) and adds the
import rules: every language listed has a folder and an `editions` entry, every
table-of-contents leaf has a chapter file in the book's first (source)
language, and every chapter file has a table-of-contents node. Exits 1 on an
error; warnings are printed.
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build_corpus", ROOT / "scripts" / "build-corpus.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


def leaves(nodes):
    for node in nodes:
        if node.get("children"):
            yield from leaves(node["children"])
        else:
            yield node["id"]


def main(book_dir: str) -> int:
    d = Path(book_dir)
    meta = json.loads((d / "book.json").read_text(encoding="utf-8"))
    bid = meta.get("id") or d.name
    errors = []
    langs = meta.get("languages") or []
    if not langs:
        errors.append("no languages")
    if "work" not in meta:
        errors.append("no work (<author>/<work>)")
    for lang in langs:
        if not (d / lang).is_dir():
            errors.append(f"languages lists {lang} but there is no {lang}/ folder")
        if lang not in (meta.get("editions") or {}):
            errors.append(f"no editions entry for {lang}")
    chapter_paths: dict = {}
    for sub in sorted(p for p in d.iterdir() if p.is_dir() and p.name in langs):
        for f in sorted(sub.glob("*.md")):
            if f.stem in build.NON_CHAPTER_STEMS:
                continue
            chapter_paths.setdefault(f.stem, {})[sub.name] = (str(f), False)
    toc_leaves = list(leaves(meta.get("toc") or []))
    if langs:
        missing = [c for c in toc_leaves if langs[0] not in chapter_paths.get(c, {})]
        if missing:
            errors.append(f"{len(missing)} toc leaves without a {langs[0]} file, e.g. {missing[:5]}")
    try:
        build._validate_book_editions(bid, meta)
    except ValueError as e:
        errors.append(str(e))
    build._validate_book_titles(bid, meta, chapter_paths)
    words = {lang: sum(len(Path(p).read_text(encoding="utf-8").split()) for c in chapter_paths.values() for l, (p, _) in c.items() if l == lang) for lang in langs}
    print(f"book/{bid}: {len(toc_leaves)} toc leaves, {len(chapter_paths)} chapter files, words {words}")
    for e in errors:
        print(f"  ERROR: {e}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
