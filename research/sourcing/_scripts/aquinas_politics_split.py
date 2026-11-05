#!/usr/bin/env python3
"""Split the Politics commentary's last chapter into its books and lectures.

    python3 research/sourcing/_scripts/aquinas_politics_split.py <book-dir>

The aquinas.cc import left Book III lecture 16 (`g5-c016`) holding the whole
rest of the commentary: Books IV-VIII, Peter of Auvergne's continuation, 50
lectures marked only by plain "Liber N" / "Lectio N" lines (pt-BR "Livro" /
"Lição", en-US "Book" / "Lecture"). This cuts them into chapters `pN-lMM`
(N the book), each opening `# Lectio M`; a book's summary paragraph, printed
before its first lecture, opens that lecture's chapter. The toc's group titles
were also one book ahead (the prologue was titled Book 1), and are corrected.
Every language must carry the same markers, or nothing is written.
"""
import json
import re
import sys
from pathlib import Path

book = Path(sys.argv[1])
LANGS = {
    "la": ("Liber", "Lectio"),
    "pt-BR": ("Livro", "Lição"),
    "en-US": ("Book", "Lecture"),
}
SRC = "g5-c016"


def split(lang):
    bk, lec = LANGS[lang]
    text = (book / lang / f"{SRC}.md").read_text(encoding="utf-8")
    marker = re.compile(rf"^(?:\*\*\*)?({bk}|{lec}) (\d+)(?:\*\*\*)? *$", re.M)
    ms = list(marker.finditer(text))
    head, chapters, intro, cur = text[: ms[0].start()].rstrip() + "\n", [], "", None
    for i, m in enumerate(ms):
        body = text[m.end() : ms[i + 1].start() if i + 1 < len(ms) else len(text)].strip()
        if m.group(1) == bk:
            n_book, intro = int(m.group(2)), body
            continue
        n_lec = int(m.group(2))
        if n_lec == 1 and not intro and lang != "en-US":
            raise SystemExit(f"{lang}: lecture 1 of book {n_book} has no book summary before it")
        paras = [p for p in ([intro] if n_lec == 1 else []) + [body] if p]
        intro = ""
        chapters.append((n_book, n_lec, f"# {lec} {n_lec}\n\n" + "\n\n".join(paras) + "\n"))
    return head, chapters


def main():
    out = {lang: split(lang) for lang in LANGS}
    keys = {lang: [(b, n) for b, n, _ in out[lang][1]] for lang in LANGS}
    if len({tuple(v) for v in keys.values()}) != 1:
        raise SystemExit(f"markers differ across languages: { {k: len(v) for k, v in keys.items()} }")
    for lang, (head, chapters) in out.items():
        (book / lang / f"{SRC}.md").write_text(head, encoding="utf-8")
        for b, n, text in chapters:
            (book / lang / f"p{b}-l{n:02d}.md").write_text(text, encoding="utf-8")

    meta_path = book / "book.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    toc = meta["toc"]
    names = {
        "g1": ("Prologue", "Prooemium", "Proêmio"),
        "g2": ("Book 1", "Liber 1", "Livro 1"),
        "g3": ("Book 2", "Liber 2", "Livro 2"),
        "g4": ("Book 3", "Liber 3", "Livro 3"),
        "g5": ("Book 3 — Continuation of Peter of Auvergne", "Liber 3", "Livro 3 — Continuação de Pedro de Alvérnia"),
    }
    for node in toc:
        if node["id"] in names:
            en, la, pt = names[node["id"]]
            node["title"] = {"en-US": en, "la": la, "pt-BR": pt}
    toc[:] = [n for n in toc if not n["id"].startswith("p")]
    groups = {}
    for b, n, _ in out["la"][1]:
        cid = f"p{b}-l{n:02d}"
        la_par = (book / "la" / f"{cid}.md").read_text(encoding="utf-8").split("\n\n")
        pt_par = (book / "pt-BR" / f"{cid}.md").read_text(encoding="utf-8").split("\n\n")
        # Lecture 1 opens with the book's summary, then the lecture's own.
        k = 2 if n == 1 else 1
        la_sum = re.sub(r"\*", "", la_par[k]).strip()
        pt_sum = re.sub(r"\*", "", pt_par[k]).strip()
        groups.setdefault(b, []).append({
            "id": cid,
            "title": {"en-US": f"Lecture {n} — {la_sum}", "la": f"Lectio {n}", "pt-BR": f"Lição {n} — {pt_sum}"},
        })
    for b, children in groups.items():
        toc.append({
            "id": f"p{b}",
            "title": {
                "en-US": f"Book {b} — Continuation of Peter of Auvergne",
                "la": f"Liber {b}",
                "pt-BR": f"Livro {b} — Continuação de Pedro de Alvérnia",
            },
            "children": children,
        })
    raw = meta_path.read_text(encoding="utf-8")
    indent = "\t" if raw.startswith("{\n\t") else 2
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8")
    print({b: len(c) for b, c in groups.items()})


if __name__ == "__main__":
    main()
