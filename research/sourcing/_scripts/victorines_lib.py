"""Victorine imports: turn Corpus Corporum (Migne PL 175-177, 196) TEI into chapter trees and write books.
Tree node: {'kind': 'ch', 'title', 'paras'} or {'kind': 'group', 'title', 'children': [...]}."""
import json, re, shutil, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from bernard_common import cc_sections, roman  # noqa: E402

CC = Path('research/sourcing/victorines/cc')
TOC_HEAD = re.compile(r'(?i)\bcapitula\b|^\[?tabula|\bcontenta\b|^cujus|partes sunt|^index\b|^synopsis')
BOOK_HEAD = re.compile(r'^(INCIPIT )?LIBER\b')
PART_HEAD = re.compile(r'^PARS\b')
CAP_LABEL = re.compile(r'^\[?CAP(?:UT|\.)?\s*([IVXLC]+|PRIMUM)\b')
BARE_CAP = re.compile(r'^\[?CAP(?:UT|\.)?\s*(?:[IVXLC]+|PRIMUM)[.,]?\]?\.?$')


def sentence_case(s):
    s = s.strip()
    def tok(t):
        return t.lower() if t.isupper() and len(t) > 1 and not re.fullmatch(r'[IVXLC]+[.,]?', t) else t
    s = ' '.join(tok(t) for t in s.split())
    s = re.sub(r'(^|[.:?!]\s+)([a-z])', lambda m: m.group(1) + m.group(2).upper(), s)
    return s


def clean_title(h):
    h = h.replace('*', '').strip()
    h = re.sub(r'^\[(.*)\]$', r'\1', h)
    if re.fullmatch(r'\d+\.?', h):
        h = 'Sectio ' + h.rstrip('.')
    if re.fullmatch(r'[IVXLC]+\.?', h):
        h = 'Caput ' + h.rstrip('.')
    h = re.sub(r'^(CAPUT|CAP\.?)(?=\s)', 'Caput', h)
    h = re.sub(r'^Caput PRIMUM\b', 'Caput primum', h)
    h = re.sub('(?i)incartione', lambda m: 'INCARNATIONE' if m.group(0).isupper() else 'incarnatione', h)
    h = re.sub(r'\s+', ' ', h).strip(' ')
    h = sentence_case(h)
    return h.rstrip(',') if h.endswith(',') else h


def short_group(t):
    t = re.sub(r'\*', '', t)
    if len(t) <= 80:
        return t
    first = re.split(r'(?<=[a-z\u00e6])\. ', t, maxsplit=1)
    out = first[0]
    if len(out) < 14 and len(first) > 1:
        out = out + '. ' + re.split(r'(?<=[a-z\u00e6])\. ', first[1], maxsplit=1)[0]
    return (out[:110].rsplit(' ', 1)[0] + '\u2026') if len(out) > 110 else out.rstrip('.')


def fix_prooemium(nodes):
    for n in nodes:
        if n['kind'] == 'group':
            if len(n['children']) == 1 and n['children'][0]['kind'] == 'ch' and n['children'][0]['title'] == 'Prooemium':
                n['children'][0]['title'] = n['title']
            fix_prooemium(n['children'])
    return nodes


def cap_num(h):
    m = CAP_LABEL.match(h)
    return None if not m else ('I' if m.group(1) == 'PRIMUM' else m.group(1))


def pl_info(path):
    x = Path(path).read_text(encoding='utf-8')[:3000]
    vol = re.search(r'Patrologia Latina, vol\. (\d+)', x)
    yr = re.search(r'<publicationStmt>.*?<date>(\d+)</date>', x, re.S)
    tid = re.search(r'<idno>([^<]+)</idno>', x)
    return (vol.group(1) if vol else '?', yr.group(1) if yr else '?', tid.group(1) if tid else '')


def sections_of(path):
    secs = cc_sections(path)
    out = []
    for i, s in enumerate(secs):
        h = s['head']
        if out and out[-1]['head'] == h and out[-1]['paras'] == s['paras']:
            continue
        s = dict(s)
        out.append(s)
    return out


