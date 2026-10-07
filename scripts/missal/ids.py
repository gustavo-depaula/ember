"""Upstream anchors -> Ember ids.

Ids say what a thing is (`tempore.lent.week-2.friday`, `sanctorale.12-03`), so
they survive a change of source. Upstream's anchors are positional codes
(`Q025`, `1203`, `0120Z`); this module is the only place that knows them.
"""

import re

weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

temporal = {
    # Advent and Christmas
    "A125": "tempore.christmas.nativity-day",
    "A1251": "tempore.christmas.nativity-vigil",
    "A1252": "tempore.christmas.nativity-night",
    "A1253": "tempore.christmas.nativity-dawn",
    "A129": "tempore.christmas.dec-29",
    "A130": "tempore.christmas.dec-30",
    "A131": "tempore.christmas.dec-31",
    "A140": "tempore.christmas.holy-family",
    "A141": "tempore.christmas.mary-mother-of-god",
    "A160": "tempore.christmas.second-sunday-after-christmas",
    "A170": "tempore.christmas.epiphany",
    "A170b": "tempore.christmas.epiphany-vigil",
    "A810": "tempore.christmas.baptism-of-the-lord",
    # Lent
    "Q003": "tempore.lent.ash-wednesday",
    "Q004": "tempore.lent.after-ash-wednesday.thursday",
    "Q005": "tempore.lent.after-ash-wednesday.friday",
    "Q006": "tempore.lent.after-ash-wednesday.saturday",
    # Holy Week and the Triduum
    "SS00": "tempore.holy-week.palm-sunday",
    "SS01": "tempore.holy-week.monday",
    "SS02": "tempore.holy-week.tuesday",
    "SS03": "tempore.holy-week.wednesday",
    "SS04A": "tempore.holy-week.chrism-mass",
    "SS04": "tempore.holy-week.lords-supper",
    "SS05": "tempore.holy-week.good-friday",
    "SS06": "tempore.holy-week.easter-vigil",
    # Easter
    "P010": "tempore.easter.easter-sunday",
    "P064A": "tempore.easter.ascension-vigil",
    "P064B": "tempore.easter.ascension",
    "P080A": "tempore.easter.pentecost-vigil",
    "P080": "tempore.easter.pentecost",
    # Solemnities of the Lord in Ordinary Time
    "OT51": "tempore.solemnity.most-holy-trinity",
    "OT52": "tempore.solemnity.corpus-christi",
    "OT53": "tempore.solemnity.sacred-heart-of-jesus",
    "OT54": "tempore.solemnity.christ-the-king",
}

# The lectionary names the same days with its own codes.
lectionaryOnly = {
    "A172": "tempore.christmas.jan-2",
    "A173": "tempore.christmas.jan-3",
    "A174": "tempore.christmas.jan-4",
    "A175": "tempore.christmas.jan-5",
    "A176": "tempore.christmas.jan-6",
    "A177a": "tempore.christmas.jan-7",
    "A177b": "tempore.christmas.after-epiphany.monday",
    "A178": "tempore.christmas.after-epiphany.tuesday",
    "A179": "tempore.christmas.after-epiphany.wednesday",
    "A1710": "tempore.christmas.after-epiphany.thursday",
    "A1711": "tempore.christmas.after-epiphany.friday",
    "A1712": "tempore.christmas.after-epiphany.saturday",
    "S000D": "tempore.holy-week.palm-sunday",
    "S000DA": "tempore.holy-week.palm-sunday.procession",
    "marcos": "tempore.holy-week.palm-sunday.passion-mark",
    "juan": "tempore.holy-week.palm-sunday.passion-john",
    "S001D": "tempore.holy-week.monday",
    "S002D": "tempore.holy-week.tuesday",
    "S003D": "tempore.holy-week.wednesday",
    "S004DA": "tempore.holy-week.chrism-mass",
    "S004D": "tempore.holy-week.lords-supper",
    "S005D": "tempore.holy-week.good-friday",
    "S006D": "tempore.holy-week.easter-vigil",
    "P010D": "tempore.easter.easter-sunday",
    "P064F": "tempore.easter.ascension",
    "P080E": "tempore.easter.pentecost-vigil",
    "P080D": "tempore.easter.pentecost",
    "genesis": "tempore.easter.pentecost-vigil.genesis",
    "exodo": "tempore.easter.pentecost-vigil.exodus",
    "ezequiel": "tempore.easter.pentecost-vigil.ezekiel",
    "joel": "tempore.easter.pentecost-vigil.joel",
    "O510I": "tempore.solemnity.most-holy-trinity",
    "O520I": "tempore.solemnity.corpus-christi",
    "O530I": "tempore.solemnity.sacred-heart-of-jesus",
    "O540I": "tempore.solemnity.christ-the-king",
}

