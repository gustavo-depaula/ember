"""Parallels for canticle 232 (the Magnificat, Luke 1:46-55, Vulgate), which parallels.py cannot build: it looks up
psalm numbers only. Adapted from ps231/show_parallels.py. Writes consult/parallels/ps232.md from: the DO Latin; the
Bolls Vulgate, Tischendorf Greek and DRB of Luke 1 (consult/ps232/bolls-*-42-1.json, copied from consult/ps231/);
Challoner's notes from drbo.org (consult/ps232/drbo-luke1.htm); Matos Soares 1932 from the text layer of the 1932 PDF
(pdftotext of PDF pp. 1900-2572 saved as consult/ps232/ms1932-p1900-2572.txt; the Magnificat cut out as
consult/ps232/ms1932-luke1-46.txt); the Diurnal Monástico 1962, Sunday Vespers (OCR pages 199-200, retyped from the
OCR markdown as consult/ps232/dm1962-magnificat.txt); and DO's Portuguese (no authority; here the Diurnal's text).
python3.13 research/psalterium/ps232/show_parallels.py"""
import html
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
src = consult / 'ps232'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731


def bolls(code):
    data = json.loads((src / f'bolls-{code}-42-1.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if 46 <= v['verse'] <= 55]


def drbNotes():
    raw = (src / 'drbo-luke1.htm').read_text(encoding='latin-1', errors='replace')
    notes = re.findall(r'<p class=note>(.*?)</p>', raw, flags=re.S)
    notes = [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', n))).strip() for n in notes]
    return [n for n in notes if re.match(r'\[(4[6-9]|5[0-5])\]', n)]


out = ['# Canticle 232 (the Magnificat, Luke 1:46–55, Vulgate) — parallels', '',
       'Built by `ps232/show_parallels.py` (parallels.py handles psalm numbers only). The Latin is the Vulgate of Luke, '
       'not the Gallican psalter; the Greek is its source. DO keys the verses by Luke\'s own numbers, 1:46–1:55.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm232.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Greek (Bolls TISCH — Tischendorf, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('TISCH')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
notes = drbNotes()
if notes:
    out += ['### Challoner notes (drbo.org)', *[f'- {n}' for n in notes], '']
out += ['## Matos Soares 1932 — S. Lucas 1:45–55 (pdftotext text layer; parentheses are his glosses)', '```', (src / 'ms1932-luke1-46.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Sunday Vespers (OCR pp. 199–200 of the PDF, printed pp. 165–166). Dom Marcos Barbosa\'s Portuguese; a witness of diction and pointing, not of sense', '```', (src / 'dm1962-magnificat.txt').read_text(encoding='utf-8'), '```', '']
pt = doPortugues / 'Psalmorum/Psalm232.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces; here it is the Diurnal\'s text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps232.md').write_text(text, encoding='utf-8')
print(text)
