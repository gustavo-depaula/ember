"""Challoner, The Garden of the Soul: the 1916 reprint of the 1741 impression of the first edition (London: Society of
SS. Peter & Paul), from the collated OCR of three archive.org scans (challoner_garden_collate.py) ->
challoner-opera-omnia/garden-of-the-soul (en-US).

Chapters are cut at the book's own sections (CHAPTERS); headings set in capitals become ## headings; running heads and
page numbers are dropped; litanies and other runs of short lines keep their line breaks. The decorated initial of a
section opening is lost in all three scans ("VERY Christian", "E must get up"): it is restored from the later editions
of the Garden in research/sourcing/_skipped/samples/ when they carry the same opening, else from the word list.
usage: python3.13 challoner_garden_build.py COLLATED.txt"""
import collections, json, os, pickle, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_common import join_lines  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
BOOK = ROOT + '/content/books/challoner-opera-omnia/garden-of-the-soul'
SAMPLES = ROOT + '/research/sourcing/_skipped/samples/'
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
DICT = set(w.strip().lower() for w in open('/usr/share/dict/words'))
STATS = collections.Counter()

# (id, title, regex matching the section's heading line); each runs to the next
CHAPTERS = [
    ('advertisement', 'Advertisement (1916)', r'^C?ADVERTISEMENT\s*$'),
    ('christian-doctrine', 'Christian Doctrine', r'^CHRISTIAN DOCTRINE\s*$'),
    ('gospel-lessons', 'Gospel-Lessons to be Ponder\'d at Leisure by Every Christian', r'^GOSPEL-LESSONS'),
    ('feasts-and-fasts', 'A Table of All the Feasts and Fasts', r'^A Table of all the FEASTS'),
    ('morning-exercise', 'A Morning Exercise', r'^A MORNING EXERCISE\s*$'),
    ('instructions-for-meditation', 'Instructions for Meditation', r'^INSTRUCTIONS FOR MEDITATION'),
    ('meditations', 'Ten Meditations of St. Francis de Sales', r'^TEN MEDITATIONS'),
    ('mass', 'Instructions and Devotions for Hearing Mass', r'^INSTRUCTIONS AND DEVO-'),
    ('mass-for-the-absent', 'A Method of Hearing Mass for the Absent', r'^METHOD OF HEARING MASS'),
    ('sunday-devotions', 'Other Devotions Proper for Sundays and Holidays', r'^OTHER DEVOTIONS PROPER FOR'),
    ('vespers', 'The Vespers, or Even-Song, and Complin', r'^THE VESPERS, OR EVEN-SONG'),
    ('benediction', 'The Benediction of the Blessed Sacrament', r'BENEDICTION OF THE\s*$'),
    ('prayers-for-the-king', 'Prayers for the King', r'^PRAYERS FOR THE KING'),
    ('penitential-psalms', 'The Seven Penitential Psalms', r'^THE SEVEN PENITENTIAL'),
    ('evening-devotions', 'Evening Devotions for Families', r'^EVENING DEVOTIONS FOR'),
    ('examination-every-night', 'An Examination of Conscience for Every Night', r'^AN EXAMINATION OF CONSCIENCE\s*$'),
    ('ordinary-actions', 'Of the Ordinary Actions of the Day', r'^OF THE ORDINARY ACTIONS'),
    ('invocations-and-virtues', 'Invocations of the Holy Ghost; Necessary Virtues; Aspirations', r'^INVOCATIONS OF THE HOLY GHOST'),
    ('preservatives-against-sin', 'Preservatives and Remedies against Sin', r'^PRESERVATIVES AND REMEDIES'),
    ('confession', 'Instructions and Devotions for Confession', r'^INSTRUCTIONS AND DEVO-'),
    ('examination-before-confession', 'An Examination of Conscience before Confession', r'^AN EXAMINATION OF\s*$'),
    ('meditation-before-confession', 'A Meditation before Confession', r'^A MEDITATION BEFORE\s*$'),
    ('affections-and-resolutions', 'Affections and Resolutions', r'^AFFECTIONS AND RESOLUTIONS'),
    ('method-of-confession', 'The Method of Confession', r'^THE METHOD OF CONFESSION'),
    ('communion', 'Instructions and Devotions for Communion', r'^INSTRUCTIONS AND DEVO-'),
    ('meditation-before-communion', 'A Meditation before Communion', r'^A MEDITATION BEFORE\s*$'),
    ('devotions-before-communion', 'Devotions before Communion', r'^A PREPARATORY PRAYER'),
    ('devotions-after-communion', 'Devotions after Communion', r'^ASPIRATIONS AFTER COMMUNION'),
    ('the-sick', 'Instructions and Devotions for the Sick', r'^INSTRUCTIONS AND DEVO-'),
    ('prayers-for-the-dead', 'Prayers for the Dead', r'^PRAYERS FOR THE DEAD'),
    ('woman-with-child', 'A Prayer to be Said by a Woman with Child', r'SAID BY A WOMAN WITH CHILD'),
    ('litanies', 'Litanies, and the Fifteen Mysteries of the Rosary', r'^THE LITANY OF OUR LORD'),
]
END = r'^THE PRINTING OF THIS EDITION'
# the tables of holidays, fasts and abstinence are the 1916 publishers' updates, set in columns the OCR scrambles
SKIP = {'feasts-and-fasts'}


