import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
F='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/tauler/sermonsconferenc00tauluoft.txt'
L=open(F).read().split('\n')
d='/Users/gustavo/Documents/prayer/content/books/tauler-opera-omnia/sermons-elliott'
ents=[];cur=''
for l in L[1050:1560]:
    s=l.strip()
    if not s or re.match(r'TABLE\s+OF|^Page$',s): continue
    cur=(cur+' '+s).strip()
    if re.search(r'\d{1,3}\s*$',s) and re.search(r'\.\s*\.|\s\d{1,3}$',s): ents.append(cur); cur=''
def title(e):
    e=re.sub(r'\s+',' ',e); e=re.sub(r'[\s.,]*\d{1,3}\s*$','',e); e=re.sub(r'^[-*■\s]+','',e); return e.replace('- ','',0).strip().rstrip('.')
def tj(e): return re.sub(r'(\w)- (\w)',r'\1\2',title(e))
T=[tj(e) for e in ents]
assert len(T)==125
syn=[i for i,l in enumerate(L) if re.match(r'^\s*Synopsis',l)]
assert len(syn)==122
def junk(t): return drop_head(t) or bool(re.search(r'Illuminated Doctor|^\d+\s+The\s+Sermons\s+and|Sermons\s+and\s+Spiritual\s+Conferences\s*\d*$',t))
def cut_before(i):
    k=i-1
    while k>0 and not L[k].strip(): k-=1
    # drop the garbled blackletter title line and a possible running head
    return k
os.makedirs(d+'/en-US',exist_ok=True)
toc=[]; words=0
def w(cid,label,ps):
    global words
    md=f'# {label}\n\n'+'\n\n'.join(ps)+'\n'; open(f'{d}/en-US/{cid}.md','w').write(md); words+=len(md.split()); toc.append({'id':cid,'title':{'en-US':label}})
def body(a,b): return paras(L[a:b],junk)
w('introduction','Introduction',body(1508,1775))
w('history','The History of the Reverend Master John Tauler',body(1776,3631))
first=cut_before(syn[0])
w('interview','The Interview of Master John Tauler with a Beggar',body(3632,first-1))
sec=[]
for j,i in enumerate(syn):
    end=cut_before(syn[j+1])-1 if j+1<len(syn) else 34536
    ps=body(i,end)
    # first paragraph(s) = synopsis (up to the SERMON FOR heading)
    ps=[p for p in ps if not re.match(r'^SERMON\s+F[OE]R\b|^SERMONS?\s+FOR',p)]
    if ps and ps[0].startswith('Synopsis'): ps[0]='*'+ps[0].rstrip()+'*'
    label=f'{j+1}. {T[3+j]}'
    w(f's{j+1:03d}',label,ps)
meta={"id":"tauler-sermons-elliott","cover":"classic","name":{"en-US":"The Sermons and Conferences of John Tauler","pt-BR":"Os Sermões e Conferências de João Tauler"},
 "author":{"en-US":"John Tauler (c. 1300-1361)","pt-BR":"João Tauler (c. 1300-1361)"},
 "description":{"en-US":"The complete cycle of Tauler's sermons for the Church year and for feasts (122 sermons and conferences) in Walter Elliott's English of 1910, translated from the German critical edition and checked against Surius, with Elliott's synopses, introduction and the legendary History and the Interview with the Beggar. Tauler's Middle High German (Vetter 1910) is not yet imported.","pt-BR":"O ciclo completo dos sermões de Tauler para o ano litúrgico e as festas (122 sermões e conferências), na tradução inglesa de Walter Elliott (1910), com sinopses, introdução e a lendária História de Tauler."},
 "composed":"c. 1330-1361","languages":["en-US"],"work":"tauler/predigten","editions":{"en-US":{"translator":"Walter Elliott","year":1910}},
 "sources":[{"language":"en-US","url":"https://archive.org/details/sermonsconferenc00tauluoft","edition":"The Sermons and Conferences of John Tauler (Washington: Apostolic Mission House, 1910), translated by Walter Elliott.","description":"OCR of the archive.org scan (research/sourcing/_scripts/tauler_build.py): sermons split at Elliott's 'Synopsis' lines, titles from the table of contents, running heads removed; his asterisk footnotes stay as short paragraphs at their page end. Index and subscriber list not included. Not proofread. The 'History' and the 'Interview with a Beggar' come from the spurious Meisterbuch tradition and are marked as doubtful by Elliott.","tier":"A","tierEvidence":"1910 translation, public domain."}],"toc":toc}
os.makedirs(os.path.dirname(d),exist_ok=True); write(d,meta); print(len(toc),words)
