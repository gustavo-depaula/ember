"""Config builder: from fmc_mk import mk; mk(slug='x', ...) writes fmc_cfg_<slug>.json and runs the import + split fix.
Fields: author = 'manning' | 'faber' | 'challoner'."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
AU = {'manning': ('manning-opera-omnia', 'Cardinal Henry Edward Manning', 'Cardeal Henry Edward Manning', 1892, 'mann'),
      'faber': ('faber-opera-omnia', 'Frederick William Faber', 'Frederick William Faber', 1863, 'fab'),
      'challoner': ('challoner-opera-omnia', 'Bp. Richard Challoner', 'D. Richard Challoner', 1781, 'chall')}
def mk(a, slug, name, name_pt, desc, desc_pt, composed, year, imprint, ia, src, start, end, units, front=(), back=(), fn=True, title=None, srcnote='', work=None, run=True):
    d, an, anpt, died, pre = AU[a]
    cfg = dict(id='%s-%s' % (a, slug), dir='%s/%s' % (d, slug), slug=slug, work='%s/%s' % (a, work or slug), name=name, name_pt=name_pt, author=an, author_pt=anpt, died=died,
               desc=desc, desc_pt=desc_pt, composed=composed, editor='%s (%s)' % (an.replace('Cardinal ', ''), imprint), year=year,
               url='https://archive.org/details/' + ia, edition='%s (%s), Internet Archive full-text OCR.' % (title or name, imprint),
               srcnote=srcnote, src='%s/ia/%s_djvu.txt' % (a, ia), start=start, end=end, fn=fn, back=list(back), front=list(front), label={}, romanheads=False, inline=[],
               units=[dict(id=i, title=t, **({'from': f})) for (i, t, f) in units])
    p = os.path.join(D, 'fmc_cfg_%s_%s.json' % (pre, slug.replace('-', '_')))
    json.dump(cfg, open(p, 'w'), indent=1)
    if run:
        subprocess.run([sys.executable, os.path.join(D, 'fmc_import.py'), p], check=True)
        bd = '/Users/gustavo/Documents/prayer/content/books/' + cfg['dir']
        subprocess.run([sys.executable, os.path.join(D, 'fmc_fixsplit.py'), bd], check=True)
        subprocess.run([sys.executable, os.path.join(D, 'fmc_unknown.py'), bd, '45'], check=True)
    return p

def find_titles(src, titles, pos=1, n=14, caps=True):
    """first line >= pos whose letters start with the title's first n letters (caps lines only); returns [(id,title,line)]"""
    import re
    L = open(src if os.path.isabs(src) else os.path.join(D, '..', src), encoding='utf8', errors='ignore').read().split('\n')
    key = lambda s: re.sub(r'[^A-Z]', '', s.upper().replace('K', 'C'))
    out = []
    for i, t in enumerate(titles, 1):
        k = key(t)[:n]; hit = None
        for j in range(pos - 1, len(L)):
            l = L[j].strip(); a = [c for c in l if c.isalpha()]
            if len(a) >= 4 and (not caps or sum(c.isupper() for c in a) >= 0.7 * len(a)) and key(l).startswith(k[:min(n, len(key(l)))]) and len(key(l)) >= min(len(k), 8):
                hit = j + 1; break
        out.append((i, t, hit)); pos = hit or pos
    return out

def back_to_numeral(src, units, maxback=4):
    """move each unit's start back over a lone numeral/'CHAPTER N' line just above its title line"""
    import re
    L = open(os.path.join(D, '..', src), encoding='utf8', errors='ignore').read().split('\n')
    out = []
    for i, t, f in units:
        for k in range(1, maxback + 1):
            s = L[f - 1 - k].strip() if f - 1 - k >= 0 else ''
            if re.fullmatch(r'(CHAPTER|LECTURE|SERMON)?\s*[IVXLivxlTU1!]{1,7}\.?', s) : f = f - k; break
            if s and not re.fullmatch(r'[\W]*', s): break
        out.append((i, t, f))
    return out