def known(w):
    lw = w.lower()
    return lw in DICT or LEX.get(lw, 0) >= 3


def caps(line):
    a = [c for c in line if c.isalpha()]
    return len(a) >= 3 and sum(c.isupper() for c in a) >= 0.85 * len(a)


SMALL = {'of', 'the', 'and', 'in', 'to', 'a', 'an', 'by', 'for', 'on', 'with', 'from', 'at', 'or', 'as', 'upon', 'after', 'before', 'which', 'that', 'be', 'are', 'it', 'is'}


def tcase(t):
    t = re.sub(r'\s+', ' ', t).strip().rstrip('.')
    out = []
    for i, w in enumerate(t.split(' ')):
        lw = w.lower()
        if re.fullmatch(r'[IVXL]+[.,]?', w):
            out.append(w)
        elif i and lw in SMALL:
            out.append(lw)
        else:
            out.append(lw[:1].upper() + lw[1:])
    t = ' '.join(out)
    return re.sub(r"\b(St|Ss)\.", lambda m: m.group(1) + '.', t)


def running_heads(lines):
    """titles of running heads: short title-case lines carrying a page number, seen three or more times"""
    c = collections.Counter()
    for l in lines:
        m = re.fullmatch(r"\s*(?:[\dIlivxlc]{1,4}\s+)?([A-Z][A-Za-z’',.&\- ]{3,40}?)(?:\s+[\divxlcI\w]{1,4})?\s*", l)
        if m and len(l.split()) <= 7 and not caps(l):
            c[m.group(1).strip()] += 1
    return {t for t, n in c.items() if n >= 2 and len(t) > 8}


def is_head(l, heads):
    s = l.strip()
    if re.fullmatch(r"[\dIlivxlc|.,'‘’ ]{1,5}", s):
        return True
    m = re.fullmatch(r"(?:[\dIlivxlc]{1,4}\s+)?(.+?)(?:\s+\S{1,4})?", s)
    return bool(m) and len(s.split()) <= 8 and (m.group(1).strip() in heads or s in heads)


OTHERS = None


def other_editions():
    global OTHERS
    if OTHERS is None:
        txt = ''
        for f in ('GardenOfTheSoul1871.txt', 'TheGardenOfTheSoul1843.txt', 'TheGardenOfTheSoul1872.txt', 'gardenofsoulmanu00chal.txt'):
            if os.path.exists(SAMPLES + f):
                txt += ' ' + open(SAMPLES + f, errors='replace').read()
        OTHERS = re.sub(r'\s+', ' ', txt.replace('ſ', 's'))
    return OTHERS


BIGRAMS = None


