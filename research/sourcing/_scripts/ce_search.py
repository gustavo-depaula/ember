#!/usr/bin/env python3
"""Find Catholic Encyclopedia articles for holy cards.

    python3 research/sourcing/_scripts/ce_search.py cards            # the cards that aren't saints
    python3 research/sourcing/_scripts/ce_search.py find <words...>  # articles whose title has every word
    python3 research/sourcing/_scripts/ce_search.py show <id>        # an article's title, size, opening

An article id is a chapter id of content/books/catholic-encyclopedia, the
value a card's `encyclopedia` field takes.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CE = ROOT / "content" / "books" / "catholic-encyclopedia"
CARDS = ROOT / "content" / "practices" / "saint-of-the-day" / "data" / "holy-cards"


def articles():
    def walk(nodes):
        for n in nodes:
            if n.get("children"):
                yield from walk(n["children"])
            else:
                yield n["id"], n["title"]["en-US"]

    return walk(json.loads((CE / "book.json").read_text(encoding="utf-8"))["toc"])


def opening(aid: str) -> tuple[int, str]:
    text = (CE / "en-US" / f"{aid}.md").read_text(encoding="utf-8")
    blocks = [b.strip() for b in text.split("\n\n") if b.strip() and not b.startswith("#")]
    body = [b for b in blocks if not (b.startswith("*") and b.endswith("*"))]
    return len(text.split()), (body[0] if body else "")[:400]


def main() -> int:
    cmd = sys.argv[1]
    if cmd == "cards":
        for f in sorted(CARDS.glob("*.json")):
            c = json.loads(f.read_text(encoding="utf-8"))
            if c.get("kind") or c.get("shelf") in ("lord", "lady", "angels", "church"):
                print(
                    f"{c['id']} | {c['name']['en-US']} | {c.get('kind') or c.get('shelf')}"
                    f" | life={c.get('lifeChapter') or '-'} | ce={c.get('encyclopedia') or '-'}"
                    f" | {(c.get('patronOf') or {}).get('en-US', '')}"
                )
    elif cmd == "find":
        words = [w.lower() for w in sys.argv[2:]]
        for aid, title in articles():
            if all(w in title.lower() for w in words):
                n, _ = opening(aid)
                print(f"{aid} | {title} | {n} words")
    elif cmd == "show":
        aid = sys.argv[2]
        title = dict(articles()).get(aid)
        n, first = opening(aid)
        print(f"{aid} | {title} | {n} words\n{first}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
