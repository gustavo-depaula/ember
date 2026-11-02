"""Add the catholic-saints.net English (Jazzybee ebook OCR) beside Bridget's Latin books.
Usage: bridget_en.py   (rewrites en-US/ in books 1-8, extravagantes, sermo, orationes; updates book.json)"""
import re, os, json, sys

SRC = '/Users/gustavo/Documents/prayer/research/sourcing/bridget-of-sweden/en/prophecies.txt'
ROOT = '/Users/gustavo/Documents/prayer/content/books/bridget-of-sweden-opera-omnia'
L = open(SRC, encoding='utf-8', errors='replace').read().splitlines()
START = [i for i, l in enumerate(L) if l.strip() == 'Book 1'][1]

BOOKHEAD = re.compile(r'^\s*Book (\d+)\b.{0,40}$')
heads = []
for i in range(START, len(L)):
    m = BOOKHEAD.match(L[i])
    if m and not L[i].strip().startswith('Book 6, Chapter'):
        heads.append((int(m.group(1)), i))
REGION = {}
for k, (b, i) in enumerate(heads):
    j = heads[k + 1][1] if k + 1 < len(heads) else len(L)
    REGION[b] = (i + 1, j)

TERM = re.compile(r'[.!?:"”’\')\]*]\s*$')
HEAD = re.compile(r'^(Chapter (\d+)|Prologue|Proem|Interrogation (\d+)|Revelation (\d+)|Prayer (\d+))\s*$')
SUB = {'EXPLANATION': 'Explanation', 'ADDITION': 'Addition', 'ADDENDUM': 'Addendum'}


def blocks(lo, hi):
    out, cur = [], []
    for l in L[lo:hi]:
        if HEAD.match(l.strip()):
            if cur:
                out.append(cur); cur = []
            out.append([l.strip()])
        elif l.strip():
            cur.append(l.strip())
        elif cur:
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    res = []
    for b in cur_join(out):
        res.append(b)
    return res


def cur_join(bl):
    out = []
    for b in bl:
        t = ''
        for ln in b:
            if t.endswith('-') and len(t) > 1 and t[-2].isalpha():
                t = t[:-1] + ln if not ln[:1].isupper() else t + ln
            else:
                t = (t + ' ' + ln).strip()
        out.append(t)
    # merge page-break splits: previous block lacks terminal punctuation and is not a heading
    merged = []
    for t in out:
        if merged and not HEAD.match(merged[-1]) and merged[-1] not in SUB and not HEAD.match(t) and t not in SUB \
           and not TERM.search(merged[-1]):
            merged[-1] = merged[-1] + ' ' + t
        else:
            merged.append(t)
    return merged


def clean(t):
    t = re.sub(r'\s+', ' ', t.replace('*', '')).strip()
    t = re.sub(r'\bIam\b', 'I am', t)
    t = re.sub(r'(?<![A-Za-z])T (am|have|will|shall|was|say|know|see|tell|saw|wish|desire|myself|give|made|do|did|would|came|beg|ask|answer)\b', r'I \1', t)
    t = re.sub(r'(?<![A-Za-z])\[(am|have|ask|had|was|will|shall|say|know|see|tell|saw|wish|desire|give|beg|answer|do|did|would|came|also|humbly|in|to)\b', r'I \1', t)
    t = re.sub(r'\bI\[f\b', 'If', t)
    return t


def parse_numbered(book):
    """-> {n: (rubric, [body])} for 'Chapter N' headed books"""
    lo, hi = REGION[book]
    bl = blocks(lo, hi)
    chaps, order = {}, []
    idx = [i for i, t in enumerate(bl) if re.fullmatch(r'Chapter \d+', t)]
    for k, i in enumerate(idx):
        n = int(bl[i].split()[1])
        nxt = idx[k + 1] if k + 1 < len(idx) else len(bl)
        # body = blocks after the heading up to the next chapter's rubric (last block before next heading)
        end = nxt - 1 if k + 1 < len(idx) else nxt
        body = bl[i + 1:end]
        rubric = bl[i - 1] if i > 0 and not HEAD.match(bl[i - 1]) and (k > 0 or True) else ''
        chaps[n] = [rubric, body]
        order.append(n)
    return chaps


