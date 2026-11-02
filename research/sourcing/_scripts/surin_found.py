import re, difflib, sys, os, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import ocr_clean as oc
R = '/Users/gustavo/Documents/prayer/research/sourcing/surin/'
B = '/Users/gustavo/Documents/prayer/content/books/surin-opera-omnia/fondements-pusey/'
L = open(R + 'FoundationsOfTheSpiritualLife.txt', errors='replace').read().split('\n')
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV']
# TOC
toc_txt = ' '.join(re.sub(r'\s+', ' ', x).strip() for x in L[2938:3236])
toc_txt = re.sub(r'Digitized by Google|lxx\w*|CONTENTS\.?|PAGE', ' ', toc_txt)
books = re.split(r'BOOK [IVY]+\. ', toc_txt)[1:]
titles = []
for b in books[:5]:
    parts = re.split(r'Chapter [IVXLC]+\s*[.,—-]+\s*', b)[1:]
    row = []
    for p in parts:
        p = re.sub(r'\s*(B(ook)?\.? ?[ivxl1]+\.? ?c\.? ?[\d ]+\.?)?[\s.•]*\d+[\s|ji»]*$', '', p.strip())
        p = re.sub(r'\s*B(ook|\.) ?[ivxl1]+\.? ?c\.? ?\d+[\s.]*$', '', p)
        p = re.sub(r'\s*OF THE [A-Z ,]+\.?$', '', p) if p.isupper() is False and re.search(r' OF THE [A-Z ,]{10,}$', p) else p
        row.append(re.sub(r'- ', '', p).strip(' .'))
    titles.append(row)
if __name__ == '__main__' and 'dev' in sys.argv:
    for t in titles: print(len(t), t[:2], t[-1][:60])

def clean_title(t):
    t = re.sub(r'^[—\-\s]+', '', t)
    t = re.sub(r'\s*\|?\s*[ji»I]?\s*$', '', t)
    t = re.sub(r'\s+B(ook|\.)\.? ?[ivxl1]+\.? ?c\.? ?[\d ]+\.?$', '', t)
    t = re.sub(r'\s+', ' ', t).strip(' .|')
    return t.replace("'", '’')
titles = [[clean_title(t) for t in row] for row in titles]
def norm(s): return re.sub(r'[^a-z]', '', s.lower())
BS = [3248, 5788, 8043, 9785, 11687]; BE = BS[1:] + [None]
# end of text: letter ends before the trailing 'Digitized' pages
last = max(i for i, l in enumerate(L) if re.search(r'Your\s+most\s+humble', l))
LETTER = 14212
BE[-1] = LETTER
BE_LAST = last + 2
def find_ch(book, ci, pos, e):
    nt = norm(titles[book][ci])[:60]
    for i in range(pos, e - 1):
        s = ' '.join(x.strip() for x in L[i:i+4])
        r = difflib.SequenceMatcher(None, nt, norm(s)[:len(nt) + 25]).ratio()
        if r >= 0.62 and re.search(r'C\W*H\W*A\W*P', ' '.join(L[max(0, i-4):i+1]), re.I) or (ci == 0 and r >= 0.6):
            return i
FURN = re.compile(r'^(Digitized\s+by\s*Google|Google|FOUNDATIONS\s+OF\s+(THE\s+)?SPIRITUAL\s+LIFE\.?\s*\d*|\d+\s+FOUNDATIONS.*|BOOK\s+[IVY]+\.?\s*\d*|[\W\d]{0,4}|[a-z]\s+[A-Z0-9][A-Za-z0-9. ,—-]{3,40}|[A-Za-z]{1,2}|CHAPTER\s+[IVXLCY]+\.?.*)$')
QA = re.compile(r'^\W{0,3}(Question|Answer)\b')
def body(a, b):
    paras, cur = [], []
    for ln in L[a:b]:
        t = re.sub(r'\s+', ' ', ln).strip()
        if not t:
            if cur: paras.append(cur); cur = []
            continue
        if FURN.match(t): continue
        if QA.match(t) and cur: paras.append(cur); cur = []
        cur.append(t)
    if cur: paras.append(cur)
    ps = [oc.join_lines(p) for p in paras]
    mg = []
    for p in ps:
        if mg and not oc.SENT_END.search(mg[-1]) and p[:1].islower() and not QA.match(p): mg.append(mg.pop() + ' ' + p)
        else: mg.append(p)
    return [fx(p) for p in mg]
def fx(s):
    s = s.replace("'", '’')
    s = re.sub(r'(?<=\s)[|!:]+(?=\s)|(?<=\s)j(?=\s)|^[|!:]\s*', '', s)
    s = s.replace('|', '')
    s = re.sub(r'\s+[|!]\s+', ' ', s).replace('(On these words) — M ', '(On these words) — “')
    s = re.sub(r'^\W{0,3}Question\s*[.—-]*\s*', 'Question. ', s); s = re.sub(r'^\W{0,3}Answer\s*[.—-]*\s*', 'Answer. ', s)
    s = re.sub(r'\s+([;:!?,.])', r'\1', s)
    return s
def write(cid, title, paras, ital=None):
    t = [f'# {title}', '']
    if ital: t += [f'*{ital}*', '']
    for p in paras: t += [p, '']
    open(B + f'en-US/{cid}.md', 'w').write('\n'.join(t).rstrip() + '\n')
    return len(' '.join(t).split())
