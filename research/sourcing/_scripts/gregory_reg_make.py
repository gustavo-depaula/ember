import sys,re,json,os
sys.path.insert(0,os.path.dirname(__file__))
import gregory_reg_parse as g
B='/Users/gustavo/Documents/prayer/content/books/church-fathers/gregory-great-pope/register-of-letters'
j=json.load(open(B+'/book.json'))
small={'AD','ET','DE','IN','AC','SEU','SIVE','CUM','EX','PRO','PER','AB','ATQUE','VEL','SUB'}
def title(a):
    ws=a.lower().split(' ')
    out=[w if w.upper() in small else w[:1].upper()+w[1:] for w in ws]
    out[0]=out[0][:1].upper()+out[0][1:]
    return ' '.join(out)
def clean_book(b):
    last=None;res={}
    for L in g.parse(b):
        if L['col']: last=int(L['col'])
        out=[]
        for l in L['body']:
            l=l.lstrip(':; ').strip()
            l=re.sub(r"'{2,}",'',l)
            if not l: continue
            def mk(m):
                nonlocal last
                n=int(m.group(2))
                pre=m.string[:m.start()].split()[-1:] 
                if 440<n<1330 and not (pre and re.match(r'(dist|cap|c|ind|indict|ep|anno|lib|l|n|col|Ps|cf|Cf|et|aut|\\d)\\.?$',pre[0])):
                    last=n; return m.group(1)
                return m.group(0)
            l=re.sub(r'(^|\s)(\d{3,4})(?=\s|$)',mk,l)
            l=re.sub(r'  +',' ',l).strip()
            if l: out.append(l)
        res[L['n']]=(L,out)
    return res
cache={};cols={}
res={};stats={}
os.makedirs(B+'/la',exist_ok=True)
words=0;nf=0;missing=[]
for t in j['toc']:
    m=re.fullmatch(r'Book ([IVXL]+), Letter (\d+)',t['title']['en-US'])
    b=g.ROM.index(m.group(1))+1;n=int(m.group(2))
    cache.setdefault(b,clean_book(b))
    if n not in cache[b]: missing.append(t['title']['en-US']); continue
    L,body=cache[b][n]
    # leading column number on first body line
    ti='Liber %s, Epistola %d'%(m.group(1),n)
    md='# %s\n\n'%ti
    note=re.sub(r"'{2,}",'',L['note']).strip()
    if note and n==1: md+='*%s*\n\n'%note
    if L['addr']: md+='*%s.*\n\n'%title(L['addr'])
    if L['summary']: md+='*%s*\n\n'%L['summary'].rstrip()
    md+='\n\n'.join(body)+'\n'
    open('%s/la/%s.md'%(B,t['id']),'w').write(md)
    words+=len(md.split());nf+=1
    t['title']={'la':ti,**t['title']}
print(nf,words,missing)
json.dump(missing,open('/tmp/reg_missing.json','w'))
json.dump(j['toc'],open('/tmp/reg_toc.json','w'),ensure_ascii=False)