# The weekday formularies of Christmas time before and after Epiphany.
christmasWeekday = {f"A17{d}": f"tempore.christmas.weekday.{weekdays[d]}" for d in range(1, 7)}

commons = {
    "bmv": "common.blessed-virgin-mary",
    "ded": "common.dedication-of-a-church",
    "doct": "common.doctors",
    "mart": "common.martyrs",
    "past": "common.pastors",
    "sanct": "common.holy-men-and-women",
    "virg": "common.virgins",
}
commonSuffix = {"adv": "advent", "nav": "christmas", "pas": "easter", "pas2": "easter-2"}

sanctoralRegionFiles = {
    "africa": "africa",
    "arg": "argentina",
    "brasil": "brazil",
    "obra": "opus-dei",
    "fran": "france",
}

# Anchors that are not a calendar date.
sanctoralSpecial = {
    ("may", "0535"): "sanctorale.mary-mother-of-the-church",
    ("may", "0532"): "sanctorale.immaculate-heart-of-mary",
    ("may", "0533"): "sanctorale.christ-eternal-high-priest",
    ("may", "0534"): "sanctorale.pentecost-monday",
    ("arg", "0544"): "sanctorale.our-lady-of-the-valley.argentina",
    # Upstream's anchor for 13 June is a typo.
    ("jun", "0136"): "sanctorale.06-13",
    ("nov", "1130Z"): "sanctorale.thanksgiving-day.united-states",
    ("fran", "9999"): "sanctorale.dedication-of-churches.france",
    # Upstream files the Assumption's vigil at the plain anchor and the day Mass at Z.
    ("ago", "0815"): "sanctorale.08-15.vigil",
    ("ago", "0815Z"): "sanctorale.08-15",
    ("mar", "0309Z"): "sanctorale.03-09.german-speaking",
    ("sep", "0917Z"): "sanctorale.09-17.hildegard-of-bingen",
    ("nov", "1102Z"): "sanctorale.11-02.second-mass",
    ("nov", "1102Y"): "sanctorale.11-02.third-mass",
    **{("oct", f"1005{n}"): f"sanctorale.10-05.spain.{n}" for n in range(1, 6)},
    ("obra", "000A"): "sanctorale.anniversary-of-the-pope.opus-dei",
    ("obra", "000B"): "sanctorale.anniversaries-of-the-prelate.opus-dei",
    ("obra", "000C"): "sanctorale.prelate-other.opus-dei",
    ("obra", "000D"): "sanctorale.thanksgiving.opus-dei",
}

eucharisticPrayers = {
    "plegaria_euc_1": "eucharistic-prayer.1",
    "plegaria_euc_2": "eucharistic-prayer.2",
    "plegaria_euc_3": "eucharistic-prayer.3",
    "plegaria_euc_4": "eucharistic-prayer.4",
    "plegaria_euc_5_i": "eucharistic-prayer.various-needs-1",
    "plegaria_euc_5_ii": "eucharistic-prayer.various-needs-2",
    "plegaria_euc_5_iii": "eucharistic-prayer.various-needs-3",
    "plegaria_euc_5_iv": "eucharistic-prayer.various-needs-4",
    "plegaria_euc_rec_i": "eucharistic-prayer.reconciliation-1",
    "plegaria_euc_rec_ii": "eucharistic-prayer.reconciliation-2",
}

order = {
    "ordinario": "order.ordinary",
    "bendiciones": "order.blessings",
    "oracion_fieles": "order.universal-prayer",
    "oraciones_pueblo": "order.prayers-over-the-people",
}


