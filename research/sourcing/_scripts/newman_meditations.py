"""Convert the saved Newman Reader pages of Meditations and Devotions into chapter markdown.
usage: newman_meditations.py NR_HTML_DIR OUT_DIR   (writes OUT_DIR/en-US/*.md and chapters.json)"""
import re, hashlib, html, sys, os, json

SRC, OUT = sys.argv[1], sys.argv[2]
BASE = 'https://www.newmanreader.org/works/meditations/meditations%d.html'

def load(n):
    t = open(os.path.join(SRC, hashlib.md5((BASE % n).encode()).hexdigest() + '.html'), 'rb').read()
    try: s = t.decode('utf-8')
    except UnicodeDecodeError: s = t.decode('cp1252')
    return s[s.find('<body'):]

def inline(h, para=True):
    h = re.sub(r'<font[^>]*><b>\[</b></font>.*?NR\]</b></font>', '', h, flags=re.S)  # NR editorial remarks
    h = re.sub(r'\[<a name="return(\d+)"[^>]*>Notes?\s*\d*</a>\]', lambda m: '\x00%s\x01' % m.group(1), h)
    h = re.sub(r'<a href="#return\d+">Return to text</a>', '', h)
    h = re.sub(r'<a name="[^"]*"></a>', '', h)
    h = re.sub(r'<br\s*/?>', '\x02', h)
    h = re.sub(r'<(?!/?(?:i|em|b)\b)[^>]+>', '', h)
    def split_ital(m):
        segs = re.split(r'(\s*\x02\s*)', m.group(2))
        return ''.join('<i>%s</i>' % x if i % 2 == 0 and x.strip() else x for i, x in enumerate(segs))
    h = re.sub(r'<(i|em)>(.*?)</\1>', split_ital, h, flags=re.S)
    h = re.sub(r'(?:&nbsp;|\xa0){3,}\s*', ' \x03 ', h)
    h = re.sub(r'<(i|em)>(\s*\x02\s*)</\1>', r'\2', h)
    h = re.sub(r'<(i|em)>\s*</\1>', ' ', h)
    h = re.sub(r'<(i|em)>(\s*)', r'\2*', h); h = re.sub(r'(\s*)</(i|em)>', r'*\1', h)
    h = re.sub(r'<b>', '**', h); h = re.sub(r'</b>', '**', h)
    h = html.unescape(h).replace('\xa0', ' ')
    h = re.sub(r'(?<=\S)\{\d+\}(?=\S)', '', h)
    h = re.sub(r'\s*\{\d+\}\s*', ' ', h)
    h = re.sub(r'(^|\x02)\s*\x03\s*', r'\1', h)
    h = h.replace('\x03', '\u2014')
    h = re.sub(r'\s*\x02\s*', '\x02', h)
    h = re.sub(r'[ \t\r\n]+', ' ', h).strip()
    h = h.replace('\x02', '  \n') if para else h
    h = re.sub(r'\*\*\s*\*\*', '', h); h = re.sub(r'\*\s+\*', ' ', h); h = re.sub(r'\*\*(\s*)\*\*', r'\1', h)
    return h.strip()

def dropcap(t):
    m = re.match(r'^((?:\d+\. )?)([A-Z])([A-Z]{1,})(?=[ ,;:.] ?[a-z"\'(*A-Z]|[ ,;:.]$| [a-z"\'(*])', t)
    if m: return m.group(1) + m.group(2) + m.group(3).lower() + t[m.end():]
    return t

def blocks(s):
    out = []
    for m in re.finditer(r'<(h[2-4]|p|blockquote)\b[^>]*>(.*?)</\1>|<hr>', s, re.S | re.I):
        if m.group(0) == '<hr>': out.append(('hr', '')); continue
        tag, body = m.group(1).lower(), m.group(2)
        if tag == 'blockquote':
            if 'href="#monday"' in body: continue
            for p in re.findall(r'<p\b[^>]*>(.*?)</p>', body, re.S | re.I):
                t = inline(p)
                if t: out.append(('q', t))
            continue
        if tag == 'p' and ('href="#top"' in body or 'Newman Reader' in body and 'Copyright' in body): continue
        out.append((tag, body))
    return out

def norm(b):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', b)).replace('\xa0', ' ').split())

