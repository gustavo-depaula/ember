"""Carry DECISIONS.md D21 into glossary.md: árguere → repreender. Run once; idempotent.

    python3.13 research/psalterium/ps006/glossary_d21.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
text = path.read_text(encoding='utf-8')
swaps = [
    ('| árguere | acusar (*não me acuseis no vosso furor*) | open | ',
     '| árguere | repreender (*não me repreendais no vosso furor*) | settled (D21) | **D21 overrules the agent’s *acusar* (kept as an option in Ps 6): every living witness says rebuke, and *acusar* makes God the prosecutor. The word is shared with *increpáre*; they never meet in a verse.** The agent’s note: '),
    ('*Senhor, não me acuseis no vosso furor, * nem me castigueis na vossa ira*',
     '*Senhor, não me repreendais no vosso furor, * nem me castigueis na vossa ira*'),
    ('| increpáre | repreender | working | Ps 118:21 |',
     '| increpáre | repreender | working | Ps 118:21. Since D21 it shares the word with *árguere* (different Greek verbs, never in one verse); a good second word for God’s rebuke at the sea and the nations (*ab increpatióne tua fúgient*) would restore the split |'),
]
for old, new in swaps:
    if new in text:
        continue
    assert text.count(old) == 1, old
    text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('glossary: D21 carried')
