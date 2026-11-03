"""Bernard, Sermons on the Canticle of Canticles, translated by a priest of Mount Melleray (Dublin 1920, 2 vols),
archive.org stbernardssermon01bern / 02bern -> en-US of bernard-opera-omnia/sermones-super-cantica (s01..s86),
with the translator's preface and the two appendices as English-only chapters.

Read from the _djvu.xml (research/sourcing/_skipped/coords/): per page, the running head is dropped, the notes
are the paragraphs from the first one opening with a lone '*' (later ones with 't', 'f' or '†' for the dagger),
and each note is paired with its marker on the same page (a trailing '*', or a 't'/'f'/'†' after punctuation).
A note whose marker is not found, or whose text is too garbled (dictionary share < 0.85), is dropped with its
marker. Paragraphs are joined across pages unless the next page opens with an indented line. A lexicon pass
corrects tokens that are not words when one edit makes a frequent word (gutter-lost letters, m/in, U/li).
Leaves with a tesseract TSV in research/sourcing/_skipped/tess/ are read from it instead.
The chapters in en-US/ were then corrected by hand against the page images where the OCR was worst, so a rerun
must name the chapters it may overwrite: --only=s42,s44.
usage: python3.13 bernard_cantica_mm.py [--dry] [--only=ID,...]"""
import collections, json, os, pickle, re, statistics, sys
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages, tsv_page  # noqa: E402
from en_common import join_lines  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
COORDS = ROOT + '/research/sourcing/_skipped/coords/stbernardssermon%sbern_djvu.xml'
BOOK = ROOT + '/content/books/bernard-opera-omnia/sermones-super-cantica'
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
DICT = set(w.strip().lower() for w in open('/usr/share/dict/words'))
STATS = collections.Counter()
FIXLOG = collections.Counter()


LATIN = set(w.strip().lower() for w in open(ROOT + '/research/sourcing/_skipped/tools/latin_words.txt'))


def known0(lw):
    return lw in DICT or LEX.get(lw, 0) >= 3


def known(w):
    lw = w.lower()
    if known0(lw):
        return True
    for suf, add in (('est', ''), ('est', 'e'), ('eth', ''), ('eth', 'e'), ('st', ''), ('th', ''), ('s', ''), ('es', ''), ('ings', ''), ('ings', 'e'), ('ly', '')):
        if lw.endswith(suf) and len(lw) > len(suf) + 2 and known0(lw[:-len(suf)] + add):
            return True
    return False


def freq(w):
    return LEX.get(w.lower(), 0) + (2 if w.lower() in DICT else 0)


def score(t):
    toks = [x for x in re.findall(r"[A-Za-z]+", t) if len(x) > 1]
    return sum(known(x) for x in toks) / max(1, len(toks))


HEAD = re.compile(r"BERNARD|^\s*[\dIVXLCivxlc]{1,4}\s+[A-Z'’ ,.;-]{6,}$|^[A-Z'’ ,.;:-]{6,}\s+[\dIVXLCivxlc]{1,4}\s*$")


def is_head(par):
    if len(par) != 1:
        return False
    t = par[0]['text'].strip()
    if re.fullmatch(r"[\dIl|]{1,4}", t):
        return True
    a = [c for c in t if c.isalpha()]
    return len(a) >= 5 and sum(c.isupper() for c in a) >= 0.8 * len(a) and bool(HEAD.search(t)) and len(t) < 70


def head_line(l):
    t = l['text'].strip()
    if re.search(r"BERNARD.?S\s+SERMONS|TRANSLATOR.?S\s+PREFACE", t) or re.fullmatch(r"[\dIl|]{1,4}", t):
        return True
    a = [c for c in t if c.isalpha()]
    return len(t) < 70 and len(a) >= 6 and sum(c.isupper() for c in a) >= 0.85 * len(a) and not re.match(r"^(SERMON|APPENDIX)\b", t)


NOTE1 = re.compile(r"^\*\s+(?!\*)")
NOTEN = re.compile(r"^[tf†‡J§]\s+(?=\S)")


