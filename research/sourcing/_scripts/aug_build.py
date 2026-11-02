"""Add augustinus.it Latin (Maurist/PL text) as la/ to the NPNF Augustine books.

usage: python3.13 -I aug_build.py <book-dir-name>|all [--dry]
Specs at the bottom map every en-US chapter stem to Latin paragraphs.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import aug_la as A

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BOOKS = os.path.join(ROOT, "content", "books", "church-fathers", "augustine")
roman = lambda n: ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] if n <= 10 else (
    "X" * (n // 10) + ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][n % 10])
ANCH = re.compile(r"^[A-Z]+_(\d+)_(\d+)_(\d+)$")


def fmt(t):
    t = re.sub(r"^(\d+)\. (\d+)\. ", r"\1.\2. ", t)
    return re.sub(r"\s*\n\s*", " ", t).strip()


def text_paras(work, page, letter=False):
    """Anchored paragraphs = Augustine's text; unanchored ones are NBA headings."""
    ps = A.paras(os.path.join(A.RAW, work, page))
    an = [p for p in ps if p["anchor"]]
    if not an:
        return [dict(p, text=fmt(p["text"])) for p in ps if p["kind"] == "P"]
    out = []
    first = ps.index(an[0])
    if letter:
        pre = [p for p in ps[:first] if p["kind"] == "P"]
        if len(pre) >= 2 and len(pre[-1]["text"].split()) < 60:
            out.append(dict(pre[-1], text=fmt(pre[-1]["text"]), anchor=None))
    h5 = sum(1 for p in ps[first:] if p["kind"] != "P") >= 3
    last = cur = None
    for p in ps[first:]:
        t = p["text"]
        if p["anchor"]:
            cur = p["anchor"]
            last = dict(p, text=fmt(t))
            out.append(last)
        elif p["kind"] == "P" and not t.startswith("..."):
            # The source sometimes cuts a paragraph mid-sentence with </P><P>
            if last is not None and (not re.search(r"[.?!:;)\]*\"”»]$", last["text"]) or not (t[0].isupper() or t[0].isdigit() or t[0] in "*([")):
                last["text"] += " " + fmt(t)
            # Where NBA headings are <H5>, an unanchored <P> is Augustine's text; where they
            # are plain <P>, only long or numbered ones are
            elif h5 or len(t.split()) >= 45 or re.match(r"\d+\. ", t):
                last = dict(p, text=fmt(t), anchor=cur)
                out.append(last)
            else:
                last = None
        else:
            last = None
    return out


def body(paras):
    return "\n\n".join(p["text"] for p in paras)


def doc(title, paras, sub=None):
    parts = [f"# {title}"]
    if sub:
        for t, ps in sub:
            parts += [f"## {t}", body(ps)]
    else:
        parts.append(body(paras))
    return "\n\n".join(parts) + "\n"


def h3(work, page):
    for p in A.paras(os.path.join(A.RAW, work, page)):
        if p["kind"] == "H3":
            return p["text"]
    return ""


def anch(p):
    m = ANCH.match(p["anchor"] or "")
    return tuple(int(x) for x in m.groups()) if m else None


# ---------------- unit builders: return {stem: (title, doc text)} ----------------
def single(work, title):
    pages = A.pages(work)
    if len(pages) == 1:
        return {"ch001": doc(title, text_paras(work, pages[0]))}
    return {"ch001": doc(title, None, [(h3(work, p).title(), text_paras(work, p)) for p in pages])}


def books(work, names, prefix=None, skip=0, nb=None):
    """en ch001.. = Latin pages in order (skipping `skip` leading pages)."""
    pages = A.pages(work)[skip:]
    if nb is not None:
        assert len(pages) == nb, (work, len(pages), nb)
    out = {}
    for i, pg in enumerate(pages):
        out[f"ch{i + 1:03d}"] = doc(names(i + 1), text_paras(work, pg))
    return out


def liber(i):
    return f"Liber {roman(i)}"


def confessions_schaff():
    out = {}
    for b in range(1, 14):
        work = "confessioni"
        ps = text_paras(work, f"conf_{b:02d}_libro.htm")
        out[f"ch{b:03d}"] = f"# Liber {roman(b)}\n"
        chs = {}
        for p in ps:
            # The corpus's English Book 1 ends at ch. 18 (= Latin chs. 18-20, 28-31)
            chs.setdefault(min(anch(p)[1], 18) if b == 1 else anch(p)[1], []).append(p)
        for c, cp in chs.items():
            out[f"ch{b:03d}-chapter-{c:02d}"] = doc(f"Caput {c}", cp)
    return out


