import re, difflib, sys, os, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
R = '/Users/gustavo/Documents/prayer/research/sourcing/surin/'
L = open(R + 'catchismespirit00surigoog.txt', errors='replace').read().split('\n')
PARTS = [
 ('', ['De l’homme spirituel','Des obstacles à la perfection','Des obstacles particuliers que les personnes séculières trouvent à leur perfection','De l’aveuglement de l’âme','De l’empressement du cœur','De la gourmandise','De l’avancement en esprit','Du relâchement']),
 ('Où l’on traite de plusieurs vertus et de plusieurs saintes pratiques qui regardent l’intérieur de l’homme', ['De l’oraison','De l’humilité','De la patience','De la pauvreté','De la chasteté','De l’obéissance','Du zèle','De la liberté d’esprit','De la connaissance de Jésus-Christ']),
 ('Des fonctions apostoliques', ['De la prédication','De la direction des âmes','De la conversation apostolique','Du secours qu’il faut donner aux amis par le moyen de la confession','Du secours qu’on doit donner aux personnes qui font la retraite, pour vaquer aux exercices spirituels','Des secours qu’il faut donner au peuple dans les missions','De la réduction des hérétiques','Des secours qu’il faut donner aux malades et aux mourants']),
 ('Où l’on donne des instructions à plusieurs personnes de diverses conditions', ['Du devoir des prêtres','Du devoir des magistrats','Du devoir des supérieurs','Du devoir des pères de famille','Du devoir des veuves','Du devoir des vierges','Du devoir des jeunes hommes','Du devoir de ceux qui gagnent leur vie en exerçant quelque profession']),
 ('Où l’on traite de la réformation de l’homme, faite par la grâce', ['De la réformation de l’homme dans son corps et dans ses membres','De la réformation de l’homme dans les sens','De la réformation de l’imagination','De la réformation de la mémoire','De la réformation de l’entendement','De la réformation de la volonté','De la réformation du fond de l’âme']),
 ('Où l’on traite de la réformation des passions', ['De la réformation de l’amour','De la réformation de la haine','De la réformation du désir','De la réformation de la répugnance ou de l’aversion','De la réformation de la joie','De la réformation de la tristesse','De la réformation de la hardiesse ou courage','De la réformation de la crainte','De la réformation de la colère','De la réformation de la honte','De la réformation de la compassion']),
 ('Où l’on traite des actions ordinaires qui partagent la vie de l’homme spirituel', ['De l’oraison','De l’examen de conscience','De la confession','Questions sur la confession','De la communion','De la communion des moins parfaits','De la communication avec le père spirituel','De la nourriture du corps','Des habits','De la conversation','Des divertissements','Des maladies','De l’étude des lettres','Des amitiés']),
 ('De quelques points qui regardent la perfection de l’âme', ['Du recueillement','Du vrai religieux','De la conservation des ordres religieux','De la vie mixte','De la prudence','De l’activité naturelle','Du renouvellement de l’esprit','De l’homme intérieur','De la présence de Dieu']),
]
def norm(s): return re.sub(r'[^a-z]', '', s.lower().replace('é','e').replace('è','e').replace('ê','e').replace('à','a').replace('â','a').replace('ô','o').replace('î','i').replace('û','u').replace('ç','c').replace('œ','oe'))
CH = re.compile(r'C\W*H\W*A?\W*P\W*[IT1Y]?', re.I)
cands = [i for i in range(416, len(L)) if re.match(r'^\W*(C\W?H\W?A\W?P|CHAP)', L[i].strip(), re.I) and len(L[i].strip()) < 40 and not re.search(r'[a-z]{6,}', L[i].strip())]
if __name__ == '__main__' and 'dev' in sys.argv:
    pos = 417
    out = []
    for pi, (sub, chs) in enumerate(PARTS):
        for ci, t in enumerate(chs):
            nt = norm(t)
            best = None
            for i in range(pos, len(L) - 3):
                if i < pos + 5 and out: continue
                s = ' '.join(x.strip() for x in L[i:i+2] if x.strip())
                if len(s) > 120 or len(s) < 5: continue
                ratio = max(difflib.SequenceMatcher(None, nt, norm(s)).ratio(), difflib.SequenceMatcher(None, nt, norm(L[i])).ratio())
                near = any(0 < i - c <= 4 for c in cands) or (ci == 0 and any(0 < i - j <= 12 and 'PARTI' in L[j].upper().replace(' ', '') for j in range(max(0, i-12), i)))
                if ratio >= (0.72 if near else 0.9):
                    best = (i, ratio, near); break
            out.append((pi, ci, t, best))
            if best: pos = best[0] + 1
    for pi, ci, t, b in out: print(pi+1, ci+1, t[:40], b)