# chapter id, title, file, start heading (tag, text prefix), part
PLAN = [
 ('may-introductory', 'Introductory: May the Month of Promise and of Joy', 1, ('h3', 'Introductory'), 'part-1'),
 ('may-immaculate-conception', 'On the Immaculate Conception', 1, ('h3', 'I. On the Immaculate'), 'part-1'),
 ('may-annunciation', 'On the Annunciation', 2, ('h3', 'II. On the Annunciation'), 'part-1'),
 ('may-dolours', "Our Lady's Dolours", 2, ('h3', "III. Our Lady's Dolours"), 'part-1'),
 ('may-assumption', 'On the Assumption', 3, ('h3', 'IV. On the Assumption'), 'part-1'),
 ('memorandum-immaculate-conception', 'Memorandum on the Immaculate Conception', 3, ('h2', 'Memorandum'), 'part-1'),
 ('novena-st-philip', 'Novena of St. Philip', 4, ('h2', 'Novena of St. Philip'), 'part-1'),
 ('litany-st-philip-i', 'Litany of St. Philip', 4, ('h2', 'Litany of St. Philip'), 'part-1'),
 ('stations', 'Meditations on the Stations of the Cross', 5, ('h2', 'Meditations on the Stations'), 'part-2'),
 ('stations-short', 'Short Meditations on the Stations of the Cross', 5, ('h2', 'Short Meditations on the Stations'), 'part-2'),
 ('good-friday', 'Twelve Meditations and Intercessions for Good Friday', 6, ('h2', 'Twelve Meditations'), 'part-2'),
 ('eight-days', 'Meditations for Eight Days', 7, ('h2', 'Meditations for Eight Days'), 'part-2'),
 ('litanies', 'Litanies', 7, ('h2', 'Litanies'), 'part-2'),
 ('litany-st-philip-ii', 'Litany of St. Philip', 8, ('h2', 'Litany of St. Philip'), 'part-2'),
 ('anima-christi', 'Anima Christi', 8, ('h2', '“Anima Christi'), 'part-2'),
 ('heart-of-mary', 'The Heart of Mary', 8, ('h2', 'The Heart of Mary'), 'part-2'),
 ('rosary-sunday', 'A Short Service for Rosary Sunday', 8, ('h2', 'A Short Service for Rosary'), 'part-2'),
 ('ave-maris-stella', 'Ave Maris Stella', 8, ('h2', 'Ave Maris Stella'), 'part-2'),
 ('triduo-st-joseph', 'A Triduo to St. Joseph', 8, ('h2', 'A Triduo'), 'part-2'),
 ('four-prayers-st-philip', 'Four Prayers to St. Philip', 8, ('h2', 'Four Prayers'), 'part-2'),
 ('short-road', 'A Short Road to Perfection', 8, ('h2', 'A Short Road'), 'part-2'),
 ('light-of-truth', 'Prayer for the Light of Truth', 8, ('h2', 'Prayer for the Light'), 'part-2'),
 ('happy-death', 'Prayer for a Happy Death', 8, ('h2', 'Prayer for a Happy Death'), 'part-2'),
 ('visit-blessed-sacrament', 'A Short Visit to the Blessed Sacrament before Meditation', 9, ('h2', 'A Short Visit'), 'part-3'),
]
ROM = [(9,'I. Hope in God','hope-creator','Hope in God: Creator'),(9,'II. Hope in God','hope-redeemer','Hope in God: Redeemer'),
 (9,'III. God and the Soul','god-and-the-soul','God and the Soul'),
 (10,'IV. Sin','sin','Sin'),(10,'V. The Power','power-of-the-cross','The Power of the Cross'),(10,'VI. The Resurrection','resurrection','The Resurrection'),
 (10,'VII. God with us','god-with-us','God with Us'),(10,'VIII. God All','god-all-sufficient','God All-Sufficient'),
 (11,'IX. God Alone','god-alone-unchangeable','God Alone Unchangeable'),(11,'X. God is Love','god-is-love','God is Love'),
 (11,'XI. The Sanctity','sanctity-of-god','The Sanctity of God'),(11,'XII. The Forty','forty-days','The Forty Days’ Teaching'),
 (11,'XIII. The Ascension','ascension','The Ascension'),(11,'XIV. The Paraclete','paraclete','The Paraclete'),
 (11,'XV. The Holy Sacrifice','holy-sacrifice','The Holy Sacrifice'),
 (12,'XVI. The Sacred Heart','sacred-heart','The Sacred Heart'),(12,'XVII.','infinite-perfection','The Infinite Perfection of God'),
 (12,'XVIII.','infinite-knowledge','The Infinite Knowledge of God'),(12,'XIX.','providence','The Providence of God'),
 (12,'XX.','all-in-all','God is All in All'),(12,'XXI.','incommunicable-perfection','God the Incommunicable Perfection'),
 (12,'XXII.','god-communicated','God Communicated to Us'),(12,'XXIII.','sole-stay','God the Sole Stay for Eternity'),
 (12,'Conclusion','conclusion','Conclusion: Written in Prospect of Death')]
for f, st, i, t in ROM:
    PLAN.append((i, t if st == 'Conclusion' else t, f, ('h3' if f == 9 else 'h2', st), 'part-3'))
# roman-numbered chapters get their numeral in the title
nums = {}
for f, st, i, t in ROM:
    if st != 'Conclusion': nums[i] = st.split('.')[0]
