"""Split DBNL David volumes into works and chapters."""
import re
from dbnl_parse import blocks
D='/Users/gustavo/Documents/prayer/research/sourcing/rhineland/dbnl/'
KEYS=[('tabernacule','tabernakel'),('twaelf dogheden','XII'),('spieghel der ewigher','spieghel'),('kerstenen ghelove','kerstenen'),
 ('VII‧ trappen','trappen'),('seven sloten','sloten'),('rike der ghelieven','rijcke'),('vier becoringhen','becoringen'),
 ('twaelf beghinen','beghinen'),('ierste boec','brulocht1'),('ander boec','brulocht2'),('derde boec','brulocht3'),
 ('blickenden steene','steen'),('hoechster waerheit','waerheit')]
STOP=('Glossarium','Misstellingen','Opgemerkte','Korte opgave','Voorrede','Verbeteringen')
def strip_mark(s): return re.sub('[\x01\x02]\\d*','',s).strip()
def sections(vol):
    bs=blocks(f'{D}x{vol}.xml')
    works={}; order=[]; cur=None; ch=None
    for b in bs:
        if b[0]=='head':
            title=strip_mark(b[2]); rend=b[1]
            if 'h2' in rend:
                key=next((k for pat,k in KEYS if pat in title),None)
                if key and key not in works:
                    works[key]={'head':title,'chapters':[]}; order.append(key); cur=works[key]; ch=None
                elif key and key in works and cur is not works[key]:
                    cur=None
                continue
            if title.startswith(STOP) or re.fullmatch(r'[A-Z][A-Z.,K ]*',title):
                cur=None; ch=None; continue
            if cur is None: continue
            ch={'head':title,'notes_raw':b[3],'blocks':[]}; cur['chapters'].append(ch)
        elif cur is not None and ch is not None and b[0] in ('p','l'):
            if b[1]: ch['blocks'].append(b)
    return works,order
def render(ch, ):
    """Markdown body with footnotes renumbered from 1."""
    notes=[]; paras=[]; lbuf=[]
    def conv(txt,nts):
        def r(m):
            notes.append(nts[int(m.group(1))-1]); return f'[^{len(notes)}]'
        return re.sub('\x01(\\d+)\x02',r,txt)
    def flush():
        if lbuf: paras.append('  \n'.join(lbuf)); lbuf.clear()
    for kind,txt,nts in ch['blocks']:
        t=conv(txt,nts)
        if kind=='l': lbuf.append(t)
        else: flush(); paras.append(t)
    flush()
    body='\n\n'.join(paras)
    foot=''.join(f'\n[^{i+1}]: {n}\n' for i,n in enumerate(notes))
    return body+('\n'+foot if foot else '')
if __name__=='__main__':
    import sys
    for v in ['02','03','04','05','06']:
        w,o=sections(v)
        for k in o:
            c=w[k]['chapters']
            words=sum(len(render(x).split()) for x in c)
            print(v,k,len(c),words,[x['head'][:25] for x in c[:2]])
