import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
F='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/tauler/innerwaybeingthi00tauluoft.txt'
L=open(F).read().split('\n')
d='/Users/gustavo/Documents/prayer/content/books/tauler-opera-omnia/inner-way-hutton'
os.makedirs(d+'/en-US',exist_ok=True)
idx=[i for i,l in enumerate(L) if re.match(r'^\s*SERMON\s+[IVXL]+\s*$',l) and i>1500]
assert len(idx)==36,len(idx)
end=next((i for i in range(idx[-1]+1,len(L)) if re.match(r'^\s*(INDEX|NOTES|GLOSSARY)\b',L[i])),len(L)-25)
def junk(t): return drop_head(t) or bool(re.search(r'Digitized|^Google$',t))
toc=[];words=0
def w(cid,label,ps):
    global words
    md=f'# {label}\n\n'+'\n\n'.join(ps)+'\n'; open(f'{d}/en-US/{cid}.md','w').write(md); words+=len(md.split()); toc.append({'id':cid,'title':{'en-US':label}})
w('introduction','Introduction (A. W. Hutton)',paras(L[200:1515],junk))
for j,i in enumerate(idx):
    e=idx[j+1] if j+1<len(idx) else end
    seg=L[i+1:e]; k=0
    while k<len(seg) and not seg[k].strip(): k+=1
    t=[]
    while k<len(seg) and seg[k].strip(): t.append(seg[k].strip()); k+=1
    title=tcase(' '.join(t))
    w(f's{j+1:02d}',f'{j+1}. {title}',paras(seg[k:],junk))
meta={"id":"tauler-inner-way-hutton","cover":"classic","name":{"en-US":"The Inner Way: Thirty-six Sermons for Festivals","pt-BR":"O Caminho Interior: Trinta e Seis Sermões para as Festas"},
 "author":{"en-US":"John Tauler (c. 1300-1361)","pt-BR":"João Tauler (c. 1300-1361)"},
 "description":{"en-US":"Thirty-six of Tauler's sermons for the festivals of the saints and of Our Lady, in A. W. Hutton's English of 1901 (after the early printed editions of 1498 to 1543, not Vetter's critical text), with Hutton's introduction. A different edition of the same work as Elliott's translation.","pt-BR":"Trinta e seis sermões de Tauler para as festas dos santos e de Nossa Senhora, na tradução inglesa de A. W. Hutton (1901), com a introdução do tradutor."},
 "composed":"c. 1330-1361","languages":["en-US"],"work":"tauler/predigten","editions":{"en-US":{"translator":"A. W. Hutton","year":1901}},
 "sources":[{"language":"en-US","url":"https://archive.org/details/innerwaybeingthi00tauluoft","edition":"The Inner Way, being thirty-six sermons for festivals by John Tauler, translated by A. W. Hutton (London: Methuen, 1901).","description":"OCR of the archive.org scan (research/sourcing/_scripts/hutton_build.py); sermons split at the SERMON headings, titles from the heading lines, running heads removed; page-foot notes remain as paragraphs. Not proofread.","tier":"A","tierEvidence":"1901 translation, public domain."}],"toc":toc}
write(d,meta); print(len(toc),words)
# the scan ends with the publisher's list of other volumes; cut it
p=d+'/en-US/s36.md'; T=open(p).read().split('\n'); i=next(k for k,l in enumerate(T) if l.startswith('THE LIBRARY OF DEVOTION')); open(p,'w').write('\n'.join(T[:i]).rstrip()+'\n')
