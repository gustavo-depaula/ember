"""Thomas a Kempis, Sermons to the Novices Regular, translated by Vincent Scully, C.R.L. (London: Kegan Paul, 1907;
archive.org SermonsToTheNovicesRegular, a Google scan) -> kempis-opera-omnia/sermones-ad-novicios/en-US, beside
Pohl's Latin (p1-01 ... p3-11), plus Thomas's prologue as an English-only chapter.

Read from the word-coordinate file. Per page: the running heads ("SERMONS TO THE", "NOVICES REGULAR"), page numbers
and the "Digitized by Google" stamp are dropped, and so are Scully's Scripture references in the margin, by position
(a word that starts right of the text column or ends left of it, as research/sourcing/_skipped/tools/sidenote_filter.py).
A paragraph starts at an indented line. Each sermon opens with a drop capital the OCR lost (or read as noise in the
first lines); the opening words are restored by the table OPEN below, checked against the Latin's first words and
the Douay text of the verse each sermon begins with.
usage: python3.13 kempis_novices_scully.py"""
import json, os, re, statistics, sys
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages  # noqa: E402
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
COORDS = ROOT + '/research/sourcing/_skipped/coords/SermonsToTheNovicesRegular_djvu.xml'
BOOK = ROOT + '/content/books/kempis-opera-omnia/sermones-ad-novicios'
# sermon -> (what the OCR gives at the start, the opening as printed)
OPEN = {
    1: ('EHOLD', 'Behold'), 2: ('BROTHER', 'A brother'), 3: ('SK', 'Ask'), 4: ('HERE', 'Where'), 5: ('AY', 'Say'),
    6: ('pMON, steepest', 'Simon, sleepest'), 7: ('GOOD', 'A good'), 8: ('O', 'So'), 9: ('O', 'Do'), 10: ('ANY', 'Many'),
    11: ('EC A USE', 'Because'), 12: ('HE', 'The'), 13: ('ITH', 'With'), 14: ('TAND', 'Stand'), 15: ('JEE bow', 'See how'),
    16: ('E', 'Be'), 17: ('E', 'He'), 18: ('HEN', 'When'), 19: ('flesh', 'The flesh'), 20: ('OD', 'God'),
    21: ('HERE', 'There'), 22: ('Y', 'My'), 23: ('memory', 'My memory'), 24: ('YIELDED', 'I yielded'), 25: ('ANY', 'Many'),
    26: ('HE', 'The'), 27: ('ND', 'And'), 28: ('Y bouse', 'My house'), 29: ('HEY', 'They'), 30: ('OLINESS', 'Holiness'),
}
ROM = {'I': 1, 'V': 5, 'X': 10, 'L': 50}
JUNK = re.compile(r"^(Digitized|by|Google|y|Google)$")


def rom(s):
    t = 0
    for i, c in enumerate(s):
        x = ROM[c]
        t += -x if i + 1 < len(s) and ROM[s[i + 1]] > x else x
    return t


def page_lines(p):
    """lines in the text column, without marginal references, running head, page number and stamp"""
    ls = [l for par in p for l in par]
    ls = [l for l in ls if not re.search(r"Digitized|Google$", l['text'])]
    long = [l for l in ls if len(l['words']) >= 5]
    if len(long) < 5:
        return ls
    right = statistics.median(l['x1'] for l in long)
    left = statistics.median(l['x0'] for l in long)
    out = []
    for l in ls:
        ws = [(c, w) for c, w in l['words'] if not (c[0] >= right + 6 or c[2] <= left - 6)]
        if not ws:
            continue
        out.append(dict(l, words=ws, x0=ws[0][0][0], x1=ws[-1][0][2], text=' '.join(w for c, w in ws)))
    if out and re.fullmatch(r"(SERMONS TO THE|NOVICES REGULAR|SERMONS TO THE NOVICES(?: REGULAR)?|INTRODUCTION|PREFACE)", out[0]['text'].strip()):
        out = out[1:]
    out = [l for k, l in enumerate(out) if not (k < 3 and re.fullmatch(r"[\d ]{1,7}(?:\s+\w)?", l['text'].strip()) and len(re.sub(r"\D", '', l['text'])) >= 2)]
    while out and (re.fullmatch(r"[\dxivlcSO.,'°]{1,6}", out[-1]['text'].strip()) or len(out[-1]['text'].strip()) <= 4 and out[-1]['x0'] - left > 300):
        out = out[:-1]
    # the translator's notes: trailing lines in smaller type, the first numbered
    H = statistics.median(l['h'] for l in out) if out else 0
    k = None
    for i in range(len(out) - 1, max(-1, len(out) - 8), -1):
        if re.match(r"^[1-9]\s+\S", out[i]['text']) and len(re.findall(r"[A-Za-z]{2,}", out[i]['text'])) >= 1 and all(x['h'] < 0.9 * H or re.match(r"^[1-9]\s", x['text']) for x in out[i:]) and i > 0:
            k = i
    if k is not None:
        notes, body = out[k:], out[:k]
        items = []
        for l in notes:
            m = re.match(r"^([1-9])\s+(.*)$", l['text'])
            if m:
                items.append([m.group(1), m.group(2)])
            else:
                items[-1][1] += ' ' + l['text']
        for mk, txt in items:
            NOTES.append(re.sub(r"—\s*T\s?r\.$", '— Tr.', re.sub(r"\s+", ' ', txt).strip()))
            for l in body:
                t2 = re.sub(r"(?<=[a-z,.;:!?”’])\s?%s(?=\s|$)" % mk, '⟦%d⟧' % (len(NOTES) - 1), l['text'], count=1)
                if t2 != l['text']:
                    l['text'] = t2
                    break
            else:
                body[-1]['text'] += '⟦%d⟧' % (len(NOTES) - 1)
        out = body
    return out


