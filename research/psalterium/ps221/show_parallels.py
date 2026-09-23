"""Parallels for canticle 221 (Isaiah 12:1-6, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Adapted from ps213/show_parallels.py. Writes consult/parallels/ps221.md from: the DO Latin, the Bolls Vulgate, WLC
(Hebrew) and DRB of Isaiah 12, the Rahlfs LXX from consult/lxx-*.csv (consult/ps221/bolls-*-23-12.json; Bolls numbers Isaiah as book 23), Douay-Rheims with notes
from drbo.org (consult/ps221/drbo-isaias12.htm), Matos Soares 1932 from the text layer of the 1932 PDF (PDF page 1458,
consult/ps221/ms1932-isaiah12.txt), and DO's Portuguese (no authority).
DO splits Vulgate 12:2 in two (12:2 / 12:3), so from DO 12:3 its ids run one ahead of the Vulgate's.
python3.13 research/psalterium/ps221/show_parallels.py"""
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
    data = json.loads((consult / 'ps221' / f'bolls-{code}-23-12.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data]


def drb():
    raw = (consult / 'ps221' / 'drbo-isaias12.htm').read_text(encoding='latin-1', errors='replace')
    notes = re.findall(r'<p class=note>(.*?)</p>', raw, flags=re.S)
    body = re.sub(r'<p class=note>.*?</p>', ' ', raw, flags=re.S)
    parts = re.split(r'<a class=vn [^>]*>&nbsp;(\d+)&nbsp;</a>', body)
    out = []
    for n, chunk in zip(parts[1::2], parts[2::2]):
        text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', chunk.split('</td>')[0]))).strip()
        out.append((int(n), text))
    return out, [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', n))).strip() for n in notes]


def lxx():
    # as ps213/show_parallels.py: the accented Rahlfs text, not Bolls' lemmatised LXX
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts) if ref.startswith('Isa 12:')]
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref.split(':')[1], ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


drbVerses, drbNotes = drb()
out = ['# Canticle 221 (Isaiah 12:1–6, Vulgate) — parallels', '',
       'Built by `ps221/show_parallels.py` (parallels.py handles psalm numbers only). The Latin is Jerome\'s Isaiah '
       '(from the Hebrew), not the Gallican psalter; the LXX is a witness beside it, not its source. '
       'DO splits Vulgate 12:2 into DO 12:2 + 12:3, so DO 12:4–12:7 = Vulgate 12:3–12:6 (roughly: DO 12:4 joins Vulgate 12:3 and the first half of 12:4).', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm221.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Isaiah 12)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## LXX (Rahlfs, consult/lxx-*.csv, Isa 12)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (Bolls WLC, Isaiah 12)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Douay-Rheims (drbo.org, Isaias 12)', '```', *[f'{n} {t}' for n, t in drbVerses], '```', '']
if drbNotes:
    out += ['### Challoner notes', *[f'- {n}' for n in drbNotes], '']
out += ['## Matos Soares 1932 — Isaías 12 (pdftotext text layer of the 1932 PDF, p. 1458; OCR artefacts kept; parentheses are his glosses, a stray footnote block sits inside v. 3–4)', '```', (consult / 'ps221' / 'ms1932-isaiah12.txt').read_text(encoding='utf-8'), '```', '']
pt = doPortugues / 'Psalmorum/Psalm221.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps221.md').write_text(text, encoding='utf-8')
print(text)
