"""Franciscan opuscula of Quaracchi VIII (djvu.xml). usage: python3 -I bonaventure_opusc.py KEY [dry]"""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

CAP = r'(?i)^c[a-z.\\]{0,3}p[a-z.\\]{0,3}[tl]u[a-z.\\]{0,5}\s+[IVXLlUn1]+'
def W(slug, pages, la, en, pt, descr_la, descr_en, composed, pp, label='Capitulum', chap=CAP, toc=None, skip=None, pt_descr=None, edition='Opuscula ad Ordinem spectantia'):
    return dict(slug=slug, pages=pages, names={'la': la, 'en-US': en, 'pt-BR': pt}, descr={'la': descr_la + ' Textus ex editione Quaracchi (Opera omnia VIII, 1898), ex scanno OCR, sine notis criticis.',
        'en-US': descr_en + ' The Latin is the Quaracchi edition (Opera omnia VIII, 1898) from an OCR scan, without the editors’ critical notes.', 'pt-BR': pt_descr or pt + '.'},
        composed=composed, pp=pp, label=label, chap=chap, toc=toc, skip=skip)
WORKS = {
 'apologia': W('apologia-pauperum', (365, 462), 'Apologia pauperum', 'Defence of the Poor', 'Apologia dos pobres',
    'Apologia pauperum contra calumniatorem (Gerardum de Abbatisvilla), in duodecim capitulis, de perfectione evangelica et paupertate Ordinis.',
    'The Apologia pauperum, in twelve chapters, Bonaventure’s reply to Gerard of Abbeville on evangelical perfection and the poverty of the Friars Minor.',
    'c. 1269', '233-330', toc=r'^CAPITULA'),
}
w = WORKS[sys.argv[1]]
P = F.load_pages('research/sourcing/bonaventure/xml/v08.xml')
ps = F.paragraphs(F.stream(P, *w['pages']))
log = []; fx = lambda t: F.clean(t, fix_ocr, log)
chs = [['prologus', 'Prologus' if w['chap'] else w['names']['la'], []]]; n = 0; skipping = False
for k, t in ps:
    if k == 'H' and w['toc'] and re.match(w['toc'], t): skipping = True; continue
    if k == 'H' and w['chap'] and re.match(w['chap'], t) and F.head_roman(t) == roman(n + 1):
        n += 1; skipping = False; chs.append(['c%02d' % n, '%s %s' % (w['label'], roman(n)), []]); continue
    if k != 'P' or skipping: continue
    p = fx(t)
    if len(p.split()) >= 2: chs[-1][2].append(p)
chs = [c for c in chs if c[2]]
files = {'la': {}}; toc = []; total = 0
for cid, title, body in chs:
    files['la'][cid] = '# %s\n\n' % title + '\n\n'.join(body)
    toc.append((cid, {'la': title})); total += sum(len(p.split()) for p in body)
print(total, len(log), [(c[0], sum(len(p.split()) for p in c[2])) for c in chs])
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], w['names'], w['descr'], w['composed'], 'bonaventure/' + w['slug'], ['la'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1898}},
     [src('la', 'https://archive.org/details/doctorisseraphic08bona', 'S. Bonaventurae Opera omnia, tom. VIII (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1898), pp. %s.' % w['pp'],
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes (variant readings, cross-references) and small-type scholia are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1898 is public domain.')],
     toc, files)
