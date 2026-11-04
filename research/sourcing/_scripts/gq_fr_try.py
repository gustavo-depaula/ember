import sys; sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_fr import *
for slug in sys.argv[1:]:
    ch,notes=split_post(slug,'INTRO')
    print('##',slug,len(ch))
    for t,b in ch: print('  ',len(b),t[:100])
