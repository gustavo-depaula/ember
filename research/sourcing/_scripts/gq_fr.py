"""Guéranger fr-FR chapters from domgueranger.net posts (vols 1-6)."""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from gq_dg import *

MONTHS = 'janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre'
DATE = re.compile(r'^(le\s+)?(\d+\s*(?:er|e)?|premier|[ivxl]+)\s+(' + MONTHS + r')\b', re.I)
DAYRX = re.compile(r'^(le |la |l[’\'])?((premier|second|deuxi[eè]me|troisi[eè]me|quatri[eè]me|cinqui[eè]me|sixi[eè]me|[a-zé]+) )?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)\b', re.I)
SAME = re.compile(r'^le m[eê]me jour', re.I)
PROPER = ['Avent', 'Noël', 'Pentecôte', 'Carême', 'Septuagésime', 'Sexagésime', 'Quinquagésime', 'Cendres', 'Pâques', 'Passion', 'Trinité', 'Épiphanie', 'Saint', 'Sainte', 'Saints', 'Christ', 'Seigneur', 'Vierge', 'Dieu', 'Église', 'Jésus', 'Jésus-Christ', 'Marie', 'Mère', 'Apôtre', 'Apôtres', 'Évangéliste', 'Docteur', 'Pape', 'Saint-Sacrement', 'Innocents', 'Jean', 'Étienne', 'Pierre', 'Paul', 'Thomas', 'Joseph', 'Rameaux', 'Croix', 'Immaculée', 'Conception', 'Lumières', 'Chandeleur', 'Quatre-Temps', 'Sacré-Cœur', 'Nom', 'Circoncision', 'Mage', 'Mages']
ACC = {'premiere': 'première', 'deuxieme': 'deuxième', 'troisieme': 'troisième', 'quatrieme': 'quatrième', 'cinquieme': 'cinquième', 'sixieme': 'sixième', 'septieme': 'septième', 'huitieme': 'huitième', 'careme': 'carême', 'noel': 'Noël', 'septuagesime': 'Septuagésime', 'sexagesime': 'Sexagésime', 'quinquagesime': 'Quinquagésime', 'pentecote': 'Pentecôte', 'trinite': 'Trinité', 'fevrier': 'février', 'decembre': 'décembre', 'aout': 'août', 'epiphanie': 'Épiphanie', 'eglise': 'Église', 'apotre': 'Apôtre', 'evangeliste': 'Évangéliste', 'eveque': 'évêque', 'verite': 'vérité', 'passion': 'Passion', 'immaculee': 'Immaculée', 'apres': 'après', 'premieres': 'premières', 'veille': 'veille', 'vepres': 'vêpres', 'secondes': 'secondes', 'resurrection': 'résurrection', 'ascension': 'Ascension', 'paques': 'Pâques', 'cendres': 'Cendres', 'lecon': 'leçon', 'etienne': 'Étienne', 'genevieve': 'Geneviève', 'silvestre': 'Silvestre'}
ROM = {'I': 1, 'V': 5, 'X': 10, 'L': 50}

def roman(s):
    s = s.upper(); n = 0
    for i, ch in enumerate(s):
        v = ROM[ch]
        n += -v if i + 1 < len(s) and ROM[s[i + 1]] > v else v
    return n

VALID = {'ii','iii','iv','vi','vii','viii','ix','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx','xxi','xxii','xxiii','xxiv','xxv','xxvi','xxvii','xxviii','xxix','xxx'}

