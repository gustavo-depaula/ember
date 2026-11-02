"""Clean `pdftotext -layout` text of an Annecy volume (donboscosanto.eu PDFs).

clean(path) -> list of paragraphs (str). Drops running heads, margin column
(Scripture refs), footnote block at page foot (variants, "(a) ..."), inline
note markers. Centered short lines become their own paragraph prefixed '␂'
so callers can find headings.
"""
import re, sys, collections

SH = '­'
REFWORDS = re.compile(r'^\W*(\*|\d|Vers|Ver\b|Chap|Liv\b|Livre|Ps\b|Ps\.|Matth|Luc\b|Jean|Marc|Rom|Cor|Gen|Exod|Entret|Lett|Sermon|Cant|Eccl|Prov|Apoc|Isa|Jer|Deut|Act|Hebr|Heb|Sap|Job|Num|Lev|Reg|Ezech|Dan|Os\b|Gal|Eph|Phil|Col|Thess|Tim|Pet|Jac|S\.|Sain|Tob|Jud|Mich|Zach|Mal)', re.I)

def indent(l):
    return len(l) - len(l.lstrip(' '))

def split_margin(line):
    m = re.match(r'^(\S.{0,34}?)\s{5,}(\S.*)$', line)
    if m and REFWORDS.match(m.group(1)) and len(m.group(1)) < 36:
        return ' ' * 12 + m.group(2)
    return line

def clean(path, keep_heads=False):
    raw = open(path, encoding='utf-8', errors='replace').read()
    pages = raw.split('\f')
    firsts = collections.Counter()
    norm = lambda s: re.sub(r'[\d\s\W_]+|\b[ivxlcdm]+\b', '', s.lower())
    for p in pages:
        ls = [l for l in p.split('\n') if l.strip()]
        for l in ls[:3]:
            firsts[norm(l)] += 1
    out = []
    for p in pages:
        lines = p.split('\n')
        while lines and not lines[0].strip():
            lines.pop(0)
        if not lines:
            continue
        seen = 0
        for i in range(len(lines)):
            if not lines[i].strip():
                continue
            seen += 1
            if seen > 3:
                break
            h = lines[i].strip()
            n = norm(h)
            if len(h) < 90 and ((len(n) >= 6 and firsts[n] >= 4) or (seen == 1 and len(h) < 60 and (re.match(r'^[\W]*\d+\W+\S', h) or re.search(r'\S\W+\d+\W*$', h) or re.match(r'^[IVXLC]+\W*$', h)))):
                lines[i] = ''
        # footnote block: first line starting "(x) " after a blank line, to page end
        cut = None
        for i, l in enumerate(lines):
            if i > 2 and re.match(r'^\s{0,6}[\(\[<][a-z0-9]{1,2}[\)\]>]\s+\S', l) and (not lines[i-1].strip()):
                cut = i
                break
        if cut is not None:
            lines = lines[:cut]
        lines = [split_margin(l) for l in lines]
        body = [l for l in lines if l.strip()]
        if not body:
            continue
        ind = collections.Counter(indent(l) for l in body)
        base = min(i for i, c in ind.items() if c >= 2) if any(c >= 2 for c in ind.values()) else min(ind)
        out.append((base, lines))
    paras, cur = [], []
    prevlen = 0
    def flush():
        nonlocal cur
        if cur:
            paras.append(cur)
        cur = []
    maxw = 0
    for base, lines in out:
        for l in lines:
            if not l.strip():
                continue
            ind = indent(l) - base
            s = l.strip()
            centered = ind >= 8 and len(s) < 70
            if centered:
                flush()
                paras.append(['␂' + s])
                continue
            if ind >= 2 and cur:
                flush()
            elif cur and prevlen < 45 and re.search(r'[.!?:;»)]$', cur[-1]) and not cur[-1].endswith(SH):
                flush()
            cur.append(s)
            prevlen = len(s)
    flush()
    text = []
    for p in paras:
        if p[0].startswith('␂'):
            text.append(' '.join(x.lstrip('␂') for x in p).join(['␂', '']))
            continue
        t = ''
        for s in p:
            if not t:
                t = s
            elif t.endswith(SH):
                t = t[:-1] + s
            elif t.endswith('-') and re.search(r'[a-zà-ÿ]-$', t) and re.match(r'[a-zà-ÿ]', s):
                t += '␃' + s   # hyphen join, decided later
            else:
                t += ' ' + s
        text.append(t)
    return text

def finish(paras):
    """Resolve line-end hyphens by corpus frequency; strip note markers."""
    blob = ' '.join(paras)
    words = collections.Counter(re.findall(r'[\wà-ÿ’\-]+', blob.replace('␃', '')))
    def res(m):
        a, b = m.group(1), m.group(2)
        j = a + b
        h = a + '-' + b
        if words.get(h, 0) > words.get(j, 0):
            return h
        if words.get(j, 0):
            return j
        return h if a.lower() in ('bien', 'tres', 'très', 'sous', 'non', 'mal', 'contre', 'vous', 'nous', 'luy', 'soy', 'celuy', 'celle', 'quelque', 'ceste', 'cest', 'mesme') or b.lower() in ('mesme', 'mesmes', 'heureux', 'heureuse', 'cy', 'là', 'ci', 'il', 'elle', 'on', 'nous', 'vous', 'moy', 'toy', 'luy', 'je', 'ils') else j
    out = []
    for p in paras:
        if '␃' in p:
            p = re.sub(r'([\wà-ÿ’]+)-␃([\wà-ÿ’]+)', res, p)
            p = p.replace('␃', '')
        p = re.sub(r'\s*[\(<\[][a-z0-9]{1,2}[\)>\]](?=[\s.,;:!?»]|$)', '', p)
        p = re.sub(r'\s+', ' ', p).strip()
        out.append(p)
    return out

if __name__ == '__main__':
    ps = finish(clean(sys.argv[1]))
    print('\n\n'.join(ps))
