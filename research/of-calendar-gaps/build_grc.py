"""Assemble grc.tsv — the current General Roman Calendar (sanctoral + the
Lord's feasts that live in the temporal cycle) — from:

  * sources/wikipedia-grc.wikitext: the "List of celebrations inscribed in the
    GRC" section of en.wikipedia.org/wiki/General_Roman_Calendar, which
    transcribes the Calendarium Romanum Generale of the Missale Romanum,
    ed. typ. tertia emendata (2008), pp. 105-116, and cites the later decrees.
  * the decrees on vatican.va / press.vatican.va (DECREES below), which are
    the authority for every post-2008 addition or rank change.
  * sources/usccb-2026cal.txt (pdftotext of usccb.org/resources/2026cal.pdf):
    an independent cross-check. Each fixed-date row gets `usccb2026` =
    the rank USCCB prints that day ("om" bracketed, memorial, feast, ...),
    or "absent" when the day is impeded in 2026 (Sunday, Lent, solemnity).

Run:  python3.13 research/of-calendar-gaps/build_grc.py
"""

import csv
import re
import unicodedata
from pathlib import Path

here = Path(__file__).parent
mr2008 = (
    "MR2008 Calendarium Romanum Generale pp.105-116 "
    "(transcribed at https://en.wikipedia.org/wiki/General_Roman_Calendar)"
)

# key = (MM-DD or movable rule, keyword) -> decree URL. Keywords match `kw` below.
DECREES = {
    "gregory of narek": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210125_decreto-dottori_en.html",
    "john of avila": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210125_decreto-dottori_en.html",
    "hildegard": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210125_decreto-dottori_en.html",
    "paul vi": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20190125_decreto-celebrazione-paolovi_en.html",
    "mother of the church": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20180211_decreto-mater-ecclesiae_en.html",
    "irenaeus": "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2022/01/21/220121b.html (Doctor title only; rank unchanged)",
    "immaculate heart": "https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20000630_memoria-immaculati-cordis-mariae-virginis_lt.html",
    "mary magdalene": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/sanctae-m-magdalenae-decretum_en.pdf",
    "martha": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210126_decreto-santi_en.html",
    "teresa of calcutta": "https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2025/02/11/0125/00250.html",
    "faustina": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20200518_decreto-celebrazione-santafaustina_en.html",
    "john xxiii": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20140529_decreto-calendario-generale-gxxiii-gpii_en.html",
    "john paul ii": "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20140529_decreto-calendario-generale-gxxiii-gpii_en.html",
    "newman": "https://www.vatican.va/content/romancuria/en/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti/20251109-decreto-iscrizione-newman.html (decree 9 Nov 2025, published with Latin collect at https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2026/02/03/0095/00182.html)",
    "loreto": "https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2019/10/31/0834/01731.html",
}

