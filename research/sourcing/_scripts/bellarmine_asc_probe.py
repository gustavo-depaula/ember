import sys, re; sys.path.insert(0, '.')
from bellarmine_split import *
paras = explode(bc.clean_volume(8).split('\n\n'))
def idx(rx, after=0):
    return next(i for i in range(after, len(paras)) if re.match(rx, paras[i]) and len(paras[i]) < 80)
st = {}
st['fel'] = idx(r'^(DE )?.{0,2}TERNA FELICITATE SANCTORUM', 1500)
st["gem"] = idx(r"^(DE )?GEMITU", st["fel"] + 100)
st['sep'] = idx(r'^(DE )?SEPTEM VERBIS', st['gem'] + 100)
st['art'] = idx(r'^(DE )?ARTE BENE MORIENDI', st['sep'] + 100)
st['cog'] = idx(r'^(DE )?COGNITIONE DEI', st['art'] + 100)
print(st)
order = ['fel','gem','sep','art','cog']
for k, nx in zip(order, order[1:] + [None]):
    hi = st[nx] if nx else min(len(paras), st[k] + 330)
    bks = walk(paras, st[k], hi, nbooks={'fel':5,'gem':3,'sep':2,'art':2,'cog':1}[k])
    print(k, [(b[0], b[1], len(b[2]), [c[0] for c in b[2]]) for b in bks])
