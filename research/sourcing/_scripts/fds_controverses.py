import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_clean import clean, finish
from fds_common import *
DL = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/dl'
ps = [p for p in finish(clean(f'{DL}/t01l.txt')) if not re.match(r'^␂?\s*Parti?e\s*[IVXl1]+\.?\s*(Chapitre|Avant)', p, re.I)]
def find(rx, lo, hi=None, flags=re.I):
    r = re.compile(rx, flags)
    for k in range(lo, hi or len(ps)):
        pass
    for k in range(lo, hi or len(ps)):
        if r.search(ps[k]):
            print(k, rx[:30], file=sys.stderr)
            return k
    print('MISS', rx, lo, file=sys.stderr); sys.exit(1)
A = {}
A['epitre'] = find(r'^␂Epître a Messieurs de Thonon', 500)
A['notes'] = find(r'^␂NOTES PRÉPARATOIRES', A['epitre'])
A['p1'] = find(r'^␂PREMIÈRE PARTIE', A['notes'])
A['p1c1'] = find(r'RAYSON I ?: ?DE LA MISSION', A['p1'])
A['p1c2'] = find(r'^␂?Erreurs des Ministres sur la Nature', A['p1c1'])
A['p1c3'] = find(r'^␂?Les Marques de l.Eglise', A['p1c2'])
A['p2'] = find(r'^␂SECONDE PARTIE', A['p1c3'])
A['p2av'] = find(r'^␂AVANT PROPOS', A['p2'])
A['p2c1'] = find(r'^␂CHAPITRE PREMIER', A['p2av'])
A['p2c2'] = find(r'TRADITIONS APOSTOLIQUES, 2E REGLE', A['p2c1'])
A['p2c3'] = find(r'3. ?REGLE DE NOSTRE FOY', A['p2c2'])
A['p2c4'] = find(r'^␂?4. ?REGLE DE NOSTRE FOY', A['p2c3'])
A['p2c5'] = find(r'^␂?5. ?REGLE DE NOSTRE FOY', A['p2c4'])
A['p2c6'] = find(r'^␂?6. ?R[eè]gle de notre Foi', A['p2c5'])
A['p2c7'] = find(r'^␂?Que les Ministres ont violé l.Autorit[eé] des Miracles', A['p2c6'])
A['p2c8'] = find(r'^\u2402?8. ?R[eè]gle de notre Foi', A['p2c7'])
A['p3'] = find(r'^␂TROISIÈME PARTIE', A['p2c8'])
A['p3av'] = find(r'^␂AVANT-PROPOS', A['p3'])
A['p3c1'] = find(r'^␂DES SACREMENS', A['p3av'])
A['p3c2'] = find(r'^␂Du Purgatoire', A['p3c1'])
A['end'] = find(r'^Je certifie et assure avoir faict', A['p3c2'])
print(A, file=sys.stderr)
seq = [
 ('epitre-avant-propos', 'Épître à Messieurs de Thonon et Avant-propos', 'epitre', 'notes'),
 ('notes-preparatoires', 'Notes préparatoires', 'notes', 'p1'),
 ('partie-i-chapitre-i', 'Première partie. Chapitre I. Rayson I : de la Mission', 'p1c1', 'p1c2'),
 ('partie-i-chapitre-ii', 'Première partie. Chapitre II. Erreurs des Ministres sur la nature de l’Église', 'p1c2', 'p1c3'),
 ('partie-i-chapitre-iii', 'Première partie. Chapitre III. Les marques de l’Église', 'p1c3', 'p2'),
 ('partie-ii-avant-propos', 'Seconde partie. Les règles de la foi. Avant-propos', 'p2av', 'p2c1'),
 ('partie-ii-chapitre-i', 'Seconde partie. Chapitre I. Que les réformateurs prétendus ont violé la sainte Escriture', 'p2c1', 'p2c2'),
 ('partie-ii-chapitre-ii', 'Seconde partie. Chapitre II. Que l’Église des prétendus a violé les traditions apostoliques', 'p2c2', 'p2c3'),
 ('partie-ii-chapitre-iii', 'Seconde partie. Chapitre III. Que les Ministres ont violé l’authorité de l’Église', 'p2c3', 'p2c4'),
 ('partie-ii-chapitre-iv', 'Seconde partie. Chapitre IV. Que les Ministres ont violé l’authorité des Conciles', 'p2c4', 'p2c5'),
 ('partie-ii-chapitre-v', 'Seconde partie. Chapitre V. Les Ministres ont violé l’authorité des anciens Pères de l’Église', 'p2c5', 'p2c6'),
 ('partie-ii-chapitre-vi', 'Seconde partie. Chapitre VI. Que les Ministres ont violé l’autorité du Pape', 'p2c6', 'p2c7'),
 ('partie-ii-chapitre-vii', 'Seconde partie. Chapitre VII. Que les Ministres ont violé l’autorité des Miracles', 'p2c7', 'p2c8'),
 ('partie-ii-chapitre-viii', 'Seconde partie. Chapitre VIII. Que les Ministres ont violé la Raison naturelle', 'p2c8', 'p3'),
 ('partie-iii-avant-propos', 'Troisième partie. Les règles de la foi sont observées dans l’Église catholique. Avant-propos', 'p3av', 'p3c1'),
 ('partie-iii-chapitre-i', 'Troisième partie. Chapitre I. Des Sacremens', 'p3c1', 'p3c2'),
 ('partie-iii-chapitre-ii', 'Troisième partie. Chapitre II. Du Purgatoire', 'p3c2', 'end'),
]
BK = 'controverses'
tot = 0; toc = []
for cid, title, a, b in seq:
    lo = A[a] + (0 if a in ('epitre', 'notes') else 0)
    chunk = ps[A[a]:A[b]]
    # drop the leading heading block
    k = 0
    while k < len(chunk) and (chunk[k].startswith('␂') and not re.match(r'^␂\s*(ARTICLE|Article)', chunk[k]) or chunk[k].isupper() or len(chunk[k]) < 12):
        k += 1
    body = trim_tail(subheads(chunk[k:]) if False else chunk[k:])
    body = subheads(body)
    tot += write_chapter(BK, 'fr-FR', cid, title, body)
    toc.append(leaf(cid, fr_FR=title))
