"""Build Latin-only Augustine books from the augustinus.it mirror (works with no English in the corpus).

usage: python3.13 -I aug_new.py <slug>|all [--dry]
Reuses aug_la / aug_build.text_paras. Big pages are split at chapter boundaries into ~7k-word files.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import aug_la as A
import aug_build as B

BOOKS = B.BOOKS
R = B.roman
LIB = lambda n: f"Liber {R(n)}"
CHUNK = 7500
SPLIT_OVER = 13000


def chunk_title(base, ps, label):
    ks = [B.anch(p) for p in ps if B.anch(p)]
    ks = [k[1] for k in ks if k[1]]
    if not ks:
        return base
    a, b = min(ks), max(ks)
    return f"{base}, {label} {a}" if a == b else f"{base}, {label} {a}–{b}"


def split_page(base, ps, label):
    words = sum(len(p["text"].split()) for p in ps)
    if words <= SPLIT_OVER:
        return [(base, ps)]
    chunks, cur, cw, lastk = [], [], 0, None
    for p in ps:
        a = B.anch(p)
        k = a[1] if a else lastk
        if cur and cw >= CHUNK and k != lastk:
            chunks.append(cur); cur, cw = [], 0
        cur.append(p); cw += len(p["text"].split()); lastk = k
    if cur:
        if chunks and cw < CHUNK / 3:
            chunks[-1] += cur
        else:
            chunks.append(cur)
    return [(chunk_title(base, c, label), c) for c in chunks]


def build(spec):
    d = spec["dir"]
    pages = spec.get("order") or A.pages(d)
    titles = spec.get("titles") or ([None] if len(pages) == 1 else [LIB(i + 1) for i in range(len(pages))])
    assert len(titles) == len(pages), (d, len(pages), len(titles))
    label = spec.get("label", "Capita")
    out = []
    for pg, t in zip(pages, titles):
        t = t or spec["la"]
        if spec.get("allp"):
            ps = [dict(p, text=B.fmt(p["text"])) for p in A.paras(os.path.join(A.RAW, d, pg)) if p["kind"] == "P"]
        else:
            ps = B.text_paras(d, pg)
        assert ps, (d, pg)
        out += split_page(t, ps, label)
    return [(f"ch{i + 1:03d}", t, B.doc(t, ps)) for i, (t, ps) in enumerate(out)]


def S(dir, slug, la, en, pt, composed, **kw):
    return dict(dir=dir, slug=slug, la=la, en=en, pt=pt, composed=composed, **kw)


SPECS = [
    S("contr_acc", "contra-academicos", "Contra Academicos", "Against the Academics", "Contra os Acadêmicos", "386"),
    S("felicita", "de-beata-vita", "De beata vita", "On the Happy Life", "A vida feliz", "386"),
    S("ordine", "de-ordine", "De ordine", "On Order", "A ordem", "386"),
    S("immortalita_anima", "de-immortalitate-animae", "De immortalitate animae", "On the Immortality of the Soul", "A imortalidade da alma", "387"),
    S("grandezza_anima", "de-quantitate-animae", "De quantitate animae", "On the Greatness of the Soul", "A grandeza da alma", "387-388"),
    S("maestro", "de-magistro", "De magistro", "On the Teacher", "O mestre", "389"),
    S("libero_arbitrio", "de-libero-arbitrio", "De libero arbitrio", "On Free Choice of the Will", "O livre-arbítrio", "388-395"),
    S("vera_religione", "de-vera-religione", "De vera religione", "On True Religion", "A verdadeira religião", "390"),
    S("musica", "de-musica", "De musica", "On Music", "A música", "387-391"),
    S("genesi_dcm", "de-genesi-contra-manichaeos", "De Genesi contra Manichaeos", "On Genesis, against the Manichaeans", "Sobre o Gênesis, contra os maniqueus", "388-390"),
    S("genesi_incompiuto", "de-genesi-ad-litteram-imperfectus-liber", "De Genesi ad litteram imperfectus liber", "Unfinished Literal Commentary on Genesis", "Comentário literal ao Gênesis, inacabado", "393-394"),
    S("genesi_lettera", "de-genesi-ad-litteram", "De Genesi ad litteram libri duodecim", "The Literal Meaning of Genesis", "O sentido literal do Gênesis", "401-415"),
    S("ritrattazioni", "retractationes", "Retractationes", "Retractations", "Retratações", "426-427", titles=["Prologus", "Liber I", "Liber II"]),
    S("contro_giuliano", "contra-iulianum", "Contra Iulianum libri sex", "Against Julian", "Contra Juliano", "421-422", titles=["Epistula ad Claudium"] + [LIB(i) for i in range(1, 7)]),
    S("incompiuta_giuliano", "contra-iulianum-opus-imperfectum", "Contra secundam Iuliani responsionem imperfectum opus", "Unfinished Work against Julian", "Obra inacabada contra Juliano", "429-430", titles=["Praefatio"] + [LIB(i) for i in range(1, 7)]),
    S("grammatica", "de-grammatica", "De grammatica (Ars breviata)", "On Grammar (the Short Art) [doubtful]", "Gramática (Arte breve) [duvidoso]", "ca. 387"),
    S("regole", "de-grammatica-regulae", "Regulae de grammatica", "Rules of Grammar [spurious]", "Regras de gramática [espúrio]", "uncertain"),
    S("dialettica", "de-dialectica", "De dialectica", "On Dialectic", "A dialética", "ca. 387"),
    S("retorica", "de-rhetorica", "De rhetorica", "On Rhetoric [doubtful]", "A retórica [duvidoso]", "uncertain"),
    S("salmo_contro_donato", "psalmus-contra-partem-donati", "Psalmus contra partem Donati", "Psalm against the Donatist Party", "Salmo contra o partido de Donato", "393"),
    S("contro_adimanto", "contra-adimantum", "Contra Adimantum Manichaei discipulum", "Against Adimantus", "Contra Adimanto", "394"),
    S("esposizione_romani", "expositio-quarundam-propositionum-ex-epistula-ad-romanos", "Expositio quarundam propositionum ex epistula ad Romanos", "Exposition of Certain Propositions from the Epistle to the Romans", "Exposição de algumas proposições da Carta aos Romanos", "394"),
    S("esposizione_galati", "expositio-epistulae-ad-galatas", "Expositio epistulae ad Galatas", "Exposition of the Epistle to the Galatians", "Exposição da Carta aos Gálatas", "394-395"),
    S("incompleta_romani", "epistulae-ad-romanos-inchoata-expositio", "Epistulae ad Romanos inchoata expositio", "Unfinished Exposition of the Epistle to the Romans", "Exposição inacabada da Carta aos Romanos", "394-395"),
    S("ottantatre_questioni", "de-diversis-quaestionibus-octoginta-tribus", "De diversis quaestionibus octoginta tribus", "Eighty-Three Different Questions", "Oitenta e três questões diversas", "388-396", label="Quaestiones"),
    S("questioni_simpliciano", "ad-simplicianum", "De diversis quaestionibus ad Simplicianum", "To Simplician: On Various Questions", "A Simpliciano: questões diversas", "396-397"),
    S("contro_felice", "contra-felicem", "Contra Felicem Manichaeum", "Against Felix the Manichaean", "Contra Félix, o maniqueu", "404"),
    S("contro_secondino", "contra-secundinum", "Contra Secundinum Manichaeum", "Against Secundinus the Manichaean", "Contra Secundino, o maniqueu", "399", titles=["Secundini epistula ad Augustinum", "Contra Secundinum"]),
    S("questioni_vangeli", "quaestiones-evangeliorum", "Quaestionum evangeliorum libri duo", "Questions on the Gospels", "Questões sobre os Evangelhos", "399-400", titles=["Praefatio", "Liber I", "Liber II"], label="Quaestiones"),
    S("annotazioni_giobbe", "adnotationes-in-iob", "Adnotationes in Iob", "Notes on Job", "Anotações sobre Jó", "399"),
    S("contro_parmeniano", "contra-epistulam-parmeniani", "Contra epistulam Parmeniani", "Against the Letter of Parmenian", "Contra a carta de Parmeniano", "400"),
    S("contro_cresconio", "contra-cresconium", "Contra Cresconium grammaticum partis Donati", "Against Cresconius", "Contra Crescônio", "405-406"),
    S("potere_divinatorio", "de-divinatione-daemonum", "De divinatione daemonum", "On the Divination of Demons", "A adivinhação dos demônios", "406-411"),
    S("unicita_battesimo", "de-unico-baptismo", "De unico baptismo contra Petilianum", "On the One Baptism, against Petilian", "O batismo único, contra Petiliano", "410"),
    S("fede_opere", "de-fide-et-operibus", "De fide et operibus", "On Faith and Works", "A fé e as obras", "413"),
    S("agone_cristiano", "de-agone-christiano", "De agone christiano", "On the Christian Struggle", "O combate cristão", "396"),
    S("sommario_conferenza", "breviculus-collationis-cum-donatistis", "Breviculus collationis cum Donatistis", "Summary of the Conference with the Donatists", "Sumário da conferência com os donatistas", "411-412"),
    S("donatisti_dopo_conf", "contra-donatistas-post-collationem", "Contra Donatistas post collationem", "To the Donatists after the Conference", "Aos donatistas depois da conferência", "412"),
    S("orosio", "ad-orosium-contra-priscillianistas-et-origenistas", "Ad Orosium contra Priscillianistas et Origenistas", "To Orosius, against the Priscillianists and Origenists", "A Orósio, contra os priscilianistas e origenistas", "415", titles=["Commonitorium Orosii", "Liber ad Orosium"]),
    S("confronto_emerito", "gesta-cum-emerito", "Gesta cum Emerito Donatistarum episcopo", "Proceedings with Emeritus, Donatist Bishop", "Atas com Emérito, bispo donatista", "418"),
    S("discorso_cesarea", "sermo-ad-caesareensis-ecclesiae-plebem", "Sermo ad Caesareensis ecclesiae plebem", "Sermon to the People of the Church of Caesarea", "Sermão ao povo da Igreja de Cesareia", "418"),
    S("contro_sermone_ariani", "contra-sermonem-arrianorum", "Contra sermonem Arrianorum", "Against the Arian Sermon", "Contra o sermão dos arianos", "419-420", order=["sermone_ariani_libro.htm", "repl_sermone_ariani_libro.htm"], titles=["Sermo Arrianorum", "Contra sermonem Arrianorum"]),
    S("locuzioni_ettateuco", "locutiones-in-heptateuchum", "Locutionum in Heptateuchum libri septem", "Idioms of the Heptateuch", "Locuções do Heptateuco", "419", order=[f"locuz_ettateuco_{i}_libro.htm" for i in range(1, 8)], label="Locutiones",
      titles=[f"Liber {R(i)} ({n})" for i, n in enumerate(["Genesis", "Exodus", "Leviticus", "Numeri", "Deuteronomium", "Iesus Nave", "Iudicum"], 1)]),
    S("questioni_ettateuco", "quaestiones-in-heptateuchum", "Quaestionum in Heptateuchum libri septem", "Questions on the Heptateuch", "Questões sobre o Heptateuco", "419", order=[f"quest_ettateuco_{i}_libro.htm" for i in range(1, 8)], label="Quaestiones",
      titles=[f"Liber {R(i)} ({n})" for i, n in enumerate(["Genesis", "Exodus", "Leviticus", "Numeri", "Deuteronomium", "Iesus Nave", "Iudicum"], 1)]),
    S("connubi_adulterini", "de-adulterinis-coniugiis", "De adulterinis coniugiis", "On Adulterous Marriages", "Os casamentos adulterinos", "419-420"),
    S("contro_avversario", "contra-adversarium-legis-et-prophetarum", "Contra adversarium legis et prophetarum", "Against the Adversary of the Law and the Prophets", "Contra o adversário da Lei e dos Profetas", "420"),
    S("contro_gaudenzio", "contra-gaudentium", "Contra Gaudentium Donatistarum episcopum", "Against Gaudentius, Donatist Bishop", "Contra Gaudêncio, bispo donatista", "420-421"),
    S("questioni_dulcizio", "de-octo-dulcitii-quaestionibus", "De octo Dulcitii quaestionibus", "Eight Questions of Dulcitius", "As oito questões de Dulcício", "422-425", label="Quaestiones"),
    S("eresie", "de-haeresibus", "De haeresibus ad Quodvultdeum", "On Heresies", "As heresias", "428", order=["eresie_prefazione_libro.htm", "eresie_libro.htm", "eresie_epilogo_libro.htm"], titles=["Praefatio", "De haeresibus", "Epilogus"], label="Haeresis"),
    S("conferenza_massimino", "collatio-cum-maximino", "Collatio cum Maximino Arianorum episcopo", "Conference with Maximinus, Arian Bishop", "Conferência com Maximino, bispo ariano", "427-428"),
    S("contro_massimino", "contra-maximinum", "Contra Maximinum Arianum", "Against Maximinus the Arian", "Contra Maximino, o ariano", "428"),
    S("speculum", "speculum", "Speculum (De scriptura sacra) [doubtful]", "The Mirror (On Sacred Scripture) [doubtful]", "O Espelho (Sobre a Sagrada Escritura) [duvidoso]", "uncertain"),
    S("disciplina_cristiana", "de-disciplina-christiana", "De disciplina christiana", "On Christian Discipline", "A disciplina cristã", "ca. 396"),
    S("utilita_digiuno", "de-utilitate-ieiunii", "De utilitate ieiunii", "On the Usefulness of Fasting", "A utilidade do jejum", "uncertain"),
    S("rovina_roma", "de-excidio-urbis-romae", "De excidio urbis Romae", "On the Sack of the City of Rome", "A destruição da cidade de Roma", "410"),
    S("contro_giudei", "adversus-iudaeos", "Tractatus adversus Iudaeos", "Treatise against the Jews", "Tratado contra os judeus", "428-429"),
    S("lettera_cattolici", "epistula-ad-catholicos-de-secta-donatistarum", "Epistula ad catholicos de secta Donatistarum (De unitate ecclesiae) [doubtful]", "Letter to the Catholics against the Donatist Sect (On the Unity of the Church) [doubtful]", "Carta aos católicos sobre a seita donatista (A unidade da Igreja) [duvidoso]", "ca. 402"),
    S("regola", "regula", "Regula (Praeceptum)", "The Rule", "A Regra", "ca. 397"),
    S("questioni_matteo", "quaestiones-xvii-in-matthaeum", "Quaestiones XVII in Matthaeum [doubtful]", "Seventeen Questions on Matthew [doubtful]", "Dezessete questões sobre Mateus [duvidoso]", "uncertain", label="Quaestiones"),
    S("questioni_at", "de-octo-quaestionibus-ex-veteri-testamento", "De octo quaestionibus ex Veteri Testamento [doubtful]", "Eight Questions from the Old Testament [doubtful]", "Oito questões do Antigo Testamento [duvidoso]", "uncertain", label="Quaestiones"),
    S("gesta_collationis", "gesta-collationis-carthaginiensis", "Gesta collationis Carthaginiensis (411)", "Acts of the Conference of Carthage (411)", "Atas da Conferência de Cartago (411)", "411", titles=["Capitula et praefatio Marcellini", "Cognitio prima", "Cognitio secunda", "Cognitio tertia"], label="Capita", allp=True),
]


def write(spec, dry=False, ch=None):
    ch = ch or build(spec)
    words = sum(len(t.split()) for _, _, t in ch)
    if dry:
        print(spec["slug"], len(ch), "files", words, "words")
        return
    bd = os.path.join(BOOKS, spec["slug"])
    os.makedirs(os.path.join(bd, "la"), exist_ok=True)
    for stem, _, t in ch:
        open(os.path.join(bd, "la", stem + ".md"), "w", encoding="utf-8").write(t)
    la, en, pt, comp = spec["la"], spec["en"], spec["pt"], spec["composed"]
    when = "" if comp == "uncertain" else f" ({comp})"
    meta = {
        "id": "augustine-" + spec["slug"],
        "cover": "quarter",
        "name": {"la": la, "en-US": en, "pt-BR": pt},
        "author": {"la": "Aurelius Augustinus Hipponensis (354-430)", "en-US": "Augustine of Hippo", "pt-BR": "Agostinho de Hipona"},
        "description": spec.get("desc") or {
            "la": f"{la}. Textus Latinus secundum editionem Maurinorum.",
            "en-US": f"{en}{when}, by St. Augustine of Hippo. Latin text of the Maurist edition; no public-domain English translation has been imported yet.",
            "pt-BR": f"{pt}{when}, de Santo Agostinho de Hipona. Texto latino da edição dos Maurinos.",
        },
        "composed": comp if comp != "uncertain" else "date uncertain",
        "languages": ["la"],
        "work": spec.get("work", "augustine/" + spec["slug"]),
        "editions": {"la": {"editor": "Maurists (Benedictines of Saint-Maur), Migne PL", "year": 1841}},
        "sources": [{
            "language": "la",
            "url": "https://www.augustinus.it/latino/" + spec["dir"] + "/index.htm",
            "edition": "Maurist text (Benedictines of Saint-Maur, 1679-1700) as printed in Migne, Patrologia Latina, on augustinus.it (Corpus Augustinianum Gissense / NBA Latin pages)",
            "description": "Latin pages " + spec["dir"] + " of augustinus.it, one page per book, long pages split at chapter boundaries. The Italian NBA headings, summaries and biblical-reference notes are dropped; section numbers and italicised quotations are kept. Raw mirror in research/sourcing/augustine-latin/raw.",
            "tier": "A",
            "tierEvidence": "Text of a 4th-5th-century work in the Maurist edition (1679-1700, Migne 1841-49), long public domain.",
        }],
        "toc": [{"id": s, "title": {"la": t}} for s, t, _ in ch],
        "arrived": {"la": "2026-11-02"},
    }
    json.dump(meta, open(os.path.join(bd, "book.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(bd, "book.json"), "a").write("\n")
    print(spec["slug"], len(ch), "files", words, "words")


if __name__ == "__main__":
    dry = "--dry" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    for s in SPECS:
        if names == ["all"] or s["slug"] in names:
            write(s, dry)
