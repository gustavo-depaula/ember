"""Psalm-level parallels: what a translator reads beside the Latin. One markdown file per psalm.

Run from the repo root:  python3.13 research/psalterium/parallels.py 90
Writes research/psalterium/consult/parallels/ps090.md (gitignored — Matos Soares is in copyright).

Given at psalm level on purpose (ps004/retrospective.md): the Vulgate's verse division is not the Hebrew's, and
aligning verse by verse by hand was the most tedious step of the pilot. Sources:
  Latin    content/do (the working text) and DO's Portugues sibling — not an authority: the text this project is meant
           to replace (partly recent AI-assisted renderings, many mistakes, verse ids drift); contrast only
  LXX      Rahlfs 1935, consult/lxx-*.csv — LXX psalm numbers are the Vulgate's
  Hebrew   WLC via bolls.life — Hebrew psalm numbers, mapped below
  DRB      Douay-Rheims via bolls.life — from the Vulgate, the closest English kin; Bolls files it under a chapter
           count of its own (drbChapters), verse numbers inside are the Vulgate's
  MS 1932  Matos Soares, from the Vulgate — raw PDF text layer (consult/ms1932-salmos.txt), OCR artefacts and all
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

from diurnal import diurnal
from latin import doLatin, doPortugues, readVerses

here = Path(__file__).resolve().parent
consult = here / 'consult'


def hebrewPsalms(n):
    """Vulgate/LXX psalm number → Hebrew psalm number(s)."""
    if n <= 8 or n >= 148:
        return [n]
    if n == 9:
        return [9, 10]
    if n == 113:
        return [114, 115]
    if n in (114, 115):
        return [116]
    if n in (146, 147):
        return [147]
    return [n + 1]


def drbChapters(n):
    """Vulgate psalm number → the chapter(s) Bolls files the Douay-Rheims under. Bolls has two stray one-verse chapters
    — 10 (a copy of 9:22) and 119 ("Aleph") — files the second half of Ps 9 (9:22–39) as chapter 11, and has no
    chapter for Vulgate Ps 10 at all (it is not in Bolls' DRB; `ps010/drb.txt` holds it from drbo.org). From Ps 11 on
    its count is one ahead, two ahead after the stray 119, and runs to 152. Checked by first and last verse: chapters
    9, 10, 11, 12 (= Ps 11), 13 (= Ps 12), 91, 114 (= Ps 113 whole), 115, 117, 118 (= Ps 117), 119, 133, 135, 152."""
    if n <= 8:
        return [n]
    if n == 9:
        return [9, 11]
    if n == 10:
        return []
    return [n + 1] if n <= 117 else [n + 2]


def drbByHand(n):
    """The Douay-Rheims of a psalm Bolls lacks (Ps 10), from `ps<NNN>/drb.txt`: numbered lines, Vulgate numbering."""
    path = here / f'ps{n:03}' / 'drb.txt'
    if not path.exists():
        return {}
    lines = (re.match(r'(\d+) (.+)', line) for line in path.read_text(encoding='utf-8').splitlines())
    return {int(m[1]): m[2] for m in lines if m}


def bolls(translation, psalm):
    cache = consult / f'bolls-{translation}-19-{psalm}.json'
    if not cache.exists():
        request = urllib.request.Request(f'https://bolls.life/get-text/{translation}/19/{psalm}/', headers={'User-Agent': 'Mozilla/5.0'})
        cache.write_bytes(urllib.request.urlopen(request, timeout=40).read())
    data = json.loads(cache.read_text(encoding='utf-8'))
    clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<S>.*?</S>|<sup>.*?</sup>|<[^>]+>', ' ', t)).strip()  # noqa: E731
    return [(v['verse'], clean(v['text'])) for v in data]


def lxx(psalm):
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    wanted = [(i, start, ref) for i, (start, ref) in enumerate(starts) if ref.startswith(f'Ps {psalm}:')]
    if not wanted:
        return []
    first, last = wanted[0][1], starts[wanted[-1][0] + 1][0]
    words = {}
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        if len(fields) == 3 and first <= int(fields[0]) < last:
            words[int(fields[0])] = fields[2]
    return [(ref.split(':')[1], ' '.join(words.get(n, '∅') for n in range(start, starts[i + 1][0]))) for i, start, ref in wanted]


def roman(text):
    values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
    total = 0
    for a, b in zip(text, text[1:] + ' '):
        total += -values[a] if b != ' ' and values[a] < values[b] else values[a]
    return total


def matosSoares(psalm):
    """The psalm's chunk of the raw text layer. Headings the OCR mangled are not found; then the span between the
    nearest detected headings is given, and says so."""
    path = consult / 'ms1932-salmos.txt'
    if not path.exists():
        return 'consult/ms1932-salmos.txt missing — pdftotext -f 1015 -l 1300 -layout ~/Downloads/Vulgata-Padre-Matos-Soares-1.pdf'
    lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
    heads = sorted({roman(m.group(1)): i for i, line in enumerate(lines) if (m := re.match(r'^\s*SALM ?O\s+([IVXLC]+)\s*$', line))}.items())
    before = [(n, i) for n, i in heads if n <= psalm]
    after = [(n, i) for n, i in heads if n > psalm]
    start = before[-1][1] if before else 0
    end = after[0][1] if after else len(lines)
    note = '' if before and before[-1][0] == psalm else f'(heading for Ps {psalm} not detected by OCR — this span runs from Ps {before[-1][0] if before else "?"} to Ps {after[0][0] if after else "end"}; find the psalm inside it)\n'
    return note + '\n'.join(line.rstrip() for line in lines[start:end] if line.strip())


def main():
    psalm = int(sys.argv[1])
    out = [f'# Ps {psalm} — parallels\n', 'Generated by `parallels.py`. For explaining the Latin, never for correcting it.\n']
    latinFile = doLatin / f'Psalmorum/Psalm{psalm}.txt'
    out += ['## Latin (DO — the working text)\n', '```', *[f"{v['id']} {v['text']}" for v in readVerses(latinFile)], '```\n']
    if psalm <= 150:
        out += ['## LXX (Rahlfs) — same psalm number; verse numbers mostly agree\n', '```', *[f'{n} {text}' for n, text in lxx(psalm)], '```\n']
        for hebrew in hebrewPsalms(psalm):
            out += [f'## Hebrew (WLC) — Hebrew Ps {hebrew}\n', '```', *[f'{n} {text}' for n, text in bolls('WLC', hebrew)], '```\n']
        for chapter in drbChapters(psalm):
            out += [f'## Douay-Rheims — from the Vulgate; Vulgate verse numbers (filed by Bolls as Ps {chapter})\n', '```', *[f'{n} {text}' for n, text in bolls('DRB', chapter)], '```\n']
        if not drbChapters(psalm) and drbByHand(psalm):
            out += [f'## Douay-Rheims — from the Vulgate; not in Bolls, from drbo.org (ps{psalm:03}/drb.txt)\n', '```', *[f'{n} {text}' for n, text in drbByHand(psalm).items()], '```\n']
        monastic = diurnal(psalm)
        if monastic:
            out += ['## Diurnal Monástico 1962 (Dom Marcos Barbosa) — made FROM THE HEBREW, printed beside this Latin. A witness of prayed Brazilian diction and rhythm only; never of sense. OCR, unchecked; he says *Tu*.\n', '```', monastic['title'], *[text for run in monastic['runs'] for text in run['pt']], '```\n']
        out += ['## Matos Soares 1932 — from the Vulgate; raw PDF text layer, OCR artefacts included; parentheses are his glosses\n', '```', matosSoares(psalm), '```\n']
    portuguese = doPortugues / f'Psalmorum/Psalm{psalm}.txt'
    if portuguese.exists():
        out += ['## DO Portugues — NOT an authority. The text this project is meant to replace: European Portuguese in origin, partly recent AI-assisted renderings (contributions of Gustavo himself to DO), with many mistakes and verse ids that drift. Contrast only; never a base, never evidence for a wording\n', '```', *[f"{v['id']} {v['text']}" for v in readVerses(portuguese)], '```\n']
    target = consult / 'parallels'
    target.mkdir(exist_ok=True)
    path = target / f'ps{psalm:03d}.md'
    path.write_text('\n'.join(out), encoding='utf-8')
    print(path.relative_to(here.parent.parent), f'({path.stat().st_size // 1024} KB)')


# compare.py imports the fetch-and-cache helper, the psalm-number map and matosSoares() from here
if __name__ == '__main__':
    main()
