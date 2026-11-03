"""Fénelon, Dialogues of the Dead, translated by [James] Elphinston (Glasgow: R. and A. Foulis, 1754, 2 vols.;
archive.org bim_eighteenth-century_dialogues-des-morts-en_fnelon-franois-de-sal_1754_1 and _2).

Two readings of every page are collated: the archive.org OCR (word-coordinate file, which keeps the lines and often
reads the long s right) and Tesseract on the page image (research/sourcing/_skipped/tess/fen/, which reads the words
more cleanly but takes every long s for an f and now and then drops a line). The two are aligned word by word on a key
that ignores f/s; where they differ, the reading that is an English word wins, the archive.org one on a tie. A long s
read as f is then restored where only the s-form is a word ("fuch" such, "neceffity" necessity); where both are words
("fame", "fit") the f stands. Running heads, page numbers, signature marks and catchwords are dropped.
usage: python3.13 fenelon_dead_elphinston.py"""
import difflib, json, os, pickle, re, statistics, sys
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages, tsv_page  # noqa: E402
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
SK = ROOT + '/research/sourcing/_skipped'
COORDS = SK + '/coords/fen54_%d_djvu.xml'
TESS = SK + '/tess/fen/v%d_n%d.tsv'
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
STATS = {}


def word(w):
    w = w.lower()
    if re.fullmatch(r"[a-z]{3,}(e?st|dst)", w) and (inW(re.sub(r"e?st$|dst$", '', w)) or inW(re.sub(r"st$", '', w)) or inW(re.sub(r"dst$", 'd', w))):
        return True  # thou-forms: hadst, didst, promisedst, knowest
    return inW(w) and LEX.get(w, 0) >= 5 or w in ('a', 'i', 'o', 'tho', 'thro', 'tis', 'twas', 'thou', 'thee', 'thy', 'hast', 'hath', 'dost', 'doth', 'wast', 'shalt', 'wilt', 'art')


def core(t):
    return re.sub(r"^[^A-Za-zſ]+|[^A-Za-zſ']+$", '', t)


def key(t):
    return core(t).lower().replace('ſ', 's').replace('f', 's')


def unlong(w):
    """a word with long s read as f -> the s-form when only it is a word"""
    w = w.replace('ſ', 's')
    c = core(w)
    if not c or word(c.replace("'", '')) or 'f' not in c.lower():
        return w
    idx = [i for i, ch in enumerate(c) if ch in 'fF']
    best = None
    for mask in range(1, 1 << min(len(idx), 4)):
        x = list(c)
        for b, i in enumerate(idx[:4]):
            if mask >> b & 1:
                x[i] = 's' if c[i] == 'f' else 'S'
        x = ''.join(x)
        if word(x.replace("'", '')):
            best = x
            break
    return w.replace(c, best) if best else w


def isword(t):
    c = core(unlong(t)).replace("'", '')
    return bool(c) and (word(c) or c[:1].isupper() and len(c) > 1 and c[1:].islower())


def collate(base, tess):
    """base: list of lines (each a list of tokens); tess: flat token list -> corrected lines"""
    flat = [(li, ti, t) for li, l in enumerate(base) for ti, t in enumerate(l)]
    a = [key(t) for _, _, t in flat]
    b = [key(t) for t in tess]
    out = [list(l) for l in base]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1):
                li, ti, t = flat[i1 + k]
                u = tess[j1 + k]
                # same letters but for f/s: the base may have the long s right, tess the punctuation
                if not isword(t) and isword(u):
                    out[li][ti] = u
        elif op == 'replace':
            if i2 - i1 == j2 - j1:
                for k in range(i2 - i1):
                    li, ti, t = flat[i1 + k]
                    u = tess[j1 + k]
                    if not isword(t) and isword(u):
                        out[li][ti] = u
                        STATS['tess word'] = STATS.get('tess word', 0) + 1
            else:
                bt = [flat[k][2] for k in range(i1, i2)]
                ut = tess[j1:j2]
                if not all(isword(t) for t in bt) and all(isword(u) for u in ut) and len(ut) <= len(bt) + 2:
                    li, ti, _ = flat[i1]
                    for k in range(i1, i2):
                        out[flat[k][0]][flat[k][1]] = None
                    out[li][ti] = ' '.join(ut)
                    STATS['tess run'] = STATS.get('tess run', 0) + 1
        elif op == 'delete':
            for k in range(i1, i2):
                li, ti, t = flat[k]
                c = core(t)
                if not re.fullmatch(r"[.,;:!?'\"()\-—]+|\d+", t) and (not c or len(c) <= 2 and not isword(t) or re.search(r"[^A-Za-zſ'.,;:!?\"()\-—]", t)):
                    out[li][ti] = None
                    STATS['junk dropped'] = STATS.get('junk dropped', 0) + 1
        elif op == 'insert' and 0 < i1 < len(flat):
            ut = tess[j1:j2]
            if len(ut) >= 3 and sum(isword(u) for u in ut) >= 0.85 * len(ut):
                li, ti, _ = flat[i1 - 1]
                out[li][ti] = (out[li][ti] or '') + ' ' + ' '.join(ut)
                STATS['tess line'] = STATS.get('tess line', 0) + 1
    return [' '.join(unlong(x) for t in l if t for x in t.split()) for l in out]


