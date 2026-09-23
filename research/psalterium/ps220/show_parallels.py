"""Parallels for canticle 220 (Daniel 3:52-57, Canticum Trium Puerorum), which parallels.py cannot build: for a canticle it
gives only the Latin and DO's Portuguese. Writes consult/parallels/ps220.md from: the DO Latin; the Clementine Vulgate of
Daniel 3 (Bolls VULG, consult/bolls-VULG-27-3.json, fetched by ps210); the Greek of Rahlfs, both Theodotion (DanTh, the
text the Vulgate follows here) and the Old Greek (Dan), from consult/lxx-*.csv; Douay-Rheims from drbo.org
(consult/ps220/drbo-daniel3.htm); Matos Soares 1932 (pdftotext -layout of PDF pp. 1784-1785 = printed pp. 766-767,
consult/ps220/ms1932-dan3-p766-767.txt); and DO's Portuguese (no authority).
Note: DO splits the Clementine's 3:52 in two, so DO's ids run one ahead: DO 3:53 = Vulg 52b, DO 3:54-3:57 = Vulg 53-56,
DO 3:58 = Vulg 57 (the first verse of the Benedicite).
python3.13 research/psalterium/ps220/show_parallels.py"""
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
    data = json.loads((consult / f'bolls-{code}-27-3.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data]


def drb():
    raw = (consult / 'ps220' / 'drbo-daniel3.htm').read_text(encoding='latin-1', errors='replace')
    raw = re.sub(r'<p class=note>.*?</p>', ' ', raw, flags=re.S)
    parts = re.split(r'<a class=vn [^>]*>&nbsp;(\d+)&nbsp;</a>', raw)
    out = []
    for n, chunk in zip(parts[1::2], parts[2::2]):
        text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', chunk.split('</td>')[0]))).strip()
        out.append((int(n), text))
    return out


def lxx(book):
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts)
              if ref.startswith(f'{book} 3:') and 51 <= int(ref.split(':')[1]) <= 58]
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref, ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


out = ['# Canticle 220 (Daniel 3:52–57, Canticum Trium Puerorum) — parallels', '',
       'Built by `ps220/show_parallels.py` (parallels.py gives only the Latin and DO\'s Portuguese for a canticle). '
       'The Vulgate of Daniel 3:24–90 is Jerome\'s version of the Greek of Theodotion (the deuterocanonical Song; '
       'there is no Hebrew/Aramaic). **DO splits the Clementine 3:52 in two, so DO\'s ids run one ahead of the Clementine, '
       'the Greek, DRB and MS1932**: DO 3:52 = 52a, 3:53 = 52b, 3:54–3:57 = 53–56, 3:58 = 57.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm220.txt')], '```', '']
out += ['## Vulgate (Clementine, Bolls VULG, Daniel 3)', '```', *[f'{n} {t}' for n, t in bolls('VULG') if 51 <= n <= 57], '```', '']
out += ['## Douay-Rheims (drbo.org, Daniel 3)', '```', *[f'{n} {t}' for n, t in drb() if 51 <= n <= 57], '```', '']
out += ['## Greek — Theodotion (Rahlfs DanTh; the text the Vulgate follows)', '```', *[f'{r} {t}' for r, t in lxx('DanTh')], '```', '']
out += ['## Greek — Old Greek (Rahlfs Dan; for comparison only)', '```', *[f'{r} {t}' for r, t in lxx('Dan')], '```', '']
out += ['## Matos Soares 1932 — Daniel 3:38–73 (pdftotext -layout text layer, printed pp. 766–767; OCR artefacts and margin notes kept; parentheses are his glosses)', '```',
        (consult / 'ps220' / 'ms1932-dan3-p766-767.txt').read_text(encoding='utf-8'), '```', '']
pt = doPortugues / 'Psalmorum/Psalm220.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps220.md').write_text(text, encoding='utf-8')
print(text)
