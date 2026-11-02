import re,html,os,sys
W='/Users/gustavo/Documents/prayer/research/sourcing/gregory-the-great/'
OUT='/Users/gustavo/Documents/prayer/content/books/church-fathers/gregory-great-pope/dialogues'
ROM=['I','II','III','IV']
def latin(i):
    t=open(W+'ws/Dialogi__Gregorius_Magnus_/Dialogi_Gregorius_Magnus_Liber_%s.wiki'%ROM[i]).read()
    t=re.sub(r'\{\{titulus2.*?\}\}','',t,flags=re.S)
    t=re.sub(r'\{\{finis\}\}|<br\s*/?>','',t)
    notes=[]
    md='# Liber %s\n\n'%ROM[i]
    parts=re.split(r'^==\s*(.*?)\s*==\s*$',t,flags=re.M)
    pre=parts[0].strip()
    items=list(zip(parts[1::2],parts[2::2]))
    def fix(txt):
        def m(mm):
            s=mm.group(1).strip()
            if re.fullmatch(r'\d+',s): return mm.group(0)
            notes.append(s); return '[^%d]'%len(notes)
        txt=re.sub(r'\s*\[([^\]]+)\]',lambda mm: (' '+mm.group(0).strip()) if re.fullmatch(r'\s*\[\d+\]',mm.group(0)) else (m(mm)),txt)
        return txt
    if pre: md+='## Prologus\n\n'+'\n\n'.join(fix(re.sub(r'\s+',' ',p).strip()) for p in re.split(r'\n\s*\n',pre) if p.strip())+'\n\n'
    for h,body in items:
        h=h.strip()
        m=re.match(r'CAPUT\s+([IVXLC]+)\.?\s*(.*)$',h)
        if m: head,rub='Caput '+m.group(1),m.group(2).strip()
        else: head,rub=h.capitalize() if h.lower()=='prologus' else h,''
        md+='## %s\n\n'%head
        if rub: md+='**%s**\n\n'%rub
        ps=[re.sub(r'\s+',' ',p).strip() for p in re.split(r'\n\s*\n',body.strip()) if p.strip()]
        md+='\n\n'.join(fix(p) for p in ps)+'\n\n'
    # summaries inserted into the text as "[Natus ...]" could leave double spaces
    md=re.sub(r'  +',' ',md); md=re.sub(r'\n +\[',r'\n[',md)
    md=md.replace(' [^','[^') if False else md
    if notes: md=md.rstrip()+'\n\n'+'\n'.join('[^%d]: Marginal summary: %s'%(k+1,n) for k,n in enumerate(notes))+'\n'
    return md.rstrip()+'\n'
NUM={}
def english(i):
    t=open(W+'en/ccel-gregory_%02d_dialogues_book%d.html'%(i+1,i+1),errors='ignore').read()
    hr=[m.start() for m in re.finditer('<hr',t)]
    body=t[hr[1]:hr[2]]; fn=t[hr[2]:hr[3]] if len(hr)>3 else ''
    def inline(s):
        s=re.sub(r'<span class=pb>.*?</span>','',s,flags=re.S|re.I)
        s=re.sub(r'<A NAME="p?\d+"></A>','',s,flags=re.I)
        s=re.sub(r'<sup>\s*(<a[^>]*#(\d+)"[^>]*>.*?</a>)\s*(?:<i>\s*(?:&nbsp;)?\s*</i>)?\s*</sup>',lambda m:'@@FN%s@@'%m.group(2),s,flags=re.S|re.I)
        s=re.sub(r'<a[^>]*#(\d+)"[^>]*>\s*<sup>.*?</sup>\s*</a>',lambda m:'@@FN%s@@'%m.group(1),s,flags=re.S|re.I)
        s=re.sub(r'<(i|em)>\s*','\x02',s,flags=re.I); s=re.sub(r'\s*</(i|em)>','\x01',s,flags=re.I)
        s=re.sub(r'<(b)>|</b>','',s,flags=re.I)
        s=re.sub(r'<br\s*/?>',' ',s,flags=re.I)
        s=re.sub(r'<[^>]+>','',s)
        s=html.unescape(s).replace('\xa0',' ')
        s=re.sub(r'\x02\s*\x01|\x01\s*\x02',' ',s)
        s=re.sub(r'(?<=[\w.,;:!?)])\x02',' \x02',s)
        s=re.sub(r'\x01(?=[\w(])','\x01 ',s)
        s=s.replace('\x01','*').replace('\x02','*')
        s=re.sub(r'\s+',' ',s).strip()
        return s
    md='# Book %s\n\n'%ROM[i]; used=[]
    seq=re.split(r'(<blockquote>.*?</blockquote>)',body,flags=re.S|re.I)
    pro=True
    for blk in seq:
        if blk.lower().startswith('<blockquote>'):
            h=inline(blk)
            m=re.match(r'\*?(Chapter [^:;\.]+)[:;\.]\s*(.*)$',h)
            if m:
                ru=m.group(2).strip().rstrip('*').strip(); ru=ru[:1].upper()+ru[1:]
                nm=m.group(1).strip(); md+='## %s\n\n**%s**\n\n'%(nm,ru); continue
            md+=h+'\n\n'; continue
        for p in re.split(r'<p[^>]*>',blk,flags=re.I):
            s=inline(p)
            if not s or s=='*': continue
            if pro and '## ' not in md: md+='## Prologue\n\n'
            md+=s+'\n\n'
    for n in re.findall(r'@@FN(\d+)@@',md): used.append(n)
    # footnotes
    defs={}
    for m in re.finditer(r'<p>\s*<A NAME="(\d+)"></A>\s*\d+\.(?:&nbsp;|\s)*(.*?)(?=<p>|</p>|$)',fn,flags=re.S|re.I):
        defs[m.group(1)]=inline(m.group(2))
    md=re.sub(r'@@FN(\d+)@@',lambda m:'[^%s]'%m.group(1),md)
    ds=''.join('[^%s]: %s\n'%(n,defs.get(n,'')) for n in sorted(set(used),key=int))
    md=re.sub(r"(## Prologue\n\n)(?:The Second Book Of the Life and Miracles of St\. Benedict(?: @@?\[\^\d+\])?\s*\n\n|St\. Gregory's Dialogues\. The (?:Third|Fourth) Book\s*\n\n)",r"\1",md)
    md=md.replace('The Second Book Of the Life and Miracles of St. Benedict [^1]','*The Second Book of the Life and Miracles of St. Benedict*[^1]')
    md=re.sub(r'## Prologue\n\n(?=## )','',md)
    md=md.replace('## Prologue\n\n[^1]\n\n','## Prologue\n\n')
    return md.rstrip()+'\n\n'+ds, [n for n in set(used) if n not in defs]
if __name__=='__main__':
    for sub in ('la','en-US'): os.makedirs(OUT+'/'+sub,exist_ok=True)
    for i in range(4):
        open('%s/la/ch%03d.md'%(OUT,i+1),'w').write(latin(i))
        e,miss=english(i)
        open('%s/en-US/ch%03d.md'%(OUT,i+1),'w').write(e)
        print(i+1,'missing defs',miss)
