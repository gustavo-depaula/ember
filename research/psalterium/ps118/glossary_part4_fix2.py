"""glossary_part4.json: two verse lists corrected against ps118/grep_stems.py (petítio is 19:7a, not 19:6; the full
list of prævenire).   python3.13 research/psalterium/ps118/glossary_part4_fix2.py"""

from pathlib import Path

path = Path(__file__).resolve().parent / 'glossary_part4.json'
text = path.read_text(encoding='utf-8')
swaps = [
    ('*petítio* (19:6, 36:4, 105:15)', '*petítio* (19:7a, 36:4, 105:15)'),
    ('87:14 *orátio mea prævéniet te* (list by grep)', '87:14 *orátio mea prævéniet te*; also 67:26, 67:31b (nine verses with the stem, by grep)'),
]
for old, new in swaps:
    assert text.count(old) == 1, old
    text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('ok')
