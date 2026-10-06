#!/usr/bin/env python3
"""Print one extracted block as indented pseudo-HTML for one language.

    python3 scripts/missal/dump.py santos/santos_dic 1203 port
"""

import json
import sys
from pathlib import Path

out = Path(__file__).parent.parent.parent / "research" / "missale-romanum" / "consult" / "out"


def show(node, lang, depth=0):
    pad = "  " * depth
    if isinstance(node, str):
        if node.strip():
            print(f"{pad}{node.strip()!r}")
        return
    if "comment" in node:
        print(f"{pad}<!--{node['comment'][:60]}-->")
        return
    head = node["tag"]
    if node.get("class"):
        head += "." + ".".join(node["class"])
    if "slot" in node:
        head += f" [slot {node['slot']}]"
    for key, value in node.get("attrs", {}).items():
        head += f" {key}={value[:90]!r}"
    print(f"{pad}<{head}>")
    for child in node.get("children", []):
        show(child, lang, depth + 1)
    for filled in node.get("fill", {}).get(lang, []):
        show(filled, lang, depth + 1)


def find(nodes, anchor):
    for node in nodes:
        if not isinstance(node, dict):
            continue
        if node.get("attrs", {}).get("id") == anchor:
            return node
        hit = find(node.get("children", []), anchor)
        if hit:
            return hit


def main():
    source, anchor, lang = sys.argv[1:4]
    doc = json.loads((out / f"{source}.json").read_text(encoding="utf-8"))
    block = find(doc["nodes"], anchor) if anchor != "-" else {"tag": "root", "children": doc["nodes"]}
    if not block:
        sys.exit(f"no #{anchor} in {source}")
    show(block, lang)


if __name__ == "__main__":
    main()
