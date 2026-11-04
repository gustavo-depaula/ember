"""Institutions liturgiques: eN.pkl (inst_extract.py) -> item stream [(kind, text, page)], notes {label: text}.
kinds: p paragraph, h caps heading. Footnote refs are [^label] with label 'pPAGE_K'."""
import re, sys, json, pickle, statistics
FREQ = json.load(open('/Users/gustavo/Documents/prayer/research/sourcing/gueranger/frfreq.json'))
MARK_START = re.compile(r'^\(\s*(?:\d{1,2}[a-z]?|[ilI|rtLj])\s*[)\]]\s*')
MARK_BODY = re.compile(r'\(\s*(?:\d{1,2}|[ilI|rtLj])\s*[)\]]')
FOLIO = re.compile(r'^(?:T\.?\s*[IVXl1]{1,3}\s*\d{0,3}|\d{1,3}|[IVXLC]{1,6})$')

def upper_ratio(s):
    a = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in a) / len(a) if a else 0

def is_caps(s):
    a = [c for c in s if c.isalpha()]
    return len(a) >= 3 and upper_ratio(s) > 0.82

def joinl(parts):
    s = ''
    for ln in parts:
        ln = re.sub(r'\s+', ' ', ln).strip()
        if not ln: continue
        if s.endswith('-') and not s.endswith(' -') and ln[:1].islower():
            a = re.search(r'([\wÀ-ÿ]+)-$', s)
            b = re.match(r'([\wÀ-ÿ]+)', ln)
            if a and b:
                j = (a.group(1) + b.group(1)).lower(); h = (a.group(1) + '-' + b.group(1)).lower()
                if FREQ.get(h, 0) > FREQ.get(j, 0) and FREQ.get(h, 0) > 2:
                    s = s + ln
                else:
                    s = s[:-1] + ln
                continue
        s = (s + ' ' + ln) if s else ln
    return s

def split_page(pg):
    B = pg['body']; H = pg['H']; W = pg['W']
    if not B: return [], [], False
    big = [l['h'] for l in B if l['n'] >= 7]
    ref = statistics.median(big) if big else statistics.median([l['h'] for l in B])
    # header
    if B and B[0]['y'] < 0.1 * H:
        t = B[0]['t'].strip()
        if len(t) < 100 and (re.search(r'(^|\s)\d{1,3}$|^\d{1,3}\s|(^|\s)[IVXLC]{1,6}$', t) or upper_ratio(t) > 0.6):
            B = B[1:]
    # folio at bottom
    while B and FOLIO.match(B[-1]['t'].strip().replace(' ', ' ')) and B[-1]['y'] > 0.8 * H:
        B = B[:-1]
    # footnotes: from the first marker line whose tail is set smaller than the body
    j = len(B)
    for k, l in enumerate(B):
        if l['y'] > 0.3 * H and MARK_START.match(l['t']):
            tail = [x['h'] for x in B[k:] if x['n'] > 2] or [l['h']]
            if statistics.mean(tail) < 0.93 * ref:
                j = k; break
    if j == len(B):  # a continued note: small lines at the foot with no marker
        k = len(B)
        while k > 0 and B[k - 1]['n'] > 2 and B[k - 1]['h'] < 0.88 * ref and B[k - 1]['y'] > 0.5 * H:
            k -= 1
        if len(B) - k >= 1: j = k
    notes = B[j:]
    body = B[:j]
    return body, notes, True

