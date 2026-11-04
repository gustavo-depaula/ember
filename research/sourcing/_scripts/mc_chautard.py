import sys, os, re, shutil, collections, glob
sys.path.insert(0, os.path.dirname(__file__))
import ocr_clean as oc
from mc_lib import *
B = ROOT + 'content/books/chautard-opera-omnia/ame-de-tout-apostolat/'
F = SRC + 'chautard/lame1927_djvu.txt'
T = [  # id, title, start regex
 ('prologue', 'Prologue : Ex quo omnia, per quem omnia, in quo omnia', r'^Ex quo omnia'),
 ('1-1-oeuvres-voulues', 'Première partie, 1. Les œuvres et dès lors le zèle sont voulus par Dieu', r'^PREMIERE PARTIE'),
 ('1-2-jesus-vie-des-oeuvres', 'Première partie, 2. Dieu veut que Jésus soit la Vie des œuvres', r'^2\. Dieu veut que J'),
 ('1-3-vie-interieure', 'Première partie, 3. Qu’est-ce que la Vie intérieure ?', r'^3\. \S+est-ce que la Vie'),
 ('1-4-meconnue', 'Première partie, 4. Combien cette Vie intérieure est méconnue', r'^4\. Combien cette Vie'),
 ('1-5-difficile', 'Première partie, 5. Réponse à une première objection : la Vie intérieure est-elle difficile ?', r'R.ponse . une premi.{1,2}re objection'),
 ('1-6-egoiste', 'Première partie, 6. Réponse à une autre objection : la Vie intérieure est-elle égoïste et stérile ?', r'^6\. R.ponse . une autre objection'),
 ('1-7-salut-des-ames', 'Première partie, 7. Objection tirée de l’importance du salut des âmes', r'Objection tir.e de .{1,2}importance du salut'),
 ('2-1-priorite', 'Deuxième partie, 1. Priorité de la Vie intérieure sur la Vie active au regard de Dieu', r'^DEUXIEME PARTIE'),
 ('2-2-debordement', 'Deuxième partie, 2. Les œuvres ne doivent être que le débordement de la Vie intérieure', r'^2\. Les \S+ ne doivent'),
 ('2-3-imbibees', 'Deuxième partie, 3. Base, fin et moyens d’une œuvre doivent être imprégnés de Vie intérieure', r'^3\. Base, Fin'),
 ('2-4-mutuel', 'Deuxième partie, 4. Vie intérieure et Vie active s’appellent mutuellement', r'^4\. Vie int.{1,2}ieure et Vie'),
 ('2-5-excellence', 'Deuxième partie, 5. Excellence de cette union', r'Excellence de cette union'),
 ('3-1-danger', 'Troisième partie, 1. Les œuvres, moyen de sainteté pour les âmes intérieures, danger pour les autres', r'^TROISIEME PARTIE'),
 ('3-2-sans-vie-interieure', 'Troisième partie, 2. De l’homme d’œuvres sans la Vie intérieure', r'^2\. De .homme d'),
 ('3-3-saintete-ouvrier', 'Troisième partie, 3. La Vie intérieure, base de la sainteté de l’ouvrier apostolique', r'^3\. La Vie int.rieure, base de la saintet'),
 ('4-0-fecondite', 'Quatrième partie : Fécondité des œuvres par la Vie intérieure', r'^QUATRIEME PARTIE'),
 ('4-a-benedictions', 'Quatrième partie, a) La Vie intérieure attire les bénédictions de Dieu', r'^a\) La Vie int.rieure attire'),
 ('4-b-bon-exemple', 'Quatrième partie, b) Elle rend l’apôtre sanctificateur par le bon exemple', r'^.\) Elle rend .{1,3}ap.tre sanctificateur'),
 ('4-c-rayonnement', 'Quatrième partie, c) Elle produit dans l’apôtre le rayonnement surnaturel', r'^c\) Elle produit'),
 ('4-d-eloquence', 'Quatrième partie, d) Elle donne à l’ouvrier évangélique la vraie éloquence', r'^d\) Elle donne'),
 ('4-e-engendre', 'Quatrième partie, e) La Vie intérieure engendre la Vie intérieure', r'^e\) Parce que'),
 ('4-f-elites', 'Quatrième partie, f) Importance de la formation des élites et de la direction spirituelle', r'^f\) Import'),
 ('4-g-eucharistie', 'Quatrième partie, g) La Vie intérieure par l’Eucharistie', r'^g\) La .ie int.rieure par'),
 ('5-1-conseils', 'Cinquième partie, 1. Quelques conseils aux hommes d’œuvres pour la Vie intérieure', r'^CINQUIEME PARTIE'),
 ('5-2-oraison', 'Cinquième partie, 2. L’Oraison, élément indispensable de la Vie intérieure', r'^2\. L.{0,2}Oraison'),
 ('5-3-vie-liturgique', 'Cinquième partie, 3. La Vie liturgique, source de Vie intérieure', r'^3\. La Vie Liturgique'),
 ('5-4-garde-du-coeur', 'Cinquième partie, 4. La Garde du cœur, clef de voûte de la Vie intérieure', r'^4\. La Garde du Co'),
 ('5-5-marie', 'Cinquième partie, 5. Besoin pour l’apôtre d’une ardente dévotion envers Marie Immaculée', r'^2\. Besoin pour'),
 ('epilogue', 'Épilogue', r'^EPILOGUE')]
