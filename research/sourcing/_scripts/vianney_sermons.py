import re, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from ocr_clean import *
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/cure-of-ars/raw/fr-sermons-4t.txt'
ROOT = '/Users/gustavo/Documents/prayer/content/books/cure-of-ars-opera-omnia/sermons/'
L = open(RAW, encoding='utf8').read().split('\n')
KW = re.compile(r'DIMANC|FÊTE|JOUR|SEXAGÉSIME|ÉPIPHANIE|PASSION|QUASIMODO|VENDREDI|JEUDI|ASSOMPTION|NATIVITÉ|INVENTION|ROGATIONS|AVENT')
def cand(i):
    t = L[i].strip()
    if not (6 < len(t) < 70) or re.search(r'[a-z]{2}', t) or re.search(r'\d\s*$', t) or not KW.search(t): return False
    if re.search(r'[.,]\s+\S{1,4}\.?$', t) or 'DE LA lPENT' in t or 'Du XIIe' in t: return False
    return True
starts = {i + 1 for i in range(16254 - 1, len(L)) if cand(i)} | {i + 1 for i in range(300, 16253) if cand(i)}
starts -= {16258, 54100, 57285, 1094}
starts |= {20951, 37372, 52051, 56562, 57282, 59260, 59801, 60420}
starts = sorted(starts)
notes_at = [15889, 34304, 50315, 61161]
tome_of = lambda n: 1 if n < 16253 else 2 if n < 34555 else 3 if n < 50357 else 4
def vhead(t):
    if len(t) > 80: return False
    lower = sum(c.islower() for c in t)
    if re.search(r'SERM[UO]NS?\b|S[EO]NMONS|SERMONS', t) and lower <= 3 and len(t) < 30: return True
    if re.match(r'^\W?\s*(Sermons|Senmons|Sermons?)[\s.,—-]+Tome', t, re.I): return True
    if lower <= 4 and len(t) >= 8 and (re.search(r'\d{1,4}\W?$', t) or re.search(r'^\d{1,4}\s', t)) and KW.search(t.upper()) : return True
    if lower <= 3 and len(t) >= 5 and re.search(r'^\W*\d{1,4}\W*[A-ZÉ]', t) and 'SERMON' in t.upper(): return True
    if re.fullmatch(r'\W*\d{1,4}\W*', t): return True
    return False
FIX = [("DIMANCIIE","DIMANCHE"),("DIMANCITE","DIMANCHE"),("ÉPIPIHANIE","ÉPIPHANIE"),("DIX-HIUITIÈME","DIX-HUITIÈME"),("SCIZIÈME","SEIZIÈME"),("FÉTE","FÊTE"),("PENTECOTE","PENTECÔTE"),("PAQUES","PÂQUES"),("CARÈME","CARÊME"),("MURTS","MORTS")]
def tcase(h):
    for a, b in FIX: h = h.replace(a, b)
    h = h.strip().rstrip('.,').lower().replace("l'", "l’").replace("d'", "d’")
    for w in ['avent','épiphanie','carême','pentecôte','pâques','passion','rosaire','sexagésime','quasimodo','noël','jean-baptiste','vierge','marie','croix','machabées','assomption','nativité']:
        h = re.sub(r'\b' + w + r'\b', w.capitalize(), h)
    h = h.replace('noel', 'Noël').replace('Noël','Noël')
    h = h.replace('saints anges gardiens', 'saints Anges gardiens').replace('tous les saints', 'tous les Saints')
    return h[:1].upper() + h[1:]
def sentence(t): return t.strip().rstrip('.').replace("'", '’')
def build():
    os.makedirs(ROOT + 'fr-FR', exist_ok=True)
    out = []; n = 0
    bounds = starts + [10**9]
    for k, a in enumerate(starts):
        b = bounds[k + 1]
        for na in notes_at:
            if a < na < b: b = na
        seg = L[a - 1:min(b - 1, len(L))]
        bl = [join_lines(x) for x in blocks(seg)]
        head = bl[0]; i = 1
        part = ''
        if re.match(r'^[\({]?\s*(Deuxi|Troisi|Premier)\S*\s+Sermon', bl[i], re.I):
            part = ' (' + sentence(re.sub(r'^[\({]\s*', '', bl[i]).rstrip(')}]. ')).lower() + ')'; i += 1
        elif a in (56562,) : pass
        sub = ''
        if bl[i].startswith(('Sur ', 'Pour ', 'Du ', 'Devoir', 'Délai', 'Même', 'Le péché', 'La ', 'Dispositions', 'De ')) and len(bl[i]) < 90:
            sub = sentence(bl[i]); i += 1
            if not bl[i - 1].endswith('.') and len(bl[i]) < 60 and not re.search(r'[a-z]{4,} [a-z]{4,} [a-z]{4,} [a-z]{4,}', bl[i]): sub += ' ' + sentence(bl[i]); i += 1
        title = tcase(head) + (' — ' + sub if sub else '')
        if a == 59801: title = 'Sur la Confirmation'
        elif a == 60420: title = 'Sur l’Extrême-Onction'
        elif a == 59260: title = 'Sur la Religion'
        elif a == 52051: title = 'Sur le martyre des Machabées'
        elif a == 57282: title = 'Autre sermon pour le jour des Morts'
        elif a == 56562: title = 'Commémoration des Morts'
        title = title + part if not (a in (59801, 60420, 59260, 52051, 57282, 56562)) else title
        # rebuild the remaining lines for clean(): find the text after bl[i-1] by dropping i blocks
        nb = blocks(seg)
        rest = [ln for blk in nb[i:] for ln in blk + ['']]
        paras, notes = clean(rest, [vhead], 'num', re.compile(r'^TABLE DES MATI'))
        paras = [INL.sub(' ', p).strip() for p in paras]
        paras = [p for p in paras if not re.match(r'^FIN DU TOME', p) and  not re.fullmatch(r'[\W_]*', p) and len(p) > 2 and not re.fullmatch(r'\W{0,3}[A-Za-z]?\W{0,3}', p)]
        n += 1
        cid = 's-%02d' % n
        txt = render(title, paras, notes, fix_t)
        open(ROOT + 'fr-FR/' + cid + '.md', 'w').write(txt)
        out.append((cid, tome_of(a), title, len(txt.split())))
    return out
INL = re.compile(r'\s*\bS\w{3,8}[.,]*\s*[—–-]+\s*Tome\s+[IVXl1]+[.,]?\s*\d{0,3}(?=\s|$)')
def fix_t(s):
    s = re.sub(r'\s+([;:!?»])', r' \1', s)
    s = re.sub(r'«\s+', '« ', s)
    return s
if __name__ == '__main__':
    o = build()
    for x in o: print(x)
    print(sum(x[3] for x in o))
    json.dump(o, open('/tmp/vianney_sermons_index.json', 'w'), ensure_ascii=False)
