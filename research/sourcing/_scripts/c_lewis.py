import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from en_ocr import *
from en_common import romval
SRC='/Users/gustavo/Documents/prayer/research/sourcing/bernard-of-clairvaux/ia/bernarddeclirvau00bernuoft_djvu.txt'
ROOT='/Users/gustavo/Documents/prayer/content/books/bernard-opera-omnia/de-consideratione'
L=open(SRC,errors='ignore').read().split('\n')
start=next(i for i,l in enumerate(L) if l.strip()=='PROLOGUE')
end=next(i for i,l in enumerate(L) if l.strip().startswith('ADDITIONAL') and i>start)
drops=[r'^(?!The )(.{0,14}\s)?\S{0,3}\s*Consideration\s*[\w#>\s]{0,8}$', r'^[BR]\w{2,3}\s.{0,6}Chapter\s+\S+\s*.{0,10}$', r'^\S{0,8}\s*Prologue\s*\S{0,8}$', r'^\d+$']
segs=[]; cur=None; book=0
for i in range(start,end):
    l=L[i]; s=l.strip()
    if s=='PROLOGUE' and i==start: cur=['praefatio-pro','Prologue',[]]; segs.append(cur); continue
    m=re.fullmatch(r'BOOK\s+([IVX]+)',s)
    if m and i>start+5: book=romval(m.group(1)); cur=None; skipping=True; continue
    m=re.fullmatch(r'CHAPTER\s+([IVXL]+)',s)
    if m and book:
        cur=[f'l{book}-c{romval(m.group(1)):02d}','',[]]; segs.append(cur); cur.append(True); continue
    if cur is not None: cur[2].append(l)
# titles: first block of lines after heading
out=[]
for cid,_,lines,*r in segs:
    if r:
        n=0
        while n<len(lines) and not lines[n].strip(): n+=1
        t=[]
        while n<len(lines) and lines[n].strip(): t.append(lines[n].strip()); n+=1
        title=re.sub(r'\s+',' ',' '.join(t)); lines=lines[n:]
    else: title='Prologue'
    out.append((cid,title,lines))
if __name__=='__main__':
    for cid,t,ls in out: print(cid,'|',t,'|',len(ls))

FIX={'l1-c01':'St. Bernard sympathizes with the Pope in his many cares',
'l1-c03':'The rulers of the Church ought not to be for ever hearing and deciding lawsuits',
'l1-c04':'What service is worthy, what unworthy, of the servants of God',
'l1-c05':"The Pope should not be so absorbed in other men's affairs as to neglect himself",
'l1-c09':'The recent practice of the Popes to be gradually corrected, the old imitated',
'l1-c10':'The shameless trickery of advocates, judges and procurators',
'l2-c01':'St. Bernard apologizes for the failure of the Second Crusade',
'l2-c03':'Consideration fourfold: (1) the Pope himself, (2) things below him, (3) things around him, (4) things above him',
'l2-c04':'The threefold Consideration leading to self-knowledge. Firstly, what the Pope is',
'l2-c05':'Secondly, who the Pope is, and whence he comes',
'l2-c06':'The zeal befitting ecclesiastical rulers',
'l2-c07':'Who the Pope is (continued)','l2-c08':'The dignity and power of the Pope',
'l2-c09':'St. Bernard invites the Pope to consider what he is by nature',
'l2-c10':'What manner of man the Pope is',
'l2-c14':'The Pope warned against accepting the person of any',
'l3-c01':'The Pope should aim not at subjecting all men to himself, but at bringing them into the bosom of the Church',
'l3-c02':'The limits of appeals to the Apostolic See','l3-c03':'Church rulers are for the profit of their people',
'l3-c04':'Ecclesiastical rank and dignity to be respected. The abuse of privileges and exemptions',
'l4-c04':"The Pope's colleagues and coadjutors at the Lateran",
'l4-c05':"The Pope should refuse bribes. Martin and Gunfrid. The arrogance of the Pope's attendants",
'l4-c06':"It is not becoming in the Pope to be absorbed in the management of his household to the neglect of weightier matters. He should have a steward",
'l5-c01':"The things above us, namely God and things Divine, to which we rise by means of the creatures",
'l5-c08':"The plurality of Persons in the Godhead, and their several properties. The unity and simplicity of the Essence",
'l5-c09':"As in God there are three Persons and one Nature, so in Christ there are two Natures and one Person",
'l5-c10':'The Parable of the three measures of meal',
'l5-c12':'God the rewarder of the good, and the righteous judge of the wicked',
'l5-c13':"The mystical interpretation of the length, and breadth, and height, and depth",
'l5-c14':"What it is to comprehend God"}
RN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
def clean_title(cid,t):
    if cid in FIX: t=FIX[cid]
    t=re.sub(r'\bTope\b','Pope',t).replace('Sec','See') if cid not in FIX else t
    return t
def run():
    import shutil
    d=ROOT+'/en-US'; shutil.rmtree(d,ignore_errors=True)
    titles={}
    for cid,t,lines in out:
        cid='prologus' if cid=='praefatio-pro' else cid
        t=clean_title(cid,t)
        if cid!='prologus': t=f'Chapter {RN[int(cid[4:])]}. {t}'
        body=chapter_md(lines,drops,para_start=re.compile(r'^\s*(\d{1,2}|[il]{1,2})\s?\.\s+\S'),key=cid,pagemode=True)
        body=re.sub(r'^1 AM ','I am ',body)
        write_ch(ROOT,'en-US',cid,t,body); titles[cid]=t
    return titles
if __name__=='__main__':
    t=run()
    print(words(ROOT,'en-US')); 
    print({k:v for k,v in STATS.items() if v!='ok'})
