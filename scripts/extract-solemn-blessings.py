#!/usr/bin/env python3
"""Parse ember-extra's bendiciones.json and oraciones-pueblo.json into
flow.json-shaped option blocks for the Mass concluding rites.

Output: prints two JSON snippets — one for Solemn Blessings, one for Prayer
over the People — meant to be inserted into mass/flow.json by hand or a
follow-up script.

Each Solemn Blessing in bendiciones.json is delimited by a numbered
heading rubric like "1." | "Advento". The body that follows is 3 priestly
invocations, each followed by "R. Amém.", then a final Trinitarian blessing
+ "R. Amém.". We slice on the numbered headings.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BENDICIONES = ROOT / "content/libraries/base/of/library/ordinary/bendiciones.json"
ORACIONES = ROOT / "content/libraries/base/of/library/ordinary/oraciones-pueblo.json"

# Bendiciones lines aren't paragraph-aligned across languages, so we extract
# pt-BR only and let the en-US translation come later (or be authored by hand).
LANGS = ["pt-BR"]
LANG_TO_FLOW = {"pt-BR": "pt-BR"}

# Subset of the most common occasions to expose as chips in the flow.
# Roman Missal numbering: 1.Advento, 2.Natal, 3.Início do ano, 4.Epifania,
# 5.Paixão, 6.Tempo Pascal, 7.Ascensão, 8.Espírito Santo,
# 9-14.Tempo Comum (six forms), 15.Bem-aventurada Virgem, ...
# We pick the top-of-mind seasonal forms.
WANTED_BLESSINGS = {
    "1": ("of-blessing-advento", {"pt-BR": "Advento", "en-US": "Advent"}),
    "2": ("of-blessing-natal", {"pt-BR": "Natal", "en-US": "Nativity"}),
    "4": ("of-blessing-epifania", {"pt-BR": "Epifania", "en-US": "Epiphany"}),
    "5": (
        "of-blessing-paixao",
        {"pt-BR": "Paixão / Quaresma", "en-US": "Passion / Lent"},
    ),
    "6": (
        "of-blessing-tempo-pascal",
        {"pt-BR": "Tempo Pascal", "en-US": "Easter Time"},
    ),
    "7": ("of-blessing-ascensao", {"pt-BR": "Ascensão", "en-US": "Ascension"}),
    "8": ("of-blessing-pentecostes", {"pt-BR": "Pentecostes", "en-US": "Pentecost"}),
    "9": (
        "of-blessing-comum-i",
        {"pt-BR": "Tempo Comum, I", "en-US": "Ordinary Time, I"},
    ),
    "15": (
        "of-blessing-virgem-maria",
        {"pt-BR": "Bem-aventurada Virgem Maria", "en-US": "Blessed Virgin Mary"},
    ),
}


def load_blessings(path: Path) -> dict[str, list[list[dict]]]:
    """Load body.lines.{lang} for each language we care about."""
    raw = json.loads(path.read_text())
    out = {}
    for lang in LANGS:
        out[lang] = raw["body"]["lines"].get(lang, [])
    return out


def slice_into_blessings(
    lines_by_lang: dict[str, list[list[dict]]],
) -> dict[str, dict[str, list[list[dict]]]]:
    """Walk one language's lines and find boundaries (lines that start with
    a numbered rubric like '1.' or '14.'). Apply the same boundary indices
    to all languages.
    """
    pt = lines_by_lang["pt-BR"]
    boundaries: list[tuple[int, str, str]] = []  # (line_index, number, title)
    number_re = re.compile(r"^(\d+)\.?$")
    for i, line in enumerate(pt):
        # A blessing starts when the line's first segment is "N." or "N",
        # followed by a rubric segment carrying the title. The first
        # segment is type:'text' (the numbered marker), the second is
        # type:'rubric' (the title). Skip range markers like "9-14".
        if not line:
            continue
        first = line[0]
        m = number_re.match(first.get("text", "").strip())
        if not m:
            continue
        # The title is usually the very next segment, a rubric.
        title = ""
        for seg in line[1:]:
            if seg.get("type") == "rubric" and seg.get("text", "").strip():
                title = seg["text"].strip()
                break
        if title:
            boundaries.append((i, m.group(1), title))

    blessings: dict[str, dict[str, list[list[dict]]]] = {}
    for idx, (start, number, _title) in enumerate(boundaries):
        end = boundaries[idx + 1][0] if idx + 1 < len(boundaries) else len(pt)
        per_lang = {lang: lines_by_lang[lang][start:end] for lang in LANGS}
        blessings[number] = per_lang
    return blessings


def lines_to_flow_sections(lines_by_lang: dict[str, list[list[dict]]]) -> list[dict]:
    """Convert per-language line arrays into flow sections.

    Each line becomes a `prayer` section with `inline` (multilingual). We
    don't attempt to rebuild typed segments here — the flow renderer treats
    inline as plain bilingual text. Rubric segments inside the line get
    flattened into the inline text, but rubrics that occupy their own line
    become a separate `rubric` section.
    """
    pt = lines_by_lang["pt-BR"]
    sections: list[dict] = []
    for offset, line in enumerate(pt):
        only_rubric = True
        parts: list[str] = []
        contains_response = False
        for seg in line:
            t = seg.get("text", "")
            parts.append(t)
            if seg.get("type") != "rubric":
                only_rubric = False
            if seg.get("type") == "rubric" and t.strip() == "℟.":
                contains_response = True
        text = " ".join(p for p in parts if p).strip()
        if not text:
            continue
        # Skip the very first line of the slice — that's the "N. Title" header
        # we already capture via the option label.
        if offset == 0:
            continue
        flow_inline = {"pt-BR": text}
        if contains_response or text.startswith("℟."):
            sections.append(
                {"type": "prayer", "speaker": "people", "inline": flow_inline}
            )
        elif only_rubric:
            sections.append({"type": "rubric", "text": flow_inline})
        else:
            sections.append(
                {"type": "prayer", "speaker": "priest", "inline": flow_inline}
            )
    return sections


def build_solemn_blessing_options() -> list[dict]:
    by_lang = load_blessings(BENDICIONES)
    blessings = slice_into_blessings(by_lang)
    options: list[dict] = []
    for number, (option_id, label) in WANTED_BLESSINGS.items():
        if number not in blessings:
            continue
        sections = lines_to_flow_sections(blessings[number])
        options.append({"id": option_id, "label": label, "sections": sections})
    return options


def build_prayer_over_people_options() -> list[dict]:
    """oraciones-pueblo.json packs all 28 prayers into a single body with
    inline numbered markers. Rather than re-split that mess, we just expose
    one canonical "for Lent" form authored by hand."""
    return [
        {
            "id": "of-popl-1",
            "label": {"pt-BR": "Forma simples (1)", "en-US": "Simple form (1)"},
            "sections": [
                {
                    "type": "prayer",
                    "speaker": "priest",
                    "inline": {
                        "pt-BR": "Ó Deus, acompanhai sempre o vosso povo e concedei nesta vida a consolação aos que chamais a tomar parte dos bens eternos. Por Cristo, nosso Senhor.",
                        "en-US": "O God, accompany your people always and grant in this life consolation to those whom you call to share in the eternal goods. Through Christ our Lord.",
                    },
                },
                {
                    "type": "prayer",
                    "speaker": "people",
                    "inline": {"pt-BR": "Amém.", "en-US": "Amen.", "la": "Amen."},
                },
            ],
        },
        {
            "id": "of-popl-quaresma",
            "label": {
                "pt-BR": "Forma quaresmal (2)",
                "en-US": "Lenten form (2)",
            },
            "sections": [
                {
                    "type": "prayer",
                    "speaker": "priest",
                    "inline": {
                        "pt-BR": "Concedei, Senhor, ao povo cristão conhecer a fé que professa e amar o dom celestial que celebra. Por Cristo, nosso Senhor.",
                        "en-US": "Grant, O Lord, that your Christian people may know the faith they profess and love the heavenly gift they celebrate. Through Christ our Lord.",
                    },
                },
                {
                    "type": "prayer",
                    "speaker": "people",
                    "inline": {"pt-BR": "Amém.", "en-US": "Amen.", "la": "Amen."},
                },
            ],
        },
    ]


def main() -> int:
    payload = {
        "solemn_blessings": build_solemn_blessing_options(),
        "prayer_over_people": build_prayer_over_people_options(),
    }
    out_path = ROOT / "content/libraries/base/practices/mass/_extracted-blessings.json"
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"wrote {out_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
