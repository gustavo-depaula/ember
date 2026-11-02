"""Small helpers shared by the Alcántara and Ávila import scripts."""
import json
import re
from pathlib import Path

END = re.compile(r'[.!?:;”"’)\]»]\s*$')


def blocks_of(lines):
    """Group raw lines into blank-separated blocks, each a list of stripped lines."""
    out, cur = [], []
    for ln in lines:
        s = ln.strip()
        if s:
            cur.append(s)
        elif cur:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def join_lines(lines):
    text = ""
    for ln in lines:
        if not text:
            text = ln
        elif re.search(r"[A-Za-zÁÉÍÓÚáéíóúñü]-$", text) and re.match(r"[a-záéíóúñü]", ln):
            text = text[:-1] + ln
        else:
            text += " " + ln
    return re.sub(r"\s+", " ", text).strip()


def merge_paragraphs(paras):
    """Merge paragraphs split by a page break (previous one has no closing punctuation)."""
    out = []
    for p in paras:
        if out and not END.search(out[-1]) and not p.startswith("#") and not out[-1].startswith("#") :
            prev = out[-1]
            out[-1] = (prev[:-1] + p) if prev.endswith("-") and re.match(r"[a-z]", p) else prev + " " + p
        else:
            out.append(p)
    return out


def write_chapter(path, h1, paras):
    path.parent.mkdir(parents=True, exist_ok=True)
    body = "\n\n".join(paras)
    path.write_text(f"# {h1}\n\n{body}\n", encoding="utf-8")


def words(path):
    return len(Path(path).read_text(encoding="utf-8").split())


def write_book(dirpath, meta, toc):
    meta = dict(meta)
    meta["toc"] = toc
    d = Path(dirpath)
    d.mkdir(parents=True, exist_ok=True)
    (d / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


AVILA_AUTHOR = {"es-ES": "San Juan de Ávila", "en-US": "St. John of Ávila", "pt-BR": "São João de Ávila"}
