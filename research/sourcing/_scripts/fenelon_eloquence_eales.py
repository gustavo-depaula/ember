"""Fénelon, Three Dialogues on Pulpit Eloquence, translated by Samuel J. Eales (London: Thomas Baker, 1897),
archive.org threedialogueson00ealeuoft -> the English-only book fenelon-opera-omnia/litterature/dialogues-sur-leloquence-eales
(work fenelon/dialogues-sur-leloquence; the French book is cut in four parts by length, not by dialogue).

Running heads ("PULPIT ELOQUENCE", "INTRODUCTORY ESSAY") are dropped; a page's notes are the blocks after its body that open
with '*' or 't' (the dagger), paired with the markers on the same page. Speakers are printed "A :", "B :", "C :" and become **A:**.
The publisher's advertisements after the third dialogue are left out.
usage: python3.13 fenelon_eloquence_eales.py"""
import collections, json, os, pickle, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/_skipped/samples/threedialogueson00ealeuoft.txt'
BOOK = ROOT + '/content/books/fenelon-opera-omnia/litterature/dialogues-sur-leloquence-eales'
STATS = collections.Counter()
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))


def common(w):
    return LEX.get(w.lower(), 0) >= 3

from djvu_pages import pages  # noqa: E402
COORDS = ROOT + '/research/sourcing/_skipped/coords/threedialogueson00ealeuoft_djvu.xml'
HEAD = re.compile(r"PULPI.?\.?\s+ELOQ|INTRODUCTORY\s+ESSAY")
NOTE = re.compile(r"^\s*([*t†])\s+\S")
MARK = [re.compile(r"(?<=[A-Za-z,.;:!?\"'”’)])\s?\*"), re.compile(r"(?<=[,.;:!?\"'”’)])\s?[tf†](?=[\s,.;:]|$)")]
SPEAKER = re.compile(r"^([ABC£E])\s*['.]?\s*:")
NOTES = []
TERM = re.compile(r"[.!?:\"”’)]\s*$")


def split_page(p):
    """-> (body lines, note lines): notes are set in smaller type, so they are the run of short-height lines at the foot"""
    ls = [l for par in p for l in par]
    if ls and HEAD.search(ls[0]['text']) and len(ls[0]['text'].split()) <= 6:
        ls = ls[1:]
    if ls and re.fullmatch(r"[\divxlcIl. ]{1,6}", ls[-1]['text'].strip()):
        ls = ls[:-1]
    if not ls:
        return [], []
    hs = sorted(l['h'] for l in ls)
    H = hs[int(0.8 * (len(hs) - 1))]
    small = [l['h'] < 0.88 * H for l in ls]
    # the notes are the trailing run of small lines (a lone noisy height inside the run is tolerated);
    # small lines followed by body lines again are a block quotation
    k0 = None
    i = len(ls) - 1
    while i >= 1 and (small[i] or (i - 1 >= 1 and small[i - 1] and i + 1 < len(ls) and small[i + 1])):
        k0 = i
        i -= 1
    return (ls, []) if k0 is None else (ls[:k0], ls[k0:])