def page_parts(p):
    """-> (body blocks [(kind, lines)], notes as text list). kind: 'para' (first line indented or after a short
    line), 'cont' (the page's first block when not indented: continues the last paragraph), 'center'."""
    pars = [list(par) for par in p]
    if pars and head_line(pars[0][0]):
        pars[0] = pars[0][1:]
    pars = [par for par in pars if par]
    if pars and len(pars[-1]) == 1 and re.fullmatch(r"[\dIl|]{1,4}", pars[-1][0]['text'].strip()):
        pars = pars[:-1]
    notes = []
    k0 = next((k for k, par in enumerate(pars) if k and NOTE1.match(par[0]['text'])), None)
    body = pars if k0 is None else pars[:k0]
    for par in ([] if k0 is None else pars[k0:]):
        t = join_lines([l['text'] for l in par])
        if NOTE1.match(t) or NOTEN.match(t) or not notes:
            notes.append(t)
        else:
            notes[-1] = join_lines([notes[-1], t])
    lines = [l for par in body for l in par]
    if not lines:
        return [], notes
    # the first word's box is sometimes stretched leftwards or rightwards: estimate the line start from the second word
    cws = [(l['x1'] - l['x0']) / max(1, len(l['text'])) for l in lines if len(l['text']) > 30]
    cw = statistics.median(cws) if cws else 30
    for l in lines:
        ws = l['words']
        if len(ws) > 1:
            est = ws[1][0][0] - (len(ws[0][1]) + 1) * cw
            if abs(est - l['x0']) > 2 * cw:
                l['x0'] = est
    full = [l for l in lines if l['x1'] - l['x0'] > 0.8 * max(x['x1'] - x['x0'] for x in lines)] or lines
    def local(i, key):
        y = lines[i]['yb']
        near = sorted(full, key=lambda l: abs(l['yb'] - y))[:7]
        return statistics.median(l[key] for l in near)
    blocks = []
    for i, l in enumerate(lines):
        L, R = local(i, 'x0'), local(i, 'x1')
        lm, rm = l['x0'] - L, R - l['x1']
        center = lm > 40 and rm > 40 and abs(lm - rm) < 140
        indent = l['x0'] - L > 25
        prev_short = i and R - lines[i - 1]['x1'] > 60
        if center:
            if blocks and blocks[-1][0] == 'center' and not re.match(r"^SERMON\b|^APPENDIX\b", l['text']) \
                    and not re.match(r"^SERMON\b|^APPENDIX\b", blocks[-1][1][-1]['text']):
                blocks[-1][1].append(l)
            else:
                blocks.append(['center', [l]])
        elif not blocks:
            blocks.append(['para' if indent else 'cont', [l]])
        elif indent or prev_short or blocks[-1][0] == 'center':
            blocks.append(['para', [l]])
        else:
            blocks[-1][1].append(l)
    return blocks, notes


MARK1 = re.compile(r"(?<=[A-Za-z,.;:!?\"'”’)])\s?\*(?![*'\"“”‘’])")
MARKN = re.compile(r"(?<=[,.;:!?\"'”’)])\s?[tf†‡](?=[\s,.;:]|$)")


# leaves the archive.org OCR garbled past repair, re-read with tesseract from the page images (w2000)
TESS = ROOT + '/research/sourcing/_skipped/tess/v%s_n%d.tsv'


def volume(v):
    """-> list of [kind, text]; footnotes inserted as ⟦text⟧ placeholders"""
    out = []
    for pi, p in enumerate(pages(COORDS % v)):
        if os.path.exists(TESS % (v, pi)):
            p = tsv_page(TESS % (v, pi))
            STATS['tesseract pages'] += 1
        blocks, notes = page_parts(p)
        texts = [[k, join_lines([l['text'] for l in ls])] for k, ls in blocks]
        STATS['notes'] += len(notes)
        for ni, nt in enumerate(notes):
            rx = MARK1 if ni == 0 else MARKN
            for bl in texts:
                m = rx.search(bl[1])
                if m:
                    nt2 = re.sub(r"^(\*|[tf†‡J§])\s+", '', nt)
                    keep = score(nt2) >= 0.85
                    bl[1] = bl[1][:m.start()] + (('⟦%s⟧' % nt2) if keep else '') + bl[1][m.end():]
                    STATS['kept' if keep else 'garbled'] += 1
                    break
            else:
                STATS['unmatched'] += 1
                UNMATCHED.append((v, pi, nt[:80]))
        out.extend(texts)
    return out