NOTES = []


def render(title, ps):
    used = []

    def rep(m):
        used.append(tidy(NOTES[int(m.group(1))]).replace('ioo days*', "100 days'"))
        return '[^%d]' % len(used)
    # a note the page split missed, left as a paragraph ("1 “Sermo in Dominica ...” — Tr.")
    for i in range(len(ps) - 1, 0, -1):
        m = re.fullmatch(r"([1-9]) (.+—\s?Tr\.)", ps[i])
        if m:
            NOTES.append(m.group(2))
            mk = '⟦%d⟧' % (len(NOTES) - 1)
            prev = re.sub(r"(?<=[a-z,.;:”’>])\s?%s(?=\s)" % m.group(1), mk, ps[i - 1], count=1)
            ps[i - 1] = prev if prev != ps[i - 1] else ps[i - 1] + mk
            del ps[i]
    ps = [re.sub(r"\s?⟦(\d+)⟧", rep, p) for p in ps]
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
    if used:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, n) for i, n in enumerate(used)) + '\n'
    return md


def tidy(p):
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"^\d\*\s+", '', p)
    p = p.replace('&apos;', "'").replace('&amp;', '&').replace('&quot;', '"')
    p = re.sub(r"\s+([,;:!?.])(?=\s|$|[\"'’”)])", r"\1", p)
    p = re.sub(r"([“‘(])\s+", r"\1", p)
    p = re.sub(r"\s+([”’)])", r"\1", p)
    p = re.sub(r"\b(\w+) ?- (\w+)", lambda m: m.group(1) + m.group(2) if inW(m.group(1) + m.group(2)) else m.group(0), p)  # a hyphen the line join left: "ga - thered"
    p = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if inW(m.group(1) + m.group(2)) and not (inW(m.group(1)) and inW(m.group(2))) else m.group(0), p)
    # OCR misreadings of this scan (h read as b, ll as U)
    for a, b in (('bringetb', 'bringeth'), ('saitb', 'saith'), ('tbe', 'the'), ('bis ', 'his '), ('becometb', 'becometh'), ('dweU', 'dwell'), (' nis ', ' his '),
                 ('aboundin ', 'abound in '), ('bath ', 'hath '), ('leard', 'heard'), ('th ew ', 'the new ')):
        p = p.replace(a, b)
    p = re.sub(r"\b([a-z]+)b\b", lambda m: m.group(1) + 'h' if not inW(m.group(0)) and inW(m.group(1) + 'h') else m.group(0), p)
    p = re.sub(r"\b(\w+) ?- (\w+)", lambda m: m.group(1) + m.group(2) if inW(m.group(1) + m.group(2)) else m.group(0), p)
    return p


def centred(l):
    return l['x0'] - l['_left'] > 200 and l['_right'] - l['x1'] > 200 and len(l['words']) <= 9 and not re.search(r"[.:;,]\s*$", l['text'])