def is_toc(secs, i):
    s = secs[i]; h = s['head']
    if TOC_HEAD.search(h) and not (PART_HEAD.match(h) or BOOK_HEAD.match(h) and s['paras'] and sum(len(p.split()) for p in s['paras']) > 600):
        return True
    if BARE_CAP.match(h) and i + 1 < len(secs):
        a, b = cap_num(h), cap_num(secs[i + 1]['head'])
        if a and a == b and len(s['paras']) <= 1:
            return True
    return False


def build_tree(path, default_title='Textus'):
    secs = sections_of(path)
    top = []; book = None; part = None
    def cur():
        return (part['children'] if part is not None else book['children'] if book is not None else top)
    for i, s in enumerate(secs):
        h = s['head']; paras = s['paras']
        if is_toc(secs, i):
            continue
        if BOOK_HEAD.match(h):
            book = {'kind': 'group', 'title': short_group(clean_title(re.sub(r'^INCIPIT ', '', h))), 'children': []}; part = None
            top.append(book)
            if paras: book['children'].append({'kind': 'ch', 'title': 'Prooemium', 'paras': paras})
            continue
        if PART_HEAD.match(h):
            part = {'kind': 'group', 'title': short_group(clean_title(h)), 'children': []}
            (book['children'] if book is not None else top).append(part)
            if paras: part['children'].append({'kind': 'ch', 'title': 'Prooemium', 'paras': paras})
            continue
        if not paras:
            continue
        cur().extend(split_big({'kind': 'ch', 'title': clean_title(h) or default_title, 'paras': paras}))
    for n in top:
        if n['kind'] == 'group': n['title'] = n['title'].rstrip('.')
    return fix_prooemium(top)


def split_big(ch, limit=6500, target=3500):
    """A chapter far longer than a reading unit is cut at paragraph boundaries into numbered parts."""
    words = sum(len(p.split()) for p in ch['paras'])
    if words <= limit or len(ch['paras']) < 3:
        return [ch]
    n = max(2, round(words / target)); per = words / n
    out, cur_, w = [], [], 0
    for p in ch['paras']:
        cur_.append(p); w += len(p.split())
        if w >= per and len(out) < n - 1:
            out.append(cur_); cur_, w = [], 0
    if cur_:
        out.append(cur_)
    return [{'kind': 'ch', 'title': '%s (pars %d)' % (ch['title'], i + 1), 'paras': ps} for i, ps in enumerate(out)]


def count(nodes):
    n = 0
    for x in nodes:
        n += sum(len(p.split()) for p in x['paras']) if x['kind'] == 'ch' else count(x['children'])
    return n


def md_para(p):
    return p