def page_lines(P, v, pi):
    """the collated lines of the text column of one page, without head, page number, signature and catchword"""
    ls = [l for par in P[pi] for l in par]
    long = [l for l in ls if len(l['words']) >= 5]
    if len(long) < 3:
        return []
    left = statistics.median(l['x0'] for l in long)
    right = statistics.median(l['x1'] for l in long)
    H = statistics.median(l['h'] for l in long)
    keep = [l for l in ls if l['x1'] > left + 80 and l['x0'] < right - 80 and l['x0'] > left - 150 and l['x1'] < right + 150 and l['h'] < 2.5 * H]
    keep.sort(key=lambda l: l['yb'])
    # the running head is the top line of the column: drop it unless it opens a dialogue
    if keep and len(keep[0]['text'].split()) <= 8 and not re.search(r"DIALOG", keep[0]['text']) and \
            (re.search(r"\d", keep[0]['text']) or sum(c.isupper() for c in keep[0]['text']) > 0.5 * max(1, sum(c.isalpha() for c in keep[0]['text']))):
        keep = keep[1:]
    tl = []
    if os.path.exists(TESS % (v, pi)):
        tl = [w for par in tsv_page(TESS % (v, pi)) for l in par for w in l['text'].split()]
    lines = collate([l['text'].split() for l in keep], tl) if tl else [l['text'] for l in keep]
    out = [dict(l, text=t) for l, t in zip(keep, lines)]
    # running head: the first line, short, with the page number or the dialogue's speakers in capitals
    if out and len(out[0]['text'].split()) <= 7 and (re.search(r"\d", out[0]['text']) or sum(c.isupper() for c in out[0]['text']) > 0.5 * sum(c.isalpha() for c in out[0]['text'])) \
            and not re.search(r"DIALOGU", out[0]['text']):
        out = out[1:]
    # catchword and signature: short lines at the foot
    while out and len(out[-1]['text'].split()) <= 2 and (out[-1]['x0'] > left + 0.5 * (right - left) or not re.search(r"[a-z]{3}", out[-1]['text'])):
        out = out[:-1]
    def good(t):
        ws = [w for w in t.split() if re.search(r"[A-Za-z]", w)]
        if not ws:
            return False
        if sum(c.isupper() for c in t) > 0.6 * sum(c.isalpha() for c in t) and len(ws) <= 4:
            return True  # a speaker or a title
        return sum(isword(w) for w in ws) >= 0.5 * len(ws)
    out = [l for l in out if re.search(r"[A-Za-z]{2}", l['text']) and good(l['text'])]
    for l in out:
        l['left'], l['right'], l['H'] = left, right, H
    return out


def volume(v):
    P = pages(COORDS % v)
    allp = []
    for pi in range(len(P)):
        allp.append(page_lines(P, v, pi))
    return allp