def md_body(body):
    out = []
    # the ebook appends a polemical footnote on Natural Family Planning to Book I ch. 26; it is not Bridget's text
    for k, t in enumerate(body):
        if re.match(r'^\[\d+\] Natural Family Planning', t):
            body = body[:k]
            break
    notes = []
    for t in body:
        m = re.match(r'^\[(\d+)\] (.*)$', t)
        if m:
            notes.append('[^%s]: %s' % (m.group(1), clean(m.group(2))))
    body = [re.sub(r'\[(\d+)\]', r'[^\1]', t) for t in body if not re.match(r'^\[\d+\] ', t)]
    for t in body:
        if t in SUB:
            out.append('## ' + SUB[t])
        else:
            out.append(clean(t))
    return '\n\n'.join(out + notes)


def write_chapter(path, title, rubric, body):
    parts = ['# ' + title, '']
    if rubric:
        parts += ['*' + clean(rubric) + '*', '']
    parts += [md_body(body)]
    open(path, 'w', encoding='utf-8').write('\n'.join(parts).rstrip() + '\n')


def update_book(slug, files, extra_desc):
    d = os.path.join(ROOT, slug)
    bj = os.path.join(d, 'book.json')
    b = json.load(open(bj, encoding='utf-8'))
    if 'en-US' not in b['languages']:
        b['languages'].append('en-US')
    b['editions']['en-US'] = {'translator': 'Anonymous (catholic-saints.net)', 'year': 2013}
    src = {'language': 'en-US', 'url': 'https://archive.org/details/the-prophecies-and-revelations-of-saint-bridget-of-sweden',
           'edition': 'The Prophecies and Revelations of Saint Bridget of Sweden, texts from www.Catholic-Saints.net (Jazzybee Verlag, 2013); translator not named.',
           'description': 'OCR of the ebook text, paragraphs rejoined across page breaks and line-end hyphens closed; each chapter keeps its rubric in italics. ' + extra_desc,
           'tier': 'B', 'tierEvidence': 'Distributed freely online under a Creative Commons Attribution-ShareAlike licence.'}
    b['sources'] = [s for s in b['sources'] if s['language'] != 'en-US'] + [src]
    for node in b['toc']:
        cid = node['id']
        if cid in files:
            node['title']['en-US'] = files[cid]
        else:
            node['title'].pop('en-US', None)
    json.dump(b, open(bj, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    open(bj, 'a').write('\n')


def do_numbered(book, slug, extra=''):
    chaps = parse_numbered(book)
    d = os.path.join(ROOT, slug)
    os.makedirs(os.path.join(d, 'en-US'), exist_ok=True)
    latin = {f for f in os.listdir(os.path.join(d, 'la'))}
    files = {}
    for n, (rub, body) in sorted(chaps.items()):
        cid = 'c%03d' % n
        if cid + '.md' not in latin:
            print('  no Latin chapter for', slug, n)
            continue
        write_chapter(os.path.join(d, 'en-US', cid + '.md'), 'Chapter %d' % n, rub, body)
        files[cid] = 'Chapter %d' % n
    update_book(slug, files, extra)
    words = sum(len(open(os.path.join(d, 'en-US', f)).read().split()) for f in os.listdir(os.path.join(d, 'en-US')))
    print(slug, len(files), 'chapters', words, 'words')


def finish(slug, files):
    d = os.path.join(ROOT, slug)
    update_book(slug, files, '')
    words = sum(len(open(os.path.join(d, 'en-US', f)).read().split()) for f in os.listdir(os.path.join(d, 'en-US')))
    print(slug, len(files), 'chapters', words, 'words')


def outdir(slug):
    d = os.path.join(ROOT, slug, 'en-US')
    os.makedirs(d, exist_ok=True)
    for f in os.listdir(d):
        os.remove(os.path.join(d, f))
    return d


def do_labelled(book, slug, labelmap=None):
    chaps = parse_numbered(book)
    d = outdir(slug)
    # Latin file by chapter label
    byl = {}
    for f in os.listdir(os.path.join(ROOT, slug, 'la')):
        h = open(os.path.join(ROOT, slug, 'la', f), encoding='utf-8').readline().strip()
        byl[h.replace('# Caput ', '')] = f[:-3]
    files = {}
    for n, (rub, body) in sorted(chaps.items()):
        label = (labelmap or {}).get(n, str(n))
        cid = byl.get(label)
        if not cid:
            print('  no Latin chapter for', slug, n); continue
        write_chapter(os.path.join(d, cid + '.md'), 'Chapter %d' % n, rub, body)
        files[cid] = 'Chapter %d' % n
    finish(slug, files)


def do_sermo():
    lo, hi = REGION[11]
    bl = blocks(lo, hi)
    d = outdir('sermo-angelicus')
    idx = [i for i, t in enumerate(bl) if re.fullmatch(r'Chapter \d+', t)]
    files = {}
    for k, i in enumerate(idx):
        n = int(bl[i].split()[1])
        end = idx[k + 1] if k + 1 < len(idx) else len(bl)
        cid = 'c%03d' % n
        write_chapter(os.path.join(d, cid + '.md'), 'Chapter %d' % n, '', bl[i + 1:end])
        files[cid] = 'Chapter %d' % n
    if idx[0] > 0:
        write_chapter(os.path.join(d, 'prologus.md'), 'Prologue', '', bl[:idx[0]])
        files['prologus'] = 'Prologue'
    finish('sermo-angelicus', files)


def do_orationes():
    lo, hi = REGION[12]
    bl = blocks(lo, hi)
    d = outdir('quattuor-orationes')
    pi = [i for i, t in enumerate(bl) if re.fullmatch(r'Prayer \d', t)]
    files = {}
    write_chapter(os.path.join(d, 'prohemium.md'), 'Proem', bl[1], bl[2:pi[0] - 1])
    files['prohemium'] = 'Proem'
    for k, i in enumerate(pi):
        end = pi[k + 1] - 1 if k + 1 < len(pi) else len(bl)
        cid = 'oracio-%d' % (k + 1)
        write_chapter(os.path.join(d, cid + '.md'), 'Prayer %d' % (k + 1), bl[i - 1], bl[i + 1:end])
        files[cid] = 'Prayer %d' % (k + 1)
    finish('quattuor-orationes', files)


def do_book5():
    lo, hi = REGION[5]
    bl = blocks(lo, hi)
    d = outdir('revelationes-5')
    hs = [i for i, t in enumerate(bl) if re.fullmatch(r'(Interrogation|Revelation) \d+', t)]
    files = {}
    write_chapter(os.path.join(d, 'prologus.md'), 'Prologue', '', bl[1:hs[0]])
    files['prologus'] = 'Prologue'
    for k, i in enumerate(hs):
        nxt = hs[k + 1] if k + 1 < len(hs) else len(bl)
        end = nxt - 1 if bl[nxt - 1:nxt] and nxt < len(bl) and bl[nxt].startswith('Revelation') else nxt
        rub = ''
        cid = 'c%03d' % (k + 1)
        write_chapter(os.path.join(d, cid + '.md'), bl[i], '', bl[i + 1:end])
        files[cid] = bl[i]
        # a revelation's rubric is the block before its heading
        if bl[i].startswith('Revelation'):
            write_chapter(os.path.join(d, cid + '.md'), bl[i], bl[i - 1], bl[i + 1:end])
    finish('revelationes-5', files)


if __name__ == '__main__':
    for b in sys.argv[1:]:
        if b in list('1234567') and b != '5' and b != '6':
            do_numbered(int(b), 'revelationes-' + b)
        elif b == '5':
            do_book5()
        elif b == '6':
            do_labelled(6, 'revelationes-6')
        elif b == '8':
            do_labelled(8, 'revelationes-8')
        elif b == '9':
            do_labelled(9, 'revelaciones-extravagantes', {49: '49a'})
        elif b == '11':
            do_sermo()
        elif b == '12':
            do_orationes()
