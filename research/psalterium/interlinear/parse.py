"""Tier 0 of the interlinear, for the whole psalter: every word of the DO Latin, lemmatised and parsed by LatinCy.

Run from the repo root:  research/psalterium/.venv/bin/python research/psalterium/interlinear/parse.py [N …]
Writes research/psalterium/interlinear/parse/psNNN.json (Pss 1–150, and any canticle that has a folder here) and
research/psalterium/interlinear/lemmas.json. With numbers, parses only those psalms and leaves lemmas.json alone.

Verse ids are latin.py's readVerses (the b-suffixed repeats included), so they are those of every psNNN/latin.json;
cola and marks are latin.py's cola(). LatinCy is fed the folded text (no accents, j→i, æ→ae) and returns it with
v→u; each token keeps the words as printed in the DO text, accents included, by carrying a character map from the
folded verse back to the printed one. An enclitic LatinCy splits off (Dominúmque, mecum) becomes two tokens: the
second shows as -que / -cum. The parse is unreviewed; glosses/ formOverrides are where a misparse is corrected.
"""

import json
import re
import sys
from pathlib import Path

import spacy

here = Path(__file__).resolve().parent
project = here.parent
sys.path.insert(0, str(project))
from latin import cola, doLatin, fold, readVerses  # noqa: E402

rareBelow = 3  # as the pilot: a lemma seen fewer than three times in Pss 1–150 is flagged
lemmaFreq = json.loads((project / 'lemma-freq.json').read_text(encoding='utf-8'))
wordPattern = re.compile(r'[^\W\d_]+')


def psalmNumbers():
    numbers = list(range(1, 151))
    for folder in sorted(project.glob('ps[0-9][0-9][0-9]')):
        number = int(folder.name[2:])
        if number > 150 and (doLatin / f'Psalmorum/Psalm{number}.txt').exists():
            numbers.append(number)
    return numbers


def foldedVerse(verse):
    """The verse's cola and one folded string for LatinCy, with a map from each folded character to (colon, printed char)."""
    parts = cola(verse['text'])
    folded, where = [], []
    for c, colon in enumerate(parts):
        if c:
            folded.append(' ')
            where.append(None)
        for i, char in enumerate(colon['text']):
            for piece in fold(char):
                folded.append(piece)
                where.append((c, i))
    return parts, ''.join(folded), where


def tokensOf(doc, parts, where):
    """LatinCy's alphabetic tokens placed back in their colon, each with the printed form it came from."""
    out = [{'mark': part['mark'], 'latin': part['text'], 'tokens': []} for part in parts]
    words = [[(m.start(), m.end()) for m in wordPattern.finditer(part['text'])] for part in parts]
    for token in doc:
        if not token.is_alpha:
            continue
        start, end = token.idx, token.idx + len(token.text)
        spots = [where[k] for k in range(start, end) if where[k] is not None]
        colon = spots[0][0]
        first, last = spots[0][1], spots[-1][1] + 1
        text = parts[colon]['text']
        word = next((w for w in words[colon] if w[0] <= first < w[1]), (first, last))
        form = text[first:last]
        if first > word[0]:
            form = '-' + form  # an enclitic split off the word before it
        after = ''
        if last >= word[1]:
            # the punctuation that follows the printed word, up to the next word (never a pointing mark: cola dropped those)
            rest = text[word[1]:]
            after = re.match(r'[^\w\s]*', rest.lstrip()).group(0) if rest.strip() else ''
        lemma = token.lemma_.lower()
        count = lemmaFreq.get(lemma, {}).get('count', 0)
        out[colon]['tokens'].append({
            'form': form,
            **({'after': after} if after else {}),
            'fold': token.text.lower(),
            'lemma': lemma,
            'pos': token.pos_,
            'morph': str(token.morph),
            **({'rare': True} if count < rareBelow else {}),
        })
    return out


def checkIds(number, verses):
    path = project / f'ps{number:03d}' / 'latin.json'
    if path.exists():
        ids = list(json.loads(path.read_text(encoding='utf-8')))
        if ids != [v['id'] for v in verses]:
            print(f'  ps{number:03d}: verse ids differ from its latin.json')


def main():
    wanted = [int(a) for a in sys.argv[1:]] or psalmNumbers()
    nlp = spacy.load('la_core_web_lg')
    (here / 'parse').mkdir(exist_ok=True)
    lemmas = {}
    for number in wanted:
        verses = readVerses(doLatin / f'Psalmorum/Psalm{number}.txt')
        checkIds(number, verses)
        prepared = [foldedVerse(v) for v in verses]
        records = []
        for verse, (parts, text, where), doc in zip(verses, prepared, nlp.pipe(p[1] for p in prepared)):
            parsed = tokensOf(doc, parts, where)
            records.append({'id': verse['id'], 'cola': parsed})
            for colon in parsed:
                for token in colon['tokens']:
                    entry = lemmas.setdefault(token['lemma'], {'count': 0, 'psalms': [], 'forms': []})
                    entry['count'] += 1
                    if number not in entry['psalms']:
                        entry['psalms'].append(number)
                    if token['fold'] not in entry['forms']:
                        entry['forms'].append(token['fold'])
        out = {
            'psalm': number,
            'source': f'content/do/horas/Latin/Psalterium/Psalmorum/Psalm{number}.txt',
            'parser': f'LatinCy la_core_web_lg {nlp.meta["version"]}, unreviewed',
            'verses': records,
        }
        (here / 'parse' / f'ps{number:03d}.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'ps{number:03d}: {len(records)} verses, {sum(len(c["tokens"]) for r in records for c in r["cola"])} words')
    if sys.argv[1:]:
        return
    table = {
        lemma: {'count': e['count'], 'psalms': e['psalms'], 'forms': e['forms'][:6]}
        for lemma, e in sorted(lemmas.items())
    }
    (here / 'lemmas.json').write_text(json.dumps(table, ensure_ascii=False, indent=0), encoding='utf-8')
    print(len(table), 'lemmas;', sum(1 for e in table.values() if e['count'] == 1), 'seen once')


main()