# Upstream's element ids for the stretches of a rite the app treats specially,
# under the names Ember uses. An id not listed here is not carried over.
sections = {
    # Order of Mass
    "bendicion_agua": "sprinkling",
    "agua_fueratp": "sprinkling.outside-easter",
    "agua_durantetp": "sprinkling.easter",
    "penitencia1": "penitential-act.1",
    "penitencia2": "penitential-act.2",
    "penitencia3": "penitential-act.3",
    "himno_gloria": "gloria",
    "credo0": "creed.nicene",
    "credo1": "creed.nicene",
    "credo00": "creed.apostles",
    "credo2": "creed.apostles",
    "indice_or_fieles": "universal-prayer.index",
    "lit_euchar": "liturgy-of-the-eucharist",
    "bendic_obispo": "bishop-blessing",
    # A Eucharistic Prayer's own preface
    "contenido_pf": "preface",
    # The readings of the Easter Vigil, each placed by the rite
    **{f"lectura_{n}": f"reading.{n}" for n in range(1, 10)},
    "lectura_evangelio": "reading.gospel",
}

# Upstream's paragraph classes around a reading, as roles.
blockRoles = {
    "ReadingGospelTitle": "title",
    "PsalmAlleluiaTitle": "title",
    "Summary": "summary",
    "Areadingfrom": "announcement",
    "TheWordoftheLord": "conclusion",
}


def temporal_id(anchor, lectionary):
    """Id for an anchor of the temporal cycle, or None when it is not one."""
    if lectionary and anchor in lectionaryOnly:
        return lectionaryOnly[anchor]
    code = anchor
    if lectionary:
        # Lectionary anchors carry a trailing marker: Q025D, O051I.
        code = re.sub(r"(?<=\d)[DI]$", "", anchor)
    if code in temporal:
        return temporal[code]
    if not lectionary and code in christmasWeekday:
        return christmasWeekday[code]
    if m := re.fullmatch(r"A1(1[7-9]|2[0-4])", code):
        return f"tempore.advent.dec-{m.group(1)}"
    if m := re.fullmatch(r"A0([1-4])([0-6])", code):
        return f"tempore.advent.week-{m.group(1)}.{weekdays[int(m.group(2))]}"
    if m := re.fullmatch(r"Q0([1-5])([0-6])", code):
        return f"tempore.lent.week-{m.group(1)}.{weekdays[int(m.group(2))]}"
    if m := re.fullmatch(r"P0([1-7])([0-6])", code):
        return f"tempore.easter.week-{m.group(1)}.{weekdays[int(m.group(2))]}"
    if m := re.fullmatch(r"OT(\d\d)", code):
        return f"tempore.ordinary-time.week-{int(m.group(1))}"
    if lectionary and (m := re.fullmatch(r"O(\d\d)([0-6])", code)):
        return f"tempore.ordinary-time.week-{int(m.group(1))}.{weekdays[int(m.group(2))]}"
    return None


def common_id(file, anchor):
    """`comunes_mart#mart6` -> `common.martyrs.6`; the other votive files by number."""
    if file == "difuntos":
        return f"for-the-dead.{anchor[3:].lstrip('0') or '0'}"
    if file == "diversas":
        return f"various-needs.{anchor[3:].lstrip('0') or '0'}"
    if file == "votivas":
        return f"votive.{int(anchor)}"
    m = re.fullmatch(r"([a-z]+?)(\d+|adv|nav|pas2?)", anchor)
    if not m or m.group(1) not in commons:
        return None
    return f"{commons[m.group(1)]}.{commonSuffix.get(m.group(2), m.group(2))}"


def slug(text):
    text = text.lower()
    for a, b in ("áàâãä", "a"), ("éèêë", "e"), ("íìîï", "i"), ("óòôõö", "o"), ("úùûü", "u"), ("ç", "c"), ("ñ", "n"), ("æ", "ae"), ("œ", "oe"), ("ß", "ss"):
        for ch in a:
            text = text.replace(ch, b)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


honorifics = re.compile(
    r"^(saints?|ss\.?|st\.?|blessed|bl\.?|the|our lady of|s\.|b\.|bb\.)\s+", re.I
)


def name_slug(title):
    """`Saint Sebastian, martyr` -> `sebastian`."""
    name = title.split(",")[0]
    while honorifics.match(name):
        name = honorifics.sub("", name)
    return slug(name)
