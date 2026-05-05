#!/usr/bin/env python3
"""Add a `lord-be-with-you` greeting fragment to the Mass flow and replace
all V/R "Dóminus vobíscum / Et cum spíritu tuo" pairs with a `call` to the
fragment. Demonstrates the macro pattern is in production use.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

GREETING_FRAGMENT_ID = "of-lord-be-with-you"
GREETING_FRAGMENT = [
    {
        "type": "prayer",
        "speaker": "priest",
        "inline": {
            "en-US": "The Lord be with you.",
            "la": "Dóminus vobíscum.",
            "pt-BR": "O Senhor esteja convosco.",
        },
    },
    {
        "type": "prayer",
        "speaker": "people",
        "inline": {
            "en-US": "And with your spirit.",
            "la": "Et cum spíritu tuo.",
            "pt-BR": "Ele está no meio de nós.",
        },
    },
]


def is_priest_greeting(node: object) -> bool:
    return (
        isinstance(node, dict)
        and node.get("type") == "prayer"
        and node.get("speaker") == "priest"
        and isinstance(node.get("inline"), dict)
        and node["inline"].get("la") == "Dóminus vobíscum."
    )


def is_people_response(node: object) -> bool:
    return (
        isinstance(node, dict)
        and node.get("type") == "prayer"
        and node.get("speaker") == "people"
        and isinstance(node.get("inline"), dict)
        and node["inline"].get("la") == "Et cum spíritu tuo."
    )


def main() -> int:
    flow = json.loads(FLOW.read_text())
    flow.setdefault("fragments", {})[GREETING_FRAGMENT_ID] = GREETING_FRAGMENT

    replaced = 0

    def walk(node: object) -> None:
        nonlocal replaced
        if isinstance(node, list):
            i = 0
            while i < len(node):
                child = node[i]
                # Detect a V/R pair (priest greeting + people response).
                if (
                    is_priest_greeting(child)
                    and i + 1 < len(node)
                    and is_people_response(node[i + 1])
                ):
                    node[i : i + 2] = [{"type": "call", "ref": GREETING_FRAGMENT_ID}]
                    replaced += 1
                    i += 1
                    continue
                walk(child)
                i += 1
        elif isinstance(node, dict):
            for v in node.values():
                walk(v)

    # Don't replace inside the fragment itself.
    sections = flow.get("sections")
    walk(sections)

    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print(f"replaced {replaced} V/R pair(s) with {GREETING_FRAGMENT_ID} call", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
