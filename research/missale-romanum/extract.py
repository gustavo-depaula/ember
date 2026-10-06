#!/usr/bin/env python3
"""Turn the upstream Missale Romanum app's HTML into neutral JSON.

Upstream keeps one language-neutral skeleton per file (`m_estructura/...`)
whose `padre_N` slots are filled at runtime from the same-named file of each
language (`hijo_N`). This script performs that join once, for every language,
and writes one JSON file per upstream file plus a report of everything that
did not line up. Nothing is interpreted here: classes and anchors are carried
through as-is so a later pass can map them onto Ember's schema.

    python3 extract.py                # consult/upstream -> consult/out
"""

import argparse
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString

here = Path(__file__).parent
pinnedCommit = "be8004c04e693b30f9fbd9bed2dbad4cc64a7cef"
langs = ["latin", "port", "engl", "cast", "ital", "fran", "germ"]
# Files with no per-language counterpart: every language sits inline.
standalone = [
    "igmr",
    "sacerdotale",
    "m_estructura/indices",
    "devocionario.html",
    "oracoes.html",
    "ayuda.html",
]
# Presentation-only attributes; `ontouchend` is kept because navigation
# targets (the common a saint borrows from, a preface) only exist there.
droppedAttrs = {"style", "align", "color", "size", "face"}
ws = re.compile(r"\s+")


def parse(path):
    html = path.read_text(encoding="utf-8")
    # The files are fragments; lxml needs a body to hang them on.
    return BeautifulSoup(f"<html><body>{html}</body></html>", "lxml").body


def slot_of(el):
    return next(
        (c[len("padre_") :] for c in el.get("class", []) if c.startswith("padre_")),
        None,
    )


def to_node(el):
    """A text run, a comment (upstream swaps these for UI labels), or an element."""
    if isinstance(el, Comment):
        return {"comment": el.strip()}
    if isinstance(el, NavigableString):
        text = ws.sub(" ", str(el))
        return text if text.strip() else None
    node = {"tag": el.name}
    classes = [
        c for c in el.get("class", []) if c != "hijo" and not c.startswith("hijo_")
    ]
    if classes:
        node["class"] = classes
    attrs = {
        k: v for k, v in el.attrs.items() if k != "class" and k not in droppedAttrs
    }
    if attrs:
        node["attrs"] = attrs
    children = [n for n in (to_node(c) for c in el.children) if n is not None]
    if children:
        node["children"] = children
    return node


def text_len(el):
    return len(ws.sub("", el.get_text()))


def index_slots(body):
    slots = defaultdict(list)
    for el in body.find_all(class_="hijo"):
        for c in el.get("class", []):
            if c.startswith("hijo_"):
                slots[c[len("hijo_") :]].append(el)
    return slots


def join(structure, lang_bodies, stats):
    """Fill every `padre_N` in document order, as upstream's `carga_pagina` does:
    each language's matching `hijo_N` elements are moved in, so a slot number
    that appears twice in the skeleton only fills the first time."""

    index = {lang: index_slots(body) for lang, body in lang_bodies.items()}

    def walk(el):
        node = to_node_shallow(el)
        slot = slot_of(el)
        if slot is not None:
            node["slot"] = slot
            fills = {}
            for lang, body in lang_bodies.items():
                # An hijo nested in one already moved went with its parent.
                found = [
                    h.extract()
                    for h in index[lang].get(slot, [])
                    if body in h.parents
                ]
                if not found:
                    stats[lang]["emptySlots"] += 1
                    continue
                stats[lang]["filled"] += len(found)
                stats[lang]["chars"] += sum(text_len(h) for h in found)
                fills[lang] = [to_node(h) for h in found]
            if fills:
                node["fill"] = fills
        children = []
        for c in el.children:
            if isinstance(c, (NavigableString, Comment)):
                n = to_node(c)
            else:
                n = walk(c)
            if n is not None:
                children.append(n)
        if children:
            node["children"] = children
        return node

    return [
        n
        for n in (
            walk(c) if not isinstance(c, NavigableString) else to_node(c)
            for c in structure.children
        )
        if n is not None
    ]


