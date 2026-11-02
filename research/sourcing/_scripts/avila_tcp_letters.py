"""Certain Selected Spiritual Epistles (Rouen 1631, EEBO-TCP A23433): en-US letters, numbered by the Spanish Epistolario where they appear there."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/epistolario-1631-en"
T = (R / "research/sourcing/john-of-avila/tcp/A23433.txt").read_text(encoding="utf-8")
# English letter k -> Spanish Carta number in the Epistolario book (Apostolado order); strings are Sala Balust numbers of letters that book lacks
MAP = {1: "B149", 2: 41, 3: 52, 4: "B121", 5: 19, 6: 32, 7: 42, 8: "B36", 9: 27, 10: "B55", 11: "B59", 12: 64, 13: "B146", 14: 50, 15: 11, 16: 45,
       17: 29, 18: 30, 19: "B35", 20: 6, 21: 40, 22: "B106", 23: 24, 24: "B?", 25: "B147", 26: "B111", 27: 70, 28: "B?", 29: 88, 30: 13, 31: 37, 32: 73,
       33: 83, 34: 16, 35: 84, 36: "B153", 37: "B152", 38: "B142", 39: 44, 40: "B140", 41: 77, 42: "B?", 43: "B?", 44: 87, 45: 18, 46: 86, 47: "B18", 48: 78,
       49: 82, 50: 58, 51: 14, 52: "B?", 53: 75, 54: "B?", 55: 25, 56: 85, 57: 15}
parts = re.split(r"\n\s*\n(?=A letter|A Letter|A LETTER|An? (?:other )?letter|Another)", T)[1:]
assert len(parts) == 57
MARG = re.compile(r"^((?:[1-3]\.?\s?)?[A-Z][A-Za-z●]{1,9}\.?\s?\d{1,3}[^\s]{0,3})\s{2}(?=\S)")
def body_start(l):
    return bool(re.match(r"^[A-Z]{2,}[a-z]*\b|^[A-Z][a-z]+ [A-Za-z]+,? ", l)) and not re.match(r"^(He|It|Of|The author|Wherein|And|To )\b", l)
def short(h):
    h = re.sub(r"\s+", " ", h).strip().rstrip(".")
    h = re.sub(r"(?i)^an? letter( of the author)?( written)?,? ?(to|unto)\s+", "", h)
    h = re.split(r"[,;.]| wherein| who | whom | in which| at the| in a time| written", h, maxsplit=1)[0].strip()
    h = h.replace("Canallier", "Cavalier").replace("Cavallero", "Cavalier")
    return "To " + h[0].lower() + h[1:] if h else "Letter"
TITLES = {"l032": "To John of God", "l042": "To one who hesitated to begin serving God", "l082": "To a former disciple, a Jesuit near death",
          "l027": "To an afflicted lady", "l064": "To the same lady", "l083": "To a holy religious woman (St. Teresa of Jesus)",
          "l044": "To his disciples at Écija", "l011": "To a great lord", "l052": "To a reverend and religious person", "l041": "To a lady at Christmas",
          "l088": "To a maiden living in recollection", "b035": "To a lady, at Pentecost", "l019": "To a lady who asked what charity is"}
chapters = []
for k, p in enumerate(parts, 1):
    ls = [l.strip() for l in p.strip().split("\n") if l.strip()]
    ls = [l for l in ls if l != "FINIS."]
    head = re.sub(r"\s+", " ", ls[0])
    j = 1
    summ = []
    # heading may continue in the second line (ends with a comma)
    if head.endswith(",") and j < len(ls) and not body_start(ls[j]):
        head += " " + ls[j]; j += 1
    if j < len(ls) and not body_start(ls[j]) and len(ls[j]) < 420:
        summ = [ls[j]]; j += 1
    body = ls[j:]
    summ = [re.sub(r"\s+", " ", x) for x in summ]
    notes, paras = [], []
    for l in body:
        m = MARG.match(l)
        if m:
            notes.append(m.group(1).strip()); l = MARG.sub("", l)
            paras.append((re.sub(r"\s+", " ", l), len(notes)))
        else:
            paras.append((re.sub(r"\s+", " ", l), 0))
    out = []
    for l, n in paras:
        if out and not END.search(out[-1][0]):
            out[-1] = (out[-1][0] + " " + l, out[-1][1] or n)  # a margin gloss can split a sentence
            if n and not out[-1][1]: pass
        else:
            out.append((l, n))
    # fix: keep all markers on merged paragraphs
    finalp = []
    for l, n in out:
        finalp.append(l)
    # footnote markers: attach every gloss to the paragraph in which it occurred
    marks = {}
    idx = -1
    merged, cur_notes = [], []
    for l, n in paras:
        if merged and not END.search(merged[-1]):
            merged[-1] += " " + l
        else:
            merged.append(l)
        if n: cur_notes.append((len(merged) - 1, n))
    lines = merged
    for pi, n in cur_notes:
        lines[pi] += "[^%d]" % n
    lines = [re.sub(r"\bjesus\b", "Jesus", re.sub(r"\bjohn\b", "John", l)) for l in lines]
    if summ: lines.insert(0, "*" + summ[0].rstrip() + "*")
    lines += ["[^%d]: %s" % (i + 1, n) for i, n in enumerate(notes)]
    sp = MAP[k]
    cid = ("l%03d" % sp) if isinstance(sp, int) else ("b%03d" % int(sp[1:]) if sp[1:].isdigit() else "u%02d" % k)
    label = ("Letter %d" % sp) if isinstance(sp, int) else ("Letter, Sala Balust no. %s" % sp[1:] if sp[1:].isdigit() else "Letter, number unidentified")
    chapters.append((cid, "%s. %s" % (label, TITLES.get(cid, short(head))), lines, head))
if __name__ == "__main__":
    for cid, t, lines, h in chapters:
        write_chapter(OUT / "en-US" / (cid + ".md"), t, lines)
    ids = [c[0] for c in chapters]
    assert len(set(ids)) == len(ids), [i for i in ids if ids.count(i) > 1]
    print(sum(words(p) for p in (OUT / "en-US").glob("*.md")))
    for c in chapters[:8]: print(c[0], c[1])