UNMATCHED = []


def merge(items):
    res = []
    for k, t in items:
        # a page often opens with a line the indent test takes for a new paragraph; a lowercase start after a
        # hyphen or an unfinished sentence is always the same paragraph
        runon = res and res[-1][0] != 'center' and t[:1].islower() and re.search(r"[A-Za-z,;-]$", res[-1][1].rstrip())
        if res and (k == 'cont' or runon) and res[-1][0] != 'center':
            res[-1][1] = join_lines([res[-1][1], t])
        else:
            res.append([k, t])
    return res


CONF = [('m', 'in'), ('in', 'm'), ('rn', 'm'), ('U', 'li'), ('H', 'li'), ('U', 'll'), ('ii', 'u'), ('li', 'h'), ('tl', 'd'), ('cl', 'd'),
        ('WT', 'Wh'), ('hm', 'lm'), ('c', 'e'), ('e', 'c'), ('1', 'l'), ('l', 'i'), ('i', 'l'), ('f', 't'), ('t', 'f'), ('h', 'b')]
ALPHA = 'abcdefghijklmnopqrstuvwxyz'


def cands(w):
    lw = w
    s = set()
    for i in range(len(lw) + 1):
        for c in ALPHA:
            s.add(lw[:i] + c + lw[i:])
    for i in range(len(lw)):
        if 0 < i < len(lw) - 1:  # gutter losses add letters at the ends; never drop one there
            s.add(lw[:i] + lw[i + 1:])
        for c in ALPHA:
            s.add(lw[:i] + c + lw[i + 1:])
    for a, b in CONF:
        for m in re.finditer(re.escape(a), lw):
            s.add(lw[:m.start()] + b + lw[m.end():])
    return s


SUBS = [('m', 'in'), ('rn', 'm'), ('U', 'li'), ('U', 'll'), ('H', 'li'), ('H', 'll'), ('h', 'li'), ('hn', 'lm'), ('WT', 'Wh'),
        ('Wl', 'Wh'), ('tl', 'd'), ('ii', 'u'), ('1', 'l'), ('1', 'i'), ('0', 'o'), ('j', 'y'), ('j', 'f'), ('J', 'f'), ('3r', 'y'),
        ('5', 'y'), ('fk', 'th'), ('tb', 'th'), ('li', 'h'), ('ri', 'n'), ('vv', 'w'), ('c', 'e'), ('e', 'c'), ('ct', 'd'), ('U', 'il'), ('H', 'il'),
        ('i', 'r'), ('I', 'l')]


def sub_variants(w, limit=400):
    out = {w}
    for a, b in SUBS:
        new = set()
        for x in out:
            idx = [m.start() for m in re.finditer(re.escape(a), x)]
            # replace every occurrence, or each single one
            if idx:
                new.add(x.replace(a, b))
                for i in idx:
                    new.add(x[:i] + b + x[i + len(a):])
        out |= new
        if len(out) > limit:
            break
    out.discard(w)
    return out


KEEP = {'defecated', 'actualised', 'foresooth', 'impletus', 'apostolae'}


def fix_word(w):
    if len(w) < 3 or known(w) or w.isupper() and len(w) < 5 or w.lower() in LATIN or w.lower() in KEEP or w[0].isdigit():
        return w
    subs = {c for c in sub_variants(w) if known0(c.lower()) and freq(c) >= 20 and c[1:] == c[1:].lower()}
    edits = set() if w[0].isupper() else {c for c in cands(w) if c.lower() != w.lower() and known0(c.lower())}
    best = sorted(((freq(c), c) for c in subs | edits), reverse=True)
    if not best:
        return w
    top = best[0]
    second = best[1][0] if len(best) > 1 else 0
    if top[1] not in subs and (top[0] < 30 or top[0] < 3 * second):
        return w
    c = top[1]
    if c.lower().replace('z', 's') == w.lower().replace('z', 's'):
        return w
    if w[0].isupper() and not c[0].isupper():
        c = c[0].upper() + c[1:]
    FIXLOG[(w, c)] += 1
    return c


