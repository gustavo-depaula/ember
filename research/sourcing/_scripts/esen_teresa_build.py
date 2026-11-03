"""Stanbrook letters.json (esen_teresa_parse.py) -> content/books/teresa-opera-omnia/epistolario-stanbrook, numbered by Silverio where matched."""
import re, os, sys, json, unicodedata, glob
sys.path.insert(0, os.path.dirname(__file__))
import esen_lib as B
ROOT = B.ROOT
MON = {'ene': 1, 'jan': 2 - 1, 'feb': 2, 'mar': 3, 'abr': 4, 'apr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'aug': 8, 'sep': 9, 'set': 9, 'oct': 10, 'nov': 11, 'dic': 12, 'dio': 12, 'dec': 12}
ALIAS = {'baptist': 'bautista', 'joseph': 'jose', 'jerome': 'jeronimo', 'john': 'juan', 'peter': 'pedro', 'mary': 'maria', 'anne': 'ana', 'augustine': 'agustin', 'cross': 'cruz', 'incarnation': 'encarnacion', 'philip': 'felipe', 'teutonio': 'teotonio', 'teutonic': 'teotonio', 'braganza': 'braganza', 'alonzo': 'alonso', 'grecian': 'gracian', 'domingo': 'domingo', 'catherine': 'catalina', 'isabel': 'isabel', 'francis': 'francisco', 'anthony': 'antonio', 'laurence': 'lorenzo', 'elizabeth': 'isabel', 'ambrose': 'ambrosio', 'christ': 'cristo', 'jesus': 'jesus', 'alberto': 'alberto', 'albert': 'alberto'}
STOP = set('don dona da d dna to the of at in and a al la las el los del de father fray fr padre madre mother sister sor senor sra senora citizen saint saints st s his her one bishop prioress prior rev reverend very most venerable illustrious carmelite nuns descalzas descalzos los las hermano brother sister wife de y en'.split())
def norm(s): return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
def toks(s):
    out = set()
    for w in re.findall(r'[a-z]+', norm(s)):
        w = ALIAS.get(w, w)
        if w not in STOP and len(w) > 2: out.add(w[:5])
    return out
def pdate(s):
    s = norm(s); y = re.search(r'15\d\d', s); y = int(y.group()) if y else None
    m = None
    for w in re.findall(r'[a-z]+', s):
        if w[:3] in MON and len(w) >= 3 and w not in ('mar', 'may') or w in ('mar', 'may', 'marzo', 'mayo', 'march'):
            m = MON.get(w[:3]); break
    d = re.search(r'\b(\d{1,2})\b', re.sub(r'15\d\d', '', s)); d = int(d.group(1)) if d and 1 <= int(d.group(1)) <= 31 else None
    return y, m, d
def spanish():
    out = {}
    for f in sorted(glob.glob(ROOT + '/content/books/teresa-opera-omnia/epistolario/es-ES/l*.md')):
        n = int(os.path.basename(f)[1:4]); line = open(f).read().split('\n')[2].strip('*')
        who, _, when = line.partition(' — ') if ' — ' in line else line.partition('.—')
        out[n] = (toks(who), pdate(when), line)
    return out
def fixnum(t): return ' '.join(re.sub(r'(?<=\d)[ilIoO](?=\d|\b)|\b[ilI]+(?=\d)', lambda m: {'i': '1', 'l': '1', 'I': '1', 'o': '0', 'O': '0'}[m.group()[0]] * len(m.group()), w) if re.search(r'\d', w) or re.fullmatch(r'[ilIoO]{1,2}[,.]?', w) and False else w for w in t.split())
def cdate(d):
    d = re.sub(r"[\^*]|'(?=\s|$)|[\^*'‘’]+$", '', d).strip(" '.,")
    d = re.sub(r'\b([il])(\d)\b', r'1\2', d); d = re.sub(r'\b(\d)([il])\b', r'\g<1>1', d); d = re.sub(r'\b(ii|li|il)\b', '11', d); d = re.sub(r'\blo\b', '10', d)
    d = re.sub(r'\b([il])\s(\d)\b', r'1\2', d)
    d = re.sub(r'(15\d\d)[^\s,]*', r'\1', d); d = re.sub(r'[!?]+$', '', d.strip())
    d = re.sub(r'\s+', ' ', d)
    return d
SMALL = {'of', 'the', 'at', 'to', 'in', 'de', 'la', 'del', 'and', 'las', 'los', 'y'}
def tcase(h):
    h = re.sub(r'^TO\s+', '', h); h = re.sub(r'[=\^*]|\s\d{1,3}$|[¡j]*$', '', h).strip(' ,.')
    w = h.title().split()
    w = [x.lower() if (i and x.lower() in SMALL) else x for i, x in enumerate(w)]
    h = ' '.join(w); h = re.sub(r"(['\u2019])S\b", r"\1s", h)
    return re.sub(r'\b(Sj|S\.j\.|Sj\.)\b', 'S.J.', h)
def main(files):
    sp = spanish(); letters = []
    for path, f in files:
        d = json.load(open(path)); prev = f - 1
        for i, x in enumerate(d):
            nxt = next((y['num'] for y in d[i + 1:] if y['num']), 10**6)
            if x['num'] is None:
                if len(' '.join(x['paras']).split()) < 25: continue
                if prev + 1 < nxt: x['num'] = prev + 1
            if x['num']: prev = x['num']
            letters.append(x)
    cands = []
    for k, x in enumerate(letters):
        y, m, d = pdate(x['date']); wt = toks(re.sub(r'^TO\s+', '', x['heading']))
        for n, (st, (sy, sm, sd), _) in sp.items():
            if not (y and sy and y == sy): continue
            if not (m and sm and m == sm): continue
            ov = len(wt & st)
            if not ov: continue
            sc = 10 * ov + (6 if d and sd and d == sd else 0) + (3 if m and sm else 0) - (8 if d and sd and d != sd else 0)
            if d and sd and abs(d - sd) > (7 if ov >= 2 else 2): continue
            cands.append((sc, k, n))
    used_s, used_e, match = set(), set(), {}
    for sc, k, n in sorted(cands, reverse=True):
        if k in used_e or n in used_s: continue
        used_e.add(k); used_s.add(n); match[k] = n
    chs = []; seen = {}
    for k, x in enumerate(letters):
        n = match.get(k); who = tcase(x['heading']) if x['heading'] else ''
        when = cdate(x['date'])
        label = 'Letter %d' % n if n else 'Letter (number unidentified)'
        head = ('To ' + re.sub(r'^The\b', 'the', who) if who else re.split(r'[,.;]', x['summary'].strip("' "))[0][:70])
        title = '%s. %s, %s' % (label, re.sub(r'^To To ', 'To ', head), when) if when else '%s. %s' % (label, head)
        title = re.sub(r"\s+", ' ', title).replace(' ,', ',')
        cid = 's%03d' % (k + 1)
        body = ''
        if x['summary']: body += '*' + x['summary'].strip("' ") + '*\n\n'
        body += '\n\n'.join(x['paras'])
        chs.append((cid, title, body))
    return chs, match, letters
if __name__ == '__main__':
    chs, match, letters = main([('/tmp/esen/L1.json', 1), ('/tmp/esen/L2.json', 101), ('/tmp/esen/L3.json', 201), ('/tmp/esen/L4.json', 316)])
    sp0 = spanish()
    print(len(chs), 'letters;', len(match), 'matched')
    import random; random.seed(3)
    for k in sorted(random.sample(list(match), 25)): print(chs[k][1], '<=>', sp0[match[k]][2][:90])
    json.dump(chs, open('/tmp/esen/chs.json', 'w'))
    RAW = ROOT + '/research/sourcing/teresa-of-avila/raw/'
    cfg = {'id': 'teresa-epistolario-stanbrook', 'dir': 'teresa-opera-omnia/epistolario-stanbrook', 'work': 'teresa-of-avila/epistolario',
           'name': 'The Letters of Saint Teresa (Stanbrook)', 'name_pt': 'Cartas de Santa Teresa (Stanbrook, inglês)',
           'author': 'St. Teresa of Ávila', 'author_es': 'Santa Teresa de Jesús', 'author_pt': 'Santa Teresa de Ávila',
           'desc': "St. Teresa's letters in English, as translated, arranged and annotated by the Benedictines of Stanbrook (London: Thomas Baker, 1919-1924; Cardinal Gasquet's introduction). Stanbrook orders and numbers the letters differently from Silverio's Spanish Epistolario, so this is its own book. Each letter is titled with its number in the Spanish book where it could be matched by addressee and date, and 'number unidentified' where not; the editor's one-line summary of each letter is in italics. Letters by others that Stanbrook prints beside Teresa's (Luis Bertrand, Peter of Alcántara, John of Ávila) are left out, as are the editor's footnotes and the appendices.",
           'desc_pt': 'As cartas de Santa Teresa em inglês, traduzidas e anotadas pelas Beneditinas de Stanbrook (Londres, 1919-1924), numeradas pelo Epistolario espanhol de Silverio quando foi possível identificar a carta.',
           'composed': '1546–1582', 'translator': 'Benedictines of Stanbrook', 'year': 1919,
           'url': 'https://archive.org/details/letterst01tere',
           'edition': "The Letters of Saint Teresa: a complete edition translated from the Spanish and annotated by the Benedictines of Stanbrook, 4 vols., London: Thomas Baker, 1919-1924 (archive.org: letterst01tere, letterst02tere, lettersofsaintte03tere, lettersofsaintte0004card).",
           'srcdesc': "Internet Archive OCR of the four volumes, split on the capitalised addressee headings. Running heads, page numbers and footnotes are dropped, line-break hyphens joined. The OCR is rough in places (isolated misreadings remain, and a few short letters may be run into a neighbour or the editor's note text may stay at a page foot). Letters whose heading could not be matched to the Spanish book by addressee and date are 'number unidentified'."}
    B.write_book(cfg, chs, [RAW + 'ia-letterst01tere.txt', RAW + 'ia-letterst02tere.txt', RAW + 'ia-lettersofsaintte03tere.txt', RAW + 'ia-lettersofsaintte0004card.txt'])
