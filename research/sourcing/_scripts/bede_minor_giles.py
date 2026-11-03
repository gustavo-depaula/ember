"""Bede, the Life of St Felix and the letters to Albinus and Egbert, in Giles's English (The Miscellaneous Works of
Venerable Bede, vol. 4: the minor historical works, London: Whittaker, 1843; archive.org theminorhistoric00bede)
-> bede-opera-omnia/vita-felicis/en-US/vita-felicis.md and bede-opera-omnia/epistolae/en-US/e01.md, e02.md.

Read with tesseract from the page images (the archive.org OCR scrambles the lines where the side-notes are). The side-notes Giles prints in the margin ("Parentage of Felix", "Miraculous
relief of Bishop Maximus") are dropped by position: a word that starts right of the text column or ends left of it,
and a block that lies wholly outside it. Running heads ("OF VENERABLE BEDE.", "THE MINOR HISTORICAL WORKS") and
page numbers are dropped. The OCR's paragraphs are kept, joined across pages where one runs on. Giles's footnotes
(set in small type, marked * and †) are kept as markdown notes. The section numbers of the letter to Egbert are
inert bold.
usage: python3.13 bede_minor_giles.py"""
import json, os, re, statistics, sys
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages, tsv_page  # noqa: E402
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
COORDS = ROOT + '/research/sourcing/_skipped/coords/theminorhistoric00bede_djvu.xml'
BEDE = ROOT + '/content/books/bede-opera-omnia'
# every page of the three texts re-read with tesseract from the page images (page/nNNN_w2000.jpg): the archive.org
# OCR runs the side-notes into the lines and scrambles their order on a third of the pages
TESS = ROOT + '/research/sourcing/_skipped/tess/bede/n%d.tsv'
HEAD = re.compile(r"^(?:\d{1,3}\s+)?(?:OF VENERABLE [BR]EDE|THE MINOR HISTORICAL WORKS|LETTERS)\b.*$")


def page_blocks(p):
    """-> [(kind, [lines])], kind 'text' or 'note'; margin words dropped"""
    ls = [l for par in p for l in par]
    long = [l for l in ls if len(l['words']) >= 6]
    if len(long) < 4:
        return [('text', par) for par in p]
    left = statistics.median(l['x0'] for l in long)
    right = statistics.median(l['x1'] for l in long)
    H = statistics.median(l['h'] for l in long)
    out = []
    for par in p:
        keep = []
        for l in par:
            ws = [(c, w) for c, w in l['words'] if not (c[0] >= right - 4 or c[2] <= left + 4)]
            if not ws:
                continue
            keep.append(dict(l, words=ws, x0=ws[0][0][0], x1=ws[-1][0][2], text=' '.join(w for c, w in ws)))
        if not keep:
            continue
        t = ' '.join(l['text'] for l in keep).strip()
        if HEAD.match(t) or re.fullmatch(r"[\dIl]{1,4}", t):
            continue
        small = statistics.median(l['h'] for l in keep) < 0.85 * H
        out.append(['note' if re.match(r"^[*†‡]\s", t) or (small and out and out[-1][0] == 'note') else 'text', keep])
    # a note is at the foot: a starred block followed by text again is not one
    for i in range(len(out) - 1):
        if out[i][0] == 'note' and any(k == 'text' for k, _ in out[i + 1:]):
            out[i][0] = 'text'
    return [tuple(x) for x in out]


def tidy(p):
    p = p.replace('&quot;', '"').replace('&apos;', "'").replace('&amp;', '&')
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"\s+([,;:!?.])(?=\s|$|[\"'’”)])", r"\1", p)
    p = re.sub(r"(^|\s)\"\s+(?=\w)", r'\1"', p)
    p = re.sub(r"(?<=[\w.,;:!?])\s+\"(?=\s|$|[,.;:])", '"', p)
    p = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if inW(m.group(1) + m.group(2)) and not (inW(m.group(1)) and inW(m.group(2))) else m.group(0), p)
    p = re.sub(r"^§\s*(\d+)\.\s*", r"**\1.** ", p)
    for a, b in (('Csesar', 'Caesar'), ('Hedl', 'Hell'), ('Well clone', 'Well done'), (' ihe ', ' the '), ('anextreme', 'an extreme'), ('chanel', 'church'), ('erown', 'crown'),
                 ('doso', 'do so'), ('hada ', 'had a '), ('masmuch', 'inasmuch'), ('contimence', 'continence'), ('itis ', 'it is '), ('omena', 'omen a'), ('rememper', 'remember'), (' wili ', ' will '),
                 ('rubbish L was', 'rubbish was'), ('Czesar', 'Caesar'), (' j might', ' I might'), (' w here ', ' where '), ('phe minor', 'the minor'), ('that ih the', 'that the'),
                 (' pou ', ' you '), (' j am ', ' I am '), ('dog of hall', 'dog of Hell'), ('[| spent', 'I spent'), ('prefect', 'præfect'), ('Lorp', 'Lord'), ('“ T have', '“I have'),
                 ('&e.', '&c.'), ('‘‘ ', '“'), ('”’', '”')):
        p = p.replace(a, b)
    return p


