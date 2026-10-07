"""Hand-written facts the upstream markup does not carry, and its corrections.

Each entry says why it exists. Anything here is checked by build.py: a patch
that no longer matches its target fails the build instead of going stale.
"""

# The four sequences of the Roman Missal. Upstream files each inside the Gospel
# acclamation with no class of its own, so it cannot be told apart by markup.
# `required` is the Missal's own rule (GIRM 64): Easter Sunday and Pentecost.
sequences = {
    "tempore.easter.easter-sunday": {"required": True},
    "tempore.easter.week-1.monday": {"required": False},
    "tempore.easter.week-1.tuesday": {"required": False},
    "tempore.easter.week-1.wednesday": {"required": False},
    "tempore.easter.week-1.thursday": {"required": False},
    "tempore.easter.week-1.friday": {"required": False},
    "tempore.easter.week-1.saturday": {"required": False},
    "tempore.easter.pentecost": {"required": True},
    "tempore.solemnity.corpus-christi": {"required": False},
    "sanctorale.09-15": {"required": False},
}

# Sanctoral celebrations upstream computes in code rather than by date.
# `after` counts days from Easter Sunday.
movable = [
    {"id": "sanctorale.mary-mother-of-the-church", "easter": 50},
    {"id": "sanctorale.immaculate-heart-of-mary", "easter": 69},
    {"id": "sanctorale.christ-eternal-high-priest", "easter": 53, "regions": ["spain"]},
    {"id": "sanctorale.pentecost-monday", "easter": 50, "regions": ["german-speaking"]},
    {"id": "sanctorale.our-lady-of-the-valley.argentina", "easter": 13, "regions": ["argentina"]},
    # Fourth Thursday of November.
    {"id": "sanctorale.thanksgiving-day.united-states", "weekdayOfMonth": [11, 4, 4], "regions": ["united-states"]},
]


# Table-of-Liturgical-Days numbers upstream has wrong. Our Lady of Aparecida is
# a solemnity in Brazil (its own heading says so) but is numbered as a feast.
precedence = {
    "sanctorale.10-12.brazil": 4,
    # Obligatory memorials. Upstream numbers them 7.5 so that they win over a
    # saint's memorial on the same day; the calendar gives a movable memorial
    # that precedence itself (decree of 11 February 2018).
    "sanctorale.mary-mother-of-the-church": 10,
    "sanctorale.immaculate-heart-of-mary": 10,
}


def color_of(doc):
    """Colour of a saint's day not in `colors.json`: red when it draws on the Common of Martyrs."""
    if doc["kind"] != "sanctoral":
        return None
    return "red" if any(c.startswith("common.martyrs") for c in doc.get("commons", [])) else "white"


def apply(kind, doc):
    if kind == "formulary" and doc["id"] in precedence:
        doc["precedence"] = precedence[doc["id"]]
    if kind == "lectionary" and doc["id"] in sequences:
        doc["sequence"] = sequences[doc["id"]]
