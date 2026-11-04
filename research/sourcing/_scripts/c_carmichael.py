import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from c_make import *
from en_common import tcase
P='/Users/gustavo/Documents/prayer/research/sourcing/_c-dl/carmichael.txt'
L=src(P)
# footnotes
fn={}; i=next(k for k,l in enumerate(L) if l.startswith('FOOTNOTES:'))
cur=None
for l in L[i+1:]:
    m=re.match(r'^\[(\d+)\]\s*(.*)',l)
    if m: cur=int(m.group(1)); fn[cur]=m.group(2)
    elif l.strip() and cur and not l.startswith('*** END'): fn[cur]+=' '+l.strip()
    elif not l.strip(): pass
    if l.startswith('*** END'): break
a=next(k for k,l in enumerate(L) if k>400 and l.strip()=='THE LADY POVERTY')
b=next(k for k,l in enumerate(L) if l.startswith('ON THE SPIRITUAL SIGNIFICANCE'))
ROM=re.compile(r'^([IVX]+)$')
segs=[];cur=None
for k in range(a,b):
    m=ROM.match(L[k].strip()) if L[k].strip()==L[k] else None
    if m and not L[k-1].strip() and not L[k+1].strip() :
        cur=[m.group(1),[]]; segs.append(cur)
    elif cur: cur[1].append(L[k])
def rv(s):
    v={'I':1,'V':5,'X':10};t=0
    for j,c in enumerate(s): t+=-v[c] if j+1<len(s) and v[c]<v[s[j+1]] else v[c]
    return t
out=[]
for r,lines in segs:
    t,rest=take_title(lines)
    t=re.sub(r'\[\d+\]','',t).strip()
    out.append((f'c{rv(r):02d}',f'Chapter {r}. '+tcase(t),lines))
def post(cid,body):
    body=re.sub(r'\s*\{([^}]*)\}',lambda m:' ('+m.group(1).strip()+')',body)
    nums=re.findall(r'\[(\d+)\]',body)
    for k,n in enumerate(nums,1): 
        body=body.replace(f'[{n}]',f'[^{k}]',1)
    defs=''.join(f'\n\n[^{k}]: {fn[int(n)]}' for k,n in enumerate(nums,1))
    return body+defs
# remove title lines from body: rebuild segs with title stripped
segs2=[]
for cid,t,lines in out:
    tt,rest=take_title(lines,maxlines=8)
    segs2.append((cid,t,rest))
out=segs2
# first chapter: strip leading epigraph/HERE BEGINNETH lines are before the I marker (excluded)
if __name__=='__main__':
    ROOT=B+'francis-of-assisi-opera-omnia/sacrum-commercium-carmichael'
    make_book(ROOT,'francis-sacrum-commercium-carmichael','francis/sacrum-commercium',
      'The Lady Poverty (Sacrum commercium)',B+'francis-of-assisi-opera-omnia/sacrum-commercium/book.json',
      "Montgomery Carmichael's English (John Murray, 1901) of the allegory of the Blessed Francis and his companions seeking and wedding Lady Poverty, written in 1227 after Francis's death: the twenty-five chapters of the translation with Carmichael's notes, the Scripture references of the margin placed in parentheses. Carmichael's chapters differ from the thirty-two of the Latin book, so it is a separate book of the same work.",
      "1227",{"translator":"Montgomery Carmichael","year":1901},
      source("https://www.gutenberg.org/ebooks/66025","The Lady Poverty: A XIII. Century Allegory, translated and edited by Montgomery Carmichael (London: John Murray, 1901); Project Gutenberg e-text 66025.","The translation only, chapters I-XXV, with Carmichael's footnotes; the introduction, Father Cuthbert's chapter on evangelical poverty and the appendices are not imported.",1901),
      out,post=post,keep_notes=False,strip_num=False,
      pt_name='A Senhora Pobreza (Sacrum commercium)',pt_desc='A tradução inglesa de Montgomery Carmichael (1901) da alegoria do bem-aventurado Francisco e seus companheiros em busca da Senhora Pobreza: os vinte e cinco capítulos, com as notas do tradutor.')
