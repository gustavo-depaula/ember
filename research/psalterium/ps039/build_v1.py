"""Ps 39 draft 1. python3.13 research/psalterium/ps039/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {"label": label, "forms": forms, "note": note, "from": source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({"id": id, "refs": refs, "latin": latin, "kind": kind, "why": why, "options": list(options)})


verses = {
    "39:2": "{exspectans} o Senhor, * e ele {intendit}.",
    "39:3": "E escutou as minhas preces: * e {eduxit} da {lacu} da miséria, e {faecis}.",
    "39:3b": "E {statuit} os meus pés sobre {petra}: * e dirigiu os meus passos.",
    "39:4": "E pôs na minha boca um cântico novo, * {carmen} ao nosso Deus.",
    "39:4b": "Muitos verão, e temerão: * e esperarão no Senhor.",
    "39:5": "Bem-aventurado o homem cuja esperança é o nome do Senhor: * e que não {respexit} as vaidades e as {insanias}.",
    "39:6": "{multa}, Senhor, meu Deus, as vossas maravilhas: * e {cogitationibus} não há quem vos seja semelhante.",
    "39:6b": "Anunciei e falei: * multiplicaram-se {supernumerum}.",
    "39:7": "{noluisti}: * mas me {perfecisti} os ouvidos.",
    "39:7b": "Não pedistes holocausto {propeccato}: * então eu disse: Eis que venho.",
    "39:8": "{caput} está escrito {deme} que eu {facerem} a vossa vontade: * meu Deus, {volui} no meio do meu coração.",
    "39:10": "Anunciei a vossa justiça na grande assembleia, * eis que não {prohibebo} os meus lábios: Senhor, vós o sabeis.",
    "39:11": "Não escondi a vossa justiça no meu coração: * {dixi}.",
    "39:11b": "Não escondi a vossa misericórdia e a vossa verdade * {concilio}.",
    "39:12": "Vós, porém, Senhor, {longe} de mim as vossas {miserationes}: * a vossa misericórdia e a vossa verdade sempre me ampararam.",
    "39:13": "Porque me cercaram males {numerus}: * prenderam-me as minhas iniquidades, e não pude ver.",
    "39:13b": "Multiplicaram-se mais que os cabelos da minha cabeça: * e o meu coração me abandonou.",
    "39:14": "{complaceat}, Senhor, {eruas}: * Senhor, {respice}.",
    "39:15": "Sejam envergonhados e {revereantur15} {simul} os que buscam a minha alma, * {auferant}.",
    "39:15b": "{retrorsum}, e sejam {revereantur15b}, * os que me {mala}.",
    "39:16": "{ferant} a sua vergonha, * os que me dizem: {euge}.",
    "39:17": "Exultem e alegrem-se {superte} todos os que vos buscam: * {diligunt}.",
    "39:18": "Eu, porém, sou mendigo e pobre: * o Senhor {sollicitus}.",
    "39:18b": "Vós sois {adjutor} e o meu protetor: * meu Deus, não tardeis.",
}

dec("exspectans", ["39:2"], "Exspéctans exspectávi Dóminum", "glossary",
    "Participle + finite verb of one root (ὑπομένων ὑπέμεινα; the Hebrew infinitive absolute behind it). exspectáre → aguardar (D24, D36, D39), apart from speráre → esperar em (39:4b has it) and sustinére → esperar por. The glossary row *participle + finite verb* gives gerund + verb (117:11 *Cercando-me, eles me cercaram*; 117:18 *Castigando, castigou-me o Senhor*): the repetition is never dropped (rule 2). Matos Soares 1932 *Aguardei com ânsia* turns the doubling into an adverb — refused by the same row. The verse opens the gradual of Pent15-0 and Quad4-2 (missa, grep), with other words after it (*et respéxit me … hymnum Deo nostro*).",
    o("Aguardando, aguardei", {"exspectans": "Aguardando, aguardei"}, "Ruling: the row (gerund + verb), D39's verb twice.", "glossary"),
    o("Aguardei, aguardei", {"exspectans": "Aguardei, aguardei"}, "The doubled finite verb (the row's other option, as the Diurnal doubles *castigou-me*); loses the participle.", "draft"),
    o("Aguardei com ânsia", {"exspectans": "Aguardei com ânsia"}, "Matos Soares 1932; the root once, an adverb for the second.", "MS1932"))

dec("intendit", ["39:2"], "et inténdit mihi", "glossary",
    "inténdere → atender (D3), kept parallel to exaudíre → escutar, which follows at once (39:3 *Et exaudívit preces meas*) — the pair D3 was made for. The Greek is προσέσχεν μοι, and the same Greek verb stands behind 39:14 *réspice* (πρόσχες): the Latin varies it, so the Portuguese follows the Latin (*atendeu … olhai*). The cost D3 named: *me atendeu* is heard first as 'granted my request'. *ele* named: the subject is the Lord, and without it the colon could be heard with *o Senhor* as object and a new unnamed subject.",
    o("me atendeu", {"intendit": "me atendeu"}, "Ruling: D3.", "glossary"),
    o("me deu atenção", {"intendit": "me deu atenção"}, "The attention made explicit; a noun supplied.", "draft"))

dec("eduxit", ["39:3"], "et edúxit me de lacu misériæ", "glossary",
    "edúcere with a source named: the row (*fazer sair*, open) foresees *tirar de* for its lines with *de*, and names 39:3; 29:4 *eduxísti ab inférno* → *tirastes do inferno*, 30:5 *Edúces me de láqueo* → *Vós me tirareis deste laço*. lacus → cova (row, open; *os que descem à cova*, 27:1, 29:4): the pit, not a lake (λάκκου). The Greek ἀνήγαγεν is 'brought up'; the Latin says 'led out', and *tirar* is its plain Portuguese. auferre (39:15) also takes *tirar* (9:26b, 118:22, 118:43) — twelve verses apart, another sense (taking away a life); accepted.",
    o("me tirou … cova", {"eduxit": "me tirou", "lacu": "cova"}, "Ruling: the row's *tirar de*; Matos Soares 1932 *tirou-me*.", "glossary"),
    o("me fez sair … cova", {"eduxit": "me fez sair", "lacu": "cova"}, "The row's own verb (17:20).", "glossary"),
    o("me fez subir … cova", {"eduxit": "me fez subir", "lacu": "cova"}, "The Greek's direction (ἀνήγαγεν); not the Latin's verb.", "draft"))

dec("faecis", ["39:3"], "et de luto fæcis", "word",
    "lutum → lama (17:43 *como a lama das ruas*). fæx is the sediment at the bottom of a liquid, the dregs (Lewis & Short: 'grounds, sediment, lees, dregs of liquids'; Lucretius' *limus subsedit funditus ut faex*); the Greek ἀπὸ πηλοῦ ἰλύος is 'mud of slime'. *lodo* is exactly the sediment at the bottom of water, so it keeps both nouns and the concrete image (rule 5) without the kitchen sense of *borra* (coffee grounds) or the medical sense of the cognate *fezes*. Douay-Rheims 'the mire of dregs' keeps both; Matos Soares 1932 *do lodo profundo* turns the second noun into an adjective.",
    o("da lama do lodo", {"faecis": "da lama do lodo"}, "Ruling: two concrete nouns, as the Latin and the Greek.", "draft"),
    o("da lama da borra", {"faecis": "da lama da borra"}, "fæx word for word (dregs); heard from the coffee cup.", "DRB"),
    o("do lodo profundo", {"faecis": "do lodo profundo"}, "Matos Soares 1932; one noun, an adjective for the second.", "MS1932"))

dec("statuit", ["39:3b"], "Et státuit super petram pedes meos", "glossary",
    "statúere → firmar (row, open, which names 39:3; 17:34 *sobre as alturas me firmando*, 24:12 *ele lhe firmou uma lei*). petra → rocha, indefinite as the Latin has no article (row, open; 26:6 *Sobre uma rocha me exaltou*); *pedra* is lapis's. Natural order puts the object before the place. Matos Soares 1932 *pôs os meus pés sobre pedra* uses pónere's verb and lapis's noun.",
    o("firmou … uma rocha", {"statuit": "firmou", "petra": "uma rocha"}, "Ruling: the two rows.", "glossary"),
    o("pôs … uma rocha", {"statuit": "pôs", "petra": "uma rocha"}, "The plainer verb; it is pónere's (and 39:4 *immísit* → *pôs* in the next verse).", "MS1932"),
    o("firmou … a rocha", {"statuit": "firmou", "petra": "a rocha"}, "The article supplied (DRB 'a rock').", "draft"))

dec("carmen", ["39:4"], "cánticum novum, * carmen Deo nostro", "word",
    "carmen is in the psalter only here (grep). The Greek has ὕμνον, and the graduals that adapt this verse (Pent15-0, Quad4-2) say *hymnum Deo nostro* — but the psalm's Latin is *carmen*, and *hino* is hymnus's word (118:171). *canto* is carmen's plain Portuguese and keeps it one step from *cântico* (cánticum), as the Latin keeps two words.",
    o("um canto", {"carmen": "um canto"}, "Ruling.", "draft"),
    o("um hino", {"carmen": "um hino"}, "Matos Soares 1932, the Greek and the graduals; hymnus's word.", "MS1932"),
    o("uma canção", {"carmen": "uma canção"}, "Plainer; lighter than the verse.", "draft"))

dec("respexit", ["39:5"], "et non respéxit in vanitátes et insánias falsas", "grammar",
    "respícere in + accusative, here a man looking to something for help or regard (ἐνέβλεψεν εἰς). The imperative *réspice* has been *olhai* (12:3, 21:2, 24:16); the finite verb takes the same *olhar para*. The Latin changes build mid-sentence (the relative *cujus* then a main verb *et non respéxit*, both of *vir*); Portuguese keeps the relative going with *e que* so that the subject stays the man (Douay-Rheims 'and who hath not', Matos Soares 1932 *e que não*) — grammar, D2.",
    o("olhou para", {"respexit": "olhou para"}, "Ruling.", "draft"),
    o("voltou os olhos para", {"respexit": "voltou os olhos para"}, "Matos Soares 1932; the eyes supplied.", "MS1932"))

dec("insanias", ["39:5"], "vanitátes et insánias falsas", "word",
    "insánia (only here; μανίας ψευδεῖς) → *loucura*, the plain noun of *insánus*. falsus → *falso*, the cognate; Douay-Rheims 'lying follies', Matos Soares 1932 *loucuras enganosas*. *enganoso* is kept for dolósus (5:7b *enganador*), *mentiroso* would echo mendácium → mentira. vánitas → vaidade (row), which three blind readers have heard as conceit first; *coisas vãs* stays that row's option.",
    o("loucuras falsas", {"insanias": "loucuras falsas"}, "Ruling: the cognates.", "draft"),
    o("loucuras mentirosas", {"insanias": "loucuras mentirosas"}, "Douay-Rheims 'lying'; near mendácium.", "DRB"),
    o("loucuras enganosas", {"insanias": "loucuras enganosas"}, "Matos Soares 1932; near dolus.", "MS1932"))

dec("multa", ["39:6"], "Multa fecísti tu, Dómine, Deus meus, mirabília tua", "order",
    "The Latin sets *multa* (neuter plural) first and *mirabília tua* in apposition at the end, with *tu* written. Portuguese needs a noun for the neuter plural (as 2:1 inánia → *coisas vãs*) and keeps the apposition; the subject named (*vós*) carries the written *tu*. Natural order (rule 5: no inversion for its own sake). The build *Muitas são as maravilhas que fizestes* (the copula as in 33:20, 118:156) turns the verb into a relative clause and drops the apposition.",
    o("Vós fizestes muitas coisas", {"multa": "Vós fizestes muitas coisas"}, "Ruling.", "draft"),
    o("Muitas coisas fizestes vós", {"multa": "Muitas coisas fizestes vós"}, "The Latin's order; *multa* fronted.", "draft"),
    o("Muitas são as maravilhas que fizestes", {"multa": "Muitas são as maravilhas que fizestes"}, "Plainest; the apposition dissolved (then *as vossas maravilhas* must go).", "draft"))

dec("cogitationibus", ["39:6"], "et cogitatiónibus tuis non est qui símilis sit tibi", "ambiguity",
    "The bare ablative/dative (τοῖς διαλογισμοῖς σου) leaves open whether no one is like God *in* his thoughts, or no one is comparable *to* his thoughts. Douay-Rheims 'in thy thoughts', Matos Soares 1932 *nos teus desígnios*. *nos vossos pensamentos* keeps the first reading without closing the second. cogitátio → pensamento (row; it names 39:6).",
    o("nos vossos pensamentos", {"cogitationibus": "nos vossos pensamentos"}, "Ruling.", "DRB"),
    o("nos vossos desígnios", {"cogitationibus": "nos vossos desígnios"}, "Matos Soares 1932; consílium's word (D33).", "MS1932"))

dec("supernumerum", ["39:6b"], "multiplicáti sunt super númerum", "word",
    "super of comparison is *mais que* (row; 39:13b *mais que os cabelos*), but *mais que o número* is not Portuguese. *além de todo número* is the Portuguese phrase for 'past counting' and keeps the noun; *todo* is what the idiom needs. *sem número* is plainer but gives up *super*. The subject of *multiplicáti sunt* is left unnamed, as in the Latin (the wonders? the thoughts?).",
    o("além de todo número", {"supernumerum": "além de todo número"}, "Ruling.", "draft"),
    o("sem número", {"supernumerum": "sem número"}, "The plain idiom; the preposition lost.", "draft"),
    o("acima de todo número", {"supernumerum": "acima de todo número"}, "super as place.", "draft"))

dec("noluisti", ["39:7"], "Sacrifícium et oblatiónem noluísti", "order",
    "Heb 10:5 quotes this verse in another Latin (Clementine, fetched to consult/bolls-VULG-58-10.json: *Hostiam et oblationem noluisti: corpus autem aptasti mihi*); the psalm keeps its own words, *sacrifícium* and *aures … perfecísti* (the LXX here has ὠτία δὲ κατηρτίσω μοι). oblátio (2 lines: 39:7, 50:21) → *oferenda*, the plain word (Matos Soares 1932); *oblação* is the liturgical cognate and churchgoers meet it rarely. Under a negative Portuguese joins two objects with *nem*, and the verb goes first — grammar and order (D2); Matos Soares 1932 has these words.",
    o("Não quisestes sacrifício nem oferenda", {"noluisti": "Não quisestes sacrifício nem oferenda"}, "Ruling.", "MS1932"),
    o("Sacrifício e oferenda não quisestes", {"noluisti": "Sacrifício e oferenda não quisestes"}, "The Latin's order and conjunction.", "draft"),
    o("Não quisestes sacrifício nem oblação", {"noluisti": "Não quisestes sacrifício nem oblação"}, "The cognate.", "draft"))

dec("perfecisti", ["39:7"], "aures autem perfecísti mihi", "glossary",
    "perfícere → aperfeiçoar (row, open; tried on this very verse). The Latin's ears, not Heb 10:5's body and not the Hebrew's 'dug'. The dative *mihi* as a clitic of possession (*me … os ouvidos*).",
    o("aperfeiçoastes", {"perfecisti": "aperfeiçoastes"}, "Ruling: the row.", "glossary"),
    o("fizestes perfeitos", {"perfecisti": "destes perfeitos"}, "Matos Soares 1932 *deste-me ouvidos perfeitos*.", "MS1932"))

dec("propeccato", ["39:7b"], "Holocáustum et pro peccáto non postulásti", "grammar",
    "*pro peccáto* is elliptic for the sin offering (περὶ ἁμαρτίας; Douay-Rheims 'sin offering'). Portuguese cannot say 'and for sin' as an object; a noun is supplied (grammar). *oferta* is the plainest; *sacrifício* would sound like sacrifícium of 39:7 repeated. Matos Soares 1932 *holocausto pelo pecado* merges the two offerings into one — refused. holocáustum → holocausto (row). postuláre → pedir (row).",
    o("nem oferta pelo pecado", {"propeccato": "nem oferta pelo pecado"}, "Ruling.", "DRB"),
    o("nem sacrifício pelo pecado", {"propeccato": "nem sacrifício pelo pecado"}, "Echoes 39:7's *sacrifício*.", "draft"),
    o("nem pelo pecado", {"propeccato": "nem pelo pecado"}, "The Latin's ellipsis; heard as 'nor for the sin'.", "draft"))

dec("caput", ["39:8"], "In cápite libri scriptum est de me", "word",
    "caput libri (κεφαλίδι βιβλίου): the head of the book — its beginning or top (Lewis & Short: of inanimate things 'the head, top, … beginning or end'). The concrete word stays (rule 5; the row *caput ánguli* keeps *cabeça do ângulo*). Heb 10:7 has the same words (*in capite libri scriptum est de me*, Clementine, fetched), and the Epi1-0 gradual verse. Matos Soares 1932 *na cabeceira do livro*; *No princípio do livro* explains.",
    o("Na cabeça do livro", {"caput": "Na cabeça do livro"}, "Ruling.", "DRB"),
    o("No princípio do livro", {"caput": "No princípio do livro"}, "The sense, explained.", "draft"),
    o("Na cabeceira do livro", {"caput": "Na cabeceira do livro"}, "Matos Soares 1932.", "MS1932"))

dec("deme", ["39:8"], "scriptum est de me ut fácerem voluntátem tuam", "grammar",
    "*de me* is 'about me' (περὶ ἐμοῦ). *de mim* is the biblical idiom (*está escrito de mim*) and short; *a meu respeito* is the everyday one. fácerem is the imperfect subjunctive by sequence after the perfect *scriptum est*; Portuguese *está escrito* (present state) takes the present *que eu faça* — tense agreement is grammar. Heb 10:7 has *Ut faciam*.",
    o("de mim … faça", {"deme": "de mim", "facerem": "faça"}, "Ruling.", "draft"),
    o("a meu respeito … faça", {"deme": "a meu respeito", "facerem": "faça"}, "The everyday idiom; two syllables more.", "draft"),
    o("de mim … fizesse", {"deme": "de mim", "facerem": "fizesse"}, "The Latin's tense; it jars after *está escrito*.", "draft"))

dec("volui", ["39:8"], "Deus meus, vólui, et legem tuam in médio cordis mei", "ambiguity",
    "*legem tuam* is accusative: either the object of *vólui* ('I willed … your law in the midst of my heart') or of an understood verb. Douay-Rheims keeps it verbless ('I have desired it, and thy law in the midst of my heart'); Matos Soares 1932 supplies *está*, which makes the law a subject and closes the question. Portuguese has no case, so the verbless colon keeps the Latin's openness exactly: *a vossa lei* may be heard as what *eu quis*. *no meio do meu coração* (τῆς κοιλίας μου, the Greek's belly; the Latin says heart).",
    o("eu quis, e a vossa lei", {"volui": "eu quis, e a vossa lei"}, "Ruling: verbless, as the Latin.", "DRB"),
    o("eu o quis, e a vossa lei está", {"volui": "eu o quis, e a vossa lei está"}, "Matos Soares 1932; an object and a verb supplied.", "MS1932"))

dec("prohibebo", ["39:10"], "ecce, lábia mea non prohibébo", "glossary",
    "prohibére → reter (row, open, which names 39:10; 118:101 *Retive os meus pés*, 33:14 *Retém a tua língua*). The Greek is οὐ μὴ κωλύσω. *Dómine, tu scisti* → *Senhor, vós o sabeis*: the perfect of a verb of knowing has present sense; the object *o* is what Portuguese needs (Matos Soares 1932 *tu o sabes*). *in ecclésia magna* → *na grande assembleia* (D34; = 21:26, 34:18). The tract of the Commune of Popes (Commune/C4b) uses 39:10–11b; missa Sancti/09-03 has another Latin (*in cœtu magno … non cohíbui*).",
    o("reterei", {"prohibebo": "reterei"}, "Ruling: the row.", "glossary"),
    o("fecharei", {"prohibebo": "fecharei"}, "Matos Soares 1932 *não fecharei*; claúdere's.", "MS1932"))

dec("dixi", ["39:11"], "veritátem tuam et salutáre tuum dixi", "order",
    "The Latin sets both objects before *dixi*; Portuguese puts the verb first (rule 5). dícere → dizer, kept (Douay-Rheims and Matos Soares 1932 have *declared / publiquei*); the Latin's plain verb is stronger for being plain beside *annuntiávi*. salutáre → salvação (D6).",
    o("disse a vossa verdade e a vossa salvação", {"dixi": "disse a vossa verdade e a vossa salvação"}, "Ruling.", "draft"),
    o("a vossa verdade e a vossa salvação eu disse", {"dixi": "a vossa verdade e a vossa salvação eu disse"}, "The Latin's order; ends on the verb.", "draft"),
    o("proclamei a vossa verdade e a vossa salvação", {"dixi": "proclamei a vossa verdade e a vossa salvação"}, "Another verb, as DRB / MS1932.", "DRB"))

dec("concilio", ["39:11b"], "a concílio multo", "glossary",
    "concílium by its Greek (D34): here ἀπὸ συναγωγῆς πολλῆς (read in the Rahlfs text of the parallels), so *congregação*, as 21:17. D34 named this verse 'by the Ps 21 agent's reading, not yet checked' — now checked. multus → *numerosa* (Matos Soares 1932 *congregação numerosa*), not *grande*, which is magna's one verse before (*na grande assembleia*): two Latin phrases, kept two. *esconder de* for the person hidden from.",
    o("da congregação numerosa", {"concilio": "da congregação numerosa"}, "Ruling.", "glossary"),
    o("à congregação numerosa", {"concilio": "à congregação numerosa"}, "Matos Soares 1932's dative (*esconder a alguém*); avoids hearing *da congregação* as a genitive.", "MS1932"))

dec("longe", ["39:12"], "ne longe fácias miseratiónes tuas a me", "glossary",
    "The row *elongáre* (open) gives *não ponhais longe de mim o vosso auxílio* (21:20); here the Latin itself is *longe fácere*, and *pôr longe* keeps the Latin's *longe* (μὴ μακρύνῃς, the same Greek as 21:20). miseratiónes → compaixões (row, open), kept apart from misericórdia in the next colon, as 24:6 does and as the Greek does (οἰκτιρμούς / ἔλεος).",
    o("não ponhais longe … compaixões", {"longe": "não ponhais longe", "miserationes": "compaixões"}, "Ruling: the rows.", "glossary"),
    o("não afasteis … compaixões", {"longe": "não afasteis", "miserationes": "compaixões"}, "Matos Soares 1932; discédere's verb; *longe* lost.", "MS1932"))

dec("numerus", ["39:13"], "mala, quorum non est númerus", "grammar",
    "A relative of possession (*of which there is no number*). *que não têm número* (Matos Soares 1932) is the Portuguese build; *dos quais não há número* is the calque. *mala* → *males* (34:4b *males contra mim*).",
    o("que não têm número", {"numerus": "que não têm número"}, "Ruling.", "MS1932"),
    o("dos quais não há número", {"numerus": "dos quais não há número"}, "The Latin's build.", "draft"),
    o("sem número", {"numerus": "sem número"}, "Shortest; the clause dissolved.", "draft"))

dec("complaceat", ["39:14"], "Compláceat tibi, Dómine, ut éruas me", "glossary",
    "complacére → agradar (row, open). The jussive subjunctive as *Que vos agrade* — the verb kept. *Seja do vosso agrado* (Matos Soares 1932) turns it into a noun. éruere with no source named → *libertar* (the éruere row's proposal: *arrancar* with a source, *libertar* without; 30:3 *accélera ut éruas me* → *apressai-vos a libertar-me*, the same build). The Office of the Dead has this colon as a Matins antiphon with *erípias* (Commune/C9, grep), which also takes *libertar* without a source (erípere row).",
    o("Que vos agrade … libertar-me", {"complaceat": "Que vos agrade", "eruas": "libertar-me"}, "Ruling.", "glossary"),
    o("Seja do vosso agrado … libertar-me", {"complaceat": "Seja do vosso agrado", "eruas": "libertar-me"}, "Matos Soares 1932; a noun for the verb.", "MS1932"))

dec("respice", ["39:14"], "Dómine, ad adjuvándum me réspice", "glossary",
    "**This colon is the doublet of 69:2b, the response of the versicle that opens every Hour — but not word for word.** 69:2 is *Deus, in adjutórium meum inténde: * Dómine, ad adjuvándum me festína* (DO Psalm69.txt; the Hour versicle in Common/Prayers.txt, Preces.txt, and missa Ordo/Prayers.txt, all *festína*). 39:14b has *réspice* where 69:2b has *festína*, and 39:14a has no *inténde in adjutórium* at all. What the two share is *Dómine, ad adjuvándum me*: that is what this psalm fixes for Ps 69. Ruled: adjuváre → *auxiliar* (row, open; 118:86, 117 *auxiliai-me*), the family of adjutórium → auxílio and adjútor → auxílio kept whole; the gerund of purpose as *para me auxiliar*. With *festína* Ps 69 will need *apressai-vos a …* (30:3's build) — so 69:2b would read *Senhor, apressai-vos a me auxiliar* (or *a auxiliar-me*). **Relation to D40 (deferred to Gustavo, not settled here):** D40 is about the first half of 69:2 (*inténde in adjutórium meum*, *Atendei em meu auxílio* vs *Acudi em meu auxílio*). This verse does not touch *inténde* or *adjutórium*; it only commits the second half to the *auxil-* family, which is the family both of D40's candidates already use (*em meu auxílio*). If Gustavo rules the whole versicle into the *socorr-* family (*vinde em meu socorro … socorrer-me*, a wording current in Brazil — from general knowledge, unverified), this colon's option 2 follows it in one touch, and adjuváre / adjutórium would split from adjútor → auxílio across the psalter. réspice → *olhai* (12:3, 21:2, 24:16); here with no object, so the purpose clause follows directly.",
    o("olhai para me auxiliar", {"respice": "olhai para me auxiliar"}, "Ruling: réspice as 12:3; adjuváre → auxiliar.", "glossary"),
    o("olhai para me socorrer", {"respice": "olhai para me socorrer"}, "The *socorr-* family, if the Hour versicle goes that way (Gustavo, D40).", "draft"),
    o("voltai os olhos para me auxiliar", {"respice": "voltai os olhos para me auxiliar"}, "Matos Soares 1932 *volta os olhos para me socorreres*; the eyes supplied.", "MS1932"))

dec("revereantur", ["39:15", "39:15b"], "Confundántur et revereántur … et revereántur", "glossary",
    "39:15 is 34:4 (*Sejam envergonhados e desonrados, * os que buscam a minha alma*) with *simul* and *ut áuferant eam* added; it copies 34:4's words. reveréri → *ser desonrado* (row, open, for a ruling: the third word of shame beside confúndi → *ser envergonhado*, D15, and erubéscere → *corar*). The row names 39:15 ×2. 69:3 will copy this line without *simul* and *para tirá-la*.",
    o("desonrados … desonrados", {"revereantur15": "desonrados", "revereantur15b": "desonrados"}, "Ruling: the row, as 34:4.", "glossary"),
    o("confundidos … confundidos", {"revereantur15": "confundidos", "revereantur15b": "confundidos"}, "Matos Soares 1932's word; heard as 'confused' (D15's reason).", "MS1932"))

dec("simul", ["39:15"], "simul", "glossary",
    "simul → *juntos* (row, open), after the verbs as 34:26 *Corem e sejam desonrados juntos*.",
    o("juntos", {"simul": "juntos"}, "Ruling: the row.", "glossary"),
    o("ao mesmo tempo", {"simul": "ao mesmo tempo"}, "Matos Soares 1932 *a um tempo*.", "MS1932"))

dec("auferant", ["39:15"], "ut áuferant eam", "glossary",
    "auferre → *tirar* (9:26b *são tirados*, 118:22 *Tirai de mim*, 118:43 *não tireis*). *tirar a alma* is heard as taking a life, which is the sense (τοῦ ἐξᾶραι αὐτήν). The enclitic with the infinitive, *tirá-la*, where *para a tirarem* would be heard as the preposition *para a*.",
    o("para tirá-la", {"auferant": "para tirá-la"}, "Ruling.", "glossary"),
    o("para a tirarem", {"auferant": "para a tirarem"}, "The subject marked in the verb.", "draft"))

dec("retrorsum", ["39:15b"], "Convertántur retrórsum", "glossary",
    "The row *retrórsum* (open) makes *voltar para trás* one phrase under avértere and convértere (one Greek, ἀποστραφείησαν εἰς τὰ ὀπίσω, as here) and names 39:15; 34:4b *Voltem para trás*.",
    o("Voltem para trás", {"retrorsum": "Voltem para trás"}, "Ruling: the row, as 34:4b.", "glossary"),
    o("Sejam voltados para trás", {"retrorsum": "Sejam voltados para trás"}, "The passive form kept.", "draft"))

dec("mala", ["39:15b"], "qui volunt mihi mala", "word",
    "velle → querer (row). *querer mal a alguém* is the Portuguese idiom for wishing someone ill, and it takes the singular; *os que me querem males* keeps the Latin's plural and sounds foreign. Number is grammar (D2). 69:4 has the same colon.",
    o("querem mal", {"mala": "querem mal"}, "Ruling.", "draft"),
    o("querem males", {"mala": "querem males"}, "The Latin's plural.", "draft"),
    o("desejam males", {"mala": "desejam males"}, "Matos Soares 1932; desideráre's verb.", "MS1932"))

dec("ferant", ["39:16"], "Ferant conféstim confusiónem suam", "word",
    "ferre: to bear, carry (κομισάσθωσαν, 'let them carry off / receive'). *Carreguem* is bearing a load, which is the Latin's image; *Levem* would be heard as 'take away their shame'. confúsio → *vergonha* (34:26b *Vistam-se de vergonha*). conféstim (only here) → *logo*, the plain word; *depressa* is cito's.",
    o("Carreguem logo", {"ferant": "Carreguem logo"}, "Ruling.", "draft"),
    o("Suportem logo", {"ferant": "Suportem logo"}, "Douay-Rheims 'bear'; endurance rather than a load.", "DRB"),
    o("Sofram logo", {"ferant": "Sofram logo"}, "Matos Soares 1932.", "MS1932"))

dec("euge", ["39:16"], "Euge, euge", "glossary",
    "The row *euge* (open) → *Que bom, que bom* (34:21, 34:25), and says 39:16 and 69:4 should copy. *Bem feito* was heard as 'deserved punishment'.",
    o("Que bom, que bom", {"euge": "Que bom, que bom"}, "Ruling: the row.", "glossary"),
    o("Bem, bem", {"euge": "Bem, bem"}, "Matos Soares 1932.", "MS1932"))

dec("superte", ["39:17"], "Exsúltent et læténtur super te", "word",
    "*super te* of joy in God (ἐπὶ σοί); 69:5 has *in te* in the same line. *em vós* for both: the glossary's *à minha custa* (super me) is for gloating over someone, and *sobre vós* is not Portuguese with *alegrar-se*. So the doublet will read the same in Portuguese where the Latin varies a preposition — the one difference of the two lines lost.",
    o("em vós", {"superte": "em vós"}, "Ruling.", "draft"),
    o("por causa de vós", {"superte": "por causa de vós"}, "The ground of joy, spelled out.", "draft"))

dec("diligunt", ["39:17"], "et dicant semper: Magnificétur Dóminus: qui díligunt salutáre tuum", "order",
    "34:27 has the same build (*et dicant semper: Magnificétur Dóminus qui volunt pacem servi ejus*) and was translated *e digam sempre os que querem a paz do seu servo: Engrandecido seja o Senhor* — the subject moved before the quotation, so that it is not heard as part of what they say or as said of the Lord. Copied. dilígere → amar; salutáre → salvação (D6); magnificáre → engrandecer (row).",
    o("e digam sempre os que amam a vossa salvação: Engrandecido seja o Senhor", {"diligunt": "e digam sempre os que amam a vossa salvação: Engrandecido seja o Senhor"}, "Ruling: 34:27's build.", "glossary"),
    o("e digam sempre: Engrandecido seja o Senhor, os que amam a vossa salvação", {"diligunt": "e digam sempre: Engrandecido seja o Senhor, os que amam a vossa salvação"}, "The Latin's order.", "draft"))

dec("sollicitus", ["39:18"], "Dóminus sollícitus est mei", "word",
    "sollícitus (only here; φροντιεῖ μου): anxious care. *tem cuidado de mim* (Matos Soares 1932; Douay-Rheims 'is careful for me') keeps a state, as the Latin's adjective + copula; *cuida de mim* is plainer, a verb. *é solícito comigo* is the cognate, which in Brazil means 'obliging'. mendícus → *mendigo* (39:18, 108:17), kept apart from pauper → *pobre*, inops → *carente* (D38) and egénus → *necessitado*: 69:6 has *egénus* where this verse has *mendícus*.",
    o("tem cuidado de mim", {"sollicitus": "tem cuidado de mim"}, "Ruling.", "MS1932"),
    o("cuida de mim", {"sollicitus": "cuida de mim"}, "Plainer.", "draft"),
    o("é solícito comigo", {"sollicitus": "é solícito comigo"}, "The cognate.", "draft"))

dec("adjutor", ["39:18b"], "Adjútor meus, et protéctor meus tu es", "glossary",
    "adjútor → *auxílio* (row, open 'for Gustavo'; the psalter is uniform, 14/14 when the row was written, and 17:3b, 18:15b, 26:9b, 27:7, 29:11, 32:20 since). The Latinist has asked for the agent noun *auxiliador* in nearly every place, often as MAJOR, and it has been held each time (D24, D27) — this verse is the row's hard case again: adjútor beside the agent noun protéctor, as 27:7 (*O Senhor é o meu auxílio e o meu protetor*) and 32:20, whose words are copied. The row's standing proposal ('auxiliador where adjútor is paired with another agent noun') would change 27:7, 32:20 and this verse together. protéctor → protetor (row). 69:6b (*Adjútor meus, et liberátor meus es tu*) will copy the first half. The natural order puts *Vós sois* first. The verse is a versicle for St Benedict Joseph Labre (with 39:18a), and 39:18a a responsory of the Holy Family (Epi1-0).",
    o("o meu auxílio", {"adjutor": "o meu auxílio"}, "Ruling: the psalter's word (27:7, 32:20).", "glossary"),
    o("o meu auxiliador", {"adjutor": "o meu auxiliador"}, "The agent noun, as the Latinist asks; would change 27:7 and 32:20 too.", "latinist"))

choices = {
    "39:3": "preces (the plural of prex) → *preces*, as 33:16. exaudíre → escutar (D3).",
    "39:3b": "dirígere → dirigir (row; 36:23 *serão dirigidos os passos*). gressus → passos.",
    "39:4": "immíttere in os → *pôs na minha boca* (the row *immíttere* notes this verse as *pôs*). cánticum novum → *um cântico novo* (32:3).",
    "39:4b": "timére → temer; speráre in → esperar em (D36).",
    "39:5": "beátus vir → *Bem-aventurado o homem* (D19). *cujus est nomen Dómini spes ejus* (the resumptive *ejus* is a Hebraism) → *cuja esperança é o nome do Senhor*: the two nouns kept, the pronoun absorbed in *cuja* (grammar).",
    "39:6": "*quem vos seja semelhante*: the dative *tibi* as the clitic; the verse ends on a paroxytone.",
    "39:6b": "annuntiáre → anunciar (9:12, 9:15, 18:2, 21:32, 29:10b, 37:19; 39:10 in this psalm). loqui → falar. multiplicári → multiplicar-se (row).",
    "39:7b": "Ecce → *Eis que* (row *ecce*; *Eis que venho* is the build before a verb). *dixi* → *eu disse*, the subject named as 15:1.",
    "39:11": "abscóndere → esconder (row family; 30:5, 31:5, 118:19).",
    "39:12": "*Tu autem* → *Vós, porém*; 39:18 *Ego autem* → *Eu, porém* (29:7, 30:15, 30:23): the two *autem* answer each other. suscípere → amparar (D19).",
    "39:13": "circumdáre → cercar; comprehéndere → prender (row, which tried this verse: *as minhas iniquidades me prenderam*); here the Latin's order, verb first (enclitic at the head of the colon). *et non pótui ut vidérem* → *e não pude ver*.",
    "39:13b": "super (comparison) → *mais que* (row). derelínquere → abandonar (row; 37:11 *abandonou-me o meu vigor*).",
    "39:15": "quǽrere → buscar (row). The first colon is long (the Latin's is long too).",
    "39:18b": "tardáre (only here) → *tardar*; 69:6b has morári (*ne moréris*), which will want *demorar* to stay apart.",
}

audit = [
    {"step": "source", "note": "Latin = DO Psalm39.txt, 24 prayed verses (39:2–39:18b with 39:3b, 4b, 6b, 7b, 11b, 13b, 15b, 18b; no 39:1, the titulus, D7; DO has no 39:9 — its Latin is joined to 39:8). No flex, no ‡. 39:14–18 are the doublet of Ps 69 (DO Psalm69.txt read): near, not identical — 39:14b *réspice* vs 69:2b *festína*; 39:15 adds *simul … ut áuferant eam*; 39:15b *Convertántur … revereántur* vs 69:4 *Avertántur … erubéscant*; 39:16 *Ferant conféstim confusiónem suam* vs 69:4 *Avertántur statim erubescéntes*; 39:17 *super te omnes quæréntes te* vs 69:5 *in te omnes qui quærunt te*; 39:18 *mendícus* vs 69:6 *egénus* (+ *Deus, ádjuva me*); 39:18b *protéctor … tu es … Deus meus, ne tardáveris* vs 69:6b *liberátor … es tu … Dómine, ne moréris*. Heb 10:5–7 quotes 39:7–8 in another Latin (Clementine fetched to consult/bolls-VULG-58-10.json). Uses by grep (ps032/uses.py): 39:2–4 adapted as the gradual of Pent15-0 and Quad4-2; 39:8 a gradual verse (missa Epi1-0) and 39:7b–8 in Pent02-5; 39:10–11b the tract of the Commune of Popes (Commune/C4b); 39:14 a Matins antiphon of the Office of the Dead with *erípias* (Commune/C9) and a versicle with *festína* (Epi2-2); 39:5 and 39:18 versicles for St Benedict Joseph Labre; 39:18a a responsory (Epi1-0). Not in the Diurnal Monástico parallels. **The Hetzenauer print read is skipped and owed.**"},
    {"step": "draft", "note": "Psalm-level draft from consult/parallels/ps039.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO's Portuguese not used (D12). Formulas checked with ps038/xref.py and ps005/grep_latin.py: 34:4 / 34:4b / 34:21 / 34:26b / 34:27 (the imprecations and the *Magnificétur* build, copied); 21:26 and 34:18 *in ecclésia magna*; 30:3 *ut éruas me*; 27:7 and 32:20 *adjútor … protéctor*; 24:6 *miseratiónes* beside misericórdia; 21:20 *longe*; 37:11 *derelíquit me*; 118:22, 118:43 auferre → tirar; 29:4, 30:5 edúcere de → tirar de. Rulings applied: D3 (*escutou*, *atendeu*), D6, D15 (*envergonhados*), D19 (*Bem-aventurado*, *amparar*), D24/D36/D39 (*aguardar*), D34 (*assembleia*; *congregação* for συναγωγή — D34's unchecked 39:11 is confirmed), D35 (*prece*, here the plural *preces* of prex). D37, D38 have no place (no *usque in ætérnum*, no *inops*). D40 is not settled here; decision `respice` records how 39:14 relates to it. Tests for the readers: *Aguardando, aguardei*, *me atendeu*, *da lama do lodo*, *um canto*, *loucuras falsas*, *Vós fizestes muitas coisas … as vossas maravilhas*, *além de todo número*, *nem oferta pelo pecado*, *Na cabeça do livro*, the verbless *e a vossa lei no meio do meu coração*, *reterei os meus lábios*, *desonrados*, *Carreguem logo a sua vergonha*, *tem cuidado de mim*, *o meu auxílio e o meu protetor*."},
    {"step": "checks", "note": "checks.py v1: hard checks pass (ids, 24 `*`). Soft flags accepted: 39:5a +7 (the Latin colon is dense; *cuja esperança é o nome do Senhor* is the least that says it); 39:6b ±3 (*Anunciei e falei* is the Latin's two verbs; *além de todo número* keeps super), 39:7b +3 (the supplied *oferta*), 39:8 ±3, 39:12a −4, 39:13 −4/−5, 39:14a −3, 39:15a +3 (34:4's words plus *juntos*), 39:18b −4 (*ne tardáveris* is one word; *não tardeis* all it says). Rhymes: 39:11 *coração / salvação* (the Latin's nouns), 39:14 *libertar-me / auxiliar* (infinitives; left for the stylist). Cadences: several paroxytone/proparoxytone Latin colons end oxytone in Portuguese (*Senhor*, *Deus*, *coração*), as in the psalms before."},
]

data = {"psalm": 39, "tier": 3, "version": 1, "address": "vós", "status": "draft", "verses": verses,
        "decisions": decisions, "choices": choices, "audit": audit}
(folder / "prayed.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("wrote", len(verses), "verses,", len(decisions), "decisions")
