"""Bernard's sermons (Migne PL 183, CC works 6168-6216, 21529) and minor works as Latin-only books.
usage: python3 -I bernard_sermons.py <slug>..."""
import re, json, shutil, sys
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
import bernard_more as BM
from bernard_more import units, md, write, CC, ROOT, AUTHOR, N

def tei_title(f):
    return re.search(r'<title>(.*?)</title>', (CC / f).read_text(encoding='utf-8')).group(1).strip().rstrip('.')

def feast_title(t):
    t = re.sub(r'^In festo ', '', t)
    return t[:1].upper() + t[1:]

TEMPORE = [6169, 6211, 6198, 6186, 6178, 6203, 6171, 6181, 6185, 6180, 6177, 6190, 6176, 6189, 6204, 6207, 6206, 6183, 6191, 6172, 6173, 6214, 6188]
SANCTIS = [6209, 6192, 6168, 6193, 6187, 6179, 6182, 6196, 6199, 6210, 6194, 6184, 6174, 6201, 21529, 6195, 6202, 6208, 6197, 6200]
MINOR = [6152, 6212, 6149, 6161, 6175, 6213, 6215]

def grouped(ids):
    toc = []; files = []
    for w in ids:
        f = 'w%d.xml' % w; files.append(f)
        us = [u for u in units(CC / f) if u[0] != 'group']
        gt = feast_title(tei_title(f))
        grp = {'id': 'w%d' % w, 'title': {'la': gt}, 'children': []}; toc.append(grp)
        if len(us) == 1 and us[0][0] in ('prooemium', 'praefatio'):
            us = [('sermo', gt, us[0][2])]
        for cid, t, ps in us:
            cid = 'w%d-%s' % (w, cid)
            write(ROOT / SLUG / 'la' / (cid + '.md'), md(t, ps)); grp['children'].append({'id': cid, 'title': {'la': t}})
    return toc, files

CFG = {
 'sermones-de-tempore': dict(ids=TEMPORE, grouped=True, composed='c. 1125-1153', name=N('Sermones de tempore', 'Sermons for the Seasons of the Year', 'Sermões do tempo litúrgico'),
   desc=BM.D('Sermones Bernardi per annum de tempore, ab Adventu ad Dedicationem ecclesiae, in ordinem anni liturgici dispositi.', 'Bernard’s sermons for the liturgical year, from Advent through Christmas, Epiphany, Lent, Easter, the Ascension and Pentecost to the Sundays after Pentecost and the Dedication of a church, grouped by feast in the order of the year. The Latin is the Maurist text in Migne (Patrologia Latina 183, 1854).', 'Os sermões de Bernardo para o ano litúrgico, do Advento ao Natal, à Epifania, à Quaresma, à Páscoa, à Ascensão, a Pentecostes, aos domingos depois de Pentecostes e à Dedicação da igreja, agrupados por festa na ordem do ano.')),
 'sermones-de-sanctis': dict(ids=SANCTIS, grouped=True, composed='c. 1125-1153', name=N('Sermones de sanctis', 'Sermons for the Feasts of the Saints', 'Sermões das festas dos santos'),
   desc=BM.D('Sermones Bernardi de sanctis: Andreas, Clemens, Martinus, Paulus, Purificatio, Annuntiatio, Benedictus, Joannes Baptista, Petrus et Paulus, Assumptio, Nativitas Mariae, Michael, Omnes sancti, Malachias et alii.', 'Bernard’s sermons for the feasts of the saints and of Our Lady (Saint Andrew, Clement, Martin, the Conversion of Paul, the Purification, Annunciation and Assumption of Mary, Benedict, John the Baptist, Peter and Paul, Michael, All Saints, Malachy, Humbert and others), grouped by feast. The Latin is the Maurist text in Migne (Patrologia Latina 183, 1854).', 'Os sermões de Bernardo para as festas dos santos e de Nossa Senhora (André, Clemente, Martinho, a conversão de Paulo, a Purificação, a Anunciação e a Assunção de Maria, Bento, João Batista, Pedro e Paulo, Miguel, Todos os Santos, Malaquias, Humberto e outros), agrupados por festa.')),
 'opuscula-minora': dict(ids=MINOR, grouped=True, composed='c. 1120-1153', name=N('Opuscula minora', 'Minor Works', 'Opúsculos menores'),
   desc=BM.D('Opuscula minora Bernardi: Prologus in Antiphonarium (De cantu), Officium de S. Victore, Chartae, Opuscula duo, Formula confessionis, Parabolae, Sententiae.', 'Bernard’s shorter pieces gathered from Migne: the prologue to the Cistercian antiphonary (on chant), the office of Saint Victor, charters, two short opuscula, a formula of private confession, the Parables and the Sentences. The Latin is the Maurist text in Migne (Patrologia Latina 182–184).', 'Peças menores de Bernardo reunidas de Migne: o prólogo do antifonário cisterciense (sobre o canto), o ofício de São Vítor, cartas patentes, dois opúsculos, uma fórmula de confissão privada, as Parábolas e as Sentenças.')),
 'sermones-de-diversis': dict(cc='w6216.xml', composed='c. 1125-1153', name=N('Sermones de diversis', 'Sermons on Various Subjects', 'Sermões diversos'),
   desc=BM.D('Sermones de diversis, CXXV, in editione Mabillonii.', 'Bernard’s 125 sermons on various subjects as Mabillon edited them: on the fleetingness of life, the knowledge of oneself, the virtues and vices, the gifts of the Spirit and the stages of the soul’s ascent. The Latin is the Maurist text in Migne (Patrologia Latina 183, 1854).', 'Os 125 sermões de Bernardo sobre assuntos diversos, na edição de Mabillon: a brevidade da vida, o conhecimento de si, as virtudes e os vícios, os dons do Espírito e os graus da ascensão da alma.')),
 'in-psalmum-qui-habitat': dict(cc='w6205.xml', composed='1139-1140', name=N('In psalmum Qui habitat (Sermones in Quadragesima)', 'On the Psalm Qui habitat (Lenten Sermons)', 'Sobre o salmo Qui habitat (sermões da Quaresma)'),
   desc=BM.D('Sermones XVII in psalmum Qui habitat, in Quadragesima habiti.', 'Bernard’s seventeen Lenten sermons on Psalm 90, Qui habitat in adjutorio Altissimi: the soul under the protection of God, the temptations of the noonday demon, and the angels given charge over us. The Latin is the Maurist text in Migne (Patrologia Latina 183, 1854).', 'Os dezessete sermões quaresmais de Bernardo sobre o salmo 90, Qui habitat: a alma sob a proteção de Deus, as tentações do demônio meridiano e os anjos encarregados de nós.')),
 'in-laudibus-virginis-matris': dict(cc='w6170.xml', composed='c. 1120', name=N('In laudibus Virginis Matris (Missus est)', 'In Praise of the Virgin Mother (Missus est)', 'Louvores da Virgem Mãe (Missus est)'),
   desc=BM.D('Homiliae IV super Missus est angelus Gabriel, quae De laudibus Virginis Matris inscribuntur.', 'Bernard’s four homilies on the Annunciation, Missus est angelus Gabriel, the work known as the Praises of the Virgin Mother (the Missus est), with Mabillon’s monitum and preface. The Latin is the Maurist text in Migne (Patrologia Latina 183, 1854).', 'As quatro homilias de Bernardo sobre a Anunciação, Missus est angelus Gabriel, conhecidas como Louvores da Virgem Mãe, com o monitum e o prefácio de Mabillon.')),
 'de-consideratione': dict(cc='w21483.xml', composed='1148-1153', name=N('De consideratione', 'On Consideration', 'Sobre a consideração'),
   desc=BM.D('Libri V De consideratione ad Eugenium papam tertium.', 'Bernard’s five books for his former monk Pope Eugene III: the need to set time for reflection amid the cares of office, the self-knowledge and knowledge of what is below, around, above and within the pope, and the contemplation of God. The Latin is the Maurist text in Migne (Patrologia Latina 182, 1854).', 'Os cinco livros de Bernardo ao papa Eugênio III, seu antigo monge: a necessidade de reservar tempo para a reflexão entre os cuidados do ofício, o conhecimento de si e do que está abaixo, ao redor, acima e dentro do papa, e a contemplação de Deus.')),
}