# A distinctive, accent-free word or phrase used to match our titles, the
# USCCB text and holy-card names. Default: first proper-name-ish word.
KEYWORD_OVERRIDES = {
    "Solemnity of Mary, the Holy Mother of God": "mother of god",
    "Saints Basil the Great and Gregory Nazianzen": "basil",
    "The Most Holy Name of Jesus": "name of jesus",
    "The Epiphany of the Lord": "epiphany",
    "The Baptism of the Lord": "baptism",
    "The Conversion of Saint Paul the Apostle": "conversion",
    "The Presentation of the Lord": "presentation of the lord",
    "Our Lady of Lourdes": "lourdes",
    "The Seven Holy Founders of the Servite Order": "servite",
    "The Chair of Saint Peter the Apostle": "chair",
    "Saint Gregory of Narek": "gregory of narek",
    "Saint John of Ávila": "avila",
    "Saint Joseph, Spouse of the Blessed Virgin Mary": "joseph",
    "The Annunciation of the Lord": "annunciation",
    "Saint Joseph the Worker": "joseph",
    "Our Lady of Fatima": "fatima",
    "Saint Mary Magdalene de’ Pazzi": "pazzi",
    "Saint Paul VI": "paul vi",
    "The Visitation of the Blessed Virgin Mary": "visitation",
    "Blessed Virgin Mary, Mother of the Church": "mother of the church",
    "The Most Holy Trinity": "trinity",
    "The Most Holy Body and Blood of Christ": "body and blood",
    "Saints John Fisher, Bishop, and Thomas More": "fisher",
    "The Nativity of Saint John the Baptist": "nativity of saint john",
    "Saints Peter and Paul, Apostles": "peter and paul",
    "The First Martyrs of Holy Roman Church": "first martyrs",
    "The Most Sacred Heart of Jesus": "sacred heart",
    "The Immaculate Heart of the Blessed Virgin Mary": "immaculate heart",
    "Saint Mary Magdalene": "mary magdalene",
    "Saints Joachim and Anne": "joachim",
    "Saints Martha, Mary and Lazarus": "martha",
    "Saint Teresa Benedicta of the Cross": "benedicta",
    "The Dedication of the Basilica of Saint Mary Major": "mary major",
    "The Transfiguration of the Lord": "transfiguration",
    "Saint Sixtus II": "sixtus",
    "The Assumption of the Blessed Virgin Mary": "assumption",
    "Saint Stephen of Hungary": "hungary",
    "The Queenship of the Blessed Virgin Mary": "queenship",
    "Saint Augustine of Hippo": "augustine",
    "The Passion of Saint John the Baptist": "john the baptist",
    "Saint Teresa of Calcutta": "teresa of calcutta",
    "The Nativity of the Blessed Virgin Mary": "nativity of the blessed",
    "The Most Holy Name of Mary": "name of mary",
    "The Exaltation of the Holy Cross": "cross",
    "Our Lady of Sorrows": "sorrows",
    "Saints Andrew Kim Tae-gon": "andrew kim",
    "Saint Pius of Pietrelcina": "pietrelcina",
    "Saints Michael, Gabriel and Raphael": "michael",
    "Saint Lawrence Ruiz and Companions": "ruiz",
    "Saint Thérèse of the Child Jesus": "child jesus",
    "The Holy Guardian Angels": "guardian angels",
    "Our Lady of the Rosary": "rosary",
    "Saint John Henry Newman": "newman",
    "Saint John XXIII": "john xxiii",
    "Saint Teresa of Jesus": "teresa of jesus",
    "Saint Margaret Mary Alacoque": "alacoque",
    "Saints John de Brébeuf, Isaac Jogues": "brebeuf",
    "Saint Paul of the Cross": "paul of the cross",
    "Saint John Paul II": "john paul ii",
    "Saint John of Capistrano": "capistrano",
    "Saints Simon and Jude": "simon",
    "All Saints": "all saints",
    "The Commemoration of All the Faithful Departed": "faithful departed",
    "The Dedication of the Lateran Basilica": "lateran",
    "Saint Margaret of Scotland": "margaret of scotland",
    "Saint Elizabeth of Hungary": "elizabeth of hungary",
    "The Dedication of the Basilicas of Saints Peter and Paul": "basilicas",
    "The Presentation of the Blessed Virgin Mary": "presentation of the blessed",
    "Saints Andrew Dung-Lac": "dung",
    "Saint Catherine of Alexandria": "alexandria",
    "Our Lord Jesus Christ, King of the Universe": "king",
    "The Immaculate Conception of the Blessed Virgin Mary": "immaculate conception",
    "Saint Juan Diego Cuauhtlatoatzin": "juan diego",
    "Our Lady of Loreto": "loreto",
    "Our Lady of Guadalupe": "guadalupe",
    "Saint John of the Cross": "john of the cross",
    "Nativity of the Lord": "nativity of the lord",
    "Saint Stephen, the First Martyr": "stephen",
    "Saint John, Apostle and Evangelist": "john, apostle",
    "The Holy Innocents": "innocents",
    "The Holy Family of Jesus, Mary and Joseph": "holy family",
    "Saint Sharbel Makhluf": "makhluf",
    "Saint Jean Vianney": "vianney",
    "Saint Louis Grignon de Montfort": "montfort",
    "Saint Turibius of Mongrovejo": "turibius",
    "Saint Raymond of Penyafort": "penyafort",
    "Saint Christopher Magallanes": "magallanes",
    "Saint Augustine Zhao Rong": "zhao",
    "Saint Lawrence of Brindisi": "brindisi",
    "Saint Peter Julian Eymard": "eymard",
    "Saint Jane Frances de Chantal": "chantal",
    "Saint Joseph Calasanz": "calasanz",
    "Our Lady of Mount Carmel": "carmel",
    "Saint Gregory VII": "gregory vii",
    "Saint Gregory the Great": "gregory the great",
    "Saint Leo the Great": "leo",
    "Saint Martin of Tours": "martin of tours",
    "Saint Martin de Porres": "porres",
    "Saint Martin I": "martin i",
    "Saint John I": "john i,",
    "Saint Cyril of Alexandria": "cyril of alexandria",
    "Saint Cyril of Jerusalem": "cyril of jerusalem",
    "Saints Cyril, Monk, and Methodius": "methodius",
    "Saint Anthony of Padua": "padua",
    "Saint Anthony Zaccaria": "zaccaria",
    "Saint Anthony Mary Claret": "claret",
    "Saint Anthony, Abbot": "anthony",
    "Saint Francis de Sales": "sales",
    "Saint Francis of Paola": "paola",
    "Saint Francis of Assisi": "assisi",
    "Saint Francis Xavier": "xavier",
    "Saint Peter Damian": "damian",
    "Saint Peter Chanel": "chanel",
    "Saint Peter Chrysologus": "chrysologus",
    "Saint Peter Claver": "claver",
    "Saint Peter Canisius": "canisius",
    "Saint John Baptist de la Salle": "la salle",
    "Saint John Bosco": "bosco",
    "Saint John Eudes": "eudes",
    "Saint John Chrysostom": "chrysostom",
    "Saint John Leonardi": "leonardi",
    "Saint John Damascene": "damascene",
    "Saint John of Kanty": "kanty",
    "Saint John of God": "john of god",
    "Saint Thomas Aquinas": "aquinas",
    "Saint Thomas Becket": "becket",
    "Saint Thomas, Apostle": "thomas",
    "Saint Vincent Ferrer": "ferrer",
    "Saint Vincent de Paul": "vincent de paul",
    "Saint Vincent, Deacon": "vincent",
    "Saint Ignatius of Loyola": "loyola",
    "Saint Ignatius of Antioch": "antioch",
    "Saint Elizabeth of Portugal": "portugal",
    "Saint Robert Bellarmine": "bellarmine",
    "Saint Catherine of Siena": "siena",
    "Saint Bernardine of Siena": "bernardine",
    "Saint Bede the Venerable": "bede",
    "Saint Augustine of Canterbury": "canterbury",
    "Saint Philip Neri": "neri",
    "Saints Philip and James": "philip and james",
    "Saints Timothy and Titus": "timothy",
    "Saints Paul Miki": "miki",
    "Saint Paulinus of Nola": "paulinus",
    "Saint Aloysius Gonzaga": "gonzaga",
    "Saint Camillus de Lellis": "camillus",
    "Saint Alphonsus Liguori": "alphonsus",
    "Saint Eusebius of Vercelli": "eusebius",
    "Saint Maximilian Kolbe": "kolbe",
    "Saint Rose of Lima": "rose",
    "Saint Pius X": "pius x",
    "Saint Pius V": "pius v",
    "Saints Cornelius": "cornelius",
    "Saints Cosmas and Damian": "cosmas",
    "Saint Denis": "denis",
    "Saint Callistus I": "callistus",
    "Saint Charles Borromeo": "borromeo",
    "Saints Charles Lwanga": "lwanga",
    "Saints Marcellinus and Peter": "marcellinus",
    "Saints Nereus and Achilleus": "nereus",
    "Saints Pontian": "pontian",
    "Saints Perpetua and Felicity": "perpetua",
    "Saint Damasus I": "damasus",
    "Saint Sylvester I": "sylvester",
    "Saint Clement I": "clement",
    "Saint Mark, Evangelist": "mark",
    "Saint Luke, Evangelist": "luke",
    "Saint Matthew": "matthew",
    "Saint Andrew, Apostle": "andrew",
    "Saint James, Apostle": "james",
    "Saint Lawrence, Deacon": "lawrence",
    "Saint Teresa of Jesus": "teresa of jesus",
}

