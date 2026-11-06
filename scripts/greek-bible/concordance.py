#!/usr/bin/env python3
"""Build a lemma concordance for each Greek New Testament.

Writes content/bible/greek-<edition>/concordance/<shard>.json:
    {lexicon_key(lemma): {lemma: [[book slug, chapter, verse], ...]}}
every verse where the lemma occurs, once per verse, in canonical order and in
the edition's own numbering. Keys and shards are the lexicons' (see
lexicon_key.py), so a word looked up in the lexicon finds its concordance in
the shard of the same name; the app counts occurrences from the lists.

Derived only from words/ (built by nt.py; see glosses.py for the order of
the steps). Rerun after either.

Usage: python3 -I scripts/greek-bible/concordance.py [edition ...]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# -I drops the script's directory from sys.path; nt.py and the key live beside us.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lexicon_key import lexicon_key, shard_of  # noqa: E402
from nt import BIBLE, BOOKS  # noqa: E402

EDITIONS = ["nestle-1904", "sblgnt", "tischendorf", "byzantine"]


def concordance(edition: str) -> dict[str, dict[str, dict[str, list]]]:
    shards: dict[str, dict[str, dict[str, list]]] = {}
    for slug, *_ in BOOKS:
        words = json.loads((BIBLE / f"greek-{edition}" / "words" / f"{slug}.json").read_text(encoding="utf-8"))
        for chapter in sorted(words, key=int):
            for verse in sorted(words[chapter], key=int):
                # dict.fromkeys: each lemma once per verse, in the verse's order.
                for lemma in dict.fromkeys(entry[0] for entry in words[chapter][verse]):
                    key = lexicon_key(lemma)
                    if not key:
                        continue
                    refs = shards.setdefault(shard_of(key), {}).setdefault(key, {}).setdefault(lemma, [])
                    refs.append([slug, int(chapter), int(verse)])
    return shards


def write(edition: str, shards: dict[str, dict[str, dict[str, list]]]) -> int:
    out = BIBLE / f"greek-{edition}" / "concordance"
    out.mkdir(exist_ok=True)
    # A shard no longer produced must not linger from an earlier run.
    for old in out.glob("*.json"):
        old.unlink()
    size = 0
    for shard, entries in sorted(shards.items()):
        data = json.dumps(dict(sorted(entries.items())), ensure_ascii=False, separators=(",", ":"))
        (out / f"{shard}.json").write_text(data, encoding="utf-8")
        size += len(data.encode())
    return size


def main() -> None:
    editions = sys.argv[1:] or EDITIONS
    for edition in editions:
        if edition not in EDITIONS:
            sys.exit(__doc__)
        shards = concordance(edition)
        lemmas = sum(len(v) for entries in shards.values() for v in entries.values())
        print(f"{edition}: {lemmas} lemmas, {write(edition, shards) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