def sentence(t):
    t = re.sub(r'\x01\d+\x02', '', t)
    t = re.sub(r'\bi\.a\b', 'la', t)
    t = re.sub(r'(— )+', '— ', t)
    """UPPERCASE heading -> French title case (proper nouns capitalised)."""
    t = re.sub(r'\s+', ' ', t.replace('\x05', '').replace('\x06', '')).strip().rstrip('.,;').strip()
    if not upper(t):
        def lw(m):
            w = m.group(0)
            return PROPMAP.get(ACC.get(w.lower(), w.lower()).lower()) or ACC.get(w.lower(), w.lower())
        r = re.sub(r"\b[A-ZÉÈÊÀÂÎÔÛÇ]{2,}\b", lw, t)
        r = re.sub(r"(?<=\s)L’", "l’", r)
        return r[:1].upper() + r[1:]
    out = []
    for w in t.lower().split(' '):
        core = re.sub(r'^[l]’|^[ld]’', '', w)
        pre = w[:len(w) - len(core)]
        k = ACC.get(core.strip('.,;:()'), core)
        out.append(pre + k)
    s = ' '.join(out)
    prop = {p.lower(): p for p in PROPER}
    def tok(m):
        w = m.group(0); lw = w.lower()
        mm = re.match(r'^([ivxl]+)(e|°|º)?$', lw)
        if mm and mm.group(1) != 'l' and (mm.group(2) or lw in VALID):
            return mm.group(1).upper() + ('e' if mm.group(2) else '')
        return prop.get(lw, w)
    s = re.sub(r"[\wÀ-ÿ-]+°?", tok, s)
    s = re.sub(r'\b(chapitre|psaume) ([ivxl]+)\b', lambda m: m.group(1) + ' ' + m.group(2).upper(), s, flags=re.I)
    s = re.sub(r' a (la|l’|sa|son)\b', r' à \1', s)
    s = re.sub(r'\b(saint|sainte|saints) ([a-zé])', lambda m: m.group(1).capitalize() + ' ' + m.group(2).upper(), s, flags=re.I)
    return s[:1].upper() + s[1:]

PROPMAP = {p.lower(): p for p in PROPER}

def norm_date(t):
    t = t.replace('\x05', '').replace('\x06', '').strip()
    m = DATE.match(t)
    if not m: return sentence(t)
    pre, num, mon = m.group(1), m.group(2).strip(), m.group(3)
    n = 1 if num.lower() == 'premier' else (int(re.sub(r'\D', '', num)) if re.match(r'\d', num) else roman(num))
    rest = t[m.end():].lstrip('. ').strip()
    mon = ACC.get(mon.lower().replace('é', 'e').replace('û', 'u'), mon.lower())
    rest = sentence(rest) if rest else ''
    head = f'{"1er" if n == 1 else n} {mon}'
    return head + (' — ' + rest if rest else '')

def is_bold(t):
    s = t.strip()
    return s.startswith('\x05') and s.endswith('\x06') and s.count('\x05') == 1

def boundary(t):
    if len(t) > 140 or t.startswith('\x03'): return None
    c = t.replace('\x05', '').replace('\x06', '').strip()
    if re.match(r'^CHAPITRE\b', c) and upper(c): return 'chap'
    if DATE.match(c) and len(c) < 130 and not c.endswith(':'): return 'date'
    if SAME.match(c) and len(c) < 100: return 'same'
    if (upper(c) or is_bold(t)) and DAYRX.match(c) and len(c) < 100 and 'PSAUME' not in c: return 'day'
    return None

def group(items):
    """items -> blocks: ('h', text) heading, ('p', text), ('v', [lines]) verse block, ('b', text) boundary placeholder"""
    out = []; i = 0; n = len(items)
    while i < n:
        k, t, c = items[i]
        if k == 'blank': i += 1; continue
        if c:  # centred run
            j = i; run = []
            while j < n and items[j][0] == 'p' and items[j][2]:
                run.append(items[j][1]); j += 1
            if len(run) > 1 and all(upper(x) for x in run) and len(run) >= 3:
                out.append(('v', run)); i = j; continue
            lead = 0
            while lead < len(run) and (upper(run[lead]) or (run[lead].startswith('(') or run[lead].rstrip().endswith(')')) and len(run[lead]) < 130): lead += 1
            for x in run[:lead]:
                out.append(('h' if upper(x) else 'p', x))
            rest = run[lead:]
            if len(rest) == 1: out.append(('p', rest[0]))
            elif rest: out.append(('v', rest))
            i = j; continue
        out.append(('h' if (upper(t) and len(t) < 120) else 'p', t)); i += 1
    # merge runs of >=3 short plain paragraphs (verse set as separate paragraphs)
    res = []; i = 0
    while i < len(out):
        if out[i][0] == 'p' and len(out[i][1]) <= 100 and not boundary(out[i][1]):
            j = i
            while j < len(out) and out[j][0] == 'p' and len(out[j][1]) <= 100 and not boundary(out[j][1]): j += 1
            if j - i >= 3:
                res.append(('v', [x[1] for x in out[i:j]])); i = j; continue
        res.append(out[i]); i += 1
    return res

