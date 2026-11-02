"""Write adam-sequentiae-wrangham (English only) from the parsed Wrangham OCR. usage: python3 -I victorines_wrangham_build.py"""
import json, re, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_wrangham import build, stanzas

def title_of(h):
    h = re.sub(r'[^A-Za-z.\' ,]', '', h or '').strip(' .,')
    h = re.sub(r'\bS7\b', 'ST', h)
    h = re.sub(r'\s+', ' ', h)
    h = re.sub(r'\bNA TIVITY\b', 'NATIVITY', h)
    t = ' '.join(w.capitalize() if w not in ('OF', 'THE', 'AND', 'A', 'ON') else w.lower() for w in h.split())
    t = re.sub(r'^St\b\.?', 'St.', t); t = t.replace('St..', 'St.')
    return (t[0].upper() + t[1:]) if t else 'Sequence'

root = Path('content/books/adam-of-st-victor-opera-omnia/sequentiae-wrangham')
if root.exists(): shutil.rmtree(root)
(root / 'en-US').mkdir(parents=True)
toc = []; kept = 0; bad = []; words = 0
for n, lh, eh, la, en in build():
    if len(en) < 8:
        bad.append(n); continue
    title = 'Sequence %d. %s' % (n, title_of(eh[0] if eh else ''))
    cid = 's%03d' % n
    body = '\n\n'.join(stanzas(en))
    (root / 'en-US' / (cid + '.md')).write_text('# %s\n\n%s\n' % (title, body), encoding='utf-8')
    toc.append({'id': cid, 'title': {'en-US': title}})
    kept += 1; words += len(body.split())
    if abs(len(la) - len(en)) > 8: bad.append(n)
print(kept, words, 'flagged', bad)
(root / 'sources' / 'english-originals').mkdir(parents=True)
for v, i in (('v01', '01'), ('v02', '02'), ('v03', '03')):
    shutil.copy('research/sourcing/victorines/ia-wrangham/%s.txt' % v, root / 'sources' / 'english-originals' / ('wrangham-%s.txt' % v))
A = {'la': 'Adamus de Sancto Victore', 'en-US': 'Adam of St. Victor', 'pt-BR': 'Adão de São Vítor'}
meta = {'id': 'adam-sequentiae-wrangham', 'cover': 'classic',
 'name': {'en-US': 'The Liturgical Poetry of Adam of St. Victor (Wrangham)', 'pt-BR': 'A poesia litúrgica de Adão de São Vítor (Wrangham)'},
 'author': A,
 'description': {'en-US': 'Digby S. Wrangham’s English verse translations of the sequences of Adam of St. Victor (1881), made in the original metres from Léon Gautier’s Latin text: sequences I to CII, for the feasts of the Lord, the saints and Our Lady. Gautier’s selection and numbering differ from the thirty-six prosae of Migne, so this is a separate book from the Latin Sequentiae; the same work. English only, from a machine-read scan (some slips remain); the translator’s notes and the doubtful sequences are not imported. One verse to a line.',
   'pt-BR': 'As traduções em verso inglês de Digby S. Wrangham (1881) das sequências de Adão de São Vítor, nos metros originais, a partir do texto latino de Léon Gautier: sequências I a CII.'},
 'composed': 'c. 1130-1170 (translation 1881)', 'languages': ['en-US'], 'work': 'adam/sequentiae',
 'editions': {'en-US': {'translator': 'Digby S. Wrangham', 'year': 1881}},
 'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/liturgicalpoetry01adamuoft',
   'edition': 'The Liturgical Poetry of Adam of St. Victor, from the text of Gautier, with translations into English in the original metres and short explanatory notes by Digby S. Wrangham, 3 vols (London: Trubner, 1881); archive.org liturgicalpoetry01adamuoft, 02adamuoft, 03adamuoft (OCR text).',
   'description': 'Only the English translations of sequences I-CII are imported; the facing Latin of Gautier, the translator’s notes, the index and the doubtful sequences are left out. Stanza breaks are inferred from sentence ends; the OCR carries slips.',
   'tier': 'A', 'tierEvidence': 'Published in London in 1881; the translator is out of copyright everywhere.'}],
 'toc': toc}
(root / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
