"""Anselm, A Selection from his Letters (89 letters, English, anonymous translator), printed after Cur Deus Homo in the
Ancient and Modern Library of Theological Literature (Edinburgh: John Grant, 1909; archive.org curdeushomo00anseuoft)
-> anselm-opera-omnia/epistolae-selection (English only, work anselm/epistolae: the letters are a selection from the
whole correspondence and do not follow the Latin books).
Letter heads are the lines "N. To ADDRESSEE." in capitals; titles come from the contents list. Running heads
("Selections from the Letters of St Anselm.", "To Odo and Lanzo. 113"), page numbers and signature marks are dropped.
usage: python3.13 anselm_letters_selection.py"""
import json, os, pickle, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_common import join_lines  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/_skipped/samples/curdeushomo00anseuoft.txt'
BOOK = ROOT + '/content/books/anselm-opera-omnia/epistolae-selection'
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
GROUPS = [('monk', 'Written When a Simple Monk', 'Escritas quando simples monge', 1),
          ('abbot', 'Written When Abbot of Bec', 'Escritas quando abade de Bec', 15),
          ('archbishop', 'Written When Archbishop of Canterbury', 'Escritas quando arcebispo de Cantuária', 17)]


def heads(L, start):
    out = []
    for i in range(start, len(L)):
        l = L[i]
        m = re.match(r"^\s*(\S{0,4}(?: \d)?)[.,/]?\s*((?:ANSELM\s+)?T[Oo]\s+.*)$", l)
        if not m:
            continue
        a = [ch for ch in m.group(2) if ch.isalpha()]
        if len(a) >= 4 and sum(ch.isupper() for ch in a) >= 0.75 * len(a) and len(l) < 70:
            out.append(i)
    return out


def contents(L):
    titles = {}
    for l in L[240:450]:
        m = re.match(r"^\s*(\d{1,2})\.\s+(.+?)\s*[.,\s]*[\dinl\-]{0,4}\s*$", l)
        if m:
            t = re.sub(r"[\s.,]+$", '', re.sub(r"\s+", ' ', m.group(2)))
            t = re.sub(r"\s*\.\s*$", '', t)
            t = re.sub(r"[\s.,]*\.{2,}.*$|\s+[.\d\\ ]+$", '', t)
            titles[int(m.group(1))] = t.replace('Bee', 'Bec').replace('Beg', 'Bec').replace('lielgotus', 'Helgotus')
    return titles


def is_running(l):
    s = l.strip()
    if re.fullmatch(r"[\dIl|. ]{1,5}|[A-Z]{1,2}\s*\d?", s):
        return True
    if re.search(r"Selections\s+from\s+the\s+Letters", s, re.I):
        return True
    return bool(re.fullmatch(r"(?:\d{1,3}\s+)?(?:Anselm\s+)?To\s+[A-Z][^.!?]{0,60}\.\s*\d{1,3}\s*", s)) or \
        bool(re.fullmatch(r"\d{1,3}\s+(?:Anselm\s+)?To\s+[A-Z][^!?]{0,60}\.?", s))


def body(lines):
    bs, cur = [], []
    for l in lines:
        if is_running(l):
            continue
        if l.strip():
            cur.append(l.strip())
        elif cur:
            bs.append(cur)
            cur = []
    if cur:
        bs.append(cur)
    paras = []
    for b in bs:
        t = join_lines(b)
        if paras and (t[:1].islower() or not re.search(r"[.!?:\"”’)]\s*$", paras[-1])):
            paras[-1] = join_lines([paras[-1], t])
        else:
            paras.append(t)
    paras = [re.sub(r"\s*\bpart\s+\S{1,4}\s*WRITTEN\s+WHEN\s.*$", '', p) for p in paras]  # the next group's heading
    return [tidy(p) for p in paras if p and not re.fullmatch(r"WRITTEN\s+WHEN.*", p)]


