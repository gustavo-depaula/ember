"""Parallels for canticle 226 (Deuteronomy 32:1-43, Vulgate), which parallels.py cannot build: it looks up psalm numbers only.
Adapted from ps221/show_parallels.py. Writes consult/parallels/ps226.md (gitignored: it quotes third-party texts) from:
the DO Latin; the Bolls Vulgate, Douay-Rheims and WLC Hebrew of Deut 32 (consult/ps226/bolls-*-5-32.json); the Rahlfs LXX
(consult/lxx-*.csv); Matos Soares 1932 (pdftotext -layout of PDF pp. 378-382 = printed pp. 361-365 of
consult/books/matos-soares-1932-vulgata-vol1.pdf, consult/ps226/ms1932-deut32-p361-365.txt); the Diurnal Monastico 1962
(consult/diurnal-1.md, Saturday Lauds, ferial canticle — it prints only Deut 32:1-18); and DO's Portuguese (no authority).
DO numbers the canticle's 65 lines 32:1-32:65; they are its own line ids, not Deuteronomy's verses (the text is Deut 32:1-43).
python3.13 research/psalterium/ps226/show_parallels.py"""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import doLatin, doPortugues, readVerses  # noqa: E402

consult = here.parent / 'consult'
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731

# DO line id -> Vulgate verse(s) of Deut 32 (worked out by reading both texts side by side)
vulgateOf = {
    1: '1', 2: '2a', 3: '2b–3a', 4: '3b–4a', 5: '4b–5a', 6: '5b–6a', 7: '6b', 8: '7a', 9: '7b', 10: '8a', 11: '8b',
    12: '9', 13: '10a', 14: '10b', 15: '11a', 16: '11b', 17: '12', 18: '13a', 19: '13b', 20: '14a', 21: '14b',
    22: '15a', 23: '15b', 24: '16', 25: '17a', 26: '17b', 27: '18', 28: '19', 29: '20a', 30: '20b', 31: '21a',
    32: '21b', 33: '22a', 34: '22b', 35: '23', 36: '24a', 37: '24b', 38: '25', 39: '26', 40: '27a', 41: '27b',
    42: '28–29', 43: '30a', 44: '30b', 45: '31', 46: '32a', 47: '32b', 48: '33', 49: '34', 50: '35a', 51: '35b',
    52: '36a', 53: '36b', 54: '37', 55: '38a', 56: '38b', 57: '39a', 58: '39b', 59: '40', 60: '41a', 61: '41b',
    62: '42a', 63: '42b', 64: '43a', 65: '43b',
}


def bolls(code):
    data = json.loads((consult / 'ps226' / f'bolls-{code}-5-32.json').read_text(encoding='utf-8'))
    return [(v['verse'], clean(v['text'])) for v in data if v['verse'] <= 43]


def lxx():
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    refs = {f'Deut 32:{v}' for v in range(1, 44)}
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
    start = next(i for i, l in enumerate(lines) if l.startswith('# Cântico de Moisés — Deut. 32'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('# CÂNTICO FESTIVO'))
    return '\n'.join(lines[start - 8:end])


out = ['# Canticle 226 (Deuteronomy 32:1–43, Vulgate) — parallels', '',
       'Built by `ps226/show_parallels.py` (parallels.py handles psalm numbers only). The Latin is Jerome\'s Deuteronomy '
       '(from the Hebrew), not the Gallican psalter; the LXX is a witness beside it, not its source. DO\'s heading says '
       '"Deut 32:1-65", but its 65 ids are line numbers of the canticle; the text is Deut 32:1–43. Map below.', '']
latin = readVerses(doLatin / 'Psalmorum/Psalm226.txt')
out += ['## Latin (DO — the working text), with the Vulgate verse each line holds', '```',
        *[f"{v['id']} [Vg {vulgateOf[int(v['id'].split(':')[1])]}] {v['text']}" for v in latin], '```', '']
out += ['## Vulgate (Bolls VULG, Deut 32:1–43)', '```', *[f'{n} {t}' for n, t in bolls('VULG')], '```', '']
out += ['## Douay-Rheims (Bolls DRB, Deut 32:1–43)', '```', *[f'{n} {t}' for n, t in bolls('DRB')], '```', '']
out += ['## LXX (Rahlfs, consult/lxx-*.csv, Deut 32:1–43)', '```', *[f'{n} {t}' for n, t in lxx()], '```', '']
out += ['## Hebrew (Bolls WLC, Deut 32:1–43)', '```', *[f'{n} {t}' for n, t in bolls('WLC')], '```', '']
out += ['## Matos Soares 1932 — Deut 31:28–32:52 (pdftotext -layout text layer, printed pp. 361–365; OCR artefacts, margin '
        'summaries, running heads and footnotes kept; parentheses are his glosses)', '```',
        (consult / 'ps226' / 'ms1932-deut32-p361-365.txt').read_text(encoding='utf-8'), '```', '']
out += ['## Diurnal Monástico 1962 — Saturday Lauds, ferial canticle (consult/diurnal-1.md; it prints only Deut 32:1–18 = DO '
        '32:1–32:27; from the Hebrew-family text, *tu*-form; listen for diction only)', '```', diurnal(), '```', '']
pt = doPortugues / 'Psalmorum/Psalm226.txt'
if pt.exists():
    out += ['## DO Portugues — NOT an authority (the text this project replaces)', '```', *[f"{v['id']} {v['text']}" for v in readVerses(pt)], '```', '']
text = '\n'.join(out)
(consult / 'parallels' / 'ps226.md').write_text(text, encoding='utf-8')
print(f'wrote consult/parallels/ps226.md, {len(text)} chars, {len(latin)} Latin lines')