def fix_text(t):
    t = re.sub(r"(?<=[a-z])\}['^]?|(?<=[a-z])[j5]\^", 'y', t)  # "sa}^", "everj^": y read as }^ or j^
    t = re.sub(r"(?<=[a-z])\^(?=[a-z])", '', t)  # "w^as", "receiv^ed"
    # a word broken at the line end without its hyphen: "con nected", "pos sessing"
    t = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if known0((m.group(1) + m.group(2)).lower()) and (not known(m.group(1)) or not known(m.group(2))) else m.group(0), t)
    t = re.sub(r"(?<![\w'])([A-Za-z0-9][a-zA-Z0-9]*[A-Za-z0-9])(?![\w'])", lambda m: fix_word(m.group(1)) if re.search('[A-Za-z]', m.group(1)) and not m.group(1).isdigit() else m.group(1), t)
    # a word split at the gutter: "sufficient y" -> "sufficiently"
    t = re.sub(r"\b([A-Za-z]{3,}) ([a-z]{1,2})\b", lambda m: (m.group(1) + m.group(2)) if known(m.group(1) + m.group(2)) and (not known(m.group(1)) or (m.group(2) not in ('a', 'i', 'o') and not known(m.group(2)))) else m.group(0), t)
    # glued words: "meamngin", "tonnessof": split before a final short function word
    t = re.sub(r"\b([a-z]{3,})(of|in|to|as|is|at|on|or)\b", lambda m: m.group(1) + ' ' + m.group(2) if not known(m.group(0)) and known(m.group(1)) else m.group(0), t)
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return t