def bigrams():
    """word pairs of the later editions and of this text itself, to judge a restored initial"""
    global BIGRAMS
    if BIGRAMS is None:
        ws = re.findall(r"[a-z]+", (other_editions() + ' ' + open(sys.argv[1]).read()).lower())
        BIGRAMS = collections.Counter(zip(ws, ws[1:]))
    return BIGRAMS


def drop_cap(p):
    """restore the decorated initial lost at a section's first word, choosing the reading whose pairing with the next
    word is commonest ("when you" over "hen you", "every christian" over "very christian")"""
    p = re.sub(r"^(?:[I|>]\.?|L,|\|)\s*(P AcE|per|ae|PoS)\b", 'PLACE', p)
    p = re.sub(r"^\| fe the beginning", 'In the beginning', p).replace('Wt is truly meet', 'It is truly meet')
    m = re.match(r"^([A-Z]{2,12})\b(.*)$", p)
    if not m:
        return p
    rem, rest = m.group(1), m.group(2)
    nxt = (re.findall(r"[a-z]+", rest.lower()) or [''])[0]
    cands = [rem] + [c + rem for c in 'ABCDEFGHIJKLMNOPRSTUWY' if known(c + rem)]
    bg = bigrams()
    scored = sorted(((bg[(c.lower(), nxt)], LEX.get(c.lower(), 0), c) for c in cands), reverse=True)
    best = scored[0][2]
    if scored[0][0] == 0 and not known(rem) and len(cands) > 1:
        best = max(cands[1:], key=lambda c: LEX.get(c.lower(), 0))
    if best != rem:
        STATS['initial restored'] += 1
    return best[0] + best[1:].lower() + rest


def blocks(lines):
    bs, cur = [], []
    for l in lines:
        if l.strip():
            cur.append(l.rstrip())
        elif cur:
            bs.append(cur)
            cur = []
    if cur:
        bs.append(cur)
    return bs


def is_list(b):
    """a litany or response block: several short lines that each end a clause"""
    if len(b) < 3:
        return False
    ends = sum(bool(re.search(r"[.,;:!?]$", l.strip())) for l in b)
    return ends >= 0.85 * len(b) and max(len(l.strip()) for l in b) < 45


def chapter(lines, heads):
    out = []
    after_head = True
    for b in blocks([l for l in lines if not is_head(l, heads)]):
        if all(caps(l) for l in b) and sum(len(l) for l in b) < 200:
            t = join_lines([l.strip() for l in b])
            out.append(('h', tcase(t)))
            after_head = True
            continue
        if is_list(b):
            t = '  \n'.join(re.sub(r'\s+', ' ', l.strip()) for l in b)
            kind = 'l'
        else:
            t = join_lines([l.strip() for l in b])
            kind = 'p'
        if after_head:
            t = drop_cap(t)
        if out and out[-1][0] == 'p' and kind == 'p' and (t[:1].islower() or not re.search(r"[.!?:\"”’)]\s*$", out[-1][1])):
            out[-1] = ('p', join_lines([out[-1][1], t]))
        else:
            out.append((kind, t))
        after_head = False
    return out


def split_numbers(t):
    """an article number the OCR ran into the paragraph before: ". 2. Every Christian" """
    return re.split(r"(?<![ivxlc]\.)(?<!\bver\.)(?<!\bv\.)(?<!\bch\.)(?<=[.:;!?]) (?=\d{1,2}\. [A-Z])", t)


HEADFIX = {'A Prater': 'A Prayer', 'Ea Prayer': 'A Prayer', 'Meepralrer': 'A Prayer', 'Phe Hymn': 'The Hymn', 'Emeditation': 'Meditation',
           'Cmeditation': 'Meditation', '«meditation': 'Meditation', 'Meditation. on': 'Meditation. On', 'Meditation. by': 'Meditation. By',
           'Ante Oly': 'Introit', 'of Fertort': 'Offertory', 'For, the': 'for the', 'For, which': 'for which', 'For, All': 'for All',
           'Penis Tent': 'Penitent', 'Engraving Ini': 'Engraving in', 'A Protesi Ation': 'A Protestation', 'Com. Munion': 'Communion',
           '«middle': 'Middle', 'Date Repeated': 'Repeated', 'Lords Prayer': "Lord's Prayer", 'Election -and': 'Election and',
           'Creation': 'Creation', 'Our, Creation': 'Our Creation', 'De Sales': 'de Sales'}


