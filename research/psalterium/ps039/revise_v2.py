"""Ps 39 draft 2 from prayed.v1.json (kept) → prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
d = json.loads((folder / "prayed.v1.json").read_text(encoding="utf-8"))
decs = {x["id"]: x for x in d["decisions"]}


def promote(id, label, why_add):
    opts = decs[id]["options"]
    i = next(k for k, o in enumerate(opts) if o["label"] == label)
    opts.insert(0, opts.pop(i))
    opts[0]["note"] = "Ruling (draft 2). " + opts[0]["note"]
    decs[id]["why"] += " " + why_add


def new_first(id, label, forms, note, source, why_add):
    opts = decs[id]["options"]
    opts[0]["note"] = opts[0]["note"].replace("Ruling: ", "Draft 1: ").replace("Ruling.", "Draft 1.")
    opts.insert(0, {"label": label, "forms": forms, "note": note, "from": source})
    decs[id]["why"] += " " + why_add


promote("faecis", "da lama da borra",
        "**Draft 2:** the Latinist and the stylist both heard *lama do lodo* as a tautology (and the blind reader as a doubled image); fæx is the dregs, and *borra* is its word — the coffee-cup echo is the Latin's own image of foul sediment. Taken.")
promote("insanias", "loucuras enganosas",
        "**Draft 2:** the stylist ('a madness is not false') and the blind reader (the sense of lies not audible) both failed *falsas*. *enganosas* (Matos Soares 1932) says 'deceiving'; dolus / dolósus keep *engano / enganador* (row), so the adjective *enganoso* is free for falsus here. Taken.")
new_first("multa", "Muitas fizestes vós", {"multa": "Muitas fizestes vós"},
          "Ruling (draft 2): the Latin's order; *Muitas* agrees ahead with *as vossas maravilhas*, as multa with mirabília; no *coisas* supplied.", "stylist",
          "**Draft 2:** the stylist (worst line) heard *muitas coisas … as vossas maravilhas* as a speaker restarting. His fix keeps the Latin's order and lets the feminine *Muitas* wait for its noun, as the neuter multa waits for mirabília — the apposition becomes agreement Portuguese can hear. Taken.")
new_first("complaceat", "Que vos agrade … que me liberteis", {"complaceat": "Que vos agrade", "eruas": "que me liberteis"},
          "Ruling (draft 2): *ut éruas me* as a *que*-clause with the subjunctive, the Latin's build.", "draft",
          "**Draft 2:** the infinitive *libertar-me* rhymed with *auxiliar* at the end (checks, stylist). *que me liberteis* is the Latin's own build (ut + subjunctive) and breaks the rhyme; the verb stays *libertar*.")
new_first("respice", "olhai para auxiliar-me", {"respice": "olhai para auxiliar-me"},
          "Ruling (draft 2): the enclitic after the infinitive, so *para* cannot be heard with *me*.", "stylist",
          "**Draft 2:** the stylist heard *olhai para me* as 'look at me' before the purpose clause arrives; with *auxiliar-me* the *para* goes straight to the infinitive. His *olhai em meu auxílio* is refused: it turns adjuváre into adjutórium, the noun of 69:2a, and would pre-empt D40. The D40 relation stands as above: only *ad adjuvándum me* → *auxiliar-me* is fixed here.")
decs["simul"]["why"] += " **Draft 2:** the stylist heard *juntos* jam against *os que* and lose the subject; a comma after *juntos* closes the predicate, as 34:4 pauses before *os que*. His *Sejam juntos envergonhados* refused (fronts the adverb against 34:26)."

v = d["verses"]
v["39:15"] = "Sejam envergonhados e {revereantur15} {simul}, os que buscam a minha alma, * {auferant}."

L = "critic/v1.latinist.json"
audit = [
    {"step": "readers", "note": "Codex out of credits: the three v1 readers were run by the coordinator as fresh-context readers (claude-opus-5-5) that saw only their target file."},
    {"step": "latinist", "file": L, "note": "Draft 1, read by claude-opus-5-5 (fresh context; Codex out of credits). **No major**; six minors. «A faithful, close translation: no sense, person or mood errors, the Septuagintal readings (perfecisti aures, concilio multo, in capite libri, Euge euge) are kept, and the pointing marks match the Latin in every verse.» Passed without remark: Aguardando, aguardei; me atendeu; me tirou da cova; firmou … uma rocha; um canto; Vós fizestes muitas coisas; Na cabeça do livro; the verbless 39:8b; reterei; da congregação numerosa; não ponhais longe; olhai para me auxiliar; Carreguem logo; tem cuidado de mim; o meu auxílio.", "outcomes": [
        {"verse": "39:3", "remark": "minor: fæx is dregs; *lama do lodo* tautological → 'e da lama da borra'", "outcome": "taken", "decision": "faecis"},
        {"verse": "39:6b", "remark": "minor: *todo* added → 'além do número'", "outcome": "refused", "decision": "supernumerum", "reason": "*além do número* is not Portuguese; *todo* is what the idiom needs to say 'past counting' (grammar, D2). *sem número* stays an option."},
        {"verse": "39:7b", "remark": "minor: *oferta* supplied → 'nem pelo pecado'", "outcome": "option", "decision": "propeccato", "reason": "Already option 3. *Não pedistes holocausto nem pelo pecado* is heard as 'nor did you ask because of sin'; the sin offering needs its noun in Portuguese (grammar). DRB supplies it too."},
        {"verse": "39:8", "remark": "minor: *fácerem* imperfect → 'que eu fizesse'", "outcome": "option", "decision": "deme", "reason": "Already option 3. The sequence of tenses follows the main verb: *está escrito* is present in Portuguese and takes *faça*; *está escrito … que eu fizesse* jars (grammar). Heb 10:7 has *Ut faciam*."},
        {"verse": "39:15", "remark": "minor: revereor is 'be abashed'; *desonrados* is dishonour from outside → 'Sejam confundidos e envergonhados'", "outcome": "refused", "decision": "revereantur", "reason": "The row reveréri (open, for a ruling) and the formula 34:4, which Ps 69:3 will copy; *confundidos* is D15's refused word. The Latinist's point (inner shame vs. outer dishonour) is added to the row's evidence."},
        {"verse": "39:15b", "remark": "minor: same, → 'e se envergonhem'", "outcome": "refused", "decision": "revereantur", "reason": "As 39:15; *envergonhar-se* is confúndi's (D15), used in the same verse pair."},
        {"verse": "39:15b", "remark": "minor: mala plural → 'os que me querem males'", "outcome": "option", "decision": "mala", "reason": "Already option 2. *querer mal a alguém* is the idiom of wishing ill; the plural *querer males* sounds foreign. Number is grammar (D2)."},
    ]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "Draft 1, read by claude-opus-5-5 (fresh context). Eleven verses; best 39:18, worst 39:6. «Overall the psalm prays well: the opening (Aguardando, aguardei), the new song and the closing plea (mendigo e pobre... não tardeis) have a plain, noble ring.» Five taken in whole or part, six refused.", "outcomes": [
        {"verse": "39:3", "remark": "'lama do lodo' near-synonyms, a stammer → 'e da lama do fundo'", "outcome": "taken", "decision": "faecis", "reason": "In substance: the Latinist's *borra*, which keeps fæx as a noun; *do fundo* would turn it into a place."},
        {"verse": "39:5", "remark": "'loucuras falsas' a calque → 'loucuras enganosas'", "outcome": "taken", "decision": "insanias"},
        {"verse": "39:5", "remark": "'olhou para' flat for respexit → 'não se voltou para'", "outcome": "refused", "decision": "respexit", "reason": "respícere → olhar (12:3, 21:2, 24:16); *voltar-se* is convérti's. *voltou os olhos para* stays an option."},
        {"verse": "39:6", "remark": "'muitas coisas … as vossas maravilhas' a restart; 'coisas' filler → 'Muitas fizestes vós, Senhor, meu Deus, as vossas maravilhas'", "outcome": "taken", "decision": "multa"},
        {"verse": "39:8", "remark": "'escrito de mim' may sound 'by me'; colon long → 'a meu respeito' or a colon after *de mim*", "outcome": "option", "decision": "deme", "reason": "*a meu respeito* is option 2 (two syllables more on a colon already +3). The blind reader heard *de mim* as 'about me'. A colon after *de mim* adds a break the Latin lacks."},
        {"verse": "39:10", "remark": "'re-te-rei' stutter; 'reter os lábios' not idiomatic → 'não conterei os meus lábios'", "outcome": "refused", "decision": "prohibebo", "reason": "The row prohibére → reter (118:101, 33:14, and names this verse). The blind reader heard 'I will not keep silent' — the sense. *conter* noted in the row as the stylist's second proposal (after 33:14)."},
        {"verse": "39:11b", "remark": "'congregação numerosa' administrative → 'da numerosa assembleia'", "outcome": "refused", "decision": "concilio", "reason": "D34: concílium by its Greek; here συναγωγή → *congregação*; *assembleia* is ecclésia's, one verse before."},
        {"verse": "39:12", "remark": "'pôr longe' stiff calque; 'compaixões' plural rare → 'não afasteis de mim'", "outcome": "refused", "decision": "longe", "reason": "The Latin says *longe*; 21:20 *não ponhais longe de mim*, the same Greek. miseratiónes → compaixões (row), kept apart from misericórdia in the next colon."},
        {"verse": "39:14", "remark": "'olhai para me auxiliar' first heard 'look at me'; -ar echoes 'libertar-me' → 'olhai em meu auxílio'", "outcome": "taken", "decision": "respice", "reason": "In part: *olhai para auxiliar-me* ends the mishearing, *que me liberteis* the rhyme. *em meu auxílio* refused: it is adjutórium's (69:2a) and would pre-empt D40."},
        {"verse": "39:15", "remark": "'juntos' dangles and jams against 'os que' → 'Sejam juntos envergonhados e desonrados'", "outcome": "taken", "decision": "simul", "reason": "In part: a comma after *juntos*; the adverb stays after the verbs as 34:26."},
        {"verse": "39:16", "remark": "'Que bom, que bom' sounds sincere, the taunt lost → 'Bem feito, bem feito!'", "outcome": "refused", "decision": "euge", "reason": "The row euge (34:21, 34:25; 39:16 named to copy): *Bem feito* was heard as 'deserved punishment' at 34:25. The recurring complaint is added to the row."},
        {"verse": "39:18b", "remark": "'auxílio' abstract beside the person-noun 'protetor' → 'o meu socorro' / 'o meu amparo'", "outcome": "refused", "decision": "adjutor", "reason": "D19 row adjútor → auxílio (open for Gustavo); *socorro* is as abstract, *amparo* is suscípere's (39:12). The stylist's pairing point is the row's hard case, added to its evidence."},
    ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "Draft 1, blind, read by claude-opus-5-5 (fresh context). 30 items, 2 unknown words (holocausto in its sense, iniquidades). Heard rightly or within the Latin's range: *cova da miséria*, *Muitos verão* (will see), *temerão* softened by hope, the apposition of 39:6, *Eis que venho*, *está escrito de mim* (about me), *não reterei os meus lábios* (not keep silent), *Não escondi … no meu coração*, *prenderam-me as minhas iniquidades*, *o meu coração me abandonou*, *Que vos agrade* (a request), *juntos*, *Voltem para trás*, *Carreguem logo a sua vergonha*, *tem cuidado de mim*. Left open as in the Latin: the subject of *multiplicaram-se* (39:6b, 39:13b), *nos vossos pensamentos*, the object of *eu quis* (39:8), *e não pude ver*.", "outcomes": [
        {"verse": "39:3", "remark": "'lama do lodo' redundancy may puzzle", "outcome": "taken", "decision": "faecis"},
        {"verse": "39:5", "remark": "'loucuras falsas' vague; idolatry/lies not audible", "outcome": "taken", "decision": "insanias"},
        {"verse": "39:5", "remark": "'as vaidades' heard as conceit", "outcome": "refused", "reason": "The row vánitas → vaidade (working); *coisas vãs* stays its option. The fourth such hearing noted in the row."},
        {"verse": "39:7", "remark": "'me aperfeiçoastes os ouvidos' heard as better hearing, obedience not audible", "outcome": "refused", "decision": "perfecisti", "reason": "The Latin's image (row perfícere, open); the obedience is the reading, not the words (D2)."},
        {"verse": "39:7b", "remark": "'holocausto' first heard as the genocide; unknown in the sacrificial sense", "outcome": "refused", "reason": "The row holocáustum → holocausto; the liturgical term (Mass readings, catechesis). No plainer word keeps 'burnt whole'."},
        {"verse": "39:8", "remark": "'Na cabeça do livro' odd, probably 'at the beginning'", "outcome": "refused", "decision": "caput", "reason": "Heard as the Latin means; the image kept (rule 5; *caput ánguli*)."},
        {"verse": "39:13", "remark": "'iniquidades' unknown", "outcome": "refused", "reason": "iníquitas → iniquidade throughout the psalter (row); the Church's word."},
        {"verse": "39:15", "remark": "'buscam a minha alma … tirá-la': alma = life only partly heard", "outcome": "refused", "reason": "ánima → alma (row; 34:4); *para tirá-la* carries the sense."},
        {"verse": "39:16", "remark": "'Que bom, que bom' heard at face value, mockery may be missed", "outcome": "refused", "decision": "euge", "reason": "As the stylist's remark; the row. Noted there."},
    ]},
    {"step": "revision", "version": 2, "note": "ps039/revise_v2.py (draft 1 kept as prayed.v1.json): 39:3 *da lama da borra* (Latinist + stylist + blind); 39:5 *loucuras enganosas* (stylist + blind); 39:6 *Muitas fizestes vós* (stylist's worst line); 39:14 *que me liberteis … olhai para auxiliar-me* (stylist; rhyme and 'look at me'); 39:15 comma after *juntos* (stylist). Refused with options or rows: 39:6b *além do número*, 39:7b *nem pelo pecado*, 39:8 *fizesse*, 39:15 *confundidos / envergonhem*, 39:15b *males*, 39:10 *conterei*, 39:11b *assembleia*, 39:12 *afasteis*, 39:16 *Bem feito*, 39:18b *socorro / amparo*."},
]
d["audit"] += audit
d["version"] = 2
(folder / "prayed.json").write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("v2 written")
