#!/usr/bin/env python3
"""Merge the per-source surveys into one inventory of magisterial documents.

A document is identified by its author (pope, council or dicastery) and its
incipit, so the same encyclical found on vatican.va, papalencyclicals.net and
veritatis.com.br collapses into one record carrying every language we found.

Each record gets a `status`:
  include — in scope (an act of the magisterium proper)
  review  — plausible but needs a human call (occasional letters, minor curia)
  exclude — out of scope (appointments, greetings, programmes, indexes)

    python3 research/magisterium/build_inventory.py → inventory.json, inventory.csv
"""
from __future__ import annotations

import csv
import functools
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "scripts" / "magisterium"))
from names import COUNCILS as COUNCIL_TABLE  # noqa: E402
from names import DCO_LANG, FILE_TYPE_WORDS, INCIPIT_TYPE_WORDS, ascii_fold, dco_council  # noqa: E402

# Pope names in Latin / Italian / Portuguese / English → canonical English stem.
NAME_STEMS = {
    "leo": "leo", "leone": "leo", "leao": "leo",
    "pius": "pius", "pio": "pius",
    "benedictus": "benedict", "benedetto": "benedict", "bento": "benedict", "benedict": "benedict",
    "gregorius": "gregory", "gregorio": "gregory", "gregory": "gregory",
    "clemens": "clement", "clemente": "clement", "clement": "clement",
    "innocentius": "innocent", "innocenzo": "innocent", "inocencio": "innocent", "innocent": "innocent",
    "urbanus": "urban", "urbano": "urban", "urban": "urban",
    "eugenius": "eugene", "eugenio": "eugene", "eugene": "eugene",
    "bonifacius": "boniface", "bonifacio": "boniface", "boniface": "boniface",
    "sixtus": "sixtus", "sisto": "sixtus",
    "alexander": "alexander", "alessandro": "alexander", "alexandre": "alexander",
    "nicolaus": "nicholas", "niccolo": "nicholas", "nicolau": "nicholas", "nicholas": "nicholas",
    "martinus": "martin", "martino": "martin", "martinho": "martin", "martin": "martin",
    "honorius": "honorius", "onorio": "honorius", "honorio": "honorius", "honorious": "honorius",
    "iulius": "julius", "julius": "julius", "giulio": "julius", "julio": "julius",
    "hadrianus": "adrian", "adriano": "adrian", "adrian": "adrian",
    "paulus": "paul", "paolo": "paul", "paulo": "paul", "paul": "paul",
    "ioannes": "john", "giovanni": "john", "joao": "john", "john": "john",
    "callixtus": "callixtus", "calisto": "callixtus",
    "francesco": "francis", "francisco": "francis", "francis": "francis",
    # Popes known by a single name, and the French and extra Latin spellings
    # Documenta Catholica Omnia and catho.org's Denzinger use.
    "pie": "pius", "leon": "leo", "gregoire": "gregory", "benoit": "benedict", "jean": "john",
    "jules": "julius", "hadrien": "adrian", "sixte": "sixtus", "nicolas": "nicholas", "nicholaus": "nicholas",
    "urbain": "urban", "stephanus": "stephen", "etienne": "stephen", "sergius": "sergius",
    "paschalis": "paschal", "lucius": "lucius", "marinus": "marinus", "felix": "felix",
    "silvester": "sylvester", "sylvester": "sylvester", "damasus": "damasus", "damase": "damasus",
    "siricius": "siricius", "sirice": "siricius", "zosimus": "zosimus", "zosime": "zosimus",
    "gelasius": "gelasius", "gelase": "gelasius", "hormisdas": "hormisdas", "agatho": "agatho",
    "agathon": "agatho", "vigilius": "vigilius", "vigile": "vigilius", "liberius": "liberius",
    "libere": "liberius", "caelestinus": "celestine", "celestinus": "celestine", "celestin": "celestine",
    "calixtus": "callixtus", "calliste": "callixtus", "callistus": "callixtus", "anacletus": "anacletus",
    "adeodatus": "adeodatus", "vitalianus": "vitalian", "simplicius": "simplicius", "pontianus": "pontian",
    "cornelius": "cornelius", "victor": "victor", "petrus": "peter", "evaristus": "evaristus",
    "anicetus": "anicetus", "caius": "caius", "donus": "donus", "constantinus": "constantine",
    "anastasius": "anastasius", "anastase": "anastasius", "symmachus": "symmachus", "hilarius": "hilarius",
    "zacharias": "zachary", "zacharie": "zachary", "telesphorus": "telesphorus",
    "soter": "soter", "eleutherius": "eleutherius", "zephyrinus": "zephyrinus", "fabianus": "fabian",
    "dionysius": "dionysius", "eutychianus": "eutychian", "marcellus": "marcellus", "eusebius": "eusebius",
    "miltiades": "miltiades", "marcus": "mark", "bonifatius": "boniface", "theodorus": "theodore",
    "severinus": "severinus", "deusdedit": "adeodatus", "sabinianus": "sabinian", "conon": "conon",
    "sisinnius": "sisinnius", "valentinus": "valentine", "formosus": "formosus", "romanus": "romanus",
    "lando": "lando", "landus": "lando", "silverius": "silverius", "pelagius": "pelagius", "pelage": "pelagius",
    "agapetus": "agapetus", "hyginus": "hyginus", "linus": "linus",
}
ROMAN_FIX = {"iiii": "iv", "viiii": "ix", "xiiii": "xiv", "xviiii": "xix"}


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", " ", ascii_fold(s).lower()).strip()