def tidy(t):
    t = re.sub(r"\s+", ' ', t).strip()
    t = re.sub(r'(^|\s)" (?=\w)', r'\1"', t)
    t = re.sub(r"\s+([,;:!?])(?=\s|$)", r"\1", t)
    t = re.sub(r"(?<=\w) \"(?=[\s,.;:!?]|$)", '"', t)
    # a word broken over a line whose hyphen the OCR lost: "Nor mandy", "pre decessors"
    t = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{3,})\b", lambda m: m.group(1) + m.group(2) if LEX.get((m.group(1) + m.group(2)).lower(), 0) >= 3 and LEX.get(m.group(2), 0) < 3 else m.group(0), t)
    t = re.sub(r"^([A-Z])([A-Z]{2,})\b", lambda m: m.group(1) + m.group(2).lower(), t)  # small capitals of the salutation
    return t.replace('pre decessors', 'predecessors').replace(' Bee', ' Bec').replace(' Beg,', ' Bec,')


def main():
    L = open(SRC, errors='replace').read().split('\n')
    start = next(i for i in range(5000, len(L)) if re.match(r"^SELECTIONS\s+FROM\s+THE\s+LETTERS", L[i]))
    hs = heads(L, start)
    assert len(hs) == 89, len(hs)
    titles = contents(L)
    missing = [n for n in range(1, 90) if n not in titles]
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    toc, words = [], 0
    gi = 0
    for n, a in enumerate(hs, 1):
        b = hs[n] if n < len(hs) else next(i for i in range(a, len(L)) if 'PRINTERS' in L[i])  # the publisher's list follows
        title = titles.get(n) or re.sub(r"^\S{0,4}[.,/]?\s*", '', L[a].strip()).title().rstrip('.')
        while gi < len(GROUPS) and GROUPS[gi][3] <= n:
            g = GROUPS[gi]
            toc.append({'id': g[0], 'title': {'en-US': g[1], 'pt-BR': g[2]}, 'children': []})
            gi += 1
        ps = body(L[a + 1:b])
        cid = 'letter-%02d' % n
        md = '# %d. %s\n\n%s\n' % (n, title, '\n\n'.join(ps))
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
        words += len(md.split())
        toc[-1]['children'].append({'id': cid, 'title': {'en-US': '%d. %s' % (n, title)}})
    print('letters', len(hs), 'words', words, 'titles missing from contents', missing)
    book = {
        'id': 'anselm-letters-selection', 'cover': 'classic',
        'name': {'en-US': 'A Selection from His Letters', 'pt-BR': 'Seleção de cartas (inglês)'},
        'author': {'la': 'Anselmus Cantuariensis', 'en-US': 'St. Anselm of Canterbury', 'pt-BR': 'Santo Anselmo de Cantuária'},
        'description': {
            'en-US': "Eighty-nine of Anselm's letters in an anonymous English translation, in three groups: written as a simple monk of Bec, as Abbot of Bec, and as Archbishop of Canterbury, to Lanfranc, Popes Urban and Paschal, Queen Matilda, King Henry, the kings of Scotland and Ireland, bishops, monks and friends. The selection does not follow the books of the Latin correspondence, so it is its own book of the letters.",
            'pt-BR': 'Oitenta e nove cartas de Santo Anselmo numa tradução inglesa anônima, escritas como monge, como abade de Bec e como arcebispo de Cantuária.'},
        'composed': '1070–1109', 'languages': ['en-US'], 'work': 'anselm/epistolae',
        'editions': {'en-US': {'translator': 'Anonymous', 'year': 1909}},
        'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/curdeushomo00anseuoft',
                     'edition': "Cur Deus Homo, by St Anselm, to which is added a Selection from his Letters (The Ancient and Modern Library of Theological Literature; Edinburgh: John Grant, 1909).",
                     'description': 'Archive.org OCR cleaned by script, not proofread: running heads, page numbers and signature marks dropped; the letter titles are those of the contents list.',
                     'tier': 'A', 'tierEvidence': 'Printed 1909: public domain in the US.'}],
        'toc': toc,
        'arrived': {'en-US': '2026-11-03'},
    }
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
