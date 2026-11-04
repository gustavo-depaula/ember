import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from en_ocr import *
from en_common import romval, tcase
SRC='/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/LifeAndWorksOfSaintBernardV4_djvu.txt'
ROOT='/Users/gustavo/Documents/prayer/content/books/bernard-opera-omnia/sermones-super-cantica'
L=open(SRC,errors='ignore').read().split('\n')
idx=[i for i,l in enumerate(L) if re.match(r'^\s*SERMON\s+[IVXLC]+',l)]
assert len(idx)==86
# end: after sermon 86 find "INDEX"/end marker
endi=next((i for i in range(idx[-1],len(L)) if re.match(r'^\s*(INDEX|APPENDIX)\b',L[i])),len(L))
JUNK=re.compile(r'^(Digitized\s+by\s*(Google|Goo\w*|L\.?o?o?Q?le)?|Google|Goo|Digitized|Original from.*)\W*$|^SERMONS\s+ON\s+THE\s+SONG\s+OF\s+SONGS\W*$|^[\d\s]{1,5}$|^\W{0,3}$')
drops=[JUNK, re.compile(r'^[A-Z\s,\'.;:-]{12,}\s+\d{1,3}$'), re.compile(r'^\d{1,3}\s+[A-Z\s,\'.;:-]{12,}$')]
def upr(s):
    a=[c for c in s if c.isalpha()]; return sum(c.isupper() for c in a)/max(1,len(a))
secs=[]
for k,i in enumerate(idx):
    e=idx[k+1] if k+1<len(idx) else endi
    lines=L[i+1:e]
    # title: first block (non-junk) in first 12 non-empty lines with uppercase ratio >.6 and no digits-ending
    blocks=[];cur=[]
    for j,l in enumerate(lines[:40]):
        if l.strip(): cur.append((j,l))
        elif cur: blocks.append(cur);cur=[]
    title='';cut=0
    for b in blocks[:4]:
        t=' '.join(x.strip() for _,x in b)
        if JUNK.match(t) or any(JUNK.match(x.strip()) for _,x in b) and len(b)<4: continue
        if re.search(r'\s\d{1,3}$',t): continue
        if upr(t)>.6 and len(t.split())>=3 or k+1 in (1,72,77) and b is blocks[0] :
            title=t; cut=b[-1][0]+1
        break
    secs.append((k+1,title,lines[cut:]))
if __name__=='__main__':
    import json
    for n,t,ls in secs:
        body=chapter_md(ls,drops,key=n)
        print(n,'|',t[:70],'|',body[:50].replace('\n',' '),'|',STATS[n][:20])