def pope_id(text: str) -> str | None:
    """'Pope Pius VI (…)', 'gregorius-xvi', 'Leão XIII', 'Gregorius I, Magnus', 'Saint Agathon' → canonical id."""
    t = norm(text.replace("-", " "))
    t = re.sub(r"\b(pope|papa|st|saint|sao|santo|sanctus|ven|venerabilis|blessed|beatus|martyr)\b", " ", t)
    m = re.search(r"\b(joao paulo|john paul|giovanni paolo|ioannes paulus|jean paul)\s+(i{1,3})\b", t)
    if m:
        return f"john-paul-{m.group(2)}"
    words = t.split()
    for i, w in enumerate(words):
        if w not in NAME_STEMS:
            continue
        nxt = words[i + 1] if i + 1 < len(words) else ""
        if re.fullmatch(r"[ivxl]+", nxt):
            return f"{NAME_STEMS[w]}-{ROMAN_FIX.get(nxt, nxt)}"
        if nxt in ("magnus", "le") or "grand" in t:
            return f"{NAME_STEMS[w]}-i"
        if NAME_STEMS[w] == "francis":
            return "francis"
        return NAME_STEMS[w]
    return None


STOP = {"de", "di", "a", "o", "the", "on", "of", "et", "in", "e", "and", "la", "il", "lo", "le"}


@functools.cache
def incipit_key(title: str) -> str:
    """First two significant words of the incipit, accent- and case-folded."""
    t = re.sub(r"\(.*?\)", " ", title)
    t = re.sub(
        r"^\s*(enciclica|encyclical|encíclica|epistola|lettera|letter|breve|bolla|bulla|bull|"
        r"costituzione apostolica|constitutio|allocuzione|allocutio|litterae apostolicae|"
        r"constitutio dogmatica|decreto|editto|motu proprio|esortazione apostolica)\b",
        " ", t, flags=re.I,
    )
    words = [w for w in norm(t).split() if w not in STOP and not w.isdigit()]
    while len(words) > 1 and words[0] in INCIPIT_TYPE_WORDS:
        words.pop(0)
    return " ".join(words[:2])


