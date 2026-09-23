import re,sys
pat=re.compile(sys.argv[1],re.I)
n=int(sys.argv[2]) if len(sys.argv)>2 else 300
for i,l in enumerate(open('research/psalterium/glossary.md',encoding='utf-8'),1):
    if not l.startswith('|'): continue
    cells=[c.strip() for c in l.split('|')[1:-1]]
    if len(cells)<3: continue
    if pat.search(cells[0]) or pat.search(cells[1]):
        print(i,' | '.join(cells[:3]),'||',(cells[3] if len(cells)>3 else '')[:n])
