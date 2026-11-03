"""Clean an archive.org English OCR block into paragraphs (page numbers, running heads, page-break merges)."""
import re, collections
SENT = re.compile(r'[.!?:;»"”’\')\]*]\s*$')
def paras(lines, drop=()):
    txt = '\n'.join(lines).replace('\x0c', '\n')
    blocks = [re.sub(r'\s+', ' ', b.replace('\n', ' ')).strip() for b in re.split(r'\n\s*\n', txt)]
    blocks = [b for b in blocks if b]
    cnt = collections.Counter(blocks)
    out = []
    for b in blocks:
        if re.fullmatch(r'[\dIVXivxl|!.\s]{1,6}', b): continue
        if cnt[b] >= 4 and len(b) < 70: continue
        if len(b) < 70 and (re.fullmatch(r'\d{1,3} [A-Z0-9 ,.\'’:;-]{4,}', b) or re.fullmatch(r'[A-Z0-9 ,.\'’:;-]{4,} \d{1,3}', b)): continue
        if any(re.search(d, b) for d in drop): continue
        if out and not SENT.search(out[-1]) and b[:1].islower():
            out[-1] = out[-1] + ' ' + b
        else:
            out.append(b)
    res = []
    for p in out:
        p = re.sub(r'(\w)- (?=[a-z])', r'\1', p) if False else p
        p = re.sub(r'(?<=[a-z])- (?=[a-z]{2})', '', p)  # page-end hyphenation left as "con- sequence"
        res.append(p)
    return res
