import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
from gl_perfection import fixfr, tfr
IA = RAW + 'garrigou-lagrange/ia/'
AUTH = {'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'la': 'Reginaldus Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'}


def sens_commun():
    f = load(IA + 'lesenscommunlaph00garr.txt')
    hd = auto_heads(f) + [re.compile(r'^\S{0,3}\s?[A-ZÉÈ][A-ZÉÈ\' ,\-:;’]{4,}\s*\S{0,4}$')]
    rx = re.compile(r'^CHAPITRE (PREMIER|DEUXI[EÈ]ME|[IVX]{1,4})$', re.I)
    kw = dict(prx=rx, urx=None, heads=hd, fix=fixfr, pre=pre_common, words=('Chapitre', 'Article', 'Introduction'), tfix=tfr, ptitle_lines=3)
    intro = chunk(f[160:874], 'intro', 'Préface et introduction', hd, fix=fixfr, pre=pre_common)
    a = parse(f[873:6190], **kw)
    b = parse(f[6190:10172], p0=2, **kw)
    ap = [chunk(f[10172:10374], 'appendice-1', 'Appendice I. Philosophie de l’être et ontologisme', hd, fix=fixfr, pre=pre_common), chunk(f[10374:11154], 'appendice-2', 'Appendice II', hd, fix=fixfr, pre=pre_common)]
    c = parse(f[11154:15088], p0=6, **kw)
    nodes = [intro] + a + b + ap + c
    print([(n['id'], n['wc'], n['title'][:40]) for n in nodes])
    meta = dict(id='garrigou-sens-commun', cover='quarter',
        name={'fr-FR': 'Le Sens commun, la philosophie de l’être et les formules dogmatiques', 'en-US': 'Common Sense, the Philosophy of Being and Dogmatic Formulas', 'pt-BR': 'O senso comum, a filosofia do ser e as fórmulas dogmáticas'},
        author={k: v for k, v in AUTH.items() if k != 'la'},
        description={'fr-FR': 'La philosophie de l’être contre le nominalisme et le conceptualisme : la théorie du sens commun, les preuves traditionnelles de l’existence de Dieu et la valeur des formules dogmatiques. Deuxième édition, 1922.',
                     'en-US': 'The philosophy of being against nominalism and conceptualism: the theory of common sense, the traditional proofs of the existence of God and the value of dogmatic formulas. Second edition, 1922.',
                     'pt-BR': 'A filosofia do ser contra o nominalismo e o conceptualismo: a teoria do senso comum, as provas tradicionais da existência de Deus e o valor das fórmulas dogmáticas. Segunda edição, 1922.'},
        composed='1909', work='garrigou-lagrange/sens-commun', editions={'fr-FR': {'editor': 'Nouvelle Librairie Nationale, Paris (2nd ed.)', 'year': 1922}},
        sources=[{'language': 'fr-FR', 'url': 'https://archive.org/details/lesenscommunlaph00garr', 'edition': 'Le Sens commun, la philosophie de l’être et les formules dogmatiques, 2e éd., Paris: Nouvelle Librairie Nationale, 1922 (Toronto scan, OCR text); chapters only'}])
    print(finish('garrigou-lagrange-opera-omnia/sens-commun', meta, {'fr-FR': nodes}, srcs=[('french-originals', IA + 'lesenscommunlaph00garr.txt', 'sens-commun-1922-archive-org.txt')]))


def fixla(s):
    s = re.sub(r'(\w)- (?=[a-z])', r'\1', s)
    return s


def revelatione():
    v = [load(IA + f'GarrigouLagrangeLatin--De_Revelatione_(vol._{n})_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt') for n in (1, 2)]
    urx = re.compile(r'^CAPUT\s+[IVXLH]{1,6}[.,]?(\s.{0,6})?$')
    nodes, u0 = [], 0
    spans = [(851, 33945), (2320, 28303)]
    pre1 = chunk(v[0][160:390], 'praefatio', 'Praefatio', auto_heads(v[0]), fix=fixla, pre=pre_common)
    nodes.append(pre1)
    for k, (a, b) in enumerate(spans):
        hd = auto_heads(v[k])
        part = parse(v[k][a:b], prx=None, urx=urx, heads=hd, fix=fixla, pre=pre_common, words=('Pars', 'Caput', 'Introductio'), u0=u0, continuous=True)
        u0 += len(part)
        nodes += part
    print([(n['id'], n['wc'], n['title'][:40]) for n in nodes])
    meta = dict(id='garrigou-de-revelatione', cover='quarter',
        name={'la': 'De revelatione per Ecclesiam catholicam proposita', 'fr-FR': 'De revelatione per Ecclesiam catholicam proposita', 'en-US': 'On Revelation as Proposed by the Catholic Church', 'pt-BR': 'Da revelação proposta pela Igreja católica'},
        author={'la': 'Reginaldus Garrigou-Lagrange', 'fr-FR': 'Réginald Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'},
        description={'la': 'Apologetica et theologia fundamentalis : de revelationis notione et possibilitate, de mysterio et dogmate, de credibilitate rationali, de Ecclesia et de eius notis. Editio emendata, 2 vol.',
                     'fr-FR': 'Apologétique et théologie fondamentale en latin : la notion et la possibilité de la révélation, le mystère et le dogme, la crédibilité rationnelle, l’Église et ses notes. Édition revue, 2 vol.',
                     'en-US': 'Apologetics and fundamental theology in Latin: the notion and possibility of revelation, mystery and dogma, rational credibility, the Church and her marks. Revised edition, 2 vols.',
                     'pt-BR': 'Apologética e teologia fundamental em latim: a noção e a possibilidade da revelação, mistério e dogma, credibilidade racional, a Igreja e suas notas. Edição revista, 2 vols.'},
        composed='1918', work='garrigou-lagrange/de-revelatione', editions={'la': {'editor': 'Garrigou-Lagrange (editio emendata, Ferrari, Rome)', 'year': 1950}},
        sources=[{'language': 'la', 'url': 'https://archive.org/details/GarrigouLagrangeLatin', 'edition': 'De Revelatione per Ecclesiam catholicam proposita, vol. 1-2 (editio emendata), archive.org GarrigouLagrangeLatin, OCR text; the indexes are not imported'}])
    print(finish('garrigou-lagrange-opera-omnia/de-revelatione', meta, {'la': nodes}, srcs=[('latin-originals', IA + f'GarrigouLagrangeLatin--De_Revelatione_(vol._{n})_-_Garrigou-Lagrange,_Reginald,_O.P__djvu.txt', f'de-revelatione-vol{n}-archive-org.txt') for n in (1, 2)]))


if __name__ == '__main__':
    for a in sys.argv[1:]:
        globals()[a]()
