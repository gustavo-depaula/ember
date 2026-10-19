"""Display names for the magisterium books: authors (popes, councils, dicasteries)
and document types, in English, Portuguese and Latin."""
from __future__ import annotations

import re
import unicodedata


def ascii_fold(s: str) -> str:
    """Accents dropped: "Leão" → "Leao"."""
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


# Canonical stem → (English, Portuguese, Latin) regnal name.
POPE_NAMES = {
    "peter": ("Peter", "Pedro", "Petrus"), "linus": ("Linus", "Lino", "Linus"),
    "anacletus": ("Anacletus", "Anacleto", "Anacletus"), "clement": ("Clement", "Clemente", "Clemens"),
    "evaristus": ("Evaristus", "Evaristo", "Evaristus"), "alexander": ("Alexander", "Alexandre", "Alexander"),
    "sixtus": ("Sixtus", "Sisto", "Sixtus"), "telesphorus": ("Telesphorus", "Telésforo", "Telesphorus"),
    "hyginus": ("Hyginus", "Higino", "Hyginus"), "pius": ("Pius", "Pio", "Pius"),
    "anicetus": ("Anicetus", "Aniceto", "Anicetus"), "soter": ("Soter", "Sotero", "Soter"),
    "eleutherius": ("Eleutherius", "Eleutério", "Eleutherius"), "victor": ("Victor", "Vítor", "Victor"),
    "zephyrinus": ("Zephyrinus", "Zeferino", "Zephyrinus"), "callixtus": ("Callixtus", "Calisto", "Callixtus"),
    "urban": ("Urban", "Urbano", "Urbanus"), "pontian": ("Pontian", "Ponciano", "Pontianus"),
    "fabian": ("Fabian", "Fabiano", "Fabianus"), "cornelius": ("Cornelius", "Cornélio", "Cornelius"),
    "lucius": ("Lucius", "Lúcio", "Lucius"), "stephen": ("Stephen", "Estêvão", "Stephanus"),
    "dionysius": ("Dionysius", "Dionísio", "Dionysius"), "felix": ("Felix", "Félix", "Felix"),
    "eutychian": ("Eutychian", "Eutiquiano", "Eutychianus"), "caius": ("Caius", "Caio", "Caius"),
    "marcellinus": ("Marcellinus", "Marcelino", "Marcellinus"), "marcellus": ("Marcellus", "Marcelo", "Marcellus"),
    "eusebius": ("Eusebius", "Eusébio", "Eusebius"), "miltiades": ("Miltiades", "Milcíades", "Miltiades"),
    "sylvester": ("Sylvester", "Silvestre", "Silvester"), "mark": ("Mark", "Marcos", "Marcus"),
    "julius": ("Julius", "Júlio", "Iulius"), "liberius": ("Liberius", "Libério", "Liberius"),
    "damasus": ("Damasus", "Dâmaso", "Damasus"), "siricius": ("Siricius", "Sirício", "Siricius"),
    "anastasius": ("Anastasius", "Anastácio", "Anastasius"), "innocent": ("Innocent", "Inocêncio", "Innocentius"),
    "zosimus": ("Zosimus", "Zósimo", "Zosimus"), "boniface": ("Boniface", "Bonifácio", "Bonifatius"),
    "celestine": ("Celestine", "Celestino", "Caelestinus"), "leo": ("Leo", "Leão", "Leo"),
    "hilarius": ("Hilarius", "Hilário", "Hilarius"), "simplicius": ("Simplicius", "Simplício", "Simplicius"),
    "gelasius": ("Gelasius", "Gelásio", "Gelasius"), "symmachus": ("Symmachus", "Símaco", "Symmachus"),
    "hormisdas": ("Hormisdas", "Hormisdas", "Hormisdas"), "john": ("John", "João", "Ioannes"),
    "agapetus": ("Agapetus", "Agapito", "Agapetus"), "silverius": ("Silverius", "Silvério", "Silverius"),
    "vigilius": ("Vigilius", "Vigílio", "Vigilius"), "pelagius": ("Pelagius", "Pelágio", "Pelagius"),
    "benedict": ("Benedict", "Bento", "Benedictus"), "gregory": ("Gregory", "Gregório", "Gregorius"),
    "sabinian": ("Sabinian", "Sabiniano", "Sabinianus"), "adeodatus": ("Adeodatus", "Adeodato", "Adeodatus"),
    "honorius": ("Honorius", "Honório", "Honorius"), "severinus": ("Severinus", "Severino", "Severinus"),
    "theodore": ("Theodore", "Teodoro", "Theodorus"), "martin": ("Martin", "Martinho", "Martinus"),
    "eugene": ("Eugene", "Eugênio", "Eugenius"), "vitalian": ("Vitalian", "Vitaliano", "Vitalianus"),
    "donus": ("Donus", "Dono", "Donus"), "agatho": ("Agatho", "Agatão", "Agatho"),
    "conon": ("Conon", "Cónon", "Conon"), "sergius": ("Sergius", "Sérgio", "Sergius"),
    "sisinnius": ("Sisinnius", "Sisínio", "Sisinnius"), "constantine": ("Constantine", "Constantino", "Constantinus"),
    "zachary": ("Zachary", "Zacarias", "Zacharias"), "paul": ("Paul", "Paulo", "Paulus"),
    "adrian": ("Adrian", "Adriano", "Hadrianus"), "paschal": ("Paschal", "Pascoal", "Paschalis"),
    "valentine": ("Valentine", "Valentim", "Valentinus"), "nicholas": ("Nicholas", "Nicolau", "Nicolaus"),
    "marinus": ("Marinus", "Marino", "Marinus"), "formosus": ("Formosus", "Formoso", "Formosus"),
    "romanus": ("Romanus", "Romano", "Romanus"), "lando": ("Lando", "Lando", "Lando"),
    "francis": ("Francis", "Francisco", "Franciscus"),
}

