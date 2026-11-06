#!/usr/bin/env python3
"""Write content/bible/hebrew-wlc/morphology.json: what each grammar code the
Hebrew words use means, field by field.

Source: TEHMC, "Translators Expansion of Hebrew Morphology Codes",
github.com/STEPBible/STEPBible-Data (Morphology codes/), CC BY 4.0: "Data
created by www.STEPBible.org based on work at Tyndale House Cambridge". Its
FULL MORPHOLOGY CODES section expands every code TAHOT tags a piece with, e.g.

    HVqw3ms  Function=Verb ; Stem=Qal (hence Action=Simple; Voice=Active);
             Form=Consecutive Imperfect (hence Tense=Past/present; Mood=Indicative);
             Person=Third; Gender=Masculine; Number=Singular

Only the codes the words files use are written (742 of TEHMC's 921). Values
become camelCase keys (`consecutiveImperfect`, `causativeDeclarative`) that the
app translates under `bible.hebrewMorph.<field>.<key>`; TEHMC's English stays
the meaning. The app words some of it otherwise where TEHMC's gloss misleads a
reader: a wayyiqtol is the narrative past, not "past/present".

Usage: python3 -I scripts/hebrew-bible/morphology.py <TEHMC .txt>
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "content" / "bible" / "hebrew-wlc"

# TEHMC field → the key the app reads.
FIELDS = {
    "Function": "f",
    "Stem": "s",
    "Action": "a",
    "Voice": "v",
    "Form": "m",
    "Tense": "t",
    "Mood": "md",
    "Person": "p",
    "Gender": "g",
    "Number": "n",
    "State": "st",
}

ROW = re.compile(r"^([HA][A-Za-z0-9]+)\t(Function=[^\t]*)")
PAIR = re.compile(r"(\w+)=([^;()]+?)\s*(?=;|\(|\)|$)")


def key(value: str) -> str:
    """`Consecutive Imperfect` → `consecutiveImperfect`; `Hé` → `he`; `jussive` → `jussive`."""
    words = re.split(r"[^A-Za-z]+", value.replace("é", "e"))
    words = [w for w in words if w]
    return words[0].lower() + "".join(w[:1].upper() + w[1:].lower() for w in words[1:])


def main(tehmc: str) -> None:
    expanded: dict[str, dict[str, str]] = {}
    for line in open(tehmc, encoding="utf-8-sig"):
        row = ROW.match(line.rstrip("\n"))
        if not row:
            continue
        fields = {FIELDS[k]: key(v) for k, v in PAIR.findall(row.group(2)) if k in FIELDS}
        # Aramaic codes open with A, Hebrew with H; the language is the app's to say.
        fields["l"] = "aramaic" if row.group(1).startswith("A") else "hebrew"
        expanded[row.group(1)] = fields

    used: set[str] = set()
    for path in sorted((ROOT / "words").glob("*.json")):
        for chapter in json.loads(path.read_text(encoding="utf-8")).values():
            for verse in chapter.values():
                for token in verse:
                    used.update(piece[2] for piece in token.get("p", []))

    missing = sorted(code for code in used if code not in expanded)
    out = {code: expanded[code] for code in sorted(used) if code in expanded}
    (ROOT / "morphology.json").write_text(
        json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )
    print(f"{len(out)} codes written; not in TEHMC: {missing}")


if __name__ == "__main__":
    main(sys.argv[1])
