#!/usr/bin/env python3
"""Write content/collections/magisterium.json from the imported magisterium books.

One collection with nested sections (era → author → documents) rather than a
collection per pope: the collections screen puts every collection it has no
shelf for on its last shelf, and seventy of them would bury it.

    uv run --with beautifulsoup4 python scripts/magisterium/build_collection.py
"""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_documents import BOOKS, language_order, load_status  # noqa: E402
from names import BODIES, TYPES, author_label  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content" / "collections" / "magisterium.json"
# Full dates for ordering within an author; book.json carries only the year.
STATUS = ROOT / "research" / "magisterium" / "import-status.json"

ERAS = [
    ("ancient", (0, 1000), {"en-US": "The Ancient Church", "pt-BR": "A Igreja Antiga"}),
    ("medieval", (1000, 1500), {"en-US": "The Middle Ages", "pt-BR": "A Idade Média"}),
    ("early-modern", (1500, 1740), {"en-US": "Reformation and Baroque", "pt-BR": "Reforma e Barroco"}),
    ("revolution", (1740, 1878), {"en-US": "From Benedict XIV to Pius IX", "pt-BR": "De Bento XIV a Pio IX"}),
    ("leonine", (1878, 1959), {"en-US": "From Leo XIII to Pius XII", "pt-BR": "De Leão XIII a Pio XII"}),
    ("conciliar", (1959, 9999), {"en-US": "From John XXIII to Today", "pt-BR": "De João XXIII aos Nossos Dias"}),
]
COUNCILS_TITLE = {"en-US": "The Ecumenical Councils", "pt-BR": "Os Concílios Ecumênicos"}
CURIA_TITLE = {"en-US": "The Roman Curia", "pt-BR": "A Cúria Romana"}
TYPE_ORDER = list(TYPES)
# An author with more documents than this gets a subsection per type.
SPLIT_BY_TYPE_AT = 15
LANGS = ("en-US", "pt-BR")


def is_curia(author: str) -> bool:
    # Denzinger's curia authors ("curia-holy-office") aren't among the named bodies.
    return (author in BODIES and author != "vatican-ii") or author.startswith(("cdf", "curia", "holy-"))


def load_books() -> list[dict]:
    dates = {bid: s.get("date") for bid, s in load_status(STATUS).items()}
    books = []
    for f in sorted(BOOKS.glob("*/book.json")):
        meta = json.loads(f.read_text())
        tags = meta.get("tags", [])
        books.append({
            "id": meta["id"],
            "kind": tags[1] if len(tags) > 1 else "document",
            "author": tags[2] if len(tags) > 2 else "unknown",
            "date": dates.get(meta["id"]) or meta.get("composed") or "9999",
            "languages": meta["languages"],
        })
    return books


def item(book: dict) -> dict:
    return {"kind": "item", "ref": f"book/{book['id']}"}


def author_section(author: str, docs: list[dict]) -> dict:
    label = author_label(author)
    docs = sorted(docs, key=lambda b: (b["date"], b["id"]))
    if len(docs) <= SPLIT_BY_TYPE_AT:
        blocks = [item(b) for b in docs]
    else:
        by_kind = defaultdict(list)
        for b in docs:
            by_kind[b["kind"]].append(b)
        blocks = [
            {
                "kind": "section",
                "id": f"{author}-{kind}",
                "title": {l: TYPES[kind][i] for i, l in enumerate(LANGS)},
                "defaultCollapsed": True,
                "blocks": [item(b) for b in by_kind[kind]],
            }
            for kind in sorted(by_kind, key=lambda k: TYPE_ORDER.index(k) if k in TYPE_ORDER else 99)
        ]
    return {
        "kind": "section",
        "id": author,
        "title": {l: label[l] for l in LANGS},
        "defaultCollapsed": True,
        "blocks": blocks,
    }


def main() -> None:
    books = load_books()
    councils = [b for b in books if b["kind"] == "council" and b["author"] != "vatican-ii"]
    vatican_ii = [b for b in books if b["author"] == "vatican-ii"]
    curia = [b for b in books if is_curia(b["author"])]
    grouped = {b["id"] for b in councils + curia + vatican_ii}
    rest = [b for b in books if b["id"] not in grouped]

    by_author = defaultdict(list)
    for b in rest:
        by_author[b["author"]].append(b)
    first_year = {a: min(int(b["date"][:4]) for b in docs) for a, docs in by_author.items()}

    sections = []
    for era_id, (lo, hi), title in ERAS:
        authors = sorted((a for a in by_author if lo <= first_year[a] < hi), key=lambda a: first_year[a])
        if authors:
            sections.append({"id": era_id, "title": title,
                             "blocks": [author_section(a, by_author[a]) for a in authors]})
    if councils or vatican_ii:
        blocks = [item(b) for b in sorted(councils, key=lambda b: b["date"])]
        if vatican_ii:
            blocks.append(author_section("vatican-ii", vatican_ii))
        sections.append({"id": "councils", "title": COUNCILS_TITLE, "blocks": blocks})
    if curia:
        cur = defaultdict(list)
        for b in curia:
            cur[b["author"]].append(b)
        sections.append({"id": "curia", "title": CURIA_TITLE,
                         "blocks": [author_section(a, docs) for a, docs in sorted(cur.items(), key=lambda kv: -len(kv[1]))]})

    collection = {
        "id": "collection/magisterium",
        "version": "1.0.0",
        "cover": "slipcase",
        "name": {"en-US": "The Magisterium", "pt-BR": "O Magistério"},
        "description": {
            "en-US": f"{len(books)} documents of the popes, the ecumenical councils and the Roman Curia, "
                     "from the first centuries to today, in every language they were published in.",
            "pt-BR": f"{len(books)} documentos dos papas, dos concílios ecumênicos e da Cúria Romana, "
                     "dos primeiros séculos até hoje, em todas as línguas em que foram publicados.",
        },
        "icon": "book",
        "languages": language_order(sorted({l for b in books for l in b["languages"]})),
        "tags": ["magisterium", "papal", "encyclicals", "councils", "curia"],
        "prologue": {"body": {
            "en-US": "The teaching of the Church in her own documents: encyclicals, bulls, apostolic letters and "
                     "constitutions, the decrees of the ecumenical councils, and the instructions of the Roman "
                     "dicasteries. Each document opens in your language when it exists, and the reader's "
                     "Language menu switches to any other edition: the Latin original, and every translation "
                     "the Holy See or a faithful edition has published. Texts come from vatican.va, Documenta "
                     "Catholica Omnia, papalencyclicals.net and Veritatis Splendor.",
            "pt-BR": "O ensinamento da Igreja nos seus próprios documentos: encíclicas, bulas, cartas e "
                     "constituições apostólicas, os decretos dos concílios ecumênicos e as instruções dos "
                     "dicastérios romanos. Cada documento abre na sua língua quando ela existe, e o menu Idioma "
                     "do leitor passa a qualquer outra edição: o original latino e todas as traduções publicadas "
                     "pela Santa Sé ou por uma edição fiel. Os textos vêm de vatican.va, Documenta Catholica "
                     "Omnia, papalencyclicals.net e Veritatis Splendor.",
        }},
        "sections": sections,
    }
    OUT.write_text(json.dumps(collection, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(books)} books, {len(sections)} sections")


if __name__ == "__main__":
    main()
