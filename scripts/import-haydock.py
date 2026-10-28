#!/usr/bin/env python3
"""Rebuild content/bible/haydock/ from Haydock's Catholic Bible Commentary.

Source: github.com/cmahte/ENG-B-Haydock1883-pd-PSFM (public domain), the USFM
of the transcription published at johnblood.gitlab.io/haydock. Its verse text
is Challoner's Douay-Rheims, which the corpus already has in content/bible/drb,
so only the commentary is kept.

Writes, per book, `<slug>.json` as {chapter: {verses: [note, ...]}} under the
Douay slugs and verse numbers, and `intros.json` ({slug: [paragraph, ...]}).
`verses` is one verse ("3"), or a span for a note on several ("8-9"); "0" is a
note on the chapter as a whole.

Usage:
    python3 scripts/import-haydock.py <dir with the repo's .sfm files>
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "content" / "bible" / "haydock"

spec = importlib.util.spec_from_file_location("usfm", Path(__file__).with_name("import-bible-usfm.py"))
usfm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(usfm)


def clean(text: str) -> str:
    text = re.sub(r"\\\+?[a-z0-9]+\*?", "", text)
    text = re.sub(r"\s*-{2,}\s*", " — ", text)  # the transcriber's dash between authors
    return re.sub(r"\s+", " ", text).strip(" —")


def parse(path: Path) -> tuple[dict[str, dict[str, list[str]]], list[str]]:
    notes: dict[str, dict[str, list[str]]] = {}
    intro: list[str] = []
    chapter = None
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if line.startswith("\\c "):
            chapter = line[3:].strip()
        elif chapter is None and line.startswith(("\\im ", "\\ip ")):
            paragraph = clean(line[4:])
            if paragraph:
                intro.append(paragraph)
        # References come as "1:2", "1:2-4" (a note on a span of verses) and
        # "<>:2" (the chapter in hand); a note without a verse is the chapter's own, verse "0".
        for ref, body in re.findall(r"\\f \+ \\fr\s*([^\\]*?)\s*\\f[tk]\s*(.*?)\\f\*", line):
            match = re.match(r"(\d+|<>):(\d+)(?:-+(\d+))?", ref)
            ref_chapter = match.group(1) if match and match.group(1) != "<>" else chapter
            body = clean(body)
            if body and ref_chapter:
                verse = match.group(2) if match else "0"
                if match and match.group(3) and int(match.group(3)) > int(verse):
                    verse = f"{verse}-{match.group(3)}"
                notes.setdefault(ref_chapter, {}).setdefault(verse, []).append(body)
    return notes, intro


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    files = {usfm.book_code(p): p for p in Path(sys.argv[1]).glob("*.sfm")}
    OUT.mkdir(parents=True, exist_ok=True)
    intros, total, strays = {}, 0, []
    for code, slug, _name, _testament in usfm.BOOKS:
        notes, intro = parse(files[code])
        drb = json.loads((usfm.BIBLE / "drb" / f"{slug}.json").read_text(encoding="utf-8"))
        for chapter, verses in notes.items():
            strays += [
                f"{slug} {chapter}:{v}"
                for v in verses
                if v != "0" and any(n not in drb.get(chapter, {}) for n in v.split("-"))
            ]
        total += sum(len(n) for verses in notes.values() for n in verses.values())
        (OUT / f"{slug}.json").write_text(
            json.dumps(notes, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
        )
        intros[slug] = intro
    (OUT / "intros.json").write_text(
        json.dumps(intros, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )
    if strays:
        print(f"{len(strays)} notes on verses the Douay-Rheims lacks:", ", ".join(strays[:40]))
    print(f"{len(intros)} books, {total} notes")


if __name__ == "__main__":
    main()
