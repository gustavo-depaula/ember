"""LF djvu.xml page range -> list of paragraphs (body type only). usage via import: body_paras(xml_pages, first, last, start_re, end_re)"""
import sys, re
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
import aug_lf, en_common as E
def body_paras(pgs, first, last, start_re=None, end_re=None, hmin=47, ymin=350, ymax=3790, indent=40):
    paras = []; cur = []; started = start_re is None; done = False
    for i in range(first, last + 1):
        for l in aug_lf.page_lines(pgs[i]):
            if l['y'] < ymin or l['y'] > ymax: continue
            t = l['text'].strip()
            if not started:
                if re.search(start_re, t): started = True
                else: continue
            if end_re and re.search(end_re, t): done = True
            if l['h'] < hmin or len(t) < 3 or sum(c.isalpha() for c in t) < 0.5 * len(t): continue
            if done: break
            ind = indent < l['x'] < 130
            if ind and cur: paras.append(cur); cur = []
            cur.append(t)
        if done: break
    if cur: paras.append(cur)
    out = []
    for p in paras:
        out.append(E.join_lines(p))
    # join paragraphs split at page breaks: next not indented => already joined as same cur. handled by cur persisting across pages
    return out
if __name__ == '__main__':
    pgs = load_pages(sys.argv[1])
    ps = body_paras(pgs, int(sys.argv[2]), int(sys.argv[3]), sys.argv[4] or None, sys.argv[5] or None)
    for p in ps: print(p, '\n')
