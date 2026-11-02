"""Pohl III (1904): Alphabetum monachi and Orationes de passione Domini et beata virgine et aliis sanctis (Latin only)."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kempis_common import clean, mend, fix
import kempis_fix as kf
import bookjson
from kempis_pair import ROOT, AU, md
from kempis_pieces import piece

F = 'research/sourcing/kempis/pohl/operaomnia0002thom.txt'
L = open(F, errors='replace').read().split('\n')
ED = {'la': {'editor': 'Michael Joseph Pohl', 'year': 1904}}


def src(w, extra):
    return [{'language': 'la', 'url': 'https://archive.org/details/operaomnia0002thom', 'edition': f'Thomae Hemerken a Kempis {w}, ed. M. J. Pohl (Freiburg: Herder 1904), Opera omnia III; archive.org raw OCR.',
             'description': extra + ' Line numbers, running heads and page breaks stripped by script; Pohl\'s critical apparatus and introduction not imported. Raw OCR: drop capitals garbled and some slips remain after the scripted lexicon repair.', 'tier': 'A', 'tierEvidence': 'Pohl 1904; Thomas died in 1471.'}]


def finish(d, book):
    bookjson.write(d, book)
    os.makedirs(d + '/sources/la-originals', exist_ok=True)
    os.system(f"cp '{F}' '{d}/sources/la-originals/'")


# --- Alphabetum monachi
d = ROOT + 'alphabetum-monachi'
os.makedirs(d + '/la', exist_ok=True)
ps = piece(F, 13306, 13560, re.compile(r'ALPHABETVM MONACHI'))
txt = ' '.join(ps)
txt = re.sub(r'^.*?\bI\. (?=Ama nesciri)', 'I. ', txt)
txt = re.sub(r' (?:io|woro|is) (?=\w)', ' ', txt).replace('III. Dilige', 'IV. Dilige')
rules = re.split(r'(?<=[.;:?!])\s+(?=[IVXL]+\.\s+[A-Z])', txt)
head, rules = rules[0], rules[1:] if rules[0].startswith('I.') is False else rules
body = ([head] if not head.startswith('I.') else []) + rules
open(d + '/la/alphabetum.md', 'w').write(md('Parvum alphabetum monachi in schola Dei', body))
finish(d, {'id': 'kempis-alphabetum-monachi', 'cover': 'classic', 'name': {'la': 'Parvum alphabetum monachi in schola Dei', 'en-US': 'The Little Alphabet of the Monk in the School of God', 'pt-BR': 'O pequeno alfabeto do monge na escola de Deus'}, 'author': AU,
  'description': {'la': 'Parvum alphabetum monachi in schola Dei: dialogus inter discipulum et magistrum, regulae vitae spiritualis secundum ordinem litterarum, cum benedictione.',
    'en-US': 'A short dialogue between disciple and master: the rules of the spiritual life set out in alphabetical order, love of obscurity, kindness, guarding the heart, solitude, poverty, and the blessing at the end. Latin only: Pohl\'s critical edition (Freiburg 1904), from a raw OCR of the printed volume; no public-domain English translation has been found.',
    'pt-BR': 'Breve diálogo entre discípulo e mestre: as regras da vida espiritual em ordem alfabética, o amor da obscuridade, a benevolência, a guarda do coração, a solidão, a pobreza, e a bênção final.'},
  'composed': 'c. 1425-1440', 'languages': ['la'], 'work': 'thomas-a-kempis/alphabetum-monachi', 'editions': ED, 'sources': src('Parvum alphabetum monachi', 'One chapter; the rules are set as separate paragraphs.'),
  'toc': [{'id': 'alphabetum', 'title': {'la': 'Parvum alphabetum monachi in schola Dei'}}]})
print('alphabetum', len(' '.join(body).split()), len(body))

# --- Orationes
STARTS = [13914, 14176, 14318, 14377, 14697, 14790, 14838, 14933, 15080, 15240, 15404, 15620, 15859, 15929, 16424, 16630]
END = 16718
GROUPS = {0: 'Orationes de passione Domini', 6: 'Orationes de beata virgine', 10: 'Orationes de aliis sanctis'}
d = ROOT + 'orationes-de-passione'
os.makedirs(d + '/la', exist_ok=True)
toc, words, cur = [], 0, None
for n, a in enumerate(STARTS):
    b = STARTS[n + 1] - 3 if n + 1 < len(STARTS) else END
    j = a
    tl = []
    while j < b and L[j].strip() and len(tl) < 4:
        tl.append(re.sub(r'\s+', ' ', re.sub(r'\s+\d+$', '', L[j].strip())))
        j += 1
    title = ' '.join(tl)
    title = re.sub(r'^[^A-Za-z]+', '', title)
    title = re.sub(r'(\w)- (\w)', r'\1\2', title).rstrip(' .')
    body = piece(F, j, b, re.compile(r'ORATIO'))
    cid = f'o{n + 1:02d}'
    t = f'{n + 1}. {title}'
    open(f'{d}/la/{cid}.md', 'w').write(md(t, body))
    words += len(' '.join(body).split())
    node = {'id': cid, 'title': {'la': t}}
    if n in GROUPS:
        cur = {'id': f'g{len(toc) + 1}', 'title': {'la': GROUPS[n]}, 'children': []}
        toc.append(cur)
    cur['children'].append(node)
finish(d, {'id': 'kempis-orationes-de-passione', 'cover': 'classic', 'name': {'la': 'Orationes de passione Domini et beata virgine et aliis sanctis', 'en-US': 'Prayers on the Passion of the Lord, the Blessed Virgin and Other Saints', 'pt-BR': 'Orações sobre a Paixão do Senhor, a Virgem Santíssima e outros santos'}, 'author': AU,
  'description': {'la': 'Orationes Thomae a Kempis de passione Domini, de beata virgine Maria et de aliis sanctis (Ioanne Baptista et Evangelista, Thoma apostolo, Maria Magdalena, Agnete), in quibus gratias agit, compatitur et suffragia petit.',
    'en-US': 'Sixteen prayers: on the Passion of the Lord (to the Father at Mass, of remembrance and imitation, of compassion, to Christ, of thanksgiving), to the Blessed Virgin (love and praise, help at the hour of death, special consolation, in tribulation), and to other saints (John the Baptist, John the Evangelist, Thomas the Apostle, Mary Magdalene, Agnes). Latin only: Pohl\'s edition (Freiburg 1904), from a raw OCR of the printed volume; no public-domain English translation has been found.',
    'pt-BR': 'Dezesseis orações: sobre a Paixão do Senhor, à Virgem Santíssima (amor e louvor, auxílio na hora da morte, consolação, nas tribulações) e a outros santos (João Batista, João Evangelista, Tomé apóstolo, Maria Madalena, Inês).'},
  'composed': 'c. 1425-1450', 'languages': ['la'], 'work': 'thomas-a-kempis/orationes-de-passione', 'editions': ED, 'sources': src('Orationes de passione Domini et beata virgine et aliis sanctis', 'The prayers as Pohl numbers them, in three groups.'),
  'toc': toc})
print('orationes', words)
t = open(d + '/la/o06.md').read()
t = t.replace('DA Ratias itaque nunc refero tibi, beatuS) nignissime', 'Gratias itaque nunc refero tibi, benignissime')
t = t.replace('# 6. \n', '# 6. Gratiarum actio\n') if '# 6. \n' in t else t
open(d + '/la/o06.md', 'w').write(t)