def harmony():
    out, n = {}, 0
    for b in range(1, 5):
        ps = text_paras("consenso_evangelisti", f"consenso_evangelisti_{b}_libro.htm")
        chs = {}
        for p in ps:
            chs.setdefault(anch(p)[1], []).append(p)
        if b > 1:
            n += 1
            pro = chs[1][0]
            assert anch(pro)[2] == 1
            chs[1] = chs[1][1:]
            out[f"ch{n:03d}"] = doc("Prologus", [pro])
        for c in sorted(chs):
            n += 1
            out[f"ch{n:03d}"] = doc(f"Liber {roman(b)}, Caput {c}", chs[c])
    return out


def from_en(bookdir, work, pattern, title_fn, find):
    """Chapter stems follow en-US order; `find(num)` returns the list of Latin pages."""
    out = {}
    for f in sorted(os.listdir(os.path.join(bookdir, "en-US"))):
        stem = f[:-3]
        head = open(os.path.join(bookdir, "en-US", f), encoding="utf-8").read(400)
        m = re.search(pattern, head)
        num = int(m.group(1)) if m else None
        out[stem] = (num, head)
    res = {}
    for stem, (num, head) in out.items():
        res[stem] = find(num, head)
    return res


def psalms(bookdir):
    groups = {}
    for pg in A.pages("esposizioni_salmi"):
        h = h3("esposizioni_salmi", pg)
        m = re.search(r"PSALM(?:UM)? (\d+)", h)
        assert m, (pg, h)
        groups.setdefault(int(m.group(1)), []).append(pg)
    out = {}
    for n in range(1, 151):
        pgs = groups[n]
        if len(pgs) == 1:
            out[f"ch{n:03d}"] = doc(f"Psalmus {n}", text_paras("esposizioni_salmi", pgs[0]))
        else:
            sub, seen = [], {}
            for k, pg in enumerate(pgs):
                raw = A.paras(os.path.join(A.RAW, "esposizioni_salmi", pg))
                first = next(i for i, p in enumerate(raw) if p["anchor"])
                lab = []
                for p in raw[:first]:
                    t = p["text"]
                    if p["kind"] == "P" and re.match(r"(ENARRATIO|ESPOSIZIONE|SERMO|Sermo) ?(\d+|[IVXLC]+)?$", t):
                        w = t.split()
                        lab.append(" ".join([w[0].capitalize().replace("Esposizione", "Enarratio")] + w[1:]))
                t = ", ".join(lab) or f"Pars {roman(k + 1)}"
                seen[t] = seen.get(t, 0) + 1
                if seen[t] > 1:
                    t += f" (pars {seen[t]})"
                sub.append((t, text_paras("esposizioni_salmi", pg)))
            out[f"ch{n:03d}"] = doc(f"Psalmus {n}", None, sub)
    return out


def tractates():
    out = {}
    for n in range(1, 125):
        pg = f"omelia_{n:03d}_testo.htm"
        assert h3("commento_vsg", pg) == f"TRACTATUS {n}", (n, h3("commento_vsg", pg))
        out[f"ch{n:03d}"] = doc(f"Tractatus {n}", text_paras("commento_vsg", pg))
    return out


def faustus():
    return {f"ch{n:03d}": doc(liber(n), text_paras("contro_fausto", f"libro_{n:02d}_testo.htm")) for n in range(1, 34)}


def letters(bookdir):
    byn = {}
    for pg in os.listdir(os.path.join(A.RAW, "lettere")):
        m = re.match(r"lettera_\d+_testo\.htm$", pg)
        if m:
            mm = re.fullmatch(r"EPISTOLA (\d+)", h3("lettere", pg))
            if mm:
                byn.setdefault(int(mm.group(1)), []).append(pg)
    out = {}
    for f in sorted(os.listdir(os.path.join(bookdir, "en-US"))):
        n = int(re.search(r"# Letter (\d+)", open(os.path.join(bookdir, "en-US", f), encoding="utf-8").read(40)).group(1))
        assert len(byn[n]) == 1, (n, byn.get(n))
        out[f[:-3]] = doc(f"Epistula {n}", text_paras("lettere", byn[n][0], letter=True))
    return out


