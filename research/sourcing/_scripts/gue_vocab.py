"""French vocabulary from the corpus (excluding Guéranger) for hyphen repair; cached in gueranger/frvocab.txt."""
import os, re, glob, collections
ROOT = '/Users/gustavo/Documents/prayer/'
CACHE = ROOT + 'research/sourcing/gueranger/frvocab.txt'
def vocab():
    if os.path.exists(CACHE):
        return dict(l.rsplit(' ', 1) for l in open(CACHE).read().split('\n') if l) and {l.rsplit(' ', 1)[0] for l in open(CACHE).read().split('\n') if l}
    c = collections.Counter()
    for f in glob.glob(ROOT + 'content/books/*/*/fr-FR/*.md') + glob.glob(ROOT + 'content/books/*/*/*/fr-FR/*.md'):
        if 'gueranger' in f: continue
        for w in re.findall(r"[a-zà-ÿœæ]+", open(f, errors='ignore').read().lower()):
            c[w] += 1
    with open(CACHE, 'w') as o:
        for w, n in c.items():
            if n >= 3: o.write('%s %d\n' % (w, n))
    return {w for w, n in c.items() if n >= 3}
SUF = ['-t-il', '-t-ils', '-t-elle', '-t-elles', '-t-on', '-il', '-ils', '-elle', '-elles', '-on', '-ce', '-même', '-mêmes', '-moi', '-toi', '-lui', '-nous', '-vous', '-je', '-tu', '-eux', '-ci', '-là']
def fix_token(w, V):
    lw = w.lower()
    if lw in V or len(lw) < 3: return w
    for s in SUF:
        suf = s.replace('-', '')
        if lw.endswith(suf) and len(lw) > len(suf) + 1:
            base = lw[:-len(suf)]
            if s.startswith('-t-'):
                if base.endswith('t') or True:
                    b2 = lw[:-len(s.replace('-t-', 't'))]  # e.g. atil -> a
                    b2 = lw[:-(len(suf) + 1)] if lw[-len(suf) - 1] == 't' else base
                    if lw[-len(suf) - 1:-len(suf)] == 't' and b2 in V and b2[-1] in 'ae':
                        return w[:len(b2)] + s + ''
            if base in V:
                return w[:len(base)] + s
    return w
def fix_text(t, V):
    return re.sub(r"[A-Za-zÀ-ÿœ]+", lambda m: fix_token(m.group(0), V), t)
