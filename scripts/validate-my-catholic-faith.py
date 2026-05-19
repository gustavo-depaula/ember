#!/usr/bin/env python3
"""Validate every chapter file in content/books/morrow-my-catholic-faith/.

Checks:
  - Every TOC leaf id maps to a chapter file (or is explicitly imageless).
  - Every chapter file starts with an H1 heading.
  - Every image reference points at an existing webp.
  - No residual glued tokens (XxxYyy / xxxXxx / ALLCAPSGLUED).
  - Lesson numbering matches the title in the H1.

Exits non-zero on any failure.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "books" / "morrow-my-catholic-faith"
MANIFEST = BOOK_DIR / "book.json"

# Single all-caps words that legitimately appear in the body / headings.
ALLOWED_ALLCAPS = {
    "APOSTLES", "CATHOLIC", "CATHOLICS", "JERUSALEM", "PROTESTANT",
    "PONTIFICAL", "OBLIGATION", "REMEMBER", "ELEVENTH", "DIFFERENT",
    "CONTRIBUTE", "CONSISTORIES", "COMMUNION", "CARDINAL", "ARTICLES",
    "APPOINTED", "APOSTOLICITY", "APOSTOLIC", "ADULTERY", "EXPLANATION",
    "NEIGHBOUR", "NEIGHBOR",
}
# Camel proper-noun pairs allowed unsplit (genuine surname).
ALLOWED_CAMEL = {"DeVico"}


def leaves(toc):
    out = []
    for n in toc:
        if "children" in n:
            out.extend(leaves(n["children"]))
        else:
            out.append(n)
    return out


def main():
    manifest = json.loads(MANIFEST.read_text())
    md_dir = BOOK_DIR / "en-US"
    img_dir = BOOK_DIR / "images"

    failures = []
    warnings = []

    # 1. Every TOC leaf has a chapter file.
    leaf_ids = [n["id"] for n in leaves(manifest["toc"])]
    md_files = {f.stem for f in md_dir.glob("*.md")}
    for lid in leaf_ids:
        if lid not in md_files:
            failures.append(f"TOC leaf {lid!r} has no matching {lid}.md")
    for f in md_dir.glob("*.md"):
        if f.stem not in leaf_ids:
            warnings.append(f"Orphan chapter file (not in TOC): {f.name}")

    # 2. Every chapter starts with H1; image refs resolve.
    img_ref_re = re.compile(r"!\[[^\]]*\]\(\.\./images/([^)]+)\)")
    for f in sorted(md_dir.glob("*.md")):
        text = f.read_text()
        lines = text.splitlines()
        if not lines or not lines[0].startswith("# "):
            failures.append(f"{f.name}: missing H1 on first line")
        for m in img_ref_re.finditer(text):
            img = img_dir / m.group(1)
            if not img.exists():
                failures.append(f"{f.name}: image ref {m.group(1)} not found")

    # 3. Numbered chapters: H1 matches TOC title.
    h1_re = re.compile(r"^#\s+(.+)$")
    title_map = {n["id"]: n["title"]["en-US"] for n in leaves(manifest["toc"])}
    for f in sorted(md_dir.glob("lesson-*.md")):
        text = f.read_text()
        m = h1_re.match(text.splitlines()[0])
        if not m:
            continue
        h1 = m.group(1).strip()
        expected = title_map.get(f.stem, "")
        if h1.lower() != expected.lower():
            failures.append(f"{f.name}: H1 {h1!r} != TOC title {expected!r}")

    # 4. Residual glued tokens.
    body = "\n".join(f.read_text() for f in md_dir.glob("*.md"))

    camel = set(re.findall(r"\b[A-Z][a-z]+[A-Z][a-z]+\b", body)) - ALLOWED_CAMEL
    if camel:
        warnings.append(f"camelCase glued tokens: {sorted(camel)}")

    glue = set(re.findall(r"\b[a-z]+[A-Z][a-z]+\b", body))
    if glue:
        warnings.append(f"lowercase->Upper glued tokens: {sorted(glue)}")

    allcaps_glued = []
    for m in re.finditer(r"\b[A-Z]{8,}(?:'?[Ss])?\b", body):
        tok = m.group(0)
        bare = re.sub(r"'[Ss]$", "", tok)  # only strip possessive 'S, not bare trailing S
        if bare in ALLOWED_ALLCAPS:
            continue
        allcaps_glued.append(tok)
    allcaps_glued = sorted(set(allcaps_glued))
    if allcaps_glued:
        warnings.append(f"unknown all-caps tokens: {allcaps_glued}")

    print(f"Validated {len(md_files)} chapter files against {len(leaf_ids)} TOC leaves.")
    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for w in warnings:
            print(f"  - {w}")
    if failures:
        print(f"\nFailures ({len(failures)}):")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("\nOK.")


if __name__ == "__main__":
    main()