def sermons(bookdir):
    bymaur = {}
    for pg in os.listdir(os.path.join(A.RAW, "discorsi")):
        if re.match(r"discorso_\d+_testo\.htm$", pg):
            mm = re.fullmatch(r"SERMO (\d+)", h3("discorsi", pg))
            if mm:
                bymaur.setdefault(int(mm.group(1)), []).append(pg)
    rom = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}
    def r2i(s):
        t = 0
        for i, ch in enumerate(s):
            v = rom[ch]
            t += -v if i + 1 < len(s) and rom[s[i + 1]] > v else v
        return t
    out = {}
    for f in sorted(os.listdir(os.path.join(bookdir, "en-US"))):
        head = open(os.path.join(bookdir, "en-US", f), encoding="utf-8").read(200)
        n = r2i(re.search(r"\[([IVXLC]+)\. Ben", head).group(1))
        assert len(bymaur[n]) == 1, (n, bymaur.get(n))
        out[f[:-3]] = doc(f"Sermo {n}", text_paras("discorsi", bymaur[n][0]))
    return out


# ---------------- specs ----------------
def S(slug, la, d, build):
    return dict(slug=slug, la=la, dir=d, build=build)


def one(slug, la, d):
    return S(slug, la, d, lambda bd: single(d, la))


