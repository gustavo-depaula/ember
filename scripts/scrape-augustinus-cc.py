#!/usr/bin/env python3
"""Import St. Augustine's works from augustinus.cc into the corpus.

augustinus.cc runs the same "AI TextEngine" as aquinas.cc, in its newer
build: `GET /api/init` returns the whole catalog (`navTreeRoot`), and two
POST endpoints back the text — `/api/work/getStructure` (a style string
with one char per row + an outline JSON) and `/api/data/getCells` (row
HTML in chunks). Every document of a work (Latin, English, Portuguese,
Spanish) has the same row count, aligned by position, so the style string
and outline of the work apply to each language.

Each work becomes a book under content/books/augustine-opera-omnia/. The
style string drives the structure: chars a-j are header levels (Work,
Subject, Book, Section, Chapter, Distinction, Lecture, Question, Article,
Subarticle), k-t the same levels' "#" variants, u-z body kinds. A work is
split into one chapter file per unit at its shallowest repeated header
level; a unit too long to read as one page is split again one level down.
Works with no header rows carry their structure in the text instead, and
are split on that (see `_pseudo_level`).

Usage:
    python3 scripts/scrape-augustinus-cc.py fetch [abbr ...]   # download to cache
    python3 scripts/scrape-augustinus-cc.py dump <abbr> [n]    # print rows with styles
    python3 scripts/scrape-augustinus-cc.py build [abbr ...]   # write books from cache
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / "_cache" / "augustinus-cc"
BASE = "https://augustinus.cc"
USER_AGENT = "Mozilla/5.0 (compatible; EmberAugustineImporter/1.0; +https://github.com/gustavo-depaula/ember)"

# Rendition → (augustinus.cc document name, picker label, provenance note,
# site path language). A rendition is a language of the book's main text
# (`en-US`), or of one of its other versions (`pusey/en-US`): an older
# translation is its own version, with its own TOC, read from
# `versions/<id>/<lang>/` (docs/content/book-format.md).
RENDITIONS = {
    "la": ("Latin", None, "Latin text (public domain), mirrored from augustinus.cc.", "la"),
    "en-US": ("English - Aquinas Institute", "Aquinas Institute", "English translation by the Aquinas Institute, mirrored from augustinus.cc.", "en"),
    "pt-BR": ("Português - Aquinas Institute", "Aquinas Institute", "Portuguese translation by the Aquinas Institute, mirrored from augustinus.cc.", "pt"),
    "es-419": ("Español - Aquinas Institute", "Aquinas Institute", "Spanish translation by the Aquinas Institute, mirrored from augustinus.cc.", "es"),
    "pilkington/en-US": ("English - Pilkington", "J. G. Pilkington (1876)", "English translation by J. G. Pilkington (1876), as in the Nicene and Post-Nicene Fathers (public domain); mirrored from augustinus.cc.", "en"),
    "pusey/en-US": ("English - Pusey", "E. B. Pusey (1838)", "English translation by E. B. Pusey, Library of the Fathers (1838, public domain); mirrored from augustinus.cc.", "en"),
}
# Outler's Confessions (also on augustinus.cc) come from the CCEL edition
# instead, which adds his introduction and has a Portuguese translation:
# scripts/merge-npnf-augustine.py.


def base_lang(rendition: str) -> str:
    return rendition.split("/")[-1]


def version_of(rendition: str) -> str | None:
    return rendition.split("/")[0] if "/" in rendition else None


def rendition_dir(out_dir: Path, rendition: str) -> Path:
    v = version_of(rendition)
    return out_dir / "versions" / v / base_lang(rendition) if v else out_dir / rendition


session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})


def _request(method: str, path: str, body: dict | None = None) -> Any:
    for attempt in range(4):
        try:
            r = session.request(method, BASE + path, json=body, timeout=120)
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, ValueError) as exc:
            if attempt == 3:
                raise RuntimeError(f"{method} {path} {body}: {exc}") from exc
            time.sleep(2 ** (attempt + 1))


def _cached(name: str, load) -> Any:
    path = CACHE / name
    if path.is_file():
        return json.loads(path.read_text())
    data = load()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False))
    return data


def catalog() -> list[dict]:
    """Flatten navTreeRoot into one entry per work, in site order."""
    init = _cached("init.json", lambda: _request("GET", "/api/init"))
    works = []
    for category, entries, _ in init["navTreeRoot"]:
        for wid, title, docs, rows, _flag, abbr in entries:
            dids = {}
            for lang, (name, *_) in RENDITIONS.items():
                did = next((d[0] for d in docs if d[1] == name), None)
                if did is not None:
                    dids[lang] = did
            works.append({
                "wid": wid, "abbr": abbr, "title": title.strip(), "rows": rows,
                "category": category, "dids": dids,
            })
    return works


def work_by_abbr(abbr: str) -> dict:
    for w in catalog():
        if w["abbr"] == abbr:
            return w
    raise SystemExit(f"unknown work: {abbr}")


def structure(wid: int) -> tuple[str, dict]:
    """(style string, outline tree) — one style char per row."""
    _, body = _cached(f"struct/{wid}.json", lambda: _request("POST", "/api/work/getStructure", {"wid": wid}))
    styles = body[0] if isinstance(body[0], str) else "".join(body[0])
    outline = json.loads(body[1]) if isinstance(body[1], str) else body[1]
    return styles, outline


def cells(did: int, total: int, chunk: int = 500) -> list[str]:
    """Row HTML for a whole document, in order (positions 0..total-1)."""
    def load() -> list[str]:
        out: list[str] = []
        while len(out) < total:
            _, rows = _request("POST", "/api/data/getCells", {"did": str(did), "start": len(out), "len": chunk})
            if not rows:
                break
            out.extend((r[1] if isinstance(r, list) and len(r) > 1 else "") or "" for r in rows)
            time.sleep(0.1)
        if len(out) != total:
            raise RuntimeError(f"did {did}: got {len(out)} rows, expected {total}")
        return out

    return _cached(f"cells/{did}.json", load)


def fetch(abbrs: list[str]) -> None:
    works = [work_by_abbr(a) for a in abbrs] if abbrs else catalog()
    for w in works:
        styles, _ = structure(w["wid"])
        if len(styles) != w["rows"]:
            print(f"  ! {w['abbr']}: style string has {len(styles)} rows, catalog says {w['rows']}")
        for did in w["dids"].values():
            cells(did, len(styles))
        print(f"{w['abbr']:12} {w['rows']:6} rows  {', '.join(w['dids'])}", flush=True)


def dump(abbr: str, limit: int) -> None:
    w = work_by_abbr(abbr)
    styles, outline = structure(w["wid"])
    docs = {lang: cells(did, len(styles)) for lang, did in w["dids"].items()}
    print(json.dumps(outline, ensure_ascii=False)[:3000])
    for i, s in enumerate(styles[:limit]):
        print(f"{i:5} {s} | " + " || ".join(docs[lang][i][:90].replace("\n", " ") for lang in docs))


# ── Metadata ────────────────────────────────────────────────────────────

BOOKS_ROOT = ROOT / "content" / "books" / "augustine-opera-omnia"
AUTHOR = {"la": "Sanctus Augustinus Hipponensis", "en-US": "St. Augustine of Hippo", "pt-BR": "Santo Agostinho de Hipona", "es-419": "San Agustín de Hipona"}

# Site category → (directory, la, en-US, pt-BR).
CATEGORIES = {
    "Autobiographical Works": ("autobiographical", "Opera autobiographica", "Autobiographical Works", "Obras autobiográficas"),
    "Philosophical Works": ("philosophical", "Opera philosophica", "Philosophical Works", "Obras filosóficas"),
    "Dogmatic Works": ("dogmatic", "Opera dogmatica", "Dogmatic Works", "Obras dogmáticas"),
    "Pastoral Works": ("pastoral", "Opera pastoralia", "Pastoral Works", "Obras pastorais"),
    "Exegetical Works": ("exegetical", "Opera exegetica", "Exegetical Works", "Obras exegéticas"),
    "Against Arianism and Other Heresies": ("anti-arian", "Contra Arianos et alios haereticos", "Against Arianism and Other Heresies", "Contra o arianismo e outras heresias"),
    "Against Manichaeanism": ("anti-manichaean", "Contra Manichaeos", "Against Manichaeanism", "Contra o maniqueísmo"),
    "Against Donatism": ("anti-donatist", "Contra Donatistas", "Against Donatism", "Contra o donatismo"),
    "Against Pelagianism": ("anti-pelagian", "Contra Pelagianos", "Against Pelagianism", "Contra o pelagianismo"),
    "Letters": ("letters", "Epistulae", "Letters", "Cartas"),
    "Sermons": ("sermons", "Sermones", "Sermons", "Sermões"),
    "Homilies on John": ("homilies-on-john", "Tractatus in Iohannem", "Homilies on John", "Tratados sobre João"),
    "Expositions of the Psalms": ("psalms", "Enarrationes in Psalmos", "Expositions of the Psalms", "Comentários aos Salmos"),
}

# abbr → (id suffix, la, en-US, pt-BR, es-419). Ids follow the Aquinas opera omnia:
# the Latin title, so they never collide with the NPNF English-title ids
# already under church-fathers/augustine/.
WORKS = {
    "Conf": ("confessiones", "Confessiones", "The Confessions", "Confissões", "Confesiones"),
    "Rev": ("retractationes", "Retractationes", "Revisions", "Revisões", "Revisiones"),
    "Vita": ("possidius-vita", "Vita Sancti Augustini", "Life of St. Augustine", "Vida de Santo Agostinho", "Vida de san Agustín"),
    "Solil": ("soliloquia", "Soliloquia", "The Soliloquies", "Solilóquios", "Soliloquios"),
    "Acad": ("contra-academicos", "Contra Academicos", "Answer to the Skeptics", "Contra os acadêmicos", "Contra los académicos"),
    "deBea": ("de-beata-vita", "De beata vita", "The Happy Life", "A vida feliz", "La vida feliz"),
    "deOrd": ("de-ordine", "De ordine", "On Order", "A ordem", "El orden"),
    "deImm": ("de-immortalitate-animae", "De immortalitate animae", "On the Immortality of the Soul", "A imortalidade da alma", "La inmortalidad del alma"),
    "deGramB": ("ars-breviata", "De grammatica: Ars breviata", "On Grammar: The Abridged Art", "A gramática: a arte abreviada", "La gramática: el arte abreviado"),
    "deGramR": ("regulae-grammaticae", "De grammatica: Regulae", "On Grammar: The Rules", "A gramática: as regras", "La gramática: las reglas"),
    "deRhet": ("de-rhetorica", "De rhetorica", "On Rhetoric", "A retórica", "La retórica"),
    "deDial": ("de-dialectica", "De dialectica", "On Dialectic", "A dialética", "La dialéctica"),
    "deQuan": ("de-quantitate-animae", "De quantitate animae", "On the Size of the Soul", "A grandeza da alma", "La grandeza del alma"),
    "deMus": ("de-musica", "De musica", "On Music", "A música", "La música"),
    "deMag": ("de-magistro", "De magistro", "The Teacher", "O mestre", "El maestro"),
    "deLib": ("de-libero-arbitrio", "De libero arbitrio", "On Free Will", "O livre-arbítrio", "El libre albedrío"),
    "deTrin": ("de-trinitate", "De Trinitate", "The Trinity", "A Trindade", "La Trinidad"),
    "deCiv": ("de-civitate-dei", "De civitate Dei", "The City of God", "A Cidade de Deus", "La ciudad de Dios"),
    "deVera": ("de-vera-religione", "De vera religione", "True Religion", "A verdadeira religião", "La verdadera religión"),
    "deUtil": ("de-utilitate-credendi", "De utilitate credendi", "The Advantage of Believing", "A utilidade de crer", "La utilidad de creer"),
    "deFideSym": ("de-fide-et-symbolo", "De fide et symbolo", "Faith and the Creed", "A fé e o símbolo", "La fe y el símbolo"),
    "deFideRe": ("de-fide-rerum-invisibilium", "De fide rerum quae non videntur", "Faith in the Unseen", "A fé nas coisas que não se veem", "La fe en las cosas que no se ven"),
    "deDivin": ("de-divinatione-daemonum", "De divinatione daemonum", "Demonic Divination", "A adivinhação dos demônios", "La adivinación de los demonios"),
    "deFideOper": ("de-fide-et-operibus", "De fide et operibus", "Faith and Works", "A fé e as obras", "La fe y las obras"),
    "Ench": ("enchiridion-ad-laurentium", "Enchiridion de fide, spe et caritate", "Enchiridion on Faith, Hope, and Charity", "Enquirídio sobre a fé, a esperança e a caridade", "Enquiridión sobre la fe, la esperanza y la caridad"),
    "Marr": ("de-bono-coniugali", "De bono coniugali", "The Excellence of Marriage", "O bem do matrimônio", "El bien del matrimonio"),
    "Virg": ("de-sancta-virginitate", "De sancta virginitate", "Holy Virginity", "A santa virgindade", "La santa virginidad"),
    "Widow": ("de-bono-viduitatis", "De bono viduitatis", "The Excellence of Widowhood", "O bem da viuvez", "El bien de la viudez"),
    "AdulMarr": ("de-coniugiis-adulterinis", "De coniugiis adulterinis", "Adulterous Marriages", "Os matrimônios adulterinos", "Los matrimonios adulterinos"),
    "Cont": ("de-continentia", "De continentia", "Continence", "A continência", "La continencia"),
    "DeAC": ("de-agone-christiano", "De agone christiano", "The Christian Combat", "O combate cristão", "El combate cristiano"),
    "DeCat": ("de-catechizandis-rudibus", "De catechizandis rudibus", "The Catechizing of the Uninstructed", "A catequese dos principiantes", "La catequesis de los principiantes"),
    "DeMen": ("de-mendacio", "De mendacio", "Lying", "A mentira", "La mentira"),
    "ConMen": ("contra-mendacium", "Contra mendacium", "Against Lying", "Contra a mentira", "Contra la mentira"),
    "DeOpMon": ("de-opere-monachorum", "De opere monachorum", "The Work of Monks", "O trabalho dos monges", "El trabajo de los monjes"),
    "DeCura": ("de-cura-pro-mortuis", "De cura pro mortuis gerenda", "The Care to Be Taken for the Dead", "O cuidado devido aos mortos", "El cuidado que se debe a los muertos"),
    "DePat": ("de-patientia", "De patientia", "Patience", "A paciência", "La paciencia"),
    "DeUI": ("de-utilitate-ieiunii", "De utilitate ieiunii", "The Usefulness of Fasting", "A utilidade do jejum", "La utilidad del ayuno"),
    "Regula": ("regula", "Regula ad servos Dei", "The Rule", "Regra aos servos de Deus", "Regla a los siervos de Dios"),
    "DeDiscChr": ("de-disciplina-christiana", "De disciplina christiana", "On Christian Discipline", "A disciplina cristã", "La disciplina cristiana"),
    "ExcidRoma": ("de-excidio-urbis", "De excidio urbis Romae", "On the Sack of the City of Rome", "O saque da cidade de Roma", "El saqueo de la ciudad de Roma"),
    "SymbCatech": ("de-symbolo-ad-catechumenos", "De symbolo ad catechumenos", "On the Creed, to Catechumens", "O símbolo, aos catecúmenos", "El símbolo, a los catecúmenos"),
    "OrdoMon": ("ordo-monasterii", "Ordo monasterii", "The Order of the Monastery", "A ordem do mosteiro", "El orden del monasterio"),
    "Doct": ("de-doctrina-christiana", "De doctrina christiana", "Teaching Christianity", "A doutrina cristã", "La doctrina cristiana"),
    "83Qs": ("de-diversis-quaestionibus-83", "De diversis quaestionibus octoginta tribus", "Miscellany of Eighty-three Questions", "Oitenta e três questões diversas", "Ochenta y tres cuestiones diversas"),
    "Simpl": ("ad-simplicianum", "Ad Simplicianum de diversis quaestionibus", "Miscellany of Questions in Response to Simplician", "Diversas questões a Simpliciano", "Diversas cuestiones a Simpliciano"),
    "Dulc": ("de-octo-dulcitii-quaestionibus", "De octo Dulcitii quaestionibus", "Eight Questions of Dulcitius", "As oito questões de Dulcício", "Las ocho cuestiones de Dulcicio"),
    "GenMani": ("de-genesi-contra-manichaeos", "De Genesi contra Manichaeos", "On Genesis: A Refutation of the Manichees", "O Gênesis contra os maniqueus", "El Génesis contra los maniqueos"),
    "GenImperf": ("de-genesi-imperfectus", "De Genesi ad litteram imperfectus liber", "Unfinished Literal Commentary on Genesis", "Comentário literal inacabado ao Gênesis", "Comentario literal inconcluso al Génesis"),
    "GenLit": ("de-genesi-ad-litteram", "De Genesi ad litteram", "The Literal Meaning of Genesis", "O sentido literal do Gênesis", "El sentido literal del Génesis"),
    "QsHept": ("quaestiones-in-heptateuchum", "Quaestiones in Heptateuchum", "Questions on the Heptateuch", "Questões sobre o Heptateuco", "Cuestiones sobre el Heptateuco"),
    "ExpHept": ("locutiones-in-heptateuchum", "Locutiones in Heptateuchum", "Expressions in the Heptateuch", "Locuções do Heptateuco", "Locuciones del Heptateuco"),
    "Job": ("annotationes-in-iob", "Annotationes in Iob", "Notes on Job", "Anotações sobre Jó", "Anotaciones sobre Job"),
    "8QsOT": ("de-octo-quaestionibus-vt", "De octo quaestionibus ex Veteri Testamento", "Eight Questions from the Old Testament", "As oito questões do Antigo Testamento", "Las ocho cuestiones del Antiguo Testamento"),
    "Jews": ("adversus-iudaeos", "Adversus Iudaeos", "Answer to the Jews", "Contra os judeus", "Contra los judíos"),
    "SermMt": ("de-sermone-domini-in-monte", "De sermone Domini in monte", "The Lord's Sermon on the Mount", "O Sermão do Senhor na Montanha", "El sermón del Señor en la montaña"),
    "Consensu": ("de-consensu-evangelistarum", "De consensu Evangelistarum", "Agreement among the Evangelists", "A harmonia dos evangelistas", "La concordancia de los evangelistas"),
    "QsGosp": ("quaestiones-evangeliorum", "Quaestiones Evangeliorum", "Questions on the Gospels", "Questões sobre os Evangelhos", "Cuestiones sobre los Evangelios"),
    "QsMatt": ("quaestiones-xvii-in-matthaeum", "Quaestiones septendecim in Evangelium secundum Matthaeum", "Seventeen Questions on Matthew", "Dezessete questões sobre Mateus", "Diecisiete cuestiones sobre Mateo"),
    "Mirror": ("speculum", "De Scriptura sacra speculum", "The Mirror of Sacred Scripture", "O espelho da Sagrada Escritura", "El espejo de la Sagrada Escritura"),
    "PropRom": ("propositiones-ad-romanos", "Expositio quarumdam propositionum ex Epistola ad Romanos", "Commentary on Statements in the Letter to the Romans", "Exposição de algumas proposições da Carta aos Romanos", "Exposición de algunas proposiciones de la Epístola a los Romanos"),
    "InchoRom": ("inchoata-expositio-ad-romanos", "Epistolae ad Romanos inchoata expositio", "Unfinished Commentary on the Letter to the Romans", "Exposição inacabada da Carta aos Romanos", "Exposición inconclusa de la Carta a los Romanos"),
    "Gal": ("expositio-ad-galatas", "Expositio Epistolae ad Galatas", "Commentary on the Letter to the Galatians", "Exposição da Carta aos Gálatas", "Exposición de la Carta a los Gálatas"),
    "Heres": ("de-haeresibus", "De haeresibus", "Heresies", "As heresias", "Las herejías"),
    "PrisOrig": ("contra-priscillianistas", "Contra Priscillianistas et Origenistas", "A Refutation of the Priscillianists and Origenists", "Contra os priscilianistas e os origenistas", "Contra los priscilianistas y los origenistas"),
    "ArianSerm": ("contra-sermonem-arianorum", "Contra sermonem Arianorum", "Answer to an Arian Sermon", "Contra um sermão dos arianos", "Contra un sermón de los arrianos"),
    "DebateMax": ("collatio-cum-maximino", "Collatio cum Maximino Arianorum episcopo", "Debate with Maximinus", "Debate com Maximino", "Debate con Maximino"),
    "ContraMax": ("contra-maximinum", "Contra Maximinum Arianum", "Answer to Maximinus the Arian", "Contra Maximino, o ariano", "Contra Maximino, el arriano"),
    "LawProph": ("contra-adversarium-legis", "Contra adversarium legis et prophetarum", "Answer to an Enemy of the Law and the Prophets", "Contra o adversário da Lei e dos Profetas", "Contra el adversario de la Ley y los Profetas"),
    "WaysLife": ("de-moribus-ecclesiae", "De moribus Ecclesiae catholicae et de moribus Manichaeorum", "The Catholic Way of Life and the Manichean Way of Life", "Os costumes da Igreja Católica e os costumes dos maniqueus", "Las costumbres de la Iglesia católica y las costumbres de los maniqueos"),
    "TwoSouls": ("de-duabus-animabus", "De duabus animabus", "The Two Souls", "As duas almas", "Las dos almas"),
    "DebateFort": ("contra-fortunatum", "Acta seu disputatio contra Fortunatum Manichaeum", "A Debate with Fortunatus, a Manichean", "Debate com Fortunato, o maniqueu", "Debate con Fortunato, el maniqueo"),
    "Adiman": ("contra-adimantum", "Contra Adimantum Manichaei discipulum", "Answer to Adimantus, a Disciple of Mani", "Contra Adimanto, discípulo de Mani", "Contra Adimanto, discípulo de Mani"),
    "LetterMani": ("contra-epistolam-fundamenti", "Contra epistolam Manichaei quam vocant Fundamenti", "Answer to the Letter of Mani Known as The Foundation", "Contra a carta de Mani chamada do Fundamento", "Contra la carta de Mani llamada del Fundamento"),
    "Felix": ("contra-felicem", "Contra Felicem Manichaeum", "Answer to Felix, a Manichean", "Contra Félix, o maniqueu", "Contra Félix, el maniqueo"),
    "NatureGood": ("de-natura-boni", "De natura boni", "The Nature of the Good", "A natureza do bem", "La naturaleza del bien"),
    "Secundinus": ("contra-secundinum", "Contra Secundinum Manichaeum", "Answer to Secundinus, a Manichean", "Contra Secundino, o maniqueu", "Contra Secundino, el maniqueo"),
    "Faustus": ("contra-faustum", "Contra Faustum Manichaeum", "Answer to Faustus, a Manichean", "Contra Fausto, o maniqueu", "Contra Fausto, el maniqueo"),
    "PsDon": ("psalmus-contra-partem-donati", "Psalmus contra partem Donati", "Psalm against the Party of Donatus", "Salmo contra o partido de Donato", "Salmo contra el partido de Donato"),
    "Petilian": ("contra-litteras-petiliani", "Contra litteras Petiliani", "Answer to the Writings of Petilian", "Contra as cartas de Petiliano", "Contra las cartas de Petiliano"),
    "Parmen": ("contra-epistolam-parmeniani", "Contra epistolam Parmeniani", "Answer to the Letter of Parmenian", "Contra a carta de Parmeniano", "Contra la carta de Parmeniano"),
    "Baptism": ("de-baptismo", "De baptismo", "Baptism", "O batismo", "El bautismo"),
    "LetterDon": ("epistola-ad-catholicos", "Epistola ad Catholicos de secta Donatistarum", "Letter to Catholics on the Sect of the Donatists", "Carta aos católicos sobre a seita dos donatistas", "Carta a los católicos sobre la secta de los donatistas"),
    "Crescon": ("contra-cresconium", "Contra Cresconium grammaticum Donatistam", "Answer to Cresconius the Donatist Grammarian", "Contra Crescônio, o gramático donatista", "Contra Cresconio, el gramático donatista"),
    "UnicoBap": ("de-unico-baptismo", "De unico baptismo contra Petilianum", "The One Baptism, in Answer to Petilian", "O único batismo, contra Petiliano", "El único bautismo, contra Petiliano"),
    "Brev": ("breviculus-collationis", "Breviculus collationis cum Donatistis", "A Summary of the Meeting with the Donatists", "Resumo da conferência com os donatistas", "Resumen de la conferencia con los donatistas"),
    "PostColl": ("post-collationem", "Post collationem contra Donatistas", "To the Donatists after the Conference", "Aos donatistas depois da conferência", "A los donatistas después de la conferencia"),
    "Caesar": ("sermo-ad-caesariensis", "Sermo ad Caesariensis Ecclesiae plebem", "Sermon to the People of the Church of Caesarea", "Sermão ao povo da Igreja de Cesareia", "Sermón al pueblo de la Iglesia de Cesarea"),
    "deGestis": ("de-gestis-cum-emerito", "De gestis cum Emerito Donatistarum episcopo", "The Proceedings with Emeritus", "As atas com Emérito", "Las actas con Emérito"),
    "Gaudentium": ("contra-gaudentium", "Contra Gaudentium Donatistarum episcopum", "Answer to Gaudentius, a Donatist Bishop", "Contra Gaudêncio, bispo donatista", "Contra Gaudencio, obispo donatista"),
    "Gesta": ("collatio-carthaginensis", "Gesta collationis Carthaginensis", "Proceedings of the Conference of Carthage", "Atas da Conferência de Cartago", "Actas de la Conferencia de Cartago"),
    "VersNabor": ("versus-de-nabore", "Versus de Nabore", "Verses on Nabor", "Versos sobre Nabor", "Versos sobre Nabor"),
    "DPMe": ("de-peccatorum-meritis", "De peccatorum meritis et remissione et de baptismo parvulorum", "The Punishment and Forgiveness of Sins and the Baptism of Little Ones", "O castigo e o perdão dos pecados e o batismo das crianças", "El castigo y el perdón de los pecados y el bautismo de los niños"),
    "DSeL": ("de-spiritu-et-littera", "De spiritu et littera", "The Spirit and the Letter", "O espírito e a letra", "El espíritu y la letra"),
    "DNeG": ("de-natura-et-gratia", "De natura et gratia", "Nature and Grace", "A natureza e a graça", "La naturaleza y la gracia"),
    "DPIH": ("de-perfectione-iustitiae", "De perfectione iustitiae hominis", "The Perfection of Human Righteousness", "A perfeição da justiça do homem", "La perfección de la justicia del hombre"),
    "DeGP": ("de-gestis-pelagii", "De gestis Pelagii", "The Deeds of Pelagius", "Os atos de Pelágio", "Los actos de Pelagio"),
    "DGCe": ("de-gratia-christi", "De gratia Christi et de peccato originali", "The Grace of Christ and Original Sin", "A graça de Cristo e o pecado original", "La gracia de Cristo y el pecado original"),
    "DAeE": ("de-anima-et-eius-origine", "De anima et eius origine", "The Nature and Origin of the Soul", "A alma e a sua origem", "El alma y su origen"),
    "deNuptiis": ("de-nuptiis-et-concupiscentia", "De nuptiis et concupiscentia", "Marriage and Desire", "As núpcias e a concupiscência", "Las nupcias y la concupiscencia"),
    "Duas": ("contra-duas-epistulas", "Contra duas epistulas Pelagianorum", "Answer to the Two Letters of the Pelagians", "Contra as duas cartas dos pelagianos", "Contra dos cartas de los pelagianos"),
    "Iulianum": ("contra-iulianum", "Contra Iulianum", "Answer to Julian", "Contra Juliano", "Contra Juliano"),
    "JulianImp": ("contra-iulianum-imperfectum", "Contra secundam Iuliani responsionem opus imperfectum", "Unfinished Work in Answer to Julian", "Obra inacabada contra Juliano", "Obra inconclusa contra Juliano"),
    "Grace": ("de-gratia-et-libero-arbitrio", "De gratia et libero arbitrio", "Grace and Free Choice", "A graça e o livre-arbítrio", "La gracia y el libre albedrío"),
    "Rebuke": ("de-correptione-et-gratia", "De correptione et gratia", "Rebuke and Grace", "A correção e a graça", "La corrección y la gracia"),
    "Predest": ("de-praedestinatione-sanctorum", "De praedestinatione sanctorum", "The Predestination of the Saints", "A predestinação dos santos", "La predestinación de los santos"),
    "Persev": ("de-dono-perseverantiae", "De dono perseverantiae", "The Gift of Perseverance", "O dom da perseverança", "El don de la perseverancia"),
    "GosJohn": ("in-iohannis-evangelium", "In Iohannis Evangelium tractatus", "Homilies on the Gospel of John", "Tratados sobre o Evangelho de João", "Tratados sobre el Evangelio de Juan"),
    "EpJohn": ("in-epistulam-iohannis", "In Epistulam Iohannis ad Parthos tractatus", "Homilies on the First Epistle of John", "Homilias sobre a Primeira Carta de João", "Homilías sobre la Primera Carta de Juan"),
}

# Volumes the site splits only for size, joined into one book each; every
# volume becomes a TOC group. series id → (category, la, en-US, pt-BR, es-419,
# [(abbr, la, en-US, pt-BR, es-419)]).
SERIES = {
    "epistulae": ("Letters", "Epistulae", "Letters", "Cartas", "Cartas", [
        ("Ep1-99", "Epistulae 1–99", "Letters 1–99", "Cartas 1–99", "Cartas 1–99"),
        ("Ep100-155", "Epistulae 100–155", "Letters 100–155", "Cartas 100–155", "Cartas 100–155"),
        ("Ep156-210", "Epistulae 156–210", "Letters 156–210", "Cartas 156–210", "Cartas 156–210"),
        ("Ep211-270", "Epistulae 211–270, 1*–29*", "Letters 211–270, 1*–29*", "Cartas 211–270, 1*–29*", "Cartas 211–270, 1*–29*"),
    ]),
    "sermones": ("Sermons", "Sermones", "Sermons", "Sermões", "Sermones", [
        ("Sermons1", "Sermones 1–19", "Sermons 1–19", "Sermões 1–19", "Sermones 1–19"),
        ("Sermons2", "Sermones 20–50", "Sermons 20–50", "Sermões 20–50", "Sermones 20–50"),
        ("Sermons3", "Sermones 51–94", "Sermons 51–94", "Sermões 51–94", "Sermones 51–94"),
        ("Sermons4", "Sermones 94A–147A", "Sermons 94A–147A", "Sermões 94A–147A", "Sermones 94A–147A"),
        ("Sermons5", "Sermones 148–183", "Sermons 148–183", "Sermões 148–183", "Sermones 148–183"),
        ("Sermons6", "Sermones 184–229Z", "Sermons 184–229Z", "Sermões 184–229Z", "Sermones 184–229Z"),
        ("Sermons7", "Sermones 230–272Z", "Sermons 230–272Z", "Sermões 230–272Z", "Sermones 230–272Z"),
        ("Sermons8", "Sermones 273–305A", "Sermons 273–305A", "Sermões 273–305A", "Sermones 273–305A"),
        ("Sermons9", "Sermones 306–340A", "Sermons 306–340A", "Sermões 306–340A", "Sermones 306–340A"),
        ("Sermons10", "Sermones 341–400", "Sermons 341–400", "Sermões 341–400", "Sermones 341–400"),
        ("SermonsNew", "Sermones nuper reperti", "Newly Discovered Sermons", "Sermões recém-descobertos", "Sermones recién descubiertos"),
        ("SermSup", "Sermones supplementarii", "Supplementary Sermons", "Sermões suplementares", "Sermones suplementarios"),
    ]),
    "enarrationes-in-psalmos": ("Expositions of the Psalms", "Enarrationes in Psalmos", "Expositions of the Psalms", "Comentários aos Salmos", "Comentarios a los Salmos", [
        ("Ps1-32", "Psalmi 1–32", "Psalms 1–32", "Salmos 1–32", "Salmos 1–32"),
        ("Ps33-50", "Psalmi 33–50", "Psalms 33–50", "Salmos 33–50", "Salmos 33–50"),
        ("Ps51-72", "Psalmi 51–72", "Psalms 51–72", "Salmos 51–72", "Salmos 51–72"),
        ("Ps73-98", "Psalmi 73–98", "Psalms 73–98", "Salmos 73–98", "Salmos 73–98"),
        ("Ps99-120", "Psalmi 99–120", "Psalms 99–120", "Salmos 99–120", "Salmos 99–120"),
        ("Ps121-150", "Psalmi 121–150", "Psalms 121–150", "Salmos 121–150", "Salmos 121–150"),
    ]),
}

# ── Row classification ──────────────────────────────────────────────────

HEADERS = "abcdefghij"
HASH_HEADERS = "klmnopqrst"
QUOTE_STYLES = "vx"
# Characters of (English) text past which a unit is read as several pages,
# split one level down.
MAX_UNIT_CHARS = 200_000
# A header carried in the text rather than the style string (`<b>Book
# One</b>`, a letter's number) ranks as a Book (style c).
PSEUDO_LEVEL = HEADERS.index("c")

# Rows of the Letters, Sermons and Psalms volumes that open a new document:
# `<b>LETTER 100</b><br>salutation`, `<b>Sermon 51</b><br>title`,
# `Exposition of Psalm 33`. Matched on the English row, which is the most
# regular; the split then applies to every language at the same position.
DOC_LABEL_RE = re.compile(
    r"^\s*(?:<b>)?\s*(?:"
    r"(?:LETTER|Letter|Sermon|SERMON|Exposition of Psalm|On the Same Psalm)\s+[0-9][0-9A-Za-z/*]*"
    r"|Sermon on [^<]{3,80}"
    r"|\(Erfurt \d+[^)]*\)"
    r")\s*(?:</b>)?(?:\s*\([^)]*\))*\s*(?:<br>|$)"
)
WHOLE_BOLD_RE = re.compile(r"^\s*<b>([^<]{1,80})</b>\s*$")
FN_RE = re.compile(r"<fn>(.*?)</fn>", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
# A short structural label like "Chapter 6 (33)", "Caput VI", "Book 1".
LABEL_RE = re.compile(r"^[^\W\d]+\s+(?:[0-9]+[a-z]?|[IVXLCDM]+)\b[^.:;]{0,24}$")


def plain(html: str) -> str:
    return re.sub(r"\s+", " ", TAG_RE.sub("", FN_RE.sub("", html or ""))).strip()


def header_level(style: str) -> int | None:
    if style in HEADERS:
        return HEADERS.index(style)
    if style in HASH_HEADERS:
        return HASH_HEADERS.index(style)
    return None


def classify(styles: str, en: list[str], series: bool) -> list[tuple[str, int]]:
    """(kind, level) per row: kind is skip | head | doc | body | quote | list."""
    out: list[tuple[str, int]] = [("skip", 0)]  # row 0 is the work's title
    styled: list[int] = []  # levels of the style string's own header rows
    for i in range(1, len(styles)):
        style, text = styles[i], plain(en[i])
        if not text:
            out.append(("skip", 0))
            continue
        level = header_level(style)
        # Some works tag every row as a header ('a' throughout the Speculum);
        # a header that runs to prose length is body text.
        if level is not None and len(text) <= (120 if style == "a" else 300):
            out.append(("head", level))
            styled.append(level)
        elif series and DOC_LABEL_RE.match(en[i]):
            out.append(("doc", PSEUDO_LEVEL))
        elif WHOLE_BOLD_RE.match(en[i]):
            out.append(("head", PSEUDO_LEVEL if not series else HEADERS.index("j")))
        elif style in QUOTE_STYLES:
            out.append(("quote", 0))
        elif style == "w":
            out.append(("list", 0))
        else:
            out.append(("body", 0))
    # In a volume with real header rows ("Exposition of Psalm 18"), a
    # document label in the text ("On the Same Psalm 18") is their sibling.
    if styled:
        out = [("doc", min(styled)) if k == "doc" else (k, lv) for k, lv in out]
    return out


BOOK_NUM_RE = re.compile(r"^\s*<b>\s*(\d+)\s*\.\s*\d+\s*\.\s*\d+\s*\.?\s*</b>")


def flat_book_starts(kinds: list[tuple[str, int]], la: list[str]) -> list[int]:
    """Rows where a new Book begins, for works with no header rows whose
    paragraphs carry three-part Maurist numbers (`<b>2. 1. 1.</b>`)."""
    starts, current = [], None
    numbered = [i for i, (k, _) in enumerate(kinds) if k == "body" and la[i].lstrip().startswith("<b>")]
    three = [i for i in numbered if BOOK_NUM_RE.match(la[i])]
    if len(three) < 0.8 * max(len(numbered), 1):
        return []
    for i in three:
        book = int(BOOK_NUM_RE.match(la[i]).group(1))
        if book != current:
            starts.append(i)
            current = book
    return starts if len(starts) > 1 else []


# ── Units (one chapter file each, or a TOC group) ───────────────────────

@dataclass
class Unit:
    rows: list[int]                 # positions, in order; leading title rows included
    title_rows: list[int]           # rows merged into the H1 / TOC label
    children: list["Unit"] = field(default_factory=list)
    synthetic_title: dict | None = None   # localized title when no row carries one


def _merge_title_rows(rows: list[int], kinds) -> list[int]:
    """The cut row plus the following header rows at the same level
    ("Liber I" + its subject line)."""
    first = rows[0]
    if kinds[first][0] not in ("head", "doc"):
        return []
    title = [first]
    for r in rows[1:]:
        if kinds[r][0] == "skip":
            continue
        if kinds[r][0] == "head" and kinds[r][1] <= kinds[first][1]:
            title.append(r)
            continue
        break
    return title


def _has_body(rows, kinds) -> bool:
    return any(kinds[r][0] in ("body", "quote", "list") for r in rows)


def split_rows(rows: list[int], kinds, sizes: list[int], depth: int = 0) -> list[Unit]:
    """Cut `rows` at its shallowest repeated header level. A Book-level cut
    (or a Letter, Sermon, Psalm) always makes separate pages; a deeper one
    only when the text is too long to read as one page, so that a work
    whose only headers are its chapter titles stays one page."""
    heads = [r for r in rows if kinds[r][0] in ("head", "doc")]
    counts: dict[int, int] = {}
    for r in heads:
        counts[kinds[r][1]] = counts.get(kinds[r][1], 0) + 1
    repeated = sorted(lv for lv, n in counts.items() if n >= 2)
    if not repeated or (repeated[0] > PSEUDO_LEVEL and sum(sizes[r] for r in rows) <= MAX_UNIT_CHARS):
        return [Unit(rows=rows, title_rows=[])]
    level = repeated[0]
    cuts = []
    for r in heads:
        if kinds[r][1] > level:
            continue
        # "Liber I" then its subject line: one unit, not an empty one.
        if cuts and not _has_body(range(cuts[-1], r), kinds):
            continue
        cuts.append(r)
    units: list[Unit] = []
    bounds = [rows[0]] + cuts if cuts[0] != rows[0] else cuts
    for k, start in enumerate(bounds):
        end = bounds[k + 1] if k + 1 < len(bounds) else rows[-1] + 1
        seg = [r for r in rows if start <= r < end]
        if not _has_body(seg, kinds):
            # Leading rows 1–2 are the work title's dedication ("to Marcellinus").
            if seg[0] > 2 and any(kinds[r][0] != "skip" for r in seg):
                print(f"    dropped a unit with no body: rows {seg[0]}–{seg[-1]}")
            continue
        unit = Unit(rows=seg, title_rows=_merge_title_rows(seg, kinds))
        if depth == 0 and sum(sizes[r] for r in seg) > MAX_UNIT_CHARS:
            inner = [r for r in seg if r not in unit.title_rows]
            children = split_rows(inner, kinds, sizes, depth + 1)
            if len(children) > 1:
                unit.children = children
        units.append(unit)
    return units


# ── Markdown ────────────────────────────────────────────────────────────

# Only entities markdown would otherwise print literally are decoded. `&lt;`
# and `&gt;` stay encoded: the Latin marks editorial supplements as
# <loquuntur>, which decoded would be swallowed by the reader as an HTML tag.
ENTITIES = {"&nbsp;": " ", "&quot;": '"', "&#39;": "'", "&apos;": "'"}


def _balance(html_: str) -> str:
    """Drop a stray `</b>`/`</i>` and close what a row leaves open; a few
    source rows are unbalanced, and one bad markdown delimiter can run on to
    the end of the page."""
    out, open_tags, pos = [], [], 0
    for m in re.finditer(r"<(/?)(b|i)>", html_):
        out.append(html_[pos:m.start()])
        pos = m.end()
        tag = m.group(2)
        if not m.group(1):
            # Italic inside italic means nothing here and would toggle the
            # markdown delimiter, so a repeated opener is dropped.
            if tag not in open_tags:
                open_tags.append(tag)
                out.append(f"<{tag}>")
        elif tag in open_tags:
            # Close inner spans first so the nesting stays well-formed.
            while open_tags:
                t = open_tags.pop()
                out.append(f"</{t}>")
                if t == tag:
                    break
    out.append(html_[pos:])
    out += [f"</{t}>" for t in reversed(open_tags)]
    return "".join(out)


KNOWN_TAG_RE = re.compile(r"(</?(?:b|i|B|I|bsc)>|<br\s*/?>)")


def _lower_tags(html_: str) -> str:
    return re.sub(r"<(/?)([BI])>", lambda m: f"<{m.group(1)}{m.group(2).lower()}>", html_)


def _escape_brackets(html_: str) -> str:
    """The engine's markup is only b, i (either case), bsc and br; fn is
    split off before. Any other angle bracket is the edition's own: `<...>`
    for an omission, `<legem>` for a supplied word."""
    parts = KNOWN_TAG_RE.split(html_)
    return "".join(p if k % 2 else p.replace("<", "&lt;").replace(">", "&gt;") for k, p in enumerate(parts))


def _inline(html: str) -> str:
    s = _lower_tags(_escape_brackets(html))
    s = re.sub(r"<br\s*/?>", "\x02", _balance(s))
    s = re.sub(r"</?bsc>", "", s)
    # Whitespace inside an emphasis span breaks the markdown delimiter.
    for _ in range(2):
        s = re.sub(r"<(b|i)>(\s+)", r"\2<\1>", s)
        s = re.sub(r"(\s+)</(b|i)>", r"</\2>\1", s)
        s = re.sub(r"<(b|i)>([\s\x02]*)</\1>", r"\2", s)
        s = re.sub(r"</(b|i)><\1>", "", s)
    s = re.sub(r"<(?!/?(?:b|i)>)[^>]+>", "", s)
    for k, v in ENTITIES.items():
        s = s.replace(k, v)
    s = s.replace("\\", "\\\\").replace("*", "\\*").replace("_", "\\_")
    return s.replace("<b>", "**").replace("</b>", "**").replace("<i>", "*").replace("</i>", "*")


def inline_md(html: str, notes: list[str] | None) -> str:
    """Row HTML → inline markdown; `\x02` marks a line break. Footnotes
    become `[^n]` refs appended to `notes`, or are dropped when `notes` is
    None (TOC labels)."""
    parts = FN_RE.split(html or "")  # odd indices are footnote bodies
    out = []
    for k, part in enumerate(parts):
        if k % 2 == 0:
            out.append(_inline(part))
        elif notes is not None:
            notes.append(re.sub(r"\s+", " ", _inline(part).replace("\x02", " ")).strip())
            out.append(f"[^{len(notes)}]")
    return re.sub(r"[ \t]+", " ", "".join(out)).strip()


def _block_start(md: str) -> str:
    """Neutralize a line start that markdown would read as structure. An
    author's paragraph number (`1. `) becomes inert bold, the house form."""
    md = re.sub(r"^(\d+[a-z]?)\.\s", r"**\1.** ", md)
    md = re.sub(r"^([#>+\-])", r"\\\1", md)
    return md


