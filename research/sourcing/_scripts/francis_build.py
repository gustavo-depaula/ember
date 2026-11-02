import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
F='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/en/bookoftwelvebg00janvuoft.txt'
L=open(F).read().split('\n')
d='/Users/gustavo/Documents/prayer/content/books/ruusbroec-opera-omnia/twaelf-beghinen-francis'
os.makedirs(d+'/en-US',exist_ok=True)
def wr(cid,md): open(f'{d}/en-US/{cid}.md','w').write(md)
def drop(t): return drop_head(t) or bool(re.match(r'^\d+\s+THE\s+BOOK\s+OF|^THE\s+BOOK\s+OF\s+THE\s+TWELVE|^TWELVE\s+B',t,re.I)) and len(t.split())<8
toc=[]; words=0
# front matter
front=paras(L[79:1370],drop)
for i,p in enumerate(front):
    if i==0: print(p[:80])
md='# Preface, Introduction and Summary\n\n'+'\n\n'.join(front)+'\n'; wr('introduction',md); words+=len(md.split())
toc.append({'id':'introduction','title':{'en-US':'Preface, Introduction and Summary'}})
# chapters
body=L[1481:3755]
idx=[(i,m) for i,l in enumerate(body) for m in [re.match(r'^\s*CHAPTER\s+([IVXL]+)\W*(?:PART\s+(\d|[iI]))?',l)] if m]
for j,(i,m) in enumerate(idx):
    e=idx[j+1][0] if j+1<len(idx) else len(body)
    n=romval(m.group(1)); part=m.group(2); part={'i':'1','I':'1'}.get(part,part)
    seg=body[i+1:e]
    # subtitle: first block
    blocks=paras(seg,drop)
    sub=blocks.pop(0) if blocks else ''
    label=f'Chapter {m.group(1)}'+(f', Part {part}' if part else '')
    cid=f'c{n:02d}'+(f'-p{part}' if part else '')
    md=f'# {label}\n\n*{sub}*\n\n'+'\n\n'.join(blocks)+'\n'; wr(cid,md); words+=len(md.split())
    toc.append({'id':cid,'title':{'en-US':label+': '+sub.rstrip('.')}})
# notes
nl=paras(L[3756:],drop)
md='# Notes\n\n'+'\n\n'.join(nl)+'\n'; wr('notes',md); words+=len(md.split())
toc.append({'id':'notes','title':{'en-US':'Notes'}})
meta={"id":"ruusbroec-twaelf-beghinen-francis","cover":"classic","name":{"en-US":"The Book of the Twelve Béguines","pt-BR":"O Livro das Doze Beguinas"},
 "author":{"en-US":"Bl. John Ruusbroec (1293-1381)","pt-BR":"Bem-aventurado João Ruusbroec (1293-1381)"},
 "description":{"en-US":"The first part of Ruusbroec's last work (to the discussion of the Passion hours is not included), translated from the Flemish text of 1863 by John Francis (1913) with his preface, summary and notes. The chapter division is Surius', not David's, so this is its own edition of the work.","pt-BR":"A primeira parte da última obra de Ruusbroec, traduzida do texto flamengo de 1863 por John Francis (1913), com prefácio, resumo e notas."},
 "composed":"c. 1370-1381","languages":["en-US"],"work":"ruusbroec/twaelf-beghinen","editions":{"en-US":{"translator":"John Francis","year":1913}},
 "sources":[{"language":"en-US","url":"https://archive.org/details/bookoftwelvebg00janvuoft","edition":"The Book of the Twelve Béguines by Blessed John Ruysbroeck, translated by John Francis (London: John M. Watkins, 1913).","description":"OCR of the archive.org scan (research/sourcing/_scripts/francis_build.py); verse chapters keep one verse line per paragraph; Francis's notes are a closing chapter. Not proofread.","tier":"A","tierEvidence":"1913 translation, public domain."}],"toc":toc}
write(d,meta); print(len(toc),words)
