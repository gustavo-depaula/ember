"""lf/VOL.json -> content/books/church-fathers/augustine/enarrationes-in-psalmos-lf-vol-N/ (en-US only, chapter per psalm)."""
import sys, re, json, os
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import rhb_build
ROOT = '/Users/gustavo/Documents/prayer/content/books/church-fathers/augustine/'
VOLS = [('24', 1, 1847, 'I'), ('25', 2, 1848, 'II'), ('30', 3, 1849, 'III'), ('32', 4, 1850, 'IV'), ('37', 5, 1853, 'V'), ('39', 6, 1857, 'VI')]
def vul(L):
    if L <= 9 or L >= 148: return str(L)
    if L == 114 or L == 115: return '113'
    if L == 116: return '114–115'
    if L == 147: return '146–147'
    return str(L - 1)
def lab_of(sub, i):
    t = sub[0].upper().strip(' .*,')
    t = re.sub(r'\bT$', 'I', t)
    return t.title().replace('The ', 'the ') if t else 'Part %d' % i
TAIL = [r'\s*14 DAY USE.*$', r'\s*FROM ITS COMMENCEMENT.*$', r'\s*Baxter, printer, oxford\.?$', r'\s*PUBLICATION OF THE ORIGINAL TEXTS.*$']
def clean(p):
    for a, b in rhb_build.OCR: p = re.sub(a, b, p)
    for t in TAIL: p = re.sub(t, '', p)
    return p.strip()
def build(vol, k, year, rom):
    chaps = json.load(open('/Users/gustavo/Documents/prayer/research/sourcing/augustine-latin/lf/%s.json' % vol))
    slug = 'enarrationes-in-psalmos-lf-vol-%d' % k
    d = ROOT + slug + '/'
    os.makedirs(d + 'en-US', exist_ok=True)
    toc = []; words = 0
    for c in chaps:
        a, b = c['n'], c['end']
        cid = 'ps-%03d' % a + ('-%03d' % b if b != a else '')
        if a == b: title = 'Psalm %d' % a
        else: title = 'Psalms %d–%d' % (a, b)
        va = vul(a) if a == b else '%s–%s' % (vul(a).split('–')[0], vul(b).split('–')[-1])
        if '–' in va and va.split('–')[0] == va.split('–')[1]: va = va.split('–')[0]
        if va != str(a) and va != title.split()[-1]: title += ' (Vulgate %s)' % va
        secs = c['sections']
        out = ['# ' + title]
        for i, s in enumerate(secs, 1):
            ps = [x for x in (clean(p) for p in s['paras']) if x]
            if len(secs) > 1:
                lab = lab_of(s['sub'], i) if s['sub'] else ('Sermon %d' % i if len(secs) >= 10 else 'Part %d' % i)
                out.append('## ' + lab)
            out += ps
        txt = '\n\n'.join(out) + '\n'
        words += len(txt.split())
        open(d + 'en-US/%s.md' % cid, 'w').write(txt)
        toc.append({'id': cid, 'title': {'en-US': title}})
    first, last = chaps[0]['n'], chaps[-1]['end']
    rng = 'Psalms %d–%d' % (first, last)
    book = {
        'id': 'augustine-' + slug, 'cover': 'quarter',
        'name': {'en-US': 'Expositions on the Book of Psalms, Vol. %s (%s)' % (rom, rng), 'pt-BR': 'Exposições sobre o Livro dos Salmos, vol. %s (Salmos %d–%d)' % (rom, first, last)},
        'author': {'la': 'Aurelius Augustinus Hipponensis (354-430)', 'en-US': 'Augustine of Hippo', 'pt-BR': 'Agostinho de Hipona'},
        'description': {'en-US': 'Augustine’s Enarrationes in Psalmos in the full Oxford translation of the Library of the Fathers (volume %s of the Psalms, %d): %s, one chapter per psalm, with the separate expositions, sermons and discourses of a psalm as sections. The translation numbers the psalms as the English Bible does; the Vulgate number (Augustine’s own) is added to the title where it differs. This is the complete text, which the condensed NPNF version in the other book of this work abridges.' % (rom, year, rng),
                        'pt-BR': 'As Enarrationes in Psalmos de Agostinho na tradução oxfordiana completa da Library of the Fathers (volume %s dos Salmos, %d): Salmos %d–%d, um capítulo por salmo. A numeração é a da Bíblia inglesa; onde difere, o título traz o número da Vulgata, que é o de Agostinho.' % (rom, year, first, last)},
        'composed': '392-420', 'languages': ['en-US'], 'work': 'augustine/enarrationes-in-psalmos',
        'editions': {'en-US': {'translator': 'Members of the English Church (Library of the Fathers, ed. E. B. Pusey)', 'year': year}},
        'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/%sALibraryOfFathersOfTheHolyCatholicV%s' % (vol, vol),
                     'edition': 'Expositions on the Book of Psalms by S. Augustine, Bishop of Hippo (Library of the Fathers of the Holy Catholic Church, vol. %s; Oxford: John Henry Parker, %d).' % (vol, year),
                     'description': 'Internet Archive scan, read from the _djvu.xml word coordinates (research/sourcing/_scripts/aug_lf.py, aug_lf_ps_build.py): marginal Scripture references, running heads, small-type notes and the volume’s front and back matter are dropped; psalm boundaries come from the printed PSALM headings, recovered in sequence where the OCR spoiled them (a psalm whose heading was lost is merged with its neighbour and titled as a range). OCR is uncorrected beyond common letter confusions and stray fragments of marginal references remain in some lines.',
                     'tier': 'A', 'tierEvidence': 'Published 1847-1857 (Library of the Fathers, Oxford); long public domain.'}],
        'toc': toc}
    json.dump(book, open(d + 'book.json', 'w'), ensure_ascii=False, indent=2); open(d + 'book.json', 'a').write('\n')
    print(slug, len(toc), words)
for v in VOLS: build(*v)
