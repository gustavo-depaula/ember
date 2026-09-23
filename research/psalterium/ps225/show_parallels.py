"""Parallels for canticle 225 (Habakkuk 3:2-19, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Writes consult/parallels/ps225.md (gitignored: it quotes third-party texts) from: the DO Latin; the Bolls Vulgate, Douay-Rheims
and WLC Hebrew of Hab 3 (consult/ps225/bolls-*-35-3.json); the LXX (Rahlfs, consult/lxx-*.csv); Matos Soares 1932
(pdftotext -layout text layer of PDF pp. 1873-1874 = printed pp. 856-857, consult/ps225/ms1932-hab3-p856-857.txt);
the Diurnal Monastico 1962 (consult/diurnal-1.md, Friday Lauds, ferial canticle); and DO's Portuguese (no authority).
python3.13 research/psalterium/ps225/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(1, 20)


def bolls(code):
    data = json.loads((consult / 'ps225' / f'bolls-{code}-35-3.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Hab 3:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Habacuc'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('## CÂNTICO FESTIVO'))
    return '\n'.join(lines[start - 4:end])


out = ['# Canticle 225 (Habakkuk 3:2–19, Vulgate) — parallels', '',
       "Built by `ps225/show_parallels.py` (parallels.py handles psalm numbers only). DO's ids are Habakkuk's verses split "
       'into a/b/c lines (3:2a–3:19b), and some DO lines cross verse boundaries (the inline `(5a)`, `(6a)`, `(10a)` markers): '
       'DO 3:4b ends with V 5a; DO 3:5b ends with V 6a; DO 3:9b ends with V 10a. The Latin is Jerome\'s Vulgate of Habakkuk, '
       'from the Hebrew — not the Gallican psalter. The LXX here differs widely (it is a different text of the prayer) and is '
       'only a distant witness; the Hebrew explains Jerome where his Latin is obscure, but never corrects it.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm225.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Hab 3)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Hab 3)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, Hab 3)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, Hab 3)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Hab 3 (pdftotext -layout text layer, printed pp. 856–857; OCR artefacts and margin notes kept; parentheses are his glosses)', '```',
        (consult / 'ps225' / 'ms1932-hab3-p856-857.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Friday Lauds, ferial canticle (consult/diurnal-1.md; Portuguese from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm225.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps225.md').write_text(text, encoding='utf-8')
print(text)
