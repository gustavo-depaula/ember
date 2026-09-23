"""Parallels for canticle 214 (Jeremiah 31:10-14, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Writes consult/parallels/ps214.md (gitignored: it quotes third-party texts) from: the DO Latin; the Bolls Vulgate, Douay-Rheims and WLC Hebrew of Jer 31
(consult/ps214/bolls-*-24-31.json); the LXX (Rahlfs, consult/lxx-*.csv), where Hebrew Jer 31 is Greek Jer 38;
Matos Soares 1932 (pdftotext of p. 584 of the 1932 PDF, consult/ps214/ms1932-jer31-p584.txt); the Diurnal Monástico
1962 (consult/diurnal-1.md, Thursday Lauds); and DO's Portuguese (no authority).
python3.13 research/psalterium/ps214/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(10, 15)


def bolls(code):
    data = json.loads((consult / 'ps214' / f'bolls-{code}-24-31.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Jer 38:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Jeremias'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('LAUDES DE QUINTA-FEIRA'))
    return '\n'.join(lines[start - 10:end])


def ms1932():
    text = (consult / 'ps214' / 'ms1932-jer31-p584.txt').read_text(encoding='utf-8')
    start, end = text.index('10 Ouvi'), text.index('15       Isto diz')
    return re.sub(r'\s+', ' ', text[start:end].replace('­\n', '').replace('-\n', ''))


out = ['# Canticle 214 (Jeremiah 31:10–14, Vulgate) — parallels', '',
       'Built by `ps214/show_parallels.py` (parallels.py handles psalm numbers only). DO numbers the canticle\'s nine '
       'lines 31:10–31:18; they are its own line ids, not Jeremiah\'s verses (the text is Jer 31:10–14). '
       'The LXX Jeremiah is a different, shorter recension (Hebrew 31 = Greek 38) and is only a witness of sense.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm214.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Jer 31)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Jer 31)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, Jer 38:10–14)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, Jer 31)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Jer 31:10–14 (pdftotext text layer of PDF p. 1602 = printed p. 584; OCR artefacts kept; parentheses are his glosses)', '```', ms1932(), '```', '']
out += ['## Diurnal Monástico 1962 — Thursday Lauds (consult/diurnal-1.md; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm214.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps214.md').write_text(text, encoding='utf-8')
print(text)