BODIES = {
    "vatican-ii": ("Second Vatican Council", "Concílio Vaticano II", "Concilium Oecumenicum Vaticanum II"),
    "cdf": ("Dicastery for the Doctrine of the Faith", "Dicastério para a Doutrina da Fé", "Dicasterium pro Doctrina Fidei"),
    "cdf-cti": ("International Theological Commission", "Comissão Teológica Internacional", "Commissio Theologica Internationalis"),
    "cdf-pcb": ("Pontifical Biblical Commission", "Pontifícia Comissão Bíblica", "Pontificia Commissio Biblica"),
    "worship": ("Dicastery for Divine Worship", "Dicastério para o Culto Divino", "Dicasterium de Cultu Divino"),
    "holy-office": ("Holy Office", "Santo Ofício", "Sanctum Officium"),
    "holy-see": ("Holy See", "Santa Sé", "Sancta Sedes"),
    "curia-unknown": ("Roman Curia", "Cúria Romana", "Curia Romana"),
    "clergy": ("Dicastery for the Clergy", "Dicastério para o Clero", "Dicasterium pro Clericis"),
    "bishops": ("Dicastery for Bishops", "Dicastério para os Bispos", "Dicasterium pro Episcopis"),
    "catholic-education": ("Dicastery for Culture and Education", "Dicastério para a Cultura e a Educação", "Dicasterium de Cultura et Educatione"),
    "consecrated-life": ("Dicastery for Consecrated Life", "Dicastério para a Vida Consagrada", "Dicasterium pro Institutis Vitae Consecratae"),
    "evangelization": ("Dicastery for Evangelization", "Dicastério para a Evangelização", "Dicasterium pro Evangelizatione"),
    "oriental-churches": ("Dicastery for the Eastern Churches", "Dicastério para as Igrejas Orientais", "Dicasterium pro Ecclesiis Orientalibus"),
    "saints": ("Dicastery for the Causes of Saints", "Dicastério para as Causas dos Santos", "Dicasterium de Causis Sanctorum"),
    "christian-unity": ("Dicastery for Promoting Christian Unity", "Dicastério para a Promoção da Unidade dos Cristãos", "Dicasterium ad Unitatem Christianorum Fovendam"),
    "legislative-texts": ("Dicastery for Legislative Texts", "Dicastério para os Textos Legislativos", "Dicasterium de Legum Textibus"),
    "family": ("Pontifical Council for the Family", "Pontifício Conselho para a Família", "Pontificium Consilium pro Familia"),
    "justice-peace": ("Pontifical Council for Justice and Peace", "Pontifício Conselho Justiça e Paz", "Pontificium Consilium de Iustitia et Pace"),
    "penitentiary": ("Apostolic Penitentiary", "Penitenciaria Apostólica", "Paenitentiaria Apostolica"),
}