RANKS = {
    "solemnity": "solemnity",
    "feast": "feast",
    "memorial": "memorial",
    "optional memorial": "optional-memorial",
    "ranked with solemnities": "solemnity",
}
MONTHS = "January February March April May June July August September October November December".split()

# Lord's feasts and others the app keeps in the temporal cycle.
TEMPORAL = {
    "mother of god": "tempore.christmas.mary-mother-of-god",
    "epiphany": "tempore.christmas.epiphany",
    "baptism": "tempore.christmas.baptism-of-the-lord",
    "trinity": "tempore.solemnity.most-holy-trinity",
    "body and blood": "tempore.solemnity.corpus-christi",
    "sacred heart": "tempore.solemnity.sacred-heart-of-jesus",
    "king": "tempore.solemnity.christ-the-king",
    "nativity of the lord": "tempore.christmas.nativity-day",
    "holy family": "tempore.christmas.holy-family",
}


def fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[ \t]+", " ", s.lower().replace("’", "'"))


def keyword(title: str) -> str:
    for prefix, kw in sorted(KEYWORD_OVERRIDES.items(), key=lambda kv: -len(kv[0])):
        if title.startswith(prefix):
            return kw
    m = re.match(r"Saints? ([A-Z][\w'-]+)", title)
    return fold(m.group(1)) if m else fold(title.split(",")[0])


