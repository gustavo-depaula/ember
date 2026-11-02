import sys, os, shutil
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_common import *
exec(open(os.path.dirname(__file__) + '/fds_entretiens.py').read().split("BK = ")[0].split("fr_titles = ")[1].join(["fr_titles = ", ""]).split("\nroman")[0]) if False else None
src = open('/Users/gustavo/Documents/prayer/research/sourcing/_scripts/fds_entretiens.py').read()
fr_titles = eval(src.split('fr_titles = ')[1].split('\n')[0]); en_titles = eval(src.split('en_titles = ')[1].split('\n')[0])
R = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI']
def leaf(cid, fr, en=None):
    t = {'fr-FR': fr}
    if en: t['en-US'] = en
    return {'id': cid, 'title': t}
toc = [leaf('aux-religieuses', 'Aux Religieuses de la Visitation')]
for i, r in enumerate(R):
    toc.append(leaf(f'entretien-{r.lower()}', f'Entretien {r}. {fr_titles[i]}', f'Conference {r}. {en_titles[i]}'))
toc.append(leaf('appendice-entretiens-inedits', 'Appendice. Entretiens qui ne se trouvent dans aucune édition antérieure (A-E)'))
toc.append(leaf('dernier-entretien', 'Dernier entretien de nostre bien-heureux Pere, Lyon, 1622'))
write_book('entretiens-spirituels', 'sales-entretiens-spirituels',
  {'fr-FR': 'Les vrays Entretiens spirituels', 'en-US': 'The True Spiritual Conferences', 'pt-BR': 'Os verdadeiros Colóquios espirituais'},
  {'fr-FR': 'Les vingt et un entretiens de saint François de Sales aux Religieuses de la Visitation, recueillis par elles et publiés en 1629 : la confiance, l’humilité, l’obéissance, la simplicité, la volonté de Dieu. Texte critique des Œuvres d’Annecy (tome VI), en orthographe d’époque, avec les entretiens inédits de l’appendice et le dernier entretien de Lyon (1622) ; la traduction anglaise de Gasquet et Mackey est jointe entretien par entretien.',
   'en-US': 'The twenty-one conferences of St. Francis de Sales to the nuns of the Visitation, taken down by them and published in 1629: confidence, humility, obedience, simplicity, the will of God. The French is the critical text of the Annecy edition (vol. VI) in period spelling, with the appendix of unpublished conferences and the last conference at Lyon (1622); the Gasquet and Mackey English translation (1906) is paired conference by conference.',
   'pt-BR': 'Os vinte e um colóquios de São Francisco de Sales às Religiosas da Visitação, recolhidos por elas e publicados em 1629: a confiança, a humildade, a obediência, a simplicidade, a vontade de Deus.'},
  '1629', ['fr-FR', 'en-US'],
  {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1895}, 'en-US': {'translator': 'Abbot Gasquet and Dom H. B. Mackey, O.S.B.', 'year': 1906}},
  [FR_SRC('Francis’s text in the original 17th-century spelling, extracted from the PDF text layer (layout mode). Marginal references, the variants at the foot of the page, the editors’ introduction and tables, and the appendix of manuscript passages are not included. Chapter titles come from the edition’s table of contents.', 't. VI: Les vrays Entretiens spirituels, 1895 (file 06)'),
   {'language': 'en-US', 'url': 'https://archive.org/details/spiritualconfere00franuoft', 'edition': 'The Spiritual Conferences of St. Francis de Sales, translated from the Annecy text of 1895 by Abbot Gasquet and Dom H. B. Mackey, O.S.B., Library of St. Francis de Sales vol. V, London: Burns & Oates, 1906 (archive.org djvu text).', 'description': 'OCR text of the twenty-one conferences; the preface, Wiseman’s introduction, translators’ footnotes and indexes are not included, and the appendix pieces were not translated.', 'tier': 'A', 'tierEvidence': 'Gasquet died in 1929 and Mackey in 1906; the translation appeared in 1906 (public domain).'}],
  toc)
