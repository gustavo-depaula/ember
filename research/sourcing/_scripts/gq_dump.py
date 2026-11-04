import sys; sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_dg import *
items,notes=parse(sys.argv[1])
print(len(items),len(notes))
for i,(k,t,c) in enumerate(items):
    if k=='p' and upper(t) and len(t)<120: print(i,'C' if c else ' ',t)
