"""usage: inst_run.py N [outdir]  -> writes chapter md for tome N under outdir (default /tmp-free: research/sourcing/gueranger/inst/out/N)"""
import sys, os, pickle, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import inst_build as B, inst_assemble as A
N = int(sys.argv[1])
out = sys.argv[2] if len(sys.argv) > 2 else A.INST + 'out/%d' % N
items, notes = pickle.load(open(A.INST + 's%d.pkl' % N, 'rb'))
items = B.clean_items(items)
CH = r'^CHAPITRE|^CHAP|^C[HIU]APITRE'
def chap(n, title, page): return ('chapitre-%02d' % n, 'Chapitre %s. %s' % (A.roman(n), title), page, CH)
A.roman = lambda n: ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV'][n]
SPEC = {
1: [('brefs', 'Brefs de Notre Saint-Père le Pape', 10, 'BREFS'),
    ('preface-nouvelle-edition', 'Préface de cette nouvelle édition', 28, r'^PRÉFACE$'),
    ('epitre-dedicatoire', 'Épître dédicatoire', 70, 'SEIGNEURIE'),
    ('preface-auteur', 'Préface de l’auteur', 72, 'PRÉFACE'),
    chap(1, 'Notions préliminaires', 84),
    chap(2, 'Importance de l’étude de la Liturgie', 89),
    chap(3, 'État de la Liturgie au temps des Apôtres', 99),
    chap(4, 'De la Liturgie durant les trois premiers siècles de l’Église', 126),
    chap(5, 'De la Liturgie, dans l’Église en général, au IVe siècle', 165),
    chap(6, 'De la Liturgie durant les Ve et VIe siècles. Premières tentatives pour établir l’unité', 204),
    chap(7, 'Travaux de saint Grégoire le Grand sur la Liturgie romaine', 237),
    chap(8, 'Digression sur l’histoire des autres Liturgies d’Occident', 267),
    chap(9, 'Autre digression sur l’histoire des Liturgies orientales', 297),
    chap(10, 'Abolition de la Liturgie gallicane. Introduction de la Liturgie romaine-française', 315),
    chap(11, 'Abolition du rite gothique ou mozarabe en Espagne', 351),
    chap(12, 'Révision de l’Office romain par les franciscains', 403),
    chap(13, 'Altération de la Liturgie et du chant, durant les XIVe et XVe siècles', 428),
    chap(14, 'De l’hérésie antiliturgique et de la réforme protestante', 471),
    chap(15, 'Réforme catholique de la Liturgie', 491),
    chap(16, 'De la Liturgie durant la première moitié du XVIIe siècle', 581),
    (None, None, 619, 'FIN DES NOTES')],
2: [('preface', 'Préface', 6, r'^PRÉFACE'),
    chap(17, 'De la Liturgie durant la seconde moitié du XVIIe siècle', 22),
    chap(18, 'De la Liturgie durant la première moitié du XVIIIe siècle', 146),
    chap(19, 'Suite de l’histoire de la Liturgie durant la première moitié du XVIIIe siècle', 239),
    chap(20, 'Suite de l’histoire de la Liturgie durant la première moitié du XVIIIe siècle', 363),
    chap(21, 'Suite de l’histoire de la Liturgie durant la première moitié du XVIIIe siècle', 416),
    chap(22, 'Fin de l’histoire de la Liturgie durant la première moitié du XVIIIe siècle', 486),
    chap(23, 'De la Liturgie durant la seconde moitié du XVIIIe siècle', 524),
    chap(24, 'De la Liturgie au XIXe siècle', 604),
    ('appendice', 'Appendice : Critique des hymnes de Santeul', 721, 'APPENDICE'),
    ('addition', 'Addition', 740, 'ADDITION'),
    (None, None, 784, 'TABLE DU SECOND')],
3: [('preface', 'Préface', 10, r'^PRÉFACE'),
    ('chapitre-01', 'Deuxième partie. Chapitre I. Importance des livres de la Liturgie dans l’étude de la science liturgique', 82, CH),
    chap(2, 'De l’antiquité des livres liturgiques', 98),
    chap(3, 'De la langue des livres liturgiques', 132),
    chap(4, 'De la traduction des livres liturgiques en langue vulgaire', 242),
    chap(5, 'De la publication et de la correction des livres liturgiques', 297),
    chap(6, 'Des livres liturgiques avant l’invention de l’imprimerie', 350),
    chap(7, 'Des livres liturgiques depuis l’invention de l’imprimerie', 397),
    chap(8, 'Ornements intérieurs et extérieurs des livres liturgiques', 422),
    ('lettre-archeveque-reims', 'Lettre à Monseigneur l’archevêque de Rheims sur le droit de la Liturgie', 534, None),
    (None, None, 672, 'DEUXIÈME PARTIE')],
4: [('note-editeur', 'Note de l’éditeur', 6, None),
    ('premiere-defense-preface', 'Première défense : Préface', 10, r'^PRÉFACE'),
    ('lettre-archeveque-toulouse', 'Lettre à Monseigneur l’archevêque de Toulouse', 20, None),
    ('piece-justificative', 'Pièce justificative', 254, None),
    ('nouvelle-defense-preface', 'Nouvelle défense : Préface', 262, r'^PRÉFACE'),
    ('premiere-lettre-orleans', 'Première lettre à Monseigneur l’évêque d’Orléans', 264, None),
    ('appendice-premiere-lettre', 'Appendice', 342, 'APPENDICE'),
    ('deuxieme-lettre-preface', 'Deuxième lettre : Préface', 350, r'^PRÉFACE'),
    ('deuxieme-lettre-orleans', 'Deuxième lettre à Monseigneur l’évêque d’Orléans', 352, None),
    ('troisieme-lettre-preface', 'Troisième lettre : Préface', 472, r'^PRÉFACE'),
    ('troisieme-lettre-orleans', 'Troisième lettre à Monseigneur l’évêque d’Orléans', 474, None),
    (None, None, 603, None)],
}
res = A.segments(N, items, SPEC[N])
os.makedirs(out, exist_ok=True)
import glob
for f in glob.glob(out + '/*.md'): os.remove(f)
tot = 0
LIMIT = 16000
def split_seg(seg, notes):
    """cut a long segment into parts of about LIMIT words at paragraph boundaries (never inside the Notes block's first heading)"""
    wc = [len(i[1].split()) for i in seg]
    total = sum(wc)
    if total <= LIMIT * 1.25: return [seg]
    n = round(total / LIMIT)
    target = total / n
    parts, cur, acc = [], [], 0
    for it, w in zip(seg, wc):
        if acc >= target and len(parts) < n - 1 and it[0] == 'p':
            parts.append(cur); cur, acc = [], 0
        cur.append(it); acc += w
    parts.append(cur)
    return parts
toc = []
for sid, title, seg in res:
    chapter = sid.startswith('chapitre')
    parts = split_seg(seg, notes)
    for k, part in enumerate(parts):
        pid = sid if len(parts) == 1 else '%s-%d' % (sid, k + 1)
        ptitle = title if len(parts) == 1 else '%s (partie %d)' % (title, k + 1)
        md = A.build_md(ptitle, part, notes, chapter and k == 0)
        open('%s/%s.md' % (out, pid), 'w').write(md)
        w = len(re.findall(r'\w+', md)); tot += w
        toc.append((pid, ptitle, w))
        print('%-34s %6d' % (pid, w), ptitle[:70])
print('TOTAL', tot)
import json
json.dump(toc, open(out + '/toc.json', 'w'), ensure_ascii=False)