def collect(P, a, b):
    """pages a..b -> paragraphs with ⟦n⟧ markers, notes"""
    paras, notes = [], []
    for pi in range(a, b):
        blocks = page_blocks(tsv_page(TESS % pi) if os.path.exists(TESS % pi) else P[pi])
        texts = []
        for k, ls in blocks:
            if k != 'text':
                continue
            # tesseract gives a page as one block: split it at indented lines
            lft = sorted(l['x0'] for l in ls)[len(ls) // 4] if len(ls) > 3 else min(l['x0'] for l in ls)
            right = sorted(l['x1'] for l in ls)[len(ls) // 2]
            cur = []
            for j, l in enumerate(ls):
                prev = ls[j - 1] if j else None
                if cur and l['x0'] - lft > 25 and (re.search(r"[.!?:\"”’)]\s*$", prev['text']) or right - prev['x1'] > 150):
                    texts.append(cur)
                    cur = []
                cur.append(l)
            if cur:
                texts.append(cur)
        ns = [join_lines([l['text'] for l in ls]) for k, ls in blocks if k == 'note']
        start = len(paras)
        for i, ls in enumerate(texts):
            t = join_lines([l['text'] for l in ls])
            indented = ls[0]['x0'] - min(l['x0'] for l in ls) > 25 if len(ls) > 1 else True
            if not re.search(r"[A-Za-z]{3}", t):
                continue  # debris of the margin
            if paras and (t[:1].islower() or not re.search(r"[.!?:\"”’)]\s*$", paras[-1]) or (i == 0 and not indented)):
                paras[-1] = join_lines([paras[-1], t])
                start -= 1
            else:
                paras.append(t)
        for n in ns:
            mk = n[0]
            notes.append(re.sub(r"^[*†‡§]\s*", '', n))
            k = len(notes) - 1
            for j in range(max(0, start), len(paras)):
                m = list(re.finditer(r"(?<=[\w,.;:)\"”’])\s?%s" % re.escape(mk), paras[j]))
                if m:
                    x = m[0]
                    paras[j] = paras[j][:x.start()] + '⟦%d⟧' % k + paras[j][x.end():]
                    break
            else:
                ends = [j for j in range(max(0, start), len(paras)) if re.search(r"[.!?\"”’]\s*$", paras[j])]
                j = ends[-1] if ends else max(0, start)
                paras[j] += '⟦%d⟧' % k
                print('note marker not found, placed at a paragraph end:', n[:60])
    return paras, notes


def render(title, paras, notes):
    used = []

    def rep(m):
        used.append(tidy(notes[int(m.group(1))]))
        return '[^%d]' % len(used)
    paras = [x for p in paras for x in re.split(r"\s+(?=§\s*\d+\.\s)", p)]
    ps = [re.sub(r"⟦(\d+)⟧", rep, tidy(p)) for p in paras]
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
    if used:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, n) for i, n in enumerate(used)) + '\n'
    return md


def find(P, rx, start=0):
    return next(i for i in range(start, len(P)) if re.search(rx, ' '.join(l['text'] for par in P[i] for l in par)))


def cut_after(paras, rx):
    """drop the paragraphs from the one matching rx (the next work's heading) on"""
    for i, p in enumerate(paras):
        if re.search(rx, p):
            return paras[:i]
    return paras


