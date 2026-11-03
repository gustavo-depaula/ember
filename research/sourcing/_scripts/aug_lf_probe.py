import re,sys,html,statistics
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
pgs=load_pages(sys.argv[1]); key=sys.argv[2]
for i,pg in enumerate(pgs):
    txt=' '.join(w[4] for ln in pg['lines'] for w in ln)
    if key in txt:
        print('PAGE',i,pg['w'],pg['h'])
        for ln in pg['lines']:
            hs=[b-d for a,b,c,d,t in ln]
            print('%4d-%4d y%4d h%3d | %s'%(ln[0][0],ln[-1][2],ln[0][3],statistics.median(hs),' '.join(w[4] for w in ln)[:90]))
        break
