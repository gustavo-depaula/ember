#!/usr/bin/env python3
"""Insert "if not sung, the antiphon is recited" rubric before each entrance + communion antiphon picker."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

ENTRANCE_RUBRIC = {
    "type": "rubric",
    "text": {
        "en-US": "If there is no Entrance Chant, the antiphon is recited by the faithful, by some of them, or by a reader; otherwise by the Priest himself after the greeting.",
        "pt-BR": "Se não se canta o canto de entrada, a antífona é recitada pelos fiéis, por alguns, ou por um leitor; ou então pelo próprio sacerdote, após a saudação.",
    },
}

COMMUNION_RUBRIC = {
    "type": "rubric",
    "text": {
        "en-US": "If there is no Communion Chant, the antiphon is recited by the faithful, by some of them, or by a reader; otherwise by the Priest himself after he has received Communion.",
        "pt-BR": "Se não se canta o canto de comunhão, a antífona é recitada pelos fiéis, por alguns, ou por um leitor; ou então pelo próprio sacerdote, depois que comungou.",
    },
}

SLOT_RUBRIC = {
    "entranceAntiphon": ENTRANCE_RUBRIC,
    "communionAntiphon": COMMUNION_RUBRIC,
}

INTRO_KEYS = (
    "If there is no Entrance Chant",
    "If there is no Communion Chant",
    "Se não se canta o canto de entrada",
    "Se não se canta o canto de comunhão",
)


def is_introductory_rubric(node):
    if not isinstance(node, dict) or node.get("type") != "rubric":
        return False
    text = node.get("text", {})
    return any(key in text.get("en-US", "") or key in text.get("pt-BR", "") for key in INTRO_KEYS)


def walk(node, counter):
    if isinstance(node, dict):
        for v in node.values():
            walk(v, counter)
    elif isinstance(node, list):
        i = 0
        while i < len(node):
            child = node[i]
            if (
                isinstance(child, dict)
                and child.get("type") == "choice-rich-text"
                and child.get("slot") in SLOT_RUBRIC
                and not (i > 0 and is_introductory_rubric(node[i - 1]))
            ):
                node.insert(i, SLOT_RUBRIC[child["slot"]])
                counter[0] += 1
                i += 2
                continue
            walk(child, counter)
            i += 1


def main() -> int:
    flow = json.loads(FLOW.read_text())
    counter = [0]
    walk(flow, counter)
    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print(f"inserted {counter[0]} antiphon rubric(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
