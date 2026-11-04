import sys, subprocess
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_fo_build import *
import bookjson
bookjson.author_file(ROOT + 'content/authors/fromage.json', 'Dom Lucien Fromage', 'Dom Lucien Fromage', 19, ['Lucien Fromage', 'Fromage, Lucien', 'Dom Lucien Fromage', 'Dom Fromage'])
V = {
 7: ('07-temps-pascal-1', 'Le temps pascal, I', 'Paschal Time, Book I', 'Tempo pascal, I', 1864),
 8: ('08-temps-pascal-2', 'Le temps pascal, II', 'Paschal Time, Book II', 'Tempo pascal, II', 1865),
 9: ('09-temps-pascal-3', 'Le temps pascal, III', 'Paschal Time, Book III', 'Tempo pascal, III', 1866),
 10: ('10-pentecote-1', 'Le temps après la Pentecôte, I', 'Time after Pentecost, Book I', 'Tempo depois de Pentecostes, I', 1878),
 11: ('11-pentecote-2', 'Le temps après la Pentecôte, II', 'Time after Pentecost, Book II', 'Tempo depois de Pentecostes, II', 1883),
 12: ('12-pentecote-3', 'Le temps après la Pentecôte, III', 'Time after Pentecost, Book III', 'Tempo depois de Pentecostes, III', 1886),
 13: ('13-pentecote-4', 'Le temps après la Pentecôte, IV', 'Time after Pentecost, Book IV', 'Tempo depois de Pentecostes, IV', 1890),
 14: ('14-pentecote-5', 'Le temps après la Pentecôte, V', 'Time after Pentecost, Book V', 'Tempo depois de Pentecostes, V', 1897),
 15: ('15-pentecote-6', 'Le temps après la Pentecôte, VI', 'Time after Pentecost, Book VI', 'Tempo depois de Pentecostes, VI', 1901),
}
for v in map(int, sys.argv[1:]):
    folder, fr, en, pt, comp = V[v]
    f = f'lanneliturgiqu{v:02d}gu.txt'
    B, toc, w, nbi = build_fo(f, folder)
    cont = v >= 10
    author = {'fr-FR': 'Dom Lucien Fromage (continuation de Dom Guéranger)', 'en-US': 'Dom Lucien Fromage', 'pt-BR': 'Dom Lucien Fromage'} if cont else {'fr-FR': 'Dom Prosper Guéranger', 'en-US': 'Dom Prosper Guéranger', 'pt-BR': 'Dom Prosper Guéranger'}
    desc_fr = ('Volume %d de l’Année liturgique (' % v) + fr + ((', %de volume de la continuation par Dom Lucien Fromage' % (v - 9)) if cont else '') + ') : un chapitre par jour ou fête, avec les textes liturgiques en latin et en français.'
    d = {'id': 'gueranger-annee-liturgique-' + folder, 'name': {'fr-FR': 'L’Année liturgique : ' + fr[0].lower() + fr[1:], 'en-US': 'The Liturgical Year: ' + en + (' (continuation by Dom Fromage)' if cont else ''), 'pt-BR': 'O Ano Litúrgico: ' + pt + (' (continuação de Dom Fromage)' if cont else '')},
         'author': author,
         'description': {'fr-FR': desc_fr, 'en-US': f'Volume {v} of the 15-volume Liturgical Year (L’Année liturgique) in the original French' + (', the %s volume of the continuation written by Dom Lucien Fromage after Guéranger’s death' % ['first','second','third','fourth','fifth','sixth'][v - 10] if cont else '') + '. One chapter per day or feast, with the Latin and French of the liturgical texts. Made from the 1911 Oudin printing’s OCR; the two-column Latin and French text is separated by script and some running heads remain.', 'pt-BR': f'Volume {v} dos 15 volumes de «O Ano Litúrgico» (L’Année liturgique) em francês' + (', volume %d da continuação escrita por Dom Lucien Fromage após a morte de Guéranger' % (v - 9) if cont else '') + '. Um capítulo por dia ou festa, com o latim e o francês dos textos litúrgicos.'},
         'composed': str(comp), 'languages': ['fr-FR'], 'work': 'gueranger/annee-liturgique',
         'editions': {'fr-FR': {'editor': ('Dom Lucien Fromage, continuation' if cont else 'Dom Prosper Guéranger') + ' (Oudin, Paris-Poitiers)', 'year': 1911}},
         'sources': [{'language': 'fr-FR', 'url': f'https://archive.org/details/lanneliturgiqu{v:02d}gu', 'edition': f'L’Année liturgique, vol. {v}, Paris-Poitiers: Librairie H. Oudin, 1911. Internet Archive scan (University of Toronto), OCR text.', 'description': 'Split at detected day and feast headings; running heads and page numbers removed where recognised; the Latin and French columns, interleaved line by line in the OCR, were separated by language and set as a Latin paragraph followed by its French. The table of contents at the back is not imported.', 'tier': 'A', 'tierEvidence': 'Guéranger died in 1875 and Fromage in 1916; the text was printed in 1911 (before 1931).'}],
         'toc': [{'id': i, 'title': {'fr-FR': t}} for i, t in toc]}
    bookjson.write(B, d)
    r = subprocess.run(['python3', ROOT + 'scripts/check-book.py', B], capture_output=True, text=True, cwd=ROOT)
    print(folder, len(toc), w, nbi, r.returncode, r.stdout[-300:].strip(), r.stderr[-200:])
