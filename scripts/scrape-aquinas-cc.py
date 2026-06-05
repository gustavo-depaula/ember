#!/usr/bin/env python3
"""Scrape aquinas.cc for works that aren't bilingually available in the
Geremia mirror — Romans, 2 Thess, 1–2 Tim, Titus, Isaiah, Jeremiah,
De Hebdomadibus, Liber de Causis, De Divinis Nominibus, De Malo (Latin
only), full Sentences commentary.

aquinas.cc uses the Shapcote-derived Aquinas Institute translation. Their
"AI Text Engine" is the software they assert copyright on; the underlying
Shapcote translation is PD (Benziger 1911–1925, pre-1929 US PD). Other
translations on the site (Gilhooly, Hannon, St. Hilaire, etc.) may still
be under copyright — documented per-work in `sources`.

The site backs each work with a `getCells` POST endpoint that returns
rows in document order, aligned across Latin and English documents by
position. `getStructure` returns a style string and an outline JSON tree
that maps positions to chapter/lecture/article hierarchy.

Usage:
    python3 scripts/scrape-aquinas-cc.py list
    python3 scripts/scrape-aquinas-cc.py work <slug>
    python3 scripts/scrape-aquinas-cc.py all
"""
from __future__ import annotations

import gzip
import json
import re
import sys
import time
import urllib.request
import urllib.error
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / "_cache" / "aquinas-cc"
BOOKS_ROOT = ROOT / "content" / "books" / "aquinas-opera-omnia"

USER_AGENT = "Mozilla/5.0 (compatible; EmberAquinasImporter/1.0; +https://github.com/gustavo-depaula/ember)"
BASE = "https://aquinas.cc"

AUTHOR = {
    "en-US": "St. Thomas Aquinas",
    "la": "Sanctus Thomas Aquinas",
}


# ---------------------------------------------------------------------------
# HTTP client
# ---------------------------------------------------------------------------

def post_json(path: str, body: dict, retries: int = 3) -> Any:
    url = BASE + path
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
            "Accept-Encoding": "gzip",
        },
    )
    last_err = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                text = raw.decode("utf-8")
            return json.loads(text)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            last_err = exc
            time.sleep(1 + attempt * 2)
    raise RuntimeError(f"POST {path} failed after {retries} attempts: {last_err}")


# ---------------------------------------------------------------------------
# Work catalog (extracted from aquinas.cc's _navTreeRoot)
# ---------------------------------------------------------------------------

@dataclass
class WorkSpec:
    slug: str                      # output dir key under aquinas-opera-omnia/<slug>
    sub_path: str                  # full path under aquinas-opera-omnia/
    book_id: str
    name_en: str
    name_la: str
    composed: str | int
    description_en: str
    description_la: str
    en_translator_note: str
    parts: list[dict]              # list of {wid, did_la, did_en, label_en, label_la, rows}
    # Optional override: include other did IDs (e.g. RSV bible text for Pauline) as inline blockquotes
    include_rsv_dids: dict[int, int] = field(default_factory=dict)
    # Optional override: promote short body-style rows that look like rubric
    # labels (e.g. "Magnificat antiphon from First Vespers") to header style.
    # aquinas.cc occasionally tags these as body 'u' instead of a header style
    # 'a'-'t'; for prayer/liturgical works this makes the chapter read as one
    # undifferentiated block. Single-line, short (≤80 char), title-cased, no
    # trailing sentence punctuation.
    promote_rubric_labels: bool = False


# Each part: {"wid": int, "did_la": int, "did_en": int, "label_en": str, "label_la": str, "rows": int}

