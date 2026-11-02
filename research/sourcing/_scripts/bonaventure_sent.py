"""Commentaria in IV libros Sententiarum (Quaracchi I-IV, djvu.xml). usage: python3 -I bonaventure_sent.py 1|2|3|4 [dry]
One chapter per distinction; a distinction opens at the top of the first page whose running head ("DIST. X") names it."""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

LIB = {'1': dict(files=['11', '12'], tom='I', year=1882, nd=48, pp='1-'),
       '2': dict(files=['02'], tom='II', year=1885, nd=44, pp='1-'),
       '3': dict(files=['03'], tom='III', year=1887, nd=40, pp='1-'),
       '4': dict(files=['04'], tom='IV', year=1889, nd=50, pp='1-')}
w = LIB[sys.argv[1]]
RH = re.compile(r'D[I1l]ST\W{0,3}\s*([IVXLlUHf1JT\[\]]{1,7})\b')
RV = {roman(i): i for i in range(1, 60)}
cur = 0; chs = {}; log = []; fx = lambda t: F.clean(t, fix_ocr, log)
for fi, fid in enumerate(w['files']):
    P = F.load_pages('research/sourcing/bonaventure/xml/v%s.xml' % fid)
    pagech = {}
    for n, pg in enumerate(P, 1):
        top = sorted([ws for ws in pg['lines'] if ws[0][3] < 420 * pg['h'] / 3398], key=lambda x: x[0][3])
        t = ' '.join(' '.join(x[4] for x in ws) for ws in top[:3]).upper()
        m = RH.search(t)
        raw = m.group(1).replace('[', 'I').replace(']', 'I').replace('l', 'I').replace('1', 'I').upper() if m else ''
        r = RV.get(raw, 0) if cur <= RV.get(raw, 0) <= cur + 2 and RV.get(raw, 0) else (RV.get(F.head_roman('C. ' + raw) or '', 0) if m else 0)
        if r and (cur <= r <= cur + 2 or (cur == 0 and r <= 3) or (fi > 0 and not pagech and r > cur and r <= cur + 4)):
            pagech[n] = r; cur = r
        elif pagech: pagech[n] = None   # inherit
    first, last = min(pagech), max(k for k, v in pagech.items() if v)
    # carry the number forward over pages without a head
    last_seen = None; num = {}
    for n in range(first, last + 1):
        if pagech.get(n): last_seen = pagech[n]
        num[n] = last_seen
    ps = F.paragraphs(F.stream(P, first, last))
    ch = None
    for it in ps:
        if it[0] == 'G': ch = num[it[1]]; continue
        if it[0] != 'P' or not ch: continue
        p = fx(it[1])
        if len(p.split()) >= 2: chs.setdefault(ch, []).append(p)
files = {'la': {}}; toc = []; total = 0
for c in sorted(chs):
    title = 'Distinctio %s' % roman(c)
    files['la']['d%02d' % c] = '# %s\n\n' % title + '\n\n'.join(chs[c])
    toc.append(('d%02d' % c, {'la': title})); total += sum(len(p.split()) for p in chs[c])
print(total, len(log), len(chs), [(c, sum(len(p.split()) for p in v)) for c, v in sorted(chs.items())])
if len(sys.argv) > 2: sys.exit()
n = sys.argv[1]; ro = {'1': 'I', '2': 'II', '3': 'III', '4': 'IV'}[n]; tit = {'1': 'primum', '2': 'secundum', '3': 'tertium', '4': 'quartum'}[n]
ordn = {'1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth'}[n]; pt = {'1': 'Primeiro', '2': 'Segundo', '3': 'Terceiro', '4': 'Quarto'}[n]
emit('commentaria-in-sententias-%s' % n, 'bonaventure-commentaria-in-sententias-%s' % n,
     {'la': 'Commentaria in librum %s Sententiarum' % tit, 'en-US': 'Commentary on the %s Book of the Sentences' % ordn, 'pt-BR': 'Comentário ao %s Livro das Sentenças' % pt},
     {'la': 'Commentaria in librum %s Sententiarum Petri Lombardi, per distinctiones (articulos et quaestiones). Textus ex editione Quaracchi (Opera omnia %s, %d), ex scanno OCR, sine notis criticis, sine scholiis.' % (tit, w['tom'], w['year']),
      'en-US': 'Bonaventure’s commentary on the %s Book of Peter Lombard’s Sentences, by distinction, article and question. The Latin is the Quaracchi edition (Opera omnia %s, %d) from an OCR scan, without the editors’ critical notes and scholia.' % (ordn, w['tom'], w['year']),
      'pt-BR': 'Comentário de Boaventura ao %s Livro das Sentenças de Pedro Lombardo.' % pt},
     'c. 1250-1252', 'bonaventure/commentaria-in-sententias-%s' % n, ['la'], {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': w['year']}},
     [src('la', 'https://archive.org/details/doctorisseraphic%sbona' % w['files'][0], 'S. Bonaventurae Opera omnia, tom. %s (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, %d).' % (w['tom'], w['year']),
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes, scholia (small type) and the Prolegomena are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain. Distinctions are cut at the page whose running head names them.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of %d is public domain.' % w['year'])],
     toc, files)
