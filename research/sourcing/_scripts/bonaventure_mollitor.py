"""Mollitor's Virtues of a Religious Superior (1920) = De sex alis Seraphim, English only. usage: python3 -I bonaventure_mollitor.py"""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

W = set(w.strip().lower() for w in open('/usr/share/dict/words'))
L = [re.sub(r'\s+', ' ', l).strip() for l in open('research/sourcing/bonaventure/en/virtuesofreligio00bonauoft.txt', errors='replace').read().split('\n')]
FNR = re.compile(r"^(\*|\d{1,3}\s?)(Cf\.|Lib\.|St\.|S\. |Prov|Ps\.|Matt|Luke|Mark|John|Rom|Cor|\d? ?Cor|Eph|Gal|Heb|Jas|Eccl|Isa|Is\.|Jer|Job|Wis|Sir|Gen|Ex|Deut|Apoc|Acts|Ibid|Op\.|Serm|De |Ep\.|Hugh|Bonav|Etymolog|Reg|Reg\.|Col|Phil|Tit|Tim|\d? ?Tim|\d? ?Pet|Lev|Num|Kings|\d? ?Kings|Tob|Esth|Macc|Bernard|Greg|Aug|Ambr|Hier|Chrys|Hom|In |Moral|Dial|Cassian|Decret|Cap|Sent|Lk|Mt|Jn|Sap|Eccli|Ecclus|Thren|Zach|Mal|Os|Amos|Mich|Dan|Ezech|Ez)")
HEADR = re.compile(r'^(\d+ )?(Virtues of a Religious Superior|Introduction|Prologue)( \d+)?$|^[A-Z][A-Za-z ,\'-]{2,40} \d{1,3}$|^\d{1,3} [A-Z][A-Za-z ,\'-]{2,40}$|^\d{1,3}$')
def clean(lines):
    out = []
    for s in lines:
        if not s: out.append(''); continue
        if HEADR.match(s) and len(s) < 48 and not re.match(r'^\d+\. ', s): continue
        if FNR.match(s) and len(s) < 130: continue
        out.append(s)
    return out

def join_para(ls):
    t = ''
    for s in ls:
        if not t: t = s; continue
        if t.endswith('-') and s[:1].islower(): t = t[:-1] + s; continue
        a = re.search(r'([A-Za-z]+)$', t); b = re.match(r'^([a-z]+)', s)
        if a and b and (a.group(1) + b.group(1)).lower() in W and (a.group(1).lower() not in W or b.group(1).lower() not in W or len(a.group(1)) <= 3 and len(b.group(1)) >= 3 and b.group(1).lower() not in ('the', 'and', 'for', 'who', 'not')) and len(a.group(1) + b.group(1)) > 5:
            t += s
        else: t += ' ' + s
    return t

def paras(lines):
    out = [[]]
    for s in clean(lines):
        if not s: continue
        if re.match(r'^(\d{1,2}|I|l)\.\s', s) and out[-1]: out.append([])
        out[-1].append(s)
    res = []
    for p in out:
        if not p: continue
        t = join_para(p)
        t = re.sub(r'^(I|l)\.\s', '1. ', t)
        res.append(re.sub(r'\s+', ' ', t))
    return res

idx = [i for i, l in enumerate(L) if re.match(r'^CHAPTER [IVX]+$', l)]
pro = next(i for i, l in enumerate(L) if l == 'PROLOGUE' and i > 150)
concl = next((i for i, l in enumerate(L) if i > idx[-1] and l.startswith('CONCLUSION')), None)
end = next((i for i, l in enumerate(L) if i > (concl or idx[-1]) + 5 and re.match(r'^(INDEX|APPENDIX)', l)), len(L))
files = {}; toc = []
files['prologue'] = '# Prologue\n\n' + '\n\n'.join(paras(L[pro + 1:idx[0]])); toc.append(('prologue', {'en-US': 'Prologue'}))
bounds = idx + [concl or end]
for n, a in enumerate(idx):
    b = bounds[n + 1]
    k = a + 1; ttl = []
    while k < b and (not L[k] or L[k].isupper() or re.match(r"^[A-Z ,.'-]+$", L[k])) and len(ttl) < 4:
        if L[k]: ttl.append(L[k])
        k += 1
    title = 'Chapter %s. %s' % (roman(n + 1), ' '.join(ttl).capitalize())
    cid = 'c%02d' % (n + 1)
    files[cid] = '# %s\n\n' % title + '\n\n'.join(paras(L[k:b])); toc.append((cid, {'en-US': title}))
if concl:
    files['conclusion'] = '# Conclusion\n\n' + '\n\n'.join(paras(L[concl + 1:end])); toc.append(('conclusion', {'en-US': 'Conclusion'}))
print({k: len(v.split()) for k, v in files.items()}, concl, end)
names = {'en-US': 'The Virtues of a Religious Superior (De sex alis Seraphim)', 'pt-BR': 'As virtudes de um superior religioso (As seis asas do Serafim)'}
descr = {'en-US': 'Sabinus Mollitor’s 1920 English translation of St. Bonaventure’s De sex alis Seraphim: the six wings of the seraph as six virtues of a religious superior, in a prologue and seven chapters (the Latin text of the Quaracchi edition is in the separate book bonaventure-de-sex-alis-seraphim, whose chapters run II-IV together). The translator’s sub-headings and notes are left out.',
         'pt-BR': 'Tradução inglesa de Sabinus Mollitor (1920) de «As seis asas do Serafim», de São Boaventura: as seis asas do serafim como seis virtudes de um superior religioso.'}
s = [src('en-US', 'https://archive.org/details/virtuesofreligio00bonauoft', 'The Virtues of a Religious Superior, by St. Bonaventure, translated from the Latin by Sabinus Mollitor, O.F.M. (St. Louis and London: B. Herder, 1920).', 'Prologue, seven chapters and the conclusion of the translation. Paragraph numbers are kept; running heads and footnotes are dropped; words split at line ends are rejoined with a dictionary, so a few slips remain.', 'A', 'Published in 1920, before 1931: public domain in the US.')]
emit('de-sex-alis-seraphim-mollitor', 'bonaventure-de-sex-alis-seraphim-mollitor', names, descr, 'c. 1260', 'bonaventure/de-sex-alis-seraphim', ['en-US'],
     {'en-US': {'translator': 'Sabinus Mollitor', 'year': 1920}}, s, toc, {'en-US': files})
