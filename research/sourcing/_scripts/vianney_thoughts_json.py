import re, sys, os, glob, shutil
sys.path.insert(0, os.path.dirname(__file__))
from ocr_clean import *
from bookjson import *
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/cure-of-ars/raw/'
R = '/Users/gustavo/Documents/prayer/content/books/cure-of-ars-opera-omnia/'
A = {'fr-FR': 'Saint Jean-Marie Vianney, curé d’Ars', 'en-US': 'St. John Vianney, the Curé of Ars', 'pt-BR': 'São João Maria Vianney, o Cura d’Ars'}
AE = {k: v for k, v in A.items() if k != 'fr-FR'}
# ---- thoughts
T = [l for l in open(RAW + 'en-thoughts1896.txt', encoding='utf8').read().split('\n')]
head = lambda t: bool(re.search(r'THOUGHTS\s+O[FH]\s+THE\s+CU', t)) or bool(re.fullmatch(r'[\d\s.,Il|]{1,6}', t.strip()))
names = ['Salvation','Love for God','The Pure Soul','The Holy Spirit','The Blessed Virgin','Prayer','The Priest','The Eucharist','Sin','Hell','Suffering','Hope and Heaven']
st = [127, 176, 252, 336, 462, 510, 618, 699, 871, 974, 1074, 1200, 1340]
d = R + 'thoughts/en-US/'; os.makedirs(d, exist_ok=True)
tot = 0
for k, n in enumerate(names):
    paras, notes = clean(T[st[k] + 2:st[k + 1] - 1] if k < 11 else T[st[k] + 2:1340], [head], 'sym')
    paras = [re.sub(r'\s+', ' ', p) for p in paras if len(p) > 2 and re.sub(r'\W+', '', p).lower() != re.sub(r'\W+', '', n).lower() and not re.fullmatch(r'[IVXivx]{1,5}\.?', p)]
    txt = render(n, paras, notes); open(d + 'th-%02d.md' % (k + 1), 'w').write(txt); tot += len(txt.split())
print('thoughts', tot)
paras, _ = clean(T[40:98], [head], 'sym')
open(d + 'preface.md', 'w').write(render('Editor’s Preface', [re.sub(r'\s+', ' ', p) for p in paras], {}))
def toc(slug, groups):
    out = []
    for gid, gtitle, pat in groups:
        ch = sorted(glob.glob(R + slug + '/en-US/' + pat))
        kids = [{'id': os.path.basename(f)[:-3], 'title': {'en-US': open(f, encoding='utf8').readline()[2:].strip()}} for f in ch]
        if gid is None: out += kids
        else: out.append({'id': gid, 'title': {'en-US': gtitle}, 'children': kids})
    return out
ED = {'en-US': {'translator': 'J. E. Bowden', 'year': 1865}}
src_sp = [{'language': 'en-US', 'url': 'https://archive.org/details/TheSpiritOfTheCureOfArs', 'edition': 'The Spirit of the Curé of Ars, translated from the French (L’Esprit du Curé d’Ars, Monnin, Douniol 1864), edited by J. E. Bowden, London, Burns, Lambert and Oates, 1865 (Google scan, OCR; cross-checks archive.org/details/spiritcurarsstj00monngoog)', 'description': 'Preface, the editor’s introductions, Parts II and III, and catechism XV and exhortation XIV in the OCR text.', 'tier': 'A'},
          {'language': 'en-US', 'url': 'https://www.ewtn.com/catholicism/library/instructions-on-the-catechism-1273', 'edition': 'EWTN, Instructions on the Catechism (the same Bowden translation, clean HTML)', 'description': 'Used for the introduction of Part I, the twenty catechisms and sixteen of the seventeen exhortations, in place of the OCR. The French original (Monnin, 1864) is not online, so this book is English only.', 'tier': 'A'}]
write(R + 'esprit', {'id': 'vianney-esprit-bowden', 'name': {'en-US': 'The Spirit of the Curé of Ars', 'pt-BR': 'O espírito do Cura d’Ars'}, 'author': AE,
  'description': {'en-US': 'Alfred Monnin’s compilation of the Curé of Ars’s teaching as Bowden translated it in 1865: twenty-one catechisms, five homilies, the Curé in his conversation, and seventeen exhortations.', 'pt-BR': 'A compilação de Alfred Monnin com o ensino do Cura d’Ars, na tradução de Bowden (1865): vinte e um catecismos, cinco homilias, o Cura em sua conversa e dezessete exortações.'},
  'composed': '1864', 'languages': ['en-US'], 'work': 'cure-of-ars/esprit', 'editions': ED, 'sources': src_sp,
  'toc': toc('esprit', [(None, '', 'preface.md'), ('part-1', 'Part I — The Curé of Ars in His Catechisms', 'p1-*.md'), ('part-2', 'Part II — The Curé of Ars in His Homilies', 'p2-*.md'), ('part-3', 'Part III — The Curé of Ars in His Conversation', 'p3-*.md'), ('part-4', 'Part IV — Seventeen Exhortations of the Curé of Ars', 'p4-*.md')])})
write(R + 'thoughts', {'id': 'vianney-thoughts', 'name': {'en-US': 'Thoughts of the Curé of Ars', 'pt-BR': 'Pensamentos do Cura d’Ars'}, 'author': AE,
  'description': {'en-US': 'A twelve-chapter anthology of sayings drawn from Monnin’s Esprit du Curé d’Ars: salvation, the love of God, the pure soul, the Holy Spirit, prayer, the priest, the Eucharist, sin, hell, suffering and heaven.', 'pt-BR': 'Antologia em doze capítulos de ditos do Cura d’Ars tirados do Esprit de Monnin: salvação, amor de Deus, alma pura, Espírito Santo, oração, sacerdote, Eucaristia, pecado, inferno, sofrimento e céu.'},
  'composed': '1864', 'languages': ['en-US'], 'work': 'cure-of-ars/thoughts', 'editions': {'en-US': {'translator': 'Flynn and Mahony (Boston)', 'year': 1896}},
  'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/thoughtsofcurofa00vian', 'edition': 'Thoughts of the Curé of Ars, Boston, Flynn & Mahony, 1896 (OCR; preface signed A. Mennin [Monnin])', 'description': 'Anthology of sayings taken from the Esprit du Curé d’Ars; the translator is not named.', 'tier': 'A'}],
  'toc': toc('thoughts', [(None, '', 'preface.md'), (None, '', 'th-*.md')])})
for slug, f, label, name in (('esprit', 'en-spirit1865.txt', 'english-translations', 'esprit'), ('esprit', 'ewtn.txt', 'english-translations', 'esprit-ewtn'), ('thoughts', 'en-thoughts1896.txt', 'english-translations', 'thoughts')):
    os.makedirs(R + slug + '/sources/' + label, exist_ok=True); shutil.copy(RAW + f, R + slug + '/sources/' + label + '/' + name + '.txt')
