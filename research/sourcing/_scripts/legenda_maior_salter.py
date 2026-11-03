"""Bonaventure, Legenda maior, in Salter's English as reset in the Everyman volume (London: Dent, 1910; archive.org
thelittleflowers00francuoft, read by everyman_francis.py) -> en-US of bonaventure-opera-omnia/legenda-maior
(prologus, c01..c15). The Everyman text does not include the Miracula, so m01..m10 stay Latin only.
Salter numbers the paragraphs of each chapter; the numbers stay as inert bold (**1.**).
usage: python3.13 legenda_maior_salter.py"""
import json, os, pickle, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import everyman_francis as E  # noqa: E402
from en_common import join_lines  # noqa: E402

BOOK = '/Users/gustavo/Documents/prayer/content/books/bonaventure-opera-omnia/legenda-maior'
LEX = pickle.load(open('/Users/gustavo/Documents/prayer/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))


def common(w):
    return LEX.get(w.lower(), 0) >= 3


def tidy(t):
    t = re.sub(r"\s+", ' ', t).strip()
    t = re.sub(r"\s\d{2,3}°?\s+Life of St\. Francis\b", '', t)  # a running head run into the text
    t = re.sub(r"(?<=\w)\^|\s\^(?=\s)", '', t).replace('wYought', 'wrought').replace('WThom', 'Whom').replace('untc ', 'unto ')
    t = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if common(m.group(1) + m.group(2)) and not (common(m.group(1)) and common(m.group(2))) else m.group(0), t)
    t = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{3,})\b", lambda m: m.group(1) + m.group(2) if common(m.group(1) + m.group(2)) and not common(m.group(2)) else m.group(0), t)
    t = re.sub(r"\s?\d{0,3}°\s?", ' ', t).replace('Citt£', 'Città').replace('  ', ' ')  # page numbers run into the text
    t = t.replace('Where fore', 'Wherefore').replace('mar vel', 'marvel')
    t = re.sub(r"^([il1I]|\d{1,2})[.,] (?=\S)", lambda m: '**%s.** ' % ('1' if m.group(1) in 'il1I' else m.group(1)), t)
    t = re.sub(r"(\*\*\s)([A-Z])([A-Z]+)\b", lambda m: m.group(1) + m.group(2) + m.group(3).lower(), t)  # small capitals after the number
    t = re.sub(r"^([A-Z])([A-Z]{2,})\b", lambda m: m.group(1) + m.group(2).lower(), t)
    t = re.sub(r'(^|\s)" (?=\w)', r'\1"', t)
    t = re.sub(r"\s+([,;:!?])(?=\s|$)", r"\1", t)
    t = re.sub(r"(?<=\w) \"(?=[\s,.;:!?]|$)", '"', t)
    return t


def main():
    bl = E.blocks(325, 429)
    chapters, cur = [], None
    for k, t in bl:
        if k == 'head':
            if t.startswith('PROLOGUE'):
                cur = {'id': 'prologus', 'title': 'Prologue', 'paras': []}
                chapters.append(cur)
            elif re.match(r"^CHAPTER\s+[IVXL]+", t):
                m = re.match(r"^CHAPTER\s+([IVXL]+)\s*(.*)$", t)
                n = E.roman_value(m.group(1))
                cur = {'id': 'c%02d' % n, 'title': 'Chapter %s. %s' % (m.group(1), E.tcase(m.group(2)).replace('Kis ', 'His ')), 'paras': []}
                chapters.append(cur)
            elif t.startswith('HERE ENDETH'):
                cur['paras'].append('*Here endeth the Life of the Blessed Francis.*')
                break
            elif cur is not None:
                cur['paras'].append('*%s*' % E.tcase(t))
            continue
        if cur is None:
            continue
        if cur['paras'] and t[:1].islower():
            cur['paras'][-1] = join_lines([cur['paras'][-1], t])
        else:
            cur['paras'].append(t)
    assert [c['id'] for c in chapters] == ['prologus'] + ['c%02d' % i for i in range(1, 16)], [c['id'] for c in chapters]
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    words = 0
    for c in chapters:
        md = '# %s\n\n%s\n' % (c['title'], '\n\n'.join(tidy(p) for p in c['paras']))
        open('%s/en-US/%s.md' % (BOOK, c['id']), 'w').write(md)
        words += len(md.split())
    print(len(chapters), 'chapters', words, 'words')
    b = json.load(open(BOOK + '/book.json'))
    if 'en-US' not in b['languages']:
        b['languages'].append('en-US')
    titles = {c['id']: c['title'] for c in chapters}
    for n in b['toc']:
        if n['id'] in titles:
            n['title']['en-US'] = titles[n['id']]
    b['editions']['en-US'] = {'translator': 'E. Gurney Salter', 'year': 1904}
    b['sources'] = [s for s in b['sources'] if s['language'] != 'en-US'] + [{
        'language': 'en-US', 'url': 'https://archive.org/details/thelittleflowers00francuoft',
        'edition': "The Life of St. Francis by St. Bonaventure, translated by E. Gurney Salter (1904), as reset in The Little Flowers, The Mirror of Perfection, and St. Bonaventure's Life of St. Francis (London: J. M. Dent, Everyman's Library, 1910).",
        'description': "Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread; running heads and page numbers dropped, Salter's paragraph numbers kept. The Everyman volume prints the prologue and the fifteen chapters only: the Miracula after death are Latin only.",
        'tier': 'A', 'tierEvidence': 'Published 1910: public domain.'}]
    if 'Latin only' not in b['description']['en-US']:
        b['description']['en-US'] = b['description']['en-US'].rstrip() + " The English of the prologue and the fifteen chapters is E. Gurney Salter's (1904)."
    b.setdefault('arrived', {}).setdefault('en-US', '2026-11-03')
    json.dump(b, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