HEADS = [re.compile(r'(AME|AMB|VAME|ÂME) DE TOUT AP'), re.compile(r'^[\d\s]*L.{0,3}AME DE')]
def accents():
    v = collections.Counter()
    for f in glob.glob(ROOT + 'content/books/*/fr-FR/*.md'):
        if 'chautard' in f or 'marmion' in f: continue
        v.update(w.lower() for w in re.findall(r"[a-zA-ZÀ-ÿœŒ]+", open(f, encoding='utf-8').read()))
    return v
V = None
EDIT = [('é', 'è'), ('é', 'ê'), ('è', 'é'), ('ê', 'é'), ('e', 'é'), ('ce', 'œ'), ('cc', 'œ'), ('ee', 'œ'), ('oe', 'œ'), ('cu', 'œu'), ('gu', 'œu'), ('a', 'à'), ('u', 'û'), ('i', 'î'), ('o', 'ô'), ('e', 'ê'), ('e', 'è'), ('i', 'ï'), ('6', 'ô'), ('d', 'â'), ('dm', 'âm'), ('4', 'à')]
def variants(w):
    out = set()
    for a, b in EDIT:
        for m in re.finditer(re.escape(a), w):
            out.add(w[:m.start()] + b + w[m.end():])
    return out
CACHE = {}
def fixword(w):
    lw = w.lower()
    if lw in CACHE: res = CACHE[lw]
    else:
        f0 = V[lw]
        best, bf = lw, f0
        cands = set(variants(lw))
        if f0 < 3:  # unknown: allow two edits
            for c in list(cands):
                cands |= variants(c)
        for c in cands:
            fc = V[c]
            if fc > bf * 25 and fc >= 4: best, bf = c, fc
        res = best; CACHE[lw] = res
    if res == lw: return w
    if w.isupper(): return res.upper()
    if w[0].isupper(): return res[0].upper() + res[1:]
    return res
SUBJ = {'il','elle','on','qui','ne','n','y','qu','dieu','jésus','christ','jésus-christ','seigneur','marie','notre-seigneur','lui','église','saint','paul','bernard','apôtre','homme','âme','vie','œuvre','cela','ce','ceci','chacun','tout','qu’il','ainsi','où','s','l','d'}
NEXT = {'l','la','le','les','un','une','ce','cette','ces','son','sa','ses','leur','leurs','notre','nos','votre','vos','toute','tous','toutes','chacun','chacune','se','lui','elle','eux','moi','nous','vous','mon','ma','mes','ton','ta','tes','cet','quelque','quelques','faire','être','éviter','Dieu','Jésus','Marie','Jésus-Christ','Notre-Seigneur','d'}
def aacc(s):
    ws = re.split(r'(\s+)', s)
    for i in range(2, len(ws) - 2, 2):
        if ws[i] == 'a':
            prev = re.sub(r"[^\wÀ-ÿ’-]", '', ws[i-2]).lower().replace("'", '’')
            nxt = re.sub(r"^[«\(]", '', ws[i+2])
            nw = re.split(r"[’']", nxt)[0] if re.match(r"^(l|d|qu)[’']", nxt) else re.sub(r"[^\wÀ-ÿ-]", '', nxt)
            if prev.split('’')[-1] not in SUBJ and prev not in SUBJ and (nw in NEXT or (len(nw) > 4 and nw.endswith(('er', 'ir')))) and not ws[i-2].endswith('.'):
                ws[i] = 'à'
    return ''.join(ws)
