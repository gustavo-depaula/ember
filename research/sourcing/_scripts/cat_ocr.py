"""Shared helpers for the catechism imports: clean archive.org OCR into paragraphs, render Q&A markdown."""
import re

def paragraphs(text, drop=None, start=0, end=None):
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
