"""Quaestiones disputatae from Quaracchi V (djvu.xml). usage: python3 -I bonaventure_quaestiones.py scientia|trinitatis|perfectio [dry]"""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

QH = re.compile(r'^(?:Q[UVAIL]{1,3}[AEB]ST[IL1][O0U]\b|ART[IL1]CULUS\b)', re.I)
QS = re.compile(r'^Q[UVAIL]{1,3}[AEB]ST[IL1][O0U]\s+[IiVXLlJT1]{1,6}[.,]?\s*$')
AR = re.compile(r'^ART[IL1]CULUS\b[^a-z]{0,12}$')
RUN = re.compile(r'(?i)disput|quaest\b|quaest\.|quaestiones|evang|mysterio|scienti')
W = {'scientia': dict(pages=(79, 120), slug='quaestiones-disputatae-de-scientia-christi', n=7,
        names={'la': 'Quaestiones disputatae de scientia Christi', 'en-US': 'Disputed Questions on the Knowledge of Christ', 'pt-BR': 'Questões disputadas sobre a ciência de Cristo'},
        descr={'la': 'Septem quaestiones disputatae de scientia Christi, ubi de scientia divina, de ideis, de cognitione Christi secundum naturam humanam. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
               'en-US': 'Seven disputed questions on the knowledge of Christ: the divine knowledge of infinite things, the ideas, certitude and wisdom, and what the soul of Christ knew. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
               'pt-BR': 'Sete questões disputadas sobre a ciência de Cristo.'}, composed='c. 1254', pp='1-41'),
     'trinitatis': dict(pages=(121, 192), slug='quaestiones-disputatae-de-mysterio-trinitatis', n=8,
        names={'la': 'Quaestiones disputatae de mysterio Trinitatis', 'en-US': 'Disputed Questions on the Mystery of the Trinity', 'pt-BR': 'Questões disputadas sobre o mistério da Trindade'},
        descr={'la': 'Octo quaestiones disputatae de mysterio Trinitatis, in articulos divisae: Deum esse, simplicitatem, infinitatem, aeternitatem, immutabilitatem, necessitatem, primitatem. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
               'en-US': 'Eight disputed questions on the mystery of the Trinity, each in articles: how the existence, simplicity, infinity, eternity, immutability and necessity of God stand with the Trinity of persons. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
               'pt-BR': 'Oito questões disputadas sobre o mistério da Trindade.'}, composed='c. 1254', pp='45-114'),
     'perfectio': dict(pages=(193, 274), slug='quaestiones-disputatae-de-perfectione-evangelica', n=4,
        names={'la': 'Quaestiones disputatae de perfectione evangelica', 'en-US': 'Disputed Questions on Evangelical Perfection', 'pt-BR': 'Questões disputadas sobre a perfeição evangélica'},
        descr={'la': 'Quattuor quaestiones disputatae de perfectione evangelica: de humilitate, paupertate, continentia, oboedientia; contra Gulielmum a S. Amore. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
               'en-US': 'Four disputed questions on evangelical perfection (humility, poverty, chastity, obedience), Bonaventure’s Paris defence of the mendicant life against William of Saint-Amour. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
               'pt-BR': 'Quatro questões disputadas sobre a perfeição evangélica (humildade, pobreza, castidade, obediência).'}, composed='c. 1255-1256', pp='117-198')}
w = W[sys.argv[1]]
P = F.load_pages('research/sourcing/bonaventure/xml/v05.xml')
ps = F.paragraphs(F.stream(P, *w['pages'], heads=QH))
log = []; fx = lambda t: F.clean(t, fix_ocr, log)
chs = {}; cur = None; n = 0; art = 0; pend = None
for i, (k, t) in enumerate(ps):
    if k == 'H' and QS.match(t) and F.head_roman(t) == roman(n + 1):
        n += 1; art = 0; cur = chs.setdefault(n, {'title': '', 'body': []}); pend = ('Q', cur); continue
    if k == 'H' and AR.match(t) and cur is not None:
        art += 1; cur['body'].append('## Articulus %s' % roman(art)); pend = ('A', None); continue
    if k == 'H' and pend and not RUN.search(t) and len(t.split()) >= 2:
        if pend[0] == 'Q': pend[1]['title'] = '' if t[:1].islower() else fx(t)
        else: cur['body'][-1] += '. ' + fx(t).rstrip('.')
        pend = None; continue
    if k != 'P' or cur is None: continue
    p = fx(t)
    if len(p.split()) >= 2: cur['body'].append(p)
assert sorted(chs) == list(range(1, w['n'] + 1)), sorted(chs)
files = {'la': {}}; toc = []; total = 0
for n in sorted(chs):
    c = chs[n]; title = 'Quaestio %s' % roman(n) + ('. ' + c['title'].rstrip('.') if c['title'] else '')
    files['la']['q%02d' % n] = '# %s\n\n' % title + '\n\n'.join(c['body'])
    toc.append(('q%02d' % n, {'la': title})); total += sum(len(p.split()) for p in c['body'] if not p.startswith('##'))
print(total, len(log), [(n, sum(len(p.split()) for p in c['body'])) for n, c in sorted(chs.items())])
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], w['names'], w['descr'], w['composed'], 'bonaventure/' + w['slug'], ['la'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1891}},
     [src('la', 'https://archive.org/details/doctorisseraphic05bona', 'S. Bonaventurae Opera omnia, tom. V (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1891), pp. %s.' % w['pp'],
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes (variant readings, cross-references) and small-type scholia are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1891 is public domain.')],
     toc, files)