SPECS = {
    "city-of-god": S("de-civitate-dei", "De civitate Dei", "cdd", lambda bd: books("cdd", liber, skip=1, nb=22)),
    "tractates-on-the-gospel-of-john": S("in-iohannis-evangelium-tractatus", "In Iohannis evangelium tractatus CXXIV", "commento_vsg", lambda bd: tractates()),
    "reply-to-faustus-the-manichaean": S("contra-faustum", "Contra Faustum Manichaeum", "contro_fausto", lambda bd: faustus()),
    "holy-trinity": S("de-trinitate", "De Trinitate", "trinita", lambda bd: books("trinita", liber, skip=1, nb=15)),
    "confessions": S("confessions", "Confessiones", "confessioni", lambda bd: confessions_schaff()),
    "harmony-of-the-gospels": S("de-consensu-evangelistarum", "De consensu evangelistarum", "consenso_evangelisti", lambda bd: harmony()),
    "enarrations-or-expositions-on-the-psalms": S("enarrationes-in-psalmos", "Enarrationes in Psalmos", "esposizioni_salmi", psalms),
    "letters": S("epistulae", "Epistulae", "lettere", letters),
    "sermons-on-selected-lessons-of-the-new-testament": S("sermones", "Sermones", "discorsi", sermons),
    "homilies-on-the-first-epistle-of-john": S("in-epistulam-iohannis-ad-parthos", "In epistulam Iohannis ad Parthos tractatus decem", "commento_lsg", lambda bd: books("commento_lsg", lambda i: f"Tractatus {i}", skip=1, nb=10)),
    "christian-doctrine": S("de-doctrina-christiana", "De doctrina christiana", "dottrina_cristiana", lambda bd: dict(
        books("dottrina_cristiana", lambda i: "Prologus" if i == 1 else f"Liber {roman(i - 1)}", nb=5))),
    "soliloquies": S("soliloquia", "Soliloquia", "soliloqui", lambda bd: books("soliloqui", liber, nb=2)),
    "our-lord-s-sermon-on-the-mount": S("de-sermone-domini-in-monte", "De sermone Domini in monte", "montagna", lambda bd: books("montagna", liber, nb=2)),
    "against-two-letters-of-the-pelagians": S("contra-duas-epistulas-pelagianorum", "Contra duas epistulas Pelagianorum", "contro_lettere_pelagiani", lambda bd: books("contro_lettere_pelagiani", liber, nb=4)),
    "answer-to-letters-of-petilian-bishop-of-cirta": S("contra-litteras-petiliani", "Contra litteras Petiliani", "contro_petiliano", lambda bd: books("contro_petiliano", liber, nb=3)),
    "baptism-against-the-donatists": S("de-baptismo", "De baptismo contra Donatistas", "sul_battesimo", lambda bd: books("sul_battesimo", liber, nb=7)),
    "merits-and-remission-of-sin-and-infant-baptism": S("de-peccatorum-meritis-et-remissione", "De peccatorum meritis et remissione et de baptismo parvulorum", "castigo_perdono", lambda bd: books("castigo_perdono", liber, nb=3)),
    "soul-and-its-origin": S("de-anima-et-eius-origine", "De anima et eius origine", "anima_origine", lambda bd: books("anima_origine", liber, nb=4)),
    "marriage-and-concupiscence": S("de-nuptiis-et-concupiscentia", "De nuptiis et concupiscentia", "nozze_concupiscenza", lambda bd: books("nozze_concupiscenza", lambda i: "Epistula ad Valerium comitem" if i == 1 else liber(i - 1), nb=3)),
    "grace-of-christ-and-on-original-sin": S("de-gratia-christi-et-de-peccato-originali", "De gratia Christi et de peccato originali", "grazia_cristo", lambda bd: books("grazia_cristo", liber, nb=2)),
    "predestination-of-the-saints-gift-of-perseverance": S("de-praedestinatione-sanctorum", "De praedestinatione sanctorum et de dono perseverantiae", "predestinazione_santi+dono_perseveranza", lambda bd: {
        "ch001": doc("De praedestinatione sanctorum", text_paras("predestinazione_santi", "predestinazione_santi_libro.htm")),
        "ch002": doc("De dono perseverantiae", text_paras("dono_perseveranza", "dono_perseveranza_libro.htm"))}),
    "morals-of-the-catholic-church": S("de-moribus-ecclesiae-catholicae", "De moribus Ecclesiae catholicae", "costumi", lambda bd: {"ch001": doc("De moribus Ecclesiae catholicae", text_paras("costumi", "costumi_1_libro.htm"))}),
    "morals-of-the-manichaeans": S("de-moribus-manichaeorum", "De moribus Manichaeorum", "costumi", lambda bd: {"ch001": doc("De moribus Manichaeorum", text_paras("costumi", "costumi_2_libro.htm"))}),
    "acts-or-disputation-against-fortunatus-the-manichaean": one("acta-contra-fortunatum", "Acta contra Fortunatum Manichaeum", "contro_fortunato"),
    "against-the-epistle-of-manichaeus-called-fundamental": one("contra-epistulam-fundamenti", "Contra epistulam Manichaei quam vocant Fundamenti", "contro_lettera_mani"),
    "care-to-be-had-for-the-dead": one("de-cura-pro-mortuis-gerenda", "De cura pro mortuis gerenda", "cura_morti"),
    "catechising-of-the-uninstructed": one("de-catechizandis-rudibus", "De catechizandis rudibus", "catechesi_cristiana"),
    "concerning-faith-of-things-not-seen": one("de-fide-rerum-quae-non-videntur", "De fide rerum quae non videntur", "fede_nelle_cose"),
    "concerning-the-nature-of-good-against-the-manichaeans": one("de-natura-boni", "De natura boni contra Manichaeos", "natura_bene"),
    "consentius": one("contra-mendacium", "Contra mendacium ad Consentium", "contro_menzogna"),
    "continence": one("de-continentia", "De continentia", "continenza"),
    "creed": one("de-symbolo-ad-catechumenos", "De symbolo ad catechumenos", "simbolo_catecumeni"),
    "enchiridion": one("enchiridion", "Enchiridion ad Laurentium de fide, spe et caritate", "enchiridion"),
    "faith-and-the-creed": one("de-fide-et-symbolo", "De fide et symbolo", "fede_simbolo"),
    "good-of-marriage": one("de-bono-coniugali", "De bono coniugali", "dignita_matrimonio"),
    "good-of-widowhood": one("de-bono-viduitatis", "De bono viduitatis", "dignita_vedovile"),
    "grace-and-free-will": one("de-gratia-et-libero-arbitrio", "De gratia et libero arbitrio", "grazia_libero_arbitrio"),
    "holy-virginity": one("de-sancta-virginitate", "De sancta virginitate", "santa_verginita"),
    "lying": one("de-mendacio", "De mendacio", "menzogna"),
    "man-s-perfection-in-righteousness": one("de-perfectione-iustitiae-hominis", "De perfectione iustitiae hominis", "perfezione_giustizia"),
    "nature-and-grace": one("de-natura-et-gratia", "De natura et gratia", "natura_grazia"),
    "patience": one("de-patientia", "De patientia", "pazienza"),
    "proceedings-of-pelagius": one("de-gestis-pelagii", "De gestis Pelagii", "atti_pelagio"),
    "profit-of-believing": one("de-utilitate-credendi", "De utilitate credendi", "utilita_credere"),
    "rebuke-and-grace": one("de-correptione-et-gratia", "De correptione et gratia", "correzione_grazia"),
    "spirit-and-the-letter": one("de-spiritu-et-littera", "De spiritu et littera", "spirito_lettera"),
    "two-souls-against-the-manichaeans": one("de-duabus-animabus", "De duabus animabus", "due_anime"),
    "work-of-monks": one("de-opere-monachorum", "De opere monachorum", "lavoro_monaci"),
}


