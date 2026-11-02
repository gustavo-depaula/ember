"""Split Hollings 1905 (A Golden Treatise of Mental Prayer) OCR into chapter files matching the Spanish ids."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

SRC = Path("/Users/gustavo/Documents/prayer/research/sourcing/peter-of-alcantara/en_1905.txt")
OUT = Path(sys.argv[1])
lines = SRC.read_text(encoding="utf-8").split("\n")
# 1-based line numbers -> index
lines[4677:4677] = ["", "Fifth Counsel.", ""]  # heading lost to OCR; later line numbers shift by 1 beyond this
S = lambda n: n + 3 if n >= 4678 else n  # shift for line numbers given in the original file
days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
sections = [("p1-c1", 119, 2), ("p1-c2", 302, 2)]
sections += [("p1-c2-" + d, n, 1) for d, n in zip(days, [384, 680, 896, 1108, 1312, 1409, 1688])]
sections += [("p1-c3", 1834, 3), ("p1-c4", 1900, 2)]
sections += [("p1-c4-" + d, n, 1) for d, n in zip(days, [2062, 2269, 2504, 2709, 2883, 3097, 3249])]
sections += [("p1-c5", 3511, 2), ("p1-c6", 3577, 0), ("p1-c7", 3701, 1), ("p1-c8", 3766, 1), ("p1-c9", 3827, 1), ("p1-c10", 3921, 1), ("p1-c11", 3984, 1), ("p1-c12", 4420, 1),
             ("p2-c1", 5123, 2), ("p2-c2", 5302, 2), ("p2-c3", 5424, 2), ("p2-c4", 5537, 2), ("p2-c5", 5967, 2)]
ends = {"p2-c5": 6435}
ORD = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"]
RUN = re.compile(r"^\W*\w{0,3}\W*(A Golden Treatise|of Mental Prayer\.?)\W*\w{0,4}\W*$|^\W*\d{1,3}\W*A Golden Treatise|of Mental Prayer\.?\s*\W?\w{1,4}\W*$", re.I)
SCRIPT = re.compile(r"^\W{0,2}[a-z0-9*†‡]{0,2}\s*[«‘“]?(Cf\.\s*)?(S\.\s|Cant|Ps\b|Psalm|Isa|Rom|Homil|Eccl|Job\b|Heb|Gen\.|Matt|Luke|Cor|Apoc|Wisd|Prov|Jer|Lam|Zach|Acts|Eph|Phil|Col\.|Tim|Exod|Deut|Lev|Num|Hos|Dan|Ezek|Joel|Amos|Sirac|Ecclus|1\s?S\.|2\s?S\.|Ibid|Hom|De |Serm|In Ps|Conf|St\.)", re.I)
HEAD = re.compile(r"^\W*[A-Za-zı]{4,8}\s+(C[o0][uv]+n[s5]e[lt]|COUNSEL)\W*$", re.I)
DROPCAP = {"HESE, Christian reader, are the seven": "These, Christian reader, are the seven", "INCE this": "Since this", "T TAVING seen": "Having seen", "FTER these": "After these", "HESE, Christian": "These, Christian",
           "Aber greatest": "The greatest", "‘HERE are many things, then, which qJ will": "There are many things, then, which will", "S there are": "As there are",
           "T will be well": "It will be well", "NE of the most": "One of the most"}
I_WORDS = r"(have|give|created|may|am|was|will|shall|would|say|desire|can|could|do|speak|think|bring|ask|beseech|know|see|pray|offer|love|hope|trust|confess)"
def tidy(p):
    p = re.sub(r"\s>\s", "? ", p)
    p = re.sub(r"\s\|\s+_?\s*" + I_WORDS + r"\b", r" I \1", p)
    p = re.sub(r"\s\|\s", " ", p)
    p = re.sub(r"\*[^*]{0,80}?(Apoc|S, Luke)[^.]*\.[^A-Z]*", "", p)
    p = p.replace("*", "")
    p = re.sub(r"\s\+ Bs Irvi g 2 1S\.", "", p)
    p = re.sub(r"\s[Í]\s", " I ", p)
    p = re.sub(r"\s[%'°í|+]+(?=\s)", "", p)
    p = re.sub(r"\s[©_~`=<>]+(?=\s)", "", p)
    p = re.sub(r"\s[©_~`=<>]+(?=\s)", "", p)
    return re.sub(r"\s{2,}", " ", p).strip()
res = []
for k, (cid, start, skip) in enumerate(sections):
    s = S(start) - 1
    e = (ends.get(cid) or S(sections[k + 1][1])) - 1 if True else 0
    raw = lines[s:e]
    bl = blocks_of(raw)
    bl = bl[skip:]
    paras, ctr = [], (1 if cid == "p2-c5" else 0)
    for b in bl:
        if all(RUN.search(x) for x in b):
            continue
        b = [x for x in b if not RUN.search(x)]
        if len(b) == 1 and HEAD.search(b[0]) and len(b[0]) < 24:
            paras.append("## %s Counsel" % ORD[ctr]); ctr += 1
            continue
        if len(b) <= 2 and SCRIPT.search(b[0]) and len(" ".join(b)) < 90:
            continue  # page-foot scripture reference
        b = [re.sub(r"^[=_~`|«\-\.]\s+", "", x) for x in b]
        paras.append(join_lines(b))
    paras = [tidy(p) for p in merge_paragraphs(paras)]
    # a lone page-number line left behind
    paras = [p for p in paras if not re.fullmatch(r"\W*\w{0,4}\W*", p)]
    for old, new in DROPCAP.items():
        if paras and paras[0].startswith(old):
            paras[0] = new + paras[0][len(old):]
    write_chapter(OUT / (cid + ".md"), cid, paras)
    res.append((cid, sum(len(p.split()) for p in paras)))
for r in res:
    print(*r, sep="\t")