if __name__ == '__main__' and 'build' in sys.argv:
    os.makedirs(B + 'en-US', exist_ok=True)
    out, toc = [], []
    pre_a = next(i for i in range(60, 200) if re.search(r'PREFACE\.', L[i]))
    out.append(('preface', 'Preface', write('preface', 'Preface by the Editor', body(pre_a + 1, 2936))))
    for bk in range(5):
        pos = BS[bk]; starts = []
        for ci in range(len(titles[bk])):
            f = 11688 if (bk == 4 and ci == 0) else find_ch(bk, ci, pos, BE[bk] or len(L))
            starts.append(f)
            if f is not None: pos = f + 1
            print(bk+1, ci+1, f)
        # chapters with missing start are merged into the previous chapter's text
        kids = []
        valid = [(ci, s) for ci, s in enumerate(starts) if s is not None]
        for k, (ci, s) in enumerate(valid):
            e = valid[k+1][1] if k+1 < len(valid) else BE[bk]
            if bk == 4 and k + 1 == len(valid): e = BE[bk]
            cid = f'b{bk+1}-c{ci+1:02d}'
            title = f'Book {RN[bk]}, Chapter {RN[ci]}'
            n = write(cid, title, body(s + 1, e) if True else [], titles[bk][ci])
            kids.append((cid, title + '. ' + titles[bk][ci])); out.append((cid, title, n))
        toc.append((f'book-{bk+1}', f'Book {RN[bk]}', kids))
    out.append(('lettre', 'Letter', write('lettre', 'A Spiritual Letter to a Lady of Rank', body(LETTER + 2, BE_LAST))))
    toc.append(('lettre', 'A Spiritual Letter to a Lady of Rank', None))
    json.dump({'toc': toc, 'out': out}, open(R + 'found_toc.json', 'w'), ensure_ascii=False)
    print(sum(o[2] for o in out))

if __name__ == '__main__' and 'meta' in sys.argv:
    import bookjson, shutil
    d0 = json.load(open(R + 'found_toc.json'))
    toc = [{'id': 'preface', 'title': {'en-US': 'Preface by the Editor'}}]
    for bid, bt, kids in d0['toc']:
        if kids is None: toc.append({'id': bid, 'title': {'en-US': bt}})
        else: toc.append({'id': bid, 'title': {'en-US': bt}, 'children': [{'id': c, 'title': {'en-US': t}} for c, t in kids]})
    d = {'id': 'surin-fondements-pusey', 'cover': 'classic',
      'name': {'en-US': 'The Foundations of the Spiritual Life, Drawn from the Book of the Imitation of Jesus Christ (adapted)', 'pt-BR': 'Os fundamentos da vida espiritual, tirados do livro da Imitação de Jesus Cristo (adaptado)', 'fr-FR': 'Les Fondements de la vie spirituelle tirés du livre de l’Imitation de Jésus-Christ'},
      'author': {'en-US': 'Jean-Joseph Surin', 'pt-BR': 'Jean-Joseph Surin', 'fr-FR': 'Jean-Joseph Surin'},
      'description': {
       'en-US': 'Surin’s commentary on the maxims of the Imitation of Christ, in five books of questions and answers (first published in 1667 under the name Jean de Sainte-Foy), with a spiritual letter to a lady of rank. This is E. B. Pusey’s English of 1844, “adapted to the use of the English Church”: Pusey altered or left out Catholic matter, so it is a witness to his adaptation, not to Surin’s French. It has Pusey’s long Preface. The French original is not available as text in the corpus yet.',
       'pt-BR': 'O comentário de Surin às máximas da Imitação de Cristo, em cinco livros de perguntas e respostas (publicado pela primeira vez em 1667 sob o nome de Jean de Sainte-Foy), com uma carta espiritual a uma dama de alta posição. É o inglês de E. B. Pusey, de 1844, « adaptado ao uso da Igreja Inglesa »: Pusey alterou ou omitiu matéria católica, de modo que é testemunho da sua adaptação, não do francês de Surin.',
       'fr-FR': ''},
      'composed': '1667', 'languages': ['en-US'], 'work': 'surin/fondements-de-la-vie-spirituelle',
      'editions': {'en-US': {'translator': 'Anonymous, ed. E. B. Pusey (adapted to the use of the English Church)', 'year': 1844}},
      'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/FoundationsOfTheSpiritualLife', 'edition': 'The Foundations of the Spiritual Life, drawn from the book of the Imitation of Jesus Christ, by Surin, translated from the French, edited by E. B. Pusey (adapted to the use of the English Church), London: J. Burns, 1844. Internet Archive scan (Google), OCR text.',
        'description': 'Pusey’s Preface, the five Books (9, 9, 9, 9 and 14 chapters) and the spiritual letter. The contents table and page furniture are left out; chapter titles are the Imitation passages from the printed contents. OCR corrected only by script, with stray margin marks removed; some page-foot scripture notes and running heads may remain inside paragraphs. The French original (Luxembourg: Barbier 1697, a Marburg digitised facsimile) has no text layer.',
        'tier': 'A', 'tierEvidence': 'Surin died in 1665 and Pusey in 1882; the 1844 London edition is public domain everywhere.'}],
      'toc': toc}
    del d['name']['fr-FR']; del d['description']['fr-FR']; del d['author']['fr-FR']
    os.makedirs(B + 'sources/english-originals', exist_ok=True)
    shutil.copy(R + 'FoundationsOfTheSpiritualLife.txt', B + 'sources/english-originals/foundations-1844-pusey-archive-org.txt')
    bookjson.write(B[:-1], d)