import ocr_clean as oc
PS = [417, 2295, 4601, 7338, 8784, 10175, 12546, 15890]
PE = PS[1:] + [18710]
ORDF = ['Première','Seconde','Troisième','Quatrième','Cinquième','Sixième','Septième','Huitième']
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
B = '/Users/gustavo/Documents/prayer/content/books/surin-opera-omnia/catechisme-spirituel/'
def furniture(s):
    t = s.strip()
    if len(t) > 48: return False
    n = norm(t)
    if re.search(r'chap', t, re.I) and re.search(r'\d|[ivx]{2,}', t, re.I) and len(t) < 40: return True
    if difflib.SequenceMatcher(None, n[:11], 'catechisme').ratio() > 0.7 and len(n) < 20: return True
    if re.match(r'^\W*(Tome|TOME)\b', t): return True
    if re.fullmatch(r'[A-Za-z]{1,2}\s*(ij|iij|iiij|iv|v|vj)\.?', t): return True
    al = sum(c.isalpha() for c in t)
    if len(t) >= 6 and al < 0.55 * len(t): return True
    if len(t) < 40 and re.search(r'[▲►■□]', t): return True
    if re.fullmatch(r'[\W\dIVXivxlcLC]{0,6}', t): return True
    if re.fullmatch(r'\W*(SPIRITUEL|Spirituel|SPIRITUELLE)\W*[\w\W]{0,18}', t) and re.search(r'\d', t): return True
    return False
QA = re.compile(r'^\W{0,4}([DR])\s?[.,]\s')
def chapter_starts():
    pos = 417; res = {}
    for pi, (sub, chs) in enumerate(PARTS):
        pos = PS[pi]
        for ci, t in enumerate(chs):
            nt = norm(t); best = None
            for i in range(pos, PE[pi] - 2):
                s = ' '.join(x.strip() for x in L[i:i+2] if x.strip())
                if len(s) > 120 or len(s) < 5: continue
                ratio = max(difflib.SequenceMatcher(None, nt, norm(s)).ratio(), difflib.SequenceMatcher(None, nt, norm(L[i])).ratio())
                near = any(0 < i - c <= 4 for c in cands)
                if ratio >= (0.72 if near else 0.92) and (near or len(norm(L[i])) >= 0.8 * len(nt)):
                    best = i; break
            if best is not None:
                res[(pi, ci)] = best; pos = best + 1
    return res
def part_text(pi, starts):
    a, b = PS[pi], PE[pi]
    marks = sorted((i, ci) for (p, ci), i in starts.items() if p == pi)
    out, cur = [], []
    def flush():
        if cur:
            out.append(list(cur)); cur.clear()
    # build blocks per segment
    segs, prev, prevc = [], a, None
    for i, ci in marks:
        segs.append((prevc, prev, i)); prev, prevc = i, ci
    segs.append((prevc, prev, b))
    paras_all = []
    for ci, s, e in segs:
        lines = [x for x in L[s:e]]
        if ci is not None:
            # drop heading lines: 'CHAPITRE N' and the title (until first D./R. line or 3 lines)
            k = 0
            while k < min(len(lines), 8) and not QA.match(lines[k].strip()): k += 1
            lines = lines[k:]
        elif s == a:
            k = 0
            while k < min(len(lines), 14) and not (QA.match(lines[k].strip()) or (k > 3 and len(lines[k].strip()) > 50)): k += 1
            lines = lines[k:]
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
        paras_all.append((ci, mg))
    return paras_all
def fixfr(s):
    s = s.replace("'", '’').replace('“', '«').replace('”', '»')
    s = re.sub(r'^\W{0,4}D\s?[.,]\s*', 'D. ', s); s = re.sub(r'^\W{0,4}R\s?[.,]\s*', 'R. ', s)
    s = re.sub(r'\s+([;:!?»])', r' \1', s)
    return s
if __name__ == '__main__' and 'build' in sys.argv:
    starts = chapter_starts()
    os.makedirs(B + 'fr-FR', exist_ok=True)
    tot = 0; toc = []
    for pi, (sub, chs) in enumerate(PARTS):
        title = f'{ORDF[pi]} partie' + (f' : {sub}' if sub else '')
        lines = [f'# {title}', '']
        for ci, mg in part_text(pi, starts):
            if ci is not None:
                lines += [f'## Chapitre {RN[ci]}. {chs[ci]}', '']
            for p in mg: lines += [fixfr(p), '']
        txt = '\n'.join(lines).rstrip() + '\n'
        open(B + f'fr-FR/partie-{pi+1}.md', 'w').write(txt)
        tot += len(txt.split())
        found = sum(1 for k in starts if k[0] == pi)
        print(pi+1, len(txt.split()), f'{found}/{len(chs)} headings')
        toc.append((f'partie-{pi+1}', title))
    print(tot)

