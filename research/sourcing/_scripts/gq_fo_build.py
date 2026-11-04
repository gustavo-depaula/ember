import sys, os, re, json, shutil, collections
sys.path.insert(0, os.path.dirname(__file__))
import gq_fo as G
from gq_fo import load, hyphen_vocab, chapter, build_chapter, render, ROOT, SRC, boundaries, title_for
from mc_lib import fix_fr
from gq_bi import deinterleave
import gq_fr
BASE = ROOT + 'content/books/gueranger-opera-omnia/annee-liturgique/'
IA = SRC + 'gueranger/ia/'
def slugify(t):
    for a, b in (('à', 'a'), ('â', 'a'), ('é', 'e'), ('è', 'e'), ('ê', 'e'), ('ë', 'e'), ('î', 'i'), ('ï', 'i'), ('ô', 'o'), ('û', 'u'), ('ù', 'u'), ('ç', 'c'), ('œ', 'oe'), ('’', ''), ("'", '')):
        t = t.lower().replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:48].strip('-')

def build_fo(srcfile, folder):
    L = load(IA + srcfile)
    L, nbi = deinterleave(L, 'fr-FR')
    ends = [i for i, l in enumerate(L) if re.match(r'^\s*(FIN DE LA TABLE|TABLE DES MATI)', re.sub(r'\s+', ' ', l.strip()), re.I)]
    # the contents list at the back: cut at its first heading
    tab = [i for i in ends if i > len(L) * .85]
    L = L[:min(tab)] if tab else L
    V = hyphen_vocab(L)
    freq = collections.Counter(w for l in L for w in re.findall(r'[A-Za-zÀ-ÿ]+', l.lower()))
    bs = boundaries(L)
    from difflib import SequenceMatcher
    def noisy(t):
        ws = re.findall(r"[A-Za-zÀ-ÿ0-9]+", t)
        return any(re.search(r'\d', w) and re.search(r'[A-Za-z]', w) for w in ws) or any(freq.get(w.lower(), 0) < 2 for w in ws if len(w) > 4)
    def ords(x): return {w for w in re.findall(r'[A-Z]+', re.sub(r'[ÉÈ]', 'E', x.upper())) if w in G.EXW}
    def same(a, b2):
        if re.match(r'^(TABLE|INDEX|CHAPITRE)', b2.upper()) or re.match(r'^CHAPITRE', a.upper()): return False
        oa, ob = ords(a), ords(b2)
        return SequenceMatcher(None, a.lower(), b2.lower()).ratio() >= .72 and (not oa or not ob or oa == ob)
    segs = []
    for n, r in enumerate(bs):
        t = title_for(r, freq)
        e = bs[n + 1][0] if n + 1 < len(bs) else len(L)
        if segs and (not t or (e - r[0] < 8) or noisy(t) or same(t, segs[-1][1])):
            segs[-1] = (segs[-1][0], segs[-1][1], segs[-1][2], e); continue
        if not t: continue
        segs.append((r, t, r[0], e))
    B = BASE + folder + '/'
    if os.path.exists(B + 'fr-FR'): shutil.rmtree(B + 'fr-FR')
    os.makedirs(B + 'fr-FR'); os.makedirs(B + 'sources/french-originals', exist_ok=True)
    shutil.copy(IA + srcfile, B + f'sources/french-originals/{srcfile}')
    toc = []; words = 0; k = 0
    for r, t, s0, e in segs:
        if re.match(r'^(TABLE|INDEX)', t):
            if e - s0 <= 420: continue
            s0 += 300; t = 'Chapitres préliminaires'
        j, fq = chapter(L[s0:e], V, 'fr')
        paras, notes = build_chapter(j, fq, 'fr', fix_fr, keep_lead=False, drop=(r'^Digitized',))
        title = gq_fr.norm_date(t) if gq_fr.DATE.match(t) else gq_fr.sentence(t)
        k += 1
        cid = f'{k:03d}-{slugify(title) or "chapitre"}'
        md = render(title, paras, notes)
        open(B + f'fr-FR/{cid}.md', 'w').write(md)
        words += len(md.split()); toc.append((cid, title))
    return B, toc, words, nbi
