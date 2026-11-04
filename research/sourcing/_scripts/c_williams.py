import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import romval
L=src('/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/treatiseofstbern00bern_djvu.txt')
a=next(i for i,l in enumerate(L) if i>1200 and l.strip()=='PREFACE')
e=next(i for i,l in enumerate(L) if i>5000 and re.match(r'^\s*INDEX\s+OF\s+SUBJECTS',l))
segs=[['praefatio',[]]];cur=segs[0]
for i in range(a+1,e):
    m=re.fullmatch(r'CHAPTER\s+([IVXL]+)\s*[,.]?',L[i].strip())
    if m: cur=[f'c{romval(m.group(1)):02d}',[]]; segs.append(cur); continue
    cur[1].append(L[i])
RN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
out=[]
for cid,ls in segs:
    if cid=='praefatio': out.append((cid,'Preface',ls)); continue
    k=0
    while k<len(ls) and not ls[k].strip(): k+=1
    tl=[]
    while k<len(ls) and len(tl)<5:
        if ls[k].strip():
            tl.append(ls[k].strip())
            if re.search(r'[.?]\s*$',ls[k]): k+=1; break
        k+=1
    t=re.sub(r'\s+',' ',' '.join(tl)).rstrip('.')
    out.append((cid,f'Chapter {RN[int(cid[1:])]}',ls[k:]))
drops=[r'^\d*\s*THE\s+TREATISE\s+OF\s+ST\.?\s+BERNARD\s*\d*$',r'^\d+$',r'^[A-Z][A-Z .,\'’-]{5,50}\s+\d{1,3}$',r'^\d{1,3}\s+[A-Z][A-Z .,\'’-]{5,50}$']
if __name__=='__main__':
    for c,t,l in out: print(c,t[:100],len(l))
    if len(sys.argv)>1:
        make_book(B+'bernard-opera-omnia/de-gratia-et-libero-arbitrio-williams','bernard-de-gratia-et-libero-arbitrio-williams','bernard/de-gratia-et-libero-arbitrio','Concerning Grace and Free Will',B+'bernard-opera-omnia/de-gratia-et-libero-arbitrio/book.json',
         "Watkin Williams's English (SPCK, 1920) of Bernard's treatise on grace and free choice, addressed to William of St. Thierry: the preface and fourteen chapters (titled by number, because the OCR garbles Williams's chapter headings), with Williams's footnotes where the OCR keeps them legible.",
         '1127-1128',{"translator":"Watkin Williams","year":1920},
         source('https://archive.org/details/treatiseofstbern00bern',"The Treatise of St. Bernard concerning Grace and Free Will, translated by Watkin Williams (London: SPCK, 1920), Translations of Christian Literature, Series IV.","Djvu OCR cleaned by script, not proofread. Williams's introduction, synopsis and indexes are not imported; his footnotes are dropped, and a few note lines the OCR ran into the text may remain; the chapter headings are not given because the OCR garbles them.",1920),
         out,drops=drops,note_start=re.compile(r"^\s*[\^'\"®\-]\s"),post=lambda c,b:'\n\n'.join(p for p in re.sub(r'\^+','',b).split('\n\n') if not (len(p.split())<14 and re.search(r'Vulg|MSS|TREATISE OF|CONCERNING GRACE|^[\W\d]*[a-z],? ?[a-z]?\W*$',p))),pt_name='Sobre a graça e o livre-arbítrio',pt_desc='A tradução inglesa de Watkin Williams (1920) do tratado de São Bernardo sobre a graça e o livre-arbítrio.')