SMALL_WORDS = {
    "a", "an", "and", "of", "the", "to", "in", "on", "for", "with", "against", "from", "by",
    "e", "o", "os", "as", "de", "da", "do", "das", "dos", "em", "ao", "aos", "à", "às", "contra", "para", "com", "por", "sobre", "na", "no",
    "et", "ad", "cum", "ex", "seu", "vel", "pro", "qui", "quae", "quod",
    "y", "el", "la", "los", "las", "del", "al", "en", "con", "sobre",
}
ROMAN_RE = re.compile(r"^[IVXLCDM]+[.,:;]?$")


def uncap(t: str) -> str:
    """Title-case a heading the edition sets in capitals ("BOOK ONE",
    "LETTER TO COUNT VALERIUS"); proper nouns keep their capital this way."""
    letters = [c for c in re.sub(r"\[\^\d+\]", "", t) if c.isalpha()]
    if len(letters) < 4 or not all(c.isupper() for c in letters):
        return t
    words = t.split(" ")
    out = []
    for n, w in enumerate(words):
        core = w.strip("*()[]\"'.,:;—–-")
        if ROMAN_RE.match(core) and core not in ("I",) or not core:
            out.append(w)
        elif n and core.lower() in SMALL_WORDS and not words[n - 1].endswith((".", ":")):
            out.append(w.lower())
        else:
            k = next((j for j, c in enumerate(w) if c.isalpha()), 0)
            out.append(w[: k + 1] + w[k + 1 :].lower())
    return " ".join(out)


