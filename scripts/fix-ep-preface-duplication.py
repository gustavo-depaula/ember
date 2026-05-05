#!/usr/bin/env python3
"""Hoist Preface dialogue / preface / Sanctus into each EP card.

Before: outer flow renders dialogue → day preface → Sanctus → EP options.
        Picking EP IV (or EP V variants), which carry a fixed inline preface,
        produces two prefaces back-to-back.

After:  outer flow stops at "Pray, brethren" + a single rubric.
        Each EP card renders dialogue → its own preface → Sanctus → its body.
        EP I/II/III pull the day's preface picker; EP IV and EP V variants
        keep their inline fixed preface.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

DIALOGUE_FRAGMENT_ID = "of-preface-dialogue"
SANCTUS_FRAGMENT_ID = "of-sanctus"
DAY_PREFACE_FRAGMENT_ID = "of-day-preface"
DAY_PREFACE_HEAD_FRAGMENT_ID = "of-ep-day-preface-head"

DIALOGUE_FRAGMENT = [
    {"type": "subheading", "text": {"en-US": "Preface Dialogue", "pt-BR": "Diálogo do Prefácio"}},
    {"type": "call", "ref": "of-lord-be-with-you"},
    {
        "type": "prayer",
        "speaker": "priest",
        "inline": {
            "en-US": "Lift up your hearts.",
            "la": "Sursum corda.",
            "pt-BR": "Corações ao alto.",
        },
    },
    {
        "type": "prayer",
        "speaker": "people",
        "inline": {
            "en-US": "We lift them up to the Lord.",
            "la": "Habémus ad Dóminum.",
            "pt-BR": "O nosso coração está em Deus.",
        },
    },
    {
        "type": "prayer",
        "speaker": "priest",
        "inline": {
            "en-US": "Let us give thanks to the Lord our God.",
            "la": "Grátias agámus Dómino Deo nostro.",
            "pt-BR": "Demos graças ao Senhor, nosso Deus.",
        },
    },
    {
        "type": "prayer",
        "speaker": "people",
        "inline": {
            "en-US": "It is right and just.",
            "la": "Dignum et justum est.",
            "pt-BR": "É nosso dever e nossa salvação.",
        },
    },
]

SANCTUS_FRAGMENT = [
    {
        "type": "prayer",
        "speaker": "all",
        "inline": {
            "en-US": "Holy, Holy, Holy Lord God of hosts.\nHeaven and earth are full of your glory.\nHosanna in the highest.\nBlessed is he who comes in the name of the Lord.\nHosanna in the highest.",
            "la": "Sanctus, Sanctus, Sanctus Dóminus Deus Sábaoth.\nPleni sunt cæli et terra glória tua.\nHosánna in excélsis.\nBenedíctus qui venit in nómine Dómini.\nHosánna in excélsis.",
            "pt-BR": "Santo, Santo, Santo, Senhor, Deus do universo!\nO céu e a terra proclamam a vossa glória.\nHosana nas alturas!\nBendito o que vem em nome do Senhor!\nHosana nas alturas!",
        },
    }
]

DAY_PREFACE_FRAGMENT = [
    {
        "type": "choice-rich-text",
        "label": {"en-US": "Preface of the day", "pt-BR": "Prefácio do dia"},
        "slot": "preface",
        "pickerStyle": "cards",
    }
]

DAY_PREFACE_HEAD_FRAGMENT = [
    {"type": "call", "ref": DIALOGUE_FRAGMENT_ID},
    {"type": "call", "ref": DAY_PREFACE_FRAGMENT_ID},
    {"type": "call", "ref": SANCTUS_FRAGMENT_ID},
]


def is_subheading_preface_dialogue(node):
    if not isinstance(node, dict) or node.get("type") != "subheading":
        return False
    text = node.get("text", {})
    return text.get("en-US") == "Preface Dialogue" or text.get("pt-BR") == "Diálogo do Prefácio"


def is_sanctus_prayer(node):
    if not isinstance(node, dict) or node.get("type") != "prayer":
        return False
    inline = node.get("inline", {})
    en = inline.get("en-US", "")
    pt = inline.get("pt-BR", "")
    return "Holy, Holy, Holy Lord God of hosts" in en or "Santo, Santo, Santo, Senhor, Deus do universo" in pt


def is_holy_holy_reference_rubric(node):
    if not isinstance(node, dict) or node.get("type") != "rubric":
        return False
    text = node.get("text", {})
    en = text.get("en-US", "")
    pt = text.get("pt-BR", "")
    return "Holy, Holy, Holy (as above)" in en or "Santo, Santo, Santo (como acima)" in pt


def is_day_preface_picker(node):
    return (
        isinstance(node, dict)
        and node.get("type") == "choice-rich-text"
        and node.get("slot") == "preface"
    )


def is_preface_intro_rubric(node):
    if not isinstance(node, dict) or node.get("type") != "rubric":
        return False
    text = node.get("text", {})
    en = text.get("en-US", "")
    pt = text.get("pt-BR", "")
    return "begins the Preface dialogue" in en or "começa o diálogo do Prefácio" in pt


def collapse_outer_preface_block(sections):
    """Find [Preface intro rubric? + Preface Dialogue subheading … Sanctus … (divider)] and replace with one rubric pointing to the EP picker below."""
    out = []
    i = 0
    collapsed = False
    while i < len(sections):
        node = sections[i]
        if is_subheading_preface_dialogue(node) and not collapsed:
            if out and is_preface_intro_rubric(out[-1]):
                out.pop()
            j = i
            while j < len(sections) and not is_sanctus_prayer(sections[j]):
                j += 1
            if j == len(sections):
                out.append(node)
                i += 1
                continue
            j += 1
            if j < len(sections) and isinstance(sections[j], dict) and sections[j].get("type") == "divider":
                j += 1
            out.append(
                {
                    "type": "rubric",
                    "text": {
                        "en-US": "All stand. The Priest begins the Preface dialogue, which belongs to the Eucharistic Prayer chosen below.",
                        "pt-BR": "Todos de pé. O sacerdote começa o diálogo do Prefácio, que pertence à Oração Eucarística escolhida abaixo.",
                    },
                }
            )
            i = j
            collapsed = True
            continue
        out.append(node)
        i += 1
    return out, collapsed


DAY_PREFACE_EP_IDS = {"of-ep1", "of-ep2", "of-ep3"}


def transform_ep_card(card):
    """Prepend dialogue head + (day-preface for I/II/III) and convert in-body Sanctus reference for IV."""
    cid = card.get("id")
    sections = card.get("sections", [])
    if not isinstance(sections, list):
        return

    has_dialogue = any(
        isinstance(s, dict)
        and s.get("type") == "call"
        and s.get("ref") in {DIALOGUE_FRAGMENT_ID, DAY_PREFACE_HEAD_FRAGMENT_ID}
        for s in sections
    )
    if has_dialogue:
        return  # idempotent

    filtered = [s for s in sections if not is_holy_holy_reference_rubric(s)]

    rebuilt = []
    inserted_sanctus = False
    for s in filtered:
        if (
            cid == "of-ep4"
            and not inserted_sanctus
            and isinstance(s, dict)
            and s.get("type") == "prayer"
            and s.get("speaker") == "priest"
            and "We give you praise, Father most holy" in s.get("inline", {}).get("en-US", "")
        ):
            rebuilt.append({"type": "call", "ref": SANCTUS_FRAGMENT_ID})
            inserted_sanctus = True
        rebuilt.append(s)

    if cid in DAY_PREFACE_EP_IDS:
        head = [{"type": "call", "ref": DAY_PREFACE_HEAD_FRAGMENT_ID}]
    else:
        head = [{"type": "call", "ref": DIALOGUE_FRAGMENT_ID}]

    card["sections"] = head + rebuilt


def transform_ep5_variant(variant):
    """EP V variants: replace the 'Santo, Santo, Santo (como acima)' rubric with a real Sanctus call."""
    sections = variant.get("sections", [])
    if not isinstance(sections, list):
        return
    new_sections = []
    replaced = False
    for s in sections:
        if is_holy_holy_reference_rubric(s):
            new_sections.append({"type": "call", "ref": SANCTUS_FRAGMENT_ID})
            replaced = True
            continue
        new_sections.append(s)
    if not replaced and not any(
        isinstance(s, dict) and s.get("type") == "call" and s.get("ref") == SANCTUS_FRAGMENT_ID
        for s in new_sections
    ):
        new_sections.insert(1, {"type": "call", "ref": SANCTUS_FRAGMENT_ID})
    variant["sections"] = new_sections


def transform_ep_options(options_widget):
    options = options_widget.get("options", [])
    for card in options:
        if not isinstance(card, dict):
            continue
        cid = card.get("id")
        if cid == "of-ep5":
            transform_ep_card(card)
            inner = next(
                (
                    s
                    for s in card.get("sections", [])
                    if isinstance(s, dict) and s.get("type") == "options"
                ),
                None,
            )
            if inner:
                for variant in inner.get("options", []):
                    if isinstance(variant, dict):
                        transform_ep5_variant(variant)
        else:
            transform_ep_card(card)


def is_ep_options_widget(node):
    if not isinstance(node, dict) or node.get("type") != "options":
        return False
    label = node.get("label", {})
    if not isinstance(label, dict):
        return False
    return label.get("en-US") == "Eucharistic Prayer" or label.get("pt-BR") == "Oração Eucarística"


def walk_and_transform(node):
    if isinstance(node, dict):
        if is_ep_options_widget(node):
            transform_ep_options(node)
        for v in node.values():
            walk_and_transform(v)
    elif isinstance(node, list):
        for item in node:
            walk_and_transform(item)


def main() -> int:
    flow = json.loads(FLOW.read_text())

    fragments = flow.setdefault("fragments", {})
    fragments[DIALOGUE_FRAGMENT_ID] = DIALOGUE_FRAGMENT
    fragments[SANCTUS_FRAGMENT_ID] = SANCTUS_FRAGMENT
    fragments[DAY_PREFACE_FRAGMENT_ID] = DAY_PREFACE_FRAGMENT
    fragments[DAY_PREFACE_HEAD_FRAGMENT_ID] = DAY_PREFACE_HEAD_FRAGMENT

    sections_root = flow.get("sections")
    if not isinstance(sections_root, list):
        print("ERROR: flow.sections not a list", file=sys.stderr)
        return 1

    def collapse_recurse(node):
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if k == "sections" and isinstance(v, list):
                    collapsed, _ = collapse_outer_preface_block(v)
                    node[k] = collapsed
                    for item in collapsed:
                        collapse_recurse(item)
                else:
                    collapse_recurse(v)
        elif isinstance(node, list):
            for item in node:
                collapse_recurse(item)

    collapse_recurse(flow)

    walk_and_transform(flow)

    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print("EP preface duplication: hoisted dialogue/preface/Sanctus into EP cards", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
