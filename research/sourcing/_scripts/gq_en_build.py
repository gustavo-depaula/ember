import sys, os, re, json, shutil, collections
sys.path.insert(0, os.path.dirname(__file__))
from gq_en import *
import bookjson
BASE = ROOT + 'content/books/gueranger-opera-omnia/annee-liturgique/'
TEMPORAL = re.compile(WEEKDAY + r'|CHAPTER|PREFACE|INTRODUCTION|SUNDAY|EASTER|ASH|HOLY|EVE|VIGIL|OCTAVE|EMBER|PASSION|PALM|WHITSUN|PENTECOST|ASCENSION|TRINITY|CORPUS|ADVENT|LENT', re.I)
def slugify(t):
    t = re.sub(r"[’']", '', t.lower())
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:48].strip('-')

def build_en(srcfile, folder, bid, vol, names, desc, translator, year_edition, url, extra_drop=(), first_rx=None):
    L = load(IA + srcfile)
    from gq_bi import deinterleave
    L, nbi = deinterleave(L)
    print('bilingual blocks', nbi)
    end = max([i for i, l in enumerate(L) if re.match(r'^\s*(END OF|FINIS)\b', l.strip())] or [len(L)])
    L = L[:end + 3]
    V = hyphen_vocab(L)
    freq = collections.Counter(w for l in L for w in re.findall(r'[A-Za-z]+', l.lower()))
    bs = boundaries(L)
    segs = []
    from difflib import SequenceMatcher
    def ords(x): return {w for w in re.findall(r'[A-Z]+', x.upper()) if w in EXW}
    def sametitle(a, b2):
        if re.match(r'^(CONTENTS|INDEX|CHAPTER)', b2.upper()) or re.match(r'^CHAPTER', a.upper()): return False
        oa, ob = ords(a), ords(b2)
        return SequenceMatcher(None, a.lower(), b2.lower()).ratio() >= .72 and (not oa or not ob or oa == ob)
    def noisy(t):
        ws = re.findall(r"[A-Za-z0-9]+", t)
        return any(re.search(r'\d', w) and re.search(r'[A-Za-z]', w) for w in ws) or any(freq.get(w.lower(), 0) < 2 for w in ws if len(w) > 3)
    for n, r in enumerate(bs):
        t = title_for(r, freq)
        e = bs[n + 1][0] if n + 1 < len(bs) else len(L)
        if segs and (not t or (e - r[0] < 8) or noisy(t) or sametitle(t, segs[-1][1])):
            segs[-1] = (segs[-1][0], segs[-1][1], segs[-1][2], e)  # no usable title or a re-listed heading: keep the text with the previous chapter
            continue
        if not t: continue
        segs.append((r, t, r[0], e))
    # drop contents / index segments, merge empties
    B = BASE + folder + '/'
    if os.path.exists(B + 'en-US'): shutil.rmtree(B + 'en-US')
    os.makedirs(B + 'en-US'); os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(IA + srcfile, B + f'sources/english-originals/{srcfile}')
    toc = []; words = 0; k = 0
    for r, t, s0, e in segs:
        if re.match(r'^(CONTENTS|INDEX|LIST OF)', t):
            if e - s0 <= 420: continue
            s0 += 300; t = 'Introductory chapters'   # a contents list swallowed the chapters that follow it
        j, fq = chapter(L[s0:e], V, 'en')
        paras, notes = build_chapter(j, fq, 'en', fix_en, keep_lead=False, drop=(r'^Digitized', r'^Google$') + tuple(extra_drop))
        title = tcase(t)
        d = date_str(r[2])
        if d and not TEMPORAL.search(t) or (d and re.match(r'^(THE )?(SAME DAY|FEAST)', r[1]) and not re.search(WEEKDAY, t)):
            title = f'{d} — {title}'
        k += 1
        cid = f'{k:03d}-{slugify(title)}'
        md = render(title, paras, notes)
        open(B + f'en-US/{cid}.md', 'w').write(md)
        words += len(md.split()); toc.append((cid, title))
    return B, toc, words
