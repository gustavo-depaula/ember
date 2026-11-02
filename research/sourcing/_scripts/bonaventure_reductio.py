import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

L = open('research/sourcing/bonaventure/la/ws-De_reductione_artium_ad_theologiam.txt').read().split('\n')
paras = []; n = None; first = None
for l in L[2:]:
    s = l.strip()
    if not s or s == 'Explicit' or s.startswith('EPUB'): continue
    m = re.fullmatch(r'(\d+)\.', s)
    if m: n = m.group(1); first = True; continue
    if first is None: continue
    paras.append(('%s. ' % n if first else '') + s); first = False
la = '# De reductione artium ad theologiam\n\n' + '\n\n'.join(paras)
E = open('research/sourcing/bonaventure/en/worksofsaintbona01bona.txt', errors='replace').read().split('\n')
ps = numbered_en(E[700:1830])
assert [p[0] for p in ps] == list(range(1, 27)), [p[0] for p in ps]
en = '# On the Reduction of the Arts to Theology\n\n' + '\n\n'.join('%d. %s' % (k, re.sub(r'[®§]', '', t)) for k, t in ps)
names = {'la': 'De reductione artium ad theologiam', 'en-US': 'On the Reduction of the Arts to Theology', 'pt-BR': 'Sobre a redução das artes à teologia'}
descr = {'la': 'Libellus de sex luminibus (artis mechanicae, cognitionis sensitivae, philosophicae, gratiae et sacrae Scripturae), qui omnes cognitiones ad sacram Scripturam reducit. Textus ex editione Quaracchi, ut in Vicifontibus.',
         'en-US': 'A short treatise on the four lights that come down from the Father of lights (the mechanical arts, sense knowledge, philosophy and Scripture) and how every kind of knowledge is led back to sacred theology. The Latin is the Quaracchi text as on Wikisource; the English is Sister Emma Thérèse Healy’s 1940 translation from the facing-page edition of the Franciscan Institute, without her introduction and commentary.',
         'pt-BR': 'Breve tratado sobre as luzes que descem do Pai das luzes (as artes mecânicas, o conhecimento sensível, a filosofia e a Escritura) e sobre como todo saber é reconduzido à sagrada teologia.'}
s = [src('la', 'https://la.wikisource.org/wiki/De_reductione_artium_ad_theologiam', 'De reductione artium ad theologiam (Opera omnia V, Quaracchi 1891), la.wikisource transcription (edition not stated).', 'The complete text in 26 numbered sections; the section numbers are kept.', 'A', 'Bonaventure died in 1274.'),
     src('en-US', 'https://archive.org/details/worksofsaintbona01bona', 'Saint Bonaventure’s De reductione artium ad theologiam, a commentary with an introduction and translation by Sister Emma Thérèse Healy (Works of St. Bonaventure I; St. Bonaventure, N.Y., 1940; 2nd ed. 1955).', 'Only the English of the facing-page text is imported; the introduction, commentary and the Latin are left out.', 'B', 'Archive.org records “Copyright review: Public domain according to HathiTrust rights database” (not renewed).')]
emit('de-reductione-artium', 'bonaventure-de-reductione-artium', names, descr, 'c. 1255', 'bonaventure/de-reductione-artium', ['la', 'en-US'],
     {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi), via Wikisource', 'year': 1891}, 'en-US': {'translator': 'Sister Emma Thérèse Healy', 'year': 1940}}, s,
     [('textus', {'la': 'De reductione artium ad theologiam', 'en-US': 'On the Reduction of the Arts to Theology'})], {'la': {'textus': la}, 'en-US': {'textus': en}})
print(len(la.split()), len(en.split()))
