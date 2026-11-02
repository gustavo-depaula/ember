import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
RT='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/en/adornmentofthesp00ruysuoft.txt'
R='/Users/gustavo/Documents/prayer/content/books/ruusbroec-opera-omnia/'
L=open(RT).read().split('\n')
def find(pat,start=0):
    for i in range(start,len(L)):
        if re.match(pat,L[i]): return i
b1=find(r'^\s*THE\s+FIRST\s+BOOK',1200); b2=find(r'^\s*THE\s+SECOND\s+BOOK',b1) or None
def idx(pat,start): return find(pat,start)
# boundaries by known markers
i_b2=next(i for i,l in enumerate(L) if re.search(r'THE\s+SECOND\s+BOOK',l) and i>3000)
i_b3=next(i for i,l in enumerate(L) if re.search(r'THE\s+THIRD\s+BOOK',l) and i>7000)
i_steen=next(i for i,l in enumerate(L) if re.search(r'THE\s+SPARKLING\s+STONE',l) and i>8000)
i_waer=next(i for i,l in enumerate(L) if re.search(r'THE\s+BOOK\s+OF\s+SUPREME\s+TRUTH',l) and i>9000)
i_notes=next(i for i,l in enumerate(L) if re.match(r'^NOTES\s*$',l) and i>10000)
i_intro=next(i for i,l in enumerate(L) if re.match(r'^INTRODUCTION\s*$',l))
i_start=next(i for i,l in enumerate(L) if re.search(r'HERE\s+BEGINS',l) and i>1000)
print(i_intro,i_start,i_b2,i_b3,i_steen,i_waer,i_notes)
# notes
notes={}
cur=None
for l in L[i_notes+1:]:
    m=re.match(r'^\((\d+)\)\.?\s*[—-]*\s*(.*)',l)
    if m: cur=int(m.group(1)); notes[cur]=[m.group(2)]
    elif cur and l.strip(): notes[cur].append(l.strip())
notes={k:join_lines(v) for k,v in notes.items()}
state={'e':1}
def mark(p):
    def r(m):
        v=m.group(1); v=1 if v=='i' else int(v)
        e=state['e']
        if e<=v<=e+2 and v in notes:
            out=''.join(f'[^{n}]' for n in range(e,v+1) if n in notes); state['used'].extend(range(e,v+1)); state['e']=v+1; return out
        return m.group(0)
    return re.sub(r'\\s?\\((\\d{1,2}|i)\\)'.replace('\\\\','\\'),lambda m:r(m),p)
state['used']=[]
def render_chap(seg):
    ps=paras(seg,drop_head)
    ps=[mark(p) for p in ps]
    return ['## '+tcase(p) if (p.isupper() and len(p.split())>=2 and len(p)<70) else p for p in ps]
def work(lines,pro=True):
    res={}
    for k,t,body in chapters(lines,pro):
        res[k]=(t,body)
    return res
W1=work(L[i_start:i_b2]); W2=work(L[i_b2:i_b3]); W3=work(L[i_b3:i_steen],False); WS=work(L[i_steen:i_waer]); WW=work(L[i_waer:i_notes])
print(len(W1),len(W2),len(W3),len(WS),len(WW))
def md_chapter(label,ps,fnums):
    body='\n\n'.join(ps)
    used=sorted(set(int(x) for x in re.findall(r'\[\^(\d+)\]',body)))
    # renumber
    mp={n:i+1 for i,n in enumerate(used)}
    body=re.sub(r'\[\^(\d+)\]',lambda m:f'[^{mp[int(m.group(1))]}]',body)
    foot=''.join(f'\n[^{mp[n]}]: {notes[n]}\n' for n in used)
    return f'# {label}\n\n{body}\n'+(foot and '\n'+foot)
def build(W,prefix,pro_label='Prologue'):
    out=[]
    for k in sorted(W):
        t,body=W[k]; ps=render_chap(body)
        if k==0: cid=prefix+'prologue'; label=pro_label
        else: cid=f'{prefix}c{k:02d}'; label=f'{k}. {tcase(t)}'
        out.append((cid,label,ps))
    return out
res={}
for name,W,prefix in (('b1',W1,'b1-'),('b2',W2,'b2-'),('b3',W3,'b3-'),('steen',WS,''),('waer',WW,'')):
    res[name]=build(W,prefix)
