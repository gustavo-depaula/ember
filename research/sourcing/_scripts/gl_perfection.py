import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
IA = RAW + 'garrigou-lagrange/ia/'
OUT = REPO + '/content/books/garrigou-lagrange-opera-omnia/perfection-chretienne-et-contemplation'
HF = [re.compile(r'^\S{0,3}\s?PERFECTION CHR.TIENNE ET CONTEMPLATION\s*\S{0,4}$'), re.compile(r'^\d{0,3}\s*[A-ZÉÈ][A-ZÉÈ\' ,\-]{4,}\s*\d{0,3}$')]
HE = [re.compile(r'^\d{0,3}\s*[A-Z][A-Z\'’ ,\-:;]{4,}\s*\d{0,3}$')]
def fixfr(s):
    s = oc.fix_fr(s)
    s = re.sub(r'(Saint|Jean|Esprit)- (?=[A-Z])', r'\1-', s)
    return s.replace("'", '’')
def fixen(s):
    return s.replace('¬', '')

def tfr(t):
    t = re.sub(r'^(Article \w+\. )Yle ', r'\1Vie ', re.sub(r"(\w['’]) ", r'\1', t)).replace("'", '’')
    return re.sub(r'\s+([:;?!»])', r' \1', t.replace('"', '')).strip()
if __name__ == '__main__':
    v1 = load(IA + 'perfectionchrtie01garr.txt'); v2 = load(IA + 'perfectionchrtie02garr.txt')
    prx = re.compile(r'^CHAPITRE (PREMIER|[IVXY]{1,5})$', re.I); urx = re.compile(r'^ARTICLE (I\S{0,3}|[IVXY]{1,4})$', re.I)
    kw = dict(prx=prx, urx=urx, heads=HF, fix=fixfr, pre=pre_common, words=('Chapitre', 'Article', 'Introduction'), tfix=tfr)
    intro = chunk(v1[118:1040], 'intro', 'Introduction', HF, fix=fixfr, pre=pre_common)
    n1 = parse(v1[1040:18200], **kw)
    n2 = parse(v2[112:15767], p0=4, **kw)
    app = chunk(v2[15767:21420], 'appendices', 'Appendices', HF, fix=fixfr, pre=pre_common)
    fr = [intro] + n1 + n2 + [app]
    en_lines = load(IA + 'christianperfection_202001.txt')
    kwe = dict(prx=re.compile(r'^CHAPTER [IVX]{1,5}$'), urx=re.compile(r'^ARTICLE ([IVXl1]{1,4}|11)$', re.I), heads=HE, fix=fix_en, pre=pre_common, words=('Chapter', 'Article', 'Introduction'))
    pref = chunk(en_lines[9:148], 'preface', "Author's preface to the English edition", HE, fix=fixen, pre=pre_common)
    eintro = chunk(en_lines[769:1409], 'intro', 'Introduction', HE, fix=fixen, pre=pre_common)
    en = parse(en_prepare(en_lines[1405:24043], HE), **kwe)
    eintro['paras'] = ['## Author’s preface to the English edition'] + pref['paras'] + ['## Introduction'] + eintro['paras']
    en = [eintro] + en
    meta = dict(id='garrigou-perfection-chretienne-contemplation', cover='quarter',
        name={'fr-FR': 'Perfection chrétienne et contemplation selon saint Thomas d’Aquin et saint Jean de la Croix', 'en-US': 'Christian Perfection and Contemplation according to St. Thomas Aquinas and St. John of the Cross', 'pt-BR': 'Perfeição cristã e contemplação segundo São Tomás de Aquino e São João da Cruz'},
        author={'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'},
        description={'fr-FR': 'Le livre qui lança le débat sur la contemplation : la perfection chrétienne consiste surtout dans la charité, et la contemplation infuse des mystères de la foi se trouve dans la voie normale de la sainteté. Problème mystique actuel, doctrines fondamentales de saint Thomas, perfection, contemplation infuse, appel à la vie mystique, et appendices. Première édition (Éditions de la Vie Spirituelle, 1923).',
            'en-US': 'The book that opened the debate on contemplation: Christian perfection consists especially in charity, and infused contemplation of the mysteries of faith lies in the normal way of sanctity. The present mystical problem, the fundamental doctrines of St. Thomas, perfection, infused contemplation and the call to the mystical life. French of 1923 with the Herder English of 1937; the translation omits the last chapter and the appendices of the French.',
            'pt-BR': 'O livro que abriu o debate sobre a contemplação: a perfeição cristã consiste sobretudo na caridade, e a contemplação infusa dos mistérios da fé está na via normal da santidade. O problema místico atual, as doutrinas fundamentais de São Tomás, a perfeição, a contemplação infusa, o chamado à vida mística e apêndices.'},
        composed='1923', work='garrigou-lagrange/perfection-chretienne-et-contemplation',
        editions={'fr-FR': {'editor': 'Éditions de la Vie Spirituelle, Saint-Maximin (2 vol.)', 'year': 1923}, 'en-US': {'translator': 'Sr. M. Timothea Doyle, O.P.', 'year': 1937}},
        sources=[{'language': 'fr-FR', 'url': 'https://archive.org/details/perfectionchrtie01garr', 'edition': 'Perfection chrétienne et contemplation, t. I, Éditions de la Vie Spirituelle, Saint-Maximin, 1923 (Toronto scan, OCR text)'},
                 {'language': 'fr-FR', 'url': 'https://archive.org/details/perfectionchrtie02garr', 'edition': 'Id., t. II, 1923; the alphabetical index is not imported'},
                 {'language': 'en-US', 'url': 'https://archive.org/details/christianperfection_202001', 'edition': 'Christian Perfection and Contemplation, tr. Sr. M. Timothea Doyle, O.P., St. Louis: B. Herder, 1937 (Claremont scan, OCR text); chapters VI of the French and the appendices are not in the translation'}])
    print(finish('garrigou-lagrange-opera-omnia/perfection-chretienne-et-contemplation', meta, {'fr-FR': fr, 'en-US': en}, srcs=[('french-originals', IA+'perfectionchrtie01garr.txt', 'perfection-chretienne-1923-t1-archive-org.txt'), ('french-originals', IA+'perfectionchrtie02garr.txt', 'perfection-chretienne-1923-t2-archive-org.txt'), ('english-originals', IA+'christianperfection_202001.txt', 'christian-perfection-1937-doyle-archive-org.txt')]))
from gltq_engine import authors; authors()