# The ecumenical councils, Nicaea I to Vatican I: id, Tanner page on papalencyclicals.net,
# DCO council name, Veritatis category stem, en/pt/la names, opening year.
COUNCILS = [
    ("nicaea-i", "ecum01", "Nicaenum I", "Niceia I", ("First Council of Nicaea", "Primeiro Concílio de Niceia", "Concilium Nicaenum I"), "325"),
    ("constantinople-i", "ecum02", "Constantinopolitanum I", "Constantinopla I", ("First Council of Constantinople", "Primeiro Concílio de Constantinopla", "Concilium Constantinopolitanum I"), "381"),
    ("ephesus", "ecum03", "Ephesenum", None, ("Council of Ephesus", "Concílio de Éfeso", "Concilium Ephesenum"), "431"),
    ("chalcedon", "ecum04", "Chalcedonense", None, ("Council of Chalcedon", "Concílio de Calcedônia", "Concilium Chalcedonense"), "451"),
    ("constantinople-ii", "ecum05", "Constantinopolitanum II", None, ("Second Council of Constantinople", "Segundo Concílio de Constantinopla", "Concilium Constantinopolitanum II"), "553"),
    ("constantinople-iii", "ecum06", "Constantinopolitanum III", None, ("Third Council of Constantinople", "Terceiro Concílio de Constantinopla", "Concilium Constantinopolitanum III"), "680"),
    ("nicaea-ii", "ecum07", "Nicaenum II", None, ("Second Council of Nicaea", "Segundo Concílio de Niceia", "Concilium Nicaenum II"), "787"),
    ("constantinople-iv", "ecum08", "Constantinopolitanum IV", None, ("Fourth Council of Constantinople", "Quarto Concílio de Constantinopla", "Concilium Constantinopolitanum IV"), "869"),
    ("lateran-i", "ecum09", "Lateranum I", None, ("First Lateran Council", "Primeiro Concílio de Latrão", "Concilium Lateranense I"), "1123"),
    ("lateran-ii", "ecum10", "Lateranum II", None, ("Second Lateran Council", "Segundo Concílio de Latrão", "Concilium Lateranense II"), "1139"),
    ("lateran-iii", "ecum11", "Lateranum III", None, ("Third Lateran Council", "Terceiro Concílio de Latrão", "Concilium Lateranense III"), "1179"),
    ("lateran-iv", "ecum12-2", "Lateranum IIII", None, ("Fourth Lateran Council", "Quarto Concílio de Latrão", "Concilium Lateranense IV"), "1215"),
    ("lyon-i", "ecum13", "Lugdunense I", None, ("First Council of Lyon", "Primeiro Concílio de Lyon", "Concilium Lugdunense I"), "1245"),
    ("lyon-ii", "ecum14", "Lugdunense II", None, ("Second Council of Lyon", "Segundo Concílio de Lyon", "Concilium Lugdunense II"), "1274"),
    ("vienne", "ecum15", "Viennense", None, ("Council of Vienne", "Concílio de Vienne", "Concilium Viennense"), "1311"),
    ("constance", "ecum16", "Constantiense", None, ("Council of Constance", "Concílio de Constança", "Concilium Constantiense"), "1414"),
    ("florence", "ecum17", "Basiliense", None, ("Council of Basel-Ferrara-Florence", "Concílio de Basileia-Ferrara-Florença", "Concilium Basiliense-Ferrariense-Florentinum"), "1431"),
    ("lateran-v", "ecum18", "Lateranum V", None, ("Fifth Lateran Council", "Quinto Concílio de Latrão", "Concilium Lateranense V"), "1512"),
    ("trent", "trent", "Tridentinum", "Trento", ("Council of Trent", "Concílio de Trento", "Concilium Tridentinum"), "1545"),
    ("vatican-i", "ecum20", "Vaticanum I", "Vaticano I", ("First Vatican Council", "Concílio Vaticano I", "Concilium Vaticanum I"), "1869"),
]
# Documenta Catholica Omnia's language tags that aren't ISO codes once lowercased.
DCO_LANG = {"LT": "la", "MLT": "la", "GR": "grc", "MGR": "grc", "GE": "de", "SP": "es"}