def main():
    P = pages(COORDS)
    fel = find(P, r"SAINT FELIX\.")
    ved = find(P, r"LIFE OF SAINT VEDAST", fel)
    alb = find(P, r"AN EPISTLE\s+FROM BEDE TO ABBOT ALBINUS", ved)
    egb = find(P, r"AN EPISTLE\s+FROM BEDE TO BISHOP EGBERT", alb)
    end = find(P, r"Here follow", egb)
    words = 0
    # Felix
    ps, ns = collect(P, fel, ved + 1)
    ps = cut_after(ps, r"LIFE OF SAINT VEDAST|^CHAPTER I\.")
    while ps and not re.match(r"^T\w\w blessed triumph", ps[0]):
        ps = ps[1:]
    ps[0] = re.sub(r"^T\w\w ", 'The ', ps[0])
    ps[-1] = re.sub(r"^\[\s*", '', ps[-1])
    os.makedirs(BEDE + '/vita-felicis/en-US', exist_ok=True)
    md = render('Life of St. Felix, Confessor', ps, ns)
    open(BEDE + '/vita-felicis/en-US/vita-felicis.md', 'w').write(md)
    words += len(md.split())
    print('felix', len(md.split()), len(ps), 'paras', md.count(']: '), 'notes')
    # the letters
    ps, ns = collect(P, alb, end + 1)
    ps = [re.sub(r"\s*Here follow\s?eth\s*:?\s*$", '', p) for p in ps]
    ps = [p for p in ps if p.strip()]
    i_alb = next(i for i, p in enumerate(ps) if re.match(r"^Bede, the Servant of Christ, to the most Beloved", p))
    i_egb = next(i for i, p in enumerate(ps) if i > i_alb and re.search(r"AN EPISTLE", p))
    i_egb_s = next(i for i, p in enumerate(ps) if i > i_egb and p.startswith('Bede, the Servant of Christ'))
    os.makedirs(BEDE + '/epistolae/en-US', exist_ok=True)
    md = render('Letter I. To Abbot Albinus, on His Ecclesiastical History', ps[i_alb:i_egb], ns)
    open(BEDE + '/epistolae/en-US/e01.md', 'w').write(md)
    words += len(md.split())
    print('albinus', len(md.split()))
    head = ' '.join(ps[i_egb:i_egb_s])
    marks = re.findall(r"⟦\d+⟧", head)
    body = ps[i_egb_s:]
    body[0] += ''.join(marks)
    body = body[:next(i for i, p in enumerate(body) if re.search(r"Amen\s*!", p)) + 1]
    md = render('Letter II. To Bishop Egbert, on Ecclesiastical Discipline', body, ns)
    open(BEDE + '/epistolae/en-US/e02.md', 'w').write(md)
    words += len(md.split())
    print('egbert', len(md.split()), md.count(']: '), 'notes')
    print('words', words)
    src = {'language': 'en-US', 'url': 'https://archive.org/details/theminorhistoric00bede',
           'edition': "The Miscellaneous Works of Venerable Bede, ed. and trans. J. A. Giles, vol. 4 (London: Whittaker, 1843), in the reprint as 'The Minor Historical Works of Venerable Bede'; archive.org theminorhistoric00bede.",
           'tier': 'A', 'tierEvidence': 'Giles died in 1884; printed 1843: public domain.'}
    # book metadata
    for d, desc, titles in (('vita-felicis', "Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread: Giles's side-notes in the margin dropped by their position, running heads and page numbers dropped.", {}),
                            ('epistolae', "Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread: the letters to Albinus and to Egbert only (I and II). Giles's side-notes dropped by their position; his footnotes kept; the section numbers of the letter to Egbert as inert bold.",
                             {'e01': 'Letter I. To Abbot Albinus, on His Ecclesiastical History', 'e02': 'Letter II. To Bishop Egbert, on Ecclesiastical Discipline'})):
        f = '%s/%s/book.json' % (BEDE, d)
        book = json.load(open(f))
        if 'en-US' not in book['languages']:
            book['languages'].append('en-US')
        book.setdefault('editions', {})['en-US'] = {'translator': 'J. A. Giles', 'year': 1843, 'from': 'la'}
        book['sources'] = [x for x in book['sources'] if x['language'] != 'en-US'] + [dict(src, description=desc)]
        for n in book['toc']:
            if n['id'] in titles:
                n['title']['en-US'] = titles[n['id']]
        book['arrived'] = dict(book.get('arrived') or {}, **{'en-US': '2026-11-03'})
        e = book['description']['en-US']
        e = e.replace("; the English of Giles survives only in an OCR scan, not yet imported.", "; English translation of J. A. Giles (1843).")
        e = e.replace("; no public-domain English translation of the whole is available here.", "; the letters to Albinus and to Egbert in the English of J. A. Giles (1843).")
        book['description']['en-US'] = e
        json.dump(book, open(f, 'w'), ensure_ascii=False, indent=2)
        open(f, 'a').write('\n')


if __name__ == '__main__':
    main()
