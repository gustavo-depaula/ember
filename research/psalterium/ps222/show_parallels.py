"""Parallels for canticle 222 (Isaiah 38:10-20, Vulgate — the Canticle of Hezekiah), which parallels.py cannot build: it
looks up psalm numbers only. Writes consult/parallels/ps222.md from: the DO Latin; the Bolls Vulgate, Douay-Rheims and WLC
Hebrew of Isa 38 (consult/ps222/bolls-*-23-38.json); the LXX (Rahlfs, consult/lxx-*.csv); Matos Soares 1932 (pdftotext
-layout of PDF pp. 1485-1505 of consult/books/matos-soares-1932-vulgata-vol1.pdf, trimmed to printed pp. 481-482,
consult/ps222/ms1932-isa38-p481-482.txt); the Diurnal Monastico 1962 (consult/diurnal-1.md, Tuesday Lauds, ferial
canticle; its Portuguese is from the Hebrew-family text, *tu*-form); and DO's Portuguese (no authority).
Everything third-party stays under consult/ (gitignored).
python3.13 research/psalterium/ps222/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(9, 21)


def bolls(code):
    data = json.loads((consult / 'ps222' / f'bolls-{code}-23-38.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Isa 38:{v}' for v in verses}
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts) if ref in refs]
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref.split(':')[1], ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


def diurnal():
    lines = (consult / 'diurnal-1.md').read_text(encoding='utf-8').splitlines()
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Ezequias'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('# CÂNTICO FESTIVO'))
    return '\n'.join(lines[start - 2:end])


out = ['# Canticle 222 (Isaiah 38:10–20, Vulgate — Canticum Ezechiæ) — parallels', '',
       "Built by `ps222/show_parallels.py` (parallels.py handles psalm numbers only). DO numbers the canticle's fifteen "
       'lines 38:10–38:24; they are its own line ids, not Isaiah\'s verses (the text is Isa 38:10–20 of the Vulgate). '
       'Rough map: DO 10 = V 10a; DO 11 = V 10b–11a; DO 12 = V 11b; DO 13–14 = V 12; DO 15–16 = V 13–14a; DO 17–18a = V 14b; '
       'DO 18b = V 15a; DO 19 = V 15b; DO 20 = V 16–17a; DO 21 = V 17b; DO 22 = V 18; DO 23 = V 19; DO 24 = V 20. '
       'The Latin is Jerome\'s Vulgate of Isaiah, from the Hebrew — so the Hebrew is a closer witness of sense than in '
       'the Gallican psalms, and the LXX a more distant one. The Hebrew of this song is notoriously obscure; the Latin is '
       'translated as it stands.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm222.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Isa 38)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Isa 38)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, Isa 38:9–20)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, Isa 38)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Isa 38:1–22 (pdftotext -layout text layer, printed pp. 481–482; OCR artefacts, running heads and footnotes kept; parentheses are his glosses)', '```',
        (consult / 'ps222' / 'ms1932-isa38-p481-482.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Tuesday Lauds, ferial canticle (consult/diurnal-1.md; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm222.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps222.md').write_text(text, encoding='utf-8')
print(text)
