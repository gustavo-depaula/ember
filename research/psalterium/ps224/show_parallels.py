"""Parallels for canticle 224 (Exodus 15:1-19, Vulgate — Canticum Moysis, *Cantémus Dómino*), which parallels.py cannot
build: it looks up psalm numbers only. Writes consult/parallels/ps224.md from: the DO Latin; the Bolls Vulgate,
Douay-Rheims and WLC Hebrew of Exod 15 (consult/ps224/bolls-*-2-15.json); the LXX (Rahlfs, consult/lxx-*.csv);
Matos Soares 1932 (pdftotext -layout of consult/books/matos-soares-1932-vulgata-vol1.pdf, trimmed to printed
pp. 125-127, consult/ps224/ms1932-ex15-p125-127.txt); the Diurnal Monastico 1962 (consult/diurnal-1.md, Thursday Lauds,
ferial canticle; its Portuguese is from the Hebrew-family text, *tu*-form); and DO's Portuguese (no authority).
Everything third-party stays under consult/ (gitignored).
python3.13 research/psalterium/ps224/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
verses = range(1, 22)


def bolls(code):
    data = json.loads((consult / 'ps224' / f'bolls-{code}-2-15.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Exod 15:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Moisés — Ex. 15'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('*Ant.* Cantarei ao Senhor'))
    return '\n'.join(lines[start - 8:end + 1])


out = ['# Canticle 224 (Exodus 15:1–19, Vulgate — Canticum Moysis) — parallels', '',
       "Built by `ps224/show_parallels.py` (parallels.py handles psalm numbers only). DO numbers the canticle's 22 "
       "lines 15:1–15:22; they are its own line ids, not Exodus's verses (DO's heading says 15:1-22; the text is "
       'Exod 15:1–19 of the Vulgate). Map: DO 1–3 = V 1–2; DO 4 = V 3–4a; DO 5 = V 4b–5; DO 6 = V 6–7a; DO 7 = V 7b–8a; '
       'DO 8 = V 8b; DO 9 = V 9a; DO 10 = V 9b; DO 11 = V 10; DO 12 = V 11; DO 13 = V 12–13a; DO 14 = V 13b; '
       'DO 15 = V 14; DO 16 = V 15; DO 17 = V 16a; DO 18 = V 16b; DO 19 = V 17a; DO 20 = V 17b–18; DO 21 = V 19a; '
       'DO 22 = V 19b. Compare by wording, not number. The Latin is Jerome\'s Vulgate of Exodus, from the Hebrew — so '
       'the Hebrew is a closer witness of sense than in the Gallican psalms, and the LXX a more distant one.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm224.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Exod 15)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Exod 15)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, Exod 15:1–21)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (WLC, Bolls, Exod 15)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Exod 15:1–21 (pdftotext -layout text layer, printed pp. 125–127; OCR artefacts, running heads and footnotes kept; parentheses are his glosses; his verse numbers)', '```',
        (consult / 'ps224' / 'ms1932-ex15-p125-127.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Thursday Lauds, ferial canticle (consult/diurnal-1.md; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm224.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps224.md').write_text(text, encoding='utf-8')
print(text)
