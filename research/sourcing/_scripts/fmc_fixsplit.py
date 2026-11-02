"""Rejoin words split without a hyphen by the OCR ('sugges tions'): fmc_fixsplit.py BOOKDIR
Joins 'a b' when 'ab' is a dictionary word and a or b is not one."""
import sys, re, glob
W = set(w.strip().lower() for w in open('/usr/share/dict/words', errors='ignore')) | set(w.strip().lower() for w in open('/usr/share/dict/web2a', errors='ignore'))
PRE = {'con', 'de', 'dis', 're', 'ex', 'en', 'in', 'di', 'ap', 'ar', 'as', 'pre', 'pro', 'sur', 'im', 'ob', 'or', 'per', 'com', 'un', 'sub', 'ac', 'ad'}
KEEP = {'a', 'i', 'o'}
def isw(l):
    if l in W: return True
    for suf, rep in (('s', ''), ('es', ''), ('ed', ''), ('ed', 'e'), ('d', ''), ('ing', ''), ('ing', 'e'), ('ly', ''), ('er', ''), ('ers', ''), ('ies', 'y'), ('ied', 'y'), ('ness', ''), ('ment', ''), ('ments', ''), ('ions', 'ion')):
        if l.endswith(suf) and len(l) > len(suf) + 2 and l[:-len(suf)] + rep in W: return True
    return False
n = 0; J = []
def fix(m):
    global n
    a, b = m.group(1), m.group(2)
    ab = (a + b).lower()
    if a.lower() in W and (a.lower() not in PRE or isw(b.lower())): return m.group(0)
    if isw(ab) and (a.lower() not in W or b.lower() not in W) and len(b) >= 2 and not (a.lower() in KEEP):
        n += 1; J.append(a + ' ' + b); return a + b
    return m.group(0)
for f in glob.glob(sys.argv[1] + '/en-US/*.md'):
    t = open(f).read()
    t2 = re.sub(r'(?<![\w\[^])([a-z]{2,10}) ([a-z]{2,10})(?![\w])', fix, t)
    if t2 != t: open(f, 'w').write(t2)
print('joined', n)
print(' | '.join(sorted(set(J))[:400]) if len(sys.argv) > 2 else '')