def iso(day: str, month: str, year: str) -> str | None:
    months = {
        **{m: i for i, m in enumerate("ianuarii februarii martii aprilis maii iunii iulii augusti septembris octobris novembris decembris".split(), 1)},
        **{m: i for i, m in enumerate("gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split(), 1)},
        "nov": 11, "ian": 1, "feb": 2, "mar": 3, "apr": 4, "aug": 8, "sept": 9, "oct": 10, "dec": 12,
        "januarii": 1, "julii": 7, "junii": 6,
    }
    mo = months.get(month.lower())
    return f"{year}-{mo:02d}-{int(day):02d}" if mo else None


def file_slug(name: str) -> str:
    """'hf_l-xiii_enc_15051891_rerum-novarum' / '20150524-enciclica-laudato-si' /
    'vat-ii_const_19651118_dei-verbum' / 'rc_con_cfaith_doc_20000806_dominus-iesus' → incipit slug."""
    tail = re.sub(r"^.*?[_-](\d{8}|\d{4})[_-]", "", name) if re.search(r"[_-](\d{8}|\d{4})[_-]", name) else name
    words = [w for w in re.split(r"[-_]+", tail.lower()) if w]
    while words and words[0] in FILE_TYPE_WORDS:
        words.pop(0)
    return "-".join(words)


# A stronger status from any source wins: include > review > exclude.
RANK = {"include": 2, "review": 1, "exclude": 0}


def first_word(title: str) -> str:
    return incipit_key(re.sub(r"\s*\(.*$", "", title)).split(" ")[0]


class Inventory:
    def __init__(self) -> None:
        self.docs: dict[tuple[str, str], dict] = {}
        # Indexes of the distinct records for fuzzy(), keyed by id() so a record counts once.
        self.by_author_date: dict[tuple[str, str], dict[int, dict]] = {}
        self.by_date: dict[str, dict[int, dict]] = {}
        self.by_first_word: dict[tuple[str, str], dict[int, dict]] = {}

    def index_date(self, d: dict) -> None:
        if d["date"]:
            self.by_author_date.setdefault((d["author"], d["date"]), {})[id(d)] = d
            self.by_date.setdefault(d["date"], {})[id(d)] = d

    def fuzzy(self, author: str, incipit: str, date: str | None) -> dict | None:
        """Second-tier sources often spell an incipit longer or shorter than
        vatican.va ("Libertas" vs "Libertas Praestantissimum"): fall back to a
        unique match on the same date, then on the first incipit word."""
        if date and len(date) == 10:
            # Veritatis files Curia documents without naming the dicastery: match on date alone.
            hits = self.by_date.get(date, {}) if author == "curia-unknown" else self.by_author_date.get((author, date), {})
            if len(hits) == 1:
                return next(iter(hits.values()))
            first = incipit_key(incipit).split(" ")[0]
            same = [d for d in hits.values()
                    if first and first in incipit_key(d["title"]).split(" ") + [(d.get("slug") or "").split("-")[0]]]
            if len(same) == 1:
                return same[0]
        first = incipit_key(incipit).split(" ")[0]
        if len(first) < 4:
            return None
        hits = self.by_first_word.get((author, first), {})
        return next(iter(hits.values())) if len(hits) == 1 else None

    def add(self, *, author: str, incipit: str, date: str | None, type_: str | None,
            title: str, lang: str | None, url: str | None, source: str,
            status: str, reason: str = "", key: str | None = None, slug: str | None = None,
            fuzzy: bool = False) -> dict:
        """`fuzzy`: join a record whose incipit is spelled differently (second-tier sources)."""
        k = (author, key or incipit_key(incipit) or norm(title))
        d = self.docs.get(k) or (self.fuzzy(author, incipit, date) if fuzzy else None)
        if not d:
            d = self.docs[k] = {
                "author": author, "date": date, "type": type_, "title": title,
                "langs": {}, "sources": [], "status": status, "reason": reason,
            }
            self.index_date(d)
            self.by_first_word.setdefault((author, first_word(title)), {})[id(d)] = d
        else:
            if not d["date"]:
                d["date"] = date
                self.index_date(d)
            d["type"] = d["type"] or type_
            if RANK[status] > RANK[d["status"]]:
                d["status"], d["reason"] = status, reason
        if slug and not d.get("slug"):
            d["slug"] = slug
        if lang and url:
            d["langs"].setdefault(lang, url)
        if lang and url and d.get("reason", "").startswith("cited in Denzinger; no full text"):
            d["reason"] = "cited in Denzinger"
        if source not in d["sources"]:
            d["sources"].append(source)
        return d


# Normalize vatican.va's archive language suffixes to ISO codes.
ARCHIVE_LANG = {"po": "pt", "sp": "es", "ge": "de", "lt": "la", "cn": "zh-cn", "tw": "zh-tw", "zh-s": "zh-cn", "zh-t": "zh-tw"}
VATICAN_LANG = {"zh_cn": "zh-cn", "zh_tw": "zh-tw"}

# Letters after Pius XII are mostly occasional correspondence; these title
# patterns mark the ones addressed to the whole Church or a whole state of life.
UNIVERSAL_LETTER = re.compile(
    r"\b(priests|sacerdoti|giovedi santo|holy thursday|families|famiglie|women|donne|artists|artisti|"
    r"elderly|anziani|children|bambini|young people|giovani|youth|consecrated|consacrat|religious|"
    r"bishops of the (catholic )?church|vescovi della chiesa|all the bishops|catholics of|cattolici|"
    r"seminarians|seminaristi|deacons|diaconi|grandparents|nonni|sick|ammalati|"
    r"church in china|chiesa in cina|year of|anno )",
)
OCCASIONAL_LETTER = re.compile(
    r"\b(inviato speciale|special envoy|nomina|appointment|chirografo|compleanno|birthday|"
    r"anniversar|centenar|centenni|giubileo sacerdotale|telegram|telegramma|"
    r"in occasione|on the occasion|condoglian|condolence|auguri|greetings)",
)

OLD_POPES_VAT = {
    "leo-xiii", "pius-x", "benedict-xv", "pius-xi", "pius-xii",
}


def from_vatican_papal(inv: Inventory) -> None:
    for d in json.loads((HERE / "vatican-papal.json").read_text()):
        author = pope_id(d["pope"]) or d["pope"]
        title = d["title"].get("en") or d["title"].get("it")
        incipit = re.sub(r"\s*\(.*$", "", title)
        status, reason = "include", ""
        if d["type"] == "letters":
            t = norm(" ".join(d["title"].values()))
            if author in OLD_POPES_VAT:
                reason = "pre-1958 letter: often a teaching document"
            elif OCCASIONAL_LETTER.search(t):
                status, reason = "exclude", "occasional letter (envoy, anniversary, greeting)"
            elif UNIVERSAL_LETTER.search(t):
                reason = "letter to the whole Church or a state of life"
            else:
                status, reason = "review", "letter to a person or local church"
        for lang, url in d["urls"].items():
            inv.add(author=author, incipit=incipit, date=d["date"], type_=d["type"], title=title,
                    lang=VATICAN_LANG.get(lang, lang), url=url, source="vatican.va",
                    status=status, reason=reason, key=f"{d['date']}:{file_slug(d['file'])}", slug=file_slug(d["file"]))


CURIA_CORE = {"vatican-ii", "cdf", "cdf-cti", "cdf-pcb", "worship"}


def from_vatican_archive(inv: Inventory) -> None:
    for d in json.loads((HERE / "vatican-archive.json").read_text()):
        s = d["stem"]
        if s.startswith(("hf_", "papa-")):
            continue  # papal documents linked from curia pages: the papal survey has them
        if not re.search(r"(_doc_|^rc_cti_\d|^vat-ii_|^rc_ddf_doc)", s) or re.search(r"index|elenco-membri|working-papers|programm|profile|press|comunicato|stampa|conferenza|"
                                                                            r"intervista|interview|briefing|articolo|presentazione|presentation|saluto|"
                                                                            r"omelia|homily|discorso|intervento|lectio|biografia|testo-conferenza", s):
            status, reason = "exclude", "not a document (press, programme, index, member list)"
        elif d["body"] in CURIA_CORE:
            status, reason = "include", ""
        else:
            status, reason = "review", "dicastery document outside doctrine/worship"
        date = d["date"] or (re.search(r"_(\d{4})_", s) and f"{re.search(r'_(\d{4})_', s).group(1)}")
        slug = re.sub(r"^.*?_\d{4,8}_", "", s).replace("-", " ")
        title = d["title"] or slug
        for lang, url in d["urls"].items():
            inv.add(author=d["body"], incipit=slug, date=date, type_="curia" if d["body"] != "vatican-ii" else "council",
                    title=title, lang=ARCHIVE_LANG.get(lang, lang), url=url, source="vatican.va",
                    status=status, reason=reason, key=s, slug=file_slug(s))


def from_vatican_old(inv: Inventory) -> None:
    for d in json.loads((HERE / "vatican-old.json").read_text()):
        author = pope_id(d["pope"]) or d["pope"]
        slug = d["slug"]
        m = re.search(r"(\d{1,2})-([a-z]+)-(\d{4})$", slug)
        date = iso(*m.groups()) if m else None
        if not date and (m2 := re.match(r"(\d{4})(\d{2})(\d{2})-", slug)):
            date = f"{m2.group(1)}-{m2.group(2)}-{m2.group(3)}"
        words = re.sub(r"-\d.*$", "", slug)
        words = re.sub(r"^\d{8}-", "", words)
        typ, _, inc = words.partition("-")
        if typ in ("litterae", "costituzione", "constitutio"):
            _, _, inc = inc.partition("-")
            if inc.startswith(("apostolicae-", "apostolica-", "dogmatica-")):
                inc = inc.split("-", 1)[1]
        inc = inc.replace("-", " ").replace("  i ", " ").strip()
        inv.add(author=author, incipit=inc, date=date, type_=typ, title=d["title"] if d["title"] not in ("LA", "IT") else inc.title(),
                lang=d["lang"], url=d["url"], source="vatican.va", status="include",
                key=f"{date}:{incipit_key(inc)}" if date else None, slug=inc.replace(" ", "-"))


COUNCILS = [(cid, names[0], year) for cid, _, _, _, names, year in COUNCIL_TABLE]  # id, English name, year
COUNCIL_NAME = {cid: name for cid, name, _ in COUNCILS}
COUNCIL_YEAR = {cid: year for cid, _, year in COUNCILS}


def council_of(title: str) -> str | None:
    t = norm(title)
    for cid, name, _ in COUNCILS:
        if norm(name) in t or cid.replace("-", " ") in t:
            return cid
    if "trent" in t or "trento" in t or "tridentin" in t:
        return "trent"
    return None


def add_council(inv: Inventory, cid: str, lang: str | None, url: str | None, source: str) -> dict:
    """One record per council, gathering every source's acts."""
    return inv.add(author=cid, incipit=cid, date=None, type_="council", title=COUNCIL_NAME[cid], lang=lang, url=url,
                   source=source, status="include", key="acta", fuzzy=True)


def from_papalencyclicals(inv: Inventory) -> None:
    for p in json.loads((HERE / "papalencyclicals.json").read_text()):
        if p["kind"] != "posts":
            continue
        cats = p["categories"]
        url = p["url"]
        if "/councils/" in url or "Trent" in cats or "Councils" in cats:
            cid = "trent" if ("trent" in url or "Trent" in cats) else council_of(p["title"]) or council_of(url)
            if not cid:
                m = re.search(r"ecum(\d+)", url)
                cid = COUNCILS[int(m.group(1)) - 1][0] if m and int(m.group(1)) <= 20 else None
            if cid:
                add_council(inv, cid, "en", url, "papalencyclicals.net")
            continue
        author = next((pope_id(c) for c in cats if pope_id(c)), None)
        # The site files some popes' documents under a neighbour's category (Regnans
        # in Excelsis under Paul VI); the URL folder is the reliable author.
        folder = url.rstrip("/").split("/")[-2]
        fm = re.match(r"(leo|pius|ben|greg|clem|innoc|paul|john|alex|sixtus|nich|urban|boniface|hon|eug)(\d+)", folder)
        if fm:
            stems = {"ben": "benedict", "greg": "gregory", "clem": "clement", "innoc": "innocent", "alex": "alexander",
                     "nich": "nicholas", "hon": "honorius", "eug": "eugene"}
            n = int(fm.group(2))
            roman = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi",
                     "xvii", "xviii", "xix", "xx", "xxi", "xxii", "xxiii"][n] if n < 24 else None
            if roman:
                author = f"{stems.get(fm.group(1), fm.group(1))}-{roman}"
        fn = url.rsplit("/", 1)[-1]
        if "/paul06/p5" in url:
            author = "pius-v"
        elif "/paul06/jp2" in url:
            author = "john-paul-ii"
        if not author:
            continue
        lang = "la" if re.search(r"(latin|-l)\.htm$", fn) else "en"
        inv.add(author=author, incipit=p["title"], date=None, type_=None, title=p["title"], lang=lang, url=url,
                source="papalencyclicals.net", status="include", fuzzy=True)


VERITATIS_DOC_CATS = {
    "Encíclicas": "encyclicals", "Bulas": "bulls", "Exortações Apostólicas": "apost_exhortations",
    "Constituições Apostólicas": "apost_constitutions", "Cartas Apostólicas": "apost_letters",
    'Cartas Apostólicas "Motu Proprio"': "motu_proprio", "Outros Documentos da Igreja": None,
    "Documentos da Igreja": None, "Cúria Romana": "curia", "Doutrina da Fé": "curia", "Concordatas": "concordat",
}


def from_veritatis(inv: Inventory) -> None:
    for p in json.loads((HERE / "veritatis.json").read_text()):
        cats = set(p["categories"])
        cid = next((council_of(c) for c in cats if c.startswith("Concílio")), None)
        if cid == "vatican-ii" or "Vaticano II" in cats:
            continue  # vatican.va has all 16 in Portuguese already
        if cid:
            add_council(inv, cid, "pt", p["url"], "veritatis.com.br")
            continue
        doc_cats = cats & VERITATIS_DOC_CATS.keys()
        if not doc_cats:
            continue
        m = re.search(r"\(([^:()]+):\s*(\d{2})\.(\d{2})\.(\d{4})\)", p["title"])
        author = pope_id(m.group(1)) if m else None
        date = f"{m.group(4)}-{m.group(3)}-{m.group(2)}" if m else None
        if not date and (m2 := re.search(r"\((\d{2})\.(\d{2})\.(\d{4})\)", p["title"])):
            date = f"{m2.group(3)}-{m2.group(2)}-{m2.group(1)}"
        title = re.sub(r"\s*\(.*$", "", p["title"]).strip("“”\" ")
        typ = next((VERITATIS_DOC_CATS[c] for c in doc_cats if VERITATIS_DOC_CATS[c]), None)
        if not author:
            author = "curia-unknown" if typ == "curia" else "unattributed"
        inv.add(author=author, incipit=title, date=date, type_=typ, title=title, lang="pt", url=p["url"],
                source="veritatis.com.br", status="include" if author != "unattributed" else "review",
                reason="" if author != "unattributed" else "no author in title; check", fuzzy=True)


# Compilations, reference works and non-magisterial items DCO files under a pope.
DCO_NOT_A_DOCUMENT = re.compile(
    r"(acta apostolicae sedis|acta sanctae sedis|pontificis maximi acta|bullrium|apocryph|\bvita\b|opera omnia|bullarium|liber pontificalis|"
    r"\bindex\b|documenta omnia|regesta|registrum|epistolae et decreta|biographia|conspectus)", re.I)


# DCO files everything about a pope on his page. These are not his acts:
# writings about him, letters to him, and works he wrote as a private author.
DCO_ABOUT_POPE = re.compile(
    r"(descrizione|archeolog|epitaph|elogium|martyrolog|miracul|martyrium|passio\b|depositio|tomba|sepulcr|"
    r"\bad\b[^']*\bpapam\b|\bto pope\b|diversorum ad|variorum ad|rescriptum [a-z]+ ad)", re.I)
DCO_PRIVATE_WORK = re.compile(
    r"(sermones|sermo\b|homili|omelia|regulae? pastoralis|de rationali|diatrib|moralium|expositio|hymni|carmina|libellus|encomium|\boratio\b|dialog|"
    r"liber sacramentorum|concordia quorumdam|de conflictu|de corpore et sanguine|commentari|tractatus|"
    r"regola di|memoriale rituum)", re.I)
DCO_SPURIOUS = re.compile(r"(perperam attributae|dubiae auctoritatis|spuri|suppositi)", re.I)
# A Migne or Cherubini volume of a pope's collected acts: hundreds of documents in one file.
DCO_COLLECTION = re.compile(
    r"^(epistolae|epistola et decreta|epistolae (et|ed) (decreta|privilegia|diplomata)|decreta|decretalia|"
    r"fragmenta|capitula|acta pontificalia|supplementum|constitutiones|scripta|documenta)\b", re.I)
# Before Siricius (384) almost every "decree" DCO carries comes from the
# Pseudo-Isidorian forgeries; these early popes have genuine surviving letters.
GENUINE_EARLY = {"clement-i", "cornelius", "dionysius", "julius-i", "liberius", "damasus-i", "stephen-i"}


SINGLE_NAME_POPES = {
    "peter", "linus", "anacletus", "evaristus", "telesphorus", "hyginus", "anicetus", "soter", "eleutherius",
    "victor", "zephyrinus", "pontian", "anterus", "fabian", "cornelius", "dionysius", "eutychian", "caius",
    "marcellinus", "eusebius", "miltiades", "mark", "liberius", "siricius", "zosimus", "hilarius", "simplicius",
    "symmachus", "hormisdas", "silverius", "vigilius", "sabinian", "severinus", "vitalian", "agatho", "conon",
    "sisinnius", "constantine", "zachary", "valentine", "formosus", "romanus", "lando",
}
# Antipopes whose acts DCO files beside the true popes'.
ANTIPOPES = {"anacletus-ii"}


def dco_status(author: str, date: str | None, title: str) -> tuple[str, str]:
    if DCO_NOT_A_DOCUMENT.search(title):
        return "exclude", "compilation or non-magisterial item"
    if DCO_ABOUT_POPE.search(title):
        return "exclude", "about the pope or addressed to him, not his act"
    if DCO_PRIVATE_WORK.search(title):
        return "exclude", "the pope's private writing (sermons, commentaries, poems)"
    if author == "holy-see":
        return "review", "DCO catch-all page, issuer unclear"
    if DCO_SPURIOUS.search(title):
        return "review", "authorship doubted by the source"
    if (date or "9999") < "0384" and author not in GENUINE_EARLY:
        return "review", "pre-Siricius decree: probably Pseudo-Isidorian"
    if DCO_COLLECTION.search(title):
        return "review", "collected volume: split into single documents at import"
    if (date or "0") < "1878":
        return "include", ""
    return "review", "only on DCO (no vatican.va record)"


def dco_incipit(title: str) -> str:
    m = re.search(r"'([^']+)'", title)
    return m.group(1) if m else re.sub(r"^[A-Z][a-z]+\.\s*", "", title)


def from_dco(inv: Inventory) -> None:
    for d in json.loads((HERE / "dco.json").read_text())["docs"]:
        date = d["date"]["start"] if d["date"] else None
        if date and date.startswith("999"):
            date = None
        langs = {}
        for f in d["files"]:
            for l in f["langs"]:
                langs.setdefault(DCO_LANG.get(l, l.lower()), f["file_url"] or f["wrapper_url"])
        if d["issuer_kind"] == "council":
            # None for Vatican II too: vatican.va has its documents one by one.
            if cid := dco_council(d["issuer"]):
                for lang, url in langs.items():
                    add_council(inv, cid, lang, url, "documentacatholicaomnia.eu")
            continue
        author = pope_id(d["issuer"])
        if not author:
            author = "holy-see"
        # DCO's pages misfile some documents (113 of Benedict XVI's sit on Benedict XV's
        # page); the file name's own author is the reliable one when it names a pope.
        file_author = pope_id(d.get("author") or "")
        stranger = False
        if file_author and file_author != author:
            if re.search(r"-[ivxl]+$", file_author) or file_author in SINGLE_NAME_POPES:
                author = file_author
            else:
                stranger = True  # "Bonifacius" on Zachary's page: St Boniface writing to the pope
        status, reason = dco_status(author, date, d["title"])
        if d["issuer"] == "Antipapae" or author in ANTIPOPES:
            status, reason = "exclude", "antipope"
        elif stranger:
            status, reason = "exclude", "not by the pope whose page lists it"
        inc = dco_incipit(d["title"])
        for lang, url in (langs or {None: None}).items():
            inv.add(author=author, incipit=inc, date=date, type_=None, title=d["title"], lang=lang, url=url,
                    source="documentacatholicaomnia.eu", status=status, reason=reason, fuzzy=True)


FR_MONTHS = {m: i for i, m in enumerate("janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre".split(), 1)}


def fr_date(s: str | None) -> str | None:
    if not s:
        return None
    t = norm(s)
    m = re.search(r"(\d{1,2})(?:er)?\s+([a-z]+)\s+(\d{3,4})", t)
    if m and m.group(2) in FR_MONTHS:
        return f"{int(m.group(3)):04d}-{FR_MONTHS[m.group(2)]:02d}-{int(m.group(1)):02d}"
    m = re.search(r"\b(\d{3,4})\b", t)
    return m.group(1).zfill(4) if m else None


FR_COUNCIL = {"nicee i": "nicaea-i", "nicee ii": "nicaea-ii", "constantinople i": "constantinople-i",
              "constantinople ii": "constantinople-ii", "constantinople iii": "constantinople-iii",
              "constantinople iv": "constantinople-iv", "ephese": "ephesus", "chalcedoine": "chalcedon",
              "latran i": "lateran-i", "latran ii": "lateran-ii", "latran iii": "lateran-iii", "latran iv": "lateran-iv",
              "latran v": "lateran-v", "lyon i": "lyon-i", "lyon ii": "lyon-ii", "vienne": "vienne",
              "constance": "constance", "florence": "florence", "bale": "florence", "trente": "trent", "vatican i": "vatican-i"}


def from_denzinger(inv: Inventory) -> None:
    for d in json.loads((HERE / "denzinger.json").read_text())["documents"]:
        if d["subheading"]:
            continue
        iss = d["issuer"]
        date = fr_date(d["date"]) or fr_date(d["heading"])
        ds = "–".join(dict.fromkeys(x for x in (d["ds_range"] or []) if x))
        if iss["kind"] == "council":
            n = norm(iss["name"].replace("Concile", ""))
            n = re.sub(r"^(de |d |du )", "", n)
            cid = next((v for k, v in FR_COUNCIL.items() if n.startswith(k) and (len(n) == len(k) or n[len(k)] == " ")), None)
            if cid:
                rec = add_council(inv, cid, None, None, "denzinger")
            else:
                # Local synods Denzinger cites (Orange II, Toledo, Carthage…): their canons were
                # received as teaching, so they stand beside the ecumenical councils.
                rec = inv.add(author="synod-" + re.sub(r"\W+", "-", n).strip("-"), incipit=n, date=date, type_="synod",
                              title=d["heading"], lang=None, url=None, source="denzinger", status="include",
                              reason="local synod cited in Denzinger; needs a source", fuzzy=True)
        else:
            if iss["kind"] == "curia":
                author = {"Holy Office": "holy-office", "Pontifical Biblical Commission": "cdf-pcb"}.get(iss["name"], "curia-" + re.sub(r"\W+", "-", norm(iss["name"])))
            elif iss["kind"] == "pope":
                author = pope_id(iss["name"]) or "early-church"
            else:
                author = "early-church"
            rec = inv.add(author=author, incipit=d["incipit"] or d["heading"], date=date, type_=d["type"], title=d["heading"],
                          lang=None, url=None, source="denzinger", status="include",
                          reason="cited in Denzinger; no full text located yet", fuzzy=True)
        rec.setdefault("ds", [])
        if ds and ds not in rec["ds"]:
            rec["ds"].append(ds)


def main() -> None:
    inv = Inventory()
    from_vatican_papal(inv)
    from_vatican_archive(inv)
    from_vatican_old(inv)
    # Second-tier sources join existing records on (author, incipit). Records
    # keyed by filename above are re-indexed by incipit so the join can find them.
    reindexed: dict[tuple[str, str], dict] = {}
    for (author, _), d in inv.docs.items():
        reindexed.setdefault((author, incipit_key(re.sub(r"\s*\(.*$", "", d["title"])) or norm(d["title"])), d)
        reindexed.setdefault((author, f"{d['date']}:{incipit_key(d['title'])}"), d)
    inv.docs = {**inv.docs, **{k: v for k, v in reindexed.items() if k not in inv.docs}}
    from_papalencyclicals(inv)
    from_veritatis(inv)
    from_dco(inv)
    from_denzinger(inv)

    seen, docs = set(), []
    for d in inv.docs.values():
        if id(d) in seen:
            continue
        seen.add(id(d))
        docs.append(d)
    # The CDF index also lists commentaries on its documents, filed under the
    # document's slug plus the commentator ("dominus-iesus-amato").
    slugs_by_author: dict[str, list[str]] = {}
    # Longest slug first, so a commentary names its nearest parent and the result
    # doesn't depend on set order.
    for a, p in sorted({(d["author"], d.get("slug")) for d in docs if d.get("slug")}, key=lambda ap: (-len(ap[1]), ap)):
        slugs_by_author.setdefault(a, []).append(p)
    for d in docs:
        if d["status"] != "include" or not d["author"].startswith("cdf"):
            continue
        sl = d.get("slug") or ""
        parent = next((p for p in slugs_by_author.get(d["author"], []) if sl.startswith(p + "-") and len(p) > 6), None)
        if parent:
            d["status"], d["reason"] = "review", f"commentary on {parent}"
    authors = {d["author"] for d in docs}
    for c, name, year in COUNCILS:
        if c not in authors:
            docs.append({"author": c, "date": year, "type": "council", "title": name, "langs": {}, "sources": [],
                         "status": "include", "reason": "no scraped source yet"})
    for d in docs:
        if d["type"] == "council" and d["author"] != "vatican-ii":
            d["date"] = d["date"] or COUNCIL_YEAR[d["author"]]
    docs.sort(key=lambda d: (d["date"] or "9999", d["author"], d["title"]))
    (HERE / "inventory.json").write_text(json.dumps(docs, ensure_ascii=False, indent=1))
    with open(HERE / "inventory.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["status", "date", "author", "type", "title", "langs", "sources", "denzinger", "reason"])
        for d in docs:
            w.writerow([d["status"], d["date"], d["author"], d["type"], d["title"], " ".join(sorted(d["langs"])),
                        " ".join(d["sources"]), " ".join(d.get("ds", [])), d["reason"]])
    print("total", len(docs), Counter(d["status"] for d in docs))
    inc = [d for d in docs if d["status"] == "include"]
    print("included by lang", Counter(l for d in inc for l in d["langs"]).most_common(12))
    print("included with no en", sum("en" not in d["langs"] for d in inc), "no pt", sum("pt" not in d["langs"] for d in inc))


if __name__ == "__main__":
    main()
