"""Parse augustinus.it Latin pages (mirrored by research/sourcing/augustine-latin/crawl.py).

Text paragraphs are <P> elements that open with <A NAME=...>; NBA's editorial
headings are <P>/<H*> elements without an anchor and are dropped.
"""
import html, os, re

RAW = os.path.join(os.path.dirname(__file__), "..", "augustine-latin", "raw")


def pages(work):
    d = os.path.join(RAW, work)
    names = [n for n in os.listdir(d) if re.search(r"_(libro|testo)\.htm$", n)]
    return sorted(names)


def clean_inline(s):
    s = re.sub(r'(?is)<A HREF="[^"]*_note[^"]*">.*?</A>', "", s)
    s = re.sub(r"(?is)<A HREF=[^>]*>(.*?)</A>", r"\1", s)
    s = re.sub(r"(?i)<BR\s*/?>", "\n", s)
    s = re.sub(r"(?is)<I>(.*?)</I>", lambda m: "\x01" + m.group(1) + "\x02", s)
    s = re.sub(r"(?is)<(B|STRONG)>(.*?)</\1>", r"\2", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("\xa0", " ")
    s = re.sub(r"[ \t\r\f]+", " ", s)
    s = re.sub(r" *\n *", "\n", s)
    # italic markers: move whitespace outside
    s = re.sub("\x01(\\s*)", lambda m: m.group(1) + "\x01", s)
    s = re.sub("(\\s*)\x02", lambda m: "\x02" + m.group(1), s)
    s = s.replace("\x01\x02", "")
    s = s.replace("\x01", "*").replace("\x02", "*")
    s = re.sub(r"\*([^*\n]*)\*", lambda m: "*" + m.group(1).strip() + "*" if m.group(1).strip() else "", s)
    s = re.sub(r"\*([.,;:?!]+)\*", r"\1", s)
    s = re.sub(r"(?<=\S) +([,.;:?!)])", r"\1", s)
    s = re.sub(r"\( +", "(", s)
    return s.strip()


def paras(path):
    t = open(path, "rb").read().decode("windows-1252", errors="replace")
    t = t.split("<BODY", 1)[-1] if "<BODY" in t else t
    out = []
    for m in re.finditer(r"(?is)<(P|H\d)\b[^>]*>(.*?)(?=<P\b|<H\d|</BODY|</P>|</H\d>|$)", t):
        kind, body = m.group(1).upper(), m.group(2)
        am = re.match(r'\s*(?:<[^A>][^>]*>)*\s*<A NAME="([^"]*)"[^>]*>(?:</A>)?', body, re.I)
        anchor = am.group(1) if am else None
        if anchor is None and re.search(r'<A NAME="', body, re.I):
            anchor = re.search(r'<A NAME="([^"]*)"', body, re.I).group(1)
        out.append({"kind": kind, "anchor": anchor, "text": clean_inline(re.sub(r'(?i)<A NAME="[^"]*"[^>]*>', "", body))})
    return [p for p in out if p["text"]]
