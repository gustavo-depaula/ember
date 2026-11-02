"""Faber's Hymns (1880 Murphy ed., archive.org djvu OCR) -> one chapter per hymn, hard line breaks, parts as toc groups."""
import os, re, json
ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/faber/ia/hymns00faberich_djvu.txt'
BOOK = ROOT + '/content/books/faber-opera-omnia/hymns'
PARTS = [(1, 18, 'God and the Most Holy Trinity'), (19, 37, 'The Sacred Humanity of Jesus'), (38, 64, 'Our Blessed Lady, Saint Joseph and the Holy Family'),
         (65, 89, 'Angels and Saints'), (90, 126, 'The Sacraments, the Faith, and the Spiritual Life'), (127, 133, 'Miscellaneous'), (134, 150, 'The Last Things')]
PT = ['Deus e a Santíssima Trindade', 'A Sagrada Humanidade de Jesus', 'Nossa Senhora, São José e a Sagrada Família', 'Anjos e Santos', 'Os Sacramentos, a Fé e a Vida Espiritual', 'Diversos', 'As Últimas Coisas']
W = set(w.strip().lower() for w in open('/usr/share/dict/words', errors='ignore'))
lines = open(SRC, encoding='utf8', errors='ignore').read().split('\n')
START, END = 1871, 22790
def capsy(l):
    a = [c for c in l if c.isalpha()]
    return len(a) >= 2 and sum(c.isupper() for c in a) >= 0.7 * len(a)
def clean(l):
    l = re.sub(r'\s+', ' ', l).strip()
    l = re.sub(r'\s+([;:!?,.])', r'\1', l)
    def fixw(m):
        w = m.group(0)
        if w.lower() in W: return w
        for a, b in (('tli', 'th'), ('cli', 'ch'), ('wli', 'wh'), ('gli', 'gh'), ('tl', 'th')):
            if a in w.lower():
                v = re.sub(a, b, w, flags=re.I)
                if v.lower() in W: return v
        return w
    return re.sub(r"[A-Za-z]+", fixw, l)
def title_case(t):
    SM = {'of', 'the', 'and', 'in', 'to', 'a', 'an', 'by', 'for', 'on', 'with', 'from', 'at', 'or', 'as', 'is', 'his', 'her', 'our', 'its'}
    ws = clean(t).rstrip('.').lower().split(' ')
    return ' '.join(w if (i and w in SM) else re.sub(r"^(\W*)(\w)", lambda m: m.group(1) + m.group(2).upper(), w) for i, w in enumerate(ws))
TITLES = {10: 'My Father', 14: 'Jesus, My God and My All', 16: 'Veni Creator', 18: 'Holy Ghost, Come Down upon Thy Children', 19: 'The Life of Our Lord', 23: 'The Purification', 25: 'The Agony',
          30: 'The Descent of Jesus to Limbus', 49: 'The Grandeurs of Mary', 50: 'The Immaculate Heart of Mary', 51: 'Month of May', 52: 'Oh! Balmy and Bright', 55: 'Consolatrix Afflictorum', 56: 'The Queen of Purgatory',
          58: 'A Daily Hymn to Mary', 59: "The Orphan's Consecration to Mary", 64: 'The Banner of the Holy Family', 67: 'Saint Gabriel', 69: 'The Guardian Angel', 76: 'Saint Innocence', 78: 'Saint Wilfrid',
          88: 'Evening Hymn at the Oratory', 91: 'Thanksgiving after Communion', 92: 'Flowers for the Altar', 93: 'Faith of Our Fathers', 97: 'Predestination', 110: 'The World',
          113: "The Christian's Song on His March to Heaven", 114: 'Fight for Sion', 115: 'Perfection', 121: 'Sweetness in Prayer', 123: 'The Pain of Love', 125: 'Light in Darkness', 132: 'The Sorrowful World', 148: 'The Shore of Eternity', 90: 'Holy Communion'}
body = [l for l in lines[START - 1:END]]
# hymn starts: bare number line followed by a capitals title
idx = [i for i, l in enumerate(body) if re.fullmatch(r'\s*\d{1,3}\.\s*', l)]
starts = []
for i in idx:
    j = i + 1
    while j < len(body) and not body[j].strip(): j += 1
    if j < len(body) and capsy(body[j]) and not re.search(r'HYMN|PART', body[j]) and not re.fullmatch(r'[\W\d]*', body[j]): starts.append((i, int(re.sub(r'\D', '', body[i])), j))
hymns = []; pos = -1
for want in range(1, 151):
    c = next((h for h in starts if h[1] == want and pos < h[0] < pos + 1200 + (0 if pos >= 0 else 10**6)), None)
    if c: hymns.append(c); pos = c[0]
