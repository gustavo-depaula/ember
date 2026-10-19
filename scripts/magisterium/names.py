"""Display names for the magisterium books: authors (popes, councils, dicasteries)
and document types, in English, Portuguese and Latin."""
from __future__ import annotations

import re

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
