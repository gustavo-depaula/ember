import re, sys, os, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import ocr_clean as oc
R = '/Users/gustavo/Documents/prayer/research/sourcing/surin/'
B = '/Users/gustavo/Documents/prayer/content/books/surin-opera-omnia/predicateur-amour-de-dieu/'
L = open(R + 'leprdicateurde00suri.txt', errors='replace').read().split('\n')
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI']
b1 = [200,466,755,966,1191,1432,1647,1846,2054,2252]; b1e = 2533
b2 = [2536,2734,2944,3145,3452,3713,3922,4274,4460,4659,4862,5101,5365]; b2e = 5500
days = [5510,5589,5671,5743,5831,5923,6022,6127,6213,6305,6398,6505,6606,6719,6812,6938,7061,7185,7321,7445,7585,7705,7826,7922,8043,8170,8295,8410,8498,8634,8759]
AVIS = 8886; AVIS2 = 9794; ORAISON = 10716
ent = [10723,10866,11019,11177,11327,11474,11605,11746,11900,12050,12156,12277,12433,12583,12688,12822,12975,13113,13240,13368,None,13638,13804,13933,14084,None,14360,14518,14675,14832]
def find(pat, a, b):
    for i in range(a, b):
        s = re.sub(r'\s+', ' ', L[i]).strip()
        if re.search(pat, s, re.I) and len(s) < 50 and not re.search(r'CHR[EÉ]TIEN|\d{3}', s): return i
ent[20] = 13488; ent[25] = 14223
AVIS3 = find(r'(aiment Dieu|croître)', 9794, 10720)
for i in (20, 25): print('ent', i+1, ent[i])
print('avis3', AVIS3 and AVIS3+1)
AVIS3 = AVIS3
FURN = re.compile(r'^[\W\d]{0,6}[A-ZÉÈÀÂÊÎÔÛ\s\',.\-:;’]{5,}[\W\d]{0,8}$')
def furniture(t):
    t = t.strip()
    if len(t) > 55: return False
    if re.fullmatch(r'[\W\dA-Za-z]{0,4}', t): return True
    if re.search(r'\d', t) and sum(c.isupper() for c in t) >= 0.6 * max(1, sum(c.isalpha() for c in t)) and len(t) < 50: return True
    if FURN.match(t) and re.search(r'(QUESTIONS|RÉPONSES|KÉPONSES|DEGRÉS|AVIS|SENTIMENS|AFFECTUEUX|SALUTAIRES|CHRÉTIEN|ORAISON|MATIÈRES|TABLE|AMOUR)', t): return True
    return False
QA = re.compile(r'^\W{0,3}([DR])\s?[.,]\s')
def body(a, b, drop_head=True):
    lines = L[a:b]
    paras, cur = [], []
    for ln in lines:
        t = ln.strip()
        if not t:
            if cur: paras.append(cur); cur = []
            continue
        if furniture(t): continue
        if QA.match(t) and cur: paras.append(cur); cur = []
        cur.append(re.sub(r'\s+', ' ', t))
    if cur: paras.append(cur)
    ps = [oc.join_lines(p) for p in paras]
    mg = []
    for p in ps:
        if mg and not oc.SENT_END.search(mg[-1]) and p[:1].islower() and not QA.match(p): mg.append(mg.pop() + ' ' + p)
        else: mg.append(p)
    return mg
def fx(s):
    s = s.replace("'", '’').replace('“', '«').replace('”', '»')
    s = re.sub(r'^\W{0,3}D\s?[.,]\s*', 'D. ', s); s = re.sub(r'^\W{0,3}R\s?[.,]\s*', 'R. ', s)
    s = re.sub(r'\s+([;:!?»])', r' \1', s); s = re.sub(r'«\s+', '« ', s)
    s = s.replace(' ,', ',').replace(' .', '.')
    return s
def titled(a, b):
    """heading line at a, then title block until blank line"""
    k = a + 1
    while k < b and not L[k].strip(): k += 1
    t = []
    while k < b and L[k].strip():
        t.append(re.sub(r'\s+', ' ', L[k].strip())); k += 1
    return oc.join_lines(t), k
def sentence_case(t):
    return t.strip().rstrip('.')