def heading_text(rows: list[int], doc: list[str], kinds, notes) -> str:
    """Join a run of header rows: "Chapter 1" + "How shall we call upon God?"
    → "Chapter 1: How shall we call upon God?"."""
    parts: list[str] = []
    for r in rows:
        if kinds[r][0] == "doc":
            parts.append(doc_parts(doc[r], notes)[0])
            continue
        t = inline_md(doc[r], notes).replace("\x02", " — ")
        t = re.sub(r"^\*\*(.*)\*\*$", r"\1", t)
        if t:
            parts.append(uncap(t))
    if not parts:
        return ""
    out = parts[0]
    for p in parts[1:]:
        out += (" " if out.endswith((":", "—", "–")) else ": ") + p
    return out


def split_br(html_: str) -> list[str]:
    """Split row HTML at `<br>`, closing and reopening any `<b>`/`<i>` that
    spans the break, so each piece is well-formed on its own."""
    out, open_tags = [], []
    for seg in re.split(r"<br\s*/?>", _lower_tags(html_ or ""), flags=re.I):
        reopened = "".join(f"<{t}>" for t in open_tags)
        for m in re.finditer(r"<(/?)(b|i)>", seg):
            tag = m.group(2)
            if not m.group(1):
                open_tags.append(tag)
            elif tag in open_tags:
                open_tags.remove(tag)
        out.append(reopened + seg + "".join(f"</{t}>" for t in reversed(open_tags)))
    return out


