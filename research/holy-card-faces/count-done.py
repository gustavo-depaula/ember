# Recompute the "Done" column and total of the catalog summary from the ticked lines.
# Usage (repo root): python3 research/holy-card-faces/count-done.py
import re
from pathlib import Path

p = Path("docs/plans/holy-cards-catalog.md")
text = p.read_text()
sections = {}
current = None
for line in text.split("\n"):
    if line.startswith("### ") or line.startswith("## "):
        current = line.lstrip("# ").strip()
    if current:
        sections.setdefault(current, [0, 0])
        sections[current][0] += line.count("[x]")
        sections[current][1] += line.count("[x]") + line.count("[ ]")
rows = {
    "Saints — solemnities, feasts, memorials": "Solemnities, feasts, memorials",
    "Saints — optional memorials": "Optional memorials",
    "Saints of the Roman Canon not on the calendar": "Named in the Roman Canon, not on the calendar",
    "Saints of Brazil's own calendar": "Brazil's own calendar",
}
for label, section in rows.items():
    done = sections[section][0]
    text = re.sub(rf"(\| {re.escape(label)} \| \d+ \| )\d+( \|)", rf"\g<1>{done}\g<2>", text)
cards = len(list(Path("content/practices/saint-of-the-day/data/holy-cards").glob("*.json")))
text = re.sub(r"≈ (\d+) cards, \d+ done\.", rf"≈ \g<1> cards, {cards} done.", text)
p.write_text(text)
print({k: sections[v] for k, v in rows.items()}, "cards with art:", cards)
