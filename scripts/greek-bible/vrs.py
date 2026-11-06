"""Read Paratext/SIL `.vrs` versification files and compose them.

A `.vrs` file describes one versification: a line per book giving each
chapter's last verse (`GEN 1:31 2:25 …`), and mapping lines `A = B` that send a
verse (or a same-chapter range) of this versification to the "original"
versification (`org.vrs`: BHS for the Old Testament). A verse with no mapping
line maps to the same address in `org`. Composing two files through `org`
(`lxx` → `org` → `vul`) gives a first draft of a verse map between two editions.

The SIL tables (github.com/sillsdev/machine.py, MIT) are a draft, not an
authority: they have duplicated and contradictory lines, use verse 0 for psalm
titles, and leave Tobit, Judith and Sirach unmapped in `vul.vrs`. Callers check
the result against the texts.

Usage (as a library):
    lxx = vrs.load("lxx.vrs"); vul = vrs.load("vul.vrs")
    vrs.compose(lxx, vul, "JER", 32, 1)   # → ("JER", 25, 15) or None
"""
from __future__ import annotations

import re
from pathlib import Path

LINE = re.compile(
    r"^([0-9A-Z]{3}) (\d+):(\d+)(?:-(\d+))? = ([0-9A-Z]{3}) (\d+):(\d+)(?:-(\d+))?\s*$"
)


def _expand(c: int, v1: int, v2: int | None) -> list[tuple[int, int]]:
    return [(c, v) for v in range(v1, (v2 or v1) + 1)]


def parse(text: str) -> dict:
    """{"chapters": {book: [last verse of ch 1, ch 2, …]},
    "to_org": {(book, c, v): (book, c, v)}, "from_org": {(book, c, v): (book, c, v)}}.

    When a verse is mapped twice the first line wins: the files repeat a verse
    to say it spans two `org` verses (`NEH 3:30 = NEH 3:30`, `NEH 3:30 = NEH 3:31`),
    and the first is where it starts. Likewise the first verse mapped onto an
    `org` verse is its inverse."""
    chapters: dict[str, list[int]] = {}
    to_org: dict = {}
    from_org: dict = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = LINE.match(line)
        if m:
            b1, c1, s1, e1, b2, c2, s2, e2 = m.groups()
            src = _expand(int(c1), int(s1), int(e1) if e1 else None)
            dst = _expand(int(c2), int(s2), int(e2) if e2 else None)
            # A range onto a single verse (`9:22-39 = 10:1-18` is equal length;
            # `3:52-23` is a typo upstream) pairs up to the shorter side.
            if len(dst) == 1:
                dst = dst * len(src)
            for a, b in zip(src, dst):
                to_org.setdefault((b1, *a), (b2, *b))
                from_org.setdefault((b2, *b), (b1, *a))
            continue
        parts = line.split()
        if re.fullmatch(r"[0-9A-Z]{3}", parts[0]) and all(
            re.fullmatch(r"\d+:\d+", p) for p in parts[1:]
        ):
            chapters[parts[0]] = [int(p.split(":")[1]) for p in parts[1:]]
    return {"chapters": chapters, "to_org": to_org, "from_org": from_org}


def load(path: str | Path) -> dict:
    return parse(Path(path).read_text(encoding="utf-8"))


def exists(vrs: dict, book: str, c: int, v: int) -> bool:
    counts = vrs["chapters"].get(book)
    return bool(counts) and 1 <= c <= len(counts) and 0 <= v <= counts[c - 1]


def to_org(vrs: dict, book: str, c: int, v: int) -> tuple[str, int, int]:
    return vrs["to_org"].get((book, c, v), (book, c, v))


def from_org(vrs: dict, book: str, c: int, v: int) -> tuple[str, int, int] | None:
    """The verse of `vrs` an `org` verse lands on, or None. An unmapped `org`
    verse keeps its address only if `vrs` has that verse and does not send it
    somewhere else (otherwise two verses would claim one address)."""
    hit = vrs["from_org"].get((book, c, v))
    if hit:
        return hit
    if exists(vrs, book, c, v) and (book, c, v) not in vrs["to_org"]:
        return (book, c, v)
    return None


def compose(src: dict, dst: dict, book: str, c: int, v: int) -> tuple[str, int, int] | None:
    """Map verse `book c:v` of versification `src` to `dst` through `org`."""
    return from_org(dst, *to_org(src, book, c, v))