def doc_parts(html: str, notes) -> tuple[str, list[str]]:
    """Split a document-opening row into (title, body paragraphs).
    `<b>Sermon 51</b><br>On the Agreement …` → "Sermon 51: On the Agreement …";
    the Latin's plainer "SERMO 51 - DE CONSONANTIA …" likewise. A letter
    keeps only its number as title; its salutation, like any long text after
    the label, stays in the body."""
    segs = [x for x in split_br(html) if plain(x)]
    if not segs:
        return "", []
    label = inline_md(segs[0], None)
    rest = segs[1:]
    if not rest and " - " in label:
        label, _, sub = label.partition(" - ")
        rest = [sub]
    label = uncap(re.sub(r"^\*\*(.*?)\*\*", r"\1", label.strip()).strip())
    first, sep, tail = label.partition(" ")
    if first.isalpha() and first.isupper():  # "SERMO de providentia Dei"
        label = first.capitalize() + sep + tail
    is_letter = re.match(r"(?i)(epistola|epistula|letter|carta)\b", label)
    if rest and not is_letter and len(plain(rest[0])) <= 200 and not re.match(r"\s*(?:<b>)?\s*\d", rest[0]):
        label = f"{label}: {uncap(re.sub(r'^\*\*(.*)\*\*$', r'\1', inline_md(rest[0], None)))}"
        rest = rest[1:]
    return label, [inline_md(x, notes) for x in rest]


