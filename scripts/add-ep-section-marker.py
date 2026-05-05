#!/usr/bin/env python3
"""Insert a section-marker at the start of each Eucharistic Prayer body.

After the dialogue/preface/Sanctus head plays out, the priest begins the
proper EP anaphora. The user, who's been reading along, has now scrolled
past the EP picker chips at the top and can lose track of *which* EP
they're praying. A section-marker right where the body kicks in makes
that always visible.

Insertion point: after the of-preface-dialogue / of-ep-day-preface-head
call (and after EP IV / V's inline preface + Sanctus), right before the
existing rubric or first body prayer.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

EP_TITLES = {
    "of-ep1": {"pt-BR": "Oração Eucarística I (Cânon Romano)", "en-US": "Eucharistic Prayer I (Roman Canon)"},
    "of-ep2": {"pt-BR": "Oração Eucarística II", "en-US": "Eucharistic Prayer II"},
    "of-ep3": {"pt-BR": "Oração Eucarística III", "en-US": "Eucharistic Prayer III"},
    "of-ep4": {"pt-BR": "Oração Eucarística IV", "en-US": "Eucharistic Prayer IV"},
    "of-ep5": {"pt-BR": "Oração Eucarística V", "en-US": "Eucharistic Prayer V"},
}


def make_marker(ep_id: str):
    return {
        "type": "section-marker",
        "title": EP_TITLES[ep_id],
        "colorFrom": "celebration.primary.liturgicalColor",
    }


def is_ep_options_widget(node):
    if not isinstance(node, dict) or node.get("type") != "options":
        return False
    label = node.get("label", {})
    return label.get("en-US") == "Eucharistic Prayer"


def find_body_start_index(sections, ep_id):
    """Find index just after the dialogue/preface/Sanctus head, where the EP body proper begins.

    For EP I/II/III: that's after the `call: of-ep-day-preface-head` (index 1).
    For EP IV: after `call: of-preface-dialogue`, the inline preface text, and the `call: of-sanctus`.
    For EP V: after `call: of-preface-dialogue` and the rubric — the variant picker comes next, so we
        actually want the marker BEFORE the variant picker. The variant picker itself is the body.
    """
    if ep_id in ("of-ep1", "of-ep2", "of-ep3"):
        for i, s in enumerate(sections):
            if isinstance(s, dict) and s.get("type") == "call" and s.get("ref") == "of-ep-day-preface-head":
                return i + 1
        return 0
    if ep_id == "of-ep4":
        sanctus_idx = next(
            (
                i
                for i, s in enumerate(sections)
                if isinstance(s, dict) and s.get("type") == "call" and s.get("ref") == "of-sanctus"
            ),
            None,
        )
        return sanctus_idx + 1 if sanctus_idx is not None else 0
    if ep_id == "of-ep5":
        for i, s in enumerate(sections):
            if isinstance(s, dict) and s.get("type") == "options":
                return i
        return 0
    return 0


def is_already_marked(sections, ep_id):
    title = EP_TITLES.get(ep_id, {})
    needle = title.get("pt-BR", "")
    for s in sections:
        if (
            isinstance(s, dict)
            and s.get("type") == "section-marker"
            and s.get("title", {}).get("pt-BR") == needle
        ):
            return True
    return False


def transform_widget(widget):
    inserted = 0
    for opt in widget.get("options", []):
        if not isinstance(opt, dict):
            continue
        ep_id = opt.get("id")
        if ep_id not in EP_TITLES:
            continue
        sections = opt.get("sections", [])
        if not isinstance(sections, list):
            continue
        if is_already_marked(sections, ep_id):
            continue
        idx = find_body_start_index(sections, ep_id)
        sections.insert(idx, make_marker(ep_id))
        inserted += 1
    return inserted


def walk(node, counter):
    if isinstance(node, dict):
        if is_ep_options_widget(node):
            counter[0] += transform_widget(node)
        for v in node.values():
            walk(v, counter)
    elif isinstance(node, list):
        for item in node:
            walk(item, counter)


def main() -> int:
    flow = json.loads(FLOW.read_text())
    counter = [0]
    walk(flow, counter)
    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print(f"inserted {counter[0]} EP section-marker(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
