#!/usr/bin/env python3
"""ONE-SHOT: wrap the silent priest prayers in `Preparação das Oferendas`
inside a single `collapsible` section. The audible part (Orate fratres +
people's response) stays visible.

`walk()` mutates the flow in place AND returns a "found?" boolean to
short-circuit the recursion — fine for this single-pass migration; not
meant as a reusable helper. Idempotent on re-run via `already_wrapped`.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

PREP_TITLE_PT = "Preparação das Oferendas"
ORATE_PT = "Orai, irmãos e irmãs, para que o meu e o vosso sacrifício seja aceito por Deus Pai todo-poderoso."
COLLAPSIBLE_TITLE = {
    "pt-BR": "Orações em silêncio",
    "en-US": "Quiet prayers",
}


def is_prep_subheading(node):
    return (
        isinstance(node, dict)
        and node.get("type") == "subheading"
        and isinstance(node.get("text"), dict)
        and node["text"].get("pt-BR") == PREP_TITLE_PT
    )


def is_orate_priest_prayer(node):
    return (
        isinstance(node, dict)
        and node.get("type") == "prayer"
        and node.get("speaker") == "priest"
        and isinstance(node.get("inline"), dict)
        and node["inline"].get("pt-BR") == ORATE_PT
    )


def already_wrapped(node):
    return (
        isinstance(node, dict)
        and node.get("type") == "collapsible"
        and isinstance(node.get("title"), dict)
        and node["title"].get("pt-BR") == COLLAPSIBLE_TITLE["pt-BR"]
    )


def walk(node):
    if isinstance(node, list):
        for i, child in enumerate(node):
            if is_prep_subheading(child):
                if i + 1 < len(node) and already_wrapped(node[i + 1]):
                    return True  # idempotent
                for j in range(i + 1, len(node)):
                    if is_orate_priest_prayer(node[j]):
                        silent = node[i + 1 : j]
                        if not silent:
                            return False
                        collapsible = {
                            "type": "collapsible",
                            "title": COLLAPSIBLE_TITLE,
                            "sections": silent,
                        }
                        node[i + 1 : j] = [collapsible]
                        return True
                return False
            if walk(child):
                return True
        return False
    if isinstance(node, dict):
        for v in node.values():
            if walk(v):
                return True
    return False


def main() -> int:
    flow = json.loads(FLOW.read_text())
    spliced = walk(flow)
    if not spliced:
        print("ERROR: could not locate Preparação das Oferendas to wrap", file=sys.stderr)
        return 1
    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print("wrapped silent offertory prayers in collapsible", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
