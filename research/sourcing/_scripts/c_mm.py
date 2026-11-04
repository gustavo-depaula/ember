import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import tcase
D='/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/'
FILES={1:'stbernardssermon0001prie_y4z3_djvu.txt',2:'stbernardssermon0002prie_a0a5_djvu.txt',3:'stbernardssermon0003prie_s9b1_djvu.txt'}
HEAD=re.compile(r'^\s*((FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)\s+(SERMON|EPISTLE|SERMONS)|SERMON\s+(FOR|ON))\b.*$')
def bad_tail(s):
    t=s.split()[-1]
    return bool(re.fullmatch(r'[0-9IVXlO\-—.:=,\']{1,6}|[a-z]+',t)) or any(ord(c)>127 for c in t) or bool(re.search(r'\s\d',s))
def isupper(s):
    a=[c for c in s if c.isalpha()]
    return len(a)>3 and sum(c.isupper() for c in a)>=0.8*len(a)
def find(vol):
    L=src(D+FILES[vol]); hits=[]
    for i,l in enumerate(L):
        if HEAD.match(l) and not bad_tail(l.strip()) and isupper(l):
            # next nonblank lines caps?
            j=i+1; blocks=[]
            while j<len(L) and len(blocks)<2:
                if L[j].strip(): blocks.append(j)
                j+=1
            # require a following uppercase line within 3 nonblank lines (title) unless line ended with '.'
            nxt=[L[k].strip() for k in blocks]
            hits.append((i,l.strip(),nxt[:1]))
    return L,hits
if __name__=='__main__':
    for v in (1,2,3):
        L,h=find(v); print('== vol',v,len(h))
        for i,l,n in h: print(i+1,l[:60],'||',(n[0][:60] if n else ''))

SMALLW={'of','the','and','in','to','a','an','by','for','on','with','from','at','or','as','is','be','it','its'}
def tc(t):
    t=re.sub(r'\s+',' ',t).strip().rstrip('.').replace('_','')
    out=[]
    for i,w in enumerate(t.split(' ')):
        lw=w.lower()
        if re.fullmatch(r'[IVXLC]{2,}',w.upper()) and w.upper()==w.upper() and re.fullmatch(r'[ivxlcIVXLC]{2,}',w) and lw not in ('mix','civil','lid','dill'): out.append(w.upper())
        elif lw in ('ss.','st.'): out.append(lw.upper() if lw=='ss.' else 'St.')
        elif i and lw in SMALLW: out.append(lw)
        else: out.append(lw[:1].upper()+lw[1:])
    return ' '.join(out)
HEADDROP=re.compile(r'(SERMON|EPISTLE|BERNARD|PSALM|GLORIES|VIRGIN|ADVENT|CHRISTMAS|LENT|EASTER|PENTECOST|ASCENSION|EPIPHANY|SUNDAY|FEAST|ANNUNCIATION|ASSUMPTION|MALACHY|SAINTS|MICHAEL|PAUL|ANDREW|VICTOR|PURIFICATION|DEDICATION|CIRCUMCISION|CONVERSION|NOVEMBER|CROSS)')
def mm_drop(ln):
    s=ln.strip()
    if re.fullmatch(r"(ST\. BERNARD.S SERMONS|SERMONS? FOR [A-Z .,'’-]+|AUTHOR.S PREFACE\.?)",s): return True
    if not s or len(s)>90: return False
    a=[c for c in s if c.isalpha()]
    if len(a)<4 or sum(c.isupper() for c in a)<0.75*len(a): return False
    if not HEADDROP.search(s.upper()): return False
    return bool(re.search(r'(^|\s)[0-9IlVXO]{1,4}\.?$',s) or re.match(r'^[0-9IlVXO]{1,4}\s',s))
def mm_segments(vol,lo=0,hi=None):
    L,h=find(vol); h=[x for x in h if x[0]>=lo and (hi is None or x[0]<hi)]
    segs=[]
    endi=hi or len(L)
    for k,(i,hl,_) in enumerate(h):
        j=h[k+1][0] if k+1<len(h) else endi
        ls=L[i:j]
        # heading block
        n=0; hb=[]
        while n<len(ls) and ls[n].strip() and n<3: hb.append(ls[n].strip()); n+=1
        # wrapped heading: until a line ending in '.'
        while n<len(ls) and not ls[n].strip(): n+=1
        tb=[]
        if n<len(ls) and isupper(ls[n]) and not ls[n].lstrip().startswith(('*','‘','“','"',"'")) :
            while n<len(ls) and ls[n].strip() and len(tb)<4: tb.append(ls[n].strip()); n+=1
        elif n<len(ls) and ls[n].strip().startswith('(') : 
            tb.append(ls[n].strip()); n+=1
        head=' '.join(hb); 
        segs.append((tc(head), tc(' '.join(tb)), ls[n:]))
    return segs
if __name__=='__main__' and len(sys.argv)>2:
    for v in (1,2,3):
        s=mm_segments(v,300 if v==3 else 0)
        for hd,t,ls in s: print(v,hd,'|',t[:70],'|',len(ls))


class F:
    def search(self,s): return mm_drop(s)
FIXT=[('Gor','God'),('Gop','God'),('Oy the','On the'),('Hoty','Holy'),('Oi; Vitor?','St. Victor'),('1s ','Is '),('The* Ways','The Ways'),(' - ',' '),('En- Countered','Encountered'),('Deliver- Ance','Deliverance'),('Pro- Cession','Procession'),('Water-pots','Water-Pots')]
def mk_title(hd,t):
    t=re.sub(r'[\\«»“”"]+|\s\.$','',t); t=re.sub(r'\s+',' ',t).strip(' .;,')
    hd=hd.rstrip('. ').replace(' :','')
    for a,b in FIXT:
        t=t.replace(a,b); hd=hd.replace(a,b)
    hd=hd.replace('Oi; Vitor?','St. Victor').replace('The. Feast','the Feast').replace('Sermon. for','Sermon for')
    if '. ' in hd and 'St. ' not in hd and 'SS.' not in hd:
        hd=hd.split('. ')[0]
    return hd+(': '+t if t else '')
def items(segs):
    return [(mk_title(h,t),ls) for h,t,ls in segs if sum(len(l.split()) for l in ls)>=150]
def build(kind):
    v1=mm_segments(1); v2=mm_segments(2,0,18433); v3=mm_segments(3,300,15623)
    return dict(v1=v1,v2=v2,v3=v3)
