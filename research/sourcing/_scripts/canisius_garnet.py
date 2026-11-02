"""Garnet's A Summe of Christian Doctrine (EEBO-TCP A69066, CC0) -> chapter markdown, with the marginal references as footnotes."""
import re, json, sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = "{http://www.tei-c.org/ns/1.0}"
src = Path("research/sourcing/catechisms/A69066.xml")
out = Path("content/books/canisius-summa-garnet/en-US")
out.mkdir(parents=True, exist_ok=True)
root = ET.parse(src).getroot()
body = root.find(f"{NS}text")

STROKE = "̄"
def abbr(prefix_char, nxt):  # a macron stands for a dropped n or m
    return "m" if nxt[:1] in "mbp" else "n"

class Sec:
    def __init__(self, title): self.title, self.blocks, self.notes = title, [], []

def tx(el, sec):
    """text of an element with notes turned into footnote markers"""
    parts = []
    def walk(e, first=False):
        tag = e.tag.replace(NS, "")
        if tag == "note":
            n = clean("".join(walk_text(e)))
            if n:
                sec.notes.append(n)
                parts.append(f"[^{len(sec.notes)}]")
        elif tag == "g":
            ref = e.get("ref", "")
            if ref.endswith("cmbAbbrStroke"): parts.append(STROKE)
            # EOLhyphen: dropped
        elif tag in ("gap", "pb", "milestone"):
            pass
        else:
            if e.text: parts.append(e.text)
            for c in e:
                walk(c)
                if c.tail: parts.append(c.tail)
    def walk_text(e):
        r = []
        def w(x):
            tg = x.tag.replace(NS, "")
            if tg == "g":
                if x.get("ref", "").endswith("cmbAbbrStroke"): r.append(STROKE)
            elif tg in ("gap", "pb"): pass
            else:
                if x.text: r.append(x.text)
                for c in x:
                    w(c)
                    if c.tail: r.append(c.tail)
        w(e); return r
    walk(el)
    return clean("".join(parts))

def clean(s):
    s = s.replace("ſ", "s").replace(" ", " ")
    s = re.sub(r"(.)̄(?=([a-zA-Z]?))", lambda m: m.group(1) + ("m" if m.group(2) in ("m", "b", "p") else "n"), s)
    s = s.replace("fron ", "from ").replace("Fron ", "From ")
    s = re.sub(r"\bfron\b", "from", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace("•", "")
    return s

def render(sec, el, state):
    tag = el.tag.replace(NS, "")
    if tag == "p":
        t = tx(el, sec)
        if not t: return
        if el.get("n") and re.match(r"^\d+ ", t):
            n, q = t.split(" ", 1); state["ans"] = True
            sec.blocks.append(f"**{n}.** {q}")
        elif state["ans"]:
            sec.blocks.append("*" + t + "*")
        else:
            sec.blocks.append(t)
    elif tag == "list":
        items = [tx(i, sec) for i in el.findall(f"{NS}item")]
        sec.blocks.append("\n".join(f"- {i}" for i in items if i))
    elif tag == "q":
        t = tx(el, sec)
        if t: sec.blocks.append("> " + t)
    elif tag == "head":
        pass
    elif tag in ("closer", "label", "trailer", "argument"):
        t = tx(el, sec)
        if t: sec.blocks.append(t)
    elif tag == "div":
        walk_div(el, sec)

secs = []
def walk_div(d, cur):
    typ = d.get("type", "")
    head = d.find(f"{NS}head")
    if typ in ("title_page", "table_of_contents"): return
    if head is not None and typ != "list_of_fathers_and_councils":
        cur = Sec(None); secs.append(cur)
        cur.title = clean("".join(head.itertext()))
        cur.state = {"ans": False}
    elif head is not None or cur is None:
        cur = Sec(None); secs.append(cur)
        cur.title = clean("".join(head.itertext())) if head is not None else typ
        cur.state = {"ans": False}
    else:
        cur.state = {"ans": False}
    for c in d:
        render(cur, c, cur.state) if c.tag.replace(NS, "") != "div" else walk_div(c, cur)
    return

for part in body:
    for d in part:
        if d.tag.replace(NS, "") == "div": walk_div(d, None)

T = [  # (id, title) in document order, skipping the empty wrapper section "catechism"
 ("epigraph", "Against Those Who Are Ignorant of Things Necessary to Salvation"),
 ("preface", "The Preface to the Reader"),
 ("printer-to-the-reader", "The Printer to the Reader"),
 ("catalogue-of-fathers-and-councils", "A Catalogue of Fathers and Councils Cited in This Book"),
 None,
 ("chapter-1-faith", "Chapter 1: Of Faith, and of the Creed"),
 ("chapter-2-hope", "Chapter 2: Of Hope"),
 ("angelical-salutation", "Of the Angelical Salutation"),
 ("chapter-3-charity", "Chapter 3: Of Charity, and the Ten Commandments"),
 ("precepts-of-the-church", "Of the Precepts of the Church"),
 ("chapter-4-sacraments", "Chapter 4: Of the Sacraments"),
 ("baptism", "Of the Sacrament of Baptism"),
 ("confirmation", "Of the Sacrament of Confirmation"),
 ("eucharist", "Of the Sacrament of the Eucharist"),
 ("penance", "Of the Sacrament of Penance"),
 ("extreme-unction", "Of the Sacrament of Extreme Unction"),
 ("orders", "Of the Sacrament of Orders"),
 ("matrimony", "Of the Sacrament of Matrimony"),
 ("chapter-5-justice", "Chapter 5: Of Christian Justice"),
 ("seven-capital-sins", "Of the Seven Capital Sins"),
 ("alien-sins", "Of Alien Sins"),
 ("sins-against-the-holy-ghost", "Of Sins against the Holy Ghost"),
 ("sins-that-cry-to-heaven", "Of Sins That Cry unto Heaven"),
 ("purging-of-sins", "Of the Purging of Sins"),
 ("three-sorts-of-good-works", "Of Three Sorts of Good Works"),
 ("alms-and-works-of-mercy", "Of Alms and the Works of Mercy"),
 ("cardinal-virtues", "Of the Cardinal Virtues"),
 ("gifts-and-fruits-of-the-holy-ghost", "Of the Gifts and Fruits of the Holy Ghost"),
 ("eight-beatitudes", "Of the Eight Beatitudes"),
 ("evangelical-counsels", "Of the Evangelical Counsels"),
 ("four-last-things", "Of the Four Last Things of a Man"),
 ("appendix-fall-and-justification", "Appendix: Of the Fall of Man and Justification"),
 ("translator-to-the-reader", "The Translator to the Reader"),
 ("exposition", "An Exposition of Certain Questions Not Handled in This Book"),
 ("hallowed-creatures", "Of Hallowed and Sanctified Creatures in God's Church"),
 ("pilgrimage", "Of Pilgrimage"),
 ("indulgences", "Of Indulgences, or Pardons"),
]
assert len(T) == len(secs), (len(T), len(secs))
order = []
for t, sec in zip(T, secs):
    if t is None: continue
    cid, title = t
    text = f"# {title}\n\n" + "\n\n".join(sec.blocks)
    if sec.notes:
        text += "\n\n" + "\n".join(f"[^{i+1}]: {n}" for i, n in enumerate(sec.notes))
    (out / f"{cid}.md").write_text(text + "\n", encoding="utf-8")
    order.append(cid)
json.dump(order, open("research/sourcing/catechisms/_canisius_order.json", "w"))
print(len(order), "chapters")
