import sys, os, json, shutil
sys.path.insert(0, os.path.dirname(__file__))
from bookjson import *
R = '/Users/gustavo/Documents/prayer/content/books/cure-of-ars-opera-omnia/'
idx = json.load(open('/tmp/vianney_sermons_index.json'))
OV = {6: 'Pour le jour de Noël — Sur le Mystère (deuxième sermon)', 25: 'Sur les Rogations, les Processions, l’Abstinence et les Quatre-Temps', 26: 'Pour le jour de l’Ascension', 27: 'Fête-Dieu',
      32: 'Cinquième dimanche après la Pentecôte — Sur le deuxième Commandement de Dieu', 44: 'Douzième dimanche après la Pentecôte — Sur le premier Commandement de Dieu (deuxième sermon)',
      48: 'Quatorzième dimanche après la Pentecôte — Sur le Monde', 55: 'Dix-huitième dimanche après la Pentecôte — Sur l’Envie', 56: 'Dix-neuvième dimanche après la Pentecôte — Sur l’Impureté',
      59: 'Vingt et unième dimanche après la Pentecôte — Sur la Colère', 60: 'Vingt-deuxième dimanche après la Pentecôte — Sur la Restitution', 61: 'Vingt-troisième dimanche après la Pentecôte — Sur la mort du juste',
      63: 'Fête de saint Jean-Baptiste', 66: 'Fête de la Nativité de la sainte Vierge', 67: 'Premier dimanche d’octobre — Fête du saint Rosaire', 30: 'Troisième dimanche après la Pentecôte — Sur la miséricorde de Dieu envers le pécheur (même sujet)',
      73: 'Pour la fête du saint Patron', 74: 'Fête de la Dédicace — Du respect que l’on doit avoir dans les églises', 16: 'Quatrième dimanche de Carême — Sur la mort du pécheur (inachevé)', 2: 'Premier dimanche de l’Avent — Sur les vérités éternelles (deuxième sermon)'}
titles = {}
for n, (cid, tome, t, w) in enumerate(idx, 1):
    titles[cid] = OV.get(n, t)
for cid, t in titles.items():
    p = R + 'sermons/fr-FR/' + cid + '.md'
    s = open(p, encoding='utf8').read().split('\n')
    s[0] = '# ' + t
    open(p, 'w', encoding='utf8').write('\n'.join(s))
parts = {1: 'Tome I — du premier dimanche de l’Avent au Vendredi saint', 2: 'Tome II — de Quasimodo au onzième dimanche après la Pentecôte', 3: 'Tome III — du douzième au vingt-troisième dimanche après la Pentecôte', 4: 'Tome IV — fêtes, sermons divers'}
toc = [{'id': 'preface', 'title': {'fr-FR': 'Préface de l’éditeur'}}]
for k in range(1, 5):
    ch = [{'id': cid, 'title': {'fr-FR': titles[cid]}} for cid, tome, *_ in idx if tome == k]
    ch.append({'id': 'notes-%d' % k, 'title': {'fr-FR': 'Notes de l’éditeur (tome %s)' % ['I','II','III','IV'][k-1]}})
    toc.append({'id': 'tome-%d' % k, 'title': {'fr-FR': parts[k]}, 'children': ch})
A = {'fr-FR': 'Saint Jean-Marie Vianney, curé d’Ars', 'en-US': 'St. John Vianney, the Curé of Ars', 'pt-BR': 'São João Maria Vianney, o Cura d’Ars'}
d = {'id': 'vianney-sermons', 'name': {'fr-FR': 'Sermons du vénérable serviteur de Dieu J.-B.-M. Vianney, curé d’Ars', 'en-US': 'Sermons of the Curé of Ars', 'pt-BR': 'Sermões do Cura d’Ars'},
 'author': A,
 'description': {'fr-FR': 'Soixante-dix-sept prônes du Curé d’Ars pour les dimanches et les fêtes de l’année, de l’Avent à la Toussaint, écrits de sa main entre 1818 et 1827 et publiés en quatre tomes en 1883, avec la préface et les notes des éditeurs.',
   'en-US': 'Seventy-seven parish sermons of the Curé of Ars for the Sundays and feasts of the year, from Advent to All Saints, written in his own hand between 1818 and 1827 and published in four volumes in 1883, with the editors’ preface and notes.',
   'pt-BR': 'Setenta e sete prédicas do Cura d’Ars para os domingos e festas do ano, do Advento a Todos os Santos, escritas de próprio punho entre 1818 e 1827 e publicadas em quatro tomos em 1883, com o prefácio e as notas dos editores.'},
 'composed': '1818–1827', 'languages': ['fr-FR'], 'work': 'cure-of-ars/sermons',
 'editions': {'fr-FR': {'editor': 'Ecclésiastiques de Lyon (Lecoffre / Ruban)', 'year': 1883}},
 'sources': [{'language': 'fr-FR', 'url': 'https://archive.org/details/sermons-du-venerable-serviteur-de-dieu-jean-baptiste-marie-vianney-4-tomes', 'edition': 'Sermons du vénérable serviteur de Dieu J.-B.-M. Vianney, curé d’Ars, 4 tomes, Paris, Victor Lecoffre / Lyon, Ruban, 1883 (OCR of the Bibliothèque Saint Libère scan, liberius.net)', 'description': 'Approbation of Cardinal Caverot (20 Aug 1882), the editors’ preface, the sermons and the end notes. Running heads, page footers and the tables of contents are removed; page-bottom notes are footnotes. Per the 1883 preface, several sermons are adaptations of earlier preachers (Lejeune and others).', 'tier': 'A'}],
 'toc': toc}
write(R + 'sermons', d)
os.makedirs(R + 'sermons/sources/french-originals', exist_ok=True)
shutil.copy('/Users/gustavo/Documents/prayer/research/sourcing/cure-of-ars/raw/fr-sermons-4t.txt', R + 'sermons/sources/french-originals/sermons.txt')
author_file('/Users/gustavo/Documents/prayer/content/authors/john-vianney.json', 'St. John Vianney, the Curé of Ars', 'São João Maria Vianney, o Cura d’Ars', 19, ['St. John Vianney', 'St. Jean-Marie Vianney', 'Curé of Ars', 'Cure of Ars', 'John Vianney', 'Vianney, Jean-Marie-Baptiste, 1786-1859', 'Jean-Baptiste-Marie Vianney'], saint='john_vianney')
