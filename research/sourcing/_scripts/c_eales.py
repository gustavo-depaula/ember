import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import romval, tcase
D='/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/'
FILES=['saintbernardlife00bernuoft_djvu.txt','saintbernardlife02bernuoft_djvu.txt','lifeworksofsaint03bern_djvu.txt']
H=re.compile(r'^\s*LETTER\s+([IVXLC]+)\.?\s*(\(.*\)|\[.*)?\s*$')
def heads(L,last=0):
    out=[]
    for i,l in enumerate(L):
        m=H.match(l)
        if not m: continue
        if re.search(r'\d{2,}\s*$',l) or re.search(r'\s[IVXLC]+\.\s+\d',l): continue
        n=romval(m.group(1))
        if n>last and n<=last+400:   # forward, small jumps only
            out.append((i,n)); last=n
    return out
def letters():
    res={};last=0
    for f in FILES:
        L=src(D+f); h=heads(L,last)
        last=h[-1][1]
        for k,(i,n) in enumerate(h):
            j=h[k+1][0] if k+1<len(h) else min(len(L),i+400)
            res.setdefault(n,(L[i],L[i+1:j]))
    return res
def title_of(n,head,ls):
    m=H.match(head); date=(m.group(2) or '').strip() if m else ''
    k=0
    while k<len(ls) and not ls[k].strip(): k+=1
    tl=[]
    while k<len(ls) and ls[k].strip() and len(tl)<4: tl.append(ls[k].strip()); k+=1
    to=re.sub(r'\s+',' ',' '.join(tl))
    if not (to.upper()==to or to.startswith('To')) : to=''; k=0
    to=tcase(to) if to else ''
    to=re.sub(r'^To ','To ',to)
    t=f'Letter {n}'
    if to: t+=f'. {to}'
    return t,ls[k:]
if __name__=='__main__':
    R=letters(); ns=sorted(R); print(len(R),ns[0],ns[-1],[n for n in range(1,ns[-1]+1) if n not in R][:60])
    sizes=sorted((sum(len(x.split()) for x in R[n][1]),n) for n in R); print(sizes[:5],sizes[-5:])