# Elphinston's dialogues in order -> (French chapter number, English title, speaker labels as printed)
DIALOGUES = [
    (1, 'Mercury and Charon', 'MERCURY CHARON'), (2, 'Hercules and Theseus', 'HERCULES THESEUS'), (3, 'Chiron and Achilles', 'CHIRON ACHILLES'),
    (4, 'Achilles and Homer', 'ACHILLES HOMER'), (5, 'Achilles and Ulysses', 'ACHILLES ULYSSES'), (6, 'Ulysses and Gryllus', 'ULYSSES GRYLLUS'),
    (8, 'Romulus and Remus', 'ROMULUS REMUS'), (9, 'Romulus and Tatius', 'ROMULUS TATIUS'), (10, 'Romulus and Numa Pompilius', 'ROMULUS|NUMA POMPILIUS'),
    (11, 'Xerxes and Leonidas', 'XERXES LEONIDAS'), (12, 'Solon and Pisistratus', 'SOLON PISISTRATUS'), (13, 'Solon and Justinian', 'SOLON JUSTINIAN'),
    (14, 'Democritus and Heraclitus', 'DEMOCRITUS HERACLITUS'), (15, 'Herodotus and Lucian', 'HERODOTUS LUCIAN'), (16, 'Socrates and Alcibiades', 'SOCRATES ALCIBIADES'),
    (17, 'Socrates and Alcibiades', 'SOCRATES ALCIBIADES'), (18, 'Socrates, Alcibiades and Timon', 'SOCRATES ALCIBIADES TIMON'), (19, 'Pericles and Alcibiades', 'PERICLES ALCIBIADES'),
    (20, 'Mercury, Charon and Alcibiades', 'MERCURY CHARON ALCIBIADES'), (21, 'Dionysius, Pythias and Damon', 'DIONYSIUS PYTHIAS DAMON'), (22, 'Dion and Gelo', 'DION GELO'),
    (23, 'Plato and Dionysius the Tyrant', 'PLATO DIONYSIUS'), (24, 'Plato and Aristotle', 'PLATO ARISTOTLE'), (25, 'Alexander and Aristotle', 'ALEXANDER ARISTOTLE'),
    (26, 'Alexander and Clitus', 'ALEXANDER CLITUS'), (27, 'Alexander and Diogenes', 'ALEXANDER DIOGENES'), (28, 'Dionysius the Elder and Diogenes', 'DIONYSIUS DIOGENES'),
    (29, 'Pyrrho and His Neighbour', 'PYRRHO NEIGHBOUR'), (30, 'Pyrrhus and Demetrius Poliorcetes', 'PYRRHUS DEMETRIUS'), (32, 'Demosthenes and Cicero', 'DEMOSTHENES CICERO'),
    (33, 'Demosthenes and Cicero', 'DEMOSTHENES CICERO'), (34, 'Coriolanus and Camillus', 'CORIOLANUS CAMILLUS'), (35, 'Camillus and Fabius Maximus', 'CAMILLUS FABIUS'),
    (36, 'Fabius Maximus and Hannibal', 'FABIUS HANNIBAL'), (37, 'Rhadamanthus, Cato the Censor and Scipio Africanus', 'RHADAMANTHUS CATO SCIPIO'), (38, 'Scipio and Hannibal', 'SCIPIO HANNIBAL'),
    (39, 'Hannibal and Scipio', 'HANNIBAL SCIPIO'), (41, 'Sylla, Catiline and Caesar', 'SYLLA CATILINE CAESAR'), (42, 'Caesar and Cato', 'CAESAR CATO'),
    (43, 'Cato and Cicero', 'CATO CICERO'), (44, 'Caesar and Alexander', 'CAESAR ALEXANDER'), (45, 'Pompey and Caesar', 'POMPEY CAESAR'),
    (46, 'Cicero and Augustus', 'CICERO AUGUSTUS'), (47, 'Sertorius and Mercury', 'SERTORIUS MERCURY'), (48, 'The Young Pompey and Menas the Freed-man', 'POMPEY MENAS'),
    (49, 'Caligula and Nero', 'CALIGULA NERO'), (50, 'Antoninus Pius and Marcus Aurelius', 'ANTONINUS|MARCUS AURELIUS'),
    (54, 'Leger and Ebroin', 'LEGER EBROIN'), (55, 'Edward, Prince of Wales, and Richard His Son', 'EDWARD RICHARD'), (56, 'Charles VII and John, Duke of Burgundy', 'CHARLES|BURGUNDY'),
    (57, 'Lewis XI and Cardinal Bessarion', 'LEWIS BESSARION'), (58, 'Lewis XI and Cardinal de la Balue', 'LEWIS BALUE'), (59, 'Lewis XI and Philip de Commines', 'LEWIS COMMINES'),
    (60, 'Lewis XI and Charles, Duke of Burgundy', 'LEWIS|CHARLES'), (61, 'Lewis XI and Lewis XII', 'LEWIS XI|LEWIS XII'), (62, 'The Constable of Bourbon and Bayard', 'CONSTABLE BAYARD'),
    (64, 'Lewis XII and Francis I', 'LEWIS XII|FRANCIS'), (65, 'Charles V and a Young Monk of St. Just', 'CHARLES|MONK'), (66, 'Charles V and Francis I', 'CHARLES|FRANCIS'),
    (67, 'Henry III and the Duchess of Montpensier', 'HENRY|DUCHESS'), (68, 'Henry III and Henry IV', 'HENRY III|HENRY IV'), (69, 'Henry IV and the Duke of Mayenne', 'HENRY|MAYENNE'),
    (70, 'Sixtus V and Henry IV', 'SIXTUS|HENRY'), (71, 'Cardinal Richelieu and Cardinal Ximenes', 'RICHLIEU XIMENES'), (73, 'Cardinal Richelieu and Chancellor Oxenstierne', 'RICHLIEU OXENSTIERNE'),
    (74, 'Cardinal Richelieu and Cardinal Mazarin', 'RICHLIEU MAZARIN'),
]


def segments():
    """-> list of [lines] for the 66 dialogues, from 'DIALOGUE N.' to the next dialogue's title"""
    segs = []
    for v in (1, 2):
        allp = pickle.load(open(SK + '/eales/fen_coll_%d.pkl' % v, 'rb')) if os.path.exists(SK + '/eales/fen_coll_%d.pkl' % v) else volume(v)
        flat = [l for p in allp for l in p]
        starts = [k for k, l in enumerate(flat) if re.match(r"^\W?DIALOG\s?U\s?E?\b", l['text']) and not re.search(r"DIALOGUES", l['text'])]
        starts = [k for k in starts if k > 5]
        end = len(flat)
        if v == 2:
            end = next(k for k in range(starts[-1], len(flat)) if re.search(r"^\W?FABLE|^CONTENTS|^\W?THE\s+END", flat[k]['text']))
        for n, k in enumerate(starts):
            e = starts[n + 1] if n + 1 < len(starts) else end
            segs.append(flat[k:e])
    return segs