def to_node_shallow(el):
    node = {"tag": el.name}
    classes = [
        c
        for c in el.get("class", [])
        if c != "padre" and not c.startswith("padre_")
    ]
    if classes:
        node["class"] = classes
    attrs = {
        k: v for k, v in el.attrs.items() if k != "class" and k not in droppedAttrs
    }
    if attrs:
        node["attrs"] = attrs
    return node


def extract_joined(src, out, report):
    skeleton_root = src / "m_estructura"
    for skeleton in sorted(skeleton_root.glob("*/*.html")):
        section = skeleton.parent.name
        if section == "indices":
            continue
        name = skeleton.stem.replace("m_estructura_", "")
        structure = parse(skeleton)
        lang_bodies = {}
        totals = {}
        for lang in langs:
            path = src / f"m_{lang}" / section / f"m_{lang}_{name}.html"
            if not path.exists():
                report["missingFiles"].append(str(path.relative_to(src)))
                continue
            lang_bodies[lang] = parse(path)
            totals[lang] = text_len(lang_bodies[lang])
        stats = defaultdict(Counter)
        nodes = join(structure, lang_bodies, stats)
        orphans = {}
        for lang, body in lang_bodies.items():
            left = [n for n in (to_node(c) for c in body.children) if n is not None]
            if left:
                orphans[lang] = left
            row = report["langs"][lang]
            row["filled"] += stats[lang]["filled"]
            row["emptySlots"] += stats[lang]["emptySlots"]
            row["chars"] += totals[lang]
            row["charsPlaced"] += stats[lang]["chars"]
            leftover = text_len(body)
            row["charsOrphaned"] += leftover
            if leftover:
                report["orphans"].append(
                    {"file": f"{section}/{name}", "lang": lang, "chars": leftover}
                )
            # Every character of the language file is either in a slot or
            # reported as an orphan; anything else means the join lost text.
            if stats[lang]["chars"] + leftover != totals[lang]:
                report["lost"].append(
                    {
                        "file": f"{section}/{name}",
                        "lang": lang,
                        "chars": totals[lang] - stats[lang]["chars"] - leftover,
                    }
                )
        blocks = [
            n
            for n in nodes
            if isinstance(n, dict) and "dia" in n.get("class", [])
        ]
        report["sections"][section]["files"] += 1
        report["sections"][section]["blocks"] += len(blocks)
        doc = {"source": f"{section}/{name}", "nodes": nodes}
        if orphans:
            doc["orphans"] = orphans
        write(out / section / f"{name}.json", doc)


def extract_standalone(src, out, report):
    for entry in standalone:
        path = src / entry
        files = sorted(path.glob("*.html")) if path.is_dir() else [path]
        for f in files:
            body = parse(f)
            nodes = [n for n in (to_node(c) for c in body.children) if n is not None]
            rel = f.relative_to(src).with_suffix(".json")
            write(out / "standalone" / rel, {"source": str(f.relative_to(src)), "nodes": nodes})
            report["standalone"].append(
                {"file": str(f.relative_to(src)), "chars": text_len(body)}
            )


def write(path, doc):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream", type=Path, default=here / "consult" / "upstream")
    ap.add_argument("--out", type=Path, default=here / "consult" / "out")
    args = ap.parse_args()

    head = subprocess.run(
        ["git", "-C", str(args.upstream), "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    if head != pinnedCommit:
        sys.exit(f"upstream is at {head}, expected {pinnedCommit}")

    src = args.upstream / "misal_v2"
    report = {
        "commit": head,
        "sections": defaultdict(Counter),
        "langs": defaultdict(Counter),
        "missingFiles": [],
        "orphans": [],
        "lost": [],
        "standalone": [],
    }
    extract_joined(src, args.out, report)
    extract_standalone(src, args.out, report)
    write(args.out / "report.json", report)

    for section, row in report["sections"].items():
        print(f"{section:16} {row['files']:3} files {row['blocks']:5} blocks")
    for lang in langs:
        row = report["langs"][lang]
        print(
            f"{lang:6} filled {row['filled']:6}  empty slots {row['emptySlots']:5}  "
            f"chars {row['chars']:9}  orphaned {row['charsOrphaned']:6}"
        )
    print(f"missing files: {report['missingFiles']}")
    if report["lost"]:
        sys.exit(f"text lost in the join: {report['lost'][:10]}")


if __name__ == "__main__":
    main()
