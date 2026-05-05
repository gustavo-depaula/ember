#!/usr/bin/env python3
"""Splice extracted Solemn Blessings + Prayer over the People into the
Mass concluding-rites section of flow.json.

Wraps the blessing chip toggle in a `select on celebration.primary.season`
so the user only sees season-appropriate forms (a Christmas blessing won't
show up in Lent). Each season case has its own set of `options` —
`Bênção simples` is always available as the default.

Idempotent: searches for the existing blessing block and replaces it.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"
EXTRACTED = ROOT / "content/libraries/base/practices/mass/_extracted-blessings.json"


# Manual entries — Advento + Tempo Comum I + Bem-aventurada Virgem Maria
# (these don't slice cleanly from the extractor and are authored by hand
# from the Roman Missal's Brazilian edition).
def trinitarian_blessing_sections():
    """Standard 3-invocation + Trinitarian Solemn Blessing closing."""
    return []


MANUAL_BLESSINGS = {
    "of-blessing-advento": {
        "id": "of-blessing-advento",
        "label": {"pt-BR": "Advento", "en-US": "Advent"},
        "sections": [
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "O Deus onipotente e misericordioso vos santifique com o esplendor do advento do seu Filho, em cuja vinda credes e cuja volta esperais, e derrame sobre vós as suas bênçãos."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "Durante esta vida, Deus vos torne firmes na fé, alegres na esperança e solícitos na caridade."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "E vós, que vos alegrais com fé e devoção pela vinda, segundo a carne, do nosso Redentor, sejais recompensados com o prêmio da vida eterna, quando ele vier de novo na majestade da sua glória."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "E a bênção de Deus todo-poderoso, Pai e Filho ✠ e Espírito Santo, desça sobre vós e permaneça para sempre."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
        ],
    },
    "of-blessing-comum-i": {
        "id": "of-blessing-comum-i",
        "label": {"pt-BR": "Tempo Comum, I", "en-US": "Ordinary Time, I"},
        "sections": [
            {"type": "prayer", "speaker": "priest", "inline": {"pt-BR": "Deus vos abençoe e vos guarde."}},
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {"type": "prayer", "speaker": "priest", "inline": {"pt-BR": "Ele vos mostre a sua face e se compadeça de vós."}},
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {"type": "prayer", "speaker": "priest", "inline": {"pt-BR": "Volva para vós o seu olhar e vos dê a sua paz."}},
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "E a bênção de Deus todo-poderoso, Pai e Filho ✠ e Espírito Santo, desça sobre vós e permaneça para sempre."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
        ],
    },
    "of-blessing-virgem": {
        "id": "of-blessing-virgem",
        "label": {
            "pt-BR": "Bem-aventurada Virgem Maria",
            "en-US": "Blessed Virgin Mary",
        },
        "sections": [
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "O Deus de bondade que, pelo Filho da Virgem Maria, quis salvar o gênero humano vos enriqueça com sua bênção."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "Seja-vos dado sentir sempre e por toda parte a proteção da Virgem, por quem recebestes o autor da vida."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "E vós, reunidos hoje para celebrar com fervor sua solenidade, possais colher a alegria espiritual e o prêmio eterno."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
            {
                "type": "prayer",
                "speaker": "priest",
                "inline": {
                    "pt-BR": "E a bênção de Deus todo-poderoso, Pai e Filho ✠ e Espírito Santo, desça sobre vós e permaneça para sempre."
                },
            },
            {"type": "prayer", "speaker": "people", "inline": {"pt-BR": "℟. Amém."}},
        ],
    },
}


SIMPLE_BLESSING = {
    "id": "of-blessing-simple",
    "label": {"pt-BR": "Bênção simples", "en-US": "Simple Blessing"},
    "sections": [
        {
            "type": "prayer",
            "speaker": "priest",
            "inline": {
                "en-US": "May almighty God bless you, the Father, and the Son, ✠ and the Holy Spirit.",
                "la": "Benedícat vos omnípotens Deus, Pater, et Fílius, ✠ et Spíritus Sanctus.",
                "pt-BR": "Abençoe-vos Deus todo-poderoso, Pai e Filho ✠ e Espírito Santo.",
            },
        },
        {
            "type": "prayer",
            "speaker": "people",
            "inline": {
                "en-US": "Amen.",
                "la": "Amen.",
                "pt-BR": "Amém.",
            },
        },
    ],
}

# Season -> ordered list of blessing-option ids that apply.
# Bênção simples is always first (default).
SEASON_BLESSINGS: dict[str, list[str]] = {
    "advent": ["of-blessing-simple", "of-blessing-advento", "of-popl-1"],
    "christmas": [
        "of-blessing-simple",
        "of-blessing-natal",
        "of-blessing-epifania",
        "of-blessing-virgem",
        "of-popl-1",
    ],
    "lent": [
        "of-blessing-simple",
        "of-blessing-paixao",
        "of-popl-quaresma",
        "of-popl-1",
    ],
    "easter": [
        "of-blessing-simple",
        "of-blessing-tempo-pascal",
        "of-blessing-ascensao",
        "of-blessing-pentecostes",
        "of-blessing-virgem",
        "of-popl-1",
    ],
    "ordinary-time": [
        "of-blessing-simple",
        "of-blessing-comum-i",
        "of-blessing-virgem",
        "of-popl-1",
    ],
}

SEASON_LABELS = {
    "advent": {"pt-BR": "Advento", "en-US": "Advent"},
    "christmas": {"pt-BR": "Natal", "en-US": "Christmas"},
    "lent": {"pt-BR": "Quaresma", "en-US": "Lent"},
    "easter": {"pt-BR": "Tempo Pascal", "en-US": "Easter Time"},
    "ordinary-time": {"pt-BR": "Tempo Comum", "en-US": "Ordinary Time"},
}


def main() -> int:
    flow = json.loads(FLOW.read_text())
    extracted = json.loads(EXTRACTED.read_text())

    # Build a lookup of all available blessing options.
    by_id: dict[str, dict] = {SIMPLE_BLESSING["id"]: SIMPLE_BLESSING}
    by_id.update(MANUAL_BLESSINGS)
    for b in extracted["solemn_blessings"]:
        by_id[b["id"]] = b
    for p in extracted["prayer_over_people"]:
        by_id[p["id"]] = p

    # For each season, build an `options` widget restricted to that season.
    season_cases: list[dict] = []
    for season, ids in SEASON_BLESSINGS.items():
        widget = {
            "type": "options",
            "label": {"pt-BR": "Bênção Final", "en-US": "Final Blessing"},
            "options": [by_id[oid] for oid in ids if oid in by_id],
        }
        season_cases.append(
            {
                "id": season,
                "label": SEASON_LABELS[season],
                "sections": [widget],
            }
        )

    # Fallback (sanctoral celebrations without `season` etc.) — show the full
    # list with all options.
    full_options = [SIMPLE_BLESSING]
    for season_ids in SEASON_BLESSINGS.values():
        for oid in season_ids:
            if oid != "of-blessing-simple" and oid in by_id:
                if not any(o["id"] == oid for o in full_options):
                    full_options.append(by_id[oid])
    season_cases.append(
        {
            "id": "default",
            "label": {"pt-BR": "Geral", "en-US": "General"},
            "sections": [
                {
                    "type": "options",
                    "label": {"pt-BR": "Bênção Final", "en-US": "Final Blessing"},
                    "options": full_options,
                }
            ],
        }
    )

    blessing_dispatch = {
        "type": "select",
        "on": "celebration.primary.season",
        "default": "default",
        "options": season_cases,
    }

    # Walk the flow and find the EITHER:
    #  (a) the static priest blessing block ("Abençoe-vos Deus todo-poderoso..."
    #      followed by "Amém") — first run, before splicing
    #  (b) the previously-spliced `options` block with label "Bênção Final"
    #      — re-run, replace it
    spliced = False

    def find_legacy_pair(node, i):
        return (
            i + 1 < len(node)
            and isinstance(node[i], dict)
            and node[i].get("type") == "prayer"
            and node[i].get("speaker") == "priest"
            and isinstance(node[i].get("inline"), dict)
            and node[i]["inline"].get("pt-BR")
            == "Abençoe-vos Deus todo-poderoso, Pai e Filho ✠ e Espírito Santo."
            and isinstance(node[i + 1], dict)
            and node[i + 1].get("type") == "prayer"
            and node[i + 1].get("speaker") == "people"
        )

    def find_existing_widget(node, i):
        n = node[i]
        return (
            isinstance(n, dict)
            and (
                (
                    n.get("type") == "options"
                    and isinstance(n.get("label"), dict)
                    and n["label"].get("pt-BR") == "Bênção Final"
                )
                or (
                    n.get("type") == "select"
                    and n.get("on") == "celebration.primary.season"
                )
            )
        )

    def walk(node):
        nonlocal spliced
        if isinstance(node, list):
            i = 0
            while i < len(node):
                if find_legacy_pair(node, i):
                    node[i : i + 2] = [blessing_dispatch]
                    spliced = True
                    return
                if find_existing_widget(node, i):
                    node[i : i + 1] = [blessing_dispatch]
                    spliced = True
                    return
                walk(node[i])
                i += 1
        elif isinstance(node, dict):
            for v in node.values():
                walk(v)

    walk(flow)
    if not spliced:
        print("ERROR: could not locate blessing block to replace", file=sys.stderr)
        return 1

    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print(
        f"spliced season-aware blessing dispatch ({len(season_cases)} season cases) into {FLOW}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
