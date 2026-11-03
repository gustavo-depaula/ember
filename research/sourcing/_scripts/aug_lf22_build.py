"""LF 22 (Oxford 1847) De fide et operibus and De agone christiano -> en-US/ch001.md of the Latin books."""
import sys, re, json, os
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from aug_lf_text import *
import rhb_build
XML = '/Users/gustavo/Documents/prayer/research/sourcing/augustine-latin/xml/seventeenshort00augu_djvu.xml'
BASE = '/Users/gustavo/Documents/prayer/content/books/church-fathers/augustine/'
pgs = load_pages(XML)
def clean(p):
    for a, b in rhb_build.OCR: p = re.sub(a, b, p)
    p = re.sub(r'\s+([;:!?,.])', r'\1', p)
    p = re.sub(r'\s+', ' ', p).strip()
    return p
for slug, a, b, st, en, title in (('de-fide-et-operibus', 48, 95, 'It is the judgment of certain', 'fianfes|©olj|Thanks be to God', 'On Faith and Works'),
                                   ('de-agone-christiano', 171, 197, 'A CROWN of victory is', None, 'On the Christian Conflict')):
    ps = [clean(p) for p in body_paras(pgs, a, b, st, en)]
    if slug == 'de-agone-christiano': ps[0] = re.sub(r'^I\.\s+', '1. ', ps[0])
    # restore a section number the OCR lost: a numbered gap in the sequence
    ps = [re.sub(r'^\^9\.', '29.', re.sub(r'^4\*2\.', '42.', re.sub(r'^1 7\.', '17.', p))) for p in ps]
    mg = []
    for p in ps:
        if mg and p[:1].islower(): mg[-1] += ('' if mg[-1].endswith('-') and False else ' ') + p
        else: mg.append(p)
    ps = mg
    out = []; last = 0
    for p in ps:
        m = re.match(r'(\d{1,3})\.\s', p)
        if m:
            n = int(m.group(1))
            if n == last and n >= 2: p = '%d. %s' % (n + 1, p[m.end():]); n += 1
            last = n
        out.append(p)
    d = BASE + slug + '/'
    os.makedirs(d + 'en-US', exist_ok=True); os.makedirs(d + 'sources/english-originals', exist_ok=True)
    open(d + 'en-US/ch001.md', 'w').write('# %s\n\n%s\n' % (title, '\n\n'.join(out)))
    open(d + 'sources/english-originals/lf22-%s.txt' % slug, 'w').write('\n\n'.join(out) + '\n')
    print(slug, len(out), sum(len(p.split()) for p in out), re.findall(r'^(\d+)\.', '\n'.join(out), re.M)[-5:])
