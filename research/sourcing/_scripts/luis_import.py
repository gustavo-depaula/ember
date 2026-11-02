"""Shared helpers for the Fray Luis de Leon imports."""
import json, re
from pathlib import Path
ROOT = Path("/Users/gustavo/Documents/prayer")
BASE = ROOT / "content/books/luis-de-leon-opera-omnia"
RAW = ROOT / "research/sourcing/luis-de-leon/raw"
AUTHOR = {"es-ES": "Fray Luis de León", "en-US": "Fray Luis de León", "pt-BR": "Frei Luís de León"}
WS = "https://es.wikisource.org/wiki/"

def write_md(book, lang, cid, h1, body):
    p = BASE / book / lang / f"{cid}.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    body = re.sub(r"^# .*\n+", "", body) if body.startswith("# ") else body
    p.write_text(f"# {h1}\n\n{body.strip()}\n", encoding="utf-8")
    return len(body.split()) + len(h1.split())

def finish(book, meta, toc, raw_name, raw_text, lang="es-ES", rawdir="spanish-originals"):
    meta = {**meta, "author": AUTHOR, "toc": toc}
    d = BASE / book
    (d / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sd = d / "sources" / rawdir
    sd.mkdir(parents=True, exist_ok=True)
    (sd / raw_name).write_text(raw_text, encoding="utf-8")
