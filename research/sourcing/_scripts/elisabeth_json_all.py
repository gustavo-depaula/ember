import sys, os, glob, shutil
sys.path.insert(0, os.path.dirname(__file__))
from bookjson import *
R = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/'
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/elisabeth-of-the-trinity/raw/'
A = {'fr-FR': 'Sainte Élisabeth de la Trinité', 'en-US': 'St. Elisabeth of the Trinity', 'pt-BR': 'Santa Elisabete da Trindade'}
AE = {k: v for k, v in A.items() if k != 'fr-FR'}
SF = {'language': 'fr-FR', 'url': 'https://archive.org/details/soeurlisabethd00li', 'edition': 'Sœur Élisabeth de la Trinité, religieuse carmélite, 1880-1906 : Souvenirs, Dijon, Imp. Jobard, 1913, appendix (OCR text of the University of Ottawa copy)', 'tier': 'A'}
SE = {'language': 'en-US', 'url': 'https://archive.org/details/thepraiseofglory00elizuoft', 'edition': 'The Praise of Glory, translated by the Benedictines of Stanbrook, 1913/1914, appendix (OCR text; second scan archive.org/details/praiseofgloryrem00eliziala)', 'tier': 'A'}
ED = {'fr-FR': {'editor': 'Carmel de Dijon (Mère Germaine de Saint-Seine)', 'year': 1913}, 'en-US': {'translator': 'Benedictines of Stanbrook', 'year': 1913}}
def ch(i, **t): return {'id': i, 'title': t}
def tocfiles(slug, lang):
    return sorted(os.path.basename(f)[:-3] for f in glob.glob(R + slug + '/' + lang + '/*.md'))
def title_of(slug, lang, cid):
    return open(R + slug + '/' + lang + '/' + cid + '.md', encoding='utf8').readline()[2:].strip()
def toc_auto(slug, langs):
    ids = tocfiles(slug, langs[0])
    return [{'id': i, 'title': {l: title_of(slug, l, i) for l in langs if os.path.exists(R + slug + '/' + l + '/' + i + '.md')}} for i in ids]
def book(slug, id_, name, desc, composed, langs, work, editions, sources, srcfiles, author=A):
    d = {'id': id_, 'name': name, 'author': {k: author[k] for k in author if k in langs + ['en-US', 'pt-BR']}, 'description': desc, 'composed': composed, 'languages': langs, 'work': 'elisabeth-of-the-trinity/' + work,
         'editions': {l: editions[l] for l in langs}, 'sources': sources, 'toc': toc_auto(slug, langs)}
    write(R + slug, d)
    for lang, (f, label) in srcfiles.items():
        os.makedirs(R + slug + '/sources/' + label, exist_ok=True)
        shutil.copy(RAW + f, R + slug + '/sources/' + label + '/' + slug + '.txt')
sf = {'fr-FR': ('soeurlisabethd00li.txt', 'french-originals'), 'en-US': ('thepraiseofglory00elizuoft.txt', 'english-translations')}
# souvenirs: add the abbé's letter
import json
sj = json.load(open(R + 'souvenirs/book.json'))
if not any(t['id'] == 'lettre-abbe-d' for t in sj['toc']):
    sj['toc'].append({'id': 'lettre-abbe-d', 'title': {'fr-FR': 'Lettre de M. l’abbé D… à Madame Catez', 'en-US': 'Letter from the Abbé D… to Madame Catez'}})
json.dump(sj, open(R + 'souvenirs/book.json', 'w'), ensure_ascii=False, indent=2); open(R + 'souvenirs/book.json', 'a').write('\n')
for lang, (f, label) in sf.items():
    os.makedirs(R + 'souvenirs/sources/' + label, exist_ok=True); shutil.copy(RAW + f, R + 'souvenirs/sources/' + label + '/souvenirs.txt')
fr_only = lambda s: s.copy()
book('derniere-retraite', 'elisabeth-derniere-retraite',
 {'fr-FR': 'Dernière retraite de « Laudem Gloriæ »', 'en-US': 'The Last Retreat of “Laudem Gloriæ”', 'pt-BR': 'Última retiro de «Laudem Gloriae»'},
 {'fr-FR': 'Les seize jours de la dernière retraite d’Élisabeth (août 1906), méditations sur l’Écriture où elle livre le secret de sa sainteté : n’être plus qu’une louange de gloire de la Trinité.', 'en-US': 'The sixteen days of Elisabeth’s last retreat (August 1906), meditations on Scripture in which she reveals the secret of her holiness: to be nothing but a praise of glory of the Trinity.', 'pt-BR': 'Os dezesseis dias do último retiro de Elisabete (agosto de 1906), meditações sobre a Escritura em que ela revela o segredo de sua santidade: ser apenas um louvor de glória da Trindade.'},
 '1906', ['fr-FR', 'en-US'], 'derniere-retraite', ED, [dict(SF, description='Appendix pp. 269-303, as printed by the Carmel of Dijon (lightly edited; the editors’ opening note is kept as footnote 1 of the first day).'), dict(SE, description='Appendix pp. 227-259.')], sf)
