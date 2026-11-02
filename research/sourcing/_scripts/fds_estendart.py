import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_clean import clean, finish
from fds_common import *
DL = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/dl'
ps = finish(clean(f'{DL}/t02b.txt'))
def find(rx, lo, hi=None):
    r = re.compile(rx, re.I)
    for k in range(lo, hi or len(ps)):
        if r.search(ps[k]):
            return k
    print('MISS', rx, file=sys.stderr); sys.exit(1)
a0 = find(r'^␂AVANT-PROPOS', 100)
l1 = find(r'^␂LIVRE PREMIER', a0)
e1 = find(r'^␂FIN DU PREMIER LIVRE', l1)
l2 = find(r'^␂LIVRE SECOND', e1)
e2 = find(r'^␂FIN DU SECOND LIVRE', l2)
l3 = find(r'^␂LIVRE TROISIESME', e2)
e3 = find(r'^␂FIN DU TRO.SIESME LIVRE', l3)
l4 = e3 + 1
e4 = find(r'^␂FIN\b', l4 + 100)
print(a0, l1, e1, l2, e2, l3, e3, e4, file=sys.stderr)
seq = [('avant-propos', 'Avant-propos', a0, l1), ('livre-i', 'Livre premier. De l’honneur et vertu de la vraie Croix', l1, e1),
 ('livre-ii', 'Livre second. De l’image de la Croix', l2, e2), ('livre-iii', 'Livre troisième. Des miracles et de l’usage de la Croix', l3, e3),
 ('livre-iv', 'Livre quatrième. De la qualité de l’honneur qu’on doit à la Croix', l4, e4)]
BK = 'estendart-de-la-croix'
tot = 0; toc = []
for cid, title, a, b in seq:
    chunk = ps[a:b]
    k = 0
    while k < len(chunk) and (chunk[k].startswith('␂') and not re.match(r'^␂\s*(ARTICLE|CHAPITRE|PREUVE)', chunk[k]) or chunk[k].isupper() or len(chunk[k]) < 12):
        k += 1
    body = subheads(trim_tail(chunk[k:]), r'^␂\s*(ARTICLE|CHAPITRE|PREUVE)')
    tot += write_chapter(BK, 'fr-FR', cid, title, body)
    toc.append(leaf(cid, fr_FR=title))
print('words', tot, file=sys.stderr)
write_book(BK, 'sales-estendart-de-la-croix',
 {'fr-FR': 'Défense de l’Estendart de la sainte Croix', 'en-US': 'Defence of the Standard of the Holy Cross', 'pt-BR': 'Defesa do Estandarte da santa Cruz'},
 {'fr-FR': 'La réfutation, en quatre livres, du traité du ministre Antoine Fay contre le culte de la Croix, composée par saint François de Sales en 1597-1600 : l’honneur dû à la vraie Croix, à son image, ses miracles et son usage, et la qualité de l’honneur qu’on lui doit. Texte critique des Œuvres d’Annecy (tome II) en orthographe d’époque.',
  'en-US': 'The refutation, in four books, of the minister Antoine Fay’s treatise against the veneration of the Cross, written by St. Francis de Sales in 1597-1600: the honour due to the true Cross, to its image, its miracles and use, and the kind of honour owed to it. The critical text of the Annecy edition (vol. II) in period spelling.',
  'pt-BR': 'A refutação, em quatro livros, do tratado do ministro Antoine Fay contra o culto da Cruz, composta por São Francisco de Sales em 1597-1600.'},
 '1600', ['fr-FR'], {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1892}},
 [FR_SRC('Francis’s text in the original 17th-century spelling, extracted from the PDF page images’ text layer word by word, dropping the right-hand column of marginal synopses and references. The editors’ preface, variants and footnotes, tables and appendices are not included. The four books are one chapter each; the chapter, article and proof headings the text layer preserved are set as second-level headings.', 't. II: Défense de l’Estendart de la sainte Croix, 1892 (file 02)')], toc)