chapters = []   # (id, title, text)
TFIX = {'ïîdponses': 'Réponses', 'contr&': 'contre', 'JDe': 'De', 'aùner': 'aimer', 'Ccspèce': 'l’espèce', 'do7ier': 'donner', 'fovt': 'font', 'sa remplir': 'se remplir', '?i': 'en', 'celte': 'cette', 'f ': ', '}
PFIX = [('’est-ce qu’aimer Dieu d’un amour parfait', 'D. Qu’est-ce qu’aimer Dieu d’un amour parfait'), ('Quel amour Jésus-Christ ne nous montre-t-il pas', 'D. Quel amour Jésus-Christ ne nous montre-t-il pas'), ('J). Qu’est-ce que donner tout', 'D. Qu’est-ce que donner tout'), ('UiEU veut que vous', 'Dieu veut que vous'), ('D. CoMMETfxprouvez vous', 'D. Comment prouvez-vous'), ('D. Gomment oblient-on', 'D. Comment obtient-on')]
def add(cid, title, paras, sub=None):
    title = re.sub(r'\s+', ' ', title).replace("'", '’').rstrip(' ,.')
    for a, b in TFIX.items(): title = title.replace(a, b)
    paras = [re.sub(r'\bcelte\b', 'cette', p) for p in paras]
    paras = [p.replace("'", '’') for p in paras]
    for a, b in PFIX:
        if paras and paras[0].startswith(a): paras[0] = b + paras[0][len(a):]
    paras = [p.replace('D. CoMMETfxprouvez vous', 'D. Comment prouvez-vous').replace('Gomment oblient-on', 'Comment obtient-on') for p in paras]
    txt = [f'# {title}', '']
    for p in paras:
        txt += [(p if p.startswith('## ') else fx(p)), '']
    open(B + f'fr-FR/{cid}.md', 'w').write('\n'.join(txt).rstrip() + '\n')
    chapters.append((cid, title, len(' '.join(txt).split())))
if __name__ == '__main__' and 'build' in sys.argv:
    os.makedirs(B + 'fr-FR', exist_ok=True)
    gm = next(i for i, l in enumerate(L) if 'GRAND' in l and 'MOTIF' in l)
    add('avertissement', 'À ceux qui veulent aimer Dieu', body(gm, 193))
    for n, s in enumerate(b1):
        e = b1[n+1] if n+1 < len(b1) else b1e
        t, k = titled(s - 1, e)
        add(f'l1-c{n+1:02d}', f'Livre I, chapitre {RN[n]}. {sentence_case(t)}', body(k, e))
    for n, s in enumerate(b2):
        e = b2[n+1] if n+1 < len(b2) else b2e
        t, k = titled(s - 1, e)
        add(f'l2-c{n+1:02d}', f'Livre II, chapitre {RN[n]}. {sentence_case(t)}', body(k, e))
    for n, s in enumerate(days):
        e = days[n+1] if n+1 < len(days) else AVIS - 1
        t, k = titled(s - 1, e)
        add(f'l3-j{n+1:02d}', f'Livre III, {n+1}{"er" if n == 0 else "e"} jour. {sentence_case(t)}', body(k, e))
    # avis
    parts = body(AVIS + 6, AVIS2 - 1); p2 = body(AVIS2 + 1, (AVIS3 or 10000) - 1); p3 = body((AVIS3 or 10000) + 1, ORAISON - 2)
    add('avis-salutaires', 'Avis salutaires et sentiments affectueux', ['## Pour ceux qui sont dans l’état du péché'] + parts + ['## Pour ceux qui sont nouvellement convertis'] + p2 + ['## Pour ceux qui aiment Dieu et qui veulent croître dans son amour'] + p3)
    for n, s in enumerate(ent):
        e = ent[n+1] if n+1 < len(ent) and ent[n+1] else (ent[n+2] if n+2 < len(ent) else 14955)
        if n == 19 or n == 24: e = ent[n+1]
        add(f'entretien-{n+1:02d}', f'Le chrétien en oraison, entretien {RN[n]}', body(s, e))
    json.dump(chapters, open(R + 'pred_chapters.json', 'w'), ensure_ascii=False)
    print(len(chapters), sum(c[2] for c in chapters))

