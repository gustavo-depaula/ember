"""Shared cleaner for archive.org OCR dumps: paragraphs, running heads, page-bottom footnotes."""
import re

SENT_END = re.compile(r'[.!?»"”:;…)\]]\s*$|\*\s*$')
# running head: "270 SŒUR ELISABETH DE LA TRINITÉ" or "LETTRES 309" (mostly capitals, a page number at one end)
HEAD = re.compile(r'^(?:\d{1,3}\s+)?[^a-z]{0,6}[A-ZÀ-Ý"“«\'’ \.,:\-—|()0-9<>^]{6,}(?:\s+\d{1,3})?$')


def blocks(lines):
    out, cur = [], []
    for ln in lines:
        ln = ln.replace('\x0c', '')
        if ln.strip():
            cur.append(ln.strip())
        elif cur:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def join_lines(ls):
    s = ''
    for ln in ls:
        ln = re.sub(r'\s+', ' ', ln)
        if s.endswith('-') and ln[:1].islower() and not s.endswith(' -') and not s.endswith('--'):
            s = s[:-1] + ln
        else:
            s = (s + ' ' + ln) if s else ln
    return s.strip()


def is_head(text, heads):
    if re.fullmatch(r'\d{1,3}', text):
        return True
    if re.fullmatch(r'[\d\sIil|]{1,4}', text):
        return True
    if len(text) > 70:
        return False
    for h in heads:
        if (h(text) if callable(h) else h.search(text)):
            return True
    return False


FN_DEF = {
    'num': re.compile(r'^\(?([0-9]{1,2}|[a-z])\)\s+(?=\S)'),
    'sym': re.compile(r'^([*†‡§|]+|[tJ])\s+(?=\S)'),
}


def clean(lines, heads, fnstyle='num', stop=None):
    """lines -> list of paragraphs (str) with [^N] markers, plus footnote dict.
    heads: list of compiled regexes identifying running heads. stop: regex of a block ending the chapter."""
    bl = [join_lines(b) for b in blocks(lines)]
    pages, cur = [], {'body': [], 'fn': []}
    for b in bl:
        if stop and stop.search(b):
            break
        if is_head(b, heads):
            pages.append(cur)
            cur = {'body': [], 'fn': []}
            continue
        if fnstyle == 'num':
            m = re.match(r'^\((\d{1,2})\)\s+\S', b)
            if m:
                parts = re.split(r'(?:^|\s[—–-]\s+)\((\d{1,2})\)\s+', b)
                # parts: ['', n, text, n, text...]
                for i in range(1, len(parts) - 1, 2):
                    cur['fn'].append((parts[i], parts[i + 1].strip()))
                continue
        else:
            m = re.match(r'^(\*+|[†‡§|]+|[tJ])\s+(?=\S)', b)
            if m and (cur['body'] and len(b) < 1500 or not cur['body']):
                if m.group(1) in ('*', '**', '†', '‡', '§', '|', '||', 't', 'J'):
                    cur['fn'].append((m.group(1), b[m.end():].strip()))
                    continue
        cur['body'].append(b)
    pages.append(cur)
    out, notes, n = [], {}, 0
    for pg in pages:
        body = pg['body']
        for key, text in pg['fn']:
            n += 1
            ref = f'[^{n}]'
            notes[n] = text
            placed = False
            if fnstyle == 'num':
                pat = re.compile(r'\((?:' + re.escape(key) + r')\)')
            else:
                pat = re.compile(r'(?<=[\w.,;:!?"”»’\'])(?:\*+|[†‡§])' if key not in ('t', 'J') or True else '')
            for i, b in enumerate(body):
                mm = pat.search(b)
                if mm:
                    body[i] = b[:mm.start()] + ref + b[mm.end():]
                    placed = True
                    break
            if not placed and body:
                j = next((x for x in range(len(body)-1, -1, -1) if not body[x].startswith('@@')), len(body)-1)
                body[j] = body[j] + ref
            elif not placed:
                out.append(ref)
        out.extend(body)
    # merge paragraphs broken by page boundaries
    merged = []
    for p in out:
        if merged and not SENT_END.search(re.sub(r'\[\^\d+\]', '', merged[-1])) and p[:1].islower():
            merged[-1] += ' ' + p
        else:
            merged.append(p)
    return merged, notes


def fix_fr(s):
    s = re.sub(r'\bàme', 'âme', s)
    s = re.sub(r'\bàmes', 'âmes', s)
    s = s.replace('“', '«').replace('”', '»')
    s = re.sub(r'\s+([;:!?»])', r' \1', s)
    s = re.sub(r'«\s+', '« ', s)
    return s


def render(title, paras, notes, fix=lambda s: s, lead=None):
    t = [f'# {title}', '']
    if lead:
        t += [f'*{lead}*', '']
    t += [fix(p) for p in paras for p in (p, '')][:-1] if False else []
    for p in paras:
        t += [fix(p), '']
    for k in sorted(notes):
        t += [f'[^{k}]: {fix(notes[k])}', '']
    return '\n'.join(t).rstrip() + '\n'
