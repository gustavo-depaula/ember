"""Parallels for canticle 216 (Sirach / Ecclesiasticus 36:1-16, Vulgate), which parallels.py cannot build: it looks up
psalm numbers only. Writes consult/parallels/ps216.md from: the DO Latin; the Bolls Vulgate of Sirach 36 (consult/ps216/bolls-VULG-71-36.json);
Douay-Rheims from drbo.org (consult/ps216/drbo-sirach36.htm; Bolls DRB has no deuterocanonicals); the LXX (Rahlfs, consult/lxx-*.csv);
Matos Soares 1932 (pdftotext of pp. 386-387 of the 1932 PDF, consult/ps216/ms1932-sir36-p386-387.txt); the Diurnal Monastico 1962,
which prints this canticle at Saturday Lauds (consult/diurnal-1.md); and DO's Portuguese (no authority).
No Hebrew in the tools (Bolls WLC has no Sirach; the Cairo Geniza Hebrew of this passage is not in consult/).
python3.13 research/psalterium/ps216/show_parallels.py"""
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
verses = range(1, 20)


def bolls(code):
    data = json.loads((consult / 'ps216' / f'bolls-{code}-71-36.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] in verses]


def drb():
    raw = (consult / 'ps216' / 'drbo-sirach36.htm').read_text(encoding='latin-1', errors='replace')
    raw = re.sub(r'<p class=note>.*?</p>', ' ', raw, flags=re.S)
    parts = re.split(r'<a class=vn [^>]*>&nbsp;(\d+)&nbsp;</a>', raw)
    out = []
    for n, chunk in zip(parts[1::2], parts[2::2]):
        text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', chunk.split('</td>')[0]))).strip()
        out.append((int(n), text))
    return [(n, t) for n, t in out if n in verses]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Sir 36:{v}' for v in verses}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico do Eclesiástico'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('E sejam herança tua'))
    return '\n'.join(lines[start - 6:end + 1])


out = ['# Canticle 216 (Sirach / Ecclesiasticus 36:1–16, Vulgate) — parallels', '',
       'Built by `ps216/show_parallels.py` (parallels.py handles psalm numbers only). DO\'s ids are the canticle\'s own '
       'line numbers, not the Clementine verses: DO 36:1 = V 1; DO 36:2–3 = V 2; DO 36:4–6 = V 3–5; DO 36:7 = V 6–7; '
       'DO 36:8 = V 8–9; DO 36:9–11 = V 10–12; DO 36:12–13 = V 13; DO 36:14–16 = V 14–16. Compare by wording, not number. '
       'The Latin is the Vulgate of Sirach (the Old Latin, which Jerome did not revise), not the Gallican psalter; '
       'the LXX is its source text; no Hebrew is at hand.', '']
out += ['## Latin (DO — the working text)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(doLatin / 'Psalmorum/Psalm216.txt')], '```', '']
out += ['## Vulgate (Bolls VULG, Sirach 36)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (drbo.org, Ecclesiasticus 36)', '```', *[f'{n} {t}' for n, t in drb()], '```', '']
out += ['## LXX (Rahlfs, Sir 36)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Matos Soares 1932 — Eclesiástico 36 (pdftotext of pp. 386–387, consult/ps216/ms1932-sir36-p386-387.txt; OCR artefacts kept; parentheses are his glosses; his numbering: 19 verses)', '```',
        (consult / 'ps216' / 'ms1932-sir36-p386-387.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Saturday Lauds, *Eclo. 36, 1-13* (consult/diurnal-1.md; here its Portuguese is close to Matos Soares, i.e. Vulgate-family; *tu* address)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm216.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps216.md').write_text(text, encoding='utf-8')
print(text)
