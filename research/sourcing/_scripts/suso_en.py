import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
S='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/suso/'
R='/Users/gustavo/Documents/prayer/content/books/suso-opera-omnia/'
AUTH={"en-US":"Bl. Henry Suso (c. 1295-1366)","pt-BR":"Bem-aventurado Henrique Suso (c. 1295-1366)"}
def wr(d,lang,cid,md):
    os.makedirs(f'{d}/{lang}',exist_ok=True); open(f'{d}/{lang}/{cid}.md','w').write(md)
def junk(t): return drop_head(t) or bool(re.search(r'Digitized by|^Google$|^Digitized|^\W*$',t))
def split(L,pat,start,end):
    idx=[i for i in range(start,end) if re.match(pat,L[i])]
    return [(i,L[i+1:(idx[j+1] if j+1<len(idx) else end)]) for j,i in enumerate(idx)]
def vita():
    L=open(S+'thelifeofsuso00seusuoft.txt').read().split('\n')
    # titles from contents
    ct=[];cur=None
    for l in L[188:376]:
        m=re.match(r'^\s*([IVXLH]+(?:\s[IVXL]+)?)\.\s+(.*)',l)
        if m and not re.match(r'^\s*(CHAP|PAGE)',l):
            cur=[m.group(2)]; ct.append(cur)
        elif cur is not None and l.strip() and not re.search(r'CONTENTS|CHAP\.',l): cur.append(l.strip())
        elif not l.strip(): cur=cur
    titles=[]
    for c in ct:
        t=join_lines(c); t=re.sub(r'[\s.]*[\dOlIG()]{1,5}$','',t).strip().rstrip('.')
        titles.append(t.replace('  ',' '))
    print(len(titles),titles[:3],titles[-1])
    chs=split(L,r'^\s*Chapt?[eE][rkRK]\s+\S',500,10688)
    assert len(chs)==57==len(titles),(len(chs),len(titles))
    d=R+'vita'; toc=[]; words=0
    pro=paras(L[376:507],junk)
    md='# Prologue\n\n'+'\n\n'.join(pro[1:] if pro and pro[0].upper().startswith('PROLOGUE') else pro)+'\n'; wr(d,'en-US','prologue',md); words+=len(md.split())
    toc.append({'id':'prologue','title':{'en-US':'Prologue'}})
    for n,((i,seg),t) in enumerate(zip(chs,titles),1):
        ps=paras(seg,junk); label=f'{n}. {t}'
        md=f'# {label}\n\n'+'\n\n'.join(ps)+'\n'; wr(d,'en-US',f'c{n:02d}',md); words+=len(md.split())
        toc.append({'id':f'c{n:02d}','title':{'en-US':label}})
    meta={"id":"suso-vita","cover":"classic","name":{"en-US":"The Life of Blessed Henry Suso by Himself","pt-BR":"A Vida do Beato Henrique Suso, por ele mesmo"},"author":AUTH,
     "description":{"en-US":"Suso's life written with Elsbeth Stagel (the Exemplar's Vita): the Servitor's austerities, trials and teachings, with the letters of direction to his spiritual daughter, in T. F. Knox's English of 1865. The Middle High German original (Bihlmeyer 1907) is not yet imported: its only free scans are garbled Gothic-type OCR.","pt-BR":"A vida de Suso, escrita com Elsbeth Stagel: as austeridades, provações e ensinamentos do Servidor, e as cartas de direção à filha espiritual, na tradução inglesa de T. F. Knox (1865)."},
     "composed":"c. 1361-1363","languages":["en-US"],"work":"suso/vita","editions":{"en-US":{"translator":"T. F. Knox","year":1865}},
     "sources":[{"language":"en-US","url":"https://archive.org/details/thelifeofsuso00seusuoft","edition":"The Life of the Blessed Henry Suso, by Himself, translated by Thomas F. Knox (London: Burns, Lambert & Oates, 1865).","description":"OCR of the archive.org scan (research/sourcing/_scripts/suso_en.py); chapter titles from the book's contents; running heads removed. Translator's preface not included. Not proofread.","tier":"A","tierEvidence":"1865 translation, public domain."}],"toc":toc}
    write(d,meta); print('vita',words)
def little():
    L=open(S+'BlessedHenrySusosLittleBook.txt').read().split('\n')
    chs=split(L,r'^\s*CHAPTE\S\s+[IVXLH]+\S*\s*\.?\s*$',680,8190)
    print(len(chs)); assert len(chs)==25
    d=R+'buchlein-der-ewigen-weisheit'; toc=[]; words=0
    pre=paras(L[428:680],junk)
    md='# Preface\n\n'+'\n\n'.join(p for p in pre if not p.upper().startswith('HERE BEGINS'))+'\n'; wr(d,'en-US','prologue',md); words+=len(md.split())
    toc.append({'id':'prologue','title':{'en-US':'Preface'}})
    parts={1:('part-1','Part One'),21:('part-2','Part Two')}; kids=[]; cur=None
    for n,(i,seg) in enumerate(chs,1):
        k=0
        while seg[k].strip()=='' : k+=1
        t=[]
        while k<len(seg) and (seg[k].strip()): t.append(seg[k].strip()); k+=1
        title=tcase(' '.join(t)) if t and ' '.join(t).upper()==' '.join(t) else ''
        body=seg[k:] if title else seg
        ps=paras(body,junk); label=f'{n}. {title}' if title else f'{n}.'
        md=f'# {label}\n\n'+'\n\n'.join(ps)+'\n'; wr(d,'en-US',f'c{n:02d}',md); words+=len(md.split())
        if n in parts: cur={'id':parts[n][0],'title':{'en-US':parts[n][1]},'children':[]}; toc.append(cur)
        cur['children'].append({'id':f'c{n:02d}','title':{'en-US':label}})
    meta={"id":"suso-buchlein-der-ewigen-weisheit","cover":"classic","name":{"en-US":"The Little Book of Eternal Wisdom","pt-BR":"O Livrinho da Sabedoria Eterna"},"author":AUTH,
     "description":{"en-US":"Suso's dialogue between the Servant and Eternal Wisdom on the Passion, suffering, death and the praise of God, in the English of the Richardson edition (1866), after Diepenbrock's German. The Middle High German original (Bihlmeyer 1907) is not yet imported.","pt-BR":"O diálogo de Suso entre o Servo e a Sabedoria Eterna sobre a Paixão, o sofrimento, a morte e o louvor a Deus, na tradução inglesa da edição Richardson (1866)."},
     "composed":"c. 1328-1330","languages":["en-US"],"work":"suso/buchlein-der-ewigen-weisheit","editions":{"en-US":{"translator":"Anonymous (Richardson, Derby)","year":1866}},
     "sources":[{"language":"en-US","url":"https://archive.org/details/BlessedHenrySusosLittleBook","edition":"Blessed Henry Suso's Little Book of Eternal Wisdom (London and Derby: Richardson and Son, 1866).","description":"OCR of the archive.org (Google) scan, research/sourcing/_scripts/suso_en.py; running heads removed. Translator's preface and the contents are not included. Not proofread.","tier":"A","tierEvidence":"1866 translation, public domain."}],"toc":toc}
    write(d,meta); print('little',words)
if __name__=='__main__':
    for a in sys.argv[1:]: globals()[a]()
