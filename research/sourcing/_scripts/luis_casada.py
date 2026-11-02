import sys; sys.path.insert(0, "/Users/gustavo/Documents/prayer/research/sourcing/_scripts")
from luis_import import *
from emberlib import blocks_of, join_lines
SRC = ROOT / "research/sourcing/luis-de-leon/gut/pg61573.txt"
lines = SRC.read_text(encoding="utf-8").split("\n")
ROM = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI".split()
# index titles
i0 = next(i for i, l in enumerate(lines) if l.strip() == "ÍNDICE")
i1 = next(i for i, l in enumerate(lines) if l.strip() == "NOTAS")
idx = " ".join(l.strip() for l in lines[i0 + 1:i1] if l.strip())
idx = idx.split("PAUTA")[0]
titles = []
for e in re.split(r"(?<=\d)\s+(?=(?:INTRODUCCIÓN|CAPÍTULO PRIMERO|-- [IVX]+)\.--)", idx):
    m = re.search(r"(?:INTRODUCCIÓN|CAPÍTULO PRIMERO|-- [IVX]+)\.--(.*?)\s*\d*$", e.strip())
    if m: titles.append(m.group(1).strip())
assert len(titles) == 22, (len(titles), titles[-2:])
# notes
notes = {}
for m in re.finditer(r"^  \[(\d+)\] (.*(?:\n    .*)*)", "\n".join(lines[i1:]), flags=re.M):
    notes[int(m.group(1))] = " ".join(m.group(2).split())
start = next(i for i, l in enumerate(lines) if l.strip() == "Á D.ª MARÍA VARELA OSORIO")
body = [re.sub(r"^\[Ilustración[^\]]*\]?$", "", l) for l in lines[start:i0]]
# chapter starts: roman numeral alone
marks = [(0, "INTRO")] + [(i - start, l.strip()) for i, l in enumerate(lines[start:i0], start) if l.strip() in ROM and i > start + 5 and not lines[i - 1].strip() and lines[i + 1].strip() == ""]
# keep first occurrence in order I..XXI
chs, k = [], 0
for off, r in marks[1:]:
    if k < 21 and r == ROM[k]:
        chs.append(off); k += 1
assert k == 21, k
bounds = [0] + chs + [len(body)]
def render(seg, title):
    txt = "\n".join(seg)
    # drop heading material: for chapters, the roman numeral + uppercase title block
    bs = blocks_of(txt.split("\n"))
    out, used = [], []
    for b in bs:
        raw = [l for l in seg]  # placeholder
        out.append(b)
    return out
toc, words, rawparts = [], 0, []
node_children = []
for n in range(22):
    seg = body[bounds[n]:bounds[n + 1]]
    blocks = []
    cur = []
    for l in seg:
        if l.strip() == "":
            if cur: blocks.append(cur); cur = []
        else: cur.append(l)
    if cur: blocks.append(cur)
    if n == 0:
        blocks = blocks[3:]  # dedication line, 'INTRODUCCIÓN', uppercase summary
        # skip the heading blocks: 'Á D.ª ...' was start; the next two are INTRODUCCIÓN and its argument
    else:
        blocks = blocks[2:]  # roman numeral + uppercase title (title may be one block)
    paras = []
    for b in blocks:
        indented = all(l.startswith("    ") for l in b)
        t = join_lines([l.strip() for l in b])
        if indented:
            paras.append("> " + t.replace("_", "*"))
            continue
        paras.append(t)
    text = "\n\n".join(paras)
    text = re.sub(r"_(.+?)_", r"*\1*", text)
    used = sorted({int(x) for x in re.findall(r"\[(\d+)\]", text)})
    text = re.sub(r"\[(\d+)\]", r"[^\1]", text)
    if used: text += "\n\n" + "\n\n".join(f"[^{u}]: {notes[u]}" for u in used)
    cid = "introduccion" if n == 0 else f"cap-{n:02d}"
    h1 = titles[n]
    h1 = h1[0].upper() + h1[1:]
    words += write_md("perfecta-casada", "es-ES", cid, h1, text)
    node_children.append({"id": cid, "title": {"es-ES": h1}})
print("words", words)
meta = {
 "id": "luis-perfecta-casada", "cover": "quarter",
 "name": {"es-ES": "La perfecta casada", "en-US": "The Perfect Wife", "pt-BR": "A perfeita casada"},
 "description": {
  "es-ES": "Comentario a Proverbios 31 (¿Quién hallará mujer de valor?), dedicado a doña María Varela Osorio con ocasión de su boda: la introducción sobre el estado del matrimonio y veintiún capítulos sobre el gobierno de la casa, la fidelidad, el trabajo, la caridad con los pobres y el temor de Dios. Salamanca, 1583.",
  "en-US": "A commentary on Proverbs 31 (Who shall find a valiant woman?), addressed to Doña María Varela Osorio on her marriage: an introduction on the state of matrimony and twenty-one chapters on the governing of the household, fidelity, work, charity to the poor and the fear of God. Salamanca, 1583.",
  "pt-BR": "Comentário a Provérbios 31 (Quem encontrará uma mulher forte?), dedicado a dona María Varela Osorio por ocasião do seu casamento: uma introdução sobre o estado do matrimônio e vinte e um capítulos sobre o governo da casa, a fidelidade, o trabalho, a caridade para com os pobres e o temor de Deus. Salamanca, 1583."},
 "composed": "1583", "languages": ["es-ES"], "work": "luis-de-leon/perfecta-casada",
 "editions": {"es-ES": {"editor": "Montaner y Simón, Barcelona (edición ilustrada)", "year": 1898}},
 "sources": [{"language": "es-ES", "url": "https://www.gutenberg.org/ebooks/61573", "edition": "La perfecta casada, Barcelona: Montaner y Simón, 1898, as transcribed and proofread by Project Gutenberg (#61573); original spelling kept, the editor's footnotes at the end of the book kept as footnotes.", "description": "Introduction and 21 chapters; second witness es.wikisource (La perfecta casada).", "tier": "A"}],
}
raw = SRC.read_text(encoding="utf-8")
finish("perfecta-casada", meta, node_children, "perfecta-casada.txt", raw)
