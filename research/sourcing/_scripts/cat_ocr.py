"""Shared helpers for the catechism imports: clean archive.org OCR into paragraphs, render Q&A markdown."""
import re

_WORDS = None
def _words():
    global _WORDS
    if _WORDS is None:
        _WORDS = {w.strip().lower() for w in open("/usr/share/dict/words", encoding="utf-8", errors="ignore")}
    return _WORDS

def _glue(t, l):
    """OCR that lost the hyphen at a line end: join 'persever' + 'ance' when neither piece is a word but the whole is."""
    a = re.search(r"([A-Za-z]+)$", t); b = re.match(r"([A-Za-z]+)", l)
    if not (a and b): return False
    w = _words()
    x, y = a.group(1).lower(), b.group(1).lower()
    def known(z):
        return z in w or any(z.endswith(e) and (z[:-len(e)] in w or z[:-len(e)] + "e" in w) for e in ("s", "es", "ed", "d", "ing", "ly", "ness", "ment", "ments", "ers", "er"))
    stop = {"a", "an", "as", "at", "he", "if", "in", "is", "it", "no", "of", "on", "or", "so", "to", "up", "us", "we", "the", "and", "for", "not", "but", "all", "any", "one", "who", "his", "her", "our", "you", "are", "was", "had", "has"}
    if not known(x + y): return False
    if not known(x) or not known(y): return True
    return len(x + y) >= 6 and len(x) <= 4 and x not in stop and len(y) >= 3

def paragraphs(text, drop=None, start=0, end=None, glue=False):
    """Blank-line separated blocks -> single-spaced paragraphs; hyphen-broken words joined; page numbers and
    running heads (regex `drop`, matched on the whole paragraph) removed. Returns [(first_line_no, text)]."""
    lines = text.split("\n")[start:end]
    out, cur, n0 = [], [], 0
    def flush():
        nonlocal cur
        if cur:
            t = ""
            for l in cur:
                l = re.sub(r"\s+", " ", l).strip()
                if t.endswith("-") and not t.endswith(" -") and re.match(r"[a-zß]", l): t = t[:-1] + l
                elif t.endswith("⸗") and l: t = t[:-1] + l
                elif glue and t and _glue(t, l): t = t + l
                else: t = (t + " " + l).strip()
            if t and not re.fullmatch(r"[\W\d_ivxlcIVXLC]{0,6}", t) and not (drop and re.fullmatch(drop, t)): out.append((n0 + start, t))
            cur = []
    for i, l in enumerate(lines):
        if l.strip() == "": flush()
        else:
            if not cur: n0 = i + 1
            cur.append(l)
    flush()
    return out

def qa_markdown(paras, qre, head=None):
    """paras: [(lineno, text)] -> markdown; question = number + text ending in '?', numbering must follow on
    (or restart at 1); the next paragraph is the answer (italic); other paragraphs stay plain.
    head(text) -> markdown heading line or None."""
    out, last, want_answer = [], 0, False
    for _, t in paras:
        h = head(t) if head else None
        if h:
            out.append(h); want_answer = False; last = 0; continue
        m = qre.match(t)
        if m and t.endswith("?") and (int(m.group(1)) == last + 1 or int(m.group(1)) == 1):
            last = int(m.group(1)); out.append(f"**{last}.** {m.group(2)}"); want_answer = True; continue
        if want_answer:
            out.append("*" + t.replace("*", "\\*") + "*"); want_answer = False; continue
        out.append(t.replace("*", "\\*"))
    return "\n\n".join(out)