def fix_head(t):
    for a, b in HEADFIX.items():
        t = t.replace(a, b)
    t = re.sub(r"^[^A-Za-z]+", '', t).rstrip(' ,:;')
    if not re.search(r"[A-Za-z]{3}", t) or len(re.findall(r"\b[A-Za-z]{2,}\b", t)) < 1:
        return None
    words = re.findall(r"[A-Za-z]+", t)
    if sum(known(w) for w in words) < 0.7 * len(words):  # rubric OCR garbage (red ink): drop the heading
        STATS['garbled heading dropped'] += 1
        return None
    return t


# openings whose initial the bigram test could not settle, read from the sense and the later editions
OPENINGS = [(r"^[Ii|>L][.,]? *(LACE|P AcE|per|ae|PoS)\b", 'Place'), (r"^Ccept\b", 'Accept'), (r"^Anctify\b", 'Sanctify'), (r"^Cloth, in the sense", 'Sloth, in the sense'),
            (r"^Fale the Sundays", 'All the Sundays'), (r"^Andlemasday", 'Candlemas-day'), (r"^L HE Vigil of \| ", ''), (r"^Bord, increase", 'Lord, increase'),
            (r"^E fly to thy", 'We fly to thy'), (r"^E beseech thee", 'We beseech thee'), (r"^Peccatoribus E humbly", 'Peccatoribus. We humbly'),
            (r"^I\. Y heart is ready", 'My heart is ready'), (r"^te i N\. N\.", 'I N. N.'), (r"I\. UMILITY:", 'I. Humility:'), (r"^Wt is truly", 'It is truly'), (r"^P SHE first", 'The first'), (r"\bint741\b", 'in 1741'), (r"Exaudiat AY the Lord", 'Exaudiat. May the Lord')]


def tidy(t):
    t = re.sub(r"(?<=\s)(?:[|©¢®«»•■]+|=-|-»|è-|-©)(?=\s)", '', t)  # gutter and bleed-through marks
    t = re.sub(r"(?<=\w) \| (?=\w)", ' ', t)
    t = re.sub(r'"?\b(?:im|sn) uo \S+(?: \S{1,3})?(?: ET)?\s', '', t)  # "have mercy on us" set sideways in the litany
    t = re.sub(r"  +", ' ', t)
    t = re.sub(r"(^|\s)(?:¥|Ý|Y\.|V\.)\s*(?=[A-Z])", r"\1℣. ", t)  # versicle and response signs
    t = re.sub(r"(^|\s)(?:Ry\.|R\.|Rv\.|ꝶ\.?)\s*(?=[A-Z])", r"\1℟. ", t)
    t = re.sub(r"[ \t]+", ' ', t).replace('“', '"').replace('”', '"')
    t = re.sub(r"\s+([,;:!?])(?=\s|$)", r"\1", t)
    t = re.sub(r'(^|\s)" (?=\w)', r'\1"', t)
    t = re.sub(r"^(\d{1,2})[.,] ", r"**\1.** ", t)  # numbered articles stay inert, never list items
    t = re.sub(r"^\W+(?=[A-Z])", '', t) if not t.startswith(('**', '*', '"', '℣', '℟', '(')) else t
    for a, b in OPENINGS:
        t = re.sub(a, b, t)
    return t