def paragraphs(lines):
    """-> paragraphs; a centred short line is the heading of an example ("Another", "An Example of Two Brethren")"""
    paras, kinds = [], []
    for i, l in enumerate(lines):
        if centred(l) and not l.get('_block') and (not re.search(r"[A-Za-z]{3}", l['text']) or re.search(r"(?i)novices regular|sermons to the|google", l['text'])):
            continue  # a page number or running head the column filter left
        if centred(l) and not l.get('_block'):
            if kinds and kinds[-1] == 'h' and i and centred(lines[i - 1]):
                paras[-1].append(l['text'])
            else:
                paras.append([l['text']])
                kinds.append('h')
            continue
        new = l['x0'] - l['_left'] > 45 and (i == 0 or re.search(r"[.!?:”\"’]\s*$", lines[i - 1]['text']))
        if (l.get('_cont') or l.get('_block')) and paras and kinds[-1] == 'p':
            new = False
        if paras and kinds[-1] == 'p' and not new:
            paras[-1].append(l['text'])
        else:
            paras.append([l['text']])
            kinds.append('p')
    out = []
    for p, k in zip(paras, kinds):
        t = tidy(join_lines(p))
        if k == 'h':
            t = re.sub(r"^[^\w⟦]+", '', t)
            t = re.sub(r"[^\w⟧]*\d?$", '', t)
            t = '### ' + title_case(t) if t.isupper() or sum(c.isupper() for c in t) > len(t) / 3 else '### ' + t
            t = re.sub(r"(?<=\s)([a-z]+)$", lambda m: m.group(1), t)
        if k == 'h' and out and len(out[-1].split()) < 9 and not re.search(r"[.!?:;,”\"]$", out[-1]) and not out[-1].startswith('#'):
            t = '### ' + re.sub(r"^\W*[a-z]?\s+(?=[A-Z])", '', out.pop()) + ' ' + t[4:].lower()  # a two-line heading set in two sizes
        out.append(t)
    return out


def title_case(t):
    small = {'of', 'the', 'and', 'to', 'in', 'on', 'for', 'at', 'a', 'an', 'by', 'from', 'with', 'is', 'be', 'that', 'his', 'her', 'all', 'where', 'shall', 'us', 'this'}
    ws = t.split()
    out = []
    for i, w in enumerate(ws):
        core = w.lower()
        out.append(core if i and core.strip(':.,') in small else core[:1].upper() + core[1:])
    return ' '.join(out).replace('Aones', 'Agnes').replace(' his ', ' His ').replace('jesus', 'Jesus').replace('mary', 'Mary').replace('agnes', 'Agnes').replace('god', 'God').replace('st.', 'St.').replace('virgin', 'Virgin')


