import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
IA = RAW + 'garrigou-lagrange/ia/'
HF = [re.compile(r'^\S{0,3}\s?[A-ZÉÈ][A-ZÉÈ\' ,\-:;’]{4,}\s*\S{0,4}$'), re.compile(r'^\S{0,3} ?LES? [A-ZÉ ]{5,}')]
HE = [re.compile(r'^\d{0,3}\s*[A-Z][A-Z\'’ ,\-:;]{4,}\s*\S{0,4}$')]
from gl_perfection import fixfr, tfr
if __name__ == '__main__':
    v1 = load(IA + 'lamourdedieuetla0001preg.txt'); v2 = load(IA + 'lamourdedieuetla0002preg.txt')
    prx = re.compile(r'^(a )?(PREMI|DEUXI|TROISI|QUATRI|CINQUI|SIXI)[EÈ]ME? PARTIE$', re.I)
    prx = re.compile(r'^(a )?(PREMI[EÈ]RE|DEUXI[EÈ]ME|TROISI[EÈ]ME|QUATRI[EÈ]ME|CINQUI[EÈ]ME|SIXI[EÈ]ME) PARTIE$', re.I)
    urx = re.compile(r'^CHAPITRE (PREMIER|[IVXl1]{1,5})$', re.I)
    kw = dict(prx=prx, urx=urx, heads=HF, fix=fixfr, pre=pre_common, words=('Partie', 'Chapitre', 'Introduction'), tfix=tfr)
    intro = chunk(v1[156:1338], 'intro', 'Introduction', HF, fix=fixfr, pre=pre_common)
    fr = [intro] + parse(v1[1338:20660], **kw) + parse(v2[110:19174], p0=3, **kw) + [chunk(v2[19174:20840], 'epilogue', 'Épilogue : le chemin étroit de la perfection et le plein développement des voies illuminative et unitive', HF, fix=fixfr, pre=pre_common)]
    g = lambda n: load(IA + f'Garrigou-LagrangeEnglish--Love_of_God_and_the_Cross_of_Jesus_(vol._{n})_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt')
    e1, e2 = g(1), g(2)
    kwe = dict(prx=re.compile(r'^PART [IVX]{1,3}$'), urx=re.compile(r'^CHAPTER [IVXL]{1,6}$'), heads=HE, fix=fix_en, pre=pre_common, words=('Part', 'Chapter', 'Introduction'))
    eintro = chunk(e1[216:1176], 'intro', 'Introduction', HE, fix=fix_en, pre=pre_common)
    en = [eintro] + parse(en_prepare(e1[1176:], HE), **kwe) + parse(en_prepare(e2[222:16609], HE), p0=3, **kwe) + [chunk(en_prepare(e2[16609:18175], HE), 'epilogue', 'Epilogue: The Narrow Path of Perfection and the Full Development of the Illuminative and Unitive Ways', HE, fix=fix_en, pre=pre_common)]
    for a, b in ((fr, 'fr'), (en, 'en')):
        print(b, [(n['id'], n['wc']) for n in a])
    meta = dict(id='garrigou-amour-de-dieu-croix-de-jesus', cover='quarter',
        name={'fr-FR': 'L’Amour de Dieu et la Croix de Jésus', 'en-US': 'The Love of God and the Cross of Jesus', 'pt-BR': 'O amor de Deus e a Cruz de Jesus'},
        author={'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'},
        description={'fr-FR': 'Étude de la vie spirituelle à la lumière de saint Thomas et de saint Jean de la Croix : l’amour de Dieu pour nous, la mortification, les lois du progrès de la charité, les purifications passives des sens et de l’esprit, la vie d’union par Jésus et Marie. Six parties en deux tomes (Cerf, Juvisy, 1929).',
            'en-US': 'A study of the spiritual life in the light of St. Thomas and St. John of the Cross: God’s love for us, mortification, the laws of the growth of charity, the passive purifications of the senses and of the spirit, and the life of union through Jesus and Mary. Six parts in two volumes (Cerf, 1929); the English follows the same parts and chapters (Herder, 1947 and 1951), with the chapters numbered continuously in each volume.',
            'pt-BR': 'Estudo da vida espiritual à luz de São Tomás e de São João da Cruz: o amor de Deus por nós, a mortificação, as leis do progresso da caridade, as purificações passivas dos sentidos e do espírito, a vida de união por Jesus e Maria. Seis partes em dois tomos (1929).'},
        composed='1929', work='garrigou-lagrange/amour-de-dieu-et-croix-de-jesus',
        editions={'fr-FR': {'editor': 'Éditions du Cerf, Juvisy (2 vol.)', 'year': 1929}, 'en-US': {'translator': 'Sister Jeanne Marie, Maryknoll', 'year': 1947}},
        sources=[{'language': 'fr-FR', 'url': 'https://archive.org/details/lamourdedieuetla0001preg', 'edition': 'L’Amour de Dieu et la Croix de Jésus, t. I, Cerf, Juvisy, 1929 (GTU scan, OCR text)'},
                 {'language': 'fr-FR', 'url': 'https://archive.org/details/lamourdedieuetla0002preg', 'edition': 'Id., t. II, 1929'},
                 {'language': 'en-US', 'url': 'https://archive.org/details/Garrigou-LagrangeEnglish', 'edition': 'The Love of God and the Cross of Jesus, tr. Sister Jeanne Marie, vol. 1 (1947) and 2 (1951), St. Louis: B. Herder'}])
    print(finish('garrigou-lagrange-opera-omnia/amour-de-dieu-et-croix-de-jesus', meta, {'fr-FR': fr, 'en-US': en}, srcs=[('french-originals', IA+'lamourdedieuetla0001preg.txt', 'amour-de-dieu-1929-t1-archive-org.txt'), ('french-originals', IA+'lamourdedieuetla0002preg.txt', 'amour-de-dieu-1929-t2-archive-org.txt'), ('english-originals', IA+'Garrigou-LagrangeEnglish--Love_of_God_and_the_Cross_of_Jesus_(vol._1)_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt', 'love-of-god-1947-vol1-archive-org.txt'), ('english-originals', IA+'Garrigou-LagrangeEnglish--Love_of_God_and_the_Cross_of_Jesus_(vol._2)_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt', 'love-of-god-1951-vol2-archive-org.txt')]))
