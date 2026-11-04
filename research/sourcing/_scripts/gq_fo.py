"""Guéranger English (Shepherd/Stanbrook) volumes from archive.org Google OCR -> chapters per day or feast."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import load, hyphen_vocab, chapter, build_chapter, fix_en, render, caps_ratio, ROOT, SRC
IA = SRC + 'gueranger/ia/'
MON = r'(?:JANVIER|F[EÉ]VRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AO[UÛ]T|SEPTEMBRE|OCTOBRE|NOVEMBRE|D[EÉ]CEMBRE)\b\.?'
WEEKDAY = r'(?:DIMANCHE|LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI)'
ORD = r'(?:PREMIER|SECOND|DEUXI[EÈ]ME|TROISI[EÈ]ME|QUATRI[EÈ]ME|CINQUI[EÈ]ME|SIXI[EÈ]ME|SEPTI[EÈ]ME|HUITI[EÈ]ME|NEUVI[EÈ]ME|DIXI[EÈ]ME|ONZI[EÈ]ME|DOUZI[EÈ]ME|\w+I[EÈ]ME)'
CAND = re.compile(r'(?:^(?:LE |LA |L.)?(?:' + ORD + r' )?' + WEEKDAY + r'S?\b|^LE M[EÊ]ME JOUR|^(?:LE |LA )?SAINT JOUR|^LES? (?:JOURS?|QUATRE)|^(?:LA |LE |L.)?(?:F[EÊ]TE|VIGILE|OCTAVE|SOLENNIT[EÉ]|DEDICACE|D[EÉ]DICACE|TRINIT[EÉ]|NATIVIT[EÉ]|PURIFICATION|ANNONCIATION|ASSOMPTION|TRANSFIGURATION|CIRCONCISION|[EÉ]PIPHANIE|PENTEC[OÔ]TE|ASCENSION|PRECIEUX|TRES SAINT|TR[EÈ]S SAINT)\b|^(?:LE |LES |LA )?(?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3}|XIV|XV|XVI{0,3}|XIX|XX{0,2}I{0,3}|XXX|XXXI|PREMIER|\d+) ' + MON + r'|^SAINTS?\b|^SAINTE\b|^BIENHEUREUX|^BIENHEUREUSE|^CHAPITRE\b|^PR[EÉ]FACE|^INTRODUCTION|^AVANT-PROPOS|^TABLE DES|^TABLE\b)')
STOP = {'LES', 'DES', 'DU', 'DANS', 'APRES', 'APRÈS', 'MEME', 'MÊME', 'JOUR', 'SEMAINE', 'SAINT', 'SAINTE', 'SAINTS', 'ET', 'AVEC', 'POUR', 'SUR', 'SOUS', 'PAR', 'AUX', 'LEUR'}
SMALL = set()
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
    t = re.sub(r'[ÉÈÊË]', 'E', t); t = re.sub(r'[ÀÂ]', 'A', t); t = re.sub(r'[ÎÏ]', 'I', t); t = re.sub(r'[ÔÖ]', 'O', t); t = re.sub(r'[ÛÙÜ]', 'U', t); t = t.replace('Ç', 'C')
    ws = re.findall(r'[A-Z]{3,}|\b[IVXL]{1,4}\b', t)
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
EXW = {'DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'PREMIER', 'SECOND', 'DEUXIEME', 'TROISIEME', 'QUATRIEME', 'CINQUIEME', 'SIXIEME', 'SEPTIEME', 'HUITIEME', 'NEUVIEME', 'DIXIEME', 'ONZIEME', 'DOUZIEME'}

def fuzzy_same(a, b):
    if not a or not b or abs(len(a) - len(b)) > 1: return False
    small, big = (a, b) if len(a) <= len(b) else (b, a)
    EX = EXW
    def ok(x, y):
        if x == y: return True
        if x in EX and y in EX: return False
        return SequenceMatcher(None, x, y).ratio() >= .74
    return all(any(ok(x, y) for y in big) for x in small)


ORDMAP = {'prem': 'PREMIER', 'deux': 'DEUXIÈME', 'seco': 'SECOND', 'troi': 'TROISIÈME', 'quatr': 'QUATRIÈME', 'cinq': 'CINQUIÈME', 'sixi': 'SIXIÈME', 'sept': 'SEPTIÈME', 'huit': 'HUITIÈME', 'neuv': 'NEUVIÈME', 'dixi': 'DIXIÈME', 'onzi': 'ONZIÈME', 'douz': 'DOUZIÈME', 'trei': 'TREIZIÈME', 'quato': 'QUATORZIÈME', 'quatu': 'QUATORZIÈME', 'quinz': 'QUINZIÈME', 'seiz': 'SEIZIÈME', 'dix-s': 'DIX-SEPTIÈME', 'dix-h': 'DIX-HUITIÈME', 'dix-n': 'DIX-NEUVIÈME', 'ving': 'VINGTIÈME', 'vingt': 'VINGTIÈME'}
RH = re.compile(r"^[\d\W]*[ijlI]?\d*\W*(?:[LJI]\w{0,2}\s+)?([A-Za-zÀ-ÿ'-]{3,12})\.?,?\s+(Dimanche|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi)s?\s+(?:apr[èe]s|de|dans)\s+(?:la|l[’'])\s*([A-Za-zÀ-ÿ]{4,14})", re.I)
def rh_candidate(t):
    m = RH.match(t)
    if not m or len(t) > 70: return None
    o = m.group(1).lower(); w = m.group(2).upper(); rest = m.group(3).upper()
    ordw = next((v for k, v in sorted(ORDMAP.items(), key=lambda kv: -len(kv[0])) if o.startswith(k)), None)
    if not ordw: return None
    return f'LE {ordw} {w} APRÈS ' + ("L’" if rest[0] in 'AEIOUÉ' else 'LA ') + rest

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
        rh = rh_candidate(t) if not up(t) else None
        if rh and not (re.search(r'\d', t) is None and False):
            k2 = key(rh)
            dup2 = next((r for r in res[-3:] if r[5] == k2 or fuzzy_same(r[5], k2)), None)
            if not dup2 and not (res and st - res[-1][0] < 12) and ('LE ' + rh.split(' ', 1)[1]) and not any(r[5] == k2 for r in res):
                res.append([st, rh, last_date, False, i + 1, k2, [rh]])
            elif dup2 and dup2[1] != rh: dup2[6] += [rh]
            i += 1; continue
        if len(t) < 130 and up(t) and CAND.search(t) and not re.search(r'VEPRES|VÊPRES|COMPLIES', t) and not (re.match(r'^PR[EÉ]FACE|^INTRODUCTION|^AVANT-PROPOS', t) and any('CHAPITRE' in r[1] or r[1].startswith('LUNDI') for r in res)):
            tl = [t]; j = i + 1
            while j < len(bl) and len(tl) < 4 and not re.search(r'\d$', tl[-1]) and up(texts[j], .7) and len(texts[j]) < 100 and not NUMB.match(texts[j]) and len(texts[j].split()) < 14:
                tl.append(texts[j]); j += 1
            full = ' '.join(tl)
            k = key(re.sub(r'^LE M[EÊ]ME JOUR\.?', '', full)); k = frozenset(w for w in k if not re.match(MON[:-3] + r'$', w) and w not in ('DEC', 'NOV', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'))
            if not any(len(w) >= 4 or re.match(r'^[IVXL]+$', w) for w in k): i = j; continue
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
    v = re.sub(r'^.*?LE M[EÊ]ME JOUR\.?\s*', '', v)
    return re.sub(r'\s+', ' ', v).strip(' .,;:*')

def title_for(r, freq):
    import math
    best, bs = None, -1e9
    for v in r[6]:
        c = cleanv(v)
        if len(c) < 5 or not up(c): continue
        ws = re.findall(r'[A-Za-z]+', c)
        if len(ws) < 2 and not re.match(r'^(INTRODUCTION|PREFACE|GENERAL PREFACE|TABLE)', c): continue
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
