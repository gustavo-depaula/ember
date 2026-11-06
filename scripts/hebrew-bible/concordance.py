#!/usr/bin/env python3
"""Build the Hebrew Bible's concordance from content/bible/hebrew-wlc/words/.

Writes content/bible/hebrew-wlc/concordance/:
    <shard>.json   {dStrong: [[slug, chapter, verse, morph], ...]}: every
                   occurrence of each word (a word twice in a verse is two
                   rows), with its grammar there, in canonical order and in the
                   Hebrew numbering, so the app can count occurrences and
                   filter them by form.
    counts.json    {dStrong: occurrences} for every dStrong, the prefixes and
                   suffixes included (H9001–H9049: "and", "the", "in", "my"),
                   whose tens of thousands of places have no list.

A piece is a word of the concordance: וּבַבַּיִת counts once for "and", once
for "in the" and once for בַּיִת "house" (H1004G).

Shards: the Strong's number of a dStrong in hundreds of five, so the app finds
a word's shard without an index:

    shard(dStrong) = str(int(digits of dStrong) // 500).zfill(2)
    H7225G → 7225 // 500 = 14 → "14.json"

Usage: python3 -I scripts/hebrew-bible/concordance.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import OUT, dump  # noqa: E402

AFFIX_FROM = 9000  # H9001…: prefixes, suffixes, the article; counted, not listed


def shard(dstrong: str) -> str:
    return str(int(re.match(r"^H(\d+)", dstrong).group(1)) // 500).zfill(2)


def main() -> None:
    order = [b["slug"] for b in json.loads((OUT / "index.json").read_text(encoding="utf-8"))]
    # Canonical order: the Hebrew Bible's, as the WLC files run (common.BOOKS),
    # not the Douay's of index.json — so a word's places read as the Hebrew does.
    from common import SLUGS  # noqa: PLC0415

    order = [s for s in SLUGS if s in order]
    shards: dict = {}
    counts: Counter = Counter()
    for slug in order:
        words = json.loads((OUT / "words" / f"{slug}.json").read_text(encoding="utf-8"))
        for c in sorted(words, key=int):
            for v in sorted(words[c], key=int):
                for entry in words[c][v]:
                    for d, _, morph, _ in entry["p"]:
                        if not d:
                            continue
                        counts[d] += 1
                        if int(re.match(r"^H(\d+)", d).group(1)) >= AFFIX_FROM:
                            continue
                        shards.setdefault(shard(d), {}).setdefault(d, []).append([slug, int(c), int(v), morph])
    out = OUT / "concordance"
    out.mkdir(exist_ok=True)
    for old in out.glob("*.json"):
        old.unlink()
    size = 0
    for name, entries in sorted(shards.items()):
        dump(out / f"{name}.json", dict(sorted(entries.items())))
        size += (out / f"{name}.json").stat().st_size
    dump(out / "counts.json", dict(sorted(counts.items())))
    print(f"{len(counts)} dStrongs, {sum(counts.values())} pieces; {len(shards)} shards, {size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
