import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
T = RAW + 'tanquerey/'
NUM = re.compile(r'^(\d{1,4})\.\s+\S')


def body_range(L):
    idx = [(i, int(m.group(1))) for i, l in enumerate(L) if (m := NUM.match(re.sub(r'\s+', ' ', l.strip())))]
    start = 0
    for k, (i, n) in enumerate(idx):
        win = idx[k:k + 6]
        if i > 150 and n <= 10 and len(win) == 6 and win[-1][0] - i < 400 and all(0 < b[1] - a[1] <= 3 for a, b in zip(win, win[1:])):
            start = i
            break
    end = next((i for i in range(start + 2000, len(L)) if re.match(r'^\s*(INDEX|TABULA)\s+(RERUM\s+)?(ALPHABET|ANALYT)', L[i], re.I)), len(L))
    return start, end


def fixla(s):
    return s


def sections(L, start, end, tk, ttitle, per=9000):
    hd = auto_heads(L)
    paras, notes = oc.clean([x.replace('\x0c', '') for x in L[start:end]], hd, 'num')
    nodes, cur, wc, first = [], [], 0, None
    last = None
    prev = None

    def flush():
        nonlocal cur, wc, first, last
        if not cur:
            return
        k = len(nodes) + 1
        t = f'Nn. {first}–{last}' if first and last else f'Pars {k}'
        nodes.append(dict(kind='u', id=f't{tk}-s{k:02d}', title=t, parent=(f't{tk}', ttitle), paras=cur, notes={}, wc=wc))
        cur, wc, first = [], 0, None
    for p in paras:
        if junk(p):
            continue
        m = NUM.match(p)
        if m:
            n = int(m.group(1))
            if wc >= per:
                flush()
            if prev is None or prev < n <= prev + 40:
                prev = n
                if first is None:
                    first = m.group(1)
                last = m.group(1)
        cur.append(re.sub(r'\[\^\d+\]', '', p))
        wc += len(p.split())
    flush()
    return nodes


def book(slug, id, files, names, desc_la, desc_en, desc_pt, composed, work, year, edition_note, src_urls, ed_note, per=9000, tomes=None):
    nodes = []
    for k, fn in enumerate(files, 1):
        L = load(T + fn)
        a, b = body_range(L)
        print(fn, a, b, len(L))
        nodes += sections(L, a, b, k, f'Tomus {roman(k)}' if len(files) > 1 else 'Textus', per)
    meta = dict(id=id, cover='quarter', name=names, author={'la': 'Adolphus Tanquerey', 'en-US': 'Adolphe Tanquerey', 'pt-BR': 'Adolphe Tanquerey', 'fr-FR': 'Adolphe Tanquerey'},
                description={'la': desc_la, 'en-US': desc_en, 'pt-BR': desc_pt}, composed=composed, work=work,
                editions={'la': {'editor': ed_note, 'year': year}},
                sources=[{'language': 'la', 'url': 'https://archive.org/details/' + u, 'edition': edition_note} for u in src_urls])
    wc = finish('tanquerey-opera-omnia/' + slug, meta, {'la': nodes}, srcs=[('latin-originals', T + fn, f'{slug}-{i+1}-archive-org.txt') for i, fn in enumerate(files)])
    print(slug, wc, len(nodes))


