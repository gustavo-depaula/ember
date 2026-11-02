"""List the commonest words not in the dictionary in a book dir: fmc_unknown.py BOOKDIR [N]"""
import sys, re, glob, collections
W = set(w.strip().lower() for w in open('/usr/share/dict/words', errors='ignore')) | set(w.strip().lower() for w in open('/usr/share/dict/web2a', errors='ignore'))
c = collections.Counter(); tot = 0
for f in glob.glob(sys.argv[1] + '/en-US/*.md'):
    t = re.sub(r'\[\^\d+\]:.*', '', open(f).read())
    for w in re.findall(r"[A-Za-z]+", t):
        tot += 1; l = w.lower()
        if l in W or l.rstrip('s') in W or l[:-2] in W or l[:-3] in W or l[:-1] in W or l[:-3] + 'e' in W or l[:-2]+'e' in W: continue
        if w[0].isupper() and len(w) > 3: continue
        c[l] += 1
print(sum(c.values()), 'of', tot, 'unknown;', len(c), 'distinct')
print(' '.join('%s:%d' % x for x in c.most_common(int(sys.argv[2]) if len(sys.argv) > 2 else 120)))
