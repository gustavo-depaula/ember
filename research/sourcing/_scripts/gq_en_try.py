import sys; sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_en import *
import collections
f=sys.argv[1]
L=load(IA+f)
V=hyphen_vocab(L)
freq=collections.Counter(w for l in L for w in re.findall(r'[A-Za-z]+',l.lower()))
b=boundaries(L)
print(len(b), len(L))
for r in b:
    t=title_for(r,freq); d=date_str(r[2])
    print(r[0], (d+' | ' if d and not re.search(WEEKDAY,t or '') else '')+str(t))
