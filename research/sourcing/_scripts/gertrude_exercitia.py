import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gm_common import *

SRC = RAW + 'pope-exercises.txt'
L = open(SRC).read().split('\n')
HEADRE = [
    re.compile(r'^[\divxlcIVXLC|]{1,7}\.?$'),
    re.compile(r'^(\d+|[ivxlcIVXLC]+)\s+[A-Z][A-Za-z \'’,.\-]{3,60}$'),
    re.compile(r'^[A-Z][A-Z \'’,.\-]{3,60}\s+(\d+|[ivxlcIVXLC]+)\.?$'),
    re.compile(r'^Exercises of St\. Gert\w*\s*$'),
    re.compile(r'^THE EXERCISES OF'),
]
def is_head(t):
    return len(t) < 70 and any(r.match(t) for r in HEADRE)

def para_list(a, b):
    out = []
    lines = [x for x in L[a - 1:b - 1] if not is_head(x.strip()) or not x.strip()]
    lines = [x for x in lines if not re.fullmatch(r'\s*(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH) EXERCISE\s*', x)]
    for blk in blocks(lines):
        t = join_lines(blk)
        if is_head(t): continue
        out.append(t)
    # merge across page breaks
    m = []
    for p in out:
        if m and not re.search(r'[.!?:;»"”’)\]]\s*$', m[-1]) and p[:1].islower() and len(m[-1]) > 12:
            m[-1] += ' ' + p
        else: m.append(p)
    return m

RUN = re.compile(r'BAPTISMAL INNOCENCE|SPIRITUAL CONVERSION|ESPOUSALS|RELIGIOUS PROFESSION|ACTS OF LOVE|PRAISE AND THANKSGIVING|REPARATION|PREFACE', re.I)
FN = re.compile(r'^([0-9lI]{1,2})\s+((?:[1-3] )?[A-Z][a-z]{1,8}\.?\s*[ivxlc0-9]+.{0,60}|Ibid.{0,40}|See .{0,80})$')

STARTS = [(r'^Q ', 'O '), (r'^(JESUS|HOLY|LORD|COD|GOD,|FAIREST|BELOVED|SWEETEST|ALMIGHTY|LOVE|THOU |MOST |SWEET )', r'O \1'),
 (r'^COD', 'GOD'), (r'^O COD', 'O GOD'),
 (r'^HE earth', 'The earth'), (r'^HE that', 'He that'), (r'^HAE ', 'Have '), (r'^LESS me', 'Bless me'), (r'^LESS the', 'Bless the'), (r'^LESSED', 'Blessed'),
 (r'^EHOLD', 'Behold'), (r'^OUCHSAFE', 'Vouchsafe'), (r'^HAT ', 'What '), (r'^ANLE am IL', 'What am I,'), (r'^GE am I', 'What am I'),
 (r'^OOK upon', 'Look upon'), (r'^AMI but', 'I am but'), (r'^VOICE OF CHRIST ee espouse', 'I espouse'), (r'^HO is like', 'Who is like'),
 (r'^MES he', 'Yes, he'), (r'^ES, I come', 'Yes, I come'), (r'^ND now', 'And now'), (r'^OME unto', 'Come unto'), (r'^HOU ', 'Thou '),
 (r'^E God, thou Life', 'O God, thou Life'), (r'^ET all', 'Let all'), (r'^IFT up', 'Lift up'), (r'^WILL extol', 'I will extol'),
 (r'^pL take', 'I take'), (r'^IB D are', 'Blessed are'), (r'^OY and', 'Joy and'), (r'^UTHOR of', 'Author of'),
 (r'^(RY|RJ|EJ|R)\. ', 'R. '), (r'^GOD, my God', 'O GOD, my God'), (r'^O O ', 'O ')]
