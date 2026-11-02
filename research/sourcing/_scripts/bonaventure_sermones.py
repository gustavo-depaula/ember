"""Sermones (Quaracchi IX, djvu.xml). usage: python3 -I bonaventure_sermones.py tempore|sanctis|maria|diversis [dry]"""
import sys, re, difflib
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *
import bonaventure_folio as F

ORD = ['prima', 'secunda', 'tertia', 'quarta', 'quinta', 'sexta', 'septima', 'octava', 'nona', 'decima']
def pent():
    n = ['prima', 'secunda', 'tertia', 'quarta', 'quinta', 'sexta', 'septima', 'octava', 'nona', 'decima', 'undecima', 'duodecima', 'decima tertia', 'decima quarta', 'decima quinta', 'decima sexta', 'decima septima', 'decima octava', 'decima nona', 'vigesima', 'vigesima prima', 'vigesima secunda', 'vigesima tertia', 'vigesima quarta']
    return ['Dominica %s post Pentecosten' % x for x in n]
TEMPORE_T = (['Dominica prima Adventus', 'Dominica secunda Adventus', 'Dominica tertia Adventus', 'Dominica quarta Adventus', 'Vigilia Nativitatis Domini', 'Nativitas Domini',
  'Dominica infra octavam Nativitatis Domini', 'Circumcisio Domini', 'Vigilia Epiphaniae', 'Epiphania', 'Dominica infra octavam Epiphaniae', 'In octava Epiphaniae',
  'Dominica II post Epiphaniam', 'Dominica III post Epiphaniam', 'Dominica IV post Epiphaniam', 'Dominica V post Epiphaniam', 'Dominica in Septuagesima', 'Dominica in Sexagesima',
  'Dominica in Quinquagesima', 'Dominica prima in Quadragesima', 'Feria V post Dominicam primam in Quadragesima', 'Dominica secunda in Quadragesima', 'Feria II post Dominicam secundam in Quadragesima',
  'Dominica tertia in Quadragesima', 'Dominica quarta in Quadragesima', 'Dominica de Passione', 'Dominica in Palmis', 'Feria quinta in Coena Domini', 'Feria sexta in Parasceve', 'Sabbato sancto',
  'In Resurrectione Domini', 'Feria II post Pascha', 'Dominica in Albis', 'Dominica II post Pascha', 'Dominica III post Pascha', 'Dominica IV post Pascha', 'Dominica V post Pascha',
  'In Ascensione Domini', 'Dominica infra octavam Ascensionis', 'In Pentecoste'] + pent())
SANCTIS_T = ['De sancto Andrea Apostolo', 'De sancto Nicolao', 'De sancto Stephano martyre', 'De sancto Ioanne Evangelista', 'De sancta Agnete virgine et martyre', 'De sancto Vincentio martyre',
  'De sancta Agatha virgine et martyre', 'De sancto Mathia Apostolo', 'De sancto Marco Evangelista', 'De sanctis Philippo et Iacobo Apostolis', 'De translatione sancti Francisci', 'De sancto Antonio',
  'De nativitate sancti Ioannis Baptistae', 'De sanctis Apostolis Petro et Paulo', 'De sancta Maria Magdalena', 'De sancto Dominico', 'De sancto Laurentio martyre', 'De sancto Bartholomaeo Apostolo',
  'De sancto patre nostro Francisco', 'In festo omnium Sanctorum', 'In die animarum', 'De sanctis Angelis']
MARIA_T = ['De Purificatione beatae Virginis Mariae', 'De Annuntiatione beatae Virginis Mariae', 'De Assumtione beatae Virginis Mariae', 'De Nativitate beatae Virginis Mariae']
DIVERSIS_T = ['Sermo I', 'Sermo II. De nostra redemptione', 'Sermo III. De via veritatis']
START = {'tempore': [51, 73, 85, 102, 116, 130, 157, 161, 172, 173, 199, 206, 207, 211, 216, 220, 223, 226, 229, 232, 241, 243, 249, 250, 259, 265, 269, 275, 287, 295, 300, 309, 317, 321, 334, 337, 339, 342, 356, 358,
          375, 385, 394, 400, 403, 406, 409, 412, 415, 420, 423, 426, 431, 435, 439, 443, 446, 451, 455, 458, 463, 469, 478, 482],
         'sanctis': [491, 500, 506, 523, 529, 538, 541, 542, 547, 558, 562, 563, 566, 574, 582, 590, 593, 597, 601, 626, 633, 637],
         'maria': [661, 685, 715, 734], 'diversis': [751, 753, 757]}