def write_tree(root, lang, nodes, counter=None):
    """Writes ch files under root/lang, returns toc nodes."""
    counter = counter if counter is not None else [0]
    toc = []
    for x in nodes:
        if x['kind'] == 'group':
            counter_ids = write_tree(root, lang, x['children'], counter)
            toc.append({'id': 'g%03d' % (len(toc) + 1 + 1000 * (counter[0] // 1000)) if False else 'g%s' % (counter[0] + 1), 'title': {lang: x['title']}, 'children': counter_ids})
            continue
        counter[0] += 1
        cid = 'c%03d' % counter[0]
        p = Path(root) / lang / (cid + '.md')
        p.parent.mkdir(parents=True, exist_ok=True)
        body = '\n\n'.join(x['paras'])
        p.write_text('# %s\n\n%s\n' % (x['title'], body), encoding='utf-8')
        toc.append({'id': cid, 'title': {lang: x['title']}})
    return toc


def fix_group_ids(toc, seen=None):
    seen = seen if seen is not None else [0]
    for n in toc:
        if 'children' in n:
            seen[0] += 1
            n['id'] = 'g%02d' % seen[0]
            fix_group_ids(n['children'], seen)
    return toc


AUTHOR_NAMES = {
    'hugh': {'la': 'Hugo de Sancto Victore', 'en-US': 'Hugh of St. Victor', 'pt-BR': 'Hugo de São Vítor'},
    'richard': {'la': 'Richardus de Sancto Victore', 'en-US': 'Richard of St. Victor', 'pt-BR': 'Ricardo de São Vítor'},
    'adam': {'la': 'Adamus de Sancto Victore', 'en-US': 'Adam of St. Victor', 'pt-BR': 'Adão de São Vítor'},
    'walter': {'la': 'Gualterus de Sancto Victore', 'en-US': 'Walter of St. Victor', 'pt-BR': 'Gualtério de São Vítor'},
    'victorines': {'la': 'Victorini', 'en-US': 'Victorine writers', 'pt-BR': 'Escritores de São Vítor'},
}
MONTH = {}


def source_entry(path, ccid_note=''):
    vol, yr, tid = pl_info(path)
    idno = re.search(r'idno=(\d+)', ccid_note)
    return vol, yr, tid


def write_book(author, slug, files, name, desc, composed, tree, dub=None, extra_sources=None, langs_extra=None,
               editions_extra=None, tier_note=None):
    """files: list of CC xml paths used (for sources). desc: dict la/en/pt. tree: nodes for la."""
    a = AUTHOR_NAMES[author]
    d = Path('content/books/%s-of-st-victor-opera-omnia' % author if author != 'victorines' else 'content/books/victorine-writers-opera-omnia') / slug
    if d.exists():
        shutil.rmtree(d)
    toc = fix_group_ids(write_tree(d, 'la', tree))
    vols = []
    srcs = []
    for f in files:
        vol, yr, tid = pl_info(f)
        vols.append((vol, yr))
        srcs.append({'language': 'la',
                     'url': 'https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=%s' % tid,
                     'edition': 'Migne, Patrologia Latina %s (Paris %s); TEI XML of the Corpus Corporum (University of Zurich), text %s, from the machine-corrected OCR of the Open Greek and Latin project.' % (vol, yr, tid),
                     'description': 'The complete PL text with its chapter divisions. PL page breaks and column numbers are dropped, and the PL tables of chapters (which repeat the chapter headings) are not imported. The OCR carries a few residual slips.%s' % (' ' + dub if dub else ''),
                     'tier': 'A',
                     'tierEvidence': 'Migne’s Patrologia Latina (1854–1855) prints the medieval text; public domain everywhere.'})
        (d / 'sources' / 'latin-originals').mkdir(parents=True, exist_ok=True)
        shutil.copy(f, d / 'sources' / 'latin-originals' / (Path(f).stem + '.xml'))
    vol, yr = vols[0]
    meta = {'id': '%s-%s' % (author, slug) if author != 'victorines' else slug,
            'cover': 'classic', 'name': name,
            'author': a,
            'description': {'la': desc['la'], 'en-US': desc['en'] + ' Latin only, from the Migne text (Patrologia Latina %s, %s), a machine-corrected OCR.' % (vol, yr), 'pt-BR': desc['pt']},
            'composed': composed, 'languages': ['la'], 'work': '%s/%s' % (author if author != 'victorines' else 'victorines', slug),
            'editions': {'la': {'editor': 'J.-P. Migne (Patrologia Latina %s)' % vol, 'year': int(yr) if yr.isdigit() else 1854}},
            'sources': srcs, 'toc': toc}
    (d / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return d


def tree_for(files, group_titles=None, default_title='Textus'):
    """One file -> its tree. Several files -> a group per file (a bare chapter when the file has one)."""
    if len(files) == 1:
        return build_tree(files[0], default_title)
    out = []
    for f, t in zip(files, group_titles):
        sub = build_tree(f, t)
        if len(sub) == 1 and sub[0]['kind'] == 'ch':
            sub[0]['title'] = t if sub[0]['title'] in (t, 'Textus', t.upper()) or True else sub[0]['title']
            out.append(sub[0])
        elif len(sub) == 0:
            continue
        else:
            out.append({'kind': 'group', 'title': t, 'children': sub})
    return out