# tail notes
tail=[n for n in notes if n not in state['used']]
print('unattached notes',tail[:20],len(tail),'last used',max(state['used']))

INTRO=[p for p in paras(L[i_intro+1:i_start],drop_head) if not re.fullmatch(r'HERE.*',p)]
INTRO=['## '+tcase(p) if (p.isupper() and len(p.split())>=2) else p for p in INTRO]
def wr(d,lang,cid,md):
    os.makedirs(f'{d}/{lang}',exist_ok=True); open(f'{d}/{lang}/{cid}.md','w').write(md)
TR={"translator":"C. A. Wynschenk Dom","year":1916,"editor":"Evelyn Underhill (introduction and notes)"}
SRC={"language":"en-US","url":"https://archive.org/details/adornmentofthesp00ruysuoft","edition":"John of Ruysbroeck, The Adornment of the Spiritual Marriage; The Sparkling Stone; The Book of Supreme Truth, translated from the Flemish by C. A. Wynschenk Dom, with an introduction and notes by Evelyn Underhill (London: J. M. Dent, 1916).","description":"OCR of the archive.org scan, rejoined across lines and pages by research/sourcing/_scripts/wyn_build.py; running heads removed; Underhill's endnotes placed as footnotes at the passage that cites them. Not proofread against the page images.","tier":"A","tierEvidence":"1916 translation, public domain."}
if __name__=='__main__':
    # Brulocht (own book)
    d=R+'brulocht-wynschenk'; toc=[]; words=0
    md='# Introduction\n\n'+'\n\n'.join(INTRO)+'\n'; wr(d,'en-US','introduction',md); words+=len(md.split())
    toc.append({'id':'introduction','title':{'en-US':'Introduction (Evelyn Underhill)'}})
    for pi,(nm,tt) in enumerate((('b1','The First Book: The Active Life'),('b2','The Second Book: The Interior Life'),('b3','The Third Book: The God-seeing Life'))):
        kids=[]
        for cid,label,ps in res[nm]:
            md=md_chapter(label,ps,None); wr(d,'en-US',cid,md); words+=len(md.split()); kids.append({'id':cid,'title':{'en-US':label}})
        toc.append({'id':f'boek-{pi+1}','title':{'en-US':tt},'children':kids})
    meta={"id":"ruusbroec-brulocht-wynschenk","cover":"classic","name":{"en-US":"The Adornment of the Spiritual Marriage","pt-BR":"O Ornamento das Núpcias Espirituais"},
      "author":{"en-US":"Bl. John Ruusbroec (1293-1381)","pt-BR":"Bem-aventurado João Ruusbroec (1293-1381)"},
      "description":{"en-US":"Ruusbroec's masterpiece on the active, interior and God-seeing life, in the English of C. A. Wynschenk Dom (1916) with Evelyn Underhill's introduction and notes. Its chapter division differs from David's Middle Dutch edition (book II has 67 chapters, not 77), so it is a separate edition of the same work.","pt-BR":"A obra-prima de Ruusbroec sobre a vida ativa, interior e contemplativa, na tradução inglesa de C. A. Wynschenk Dom (1916), com introdução e notas de Evelyn Underhill."},
      "composed":"c. 1335-1345","languages":["en-US"],"work":"ruusbroec/brulocht","editions":{"en-US":TR},"sources":[SRC],"toc":toc}
    write(d,meta); print('brulocht-wynschenk',words)
    # steen and waerheit: add en-US beside the Dutch
    for nm,slug,dtitle in (('steen','blinkende-steen',None),('waer','boec-der-hoechster-waerheit',None)):
        d=R+slug; bj=json.load(open(d+'/book.json')); words=0
        dum_ids=[n['id'] for n in bj['toc']]
        en=res[nm]; assert len(en)==len(dum_ids),(len(en),len(dum_ids))
        for (cid,label,ps),did,node in zip(en,dum_ids,bj['toc']):
            md=md_chapter(label,ps,None); wr(d,'en-US',did,md); words+=len(md.split()); node['title']['en-US']=label
        bj['languages']=['dum','en-US']; bj['editions']['en-US']=TR
        bj['sources'].append(SRC)
        bj['description']['en-US']=bj['description']['en-US'].replace('. The Middle Dutch text','. The Middle Dutch text')+' The English is C. A. Wynschenk Dom (1916), chapter for chapter.'
        write(d,bj); print(slug,words)
