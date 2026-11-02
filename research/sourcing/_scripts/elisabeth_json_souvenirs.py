import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from bookjson import *
from elisabeth_build_souvenirs import frt, ent
A = {'fr-FR': 'Sainte Élisabeth de la Trinité', 'en-US': 'St. Elisabeth of the Trinity', 'pt-BR': 'Santa Elisabete da Trindade'}
toc = [{'id': 'introduction', 'title': {'fr-FR': 'Introduction'}}]
for i in range(17):
    toc.append({'id': 'ch-%02d' % (i+1), 'title': {'fr-FR': frt[i], 'en-US': ent[i]}})
d = {
 'id': 'elisabeth-souvenirs',
 'name': {'fr-FR': 'Sœur Élisabeth de la Trinité : Souvenirs', 'en-US': 'The “Praise of Glory”: Reminiscences of Sister Elizabeth of the Trinity', 'pt-BR': 'Irmã Elisabete da Trindade: Lembranças'},
 'author': A,
 'description': {
  'fr-FR': 'La vie de Sœur Élisabeth de la Trinité (1880-1906) racontée par le Carmel de Dijon, en dix-sept chapitres tissés de ses lettres, de son journal et de ses notes intimes.',
  'en-US': 'The life of Sister Elizabeth of the Trinity (1880–1906) as told by the Carmel of Dijon, in seventeen chapters woven from her letters, journal and private notes.',
  'pt-BR': 'A vida da Irmã Elisabete da Trindade (1880-1906) contada pelo Carmelo de Dijon, em dezessete capítulos tecidos com suas cartas, seu diário e suas notas íntimas.'},
 'composed': '1909',
 'languages': ['fr-FR', 'en-US'],
 'work': 'elisabeth-of-the-trinity/souvenirs',
 'editions': {'fr-FR': {'editor': 'Carmel de Dijon (Mère Germaine de Saint-Seine)', 'year': 1913},
              'en-US': {'translator': 'Benedictines of Stanbrook', 'year': 1913}},
 'sources': [
  {'language': 'fr-FR', 'url': 'https://archive.org/details/soeurlisabethd00li', 'edition': 'Sœur Élisabeth de la Trinité, religieuse carmélite, 1880-1906 : Souvenirs, Dijon, Imp. Jobard, 1913 (OCR text, running heads removed, page-bottom notes turned into footnotes)', 'description': 'Chapters I-XVII and the Introduction; the appendix (Dernière retraite, Pieuse élévation, Lettres, Poésies) is imported as separate books. Approbations and the table of contents are left out.', 'tier': 'A'},
  {'language': 'en-US', 'url': 'https://archive.org/details/thepraiseofglory00elizuoft', 'edition': 'The Praise of Glory: Reminiscences of Sister Elizabeth of the Trinity, translated by the Benedictines of Stanbrook from the sixth and enlarged French edition, 1913/1914 (OCR; second scan archive.org/details/praiseofgloryrem00eliziala for cross-checks)', 'description': 'Chapters I-XVII; the translator’s introduction is left out.', 'tier': 'A'}],
 'toc': toc}
write('/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/souvenirs', d)
author_file('/Users/gustavo/Documents/prayer/content/authors/elisabeth-of-the-trinity.json', 'St. Elisabeth of the Trinity', 'Santa Elisabete da Trindade', 20,
  ['St. Elisabeth of the Trinity', 'St. Elizabeth of the Trinity', 'Sister Elizabeth of the Trinity', 'Élisabeth de la Trinité, sainte, 1880-1906'])
