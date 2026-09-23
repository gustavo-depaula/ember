"""Parallels for canticle 213 (Judith 16:15-22, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Writes consult/parallels/ps213.md from: the DO Latin, the Bolls Vulgate of Judith 16 (consult/ps213/bolls-VULG-69-16.json), the LXX
of Judith 16 (Rahlfs, consult/lxx-*.csv — a different recension: the Vulgate Judith is Jerome's free version from an
Aramaic text, so the Greek numbers and wording differ widely), Douay-Rheims from drbo.org (consult/ps213/drbo-judith16.htm),
and DO's Portuguese (no authority).
python3.13 research/psalterium/ps213/show_parallels.py"""
import html
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731


def bolls(code):
    data = json.loads((consult / 'ps213' / f'bolls-{code}-69-16.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data]


def drb():
    raw = (consult / 'ps213' / 'drbo-judith16.htm').read_text(encoding='latin-1', errors='replace')
    raw = re.sub(r'<p class=note>.*?</p>', ' ', raw, flags=re.S)
    parts = re.split(r'<a class=vn [^>]*>&nbsp;(\d+)&nbsp;</a>', raw)
    out = []
    for n, chunk in zip(parts[1::2], parts[2::2]):
        text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', chunk.split('</td>')[0]))).strip()
        out.append((int(n), text))
    return out


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts) if ref.startswith('Jdt 16:')]
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref.split(':')[1], ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


out = ['# Canticle 213 (Judith 16:15–22, Vulgate) — parallels', '',
       'Built by `ps213/show_parallels.py` (parallels.py handles psalm numbers only). No Hebrew exists for Judith; '
       'the Vulgate Judith is Jerome\'s own version from an Aramaic text, so the LXX is a different recension '
       '(its 16:13–17 is roughly the Vulgate\'s 16:15–21) and is only a distant witness of sense.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm213.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Judith 16)', '```', *[f'{n} {t}' for n, t in bolls('VULG') if 14 <= n <= 21], '```', '']
out += ['## Douay-Rheims (drbo.org, Judith 16)', '```', *[f'{n} {t}' for n, t in drb() if 14 <= n <= 21], '```', '']
out += ['## LXX (Rahlfs, Jdt 16:12–17 — different recension)', '```', *[f'{n} {t}' for n, t in lxx() if 12 <= int(n) <= 17], '```', '']
out += ['## Matos Soares 1932 — Judith 16 (pdftotext text layer of the 1932 PDF, pp. 880-1014 span, saved as consult/ps213/ms1932-judith16.txt; OCR artefacts kept; parentheses are his glosses)', '```', (consult / 'ps213' / 'ms1932-judith16.txt').read_text(encoding='utf-8'), '```', '']
pt = doPortugues / 'Psalmorum/Psalm213.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps213.md').write_text(text, encoding='utf-8')
print(text)
