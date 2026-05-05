#!/usr/bin/env python3
"""Remove redundant `heading` sections immediately preceding a
`choice-rich-text` whose label matches. The chip header already renders
the label — the upstream heading is a leftover from the pre-choice-rich-
text era and produces visible duplication ("Antífona de Entrada\nANTÍFONA
DE ENTRADA\n[body]").

Idempotent: safe to re-run.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"


def texts_match(a: dict, b: dict) -> bool:
    """A heading.text and a choice-rich-text.label both have the
    LocalizedText shape ({en-US, pt-BR, ...}). Match if the pt-BR fields
    are equal (the primary content language)."""
    if not isinstance(a, dict) or not isinstance(b, dict):
        return False
    return a.get("pt-BR") == b.get("pt-BR") and bool(a.get("pt-BR"))


def walk(node: object, removed: list[int]) -> None:
    if isinstance(node, list):
        i = 0
        while i < len(node):
            child = node[i]
            if (
                isinstance(child, dict)
                and child.get("type") == "heading"
                and i + 1 < len(node)
                and isinstance(node[i + 1], dict)
                and node[i + 1].get("type") == "choice-rich-text"
                and texts_match(
                    child.get("text", {}),
                    node[i + 1].get("label", {}),
                )
            ):
                node.pop(i)
                removed[0] += 1
                continue
            walk(child, removed)
            i += 1
    elif isinstance(node, dict):
        for v in node.values():
            walk(v, removed)


def main() -> int:
    flow = json.loads(FLOW.read_text())
    removed = [0]
    walk(flow, removed)
    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print(f"removed {removed[0]} redundant heading(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