def apply(name, dry=False):
    spec = SPECS[name]
    bd = os.path.join(BOOKS, name)
    docs = spec["build"](bd) if spec["build"].__code__.co_argcount else spec["build"]()
    meta = json.load(open(os.path.join(bd, "book.json"), encoding="utf-8"))
    en_stems = {f[:-3] for f in os.listdir(os.path.join(bd, "en-US"))}
    miss = en_stems - set(docs)
    extra = set(docs) - en_stems
    assert not miss and not extra, (name, sorted(miss)[:5], sorted(extra)[:5])
    words = sum(len(t.split()) for t in docs.values())
    if dry:
        print(name, len(docs), "files", words, "la words")
        return words
    os.makedirs(os.path.join(bd, "la"), exist_ok=True)
    for stem, t in docs.items():
        open(os.path.join(bd, "la", stem + ".md"), "w", encoding="utf-8").write(t)
    titles = {s: re.match(r"# (.*)", t).group(1) for s, t in docs.items()}

    def walk(nodes):
        for n in nodes:
            n["title"] = {"la": titles[n["id"]], **{k: v for k, v in n["title"].items() if k != "la"}} if n["id"] in titles else n["title"]
            walk(n.get("children", []))
    walk(meta["toc"])
    meta["languages"] = ["la"] + [l for l in meta["languages"] if l != "la"]
    meta["name"] = {"la": spec["la"], **{k: v for k, v in meta["name"].items() if k != "la"}}
    meta["author"] = {"la": "Aurelius Augustinus Hipponensis (354-430)", **{k: v for k, v in meta["author"].items() if k != "la"}}
    work = meta.get("work") or "augustine/" + spec["slug"]
    meta["work"] = work
    ed = meta.get("editions", {})
    en = next((s for s in meta["sources"] if s["language"] == "en-US"), {})
    desc = en.get("description", "")
    tr = re.search(r"Translated by ([^.]*(?:\. [A-Z]\.[^.]*)*?)[.]? (?:From|Edited|Revised)", desc) or re.search(r"Translated by ([^.]+)", desc)
    yr = re.search(r"(18\d\d)\b(?!.*18\d\d)", desc)
    ed_new = {"la": {"editor": "Maurists (Benedictines of Saint-Maur), Migne PL", "year": 1841}}
    for l in meta["languages"]:
        if l == "la":
            continue
        if l in ed:
            ed_new[l] = ed[l]
        elif l == "pt-BR":
            ed_new[l] = {"translator": "Ember", "year": 2026, "from": "en-US"}
        else:
            ed_new[l] = {"translator": tr.group(1).strip() if tr else "?", "year": int(yr.group(1)) if yr else 0}
    meta["editions"] = ed_new
    dirs = spec["dir"].split("+")
    meta["sources"] = [{
        "language": "la",
        "url": "https://www.augustinus.it/latino/" + dirs[0] + "/index.htm",
        "edition": "Maurist text (Benedictines of Saint-Maur, 1679-1700) as printed in Migne, Patrologia Latina, on augustinus.it (Corpus Augustinianum Gissense / NBA Latin pages)",
        "description": "Latin pages " + ", ".join(dirs) + " of augustinus.it, one page per book/letter/sermon, split to the same chapter files as the English. The Italian NBA headings, summaries and biblical-reference notes are dropped; section numbers and italicised quotations are kept. Raw mirror in research/sourcing/augustine-latin/raw.",
        "tier": "A",
        "tierEvidence": "Text of a 4th-5th-century work in the Maurist edition (1679-1700, Migne 1841-49), long public domain.",
    }] + [x for x in meta["sources"] if x["language"] != "la"]
    meta.setdefault("arrived", {})["la"] = "2026-11-02"
    json.dump(meta, open(os.path.join(bd, "book.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(bd, "book.json"), "a").write("\n")
    print(name, len(docs), "files", words, "la words", ed_new)
    return words


if __name__ == "__main__":
    dry = "--dry" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    for n in (list(SPECS) if names == ["all"] else names):
        apply(n, dry)
