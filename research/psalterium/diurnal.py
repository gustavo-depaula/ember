"""The Portuguese psalms of the Diurnal Monástico (Mosteiro de São Bento do Rio de Janeiro, 1962), from its OCR.

    python3.13 research/psalterium/diurnal.py <psalm>      → consult/diurnal/ps<NNN>.json, and a summary
    python3.13 research/psalterium/diurnal.py --index      → which psalms the book has

The book prints the Gallican Latin beside a Portuguese made by Dom Marcos Barbosa "baseada no texto
original" (its own preface): a Hebrew-family witness, useful for prayed Brazilian diction, never for
sense. Copyrighted — everything it yields stays under the gitignored consult/. Day hours only, so the
psalms proper to Matins are absent.

The OCR (consult/diurnal-1.md, diurnal-2.md) gives the two columns as alternating runs of paragraphs,
Latin then Portuguese, page by page. A Latin paragraph is recognised by its words belonging to the DO
text of the psalm, which also tells which prayed verses the run covers; the Portuguese run that follows
belongs to the same verses. Where the two runs have as many paragraphs as verses, they pair off.
"""

import json
import re
import sys
from functools import lru_cache
from pathlib import Path

from latin import doLatin, readVerses, words

here = Path(__file__).resolve().parent
ocrFiles = [here / 'consult/diurnal-1.md', here / 'consult/diurnal-2.md']
outDir = here / 'consult/diurnal'

heading = re.compile(r'^#+\s*Salmo\s+(\d+)\b', re.I)
anyHeading = re.compile(r'^#')
division = re.compile(r'^#+\s*[IVXL]+\s*$')
dropCap = re.compile(r'\$\^\{([^}]*)\}\$')
notPsalm = re.compile(r'^\W*(Ant\b|Ant[ií]f|Cap[ií]tulo|Hino|Resp|℣|℟|[VR]\.\s|Gl[óo]ria|Salmo\s+\d+:)', re.I)
clitics = {'me', 'te', 'se', 'o', 'a', 'os', 'as', 'lhe', 'lhes', 'nos', 'vos', 'lo', 'la', 'los', 'las', 'no', 'na'}


@lru_cache(maxsize=1)
def vocabulary():
    """Every word the OCR prints whole — the only dictionary at hand for undoing its hyphenation."""
    return {w.lower() for path in ocrFiles for w in re.findall(r'[A-Za-zÀ-ÿ]+', path.read_text(encoding='utf-8'))}


def mendHyphens(text):
    """'pe-nas' → 'penas' when the book prints 'penas' somewhere; 'salvá-lo' and 'meio-dia' stay. '‧' marks a line-end break."""

    def mend(match):
        left, mark, right = match.groups()
        joined = left + right
        if joined.lower() in vocabulary() and right.lower() not in clitics:
            return joined
        if mark == '‧' and right.lower() not in clitics and left.lower() not in clitics:
            return joined
        return f'{left}-{right}'

    pattern = r'([A-Za-zÀ-ÿ]+)([-‧])([A-Za-zÀ-ÿ]+)'
    return re.sub(pattern, mend, re.sub(pattern, mend, text)).replace('‧', '-')


def joinLines(lines):
    """One paragraph from its wrapped lines, hyphenation undone."""
    text = ''
    for line in lines:
        line = line.strip()
        text = text[:-1] + '‧' + line if text.endswith('-') else f'{text} {line}'.strip()
    text = dropCap.sub(r'\1', text).replace('\\*', '*').replace('**', '')
    return re.sub(r'\s+', ' ', mendHyphens(text)).strip()


def sections():
    """Every '# Salmo N' section of the OCR, in book order: [(psalm, [paragraph, …])]."""
    found = []
    for path in ocrFiles:
        current = None
        block = []
        for line in path.read_text(encoding='utf-8').splitlines() + ['#']:
            if division.match(line):
                line = ''
            if anyHeading.match(line):
                if current and block:
                    current[1].append(joinLines(block))
                block = []
                match = heading.match(line)
                current = (int(match.group(1)), []) if match else None
                if current:
                    found.append(current)
            elif not line.strip():
                if current and block:
                    current[1].append(joinLines(block))
                block = []
            else:
                block.append(line)
    return found


def furniture(paragraph):
    """Running heads and page numbers: no lowercase letter, or nothing but digits."""
    return not re.search(r'[a-zà-ÿ]', paragraph) or len(paragraph) < 4


def covered(paragraphWords, verses, start):
    """The prayed verses from `start` on whose words mostly stand in this paragraph, in order."""
    bag = set(paragraphWords)
    taken = []
    for offset in range(start, min(start + 4, len(verses))):
        index = offset
        while index < len(verses):
            verseWords = verses[index]['words']
            share = sum(1 for w in verseWords if w in bag) / max(len(verseWords), 1)
            if share < 0.6:
                break
            taken.append(index)
            index += 1
        if taken:
            return taken
    return taken


