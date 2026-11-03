"""Thomas of Celano, The Lives of S. Francis of Assisi, translated by A. G. Ferrers Howell (London: Methuen, 1908;
archive.org livesofsfranciso00thom, with cu31924101858318 and livessfrancisas00howegoog as second witnesses)
-> francis-of-assisi-opera-omnia/vita-prima/en-US and vita-secunda/en-US, chapter for chapter beside the Latin.

First Life: preface -> cap-001; Part I ch. I-XXX -> cap-002..031; Part II ch. I-X -> cap-032..041; Part III, one
run of text in Howell, is cut at the Latin's section numbers into cap-042 (119-126), cap-043 (127-150) and cap-044 (151).
Second Life: preface -> cap-001; Part I ch. I-XVII -> cap-002..018; the introduction to Part II -> cap-019;
Part II ch. I-CLXVII -> cap-020..186. Howell has no Treatise of the Miracles.

Running heads ("THE SECOND LIFE OF S. FRANCIS", "HE FORETELLS FAMINE 197") are dropped; Howell's few footnotes are kept.
The drop capital of each chapter's first word is garbled in every scan ("~^OR", "T T OLY" with "A A" on the next
line); the first words are restored from the table OPEN (celano_howell_open.tsv, beside this script), read off the
three scans and checked against the Latin's first words.
usage: python3.13 celano_howell.py"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/_skipped/samples/livesofsfranciso00thom.txt'
OPENF = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'celano_howell_open.tsv')
FR = ROOT + '/content/books/francis-of-assisi-opera-omnia'
ROMV = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}


def rom(s):
    t = 0
    for i, c in enumerate(s):
        x = ROMV[c]
        t += -x if i + 1 < len(s) and ROMV[s[i + 1]] > x else x
    return t


def running(l):
    s = l.strip()
    if re.match(r"^(\S{1,4}\s+|[\dIilSOoQ ]{0,7}\s*)THE\s+(FIRST|SECOND)\s+LIFE\s+OF\s*-?S\.\s*FRANCIS\s*$", s):
        return True
    if re.match(r"^THE\s+(FIRST|SECOND)\s+LIFE\s+OF\s+S\.\s+FRANCIS\s+\S{1,4}$", s):
        return True
    # a headline in capitals ending (or starting) with the page number
    if re.fullmatch(r"[A-Z][A-Z'’,.\- ]{3,60}\s+[\dIilSOoQ]{1,4}", s) or re.fullmatch(r"[\dIilSOoQ]{1,4}\s+[A-Z][A-Z'’,.\- ]{3,60}", s):
        return not re.match(r"^(CHAPTER|PART)\b", s)
    return bool(re.fullmatch(r"[\dIilSO]{1,4}", s))


def keep_heading(book, h):
    """a heading in capitals inside a chapter: the Second Life's group headings (Of Poverty, Against Idleness) are kept;
    running heads whose page number the OCR garbled are not"""
    if re.search(r"\d|/", h[3:]) and not re.match(r"^OF .*\d$", h):
        return False
    if book == 'vita-prima':
        return h.startswith('TO THE PRAISE')
    return bool(re.match(r"^(OF|AGAINST|HOW HE WAS BEATEN)\b", h))


def blocks(lines):
    """lines -> pages of paragraphs: [(paragraphs, notes)]; a page ends at a running head"""
    pages, cur = [], []
    for l in lines:
        if running(l):
            pages.append(cur)
            cur = []
        else:
            cur.append(l)
    pages.append(cur)
    out = []
    for pg in pages:
        ps, b = [], []
        for l in pg + ['']:
            if l.strip():
                b.append(l.strip())
            elif b:
                ps.append(b)
                b = []
        notes = []
        while len(ps) > 1:
            last, prev = ' '.join(ps[-1]), ' '.join(ps[-2])
            if running(last):
                ps.pop()
                continue
            notelike = re.match(r"^\W{0,2}\S?\s*(a\.\s?d\.|Cf\.|See\b|I\.\s?e\.|Otherwise|Literally|Lit\.|Vulg|Ps\.|Gen\.|Matt\.|S\.\s+(Matt|Luke|John|Mark))", last) or re.search(r"\b(Cf\.|I\.e\.|a\.d\.)", last[:12])
            if re.match(r"^([1-9*†]\s+\S|[il]\s?[A-Z])", last) and len(last.split()) <= 90 and not re.match(r"^\d[\d ]*\.\s", last) or len(last.split()) <= 30 and notelike and not re.search(r"[.!?:\"”’)\]]\s*$", prev):
                blk = ps.pop()
                parts = re.split(r"\s+(?:■|[2-9])\s+(?=[A-Z\[])|\s+[2-9](?=a\.d\.)", ' '.join(blk))
                notes[0:0] = [[x] for x in parts]
            else:
                break
        out.append((ps, notes))
    return out


def chapters():
    L = []
    for l in open(SRC, errors='replace').read().split('\n'):
        # a running head the OCR ran onto the last line of a page
        m = re.match(r"^(.*\S)\s+(\S{1,4}\s+THE\s+(?:FIRST|SECOND)\s+LIFE\s+OF\s+S\.\s+FRANCIS)\s*$", l)
        if m and re.search(r"[a-z]", m.group(1)):
            L += [m.group(1), '', m.group(2)]
        else:
            L.append(l)
    i1 = next(i for i, l in enumerate(L) if re.match(r"^\s*THE\s+FIRST\s+LIFE\s+OF\s+S\.\s+FRANCIS\s*$", l))
    i2 = next(i for i, l in enumerate(L) if re.match(r"^\s*THE\s+SECOND\s+LIFE\s+OF\s+S\.\s+FRANCIS\s*$", l))
    iend = next(i for i, l in enumerate(L) if re.match(r"^\s*INDEX\s*$", l))
    out = []  # (book, cid, start line, end line)

    def heads(a, b):
        return [(i, rom(re.sub(r"\s", '', m.group(1)))) for i in range(a, b) for m in [re.match(r"^\s*\S{0,3}\s*CHAPTER\s+([IVXLC ]+?)\s*$", L[i])] if m]
    # first life
    p2 = next(i for i in range(i1, i2) if re.match(r"^\s*PART\s+II\s*$", L[i]))
    p3 = next(i for i in range(p2, i2) if re.match(r"^\s*PART\s+III\s*$", L[i]))
    h1 = heads(i1, p2)
    assert [n for _, n in h1] == list(range(1, 31)), [n for _, n in h1]
    out.append(('vita-prima', 'cap-001', i1 + 1, h1[0][0]))
    for k, (i, n) in enumerate(h1):
        out.append(('vita-prima', 'cap-%03d' % (n + 1), i, h1[k + 1][0] if k + 1 < len(h1) else p2))
    h2 = heads(p2, p3)
    assert [n for _, n in h2] == list(range(1, 11)), [n for _, n in h2]
    for k, (i, n) in enumerate(h2):
        out.append(('vita-prima', 'cap-%03d' % (n + 31), i, h2[k + 1][0] if k + 1 < len(h2) else p3))
    s127 = next(i for i in range(p3, i2) if re.match(r"^\s*127\.\s", L[i]))
    s151 = next(i for i in range(s127, i2) if re.match(r"^\s*151\.\s", L[i]))
    out += [('vita-prima', 'cap-042', p3, s127), ('vita-prima', 'cap-043', s127, s151), ('vita-prima', 'cap-044', s151, i2)]
    # second life
    intro = next(i for i in range(i2, iend) if re.match(r"^\s*INTRODUCTION\s+TO\s+THE\s+SECOND\s+PART", L[i]))
    h3 = heads(i2, intro)
    assert [n for _, n in h3] == list(range(1, 18)), [n for _, n in h3]
    out.append(('vita-secunda', 'cap-001', i2 + 1, h3[0][0]))
    for k, (i, n) in enumerate(h3):
        out.append(('vita-secunda', 'cap-%03d' % (n + 1), i, h3[k + 1][0] if k + 1 < len(h3) else intro))
    h4 = heads(intro, iend)
    nums = [n for _, n in h4]
    missing = [n for n in range(1, 168) if n not in nums]
    print('second life part II: missing chapter heads', missing)
    out.append(('vita-secunda', 'cap-019', intro, h4[0][0]))
    for k, (i, n) in enumerate(h4):
        out.append(('vita-secunda', 'cap-%03d' % (n + 19), i, h4[k + 1][0] if k + 1 < len(h4) else iend))
    return L, out


def first_para(L, a, b):
    """index of the first numbered paragraph line of a chapter segment"""
    for i in range(a, b):
        if re.match(r"^\s*\(?\d[\d ]{0,4}\)?[.,]\s+\S", L[i]) or re.match(r"^\s*[iIl]\.\s+\S", L[i]):
            return i
    return None


def latin_start(book, cid):
    t = open('%s/%s/la/%s.md' % (FR, book, cid)).read().split('\n\n')
    for p in t[1:]:
        p = re.sub(r"^\*\*\d+\.\*\*\s*|[¹²³⁴⁵⁶⁷⁸⁹⁰]+\s*", '', p.strip())
        if p and not p.startswith('*') and not re.match(r"^(Ad laudem|Incipit)", p):
            return ' '.join(p.split()[:4])
    return ''


def list_openings():
    L, chs = chapters()
    G = open(ROOT + '/research/sourcing/_skipped/samples/livessfrancisas00howegoog.txt', errors='replace').read()
    G = re.sub(r"\s+", ' ', G)
    for book, cid, a, b in chs:
        i = first_para(L, a, b)
        if i is None:
            print(book, cid, '| NO NUMBERED PARA')
            continue
        line = re.sub(r"\s+", ' ', L[i].strip())
        nxt = re.sub(r"\s+", ' ', L[i + 1].strip())
        # the same opening in the Google scan, found by the words after the drop capital
        words = [w for w in line.split()[1:] if re.fullmatch(r"[a-z]{3,}[,;]?", w)][:3]
        g = ''
        if len(words) >= 2:
            m = re.search(r"\d+[.,] ([^a-z]{0,25}?)\s*\S*\s*" + r"\s+".join(map(re.escape, words)), G)
            g = m.group(1) if m else ''
        print('%s\t%s\t%s\t||%s\t|G %s\t|LA %s' % (book[5:], cid, line[:55], nxt[:14], g, latin_start(book, cid)))


def load_open():
    out = {}
    for l in open(OPENF):
        f = l.rstrip('\n').split('\t')
        if len(f) >= 3:
            out[('vita-' + f[0], f[1])] = (f[2], int(f[3]) if len(f) > 3 and f[3] else None)
    return out


def is_word(t):
    t = re.sub(r"[^a-z]", '', t)
    return bool(t) and inW(t)


def fix_opening(lines, i, repl, num):
    """replace the garbled drop capital in lines[i] (and the stray marks it leaves on the next line)"""
    l = re.sub(r"\s+", ' ', lines[i].strip())
    m = re.match(r"^(\S{1,5}?|\S{1,3}\s\S{1,3}|\S\s\S\s\S)[.\-]\s+(.*)$", l)
    n, rest = (m.group(1), m.group(2)) if m else ('', l)
    toks = rest.split()
    k = 0
    def real(t):
        core = re.sub(r"[,.;:!?\"”’)]+$", '', t)
        return bool(re.fullmatch(r"[A-Z]?[a-z]{2,}[a-z'’\-]*|a|\[[a-z]+\]", core))
    while k < len(toks) and not (real(toks[k]) or toks[k] == 'I' and k + 1 < len(toks) and real(toks[k + 1])):
        k += 1
    if num is not None:
        n = str(num)
    else:
        n = re.sub(r"\s", '', n)
        n = n.replace('i', '1').replace('I', '1').replace('l', '1')
    rest = toks[k:]
    while rest and not re.search(r"[A-Za-z]", rest[-1]):
        rest = rest[:-1]
    lines[i] = ('%s. ' % n if n.isdigit() else '') + ' '.join([repl] + rest)
    # the capital's block can be read as a paragraph of its own: join it back
    while i + 1 < len(lines) and not lines[i + 1].strip() and i + 2 < len(lines) and re.match(r"^(\S{1,3}\s+){1,3}[a-z]", lines[i + 2].strip()) and not re.search(r"[.!?:]\s*$", lines[i]):
        del lines[i + 1]
    if i + 1 < len(lines):
        nt = lines[i + 1].split()
        j = 0
        def junk(t):
            a = re.sub(r"[^A-Za-z]", '', t)
            if t in ('I', 'O'):
                return not (len(nt) > 1 and re.search(r"[a-z]{2}", nt[1]))
            if not a:
                return True
            if a.islower():
                return len(a) <= 2 and not inW(a) or len(a) == 1
            return a.isupper() and len(a) <= 4 or not re.search(r"[a-z]{2}", a)
        while j < len(nt) and j < 3 and junk(nt[j]):
            j += 1
        lines[i + 1] = ' '.join(nt[j:])


def caps_line(t):
    a = [c for c in t if c.isalpha()]
    return len(a) >= 4 and sum(c.isupper() for c in a) >= 0.85 * len(a)


def title_case(t):
    small = {'of', 'the', 'and', 'to', 'in', 'on', 'for', 'at', 'a', 'an', 'by', 'from', 'with', 'his', 'he', 'that', 'or', 'how'}
    ws = t.lower().split()
    return ' '.join(w if i and w in small else w[:1].upper() + w[1:] for i, w in enumerate(ws)).replace(' s. ', ' S. ').replace('god', 'God')


def tidy(p):
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"\s+([,;:!?.])(?=\s|$|[\"'’”)])", r"\1", p)
    p = re.sub(r"(^|\s)\"\s+(?=\w)", r'\1"', p)
    p = re.sub(r"(?<=[\w.,;:!?])\s+\"(?=\s|$|[,.;:])", '"', p)
    p = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if inW(m.group(1) + m.group(2)) and not (inW(m.group(1)) and inW(m.group(2))) else m.group(0), p)
    p = re.sub(r"^\(?(\d)\s(\d)(?:\s(\d))?\)?\.\s", lambda m: ''.join(x for x in m.groups() if x) + '. ', p)
    p = re.sub(r"^\(?(\d{1,3})\)?\.\s+", r"**\1.** ", p)
    p = re.sub(r"(?<=[.!?\"”] )\((\d{1,3})\)\s", r"**\1.** ", p)
    p = p.replace('the)\'', 'they').replace("the)'", 'they')
    for a, b in (('to alb with', 'to all with'), ('Plosea', 'Hosea'), ('Per/.,', 'Perf.,'), ('Per/,,', 'Perf.,'), ('Per/.', 'Perf.'), ('ofTering', 'offering'), ('applied^to', 'applied to'), ('Bibliothcca', 'Bibliotheca'), ('Scripture^', 'Scripture;')):
        p = p.replace(a, b)
    return p


def compose(L, a, b, opening, cid, book):
    seg = L[a:b]
    # the chapter heading and the title lines before the first paragraph
    lines = [x for x in seg]
    title = ''
    k = 0
    OPENRX = re.compile(r"^\s*((?=\S*\d)\S{1,5}|\d \d{1,2}|\d \d \d|i|I|io|in|yy|I io)[.\-]\s+\S")
    heads = []
    if re.match(r"^\s*\S{0,3}\s*CHAPTER\b", lines[0]):
        idx = next((j for j in range(1, min(len(lines), 14)) if OPENRX.match(re.sub(r"\s+", ' ', lines[j]))), None)
        if idx is None:
            idx = next((j for j in range(1, min(len(lines), 14)) if re.match(r"^\s*\S{0,3}[A-Z]{4,}", lines[j]) and not caps_line(lines[j])), 1)
        tl = [x.strip() for x in lines[1:idx] if x.strip()]
        heads = [x for x in tl if caps_line(x)]
        title = re.sub(r"\s+", ' ', ' '.join(x for x in tl if not caps_line(x))).strip()
        title = re.sub(r"(?<=[a-z])1(?=\s)", '', re.sub(r"^flow ", 'How ', title)).replace('Francis1 ', "Francis' ").replace(' ; ', '; ').replace(' : ', ': ')
        body = lines[idx:]
    else:
        body = lines
        idx = next((j for j in range(0, min(len(lines), 14)) if OPENRX.match(lines[j])), None)
        if idx is not None and opening:
            fix_opening(body, idx, opening[0], opening[1])
            opening = None
    if opening:
        j0 = next((j for j, x in enumerate(body) if x.strip()), None)
        if j0 is not None:
            fix_opening(body, j0, opening[0], opening[1])
    pages = blocks(body)
    paras, notes = [], []
    for pi, (ps, ns) in enumerate(pages):
        start = len(paras)
        for j, p in enumerate(ps):
            t = join_lines(p)
            if paras and (t[:1].islower() or j == 0 and not re.search(r"[.!?:\"”’)\]]\s*$", paras[-1])):
                paras[-1] = join_lines([paras[-1], t])
                start -= 1
            else:
                paras.append(t)
        for n in ns:
            t = join_lines(n)
            mk = t[0]
            notes.append(re.sub(r"^(?:[1-9*†t■]|[il](?=\s?[A-Z]))\s*", '', t))
            k2 = len(notes) - 1
            rx = re.compile(r"(?<=[A-Za-z,.;:!?\"”’)])1(?=\s|$)|(?<=[,.;:!?\"”’)]) ?l(?=\s|$)|(?<=[a-z]) l(?=\s)" if mk == '1' else r"(?<=[A-Za-z,.;:!?\"”’)])\s?%s(?=\s|$)" % re.escape(mk))
            for j in range(max(0, start), len(paras)):
                m = rx.search(paras[j])
                if m:
                    paras[j] = paras[j][:m.start()] + '⟦%d⟧' % k2 + paras[j][m.end():]
                    break
            else:
                paras[-1] += '⟦%d⟧' % k2
    # headings in capitals: the part headings and the group headings of the Second Life
    out, carry = [], []
    for p in paras:
        if caps_line(p) and len(p) < 200:
            out.append(('h', p))
        else:
            out.append(('p', p))
    while out and out[-1][0] == 'h':
        carry.insert(0, out.pop()[1])
    return title, [('h', h) for h in heads] + out, notes, carry


def main():
    L, chs = chapters()
    OPEN = load_open()
    words = {}
    titles = {}
    carry = []
    for book, cid, a, b in chs:
        title, items, notes, nxt = compose(L, a, b, OPEN.get((book, cid)), cid, book)
        used = []

        def rep(m):
            used.append(tidy(notes[int(m.group(1))]))
            return '[^%d]' % len(used)
        body = []
        for h in carry:
            if keep_heading(book, h):
                body.append('*%s*' % title_case(h).rstrip('.') + '.' if h.startswith('TO THE PRAISE') else '## ' + title_case(re.sub(r"\d+$", '', h)))
        carry = nxt
        for kind, p in items:
            if kind == 'h':
                if not keep_heading(book, p):
                    continue
                body.append('*%s*' % title_case(p).rstrip('.') + '.' if p.startswith('TO THE PRAISE') else '## ' + title_case(re.sub(r"\d+$", '', p)))
            else:
                body.append(re.sub(r"\s?⟦(\d+)⟧", rep, tidy(p)))
        n = int(cid[4:])
        if cid == 'cap-001':
            h1 = 'Preface'
        elif book == 'vita-prima' and n <= 31:
            h1 = 'Chapter %s. %s' % (roman(n - 1), title.rstrip('.'))
        elif book == 'vita-prima' and n <= 41:
            h1 = 'Chapter %s. %s' % (roman(n - 31), title.rstrip('.'))
        elif book == 'vita-prima':
            h1 = {42: 'Part III. The Canonization of Blessed Francis', 43: 'The Miracles of Blessed Francis', 44: 'Conclusion'}[n]
        elif n <= 18:
            h1 = 'Chapter %s. %s' % (roman(n - 1), title.rstrip('.'))
        elif n == 19:
            h1 = 'Introduction to the Second Part'
        else:
            h1 = 'Chapter %s. %s' % (roman(n - 19), title.rstrip('.'))
        h1 = re.sub(r"\.\s*$", '', h1.strip())
        while body and body[-1].strip() in ('Conclusion', 'Conclusion.'):
            body.pop()
        md = '# %s\n\n%s\n' % (h1, '\n\n'.join(body))
        if used:
            md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, x) for i, x in enumerate(used)) + '\n'
        os.makedirs('%s/%s/en-US' % (FR, book), exist_ok=True)
        open('%s/%s/en-US/%s.md' % (FR, book, cid), 'w').write(md)
        words[book] = words.get(book, 0) + len(md.split())
        titles[(book, cid)] = h1
    print(words)
    meta(titles)
    return titles


GROUPS = {'vita-prima': {'pars-1': 'Preface', 'pars-2': 'Part I', 'pars-3': 'Part II', 'pars-4': 'Part III', 'pars-5': 'The Miracles', 'pars-6': 'Conclusion'},
          'vita-secunda': {'pars-1': 'Preface', 'pars-2': 'Part I', 'pars-3': 'Part II'}}


def meta(titles):
    for book in ('vita-prima', 'vita-secunda'):
        f = '%s/%s/book.json' % (FR, book)
        b = json.load(open(f))
        for g in b['toc']:
            g['title']['en-US'] = GROUPS[book][g['id']]
            for c in g.get('children', []):
                if (book, c['id']) in titles:
                    c['title']['en-US'] = titles[(book, c['id'])]
        if 'en-US' not in b['languages']:
            b['languages'].append('en-US')
        b.setdefault('editions', {})['en-US'] = {'translator': 'A. G. Ferrers Howell', 'year': 1908}
        b['sources'] = [x for x in b['sources'] if x['language'] != 'en-US'] + [{
            'language': 'en-US', 'url': 'https://archive.org/details/livesofsfranciso00thom',
            'edition': 'The Lives of S. Francis of Assisi by Brother Thomas of Celano, translated by A. G. Ferrers Howell (London: Methuen, 1908); archive.org livesofsfranciso00thom, with cu31924101858318 and livessfrancisas00howegoog.',
            'description': "Archive.org OCR cleaned by script, not proofread: running heads dropped, Howell's few footnotes kept, his section numbers as inert bold. "
                           "The drop capital of each chapter's first word, garbled in every scan, is restored by a table read off the scans and checked against the Latin. "
                           + ("Howell's Part III runs on without chapters; it is cut at the Latin's sections 127 and 151." if book == 'vita-prima' else
                              "Howell's group headings (Of Poverty, Of Humility ...) stand at the head of the chapter they introduce, as in the Latin."),
            'tier': 'A', 'tierEvidence': 'Printed 1908: public domain in the US.'}]
        b['arrived'] = dict(b.get('arrived') or {}, **{'en-US': '2026-11-03'})
        d = b['description'].get('en-US', '')
        if 'Howell' not in d:
            b['description']['en-US'] = (d.rstrip() + " The English is A. G. Ferrers Howell's (1908).").strip()
        json.dump(b, open(f, 'w'), ensure_ascii=False, indent=2)
        open(f, 'a').write('\n')


def roman(n):
    out = ''
    for v, s in ((100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            out += s
            n -= v
    return out


if __name__ == '__main__':
    main()