WORKS_CC: dict[str, WorkSpec] = {
    # ------ Pauline commentary stragglers (not in Geremia bilingual) ------
    "super-romanos": WorkSpec(
        slug="super-romanos",
        sub_path="biblical/super-romanos",
        book_id="aquinas-super-romanos",
        name_en="Commentary on Romans",
        name_la="Super Epistolam ad Romanos Lectura",
        composed="1265–1272",
        description_en="Aquinas's most extensive and mature Pauline commentary, on the Epistle to the Romans. Composed during his second Paris regency. The summit of his Pauline exegesis.",
        description_la="Expositio Pauline Thomae maxima et matura, in Epistolam ad Romanos. Composita in regentia secunda Parisiensi. Culmen exegeseos Paulinae apud Thomam.",
        en_translator_note="English translation by Fabian R. Larcher, O.P., revised by The Aquinas Institute (Lander, WY). Mirrored from aquinas.cc; the Aquinas Institute asserts copyright on their AI Text Engine — text is the Shapcote-derived Larcher revision.",
        parts=[{"wid": 55, "did_la": 196, "did_en": 198, "label_en": "Romans", "label_la": "Ad Romanos", "rows": 4199}],
    ),
    "super-2-thess": WorkSpec(
        slug="super-2-thess",
        sub_path="biblical/super-2-thess",
        book_id="aquinas-super-2-thessalonicenses",
        name_en="Commentary on 2 Thessalonians",
        name_la="Super Epistolam ad Thessalonicenses Secundam",
        composed="1265–1273",
        description_en="Aquinas's commentary on the Second Epistle to the Thessalonians.",
        description_la="Expositio Thomae in Epistolam ad Thessalonicenses Secundam.",
        en_translator_note="English translation by Fabian R. Larcher, O.P., revised by The Aquinas Institute. Mirrored from aquinas.cc.",
        parts=[{"wid": 63, "did_la": 232, "did_en": 234, "label_en": "2 Thessalonians", "label_la": "Ad Thessalonicenses II", "rows": 337}],
    ),
    "super-1-tim": WorkSpec(
        slug="super-1-tim",
        sub_path="biblical/super-1-tim",
        book_id="aquinas-super-1-timotheum",
        name_en="Commentary on 1 Timothy",
        name_la="Super Epistolam ad Timotheum Primam",
        composed="1265–1273",
        description_en="Aquinas's commentary on the First Epistle to Timothy.",
        description_la="Expositio Thomae in Epistolam ad Timotheum Primam.",
        en_translator_note="English translation by Fabian R. Larcher, O.P., revised by The Aquinas Institute. Mirrored from aquinas.cc.",
        parts=[{"wid": 64, "did_la": 236, "did_en": 238, "label_en": "1 Timothy", "label_la": "Ad Timotheum I", "rows": 1016}],
    ),
    "super-2-tim": WorkSpec(
        slug="super-2-tim",
        sub_path="biblical/super-2-tim",
        book_id="aquinas-super-2-timotheum",
        name_en="Commentary on 2 Timothy",
        name_la="Super Epistolam ad Timotheum Secundam",
        composed="1265–1273",
        description_en="Aquinas's commentary on the Second Epistle to Timothy.",
        description_la="Expositio Thomae in Epistolam ad Timotheum Secundam.",
        en_translator_note="English translation by Fabian R. Larcher, O.P., revised by The Aquinas Institute. Mirrored from aquinas.cc.",
        parts=[{"wid": 65, "did_la": 240, "did_en": 242, "label_en": "2 Timothy", "label_la": "Ad Timotheum II", "rows": 664}],
    ),
    "super-titum": WorkSpec(
        slug="super-titum",
        sub_path="biblical/super-titum",
        book_id="aquinas-super-titum",
        name_en="Commentary on Titus",
        name_la="Super Epistolam ad Titum",
        composed="1265–1273",
        description_en="Aquinas's commentary on the Epistle to Titus.",
        description_la="Expositio Thomae in Epistolam ad Titum.",
        en_translator_note="English translation by Fabian R. Larcher, O.P., revised by The Aquinas Institute. Mirrored from aquinas.cc.",
        parts=[{"wid": 66, "did_la": 244, "did_en": 246, "label_en": "Titus", "label_la": "Ad Titum", "rows": 444}],
    ),
    # ------ Old-Testament commentaries not in Geremia ------
    "super-isaiam": WorkSpec(
        slug="super-isaiam",
        sub_path="biblical/super-isaiam",
        book_id="aquinas-super-isaiam",
        name_en="Commentary on Isaiah",
        name_la="Expositio super Isaiam",
        composed="1248–1252",
        description_en="One of Aquinas's earliest Scripture commentaries — the literal exposition of the Book of Isaiah from his bachelor-of-Scripture period at Paris and Cologne.",
        description_la="Una ex primis expositionibus Sacrae Scripturae Thomae — *expositio ad litteram* libri Isaiae ex annis baccalauratus biblici Parisiensis et Coloniensis.",
        en_translator_note="English translation by Louis St. Hilaire. Mirrored from aquinas.cc.",
        parts=[{"wid": 49, "did_la": 173, "did_en": 910, "label_en": "Isaiah", "label_la": "Isaias", "rows": 6002}],
    ),
    "super-ieremiam": WorkSpec(
        slug="super-ieremiam",
        sub_path="biblical/super-ieremiam",
        book_id="aquinas-super-ieremiam",
        name_en="Commentary on Jeremiah",
        name_la="Expositio super Ieremiam",
        composed="1248–1252",
        description_en="An early literal commentary on the prophet Jeremiah, complementing the Isaiah commentary. The Lamentations commentary continues this Jeremianic group.",
        description_la="Expositio prima litteralis in prophetam Ieremiam, expositioni Isaiae cognata. Expositio Threnorum hunc cyclum continuat.",
        en_translator_note="English translation mirrored from aquinas.cc.",
        parts=[{"wid": 47, "did_la": 169, "did_en": 904, "label_en": "Jeremiah", "label_la": "Ieremias", "rows": 3822}],
    ),
    # ------ Other commentaries not in Geremia ------
    "boethius-de-hebdomadibus": WorkSpec(
        slug="boethius-de-hebdomadibus",
        sub_path="commentaries/boethius-de-hebdomadibus",
        book_id="aquinas-boethius-de-hebdomadibus",
        name_en="Commentary on Boethius's De Hebdomadibus",
        name_la="Super Boethium De Hebdomadibus",
        composed="1257–1259",
        description_en="Aquinas's commentary on Boethius's *De Hebdomadibus* — the brief but influential treatise on how things are good in virtue of their participation in the First Good. A key text for Thomistic metaphysics of participation.",
        description_la="Expositio Thomae in *De Hebdomadibus* Boethii — tractatum brevem sed influentem de modo quo res bonae sunt per participationem in Primo Bono. Textus clavis metaphysicae participationis Thomisticae.",
        en_translator_note="English translation mirrored from aquinas.cc.",
        parts=[{"wid": 86, "did_la": 893, "did_en": 892, "label_en": "De Hebdomadibus", "label_la": "De Hebdomadibus", "rows": 199}],
    ),
    "liber-de-causis": WorkSpec(
        slug="liber-de-causis",
        sub_path="commentaries/liber-de-causis",
        book_id="aquinas-liber-de-causis",
        name_en="Commentary on the Book of Causes",
        name_la="Super Librum De Causis",
        composed="1271–1272",
        description_en="Aquinas's commentary on the *Liber de Causis* — the Neoplatonic compilation derived from Proclus's *Elements of Theology*. Aquinas was the first medieval to identify its source as Proclus rather than Aristotle.",
        description_la="Expositio Thomae in *Librum de Causis* — compilationem Neoplatonicam ex *Elementatione Theologica* Procli derivatam. Thomas primus medii aevi fontem eius Proclum, non Aristotelem esse identificavit.",
        en_translator_note="English translation mirrored from aquinas.cc.",
        parts=[{"wid": 88, "did_la": 323, "did_en": 899, "label_en": "Book of Causes", "label_la": "Liber de Causis", "rows": 843}],
    ),
    "de-divinis-nominibus": WorkSpec(
        slug="de-divinis-nominibus",
        sub_path="commentaries/de-divinis-nominibus",
        book_id="aquinas-de-divinis-nominibus",
        name_en="Commentary on Dionysius's On the Divine Names",
        name_la="Super Librum Dionysii De Divinis Nominibus",
        composed="1261–1268",
        description_en="Aquinas's commentary on the *Divine Names* of Pseudo-Dionysius the Areopagite — the central Neoplatonic-Christian treatise on the divine attributes that profoundly shaped Aquinas's own theology of God.",
        description_la="Expositio Thomae in *De Divinis Nominibus* Pseudo-Dionysii Areopagitae — tractatum Neoplatonico-Christianum centralem de attributis divinis qui theologiam Thomae de Deo profunde formavit.",
        en_translator_note="English translation by Harry C. Hannon. Mirrored from aquinas.cc.",
        parts=[{"wid": 87, "did_la": 563, "did_en": 1005, "label_en": "On the Divine Names", "label_la": "De Divinis Nominibus", "rows": 2875}],
    ),
    # ------ Latin-only works (no PD English exists) ------
    "qd-de-malo": WorkSpec(
        slug="qd-de-malo",
        sub_path="disputed-questions/de-malo",
        book_id="aquinas-de-malo",
        name_en="Disputed Questions on Evil",
        name_la="Quaestiones Disputatae de Malo",
        composed="1266–1272",
        description_en="Sixteen disputed questions on the nature of evil, original sin, the capital vices, and the demonic. Available Latin only via aquinas.cc; the standard English (Regan/Davies, Oxford 2003) is still under copyright.",
        description_la="Sedecim quaestiones disputatae de natura mali, peccato originali, vitiis capitalibus, et de daemonibus. Tantum latine disponibile in aquinas.cc; versio anglica standardica (Regan/Davies, Oxonii 2003) adhuc sub iure auctoris.",
        en_translator_note="No public-domain English translation available — Latin-only import. The standard English is by Richard Regan / Brian Davies (Oxford University Press, 2003), still under copyright.",
        parts=[{"wid": 31, "did_la": 123, "did_en": 0, "label_en": "On Evil", "label_la": "De Malo", "rows": 3423}],
    ),
    # ------ Aristotle: Tabula Ethicorum (index of moral concepts) ------
    "tabula-ethicorum": WorkSpec(
        slug="tabula-ethicorum",
        sub_path="aristotle/tabula-ethicorum",
        book_id="aquinas-tabula-ethicorum",
        name_en="Table of the Ethics",
        name_la="Tabula Libri Ethicorum",
        composed="1270",
        description_en="A reference index Aquinas compiled of moral concepts in Aristotle's *Nicomachean Ethics*, organized alphabetically by Latin lemma. A scholarly companion to the *Sententia Libri Ethicorum*.",
        description_la="Index alphabeticus conceptuum moralium ex *Ethicis Nicomacheis* Aristotelis a Thoma compositus. Comes scholaris *Sententiae Libri Ethicorum*.",
        en_translator_note="English translation mirrored from aquinas.cc.",
        parts=[{"wid": 83, "did_la": 306, "did_en": 307, "label_en": "Table of the Ethics", "label_la": "Tabula Libri Ethicorum", "rows": 2745}],
    ),
    # ------ Aquinas's Devotional Prayers (Latin/English) ------
    "devotional-prayers": WorkSpec(
        slug="devotional-prayers",
        sub_path="opuscula/devotional-prayers",
        book_id="aquinas-devotional-prayers",
        name_en="Devotional Prayers",
        name_la="Orationes Devotionales",
        composed="c. 1250–1273",
        description_en="The collected devotional prayers attributed to Aquinas — *Ante Studium*, *Post Studium*, *Concede Mihi*, *Pia Oratio*, communion prayers, and more. Bilingual Latin/English.",
        description_la="Orationes devotionales Thomae Aquinati attributae — *Ante Studium*, *Post Studium*, *Concede Mihi*, *Pia Oratio*, orationes ad communionem, et aliae.",
        en_translator_note="Translations from aquinas.cc.",
        parts=[{"wid": 176, "did_la": 1254, "did_en": 1253, "label_en": "Devotional Prayers", "label_la": "Orationes", "rows": 226}],
        promote_rubric_labels=True,
    ),
    # ------ Hymns and Songs ------
    "hymns": WorkSpec(
        slug="hymns",
        sub_path="opuscula/hymns",
        book_id="aquinas-hymns",
        name_en="Hymns and Songs",
        name_la="Hymni et Cantica",
        composed="1264",
        description_en="The Eucharistic hymns and sequences Aquinas composed for the Office and Mass of Corpus Christi (1264) at the request of Pope Urban IV — *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum Prodiens*, *Adoro Te Devote*, and the sequence *Lauda Sion Salvatorem*.",
        description_la="Hymni et sequentiae Eucharisticae Thomae pro Officio et Missa Corporis Christi (1264), Urbano IV petente, compositi — *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum Prodiens*, *Adoro Te Devote*, et sequentia *Lauda Sion Salvatorem*.",
        en_translator_note="Translations from aquinas.cc.",
        parts=[{"wid": 178, "did_la": 1290, "did_en": 1289, "label_en": "Hymns and Songs", "label_la": "Hymni et Cantica", "rows": 74}],
    ),
    # ------ Office of Corpus Christi - Sapientia aedificavit sibi (alternate version) ------
    "office-corpus-christi-sapientia": WorkSpec(
        slug="office-corpus-christi-sapientia",
        sub_path="office-of-corpus-christi-sapientia",
        book_id="aquinas-office-corpus-christi-sapientia",
        name_en="Office of Corpus Christi — Sapientia aedificavit sibi",
        name_la="Officium Corporis Christi — Sapientia aedificavit sibi",
        composed=1264,
        description_en="The alternate (early) draft of the Office of Corpus Christi, beginning *Sapientia aedificavit sibi*. The *Sacerdos in aeternum* version (in `aquinas-office-corpus-christi`) was the one ultimately adopted.",
        description_la="Recensio prima Officii Corporis Christi, a verbis *Sapientia aedificavit sibi* incipiens. Recensio *Sacerdos in aeternum* in usum tandem recepta est.",
        en_translator_note="Translations from aquinas.cc.",
        parts=[{"wid": 177, "did_la": 1284, "did_en": 1283, "label_en": "Sapientia aedificavit sibi", "label_la": "Sapientia aedificavit sibi", "rows": 378}],
    ),
    # ------ Naples 1273 Catechetical Sermons (Aquinas Institute bilingual) ------
    "catechetical-sermons-cc": WorkSpec(
        slug="catechetical-sermons-cc",
        sub_path="sermons-individual/catechetical-bilingual",
        book_id="aquinas-catechetical-sermons-cc",
        name_en="Naples Catechetical Sermons (Bilingual)",
        name_la="Sermones Catechetici Neapolitani (Bilinguis)",
        composed=1273,
        description_en="The four Naples 1273 catechetical sermon-cycles — on the Creed, the Lord's Prayer, the Hail Mary, and the Ten Commandments. Aquinas Institute bilingual edition. (The Collins 1939 English of the same sermons lives in `book/aquinas-catechetical-instructions`.)",
        description_la="Quattuor cycli sermonum catecheticorum Neapolitanorum (1273) — super Symbolum Apostolorum, Pater Noster, Ave Maria, Decem Praecepta. Editio bilinguis Instituti Aquinatis.",
        en_translator_note="Translation from aquinas.cc (Aquinas Institute), distinct from the Collins 1939 PD edition.",
        parts=[
            {"wid": 94, "did_la": 351, "did_en": 353, "label_en": "Sermons on the Apostles' Creed", "label_la": "In Symbolum Apostolorum", "rows": 275},
            {"wid": 91, "did_la": 337, "did_en": 338, "label_en": "Sermons on the Lord's Prayer", "label_la": "In Pater Noster", "rows": 149},
            {"wid": 92, "did_la": 341, "did_en": 343, "label_en": "Sermons on the Hail Mary", "label_la": "In Ave Maria", "rows": 34},
            {"wid": 93, "did_la": 850, "did_en": 348, "label_en": "Sermons on the Ten Commandments", "label_la": "In Decem Praecepta", "rows": 336},
        ],
    ),
    # ------ Individual occasional sermons (Bataillon edition + English) ------
    "sermons-bilingual": WorkSpec(
        slug="sermons-bilingual",
        sub_path="sermons-individual/bilingual-collection",
        book_id="aquinas-sermons-bilingual",
        name_en="Occasional Sermons (Bilingual)",
        name_la="Sermones Occasionales (Bilingues)",
        composed="c. 1265–1273",
        description_en="Aquinas's surviving university and feast-day sermons in their Aquinas Institute bilingual edition — Latin from the Leonine/Bataillon critical editions, English from various scholars (Hoogland, Sulavik, et al.). Complements the older Geremia-sourced *Sermons* book by providing modern English alongside the Latin.",
        description_la="Sermones Thomae superstites universitarii et festivi in editione bilingui Instituti Aquinatis — latine ex editionibus criticis Leoninensi et Bataillon, anglice ex variis viris doctis (Hoogland, Sulavik, et al.).",
        en_translator_note="Translations by Hoogland, Sulavik, Michieli, and others, per individual sermon. Mirrored from aquinas.cc.",
        parts=[
            # Latin Leonine (or first available) + English
            {"wid": 124, "did_la": 965, "did_en": 1012, "label_en": "Sermon — The Boy Jesus (Puer)", "label_la": "Sermo — Puer Iesus", "rows": 114},
            {"wid": 125, "did_la": 915, "did_en": 460, "label_en": "Sermon — Beware of the False Prophets (Attendite)", "label_la": "Sermo — Attendite", "rows": 74},
            {"wid": 126, "did_la": 558, "did_en": 547, "label_en": "Sermon — Behold Your King (Ecce Rex)", "label_la": "Sermo — Ecce Rex", "rows": 79},
            {"wid": 127, "did_la": 923, "did_en": 548, "label_en": "Sermon — A Sower Went Out (Exiit)", "label_la": "Sermo — Exiit", "rows": 105},
            {"wid": 128, "did_la": 963, "did_en": 549, "label_en": "Sermon — Hosanna to the Son of David (Osanna)", "label_la": "Sermo — Osanna", "rows": 86},
            {"wid": 129, "did_la": 914, "did_en": 550, "label_en": "Sermon — Let Us Throw Off the Works of Darkness (Abiciamus)", "label_la": "Sermo — Abiciamus", "rows": 16},
            {"wid": 130, "did_la": 918, "did_en": 472, "label_en": "Sermon — Happy the Nation (Beata Gens)", "label_la": "Sermo — Beata Gens", "rows": 83},
            {"wid": 131, "did_la": 919, "did_en": 551, "label_en": "Sermon — Happy Those Who Live in Your House (Beati)", "label_la": "Sermo — Beati", "rows": 58},
            {"wid": 132, "did_la": 920, "did_en": 552, "label_en": "Sermon — Happy the Man (Beatus Vir)", "label_la": "Sermo — Beatus Vir", "rows": 53},
            {"wid": 133, "did_la": 1135, "did_en": 553, "label_en": "Sermon — Heaven and Earth (Coelum)", "label_la": "Sermo — Coelum et Terra", "rows": 30},
            {"wid": 134, "did_la": 922, "did_en": 554, "label_en": "Sermon — Behold I Send My Angel (Ecce Ego)", "label_la": "Sermo — Ecce Ego Mitto", "rows": 15},
            {"wid": 135, "did_la": 924, "did_en": 555, "label_en": "Sermon — Let the Earth Bring Forth (Germinet)", "label_la": "Sermo — Germinet Terra", "rows": 103},
            {"wid": 136, "did_la": 968, "did_en": 556, "label_en": "Sermon — There Was a Certain Rich Man (Homo Erat)", "label_la": "Sermo — Homo Erat", "rows": 94},
            {"wid": 137, "did_la": 969, "did_en": 487, "label_en": "Sermon — A Light Has Gone Up for the Just (Lux)", "label_la": "Sermo — Lux Orta Est", "rows": 76},
            {"wid": 143, "did_la": 531, "did_en": 523, "label_en": "Sermon — Send Out Your Spirit (Emitte)", "label_la": "Sermo — Emitte Spiritum", "rows": 105},
            {"wid": 144, "did_la": 524, "did_en": 530, "label_en": "Sermon — Someone Made a Great Dinner (Homo Fecit)", "label_la": "Sermo — Homo Fecit Cenam", "rows": 98},
            {"wid": 145, "did_la": 876, "did_en": 962, "label_en": "Sermon — Sing Praise and Be Glad (Lauda)", "label_la": "Sermo — Lauda et Laetare", "rows": 60},
            {"wid": 146, "did_la": 877, "did_en": 966, "label_en": "Sermon — Upon It Stood the Seraphim (Seraphim)", "label_la": "Sermo — Seraphim Stabant", "rows": 53},
            {"wid": 147, "did_la": 878, "did_en": 957, "label_en": "Sermon — He Who Is Desired (Veniet)", "label_la": "Sermo — Veniet Desideratus", "rows": 66},
            {"wid": 151, "did_la": 990, "did_en": 1017, "label_en": "Sermon — Ask, and You Will Receive (Petite)", "label_la": "Sermo — Petite et Accipietis", "rows": 57},
            {"wid": 152, "did_la": 1021, "did_en": 1022, "label_en": "Sermon — I Have Found David (Inveni)", "label_la": "Sermo — Inveni David", "rows": 41},
            {"wid": 162, "did_la": 1136, "did_en": 1137, "label_en": "Sermon Fragment — Wisdom Will Strengthen the Wise (Sapient)", "label_la": "Fragmentum — Sapientia Confortabit", "rows": 9},
            {"wid": 163, "did_la": 1141, "did_en": 1142, "label_en": "Sermon Fragment — Arise (Surge)", "label_la": "Fragmentum — Surge", "rows": 10},
        ],
    ),
    "immensa-sermon": WorkSpec(
        slug="immensa-sermon",
        sub_path="sermons-individual/immensa",
        book_id="aquinas-sermon-immensa",
        name_en="Sermon from the Office — The Boundless Favors of Divine Generosity",
        name_la="Sermo de Officio — Immensa Divinae Largitatis Beneficia",
        composed=1264,
        description_en="The sermon Aquinas composed for the Office of Corpus Christi — a meditation on the surpassing gift of the Holy Eucharist.",
        description_la="Sermo Thomae pro Officio Corporis Christi compositus — meditatio de dono praecellente Eucharistiae.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 179, "did_la": 1296, "did_en": 1295, "label_en": "Immensa", "label_la": "Immensa", "rows": 9}],
    ),
    # ------ Letters on articles ------
    "articles-30": WorkSpec(
        slug="articles-30",
        sub_path="opuscula/articles-30",
        book_id="aquinas-letter-30-articles",
        name_en="Letter to Bassiano of Lodi on the 30 Articles",
        name_la="Epistola ad Bassianum Laudensem de 30 Articulis",
        composed=1271,
        description_en="A response Aquinas wrote to Bassiano, lector at Lodi, answering 30 doctrinal questions on the Trinity, Christology, sacraments, and demonology.",
        description_la="Responsum Thomae Bassiano lectori Laudensi, ad 30 quaestiones doctrinales de Trinitate, Christologia, sacramentis, daemonologia.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 118, "did_la": 439, "did_en": 858, "label_en": "30 Articles", "label_la": "30 Articuli", "rows": 66}],
    ),
    "articles-36": WorkSpec(
        slug="articles-36",
        sub_path="opuscula/articles-36",
        book_id="aquinas-letter-36-articles",
        name_en="Letter to Bassiano of Lodi on the 36 Articles",
        name_la="Epistola ad Bassianum Laudensem de 36 Articulis",
        composed=1271,
        description_en="A second response Aquinas wrote to Bassiano, answering 36 further doctrinal questions.",
        description_la="Secundum responsum Thomae Bassiano ad 36 quaestiones doctrinales ulteriores.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 119, "did_la": 441, "did_en": 911, "label_en": "36 Articles", "label_la": "36 Articuli", "rows": 111}],
    ),
    "articles-43": WorkSpec(
        slug="articles-43",
        sub_path="opuscula/articles-43",
        book_id="aquinas-letter-43-articles",
        name_en="Letter to John of Vercelli on the 43 Articles",
        name_la="Epistola ad Ioannem Vercellensem de 43 Articulis",
        composed=1271,
        description_en="Aquinas's response to the Master General of the Dominicans, John of Vercelli, on 43 propositions excerpted from the works of a friar that were under inquiry — Aquinas defends most as orthodox and explains the others.",
        description_la="Responsum Thomae Magistro Generali Ordinis Praedicatorum Ioanni Vercellensi, ad 43 propositiones ex operibus cuiusdam fratris excerptas — pleraeque a Thoma ut orthodoxae defenduntur.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 120, "did_la": 443, "did_en": 859, "label_en": "43 Articles", "label_la": "43 Articuli", "rows": 106}],
    ),
    "articles-6": WorkSpec(
        slug="articles-6",
        sub_path="opuscula/articles-6",
        book_id="aquinas-letter-6-articles",
        name_en="Letter to Brother Gerard of Besançon on the 6 Articles",
        name_la="Epistola ad Fratrem Gerardum Bisuntinum de 6 Articulis",
        composed=1271,
        description_en="A short letter from Aquinas to a fellow Dominican answering six doctrinal questions.",
        description_la="Epistola brevis Thomae fratri Dominicano ad sex quaestiones doctrinales respondens.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 121, "did_la": 445, "did_en": 856, "label_en": "6 Articles", "label_la": "6 Articuli", "rows": 21}],
    ),
    "decretalem": WorkSpec(
        slug="decretalem",
        sub_path="opuscula/decretalem",
        book_id="aquinas-decretalem",
        name_en="On the First and Second Decretals",
        name_la="Expositio Super Primam et Secundam Decretalem",
        composed="c. 1259–1264",
        description_en="Aquinas's exposition of two decretals (papal letters) of Innocent III, on points of Trinitarian and christological doctrine.",
        description_la="Expositio Thomae duarum decretalium Innocentii III, de quaestionibus doctrinae Trinitariae et christologicae.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 113, "did_la": 427, "did_en": 875, "label_en": "On the Decretals", "label_la": "Super Decretales", "rows": 93}],
    ),
    "letter-108-articles": WorkSpec(
        slug="letter-108-articles",
        sub_path="opuscula/letter-108-articles",
        book_id="aquinas-letter-108-articles",
        name_en="Letter to John of Vercelli on the 108 Articles",
        name_la="Epistola ad Ioannem Vercellensem de 108 Articulis",
        composed=1271,
        description_en="Aquinas's response to John of Vercelli, Master General of the Dominicans, on 108 propositions drawn from contemporary disputes — the longest of his Articles letters. Latin only on aquinas.cc.",
        description_la="Responsum Thomae Ioanni Vercellensi, Magistro Generali Ordinis Praedicatorum, ad 108 propositiones ex disputationibus contemporaneis exceptas — epistolarum Articulorum longissima. Latinum tantum in aquinas.cc.",
        en_translator_note="No public-domain English translation; Latin only via aquinas.cc.",
        parts=[{"wid": 114, "did_la": 429, "did_en": 0, "label_en": "108 Articles", "label_la": "108 Articuli", "rows": 223}],
    ),
    "de-forma-absolutionis": WorkSpec(
        slug="de-forma-absolutionis",
        sub_path="opuscula/de-forma-absolutionis",
        book_id="aquinas-de-forma-absolutionis",
        name_en="On the Form of Absolution",
        name_la="De Forma Absolutionis",
        composed="c. 1269",
        description_en="A short consultation on the sacramental formula of absolution — whether it should be indicative (\"I absolve you\") or deprecative (\"May God absolve you\"). Latin only.",
        description_la="Responsum breve de forma sacramentali absolutionis — utrum indicativa (\"Ego te absolvo\") an deprecativa (\"Deus te absolvat\") esse debeat.",
        en_translator_note="No public-domain English translation available; Latin only via aquinas.cc.",
        parts=[{"wid": 115, "did_la": 431, "did_en": 0, "label_en": "On the Form of Absolution", "label_la": "De Forma Absolutionis", "rows": 68}],
    ),
    "office-corpus-christi": WorkSpec(
        slug="office-corpus-christi",
        sub_path="office-of-corpus-christi",
        book_id="aquinas-office-corpus-christi",
        name_en="Office of Corpus Christi",
        name_la="Officium Corporis Christi",
        composed=1264,
        description_en="The complete liturgical office Aquinas composed in 1264 at the request of Pope Urban IV for the new feast of the Body of Christ — the *Sacerdos in aeternum* recension, ultimately adopted by the Church. First and Second Vespers, Compline, Matins, Lauds, the Little Hours, the Office within the Octave, and the Mass *Cibavit*. Includes the four great Eucharistic hymns *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum*, and the sequence *Lauda Sion*.",
        description_la="Officium liturgicum completum Thomae anno 1264, Urbano IV petente, pro festo Corporis Christi novo — recensio *Sacerdos in aeternum*, in usum Ecclesiae tandem recepta. Vesperae Primae et Secundae, Completorium, Matutinum, Laudes, Horae Minores, Officium intra Octavam, et Missa *Cibavit*. Comprehendit hymnos Eucharisticos *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum*, et sequentiam *Lauda Sion*.",
        en_translator_note="Translation from aquinas.cc (Aquinas Institute).",
        parts=[{"wid": 95, "did_la": 356, "did_en": 357, "label_en": "Sacerdos in aeternum", "label_la": "Sacerdos in aeternum", "rows": 1604}],
    ),
    "de-judiciis-astrorum": WorkSpec(
        slug="de-judiciis-astrorum",
        sub_path="opuscula/de-judiciis-astrorum",
        book_id="aquinas-de-judiciis-astrorum",
        name_en="On Astrology",
        name_la="De Iudiciis Astrorum",
        composed="c. 1271",
        description_en="A short consultation Aquinas wrote in response to a question on the moral and theological status of astrology — whether and how Christians may consult the stars.",
        description_la="Responsum breve Thomae ad quaestionem de statu morali et theologico astrologiae — utrum et quomodo Christianis liceat astra consulere.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 122, "did_la": 447, "did_en": 448, "label_en": "On Astrology", "label_la": "De Iudiciis Astrorum", "rows": 5}],
    ),
    "de-secreto": WorkSpec(
        slug="de-secreto",
        sub_path="opuscula/de-secreto",
        book_id="aquinas-de-secreto",
        name_en="On Secret Faults",
        name_la="De Secreto",
        composed="c. 1269",
        description_en="A short consultation on whether a religious superior can compel a subject to reveal sins disclosed under the seal of fraternal correction.",
        description_la="Responsum breve, utrum praelatus religiosus subditum cogere possit ut peccata sub sigillo correctionis fraternae detecta revelet.",
        en_translator_note="Translation from aquinas.cc.",
        parts=[{"wid": 116, "did_la": 433, "did_en": 977, "label_en": "On Secret Faults", "label_la": "De Secreto", "rows": 25}],
    ),
    # ------ Two Inaugural Lectures (with English by Gilhooly) ------
    "rigans-montes": WorkSpec(
        slug="rigans-montes",
        sub_path="opuscula/rigans-montes",
        book_id="aquinas-rigans-montes",
        name_en="Rigans Montes (Inaugural Sermon I)",
        name_la="Rigans Montes (Principium I)",
        composed=1256,
        description_en="Aquinas's first inaugural sermon as Master of Theology at Paris (Spring 1256), preached on Psalm 103:13 — *Rigans montes de superioribus suis*. A meditation on the dignity of Sacred Scripture.",
        description_la="Sermo principalis primus Thomae cum suscepta licentia magistri in theologia Parisiis (vere 1256), de Psalmo CIII, 13 — *Rigans montes de superioribus suis*. Meditatio de dignitate Sacrae Scripturae.",
        en_translator_note="English translation by Daniel Gilhooly. Mirrored from aquinas.cc.",
        parts=[{"wid": 44, "did_la": 157, "did_en": 851, "label_en": "Rigans Montes", "label_la": "Rigans Montes", "rows": 58}],
    ),
    "hic-est-liber": WorkSpec(
        slug="hic-est-liber",
        sub_path="opuscula/hic-est-liber",
        book_id="aquinas-hic-est-liber",
        name_en="Hic est Liber (Inaugural Sermon II)",
        name_la="Hic est Liber (Principium II)",
        composed=1256,
        description_en="Aquinas's second inaugural sermon as Master at Paris — *Hic est liber mandatorum Dei* — the *commendatio et divisio Sacrae Scripturae* every new master delivered.",
        description_la="Sermo principalis secundus Thomae magistri Parisiensis — *Hic est liber mandatorum Dei* — *commendatio et divisio Sacrae Scripturae* a novo magistro faciendae.",
        en_translator_note="English translation by Daniel Gilhooly. Mirrored from aquinas.cc.",
        parts=[{"wid": 45, "did_la": 161, "did_en": 852, "label_en": "Hic est Liber", "label_la": "Hic est Liber", "rows": 111}],
    ),
    # ------ Quodlibetales — full bilingual (12 Quodlibets) ------
    "quodlibetales": WorkSpec(
        slug="quodlibetales",
        sub_path="disputed-questions/quodlibetales",
        book_id="aquinas-quodlibetales",
        name_en="Quodlibetal Questions",
        name_la="Quaestiones Quodlibetales",
        composed="1268–1272",
        description_en="The twelve sets of *quodlibeta* (open-topic disputations) conducted by Aquinas at Paris (Advent and Lent, 1268–1272) and Naples, in which the master answered any question put by the audience. Full bilingual edition: Sandra Edwards for Quodlibets I–II (PIMS, 1983) and the Aquinas Institute team for III–XII.",
        description_la="Duodecim quodlibeta — disputationes Thomae Parisienses (Adventu et Quadragesima, 1268–1272) et Neapolitanae, in quibus magister cuilibet ex auditoribus quaerenti respondebat.",
        en_translator_note="English translations: Sandra Edwards for Q I–II (PIMS, 1983); various translators for III–XII, edited by the Aquinas Institute. Mirrored from aquinas.cc.",
        parts=[
            {"wid": 32, "did_la": 862, "did_en": 913, "label_en": "Quodlibet I",   "label_la": "Quodlibet I",   "rows": 337},
            {"wid": 33, "did_la": 863, "did_en": 131, "label_en": "Quodlibet II",  "label_la": "Quodlibet II",  "rows": 278},
            {"wid": 34, "did_la": 864, "did_en": 135, "label_en": "Quodlibet III", "label_la": "Quodlibet III", "rows": 462},
            {"wid": 35, "did_la": 865, "did_en": 138, "label_en": "Quodlibet IV",  "label_la": "Quodlibet IV",  "rows": 431},
            {"wid": 36, "did_la": 866, "did_en": 141, "label_en": "Quodlibet V",   "label_la": "Quodlibet V",   "rows": 367},
            {"wid": 37, "did_la": 867, "did_en": 861, "label_en": "Quodlibet VI",  "label_la": "Quodlibet VI",  "rows": 257},
            {"wid": 38, "did_la": 868, "did_en": 888, "label_en": "Quodlibet VII", "label_la": "Quodlibet VII", "rows": 348},
            {"wid": 39, "did_la": 869, "did_en": 894, "label_en": "Quodlibet VIII","label_la": "Quodlibet VIII","rows": 321},
            {"wid": 40, "did_la": 870, "did_en": 903, "label_en": "Quodlibet IX",  "label_la": "Quodlibet IX",  "rows": 309},
            {"wid": 41, "did_la": 871, "did_en": 908, "label_en": "Quodlibet X",   "label_la": "Quodlibet X",   "rows": 278},
            {"wid": 42, "did_la": 872, "did_en": 909, "label_en": "Quodlibet XI",  "label_la": "Quodlibet XI",  "rows": 223},
            {"wid": 43, "did_la": 873, "did_en": 855, "label_en": "Quodlibet XII", "label_la": "Quodlibet XII", "rows": 426},
        ],
    ),
    # ------ Sentences (full bilingual on aquinas.cc — canonical; Geremia
    # only had a handful of articles via index pages) ------
    "super-sententias": WorkSpec(
        slug="super-sententias",
        sub_path="commentaries/super-sententias",
        book_id="aquinas-super-sententias",
        name_en="Commentary on the Sentences",
        name_la="Scriptum super Libros Sententiarum",
        composed="1252–1256",
        description_en="The complete *Scriptum super Sententias* — Aquinas's *cursus baccalaureus* at Paris (1252–1256), a verse-by-verse commentary on Peter Lombard's *Sentences* in four books. Aquinas's first major theological work and the largest by sheer volume.",
        description_la="*Scriptum super Sententias* completum — *cursus baccalaureus* Thomae apud Parisios (1252–1256), expositio quattuor librorum *Sententiarum* Petri Lombardi. Primum opus theologicum maius Thomae et per molem maximum.",
        en_translator_note="English translation by the Aquinas Institute (Lander, WY), various translators including Beth Mortensen. Mirrored from aquinas.cc.",
        parts=[
            {"wid": 1, "did_la": 1, "did_en": 2, "label_en": "Book I (d. 1-20)", "label_la": "Liber I (d. 1-20)", "rows": 2982},
            {"wid": 2, "did_la": 4, "did_en": 5, "label_en": "Book I (d. 21-48)", "label_la": "Liber I (d. 21-48)", "rows": 3160},
            {"wid": 3, "did_la": 7, "did_en": 8, "label_en": "Book II (d. 1-20)", "label_la": "Liber II (d. 1-20)", "rows": 3366},
            {"wid": 4, "did_la": 10, "did_en": 11, "label_en": "Book II (d. 21-44)", "label_la": "Liber II (d. 21-44)", "rows": 3992},
            {"wid": 5, "did_la": 13, "did_en": 14, "label_en": "Book III (d. 1-22)", "label_la": "Liber III (d. 1-22)", "rows": 4943},
            {"wid": 6, "did_la": 16, "did_en": 17, "label_en": "Book III (d. 23-40)", "label_la": "Liber III (d. 23-40)", "rows": 4549},
            {"wid": 7, "did_la": 19, "did_en": 20, "label_en": "Book IV (d. 1-13)", "label_la": "Liber IV (d. 1-13)", "rows": 3927},
            {"wid": 8, "did_la": 22, "did_en": 23, "label_en": "Book IV (d. 14-25)", "label_la": "Liber IV (d. 14-25)", "rows": 4620},
            {"wid": 9, "did_la": 25, "did_en": 26, "label_en": "Book IV (d. 26-42)", "label_la": "Liber IV (d. 26-42)", "rows": 2526},
            {"wid": 10, "did_la": 31, "did_en": 32, "label_en": "Book IV (d. 43-50)", "label_la": "Liber IV (d. 43-50)", "rows": 3359},
        ],
    ),
}