EXTRA = {11: 3109, 42: 7833, 58: 9776, 77: 12269, 88: 13871, 100: 15582, 110: 16696, 141: 21155}  # title lines whose number line OCR lost
for n, ln in EXTRA.items(): hymns.append((ln - START - 1, n, ln - START))
hymns.sort(key=lambda h: h[0])
exp = hymns[-1][1]
print('missing starts', [w for w in range(1, 151) if w not in [h[1] for h in hymns]])
print('hymns found', len(hymns), 'last', exp)
out = []
for k, (i, n, j) in enumerate(hymns):
    e = hymns[k + 1][0] if k + 1 < len(hymns) else len(body)
    t = [clean(body[j])]; m = j + 1
    while m < e and (not body[m].strip() or (capsy(body[m]) and len(clean(body[m])) < 50 and not re.fullmatch(r'\d+\.?', clean(body[m])))):
        if body[m].strip(): t.append(clean(body[m]))
        m += 1
    title = TITLES.get(n) or title_case(' '.join(t))
    stz, cur = [], []
    for l in body[m:e]:
        c = clean(l)
        if not c: continue
        if re.fullmatch(r'\d{1,3}\.?', c) or re.fullmatch(r'\d+\*+', c) or re.fullmatch(r'[\W\d]{1,8}', c):
            if cur: stz.append(cur); cur = []
            continue
        if capsy(c) and (re.search(r'\d', c) or len(c) < 45): continue  # running heads, part headers
        if re.fullmatch(r'(?i)[ip]?\)?(part|pakt)\s+\S+', c): continue
        cur.append(c)
    if cur: stz.append(cur)
    out.append((n, title, stz))
os.makedirs(BOOK + '/en-US', exist_ok=True); os.makedirs(BOOK + '/sources/en-US-originals', exist_ok=True)
words = 0; toc = []
for lo, hi, pt in PARTS:
    p = {'id': 'part-%d' % (PARTS.index((lo, hi, pt)) + 1), 'title': {'en-US': 'Part %s. %s' % (['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][PARTS.index((lo, hi, pt))], pt), 'pt-BR': 'Parte %d. %s' % (PARTS.index((lo, hi, pt)) + 1, PT[PARTS.index((lo, hi, pt))])}, 'children': []}
    for n, title, stz in out:
        if lo <= n <= hi:
            cid = 'hymn-%03d' % n
            md = '# %d. %s\n\n' % (n, title) + '\n\n'.join('  \n'.join(s) for s in stz) + '\n'
            open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md); words += len(md.split())
            p['children'].append({'id': cid, 'title': {'en-US': '%d. %s' % (n, title)}})
    toc.append(p)
open(BOOK + '/sources/en-US-originals/hymns-ia.txt', 'w').write('\n'.join(lines[START - 1:END]))
book = {'id': 'faber-hymns', 'cover': 'classic',
        'name': {'en-US': 'Hymns', 'pt-BR': 'Hinos'}, 'author': {'en-US': 'Fr. Frederick William Faber', 'pt-BR': 'Pe. Frederick William Faber'},
        'description': {'en-US': "The hundred and fifty hymns of Faber, as he collected them in 1862 from his Jesus and Mary (1849) and the Oratory Hymns (1854): God and the Holy Trinity, the Sacred Humanity of Jesus, Our Lady and St. Joseph, the angels and saints, the sacraments, the faith and the spiritual life, miscellaneous hymns and the last things. They include \"Faith of our Fathers\", \"There's a wideness in God's mercy\" and \"My God, how wonderful Thou art\".",
                        'pt-BR': 'Os cento e cinquenta hinos de Faber, como os reuniu em 1862 a partir de Jesus and Mary (1849) e dos Oratory Hymns (1854): Deus e a Santíssima Trindade, a Sagrada Humanidade de Jesus, Nossa Senhora e São José, os anjos e santos, os sacramentos, a fé e a vida espiritual, hinos diversos e as últimas coisas. Entre eles estão "Faith of our Fathers", "There\'s a wideness in God\'s mercy" e "My God, how wonderful Thou art".'},
        'composed': '1849-1862', 'languages': ['en-US'], 'work': 'faber/hymns',
        'editions': {'en-US': {'editor': "Fr. Frederick William Faber (Father Faber's Hymns, New York: P. J. Kenedy / Murphy)", 'year': 1880}},
        'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/hymns00faberich', 'edition': "Father Faber's Hymns (the complete 150 hymns, 1880 printing), Internet Archive full-text OCR.",
                     'description': 'The 150 hymns, one chapter each, grouped in the seven parts of the collection; stanza numbers, running heads and page numbers are dropped, and the hard line breaks of the verse are kept. The editor\'s introduction, the contents and the index of first lines are left out. The OCR is uncorrected apart from spacing, and isolated slips remain. Raw OCR in sources/en-US-originals/.',
                     'tier': 'A', 'tierEvidence': 'Faber died in 1863 and the hymns first appeared in 1849-1862, so the text is public domain.'}],
        'toc': toc}
json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2); open(BOOK + '/book.json', 'a').write('\n')
print(len(out), 'hymns', words, 'words')
miss = [n for n in range(1, 151) if n not in [o[0] for o in out]]
print('missing', miss)
