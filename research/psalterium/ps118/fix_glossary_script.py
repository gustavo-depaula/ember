"""One-off: correct the verse lists in glossary_part3.py against ps118/grep_latin_part3.py's output, BEFORE it is run.
python3.13 research/psalterium/ps118/fix_glossary_script.py"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parent / 'glossary_part3.py'
text = path.read_text(encoding='utf-8')
edits = [
    ('83:3 *defícit ánima mea in átria Dómini* is this one', '83:2 *concupíscit, et déficit ánima mea in átria Dómini* is this one (lists checked with `ps118/grep_latin_part3.py`)'),
    ('39:2 *Exspéctans exspectávi Dóminum*, 26:14 *Exspécta Dóminum* will test it — **wants a ruling before Ps 26**', '14 verses: 26:14 *Exspécta Dóminum*, 36:34, 38:8, 39:2 *Exspéctans exspectávi Dóminum*, 51:11, 54:9, 68:7, 68:21, 103:11, 103:27, 118:166 *Exspectábam salutáre tuum*, 141:8 — **wants a ruling before Ps 26**'),
    ('58:14 *in consummatióne* (twice) will need another word (*acabar*)', '58:13 *in consummatióne* (twice, the only other verse) will need another word (*acabar*)'),
    ('33:14 *Próhibe linguam tuam a malo* will test it (*retende* is safe at the imperative)', '33:14 *Próhibe linguam tuam a malo* and 39:10 are the other places (*retende* is safe at the imperative)'),
    ('21:16, 68:4 *raucæ factæ sunt fauces meæ*, 113:15 *in gútture* is another word', '21:16, 68:4 *raucæ factæ sunt fauces meæ*, 136:6a'),
    ('57:4, 94:10 *errant corde*, 106:4, 40', '57:4, 94:9, 106:4'),
    ('102:18 *ad faciéndum ea*, 110:8', '102:18, 149:7'),
    ('and 105:3 *fáciunt justítiam*, 9:17, 98:4, 102:6, 139:13, 145:7, 149:9 will meet this — wants a ruling', 'and 9:5, 75:9, 105:3 *fáciunt justítiam*, 145:7a will meet this (grep for adjacent words only) — wants a ruling'),
    ('71:4 *calumniatórem*, 104:14 |', '71:4, 118:134 *a calúmniis hóminum* next |'),
    ('32:10 *Dóminus díssipat consília géntium*, 52:6, 88:34 |', '9 verses (17:15, 32:10, 34:16, 52:6, 67:2, 67:31b, 140:8, 143:6) |'),
    ('about 25 verses (24:5, 31:3, 34:28, 37:7, 43:9 … — count not checked)', '26 verses (24:5, 31:3, 34:28, 36:26, 37:7, 43:9, 43:16, 43:22, 55:2–3 …)'),
    ('(118:90; 9:27, 32:11, 44:18, 48:12, 60:7, 76:9, 78:13, 84:6, 88:2 … — list not checked)', '(118:90; 32:11, 44:18a, 71:5, 78:13, 88:2, 88:5, 99:4b, 101:13, 101:25, 105:31, 134:13, 144:13a, 145:10)'),
]
for old, new in edits:
    if text.count(old) != 1:
        sys.exit(f'not found once: {old[:60]}')
    text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print(len(edits), 'lists corrected')
