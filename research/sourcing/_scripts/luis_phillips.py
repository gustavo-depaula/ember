import sys; sys.path.insert(0, "/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
from luis_import import *
SRC = ROOT / "research/sourcing/luis-de-leon/ia/poemsfromspanish00lenl.txt"
raw = SRC.read_text(encoding="utf-8", errors="replace")
lines = [re.sub(r"\s+", " ", l).strip() for l in raw.split("\n")]
start = next(i for i, l in enumerate(lines) if l == "THE ASCENSION.")
end = next(i for i, l in enumerate(lines) if l.startswith("DO NOT") ) if any(l.startswith("DO NOT") for l in lines) else len(lines)
TITLES = {"THE ASCENSION.": "The Ascension", "NOCHE SERENA.": "Noche serena", "CUÁNDO SERÁ.": "Cuándo será", "VIDA DESCANSADA.": "Vida descansada", "ODE TO AVARICE.": "Ode to Avarice"}
chap, cur = [], None
for l in lines[start:end]:
    if re.match(r"(\* ?id|University of Toronto)", l): break
    if l and len(re.findall(r"[A-Za-z]", l)) < 2: continue
    if l in TITLES:
        cur = [TITLES[l], []]; chap.append(cur); continue
    if re.fullmatch(r"(\d+|[ij*]\w?|io|ii)", l) or re.match(r"(POEMS FROM THE SPANISH|OF LUIS PONCE|\|3ocms)", l) or re.fullmatch(r"[\d ]*POEMS FROM THE SPANISH.*", l) or re.fullmatch(r"\d* ?OF LUIS PONCE.*", l):
        continue
    cur[1].append(l)
toc, words = [], 0
for title, ls in chap:
    stanzas, st, blanks = [], [], 0
    for l in ls:
        if l:
            if blanks >= 2 and st: stanzas.append(st); st = []
            st.append(l); blanks = 0
        else: blanks += 1
    if st: stanzas.append(st)
    body = "\n\n".join("  \n".join(s) if not s[0].startswith("[") else " ".join(s) for s in stanzas)
    cid = {"The Ascension": "ascension", "Noche serena": "noche-serena", "Cuándo será": "cuando-sera", "Vida descansada": "vida-descansada", "Ode to Avarice": "ode-to-avarice"}[title]
    words += write_md("poesias-phillips", "en-US", cid, title, body)
    toc.append({"id": cid, "title": {"en-US": title}})
print("words", words, [c[0] for c in chap])
meta = {
 "id": "luis-poesias-phillips", "cover": "quarter",
 "name": {"es-ES": "Poesías (versión inglesa de Henry Phillips)", "en-US": "Poems from the Spanish of Fra Luis Ponce de León", "pt-BR": "Poesias (versão inglesa de Henry Phillips)"},
 "description": {
  "en-US": "Henry Phillips Jr.'s verse translation of five of Fray Luis's best-known poems (The Ascension, Noche serena, Cuándo será, Vida descansada, Ode to Avarice), printed privately in Philadelphia in 1883.",
  "es-ES": "Versión en verso inglés de cinco de las poesías más conocidas de Fray Luis (La Ascensión, Noche serena, Cuándo será, Vida descansada, Oda a la avaricia), por Henry Phillips Jr., impresa en privado en Filadelfia en 1883.",
  "pt-BR": "Versão em verso inglês de cinco das poesias mais conhecidas de Frei Luís (A Ascensão, Noche serena, Cuándo será, Vida descansada, Ode à avareza), por Henry Phillips Jr., impressa em particular na Filadélfia em 1883."},
 "composed": "1883", "languages": ["en-US"], "work": "luis-de-leon/poesias",
 "editions": {"en-US": {"translator": "Henry Phillips Jr.", "year": 1883}},
 "sources": [{"language": "en-US", "url": "https://archive.org/details/poemsfromspanish00lenl", "edition": "Poems from the Spanish of Fra Luis Ponce de León, translated by Henry Phillips Jr., Philadelphia, privately printed, 1883 (archive.org OCR).", "description": "Preface omitted; the translator's bracketed note after Noche serena is kept.", "tier": "A"}],
}
finish("poesias-phillips", meta, toc, "poems-from-the-spanish.txt", raw, rawdir="english-originals")
