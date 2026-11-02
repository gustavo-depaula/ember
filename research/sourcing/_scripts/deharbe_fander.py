"""Split Fander's Deharbe, A Complete Catechism of the Catholic Religion (6th Amer. ed. 1924; archive.org completecatechis00deharich)."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr

src = Path("research/sourcing/catechisms/completecatechis00deharich.txt")
out = Path("content/books/deharbe-complete-catechism/en-US")
out.mkdir(parents=True, exist_ok=True)
drop = r"(\S{1,4} )?[CO]ATEC\S+ \S{1,3} THE CATHOLIC \S+( \S{1,6})?|\S{1,5} CATECHISM OF THE CATHOLIC \S+"
ps = cat_ocr.paragraphs(src.read_text(), drop=drop)

def fix(t):
    t = t.replace("*", "'").replace("^", "")
    t = re.sub(r"\bEe(?=[a-z]{3,})", "Re", t)
    t = re.sub(r"\bE(?=(ise|ule|ules|ome|oman|omans|ussia|eligion|ecapitulation)\b)", "R", t)
    t = re.sub(r"\bKeligion", "Religion", t)
    return t

HIST = "A Short History of Revealed Religion"
cuts = [  # (first line, id, title)
 (99, "preface", "Preface to the Sixth American Edition"),
 (None, "history-introduction", f"{HIST}: Introduction"),
 (807, "history-before-christ", f"{HIST}: Before Christ"),
 (1339, "history-of-christ", f"{HIST}: The History of Christ"),
 (1617, "history-of-the-church", f"{HIST}: The History of the Church of Christ"),
 (3033, "history-concluding-remarks", f"{HIST}: Concluding Remarks and the Historical Evidences of the Truth of Our Religion"),
 (5676, "introduction", "Introduction: On the End of Man"),
 (5817, "faith-in-general", "Part I, Faith: Chapter I, Faith in General"),
 (6475, "article-01", "Part I, Faith: The First Article of the Creed"),
 (7525, "article-02", "Part I, Faith: The Second Article of the Creed"),
 (8038, "article-03", "Part I, Faith: The Third Article of the Creed"),
 (8214, "article-04", "Part I, Faith: The Fourth Article of the Creed"),
 (8380, "article-05", "Part I, Faith: The Fifth Article of the Creed"),
 (8512, "article-06", "Part I, Faith: The Sixth Article of the Creed"),
 (8571, "article-07", "Part I, Faith: The Seventh Article of the Creed"),
 (8734, "article-08", "Part I, Faith: The Eighth Article of the Creed"),
 (8908, "article-09", "Part I, Faith: The Ninth Article of the Creed"),
 (10013, "article-10", "Part I, Faith: The Tenth Article of the Creed"),
 (10061, "article-11", "Part I, Faith: The Eleventh Article of the Creed"),
 (10203, "article-12", "Part I, Faith: The Twelfth Article of the Creed"),
 (10418, "commandments-and-charity", "Part II, The Commandments: Chapter I, The Commandments in General and the Chief Commandment of Charity"),
 (10961, "ten-commandments", "Part II, The Commandments: The Ten Commandments of God"),
 (11031, "commandment-01", "Part II, The Commandments: The First Commandment of God"),
 (11560, "commandment-02", "Part II, The Commandments: The Second Commandment of God"),
 (11770, "commandment-03", "Part II, The Commandments: The Third Commandment of God"),
 (11905, "commandment-04", "Part II, The Commandments: The Fourth Commandment of God"),
 (12300, "commandment-05", "Part II, The Commandments: The Fifth Commandment of God"),
 (12488, "commandment-06-09", "Part II, The Commandments: The Sixth and Ninth Commandments of God"),
 (12669, "commandment-07", "Part II, The Commandments: The Seventh Commandment of God"),
 (12834, "commandment-08", "Part II, The Commandments: The Eighth Commandment of God"),
 (13044, "commandment-10", "Part II, The Commandments: The Tenth Commandment of God"),
 (13092, "church-commandments", "Part II, The Commandments: Chapter III, The Six Commandments of the Church"),
 (13175, "church-commandment-01", "Part II, The Commandments: The First Commandment of the Church"),
 (13364, "church-commandment-02", "Part II, The Commandments: The Second Commandment of the Church"),
 (13554, "church-commandment-03-06", "Part II, The Commandments: The Third, Fourth, Fifth and Sixth Commandments of the Church"),
 (13674, "sin", "Part II, The Commandments: Chapter IV, Sin"),
 (14101, "virtue", "Part II, The Commandments: Chapter V, Virtue and Christian Perfection"),
 (14626, "grace", "Part III, The Means of Grace: Chapter I, Grace in General"),
 (14999, "sacraments", "Part III, The Means of Grace: Chapter II, The Sacraments"),
 (15177, "baptism", "Part III, The Means of Grace: Baptism"),
 (15462, "confirmation", "Part III, The Means of Grace: Confirmation"),
 (15660, "eucharist", "Part III, The Means of Grace: The Holy Eucharist"),
 (16590, "penance", "Part III, The Means of Grace: Penance"),
 (17594, "extreme-unction", "Part III, The Means of Grace: Extreme Unction"),
 (17755, "holy-orders", "Part III, The Means of Grace: Holy Orders"),
 (17937, "matrimony", "Part III, The Means of Grace: Matrimony"),
 (18298, "prayer", "Part III, The Means of Grace: Chapter III, Prayer"),
 (18944, "sacramentals", "Part III, The Means of Grace: Chapter IV, Sacramentals"),
 (19094, "religious-practices", "Part III, The Means of Grace: Chapter V, Religious Practices and Ceremonies"),
 (19305, "recapitulation", "Recapitulation"),
]
hist0 = next(n for n, p in ps if p.startswith("A SHORT HISTORY OF REVEALED"))
cuts[1] = (hist0, *cuts[1][1:])
ends = {"preface": 317, "history-concluding-remarks": 3268, "recapitulation": 19335}
qre = re.compile(r"^([0-9IlgSsOo|]{1,3})\. (.*)$")
SECT = re.compile(r"^(§ ?\d|AN ACT OF )")
def history(paras):
    """History paragraphs are numbered; the examination questions for a paragraph are printed in the middle of
    it. Join the text broken by them, and put the questions after the paragraph."""
    texts, qs = [], []
    inq = False
    for _, t in paras:
        isq = (t.count("?") >= 2 and re.match(r"^\d+\. ", t)) or (inq and t.count("?") >= 1 and len(t) < 300 and not re.match(r"^\d+\. [A-Z][^?]{60,}\.", t))
        if isq:
            qs.append(t); inq = True; continue
        if not texts or (texts[-1][1].rstrip()[-1:] in ".?!)'\"" and not t[:1].islower() and not t.startswith("(")) or t.startswith("## ") or texts[-1][1].startswith("## "):
            texts.append([len(texts), t])
        else:
            texts[-1][1] += " " + t
        inq = False
    out = []
    for _, t in texts:
        out.append(t)
    if qs:
        out.append("## Questions for examination\n\n" + "\n\n".join(re.sub(r"^(\d+)\. ", r"**\1.** ", q) for q in qs))
    return "\n\n".join(out)

meta = []
for k, (a, cid, title) in enumerate(cuts):
    b = ends.get(cid, cuts[k + 1][0] if k + 1 < len(cuts) else 10**9)
    chunk = [(n, fix(p)) for n, p in ps if a <= n < b]
    if cid == "history-introduction": chunk = [x for x in chunk if not x[1].startswith(("A SHORT HISTORY", "EXPLANATION OF ABBREV"))]
    if cid != "preface" and chunk and re.match(r"^(PART|PAET|INTRODUCTION|Chapter|CHAPTER|CHAPTEE|The (First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth) Article|THE .* COMMANDMENT|HISTORY OF|A SHORT|CONCLUDING|COXFIRMATIOX|THE HOLY|The Holt|Pexance|Baptism\.|Extreme Unction\.|Holy Orders\.|Matrimony\.|Prayer\.|RECAPITULATION)", chunk[0][1]) and len(chunk[0][1]) < 90:
        chunk = chunk[1:]
    def head(t):
        if SECT.match(t) and len(t) < 110: return "## " + re.sub(r"^§ ?", "§ ", t).rstrip(",.") if t.startswith("§") else "## " + t.title().replace("Of", "of")
        if re.fullmatch(r"(PART|PAET) [IL1]+\.?|[A-Z][A-Z ,.']{8,60}", t) and len(chunk) and t in ("CONCLUDING REMARKS", "ON THE HISTORICAL EVIDENCES OF THE TRUTH OF OUR DIVINE RELIGION."): return "## " + t.capitalize()
    # question numbers: tolerate OCR in the number itself
    def qa(paras):
        out, last, want = [], 0, False
        for _, t in paras:
            h = head(t)
            if h: out.append(h); want = False; last = 0; continue
            m = qre.match(t)
            if m and t.endswith("?") and len(t) < 400:
                s = m.group(1)
                last = int(s) if s.isdigit() else last + 1
                out.append(f"**{last}.** {m.group(2)}"); want = True; continue
            if want and not t.startswith("'"):
                out.append("*" + t + "*"); want = False; continue
            want = False
            out.append(t)
        return "\n\n".join(out)
    body = history(chunk) if cid.startswith("history") or cid == "history-concluding-remarks" else qa(chunk)
    (out / f"{cid}.md").write_text(f"# {title}\n\n{body}\n", encoding="utf-8")
    meta.append(cid)
json.dump(meta, open("research/sourcing/catechisms/_deharbe_order.json", "w"))
print(len(meta))
