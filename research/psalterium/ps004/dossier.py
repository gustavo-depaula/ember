"""Tier 0 for Ps 4: everything a translator is handed, one record per prayed verse.

Run from the repo root:  research/psalterium/.venv/bin/python research/psalterium/ps004/dossier.py
Reads the gitignored consult/ cache (Rahlfs LXX word list, WLC from Bolls) — fetch commands are in the README.
Writes research/psalterium/ps004/dossier.json.
"""

import json
import re
import sys
from pathlib import Path

import spacy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import appPointing, cola, doLatin, doPortugues, fold, marks, readVerses  # noqa: E402

psalm = 4
rareBelow = 3  # a lemma seen fewer times than this in Pss 1–150 sends the verse to a human
consult = here.parent / 'consult'
nlp = spacy.load('la_core_web_lg')
lemmaFreq = json.loads((here.parent / 'lemma-freq.json').read_text(encoding='utf-8'))
parallels = json.loads((here / 'parallels.json').read_text(encoding='utf-8'))


def lxxVerses():
    """Rahlfs 1935 by verse, from the CCAT-derived word list (one word per line, verse starts in E-verse.csv)."""
    starts = []
    for line in (consult / 'lxx-E-verse.csv').read_text(encoding='utf-8').splitlines():
        index, _, ref = line.split('\t')
        starts.append((int(index), ref.strip('「」')))
    wanted = {i: (start, ref) for i, (start, ref) in enumerate(starts) if ref.startswith(f'Ps {psalm}:')}
    wordsByIndex = {}
    first = min(start for start, _ in wanted.values())
    last = starts[max(wanted) + 1][0]
    for line in (consult / 'lxx-text_accented.csv').read_text(encoding='utf-8').splitlines():
        fields = line.split('\t')
        # some upstream rows lack the word column; if one ever falls inside the psalm, the join below raises KeyError
        # rather than silently dropping a word
        if len(fields) == 3 and first <= int(fields[0]) < last:
            wordsByIndex[int(fields[0])] = fields[2]
    out = {}
    for i, (start, ref) in wanted.items():
        end = starts[i + 1][0]
        out[int(ref.split(':')[1])] = ' '.join(wordsByIndex[n] for n in range(start, end))
    return out


def hebrewVerses():
    data = json.loads((consult / f'bolls-WLC-19-{psalm}.json').read_text(encoding='utf-8'))
    return {v['verse']: v['text'] for v in data}


def parse(colon):
    doc = nlp(re.sub(r'\s+', ' ', fold(colon)).strip())
    tokens = []
    for token in doc:
        if not token.is_alpha:
            continue
        lemma = token.lemma_.lower()
        count = lemmaFreq.get(lemma, {}).get('count', 0)
        tokens.append(
            {
                'form': token.text,
                'lemma': lemma,
                'pos': token.pos_,
                'morph': str(token.morph),
                'head': token.head.text,
                'dep': token.dep_,
                'psalterCount': count,
                **({'rare': True} if count < rareBelow else {}),
            }
        )
    return tokens


def main():
    lxx, hebrew = lxxVerses(), hebrewVerses()
    iuxta = parallels['iuxtaHebraeos']['verses']
    antecedent = {v['id']: v['text'] for v in readVerses(doPortugues / f'Psalmorum/Psalm{psalm}.txt')}
    verses = readVerses(doLatin / f'Psalmorum/Psalm{psalm}.txt')
    records = []
    for i, verse in enumerate(verses):
        sources = parallels['sourceVerses'][verse['id']]
        parsed = [{'mark': c['mark'], 'latin': c['text'], 'tokens': parse(c['text'])} for c in cola(verse['text'])]
        records.append(
            {
                'id': verse['id'],
                'layer': 'psalm',
                'latin': verse['text'],
                'latinAsShownInApp': appPointing(verse['text']),
                'marks': marks(verse['text']),
                'cola': parsed,
                'rareLemmas': sorted({t['lemma'] for c in parsed for t in c['tokens'] if t.get('rare')}),
                'neighbours': {
                    'before': verses[i - 1]['text'] if i else None,
                    'after': verses[i + 1]['text'] if i + 1 < len(verses) else None,
                },
                'lxx': {str(n): lxx[n] for n in sources},
                'hebrew': {str(n): hebrew[n] for n in sources},
                'iuxtaHebraeos': {str(n): iuxta[str(n)] for n in sources},
                'antecedentPtPT': antecedent.get(verse['id']),
            }
        )
    dossier = {
        'psalm': psalm,
        'sources': {
            'latin': 'content/do/horas/Latin/Psalterium/Psalmorum/Psalm4.txt (DO mirror; read against Hetzenauer 1914 p. 487 — see collation/report.md)',
            'parse': f'LatinCy la_core_web_lg {nlp.meta["version"]}, unreviewed',
            'lxx': 'Rahlfs 1935 via github.com/eliranwong/LXX-Rahlfs-1935 (CCAT-derived)',
            'hebrew': 'Westminster Leningrad Codex via bolls.life',
            'iuxtaHebraeos': parallels['iuxtaHebraeos']['source'],
            'antecedentPtPT': 'content/do/horas/Portugues/Psalterium/Psalmorum/Psalm4.txt — European Portuguese, reference and contrast only',
        },
        'titulus': {'latin': 'In finem, in carminibus. Psalmus David.', 'note': 'Clementine 4:1; not in the Breviary text'},
        'verses': records,
    }
    (here / 'dossier.json').write_text(json.dumps(dossier, ensure_ascii=False, indent=2), encoding='utf-8')
    for record in records:
        print(record['id'], record['marks'], record['rareLemmas'])


main()