def render_unit(unit: Unit, doc: list[str], kinds, title: str, notes: list[str]) -> str:
    lines = [f"# {title}", ""]
    title_set = set(unit.title_rows)
    if unit.title_rows and kinds[unit.title_rows[0]][0] == "doc":
        for para in doc_parts(doc[unit.title_rows[0]], notes)[1]:
            lines += [_block_start(para), ""]
    rows = [r for r in unit.rows if r not in title_set]
    # The unit's shallowest inner header is an H2, whatever its level.
    inner = sorted({kinds[r][1] for r in rows if kinds[r][0] in ("head", "doc")})
    level_rank = {lv: n for n, lv in enumerate(inner)}
    i = 0
    while i < len(rows):
        r = rows[i]
        kind, level = kinds[r]
        if kind == "skip":
            i += 1
            continue
        if kind in ("head", "doc"):
            run = [r]
            # A bare label takes the header row that follows as its title.
            if LABEL_RE.match(plain(doc[r]) or "") and i + 1 < len(rows) and kinds[rows[i + 1]][0] == "head":
                run.append(rows[i + 1])
                i += 1
            text = heading_text(run, doc, kinds, notes)
            if text:
                depth = min(6, 2 + level_rank[level])
                lines += [f"{'#' * depth} {text}", ""]
            i += 1
            continue
        md = inline_md(doc[r], notes)
        if not md:
            i += 1
            continue
        paras = [_block_start(p.strip()) for p in md.split("\x02") if p.strip()]
        if kind == "quote":
            lines += ["> " + "  \n> ".join(paras), ""]
        elif kind == "list":
            lines += ["- " + "  \n  ".join(paras), ""]
        else:
            lines += ["  \n".join(paras), ""]
        i += 1
    if notes:
        lines += [f"[^{n}]: {text}" for n, text in enumerate(notes, 1)]
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