def dehyphen(s):
    def f(m):
        j = (m.group(1) + m.group(2)).lower()
        return m.group(1) + m.group(2) if V[j] >= 2 else m.group(1) + '-' + m.group(2)
    return re.sub(r"([A-Za-zÀ-ÿ]{2,})- ([a-zà-ÿ]{2,})", f, s)
def fixfr(s):
    s = dehyphen(s)
    s = re.sub(r"(?<![\w])4(?=m[ae]s?\b)", 'â', s)
    s = re.sub(r"(?<=[\s(«|])[’'|]+(?=[A-Za-zÀ-ÿ])", 'l’', s)
    s = re.sub(r"\b([dlsnjmtc]) (?=[aeiouhéèêAEIOUÉ])", lambda m: m.group(1) + '’', s)
    s = s.replace('@', '').replace('’', "'")
    s = aacc(s)
    s = re.sub(r"\b(4)\b(?=\s+[a-zéèêA-Z])", 'à', s)
    s = re.sub(r"(?<=[a-zéèêàç,])\sA(?=\s+[a-zéèêl])", ' à', s)
    s = re.sub(r"[A-Za-zÀ-ÿœŒ0-9@]+", lambda m: fixword(m.group(0)) if not m.group(0).isdigit() else m.group(0), s)
    for a, b in [(r'\bap[éd]tre(s?)\b', r'apôtre\1'), (r'\bgrace(s?)\b', r'grâce\1'), (r'\bot\b', 'où'), (r'\bdone\b', 'donc'), (r'\bceur(s?)\b', r'cœur\1'), (r'\bcété\b', 'côté'), (r'\baussit[ée]t\b', 'aussitôt'), (r'\btiéde\b', 'tiède'), (r'\bJa\b', 'la'), (r'\bFrancois\b', 'François'), (r'\bfacon\b', 'façon'), (r'\bqwil\b', 'qu’il'), (r'\b[Pp]?(homme|esprit|action|oraison|union|Église|Eglise|ordre|amour|image|idée|exemple)\b', None), (r'\blame\b', 'l’âme'), (r'\bPame\b', 'l’âme')]:
        if b is None:
            s = re.sub(r"\bP(homme|esprit|action|oraison|union|Église|Eglise|amour|image|idée)\b", lambda m: 'l’' + m.group(1), s)
            s = re.sub(r"\bl(esprit|homme|action|oraison)\b", lambda m: 'l’' + m.group(1), s)
        else:
            s = re.sub(a, b, s)
    s = s.replace("'", '’')
    return oc.fix_fr(s)
if __name__ == '__main__':
    V = accents()
    EN = [l for l in open(F, errors='replace').read().replace('\x0c', '').split('\n')]
    EN = [re.sub(r'^(\(\d{1,2}\))(?=\S)', r'\1 ', l.strip()) if re.match(r'^\(\d{1,2}\)\S', l.strip()) else l for l in EN]
    pos, idx = 0, []
    sub = EN[100:]
    for t in T:
        r = re.compile(t[2])
        j = next((i for i in range(pos, len(sub)) if r.search(re.sub(r'\s+', ' ', sub[i].strip()))), None)
        if j is None: print('MISSING', t[0]); j = pos
        idx.append(j); pos = j + 1
    if len(set(idx)) < len(idx): raise SystemExit('fix starts')
    idx = [100 + i for i in idx]
    idx.append(next(i for i in range(idx[-1], len(EN)) if EN[i].startswith('TABLE DES MATIERES')))
    os.makedirs(B + 'fr-FR', exist_ok=True)
    for k, (cid, title, _) in enumerate(T):
        paras, notes = oc.clean(EN[idx[k]:idx[k+1]], HEADS, fnstyle='num')
        # leading title blocks (caps or short) of the section heading
        i = 0
        while i < len(paras) and i < 5 and (len(paras[i]) < 110 or paras[i].isupper()) and not paras[i].startswith('[^'):
            i += 1
        if k in (0,): i = 0
        paras = paras[i:]
        while paras and len(paras[-1]) < 90 and not re.search(r'[.!?»]\s*(\[\^\d+\])*$', paras[-1]): paras.pop()
        open(B + f'fr-FR/{cid}.md', 'w').write(render(title, [fixfr(p) for p in paras], {a: fixfr(b) for a, b in notes.items()}))
    print('ok', len(T))
