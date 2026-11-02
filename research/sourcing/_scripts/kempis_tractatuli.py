import sys, re, os; sys.path.insert(0, 'research/sourcing/_scripts')
from kempis_pair import build, ROOT, AU, md, title_of
from kempis_common import clean, mend, fix
import kempis_fix as kf
import bookjson
F = 'research/sourcing/kempis/pohl/operaomniaimitat0000thom.txt'
ED = {'la': {'editor': 'Michael Joseph Pohl', 'year': 1904}}
ONLY = sys.argv[1:]
MARK = r'CAPIT\w{0,5}M\s+[IVXL1lI]+'


def src(w, extra=''):
    return [{'language': 'la', 'url': 'https://archive.org/details/operaomniaimitat0000thom', 'edition': 'Thomae Hemerken a Kempis ' + w + ', ed. M. J. Pohl (Freiburg: Herder 1904), Opera omnia II; archive.org raw OCR.',
      'description': extra + 'Pohl\'s text without his critical apparatus and introduction; line numbers, running heads and page breaks stripped by script, upper-case chapter titles recased (u/v normalised by script). Raw OCR: drop capitals at openings are often garbled and some slips remain after the scripted lexicon repair.', 'tier': 'A', 'tierEvidence': 'Pohl 1904; Thomas died in 1471.'}]


def desc(la, en, pt):
    return {'la': la, 'en-US': en + ' Latin only: Pohl\'s critical edition (Freiburg 1904), from a raw OCR of the printed volume; no public-domain English translation has been found.', 'pt-BR': pt}


def chaptered(slug, la, en, pt, dla, den, dpt, w, start, end, toc=None):
    if ONLY and slug not in ONLY:
        return
    build({'id': 'kempis-' + slug, 'slug': slug, 'work': slug, 'name': {'la': la, 'en-US': en, 'pt-BR': pt}, 'description': desc(dla, den, dpt),
           'composed': 'c. 1425-1440', 'editions': ED, 'sources': src(w), 'groups': [{'la': ''}],
           'la': {'file': F, 'start': start, 'end': end, 'marker': MARK, 'title_before': True, 'toc': toc}})


chaptered('de-disciplina-claustralium', 'De disciplina claustralium', 'On Cloister Discipline', 'Da disciplina claustral',
  'Libellus de disciplina claustralium: in quibus consistit disciplina claustralis, silentium, officium divinum, opus manuum, oboedientia, correctio.',
  'Sixteen chapters on the discipline of the cloister: silence, the divine office, manual work, obedience, correction and fidelity to the rule.',
  'Dezesseis capítulos sobre a disciplina do claustro: silêncio, ofício divino, trabalho manual, obediência, correção e fidelidade à regra.',
  'De disciplina claustralium', 11528, 13653, toc=['In quibus consistit disciplina claustralis', 'De diversis temptationibus et insidiis diaboli', 'De vera conversione ad Deum qui est summum bonum', 'De oboedientia humilis subditi erga praelatum suum', 'De custodia cordis et reditu ad interiora', 'De custodia oris et exercitio laboris', 'De recommendatione cellae et solitudinis', 'De choro et divino officio peragendo', 'De discretione in omni spirituali exercitio servanda', 'Oratio de felici consummatione in virtutibus', 'De caritate Dei et proximi et odio vitiorum', 'De abstinentia et castitate', 'De utili exercitio in vita et passione Christi', 'De commemoratione et invocatione beatissimae virginis Mariae', 'De suffragiis sanctorum sedule petendis', 'De desiderio animae ad caeleste regnum'])
chaptered('libellus-spiritualis-exercitii', 'Libellus spiritualis exercitii', 'The Booklet of Spiritual Exercise', 'O livrinho do exercício espiritual',
  'Libellus spiritualis exercitii: de fervida exhortatione ad virtutes, de elevatione et directione mentis ad Deum, et de exercitiis cotidianis.',
  'Twelve chapters on the daily spiritual exercise of the religious: fervour in the virtues, lifting and directing the mind to God, examination, prayer and the preparation for death.',
  'Doze capítulos sobre o exercício espiritual cotidiano do religioso: fervor nas virtudes, elevação da mente a Deus, exame, oração e preparação para a morte.',
  'Libellus spiritualis exercitii', 13938, 14984)
