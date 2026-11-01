import sys,re
# usage: _seg.py file pattern=label ...
f=sys.argv[1]; pats=[(re.compile(p.split('=',1)[0]),p.split('=',1)[1]) for p in sys.argv[2:]]
cur='front'; counts={}; order=[]
for line in open(f,encoding='utf-8',errors='replace'):
    for p,l in pats:
        if p.search(line):
            cur=l; break
    if cur not in counts: counts[cur]=0; order.append(cur)
    counts[cur]+=len(line.split())
for k in order: print(f"{counts[k]:>9} {k}")
