import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bookjson import write
F='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/suso/horologiumsapien0000henr.txt'
L=open(F).read().split('\n')
d='/Users/gustavo/Documents/prayer/content/books/suso-opera-omnia/horologium-sapientiae'
def clean(l): return re.sub(r'^[\s=—~.\-–|•]+(?=\S)','',l).strip()
def blocks(lines):
    out=[];cur=[]
    for l in lines:
        c=clean(l)
        if c: cur.append(c)
        elif cur: out.append(cur);cur=[]
    if cur: out.append(cur)
    res=[]
    for b in out:
        s=''
        for ln in b:
            if s.endswith('-') and ln[:1].islower(): s=s[:-1]+ln
            else: s=(s+' '+ln) if s else ln
        res.append(re.sub(r'\s+',' ',s).strip())
    return res
def chapter_md(bl):
    body=[]; notes=[]
    def assign(pairs):
        for n,text in pairs:
            for bi,p in enumerate(body):
                ph='\x01%d\x02'%n
                if ph in p:
                    notes.append(text); body[bi]=p.replace(ph,'[^%d]'%len(notes),1); break
    for b in bl:
        if re.match(r'^\(\d+\)\s',b):
            pairs=[]
            for p in re.split(r'(?=\(\d{1,2}\)\s)',b):
                m=re.match(r'^\((\d+)\)\s+(.*)',p)
                if m: pairs.append((int(m.group(1)),m.group(2).strip()))
            assign(pairs)
        elif len(b.split())<=4 and not re.search(r'[.:;?!]$',b): continue
        else: body.append(re.sub(r'\s?\((\d{1,2})\)',lambda m:'\x01%s\x02'%m.group(1),b))
    mg=[]
    for b in body:
        if mg and not re.search(r'[.!?:;)\]]\s*$',mg[-1]) and b[:1].islower(): mg[-1]=mg[-1]+' '+b
        else: mg.append(b)
    txt=re.sub('\x01(\\d+)\x02',r' (\1)','\n\n'.join(mg)).replace(' (','(',0)
    foot=''.join('\n[^%d]: %s\n'%(i+1,t) for i,t in enumerate(notes))
    return txt+('\n'+foot if foot else '')
ORD={}
def build():
    idx=[i for i,l in enumerate(L[:15990]) if re.search(r'CAPITULUM\s+[A-Z]+(?:\s+DECIMUM)?\.',l) and len(l)<50]
    pro=next(i for i,l in enumerate(L) if re.search(r'E PROLOGUS',l))
    b1=next(i for i,l in enumerate(L) if l.strip()=='LIBER PRIMUS' and i>1000)
    b2=next(i for i,l in enumerate(L) if re.match(r'^LIBER II\.?\s*$',l.strip()))
    print(len(idx),[i for i in idx if i<b2].__len__())
    os.makedirs(d+'/la',exist_ok=True)
    toc=[];words=0
    def w(cid,md):
        nonlocal words; open(f'{d}/la/{cid}.md','w').write(md); words+=len(md.split())
    bl=blocks(L[pro+1:b1]); md='# Prologus\n\n'+chapter_md(bl)+'\n'; w('prologus',md)
    toc.append({'id':'prologus','title':{'la':'Prologus'}})
    for bk,(a,e,pre) in enumerate(((b1,b2,'1'),(b2,15840+200,'2')),1):
        ids=[i for i in idx if a<=i<e]; kids=[]
        for j,i in enumerate(ids):
            end=ids[j+1] if j+1<len(ids) else e
            bl=blocks(L[i+1:end])
            intro=[]
            if j==0:
                # blurb before first chapter
                bl0=blocks(L[a+1:i]); intro=[b for b in bl0 if len(b.split())>6]
            title=bl.pop(0) if bl else ''
            title=title.rstrip('.')
            n=j+1; label=f'{n}. {title}'
            md=f'# {label}\n\n'+('*'+' '.join(intro)+'*\n\n' if intro else '')+chapter_md(bl)+'\n'
            cid=f'l{bk}-c{n:02d}'; w(cid,md); kids.append({'id':cid,'title':{'la':label}})
        toc.append({'id':f'liber-{bk}','title':{'la':['Liber primus','Liber secundus'][bk-1]},'children':kids})
    meta={"id":"suso-horologium-sapientiae","cover":"classic","name":{"la":"Horologium sapientiae","en-US":"The Clock of Wisdom (Horologium Sapientiae)","pt-BR":"O Relógio da Sabedoria"},
     "author":{"la":"Henricus Suso (c. 1295-1366)","en-US":"Bl. Henry Suso (c. 1295-1366)","pt-BR":"Bem-aventurado Henrique Suso (c. 1295-1366)"},
     "description":{"la":"Horologium sapientiae, a Susone Latine conscriptum: libri duo de Passione Christi, de vita et morte, dialogus Discipuli cum aeterna Sapientia. Editio saeculi XX, cum notis.","en-US":"Suso's own Latin expansion of his Little Book of Eternal Wisdom, written about 1334, in two books: the Passion and the love of Wisdom, then life, death and the praise of God. Twentieth-century critical edition with the editor's footnotes (scriptural and patristic references).","pt-BR":"A versão latina ampliada, escrita pelo próprio Suso por volta de 1334, do Livrinho da Sabedoria Eterna, em dois livros sobre a Paixão e o amor da Sabedoria, e sobre a vida, a morte e o louvor de Deus."},
     "composed":"c. 1334","languages":["la"],"work":"suso/horologium-sapientiae","editions":{"la":{"editor":"Unnamed 20th-century editor (Horologium Sapientiae, ed. of 1929)","year":1929}},
     "sources":[{"language":"la","url":"https://archive.org/details/horologiumsapien0000henr","edition":"Horologium Sapientiae (archive.org scan, ed. 1929 after Strange 1861).","description":"OCR of the archive.org scan with marginal line marks stripped (research/sourcing/_scripts/suso_la.py); editor's page-foot notes turned into footnotes where the marker was legible. Editor's Latin preface not included. Not proofread.","tier":"A","tierEvidence":"Latin text of Suso (d. 1366) in an early twentieth-century edition."}],"toc":toc}
    write(d,meta); print(words)
build()
