"""Guéranger English (Shepherd/Stanbrook) volumes from archive.org Google OCR -> chapters per day or feast."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import load, hyphen_vocab, chapter, build_chapter, fix_en, render, caps_ratio, ROOT, SRC
IA = SRC + 'gueranger/ia/'
MON = r'(?:JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUNE?|JULY?|AUG(?:UST)?|SEPT?(?:EMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?)\b\.?'
WEEKDAY = r'(?:SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)'
CAND = re.compile(r'(?:\b' + WEEKDAY + r'S?\b|^(?:THE )?(?:SAME DAY|VIGIL|OCTAVE|FEAST|DEDICATION|EMBER|ASH|PALM|HOLY|EASTER|WHITSUN|PENTECOST|ASCENSION|CORPUS|TRINITY|LAMMAS|PURIFICATION|CHRISTMAS (?:DAY|EVE)|NATIVITY|HOLY NAME|NAME OF JESUS|ANNUNCIATION|ASSUMPTION|TRANSFIGURATION|NATIVITY|CIRCUMCISION|EPIPHANY|SS?\.|SAINTS?\b|BLESSED|MEMORY|COMMEMORATION|THE (?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH) (?:DAY|SUNDAY|WEEK))|^' + MON + r' [\dIVXLC]+|^CONTENTS|^INDEX|^LIST OF|^CHAPTER(?! PAGE)\b|^(?:GENERAL )?PREFACE|^INTRODUCTION|^PROLOGUE)')
STOP = {'SAINT', 'SAINTS', 'THE', 'OF', 'IN', 'WEEK', 'DAY', 'SAME', 'AND', 'ON', 'FOR', 'TO', 'A'}
SMALL = {'of', 'the', 'and', 'in', 'on', 'for', 'to', 'a', 'an', 'at', 'by', 'from', 'with', 'after', 'before', 'or'}
def up(t, r=.75):
    al = [c for c in t if c.isalpha()]
    return len(al) >= 3 and sum(c.isupper() for c in al) / len(al) >= r

def tcase(t):
    t = re.sub(r'\s+', ' ', t).strip().rstrip('.,;:').strip()
    t = re.sub(r'\bSS\.', 'SAINTS', t); t = re.sub(r'\bST\.', 'SAINT', t)
    out = []
    for i, w in enumerate(t.split(' ')):
        lw = w.lower()
        if re.fullmatch(r'[IVXLC]+[,.]?', w) and len(w) > 1: out.append(w); continue
        out.append(lw if (lw in SMALL and i) else re.sub(r"^([^a-z]*)([a-z])", lambda m: m.group(1) + m.group(2).upper(), lw, count=1))
    s = ' '.join(out)
    return s[:1].upper() + s[1:]

def key(t):
    t = t.upper().replace('ST.', 'SAINT').replace('SS.', 'SAINTS')
    ws = re.findall(r'[A-Z]{3,}', t)
    return frozenset(w for w in ws if w not in STOP)

def blocks(lines):
    out, cur, st = [], [], 0
    for i, ln in enumerate(lines):
        if ln.strip():
            if not cur: st = i
            cur.append(re.sub(r'\s+', ' ', ln.strip()))
        elif cur:
            out.append((st, i, cur)); cur = []
    if cur: out.append((st, len(lines), cur))
    return out

NUMB = re.compile(r'^[\dOolI|!]{1,4}\.?$')
from difflib import SequenceMatcher
EXW = {'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH'}

def fuzzy_same(a, b):
    if not a or not b or abs(len(a) - len(b)) > 1: return False
    small, big = (a, b) if len(a) <= len(b) else (b, a)
    EX = {'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH'}
    def ok(x, y):
        if x == y: return True
        if x in EX and y in EX: return False
        return SequenceMatcher(None, x, y).ratio() >= .74
    return all(any(ok(x, y) for y in big) for x in small)

def boundaries(lines):
    bl = blocks(lines)
    res = []; last_date = None
    texts = [' '.join(b[2]) for b in bl]
    i = 0
    while i < len(bl):
        st, en, ls = bl[i]; t = texts[i]
        m = re.match(r'^(' + MON + r')\s*([\dIVXLC]+)', t.upper())
        near_num = (i > 0 and NUMB.match(texts[i - 1])) or (i + 1 < len(bl) and NUMB.match(texts[i + 1])) or re.search(r'\s[\dIl|!]{1,3}$|^[\dIl|!]{1,3}\s', t)
        if m and near_num: last_date = (m.group(1), m.group(2))
        if len(t) < 130 and up(t) and CAND.search(t) and not re.search(r"SUNDAY'S|SUNDAYS|VESPERS|COMPLINE", t.replace('CHAPTER THE', '')) and not (re.match(r'^(GENERAL )?PREFACE|^INTRODUCTION', t) and any('CHAPTER' in r[1] or r[1].startswith('MONDAY') for r in res)):
            tl = [t]; j = i + 1
            while j < len(bl) and len(tl) < 4 and not re.search(r'\d$', tl[-1]) and up(texts[j], .7) and len(texts[j]) < 100 and not NUMB.match(texts[j]) and len(texts[j].split()) < 14:
                tl.append(texts[j]); j += 1
            full = ' '.join(tl)
            k = key(re.sub(r'^THE SAME DAY\.?', '', full)); k = frozenset(w for w in k if not re.match(MON[:-3] + r'$', w) and w not in ('DEC', 'NOV', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'))
            if not any(len(w) >= 5 for w in k): i = j; continue
            dup = next((r for r in res[-3:] if r[5] == k or fuzzy_same(r[5], k) or (r is res[-1] and (k <= r[5] or r[5] <= k) and (min(len(k), len(r[5])) >= 2 or max(len(w) for w in (k & r[5]) or {''}) >= 6))), None)
            if not dup:
                cf = cleanv(full)
                for r in res[-2:]:
                    cr = cleanv(r[1])
                    eo = lambda x: {w for w in re.findall(r'[A-Z]+', x) if w in EXW}
                    if SequenceMatcher(None, cf, cr).ratio() >= .84 and (not eo(cf) or not eo(cr) or eo(cf) == eo(cr)): dup = r
            if k and not dup and not (res and st - res[-1][0] < 12):
                res.append([st, full, last_date, bool(re.match(r'^THE SAME DAY', full)), j, k, list(tl) + ([full] if len(tl) > 1 else [])])
            elif dup and st - dup[0] < 120 and dup is res[-1]:
                dup[6] += list(tl) + ([full] if len(tl) > 1 else [])
            i = j; continue
        i += 1
    return res


def cleanv(v):
    v = re.sub(r'\b' + MON + r'\s*(?:[\dIVXLC]+|FIRST)\b[.,]?\s*', ' ', v)
    v = re.sub(r"\b[\d][\d\-'.]*\b|\s[\-'.]*\d[\d\-'.]*\s*$", ' ', v)
    v = re.sub(r'^.*?THE SAME DAY\.?\s*', '', v)
    return re.sub(r'\s+', ' ', v).strip(' .,;:*')

def title_for(r, freq):
    import math
    best, bs = None, -1e9
    for v in r[6]:
        c = cleanv(v)
        if len(c) < 5 or not up(c): continue
        ws = re.findall(r'[A-Za-z]+', c)
        if len(ws) < 2 and not re.match(r'^(INTRODUCTION|PREFACE|GENERAL PREFACE|CONTENTS)', c): continue
        sc = len(ws) * 3 + sum(math.log(freq.get(w.lower(), 0) + 1) for w in ws) / max(1, len(ws)) - (2 if re.search(r'[\d*]', c) else 0) - 6 * sum(1 for w in ws if len(w) > 3 and freq.get(w.lower(), 0) < 3)
        if sc > bs: best, bs = c, sc
    return best

MONTHS = {'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April', 'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August', 'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'}
def date_str(d):
    if not d: return None
    n = d[1]
    if n.isdigit(): pass
    elif n == 'FIRST': n = '1'
    else: return None
    return f"{MONTHS[d[0][:3]]} {int(n)}"