W = {'tempore': dict(pages=(51, 489), secs=TEMPORE_T, slug='sermones-de-tempore', la='Sermones de tempore', en='Sermons for the Church Year', pt='Sermões do ano litúrgico', pp='23-461',
        d_la='Sermones dominicales et festivi de tempore, ab Adventu usque ad dominicam vicesimam quartam post Pentecosten, ex codicibus editi.',
        d_en='Bonaventure’s sermons for the Sundays and feasts of the liturgical year, from Advent to the twenty-fourth Sunday after Pentecost, edited from the manuscripts.', composed='1250-1274'),
     'sanctis': dict(pages=(491, 660), secs=SANCTIS_T, slug='sermones-de-sanctis', la='Sermones de sanctis', en='Sermons for the Feasts of the Saints', pt='Sermões sobre os santos',  pp='463-631',
        d_la='Sermones de sanctis, de Andrea Apostolo usque ad Sanctos Angelos, ex codicibus editi.',
        d_en='Bonaventure’s sermons for the feasts of the saints, from Saint Andrew to the Holy Angels, edited from the manuscripts.', composed='1250-1274'),
     'maria': dict(pages=(661, 750), secs=MARIA_T, slug='sermones-de-beata-virgine-maria', la='Sermones de beata Virgine Maria', en='Sermons on the Blessed Virgin Mary', pt='Sermões sobre a bem-aventurada Virgem Maria', pp='633-721',
        d_la='Sermones de festis beatae Virginis Mariae: Purificatione, Annuntiatione, Assumtione, Nativitate.',
        d_en='Bonaventure’s sermons for the feasts of the Blessed Virgin: the Purification, Annunciation, Assumption and Nativity.', composed='1250-1274'),
     'diversis': dict(pages=(751, 759), secs=DIVERSIS_T, slug='sermones-de-diversis', la='Sermones de diversis', en='Sermons on Various Subjects', pt='Sermões diversos', pp='723-731',
        d_la='Sermones de diversis, cum prothematibus.', d_en='Bonaventure’s sermons on various subjects, with sermon prologues (prothemata).', composed='1250-1274')}
w = W[sys.argv[1]]
SERMO = re.compile(r"^S[a-zA-Z]{2,4}[o0]\b(?:\s+[IVXLlHUi1]{1,7})?(?:[\s.,'’‘\"*^]|[A-Za-z0-9]{1,2}\W?){0,3}$")
def norm(t): return re.sub(r'[^A-Z]', '', t.upper())
def sec_ratio(h, title):
    e = norm(title); return difflib.SequenceMatcher(None, norm(h)[:len(e) + 2], e).ratio()

P = F.load_pages('research/sourcing/bonaventure/xml/v09.xml')
ps = F.paragraphs(F.stream(P, *w['pages']), marker=SERMO)
starts = START[sys.argv[1]]
assert len(starts) == len(w['secs']), (len(starts), len(w['secs']))
secs = [[t, []] for t in w['secs']]; k = -1; log = []; fx = lambda t: F.clean(t, fix_ocr, log)
sn = 0; page = 0
# index of the item where each section begins: the head on its first page that best matches its title, else the page top
pos = {}
for i, (kind, *rest) in enumerate(ps):
    if kind == 'G': page = rest[0]
    for j, sp in enumerate(starts):
        if page == sp and j not in pos: pos[j] = ('page', i)
        if page == sp and kind == 'H' and sec_ratio(rest[0], w['secs'][j]) >= 0.72 and pos[j][0] == 'page': pos[j] = ('head', i)
begin = {i: j for j, (_, i) in pos.items()}
for i, it in enumerate(ps):
    kind = it[0]
    if i in begin: k = begin[i]; sn = 0
    if kind in 'GHS' or k < 0: continue
    t = it[1]
    if kind == 'M':
        pv = F.head_roman(re.sub(r'^S[a-zA-Z]{2,4}[o0]\b', '', t).strip() or 'X?')
        val = {roman(i): i for i in range(1, 60)}.get(pv or '', 0)
        sn = val if sn < val <= sn + 4 else sn + 1
        secs[k][1].append('## Sermo %s' % roman(sn)); continue
    p = fx(t)
    if len(p.split()) >= 2: secs[k][1].append(p)
missing = [s[0] for s in secs if not s[1]]
print('missing sections:', missing)
files = {'la': {}}; toc = []; total = 0
for i, (title, body) in enumerate(secs, 1):
    if not body: continue
    cid = 's%02d' % i
    files['la'][cid] = '# %s\n\n' % title + '\n\n'.join(body)
    toc.append((cid, {'la': title})); total += sum(len(x.split()) for x in body if not x.startswith('## '))
print(total, len(log), [(secs[i][0][:18], sum(len(x.split()) for x in secs[i][1]), sum(1 for x in secs[i][1] if x.startswith('## '))) for i in range(len(secs))][:80])
if len(sys.argv) > 2: sys.exit()
emit(w['slug'], 'bonaventure-' + w['slug'], {'la': w['la'], 'en-US': w['en'], 'pt-BR': w['pt']},
     {'la': w['d_la'] + ' Textus ex editione Quaracchi (Opera omnia IX, 1901), ex scanno OCR, sine notis criticis.', 'en-US': w['d_en'] + ' The Latin is the Quaracchi edition (Opera omnia IX, 1901) from an OCR scan, without the editors’ critical notes.', 'pt-BR': w['pt'] + '.'},
     w['composed'], 'bonaventure/' + w['slug'], ['la'], {'la': {'editor': 'PP. Collegii S. Bonaventurae (Quaracchi)', 'year': 1901}},
     [src('la', 'https://archive.org/details/doctorisseraphic09bona', 'S. Bonaventurae Opera omnia, tom. IX (Ad Claras Aquas, Quaracchi: Collegium S. Bonaventurae, 1901), pp. %s.' % w['pp'],
          'Archive.org OCR (djvu.xml word coordinates) of the folio edition. Each page is read in two columns; marginal notes, running heads, the editors’ footnotes (variant readings, cross-references) and small-type notes are removed by layout (line pitch and measure); line-end hyphens are joined; recognisable OCR slips are corrected by a lexicon pass, so some remain. Sermon numbers within each feast follow the edition; where the OCR lost a sermon head the number is inferred.',
          'A', 'Bonaventure died in 1274; the Quaracchi edition of 1901 is public domain.')],
     toc, files)
