#!/usr/bin/env python3
"""An author's works, for writing their reading guide, and a check of the guide.

    python3 research/sourcing/_scripts/guide_works.py <author-id>          # list
    python3 research/sourcing/_scripts/guide_works.py <author-id> --check  # check

The list prints one line per work: the key the guide names (`work`, or the
book id for a book naming none), the book ids of its editions, languages,
dates, words, and its en-US name and description. The check fails, as the
corpus build does, when the guide leaves out a work, repeats one, names one
not by this author, or has a section without an en-US and a pt-BR title.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CONTENT = ROOT / "content"


def author_books(aid: str) -> dict[str, list[tuple[Path, dict]]]:
    spellings: dict[str, str] = {}
    for f in (CONTENT / "authors").glob("*.json"):
        for s in json.loads(f.read_text(encoding="utf-8")).get("matches") or []:
            spellings[s] = f.stem
    # Only committed books count: CI builds from git, so a guide naming a work
    # that exists only as an untracked folder here passes locally and breaks
    # every deploy.
    tracked = subprocess.run(
        ["git", "ls-files", "content/books"], cwd=ROOT, capture_output=True, text=True, check=True
    ).stdout.split("\n")
    works: dict[str, list[tuple[Path, dict]]] = {}
    for meta_path in sorted(ROOT / t for t in tracked if t.endswith("/book.json")):
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        text = meta.get("author") or {}
        key = text.get("en-US") or next(iter(text.values()), None)
        if spellings.get(key) != aid:
            continue
        bid = meta.get("id") or meta_path.parent.name
        works.setdefault(meta.get("work") or bid, []).append((meta_path.parent, meta))
    return works


def words(d: Path, lang: str) -> int:
    return sum(len(f.read_text(encoding="utf-8").split()) for f in (d / lang).glob("*.md")) if (d / lang).is_dir() else 0


def main() -> int:
    aid = sys.argv[1]
    works = author_books(aid)
    if "--check" not in sys.argv:
        for work, books in works.items():
            for d, m in books:
                langs = m.get("languages") or []
                print(
                    f"{work} | book {m.get('id') or d.name} | {','.join(langs)} | {m.get('composed', '')}"
                    f" | {words(d, langs[0]) if langs else 0} words | {(m.get('name') or {}).get('en-US', '')}"
                    f" | {((m.get('description') or {}).get('en-US') or '')[:200]}"
                )
        print(f"{len(works)} works")
        return 0
    guide = json.loads((CONTENT / "authors" / f"{aid}.json").read_text(encoding="utf-8")).get("guide")
    if guide is None:
        print("no guide")
        return 1
    listed: list[str] = []
    errors = []
    for i, section in enumerate(guide):
        title = section.get("title") or {}
        if not (title.get("en-US") and title.get("pt-BR")):
            errors.append(f"section {i + 1} needs an en-US and a pt-BR title")
        for w in section.get("works") or []:
            listed.append(w["work"])
            why = w.get("why")
            if why is not None and not (why.get("en-US") and why.get("pt-BR")):
                errors.append(f"{w['work']}: why needs en-US and pt-BR")
    twice = sorted({w for w in listed if listed.count(w) > 1})
    unknown = sorted(set(listed) - set(works))
    missing = sorted(set(works) - set(listed))
    for label, ws in (("listed twice", twice), ("not by this author", unknown), ("left out", missing)):
        if ws:
            errors.append(f"{label}: {', '.join(ws)}")
    for e in errors:
        print("ERROR:", e)
    print(f"{len(listed)} of {len(works)} works in {len(guide)} sections")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