B = {
 'dog': lambda: book('synopsis-theologiae-dogmaticae', 'tanquerey-synopsis-theologiae-dogmaticae', ['synopsistheologi01tanq.txt', 'synopsistheologi02tanq.txt', 'synopsistheologi03tanq.txt'],
    {'la': 'Synopsis theologiae dogmaticae', 'en-US': 'Synopsis of Dogmatic Theology', 'pt-BR': 'Sinopse de teologia dogmática'},
    'Compendium theologiae dogmaticae ad mentem S. Thomae : de vera religione et Ecclesia (tomus I), de Deo uno et trino, creante et elevante, de Verbo incarnato (tomus II), de gratia, sacramentis et novissimis (tomus III). Editio decima octava, Desclée, 1921; paragraphi numerati.',
    'The Latin seminary manual of dogmatic theology according to St. Thomas: the true religion and the Church (vol. I), God one and triune, creating and elevating, the Incarnate Word (vol. II), grace, the sacraments and the last things (vol. III). 18th edition, Desclée, 1921. Divided by runs of the author’s numbered paragraphs.',
    'O manual latino de teologia dogmática segundo São Tomás: a verdadeira religião e a Igreja, Deus uno e trino, criador e elevador, o Verbo encarnado, a graça, os sacramentos e os novíssimos. 18.ª edição, 1921. Dividido por séries dos parágrafos numerados do autor.',
    '1894', 'tanquerey/synopsis-theologiae-dogmaticae', 1921, 'Synopsis theologiae dogmaticae ad mentem S. Thomae Aquinatis hodiernis moribus accommodata, ed. 18, Tournai: Desclée, 1921 (archive.org OCR text, BYU copies); the alphabetical indexes are not imported and the text is divided by runs of numbered paragraphs, not by the author’s tractates',
    ['synopsistheologi01tanq', 'synopsistheologi02tanq', 'synopsistheologi03tanq'], 'Desclée et Soc., Tournai (18th ed.)'),
 'mor': lambda: book('synopsis-theologiae-moralis', 'tanquerey-synopsis-theologiae-moralis', ['synopsistheolog01tanq.txt', 'synopsistheolog02tanq.txt', 'synopsistheolog03tanq.txt'],
    {'la': 'Synopsis theologiae moralis et pastoralis', 'en-US': 'Synopsis of Moral and Pastoral Theology', 'pt-BR': 'Sinopse de teologia moral e pastoral'},
    'Compendium theologiae moralis et pastoralis : de paenitentia, matrimonio et ordine (tomus I), theologia moralis fundamentalis, virtutes et praecepta (tomus II), de iustitia et de variis statuum obligationibus (tomus III). Editio septima, Desclée, 1922; paragraphi numerati.',
    'The Latin manual of moral and pastoral theology: penance, marriage and orders (vol. I), fundamental moral theology, the virtues and the precepts (vol. II), justice and the obligations of the various states of life (vol. III). 7th edition, Desclée, 1922. Divided by runs of the author’s numbered paragraphs.',
    'O manual latino de teologia moral e pastoral: penitência, matrimônio e ordem, teologia moral fundamental, as virtudes e os preceitos, a justiça e as obrigações dos diversos estados. 7.ª edição, 1922. Dividido por séries dos parágrafos numerados do autor.',
    '1902', 'tanquerey/synopsis-theologiae-moralis-et-pastoralis', 1922, 'Synopsis theologiae moralis et pastoralis, ed. 7, Tournai: Desclée, 1922 (archive.org OCR text, PIMS Toronto copies); the alphabetical indexes are not imported and the text is divided by runs of numbered paragraphs, not by the author’s tractates',
    ['synopsistheolog01tanq', 'synopsistheolog02tanq', 'synopsistheolog03tanq'], 'Desclée et Soc., Tournai (7th ed.)'),
 'bdog': lambda: book('brevior-synopsis-theologiae-dogmaticae', 'tanquerey-brevior-synopsis-dogmaticae', ['breviorsynopsist00tanq.txt'],
    {'la': 'Brevior synopsis theologiae dogmaticae', 'en-US': 'Shorter Synopsis of Dogmatic Theology', 'pt-BR': 'Sinopse breve de teologia dogmática'},
    'Epitome synopsis theologiae dogmaticae in usum seminariorum, cum E.-M. Quévastre et L. Hébert. Editio tertia, 1919; paragraphi numerati.', 'The shorter Latin dogmatic manual for seminaries, with E.-M. Quévastre and L. Hébert. 3rd edition, 1919. Divided by runs of the author’s numbered paragraphs.', 'O manual breve de teologia dogmática para os seminários. 3.ª edição, 1919. Dividido por séries dos parágrafos numerados do autor.',
    '1911', 'tanquerey/brevior-synopsis-theologiae-dogmaticae', 1919, 'Brevior synopsis theologiae dogmaticae, ed. 3, Tournai: Desclée, 1919 (archive.org breviorsynopsist00tanq, OCR text); divided by runs of numbered paragraphs', ['breviorsynopsist00tanq'], 'Desclée et Soc., Tournai (3rd ed.)'),
 'bmor': lambda: book('brevior-synopsis-theologiae-moralis', 'tanquerey-brevior-synopsis-moralis', ['breviorsynopsist0000unse.txt'],
    {'la': 'Brevior synopsis theologiae moralis et pastoralis', 'en-US': 'Shorter Synopsis of Moral and Pastoral Theology', 'pt-BR': 'Sinopse breve de teologia moral e pastoral'},
    'Epitome synopsis theologiae moralis et pastoralis in usum seminariorum. Editio duodecima penitus recognita, Cimetier et Cancé, 1946; paragraphi numerati.', 'The shorter Latin manual of moral and pastoral theology for seminaries, 12th edition thoroughly revised by F. Cimetier and A. Cancé (1946). Divided by runs of the author’s numbered paragraphs.', 'O manual breve de teologia moral e pastoral para os seminários, 12.ª edição revista por F. Cimetier e A. Cancé (1946). Dividido por séries dos parágrafos numerados do autor.',
    '1913', 'tanquerey/brevior-synopsis-theologiae-moralis-et-pastoralis', 1946, 'Brevior synopsis theologiae moralis et pastoralis, ed. 12 recognita, Tournai: Desclée, 1946 (archive.org breviorsynopsist0000unse, OCR text); divided by runs of numbered paragraphs', ['breviorsynopsist0000unse'], 'Desclée et Soc., Tournai (12th ed., revised by F. Cimetier and A. Cancé)'),
}
if __name__ == '__main__':
    for k in sys.argv[1:]:
        B[k]()