def body_paras(ls):
    """lines -> [text, starts_new]: a paragraph starts at an indented line or after a short one"""
    if not ls:
        return []
    left = sorted(l['x0'] for l in ls)[len(ls) // 2]
    right = sorted(l['x1'] for l in ls)[len(ls) // 2]
    out = []
    for i, l in enumerate(ls):
        new = l['x0'] - left > 40 or (i and right - ls[i - 1]['x1'] > 120) or SPEAKER.match(l['text'])
        if out and not new:
            out[-1][0].append(l['text'])
        else:
            out.append([[l['text']], bool(new) or i > 0])
    return [[join_lines(t), n] for t, n in out]


def note_list(ls):
    ns = []
    for l in ls:
        if NOTE.match(l['text']) or not ns:
            ns.append([l['text'], bool(NOTE.match(l['text']))])
        else:
            ns[-1][0] = join_lines([ns[-1][0], l['text']])
    return ns


def paragraphs(page_range, P):
    paras = []
    for pi in page_range:
        body, notes = split_page(P[pi])
        texts = body_paras(body)
        ns = note_list(notes)
        if ns and not ns[0][1] and ns[0][0][:1].isupper() \
                and sum(len(MARK[0].findall(t)) for t, _ in texts) > sum(1 for n, mk in ns if mk and n.lstrip()[0] == '*'):
            ns[0][0] = '* ' + ns[0][0]  # the note lost its '*' but the body still has one
            ns[0][1] = True
        if ns and not ns[0][1]:
            if NOTES:
                NOTES[-1] = join_lines([NOTES[-1], ns[0][0]])
                STATS['continued'] += 1
            else:
                print('orphan note text:', ns[0][0][:80])
            ns = ns[1:]
        for nt, _ in ns:
            rx = MARK[0] if nt.lstrip()[0] == '*' else MARK[1]
            for bl in texts:
                m = rx.search(bl[0])
                if m:
                    NOTES.append(re.sub(r"^\s*[*t†]\s+", '', nt))
                    bl[0] = bl[0][:m.start()] + '⟦%d⟧' % (len(NOTES) - 1) + bl[0][m.end():]
                    STATS['notes'] += 1
                    break
            else:
                STATS['unmatched'] += 1
                print('unmatched note p%d:' % pi, nt[:90])
        for i, (t, new) in enumerate(texts):
            if i == 0 and paras and (not new or t[:1].islower()):
                paras[-1] = join_lines([paras[-1], t])
            else:
                paras.append(t)
    return paras


def quotes(p):
    """straight double quotes: drop the OCR's space after an opening one and before a closing one, when they pair up"""
    if p.count('"') % 2:
        return p
    out, n = [], 0
    for part in re.split(r'(")', p):
        if part == '"':
            if n % 2 and out:
                out[-1] = out[-1].rstrip()
            out.append('"')
            n += 1
        else:
            out.append(part.lstrip() if n % 2 == 1 and out and out[-1] == '"' else part)
    return ''.join(out)


def tidy(p):
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"^([ABC£E])\s*'?\s*:\s*", lambda m: '**%s:** ' % ('C' if m.group(1) in '£E' else m.group(1)), p)
    p = re.sub(r"\s+([,;:!?])(?=\s|$|\")", r"\1", p)
    p = re.sub(r"(?<=\w) r(?=\s|$)", '?', p)  # the OCR reads '?' as 'r' after a word: "take me r"
    p = p.replace('wras', 'was').replace('\\v', 'w').replace('\\V', 'W').replace('/\'', '"').replace('// is', 'It is').replace('There- were', 'There were')
    p = re.sub(r"(?<=\s)[•«](?=\s)|(?<=\s)[•«](?=\w)", '', p)
    p = p.replace('^Eneas', 'Æneas').replace('^neid', 'Æneid').replace('drama^', 'drama,').replace('Ionian s⟦', 'Ionians⟦').replace('"\'\\ ', '" ')
    p = re.sub(r"(?<=[a-z])\^(?=[a-z])", '', p)
    p = re.sub(r"\s{2,}", ' ', p)
    p = re.sub(r"\b(re|dis|in|con|com|ex|pro) ([a-z]{3,})\b", lambda m: m.group(1) + m.group(2) if common(m.group(1) + m.group(2)) and (m.group(1) in ('re', 'dis') or not common(m.group(2))) else m.group(0), p)
    p = re.sub(r"\bi (Cor|Kings|Tim|Thess|Pet|John|Sam|Chron|Macc)\b", r"1 \1", p)
    p = quotes(p)
    p = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if common(m.group(1) + m.group(2)) and not (common(m.group(1)) and common(m.group(2))) else m.group(0), p)
    return p


def notes_out(paras):
    notes = []

    def rep2(m):
        notes.append(NOTES[int(m.group(1))].strip())
        return '[^%d]' % len(notes)
    return [re.sub(r"⟦(\d+)⟧", rep2, p) for p in paras], notes


def write(cid, title, paras):
    paras, notes = notes_out([tidy(p) for p in paras])
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(paras))
    if notes:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, tidy(n)) for i, n in enumerate(notes)) + '\n'
    open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
    print(cid, len(md.split()), 'words', len(notes), 'notes')
    return len(md.split())


