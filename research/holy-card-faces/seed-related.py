"""Seeds each holy card's `related` from what the corpus already says.

A card owns the list of what its page shows: prayers, writings, collections and
other cards. This fills that list once, from three places, for cards that have
none yet (a card already carrying `related` is left alone, so hand edits survive):

  - the collections devoted to one saint or one devotion, section by section;
  - the practices that name a card as theirs (`holyCard`: novenas, devotions);
  - the table of card-to-card links below.

A card link is written on one card only; the app shows it from both sides.

Run from the repo root:  python3 research/holy-card-faces/seed-related.py
"""

import glob, json, os

cards_dir = "content/practices/saint-of-the-day/data/holy-cards/"

# collection -> the card whose page takes its sections as prayers and writings.
own_collection = {
    "alphonsus-liguori": "alphonsus_liguori",
    "thomas-aquinas": "thomas_aquinas",
    "augustine-of-hippo": "augustine",
    "jerome": "jerome",
    "gregory-the-great": "gregory_great",
    "john-chrysostom": "john_chrysostom",
    "ambrose-of-milan": "ambrose",
    "athanasius": "athanasius",
    "cyprian-of-carthage": "cornelius_cyprian",
    "montfort-spirituality": "louis_de_montfort",
    "divine-mercy": "divine_mercy",
    "sacred-heart": "sacred_heart",
}

# collection -> further cards that only link to it.
linked_collection = {
    "divine-mercy": ["faustina"],
    "sacred-heart": ["margaret_mary"],
    "opus-dei": ["josemaria_escriva"],
    "carmelite": ["mount_carmel"],
}

# One card -> the cards about the same person, event or devotion. Kept to links
# the cards' own names and the Missal's notices state; a starter list to review.
card_links = {
    "peter": ["paul", "chair_peter", "peter_chair_rome", "peter_chains", "basilicas_peter_paul"],
    "paul": ["conversion_paul", "basilicas_peter_paul"],
    "john_baptist": ["beheading_john_baptist"],
    "john_evangelist": ["john_latin_gate"],
    "michael_archangel": ["apparition_michael", "gabriel_archangel", "raphael_archangel", "guardian_angels"],
    "gabriel_archangel": ["raphael_archangel", "annunciation"],
    "stephen": ["finding_stephen_relics"],
    "discovery_cross": ["exaltation_cross", "helena"],
    "our_lady_rosary": [
        "annunciation", "visitation", "nativity_christ", "presentation_lord", "finding_temple",
        "baptism_lord", "wedding_cana", "proclamation_kingdom", "transfiguration", "institution_eucharist",
        "agony_garden", "scourging", "crowning_thorns", "carrying_cross", "crucifixion",
        "easter", "ascension", "pentecost", "assumption", "queenship",
    ],
    "immaculate_conception": ["lourdes", "miraculous_medal"],
    "immaculate_heart": ["fatima", "sacred_heart"],
    "sacred_heart": ["margaret_mary"],
    "divine_mercy": ["faustina", "john_paul_ii"],
    "guadalupe": ["juan_diego"],
    "mount_carmel": ["simon_stock"],
    "teresa": ["john_of_the_cross"],
    "therese": ["louis_zelie_martin"],
    "augustine": ["monica", "ambrose"],
    "benedict": ["scholastica", "placid"],
    "francis_assisi": ["clare_assisi"],
    "thomas_aquinas": ["albert_great", "dominic", "corpus_christi"],
    "ignatius_loyola": ["francis_xavier", "peter_favre", "francis_borgia"],
    "francis_de_sales": ["jane_frances_chantal"],
    "holy_family": ["joseph", "nativity_christ"],
    "anne": ["nativity_bvm", "presentation_bvm"],
    "lateran_basilica": ["mary_major", "basilicas_peter_paul"],
    "all_saints": ["all_souls"],
    "triduum": ["institution_eucharist", "crucifixion", "easter"],
    "advent_sunday": ["advent_weekday", "gaudete", "advent_ember_days"],
    "lent_sunday": ["lent_weekday", "laetare", "lent_ember_days"],
    "pentecost": ["pentecost_ember_days"],
}

novenas = {"en-US": "Novenas", "pt-BR": "Novenas"}
devotions = {"en-US": "Devotions", "pt-BR": "Devoções"}

related = {}


def of(card):
    return related.setdefault(card, {})


def add(card, kind, title, ref):
    groups = of(card).setdefault(kind, [])
    if any(ref in g["refs"] for g in groups):
        return
    group = next((g for g in groups if g.get("title") == title), None)
    if not group:
        group = {"title": title, "refs": []} if title else {"refs": []}
        groups.append(group)
    group["refs"].append(ref)


for cid, card in own_collection.items():
    c = json.load(open(f"content/collections/{cid}.json"))
    sections = [s for s in c["sections"] if any(b.get("kind") == "item" for b in s["blocks"])]
    for s in sections:
        # A collection with a single shelf ("Works") needs no heading on the card's page.
        title = {k: v for k, v in s["title"].items() if k in ("en-US", "pt-BR")} if len(sections) > 1 else None
        for b in s["blocks"]:
            if b.get("kind") != "item":
                continue
            kind = "pray" if b["ref"].startswith("practice/") else "read"
            add(card, kind, title, b["ref"])
    of(card).setdefault("collections", []).append(f"collection/{cid}")

for cid, cards in linked_collection.items():
    for card in cards:
        of(card).setdefault("collections", []).append(f"collection/{cid}")

for f in sorted(glob.glob("content/practices/*/manifest.json")):
    m = json.load(open(f))
    owners = m.get("holyCard")
    if not owners:
        continue
    title = novenas if "novena" in m.get("tags", []) else devotions
    for card in [owners] if isinstance(owners, str) else owners:
        add(card, "pray", title, f"practice/{m['id']}")

for card, others in card_links.items():
    of(card)["cards"] = others

written = 0
for card, value in sorted(related.items()):
    path = cards_dir + card + ".json"
    if not os.path.exists(path):
        raise SystemExit(f"no card {card}")
    data = json.load(open(path))
    if "related" in data:
        continue
    # Before the provenance trail, which stays last in every card file.
    meta = data.pop("meta", None)
    data["related"] = {k: value[k] for k in ("pray", "read", "collections", "cards") if k in value}
    if meta is not None:
        data["meta"] = meta
    open(path, "w").write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    written += 1
print("cards given a related list:", written)
