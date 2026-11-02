"""Letters of Blessed John of Avila (Benedictines of Stanbrook, 1904): en-US, 25 letters."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/epistolario-stanbrook-en"
L = (R / "research/sourcing/john-of-avila/LettersOfBlessedJohnOfAvila1904.txt").read_text(encoding="utf-8").split("\n")
# (Stanbrook letter, first title line index, Spanish Carta number in the Epistolario book or Sala Balust "B" number, English title)
LET = [(1, 899, 83, "To St. Teresa of Jesus, on her account of her spiritual life"), (2, 1192, "B?", "To Don Diego de Guzmán and Dr. Loarte, on their entering the Society of Jesus"),
       (3, 1653, 24, "To a young lady about to consecrate herself by vow to our Lord"), (4, 1905, 6, "To a priest, on due preparation for saying Mass"),
       (5, 2263, "B106", "To a widow, consoling her for the death of her husband"), (6, 2566, 78, "To an invalid lady"), (7, 2825, "B144", "To a gentleman who was ill"),
       (8, 2954, "B137", "On preparation for death"), (9, 3089, 82, "To a dying Jesuit, one of his disciples"), (10, 3254, 40, "To some friends undergoing persecution"),
       (11, 3629, "B88", "To console a lady grieving for the absence of her son"), (12, 3782, 51, "To a friend, on the management of a household"),
       (13, 3990, "B138", "To a friend, on tepidity"), (14, 4185, 81, "On scruples, to a lady"), (15, 4304, 66, "To a lady, on what constitutes true holiness"),
       (16, 4387, "B?", "To a lady of rank, encouraging her to serve God"), (17, 4637, 35, "To a lady, on confidence in God"),
       (18, 4844, 56, "To console a young lady in great affliction"), (19, 5174, 43, "To one of his disciples, teaching him how to lead a good life"),
       (20, 5435, 19, "To a lady who had asked what charity was"), (21, 5828, 34, "To a young lady, on making ready to receive the new-born Jesus"),
       (22, 6084, 30, "To a lady, on the feast of the Epiphany"), (23, 6341, "B?", "To a devout person, on humility, pride and the perfect love of God"),
       (24, 6841, "B35", "To a lady, on the feast of Pentecost"), (25, 7049, "B?", "To a lady, on the feasts of Pentecost and Corpus Christi")]
FURN = re.compile(r"^(Digitized by.*|Die ?■.*|Go+gl?e?I?|Goo.*|Dh Google|\d{0,3}\s*[BR]les\w+ \S{2,8} of A\w+\s*\d{0,3}|[iIjJ]?[Ll]etter [IVXLivxl]+\b.{0,25}|[iIjJ]?[Ll]ett?[ea]t?\s?\S{0,6}|Vol\.? ?I\.? ?\w?|\d{1,3}|[*†]\s?\d{0,2}|\S{1,3})$", re.I)
END_ = len(L) - 1
for i in range(7100, len(L)):
    if L[i].startswith("Printed at Stanb"): END_ = i; break
chapters = []
for k, (n, st, sp, title) in enumerate(LET):
    en = LET[k + 1][1] if k + 1 < len(LET) else END_
    lines = L[st:en]
    # drop the title block (uppercase lines at the start) and the page furniture before it
    i = 0
    while i < len(lines) and (not lines[i].strip() or lines[i].strip() == lines[i].strip().upper() or FURN.match(lines[i].strip())): i += 1
    lines = [l for l in lines[i:] if not FURN.match(l.strip())]
    blocks = blocks_of(lines)
    notes, keep = [], []
    for b in blocks:
        t = join_lines(b)
        if len(t) < 40 and re.search(r"of A\w+$", t): continue
        if re.match(r"^(\d{1,2}|\*\d?) (?=[A-Z“‘'])", t) and len(t) < 900 and keep and (len(keep) > 1 or n != 0):
            notes.append(re.sub(r"^(\d{1,2}|\*\d?) ", "", t)); keep[-1] += "[^%d]" % len(notes)
        else:
            keep.append(t)
    keep = merge_paragraphs(keep)
    keep += ["[^%d]: %s" % (j + 1, t) for j, t in enumerate(notes)]
    if isinstance(sp, int): cid, label = "l%03d" % sp, "Letter %d" % sp
    elif sp[1:].isdigit(): cid, label = "b%03d" % int(sp[1:]), "Letter, Sala Balust no. %s" % sp[1:]
    else: cid, label = "u%02d" % n, "Letter, number unidentified"
    chapters.append((cid, "%s. %s" % (label, title), keep))
if __name__ == "__main__":
    ids = [c[0] for c in chapters]
    assert len(set(ids)) == len(ids), [i for i in ids if ids.count(i) > 1]
    for cid, t, keep in chapters: write_chapter(OUT / "en-US" / (cid + ".md"), t, keep)
    print(sum(words(p) for p in (OUT / "en-US").glob("*.md")))