book('elevation', 'elisabeth-elevation',
 {'fr-FR': 'Ô mon Dieu, Trinité que j’adore', 'en-US': 'O My God, Trinity Whom I Adore', 'pt-BR': 'Ó meu Deus, Trindade que adoro'},
 {'fr-FR': 'La « Pieuse élévation » du 21 novembre 1904, l’oraison d’Élisabeth à la Sainte Trinité.', 'en-US': 'The “Prayer of Sister Elizabeth” of 21 November 1904, her prayer to the Most Holy Trinity.', 'pt-BR': 'A «Piedosa elevação» de 21 de novembro de 1904, a oração de Elisabete à Santíssima Trindade.'},
 '1904', ['fr-FR', 'en-US'], 'elevation', ED, [dict(SF, description='“Pieuse élévation”, p. 305.'), dict(SE, description='“Prayer of Sister Elizabeth”, p. 260.')], sf)
book('ciel-dans-la-foi', 'elisabeth-ciel-dans-la-foi-en',
 {'en-US': 'Heaven on Earth (A Second Retreat)', 'pt-BR': 'O céu na terra (Segundo retiro)'},
 {'en-US': 'The ten days of “A Second Retreat of Sister Elizabeth of the Trinity”, the English form of Le Ciel dans la foi (August 1906).', 'pt-BR': 'Os dez dias do «Segundo retiro da Irmã Elisabete da Trindade», a forma inglesa de O céu na fé (agosto de 1906).'},
 '1906', ['en-US'], 'ciel-dans-la-foi', ED, [dict(SE, description='“A Second Retreat… Heaven on Earth”, pp. 289-306 of the 1914 edition. No French digital text of Le Ciel dans la foi was found; the French is missing.')], {'en-US': sf['en-US']}, author=AE)
book('lettres', 'elisabeth-lettres-souvenirs',
 {'fr-FR': 'Lettres (extraits)', 'en-US': 'Letters (extracts)', 'pt-BR': 'Cartas (trechos)'},
 {'fr-FR': 'Les lettres d’Élisabeth reproduites en appendice des Souvenirs : à une amie, au chanoine A., à Madame ***, à une aspirante au Carmel, et fragments divers. Un choix, non l’édition complète.', 'en-US': 'The letters of Elisabeth printed in the appendix of the Souvenirs: to a friend, to Canon A., to Madame ***, to an aspirant to Carmel, and assorted fragments. A selection, not the complete edition.', 'pt-BR': 'As cartas de Elisabete reproduzidas no apêndice das Lembranças: a uma amiga, ao cônego A., à Senhora ***, a uma aspirante ao Carmelo e fragmentos diversos. Uma seleção, não a edição completa.'},
 '1901-1906', ['fr-FR'], 'lettres', ED, [dict(SF, description='Appendix “Lettres”, pp. 307-334.')], {'fr-FR': sf['fr-FR']})
book('lettres-stanbrook', 'elisabeth-lettres-praise-of-glory',
 {'en-US': 'Letters (extracts, Stanbrook)', 'pt-BR': 'Cartas (trechos, Stanbrook)'},
 {'en-US': 'The letters printed in the appendix of The Praise of Glory (Stanbrook, 1914): to a friend, to Canon A., to Madame ***, to one who wished to become a Carmelite, and fragments. A selection; the groups differ in places from the French appendix.', 'pt-BR': 'As cartas do apêndice de The Praise of Glory (Stanbrook, 1914): a uma amiga, ao cônego A., à Senhora ***, a quem desejava ser carmelita e fragmentos. Uma seleção.'},
 '1901-1906', ['en-US'], 'lettres', ED, [dict(SE, description='Appendix “Letters”, pp. 261-288.')], {'en-US': sf['en-US']}, author=AE)
book('poesies', 'elisabeth-poesies',
 {'fr-FR': 'Poésies (choix)', 'en-US': 'Poems (selection)', 'pt-BR': 'Poesias (seleção)'},
 {'fr-FR': 'Treize poésies d’Élisabeth, de « La Carmélite » (1901) aux vers de septembre 1906, telles que les donnent les Souvenirs. Un choix sur les cent vingt-trois poèmes de l’édition critique.', 'en-US': 'Thirteen poems by Elisabeth, from “La Carmélite” (1901) to the verses of September 1906, as given in the Souvenirs. A selection from the 123 poems of the critical edition.', 'pt-BR': 'Treze poemas de Elisabete, de «A Carmelita» (1901) aos versos de setembro de 1906, como nas Lembranças. Uma seleção dos 123 poemas da edição crítica.'},
 '1901-1906', ['fr-FR'], 'poesies', ED, [dict(SF, description='Appendix “Poésies”, pp. 335-357.')], {'fr-FR': sf['fr-FR']})
