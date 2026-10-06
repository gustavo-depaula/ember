# Recompute the "Done" column and total of the catalog summary from the ticked lines.
# Usage (repo root): python3 research/holy-card-faces/count-done.py
import re
from pathlib import Path

p = Path("research/holy-card-faces/catalog.md")
text = p.read_text()

# Every item ("[x] …" up to the next box) with its "##" and "###" headings.
items = []
h2 = h3 = None
for line in text.split("\n"):
    if line.startswith("## "):
        h2, h3 = line[3:].strip(), None
    elif line.startswith("### "):
        h3 = line[4:].strip()
    for item in re.split(r"(?=\[[x ]\] )", line):
        if item.startswith(("[x] ", "[ ] ")):
            ids = [i.strip() for m in re.findall(r"`([^`]+)`", item) for i in m.split(",")]
            items.append({"h2": h2, "h3": h3, "done": item.startswith("[x]"), "ids": ids})


def ticked(heading):
    return sum(i["done"] for i in items if heading in (i["h2"], i["h3"]))


def total(heading):
    return sum(1 for i in items if heading in (i["h2"], i["h3"]))


# One line of the Angels holds several cards (Michael and Gabriel), so its cards are its ids.
angels = sum(len(i["ids"]) for i in items if i["h2"] == "Angels" and i["done"])
# A mystery is its own card unless a feast's card elsewhere in the catalog carries the same id.
elsewhere = {x for i in items if i["h2"] != "Mysteries of the Rosary" for x in i["ids"]}
rosary = sum(
    1 for i in items if i["h2"] == "Mysteries of the Rosary" and i["done"] and not set(i["ids"]) & elsewhere
)

rows = {
    "Saints — solemnities, feasts, memorials": ticked("Solemnities, feasts, memorials"),
    "Saints — optional memorials": ticked("Optional memorials"),
    "Saints of the Roman Canon not on the calendar": ticked("Named in the Roman Canon, not on the calendar"),
    "Saints of Brazil's own calendar": ticked("Brazil's own calendar"),
    "Saints with a card but no universal feast": ticked("With a card but no feast on the universal calendar"),
    "Saints of the novenas, not on the universal calendar": ticked("Saints of the novenas, not on the universal calendar"),
    "Saints canonized since 2022 (and Bl. Fulton Sheen)": ticked("Canonized since 2022"),
    "Saints of the Pictorial Lives (Saint of the Day)": ticked("From the Pictorial Lives of the Saints"),
    "Feasts of the Lord and the Church": ticked("Feasts of the Lord and the Church"),
    "Our Lady": ticked("Our Lady"),
    "Angels": angels,
    "Mysteries of the Rosary (not shared with a feast)": rosary,
    "Seasons (including the 4 Ember Days)": ticked("Seasons"),
    "Parts of the Mass": ticked("Parts of the Mass"),
    "Liturgical objects and vestments": ticked("Liturgical objects and vestments"),
}
for label, done in rows.items():
    text, n = re.subn(rf"(\| {re.escape(label)} \| \d+ \| )\d+( \|)", rf"\g<1>{done}\g<2>", text)
    if n != 1:
        raise SystemExit(f"summary row not found: {label}")
cards = len(list(Path("content/practices/saint-of-the-day/data/holy-cards").glob("*.json")))
text = re.sub(r"≈ (\d+) cards, \d+ done\.", rf"≈ \g<1> cards, {cards} done.", text)
p.write_text(text)
print(rows, "cards with art:", cards)
