"""Generic: front sections + segments (prefix,label,lo,hi) split at 'CAPÍTULO N' headings (title above or below)."""
import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cuervo import *

def segments(L, front, segs, KW, title_pos="above"):
    out = []
    for cid, lab, st, en in front:
        out.append((cid, lab, clean(L[st + 1:en], run_kw=KW)))
    groups = []
    for pre, lab, lo, hi in segs:
        hs = chapter_heads(L, lo, hi)
        ids = []
        if not hs:
            out.append((pre, lab, clean(L[lo + 1:hi], run_kw=KW))); groups.append((pre, lab, [pre])); continue
        if hs[0][0] - lo > 20:
            iid = pre + "-intro"
            out.append((iid, lab + ": introducción", clean(L[lo + 1:hs[0][0] - 8], run_kw=KW))); ids.append(iid)
        for k, (h, n) in enumerate(hs):
            nxt = hs[k + 1][0] if k + 1 < len(hs) else hi
            if title_pos == "above":
                t = title_above(L, h); body = L[h + 1:nxt]
            else:
                t, i = title_of(L, h); body = L[i:nxt]
            t = re.sub(r"(\w)- (\w)", r"\1\2", t)
            cid = "%s-c%d" % (pre, n)
            out.append((cid, "Capítulo %d%s" % (n, (". " + t[:1].upper() + t[1:]) if t else ""), clean(body, run_kw=KW))); ids.append(cid)
        groups.append((pre, lab, ids))
    out = [(c, t, p) for c, t, p in out if sum(len(x.split()) for x in p) > 12]
    have = {c for c, _, _ in out}
    groups = [(g, l, [i for i in ids if i in have]) for g, l, ids in groups]
    return out, groups
