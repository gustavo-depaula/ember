import re,sys
D='/Users/gustavo/Documents/prayer/research/sourcing/gueranger/ia/'
DAY=r'(DIMANCHE|LUNDI|MARDI|MERCRE|JEUDI|VENDRE|SAMEDI|LE MEME JOUR|LE MÊME JOUR|MÊME JOUR)'
MON=r'(JANVIER|FEVRIER|FÉVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|AOÛT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DECEMBRE|DÉCEMBRE)'
v=sys.argv[1]
L=open(D+f'lanneliturgiqu{v}gu.txt',errors='replace').read().replace('\x0c','').split('\n')
n=0
for i,l in enumerate(L):
    t=re.sub(r'\s+',' ',l.strip())
    if len(t)<4 or len(t)>90: continue
    up=sum(c.isupper() for c in t)/max(1,sum(c.isalpha() for c in t))
    if up<.7: continue
    if re.search(r'^(LE |LA |L\'|AU |DU )?'+DAY,t) or re.search(r'\b'+MON+r'\.?$',t) or re.search(r'(SEMAINE|DIMANCHE|VIGILE|OCTAVE|JOUR)',t) and len(t)>12:
        print(i,t); n+=1
