"""Parallels for canticle 231 (the Benedictus, Luke 1:68-79, Vulgate), which parallels.py cannot build: it looks up
psalm numbers only. Adapted from ps221/show_parallels.py. Writes consult/parallels/ps231.md from: the DO Latin; the
Bolls Vulgate, Tischendorf Greek and DRB of Luke 1 (consult/ps231/bolls-*-42-1.json; Bolls numbers Luke as book 42);
Challoner's notes from drbo.org (consult/ps231/drbo-luke1.htm); Matos Soares 1932 from the text layer of the 1932 PDF
(consult/books/matos-soares-1932-vulgata-vol1.pdf, found by grep in a pdftotext of PDF pp. 1900-2572, saved as
consult/ps231/ms1932-luke1.txt); the Diurnal Monástico 1962, Sunday Lauds (OCR pages 56-57, consult/ps231/dm1962-benedictus.txt);
and DO's Portuguese (no authority; for this canticle it is the Diurnal's text in the old spelling).
python3.13 research/psalterium/ps231/show_parallels.py"""
import html
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
src = consult / 'ps231'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731


def bolls(code):
    data = json.loads((src / f'bolls-{code}-42-1.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if 67 <= v['verse'] <= 79]


def drbNotes():
    raw = (src / 'drbo-luke1.htm').read_text(encoding='latin-1', errors='replace')
    notes = re.findall(r'<p class=note>(.*?)</p>', raw, flags=re.S)
    notes = [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', n))).strip() for n in notes]
    return [n for n in notes if re.match(r'\[(6[89]|7\d)\]', n)]


out = ['# Canticle 231 (the Benedictus, Luke 1:68–79, Vulgate) — parallels', '',
       'Built by `ps231/show_parallels.py` (parallels.py handles psalm numbers only). The Latin is the Vulgate of Luke '
       '(the Old Latin revised by Jerome against the Greek), not the Gallican psalter; the Greek is its source. DO keys the '
       'verses by Luke\'s own numbers, 1:68–1:79, one prayed verse per Gospel verse.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm231.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Greek (Bolls TISCH — Tischendorf, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('TISCH')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Luke 1)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
notes = drbNotes()
if notes:
    out += ['### Challoner notes (drbo.org)', *[f'- {n}' for n in notes], '']
out += ['## Matos Soares 1932 — S. Lucas 1:67–79 (pdftotext text layer; OCR artefacts kept; parentheses are his glosses; his footnotes 68–78 sit inside v. 78–79)', '```', (src / 'ms1932-luke1.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Sunday Lauds (OCR pp. 56–57; hyphens of line breaks kept; a stray "Glória Patri." from the Latin column sits after 1:73). Dom Marcos Barbosa\'s Portuguese; a witness of diction, not of sense', '```', (src / 'dm1962-benedictus.txt').read_text(encoding='utf-8'), '```', '']
pt = doPortugues / 'Psalmorum/Psalm231.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces; here it is the Diurnal\'s text, old spelling)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps231.md').write_text(text, encoding='utf-8')
print(text)