ROMAN = {}
def roman(n):
    vals = [(100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    s = ''
    for v, r in vals:
        while n >= v:
            s += r; n -= v
    return s
for i in range(1, 100):
    ROMAN[roman(i)] = i


def quotes(p):
    """straight double quotes: drop the OCR's space after an opening and before a closing one, when they pair up"""
    if p.count('"') % 2:
        return p
    out, n = [], 0
    for part in re.split(r'(")', p):
        if part == '"':
            if n % 2 == 0:
                out.append('"')
            else:
                if out:
                    out[-1] = out[-1].rstrip()
                out.append('"')
            n += 1
        else:
            out.append(part.lstrip() if n % 2 == 1 and out and out[-1] == '"' else part)
    return ''.join(out)


def tidy(p):
    p = p.replace('⟦', '\x01').replace('⟧', '\x02')
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"(?<=[\w,.;:!?])\s?/['’]", '"', p)
    p = p.replace("''", '"').replace('“', '"').replace('”', '"').replace('‘‘', '"').replace('’’', '"')
    p = re.sub(r'"[‘’]|[‘’]"', '"', p).replace('""', '"').replace('™y', 'my')
    p = re.sub(r"\b([A-Za-z]+)-[^\sA-Za-z\-]?[a-z]? ([a-z]+)\b", lambda m: m.group(1) + m.group(2) if known(m.group(1) + m.group(2)) and not known(m.group(2)) else m.group(0), p)
    p = re.sub(r"(?<=\s)[>^|\\](?=[a-z])", '', p)  # gutter specks before a word
    if p.count('(') < p.count(')'):  # an unpaired ')' before a word is a speck too
        p = re.sub(r"(?<=\s)\)(?=[a-z])", '', p)
    p = quotes(p)
    p = re.sub(r'(^|\s)" (?=\w)', r'\1"', p)
    p = re.sub(r'(?<=[\w,.;:!?])\s+"(?=\s|$|[,.;:])', '"', p)
    p = re.sub(r"\s+([,.;:!?])(?=\s|$|\")", r"\1", p)
    return p.replace('\x01', '⟦').replace('\x02', '⟧')


def notes_out(paras):
    notes = []
    def rep(m):
        notes.append(m.group(1).strip())
        return '[^%d]' % len(notes)
    paras = [re.sub(r"⟦(.*?)⟧", rep, p) for p in paras]
    return paras, notes


def segment(items):
    """-> preface, list of [num, title, paras, head-note], appendices"""
    sermons, cur, pre, app = [], None, [], []
    i, mode = 0, 'front'
    while i < len(items):
        k, t = items[i]
        m = re.match(r"^SERMON\s+([IVXLCHl1 ]+?)\s*\.?\s*(⟦.*⟧)?\s*\*?\s*$", t)
        ma = re.match(r"^APPENDIX\s+([AB])\s*\.?\s*$", t)
        if m or ma:
            title = []
            i += 1
            while i < len(items) and len(title) < 4 and (not title or items[i][0] == 'center' or len(items[i][1]) < 110) \
                    and not re.search(r"\.\s*(⟦.*?⟧)?\s*$|[.]\s+[\"“'*•]", ' '.join(title)):
                title.append(items[i][1]); i += 1
            title = join_lines(title)
            epi = re.split(r"(?<![A-Z][a-z])(?<!St)\.\s+(?=\S)", title, maxsplit=1)
            title = epi[0]
            if len(epi) > 1:
                items.insert(i, ['center', epi[1]])
            if m:
                num = ROMAN.get(m.group(1).replace(' ', '').replace('H', 'II').replace('l', 'I').replace('1', 'I'))
                assert num, t
                cur = [num, title, [], m.group(2) or '']
                sermons.append(cur)
            else:
                cur = [ma.group(1), title, [], '']
                app.append(cur)
            mode = 'body'
            continue
        if not (k == 'center' and re.fullmatch(r"[\divxlcIVXLC|.,' ]{1,6}", t.strip())):
            (pre if mode == 'front' else cur[2]).append(t)
        i += 1
    return pre, sermons, app


SMALLW = {'of', 'the', 'and', 'in', 'to', 'a', 'an', 'by', 'for', 'on', 'with', 'from', 'at', 'or', 'as', 'is', 'be', 'its', 'which', 'what', 'who', 'that', 'are', 'how', 'into', 'her', 'his', 'she', 'he', 'it', 'than', 'between', 'among', 'according', 'whom', 'has', 'been', 'being', 'their', 'our', 'should', 'may', 'will', 'can', 'well', 'not', 'yet', 'so', 'but', 'each'}


def title_case(t):
    t = re.sub(r"⟦.*?⟧", '', t)
    t = re.sub(r"\s+", ' ', t).strip().rstrip('.').strip()
    t = re.sub(r"^[tf†*]\s+", '', t)
    t = re.sub(r"[/'’]+$", '', t).strip(' ,;')
    out = []
    for i, w in enumerate(t.split(' ')):
        lw = w.lower()
        if i and lw.strip('.,;:()') in SMALLW:
            out.append(lw)
        else:
            out.append(lw[:1].upper() + lw[1:] if not re.fullmatch(r"[IVXLC]+\W*", w) else w)
    t = ' '.join(out)
    t = re.sub(r"(?<=[\s(-])(god|christ|jesus|solomon|holy ghost|word)\b", lambda m: m.group(1).title(), t)
    return t


# headings the OCR damaged, read from the page and the contents list
TITLES = {
    1: 'On the Meaning of the Title: "Solomon\'s Canticle of Canticles"',
    4: "On the Three Stages of the Soul's Progress, Symbolised by the Kiss of Christ's Feet, Hand, and Mouth",
    20: 'On the Various Degrees and Characteristics of the Love of Christ',
    55: 'On the Divine Mercy and Justice as Signified by the Hart and the Roe, Respectively',
    67: 'On Mystical Eructation and on Grace, Antecedent and Consequent',
    81: "On the Soul's Likeness to the Word in the Three Attributes of Simplicity, Immortality and Liberty",
    83: 'On the Right of Every Soul to Aspire to the Nuptials of the Word, and in what this Spiritual Marriage Consists',
    'A': 'On the Sacred Heart',
    'B': 'The Glories of Saints Bernard and Augustine',
}


def main():
    dry = '--dry' in sys.argv
    allp = []
    pre1, s1, _ = segment(merge(volume('01')))
    pre2, s2, app = segment(merge(volume('02')))
    sermons = s1 + s2
    nums = [s[0] for s in sermons]
    print('sermons', len(sermons), [n for n in range(1, 87) if n not in nums], [n for n in nums if nums.count(n) > 1])
    print(STATS)
    for u in UNMATCHED[:40]: print('  unmatched', u)
    # the translator's preface: from its first heading to the contents
    pre = []
    on = False
    for t in pre1:
        if t.startswith('So far as I am aware'):
            on = True
        if re.match(r"^CONTENTS", t):
            on = False
        if on:
            pre.append(t)
    chapters = []
    chapters.append(('translator-preface', "Translator's Preface", pre))
    for num, title, ps, hn in sermons:
        title = title_case(title.replace('⟦', ' ⟦'))
        title = re.sub(r"⟦.*?⟧", '', title).strip()
        title = TITLES.get(num) or tidy(fix_text(title)).replace(' ;', ';')
        chapters.append(('s%02d' % num, 'Sermon %s. %s' % (roman(num), title), ps))
    for letter, title, ps, _ in app:
        chapters.append(('appendix-%s' % letter.lower(), 'Appendix %s. %s' % (letter, TITLES[letter]), ps))
    if dry:
        for cid, t, ps in chapters:
            print(cid, t, len(ps), sum(len(p.split()) for p in ps))
        return
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    words = 0
    nnotes = 0
    only = next((a.split('=')[1].split(',') for a in sys.argv if a.startswith('--only=')), None)
    for cid, title, ps in chapters:
        if only and cid not in only:  # the other chapters carry hand corrections from the page images
            continue
        ps = [tidy(fix_text(p)) for p in ps]
        if cid.startswith('s') and ps and len(ps[0]) < 220 and ps[0][:1] in '"\'*•‘':
            ps[0] = '*"%s"*' % ps[0].strip('"\'*•‘’ ,').rstrip('/')
        ps, notes = notes_out(ps)
        nnotes += len(notes)
        md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
        if notes:
            md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, tidy(fix_text(n))) for i, n in enumerate(notes)) + '\n'
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
        words += len(md.split())
    print('words', words, 'notes', nnotes, 'fixes', sum(FIXLOG.values()))
    json.dump({'%s -> %s' % k: v for k, v in FIXLOG.most_common()}, open(ROOT + '/research/sourcing/_skipped/cantica_fixlog.json', 'w'), indent=0)
    if only:
        return
    b = json.load(open(BOOK + '/book.json'))
    if 'en-US' not in b['languages']:
        b['languages'].append('en-US')
    titles = {cid: t for cid, t, ps in chapters}
    for n in b['toc']:
        if n['id'] in titles:
            n['title']['en-US'] = titles[n['id']]
    ids = [n['id'] for n in b['toc']]
    if 'translator-preface' not in ids:
        b['toc'].insert(0, {'id': 'translator-preface', 'title': {'en-US': titles['translator-preface']}})
    for cid in ('appendix-a', 'appendix-b'):
        if cid not in ids:
            b['toc'].append({'id': cid, 'title': {'en-US': titles[cid]}})
    b.setdefault('editions', {})['en-US'] = {'translator': 'A priest of Mount Melleray', 'year': 1920}
    b['sources'] = [s for s in b['sources'] if s['language'] != 'en-US'] + [{
        'language': 'en-US', 'url': 'https://archive.org/details/stbernardssermon01bern',
        'edition': "St. Bernard's Sermons on the Canticle of Canticles, translated from the original Latin by a Priest of Mount Melleray, 2 vols. (Dublin: Browne and Nolan, 1920); archive.org stbernardssermon01bern and stbernardssermon02bern.",
        'description': "Archive.org OCR read from the word-coordinate file and cleaned by script, not proofread: running heads dropped, words broken at the gutter or misread repaired by a lexicon pass. The translator's footnotes are kept where their marker was found on the same page and the note is legible. The translator's preface and his two appendices (on the Sacred Heart; the glories of Saints Bernard and Augustine) are English-only chapters.",
        'tier': 'A', 'tierEvidence': 'Published in 1920, before 1931: public domain in the US.'}]
    b.setdefault('arrived', {}).setdefault('en-US', '2026-11-03')
    json.dump(b, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
