"""Tier 1 for the whole psalter: parse/ + glosses/ → one compact interlinear file per psalm, for the site.

Run from the repo root:  python3.13 research/psalterium/interlinear/build.py
Reads interlinear/parse/psNNN.json (parse.py) and every interlinear/glosses/<shard>.json; writes interlinear/psNNN.json
and interlinear/legend.json. Nothing here is translated: the gloss is the lemma's dictionary sense from the shards,
the morphology is LatinCy's features abbreviated. A word whose lemma has no gloss yet shows as … and is counted.

A psalm file: {"psalm": N, "missing": n, "verses": {"4:2a": [word, word, "*", word, …]}} — a pointing mark stands as
a bare string between the cola; a word is [printed form with its punctuation, gloss, short morphology, lemma], and a
fifth element 1 when the lemma is rare in the psalter (fewer than three occurrences in lemmas.json, the pilot's rare-word
watch).

Corrections, in any shard. lemmaFixes {wrong: right} renames a lemma LatinCy gets wrong for every form it covers
(uanito → uanitas); the gloss is then the right lemma's. formOverrides correct one form: the key is the folded form as
LatinCy returns it — lowercase, no accents, j→i and v→u (uanitatem, compungimini) — alone for every occurrence; after
another form and a space for that pair only ("miserere mei": the second word); or with @ and a verse id for one verse
(compungimini@4:5). The most specific wins: verse, then pair, then form. Fields: lemma, morph (already in the short
convention below), gloss, parserSaid (the evidence). A field left out falls back to the parse, the gloss to the lemma table.
"""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
missingMark = '…'

# The short morphology: conventional Latin-grammar abbreviations, joined by dots, readable at a glance.
legend = {
    'order': 'tense.mood.voice.person-number for verbs; case.number.gender for nouns, adjectives, participles; the indicative, the active and a noun’s gender go unsaid',
    'abbreviations': {
        'nom gen dat acc abl voc': 'cases',
        'sg pl': 'singular, plural',
        'm f n': 'masculine, feminine, neuter',
        '1s 2s 3s 1p 2p 3p': 'person and number (acc.1s = me)',
        'pres impf fut perf plqp futp': 'present, imperfect, future, perfect, pluperfect, future perfect',
        'subj imp': 'subjunctive, imperative',
        'pass': 'passive (LatinCy parses most deponents so)',
        'inf part ger gdv sup': 'infinitive, participle, gerund, gerundive, supine',
        'comp superl': 'comparative, superlative',
        'conj. prep. adv. interj. neg. num. n.pr.': 'the words that do not inflect, and proper names',
    },
}

cases = {'Nom': 'nom', 'Gen': 'gen', 'Dat': 'dat', 'Acc': 'acc', 'Abl': 'abl', 'Voc': 'voc', 'Loc': 'loc'}
numbers = {'Sing': 'sg', 'Plur': 'pl'}
genders = {'Masc': 'm', 'Fem': 'f', 'Neut': 'n'}
personNumber = {'Sing': 's', 'Plur': 'p'}
personal = {'ego', 'tu', 'nos', 'uos', 'sui'}
bare = {'CCONJ': 'conj.', 'SCONJ': 'conj.', 'ADP': 'prep.', 'ADV': 'adv.', 'INTJ': 'interj.', 'NUM': 'num.', 'PROPN': 'n.pr.'}


def tenseOf(f):
    tense, aspect = f.get('Tense'), f.get('Aspect')
    if tense == 'Pres':
        return 'pres'
    if tense == 'Past':
        return 'impf' if aspect == 'Imp' else 'perf'
    if tense == 'Fut':
        return 'futp' if aspect == 'Perf' else 'fut'
    if tense == 'Pqp':
        return 'plqp'
    return ''


