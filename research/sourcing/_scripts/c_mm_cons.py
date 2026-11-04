import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import romval
L=src('/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/stbernardstreati00bern_djvu.txt')
a=next(i for i,l in enumerate(L) if i>550 and l.strip()=="AUTHOR'S    PREFACE" or (i>550 and re.match(r"^\s*AUTHOR.S\s+PREFACE\s*$",l)))
e=next(i for i,l in enumerate(L) if i>8300 and re.match(r'^\s*APPENDIX\s*$',l))
segs=[];cur=None;book=0
for i in range(a,e):
    s=L[i].strip()
    m=re.fullmatch(r'BOOK\s+([IVX]+)\.?',s)
    if m and i>a+10 and not L[i-1].strip() : book=romval(m.group(1)); cur=None; continue
    m=re.fullmatch(r'CHAPTER\)?\s+([IVXL]+)\.?',s)
    if m and book:
        n=romval(m.group(1).replace('XL','XI') if m.group(1)=='XL' else m.group(1))
        cur=[f'l{book}-c{n:02d}',[]]; segs.append(cur); continue
    if cur is None and i==a: cur=['prologus',[]]; segs.insert(0,cur); continue
    if cur is not None: cur[1].append(L[i])
def contents():
    d={};book=0;cur=None
    for i in range(344,596):
        t=L[i].strip()
        m=re.fullmatch(r'BOOK\s+([IVX]+)\.?.*',t)
        if m and t.startswith('BOOK') and len(t)<30: book=romval(re.match(r'BOOK\s+([IVX]+)',t).group(1)); continue
        m=re.match(r'^([IVXL]+)\.\s+(.*)$',t)
        if m and book:
            cur=[book,romval(m.group(1)),m.group(2)]; d[(book,cur[1])]=cur
        elif cur and t: cur[2]+=' '+t
        if cur and re.search(r'[\s.]\d+\s*$',t): cur=None
    out={}
    for k,v in d.items():
        x=re.sub(r'(\s*\.)+\s*\d*\s*$','',v[2]); x=re.sub(r'\s+\d+(\s+\d+)*\s*$','',x)
        x=re.sub(r'(\w)- (\w)',r'\1\2',x); out[k]=re.sub(r'\s+',' ',x).strip(' .')
    return out
CT=contents()
RN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
out=[]
for cid,ls in segs:
    if cid=='prologus':
        out.append((cid,'Author’s Preface',ls[1:] if not ls[0].strip() else ls)); continue
    n=0
    while n<len(ls) and not ls[n].strip(): n+=1
    tl=[]
    while n<len(ls) and len(tl)<6:
        if ls[n].strip():
            tl.append(ls[n].strip())
            if re.search(r'[.?]\s*$',ls[n]): n+=1; break
        n+=1
    t,rest=' '.join(tl),ls[n:]
    t=re.sub(r'\s+',' ',t).strip()
    k=(int(cid[1]),int(cid[4:]))
    if k in CT and k[0]<4: t=CT[k]
    t=' '.join(w.lower() if (w.isupper() and len(w)>2 and not re.fullmatch(r'[IVXLC]+',w)) else w for w in t.split())
    t=t.replace('SelfConsideration','Self-Consideration').replace('Selfconsideration','Self-Consideration')
    t=re.sub(r'(\w)- (\w)',r'\1\2',t).replace('*','')
    out.append((cid,f'Chapter {RN[int(cid[4:])]}. '+t.rstrip('.'),rest))
drops=[r"^\d+\s+ON\s+CONSIDERATION$",r"^ON\s+CONSIDERATION\s+\d+$",r"^[A-Z][A-Z .,'’-]{3,60}\s+\d{1,3}$",r"^\d{1,3}\s+[A-Z][A-Z .,'’-]{3,60}$",r"^\d+$"]
def post(cid,b):
    b=re.sub(r'(?<=[A-Za-z.,;:?!”’)])\*+','',b)
    return b
if __name__=='__main__':
    for c,t,l in out: print(c,t[:90],len(l))
    if len(sys.argv)>1:
        make_book(B+'bernard-opera-omnia/de-consideratione-mount-melleray','bernard-de-consideratione-mount-melleray','bernard/de-consideratione','On Consideration (Mount Melleray)',
         B+'bernard-opera-omnia/de-consideratione/book.json',
         "The English of a priest of Mount Melleray (Ailbe Luddy; Dublin, Browne and Nolan, 1921) of the five books De consideratione, Bernard's advice to Pope Eugene III: the author's preface and the sixty-one chapters, with the chapter summaries as titles. The Latin book's chapters match, and the Oxford English of George Lewis (1908) sits in that book; this second English is a separate book of the same work.",
         '1148-1153',{"translator":"A priest of Mount Melleray (Ailbe Luddy)","year":1921},
         source('https://archive.org/details/stbernardstreati00bern',"St. Bernard's Treatise on Consideration, translated by a priest of Mount Melleray (Dublin: Browne and Nolan, 1921).","Djvu OCR cleaned by script, not proofread. The long introduction, the translator's notes (dropped because the OCR runs them into the page text) and the appendix (Letter CCXXXVII to the Roman Curia) are not imported.",1921),
         out,drops=drops,post=post,pt_name='Sobre a consideração (Mount Melleray)',pt_desc='A tradução inglesa de um sacerdote de Mount Melleray (Dublin, 1921) dos cinco livros De consideratione de São Bernardo ao papa Eugênio III.',
         parts=[('liber-%d'%k,'Book '+RN[k],[c for c,_,_ in out if c.startswith('l%d-'%k)]) for k in range(1,6)] )