# ── Books ───────────────────────────────────────────────────────────────

BOOK_WORD = {"la": "Liber", "en-US": "Book", "pt-BR": "Livro", "es-419": "Libro"}
ROMAN = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]


def roman(n: int) -> str:
    out = ""
    for v, s in ROMAN:
        while n >= v:
            out, n = out + s, n - v
    return out


NOTE_RE = re.compile(r"\s*\[nota\b")


def clean_spanish(html_: str) -> str:
    """The Spanish carries its translators' notes inline, in brackets.
    `[nota 3: Censorino, Sobre el día natal 10.3]` is a reference, often one
    restored from the digital Latin edition, and becomes a footnote;
    `[nota de referencia: …]`, `[nota textual: …]`, `[nota de fuente: …]` and
    the like record how the translation was made and are dropped. Brackets
    nest (`12 [13]`), so each note runs to its matching bracket."""
    out, pos = [], 0
    for m in NOTE_RE.finditer(html_):
        if m.start() < pos:
            continue
        depth, j = 0, html_.index("[", m.start())
        for j in range(j, len(html_)):
            depth += {"[": 1, "]": -1}.get(html_[j], 0)
            if depth == 0:
                break
        body = html_[html_.index("[", m.start()) + 1 : j]
        out.append(html_[pos : m.start()])
        pos = j + 1
        before = "".join(out)
        in_note = before.count("<fn>") > before.count("</fn>")
        numbered = re.match(r"nota \d+:\s*(.*)", body, re.S)
        if numbered and not in_note:
            out.append(f"<fn>{numbered.group(1).strip()}</fn>")
    out.append(html_[pos:])
    return "".join(out)


