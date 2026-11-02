import re, sys
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from fds_clean import clean, finish
from fds_common import *
DL = '/Users/gustavo/Documents/prayer/research/sourcing/francis-de-sales/dl'
SER = re.compile(r'^␂?\s*(PREMI[ÈE]RE|DEUXI[ÈE]ME|TROISI[ÈE]ME|QUATRI[ÈE]ME|CINQUI[ÈE]ME|SIXI[ÈE]ME) S[ÉE]RIE', re.I)
END = re.compile(r'^␂?\s*(TABLE (DES|ANALYTIQUE|G[ÉE]N)|INDEX|ERRATA|ADDITIONS ET)', re.I)
def upper_ratio(s):
    L = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in L) / len(L) if L else 0
def is_head(p):
    return p.startswith('␂') and 8 < len(p) < 120 and upper_ratio(p) > 0.8 and sum(c.isalpha() for c in p) / len(p) > 0.7
def sent(s):
    s = re.sub(r'\s+', ' ', s).strip().rstrip('.,;')
    s = re.sub(r'[♦•]', '', s)
    s = re.sub(r'\s*\(\s*\w?\s*\)\s*$', '', s)
    s = re.sub(r'\s+(?:[A-Za-z]\d?\)|[wWuU])\s*$', '', s)
    s = s[:1] + s[1:].lower()
    for w in ['Dieu', 'Jésus', 'Christ', 'Marie', 'Vierge', 'Église', 'Visitation', 'Genève', 'Chablais', 'Annecy', 'Padoue', 'Savoie', 'Thonon', 'Gex', 'Rome', 'Paris', 'Saint', 'Sainte', 'Notre', 'Cantique', 'Cantiques', 'Granier', 'Charles-Emmanuel', 'Nostre']:
        s = re.sub(r'\b' + w.lower() + r'\b', w, s)
    return s[:1].upper() + s[1:]
def build(t, ann, series, desc_fr, desc_en, years):
    ps = finish(clean(f'{DL}/t{t}l.txt'))
    s0 = next(i for i, p in enumerate(ps) if SER.match(p) and i > 150)
    e0 = next((i for i in range(len(ps) - 1, s0, -1) if END.match(ps[i]) and len(ps[i]) < 60), len(ps))
    # keep the earliest END after 70% of the volume
    e0 = next((i for i in range(int(len(ps) * 0.7), len(ps)) if END.match(ps[i]) and len(ps[i]) < 60), len(ps))
    marks = []
    i = s0
    while i < e0:
        if is_head(ps[i]):
            j = i
            while j + 1 < e0 and j - i < 4 and is_head(ps[j + 1]):
                j += 1
            marks.append((i, j))
            i = j + 1
        else:
            i += 1
    chunks = []
    for n, (a, b) in enumerate(marks):
        nxt = marks[n + 1][0] if n + 1 < len(marks) else e0
        title = sent(' '.join(x.lstrip('␂') for x in ps[a:b + 1]))
        body = [p.lstrip('␂') for p in ps[b + 1:nxt]]
        chunks.append([title, body])
    # merge chunks that are too small into the previous one
    merged = []
    pre = [p.lstrip('␂') for p in ps[s0:marks[0][0]]] if marks else []
    for title, body in chunks:
        w = sum(len(x.split()) for x in body)
        if merged and w < 700:
            merged[-1][1] += ['## ' + title] + body
        else:
            merged.append([title, body])
    BK = f'opuscules-{ann.lower()}'
    tot = 0; toc = []
    seen = set()
    for n, (title, body) in enumerate(merged):
        cid = f'piece-{n + 1:02d}'
        title = title[:120]
        tot += write_chapter(BK, 'fr-FR', cid, title, body)
        toc.append(leaf(cid, fr_FR=title))
    ed = ann
    write_book(BK, f'sales-opuscules-{ann.lower()}',
      {'fr-FR': f'Opuscules de saint François de Sales, tome {ann}', 'en-US': f'Opuscules of St. Francis de Sales, vol. {ann}', 'pt-BR': f'Opúsculos de São Francisco de Sales, tomo {ann}'},
      {'fr-FR': desc_fr, 'en-US': desc_en, 'pt-BR': f'Os opúsculos de São Francisco de Sales no tomo {ann} da edição de Annecy ({series}).'},
      years, ['fr-FR'], {'fr-FR': {'editor': 'Religieuses de la Visitation d’Annecy', 'year': 1925 + int(t) - 22}},
      [FR_SRC('Francis’s text in the original spelling (and the Latin or Italian of some pieces), extracted from the PDF text layer (layout mode). Marginal references, the variants and footnotes, and the editors’ introductions and tables are not included. Chapters follow the printed section headings; short sections are folded into the preceding chapter under a second-level heading.', f't. {ann}: Opuscules, {1925 + int(t) - 22} (file {t})')], toc)
    return tot, len(merged), len(marks)
if __name__ == '__main__':
    cfg = {
     '22': ('XXII', 'Première et deuxième séries', 'Les opuscules du tome XXII de l’édition d’Annecy : Études et vie intime (cours de philosophie et de droit, règles pour la sainte communion, Exercices spirituels de Padoue, notes de théologie, poésies, testaments) et les écrits du début de l’apostolat dans le Chablais.', 'The opuscules in volume XXII of the Annecy edition: studies and inner life (philosophy and law notes, rules for Holy Communion, the Padua spiritual exercises, theology notes, verse, wills) and the writings of the early Chablais mission.', '1580-1599'),
     '23': ('XXIII', 'Troisième et quatrième séries', 'Les opuscules du tome XXIII de l’édition d’Annecy : les écrits de controverse (fragments sur la prédestination, brève méditation sur le Symbole, lettres au ministre Viret, fragment du livre IV de l’Estendart) et le début de l’administration épiscopale.', 'The opuscules in volume XXIII of the Annecy edition: the controversy writings (fragments on predestination, the brief meditation on the Creed, letters to the minister Viret, the fragment of Book IV of the Standard) and the start of the episcopal administration.', '1593-1622'),
     '24': ('XXIV', 'Quatrième série (suite)', 'Les opuscules du tome XXIV de l’édition d’Annecy : l’administration épiscopale (ordonnances, synodes diocésains, patentes), pour l’essentiel des pièces administratives et juridiques.', 'The opuscules in volume XXIV of the Annecy edition: the episcopal administration (ordinances, diocesan synods, patents), mostly short administrative and legal documents.', '1602-1622'),
     '25': ('XXV', 'Cinquième série : Visitation', 'Les opuscules du tome XXV de l’édition d’Annecy : la série consacrée à la Visitation (préface, règle de saint Augustin, Constitutions, Directoire spirituel, Coutumier).', 'The opuscules in volume XXV of the Annecy edition: the Visitation series (preface, Rule of St Augustine, Constitutions, Spiritual Directory, Customary).', '1610-1622'),
     '26': ('XXVI', 'Sixième série : Ascétisme et mystique', 'Les opuscules du tome XXVI de l’édition d’Annecy : ascétisme et mystique (Déclaration mystique sur le Cantique des Cantiques, fragments sur les vertus cardinales et sur Notre-Dame, Conseils aux Supérieurs, Similitudes, Avis, lettre sur la prédication).', 'The opuscules in volume XXVI of the Annecy edition: asceticism and mysticism (the mystical declaration on the Song of Songs, fragments on the cardinal virtues and Our Lady, counsels to superiors, similitudes, advices, the letter on preaching).', '1600-1622'),
    }
    for t in sys.argv[1:]:
        ann, ser, dfr, den, yrs = cfg[t]
        print(t, build(t, ann, ser, dfr, den, yrs))