def parse_wikipedia() -> list[dict]:
    t = (here / "sources/wikipedia-grc.wikitext").read_text()
    seg = t[t.index("===January===") : t.index("== Particular calendars")]
    rows = []
    for line in seg.splitlines():
        if not line.startswith("*"):
            continue
        s = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", "", line)
        s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
        s = re.sub(r"\{\{ref\|[^}]*\}\}|''", "", s).lstrip("* ").strip()
        when, rest = s.split(":", 1)
        title, rank = re.split(r"\s+[–-]\s+(?=[a-z])", rest.strip())
        m = re.match(r"(\d+) (\w+)$", when.strip())
        date = f"{MONTHS.index(m.group(2)) + 1:02d}-{int(m.group(1)):02d}" if m else when.strip()
        kw = keyword(title)
        rows.append(
            {
                "date": date,
                "title": title,
                "rank": RANKS[rank.strip()],
                "keyword": kw,
                "temporal": TEMPORAL.get(kw, ""),
                "source": DECREES.get(kw, mr2008),
            }
        )
    return rows


def parse_usccb() -> dict[str, str]:
    """MM-DD -> concatenated text of that day's entries (Dec appears twice)."""
    lines = (here / "sources/usccb-2026cal.txt").read_text().splitlines()
    start = next(i for i, l in enumerate(lines) if "NOVEMBER–DECEMBER 2025" in l)
    end = next(i for i, l in enumerate(lines) if "PROPIO DE LOS SANTOS" in l)
    day_re = re.compile(r"^(\d{1,2})\s+(Mon|Tue|Wed|Thu|Fri|Sat|SUN|Sun)\b(.*)")
    month, prev, cur, out = 11, 0, None, {}
    for line in lines[start:end]:
        m = day_re.match(line)
        if m:
            day = int(m.group(1))
            if day < prev:
                month = month % 12 + 1
            prev = day
            cur = f"{month:02d}-{day:02d}"
            out[cur] = out.get(cur, "") + "\n" + m.group(3)
        elif cur:
            out[cur] += "\n" + line
    return out


def usccb_rank(block: str, kw: str) -> str:
    text = fold(block)
    if kw not in re.sub(r"\s+", " ", text):
        return "absent"
    for b in re.findall(r"\[([^\]]*)\]", text, re.S):
        if kw in b:
            return "usa-om" if f"usa: {kw}" in b or re.search(r"usa:[^;]*" + re.escape(kw), b) else "om"
    for word in ("solemnity", "feast", "memorial"):
        if re.search(rf"^\s*{word}\b", text, re.M):
            return word
    return "?"


def main() -> None:
    rows = parse_wikipedia()
    usccb = parse_usccb()
    for r in rows:
        r["usccb2026"] = usccb_rank(usccb.get(r["date"], ""), r["keyword"]) if re.match(r"\d\d-\d\d$", r["date"]) else ""
    with open(here / "grc.tsv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} rows -> grc.tsv")


if __name__ == "__main__":
    main()
