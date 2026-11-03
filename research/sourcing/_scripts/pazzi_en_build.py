"""Fabrini/Isoleri 1900 Part II (The Works of St Mary Magdalen de-Pazzi), archive.org lifeofstmarymagd00fabr djvu.txt -> en-US book."""
import re, sys, os, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import en_common as E, rhb_build
SRC = '/Users/gustavo/Documents/prayer/research/sourcing/mary-magdalene-de-pazzi/xml/fabr_djvu.txt'
D = '/Users/gustavo/Documents/prayer/content/books/mary-magdalene-de-pazzi-opera-omnia/works-fabrini-isoleri/'
L = [l.replace('\x0c', '') for l in open(SRC, errors='replace').read().split('\n')]
HEAD = re.compile(r'LIFE\s+AND\s+WORKS|LIKE\s+AND\s+WORKS|(ST|S\'T|5T)\.?\s+MARY\s+MAGDA|^\s*\d{1,3}\s*$|^\s*[·.,\'`"^*;:\-_|~]{0,6}\s*$|^\s*[\W\d]{1,4}\s*$')
def body(a, b):
    out = []; skip = False
    for i in range(a, b):
        t = L[i].strip()
        if re.search(r'MAGDA\w*\s+D[EB]-?\W?PAZ|LIFE\s+AND\s+WORKS|LIKE\s+AND\s+WORKS|LIEE\s+AND', t): skip = False; continue
        if t.startswith('^') and len(t) > 12: skip = True
        if skip: continue
        if HEAD.search(t) and len(t) < 8: continue
        out.append(re.sub(r'\s+', ' ', t))
    return out
def paras(lines):
    lens = sorted(len(l) for l in lines if len(l) > 20)
    med = lens[len(lens) // 2] if lens else 80
    ps = []; cur = []
    for l in lines:
        if re.match(r'^\d{1,2}\.\s+\S', l) and cur: ps.append(cur); cur = []
        cur.append(l)
        if len(l) < 0.62 * med and re.search(r'[.!?:"”’]\s*$', l): ps.append(cur); cur = []
    if cur: ps.append(cur)
    out = [E.join_lines(p) for p in ps]
    for a, b in rhb_build.OCR: out = [re.sub(a, b, p) for p in out]
    out = [re.sub(r'\bQ(ospel|host|od|iovann)', r'G\1', re.sub(r'\b5t\.', 'St.', re.sub(r'\s+([;:!?,.])', r'\1', p))) for p in out if len(p) > 1]
    return out
def rv(s):
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50}; t = 0
    for i, c in enumerate(s): t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t
def items(a, b, rx):
    marks = []; last = 0
    for i in range(a, b):
        t = L[i].strip()
        if re.fullmatch(rx, t):
            v = rv(re.sub(r'[^IVXL]', '', t))
            if v in (last + 1, last + 2) and re.match(r'[A-Z]', next((x.strip() for x in L[i + 1:i + 4] if x.strip()), '')): marks.append(i); last = v
    res = []
    for k, i in enumerate(marks):
        end = marks[k + 1] if k + 1 < len(marks) else b
        j = i + 1; tl = []
        while j < end and len(tl) < 4:
            j += 1
            if not L[j - 1].strip(): continue
            tl.append(L[j - 1].strip())
            if tl[-1].endswith('.'): break
        res.append((L[i].strip().rstrip('.').strip(), re.sub(r'\s+', ' ', ' '.join(tl)).strip(), j, end))
    return res
def section(a, b, rx):
    out = []; n = 0
    its = items(a, b, rx)
    for num, title, s, e in its:
        out.append('## %s. %s' % (num.rstrip('.'), re.sub(r'\b5t\.', 'St.', title.replace('Qospel', 'Gospel').replace('Qhost', 'Ghost'))))
        out += paras(body(s, e))
    return out
