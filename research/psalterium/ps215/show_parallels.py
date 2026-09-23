"""Parallels for canticle 215 (Isaiah 45:15-25, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Writes consult/parallels/ps215.md (gitignored: it quotes third-party texts) from: the DO Latin; the Bolls Vulgate, Douay-Rheims and WLC Hebrew of Isa 45
(consult/ps215/bolls-*-23-45.json); the LXX (Rahlfs, consult/lxx-*.csv); Matos Soares 1932 (pdftotext text layer of
PDF pp. 1512-1513 = printed pp. 494-495, consult/ps215/ms1932-isa45-p494-495.txt); the Diurnal Monástico 1962
(consult/diurnal-1.md, Friday Lauds, festive canticle); and DO's Portuguese (no authority).
python3.13 research/psalterium/ps215/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(15, 27)


def bolls(code):
    data = json.loads((consult / 'ps215' / f'bolls-{code}-23-45.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Isa 45:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('Cântico de Isaias — Is. 45'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('DURANTE O ANO'))
    return '\n'.join(lines[start - 6:end])


out = ['# Canticle 215 (Isaiah 45:15–25, Vulgate) — parallels', '',
       "Built by `ps215/show_parallels.py` (parallels.py handles psalm numbers only). DO numbers the canticle's sixteen "
       "lines 45:15–45:30; they are its own line ids, not Isaiah's verses (the text is Isa 45:15–25 of the Vulgate; "
       'DRB and MS1932 number 45:15–26). The Latin is Jerome\'s Vulgate of Isaiah, from the Hebrew — so the Hebrew is '
       'here a closer witness of sense than in the Gallican psalms, and the LXX a more distant one.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm215.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Isa 45)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Isa 45)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, Isa 45:15–25)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, Isa 45)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Isa 45:14–26 (pdftotext -layout text layer, printed pp. 494–495; OCR artefacts and margin notes kept; parentheses are his glosses)', '```',
        (consult / 'ps215' / 'ms1932-isa45-p494-495.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Friday Lauds, festive canticle (consult/diurnal-1.md; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm215.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps215.md').write_text(text, encoding='utf-8')
print(text)
