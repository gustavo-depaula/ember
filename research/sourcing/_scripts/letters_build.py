"""Letters of Anselm (PL 158, Libri I-II) and Bernard (PL 182) from the Corpus Corporum TEI.
usage: python3 -I letters_build.py anselm|bernard   (from repo root)"""
import re, json, sys, shutil
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from bernard_common import cc_sections

SMALL = set('ad et de in cum ac sive seu qui quae quod ex pro sub super contra inter apud a ab ut vel nec non per qua quo suum suam suos eum eundem eosdem eamdem eumdem'.split())
VAL = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}

def rnum(s):
    if s == 'PRIMA': return 1
    n = 0
    for i, ch in enumerate(s):
        v = VAL[ch]; n += -v if i + 1 < len(s) and VAL[s[i + 1]] > v else v
    return n

def nice(t):
    t = re.sub(r'\s+', ' ', t).strip(' .,;')
    if not t.isupper() and not re.search(r'[A-Z]{3,}', t): return t
    ws = t.lower().split(' ')
    return ' '.join(w if (i and w in SMALL) else w[:1].upper() + w[1:] for i, w in enumerate(ws))

def parse(path):
    letters = []; cur = None; prefix = []; book = None; books = []
    for s in cc_sections(path):
        h, paras = s['head'], s['paras']
        h0 = re.sub(r'^\d+\s+(?=EPISTOLA)', '', h)
        m = re.match(r'EPISTOLA\s+(PRIMA|[IVXLCDM]+)\b[.,]?\s*(.*)$', h0)
        if h.startswith('LIBER'):
            books.append(h); book = len(books); continue
        if m:
            rest = m.group(2)
            rest = re.sub(r'\[\s*(?:\*?al\*?\.?)[^\]]*\]\.?', '', rest)
            summ = re.findall(r'\*([^*]{8,})\*', rest)
            summary = summ[0].strip() if summ else ''
            rest = re.sub(r'\*[^*]{8,}\*', '', rest)
            src = re.findall(r'\[([^\]]{12,})\]', rest)
            rest = re.sub(r'\[[^\]]{12,}\]', '', rest).replace('*', '')
            cur = {'n': rnum(m.group(1)), 'book': book, 'who': nice(rest), 'summary': summary.rstrip('. ') + '.' if summary else '', 'body': list(prefix) + [], 'src': src}
            prefix = []
            letters.append(cur)
            for p in paras: cur['body'].append(p)
            continue
        if re.match(r'^(MONITUM|PRAEFATIO|EUGENII)', h):
            prefix.append(('*%s*' % nice(h.split('[')[0].split('(')[0])) if False else None)
            prefix = [x for x in prefix if x]
            prefix.append('*%s*' % re.sub(r'\*', '', h).strip())
            prefix += paras; continue
        if cur is None: continue
        if h and not re.match(r'^\d+\.?$', h): cur['body'].append('*%s*' % re.sub(r'\*', '', h).strip())
        cur['body'] += paras
    return letters, books

def render(L):
    t = 'Epistola %s' % L['roman']
    if L['who']: t += '. ' + L['who']
    body = ([ '*%s*' % L['summary'].rstrip('.') + '.'] if L['summary'] else []) + L['body'] + ['*[%s]*' % s for s in L['src']]
    return t, body

def roman(n):
    r = ''
    for v, s in [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r

if __name__ == '__main__':
    which = sys.argv[1]
    cfg = {'anselm': ('research/sourcing/anselm/cc/anselm-epist.xml', 'content/books/anselm-opera-omnia/epistolae'),
           'bernard': ('research/sourcing/bernard-of-clairvaux/cc/epistolae.xml', 'content/books/bernard-opera-omnia/epistolae')}[which]
    letters, books = parse(cfg[0]); d = Path(cfg[1])
    # Mabillon's heading numerals repeat a number where the sequence skips one (CXX twice, CCXXI twice): restore the skipped number
    for i, l in enumerate(letters[1:-1], 1):
        pv = letters[i - 1]['n']
        if l['n'] != pv + 1 and letters[i + 1]['n'] == pv + 2: l['n'] = pv + 1
    if d.exists(): shutil.rmtree(d)
    toc = []; grp = None; seen = {}
    for L in letters:
        L['roman'] = roman(L['n'])
        if which == 'anselm': key = L['book']; gid = 'liber-%d' % key; gt = {'la': ['Liber I. Epistolae Anselmi nondum abbatis', 'Liber II. Epistolae Anselmi abbatis Beccensis'][key - 1]}; cid = 'l%d-e%03d' % (key, L['n'])
        else:
            lo = (L['n'] - 1) // 50 * 50 + 1; key = lo; gid = 'epp-%03d-%03d' % (lo, lo + 49); gt = {'la': 'Epistolae %s-%s' % (roman(lo), roman(lo + 49))}; cid = 'e%03d' % L['n']
        if cid in seen: seen[cid] += 1; cid += chr(96 + seen[cid])
        else: seen[cid] = 1
        if grp is None or grp['id'] != gid: grp = {'id': gid, 'title': gt, 'children': []}; toc.append(grp)
        t, body = render(L)
        (d / 'la').mkdir(parents=True, exist_ok=True)
        (d / 'la' / (cid + '.md')).write_text('# %s\n\n%s\n' % (t, '\n\n'.join(body)), encoding='utf-8')
        grp['children'].append({'id': cid, 'title': {'la': t}})
    json.dump(toc, open('/tmp/ccx/%s_toc.json' % which, 'w'), ensure_ascii=False)
    print(which, len(letters), sum(len(' '.join(l['body']).split()) for l in letters))