if __name__ == '__main__' and 'meta' in sys.argv:
    import bookjson, shutil
    ch = json.load(open(R + 'pred_chapters.json'))
    T = {c[0]: c[1] for c in ch}
    def T2(cid): return open(B + f'fr-FR/{cid}.md').readline()[2:].strip()
    kids = lambda pre: [{'id': c[0], 'title': {'fr-FR': T2(c[0])}} for c in ch if c[0].startswith(pre)]
    toc = [{'id': 'avertissement', 'title': {'fr-FR': T2('avertissement')}},
           {'id': 'livre-1', 'title': {'fr-FR': 'Questions sur l’amour de Dieu, livre I'}, 'children': kids('l1-')},
           {'id': 'livre-2', 'title': {'fr-FR': 'Questions sur l’amour de Dieu, livre II'}, 'children': kids('l2-')},
           {'id': 'livre-3', 'title': {'fr-FR': 'Livre III. Des différents degrés pour s’élever à un grand amour pour Dieu'}, 'children': kids('l3-')},
           {'id': 'avis-salutaires', 'title': {'fr-FR': 'Avis salutaires et sentiments affectueux'}},
           {'id': 'chretien-en-oraison', 'title': {'fr-FR': 'Le chrétien en oraison, s’entretenant avec Jésus-Christ'}, 'children': kids('entretien-')}]
    d = {'id': 'surin-predicateur-amour-de-dieu', 'cover': 'classic',
      'name': {'fr-FR': 'Le Prédicateur de l’amour de Dieu', 'en-US': 'The Preacher of the Love of God', 'pt-BR': 'O pregador do amor de Deus'},
      'author': {'fr-FR': 'Jean-Joseph Surin', 'en-US': 'Jean-Joseph Surin', 'pt-BR': 'Jean-Joseph Surin'},
      'description': {
       'fr-FR': 'Ouvrage posthume attribué au P. Jean-Joseph Surin, S.J. (1600-1665) : les Questions sur l’amour de Dieu, en deux livres de questions et réponses sur le pur amour (chacune suivie d’un « coup d’œil sur les dispositions de son cœur », affections de l’éditeur), puis un mois de degrés pour s’élever à un grand amour de Dieu, des avis salutaires et trente entretiens du chrétien en oraison avec Jésus-Christ, extraits des autres écrits de Surin et mêlés de pages de François de Sales et de Jean de la Croix. Le style a été retouché par l’éditeur. Nouvelle édition de 1824, qui rétablit le chapitre supprimé par la censure impériale.',
       'en-US': 'A posthumous work attributed to Fr. Jean-Joseph Surin, S.J. (1600-1665): the Questions on the Love of God, two books of questions and answers on pure love (each followed by a “glance at the dispositions of one’s heart”, affections added by the editor), then a month of steps to rise to great love of God, salutary counsels and thirty colloquies of the Christian at prayer with Jesus Christ, drawn from Surin’s other writings and mixed with pages of Francis de Sales and John of the Cross. The editor retouched the style. The new edition of 1824, which restores the chapter suppressed by the imperial censors.',
       'pt-BR': 'Obra póstuma atribuída ao P. Jean-Joseph Surin, S.J. (1600-1665): as Questões sobre o amor de Deus, em dois livros de perguntas e respostas sobre o puro amor (cada uma seguida de um « olhar sobre as disposições do coração », afetos acrescentados pelo editor), depois um mês de degraus para subir a um grande amor de Deus, avisos salutares e trinta colóquios do cristão em oração com Jesus Cristo, tirados dos outros escritos de Surin e entremeados de páginas de Francisco de Sales e de João da Cruz. O editor retocou o estilo. Edição nova de 1824.'},
      'composed': 'c. 1660', 'languages': ['fr-FR'], 'work': 'surin/predicateur-amour-de-dieu',
      'editions': {'fr-FR': {'editor': 'Anonymous editor (Paris: Méquignon junior / Lyon: Périsse frères, “nouvelle édition”)', 'year': 1824}},
      'sources': [{'language': 'fr-FR', 'url': 'https://archive.org/details/leprdicateurde00suri', 'edition': 'Le Prédicateur de l’amour de Dieu, ouvrage posthume du Père Surin, à la suite duquel on trouve ce que recommandent sainte Thérèse, saint Jean de la Croix et saint François de Sales; nouvelle édition, Paris: Méquignon junior / Lyon: Périsse frères, 1824. Internet Archive scan, OCR text.',
        'description': 'The Grand motif and the address To those who wish to love God, the two books of Questions and answers (10 and 13 chapters, each with its Coup-d’œil), Book III (31 days), the Avis salutaires et sentiments affectueux (three groups) and the thirty Entretiens of the Chrétien en oraison. The table of contents and the printer’s matter are left out. Running heads stripped; chapter titles tidied by hand; the dropped initials of some chapters restored. Entretiens XXI and XXVI lost their headings in the OCR and their starts are inferred from the usual length of an entretien (a few lines may be misplaced); OCR slips remain (about 2% of words).',
        'tier': 'A', 'tierEvidence': 'Surin died in 1665; the 1824 Paris edition is public domain everywhere.'}],
      'toc': toc}
    os.makedirs(B + 'sources/french-originals', exist_ok=True)
    shutil.copy(R + 'leprdicateurde00suri.txt', B + 'sources/french-originals/predicateur-1824-archive-org.txt')
    bookjson.write(B[:-1], d)