def main():
    P = pages(COORDS)
    first = lambda pi: ' '.join(l['text'] for par in P[pi] for l in par[:1])[:80]
    find = lambda rx, start=0: next(i for i in range(start, len(P)) if re.search(rx, ' '.join(l['text'] for par in P[i] for l in par)[:200]))
    i0 = find(r"ntrol.*cton")
    d1 = find(r"Dialogue\.", i0 + 1)
    d2 = find(r"Secon.*Dialogue", d1 + 1)
    d3 = find(r"3>ialo0ue|Third\s+Dialogue", d2 + 1)
    end = find(r"^Just\s+P", d3)
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    words = 0
    ip = paragraphs(range(i0, d1), P)
    ip[0] = re.sub(r"^\S*ntrol\S*\s*", '', ip[0])
    ip[0] = re.sub(r"^A GREAT", 'A great', ip[0])
    ip = [x for x in ip if not re.match(r"^THREE DIALOGUES", x)]
    words += write('introductory-essay', 'Introductory Essay', ip)
    toc = [{'id': 'introductory-essay', 'title': {'en-US': 'Introductory Essay (Eales)'}}]
    for (a, b), cid, title in (((d1, d2), 'dialogue-1', 'First Dialogue'), ((d2, d3), 'dialogue-2', 'Second Dialogue'), ((d3, end), 'dialogue-3', 'Third Dialogue')):
        ps = paragraphs(range(a, b), P)
        while not re.search(r"(?i)ialo|ialog", ps[0][:40]):
            ps = ps[1:]
        head = re.sub(r"^.*?ialo\S*\s*", '', ps[0])  # the dialogue's argument runs on from the heading
        ps = ps[1:]
        while ps and not SPEAKER.match(ps[0]):
            head = join_lines([head, ps[0]])
            ps = ps[1:]
        ps = ['*%s*' % re.sub(r"\s+", ' ', head).strip()] + ps
        words += write(cid, title, ps)
        toc.append({'id': cid, 'title': {'en-US': title}})
    print('words', words, dict(STATS))
    book = {
        'id': 'fenelon-dialogues-on-eloquence-eales', 'cover': 'classic',
        'name': {'en-US': 'Three Dialogues on Pulpit Eloquence (Eales)', 'pt-BR': 'Três diálogos sobre a eloquência do púlpito (Eales, inglês)'},
        'author': {'fr-FR': 'François de Salignac de La Mothe-Fénelon', 'en-US': 'François de Salignac de La Mothe-Fénelon', 'pt-BR': 'François de Salignac de La Mothe-Fénelon'},
        'description': {
            'en-US': "Fénelon's three dialogues on preaching, between A, a man of taste, and two friends: against wit and brilliancy in sermons; how the orator must prove, portray and move; and the eloquence of Scripture and the Fathers. In the English of Samuel J. Eales (London, 1897), with his introductory essay and notes. The French book is divided by length, not by dialogue, so this is its own book of the same work.",
            'pt-BR': "Os três diálogos de Fénelon sobre a pregação, na tradução inglesa de Samuel J. Eales (Londres, 1897), com o ensaio introdutório e as notas do tradutor."},
        'composed': '1679–1715', 'languages': ['en-US'], 'work': 'fenelon/dialogues-sur-leloquence',
        'editions': {'en-US': {'translator': 'Samuel J. Eales', 'year': 1897}},
        'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/threedialogueson00ealeuoft',
                     'edition': 'Three Dialogues on Pulpit Eloquence, by Mgr. François de Salignac de Lamothe Fénelon, translated and illustrated by quotations from modern writers, with an introductory essay, by Samuel J. Eales (London: Thomas Baker; Philadelphia: John J. McVey, 1897).',
                     'description': "Archive.org OCR cleaned by script, not proofread: running heads and the publisher's advertisements dropped, the translator's page notes kept as footnotes where their marker was found on the same page.",
                     'tier': 'A', 'tierEvidence': 'Published in 1897: public domain.'}],
        'toc': toc,
        'arrived': {'en-US': '2026-11-03'},
    }
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