first = section(21227 - 1, 27181, r'(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII|XXIII|XXIV|XXV)\s?[.,]?\s*[.]?')
second = section(27188 - 1, 28942, r'(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI)\s?[.]\s*')
# third section: maxims and letters, headed by the printed sub-headings
t3 = body(28948, 31178)
sub = re.compile(r'^(Sayings (?:of|Applicable|Concerning)[^.]{3,50}\.|§ ?[IVX]+\.?|Invocation\.|(?:[IVXL]+\.\s*)?To (?:Sister|the|Rev|Sig|Cardinal|Don|Father|Mother|Her|His|Mgr|Count|Archbishop|Prioress|Madonna|Lady|Queen)[^.]{3,70}\.?)$')
third = []; buf = []
def flush():
    global buf
    third.extend(paras(buf)); buf = []
for l in t3:
    if sub.match(l) and len(l) < 90: flush(); third.append('## ' + l.rstrip('.'))
    else: buf.append(l)
flush()
chapters = [('first-section', 'First Section: Contemplations on the Principal Mysteries of Faith, the Humanity of Christ and the Divine Attributes', first),
            ('second-section', 'Second Section: Moral Doctrines on Divers Virtues, and Chiefly Religious Perfection', second),
            ('third-section', 'Third Section: Maxims and Exclamations of the Saint, and Her Letters', third)]
os.makedirs(D + 'en-US', exist_ok=True)
toc = []; words = 0
for cid, title, content in chapters:
    txt = '# %s\n\n%s\n' % (title, '\n\n'.join(content))
    open(D + 'en-US/%s.md' % cid, 'w').write(txt); words += len(txt.split())
    toc.append({'id': cid, 'title': {'en-US': title}})
    print(cid, len(content), len(txt.split()), len([c for c in content if c.startswith('## ')]))
json.dump(toc, open('/Users/gustavo/Documents/prayer/research/sourcing/mary-magdalene-de-pazzi/toc_en.json', 'w'))

book = {'id': 'pazzi-works-fabrini-isoleri', 'cover': 'quarter',
 'name': {'en-US': 'The Works of St. Mary Magdalen de-Pazzi (Fabrini, Part II)', 'pt-BR': 'As obras de Santa Maria Madalena de Pazzi (Fabrini, Parte II)'},
 'author': {'it': "Santa Maria Maddalena de' Pazzi", 'en-US': "St. Mary Magdalene de' Pazzi", 'pt-BR': 'Santa Maria Madalena de Pazzi'},
 'description': {'en-US': "Part II of Placido Fabrini's Life of the saint in Antony Isoleri's English (Philadelphia, 1900): a thematic anthology of her ecstatic contemplations on the mysteries of faith (25 pieces), her moral doctrine on the virtues and religious perfection (16 pieces), and her maxims and letters. It is arranged by theme from Puccini's collection, not in the order of the manuscript books, so it is a separate book of the same work as her Italian Tutte le opere.",
                 'pt-BR': 'A Parte II da Vida da santa, de Placido Fabrini, na versão inglesa de Antony Isoleri (Filadélfia, 1900): antologia temática de suas contemplações extáticas, de sua doutrina moral e de seus ditos e cartas.'},
 'composed': '1584-1607', 'languages': ['en-US'], 'work': 'mary-magdalene-de-pazzi/tutte-le-opere',
 'editions': {'en-US': {'translator': 'Antony Isoleri', 'year': 1900}},
 'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/lifeofstmarymagd00fabr', 'edition': 'The Life of St. Mary Magdalen De-Pazzi, Florentine Noble, Sacred Carmelite Virgin, by Placido Fabrini, tr. Antony Isoleri (Philadelphia, 1900), Part II: The Works.',
   'description': "Internet Archive full-text OCR, Part II only (the Life, the appendix of miracles and the prayers are dropped). Running heads, page numbers and the translator's footnotes are dropped; paragraph breaks are rebuilt from short lines, so some run together. Pieces I-XXV and I-XVI are the printed numbers; piece XIII of the first section is merged into XII (its numeral was lost in the OCR). The letters of the third section are not divided by addressee.",
   'tier': 'A', 'tierEvidence': 'Published in Philadelphia in 1900.'}],
 'toc': toc}
json.dump(book, open(D + 'book.json', 'w'), ensure_ascii=False, indent=2); open(D + 'book.json', 'a').write('\n')
