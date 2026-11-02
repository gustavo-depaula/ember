"""Spirago, The Catechism Explained (ed. R. F. Clarke SJ, Benziger 1899; archive.org catechismexplain00spiruoft) -> chapters."""
import re, sys, json, itertools
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr

src = Path("research/sourcing/catechisms/catechismexplain00spiruoft.txt")
out = Path("content/books/spirago-catechism-explained/en-US")
out.mkdir(parents=True, exist_ok=True)
ps = cat_ocr.paragraphs(src.read_text(), drop=r"(\S{1,4} )?(THE )?CATECHISM EXPLAINED.{0,12}|[A-Z .,'-]{3,40} \d{1,3}", glue=True)
W = cat_ocr._words()
SUB = {"E": "R", "K": "N", "X": "N", "Y": "V", "U": "H", "O": "C", "T": "I", "I": "T", "1": "I", "S": "B", "L": "I"}
def fixword(w):
    if not w.isalpha() or w.lower() in W or len(w) < 4: return w
    pos = [i for i, c in enumerate(w) if c in SUB]
    for k in (1, 2):
        for comb in itertools.combinations(pos, k):
            for alt in itertools.product(*[(SUB[w[i]], "R" if w[i] == "K" else SUB[w[i]]) for i in comb]):
                cand = list(w)
                for i, a in zip(comb, alt): cand[i] = a
                c = "".join(cand)
                if c.lower() in W: return c
    return w
def fixcaps(t):
    return re.sub(r"[A-Z]{4,}", lambda m: fixword(m.group(0)), t)
SMALL = {"of", "and", "the", "to", "in", "on", "for", "or", "a", "an", "is", "at", "by", "with", "from", "upon"}
def tcase(t):
    ws = fixcaps(t).rstrip(".:;,").lower().split()
    r = " ".join(w if (i and w in SMALL) else w[:1].upper() + w[1:] for i, w in enumerate(ws))
    return re.sub(r"^(\d+\. )([a-z])", lambda m: m.group(1) + m.group(2).upper(), r)

