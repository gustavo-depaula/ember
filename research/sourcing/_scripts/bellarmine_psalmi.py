import sys, re, difflib; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
def rfull(n):
    r = ''
    for v, s in [(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r
def norm(s): return s.upper().replace('1', 'I').replace('|', 'I').replace('T', 'I').replace('Y', 'V').replace('U', 'V').replace('.', '').replace(' ', '')
def find_psalms(paras, rx, lo=0, hi=None, maxn=150):
    """sequential psalm heading search: heading text must be close to the roman numeral of the next psalm."""
    hi = hi or len(paras); out = []; n = 1; i = lo
    while i < hi and n <= maxn:
        p = paras[i]
        m = re.match(rx, p) if len(p) < 40 else None
        if m:
            x = norm(m.group(1)); want = rfull(n)
            # accept the expected psalm, or a skip of one/two when the heading matches that numeral
            for k in (0, 1, 2):
                if difflib.SequenceMatcher(None, x, rfull(n + k)).ratio() >= .84 and x != (rfull(n - 1) if n > 1 else ''):
                    n += k; out.append((n, i)); n += 1; break
        i += 1
    return out
def find_any(paras, rx, lo=0):
    out = []; last = 0
    for i in range(lo, len(paras)):
        p = paras[i]
        m = re.match(rx, p) if len(p) < 40 else None
        if not m: continue
        x = norm(m.group(1))
        best = max(range(last + 1, 151), key=lambda k: difflib.SequenceMatcher(None, x, rfull(k)).ratio(), default=None)
        if best and difflib.SequenceMatcher(None, x, rfull(best)).ratio() >= .85 and best - last <= 12:
            out.append((best, i)); last = best
    return out
if __name__ == '__main__' and len(sys.argv) == 1:
    la = bc.clean_volume(10).split('\n\n') + bc.clean_volume(11).split('\n\n')
    # keep volume order; the index of volume 11 starts at 'INDEX'
    end10 = len(bc.clean_volume(10).split('\n\n'))
    stop = end10 + next(i for i, p in enumerate(bc.clean_volume(11).split('\n\n')) if re.match(r'^INDEX\b', p) and i > 5000)
    ps = find_psalms(la, r'^PSALMUS\.?\s+([IVXLCTYl1|U]+)\.?$', 0, stop)
    print(len(ps), [n for n, i in ps][:12], [n for n in range(1, 151) if n not in [a for a, b in ps]])
    E = en_paras(bc.SRC + '/en/commentaryonbook0000bell.txt')
    pe = find_psalms(E, r'^PSALM\.?\s+([IVXLCTYl1|U]+)\.?$')
    print(len(pe), [n for n in range(1, 151) if n not in [a for a, b in pe]])

def build_latin():
    v10 = bc.clean_volume(10).split('\n\n'); v11 = bc.clean_volume(11).split('\n\n')
    stop11 = next(i for i, p in enumerate(v11) if re.match(r'^INDEX\b', p) and i > 5000)
    la = v10 + v11[:stop11]
    ps = find_psalms(la, r'^PSALMUS\.?\s+([IVXLCTYl1|U]+)\.?$')
    pre_end = ps[0][1]
    chapters = []
    pre = [bc.fix(p) for p in clean_body(la[:pre_end])]
    for k, (n, i) in enumerate(ps):
        nxt = ps[k + 1][1] if k + 1 < len(ps) else len(la)
        body = [bc.fix(p) for p in clean_body(la[i + 1:nxt])]
        h = f'Psalmus {n}'
        chapters.append(dict(id=f'ps{n:03d}', title={'la': h, 'en-US': f'Psalm {n}'}, md={'la': (h, body)}))
    if words(' '.join(pre)) >= 100:
        chapters.insert(0, dict(id='praefatio', title={'la': 'Praefatio', 'en-US': 'Preface'}, md={'la': ('Praefatio', pre)}))
    return chapters
if __name__ == '__main__' and len(sys.argv) > 1:
    chapters = build_latin()
    names = {'la': 'Explanatio in Psalmos', 'en-US': 'Commentary on the Book of Psalms', 'pt-BR': 'Comentário aos Salmos'}
    descs = {'la': 'Commentarius in omnes Psalmos (1611), ad sensum litteralem et ex Patribus, numeratione Vulgatae. Textus ex editione Vivès (1870-74), tomi X-XI, ex scanno OCR.',
             'en-US': 'Bellarmine\'s commentary on all the Psalms (1611), literal and patristic, in the Vulgate numbering. The Latin is the Vivès edition (1870-74), volumes 10-11, from an OCR scan.',
             'pt-BR': 'O comentário do cardeal a todos os Salmos (1611), literal e patrístico, na numeração da Vulgata.'}
    E = en_paras(bc.SRC + '/en/commentaryonbook0000bell.txt')
    pe = find_any(E, r'^PSALM\.?\s+([IVXLCTYl1|U]+)\.?$')
    ids = {c['id']: c for c in chapters}
    print('english psalms', len(pe))
    for k, (n, i) in enumerate(pe):
        nxt = pe[k + 1][1] if k + 1 < len(pe) else next((j for j in range(i, len(E)) if re.match(r'^(INDEX|END)\b', E[j]) and j > i + 50), len(E))
        body = [q for q in E[i + 1:nxt] if not isjunk(q)]
        key = f'ps{n:03d}'
        if key in ids:
            ids[key]['md']['en-US'] = (f'Psalm {n}', body)
        else:
            prev = max((c for c in ids if c.startswith('ps') and c < key), default=None)
            if prev:
                c = ids[prev]
                if 'en-US' not in c['md']: c['md']['en-US'] = (c['title']['en-US'], [])
                c['md']['en-US'][1].extend([f'## Psalm {n}'] + body)
    srcs = [vives_source(10), vives_source(11), {'language': 'en-US', 'url': 'https://archive.org/details/commentaryonbook0000bell', 'edition': "A Commentary on the Book of Psalms, trans. John O'Sullivan (Dublin: James Duffy, 1866).", 'description': 'Archive.org OCR (djvu.txt); the translation covers only the psalms recited in the daily office (about 120 of the 150), under the same Vulgate numbers; page heads and notes of the translator are left as printed where the OCR did not separate them.', 'tier': 'A', 'tierEvidence': 'Published 1866; public domain.'}]
    d = mkbook('bellarmine-explanatio-in-psalmos', 'explanatio-in-psalmos', names, descs, '1611', ['la', 'en-US'], {'la': dict(VIVES_ED), 'en-US': {'translator': "John O'Sullivan", 'year': 1866}}, srcs)
    print(write_book('explanatio-in-psalmos', d, chapters)); author_file()