def build(tome, p0=0, p1=None):
    P = pickle.load(open('/Users/gustavo/Documents/prayer/research/sourcing/gueranger/inst/e%d.pkl' % tome, 'rb'))
    p1 = p1 or len(P)
    items, notes_all = [], {}
    cur = None  # open paragraph: dict(lines, page)
    pend_note = None  # last note label for continuation
    def flush():
        nonlocal cur
        if cur and cur['lines']:
            items.append(['p', joinl(cur['lines']), cur['page'], cur['labels']])
        cur = None
    for pi in range(p0, p1):
        pg = P[pi]
        body, notes, ok = split_page(pg)
        if not body and not notes: continue
        W = pg['W']
        xs = [l['x0'] for l in body if l['n'] >= 5]
        L = statistics.median(xs) if xs else pg['L']
        indent = 0.017 * W
        # footnote entries
        entries = []
        for l in notes:
            if MARK_START.match(l['t']) or not entries:
                entries.append([l['t']])
            else:
                entries[-1].append(l['t'])
        # continuation note (first entry without a marker) -> previous page's last note
        if entries and not MARK_START.match(entries[0][0]) and pend_note:
            notes_all[pend_note] += ' ' + joinl(entries[0]); entries = entries[1:]
        elif entries and not MARK_START.match(entries[0][0]):
            entries[0][0] = '(?) ' + entries[0][0]
        labels = ['p%d_%d' % (pi, k + 1) for k in range(len(entries))]
        for lab, e in zip(labels, entries):
            notes_all[lab] = joinl([MARK_START.sub('', e[0], count=1)] + e[1:])
        if labels: pend_note = labels[-1]
        # body paragraphs
        page_start = len(items)
        marker_i = 0
        first = True
        prev_l = None
        for l in body:
            t = l['t'].strip()
            if is_caps(t) and len(t) < 90 and (l['x0'] > L + 0.04 * W or l['n'] <= 3) and not re.match(r'^[IVXLC]+\.?$', t):
                flush(); items.append(['h', t, pi, []]); first = False; continue
            short_prev = prev_l is None or prev_l['x1'] < pg['R'] - 0.06 * W or re.search(r'[.!?:»;]\s*$', prev_l['t'])
            newp = (l['x0'] > L + indent) and bool(short_prev)
            prev_l = l
            if first and cur is None and items and items[-1][0] == 'p' and not newp and not FOLIO.match(t):
                # continue previous page's last paragraph
                prev = items.pop(); cur = {'lines': [prev[1]], 'page': prev[2], 'labels': prev[3]}
            elif newp or cur is None:
                flush(); cur = {'lines': [], 'page': pi, 'labels': []}
            first = False
            # markers in this line
            def sub(m):
                nonlocal marker_i
                if labels and marker_i < len(labels):
                    lab = labels[marker_i]; marker_i += 1
                    cur['labels'].append(lab)
                    return '[^%s]' % lab
                return m.group(0)
            cur['lines'].append(MARK_BODY.sub(sub, t))
        # unmatched notes -> hang on the last paragraph of the page
        if marker_i < len(labels):
            tgt = cur if cur else (items[-1] if items else None)
            for lab in labels[marker_i:]:
                if cur:
                    cur['lines'][-1] += ' [^%s]' % lab; cur['labels'].append(lab)
                elif items:
                    items[-1][1] += ' [^%s]' % lab; items[-1][3].append(lab)
    flush()
    return items, notes_all

if __name__ == '__main__':
    t, a, b = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
    items, notes = build(t, a, b)
    for k, tx, pg, lb in items:
        print('[%s p%d] %s' % (k, pg, tx))
        print()
    for k, v in notes.items(): print('NOTE', k, v)

RUNHEAD = re.compile(r'^(INSTITUTIONS?|LITURGIQ|LITURG|UTURG|DITURG|IITURG|LITURGLQ|INSTITUTION)', re.I)
def clean_items(items):
    out = []
    for it in items:
        k, t = it[0], it[1]
        if k == 'h':
            if RUNHEAD.match(t) and len(t) < 30: continue
            a = [c for c in t if c.isalpha()]
            if len(a) < 4: continue
            if re.search(r'\s\d{1,3}$', t) and len(t) > 14 and not t.startswith('CHAPITRE') and not t.startswith('NOTE'): continue
            if sum(c.isalpha() for c in t) < 0.6 * len(t): continue
        out.append(it)
    return out
