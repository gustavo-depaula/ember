import re, sys, glob, os
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gltq_engine import *
IA = RAW + 'garrigou-lagrange/ia/'
ART = re.compile(r'^(?:Art\.?|ARTICULUS|Articulus)\s+([IVXLl1]{1,6})[.,]?\s*[—–\-]+\s*(\S.*)$')


def build(slug, id, pattern, la_name, en_name, pt_name, la_desc, en_desc, pt_desc, composed, work, year):
    fn = glob.glob(IA + pattern)[0]
    L = load(fn)
    heads = auto_heads(L)
    marks = []
    for i, l in enumerate(L):
        m = ART.match(re.sub(r'\s+', ' ', l).strip())
        if m and i > 300:
            marks.append((i, m.group(1), m.group(2)))
    first = marks[0][0]
    # end: first INDEX heading in the last quarter
    end = next((i for i in range(int(len(L) * 0.75), len(L)) if re.match(r'^\s*INDEX\b', L[i])), len(L))
    pre_a = next((i for i in range(100, first) if re.match(r'^\s*(PRAEFATIO|PROOEMIUM|INTRODUCTIO|PROLEGOMENA)\b', L[i])), 150)
    nodes = [chunk(L[pre_a:first], 'prolegomena', 'Prolegomena', heads, fix=lambda s: s, pre=pre_common)]
    q, a = 0, 0
    for k, (i, rn, title) in enumerate(marks):
        j = marks[k + 1][0] if k + 1 < len(marks) else end
        if j > end:
            j = end
        if i >= end:
            break
        if rn in ('I', 'l', '1', 'Ι'):
            q += 1
            a = 0
        elif q == 0:
            q = 1
        a += 1
        t = re.sub(r'\s+', ' ', title).strip(' .»«')
        n = chunk(L[i + 1:j], f'q{q}-a{a}', f'Sectio {q}, art. {a}: {t[:140]}', heads, fix=lambda s: s, pre=pre_common, parent=(f'q{q}', f'Sectio {q}'))
        nodes.append(n)
    out = []
    for n in nodes:
        if n['wc'] <= 30000:
            out.append(n)
            continue
        k = -(-n['wc'] // 15000)
        tgt, cur, parts = n['wc'] / k, [], []
        w = 0
        for ptxt in n['paras']:
            cur.append(ptxt)
            w += len(ptxt.split())
            if w >= tgt and len(parts) < k - 1:
                parts.append(cur)
                cur, w = [], 0
        parts.append(cur)
        par = n['parent'] or (n['id'], n['title'])
        for j, ps in enumerate(parts, 1):
            out.append(dict(n, id=f"{n['id']}-p{j}", title=f"{n['title'][:110]} (pars {j})", parent=par, paras=ps, notes=n['notes'] if j == 1 else {}, wc=sum(len(x.split()) for x in ps)))
    nodes = out
    print(slug, len(nodes), sum(n['wc'] for n in nodes), q)
    meta = dict(id=id, cover='quarter', name={'la': la_name, 'en-US': en_name, 'pt-BR': pt_name},
                author={'la': 'Reginaldus Garrigou-Lagrange', 'en-US': 'Reginald Garrigou-Lagrange', 'pt-BR': 'Reginaldo Garrigou-Lagrange'},
                description={'la': la_desc, 'en-US': en_desc, 'pt-BR': pt_desc}, composed=composed, work=work, editions={'la': {'editor': 'Garrigou-Lagrange (Marietti, Turin / Desclée)', 'year': year}},
                sources=[{'language': 'la', 'url': 'https://archive.org/details/GarrigouLagrangeLatin', 'edition': f'{la_name}, archive.org GarrigouLagrangeLatin, OCR text; divided by the Summa’s articles ("Art. N — Utrum …") found in the OCR, the indexes left out'}])
    print(finish('garrigou-lagrange-opera-omnia/' + slug, meta, {'la': nodes}, srcs=[('latin-originals', fn, slug + '-archive-org.txt')]))


P = 'GarrigouLagrangeLatin--'
BK = [
 ('de-deo-uno', 'garrigou-de-deo-uno', P + 'De_Deo_Uno*', 'De Deo uno: commentarium in Summam theologicam S. Thomae (I, qq. 1-26)', 'On the One God (Latin): commentary on the Summa I, qq. 1-26', 'De Deo uno (latim): comentário à Suma I, qq. 1-26',
  'Commentarium in primam partem Summae theologicae, quaestiones 1-26 : de sacra doctrina, de existentia Dei, de Dei attributis.', 'The Latin commentary on the Summa theologiae I, qq. 1-26: sacred doctrine, the existence of God and His attributes.', 'O comentário latino à Suma teológica I, qq. 1-26: a doutrina sagrada, a existência de Deus e seus atributos.', '1938', 'garrigou-lagrange/de-deo-uno', 1938),
 ('de-deo-trino-et-creatore', 'garrigou-de-deo-trino-et-creatore', P + 'De_Deo_Trino*', 'De Deo trino et creatore: commentarium in Summam theologicam S. Thomae (I, qq. 27-119)', 'On God Triune and Creator (Latin): commentary on the Summa I, qq. 27-119', 'De Deo trino et creatore (latim): comentário à Suma I, qq. 27-119',
  'Commentarium in primam partem Summae theologicae, quaestiones 27-119 : de Trinitate, de creatione, de angelis, de homine.', 'The Latin commentary on the Summa theologiae I, qq. 27-119: the Trinity, creation, the angels and man.', 'O comentário latino à Suma teológica I, qq. 27-119: a Trindade, a criação, os anjos e o homem.', '1943', 'garrigou-lagrange/de-deo-trino-et-creatore', 1943),
 ('de-christo-salvatore', 'garrigou-de-christo-salvatore', P + 'De_Christo*', 'De Christo Salvatore: commentarium in Summam theologicam S. Thomae (III, qq. 1-59)', 'On Christ the Saviour (Latin): commentary on the Summa III', 'De Christo Salvatore (latim): comentário à Suma III',
  'Commentarium in tertiam partem Summae theologicae : de Incarnatione, de scientia et gratia Christi, de eius vita et passione.', 'The Latin commentary on the Summa theologiae III: the Incarnation, Christ’s knowledge and grace, His life and Passion.', 'O comentário latino à Suma teológica III: a Encarnação, a ciência e a graça de Cristo, sua vida e Paixão.', '1945', 'garrigou-lagrange/de-christo-salvatore', 1945),
 ('de-gratia', 'garrigou-de-gratia', P + 'De_Gratia*', 'De gratia: commentarium in Summam theologicam S. Thomae (I-II, qq. 109-114)', 'On Grace (Latin): commentary on the Summa I-II, qq. 109-114', 'De gratia (latim): comentário à Suma I-II, qq. 109-114',
  'Commentarium in Summam theologicam I-II, quaestiones 109-114 : de necessitate, essentia et causa gratiae, de iustificatione et merito.', 'The Latin commentary on the Summa theologiae I-II, qq. 109-114: the necessity, essence and cause of grace, justification and merit.', 'O comentário latino à Suma teológica I-II, qq. 109-114: a necessidade, essência e causa da graça, justificação e mérito.', '1946', 'garrigou-lagrange/de-gratia', 1946),
 ('de-eucharistia', 'garrigou-de-eucharistia', P + 'De_Eucharistia*', 'De Eucharistia, accedunt de Paenitentia quaestiones', 'On the Eucharist (Latin), with questions on Penance', 'De Eucharistia (latim), com questões sobre a Penitência',
  'Commentarium in Summam theologicam III, quaestiones 73-83, accedunt de Paenitentia quaestiones.', 'The Latin commentary on the Summa theologiae III, qq. 73-83 on the Eucharist, with questions on Penance.', 'O comentário latino à Suma teológica III, qq. 73-83, sobre a Eucaristia, com questões sobre a Penitência.', '1943', 'garrigou-lagrange/de-eucharistia', 1943),
 ('de-virtutibus-theologicis', 'garrigou-de-virtutibus-theologicis', P + 'De_Virtutibus*', 'De virtutibus theologicis: commentarium in Summam theologicam S. Thomae', 'On the Theological Virtues (Latin): commentary on the Summa II-II', 'As virtudes teologais (latim): comentário à Suma II-II',
  'Commentarium in Summam theologicam II-II, de fide, spe et caritate.', 'The Latin commentary on the Summa theologiae II-II on faith, hope and charity.', 'O comentário latino à Suma teológica II-II sobre a fé, a esperança e a caridade.', '1948', 'garrigou-lagrange/de-virtutibus-theologicis', 1948),
 ('de-beatitudine', 'garrigou-de-beatitudine', P + 'De_beatitudine*', 'De beatitudine: commentarium in Summam theologicam S. Thomae (I-II, qq. 1-54)', 'On Beatitude (Latin): commentary on the Summa I-II, qq. 1-54', 'De beatitudine (latim): comentário à Suma I-II, qq. 1-54',
  'Commentarium in Summam theologicam I-II, quaestiones 1-54 : de ultimo fine, de beatitudine, de actibus humanis, de passionibus et habitibus.', 'The Latin commentary on the Summa theologiae I-II, qq. 1-54: the last end, beatitude, human acts, passions and habits.', 'O comentário latino à Suma teológica I-II, qq. 1-54: o fim último, a bem-aventurança, os atos humanos, as paixões e os hábitos.', '1951', 'garrigou-lagrange/de-beatitudine', 1951),
]
if __name__ == '__main__':
    for b in BK:
        if not sys.argv[1:] or b[0] in sys.argv[1:]:
            build(*b)
