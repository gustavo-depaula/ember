import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
from gl_perfection import fixfr, tfr
T = RAW + 'tanquerey/'
AU = {'fr-FR': 'Adolphe Tanquerey', 'en-US': 'Adolphe Tanquerey', 'pt-BR': 'Adolphe Tanquerey', 'la': 'Adolphus Tanquerey'}


def run():
    f = load(T + 'precisdetheologi0000tanq.txt'); e = load(T + 'spirituallifetre0000tanq.txt')
    hf, he = auto_heads(f), auto_heads(e)
    fr = [chunk(f[2739:4404], 'introduction', 'Introduction', hf, fix=fixfr, pre=pre_common)]
    fr += parse(f[4403:54788], prx=re.compile(r'^(PREMI[EÈ]RE PARTIE|SECONDE PARTIE|LIVRE\s+(I{1,3}|SI|II1)\W{0,3})$', re.I), urx=re.compile(r'^CHAP\S{0,8}[ "]*[IVXlL1|T"]{0,5}\W{0,3}$', re.I),
                 heads=hf, fix=fixfr, pre=pre_common, words=('Livre', 'Chapitre', 'Introduction'), tfix=tfr, continuous=True)
    PT = {'ch1': 'Première partie : les principes', 'ch3': 'Seconde partie : les trois voies'}
    for n in fr:
        if n['parent'] and n['parent'][0] in PT:
            n['parent'] = (n['parent'][0], PT[n['parent'][0]])
        if n['id'] == 'ch2-intro':
            n['title'] = 'Seconde partie : avant-propos'
    fr.append(chunk(f[54788:56500], 'epilogue', 'Épilogue : les trois voies et le cycle liturgique', hf, fix=fixfr, pre=pre_common))
    print([(n['id'], n['wc'], n['title'][:30]) for n in fr])
    en = [chunk(en_prepare(e[3342:4960], he), 'introduction', 'Introduction', he, fix=fix_en, pre=pre_common)]
    en += parse(en_prepare(e[4960:48844], he), prx=re.compile(r'^(BOOK\s+(I{1,3}|II1)\W{0,3}|PART\s+(I{1,3}|ONE|TWO))$', re.I), urx=re.compile(r'^CHAPTER\s*[IVXlL1|]{1,5}\W{0,3}$', re.I),
                heads=he, fix=fix_en, pre=pre_common, words=('Book', 'Chapter', 'Introduction'), continuous=True)
    en.append(chunk(en_prepare(e[48844:50100], he), 'epilogue', 'Epilogue: The Three Ways and the Liturgical Cycle', he, fix=fix_en, pre=pre_common))
    print([(n['id'], n['wc'], n['title'][:30]) for n in en])
    base = dict(cover='quarter', author={k: v for k, v in AU.items() if k != 'la'}, composed='1923', work='tanquerey/precis-de-theologie-ascetique-et-mystique')
    m1 = dict(base, id='tanquerey-precis-theologie-ascetique-mystique',
        name={'fr-FR': 'Précis de théologie ascétique et mystique', 'en-US': 'Précis of Ascetical and Mystical Theology', 'pt-BR': 'Compêndio de teologia ascética e mística'},
        description={'fr-FR': 'Le grand manuel de théologie spirituelle : les principes de la vie surnaturelle, la perfection et ses moyens, puis les trois voies, purgative, illuminative et unitive, avec les états mystiques et le discernement des esprits. Paragraphes numérotés. Dixième édition (Desclée, 1928).',
                     'en-US': 'The great manual of spiritual theology: the principles of the supernatural life, perfection and its means, then the three ways, purgative, illuminative and unitive, with the mystical states and the discernment of spirits. Numbered paragraphs. Tenth French edition (Desclée, 1928); the English translation is its own book.',
                     'pt-BR': 'O grande manual de teologia espiritual: os princípios da vida sobrenatural, a perfeição e seus meios, depois as três vias, purgativa, iluminativa e unitiva, com os estados místicos e o discernimento dos espíritos. Parágrafos numerados. Décima edição (Desclée, 1928).'},
        editions={'fr-FR': {'editor': 'Desclée et Cie, Tournai (10th ed.)', 'year': 1928}},
        sources=[{'language': 'fr-FR', 'url': 'https://archive.org/details/precisdetheologi0000tanq', 'edition': 'Précis de théologie ascétique et mystique, 10e éd., Tournai: Desclée, imprimatur 1928 (archive.org OCR text); the alphabetical table is not imported'}])
    print(finish('tanquerey-opera-omnia/precis-de-theologie-ascetique-et-mystique', m1, {'fr-FR': fr}, srcs=[('french-originals', T + 'precisdetheologi0000tanq.txt', 'precis-1928-archive-org.txt')]))
    m2 = dict(base, id='tanquerey-spiritual-life-branderis',
        name={'fr-FR': 'La Vie spirituelle (traduction anglaise du Précis)', 'en-US': 'The Spiritual Life: A Treatise on Ascetical and Mystical Theology', 'pt-BR': 'A vida espiritual: tratado de teologia ascética e mística'},
        description={'en-US': 'Herman Branderis’s English translation of the Précis de théologie ascétique et mystique: the principles of the supernatural life, perfection and its means, the purgative, illuminative and unitive ways, mystical states and the discernment of spirits. Numbered paragraphs. Second revised edition (Desclée, Tournai, 1930).',
                     'pt-BR': 'Tradução inglesa de Herman Branderis do Précis de théologie ascétique et mystique: os princípios da vida sobrenatural, a perfeição e seus meios, as três vias, os estados místicos e o discernimento dos espíritos. Segunda edição revista (Desclée, 1930).'},
        editions={'en-US': {'translator': 'Herman Branderis, S.S.', 'year': 1930}},
        sources=[{'language': 'en-US', 'url': 'https://archive.org/details/spirituallifetre0000tanq', 'edition': 'The Spiritual Life, tr. Herman Branderis, S.S., 2nd rev. ed., Tournai: Desclée, imprimatur Baltimore 24 May 1930 (archive.org OCR text, GTU scan); the index is not imported'}])
    print(finish('tanquerey-opera-omnia/spiritual-life-branderis', m2, {'en-US': en}, srcs=[('english-originals', T + 'spirituallifetre0000tanq.txt', 'spiritual-life-1930-archive-org.txt')]))
    authors()


if __name__ == '__main__':
    run()
