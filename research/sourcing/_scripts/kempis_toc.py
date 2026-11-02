"""Chapter titles from a Pohl table of contents: lines of 'De ... . . . XVIII' with OCR-garbled numerals."""
import re


def toc_titles(path, a, b):
    L = open(path, errors='replace').read().split('\n')[a:b]
    txt = []
    for l in L:
        s = re.sub(r'\s+', ' ', l).strip()
        if not s or re.match(r'^\d{3}$', s) or re.match(r'^[\d\s]+$', s):
            continue
        s = re.sub(r'^\d{1,2}\s+', '', s)
        s = re.sub(r'\s\d{1,2}$', '', s)
        txt.append(s)
    out, cur = [], ''
    for s in txt:
        cur = cur[:-1] + s if cur.endswith('-') and s[:1].islower() else (cur + ' ' + s).strip()
        m = re.search(r'^(.*?\S)[\s.•·,]+([XVIL1lHJT]{1,7}[\*\.\-\'•\^\s·]*)$', cur)
        if m and len(m.group(1)) > 8:
            out.append(re.sub(r'^[^A-Za-z]+', '', m.group(1)).strip(' .,'))
            cur = ''
    return out
