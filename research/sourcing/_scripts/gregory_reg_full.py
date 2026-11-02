import sys, os, re
import xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
NS = '{http://www.tei-c.org/ns/1.0}'
SRC = ROOT + 'research/sourcing/gregory-the-great/register-la/cc-pl77-epistolae-8064.xml'
raw = open(SRC).read()
def txt(e, skip=()):
    # e is an Element parsed from a fragment
    out = [e.text or '']
    for c in e:
        tag = c.tag.replace(NS, '')
        if tag not in skip: out.append(txt(c, skip))
        out.append(c.tail or '')
    return ''.join(out)
def frag(s):
    s = re.sub(r'<LACUNA>.*?</LACUNA>', '', s, flags=re.S)
    return ET.fromstring('<r xmlns="http://www.tei-c.org/ns/1.0">' + s + '</r>')
def norm(s): return re.sub(r'\s+', ' ', s).strip()
def rnum(s):
    if s == 'PRIMA': return 1
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}; n = 0
    for a, b in zip(s, s[1:] + ' '):
        n += -v[a] if b in v and v[b] > v[a] else v[a]
    return n
def cap(s):
    small = {'ad', 'et', 'de', 'in', 'ac', 'seu', 'sive', 'cum', 'ex', 'pro', 'per', 'ab', 'atque', 'vel', 'sub'}
    ws = s.lower().split(' ')
    return ' '.join(w.upper() if re.fullmatch(r'[ivxl]+', w) and w != 'in' else (w if (w in small and k) else w[:1].upper() + w[1:]) for k, w in enumerate(ws))
book = 0; items = []; counter = {}
body_start = raw.index('<body>')
chunks = re.split(r'(?=<div[12]>)', raw[body_start:])
pending_note = None; carry = None
for ch in chunks:
    if ch.startswith('<div1>'):
        pending_note = ('div1', ch)
    if not ch.startswith('<div2>') and not ch.startswith('<div1>'): continue
    ch = re.sub(r'</div[12]>|</body>.*$', '', ch, flags=re.S)
    ch = re.sub(r'<div[12]>', '', ch)
    el = frag(ch)
    heads = el.findall(NS + 'head')
    head = None
    for h in heads:
        hs = norm(txt(h, skip=('emph', 'pb')))
        m = re.match(r'LIBER ([A-Z ]+?)\.\s*(.*)$', hs)
        if m and not hs.startswith('LIBER') is False and 'EPISTOLA' not in hs[:12]:
            book += 1; carry = m.group(2); continue
        head = h
    if head is None: continue
    note, carry = carry, None
    counter.setdefault(book, 0)
    summ_el = head.find(NS + 'hi')
    summ = norm(txt(summ_el)) if summ_el is not None else ''
    hmain = norm(txt(head, skip=('emph', 'pb', 'hi')))
    body = []
    for p in el.findall(NS + 'p'):
        s_ = norm(txt(p, skip=('pb',)))
        if s_: body.append(s_)
    m = re.match(r'EPISTOLA\s+([IVXLC]+|PRIMA)\.?\s*(.*)$', hmain)
    if m:
        n = rnum(m.group(1)); addr = m.group(2).rstrip('.').strip()
        title = 'Epistola %d' % n; cid = 'b%02d-e%03d' % (book, n)
    else:
        counter[book] += 1
        addr = ''; title = cap(hmain.rstrip('.')); cid = 'b%02d-x%02d' % (book, counter[book])
    items.append(dict(book=book, id=cid, title=title, note=note, addr=addr, summ=summ, body=body, head=hmain))
print(len(items), [sum(1 for i in items if i['book'] == b) for b in range(1, 15)])
import json
json.dump(items, open('/tmp/w/regfull.json', 'w'), ensure_ascii=False)

# ---- write the book
from imp_common import *
chs = {}; toc = []; wc = 0
RM = ROM
for it in items:
    b = it['book']
    ttl = 'Liber %s, %s' % (RM[b-1], it['title'])
    md = '# %s\n\n' % ttl
    if it['note']: md += '*%s*\n\n' % it['note'].rstrip()
    if it['addr']: md += '*%s.*\n\n' % cap(it['addr'])
    if it['summ']: md += '*%s*\n\n' % it['summ']
    md += '\n\n'.join(it['body'])
    chs[it['id']] = md; wc += len(md.split())
    toc.append({'id': it['id'], 'title': {'la': ttl}})
book = {
 "id": "gregory-great-pope-registrum-epistularum", "cover": "quarter",
 "name": {"la": "Registrum epistularum", "en-US": "Register of Letters (Latin, complete)", "pt-BR": "Registro de Cartas (latim, completo)"},
 "author": gregory_author(),
 "description": {
  "la": "Registrum epistularum Gregorii Magni in libros quattuordecim per indictiones digestum (590-604): epistolae DCCCXLIV cum duobus capitularibus et sententia, ordine editionis Maurinorum (PL 77).",
  "en-US": "The complete Latin Register of Gregory's letters, 844 letters in fourteen books arranged by indiction (590-604), with the two legal appendices of Book XIII: the whole papal chancery of the age, from Sicilian estates to the conversion of the English. The text and numbering are those of the Maurist edition (Migne, PL 77), the numbering Barmby's English selection (the Register of Letters book) also follows; this book adds the roughly 440 letters that selection leaves untranslated.",
  "pt-BR": "O Registro latino completo das cartas de Gregório: 844 cartas em catorze livros, ordenadas por indicção (590-604), com os dois apêndices jurídicos do Livro XIII: toda a chancelaria papal da época, das propriedades da Sicília à conversão dos ingleses. Texto e numeração da edição beneditina (Migne, PL 77)."},
 "composed": "590-604", "languages": ["la"], "work": "gregory-the-great/registrum-epistularum",
 "editions": {"la": {"editor": "Maurists (Sainte-Marthe), Migne PL 77", "year": 1849}},
 "sources": [{"language": "la", "url": "http://www.mlat.uzh.ch/",
   "edition": "Epistolae, Patrologia Latina 77 (Migne 1849), TEI transcription of the Corpus Corporum (University of Zurich; text no. 8064, encoded by Ph. Roelli, 2019; corrections by Jan Ctibor, 2023), the upstream of Latin Wikisource's Epistolae (Gregorius Magnus).",
   "description": "TEI converted to one file per letter: PL column numbers and page breaks removed; the date/indiction note kept above the first letter of each book; address and Maurist summary kept in italics. The TEI is complete where the Wikisource copy stops mid-letter in Book XIII. Raw TEI in sources/la-originals.",
   "tier": "A", "tierEvidence": "Migne's 1849 reprint of the 1705 Maurist edition: public domain."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(ROOT + 'content/books/church-fathers/gregory-great-pope/registrum-epistularum', book, {'la': chs}, raw, 'registrum-epistularum-pl77')
print('words', wc, len(chs))