def main(slug):
    global SLUG; SLUG = slug; c = CFG[slug]; d = ROOT / slug
    if d.exists(): shutil.rmtree(d)
    if c.get('grouped'):
        toc, files = grouped(c['ids'])
        c2 = dict(c, cc=files, units=None)
        # reuse the book.json writer without re-splitting: pass the finished toc through
        meta_units = None
    else:
        files = [c['cc']]
    pl = '183' if slug != 'de-consideratione' else '182'
    if not c.get('grouped'):
        BM.build(slug, dict(c, pl=pl, year=1854)); return
    for f in files: write(d / 'sources/latin-originals' / f.replace('w', 'cc-work-'), (CC / f).read_text(encoding='utf-8'))
    wids = ', '.join(re.search(r'w(\d+)', f).group(1) for f in files)
    meta = {'id': 'bernard-' + slug, 'cover': 'classic', 'name': c['name'], 'author': AUTHOR, 'description': c['desc'], 'composed': c['composed'],
      'languages': ['la'], 'work': 'bernard/' + slug,
      'editions': {'la': {'editor': 'Jean Mabillon, in J.-P. Migne (Patrologia Latina 182-184)', 'year': 1854}},
      'sources': [{'language': 'la', 'url': 'https://mlat.uzh.ch/browser?path=/38/2268', 'edition': 'S. Bernardi Claraevallensis abbatis opera omnia, ed. J. Mabillon, in Migne, Patrologia Latina 182-184 (Paris 1854); TEI XML of the Corpus Corporum (University of Zurich), works %s, from machine-corrected OCR.' % wids,
        'description': 'One group per feast or piece, as the Corpus Corporum divides them. PL page breaks and column numbers are dropped, and so are the paragraph numbers; Scripture references stay in parentheses as printed.',
        'tier': 'A', 'tierEvidence': 'Bernard died in 1153; Migne’s printing is public domain everywhere.'}],
      'toc': toc}
    write(d / 'book.json', json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    print(slug, len(toc), sum(len(f.read_text().split()) for f in (d / 'la').glob('*.md')))

if __name__ == '__main__':
    for s in sys.argv[1:]: main(s)
