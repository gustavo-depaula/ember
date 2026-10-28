#!/usr/bin/env python3
"""Where the corpus has one text in two wordings.

    python3 scripts/loth/variants.py <dir of posts-*.json> > research/liturgia-das-horas/variants.tsv

Two parts of the same kind that differ by a word or two are one text of the
book written two ways, and one of the two is a slip (or both are, or the book
itself has both: a psalm's antiphon with and without its number is left out,
as is "aleluia", which comes and goes with Easter). Each is listed with how
many index entries use it and whether the wording is found in a second
transcription of the same breviary, liturgiadashoras.online (the posts
`compare-second.ts` reads). That site follows a later printing in places (the
Gospel canticles above all), so "found there" is a witness and not a verdict.
"""

import collections
import difflib
import glob
import html
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2] / "content" / "loth"
words_of = lambda text: re.findall(r"[^\W_]+", text.lower())


def part_words(blocks) -> list[str]:
    return words_of(" ".join("".join(s if isinstance(s, str) else s["t"] for s in line) for b in blocks for line in b["lines"]))


def distance(a: list[str], b: list[str], limit: int = 2) -> int:
    if abs(len(a) - len(b)) > limit:
        return limit + 1
    row = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        new = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            new[j] = min(row[j] + 1, new[j - 1] + 1, row[j - 1] + (x != b[j - 1]))
        if min(new) > limit:
            return limit + 1
        row = new
    return row[-1]


second = " \n ".join(
    " ".join(words_of(html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style|ins|iframe)\b.*?</\1>", " ", post["content"]["rendered"], flags=re.S | re.I)))))
    for name in sorted(glob.glob(f"{sys.argv[1]}/posts-*.json"))
    for post in json.load(open(name, encoding="utf-8"))
)
second = f" {second} "

parts: dict[str, tuple[str, list[str]]] = {}
for name in sorted(glob.glob(str(root / "parts" / "*.json"))):
    bundle = json.load(open(name, encoding="utf-8"))
    kind = re.sub(r"-\d+$", "", bundle["id"])
    if kind == "supplied":
        continue
    for i, blocks in enumerate(bundle["parts"]):
        parts[f"{bundle['id']}.{i}"] = (kind, part_words(blocks))

uses: collections.Counter[str] = collections.Counter()
for name in glob.glob(str(root / "index" / "*.json")):
    for slot, layers in json.load(open(name, encoding="utf-8"))["slots"].items():
        if slot != "@head":
            uses.update(ref for layer in layers for ref in layer["entries"].values() if ref)

# Only parts that open or close alike are worth setting side by side.
alike: dict[tuple, list[str]] = collections.defaultdict(list)
for ref, (kind, words) in parts.items():
    if len(words) >= 8:
        alike[(kind, *words[:4])].append(ref)
        alike[(kind, *words[-4:])].append(ref)

no_matter = re.compile(r"^(\d+( \d+)*|aleluia|ant|r|v|t p|i+|em latim|cf)?$")
seen: set[tuple[str, str]] = set()
rows = []
for refs in alike.values():
    if len(refs) > 60:
        continue
    for i, a in enumerate(refs):
        for b in refs[i + 1 :]:
            wa, wb = parts[a][1], parts[b][1]
            if a == b or not 0 < distance(wa, wb) <= 2:
                continue
            for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, wa, wb, autojunk=False).get_opcodes():
                if tag == "equal" or (no_matter.match(" ".join(wa[i1:i2])) and no_matter.match(" ".join(wb[j1:j2]))):
                    continue
                one, other = " ".join(wa[max(0, i1 - 4) : i2 + 4]), " ".join(wb[max(0, j1 - 4) : j2 + 4])
                if (one, other) in seen or (other, one) in seen:
                    continue
                seen.add((one, other))
                rows.append((parts[a][0], one, uses[a], f" {one} " in second, other, uses[b], f" {other} " in second))

print("kind\twording\tused\tin the second site\tother wording\tused\tin the second site")
for row in sorted(rows, key=lambda r: (r[3] == r[6], -(r[2] + r[5]))):
    print("\t".join("yes" if v is True else "no" if v is False else str(v) for v in row))