RUNHEAD = re.compile(r'^(?:[IVXLCOior0-9]{1,5} )?(?:RENEWAL OF BAPTISMAL INNOCENCE|THE ESPOUSALS AND CONSECRATION|ACTS OF LOVE TO GOD|PRAISE AND THANKSGIVING|REPARATION|SPIRITUAL CONVERSION|RENEWAL OF THE RELIGIOUS PROFESSION|PREFACE)\s+(?:(?=[^ ]*[0-9])[A-Za-z0-9]{1,4}\s+|[IVXLCOior0-9T]{1,4}\s+)?')
def fixps(ps):
    out = []
    for p in ps:
        if len(p) < 80 and re.search(r'[|^{}]', p): continue
        m = RUNHEAD.match(p)
        if m and not p.isupper(): p = p[m.end():]
        for a, b in STARTS:
            p2 = re.sub(a, b, p, count=1)
            if p2 != p and a.startswith('^(JESUS'): p = p2
            elif p2 != p: p = p2
        if p[:1].islower() and out and not re.search(r'[.!?:]\s*$', out[-1]) and not out[-1].startswith('#'):
            out[-1] += ' ' + p
        else: out.append(p)
    return out

def md_paras(ps):
    ps = fixps(ps)
    o = []
    fns = []
    for p in ps:
        if len(p) < 80 and p.upper() == p and not p.startswith('THE ') and False: pass
        m = FN.match(p)
        if m and len(p) < 90:
            fns.append((m.group(1).replace('l', '1').replace('I', '1'), m.group(2))); continue
        if len(p) < 80 and re.search(r'[A-Z]{3}', p) and p.upper() == p and (RUN.search(p) or re.search(r'\d', p)): continue
        if len(p) < 12 and not re.search(r'[a-z]{4}', p): continue
        if len(p) < 40 and len(re.findall(r'[a-z]{3,}', p)) < 2 and not p.startswith('#'): continue
        if len(p) < 80 and p.upper() == p and re.search('[A-Z]{3}', p):
            o.append('## ' + p.title().replace("'S", "'s"))
        else: o.append(p)
    txt = '\n\n'.join(o)
    txt = re.sub(r'(?<=[a-z.,;:!?])[0-9](?=\s|$)', '', txt)  # footnote call numbers; the scripture references are dropped
    return txt

FIX = {'n Exercise': 'This Exercise', 'S St. Gertrude had': 'As St. Gertrude had', 'N this': 'In this', 'Be may': 'It may', 'HE aim': 'The aim', 'ATTER having': 'After having', 'HE soul': 'The soul'}
EX = [  # (id, title, intro start, end)
 ('exercitium-1', 'First Exercise: The Renewal of Baptismal Innocence', 970, 1582),
 ('exercitium-2', 'Second Exercise: Spiritual Conversion', 1582, 1931),
 ('exercitium-3', 'Third Exercise: The Espousals and Consecration', 1931, 3007),
 ('exercitium-4', 'Fourth Exercise: The Renewal of the Religious Profession', 3007, 4241),
 ('exercitium-5', 'Fifth Exercise: The Exercise of Love', 4241, 5416),
 ('exercitium-6', 'Sixth Exercise: Praise and Thanksgiving', 5416, 7234),
 ('exercitium-7', 'Seventh Exercise: Reparation and Preparation for Death', 7234, 8722),
]
chs = []
pre = para_list(113, 940)
# drop title block lines of the preface
chs.append(('praefatio', '# Preface by Dom Prosper Guéranger\n\n' + md_paras([p.replace('Ne giving','In giving',1) for p in pre if not p.startswith('Preface') and 'ABBOT OF SOLESMES' not in p]) + '\n'))
for cid, title, a, b in EX:
    ps = para_list(a, b)
    ps = [p for p in ps if not re.fullmatch(r'(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH) EXERCISE|THE RENEWAL OF BAPTISMAL INNOCENCE|RENEWAL OF BAPTISMAL INNOCENCE|SPIRITUAL CONVERSION|THE ESPOUSALS AND CONSECRATION|RENEWAL OF THE RELIGIOUS PROFESSION|PRAISE AND THANKSGIVING|REPARATION\. PREPARATION FOR DEATH', p)]
    ps = [re.sub(r'^(n Exercise|S St\. Gertrude had|N this|Be may|HE aim|ATTER having|HE soul)', lambda m: FIX[m.group(1)], p) for p in ps]
    chs.append((cid, f'# {title}\n\n' + md_paras(ps) + '\n'))