PLAN = [(i, (nums[i] + '. ' + t) if i in nums else t, f, s, p) for i, t, f, s, p in PLAN]

files = {n: blocks(load(n)) for n in range(1, 13)}
chapters = []; warn = []
for f in sorted(files):
    bl = files[f]
    starts = []
    for pi, (cid, title, ff, (tag, pre), part) in enumerate(PLAN):
        if ff != f: continue
        idx = next((k for k, (t, b) in enumerate(bl) if t == tag and norm(b).startswith(pre)), None)
        if idx is None: warn.append('no start for ' + cid); continue
        starts.append((idx, pi))
    starts.sort()
    # notes section: last h3 Note/Notes
    nidx = max([k for k, (t, b) in enumerate(bl) if t == 'h3' and norm(b) in ('Note', 'Notes')] or [len(bl)])
    notes = {}
    if nidx < len(bl):
        for t, b in bl[nidx + 1:]:
            if t != 'p': continue
            m = re.search(r'name="note(\d+)"', b)
            txt = inline(b, para=False)
            mm = re.match(r'^(\d+)\.\s*(.*)$', txt)
            n = mm.group(1) if mm else (m.group(1) if m else '1')
            if mm: txt = mm.group(2)
            notes[n] = txt
    skipped = [norm(b)[:80] for t, b in bl[:starts[0][0]]]
    warn.append('file %d pre-start skipped: %s' % (f, [s for s in skipped if s][:12]))
    for si, (idx, pi) in enumerate(starts):
        end = starts[si + 1][0] if si + 1 < len(starts) else nidx
        cid, title, ff, (tag, pre), part = PLAN[pi]
        seg = bl[idx:end]
        first = re.sub(r'^[IVX]+\.\s*', '', norm(seg[0][1]))
        lines = ['# ' + title, '']
        used = []
        for k, (t, b) in enumerate(seg):
            if t == 'hr': continue
            if t == 'h2' and norm(b) == 'Meditations on Christian Doctrine': continue
            if t in ('h2', 'h3', 'h4'):
                raw = re.split(r'<br\s*/?>', b)
                parts = [inline(x, para=False).replace('*', '') for x in raw]
                parts = [x for x in parts if x]
                head = ' '.join(parts)
                if k == 0:
                    # the chapter's own heading; Part III roman chapters keep their sub-epigraph
                    if len(parts) > 1 and cid in ('hope-creator',): pass
                    continue
                if re.sub(r'^[IVX]+\.\s*', '', norm(b)) == first or norm(b) == first: continue
                if len(parts) > 1 and re.match(r'^\(\d+\) \S+ \d+$', parts[0]):
                    head = parts[0] + ' — ' + ' '.join(parts[1:]); parts = [head]
                head = re.sub(r'^\((\d+)\)\s*', r'\1. ', parts[0]) if not re.search(r'\d+ —', parts[0]) else re.sub(r'^\(\d+\)\s*', '', parts[0])
                lines += [('## ' + head).rstrip(), '']
                for extra in parts[1:]:
                    lines += ['*' + extra.strip('*') + '*', '']
                continue
            txt = inline(b) if t == 'p' else b
            if not txt: continue
            txt = '\n'.join(dropcap(l) if i == 0 else l for i, l in enumerate(txt.split('\n')))
            if t == 'q': txt = '\n'.join('> ' + l for l in txt.split('\n'))
            lines += [txt, '']
        body = '\n'.join(lines).replace('**CAUSEOF** S**ALVATION**', '**cause of salvation**').replace('**WHY**', '**Why**')
        refs = re.findall(r'\x00(\d+)\x01', body)
        body = re.sub(r'\x00(\d+)\x01', lambda m: '[^%s]' % m.group(1), body)
        for r in refs:
            if r not in notes: warn.append('%s: ref %s has no note' % (cid, r))
        body = body.rstrip() + '\n'
        if refs:
            body += '\n' + '\n'.join('[^%s]: %s' % (r, notes.get(r, '')) for r in dict.fromkeys(refs)) + '\n'
        body = re.sub(r'\n{3,}', '\n\n', body)
        used = set(refs)
        chapters.append((pi, cid, title, part, body))
    unused = set(notes) - {r for c in chapters for r in re.findall(r'\[\^(\d+)\]:', c[4])} if False else None
os.makedirs(OUT + '/en-US', exist_ok=True)
chapters.sort()
for _, cid, title, part, body in chapters:
    open('%s/en-US/%s.md' % (OUT, cid), 'w').write(body)
json.dump([(c[1], c[2], c[3]) for c in chapters], open(OUT + '/chapters.json', 'w'), ensure_ascii=False, indent=1)
print('\n'.join(warn)); print(len(chapters), 'chapters')
