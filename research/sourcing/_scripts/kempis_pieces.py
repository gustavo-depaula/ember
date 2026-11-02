"""A Kempis book from Pohl's OCR given as explicit pieces: [(id, title, start, end)] line ranges, one chapter each."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kempis_pair import ROOT, AU, md
from kempis_common import clean, mend, fix
import kempis_fix as kf
import bookjson


def piece(F, a, b, head=None):
    L = open(F, errors='replace').read().split('\n')[a:b]
    if head:
        L = [l for l in L if not (head.search(l) and sum(c.isupper() for c in l) >= 0.5 * sum(c.isalpha() for c in l))]
    L = kf.repair_open(L, 12)
    return [kf.tidy(kf.fix_ocr(fix(p))) for p in mend(clean(L))]


def book(spec):
    d = ROOT + spec['slug']
    os.makedirs(d + '/la', exist_ok=True)
    toc, words = [], 0
    for cid, title, a, b in spec['pieces']:
        body = piece(spec['file'], a, b, spec.get('head'))
        open(f'{d}/la/{cid}.md', 'w').write(md(title, body))
        words += len(' '.join(body).split())
        toc.append({'id': cid, 'title': {'la': title}})
    ed = spec['edition']
    b = {'id': 'kempis-' + spec['slug'], 'cover': 'classic', 'name': spec['name'], 'author': AU, 'description': spec['description'],
         'composed': spec['composed'], 'languages': ['la'], 'work': 'thomas-a-kempis/' + spec['slug'],
         'editions': {'la': {'editor': 'Michael Joseph Pohl', 'year': ed['year']}},
         'sources': [{'language': 'la', 'url': 'https://archive.org/details/' + ed['archive'], 'edition': f"Thomae Hemerken a Kempis {spec['title_la']}, ed. M. J. Pohl (Freiburg: Herder {ed['year']}), Opera omnia {ed['vol']}; archive.org raw OCR.",
           'description': spec.get('note', '') + 'Pohl\'s text without his critical apparatus and introduction; line numbers, running heads and page breaks stripped by script. Raw OCR: drop capitals at openings are often garbled, and some slips remain after the scripted lexicon repair.', 'tier': 'A', 'tierEvidence': f"Pohl {ed['year']}; Thomas died in 1471."}],
         'toc': toc}
    bookjson.write(d, b)
    os.makedirs(d + '/sources/la-originals', exist_ok=True)
    os.system(f"cp '{spec['file']}' '{d}/sources/la-originals/'")
    print(spec['slug'], words, len(toc))
