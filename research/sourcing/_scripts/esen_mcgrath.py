"""McGrath 1844 'The Sinner's Guide' (IA sinnersguideintw00luisuoft) -> en-US book, one chapter per chapter."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
import esen_lib as B
SRC = B.ROOT + '/research/sourcing/louis-of-granada/ia/sinnersguideintw00luisuoft.txt'
L = open(SRC, errors='replace').read().replace('\x0c', '').split('\n')
heads = [i for i, l in enumerate(L) if 320 < i < 21080 and re.match(r'^CHAPTER\s+[IVXLCT]+[LI]?\W*$', l.strip())]
assert len(heads) == 50, len(heads)
sizes = [(1, 1, 10), (1, 2, 13), (1, 3, 6), (2, 1, 11), (2, 2, 10)]
labels = []
for bk, pt, n in sizes: labels += [(bk, pt, c + 1) for c in range(n)]
RH = re.compile(r"THE\s+SINNER'?S\s+GUIDE|^\s*(VOL\.?\s*[IVX]+\.?|\d?\s*[a-z]\d?|[A-Z]\s*\d?|\d+)\s*$|^\s*(BOOK|PART)\s+(THE\s+)?[IVX]+")
ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII']
chs = []
for k, i in enumerate(heads):
    e = heads[k + 1] if k + 1 < len(heads) else 21080
    # stop at the back-matter marker before the next heading's BOOK/PART banner
    seg = [x for x in L[i + 1:e] if not re.match(r"^\s*\d*\s*the\s+sinner'?s\s+guide\.?\s*\d*\s*$", x, re.I)]
    for q, l in enumerate(seg):
        if re.match(r'^\s*BOOK\s+[IVX]+\.?\s*$', l) and q > 5: seg = seg[:q]; break
    j = 0
    while not seg[j].strip(): j += 1
    ti = []
    while seg[j].strip(): ti.append(seg[j].strip()); j += 1
    k2 = j
    while k2 < len(seg) and not seg[k2].strip(): k2 += 1
    if k2 < len(seg) and len(seg[k2].split()) <= 3 and not re.match(r'^\d', seg[k2].strip()) and not seg[k2 + 1].strip(): ti.append(seg[k2].strip()); j = k2 + 1
    title = re.sub(r'\s+', ' ', E.join_lines(ti)).strip(' .')
    blocks = []; cur = []
    for l in seg[j:]:
        if l.strip(): cur.append(l)
        elif cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    ps = []
    for b in blocks:
        t = ' '.join(x.strip() for x in b)
        if len(b) <= 2 and RH.search(t) and len(t) < 60: continue
        b = [x for x in b if not (RH.search(x) and len(x.strip()) < 40)]
        if not b: continue
        ps.append(re.sub(r'\s+', ' ', E.join_lines(b)).strip())
    res = []
    for p in ps:
        if res and not re.search(r'[.!?:;"”’\')\]]\s*$', res[-1]) and p[:1].islower(): res[-1] = E.join_lines([res[-1], p])
        else: res.append(p)
    bk, pt, c = labels[k]
    title = title.replace('Jourth', 'Fourth')
    chs.append(('b%dp%dc%02d' % (bk, pt, c), 'Book %s, Part %d, Chapter %d. %s' % ('I' if bk == 1 else 'II', pt, c, title), '\n\n'.join(res)))
cfg = dict(id='granada-guia-de-pecadores-mcgrath', dir='louis-of-granada-opera-omnia/guia-de-pecadores-mcgrath-en', work='louis-of-granada/guia-de-pecadores',
           name="The Sinner's Guide (McGrath, 1844)", name_pt='O guia dos pecadores (McGrath, inglês, 1844)',
           author='Louis of Granada', author_es='Fray Luis de Granada', author_pt='Frei Luís de Granada', composed='1555–1556', translator='anonymous, "translated from the Spanish" (Philadelphia: Henry McGrath, 1844)', year=1844,
           url='https://archive.org/details/sinnersguideintw00luisuoft',
           edition="The Sinner's Guide, in two books, by the Rev. F. Lewis of Granada, translated from the Spanish, Philadelphia: Henry McGrath, 1844 (the older English translation, a second witness beside McKenna's of 1883). Internet Archive scan sinnersguideintw00luisuoft.",
           desc="The older English translation of both books of Louis of Granada's Guía de pecadores, in the Philadelphia edition of 1844: Book I (the exhortation to virtue, in three parts of 10, 13 and 6 chapters) and Book II (the doctrine of virtue, in two parts of 11 and 10 chapters). It is a different translation from McKenna's, so it is its own book. Numbered paragraphs are kept.",
           desc_pt='A tradução inglesa mais antiga (Filadélfia, 1844) dos dois livros do Guía de pecadores de Luís de Granada.',
           srcdesc='Internet Archive OCR, split at the 50 chapter headings; running heads and page numbers are dropped and line-break hyphens joined. The title pages, the translator\'s preface, the tables of contents and the index are not included; isolated recognition slips remain.')
if __name__ == '__main__':
    B.write_book(cfg, chs, [SRC])
