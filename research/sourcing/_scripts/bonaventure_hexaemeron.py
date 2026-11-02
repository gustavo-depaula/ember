"""Collationes in Hexaemeron from Quaracchi V (djvu.xml). usage: python3 -I bonaventure_hexaemeron.py [dry]"""
import sys, re
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

P = F.load_pages('research/sourcing/bonaventure/xml/v05.xml')
d = F.split_numbered(F.paragraphs(F.stream(P, 405, 525)))
log = []
files = {'la': {}}; toc = []; total = 0
for n in sorted(d):
    paras = [F.clean(t, fix_ocr, log) for k, t in d[n] if k == 'P']
    paras = [p for p in paras if len(p.split()) >= 2]
    title = 'Collatio %s' % roman(n)
    files['la']['c%02d' % n] = '# %s\n\n' % title + '\n\n'.join(paras)
    toc.append(('c%02d' % n, {'la': title})); total += sum(len(p.split()) for p in paras)
print(total, len(log))
if len(sys.argv) > 1: sys.exit()
emit('collationes-in-hexaemeron', 'bonaventure-collationes-in-hexaemeron',
     {'la': 'Collationes in Hexaemeron', 'en-US': 'Collations on the Six Days', 'pt-BR': 'Colações sobre o Hexâmeron'},
     {'la': 'Collationes in Hexaemeron, quas Parisiis anno 1273 habuit Bonaventura, unde de lumine fidei per sex visiones intellectus ad sapientiam ascendit. Textus ex editione Quaracchi (Opera omnia V, 1891), ex scanno OCR, sine notis criticis.',
      'en-US': 'The Collations on the Hexaemeron, Bonaventure’s unfinished Paris lectures of 1273 on the six days of creation, which lead the intellect through six visions toward wisdom. The text is the Quaracchi edition (Opera omnia V, 1891) from an OCR scan, without the editors’ critical notes.',
      'pt-BR': 'As Colações sobre o Hexâmeron, conferências inacabadas de Boaventura em Paris (1273) sobre os seis dias da criação.'},
     '1273', 'bonaventure/collationes-in-hexaemeron', ['la'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1891}},
     [src('la', 'https://archive.org/details/doctorisseraphic05bona', 'S. Bonaventurae Opera omnia, tom. V (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1891), pp. 327-449.',
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ Summarium and footnotes (variant readings, cross-references) are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1891 is public domain.')],
     toc, files)
