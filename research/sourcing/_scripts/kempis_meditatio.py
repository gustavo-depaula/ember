import os, sys
sys.path.insert(0, 'research/sourcing/_scripts')
import kempis_p3 as p
from kempis_pair import ROOT, AU, md
import bookjson
LL = open(p.LF, errors='replace').read().split('\n')
EL = open(p.EF, errors='replace').read().split('\n')
CH = [('testimonia-veteris', 'Testimonia Veteris Testamenti', 'Testimonies from the Old Testament', (529, 1707), (987, 1968)),
      ('testimonia-novi', 'Testimonia Novi Testamenti', 'Testimonies from the New Testament', (1713, 2603), (1972, 2778)),
      ('oratio-salutandi', 'Oratio ad salutandum Dominum nostrum Iesum Christum', 'A Prayer to Greet Our Lord Jesus Christ', (2606, 2693), (2782, 2836)),
      ('oratio-lucis', 'Oratio ad Christum, qui est vera lux, via, veritas et vita', 'A Prayer to Christ, Who Is the True Light, Way, Truth and Life', (2695, 2776), (2839, 2912))]
d = ROOT + 'meditatio-de-incarnatione'
for lg in ('la', 'en-US'):
    os.makedirs(f'{d}/{lg}', exist_ok=True)
toc, wc = [], {'la': 0, 'en-US': 0}
for n, (cid, tl, te, (la, lb), (ea, eb)) in enumerate(CH, 1):
    pl = p.la_chap(LL, la, lb)
    pe = p.en_chap(EL, ea - 1, eb)
    open(f'{d}/la/{cid}.md', 'w').write(md(f'{n}. {tl}', pl))
    open(f'{d}/en-US/{cid}.md', 'w').write(md(f'{n}. {te}', pe))
    wc['la'] += len(' '.join(pl).split()); wc['en-US'] += len(' '.join(pe).split())
    toc.append({'id': cid, 'title': {'la': f'{n}. {tl}', 'en-US': f'{n}. {te}'}})
print(wc)
book = {'id': 'kempis-meditatio-de-incarnatione', 'cover': 'classic',
  'name': {'la': 'Meditatio de incarnatione Christi', 'en-US': 'A Meditation on the Incarnation of Christ', 'pt-BR': 'Meditação sobre a Encarnação de Cristo'}, 'author': AU,
  'description': {'la': 'Meditatio de incarnatione Christi secundum testimonia sanctarum scripturarum veteris et novi Testamenti, cum duabus orationibus. Textus ex editione Pohl (1904), cum versione Anglica V. Scully (1907).',
    'en-US': 'A meditation on the Incarnation drawn from the testimonies of the Old and New Testaments, followed by two prayers (a salutation of Our Lord Jesus Christ, and a prayer to Christ the true light, way, truth and life). The Latin is Pohl\'s critical edition (Freiburg 1904), from a raw OCR of the printed volume; the English is Vincent Scully\'s 1907 translation.',
    'pt-BR': 'Meditação sobre a Encarnação a partir dos testemunhos do Antigo e do Novo Testamento, seguida de duas orações: uma saudação a Nosso Senhor Jesus Cristo e uma oração a Cristo, luz verdadeira, caminho, verdade e vida.'},
  'composed': 'c. 1430-1450', 'languages': ['la', 'en-US'], 'work': 'thomas-a-kempis/meditatio-de-incarnatione',
  'editions': {'la': {'editor': 'Michael Joseph Pohl', 'year': 1904}, 'en-US': {'translator': 'Vincent Scully', 'year': 1907}},
  'sources': [{'language': 'la', 'url': 'https://archive.org/details/operaomnia0002thom', 'edition': 'Thomae Hemerken a Kempis Meditatio de incarnatione Christi, ed. M. J. Pohl (Freiburg: Herder 1904), Opera omnia III, pp. 1-47; archive.org raw OCR.',
     'description': 'The Meditation in two chapters (Old and New Testament) and the two prayers. Line numbers, running heads and page breaks stripped by script; Pohl\'s critical apparatus not imported. Raw OCR: drop capitals garbled, slips remain after the scripted repair.', 'tier': 'A', 'tierEvidence': 'Pohl 1904; Thomas died in 1471.'},
    {'language': 'en-US', 'url': 'https://archive.org/details/meditationincarn00thomuoft', 'edition': 'A Meditation on the Incarnation of Christ, tr. Vincent Scully (London: Kegan Paul 1907); archive.org OCR.',
     'description': 'Same four divisions as the Latin. Running heads and page numbers stripped by script; margin scripture references removed where they interrupt a sentence; the translator\'s introduction and footnotes not imported. Raw OCR.', 'tier': 'A', 'tierEvidence': 'Published 1907; translator Vincent Scully.'}],
  'toc': toc}
bookjson.write(d, book)
for lg, f in (('la', p.LF), ('en-US', p.EF)):
    os.makedirs(f'{d}/sources/{lg}-originals', exist_ok=True)
    os.system(f"cp '{f}' '{d}/sources/{lg}-originals/'")
for f, old, new in [('la/testimonia-veteris', 'Ww gy Crutamini', 'Scrutamini'), ('la/testimonia-veteris', 'Domines SS Iesu', 'Domine Iesu'),
                    ('en-US/testimonia-veteris', 'Earch the Scriptures," saith the John, 5.i39. Lord.', '"Search the Scriptures," saith the Lord.')]:
    t = open(f'{d}/{f}.md').read()
    assert old in t, old
    open(f'{d}/{f}.md', 'w').write(t.replace(old, new, 1))