def shortMorph(token):
    f = dict(pair.split('=', 1) for pair in token['morph'].split('|') if '=' in pair)
    pos, lemma = token['pos'], token['lemma']
    nominal = [cases.get(f.get('Case'), ''), numbers.get(f.get('Number'), ''), genders.get(f.get('Gender'), '')]
    degree = {'Cmp': 'comp', 'Sup': 'superl', 'Abs': 'superl'}.get(f.get('Degree'), '')
    passive = 'pass' if f.get('Voice') == 'Pass' else ''
    form = f.get('VerbForm')
    if form == 'Fin':
        mood = {'Sub': 'subj', 'Imp': 'imp'}.get(f.get('Mood'), '')
        tense = tenseOf(f)
        if mood == 'imp' and tense == 'pres':
            tense = ''
        pn = f.get('Person', '') + personNumber.get(f.get('Number'), '')
        parts = [tense, mood, passive, pn]
    elif form == 'Inf':
        parts = ['inf', tenseOf(f) or {'Perf': 'perf', 'Prosp': 'fut'}.get(f.get('Aspect'), 'pres'), passive]
    elif form == 'Part':
        aspect = f.get('Aspect')
        if aspect == 'Prosp' and passive:
            parts = ['gdv', *nominal]
        else:
            parts = ['part', {'Imp': 'pres', 'Perf': 'perf', 'Prosp': 'fut'}.get(aspect, ''), *nominal]
    elif form == 'Ger':
        parts = ['ger', nominal[0]]
    elif form == 'Sup':
        parts = ['sup', nominal[0]]
    elif pos == 'PRON' and lemma in personal:
        parts = [nominal[0], f.get('Person', '') + personNumber.get(f.get('Number'), '')]
    elif f.get('Case'):
        parts = [*nominal[:2], '' if pos == 'NOUN' else nominal[2], degree]
    elif f.get('Polarity') == 'Neg' or token['fold'] in ('non', 'haud', 'nequaquam'):
        return 'neg.'
    else:
        return ' '.join(p for p in [bare.get(pos) or {'PART': 'partíc.'}.get(pos, ''), degree] if p)
    return '.'.join(p for p in parts if p)


def loadGlosses():
    lemmas, overrides, fixes, owner = {}, {}, {}, {}
    for path in sorted((here / 'glosses').glob('*.json')):
        shard = json.loads(path.read_text(encoding='utf-8'))
        for lemma, gloss in shard.get('lemmas', {}).items():
            if lemma in owner:
                print(f'  {lemma} is in both {owner[lemma]} and {path.name}; {path.name} wins')
            owner[lemma] = path.name
            if gloss:
                lemmas[lemma] = gloss
        for key, override in shard.get('formOverrides', {}).items():
            if key in overrides:
                print(f'  formOverride {key} is in two shards; {path.name} wins')
            overrides[key] = override
        fixes.update(shard.get('lemmaFixes', {}))
    return lemmas, overrides, fixes


def main():
    lemmas, overrides, fixes = loadGlosses()
    counts = {lemma: entry['count'] for lemma, entry in json.loads((here / 'lemmas.json').read_text(encoding='utf-8')).items()}
    for wrong, right in fixes.items():
        counts[right] = counts.get(right, 0) + counts.get(wrong, 0)
    total, missingLemmas, lines = 0, {}, []
    for path in sorted((here / 'parse').glob('ps[0-9][0-9][0-9].json')):
        parsed = json.loads(path.read_text(encoding='utf-8'))
        verses, missing = {}, 0
        for verse in parsed['verses']:
            row, before = [], ''
            for colon in verse['cola']:
                if colon['mark']:
                    row.append(colon['mark'])
                for token in colon['tokens']:
                    fold = token['fold']
                    override = overrides.get(f"{fold}@{verse['id']}") or overrides.get(f'{before} {fold}') or overrides.get(fold) or {}
                    before = fold
                    lemma = override.get('lemma') or fixes.get(token['lemma'], token['lemma'])
                    gloss = override.get('gloss') or lemmas.get(lemma)
                    if not gloss:
                        missing += 1
                        missingLemmas[lemma] = missingLemmas.get(lemma, 0) + 1
                    word = [token['form'] + token.get('after', ''), gloss or missingMark, override.get('morph') or shortMorph(token), lemma]
                    # rare by the lemma as corrected (Irascímini is irascor, not a hapax irascimini); the parse's flag if unknown
                    rare = counts[lemma] < 3 if lemma in counts else token.get('rare')
                    if rare:
                        word.append(1)
                    row.append(word)
            verses[verse['id']] = row
        out = {'psalm': parsed['psalm'], 'parser': parsed['parser'], 'missing': missing, 'verses': verses}
        (here / path.name).write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        total += missing
        lines.append(f'{path.stem} {missing}')
    (here / 'legend.json').write_text(json.dumps(legend, ensure_ascii=False, indent=1), encoding='utf-8')
    for start in range(0, len(lines), 8):
        print('  '.join(f'{line:<12}' for line in lines[start:start + 8]))
    print(f'{len(lines)} psalms; {total} words without a gloss, from {len(missingLemmas)} lemmas; {len(lemmas)} lemmas glossed, {len(overrides)} form overrides')


main()
