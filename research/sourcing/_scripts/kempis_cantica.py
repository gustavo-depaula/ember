"""Pohl IV, Cantica: hymns numbered I-CX, verse with hard line breaks (two trailing spaces) and blank-line stanzas."""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from kempis_common import capsish
import kempis_fix as kf

F = 'research/sourcing/kempis/pohl/operaomnia0000thom_q8k7.txt'
START, END = 10215, 19182
LAB = {'HYMNVS', 'SEQVENTIA', 'ANTIPHONA', 'RHYTHMVS', 'ORATIO', 'RESPONSORIVM', 'VERSVS', 'PROSA', 'CANTICVM', 'ALIVD'}
NUM = re.compile(r'^\s*([IVXLCl1]{1,8})[.\-,]?\s*(?:\d{1,2})?\s*$')


def rom(s):
    s = s.replace('l', 'I').replace('1', 'I')
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
    t = 0
    for a, b in zip(s, s[1:] + ' '):
        t += -v[a] if b != ' ' and v[a] < v[b] else v[a]
    return t


def noise(s):
    t = s.strip()
    return (not t or re.match(r'^[\d\s.,_|\-\[\]]+$', t) or 'CANTICA' in t or 'INITIA' in t or t.startswith('Thomae a K')
            or sum(c.isalpha() for c in t) < 0.5 * len(t))


MARK = re.compile(r'^\s*(?:\d{1,2}\s+)?([IVXLC][IVXLCl1ilJ]{0,8})[.,\-:\'’]*\s*(?:\d{1,2})?\s*[.,]?\s*$|^\s*([l1iJ]{2,})[.,]\s*$')
LNUM = re.compile(r'^\d{1,2}\s+|\s+\d{1,2}$')


def hymns():
    L = open(F, errors='replace').read().split('\n')[START:END]
    marks, last = [], 0
    for i, l in enumerate(L):
        m = MARK.match(l)
        if not m:
            continue
        raw = m.group(1) or m.group(2)
        t = raw.replace('l', 'I').replace('1', 'I').replace('i', 'I').replace('J', 'I')
        n = rom(t)
        if n <= last:
            if n < last - 3:
                continue
            n = last + 1
        marks.append((i, n))
        last = n
    return L, marks


def recase(t):
    from kempis_pair import uptitle, title_of
    t = re.sub(r'\s+', ' ', LNUM.sub('', t)).strip()
    t = re.sub(r'(\w)- (\w)', r'\1\2', t)
    t = title_of(uptitle(t))
    return t[:1].upper() + t[1:]


def index_entries():
    L = open(F, errors='replace').read().split('\n')[9930:10218]
    out = []
    for l in L:
        l = re.sub(r'^\d{1,2}\s+', '', l.strip())
        l = re.sub(r'[\s.,\-<>=%+:;e·]*(?:[pP]p?\.\s*)?\d{2,3}\s*[-.,]?\s*$', '', l)
        l = re.sub(r'(?: [.,\-<>=%+:;·«»s9e ]{1,2})+$', '', l)
        if len(l) >= 8 and l[0].isalpha():
            out.append(l.strip())
    return out


def fix_incipit(line, entries):
    """Restore a verse's first words lost to the drop capital from the alphabetical index of incipits."""
    import difflib
    w = line.split()
    while len(w) > 2 and re.match(r'^[A-Z]{1,4}$', w[0]) and w[0] not in ('O', 'A', 'E'):
        w = w[1:]
    def n(x): return re.sub(r'[^a-z]', '', x.lower().replace('v', 'u').replace('j', 'i').replace('l', 'i'))
    best = None
    for e in entries:
        ew = e.split()
        for j in range(0, min(len(ew), 3)):
            for k in range(0, min(len(w), 3)):
                if j + 1 >= len(ew) and j == 0 and len(ew) > 1:
                    continue
                if n(ew[j]) and n(w[k]) and difflib.SequenceMatcher(None, n(ew[j]), n(w[k])).ratio() >= 0.85 and len(n(w[k])) >= 4:
                    # need the entry's words after j to match the line's words after k
                    rest = list(zip(ew[j + 1:j + 3], w[k + 1:k + 3]))
                    if all(difflib.SequenceMatcher(None, n(x), n(y)).ratio() >= 0.8 for x, y in rest) and (len(rest) == 2 or j + 1 >= len(ew) - 1 and len(rest) >= 1 or (j + 1 == len(ew) and j == 0)):
                        score = j + len(rest) * 2
                        if not best or score > best[0]:
                            best = (score, ew[:j], w[k:])
    if best:
        return ' '.join(best[1] + best[2])
    return ' '.join(w)


def verse(lines, entries):
    out, blank = [], True
    for l in lines:
        t = LNUM.sub('', re.sub(r'\s+', ' ', l).strip())
        if noise(l):
            if not l.strip() and not blank:
                out.append('')
                blank = True
            continue
        t = kf.fix_ocr(t.replace('ſ', 's'))
        t = re.sub(r'[\^@■•¢€§|{}~<>\\]', '', t)
        out.append(t)
        blank = False
    while out and not out[-1]:
        out.pop()
    # drop a trailing page-number-like line
    return out


