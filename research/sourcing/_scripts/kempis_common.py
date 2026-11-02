"""Shared cleaning of the archive.org OCR of Pohl's Thomae Hemerken a Kempis Opera omnia (line numbers every 5 lines,
running heads, hyphenated line breaks) into paragraphs."""
import re

LN = r'(?:5|10|15|20|25|30|35|40|2s|1o|3o|2o|4o|1s|3s)'


def clean(lines):
    """lines: raw OCR lines of the body (no front matter) -> list of paragraphs."""
    out = []
    for raw in lines:
        l = re.sub(r'\s+', ' ', raw)
        s = l.strip()
        if 'SERMONES' in s or 'Novicios' in s or 'NOVICIOS' in s or '@' in s:
            continue
        if not s:
            out.append('')
            continue
        if re.match(r'^Thomae a K', s) or re.match(r'^[\d\s.,_|=\-]+$', s):
            continue
        if s.isupper() and len(s) < 30 and not s.startswith('['):
            continue  # running head
        if len(s) < 28 and not re.search(r'[a-z]{4}', s) and re.search(r'\d', s):
            continue
        s = re.sub(r'^' + LN + r'(?=\s*[A-Za-z])\s*', '', s)  # leading line number
        s = re.sub(r'(?<=[a-z,.;:])\s*' + LN + r'_?\s*$', '', s)  # trailing line number
        s = re.sub(r'\s+\d{1,2}_?$', '', s) if re.search(r'[a-z.,;]\s+(5|10|15|20|25|30)_?$', s) else s
        out.append(s)
    # join hyphenated breaks and lines into paragraphs (blank line = break)
    paras, cur = [], ''
    for s in out + ['']:
        if not s:
            if cur:
                paras.append(cur)
            cur = ''
            continue
        if cur.endswith('-') and not cur.endswith(' -') and s[:1].islower():
            cur = cur[:-1] + s
        else:
            cur = (cur + ' ' + s).strip()
    return paras


def fix(s):
    s = s.replace('ſ', 's')
    s = re.sub(r'\blesu', 'Iesu', s)
    s = re.sub(r'\blesus', 'Iesus', s)
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'(?<=[\w-]) (?:5|10|15|20|25|30|35|40|45)(?= [A-Za-z])', '', s)  # stray line numbers
    s = re.sub(r'(?<=[a-z])-(?:5|10|15|20|25|30|35|40|45)? (?=[a-z])', '', s)
    s = re.sub(r'(?<=[a-z])- (?=[a-z])', '', s)
    s = re.sub(r'\b\d \S{1,2}\) ', '', s)
    s = re.sub(r'^.{0,28}?\bet gratias ago tibi', 'Benedico et gratias ago tibi', s) if re.match(r'^[^A-Z]{0,28}?\bet gratias ago tibi', s) else s
    return s


def roman_ok(s):
    return s


def clean_en(lines):
    """English OCR (double-spaced words, page numbers, running heads) -> paragraphs."""
    out = []
    for raw in lines:
        s = re.sub(r'\s+', ' ', raw).strip()
        if not s:
            out.append('')
            continue
        if re.match(r'^[\d\sivxlcIVXLC.,]*$', s) and len(s) < 9:
            continue
        if s.isupper() and len(s) < 36 and not s.startswith('CHAPTER'):
            continue  # running head
        out.append(s)
    paras, cur = [], ''
    for s in out + ['']:
        if not s:
            if cur:
                paras.append(cur)
            cur = ''
            continue
        if cur.endswith('-') and s[:1].islower():
            cur = cur[:-1] + s
        else:
            cur = (cur + ' ' + s).strip()
    return paras


def mend(paras):
    """Join paragraphs split by a page break: previous does not end a sentence, or next starts lowercase."""
    res = []
    for p in paras:
        if res and (not re.search(r'[.?!:;»"”\)\]]$', res[-1]) or p[:1].islower()):
            if res[-1].endswith('-') and p[:1].islower():
                res[-1] = res[-1][:-1] + p
            else:
                res[-1] += ' ' + p
        else:
            res.append(p)
    return res


def decap(p):
    """Drop-cap lines come as 'LORD my God': lower the shouted words."""
    m = re.match(r'^((?:[A-Z]{2,}[,.;:]?\s+){1,4})', p)
    if not m:
        return p
    words = m.group(1).split()
    if len(words) == 1 or True:
        w = [x.capitalize() if i == 0 else (x.lower() if x not in ('I', 'O') else x) for i, x in enumerate(words)]
        return ' '.join(w) + ' ' + p[m.end():]
    return p


def segments(lines, marker, start, end, groups=(), title_before=False):
    """Split lines[start:end] at lines matching marker; groups = line numbers where a new part begins.
    Returns (preface_lines, [(group_index, chapter_lines, pre_title)]). With title_before the chapter title is the
    run of upper-case lines just above the marker."""
    idx = [i for i in range(start, end) if re.search(marker, lines[i])]
    tstart = {}
    for i in idx:
        j = i
        k = i - 1
        while k > start and (not lines[k].strip() or (lines[k].strip().isupper() and 'SERMONES' not in lines[k] and len(lines[k].split()) < 12)) and i - k < 8:
            if lines[k].strip():
                j = k
            k -= 1
        tstart[i] = j
    pre = lines[start:tstart[idx[0]]]
    segs = []
    for n, i in enumerate(idx):
        j = tstart[idx[n + 1]] if n + 1 < len(idx) else end
        for g in groups:
            if i < g < j:
                j = g
        gi = sum(1 for g in groups if g <= i)
        title = ' '.join(re.sub(r'\s+', ' ', lines[k]).strip() for k in range(tstart[i], i) if lines[k].strip()) if title_before else ''
        segs.append((gi, lines[i + 1:j], title))
    return pre, segs
