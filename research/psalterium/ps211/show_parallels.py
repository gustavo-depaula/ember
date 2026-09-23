"""Parallels for canticle 211 (1 Chr 29:10-13), which parallels.py cannot build: it looks up psalm numbers only.
Prints the LXX (Rahlfs, consult/lxx-*.csv), Douay-Rheims and the Hebrew (WLC) from Bolls (consult/bolls-*-13-29.json)
and writes them to ps211/parallels.md."""
import json
import re
from pathlib import Path

here = Path(__file__).parent
consult = here.parent / 'consult'
verses = range(10, 14)


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'1Chr 29:{v}' for v in verses}
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts) if ref in refs]
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref.split(':')[1], ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


def bolls(name):
    data = json.loads((consult / f'bolls-{name}-13-29.json').read_text(encoding='utf-8'))
    clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
    return [(str(v['verse']), clean(v['text'])) for v in data if v['verse'] in verses]


out = ['# Canticle 211 (1 Chr 29:10–13) — parallels', '', 'Built by `ps211/show_parallels.py` (parallels.py handles psalm numbers only).', '']
out += ['## LXX (Rahlfs, 1 Chr 29)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Douay-Rheims (Bolls, 1 Paralipomenon 29)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## Hebrew (WLC, Bolls)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
text = '\n'.join(out)
(here / 'parallels.md').write_text(text, encoding='utf-8')
print(text)