def load_work(abbr: str, series: bool):
    """The work's style string, its documents keyed by rendition (in
    RENDITIONS order) and the row kinds read off the English."""
    w = work_by_abbr(abbr)
    styles, _ = structure(w["wid"])
    docs = {lang: cells(w["dids"][lang], len(styles)) for lang in RENDITIONS if lang in w["dids"]}
    if "es-419" in docs:
        docs["es-419"] = [clean_spanish(h) for h in docs["es-419"]]
    kinds = classify(styles, docs["en-US"], series)
    return w, styles, docs, kinds


def work_units(abbr: str, series: bool):
    w, styles, docs, kinds = load_work(abbr, series)
    rows = [i for i in range(1, len(styles))]
    if not any(k == "head" or k == "doc" for k, _ in kinds):
        starts = flat_book_starts(kinds, docs["la"])
        if starts:
            bounds = [1] + starts[1:]
            units = []
            for n, start in enumerate(bounds):
                end = bounds[n + 1] if n + 1 < len(bounds) else len(styles)
                units.append(Unit(rows=list(range(start, end)), title_rows=[],
                                  synthetic_title={lang: f"{BOOK_WORD[base_lang(lang)]} {roman(n + 1)}" for lang in docs}))
            return w, docs, kinds, units
    sizes = [len(plain(h)) for h in docs["en-US"]]
    return w, docs, kinds, split_rows(rows, kinds, sizes)


def _localized(d: dict, lang: str) -> str:
    return d.get(lang) or d.get(base_lang(lang)) or d["en-US"]


