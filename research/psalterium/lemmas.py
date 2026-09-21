"""Lemma frequencies across Pss 1–150, for the rare-word watch: low frequency is where LLM translators fail confidently.

Run from the repo root:  research/psalterium/.venv/bin/python research/psalterium/lemmas.py
Writes research/psalterium/lemma-freq.json — {lemma: {'count': n, 'psalms': [...]}}.
Lemmas are LatinCy's, unreviewed: a rare lemma is sometimes just a mis-lemmatised common word. That is fine —
the flag routes the verse to a human, it does not decide anything.
"""

import json
import re
from pathlib import Path

import spacy

from latin import doLatin, fold, readVerses

nlp = spacy.load('la_core_web_lg')
counts = {}
for psalm in range(1, 151):
    verses = readVerses(doLatin / f'Psalmorum/Psalm{psalm}.txt')
    texts = [re.sub(r'[†‡*+]|\([^)]*\)', ' ', fold(verse['text'])) for verse in verses]
    for doc in nlp.pipe(texts):
        for token in doc:
            if token.is_alpha:
                entry = counts.setdefault(token.lemma_.lower(), {'count': 0, 'psalms': set()})
                entry['count'] += 1
                entry['psalms'].add(psalm)

out = {lemma: {'count': e['count'], 'psalms': sorted(e['psalms'])} for lemma, e in sorted(counts.items())}
(Path(__file__).resolve().parent / 'lemma-freq.json').write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding='utf-8')
print(len(out), 'lemmas;', sum(1 for e in out.values() if e['count'] == 1), 'hapax')