def fixtypo(t):
    return re.sub(r'(?<=[a-zà-ÿ])È(?=[a-zà-ÿ])', 'e', t)

def md_text(t):
    return render(t)

def chapter_md(title, blocks, notes):
    order = []
    def mark(m):
        n = int(m.group(1))
        if n not in order: order.append(n)
        return '[^%d]' % (order.index(n) + 1)
    body = []
    for k, x in blocks:
        if k == 'h':
            body.append('## ' + sentence(render(x)))
        elif k == 'v':
            body.append('  \n'.join(render(l) for l in x))
        else:
            body.append(render(x))
    text = fixtypo('\n\n'.join(b for b in body if b.strip()))
    text = re.sub(r'\[\^(\d+)\]', mark, text)
    out = ['# ' + title, '', text]
    for idx, n in enumerate(order, 1):
        out += ['', f'[^{idx}]: {notes.get(n, "")}']
    return '\n'.join(out).rstrip() + '\n'

def split_post(slug, intro_title):
    items, notes = parse(slug)
    blocks = group(items)
    cuts = []
    for bi, (k, t) in enumerate(blocks):
        if k in ('h', 'p'):
            b = boundary(t)
            if b: cuts.append((bi, b))
    # leading title lines
    chaps = []
    def title_of(b, kind):
        c = b[1]
        if kind == 'date': return norm_date(c)
        if kind == 'same': return sentence(c)
        return sentence(c)
    starts = [c[0] for c in cuts]
    first = starts[0] if starts else len(blocks)
    intro = blocks[:first]
    while intro and intro[0][0] == 'h': intro = intro[1:]
    # drop the leading all-caps title lines
    while intro and intro[0][0] == 'h' and len(intro[0][1]) < 60 and sum(len(x[1].split()) for x in intro) > 0 and len(intro) > 1 and intro[0][0] == 'h' and not boundary(intro[0][1]) and intro_title and upper(intro[0][1]) and len(intro[0][1].split()) <= 6 and intro.index(intro[0]) == 0 and intro[1][0] in ('h',) and False: intro = intro[1:]
    if intro and sum(len(re.sub(r'[\x01-\x06]', '', x[1] if isinstance(x[1], str) else ' '.join(x[1])).split()) for x in intro) > 40:
        chaps.append((intro_title or 'Introduction', intro))
    for n, (bi, kind) in enumerate(cuts):
        end = cuts[n + 1][0] if n + 1 < len(cuts) else len(blocks)
        seg = blocks[bi:end]
        title = title_of(seg[0], kind)
        rest = seg[1:]
        # a feast-name line directly after a bare date heading belongs to the title
        if kind == 'date' and rest and rest[0][0] in ('h', 'p') and upper(rest[0][1]) and len(rest[0][1]) < 100 and ' — ' not in title and not boundary(rest[0][1]):
            title = title + ' — ' + sentence(rest[0][1]); rest = rest[1:]
        if kind == 'chap':
            m = re.match(r'(CHAPITRE [IVXL]+|CHAPITRE PREMIER)\.?\s*(.*)', seg[0][1].replace('\x05', '').replace('\x06', ''), re.I)
            title = (sentence(m.group(1)) + (' — ' + sentence(m.group(2)) if m.group(2) else '')) if m else title
        chaps.append((title, rest))
    return chaps, notes
