"""Lawlor's English of Bernard's Life of St Malachy (Gutenberg 25761) as its own book.
usage: python3 -I bernard_malachy_en.py"""
import re, json, shutil
from pathlib import Path
SRC = Path('research/sourcing/bernard-of-clairvaux/gut/malachy.txt')
L = SRC.read_text(encoding='utf-8').split('\n')
d = Path('content/books/bernard-opera-omnia/vita-sancti-malachiae-lawlor')
if d.exists(): shutil.rmtree(d)
start = 2133  # 'THE LIFE OF ST. MALACHY'
end = next(i for i, l in enumerate(L) if l.startswith('LETTERS OF ST. BERNARD') and i > start)
# chapter heads
heads = [(i, l.strip()) for i, l in enumerate(L[start:end], start) if re.match(r'^(PREFACE|CHAPTER [IVX]+\.?)\s*$', l)]
def conv(t):
    t = re.sub(r'(?<![\w*])_([^_]+)_(?![\w])', r'*\1*', t)
    t = re.sub(r'\[(\d{2,4})\]', r'[^\1]', t)
    return t.replace('--', '—')
def block(a, b):
    chunk = L[a:b]
    k = next((i for i, l in enumerate(chunk) if l.strip() == 'FOOTNOTES:'), len(chunk))
    body, notes = chunk[:k], chunk[k + 1:]
    paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', '\n'.join(body))]
    paras = [conv(re.sub(r'^\d{1,2}\.\s+', '', p)) for p in paras if p and not re.match(r'^\[Sidenote:[^\]]*\]$', p) and not p.startswith('_Here ')]
    ns = []
    for p in re.split(r'\n\s*\n', '\n'.join(notes)):
        p = re.sub(r'\s+', ' ', p).strip()
        m = re.match(r'^\[(\d+)\]\s*(.*)$', p)
        if m: ns.append('[^%s]: %s' % (m.group(1), conv(m.group(2))))
        elif p and ns: ns[-1] += ' ' + conv(p)
    return paras, ns
ROM = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8}
toc = []; words = 0
bounds = [h[0] for h in heads] + [end]
# prologue = PREFACE; the 'Prologue' ends with 'Here ends the Prologue'
for n, (i, h) in enumerate(heads):
    a = i + 1
    if h == 'PREFACE':
        cid, title = 'praefatio', 'Preface'; paras, ns = block(a, bounds[n + 1])
    else:
        r = h.split()[1].rstrip('.'); cid = 'c%02d' % ROM[r]
        # summary: the italic paragraph(s) right after the heading
        paras, ns = block(a, bounds[n + 1])
        summ = paras[0] if paras and paras[0].startswith('*') and paras[0].endswith('*') else ''
        title = 'Chapter %s' % r + ('. ' + summ.strip('*').rstrip('.') if summ else '')
        if summ: paras = paras[1:]
    # a chapter's notes follow its text, so drop trailing lone note markers from paras
    text = '# %s\n\n%s\n' % (title, '\n\n'.join(paras)) + ('\n' + '\n\n'.join(ns) + '\n' if ns else '')
    (d / 'en-US').mkdir(parents=True, exist_ok=True); (d / 'en-US' / (cid + '.md')).write_text(text, encoding='utf-8')
    words += len(text.split()); toc.append({'id': cid, 'title': {'en-US': title}})
(d / 'sources/english-originals').mkdir(parents=True, exist_ok=True)
(d / 'sources/english-originals/vita-sancti-malachiae-lawlor.txt').write_text('\n'.join(L[start:end]) + '\n', encoding='utf-8')
A = {'la': 'Bernardus Claraevallensis', 'en-US': 'St. Bernard of Clairvaux', 'pt-BR': 'São Bernardo de Claraval'}
meta = {'id': 'bernard-vita-sancti-malachiae-lawlor', 'cover': 'classic',
  'name': {'en-US': 'The Life of St. Malachy of Armagh', 'pt-BR': 'Vida de São Malaquias de Armagh'}, 'author': A,
  'description': {'en-US': 'H. J. Lawlor’s English translation (SPCK, 1920) of Bernard’s Life of his friend Malachy, archbishop of Armagh, who died at Clairvaux in 1148: the preface (Bernard’s prologue to Abbot Congan) and the eight chapters, with Lawlor’s footnotes. Lawlor’s own chapter division follows the modern critical text and differs from the finer Maurist capitula of the Latin book, so the Latin is a separate book of the same work.',
                  'pt-BR': 'A tradução inglesa de H. J. Lawlor (SPCK, 1920) da vida de Malaquias, arcebispo de Armagh, escrita por Bernardo: o prefácio e os oito capítulos, com as notas de Lawlor.'},
  'composed': '1148-1151', 'languages': ['en-US'], 'work': 'bernard/vita-sancti-malachiae',
  'editions': {'en-US': {'translator': 'H. J. Lawlor', 'year': 1920}},
  'sources': [{'language': 'en-US', 'url': 'https://www.gutenberg.org/ebooks/25761', 'edition': 'St. Bernard of Clairvaux’s Life of St. Malachy of Armagh, translated into English with introduction and notes by H. J. Lawlor (London: SPCK, 1920); Project Gutenberg e-text 25761.',
    'description': 'Bernard’s Life only: the preface and chapters I-VIII with the footnotes after each; Bernard’s section numbers are dropped. Lawlor’s long introduction, the translation of Bernard’s letters and sermons on Malachy and the appendices are not imported; the marginal dates are dropped.',
    'tier': 'A', 'tierEvidence': 'Published in London in 1920, before 1931: public domain in the US.'}],
  'toc': toc}
(d / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(toc), words)
