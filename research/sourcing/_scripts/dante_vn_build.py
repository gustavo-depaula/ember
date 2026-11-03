"""Rossetti's New Life (Gutenberg #41085) -> en-US/cap-NN.md of dante-vita-nuova, cut at Barbi's 42 chapters."""
import re,os
SRC='/Users/gustavo/Documents/prayer/research/sourcing/dante/raw/pg41085.txt'
OUT='/Users/gustavo/Documents/prayer/content/books/dante-opera-omnia/vita-nuova/en-US'
MARK=["In that part of the book","Nine times already","After the lapse of so many days","From that night forth","Now it fell on a day","Moreover, about the same time","Now it so chanced with her","A certain while after the departure","Some days after the death","On my return","And here it is fitting","And now, resuming","After this vision I have recorded","After this battling","A while after this strange","Thereafter, this sonnet bred","After I had written these three last sonnets","Through the sore change","After which it happened, as I passed","When this song was a little gone abroad","Having treated of love","Not many days after this","A few days after this, my body","After this empty imagining","It might be here objected","But returning to the matter","Thereafter on a day, I began to consider","_Quomodo sedet","I say, then, that according","After this most gracious creature had gone out","When mine eyes had wept","After I had written this poem","But when I had written this sonnet","On that day which fulfilled","Then, having sat for some space","It happened after this","At length, by the constant sight","The sight of this lady brought","But against this adversary","About this time, it happened","A while after these things","After writing this sonnet"]
L=open(SRC).read().split('\n')
a=next(i for i,l in enumerate(L) if l.startswith('In that part of the book'))
z=next(i for i,l in enumerate(L) if l.strip()=='THE END.')
blocks=[];cur=[]
for l in L[a:z]:
    if l.strip(): cur.append(l)
    elif cur: blocks.append(cur);cur=[]
if cur: blocks.append(cur)
notes={};prose=[]  # prose: ('p'|'v', text)
i=0
while i<len(blocks):
    b=blocks[i]
    m=re.match(r'\s{2}\[(\d+)\]\s*(.*)',b[0])
    if m and not b[0].startswith('    '):
        n=int(m.group(1)); txt=' '.join([m.group(2)]+[x.strip() for x in b[1:]]).strip()
        if not txt:
            i+=1; v=' / '.join(x.strip() for x in blocks[i]); txt=v
            # footnote 9: Greek line then citation
            if i+1<len(blocks) and blocks[i+1][0].strip().startswith('(_Iliad_'): i+=1; txt+=' '+blocks[i][0].strip()
        notes[n]=txt
    elif re.fullmatch(r'\s*[IVX]+\.\s*',b[0]) and len(b)==1: pass
    elif b[0].startswith('    '):
        prose.append(('v','\n'.join(x.strip() for x in b)))
    else:
        prose.append(('p',' '.join(x.strip() for x in b)))
    i+=1
def conv(t):
    if re.fullmatch(r'(\*\s+)+\*',t.strip()): return '\\* \\* \\* \\* \\*'
    t=re.sub(r'(?<![\w*])_(.+?)_(?![\w])',r'*\1*',t,flags=re.S)
    return re.sub(r'\[(\d+)\]',r'[^\1]',t)
chap=[[] for _ in MARK]; k=-1
for kind,t in prose:
    if kind=='p':
        while k+1<len(MARK):
            mk=MARK[k+1]
            if t.startswith(mk): k+=1; continue
            j=t.find(mk) if k+1 in (5,18) else -1
            if j>0:
                chap[max(k,0)].append(('p',t[:j].strip())); t=t[j:]; k+=1; continue
            break
    chap[max(k,0)].append((kind,t))
roman=lambda n:__import__('functools').reduce(lambda s,x:s,[0],'') or None
def rom(n):
    r='';
    for v,s in [(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n>=v: r+=s;n-=v
    return r
os.makedirs(OUT,exist_ok=True)
tot=0
for n,items in enumerate(chap,1):
    body='\n\n'.join(conv(t) for _,t in items)
    refs=sorted({int(x) for x in re.findall(r'\[\^(\d+)\]',body)})
    fn='\n\n'.join('[^%d]: %s'%(r,conv(notes[r]).replace('\n',' ')) for r in refs)
    txt='# Chapter %s\n\n%s\n'%(rom(n),body)+('\n'+fn+'\n' if fn else '')
    open('%s/cap-%02d.md'%(OUT,n),'w').write(txt); tot+=len(txt.split())
print(tot, len(notes), sum(len(c) for c in chap))
