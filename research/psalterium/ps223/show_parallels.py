"""Parallels for canticle 223 (1 Samuel 2:1-10, Vulgate — the Canticle of Anna), which parallels.py cannot build in full:
it finds the DO Latin and DO Portuguese by number, but no Bible parallels for a canticle. Writes consult/parallels/ps223.md
from: the DO Latin; the Bolls Vulgate, Douay-Rheims and WLC Hebrew of 1 Sam 2 (consult/ps223/bolls-*-9-2.json); the LXX
(Rahlfs, consult/lxx-*.csv, "1Sam/K 2:1-10"); Matos Soares 1932 ("I Reis", pdftotext -layout of PDF pp. 500-501 of
consult/books/matos-soares-1932-vulgata-vol1.pdf = printed pp. 107-108, consult/ps223/ms1932-1sam2-p107-108.txt);
the Diurnal Monastico 1962 (consult/diurnal-1.md, Wednesday Lauds, ferial canticle; its Portuguese is from the
Hebrew-family text, *tu*-form); and DO's Portuguese (no authority). Everything third-party stays under consult/ (gitignored).
python3.13 research/psalterium/ps223/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(1, 11)


def bolls(code):
    data = json.loads((consult / 'ps223' / f'bolls-{code}-9-2.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'1Sam/K 2:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Ana'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('# CÂNTICO FESTIVO'))
    return '\n'.join(lines[start - 2:end])


out = ['# Canticle 223 (1 Samuel 2:1–10, Vulgate — Canticum Annæ) — parallels', '',
       "Built by `ps223/show_parallels.py` (parallels.py handles psalm numbers only). DO's heading says \"3 Reg 2:1-16\"; "
       'the text is 1 Samuel (= 1 Kings in the Vulgate\'s numbering) 2:1–10, and DO\'s ids 2:1–2:16 are its own line numbers, '
       'not the Vulgate\'s verses. Map: DO 1 = V 1a; DO 2 = V 1b; DO 3 = V 2; DO 4 = V 3a; DO 5 = V 3b; DO 6 = V 4; '
       'DO 7 = V 5a; DO 8 = V 5b; DO 9 = V 6; DO 10 = V 7; DO 11–13 = V 8; DO 14 = V 9; DO 15 = V 10a; DO 16 = V 10b. '
       "The Latin is Jerome's Vulgate of Samuel, from the Hebrew, so the Hebrew is a close witness of sense and the LXX "
       '(which differs a good deal here, e.g. its long insertion in v. 10 from Jer 9:23) a distant one.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm223.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, 1 Sam 2)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, 1 Sam 2 = 1 Kings 2)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, 1 Kgdms 2:1–10)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, 1 Sam 2)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — I Reis 1:23–2:17 (pdftotext -layout text layer, printed pp. 107–108; OCR artefacts, running heads and footnotes kept; parentheses are his glosses)', '```',
        (consult / 'ps223' / 'ms1932-1sam2-p107-108.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Wednesday Lauds, ferial canticle (consult/diurnal-1.md; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm223.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps223.md').write_text(text, encoding='utf-8')
print(text)
