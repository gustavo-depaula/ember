"""Scripture commentaries of Quaracchi VI (djvu.xml). usage: python3 -I bonaventure_comm.py eccl|sap|ioan [dry]
Chapters follow the running head ("COMMENT. IN ... C. VII"): a chapter opens at the top of the first page whose head names it."""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

def W(slug, la, en, pt, d_la, d_en, composed, pages, pp, vol='06', rh=None):
    return dict(slug=slug, names={'la': la, 'en-US': en, 'pt-BR': pt}, d_la=d_la, d_en=d_en, composed=composed, pages=pages, pp=pp, vol=vol, rh=rh)
WORKS = {
 'eccl': W('commentarius-in-ecclesiasten', 'Commentarius in Ecclesiasten', 'Commentary on Ecclesiastes', 'Comentário ao Eclesiastes',
    'Commentarius in librum Ecclesiastes, in duodecim capitulis.', 'Bonaventure’s commentary on the book of Ecclesiastes, in twelve chapters.', 'c. 1254-1257', (45, 141), '1-103'),
 'sap': W('commentarius-in-librum-sapientiae', 'Commentarius in librum Sapientiae', 'Commentary on the Book of Wisdom', 'Comentário ao livro da Sabedoria',
    'Commentarius in librum Sapientiae (auctoritas Bonaventurae disputatur).', 'A commentary on the Book of Wisdom, attributed to Bonaventure (the attribution is disputed).', 'c. 1254-1257', (149, 281), '105-235'),
 'ioan': W('commentarius-in-evangelium-ioannis', 'Commentarius in Evangelium Ioannis', 'Commentary on the Gospel of John', 'Comentário ao Evangelho de João',
    'Commentarius in Evangelium Ioannis, in viginti et unum capitulis.', 'Bonaventure’s commentary on the Gospel of John, in twenty-one chapters.', 'c. 1254-1257', (282, 573), '237-532'),
 'coll': W('collationes-in-evangelium-ioannis', 'Collationes in Evangelium Ioannis', 'Collations on the Gospel of John', 'Colações sobre o Evangelho de João',
    'Collationes in Evangelium Ioannis, ad capita Evangelii dispositae.', 'Bonaventure’s collations on the Gospel of John, arranged by the chapters of the Gospel.', 'c. 1254-1257', (577, 673), '533-634',
    rh=r'COLL\w*\s+\w{1,3}\s+\w+\s+CAP\W{0,3}\s*([IVXLlUHf1JT\[\]]{1,7})'),
 'luc': W('commentarius-in-evangelium-lucae', 'Commentarius in Evangelium Lucae', 'Commentary on the Gospel of Luke', 'Comentário ao Evangelho de Lucas',
    'Commentarius in Evangelium Lucae, in viginti quattuor capitulis.', 'Bonaventure’s commentary on the Gospel of Luke, in twenty-four chapters.', 'c. 1255-1257', (30, 633), '1-604', vol='07'),
}
w = WORKS[sys.argv[1]]
P = F.load_pages('research/sourcing/bonaventure/xml/v%s.xml' % w['vol'])
RH = re.compile(w['rh'] or r'COMM\w*\.?\s+\w{1,3}\s+(?:\w+\s+)?\w+\.?[,:]?\s+C\W{0,2}\s*([IVXLlUHf1JT\[\]]{1,7})')
def page_chapter(pg):
    top = sorted([ws for ws in pg['lines'] if ws[0][3] < 420 * pg['h'] / 3398], key=lambda x: x[0][3])
    t = ' '.join(' '.join(x[4] for x in ws) for ws in top[:3]).upper()
    m = RH.search(t)
    return F.head_roman('C. ' + m.group(1).replace('[', 'I').replace(']', 'I').replace('F', 'I')) if m else None
RV = {roman(i): i for i in range(1, 40)}
TOM = {'06': ('VI', 1893), '07': ('VII', 1895)}[w['vol']]
cur = 0; pagech = {}
for n in range(w['pages'][0], w['pages'][1] + 1):
    r = RV.get(page_chapter(P[n-1]) or '', 0)
    if r and cur <= r <= cur + (3 if w['slug'].startswith('collationes') else 1): cur = r
    pagech[n] = cur
ps = F.paragraphs(F.stream(P, *w['pages']))
log = []; fx = lambda t: F.clean(t, fix_ocr, log)
chs = {}; ch = 0
for it in ps:
    if it[0] == 'G': ch = pagech[it[1]]; continue
    if it[0] != 'P': continue
    p = fx(it[1])
    if len(p.split()) >= 2: chs.setdefault(ch, []).append(p)
files = {'la': {}}; toc = []; total = 0
for c in sorted(chs):
    if c == 0 and sum(len(p.split()) for p in chs[c]) < 200: continue
    title = 'Prooemium' if c == 0 else 'Capitulum %s' % roman(c)
    cid = 'prooemium' if c == 0 else 'c%02d' % c
    files['la'][cid] = '# %s\n\n' % title + '\n\n'.join(chs[c])
    toc.append((cid, {'la': title})); total += sum(len(p.split()) for p in chs[c])
print(total, len(log), [(c, sum(len(p.split()) for p in v)) for c, v in sorted(chs.items())])
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], w['names'],
     {'la': w['d_la'] + ' Textus ex editione Quaracchi (Opera omnia %s, %d)' % TOM + ', ex scanno OCR, sine notis criticis.', 'en-US': w['d_en'] + ' The Latin is the Quaracchi edition (Opera omnia %s, %d)' % TOM + ' from an OCR scan, without the editors’ critical notes.', 'pt-BR': w['names']['pt-BR'] + '.'},
     w['composed'], 'bonaventure/' + w['slug'], ['la'], {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': TOM[1]}},
     [src('la', 'https://archive.org/details/doctorisseraphic%sbona' % w['vol'], 'S. Bonaventurae Opera omnia, tom. %s (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, %d), pp. %s.' % (TOM + (w['pp'],)),
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes (variant readings, cross-references) and small-type notes are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain. Chapters are cut at the page whose running head names them.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of %d is public domain.' % TOM[1])],
     toc, files)
