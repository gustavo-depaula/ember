"""Group C helpers: archive.org djvu OCR -> paragraphs with page-foot notes paired to markers.

chapter_md(lines, drops, para_start) turns one chapter's raw lines into markdown body text.
Footnote blocks (a number then text, no full stop after the number) are paired with the
digit markers in the running text of the same chapter when the counts agree; otherwise both
are dropped and the mismatch is counted in STATS.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from en_common import join_lines, inW  # noqa: E402

STATS = {}
MARK = re.compile(r"(?<=[A-Za-z,.;:?!)'’”\"”])(\d{1,2})(?=[\s.,;:?!)]|$)")
NOTE = re.compile(r"^\s*(\d{1,2}|\*)\s+(?!\.)\S")
NUMPARA = re.compile(r"^\s*\d{1,2}\s?\.\s")


def blocks_of(lines, drops, pagemode=False):
    """pagemode: running heads delimit pages; the first block of a page is body, later blocks are notes."""
    out, cur = [], []
    for ln in lines:
        ln = ln.replace("\x0c", "")
        if any(d.search(ln.strip()) for d in drops):
            if cur:
                out.append(cur)
                cur = []
            if pagemode:
                out.append(None)
            continue
        if ln.strip():
            cur.append(ln)
        elif cur:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def chapter_md(lines, drops=(), para_start=None, strip_num=True, keep_notes=True, key="?", pagemode=False, note_start=None):
    drops = [re.compile(d) if isinstance(d, str) else d for d in drops]
    paras, notes = [], []
    seen_body = False
    for b in blocks_of(lines, drops, pagemode):
        if b is None:
            seen_body = False
            continue
        t0 = b[0].strip()
        if pagemode:
            if seen_body or (NOTE.match(b[0]) and not NUMPARA.match(b[0]) and len(b) < 9):
                txt = join_lines(b)
                if NOTE.match(b[0]) or not notes:
                    notes.append(txt)
                else:
                    notes[-1] = join_lines([notes[-1], txt])
                continue
            seen_body = True
        if re.fullmatch(r"[\dIl|]{1,4}", t0) and len(b) == 1:
            continue
        if (NOTE.match(b[0]) and not NUMPARA.match(b[0]) and len(" ".join(b)) < 1500) or (note_start and note_start.match(b[0]) and len(b) < 14):
            notes.append(join_lines(b))
            continue
        if para_start:
            seg = []
            for ln in b:
                if para_start.match(ln) and seg:
                    paras.append(join_lines(seg))
                    seg = []
                seg.append(ln)
            paras.append(join_lines(seg))
        else:
            paras.append(join_lines(b))
    # merge paragraphs broken at page boundary
    res = []
    for p in paras:
        if res and not re.search(r"[.!?:;\"”’)\]*]\s*$", res[-1]) and p[:1].islower():
            res[-1] = join_lines([res[-1], p])
        else:
            res.append(p)
    if strip_num:
        res = [re.sub(r"^[\dilI]{1,3}\s?\.\s+", "", p) for p in res]
    nmark = sum(len(MARK.findall(p)) for p in res)
    out_notes = []
    if keep_notes and notes and nmark == len(notes):
        n = [0]

        def rep(m):
            n[0] += 1
            return f"[^{n[0]}]"

        res = [MARK.sub(rep, p) for p in res]
        out_notes = [re.sub(r"^\s*(\d{1,2}|\*)\s+", "", t) for t in notes]
        STATS[key] = "ok"
    else:
        res = [MARK.sub("", p) for p in res]
        STATS[key] = f"drop markers={nmark} notes={len(notes)}" if (nmark or notes) else "none"
    body = "\n\n".join(unsplit(p) if not p.startswith("#") else p for p in res)
    if out_notes:
        body += "\n\n" + "\n\n".join(f"[^{i + 1}]: {t}" for i, t in enumerate(out_notes))
    return body


def write_ch(root, lang, cid, title, body):
    d = os.path.join(root, lang)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, cid + ".md"), "w") as f:
        f.write(f"# {title}\n\n{body}\n")


def words(root, lang):
    d = os.path.join(root, lang)
    return sum(len(open(os.path.join(d, f)).read().split()) for f in os.listdir(d) if f.endswith(".md"))


def load_json(p):
    return json.load(open(p))


def dump_json(p, d):
    with open(p, "w") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")


def add_en_to_book(root, titles, edition, source, parents=None, desc_suffix=None):
    """Add en-US to an existing Latin book.json: language, edition, source, toc titles."""
    p = os.path.join(root, "book.json")
    b = load_json(p)
    if "en-US" not in b["languages"]:
        b["languages"].append("en-US")
    b.setdefault("editions", {})["en-US"] = edition
    b["sources"].append(source)

    def walk(items):
        for t in items:
            if "children" in t:
                if parents and t["id"] in parents:
                    t["title"]["en-US"] = parents[t["id"]]
                walk(t["children"])
            elif t["id"] in titles:
                t["title"]["en-US"] = titles[t["id"]]

    walk(b["toc"])
    if desc_suffix:
        b["description"]["en-US"] = b["description"]["en-US"].rstrip() + " " + desc_suffix
    dump_json(p, b)


PRE = {"dis", "de", "sur", "sub", "mis", "pre", "con", "com", "ex", "un", "im", "en", "em", "be", "pro", "per"}


def unsplit(text):
    """Rejoin words split across a line whose hyphen the OCR lost ("de livered", "dis tresses")."""

    def rep(m):
        a, b = m.group(1), m.group(2)
        if len(b) >= 3 and inW(a + b) and (not inW(a) or not inW(b) or a.lower() in PRE):
            return a + b
        return m.group(0)

    return re.sub(r"\b([A-Za-z]{2,}) ([a-z]{3,})\b", rep, text)
