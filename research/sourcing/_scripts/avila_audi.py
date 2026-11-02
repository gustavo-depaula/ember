"""Audi, filia (1574): es from the Apostolado Mariano reprint text, en from EEBO-TCP A23406 (Matthew 1620)."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/audi-filia"
ES = (R / "research/sourcing/john-of-avila/ia-tomo2/audi.txt").read_text(encoding="utf-8").split("\n")
EN = (R / "research/sourcing/john-of-avila/tcp/A23406.txt").read_text(encoding="utf-8").split("\n")

# ---- Spanish
def es_clean(lines):
    lines = [l for l in lines if not re.fullmatch(r"\s*\d{1,3}\s*", l)]
    return lines
start = next(i for i, l in enumerate(ES) if l.strip() == "PRÓLOGO DEL AUTOR" and i > 700)
suma = next(i for i, l in enumerate(ES) if l.strip() == "BREVE SUMA" and i > 700)
cap1 = next(i for i, l in enumerate(ES) if re.match(r"CAPÍTULO PRIMERO", l) and i > 700)
heads = [(i, int(m.group(1))) for i, l in enumerate(ES) if i >= cap1 and (m := re.fullmatch(r"CAPÍTULO (\d+)\s*", l))]
heads = [(cap1, 1)] + heads
assert [n for _, n in heads] == list(range(1, 114)), [n for _, n in heads][:5]
secs = [("prologo", "Prólogo del autor", ES[start + 1:suma]), ("breve-suma", "Breve suma", ES[suma + 1:cap1])]
for k, (i, n) in enumerate(heads):
    end = heads[k + 1][0] if k + 1 < len(heads) else len(ES)
    secs.append(("c%d" % n, "Capítulo %d" % n, ES[i + 1:end]))
es_out = {}
for cid, title, lines in secs:
    paras = [join_lines(b) for b in blocks_of(es_clean(lines))]
    paras = [p for p in paras if p not in ("DEO GRATIAS",)]
    if cid.startswith("c"):
        # first block is the chapter's argument
        paras[0] = "*" + paras[0] + "*"
    elif cid == "prologo":
        paras = paras[1:] if paras and paras[0].isupper() else paras
    paras = [p for p in paras if not p.startswith("* Se subrayan")]
    paras = merge_paragraphs(paras)
    notes, keep = [], []
    for q in paras:
        if re.match(r"^('\*?|\d{1,2})\s+[A-ZÁÉÍÓÚ]", q) and len(q) < 1500 and keep:
            notes.append(re.sub(r"^('\*?|\d{1,2})\s+", "", q))
            keep[-1] += "[^%d]" % len(notes)
        else:
            keep.append(q)
    paras = [re.sub(r"Trarapo|TraTaDo|TraTaDO", "Tratado", q) for q in keep]
    if cid == "prologo":
        paras = [q.replace("difunta!,", "difunta,") for q in paras]
    paras += ["[^%d]: %s" % (i + 1, n) for i, n in enumerate(notes)]
    es_out[cid] = (title, paras)

# ---- English
chaps = [i for i, l in enumerate(EN) if re.match(r"C(?:HA|AA)P\. [IVXLCU]+\.?\s*$", l)]
assert len(chaps) == 113, len(chaps)
tail = next(i for i, l in enumerate(EN) if i > chaps[-1] and l.startswith("CHAP. I. Wherein"))
bounds = chaps + [tail]
NOTE = re.compile(r"^\(([a-z])\)\s(.*?)\s{2}(.*)$")
en_out = {}
for k in range(113):
    lines = EN[bounds[k] + 1:bounds[k + 1]]
    arg = lines[0].strip()
    paras, cur, notes = [], "", []
    def flush():
        global cur
        if cur.strip():
            paras.append(cur.strip())
        cur = ""
    for raw in lines[1:]:
        if not raw.strip():
            flush(); continue
        l = raw
        m = NOTE.match(l.strip() + "  " if "  " not in l.strip() else l.strip())
        if m:
            notes.append(m.group(2).strip())
            cur = cur.rstrip() + "[^%d] " % len(notes)
            l = m.group(3)
        elif re.match(r"^\(([a-z])\)\s", l.strip()):
            # note with no continuation on this line
            notes.append(re.sub(r"^\(([a-z*])\)\s", "", l.strip()))
            cur = cur.rstrip() + "[^%d] " % len(notes)
            flush() if raw.endswith("  ") else None
            continue
        cur += l.strip() + " " if not l.endswith("  ") else l.strip() + " "
        if raw.endswith("  ") and not raw.endswith("   "):
            flush()
    flush()
    paras = merge_paragraphs([re.sub(r"\s+", " ", p) for p in paras])
    # trailing footnote definitions
    defs = ["[^%d]: %s" % (i + 1, n) for i, n in enumerate(notes)]
    arg = re.split(r"\s{2,}", arg)[0]
    if k == 0:
        paras[0] = "*Psalm 44:11-12.* " + paras[0].replace("Psal. 4 4. and incline thine ear▪ and", "Hearken, O daughter, and behold, and incline thine ear, and").replace(" THESE words", "\n\nTHESE words")
        paras = paras[0].split("\n\n") + paras[1:]
    paras = [re.sub(r"\bjesus\b", "Jesus", re.sub(r"\bjohn\b", "John", re.sub(r"\bjoan\.", "John", p.replace("▪", ",")))) for p in paras]
    en_out["c%d" % (k + 1)] = ("Chapter %d" % (k + 1), ["*" + arg + "*"] + paras + defs)

if __name__ == "__main__":
    for lang, data, folder in (("es-ES", es_out, "es-ES"), ("en-US", en_out, "en-US")):
        for cid, (title, paras) in data.items():
            write_chapter(OUT / folder / (cid + ".md"), title, paras)
    print({l: sum(words(p) for p in (OUT / l).glob("*.md")) for l in ("es-ES", "en-US")})
