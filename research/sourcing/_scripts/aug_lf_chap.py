import sys,re
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
import aug_lf
pgs=load_pages(sys.argv[1]); a,b=int(sys.argv[2]),int(sys.argv[3])
RM=re.compile(r'^[ivxlc]{1,6}[.,]?$',re.I)
for i in range(a,b+1):
    for l in aug_lf.page_lines(pgs[i]):
        if l['y']<350: continue
        m=[w for w in l['marg'] if RM.match(w)]
        sec=re.match(r'^(\d{1,3})\.\s',l['text'])
        if m or sec: print(i,m,sec.group(1) if sec else '',l['x'],l['text'][:50])
