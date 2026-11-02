import re, sys, json, os
sys.path.insert(0,'/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from en_common import *
from bookjson import write
E='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/en/'
R='/Users/gustavo/Documents/prayer/content/books/ruusbroec-opera-omnia/'
def wr(d,lang,cid,md):
    os.makedirs(f'{d}/{lang}',exist_ok=True); open(f'{d}/{lang}/{cid}.md','w').write(md)
def lines(f,a,b): return open(E+f).read().split('\n')[a:b]
def scripture(t): return bool(re.match(r'^\d{1,2}\s+\S',t)) and len(t.split())<=16 and bool(re.search(r'\b(Ps|Matt|Luke|John|Thess|Cor|Gal|Rom|Eph|Heb|Apoc|Cant|Prov|Wisd|Is|Jer|Gen|Exod|Deut|Eccl|Mark|Acts|Phil|Col|Tim|Pet|Jas|Rev|Cf)\b',t))
def go(f,a,b,pro,fixdrop=None,title_body=False):
    L=lines(f,a,b); out=[]
    if fixdrop: L=[l for l in L if not (re.match(r"^\s*(\d{1,3}|Love's\\s+Gradatory|.{0,3}KINGDOM OF DIVINITY.*)\s*$",l) or scripture(l.strip()))]
    for k,t,body in chapters(L,pro):
        ps=paras(body,lambda t:drop_head(t) or (fixdrop and fixdrop(t)))
        ps=[re.sub(r'(?<=[.,;:”"’])\d{1,2}(?=\s|$)','',p) for p in ps] if fixdrop else ps
        if title_body:
            parts=[t] if t else []
            while ps and (not re.match(r'^[A-Z]{2,}\b[ ,]+[a-z“"]',ps[0]) or (not parts and re.match(r'^(OF|HOW|WHAT|CONCERNING|THAT|HERE|SHOWING)\b',ps[0]))) and len(parts)<6: parts.append(ps.pop(0))
            t=' '.join(parts)
        out.append((k,tcase(t),ps))
    return out
def addto(slug,en,ids,key,tr,src,words_note):
    d=R+slug; bj=json.load(open(d+'/book.json')); words=0
    bj['sources']=[x for x in bj['sources'] if x['language']!='en-US']; bj['description']['en-US']=bj['description']['en-US'].split(' English:')[0]
    flat=[n for n in bj['toc']]
    byid={n['id']:n for n in flat}
    for (k,t,ps),cid in zip(en,ids):
        label='Prologue' if k==0 else f'{k}. {t}'
        md=f'# {label}\n\n'+'\n\n'.join(ps)+'\n'; wr(d,'en-US',cid,md); words+=len(md.split()); byid[cid]['title']['en-US']=label
    bj['languages']=['dum','en-US']; bj['editions']['en-US']=tr; bj['sources'].append(src)
    bj['description']['en-US']+=words_note
    write(d,bj); print(slug,words,len(en))
if __name__=='__main__':
    g=go('lovesgradatory00ruusuoft.txt',1215,4742,True,scripture)
    d=json.load(open(R+'seven-trappen/book.json')); ids=[n['id'] for n in d['toc']]; assert len(g)==len(ids)==15,(len(g),len(ids))
    addto('seven-trappen',g,ids,'trappen',{"translator":"Mother St. Jerome (Benedictine nun of Stanbrook?)","year":1914},
     {"language":"en-US","url":"https://archive.org/details/lovesgradatory00ruusuoft","edition":"Love's Gradatory: The Book of the Seven Steps of Divine Love by Blessed John Ruysbroeck, translated by Mother St. Jerome (London: Burns & Oates, 1914).","description":"OCR of the archive.org scan (research/sourcing/_scripts/ruusen_build.py); running heads and the page-foot scripture references removed. The translator's preface and introduction are not included.","tier":"A","tierEvidence":"1914 translation, public domain."}," English: Mother St. Jerome, 1914, chapter for chapter.")
    k=go('kingdomofloverso00ruusuoft.txt',445,6416,False,None,True)
    d=json.load(open(R+'rijcke-der-ghelieven/book.json')); ids=[n['id'] for n in d['toc'] if n['id']!='prologhe']; assert len(k)==len(ids)==43,(len(k),len(ids))
    addto('rijcke-der-ghelieven',k,ids,'rijcke',{"translator":"T. A. Hyde (from Surius' Latin)","year":1919},
     {"language":"en-US","url":"https://archive.org/details/kingdomofloverso00ruusuoft","edition":"The Kingdom of the Lovers of God by Blessed John Ruysbroeck, translated by T. A. Hyde (London: Kegan Paul, 1919), from the Latin of Surius.","description":"OCR of the archive.org scan (research/sourcing/_scripts/ruusen_build.py); running heads removed. Hyde translated Surius' Latin, so the wording follows the Latin; the chapters match David's. The translator's introduction and the Dutch prologue are not included.","tier":"A","tierEvidence":"1919 translation, public domain."}," English: T. A. Hyde, 1919, translated from Surius' Latin, chapter for chapter.")
