#!/usr/bin/env python3
"""The shared verse address every Bible layer keys on, and the editions' maps onto it.

The address is the Douay-Rheims's: its book slugs and its chapter and verse
numbers. Haydock's commentary, the lectionary and the Clerus index all number
as the Douay does. The Douay follows the Clementine Vulgate's numbering except
in ten chapters where the eBible Clementine (content/bible/vulgate) numbers
otherwise, each checked here verse by verse against both texts:

    genesis 5:31        the Vulgate joins Lamech's death and Noe's sons (Douay 31–32)
    psalms 15, 42, 125, 135
                        the Vulgate joins the last two verses (Douay n, n+1)
    psalms 19:10        the Douay joins what the Vulgate splits (Vulgate 9–10)
    psalms 115:1–10     the Douay keeps the Hebrew's 10–19
    psalms 147:1–9      the Douay keeps the Hebrew's 12–20
    isaias 45:24–25     "every knee shall bow" is its own verse in the Douay (24)
    isaias 46:12–13     the Douay joins the Vulgate's 11–12

`VULGATE_TO_DOUAY` sends a Vulgate verse to the Douay's; a verse the Douay
joins goes to the Douay verse that holds it. `JOINED` lists the Vulgate verses
that hold two of the Douay's: an edition whose two verses were both sent to one
of them gets the two Douay verses in turn. A verse not listed keeps its number.

Usage:
    python3 -I scripts/bible_address.py
        writes content/bible/vulgate/versification.json.
    python3 -I scripts/bible_address.py --migrate
        once only: re-aims greek-brenton's and hebrew-wlc's maps, written
        before this module, at the Douay. Twice would shift the Psalms twice.
    from bible_address import to_douay   # an importer, on its map before writing
"""
from __future__ import annotations

import json
from pathlib import Path

BIBLE = Path(__file__).resolve().parents[1] / "content" / "bible"

VULGATE_TO_DOUAY: dict[str, dict[tuple[int, int], tuple[int, int]]] = {
    "psalms": {
        **{(115, v): (115, v + 9) for v in range(1, 11)},
        **{(147, v): (147, v + 11) for v in range(1, 10)},
        (19, 10): (19, 9),
    },
    "isaias": {(45, 24): (45, 25), (45, 25): (45, 26), (46, 12): (46, 11), (46, 13): (46, 12)},
}


JOINED: dict[str, dict[tuple[int, int], list[tuple[int, int]]]] = {
    "genesis": {(5, 31): [(5, 31), (5, 32)]},
    "psalms": {
        (15, 10): [(15, 10), (15, 11)],
        (42, 5): [(42, 5), (42, 6)],
        (125, 6): [(125, 6), (125, 7)],
        (135, 26): [(135, 26), (135, 27)],
    },
    "isaias": {(45, 23): [(45, 23), (45, 24)]},
}


def douay(slug: str, chapter: int, verse: int) -> tuple[int, int]:
    """A Vulgate address in the Douay's numbering."""
    return VULGATE_TO_DOUAY.get(slug, {}).get((chapter, verse), (chapter, verse))


def _verses(directory: Path, slug: str) -> list[tuple[int, int]]:
    path = directory / f"{slug}.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [(int(c), int(v)) for c, vs in data.items() for v in vs]


def to_douay(
    edition: str, verse_map: dict[str, dict[str, str | None]]
) -> dict[str, dict[str, str | None]]:
    """An edition's map against the Vulgate's numbering, re-aimed at the Douay's.

    `edition` names the directory whose texts list the edition's verses: every
    verse of an affected chapter is considered, including those the map leaves
    as identity, since their Vulgate number may now name another Douay verse.
    """
    directory = BIBLE / edition
    new: dict[str, dict[str, str | None]] = {}
    slugs = list(verse_map) + [s for s in (*VULGATE_TO_DOUAY, *JOINED) if s not in verse_map]
    for slug in slugs:
        entries = dict(verse_map.get(slug, {}))
        # Every verse of an affected chapter, including those the map leaves as
        # identity: their Vulgate number may now name another Douay verse.
        chapters = {c for c, _ in VULGATE_TO_DOUAY.get(slug, {})} | {c for c, _ in JOINED.get(slug, {})}
        for c, v in _verses(directory, slug):
            if c in chapters:
                entries.setdefault(f"{c}:{v}", f"{c}:{v}")
        # The edition's verses sent to each joined Vulgate verse, in order.
        sharing: dict[tuple[int, int], list[str]] = {}
        for own, target in entries.items():
            if target is not None:
                at = tuple(int(x) for x in target.split(":"))
                if at in JOINED.get(slug, {}):
                    sharing.setdefault(at, []).append(own)
        dealt: dict[str, tuple[int, int]] = {}
        for at, owns in sharing.items():
            ordered = sorted(owns, key=lambda cv: tuple(int(x) for x in cv.split(":")))
            for own, place in zip(ordered, JOINED[slug][at]):
                dealt[own] = place
        out: dict[str, str | None] = {}
        for own, target in entries.items():
            if target is not None:
                c, v = dealt.get(own) or douay(slug, *(int(x) for x in target.split(":")))
                target = f"{c}:{v}"
            if target != own:
                out[own] = target
        if out:
            new[slug] = out
    return new


def write_vulgate() -> None:
    out = {
        slug: {f"{c}:{v}": f"{dc}:{dv}" for (c, v), (dc, dv) in sorted(table.items())}
        for slug, table in VULGATE_TO_DOUAY.items()
    }
    (BIBLE / "vulgate" / "versification.json").write_text(
        json.dumps(out, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    import sys

    write_vulgate()
    if "--migrate" in sys.argv:
        for edition in ("greek-brenton", "hebrew-wlc"):
            path = BIBLE / edition / "versification.json"
            verse_map = json.loads(path.read_text(encoding="utf-8"))
            path.write_text(
                json.dumps(to_douay(edition, verse_map), ensure_ascii=False, indent="\t") + "\n",
                encoding="utf-8",
            )
            print("re-aimed", edition)
