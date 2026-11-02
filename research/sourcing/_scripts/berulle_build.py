import sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *

L = open(ROOT / 'research/sourcing/berulle/oc1856_djvu.txt', encoding='utf-8').read().split('\n')
BASE = ROOT / 'content/books/berulle-opera-omnia'
CH = re.compile(r'^\W{0,3}C[HIUl]{1,3}A[PIT]?[A-Z]{1,5}\s+(PREMIER|[IVXLlÏÎ1|!]{1,7}[.,:]?|V[IL]{1,3}[ï.]?)\s*[.\-—]*$', re.I)
DI = re.compile(r'^\W{0,3}DISC[OL]\w{0,4}\s+(PREMIER|[IVXLMlÏÎ1|]{1,7})\s*[.,]?$', re.I)


def build(slug, rng, head, word, fr_title, extra_lead_title=None, lead_title=None, extra=None):
    a, b = rng
    lead, secs = sections(L, a, b, head, word, extra)
    out = []
    if lead_title:
        bl = clean_paras(blocks(lead))
        w = write_md(BASE / slug / 'fr-FR' / 'avant-propos.md', lead_title, bl)
        out.append(('avant-propos', lead_title, w))
    for k, (n, lines) in enumerate(secs):
        nxt = secs[k + 1][0] if k + 1 < len(secs) else n + 1
        bl = blocks(lines)
        sub, body = subtitle_and_body(bl)
        label = f'{n}–{nxt - 1}' if nxt - 1 > n else f'{n}'
        title = title_from(f'{word} {label}', sub)
        cid = f'{word.lower()}-{n:02d}'
        paras = clean_paras(body)
        w = write_md(BASE / slug / 'fr-FR' / f'{cid}.md', title, paras)
        out.append((cid, title, w))
    return out

if __name__ == '__main__':
    which = sys.argv[1]
    r = []
    if which == 'grandeurs':
        r = build('grandeurs-de-jesus', (6732, 28311), DI, 'Discours', None, lead_title='Dédicace, approbations et préface', extra={21544: 9})
    if which == 'vie':
        r = build('vie-de-jesus', (28311, 35921), CH, 'Chapitre', None, lead_title='Dédicace au roi et préambule')
    if which == 'mad':
        r = build('elevation-sainte-madeleine', (37755, 42054), CH, 'Chapitre', None, lead_title='Épître à la reine d’Angleterre')
    for x in r:
        print(x)

from grouped import *
LET = re.compile(r'^\W{0,3}LETTRE\s+(PREMI[EÈ]RE|[IVXLCcexÏÎ1|!yYuUhH\s]{1,12})\s*[.,]?\s*$', re.I)

def letter_head(line):
    t = re.sub(r"[^A-Za-zÀ-ÿ0-9|!.\s]", ' ', line.strip()).split()
    if len(t) < 2 or len(t) > 5:
        return None
    first = t[0].upper().replace('.', '')
    if first.startswith('PREMI') or (len(t) >= 2 and t[1].upper().startswith('PREMI')):
        pass
    import difflib
    if len(first) < 4 or len(first) > 9 or difflib.SequenceMatcher(None, first, 'LETTRE').ratio() < 0.62:
        return None
    rest = ''.join(t[1:]).upper().replace('.', '')
    if rest.startswith('PREMI'):
        return 1
    if not re.fullmatch(r"[IVXLCEÏÎ1|!YUH]{1,12}", rest):
        return None
    return rom_pieces(rest.replace('E', 'I') if rest.count('E') and not rest.startswith('E') else rest)


def find_letters(a, b, maxn=260, jump=12):
    prev, out = 0, []
    for i in range(a, b):
        if len(L[i].strip()) > 40:
            continue
        n = letter_head(L[i])
        if n and prev < n <= min(prev + jump, maxn):
            out.append((n, i)); prev = n
    return out

def single(slug, a, b, cid, title, extra=None):
    ps = clean_paras(blocks(L[a:b], extra))
    return (cid, title, write_md(BASE / slug / 'fr-FR' / f'{cid}.md', title, ps))


def sectioned(slug, spans):
    """spans: [(start line, cid, title)] in order, ending with (end, None, None)."""
    out = []
    for (a, cid, title), (b, _, _) in zip(spans, spans[1:]):
        out.append(single(slug, a, b, cid, title))
    return out