def extract(psalm):
    path = doLatin / f'Psalmorum/Psalm{psalm}.txt'
    verses = [{**v, 'words': words(v['text'])} for v in readVerses(path)]
    vocabulary = {w for v in verses for w in v['words']}
    runs = []
    seen = set()
    title = ''
    for number, paragraphs in sections():
        if number != psalm:
            continue
        pointer = None
        closed = False
        sectionRuns = []
        lead = []
        for paragraph in paragraphs:
            if furniture(paragraph):
                continue
            its = words(paragraph)
            latinShare = sum(1 for w in its if w in vocabulary) / max(len(its), 1)
            isLatin = len(its) >= 3 and latinShare >= 0.7
            if isLatin:
                ids = covered(its, verses, pointer or 0)
                if not ids and pointer is None:
                    # a division of a long psalm starts further in
                    for start in range(len(verses)):
                        ids = covered(its, verses, start)
                        if ids:
                            break
                if ids:
                    pointer = ids[-1] + 1
                if not sectionRuns or sectionRuns[-1]['pt']:
                    sectionRuns.append({'ids': [], 'latin': [], 'pt': []})
                closed = False
                sectionRuns[-1]['ids'] += [verses[i]['id'] for i in ids]
                sectionRuns[-1]['latin'].append(paragraph)
            elif not sectionRuns and re.fullmatch(r'\*[^*]+\*', paragraph):
                lead.append(paragraph.strip('*'))
            elif notPsalm.match(paragraph) or paragraph.startswith('*') or re.search(r'\bAnt\.', paragraph):
                # a rubric or antiphon ends the Portuguese run; the psalm may go on (divisions of Ps 118)
                closed = bool(sectionRuns and sectionRuns[-1]['pt'])
            elif not sectionRuns:
                lead.append(paragraph)
            elif not closed and len(sectionRuns[-1]['pt']) < len(sectionRuns[-1]['latin']):
                sectionRuns[-1]['pt'].append(paragraph)
        sectionRuns = [r for r in sectionRuns if r['ids'] and r['pt']]
        fresh = [r for r in sectionRuns if not set(r['ids']) <= seen]
        if fresh and not title and lead:
            title = ' '.join(lead)
        for run in fresh:
            if len(run['pt']) == len(run['ids']) == len(run['latin']):
                keep = [i for i, vid in enumerate(run['ids']) if vid not in seen]
                for key in ('ids', 'latin', 'pt'):
                    run[key] = [run[key][i] for i in keep]
            seen.update(run['ids'])
            runs.append(run)
    allIds = [v['id'] for v in verses]
    runs.sort(key=lambda r: allIds.index(r['ids'][0]))
    for run in runs:
        run['paired'] = len(run['pt']) == len(run['ids']) == len(run['latin'])
    return {
        'psalm': psalm,
        'source': 'Diurnal Monástico, Mosteiro de São Bento do Rio de Janeiro, 1962 — Portuguese psalms by Dom Marcos Barbosa, from the Hebrew; OCR, unchecked',
        'family': 'hebrew',
        'title': title,
        'runs': runs,
        'missing': [i for i in allIds if i not in seen],
    }


def diurnal(psalm):
    """Cached extraction, or None when the book does not have the psalm."""
    cache = outDir / f'ps{psalm:03d}.json'
    # an extraction made by an older version of this script is stale
    if cache.exists() and cache.stat().st_mtime >= Path(__file__).stat().st_mtime:
        return json.loads(cache.read_text(encoding='utf-8'))
    if not all(p.exists() for p in ocrFiles):
        return None
    data = extract(psalm)
    if not data['runs']:
        return None
    outDir.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    return data


def main():
    if sys.argv[1:] == ['--index']:
        print(sorted({number for number, _ in sections()}))
        return
    psalm = int(sys.argv[1])
    cache = outDir / f'ps{psalm:03d}.json'
    cache.unlink(missing_ok=True)
    data = diurnal(psalm)
    if not data:
        print(f'Ps {psalm}: not in the Diurnal')
        return
    paired = sum(1 for r in data['runs'] if r['paired'])
    print(f"Ps {psalm}: {len(data['runs'])} runs ({paired} paired verse by verse), missing {data['missing'] or 'nothing'}")
    print(data['title'])
    for run in data['runs']:
        print(f"\n[{run['ids'][0]}–{run['ids'][-1]}]{' paired' if run['paired'] else ''}")
        for paragraph in run['pt']:
            print('  ' + paragraph)


if __name__ == '__main__':
    main()