if __name__ == '__main__' and 'meta' in sys.argv:
    import bookjson
    toc = [{'id': f'partie-{i+1}', 'title': {'fr-FR': f'{ORDF[i]} partie' + (f' : {PARTS[i][0]}' if PARTS[i][0] else '')}} for i in range(8)]
    d = {'id': 'surin-catechisme-spirituel', 'cover': 'classic',
      'name': {'fr-FR': 'Catéchisme spirituel de la perfection chrétienne', 'en-US': 'Spiritual Catechism of Christian Perfection', 'pt-BR': 'Catecismo espiritual da perfeição cristã'},
      'author': {'fr-FR': 'Jean-Joseph Surin', 'en-US': 'Jean-Joseph Surin', 'pt-BR': 'Jean-Joseph Surin'},
      'description': {
       'fr-FR': 'Le grand traité de direction du P. Jean-Joseph Surin, S.J. (1600-1665), en questions et réponses : l’homme spirituel et les obstacles à la perfection, les vertus et les saintes pratiques, les fonctions apostoliques, les devoirs des diverses conditions, la réformation de l’homme et celle des passions, les actions ordinaires de la vie spirituelle et quelques points sur la perfection de l’âme. Texte de l’édition de 1801 (« nouvellement revue et corrigée » par le P. T. B. F.), en huit parties ; le texte numérisé est une copie imparfaite, avec des lacunes aux marges des pages.',
       'en-US': 'Father Jean-Joseph Surin’s great treatise of spiritual direction (1657-63), in questions and answers: the spiritual man and the obstacles to perfection, virtues and holy practices, apostolic work, the duties of the various states of life, the reformation of man and of the passions, the ordinary actions of the spiritual life and some points on the soul’s perfection. The text of the 1801 edition (“newly revised and corrected”), in eight parts; the scanned text is imperfect, with gaps at the page margins.',
       'pt-BR': 'O grande tratado de direção espiritual do P. Jean-Joseph Surin, S.J. (1600-1665), em perguntas e respostas: o homem espiritual e os obstáculos à perfeição, as virtudes e as práticas santas, as funções apostólicas, os deveres dos diversos estados de vida, a reforma do homem e a das paixões, as ações ordinárias da vida espiritual e alguns pontos sobre a perfeição da alma. Texto da edição de 1801, em oito partes; o texto digitalizado é imperfeito.'},
      'composed': '1657-1663', 'languages': ['fr-FR'], 'work': 'surin/catechisme-spirituel',
      'editions': {'fr-FR': {'editor': 'P. T. B. F. (nouvellement revu et corrigé), Paris: Belin', 'year': 1801}},
      'sources': [{'language': 'fr-FR', 'url': 'https://archive.org/details/catchismespirit00surigoog', 'edition': 'Catéchisme spirituel de la perfection chrétienne, composé par le R. P. J.-J. Surin, de la Compagnie de Jésus, nouvellement revu et corrigé par le P. T. B. F., tome second, Paris: Belin / Évreux, an IX [1801]. Internet Archive (Google) scan, OCR text.',
        'description': 'The eight parts of the volume (Table des chapitres of Tome II) as printed, with the chapter headings restored from the printed table where the OCR kept the heading; headings the OCR lost are not marked and their text runs on. Google boilerplate, running heads and signatures stripped, lines rejoined by hand rules. The scan loses words at the margins of many pages and the last pages are badly garbled; the text is not proofread. The 17th-century editions (1669, 1683) and the 1882 Œuvres spirituelles would be better witnesses (Google Books full view, not reachable from the sourcing machine).',
        'tier': 'A', 'tierEvidence': 'Surin died in 1665; the 1801 edition is public domain everywhere.'}],
      'toc': toc}
    os.makedirs(B + 'sources/french-originals', exist_ok=True)
    open(B + 'sources/french-originals/catechisme-1801-t2-archive-org.txt', 'w').write('\n'.join(L[416:18710]) + '\n')
    bookjson.write(B[:-1], d)
    root = '/Users/gustavo/Documents/prayer/content/authors/surin.json'
    bookjson.author_file(root, 'Jean-Joseph Surin', 'Jean-Joseph Surin', 17, ['Jean-Joseph Surin', 'Surin, Jean-Joseph', 'Jean-Joseph Surin, S.J.'])