# ---------------------------------------------------------------------------
# Row style decoder
# ---------------------------------------------------------------------------
# From aquinas.cc's _rowStyleOptions:
#   a/k: Work / #Work
#   b/l: Subject / #Subject
#   c/m: Book / #Book
#   d/n: Section / #Section
#   e/o: Chapter / #Chapter
#   f/p: Distinction / #Distinction
#   g/q: Lecture / #Lecture
#   h/r: Question / #Question
#   i/s: Article / #Article
#   j/t: Subarticle / #Subarticle
#   u: Body Text
#   v: Block Text
#   w: List Text
#   x: Scripture Text
#   y: Text A
#   z: Text B

STYLE_HEADERS = set("abcdefghij")   # bare-level rows (typically title labels)
STYLE_NUM_HDR = set("klmnopqrst")    # numbered headers (e.g. "Lecture 3")
STYLE_BODY = "u"
STYLE_BLOCK = "v"
STYLE_LIST = "w"
STYLE_SCRIPTURE = "x"
STYLE_TEXT_A = "y"
STYLE_TEXT_B = "z"
STYLE_AUX = set("yz")


# ---------------------------------------------------------------------------
# HTML → Markdown
# ---------------------------------------------------------------------------

INLINE_RE = re.compile(r"<(/?)(b|i|em|strong|sup|sub|u|small)(?:\s[^>]*)?>", re.IGNORECASE)
SCRIPTURE_REF_RE = re.compile(r"<n-sh[^>]*></n-sh>", re.IGNORECASE)
# Hyperlinks (with attributes) → keep inner text only.
LINK_RE = re.compile(r'<a\s[^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
# Editorial annotations (bare <a>...</a>) → render as parenthetical italic note.
ANNOTATION_RE = re.compile(r'<a>(.*?)</a>', re.IGNORECASE | re.DOTALL)


def html_to_md(html: str) -> str:
    if not html:
        return ""
    # Strip the scripture-section helper spans.
    html = SCRIPTURE_REF_RE.sub("", html)
    # Bare <a>...</a> on aquinas.cc is an editorial annotation (translator
    # credit, edition note, etc.). Render as a parenthetical italic note
    # so it's visually separated from the main text.
    html = ANNOTATION_RE.sub(lambda m: " *(" + m.group(1).strip() + ")*", html)
    # Drop anchor wrappers (with attrs — hyperlinks); keep the inner text.
    html = LINK_RE.sub(r"\1", html)
    # <br> becomes a markdown hard line break (two spaces + newline). Do this
    # BEFORE the general tag-stripping below.
    html = re.sub(r"<br\s*/?>", "  \n", html, flags=re.IGNORECASE)
    # <p> tag boundaries become paragraph breaks.
    html = re.sub(r"</p>", "\n\n", html, flags=re.IGNORECASE)
    html = re.sub(r"<p\b[^>]*>", "", html, flags=re.IGNORECASE)
    # Inline formatting tags → markdown.
    def repl(m: re.Match) -> str:
        slash = m.group(1)
        tag = m.group(2).lower()
        if tag in ("b", "strong"):
            return "**"
        if tag in ("i", "em"):
            return "*"
        if tag == "sup":
            return "^" if not slash else "^"
        if tag == "sub":
            return "~" if not slash else "~"
        if tag == "u":
            return "_" if not slash else "_"
        return ""
    html = INLINE_RE.sub(repl, html)
    # Strip remaining tags.
    html = re.sub(r"<[^>]+>", "", html)
    # Decode common HTML entities.
    html = (html
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&apos;", "'")
            .replace("&#39;", "'"))
    # Collapse stray double-markers.
    html = re.sub(r"\*\*\*\*", "", html)
    return html.strip()


# ---------------------------------------------------------------------------
# Fetch + cache
# ---------------------------------------------------------------------------

def cache_path(name: str) -> Path:
    p = CACHE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def fetch_structure(wid: int) -> tuple[str, dict]:
    cache_file = cache_path(f"struct/{wid}.json")
    if cache_file.is_file():
        d = json.loads(cache_file.read_text())
    else:
        d = post_json("/ws/Editor/getStructure", {"wid": wid})
        cache_file.write_text(json.dumps(d))
    if not isinstance(d, list) or len(d) < 2:
        raise RuntimeError(f"unexpected structure response for wid={wid}: {d!r}")
    body = d[1]
    style_string = body[0] if isinstance(body[0], str) else "".join(body[0])
    outline = json.loads(body[1]) if isinstance(body[1], str) else body[1]
    return style_string, outline


def fetch_cells(did: int, total_rows: int, chunk: int = 500) -> list[tuple[int, str]]:
    """Return ordered list of (row_id, html) for all rows in the document."""
    cache_file = cache_path(f"cells/{did}.json")
    if cache_file.is_file():
        return json.loads(cache_file.read_text())
    all_rows: list[tuple[int, str]] = []
    start = 1
    while start <= total_rows:
        d = post_json("/ws/Editor/getCells", {"did": str(did), "start": start, "len": chunk})
        if not isinstance(d, list) or len(d) < 2:
            raise RuntimeError(f"unexpected cells response for did={did} start={start}: {d!r}")
        rows = d[1]
        if not rows:
            break
        # Each row is [row_id, html]
        all_rows.extend((int(r[0]), r[1]) for r in rows)
        start += len(rows)
        if len(rows) < chunk:
            break
        # Be polite.
        time.sleep(0.1)
    cache_file.write_text(json.dumps(all_rows))
    return all_rows


# ---------------------------------------------------------------------------
# Outline walker — builds TOC nodes from the outline tree
# ---------------------------------------------------------------------------

@dataclass
class OutlineNode:
    title: str
    ref: str
    position: int
    children: list["OutlineNode"]


def parse_outline(node: dict) -> OutlineNode:
    return OutlineNode(
        title=node.get("t", ""),
        ref=node.get("r", ""),
        position=node.get("i", 0),
        children=[parse_outline(c) for c in node.get("c", [])],
    )


def gather_chapters(root: OutlineNode, depth_target: int = 1) -> list[OutlineNode]:
    """Return the nodes at the chosen TOC level — top-level chapters of the
    work. By default, depth 1 (the children of the root)."""
    if depth_target == 0:
        return [root]
    out: list[OutlineNode] = []
    for c in root.children:
        if depth_target == 1:
            out.append(c)
        else:
            out.extend(gather_chapters(c, depth_target - 1))
    return out


# ---------------------------------------------------------------------------
# Markdown emitter
# ---------------------------------------------------------------------------

def slug(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text or "")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "chapter"


def _looks_like_rubric_label(text: str) -> bool:
    """Heuristic for promoting short body rows to header style — used by
    works that aquinas.cc has tagged inconsistently (the Devotional Prayers,
    where labels like "Magnificat antiphon from First Vespers" arrive as
    style 'u' but should clearly be rendered as headers above the prayer
    they introduce)."""
    if not text or "\n" in text:
        return False
    s = text.strip()
    if len(s) > 80:
        return False
    if not s[0].isupper():
        return False
    if s.endswith((".", "!", "?", ",", "—", "–")):
        return False
    # Avoid catching trivially short body fragments ("Amen", "Yes")
    if len(s.split()) < 2:
        return False
    return True


def render_chapter(
    chap: OutlineNode,
    style_chars: str,
    la_rows: list[tuple[int, str]],
    en_rows: list[tuple[int, str]],
    lang: str,
    end_position: int,
    fallback_title: str = "",
    promote_rubric_labels: bool = False,
) -> str:
    """Render one chapter (between chap.position inclusive and end_position
    exclusive) as Markdown in the chosen language.

    Notes on aquinas.cc indexing: outline.i is a position into the row stream.
    For top-level chapters with multiple header rows (e.g. Romans C.8 has
    'Chapter 8' + 'Redemption of the Flesh' + 'Lecture 1' + lecture-title
    rows before scripture), the outline points at the FIRST descriptive row
    rather than the numeric label. We therefore start at chap.position
    directly (no off-by-one on start), but subtract 1 from end_position so
    the next chapter's leading numeric label doesn't leak in."""
    rows = la_rows if lang == "la" else en_rows
    label = "*"  # bold-italic placeholder

    title = html_to_md(chap.title)
    if not title:
        # If the outline didn't supply a descriptive title, prefer a caller-
        # provided fallback (e.g. the part label) over the raw ref path,
        # which usually looks like "Coelum.S1.2" and isn't reader-friendly.
        title = fallback_title or chap.ref
    lines: list[str] = [f"# {title}", ""]

    start_idx = chap.position
    end_idx = max(start_idx, end_position - 1)

    # Optionally skip the first row when it is an incipit-style summary that
    # duplicates the chapter title (common in hymns: pos N = single-line
    # incipit, pos N+1 = full multi-line refrain — also Summa: pos N = the
    # article's Latin/English title repeated, pos N+1 = "Ad primum sic
    # proceditur" / "Objection 1").
    skip_idx = -1
    if end_idx - start_idx >= 2 and start_idx < len(rows) and start_idx < len(style_chars):
        first_style = style_chars[start_idx]
        first_text = html_to_md(rows[start_idx][1]) if start_idx < len(rows) else ""
        next_text = html_to_md(rows[start_idx + 1][1]) if start_idx + 1 < len(rows) else ""
        def _normalize_for_compare(t: str) -> str:
            t = re.sub(r"[^\w\s]+", " ", t)
            t = re.sub(r"\s+", " ", t)
            return t.strip().lower()
        first_norm = _normalize_for_compare(first_text)
        next_norm = _normalize_for_compare(next_text)
        title_norm = _normalize_for_compare(title)
        # Strip "article N" / "question N" / "articulus N" / "quaestio N"
        # prefixes from the title before comparing.
        title_norm = re.sub(
            r"^(?:article|articulus|question|quaestio)\s+\d+\s*",
            "", title_norm,
        )
        is_incipit_dup = (
            first_style in STYLE_HEADERS
            and first_norm
            and next_norm
            and (first_norm in next_norm or next_norm.startswith(first_norm))
        )
        # Also dedupe against the chapter title — covers the Summa case where
        # the article's title row arrives as a header-style row immediately
        # after the H1 we already emitted.
        is_title_dup = (
            first_style in STYLE_HEADERS
            and first_norm
            and title_norm
            and (
                first_norm == title_norm
                or first_norm in title_norm
                or title_norm in first_norm
            )
        )
        if is_incipit_dup or is_title_dup:
            skip_idx = start_idx

    last_was_blank = True
    for pos in range(start_idx, end_idx):
        if pos >= len(rows) or pos >= len(style_chars):
            break
        if pos == skip_idx:
            continue
        style = style_chars[pos]
        html = rows[pos][1]
        text = html_to_md(html)
        if not text:
            continue
        is_header_style = style in STYLE_NUM_HDR or style in STYLE_HEADERS
        if is_header_style:
            # Sanity check: a true header label is short (usually under ~80
            # chars per line). When a "header" style is used for a long body
            # paragraph (Letter-style works use 'i' for the opening prose;
            # scholastic works use 'j' for objection paragraphs), bold-italic
            # rendering looks wrong. Fall through to body rendering when the
            # longest line exceeds the header threshold.
            split_lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
            max_line_len = max((len(ln) for ln in split_lines), default=0)
            if max_line_len > 80:
                is_header_style = False
        # Reverse direction: opt-in per-work, promote short body rows that
        # look like rubric labels back up to header style.
        if (
            not is_header_style
            and promote_rubric_labels
            and style in (STYLE_BODY, STYLE_TEXT_A, STYLE_TEXT_B)
            and _looks_like_rubric_label(text)
        ):
            is_header_style = True
        if is_header_style:
            # Inner structural marker (#Lecture, #Chapter, lecture body opener,
            # etc.). The outline already drives the chapter heading; render
            # each meaningful line as its own bold-italic paragraph so multi-
            # line headers don't collapse into a single emphasis span (which
            # would lose the line breaks).
            if not last_was_blank:
                lines.append("")
            for ln in text.split("\n"):
                clean = ln.strip()
                if clean:
                    lines.append(f"***{clean}***")
            lines.append("")
            last_was_blank = True
        elif style == STYLE_SCRIPTURE or style == STYLE_BLOCK:
            for line in text.split("\n"):
                if line.strip():
                    lines.append(f"> {line.strip()}")
            lines.append("")
            last_was_blank = True
        elif style == STYLE_LIST:
            # List items often span multiple verse lines (hymns). Preserve
            # the line breaks within the list item using markdown hard breaks.
            verse_lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
            if verse_lines:
                if len(verse_lines) == 1:
                    lines.append(f"- {verse_lines[0]}")
                else:
                    # Two-space-then-newline = markdown hard break inside a
                    # list item.
                    joined = "  \n  ".join(verse_lines)
                    lines.append(f"- {joined}")
            last_was_blank = False
        else:
            # Body text (u), text-A/B (y/z), etc. Preserve <br>-derived line
            # breaks as markdown hard breaks.
            for ln in text.split("\n"):
                clean = ln.rstrip()
                if clean:
                    lines.append(clean + "  ")
                else:
                    lines.append("")
            lines.append("")
            last_was_blank = True

    md = "\n".join(lines).rstrip() + "\n"
    return md


def emit_book(spec: WorkSpec, dry_run: bool = False) -> dict:
    book_dir = BOOKS_ROOT / spec.sub_path
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    if not dry_run:
        en_dir.mkdir(parents=True, exist_ok=True)
        la_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    languages = ["en-US", "la"] if any(p["did_en"] for p in spec.parts) else ["la"]
    total = 0

    for idx, part in enumerate(spec.parts):
        wid = part["wid"]
        did_la = part["did_la"]
        did_en = part["did_en"]
        rows = part["rows"]
        label_en = part["label_en"]
        label_la = part["label_la"]
        has_english = bool(did_en)

        print(f"  [{spec.slug}] part {idx+1}/{len(spec.parts)} wid={wid} ({label_en}, {rows} rows)")

        style_chars, outline_dict = fetch_structure(wid)
        root = parse_outline(outline_dict)
        # Take the second-level nodes (root.children) as chapters/lecturas.
        # Skip leading children with empty title that represent the work-level
        # intro / section nodes (e.g. Tabula has a virtual i=0 node before the
        # actual chapter list). A chapter is a child with non-empty title OR
        # with a ref distinct from the work-level ref.
        all_children = root.children
        if not all_children:
            chapters = [root]
        else:
            # The "work_ref" is the bare reference for the work as a whole,
            # taken from the first child (e.g. "Coelum").
            work_ref = all_children[0].ref if all_children else ""
            chapters = []
            seen_real = False
            for child in all_children:
                child_ref = child.ref or ""
                is_empty = not child.title.strip()
                # Leading virtual nodes have empty titles and a ref that is
                # either the bare work ref or a sub-section path under it
                # (Coelum.S1, Coelum.S1.2, Coelum.S1-1, etc.).
                is_virtual_path = (
                    child_ref == work_ref
                    or child_ref.startswith(work_ref + ".S")
                    or child_ref.startswith(work_ref + ".T")
                )
                if not seen_real and is_empty and is_virtual_path:
                    continue
                seen_real = True
                chapters.append(child)
            if not chapters:
                chapters = all_children
            # If every chapter has an empty title (short paragraph-only works
            # like the Immensa sermon, or untitled sermons in the Bilingual
            # Collection), collapse to a single virtual chapter that spans
            # the whole part. The part-group label (set later) supplies the
            # human-readable title.
            if all(not c.title.strip() for c in chapters) and chapters:
                first = chapters[0]
                merged = OutlineNode(
                    title="",
                    ref=first.ref or work_ref,
                    position=first.position,
                    children=[],
                )
                chapters = [merged]

        la_rows = fetch_cells(did_la, rows)
        en_rows = fetch_cells(did_en, rows) if has_english else [(rid, "") for rid, _ in la_rows]

        # Compute end_position for each chapter (= position of next sibling
        # or end-of-work).
        positions = [c.position for c in chapters] + [len(style_chars)]

        # If multi-part work, wrap in a group node.
        part_group: dict | None = None
        if len(spec.parts) > 1:
            part_group = {
                "id": f"p{idx + 1}",
                "title": {"en-US": label_en, "la": label_la},
                "children": [],
            }

        # Use a sequential c01..cNN suffix for every chapter, prefixed by the
        # work's short ref so multi-part works can disambiguate by part.
        # This keeps file naming uniform (no mix of `tabula-c1` + `tabula-c02`)
        # and sortable. The TOC label retains the descriptive title.
        # We compute a stable work-level prefix: the segment before the first
        # `.` in any ref, or "ch" if all refs are empty.
        work_prefix = ""
        for c in chapters:
            if c.ref:
                work_prefix = slug(c.ref.split(".")[0])
                break
        if not work_prefix:
            work_prefix = "ch"
        for i, chap in enumerate(chapters):
            end = positions[i + 1]
            cid_base = f"{work_prefix}-c{i+1:02d}"
            if part_group:
                cid = f"p{idx + 1}-{cid_base}"
            else:
                cid = cid_base
            fallback_en = label_en if part_group else spec.name_en
            fallback_la = label_la if part_group else spec.name_la
            md_en = render_chapter(chap, style_chars, la_rows, en_rows, "en-US", end, fallback_title=fallback_en, promote_rubric_labels=spec.promote_rubric_labels)
            md_la = render_chapter(chap, style_chars, la_rows, en_rows, "la", end, fallback_title=fallback_la, promote_rubric_labels=spec.promote_rubric_labels)
            if not dry_run:
                if has_english:
                    (en_dir / f"{cid}.md").write_text(md_en, encoding="utf-8")
                (la_dir / f"{cid}.md").write_text(md_la, encoding="utf-8")
            total += 1
            title_en = html_to_md(chap.title) or chap.ref or f"Chapter {i+1}"
            title_la = title_en  # aquinas.cc outline titles are language-mixed; reuse
            node = {
                "id": cid,
                "title": {"en-US": title_en, "la": title_la},
            }
            (part_group["children"] if part_group else toc).append(node)

        if part_group:
            toc.append(part_group)

    sources = [
        {
            "language": "la",
            "url": f"https://aquinas.cc/la/en/~{spec.parts[0].get('label_la', '')}",
            "description": "Latin text from the Leonine / Marietti editions (public domain), mirrored from aquinas.cc.",
        },
    ]
    if any(p["did_en"] for p in spec.parts):
        sources.insert(0, {
            "language": "en-US",
            "url": f"https://aquinas.cc/la/en/~{spec.parts[0].get('label_la', '')}",
            "description": spec.en_translator_note,
        })

    manifest = {
        "id": spec.book_id,
        "name": {"en-US": spec.name_en, "la": spec.name_la},
        "author": AUTHOR,
        "description": {"en-US": spec.description_en, "la": spec.description_la},
        "composed": spec.composed,
        "languages": languages,
        "sources": sources,
        "toc": toc,
    }
    if not dry_run:
        (book_dir / "book.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return {"book": spec.book_id, "chapters": total, "languages": languages}


# ---------------------------------------------------------------------------
# Summa Theologiae — special multi-part bilingual build from aquinas.cc
# ---------------------------------------------------------------------------

# 10 widths, two per Part. Each row of the tuple is
#   (wid, did_la, did_en, rows, q_start, q_end_inclusive)
# The q_start/q_end let us validate that each Question we extract belongs to
# the wid we expect, defending against any aquinas.cc renumbering.
SUMMA_WIDS: dict[str, list[tuple[int, int, int, int, int, int]]] = {
    "FP": [
        (15, 56, 57,  3746,   1,  49),
        (16, 60, 61,  4520,  50, 119),
    ],
    "FS": [
        (17, 64, 66,  4717,   1,  70),
        (18, 68, 70,  3424,  71, 114),
    ],
    "SS": [
        (19, 72, 74,  6418,   1,  91),
        (20, 76, 78,  5685,  92, 189),
    ],
    "TP": [
        (21, 80, 82,  4278,   1,  59),
        (22, 84, 86,  3085,  60,  90),
    ],
    "XP": [
        (23, 88, 89,  4284,   1,  68),
        (24, 91, 92,  2810,  69,  99),
    ],
}

SUMMA_PART_LABELS = {
    "FP": ("Prima Pars",          "First Part",                    "I"),
    "FS": ("Prima Secundae",      "First Part of the Second Part", "I-II"),
    "SS": ("Secunda Secundae",    "Second Part of the Second Part","II-II"),
    "TP": ("Tertia Pars",         "Third Part",                    "III"),
    "XP": ("Supplementum",        "Supplement",                    "Suppl."),
}

# Maps the aquinas.cc Part ref segment to our canonical Part code.
SUMMA_REF_TO_PART = {
    "I":      "FP",
    "I-II":   "FS",
    "II-II":  "SS",
    "III":    "TP",
    "IIISup": "XP",
}

# Article ref pattern: ST.<part>.Q<n>.A<m> (the leaf article anchor on the site).
SUMMA_ARTICLE_RE = re.compile(r"^ST\.([A-Za-z-]+)\.Q(\d+)\.A(\d+)$")
# Question ref pattern: ST.<part>.Q<n>
SUMMA_QUESTION_RE = re.compile(r"^ST\.([A-Za-z-]+)\.Q(\d+)$")


def _summa_extract_articles(outline: OutlineNode) -> list[dict]:
    """Walk the outline of one Summa wid and return a flat list of articles.

    Each entry: {part, q, a, position, q_node, a_node}.

    A question's proem (the "Under this head there are N points of inquiry"
    block) lives between the Question node and its first Article child. We
    capture proem boundaries separately as entries with a=0.
    """
    out: list[dict] = []
    # Walk top-level children (questions)
    for q_node in outline.children:
        qm = SUMMA_QUESTION_RE.match(q_node.ref or "")
        if not qm:
            continue
        part_ref = qm.group(1)
        q_num = int(qm.group(2))
        part = SUMMA_REF_TO_PART.get(part_ref)
        if not part:
            continue
        # Collect article children sorted by position
        articles = []
        for child in q_node.children:
            am = SUMMA_ARTICLE_RE.match(child.ref or "")
            if not am:
                continue
            if int(am.group(2)) != q_num:
                continue
            articles.append((int(am.group(3)), child))
        articles.sort(key=lambda x: x[1].position)
        # Proem: from question position to first article position
        if articles:
            first_a_pos = articles[0][1].position
            if first_a_pos > q_node.position:
                out.append({
                    "part": part, "q": q_num, "a": 0,
                    "position": q_node.position,
                    "end_position": first_a_pos,
                    "title": q_node.title,
                })
        # Each article
        for idx, (a_num, a_node) in enumerate(articles):
            if idx + 1 < len(articles):
                end = articles[idx + 1][1].position
            else:
                # last article in this question: end at next question's position
                end = -1  # filled in below
            out.append({
                "part": part, "q": q_num, "a": a_num,
                "position": a_node.position,
                "end_position": end,
                "title": a_node.title,
            })
    # Fill in end_position for last-article-in-question entries.
    # Walk in order; each entry's end_position becomes the next entry's position.
    for i in range(len(out) - 1):
        if out[i]["end_position"] == -1:
            out[i]["end_position"] = out[i + 1]["position"]
    if out and out[-1]["end_position"] == -1:
        # Last article overall — open-ended; render_chapter will clamp.
        out[-1]["end_position"] = 10_000_000
    return out


def _summa_chapter_id(part: str, q: int, a: int) -> str:
    if a == 0:
        return f"{part.lower()}-q{q:03d}-pr"
    return f"{part.lower()}-q{q:03d}-a{a:02d}"


def _summa_clean_title(raw: str) -> str:
    # The Q titles arrive like "Q. 1 - Faith<n-sh id='ni_19_9'></n-sh>" and
    # article titles like "A. 3 - Whether confession is necessary?<n-sh ...>".
    # Strip the trailing <n-sh> placeholder and the leading "Q. N - " /
    # "A. N - " prefix.
    s = re.sub(r"<n-sh[^>]*></n-sh>", "", raw or "").strip()
    s = re.sub(r"^[QA]\.\s*\d+\s*-\s*", "", s).strip()
    return s


def build_summa_theologiae(dry_run: bool = False) -> dict:
    """Replace `summa-theologiae/` with the aquinas.cc bilingual edition.

    Preserves the canonical chapter id convention `{part}-q{NNN}-a{NN}` (and
    `-pr` for question proems). Builds a 3-level TOC: Part → Question →
    Article. The English column on aquinas.cc is the Shapcote translation
    (PD) revised by the Aquinas Institute, paired row-for-row with the
    Leonine Latin.
    """
    book_dir = BOOKS_ROOT / "summa-theologiae"
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    if not dry_run:
        # Clear old content to ensure no stale Geremia files survive.
        for sub in (en_dir, la_dir):
            if sub.is_dir():
                for f in sub.glob("*.md"):
                    f.unlink()
            sub.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    total = 0
    fake = OutlineNode(title="", ref="", position=0, children=[])

    for part_code in ["FP", "FS", "SS", "TP", "XP"]:
        la_name, en_name, roman = SUMMA_PART_LABELS[part_code]
        part_node = {
            "id": part_code.lower(),
            "title": {
                "en-US": f"Part {roman} — {en_name}",
                "la": la_name,
            },
            "children": [],
        }
        q_to_node: dict[int, dict] = {}

        for wid, did_la, did_en, rows, q_start, q_end in SUMMA_WIDS[part_code]:
            print(f"  [summa] {part_code} wid={wid} Q{q_start}-{q_end} ({rows} rows)")
            style_chars, outline_dict = fetch_structure(wid)
            root = parse_outline(outline_dict)
            articles = _summa_extract_articles(root)
            if not articles:
                print(f"    warn: no articles extracted from wid={wid}")
                continue
            la_rows = fetch_cells(did_la, rows)
            en_rows = fetch_cells(did_en, rows)
            for entry in articles:
                part = entry["part"]
                if part != part_code:
                    print(f"    warn: skipping {part} entry in {part_code} wid={wid}: Q{entry['q']}.A{entry['a']}")
                    continue
                q_num, a_num = entry["q"], entry["a"]
                title_en_clean = _summa_clean_title(entry["title"]) or (
                    "Prooemium" if a_num == 0 else f"Article {a_num}"
                )
                if a_num == 0:
                    chap_title_en = f"Question {q_num} — {title_en_clean}" if title_en_clean != "Prooemium" else "Prooemium"
                    chap_title_la = f"Quaestio {q_num}"
                else:
                    chap_title_en = f"Article {a_num} — {title_en_clean}"
                    chap_title_la = f"Articulus {a_num}"
                chap = OutlineNode(
                    title=chap_title_en,
                    ref="",
                    position=entry["position"],
                    children=[],
                )
                chap_la = OutlineNode(
                    title=chap_title_la,
                    ref="",
                    position=entry["position"],
                    children=[],
                )
                cid = _summa_chapter_id(part, q_num, a_num)
                end_pos = entry["end_position"]
                # Render bodies
                md_en = render_chapter(
                    chap, style_chars, la_rows, en_rows, "en-US", end_pos,
                    fallback_title=chap_title_en,
                )
                md_la = render_chapter(
                    chap_la, style_chars, la_rows, en_rows, "la", end_pos,
                    fallback_title=chap_title_la,
                )
                if not dry_run:
                    (en_dir / f"{cid}.md").write_text(md_en, encoding="utf-8")
                    (la_dir / f"{cid}.md").write_text(md_la, encoding="utf-8")
                # Question TOC entry
                if q_num not in q_to_node:
                    q_to_node[q_num] = {
                        "id": f"{part.lower()}-q{q_num:03d}",
                        "title": {
                            "en-US": f"Question {q_num}",
                            "la": f"Quaestio {q_num}",
                        },
                        "children": [],
                    }
                # Article/proem TOC entry
                if a_num == 0:
                    q_to_node[q_num]["children"].append({
                        "id": cid,
                        "title": {"en-US": "Prooemium", "la": "Prooemium"},
                    })
                else:
                    node_en = f"Article {a_num}"
                    if title_en_clean:
                        node_en += f" — {title_en_clean}"
                    q_to_node[q_num]["children"].append({
                        "id": cid,
                        "title": {
                            "en-US": node_en,
                            "la": f"Articulus {a_num}",
                        },
                    })
                total += 1

        # Attach questions in numeric order
        for q_num in sorted(q_to_node):
            # Update the question's en title with the actual question text, if
            # we captured one from the proem entry's title field.
            part_node["children"].append(q_to_node[q_num])
        if part_node["children"]:
            toc.append(part_node)

    # Pull Q titles from the rows themselves (aquinas.cc puts the topic in the
    # Q node's title on the outline — we already extracted it as the proem
    # entry's title; re-attach to the Question TOC node).
    # Walk again, briefer, to enrich titles using the proem entries we wrote.
    for part_entry in toc:
        for q_entry in part_entry["children"]:
            cid_pr = q_entry["children"][0]["id"] if q_entry["children"] else None
            if cid_pr and cid_pr.endswith("-pr"):
                # Read the proem file's H1
                f = en_dir / f"{cid_pr}.md"
                if f.is_file():
                    first_line = f.read_text().splitlines()[0]
                    if first_line.startswith("# "):
                        title = first_line[2:].strip()
                        # The proem title was the question's own title.
                        if title:
                            q_entry["title"]["en-US"] = f"Question {q_entry['id'].split('-q')[1]} — {title}"

    manifest = {
        "id": "aquinas-summa-theologiae",
        "name": {"en-US": "Summa Theologiae", "la": "Summa Theologiae"},
        "author": dict(AUTHOR),
        "description": {
            "en-US": "Aquinas's unfinished theological masterwork (1265–1274), the architecture of Catholic theology for seven centuries. Question-and-article form: objection, sed contra, respondeo, replies. Latin Leonine edition paired bilingually with the English translation of Fr. Laurence Shapcote OP (Benziger 1911–1925, public domain), revised by the Aquinas Institute.",
            "la": "Opus theologicum magnum, inchoatum 1265, morte interruptum 1273. Forma quaestionum et articulorum: obiectiones, sed contra, respondeo, ad obiecta.",
        },
        "composed": "1265–1273",
        "languages": ["en-US", "la"],
        "sources": [
            {
                "language": "en-US",
                "url": "https://aquinas.cc/la/en/~Summa Theologiae",
                "description": "Shapcote / Fathers of the English Dominican Province (Benziger 1911–1925, public domain) as revised by the Aquinas Institute; bilingual edition mirrored from aquinas.cc.",
            },
            {
                "language": "la",
                "url": "https://aquinas.cc/la/en/~Summa Theologiae",
                "description": "Latin Leonine / Marietti editions (public domain), mirrored from aquinas.cc.",
            },
        ],
        "toc": toc,
    }
    if not dry_run:
        (book_dir / "book.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return {"book": "aquinas-summa-theologiae", "articles": total}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_list() -> None:
    print(f"{'slug':<28} {'rows':>10}  book id")
    for slug_, spec in sorted(WORKS_CC.items()):
        rows = sum(p["rows"] for p in spec.parts)
        print(f"{slug_:<28} {rows:>10,}  {spec.book_id}")


def cmd_work(slug_: str) -> None:
    if slug_ not in WORKS_CC:
        print(f"unknown work: {slug_}")
        sys.exit(1)
    result = emit_book(WORKS_CC[slug_])
    print(json.dumps(result, indent=2))


def cmd_all() -> None:
    results = []
    for slug_ in WORKS_CC:
        print(f"[{slug_}]")
        try:
            results.append(emit_book(WORKS_CC[slug_]))
        except Exception as exc:
            print(f"  FAILED: {exc}")
            results.append({"book": WORKS_CC[slug_].book_id, "error": str(exc)})
    print(json.dumps(results, indent=2))


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    cmd = sys.argv[1]
    if cmd == "list":
        cmd_list()
    elif cmd == "work":
        if len(sys.argv) < 3:
            print("usage: work <slug>")
            return 1
        cmd_work(sys.argv[2])
    elif cmd == "all":
        cmd_all()
    elif cmd == "summa":
        result = build_summa_theologiae()
        print(json.dumps(result, indent=2))
    else:
        print(f"unknown command: {cmd}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