def tidy(md):
    md = re.sub(r'\n\nRENEWAL OF BAPTISMAL INNOCENCE n Exercise', '\n\nThis Exercise', md)
    md = md.replace('\n\nn Exercise is', '\n\nThis Exercise is')
    md = re.sub(r'\n\nTOA set on fire', '\n\nset on fire', md)
    md = re.sub(r'\n\nPEN ath hod i ig; T', '', md)
    md = re.sub(r'\n\n(ALL ye works)', r'\n\nO \1', md)
    return md
chs = [(c, tidy(m)) for c, m in chs]
if __name__ == '__main__':
    for cid, md in chs:
        print(cid, len(md.split()))

    B = REPO + '/content/books/gertrude-opera-omnia/exercitia'
    titles = {'praefatio': 'Preface by Dom Prosper Gu\u00e9ranger'}
    titles.update({c: t for c, t, a, b in EX})
    meta = {
     'id': 'gertrude-exercitia', 'cover': 'classic',
     'name': {'la': 'Exercitia spiritualia', 'en-US': 'The Exercises of St. Gertrude', 'pt-BR': 'Os Exerc\u00edcios de Santa Gertrudes'},
     'author': {'la': 'Gertrudis Magna', 'en-US': 'St. Gertrude the Great', 'pt-BR': 'Santa Gertrudes, a Grande'},
     'description': {'la': 'Septem exercitia spiritualia: baptismi renovatio, conversio, sponsalia, professionis renovatio, exercitium amoris, laus et gratiarum actio, reparatio et praeparatio ad mortem.',
      'en-US': 'Seven devotional exercises of Gertrude of Helfta: renewal of baptismal innocence, conversion, spiritual espousals, renewal of religious profession, the exercise of love, praise and thanksgiving, reparation and preparation for death.',
      'pt-BR': 'Sete exerc\u00edcios de piedade de Gertrudes de Helfta: renova\u00e7\u00e3o da inoc\u00eancia batismal, convers\u00e3o, desposat\u00f3rio espiritual, renova\u00e7\u00e3o da profiss\u00e3o religiosa, exerc\u00edcio de amor, louvor e a\u00e7\u00e3o de gra\u00e7as, repara\u00e7\u00e3o e prepara\u00e7\u00e3o para a morte.'},
     'composed': 'c. 1289-1302',
     'languages': ['en-US'],
     'work': 'gertrude/exercitia-spiritualia',
     'editions': {'en-US': {'translator': 'Thomas Alder Pope (Oratory)', 'year': 1921}},
     'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/exercisesofstger0000thom',
       'edition': 'The Exercises of St. Gertrude, tr. Thomas Alder Pope, London: Burns Oates & Washbourne, 1921 (with Guéranger\'s preface).',
       'description': 'Internet Archive OCR of the 1921 translation made from the Latin; running heads, page numbers and scripture-reference footnotes removed, lost drop capitals restored by hand rules (research/sourcing/_scripts/gertrude_exercitia.py). The Latin original (Solesmes 1875) was not found as text online, so there is no la folder.',
       'tier': 'A', 'tierEvidence': 'English translation published 1921; OCR from the Internet Archive.'}],
     'toc': [{'id': c, 'title': {'en-US': titles[c]}} for c, _ in chs]}
    write_book(B, meta, {'en-US': chs})
    import shutil
    shutil.copy(SRC, B + '/sources/en-US-originals/exercises-pope-1921.txt')
    print(words(B + '/en-US'))
