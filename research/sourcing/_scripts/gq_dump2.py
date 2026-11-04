import sys,re; sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gq_dg import *
MON=r'(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)'
DATE=re.compile(r'^(le\s+)?(\d+\s*(er|e|°)?|premier|[ivxl]+)\s+'+MON+r'\b',re.I)
DAY=re.compile(r'^(le |la |l[’\'])?((premier|second|deuxi[eè]me|troisi[eè]me|quatri[eè]me|cinqui[eè]me|sixi[eè]me|\w+) )?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)\b',re.I)
for slug in sys.argv[1:]:
    items,notes=parse(slug)
    print('##',slug,len(items))
    for i,(k,t,c) in enumerate(items):
        if k!='p' or len(t)>130 or t.startswith('\x03'): continue
        if DATE.match(t) or DAY.match(t) or re.match(r'^(le m[eê]me jour|chapitre)',t,re.I) or (t.startswith('\x05') and t.endswith('\x06')) or (upper(t) and re.match(r'^(LA |LE |L.|SAINT)',t) and len(t)>14 and len(t)<100 and 'PSAUME' not in t): print(i,t[:100])
