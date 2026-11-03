import re,glob,sys
t=open('/Users/gustavo/Documents/prayer/research/sourcing/dante/raw/pg41085.txt').read().split('\n')
s=t[343:2560]
b=[];cur=[]
for l in s:
    if l.strip(): cur.append(l)
    elif cur: b.append(cur);cur=[]
    
if cur: b.append(cur)
paras=[]
for p in b:
    if p[0].startswith('  [') : continue
    paras.append(p)
# sentence-start list with cumulative words (prose paras only)
items=[];cum=0
for i,p in enumerate(paras):
    txt=' '.join(x.strip() for x in p)
    sents=re.split(r'(?<=[.!?:”])\s+(?=[A-Z“_])',txt)
    for j,sn in enumerate(sents):
        items.append((cum,i,j,sn)); cum+=len(sn.split())
tot=cum
itw=[]
for f in sorted(glob.glob('/Users/gustavo/Documents/prayer/content/books/dante-opera-omnia/vita-nuova/it/cap-*.md')):
    itw.append(len(open(f).read().split()))
T=sum(itw);c=0
for k,w in enumerate(itw):
    fr=c/T; c+=w
    if k==0: continue
    tgt=fr*tot
    near=[it for it in items if abs(it[0]-tgt)<350 and (it[2]==0 or True)]
    near=sorted(near,key=lambda x:abs(x[0]-tgt))[:7]
    near.sort(key=lambda x:x[0])
    print('CAP',k+1)
    for it in near: print('   p%d.%d %s'%(it[1],it[2],it[3][:70]))
