import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from elisabeth_souvenirs import *
ROOT = '/Users/gustavo/Documents/prayer/content/books/elisabeth-of-the-trinity-opera-omnia/'

def pre(ls, grp_pats, letter_pat):
    out = []
    for ln in ls:
        t = ln.strip()
        t2 = re.sub(r'\s+', ' ', t)
        g = next((i for i, p in enumerate(grp_pats) if p.search(t2)), None)
        if g is not None and len(t2) < 80:
            out += ['', '@@GROUP%d@@' % g, '']
        elif letter_pat.match(t2):
            out += ['', '@@LETTER@@', '']
        else:
            out.append(ln)
    return out

def build(L, a, b, grp_pats, letter_pat, titles, heads, style, fix, d, word, abbe=None):
    ls = pre(L[a:b], grp_pats, letter_pat)
    paras, notes = clean(ls, heads, style)
    os.makedirs(d, exist_ok=True)
    groups = {0: []}; cur = 0; k = 0
    i = 0
    while i < len(paras):
        p = paras[i]
        if p.startswith('@@LETTER@@') and p != '@@LETTER@@':
            paras[i:i+1] = ['@@LETTER@@', p[len('@@LETTER@@'):].strip()]
            p = paras[i]
        if cur is not None and len(p) < 60 and p.isupper() and not p.startswith('@@'):
            i += 1; continue
        m = re.fullmatch(r'@@GROUP(\d+)@@', p)
        if m:
            cur = int(m.group(1)); groups[cur] = []; k = 0
        elif p == '@@LETTER@@':
            k += 1
            groups.setdefault(cur, []).append('## %s %d' % (word, k))
            if i + 1 < len(paras) and len(paras[i+1]) < 45 and re.search(r'\d', paras[i+1]) and not paras[i+1].startswith('@@'):
                i += 1; groups[cur].append('*%s*' % fix(paras[i]))
        else:
            if cur is not None and not re.fullmatch(r'(\[\^\d+\])+', p):
                groups[cur].append(fix(p))
        i += 1
    # footnotes: keep each note with the group holding its marker
    tot = 0
    for g, t in sorted(groups.items()):
        body = '\n\n'.join(t)
        used = sorted({int(x) for x in re.findall(r'\[\^(\d+)\]', body)})
        txt = '# %s\n\n%s\n\n' % (titles[g], body) + ''.join('[^%d]: %s\n\n' % (n, fix(notes[n])) for n in used)
        open(d + 'g%d.md' % (g+1), 'w').write(txt.rstrip() + '\n'); tot += len(txt.split())
    return tot

frg = [re.compile(r'^a une amie$', re.I), re.compile(r'chanoine A', re.I), re.compile(r'^Lettres à Madame'), re.compile(r'aspirante au Carmel'), re.compile(r'^Fra\S* divers')]
frt = ["À une amie", "À M. le chanoine A.", "À Madame ***", "À une aspirante au Carmel", "Fragments divers"]
eng = [re.compile(r'^LETTERS OF SISTER ELIZABETH OF THE TRINITY'), re.compile(r'^LETTERS TO M. LE CHANOINE'), re.compile(r'^LETTERS TO MADAME'), re.compile(r'^LETTERS TO SOMEONE WHO'), re.compile(r'^FRAGMENTS OF LETTERS')]
ent = ["To a Friend", "To Canon A.", "To Madame ***", "To Someone Who Wished to Become a Carmelite", "Fragments of Letters"]
frl = re.compile(r'^Lettre\s+[IVX1lP]{1,4}\S{0,3}[,.]?$')
enl = re.compile(r'^\\?Letter\s+\S{1,3}[.,]?\s*\S{0,4}\s*\S?$|^LETTER 7\. ', re.I)
if __name__ == '__main__':
    print(build(fr, 11722, 12786, frg, frl, frt, FRH, 'num', fix_fr, ROOT + 'lettres/fr-FR/', 'Lettre'))
    print(build(en, 12224, 13262, eng, enl, ent, ENH, 'sym', lambda s: s, ROOT + 'lettres-stanbrook/en-US/', 'Letter'))