def run_all(which):
    D = BASE
    if which == 'elevations':
        return sectioned('elevations', [(35921, 'elevation-a-jesus', 'Élévation à Jésus sur ses principaux états et mystères'), (36434, 'elevation-trinite', 'Élévation à la très sainte Trinité sur le mystère de l’Incarnation'), (37053, 'elevation-part-de-marie', 'Élévation à Dieu et à la Vierge sur la part de Marie dans le mystère de l’Incarnation'), (37703, 'oraison-a-marie', 'Oraison à la très sainte Vierge Marie, Mère de Dieu'), (37755, None, None)])
    if which == 'voeux':
        return sectioned('voeux-de-servitude', [(42531, 'voeux-a-jesus-et-a-marie', 'Narré des vœux de servitude et récit des persécutions qu’ils ont excitées'), (44749, 'voeu-a-dieu', 'Vœu à Dieu sur le mystère de l’Incarnation'), (45051, 'voeu-a-marie', 'Vœu à Marie'), (45285, 'approbations', 'Approbation des vœux et élévations précédentes'), (45768, None, None)])
    if which == 'controverse':
        r = []
        r += build('controverse', (45768, 53400), DI, 'Discours', None, extra=None) if False else []
        lead, secs = sections(L, 45768, 53400, DI, 'Discours')
        for k, (n, lines) in enumerate(secs):
            sub, body = subtitle_and_body(blocks(lines))
            cid = f'controverse-{n:02d}'
            title = title_from(f'Discours de controverse {n}', sub)
            r.append((cid, title, write_md(D / 'controverse/fr-FR' / f'{cid}.md', title, clean_paras(body))))
        lead2, secs2 = sections(L, 53400, 56338, DI, 'Discours')
        avis = clean_paras(blocks(lead2))
        r.append(('eucharistie-avis', 'Discours sur l’Eucharistie : avis au lecteur', write_md(D / 'controverse/fr-FR/eucharistie-avis.md', 'Discours sur l’Eucharistie : avis au lecteur', avis)))
        for k, (n, lines) in enumerate(secs2):
            sub, body = subtitle_and_body(blocks(lines))
            cid = f'eucharistie-{n:02d}'
            title = title_from(f'Sur l’Eucharistie, discours {n}', sub)
            r.append((cid, title, write_md(D / 'controverse/fr-FR' / f'{cid}.md', title, clean_paras(body))))
        r += build_chunks(L, 56338, 58811, D / 'controverse/fr-FR', 'opuscules', 'Opuscules divers contre les hérétiques', size=9000)
        return r
    if which == 'memorial':
        return build('memorial-de-direction', (58811, 60809), CH, 'Chapitre', None, lead_title='Mémorial de direction pour les supérieurs : avant-propos')
    if which == 'energumenes':
        return build('traite-des-energumenes', (60809, 63936), CH, 'Chapitre', None, lead_title=None)
    if which == 'piete':
        r = [single('oeuvres-de-piete', 63936, 66520, 'abnegation', 'Bref discours de l’abnégation intérieure')]
        f = find_pieces(L, 66520, 99463, 203, jump=10)
        r += build_groups(L, 66520, 99463, f, D / 'oeuvres-de-piete/fr-FR', 'opuscules', 'Opuscule', 10, 'Opuscules de piété', pieces_rest=True)
        return r
    if which == 'lettres':
        f = find_letters(99463, 110438)
        r = build_groups(L, 99463, 110438, f, D / 'lettres/fr-FR', 'carmelites', 'Lettre', 20, 'Aux religieuses carmélites', pieces_rest=False)
        r += build_chunks(L, 110438, 114509, D / 'lettres/fr-FR', 'oratoire', 'Aux Pères de l’Oratoire', size=8000)
        r += build_chunks(L, 114509, 120905, D / 'lettres/fr-FR', 'diverses', 'À diverses personnes', size=8000)
        r += build_chunks(L, 120905, 121766, D / 'lettres/fr-FR', 'mariage-henriette', 'Lettres relatives au mariage d’Henriette de France', size=9000)
        r += build_chunks(L, 121766, 122272, D / 'lettres/fr-FR', 'fragments', 'Fragments divers', size=9000)
        return r
    if which == 'reglement':
        r = build_chunks(L, 122272, 129336, D / 'reglement-et-office-de-l-oratoire/fr-FR', 'reglement', 'Règlement de la Congrégation de l’Oratoire', size=7000)
        r += build_chunks(L, 129336, 133402, D / 'reglement-et-office-de-l-oratoire/fr-FR', 'office-de-jesus', 'Office de Jésus (latin)', size=7000)
        return r

if __name__ == '__main__' and sys.argv[1] not in ('grandeurs', 'vie', 'mad'):
    for x in run_all(sys.argv[1]):
        print(x)