CUTS = [
 (5246, "Part I, Faith: The Knowledge of God"), (5335, "Part I, Faith: Divine Revelation"), (5478, "Part I, Faith: The Preaching of the Gospel"),
 (5564, "Part I, Faith: Holy Scripture and Tradition"), (5821, "Part I, Faith: The Christian Faith"), (6164, "Part I, Faith: The Motives of Faith"),
 (6352, "Part I, Faith: On the Absence and Loss of Faith"), (6569, "Part I, Faith: On the Duty of Confessing Our Faith"),
 (6756, "Part I, Faith: The Sign of the Cross"), (6909, "Part I, Faith: The Apostles' Creed and the First Article"),
 (10050, "Part I, Faith: The Second to the Seventh Article of the Creed: Jesus Christ"), (12578, "Part I, Faith: The Eighth Article of the Creed: The Holy Ghost"),
 (13498, "Part I, Faith: The Ninth Article of the Creed: The Catholic Church"), (15414, "Part I, Faith: The Tenth Article of the Creed: The Forgiveness of Sins"),
 (15424, "Part I, Faith: The Eleventh and Twelfth Articles of the Creed: The Last Things"), (16613, "Part I, Faith: Christian Hope"),
 (16978, "Part II, The Commandments: What Commandments Has God Given Us?"), (17190, "Part II, The Commandments: The Two Commandments of Charity"),
 (17294, "Part II, The Commandments: The Precept of the Love of God"), (17647, "Part II, The Commandments: The Love of the World Is Opposed to the Love of God"),
 (17787, "Part II, The Commandments: The Commandment of Charity towards Our Neighbor"), (17973, "Part II, The Commandments: Lack of Charity to One's Neighbor"),
 (18119, "Part II, The Commandments: Love of One's Friends"), (18265, "Part II, The Commandments: The Commandment to Love Our Enemy"),
 (18394, "Part II, The Commandments: The Love of One's Self"), (18478, "Part II, The Commandments: The Ten Commandments of God"),
 (18623, "Part II, The Commandments: The First Commandment of God"), (20348, "Part II, The Commandments: The Second and Third Commandments of God"),
 (21398, "Part II, The Commandments: The Six Commandments of the Church"), (22075, "Part II, The Commandments: The Fourth Commandment of God"),
 (22754, "Part II, The Commandments: The Fifth Commandment of God"), (23431, "Part II, The Commandments: The Sixth Commandment of God"),
 (23541, "Part II, The Commandments: The Seventh Commandment of God"), (23936, "Part II, The Commandments: The Eighth Commandment of God"),
 (24690, "Part II, The Commandments: The Ninth Commandment of God"), (24698, "Part II, The Commandments: The Tenth Commandment of God"),
 (24941, "Part II, The Commandments: The Works of Mercy"), (25631, "Part II, The Commandments: The Duty of Gratitude"),
 (25724, "Part II, The Commandments: The Poverty of the Christian"), (25849, "Part II, Good Works, Virtue, Sin, Vice: Good Works"),
 (26142, "Part II, Good Works, Virtue, Sin, Vice: Virtue"), (26731, "Part II, Good Works, Virtue, Sin, Vice: Sin"),
 (27721, "Part II, Good Works, Virtue, Sin, Vice: Vice"), (27925, "Part II, Good Works, Virtue, Sin, Vice: The Forgiveness of Sin"),
 (28028, "Part II, Good Works, Virtue, Sin, Vice: Temptation"), (28272, "Part II, Good Works, Virtue, Sin, Vice: Occasions of Sin"),
 (28518, "Part II, Good Works, Virtue, Sin, Vice: The Seven Principal Virtues and the Seven Principal Vices"),
 (30166, "Part II, Christian Perfection: The Aspiration after Christian Perfection"), (30334, "Part II, Christian Perfection: General Means for the Attainment of Perfection"),
 (30605, "Part II, Christian Perfection: Special Means for the Attainment of Perfection"), (30885, "Part II, Christian Perfection: The Eight Beatitudes"),
 (31124, "Part III, The Means of Grace: The Holy Sacrifice of the Mass"), (33787, "Part III, The Means of Grace: The Sacraments"),
 (37267, "Part III, The Means of Grace: Indulgences"), (39323, "Part III, The Means of Grace: The Sacramentals"),
 (39501, "Part III, The Means of Grace: Prayer"), (40415, "Part III, The Means of Grace: The Most Important Prayers"),
 (40968, "Part III, The Means of Grace: The Principal Devotional Exercises"), (41758, "Part III, The Means of Grace: Religious Associations"),
]
CAPS = re.compile(r"^[A-Z0-9 ,.'\-:;()?]{10,90}$")
order = []
for k, (a, title) in enumerate(CUTS):
    b = CUTS[k + 1][0] if k + 1 < len(CUTS) else 42316
    seg = [(n, t) for n, t in ps if a <= n < b]
    blocks = []
    for j, (n, t) in enumerate(seg):
        if j == 0 and CAPS.match(t): continue  # the chapter's own heading
        if CAPS.match(t) and not re.search(r"\d{3}", t):
            blocks.append("## " + tcase(re.sub(r"^[IVXLYU]{1,5}[.,] ", "", t)))
        else:
            blocks.append(re.sub(r"\bEe(?=[a-z]{3,})", "Re", t).replace("*", "\\*"))
    cid = f"{k + 1:02d}-" + re.sub(r"[^a-z0-9]+", "-", title.split(": ", 1)[-1].lower()).strip("-")[:48].strip("-")
    (out / f"{cid}.md").write_text(f"# {title}\n\n" + "\n\n".join(blocks) + "\n", encoding="utf-8")
    order.append(cid)
json.dump(order, open("research/sourcing/catechisms/_spirago_order.json", "w"))
print(len(order))