def main():
    P = pages(COORDS)
    stream = []  # (page, line)
    for pi, p in enumerate(P):
        ls = page_lines(p)
        if not ls:
            continue
        lft = statistics.median(l['x0'] for l in ls if len(l['words']) >= 5) if sum(len(l['words']) >= 5 for l in ls) >= 5 else min(l['x0'] for l in ls)
        rgt = statistics.median(l['x1'] for l in ls if len(l['words']) >= 5) if sum(len(l['words']) >= 5 for l in ls) >= 5 else max(l['x1'] for l in ls)
        for j, l in enumerate(ls):
            l['_left'] = lft
            l['_right'] = rgt
            l['_cont'] = j == 0  # a page's first line continues the paragraph unless indented
            if j == 0 and l['x0'] - lft > 45:
                l['_cont'] = False
            stream.append((pi, l))
    texts = [l['text'].strip() for _, l in stream]
    starts = [i for i, t in enumerate(texts) if re.fullmatch(r"SERMON ([IVXL]+)", t)]
    assert len(starts) == 30, len(starts)
    prologue = next(i for i, t in enumerate(texts) if t == 'PROLOGUE')
    table = next(i for i, t in enumerate(texts) if t.startswith('The Sermons of the First Part'))
    end_tab = next(i for i, t in enumerate(texts) if t.startswith('The End of the Chapters'))
    end = max(i for i, t in enumerate(texts) if t.startswith('CHISWICK PRESS'))
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    words = 0
    # the prologue: the letter to the brethren, then (after the table of sermons) the note on the three parts
    pend = min(i for i in range(end_tab, starts[0]) if texts[i].startswith('SERMONS TO THE NOVICES') or texts[i] == 'PART I')
    body = [l for _, l in stream[prologue + 4:table]] + [l for _, l in stream[end_tab + 1:pend]]
    for l in body[1:6]:
        if l['x0'] - l['_left'] > 150:
            l['_block'] = True
    ps = paragraphs(body)
    ps[0] = re.sub(r"^\S*0 the beloved", 'To the beloved', ps[0])
    md = render('Prologue', ps)
    open(BOOK + '/en-US/prologue.md', 'w').write(md)
    words += len(md.split())
    titles = {}
    for k, a in enumerate(starts):
        n = k + 1
        assert rom(texts[a][7:]) == n
        b = starts[k + 1] if k + 1 < len(starts) else end
        seg = stream[a + 1:b]
        # drop the part heading that precedes the next part's first sermon
        while seg and re.fullmatch(r"(SERMONS TO THE NOVICES|PART [IV]+|NOVICES REGULAR)", seg[-1][1]['text'].strip()):
            seg = seg[:-1]
        # title: the lines before the indented opening (the drop capital's block)
        tl = []
        i = 0
        while i < len(seg):
            l = seg[i][1]
            if tl and re.sub(r"^[|\s]+", '', l['text']).startswith(OPEN[n][0]):
                break
            tl.append(l['text'])
            i += 1
        title_raw = re.sub(r"^.{0,6}?(?=O[fpnF] )", '', ' '.join(tl)).strip()
        title_raw = re.sub(r"^Op ", 'Of ', title_raw)
        title_raw = re.sub(r"\s*\(K\s*", ' | ', title_raw)
        title_raw = re.sub(r"\s+Of the Five", ': Of the Five', title_raw)
        title_raw = title_raw.rstrip('.')
        parts = [title_case(x.strip()) for x in title_raw.split(' | ')]
        rest = [l for _, l in seg[i:]]
        # the drop capital's block: indented lines at the start; noise left of the indented text is the capital itself
        if rest:
            ind = rest[0]['x0']
            for l in rest[:4]:
                if l['x0'] < ind - 40 and l['words'][0][0][2] < ind - 20 and not inW(l['words'][0][1]):
                    ws = [x for x in l['words'] if x[0][2] >= ind - 20]
                    l.update(words=ws, x0=ws[0][0][0], text=' '.join(w for c, w in ws))
                l['_block'] = l is not rest[0]
            rest[0]['text'] = re.sub(r"^[|\s]+", '', rest[0]['text'])
        ps = paragraphs(rest)
        got, want = OPEN[n]
        assert ps[0].startswith(got), (n, ps[0][:40])
        ps[0] = want + ps[0][len(got):]
        if len(parts) == 2:  # St Agnes: the feast, then the sermon's own title
            title = 'Sermon %s. %s' % (texts[a][7:], parts[1])
            ps = ['*%s*' % parts[0]] + ps
        else:
            title = 'Sermon %s. %s' % (texts[a][7:], parts[0])
        title = title.replace('Agnes, virgin', 'Agnes, Virgin').replace('Blessed Agnes', 'Blessed Agnes')
        cid = 'p1-%02d' % n if n <= 9 else ('p2-%02d' % (n - 9) if n <= 19 else 'p3-%02d' % (n - 19))
        md = render(title, ps)
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
        words += len(md.split())
        titles[cid] = title
        print(cid, title, len(md.split()))
    print('words', words)
    book = json.load(open(BOOK + '/book.json'))
    for g in book['toc']:
        if 'children' not in g:
            continue
        g['title']['en-US'] = {'part-1': 'Part I', 'part-2': 'Part II', 'part-3': 'Part III'}[g['id']]
        for c in g['children']:
            c['title']['en-US'] = titles[c['id']]
    if book['toc'][0]['id'] != 'prologue':
        book['toc'].insert(0, {'id': 'prologue', 'title': {'en-US': 'Prologue'}})
    book['languages'] = ['la', 'en-US']
    book['editions']['en-US'] = {'translator': 'Vincent Scully, C.R.L.', 'year': 1907}
    book['description']['en-US'] = book['description']['en-US'].replace(
        " Scully's 1907 English translation (Kegan Paul) is not yet imported.",
        " The English is Vincent Scully's (London: Kegan Paul, 1907), with Thomas's prologue, which the Latin here lacks.")
    book['sources'] = [x for x in book['sources'] if x['language'] != 'en-US'] + [{
        'language': 'en-US', 'url': 'https://archive.org/details/SermonsToTheNovicesRegular',
        'edition': 'Sermons to the Novices Regular, by Thomas à Kempis, translated by Vincent Scully, C.R.L. (London: Kegan Paul, Trench, Trübner & Co., 1907); archive.org SermonsToTheNovicesRegular (Google scan).',
        'description': "Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread: running heads, page numbers and the scanner's stamp dropped, "
                       "and the translator's Scripture references in the margin dropped by their position. The drop capital that opens each sermon, lost in the OCR, is restored. "
                       "Thomas's prologue and the note on the three parts are an English-only chapter; Scully's introduction and the table of sermons are not imported.",
        'tier': 'A', 'tierEvidence': 'Printed 1907: public domain in the US.'}]
    book['arrived'] = dict(book.get('arrived') or {}, **{'en-US': '2026-11-03'})
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