def main():
    L = open(sys.argv[1]).read().split('\n')
    heads = running_heads(L)
    starts, pos = [], 0
    for cid, title, rx in CHAPTERS:
        i = next(k for k in range(pos, len(L)) if re.search(rx, L[k].strip()))
        starts.append(i)
        pos = i + 1
    end = next(k for k in range(pos, len(L)) if re.search(END, L[k].strip()))
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    toc, words = [], 0
    for n, (cid, title, rx) in enumerate(CHAPTERS):
        a, b = starts[n], starts[n + 1] if n + 1 < len(starts) else end
        if cid in SKIP:
            continue
        lines = L[a:b]
        if cid == 'advertisement':
            lines = lines[1:next(k for k, l in enumerate(lines) if l.strip() == 'INDEX')]
        items = chapter(lines, heads)
        # a running head the OCR ran into a line of text
        rh = re.compile(r"\s(?:\d{1,3}\s+)?(?:%s)(?:\s+\d{1,3})(?=\s|$)" % '|'.join(re.escape(h) for h in sorted(heads, key=len, reverse=True)))
        items = [(k, rh.sub('', t) if k != 'h' else t) for k, t in items]
        # the chapter's own heading block opens it: drop it, the H1 stands for it
        while items and items[0][0] == 'h':
            items = items[1:]
        # an opening paragraph that repeats the chapter heading in capitals before its subtitle
        if items and items[0][0] == 'p' and re.match(r"^[A-Z][A-Z ,'’-]{6,}\b", items[0][1]):
            sub = re.sub(r"^[A-Z][A-Z ,'’-]{6,}\s+(\S{1,5}\s+)?", '', items[0][1])
            items[0] = ('p', '*%s*' % sub.strip()) if sub.strip() else None
            items = [x for x in items if x]
        body = []
        for kind, t in items:
            if kind == 'h':
                t = fix_head(tidy(t))
                if t:
                    body.append('## ' + t)
            elif kind == 'p':
                body.extend(tidy(x) for x in split_numbers(t))
            else:
                body.append(tidy(t))
        md = '# %s\n\n%s\n' % (title, '\n\n'.join(body))
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
        words += len(md.split())
        toc.append({'id': cid, 'title': {'en-US': title}})
        print(cid, len(md.split()))
    print('words', words, dict(STATS))
    book = {
        'id': 'challoner-garden-of-the-soul', 'cover': 'missal',
        'name': {'en-US': 'The Garden of the Soul', 'pt-BR': 'O jardim da alma'},
        'author': {'en-US': 'Bp. Richard Challoner', 'pt-BR': 'D. Richard Challoner'},
        'description': {
            'en-US': "Bishop Challoner's manual of spiritual exercises and instructions for Christians who, living in the world, aspire to devotion (1740): the summary of Christian doctrine, morning and evening exercises, the method of meditation with St. Francis de Sales's ten meditations, the Mass, Vespers and Benediction, the ordinary actions of the day, remedies against sin, confession, communion, the sick and the dead. The text is the 1916 reprint of the 1741 impression of the first edition, before a century and a half of editions rewrote it; the feast and fasting tables, Vespers and Complin and a few sentences were brought up to date in 1916.",
            'pt-BR': "O manual de exercícios espirituais e instruções do bispo Challoner para os cristãos que, vivendo no mundo, aspiram à devoção (1740), na reimpressão de 1916 da primeira edição."},
        'composed': 1740, 'languages': ['en-US'], 'work': 'challoner/garden-of-the-soul',
        'editions': {'en-US': {'editor': 'Society of SS. Peter & Paul (reprint of the 1741 impression)', 'year': 1916}},
        'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/gardenofsoul0000vari',
                     'edition': "The Garden of the Soul: or, a Manual of Spiritual Exercises and Instructions for Christians who, living in the World, aspire to Devotion. Bishop Challoner's original edition reprinted (London: Society of SS. Peter & Paul, 1916).",
                     'description': "Archive.org OCR of three scans of the same printing (gardenofsoul0000vari, bwb_Y0-ARJ-962, gardenofsoul0000vari_t3p2) collated word by word, then cleaned by script; not proofread. Running heads and the index are dropped. The decorated initials of section openings, lost in all three scans, were restored from later editions of the Garden where the opening is the same.",
                     'tier': 'A', 'tierEvidence': 'Challoner died in 1781; the 1916 reprint resets the 1741 text and is public domain in the US.'}],
        'toc': toc,
        'arrived': {'en-US': '2026-11-03'},
    }
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
