import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
L=src('/Users/gustavo/Documents/prayer/research/sourcing/anselm/ia/devotionofsaint00anseuoft_djvu.txt')
cuts=[('praefatio','Preface to the Meditations and Prayers',2866,2893,'The '),
('meditatio-1','Meditation I. Concerning the Dignity and the Misery of Human Nature',2896,4194,''),
('meditatio-2','Meditation II. Concerning the Terrors of the Day of Judgment: An Incentive to Tears',4197,4452,''),
('meditatio-3','Meditation III. To Encourage the Spirit Not to Fall into Despair, since, if We Truly Repent, We Shall Without Doubt Find Mercy for All Our Sins',4457,4782,''),
('meditatio-4','Meditation IV. Concerning the Redemption of Mankind',4785,5317,''),
('oratio-1','Prayer I. A Prayer of Praise and Thanksgiving to God',5323,5487,''),
('oratio-2','Prayer II. A Prayer to the Holy Spirit',5490,5564,''),
('oratio-3','Prayer III. A Prayer to Christ for My Friends',5567,5730,''),
('oratio-4','Prayer IV. A Prayer to Christ for My Enemies',5733,5872,''),
('epistolae-intro','Letters of Spiritual Counsel: Introductory Note',5877,5903,''),
('epistola-1','Letter I. To Ralph',5909,6024,''),
('epistola-2','Letter II. To Herlwin, Gondulf, and Maurice, Monks of Bec Sojourning in Christ Church, Canterbury',6032,6174,''),
('epistola-3',"Letter III. To Burgundius and His Wife Richera, on Burgundius' Departure as a Pilgrim to Jerusalem",6180,6250,''),
('epistola-4','Letter IV. To Alexander, King of Scots',6254,6336,''),
('epistola-5','Letter V. To Robert and the Devout Women under His Care',6342,6516,'')]
FIX={'epistola-1':(r'^.*?Although you','Brother Anselm to his dear brother Ralph. Although you'),
'meditatio-3':(r'\\?A7HEN','When'),'meditatio-4':(r'/~\\\s+CHRISTIAN','O Christian'),
'oratio-3':(r'^r\\\s+SWEET','O sweet'),'oratio-4':(r'^I ORD','Lord'),
'epistola-2':(r'^["\'“]*PO\s+','To '),'epistola-3':(r'^A NSELM','Anselm'),'epistola-4':(r'^[\'"“]*"?TO\s+Alexander','To Alexander'),
'epistola-5':(r'^A NSELM','Anselm'),'epistolae-intro':(r'^HTHOUGH','Though'),'meditatio-1':(r'A WAKE,\s+my\s+sou\],\s+awake!\s+show\s+thy\s+spirit,\s+frrr','Awake, my soul, awake! show thy spirit,')}
DROP1={'meditatio-1','meditatio-2','meditatio-3','meditatio-4','epistola-3','epistola-4','epistola-5','epistola-2'}
segs=[]
for cid,t,a,b,pre in cuts:
    ls=L[a-1:b]
    # section headings: roman-only line followed by short title block
    out=[];i=0
    while i<len(ls):
        s=ls[i].strip()
        if cid.startswith('medit') and re.fullmatch(r'[IVX]{1,5}',s) and (i==0 or not ls[i-1].strip()) and i+1<len(ls):
            j=i+1
            while j<len(ls) and not ls[j].strip(): j+=1
            blk=[]
            while j<len(ls) and ls[j].strip() and len(blk)<3: blk.append(ls[j].strip()); j+=1
            out+=['','## '+s+'. '+re.sub(r'\s+',' ',' '.join(blk)).rstrip('.'),'']
            i=j; continue
        out.append(ls[i]); i+=1
    segs.append((cid,t,out,pre))
def post_factory():
    pass
drops=[r'^MEDITATIONS?\s+\d+$',r'^\d+\s+SAINT\s+ANSELM$',r'^PRAYERS\s+\d+$',r'^\d+\s+PRAYERS$',r'^LETTERS\s+\d+$',r'^\d+\s+LETTERS$',r'^SAINT\s+ANSELM\s+\d+$',r'^MEDITATIONS?$',r'^PRAYERS$',r'^LETTERS$',r'^\d+\s+SAINT\s+ANSELM\s*$',r'^MEDITATION\s+[IV]+\s*\d*$']
pre={c:p for c,_,_,_,p in cuts}
def fixer(cid,body):
    ps=body.split('\n\n')
    if cid=='epistola-2': ps=ps[:1]+[' '.join(ps[1:4])]+ps[4:]
    if cid in DROP1: ps=ps[1:]
    body='\n\n'.join(ps)
    body=re.sub(r'\s+\S{0,3}\s*SAINT ANSELM\b','',body)
    body=re.sub(r'\s+(MEDITATIONS?|PRAYERS|LETTERS)\s+\d{2,3}\b','',body)
    body=re.sub(r'\s(><|\^)(?=\s)','',body)
    if cid in FIX:
        pat,rep=FIX[cid]; body=re.sub(pat,rep,body,count=1,flags=re.S if cid=='epistola-1' else 0)
    body=pre[cid]+body if pre[cid] else body
    body=body.replace('Xjow,','Now,').replace(' wo the Godhead',' the Godhead')
    body=re.sub(r'^I ([A-Z]{2,})\b',lambda m:'I '+m.group(1).lower(),body,count=1)
    body=re.sub(r'^([A-Z]{2,})\b',lambda m:m.group(1).capitalize(),body,count=1)
    return body
if __name__=='__main__':
    ROOT=B+'anselm-opera-omnia/orationes-et-meditationes-webb'
    make_book(ROOT,'anselm-orationes-et-meditationes-webb','anselm/orationes-et-meditationes',
     'The Devotions of Saint Anselm',B+'anselm-opera-omnia/orationes-et-meditationes/book.json',
     "C. C. J. Webb's English (Methuen, Library of Devotion, 1903) of a selection from Anselm's Orationes sive meditationes: his preface, Meditations I-IV and four prayers, with five letters of spiritual counsel. Webb's selection and numbering differ from the Latin book, so it is a separate book of the same work.",
     "1070-1109",{"translator":"Clement C. J. Webb","year":1903},
     source("https://archive.org/details/devotionofsaint00anseuoft","The Devotions of Saint Anselm, Archbishop of Canterbury, edited by Clement C. J. Webb (London: Methuen, 1903).","Djvu OCR cleaned by script, not proofread. The Proslogion, Webb's introduction and note on its argument are not imported (the Proslogion is in its own book). Webb's footnotes are kept as footnotes where the OCR keeps the markers legible and dropped otherwise; the drop capitals the OCR lost at the head of each piece are restored by hand.",1903),
     [(c,t,l) for c,t,l,p in segs],drops=drops,post=fixer,
     pt_name='As Devoções de Santo Anselmo',pt_desc='A tradução inglesa de C. C. J. Webb (1903) de uma seleção das orações e meditações de Anselmo, com cinco cartas de direção espiritual.')
