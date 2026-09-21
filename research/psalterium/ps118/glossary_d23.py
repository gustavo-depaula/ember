"""Carry DECISIONS.md D23 into glossary.md: in ætérnum → para sempre. Run once; idempotent.

    python3.13 research/psalterium/ps118/glossary_d23.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
text = path.read_text(encoding='utf-8')
swaps = [
    ('| in ætérnum | eternamente | working | refrain of 135; kept distinct from *in sǽculum* on purpose. ',
     '| in ætérnum | para sempre | settled (D23) | **D23: one with *in sǽculum* — one Greek phrase (εἰς τὸν αἰῶνα), merged by Douay-Rheims and Matos Soares 1932; the refrain of Ps 135 will be that of Ps 117. *Eternamente* is the option in Ps 118.** Before D23: kept distinct from *in sǽculum* on purpose. '),
    ('settled (D14; Ps 135’s *in ætérnum* refrain not yet ruled)', 'settled (D14; D23 gives Ps 135’s *in ætérnum* refrain the same words)'),
    ("settled (D14; Ps 135's *in ætérnum* refrain not yet ruled)", "settled (D14; D23 gives Ps 135's *in ætérnum* refrain the same words)"),
]
done = 0
for old, new in swaps:
    if old in text:
        text = text.replace(old, new)
        done += 1
path.write_text(text, encoding='utf-8')
print('glossary: D23 carried,', done, 'swap(s)')