def unit_title(unit: Unit, docs, kinds, fallback: dict) -> dict:
    """Title per rendition. A rendition whose own header rows are empty
    (Pusey sets no chapter titles) takes its language's, then the English."""
    if unit.synthetic_title:
        return unit.synthetic_title
    out = {}
    for lang in docs:
        for source in (lang, base_lang(lang), "en-US"):
            t = heading_text(unit.title_rows, docs[source], kinds, None) if unit.title_rows else ""
            if t:
                break
        out[lang] = t or _localized(fallback, lang)
    return out


def toc_label(md_title: str) -> str:
    t = re.sub(r"\[\^\d+\]", "", md_title)
    t = re.sub(r"\\([*_\\#>+\-])", lambda m: "\x03" if m.group(1) == "*" else m.group(1), t)
    t = t.replace("*", "").replace("\x03", "*")
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def _has_text(unit: Unit, doc: list[str], kinds) -> bool:
    return any(plain(doc[r]) for r in unit.rows if kinds[r][0] in ("body", "quote", "list"))


def emit_units(units: list[Unit], docs, kinds, out_dir: Path, prefix: str, book_title: dict, used: set, written: set) -> list[dict]:
    toc = []
    for n, unit in enumerate(units, 1):
        node_id = f"{prefix}ch{n:03d}" if not unit.children else f"{prefix}p{n:02d}"
        title = unit_title(unit, docs, kinds, book_title)
        # Two expositions of one psalm share a heading; number them.
        for lang in docs:
            base, k = title[lang], 2
            while (lang, title[lang]) in used:
                title[lang] = f"{base} ({k})"
                k += 1
            used.add((lang, title[lang]))
        node = {"id": node_id, "title": {lang: toc_label(title[lang]) for lang in docs}}
        if unit.children:
            node["children"] = emit_units(unit.children, docs, kinds, out_dir, f"{node_id}-", title, used, written)
        else:
            for lang in docs:
                # Some translations cover only part of a work (Pilkington has
                # no Revisions chapter); they get no page there.
                if not _has_text(unit, docs[lang], kinds):
                    continue
                notes: list[str] = []
                md = render_unit(unit, docs[lang], kinds, title[lang], notes)
                dest = rendition_dir(out_dir, lang)
                dest.mkdir(parents=True, exist_ok=True)
                (dest / f"{node_id}.md").write_text(md, encoding="utf-8")
                written.add(lang)
        toc.append(node)
    return toc


def _source(rendition: str, abbr: str) -> dict:
    _, label, note, site = RENDITIONS[rendition]
    entry = {"language": base_lang(rendition), "url": f"{BASE}/{site}/{site}/~{abbr}", "description": note}
    return {**entry, "label": label} if label else entry


OWN_VERSIONS = {version_of(r) for r in RENDITIONS} - {None}


def _version_toc(nodes: list[dict], langs: list[str], out_dir: Path, match: bool = False) -> list[dict]:
    """The TOC of one version: the nodes it has pages for (or groups holding
    them), titled in its own languages. An older translation cut like the
    main text `match`es its nodes, so switching text keeps the reader's page."""
    out = []
    for node in nodes:
        children = _version_toc(node.get("children") or [], langs, out_dir, match)
        has_page = any((rendition_dir(out_dir, r) / f"{node['id']}.md").is_file() for r in langs)
        if not (children or has_page):
            continue
        entry = {"id": node["id"], "title": {base_lang(r): node["title"][r] for r in langs if r in node["title"]}}
        if match:
            entry["match"] = node["id"]
        if children:
            entry["children"] = children
        out.append(entry)
    return out


def write_book(out_dir: Path, book_id: str, names: dict, renditions: list[str], abbr: str, toc: list[dict]) -> None:
    """Write book.json: the main text at the top level, the older
    translations augustinus.cc carries as `versions`. What is not this
    importer's — descriptions, dates, versions merged in from elsewhere — is
    kept. The dates (`composed`) are J. J. O'Donnell's Chronological Table of
    Augustine's Works (asu.edu/lib/jod/augustine/chrontable.html), in his
    notation (`400/1`: one of the two years); three works he leaves undated
    take Wikipedia's Bibliography of Augustine, and those neither dates have
    none.
    meta_path = out_dir / "book.json"
    old = json.loads(meta_path.read_text()) if meta_path.is_file() else {}
    main = [r for r in renditions if version_of(r) is None]
    versions = []
    for v in sorted({version_of(r) for r in renditions} - {None}):
        langs = [r for r in renditions if version_of(r) == v]
        versions.append({
            "id": v,
            "languages": [base_lang(r) for r in langs],
            "sources": [_source(r, abbr) for r in langs],
            "toc": _version_toc(toc, langs, out_dir, match=True),
        })
    versions += [v for v in old.get("versions", []) if v["id"] not in OWN_VERSIONS]
    meta = {
        "id": book_id,
        "cover": "label",
        "name": names,
        "author": AUTHOR,
        **({"description": old["description"]} if "description" in old else {}),
        **({"composed": old["composed"]} if "composed" in old else {}),
        "languages": main,
        "sources": [_source(r, abbr) for r in main],
        "toc": _version_toc(toc, main, out_dir),
        **({"versions": versions} if versions else {}),
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _reset(out_dir: Path) -> None:
    for rendition in RENDITIONS:
        d = rendition_dir(out_dir, rendition)
        if d.is_dir():
            for f in d.glob("*.md"):
                f.unlink()


def build_work(abbr: str) -> None:
    slug, la, en, pt, es = WORKS[abbr]
    w = work_by_abbr(abbr)
    out_dir = BOOKS_ROOT / CATEGORIES[w["category"]][0] / slug
    print(f"{abbr:10} → {out_dir.relative_to(ROOT)}")
    _, docs, kinds, units = work_units(abbr, series=False)
    names = {"la": la, "en-US": en, "pt-BR": pt, "es-419": es}
    _reset(out_dir)
    written: set[str] = set()
    toc = emit_units(units, docs, kinds, out_dir, "", names, set(), written)
    write_book(out_dir, f"augustine-{slug}", names, [r for r in docs if r in written], abbr, toc)


def build_series(series_id: str) -> None:
    category, la, en, pt, es, volumes = SERIES[series_id]
    out_dir = BOOKS_ROOT / CATEGORIES[category][0]
    print(f"{series_id:10} → {out_dir.relative_to(ROOT)}")
    _reset(out_dir)
    toc, used, written = [], set(), set()
    for n, (abbr, vla, ven, vpt, ves) in enumerate(volumes, 1):
        _, docs, kinds, units = work_units(abbr, series=True)
        vtitle = {"la": vla, "en-US": ven, "pt-BR": vpt, "es-419": ves}
        prefix = f"v{n:02d}-"
        toc.append({"id": f"v{n:02d}", "title": vtitle,
                    "children": emit_units(units, docs, kinds, out_dir, prefix, vtitle, used, written)})
    names = {"la": la, "en-US": en, "pt-BR": pt, "es-419": es}
    write_book(out_dir, f"augustine-{series_id}", names, [r for r in RENDITIONS if r in written], volumes[0][0], toc)


def build(targets: list[str]) -> None:
    series_of = {abbr: sid for sid, s in SERIES.items() for abbr, *_ in s[5]}
    if not targets:
        targets = list(WORKS) + list(SERIES)
    for t in targets:
        if t in SERIES:
            build_series(t)
        elif t in series_of:
            build_series(series_of[t])
        else:
            build_work(t)


def main(argv: list[str]) -> None:
    cmd, *rest = argv or ["help"]
    if cmd == "fetch":
        fetch(rest)
    elif cmd == "dump":
        dump(rest[0], int(rest[1]) if len(rest) > 1 else 80)
    elif cmd == "build":
        build(rest)
    else:
        print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
