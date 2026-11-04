import sys, subprocess
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_fr_build import *
bookjson.author_file(ROOT + 'content/authors/gueranger.json', 'Dom Prosper Guéranger', 'Dom Prosper Guéranger', 19, ['Prosper Guéranger', 'Guéranger, Prosper', 'Dom Prosper Guéranger', 'Prosper Gueranger', 'Dom Guéranger', 'Guéranger'])
H = 'annee-liturgique-lavent-historique-mystique-pratique-et-prieres'
S = {
 1: dict(folder='01-avent', name=('L’Année liturgique : l’Avent', 'The Liturgical Year: Advent', 'O Ano Litúrgico: o Advento'), comp=1841,
   posts=[('preface-generale-a-lannee-liturgique', 'Préface générale'), (H, None), ('annee-liturgique-lavent-propre-du-temps', 'Propre du temps de l’Avent'), ('annee-liturgique-lavent-propre-des-saints', 'Propre des saints de l’Avent')],
   desc='Premier volume de l’Année liturgique : la préface générale, l’histoire, le mystère et la pratique de l’Avent, les prières du matin et du soir, de la messe et des offices, puis le Propre du temps et le Propre des saints, jour après jour.'),
 2: dict(folder='02-noel-1', name=('L’Année liturgique : le temps de Noël, I', 'The Liturgical Year: Christmas, Book I', 'O Ano Litúrgico: o tempo do Natal, I'), comp=1853,
   posts=[('lannee-liturgique-temps-de-noel-i-historique-mystique-pratique-et-prieres', 'Le temps de Noël'), ('lannee-liturgique-temps-de-noel-i-le-saint-jour-de-noel', None), ('lannee-liturgique-temps-de-noel-du-26-decembre-a-la-vigile-de-lepiphanie', None)],
   desc='Deuxième volume de l’Année liturgique : historique, mystique et pratique du temps de Noël, le saint jour de Noël, puis les fêtes du 26 décembre à la vigile de l’Épiphanie.'),
 3: dict(folder='03-noel-2', name=('L’Année liturgique : le temps de Noël, II', 'The Liturgical Year: Christmas, Book II', 'O Ano Litúrgico: o tempo do Natal, II'), comp=1853,
   posts=[('lannee-liturgique-temps-de-noel-a-partir-de-lepiphanie-preface-et-prieres', 'Le temps de Noël depuis l’Épiphanie'), ('lannee-liturgique-temps-de-noel-de-lepiphanie-au-14-janvier', 'L’Épiphanie'), ('lannee-liturgique-le-temps-de-noel-du-14-janvier-a-la-quinquagesime', None)],
   desc='Troisième volume de l’Année liturgique : le temps de Noël depuis l’Épiphanie, les prières, le Propre de l’Épiphanie au 14 janvier, puis les fêtes de janvier et de février jusqu’à la Quinquagésime.'),
 4: dict(folder='04-septuagesime', name=('L’Année liturgique : la Septuagésime', 'The Liturgical Year: Septuagesima', 'O Ano Litúrgico: a Septuagésima'), comp=1855,
   posts=[('lannee-liturgique-temps-de-la-septuagesime-historique-mystique-et-pratique-prieres', 'La Septuagésime'), ('lannee-liturgique-temps-de-la-septuagesime-propre-du-temps', 'Propre du temps de la Septuagésime'), ('lannee-liturgique-temps-de-la-septuagesime-propre-des-saints', 'Propre des saints de la Septuagésime')],
   desc='Quatrième volume de l’Année liturgique : la Septuagésime, de la Septuagésime au samedi après les Cendres, avec le Propre des saints de février et mars.'),
 5: dict(folder='05-careme', name=('L’Année liturgique : le Carême', 'The Liturgical Year: Lent', 'O Ano Litúrgico: a Quaresma'), comp=1857,
   posts=[('lannee-liturgique-le-careme-historique-mystique-pratique-prieres', 'Le Carême'), ('lannee-liturgique-le-careme-propre-du-temps', 'Propre du temps du Carême'), ('lannee-liturgique-le-careme-propre-des-saints', 'Propre des saints du Carême')],
   desc='Cinquième volume de l’Année liturgique : historique, mystique et pratique du Carême, le Propre du temps du premier dimanche au samedi de la quatrième semaine, et le Propre des saints.'),
 6: dict(folder='06-passion', name=('L’Année liturgique : la Passion et la Semaine sainte', 'The Liturgical Year: Passiontide and Holy Week', 'O Ano Litúrgico: a Paixão e a Semana Santa'), comp=1858,
   posts=[('lannee-liturgique-passion-et-semaine-sainte-historique-mystique-pratique-et-prieres', 'La Passion et la Semaine sainte'), ('lannee-liturgique-temps-de-la-passion-propre-du-temps', 'Propre du temps de la Passion'), ('lannee-liturgique-semaine-sainte-propre-du-temps', 'La Semaine sainte'), ('lannee-liturgique-jeudi-vendredi-et-samedi-saint-propre-du-temps', None)],
   desc='Sixième volume de l’Année liturgique : le temps de la Passion et la Semaine sainte, du dimanche de la Passion au samedi saint, avec le Triduum sacré en entier.'),
}
for v in map(int, sys.argv[1:]):
    sp = S[v]; fo = sp['folder']
    B, toc, w = build_fr(v, fo, None, None, None, sp['posts'], sp['comp'])
    n = sp['name']
    write_book(B, 'gueranger-annee-liturgique-' + fo, {'fr-FR': n[0], 'en-US': n[1], 'pt-BR': n[2]},
      {'fr-FR': sp['desc'], 'en-US': 'Volume %d of the 15-volume Liturgical Year (L’Année liturgique) in the original French: %s. One chapter per day or feast, with the liturgical texts in Latin and French as the edition prints them.' % (v, n[1].split(': ')[1]), 'pt-BR': 'Volume %d dos 15 volumes de «O Ano Litúrgico» (L’Année liturgique) em francês: %s. Um capítulo por dia ou festa, com os textos litúrgicos em latim e francês como a edição os imprime.' % (v, n[2].split(': ')[1])},
      sp['comp'], toc, [p[0] for p in sp['posts']], 'L’Année liturgique, vol. %d, 14th ed. (Oudin, 1900)' % v)
    r = subprocess.run(['python3', ROOT + 'scripts/check-book.py', B], capture_output=True, text=True, cwd=ROOT)
    print(fo, len(toc), w, r.returncode, r.stdout[-600:], r.stderr[-300:])