chaptered('de-recognitione-propriae-fragilitatis', 'De recognitione propriae fragilitatis', 'On the Recognition of One\'s Own Frailty', 'Do reconhecimento da própria fragilidade',
  'Libellus de recognitione propriae fragilitatis: cognitio sui, humilitas, vanitas mundi, divina misericordia.',
  'Eight chapters on knowing one\'s own weakness, humility, the vanity of the world and trust in God\'s mercy.',
  'Oito capítulos sobre o conhecimento da própria fraqueza, a humildade, a vaidade do mundo e a confiança na misericórdia de Deus.',
  'De recognitione propriae fragilitatis', 14990, 15668, toc=['De recognitione propriae fragilitatis', 'De contemptu vanae gloriae', 'De fideli et veraci amico', 'De supportatione fraternae infirmitatis', 'De spirituali inopia et subtractione suavitatis internae', 'De humili subiectione et propria resignatione', 'De laude Dei in tribulatione', 'De laude Dei ex devotione'])

PIECES = [
  ('epistula-devota', 'Epistula devota ad quendam regularem', 13660, 13898),
  ('recommendatio-humilitatis', 'Recommendatio humilitatis', 15690, 15905),
  ('de-mortificata-vita', 'De mortificata vita pro Christo', 15910, 16185),
  ('de-bona-pacifica-vita', 'De bona pacifica vita cum Deo et hominibus', 16190, 16264),
  ('de-elevatione-mentis', 'De elevatione mentis ad Deum', 16270, 17080),
  ('brevis-admonitio', 'Brevis admonitio spiritualis exercitii', 17097, 17600),
]
HEAD = re.compile(r'DE MORTIFICATA|BONA PACIFICA|ELEVATIONE MENTIS|RECOMMENDATIO HVM|RECOGNITIONE|EPISTVLA DEVOTA|BREVIS ADMONITIO|HVMILITATIS|^\W*(?:LIBELLVS|EXERCITII)')


def piece(a, b):
    L = open(F, errors='replace').read().split('\n')[a:b]
    L = [l for l in L if not (HEAD.search(l) and sum(c.isupper() for c in l) >= 0.5 * sum(c.isalpha() for c in l))]
    L = kf.repair_open(L, 12)
    return [kf.tidy(kf.fix_ocr(fix(p))) for p in mend(clean(L))]


if not ONLY or 'tractatuli-minores' in ONLY:
    d = ROOT + 'tractatuli-minores'
    os.makedirs(d + '/la', exist_ok=True)
    toc, words = [], 0
    for n, (slug, title, a, b) in enumerate(PIECES, 1):
        body = piece(a, b)
        t = f'{n}. {title}'
        open(f'{d}/la/{slug}.md', 'w').write(md(t, body))
        words += len(' '.join(body).split())
        toc.append({'id': slug, 'title': {'la': t}})
    book = {'id': 'kempis-tractatuli-minores', 'cover': 'classic', 'name': {'la': 'Tractatuli minores', 'en-US': 'Shorter Treatises', 'pt-BR': 'Tratados menores'},
      'author': AU, 'description': desc('Sex tractatuli Thomae a Kempis: epistula devota ad quendam regularem, recommendatio humilitatis, de mortificata vita, de bona pacifica vita, de elevatione mentis, brevis admonitio spiritualis exercitii.',
        'Six short treatises: a devout letter to a religious, the commendation of humility, the mortified life, the good and peaceful life, the lifting of the mind to God, and a brief admonition on spiritual exercise. Each is one chapter.',
        'Seis breves tratados: uma carta devota a um religioso, o elogio da humildade, a vida mortificada, a vida boa e pacífica, a elevação da mente a Deus e uma breve admoestação sobre o exercício espiritual.'),
      'composed': 'c. 1425-1450', 'languages': ['la'], 'work': 'thomas-a-kempis/tractatuli-minores', 'editions': ED,
      'sources': src('Tractatuli', 'Six tractatuli of Pohl vol. II, one chapter each (De disciplina claustralium, the Libellus spiritualis exercitii and De recognitione propriae fragilitatis are separate books). '), 'toc': toc}
    bookjson.write(d, book)
    os.makedirs(d + '/sources/la-originals', exist_ok=True)
    os.system(f"cp '{F}' '{d}/sources/la-originals/'")
    print('tractatuli-minores', words)
