import re,sys,os
src,out=sys.argv[1],sys.argv[2]
P=src+'/Regulae_Pastoralis_'
def clean(path):
    t=open(path).read()
    t=re.sub(r'\{\{titulus2.*?\}\}__NOTOC__','',t,flags=re.S)
    t=re.sub(r'\{\{Liber.*?\}\}','',t,flags=re.S)
    t=re.sub(r'</?div[^>]*>|</?POEM>|<br\s*/?>','',t)
    t=re.sub(r"'''?",'',t)
    m=re.search(r'^==(.*?)==\s*$',t,re.M)
    head=None
    if m: head=m.group(1).strip(); t=t[:m.start()]+t[m.end():]
    paras=[re.sub(r'\s+',' ',p).strip() for p in re.split(r'\n\s*\n',t.strip())]
    return head,[p for p in paras if p]
def rom(n):
    r='';
    for v,s in [(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n>=v: r+=s;n-=v
    return r
def sect(path,title,rubric=True):
    head,ps=clean(path)
    s='## %s\n\n'%title
    if rubric and ps and len(ps[0])<400 and not ps[0].endswith(('.',)) is False: pass
    return s,ps
parts={1:(['PRAEFATIO']+['I_'+rom(i) for i in range(1,12)]),
 2:['II_'+rom(i) for i in range(1,12)],
 3:['III_PROLOGUS']+['III_'+rom(i) for i in range(1,41)],
 4:['IV']}
titles={1:'Pars prima',2:'Pars secunda',3:'Pars tertia',4:'Pars quarta'}
os.makedirs(out,exist_ok=True)
for n,pages in parts.items():
    md='# %s\n\n'%titles[n]
    for k,pg in enumerate(pages):
        head,ps=clean(P+pg+'.wiki')
        if pg=='PRAEFATIO': h='Praefatio'; rub=False
        elif pg=='III_PROLOGUS': h='Prologus'; rub=False
        elif pg=='IV': h='Prologus'; rub=False
        else:
            h='Caput '+pg.split('_')[1]; rub=True
        md+='## %s\n\n'%h
        if rub:
            md+='**%s**\n\n'%ps[0]; ps=ps[1:]
        md+='\n\n'.join(ps)+'\n\n'
    open('%s/ch%03d.md'%(out,n),'w').write(md.rstrip()+'\n')
