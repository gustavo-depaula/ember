"""Archive.org djvu text -> chapters for the Rhineland English translations."""
import re
W=set(w.strip().lower() for w in open('/usr/share/dict/words',errors='ignore'))
PREF={'super','sub','inter','over','under','self','dis','con','mis','pre','pro','sup','un','re','in','de','ex','im','com','trans','con'}
def inW(w):
    w=w.lower()
    return w in W or (w.endswith('s') and w[:-1] in W) or (w.endswith('es') and w[:-2] in W) or (w.endswith('ed') and (w[:-2] in W or w[:-1] in W)) or (w.endswith('ing') and (w[:-3] in W or w[:-3]+'e' in W)) or (w.endswith('ly') and w[:-2] in W)
def fix_join(a,b):
    ma=re.search(r"([A-Za-z]+)$",a); mb=re.match(r"([A-Za-z]+)",b)
    return ma,mb
def join_lines(ls):
    out=''
    for ln in ls:
        ln=re.sub(r'\s+',' ',ln.strip())
        if not out: out=ln; continue
        ma=re.search(r"([A-Za-z]+)(-?)$",out); mb=re.match(r"([A-Za-z]+)",ln)
        if ma and mb:
            w1,hy=ma.group(1).lower(),ma.group(2); w2=mb.group(1).lower()
            if hy:
                if inW(w1+w2) or not (inW(w1) and inW(w2)): out=out[:-1]+ln; continue
                out=out+ln; continue
            if w1 not in W and (w1+w2) in W and len(w1)>1: out=out+ln; continue
            if w2 not in W and (w1+w2) in W and len(w2)>=3: out=out+ln; continue
            if w2 in ('ing','ed','ly','ment','ness','tion','ions','ous') and (w1+w2) in W: out=out+ln; continue
            if w1 in PREF and len(w1)>=3 and (w1+w2) in W and w1!='over' and w1!='under' and w1!='self': out=out+ln; continue
        out=out+' '+ln
    return out
def paras(lines, drop=None):
    """lines (raw) -> paragraphs; drop(block_text)->True removes running heads."""
    blocks=[];cur=[]
    for ln in lines:
        ln=ln.replace('\x0c','')
        if ln.strip(): cur.append(ln)
        else:
            if cur: blocks.append(cur); cur=[]
    if cur: blocks.append(cur)
    out=[]
    for b in blocks:
        t=join_lines(b)
        if re.fullmatch(r'[\dIl|]{1,4}',t): continue
        if drop and drop(t): continue
        out.append(t)
    # merge paragraphs broken at page boundary: previous ends without sentence punctuation and next starts lowercase
    res=[]
    for p in out:
        if res and not re.search(r'[.!?:;"”’)\]]\s*$',res[-1]) and p[:1].islower():
            res[-1]=join_lines([res[-1],p])
        else: res.append(p)
    return res
ROM=re.compile(r'^\W*CHAPTER\s+([IVXLCl1]+|ITI)\W*\d*\s*$')
def romval(s):
    s=s.replace('ITI','III').replace('l','I').replace('1','I')
    v={'I':1,'V':5,'X':10,'L':50,'C':100};t=0
    for i,c in enumerate(s):
        t+=-v[c] if i+1<len(s) and v[c]<v[s[i+1]] else v[c]
    return t
def chapters(lines, prologue=True):
    """split a list of lines on 'CHAPTER N' / 'PROLOGUE' lines. Returns list of (key, title_lines, body_lines)."""
    idx=[]
    for i,l in enumerate(lines):
        if ROM.match(l): idx.append((i,romval(ROM.match(l).group(1))))
        elif prologue and re.match(r'^\s*PROLOGUE\s*$',l): idx.append((i,0))
    out=[]
    for j,(i,k) in enumerate(idx):
        e=idx[j+1][0] if j+1<len(idx) else len(lines)
        seg=lines[i+1:e]
        # title: first block of capitals lines
        t=[];n=0
        while n<len(seg) and not seg[n].strip(): n+=1
        while n<len(seg):
            if seg[n].strip() and seg[n].upper()==seg[n]: t.append(seg[n].strip()); n+=1; continue
            if not seg[n].strip() and t:
                m=n
                while m<len(seg) and not seg[m].strip(): m+=1
                if m<len(seg) and seg[m].upper()==seg[m] and re.search('[A-Z]{3}',seg[m]) and m-n<3: n=m; continue
            break
        out.append((k,' '.join(t),seg[n:]))
    return out

def drop_head(t):
    if re.search(r'Ruys?broeck\W*$|^\W*(THE|THK)\s+END\s+OF|^HERE\s+BEGINS|^Adornment of the|^The Sparkling Stone|^The Book of Supreme|^Ecce\s+sponsus|^[\W\w]?$|^[•. ]+$',t): return True
    if len(t.split())==1 and t.isupper(): return True
    w=t.split()
    if len(w)>9 or len(w)<1: return False
    if re.search(r'[.!?]$',t) and not re.fullmatch(r'\d{1,3}\s+[A-Z][A-Z ,\'’-]+\.?|[A-Z][A-Z ,\'’-]+\.?\s+\d{1,3}',t): return False
    if not (re.match(r'^\d{1,3}\s',t) or re.search(r'\s\d{1,3}$',t)): return False
    caps=sum(x[:1].isupper() for x in w)
    return caps>=len(w)/2
SMALL={'of','the','and','in','to','a','an','by','for','on','with','from','at','or','as'}
def tcase(t):
    t=re.sub(r'\s+',' ',t).strip().rstrip('.')
    ws=t.lower().split(' ')
    return ' '.join(w if (i and w in SMALL) else w[:1].upper()+w[1:] for i,w in enumerate(ws))
