"""Latin letters and sermons of Augustine not in the NPNF books, from the augustinus.it mirror.

usage: python3.13 -I aug_ls.py letters|sermons [--dry]
Books are runs of consecutive pages (source order), each file one letter/sermon.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import aug_la as A, aug_build as B, aug_new as N

corpus_letters = {int(x) for x in "1 2 3 4 5 6 7 8 9 10 11 13 14 15 16 17 18 19 20 21 22 23 25 26 27 28 29 30 31 33 34 35 36 37 38 39 40 41 42 43 44 46 47 48 50 51 53 54 55 58 59 60 61 62 63 64 65 66 67 68 69 71 72 73 74 75 76 77 78 79 81 82 83 84 85 86 87 88 89 90 91 92 93 95 96 97 98 99 100 101 102 103 104 111 115 116 117 118 122 123 124 125 126 130 131 132 133 135 136 137 138 139 143 144 145 146 148 150 151 158 159 163 164 165 166 167 169 172 173 180 185 188 189 191 192 195 201 202 203 208 209 210 211 212 213 214 215 218 219 220 227 228 229 231 232 245 246 250 254 263 269".split()}

kind = sys.argv[1]
dry = "--dry" in sys.argv
if kind == "letters":
    d, pat, word, work, ids, budget = "lettere", r"lettera_(\d+)_testo\.htm$", "Epistula", "augustine/epistulae", "epistulae-latinae", 43500
else:
    d, pat, word, work, ids, budget = "discorsi", r"discorso_(\d+)_testo\.htm$", "Sermo", "augustine/sermones", "sermones-latini", 60000

items = []
for f in sorted(os.listdir(os.path.join(A.RAW, d)), key=lambda x: int(re.search(r"(\d+)", x).group(1)) if re.search(r"\d", x) else 0):
    if not re.match(pat, f):
        continue
    lab = B.h3(d, f)
    m = re.fullmatch(r"(?i)(?:EPISTOLA|SERMO) (\d+)", lab)
    if m:
        n = int(m.group(1))
        if (kind == "letters" and n in corpus_letters) or (kind == "sermons" and 51 <= n <= 147):
            continue
    lab = re.sub(r"\s*\[.*\]$", "", lab)
    num = re.sub(r"(?i)^(EPISTOLA|SERMO) ", "", lab).replace(" augm.", " (aucta)")
    ps = B.text_paras(d, f, letter=(kind == "letters"))
    assert ps, f
    title = f"{word} {num}"
    items.append((title, B.doc(title, ps), len(" ".join(p["text"] for p in ps).split())))

books, cur, cw = [], [], 0
for it in items:
    if cur and cw >= budget:
        books.append(cur); cur, cw = [], 0
    cur.append(it); cw += it[2]
if cur:
    books.append(cur)
total = 0
for i, bk in enumerate(books, 1):
    first, last = bk[0][0].split(" ", 1)[1], bk[-1][0].split(" ", 1)[1]
    pl = "Epistulae" if kind == "letters" else "Sermones"
    en = "Letters" if kind == "letters" else "Sermons"
    pt = "Cartas" if kind == "letters" else "Sermões"
    w = sum(x[2] for x in bk)
    total += w
    spec = dict(dir=d, slug=f"{ids}-{i:02d}", la=f"{pl} {first}–{last}", en=f"{en} {first}–{last} (Latin)", pt=f"{pt} {first}–{last} (latim)", composed="date varies", work=work,
                desc={"la": f"{pl} Augustini {first}–{last}, quae in versione Anglica non exstant. Textus Latinus.",
                      "en-US": f"{len(bk)} of Augustine's {en.lower()} ({first} to {last}), Latin text of the Maurist edition (with the post-Maurist additions of Divjak, Dolbeau and others where the source numbers them). These are the {en.lower()} not in the English NPNF book; no English translation imported.",
                      "pt-BR": f"{len(bk)} {pt.lower()} de Santo Agostinho ({first} a {last}), texto latino da edição dos Maurinos e dos acréscimos posteriores."})
    ch = [(f"ch{j:03d}", t, doc) for j, (t, doc, _) in enumerate(bk, 1)]
    N.write(spec, dry, ch)
print(kind, len(items), "items", len(books), "books", total, "words")
