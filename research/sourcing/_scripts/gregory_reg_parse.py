import re,sys,json,glob
D='/Users/gustavo/Documents/prayer/research/sourcing/gregory-the-great/ws/Epistolae__Gregorius_Magnus_/Epistolae_Gregorius_Magnus_%s.wiki'
ROM=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
HDR=re.compile(r'(?:^|\s)(?:(\d{1,4})\s+)?EPISTOLA\s+([IVXLC]+|PRIMA)\b\.?\s*(.*)$')
def rnum(s):
    if s=='PRIMA': return 1
    v={'I':1,'V':5,'X':10,'L':50,'C':100};n=0
    for a,b in zip(s,s[1:]+' '):
        n+= -v[a] if b in v and v[b]>v[a] else v[a]
    return n
def split_addr(rest):
    toks=rest.split(' ');a=[]
    i=0
    while i<len(toks) and not re.search(r'[a-zæœ]',toks[i]): a.append(toks[i]);i+=1
    return ' '.join(a).rstrip('.').strip(), ' '.join(toks[i:]).strip()
def parse(b):
    t=open(D%ROM[b-1]).read()
    t=re.sub(r'\{\{titulus2.*?\}\}__NOTOC__','',t,flags=re.S)
    t=re.sub(r'\{\{Liber.*?\}\}','',t,flags=re.S)
    t=re.sub(r'</?div[^>]*>|</?POEM>|<br\s*/?>','',t)
    t=re.sub(r"^==.*==\s*$",'',t,flags=re.M)
    lines=[l.rstrip() for l in t.split('\n')]
    letters=[];cur=None;pre=[]
    for l in lines:
        if not l.strip(): continue
        m=HDR.search(l) if 'EPISTOLA' in l else None
        if m and not (cur and l.strip().startswith('Gregorius') ) :
            before=l[:m.start()].strip()
            note=(' '.join(pre+[before])).strip(); pre=[]
            addr,summ=split_addr(m.group(3))
            cur={'n':rnum(m.group(2)),'col':m.group(1),'note':note,'addr':addr,'summary':summ,'body':[]}
            letters.append(cur)
        elif cur is None: pre.append(l.strip())
        elif not cur['addr'] and not cur['body'] and split_addr(l.strip())[0]:
            cur['addr'],cur['summary']=split_addr(l.strip())
        else: cur['body'].append(l.strip())
    return letters
if __name__=='__main__':
    tot=0
    for b in range(1,15):
        L=parse(b);ns=[x['n'] for x in L]
        bad=[(i+1,n) for i,n in enumerate(ns) if i+1!=n]
        tot+=len(L);print(b,len(L),'nonseq',bad[:8])
    print(tot)
