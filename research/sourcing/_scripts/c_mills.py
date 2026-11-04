import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import romval
L=src('/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/MN41533ucmf_0_djvu.txt')
a=next(i for i,l in enumerate(L) if re.match(r'^\s*PART\s+I\s*$',l) and i>1500)
e=next((i for i,l in enumerate(L) if i>4900 and re.match(r'^\s*(INDEX|APPENDIX|PUBLICATIONS)\b',l)),len(L)-40)
segs=[];cur=None;part=0
for i in range(a,e):
    s=L[i].strip()
    if re.fullmatch(r'PART\s+I+',s): continue
    if s=='THE  TWELVE  DEGREES  OF  HUMILITY' or re.fullmatch(r'THE\s+TWELVE\s+DEGREES\s+OF\s+(HUMILITY|PRIDE).*',s) and len(s)<60 and False: continue
    m=re.fullmatch(r'CHAPTER\s+([IVXL]+)',s)
    if m: cur=[romval(m.group(1)),[]]; segs.append(cur); continue
    if cur: cur[1].append(L[i])
RN=lambda n:{1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII',13:'XIII',14:'XIV',15:'XV',16:'XVI',17:'XVII',18:'XVIII',19:'XIX',20:'XX',21:'XXI',22:'XXII'}[n]
out=[]
for n,ls in segs:
    k=0
    while k<len(ls) and not ls[k].strip(): k+=1
    tl=[]
    while k<len(ls) and len(tl)<5:
        if ls[k].strip():
            tl.append(ls[k].strip())
            if re.search(r'[.?]\s*$',ls[k]): k+=1; break
        elif tl and False: break
        k+=1
    t=re.sub(r'\s+',' ',' '.join(tl)).rstrip('.')
    out.append((f'c{n:02d}',f'Chapter {RN(n)}. {t}',ls[k:]))
drops=[r'^\d+\s+SAINT\s+BERNARD$',r'^SAINT\s+BERNARD\s+\d+$',r'^\d+\s+THE\s+TWELVE\s+DEGREES.*$',r'^THE\s+TWELVE\s+DEGREES\s+OF\s+(HUMILITY|PRIDE)\W*\d*$',r'^[A-Z][A-Z .,\'’-]{3,50}\s+\d{1,3}$',r'^\d{1,3}\s+[A-Z][A-Z .,\'’-]{3,50}$',r'^\d+$',r'^PART\s+I+$']
if __name__=='__main__':
    for c,t,l in out: print(c,t[:100],len(l))
    if len(sys.argv)>1:
        make_book(B+'bernard-opera-omnia/de-gradibus-humilitatis-mills','bernard-de-gradibus-humilitatis-mills','bernard/de-gradibus-humilitatis',
         'The Twelve Degrees of Humility and Pride',B+'bernard-opera-omnia/de-gradibus-humilitatis/book.json',
         "Barton R. V. Mills's English (SPCK, 1929) of Bernard's first treatise, in twenty-two chapters under two parts: the twelve degrees of humility (chapters I-IX) and the twelve degrees of pride (X-XXII). Mills's chapters differ from the Latin book's, so this is a separate book of the same work.",
         '1124',{"translator":"Barton R. V. Mills","year":1929},
         source('https://archive.org/details/MN41533ucmf_0',"The Twelve Degrees of Humility and Pride, by Saint Bernard, translated by Barton R. V. Mills (London: SPCK, 1929), Translations of Christian Literature, Series II, Latin Texts.","Djvu OCR cleaned by script, not proofread. Mills's preface and long introduction are not imported; his footnotes are kept as footnotes where the OCR keeps the markers legible and dropped otherwise.",1929),
         out,drops=drops,pt_name='Os doze graus da humildade e do orgulho',pt_desc='A tradução inglesa de Barton R. V. Mills (1929) do tratado de São Bernardo sobre os graus da humildade e do orgulho.',
         parts=[('pars-1','Part I. The Twelve Degrees of Humility',[c for c,_,_ in out if int(c[1:])<=9]),('pars-2','Part II. The Twelve Degrees of Pride',[c for c,_,_ in out if int(c[1:])>9])])
