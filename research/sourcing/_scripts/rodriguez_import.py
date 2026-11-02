"""Alonso Rodriguez SJ, Ejercicio de perfeccion: split the modern Spanish text and Rickaby's English into chapter files."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import blocks_of, join_lines, merge_paragraphs, write_chapter

ROOT = Path("/Users/gustavo/Documents/prayer")
IA = ROOT / "research/sourcing/alonso-rodriguez/ia"
OUT = ROOT / "content/books/alonso-rodriguez-opera-omnia/ejercicio-de-perfeccion"

def runhead(s):
    letters = [c for c in s if c.isalpha()]
    if len(s) > 90 or len(letters) < 4: return False
    up = sum(c.isupper() for c in letters) / len(letters)
    return up >= 0.7 and bool(re.match(r"^\d+\s|.*\s\d+$", s))

def clean_title(lines):
    return join_lines(lines).rstrip(" .")

TRAT = re.compile(r"TRATADO\s+(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|S[ÉE]PTIMO|OCTAVO)\s*")
TREAT_RE = re.compile(r".*T\s?R\s?E\s?A\s?T\s?I\s?S\s?E.*")

def junk(p):
    # OCR debris of decorations and blank pages: short and with hardly any real words
    return len(p) < 400 and len(re.findall(r"[A-Za-zÁÉÍÓÚáéíóúñü]{4,}", p)) < 3 and not p.endswith((".", "”", "?"))

def parse(path, lang, chap_re):
    """Return [(treatise_index, treatise_title, chapter_title, blocks)]."""
    raw = path.read_text(encoding="utf-8", errors="replace").replace("\x0c", "\n")
    out = []
    for ln in raw.split("\n"):
        s = ln.strip()
        if re.fullmatch(r"\d{1,4}", s): continue
        if lang == "en" and runhead(s): continue
        out.append(ln)
    blocks = blocks_of(out)
    chapters, cur, tr, trtitle, pending = [], None, 0, "", False
    i = 0
    while i < len(blocks):
        b = blocks[i]
        first = b[0]
        is_tr = (lang == "es" and TRAT.fullmatch(first)) or (lang == "en" and TREAT_RE.fullmatch(first) and first.upper() == first)
        if is_tr:
            cur = None
            tl = b[1:] if len(b) > 1 else (blocks[i + 1] if i + 1 < len(blocks) else [])
            if len(b) == 1: i += 1
            if lang == "es" or tr == 0 or True:
                tr += 1; trtitle = clean_title(tl)
        elif chap_re.fullmatch(first):
            if len(b) > 1: tl = b[1:]
            else:
                i += 1; tl = blocks[i]
            cur = (tr, trtitle, clean_title(tl), [])
            chapters.append(cur)
        elif cur is not None:
            if lang == "es" and first.startswith("Fin de la "):
                cur = None
            else:
                cur[3].append(b)
        i += 1
    return chapters

ES_CH = re.compile(r"CAP[IÍ]TULO\s+(PRIMERO|\S{1,4})\s*")
EN_CH = re.compile(r"CHAPTER\s+[IVXLCivxlc1OT]{1,7}\.?\s*")

from collections import Counter
_vocab = None

def vocab():
    global _vocab
    if _vocab is None:
        txt = " ".join((IA / f"practiceofperfec000{v}alph.txt").read_text(errors="replace") for v in (1, 2, 3))
        _vocab = Counter(w.lower() for w in re.findall(r"[A-Za-z]+", txt) if not w.isupper() or len(w) < 2)
    return _vocab

def fix_dropcap(ps):
    """Rickaby's OCR loses the initial of a chapter's first word (HE for THE, T. for ST.); restore it
    when exactly one capital completes the fragment to a word the volumes use often."""
    if not ps: return ps
    if ps[0].startswith("Bee OLD"):
        ps[0] = "BEHOLD" + ps[0][7:]
        return ps
    g = re.match(r"[|\[\]'4f/\\()\s!]*(?:hee|pee|bee|Bee|bie|hie|ee)[!]?\s+", ps[0])
    if g:
        ps[0] = "THE " + ps[0][g.end():]
        return ps
    if re.match(r"HE\s+(?!that|who|whom)", ps[0]):
        ps[0] = "T" + ps[0]
        return ps
    for a, b in (("E that ", "HE that "), ("ET him", "LET him")):
        if ps[0].startswith(a):
            ps[0] = b + ps[0][len(a):]
            return ps
    m = re.match(r"([A-Z]+)(\.?)(\s)", ps[0])
    if not m: return ps
    w, dot, sp = m.groups()
    rest = ps[0][m.end():]
    v = vocab()
    one = {"E": "WE", "N": "IN", "F": "OF", "S": "AS", "Y": "MY", "M": "MY"}
    if w in one and not dot:
        ps[0] = one[w] + sp + rest
        return ps
    if w == "UT" or (w == "HERE" and re.match(r"(are|is|was|were|have|has|be|may|can)\b", rest)) or (w == "HIS" and re.match(r"(is|instruction|will|same|means)\b", rest)):
        ps[0] = "B" * (w == "UT") + "T" * (w != "UT") + w + sp + rest
        return ps
    if w == "T" and dot and re.match(r"[A-Z]{3}", rest): ps[0] = "ST. " + rest
    elif len(w) >= 2 and v[w.lower()] < 15:
        best = max("ABCDEFGHIJKLMNOPQRSTUVWXYZ", key=lambda L: v[(L + w).lower()])
        if v[(best + w).lower()] >= 5: ps[0] = best + w + dot + sp + rest
    elif w == "T" and re.match(r"(is|will|would|remains|seems|may|might|cannot|must|should|can|was|has|appears|were|follows|behoves|happens)\b", rest): ps[0] = "IT " + rest
    return ps

def paras(bs, en=False):
    ps = [join_lines(b) for b in bs]
    ps = [p for p in ps if p and not (en and junk(p))]
    ps = merge_paragraphs(ps)
    return [re.sub(r"(?<=[a-z0-9])1(?=[a-záéíóúñ])", "i", re.sub(r"([A-Za-záéíóúñü0-9])- ([a-záéíóúñü])", r"\1\2", p)) for p in ps] if not en else [re.sub(r"([a-z])- ([a-z])", r"\1\2", p) for p in ps]

PARTS_ES = ["Primera parte", "Segunda parte", "Tercera parte"]
PARTS_EN = ["Part One", "Part Two", "Part Three"]
PARTS_PT = ["Primeira parte", "Segunda parte", "Terceira parte"]
TREAT_ES = [
 ["De la estima, deseo y afición que hemos de tener a lo que toca a nuestro aprovechamiento espiritual", "De la perfección de las obras ordinarias", "De la rectitud y pureza de intención que habemos de tener en las obras", "De la unión y caridad fraterna", "De la oración", "De la presencia de Dios", "Del examen de la conciencia", "De la conformidad con la voluntad de Dios"],
 ["De la mortificación", "De la modestia y silencio", "De la virtud de la humildad", "De las tentaciones", "De la afición desordenada de parientes", "De la tristeza y alegría", "Del tesoro y bienes que tenemos en Cristo y del modo que hemos de tener en meditar los misterios de su Pasión", "De la sagrada Comunión y santo sacrificio de la Misa"],
 ["Del fin e instituto de la Compañía de Jesús, y de algunos medios que nos ayudarán a conseguirlo", "De los votos esenciales de la Religión, y bienes grandes que hay en ella", "Del voto de la pobreza", "De la virtud de la castidad", "De la virtud de la obediencia", "De la observancia de las reglas", "De la claridad que se ha de tener con los superiores y padres espirituales, dándoles entera cuenta de la conciencia", "De la corrección fraterna"],
]
TREAT_EN = [
 ["On the esteem, desire and affection we ought to have for what concerns our spiritual progress", "On the perfection of our ordinary actions", "On rectitude and purity of intention in our actions", "On union and fraternal charity", "On prayer", "On the presence of God", "On the examination of conscience", "On conformity with the will of God"],
 ["On mortification", "On modesty and silence", "On the virtue of humility", "On temptations", "On inordinate affection for relatives", "On sadness and joy", "On the treasure and goods we have in Christ, and the way to meditate on the mysteries of His Passion", "On holy Communion and the holy sacrifice of the Mass"],
 ["On the end and institute of the Society of Jesus, and some means that will help us to attain it", "On the essential vows of religion and the great goods in it", "On the vow of poverty", "On the virtue of chastity", "On the virtue of obedience", "On the observance of the rules", "On openness with superiors and spiritual fathers, giving them full account of conscience", "On fraternal correction"],
]
TREAT_PT = [
 ["Da estima, desejo e afeição que devemos ter ao que toca ao nosso aproveitamento espiritual", "Da perfeição das obras ordinárias", "Da retidão e pureza de intenção nas obras", "Da união e caridade fraterna", "Da oração", "Da presença de Deus", "Do exame de consciência", "Da conformidade com a vontade de Deus"],
 ["Da mortificação", "Da modéstia e do silêncio", "Da virtude da humildade", "Das tentações", "Da afeição desordenada aos parentes", "Da tristeza e da alegria", "Do tesouro e bens que temos em Cristo e do modo de meditar os mistérios da sua Paixão", "Da sagrada Comunhão e santo sacrifício da Missa"],
 ["Do fim e instituto da Companhia de Jesus e de alguns meios para alcançá-lo", "Dos votos essenciais da religião e dos grandes bens que há nela", "Do voto de pobreza", "Da virtude da castidade", "Da virtude da obediência", "Da observância das regras", "Da clareza com os superiores e pais espirituais, dando-lhes inteira conta da consciência", "Da correção fraterna"],
]
PROLOGUES = {1: ("A los religiosos de la Compañía de Jesús", "A LOS RELIGIOSOS DE LA COMPAÑÍA DE JESÚS", "Aos religiosos da Companhia de Jesus"),
             2: ("Al lector", "AL LECTOR", "Ao leitor"), 3: ("Al lector", "AL LECTOR", "Ao leitor")}

def prologue(p):
    title, head, _ = PROLOGUES[p]
    lines = (IA / f"web1609p{p}.txt").read_text(encoding="utf-8", errors="replace").split("\n")
    idx = [i for i, l in enumerate(lines) if l.strip() == head][-1]
    seg = []
    for l in lines[idx + 1:]:
        t = l.strip()
        if re.match(r"(TRATADO PRIMERO|PARTE |EJERCICIO DE PERFECCI|Nota del editor)", t): break
        if re.fullmatch(r"\d{1,4}", t): continue
        seg.append(l)
    bs = [b for b in blocks_of(seg) if not (re.match(r"\d{1,2} \S", b[0]) and len(b) <= 2)]
    ps = paras(bs)
    while ps and ps[-1].strip() == "ALONSO RODRÍGUEZ": ps.pop()
    return ps

def main():
    toc, stats, dropped = [], {"es-ES": 0, "en-US": 0}, 0
    for p in (1, 2, 3):
        es = parse(IA / f"web1609p{p}.txt", "es", ES_CH)
        en = parse(IA / f"practiceofperfec000{p}alph.txt", "en", EN_CH)
        assert len(es) == len(en), (p, len(es), len(en))
        part = {"id": f"p{p}", "title": {"es-ES": PARTS_ES[p - 1], "en-US": PARTS_EN[p - 1], "pt-BR": PARTS_PT[p - 1]}, "children": []}
        pro = prologue(p)
        write_chapter(OUT / "es-ES" / f"p{p}-prologo.md", PROLOGUES[p][0], pro)
        stats["es-ES"] += sum(len(x.split()) for x in pro)
        part["children"].append({"id": f"p{p}-prologo", "title": {"es-ES": PROLOGUES[p][0], "pt-BR": PROLOGUES[p][2]}})
        trs = {}
        for a, b in zip(es, en):
            t = a[0]
            node = trs.get(t)
            if node is None:
                node = trs[t] = {"id": f"p{p}-t{t}", "title": {"es-ES": TREAT_ES[p - 1][t - 1], "en-US": TREAT_EN[p - 1][t - 1], "pt-BR": TREAT_PT[p - 1][t - 1]}, "children": []}
                part["children"].append(node)
            cid = f"p{p}-t{t}-c{len(node['children']) + 1:02d}"
            for lang, src, folder in (("es", a, "es-ES"), ("en", b, "en-US")):
                bs = [x for x in src[3] if not (lang == "es" and re.match(r"\d{1,2} \S", x[0]) and len(x) <= 2)]
                dropped += len(src[3]) - len(bs)
                ps = paras(bs, lang == 'en')
                if lang == "en": ps = fix_dropcap(ps)
                write_chapter(OUT / folder / f"{cid}.md", src[2], ps)
                stats[folder] += sum(len(x.split()) for x in ps) + len(src[2].split())
            node["children"].append({"id": cid, "title": {"es-ES": a[2], "en-US": b[2]}})
        toc.append(part)
    print(stats, "dropped footnote blocks", dropped)
    json.dump(toc, open(OUT / "toc.tmp.json", "w"), ensure_ascii=False)

if __name__ == "__main__":
    main()