def build():
    import bookjson
    L, marks = hymns()
    entries = index_entries()
    d = 'content/books/kempis-opera-omnia/cantica'
    os.makedirs(d + '/la', exist_ok=True)
    toc, words = [], 0
    for q, (i, n) in enumerate(marks):
        j = marks[q + 1][0] if q + 1 < len(marks) else len(L)
        seg = L[i + 1:j]
        k, tl = 0, []
        while k < len(seg) and len(tl) < 7:
            t = seg[k].strip()
            if not t or noise(seg[k]):
                if tl and not t and k + 1 < len(seg) and seg[k + 1].strip() and not capsish(LNUM.sub('', seg[k + 1].strip())):
                    break
                k += 1
                continue
            if capsish(LNUM.sub('', t)) or re.match(r'^\W*(?:[A-Z]+)\W*$', t):
                tl.append(t)
                k += 1
            else:
                break
        words_t = ' '.join(LNUM.sub('', x) for x in tl)
        label = ''
        m = re.search(r'\b(HYMNVS|SEQVENTIA|ANTIPHONA|ANTIPHONAE|RHYTHMVS|ORATIO)\b.{0,12}$', words_t)
        if m:
            label = m.group(1).capitalize()
            words_t = words_t[:m.start()]
        body = verse(seg[k:], entries)
        if body:
            body[0] = fix_incipit(body[0], entries)
        title = recase(words_t) if words_t.strip(' .:') else ''
        if not title or len(re.sub(r'[^a-z]', '', title.lower())) < 8 or not re.search(r'[aeiou]{1}[^aeiou ]{1,3}[aeiou]', title.lower()) or title.split()[-1].lower() in ('wss', 'yess', 'wes', 'iin', 'inn', 'ina'):
            title = (body[0] if body else 'Canticum').rstrip(',;:.')
        SHORT = {'in', 'ad', 'et', 'de', 'ab', 'ex', 'ut', 'te', 'me', 'si', 'ne', 'an', 'o', 'a', 'e', 'ecce', 'ave', 'est', 'qui', 'quae', 'quid', 'sum', 'tu', 'ego', 'nos', 'vos', 'hic', 'hoc', 'ora', 'hac', 'ita', 'rex', 'sic'}
        tk = title.split()
        while len(tk) > 2 and (len(tk[0]) <= 3 and tk[0].lower().strip('.,:;') not in SHORT or re.search(r'[^A-Za-z.,;:\'-]', tk[0])):
            tk = tk[1:]
        title = ' '.join(tk)
        title = re.sub(r'[\s—\-.:;,]+(?:[a-z]{1,2})?$', '', title)
        title = re.sub(r'^\W+', '', title)
        if len(re.sub(r'[^A-Za-z]', '', title)) < 6:
            title = 'Canticum'
        title = title[:1].upper() + title[1:]
        t = f'{n}. {title}'
        txt = '# ' + t + '\n\n' + (f'*{label}.*\n\n' if label else '')
        stz, cur = [], []
        for ln in body + ['']:
            if ln:
                cur.append(ln)
            elif cur:
                stz.append('  \n'.join(cur))
                cur = []
        txt += '\n\n'.join(stz) + '\n'
        cid = f'h{q + 1:03d}'
        open(f'{d}/la/{cid}.md', 'w').write(txt)
        words += len(txt.split())
        toc.append({'id': cid, 'title': {'la': t}})
    print(len(marks), words)
    return d, toc, words


def write_book():
    d, toc, words = build()
    ED = {'la': {'editor': 'Michael Joseph Pohl', 'year': 1918}}
    book = {'id': 'kempis-cantica', 'cover': 'classic',
      'name': {'la': 'Cantica', 'en-US': 'Hymns and Sacred Songs', 'pt-BR': 'Cânticos'},
      'author': {'la': 'Thomas a Kempis', 'en-US': 'Thomas à Kempis', 'pt-BR': 'Tomás de Kempis'},
      'description': {'la': 'Cantica Thomae a Kempis: hymni, sequentiae, antiphonae et rhythmi de Iesu, de Maria, de angelis et sanctis (praesertim virginibus), de gloria caelesti et de vita spirituali.',
        'en-US': 'The hymns, sequences, antiphons and rhymes of Thomas: on Jesus and his name, the Virgin, angels and saints (above all the virgin martyrs Agnes, Cecilia and Barbara), heavenly glory, patience and the spiritual life. Latin only: Pohl\'s critical edition (Freiburg 1918), from a raw OCR of the printed volume; no public-domain English translation has been found. Verse lines are kept as printed.',
        'pt-BR': 'Os hinos, sequências, antífonas e rimas de Tomás: sobre Jesus e seu nome, a Virgem, os anjos e santos (sobretudo as virgens mártires Inês, Cecília e Bárbara), a glória celeste, a paciência e a vida espiritual.'},
      'composed': 'c. 1420-1470', 'languages': ['la'], 'work': 'thomas-a-kempis/cantica', 'editions': ED,
      'sources': [{'language': 'la', 'url': 'https://archive.org/details/operaomnia0000thom_q8k7', 'edition': 'Thomae Hemerken a Kempis Cantica, ed. M. J. Pohl (Freiburg: Herder 1918), Opera omnia IV, pp. 241-; archive.org raw OCR (Pohl 1918 volume).',
        'description': 'The hymns as Pohl numbers them (I-CX; a few numerals lost to OCR leave gaps or merge neighbours), with the verse lines kept as hard line breaks and stanzas as paragraphs. Titles are Pohl\'s upper-case headings recased, or the first line where there is none. Line numbers, running heads and page breaks stripped by script; the alphabetical index of incipits was used to restore first words lost to drop capitals. Raw OCR: drop capitals and many first lines remain garbled.', 'tier': 'A', 'tierEvidence': 'Pohl 1918; Thomas died in 1471.'}],
      'toc': toc}
    bookjson.write(d, book)
    os.makedirs(d + '/sources/la-originals', exist_ok=True)
    os.system(f"cp '{F}' '{d}/sources/la-originals/'")



import bookjson
if __name__ == '__main__' and 'build' in sys.argv:
    write_book()
