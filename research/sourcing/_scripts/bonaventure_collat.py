"""Collationes de septem donis / de decem praeceptis from Quaracchi V (djvu.xml). usage: python3 -I bonaventure_collat.py donis|praecepta [dry]"""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

W = {'donis': dict(pages=(533, 580), slug='collationes-de-septem-donis', n=9,
        names={'la': 'Collationes de septem donis Spiritus Sancti', 'en-US': 'Collations on the Seven Gifts of the Holy Spirit', 'pt-BR': 'Colações sobre os sete dons do Espírito Santo'},
        descr={'la': 'Novem collationes de donis Spiritus Sancti, Parisiis anno 1268 habitae: de gratia, de virtutibus et donis, et de gradibus ascensus ad sapientiam. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
               'en-US': 'Nine collations on the gifts of the Holy Spirit, preached at Paris in 1268: grace, the virtues and the gifts, and the steps by which the soul rises to wisdom. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
               'pt-BR': 'Nove colações sobre os dons do Espírito Santo, pregadas em Paris em 1268.'},
        composed='1268', pp='455-503'),
     'praecepta': dict(pages=(583, 608), slug='collationes-de-decem-praeceptis', n=7,
        names={'la': 'Collationes de decem praeceptis', 'en-US': 'Collations on the Ten Commandments', 'pt-BR': 'Colações sobre os dez mandamentos'},
        descr={'la': 'Septem collationes de decem praeceptis Decalogi, Parisiis anno 1267 habitae. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
               'en-US': 'Seven collations on the Ten Commandments, preached at Paris in Lent 1267. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
               'pt-BR': 'Sete colações sobre os dez mandamentos, pregadas em Paris na Quaresma de 1267.'},
        composed='1267', pp='505-532')}
w = W[sys.argv[1]]
P = F.load_pages('research/sourcing/bonaventure/xml/v05.xml')
d = F.split_numbered(F.paragraphs(F.stream(P, *w['pages'])))
assert sorted(d) == list(range(1, w['n'] + 1)), sorted(d)
log = []; files = {'la': {}}; toc = []; total = 0
for n in sorted(d):
    paras = [F.clean(t, fix_ocr, log) for k, t in d[n] if k == 'P']
    paras = [p for p in paras if len(p.split()) >= 2]
    k = next((i for i, p in enumerate(paras[:5]) if re.match(r'^1\s?[.,]', p)), 0)
    paras = paras[k:]   # title lines that stand above the first numbered paragraph
    title = 'Collatio %s' % roman(n)
    files['la']['c%02d' % n] = '# %s\n\n' % title + '\n\n'.join(paras)
    toc.append(('c%02d' % n, {'la': title})); total += sum(len(p.split()) for p in paras)
print(total, len(log))
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], w['names'], w['descr'], w['composed'], 'bonaventure/' + w['slug'], ['la'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1891}},
     [src('la', 'https://archive.org/details/doctorisseraphic05bona', 'S. Bonaventurae Opera omnia, tom. V (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1891), pp. %s.' % w['pp'],
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ Summarium and footnotes (variant readings, cross-references) are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1891 is public domain.')],
     toc, files)