def dco_council(issuer: str) -> str | None:
    """DCO's issuer for a council's files ("Concilium Lateranum IIII") → council id.
    The name must match whole: "Constantinopolitanum I" must not take the files of
    II–IV. Basel's issuer carries its later sessions' cities in parentheses."""
    n = re.sub(r"\s+", " ", issuer.replace("Concilium", "").lower()).strip()
    return next((cid for cid, _, dco, *_ in COUNCILS
                 if n == dco.lower() or (dco == "Basiliense" and n.startswith("basiliense"))), None)


# Leading genre words dropped from a title before it becomes a book id
# ("Enciclica Qui pluribus", "Epistola ad …"). Book ids depend on this set.
ID_TYPE_WORDS = {
    "enciclica", "encyclica", "encyclical", "encyclicae", "lettera", "apostolica", "apostolic", "letter", "letters",
    "esortazione", "exhortation", "costituzione", "constitutio", "constitution", "motu", "proprio", "bolla", "bulla",
    "bull", "breve", "brief", "epistola", "epistula", "allocuzione", "allocutio", "decreto", "decretum", "editto",
    "litterae", "apostolicae", "dogmatica", "carta", "ap", "chirografo", "littera", "the", "a", "an",
}
# Genre words in vatican.va file names ("hf_l-xiii_enc_…", "20150524-enciclica-…"),
# dropped to reach the incipit; the inventory's join keys depend on this set.
FILE_TYPE_WORDS = {
    "enciclica", "encyclica", "encyclical", "lettera", "lettere", "apostolica", "apostoliche", "apostolic", "letter",
    "esortazione", "exhortation", "costituzione", "constitutio", "motu", "proprio", "bolla", "bulla", "breve",
    "epistola", "epistula", "allocuzione", "allocutio", "decreto", "decretum", "editto", "litterae", "apostolicae",
    "dogmatica", "carta", "ap", "post", "sinodale", "chirografo", "messaggio", "omelia", "papa", "francesco",
    "leone", "xiv", "const", "decl", "decree", "doc", "enc", "apl", "exh", "let", "mp", "ep",
}
# … and, in titles, these too.
INCIPIT_TYPE_WORDS = FILE_TYPE_WORDS | {
    "dichiarazione", "proclama", "notificazione", "istruzione", "rescritto", "risposta", "declaratio",
    "notificatio", "instructio", "responsum", "bref", "lettre", "encyclique", "pope", "papa",
}

TYPES = {
    "encyclical": ("Encyclical", "Encíclica", "Litterae Encyclicae"),
    "apostolic-exhortation": ("Apostolic Exhortation", "Exortação Apostólica", "Adhortatio Apostolica"),
    "apostolic-constitution": ("Apostolic Constitution", "Constituição Apostólica", "Constitutio Apostolica"),
    "apostolic-letter": ("Apostolic Letter", "Carta Apostólica", "Litterae Apostolicae"),
    "motu-proprio": ("Motu Proprio", "Motu Proprio", "Motu Proprio"),
    "bull": ("Bull", "Bula", "Bulla"),
    "brief": ("Brief", "Breve", "Breve"),
    "letter": ("Letter", "Carta", "Epistula"),
    "allocution": ("Allocution", "Alocução", "Allocutio"),
    "decree": ("Decree", "Decreto", "Decretum"),
    "constitution": ("Constitution", "Constituição", "Constitutio"),
    "declaration": ("Declaration", "Declaração", "Declaratio"),
    "instruction": ("Instruction", "Instrução", "Instructio"),
    "council-document": ("Conciliar Document", "Documento Conciliar", "Documentum Conciliare"),
    "curia-document": ("Document of the Roman Curia", "Documento da Cúria Romana", "Documentum Curiae Romanae"),
    "document": ("Document", "Documento", "Documentum"),
}