print('words', tot, file=sys.stderr)
write_book(BK, 'sales-controverses',
 {'fr-FR': 'Les Controverses', 'en-US': 'The Controversies', 'pt-BR': 'As Controvérsias'},
 {'fr-FR': 'Les traités de controverse composés par saint François de Sales en 1595-1596 pour ramener au catholicisme les habitants du Chablais : la défense de l’autorité de l’Église, les règles de la foi, les sacrements et le purgatoire. Texte critique des Œuvres d’Annecy (tome I) en orthographe d’époque, avec l’épître aux habitants de Thonon et les notes préparatoires.',
  'en-US': 'The controversy tracts composed by St. Francis de Sales in 1595-1596 to win back the people of the Chablais: the defence of the Church’s authority, the rules of faith, the sacraments and purgatory. The critical text of the Annecy edition (vol. I) in period spelling, with the epistle to the people of Thonon and the preparatory notes.',
  'pt-BR': 'Os tratados de controvérsia compostos por São Francisco de Sales em 1595-1596 para reconduzir à fé católica os habitantes do Chablais: a defesa da autoridade da Igreja, as regras da fé, os sacramentos e o purgatório.'},
 '1596', ['fr-FR'], {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1892}},
 [FR_SRC('Francis’s text in the original 17th-century spelling, extracted from the PDF text layer (layout mode). Marginal references, the variants and footnotes, the editors’ general introduction and the tables are not included. The article headings are set as second-level headings; chapter titles come from the edition’s table of contents.', 't. I: Les Controverses, 1892 (file 01)')], toc)
