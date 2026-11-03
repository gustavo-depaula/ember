"""LF Expositions on the Psalms: one volume xml -> chapters per psalm (LF/English numbering).
usage: aug_lf_ps_build.py VOL  -> writes research/sourcing/augustine-latin/lf/VOL.json {chapters:[{n, parsed, sections:[{label, paras}]}]} and prints a summary"""
import sys, re, json, os
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
import aug_lf, aug_lf_ps as P, en_common as E, rhb_build
LOOSE = re.compile(r'^\W{0,3}\d?[%P]\w?[SB]?\w?AL\w?\s+([A-Za-z0-9!|*\s.,]{1,12})\W*$')
STOP = re.compile(r'^(INDEX|INDICES|GENERAL INDEX|LIST OF|SUBSCRIBERS|ADVERTISEMENT)\b|LIBRARY OF (THE )?FATHERS|ARCHBISHOP OF CANTERBURY|RETURN TO DESK|DUE AS STAMPED|^TEXTS OF')
ORDN = {'FIRST': 1, 'SECOND': 2, 'THIRD': 3, 'FOURTH': 4, 'FIFTH': 5, 'SIXTH': 6, 'SEVENTH': 7}
def roman(s):
    s = re.sub(r'[lt1!|]', 'I', s.replace('H', 'II').replace('*', '').strip(' .,'))
    s = s.replace(' ', '')
    s = re.sub(r'([IV])L$', r'\1I', s)
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500}; t = 0
    for i, c in enumerate(s):
        if c not in v: return None
        t += -v[c] if i + 1 < len(s) and v[c] < v.get(s[i + 1], 0) else v[c]
    return t
def sub_n(t):
    m = P.HSUB.match(t)
    g = m.group(1) or m.group(2)
    if g in ORDN: return ORDN[g]
    return roman(g.replace('T', 'I').replace('L', 'I')) or 1
def main(vol):
    pgs = load_pages('/Users/gustavo/Documents/prayer/research/sourcing/augustine-latin/xml/%s.xml' % vol)
    toks = []
    for i, pg in enumerate(pgs):
        H = pg['h']
        ls = aug_lf.page_lines(pg)
        body = sorted(l['h'] for l in ls if len(l['text']) > 40)
        med = body[len(body) // 2] if body else 0
        for l in ls:
            t = l['text'].strip()
            if l['y'] < 0.1 * H or l['y'] > 0.955 * H: continue
            m = LOOSE.match(t)
            if m and l['x'] > 250 and len(t) < 28: toks.append(('P', t, roman(m.group(1)), i, l)); continue
            if P.HSUB.match(t) and l['x'] > 250: toks.append(('S', t, sub_n(t), i, l)); continue
            if STOP.search(t) and i > 12 and any(k == 'P' for k, *_ in toks): toks.append(('STOP', t, 0, i, l)); continue
            if len(t) < 4 or sum(c.isalpha() for c in t) < 0.5 * len(t): continue
            if l['h'] < 0.86 * med: continue
            toks.append(('L', t, 0, i, l))
    # chapters
    chaps = []; cur = None; prev_str = None; started = False
    for idx, (k, t, n, i, l) in enumerate(toks):
        if k == 'STOP': break
        if k == 'P':
            ahead = [x for x in toks[idx + 1: idx + 5] if x[0] in 'SP']
            repeat = bool(ahead and ahead[0][0] == 'S' and ahead[0][2] >= 2) or (cur is not None and n == cur['parsed'])
            started = True
            if repeat and cur is not None:
                cur['sections'].append(dict(label=None, lines=[], sub=None)); continue
            exp = (chaps[-1]['end'] + 1) + (1 if chaps[-1]['end'] == 9 else 0) if chaps else (n or 1)
            L = n if (n and exp <= n <= exp + 3) else exp
            if chaps: chaps[-1]['end'] = max(chaps[-1]['n'], L - 1 - (1 if L == 11 else 0))
            cur = dict(parsed=n, n=L, end=L, sections=[dict(label=None, lines=[], sub=None)], page=i); chaps.append(cur); continue
        if not started or cur is None: continue
        if k == 'S':
            sec = cur['sections'][-1]
            if sec['lines']: cur['sections'].append(dict(label=None, lines=[], sub=None)); sec = cur['sections'][-1]
            sec['sub'] = (P.HSUB.match(t).group(0), n); continue
        cur['sections'][-1]['lines'].append((t, l['x']))
    for c in chaps:
        for s in c['sections']:
            paras = []; ln = []
            for t, x in s['lines']:
                if 40 < x < 130 and ln: paras.append(ln); ln = []
                ln.append(t)
            if ln: paras.append(ln)
            ps = [E.join_lines(p) for p in paras]
            mg = []
            for p in ps:
                if mg and p[:1].islower(): mg[-1] += ' ' + p
                else: mg.append(p)
            s['paras'] = [re.sub(r'\s+', ' ', re.sub(r'\s+([;:!?,.])', r'\1', x)).strip() for x in mg]
            del s['lines']
    os.makedirs('/Users/gustavo/Documents/prayer/research/sourcing/augustine-latin/lf', exist_ok=True)
    json.dump(chaps, open('/Users/gustavo/Documents/prayer/research/sourcing/augustine-latin/lf/%s.json' % vol, 'w'), ensure_ascii=False, indent=1)
    print(vol, len(chaps), 'chapters', sum(len(p.split()) for c in chaps for s in c['sections'] for p in s['paras']), 'words')
    for c in chaps:
        flag = '' if c['parsed'] == c['n'] else '  <<< parsed %s' % c['parsed']
        print(' ', c['n'], c['end'], c['parsed'], 'p%d' % c['page'], [(len(s['paras']), sum(len(p.split()) for p in s['paras'])) for s in c['sections']], flag)
if __name__ == '__main__': main(sys.argv[1])