# Inventory type values (vatican.va index names, vatican.va's Italian slugs for older
# popes, Veritatis categories) → canonical type.
TYPE_ALIASES = {
    "encyclicals": "encyclical", "enciclica": "encyclical",
    "apost_exhortations": "apostolic-exhortation", "esortazione": "apostolic-exhortation",
    "apost_constitutions": "apostolic-constitution", "costituzione": "apostolic-constitution", "constitutio": "apostolic-constitution",
    "apost_letters": "apostolic-letter", "litterae": "apostolic-letter", "lettera": "letter",
    "motu_proprio": "motu-proprio", "motu-proprio": "motu-proprio",
    "bulls": "bull", "bolla": "bull", "bulla": "bull",
    "briefs": "brief", "breve": "brief",
    "letters": "letter", "epistola": "letter", "epistula": "letter",
    "allocuzione": "allocution", "allocutio": "allocution",
    "decreto": "decree", "editto": "decree",
    "council": "council-document", "curia": "curia-document",
}
TITLE_TYPES = [
    (r"\b(encyclica|encíclica|enciclica|encyclical)\b", "encyclical"),
    (r"\bmotu proprio\b", "motu-proprio"),
    (r"\b(bulla|bula|bull|bolla)\b", "bull"),
    (r"\b(breve|brief)\b", "brief"),
    (r"\b(constitutio|constituição|constitution)\b", "apostolic-constitution"),
    (r"\b(adhortatio|exortação|exhortation)\b", "apostolic-exhortation"),
    (r"\b(allocutio|allocution|alocução)\b", "allocution"),
    (r"\b(decretum|decree|decreto)\b", "decree"),
    (r"\b(declaratio|declaration|declaração)\b", "declaration"),
    (r"\b(instructio|instruction|instrução)\b", "instruction"),
    (r"\b(epistola|epistula|littera|litterae|letter|carta)\b", "letter"),
]
LANGS = ("en-US", "pt-BR", "la")


def document_type(inventory_type: str | None, title: str) -> str:
    if inventory_type in TYPE_ALIASES:
        return TYPE_ALIASES[inventory_type]
    t = title.lower()
    for pattern, kind in TITLE_TYPES:
        if re.search(pattern, t):
            return kind
    return "document"


def type_label(kind: str, lang: str) -> str:
    return TYPES.get(kind, TYPES["document"])[LANGS.index(lang)]


def author_label(author: str) -> dict[str, str]:
    if author in BODIES:
        return dict(zip(LANGS, BODIES[author]))
    m = re.fullmatch(r"(john-paul|[a-z]+)(?:-([ivxl]+))?", author)
    if m and (m.group(1) == "john-paul" or m.group(1) in POPE_NAMES):
        num = (m.group(2) or "").upper()
        if m.group(1) == "john-paul":
            en, pt, la = "John Paul", "João Paulo", "Ioannes Paulus"
        else:
            en, pt, la = POPE_NAMES[m.group(1)]
        return {
            "en-US": f"Pope {en} {num}".strip(),
            "pt-BR": f"Papa {pt} {num}".strip(),
            "la": f"{la} PP. {num}".strip(),
        }
    pretty = " ".join(w.upper() if re.fullmatch(r"[ivxl]+", w) else w.capitalize() for w in author.split("-"))
    return {"en-US": pretty, "pt-BR": pretty, "la": pretty}
