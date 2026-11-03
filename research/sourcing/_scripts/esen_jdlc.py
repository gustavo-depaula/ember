"""Lewis/Zimmerman 1919 'The Living Flame of Love, with Letters, Poems and Minor Writings' (IA johnofthecross00johnuoft) -> four English-only books."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
import esen_lib as B
from esen_teresa_build import tcase
SRC = B.ROOT + '/research/sourcing/john-of-the-cross/en/johnofthecross00johnuoft.txt'
L = open(SRC, errors='replace').read().replace('\x0c', '').split('\n')
RH = re.compile(r'^(\d+\s+|[\dIlOoQ|!]{1,5}\s+)?(LETTERS|POEMS|SPIRITUAL\s+MAXIMS|INSTRUCTIONS(\s+AND)?|PRECAUTIONS)(\s+[\dIlOoQ|!]{1,5})?$')
NUM = re.compile(r'^[\dIlOoQ|! ]{1,8}$')
FN = re.compile(r'^(\*|f|t|†|‡|§|\|)\s+[A-Z(\[\d]')
def blocks(lines):
    out = []; cur = []
    for l in lines:
        if l.strip(): cur.append(l.strip())
        elif cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def is_rh(b): return len(b) == 1 and (bool(RH.match(re.sub(r'\s+', ' ', b[0]))) or bool(NUM.match(b[0])))
def inline(t):
    t = re.sub(r'(?<=[.,;:!?)\w])\s[ft†‡§*](?=\s|$)', '', t); t = re.sub(r'\s+\*\s*$', '', t)
    return re.sub(r'\s+', ' ', t).strip()
def paras(lines, caps_h2=False):
    out = []
    for b in blocks(lines):
        if is_rh(b): continue
        if FN.match(b[0]): continue
        t = E.join_lines(b); t = inline(t)
        if not t: continue
        u = re.sub(r'[^A-Za-z]', '', t)
        if caps_h2 and len(u) > 4 and sum(c.isupper() for c in u) >= 0.9 * len(u) and len(b) <= 4: t = '## ' + tcase('TO ' + t).replace('To ', '', 0) if False else '## ' + titlecase(t)
        out.append(t)
    res = []
    for p in out:
        if res and not p.startswith('## ') and not res[-1].startswith('## ') and not re.search(r'[.!?:;"”’\')\]]\s*$', res[-1]) and p[:1].islower(): res[-1] = E.join_lines([res[-1], p])
        else: res.append(p)
    return res
SMALL = {'of', 'the', 'and', 'in', 'to', 'for', 'by', 'a', 'at', 'on', 'from', 'as'}
def titlecase(t):
    w = t.title().split(); w = [x.lower() if i and x.lower() in SMALL else x for i, x in enumerate(w)]
    return re.sub(r"(['’])S\b", r"\1s", ' '.join(w))
def find(pat, start=0, end=None):
    for i in range(start, end or len(L)):
        if re.match(pat, L[i]): return i
    raise SystemExit('not found ' + pat)
def rom(s):
    v = {'I': 1, 'V': 5, 'X': 10}; s = s.strip().upper().replace('L', 'I'); t = 0
    for i, c in enumerate(s): t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t
CFG = dict(author='St. John of the Cross', author_es='San Juan de la Cruz', author_pt='São João da Cruz', translator='David Lewis (prose), with Benedict Zimmerman', year=1919,
           url='https://archive.org/details/johnofthecross00johnuoft', died=1591,
           edition='The Living Flame of Love, with his Letters, Poems and Minor Writings, translated by David Lewis, with corrections and an introduction by Benedict Zimmerman, O.C.D., London: Thomas Baker, 1919 (first edition 1912). Internet Archive scan johnofthecross00johnuoft (University of Toronto).')
NOTE = ' The scan is the best of the three; page headings, page numbers and footnotes are dropped, line-break hyphens joined, and isolated recognition slips may remain.'
# regions (0-based line indexes)
i_instr = find(r'^INSTRUCTIONS\s+AND\s+PRECAUTIONS\s*$', 5970); i_instr = find(r'^TO\s+BE\s+CONTINUALLY', i_instr) - 0
i_let = find(r'^LETTER\s+I\s*$', 6280); i_cens = find(r'^CENSURE\s+AND\s+JUDGMENT', i_let); i_max = find(r'^SPIRITUAL\s+MAXIMS\s*$', i_cens + 1)
i_poems = find(r'^THE\s+DARK\s+NIGHT', 9880); i_end = find(r'^INDEX\s+TO\s+PASSAGES', i_poems)
def raw(a, b, name): open(B.ROOT + '/content/books/%s/sources/en-US-originals/%s' % (name, 'jdlc-lewis-1919-%s.txt' % os.path.basename(name)), 'w').write('\n'.join(L[a:b]))
def mk(cfg, ch, a, b):
    root = B.write_book(dict(CFG, **cfg), ch); raw(a, b, cfg['dir']); return root
def letters():
    heads = [i for i in range(i_let, i_cens) if re.match(r'^LETTER\s+[IVXL]+\*?\s*$', L[i])]
    ch = []
    for k, h in enumerate(heads):
        e = heads[k + 1] if k + 1 < len(heads) else i_cens
        n = rom(re.sub(r'[^IVXL]', '', L[h].split('LETTER')[1].replace('*', '')))
        hd = []; i = h + 1
        while i < e and not L[i].strip(): i += 1
        while i < e and L[i].strip(): hd.append(L[i].strip()); i += 1
        j = i
        body = paras(L[j:e])
        head = re.sub(r'\s+', ' ', ' '.join(hd)); head = re.sub(r'\s*\*+\s*$', '', head)
        who, _, rest = head.partition(',')
        w = tcase(who); w = re.sub(r'^The\b', 'the', w)
        title = 'Letter %d. To %s' % (n, w)
        first = [p for p in [tcase(rest.strip(' ,')) if rest.strip() else ''] if p]
        sub = ('*' + first[0] + '*\n\n') if first else ''
        ch.append(('c%02d' % n, title, sub + '\n\n'.join(body)))
    return ch
if __name__ == '__main__':
    which = sys.argv[1]
    if which == 'letters':
        ch = letters()
        mk(dict(id='john-of-the-cross-epistolario-lewis', dir='john-of-the-cross-opera-omnia/epistolario-lewis', work='john-of-the-cross/epistolario',
                name='Letters (Lewis)', name_pt='Cartas (Lewis, inglês)',
                desc="Eighteen letters of St. John of the Cross in David Lewis's English, with Zimmerman's 1919 corrections, to nuns, to Doña Ana de Peñalosa and others (1581-1591). Lewis numbers them I-XVIII in the order of the 1912 edition, which is not Silverio's order in the Spanish Epistolario, so this is its own book; the Censure on a nun's prayer is in the Opuscula book. Zimmerman's footnotes are not included.",
                desc_pt='As dezoito cartas de São João da Cruz na versão inglesa de David Lewis (1912, revista por Zimmerman em 1919).', composed='1581–1591',
                srcdesc='Letters I-XVIII.' + NOTE), ch, i_let, i_cens)
    if which == 'opuscula':
        ins = paras(L[i_instr:find(r'^LETTERS\s*$', i_instr)], caps_h2=True)
        # the first block is the long title; make it the subtitle
        ci = i_cens
        while L[ci].strip(): ci += 1
        cen = paras(L[ci:i_max], caps_h2=False)
        cen = [p for p in cen if not re.fullmatch(r'\d+', p)]
        mk(dict(id='john-of-the-cross-opuscula-lewis', dir='john-of-the-cross-opera-omnia/opuscula-lewis', work='john-of-the-cross/opuscula',
                name='Instructions and Precautions; Censure (Lewis)', name_pt='Instruções e precauções; Censura (Lewis, inglês)',
                desc="The Instructions and Precautions to be observed by one who would be a true religious (the Cautelas and the Counsels to a religious in one piece) and the Censure and Judgment on a nun's prayer, in David Lewis's English with Zimmerman's corrections. Lewis joins what Silverio's Spanish book keeps as separate Cautelas and Consejos, so this is its own book.",
                desc_pt='As Instruções e precauções e a Censura de São João da Cruz na versão inglesa de David Lewis (revista por Zimmerman, 1919).', composed='1578–1591',
                srcdesc='Instructions and Precautions; Censure and Judgment of the Blessed Father.' + NOTE),
           [('instrucoes', 'Instructions and Precautions', '\n\n'.join(ins)), ('censure', 'Censure and Judgment on the Spirit and Method of Prayer of a Nun', '\n\n'.join(cen))], i_instr, i_max)
    if which == 'maxims':
        seg = L[i_max + 1:i_poems]
        bl = blocks(seg); ch = []; cur = None
        def flush():
            if cur and cur[1]: ch.append(('m%02d' % (len(ch) + 1), cur[0], '\n\n'.join(cur[1])))
        # split into sections at isolated caps heading blocks
        buf = []
        secs = []; title = 'Prologue'; started = False
        for b in bl:
            if is_rh(b) or FN.match(b[0]): continue
            t = re.sub(r'\s+', ' ', ' '.join(b)); u = re.sub(r'[^A-Za-z]', '', t)
            if len(u) > 3 and sum(c.isupper() for c in u) == len(u) and len(b) <= 2 and not RH.match(t):
                if 'MAXIMS' in t or t.startswith('SELECTED') or re.search(r'\d', t): continue
                if t == 'PROLOGUE': continue
                secs.append((title, buf)); title = titlecase(t); title = title + ' (continued)' if title in [x[0] for x in secs] else title; buf = []; continue
            buf.append(b)
        secs.append((title, buf))
        for k, (t, bb) in enumerate(secs):
            ps = []
            for b in bb:
                x = inline(E.join_lines(b))
                if ps and not re.search(r'[.!?:;"”’\')\]]\s*$', ps[-1]) and x[:1].islower() and not re.match(r'^\d+\.', x): ps[-1] = E.join_lines([ps[-1], x])
                else: ps.append(x)
            if ps: ch.append(('m%02d' % (len(ch) + 1), t, '\n\n'.join(ps)))
        mk(dict(id='john-of-the-cross-avisos-lewis', dir='john-of-the-cross-opera-omnia/avisos-lewis', work='john-of-the-cross/avisos',
                name='Spiritual Maxims (Lewis)', name_pt='Máximas espirituais (Lewis, inglês)',
                desc="The Spiritual Maxims selected from the writings of St. John of the Cross, in David Lewis's English, with Zimmerman's corrections: the prologue and the maxims grouped by subject (imitation of Christ, faith, charity, prayer, obedience, poverty and so on). This is the old compilation, partly culled from his treatises, and does not follow the order of the Avisos and Dichos in Silverio's Spanish book, so it is its own book.",
                desc_pt='As Máximas espirituais selecionadas dos escritos de São João da Cruz, na versão inglesa de David Lewis (revista por Zimmerman, 1919).', composed='1578–1591',
                srcdesc='Spiritual Maxims selected from the writings of St. John of the Cross, with prologue.' + NOTE), ch, i_max, i_poems)

POEMS = [(9890, 'The Dark Night', 0), (9951, 'Song of the Soul and Its Bridegroom', 0), (10539, 'The Living Flame of Love', 0), (10578, 'A Soul Longing for the Vision of God', 0),
         (10720, 'Ecstasy of Contemplation', 0), (10843, 'Ecstasy of Contemplation (second poem)', 0), (10930, 'God the Supreme Good', 0), (10993, 'God the Supreme Good (second poem)', 0),
         (11136, 'Song of the Soul Rejoicing in the Knowledge of God by Faith', 0), (11218, 'Song of Christ and the Soul', 0), (11366, 'The Communication of the Three Persons', 0),
         (11442, 'The Creation', 0), (11496, 'The Creation (second poem)', 0), (11653, 'The Desires of the Holy Fathers', 0), (11746, 'The Desires of the Holy Fathers (second poem)', 0),
         (11785, 'The Incarnation', 0), (11883, 'The Incarnation (second poem)', 0), (11931, 'The Nativity', 0), (11986, 'Super Flumina Babylonis', 0),
         (12150, "Song I: The Soul's Craving", 'Si de mi baja suerte'), (12296, 'Song II: The Exiled Soul', 'Mi Dios y mi Señor, tened memoria'), (12386, 'Song III: Desolation', 'Decid cielos y tierra, decid mares'),
         (12495, 'The Dark Night (second version)', 'Aquella niebla escura'), (12670, 'Oh Sweet Dark Night', 'Oh dulce noche escura'), (12868, "The Soul's Desire to Be with Christ", 'Del agua de la vida'),
         (13143, 'Ecstasy (Entró el alma en olvido)', 'Ecstasy')]
NUMLINE = re.compile(r'^\s*(?:[ivxlcIVXLC1lI|!]{1,7}|\d{1,2})\s*\.?\s*$')
def stanzas(lines):
    pre = re.compile(r'^\d{1,2}\s{2,}')
    hasnum = any(re.fullmatch(r'[ivxlcIVXLC1lI|!]{1,7}|\d{1,2}', l.strip()) and re.search(r'[ivxIVX\d]', l) for l in lines) or sum(1 for l in lines if pre.match(l)) > 3
    bl = []; cur = []
    def push():
        nonlocal cur
        if cur: bl.append(cur); cur = []
    for l in lines:
        s = l.strip()
        if not s:
            if not hasnum: push()
            continue
        if re.fullmatch(r'[ivxlcIVXLC1lI|!]{1,7}|\d{1,2}', s): push(); continue
        if pre.match(s): push(); s = pre.sub('', s)
        s = re.sub(r'\s+', ' ', s)
        if RH.match(s) or FN.match(s) or re.fullmatch(r'[a-z]{1,3}', s) and s not in ('oh', 'ah'): continue
        cur.append(s)
    push()
    if not hasnum:
        out = []
        for b in bl:
            if out and (len(b) == 1 or len(out[-1]) < 4): out[-1] = out[-1] + b
            else: out.append(b)
        bl = out
    return bl
def poems():
    ch = []
    starts = [p[0] - 1 for p in POEMS] + [i_end]
    for k, (ln, title, sub) in enumerate(POEMS):
        a, e = ln - 1, starts[k + 1]
        j = a
        while L[j].strip(): j += 1
        head = [x.strip() for x in L[a:j]]
        rest = L[j:e]
        subtitle = ''
        if isinstance(sub, str) and sub:
            if title.startswith('Song '):
                # title block is 'SONG I / INCIPIT'; the English subtitle is the next block
                pass
            subtitle = sub if sub != 'Ecstasy' else 'Ecstasy'
            if title.startswith('Song '):
                nb = [x for x in rest if x.strip()][0]
                rest = rest[rest.index(nb) + 1:]
            elif sub != 'Ecstasy' or True:
                nb = next((x for x in rest if x.strip()), '')
                if re.sub(r'[\'’‘\s!.]', '', nb).lower() in (re.sub(r'[\'’‘\s!.]', '', sub).lower(), 'ecstasy'): rest = rest[rest.index(nb) + 1:]
                else: pass
        # subheads inside Song of the Soul (THE BRIDE etc.)
        body = []
        for b in stanzas(rest):
            t = '  \n'.join(b)
            if len(b) <= 2 and all(re.fullmatch(r'[A-Z][A-Z ,\']+', x) for x in b): t = '**%s**' % titlecase(' '.join(b))
            body.append(t)
        md = ('*%s*\n\n' % subtitle if subtitle and subtitle != 'Ecstasy' else '') + '\n\n'.join(body)
        ch.append(('p%02d' % (k + 1), title, md))
    return ch
if __name__ == '__main__' and sys.argv[1] == 'poems':
    ch = poems()
    mk(dict(id='john-of-the-cross-poesias-lewis', dir='john-of-the-cross-opera-omnia/poesias-lewis', work='john-of-the-cross/poesias',
            name='Poems (English verse)', name_pt='Poesias (versão inglesa em verso)',
            desc="The poems of St. John of the Cross in the English verse of the 1912-1919 Lewis/Zimmerman volume (the Dark Night, the Song of the Soul and the Bridegroom, the Living Flame, the Ecstasy, the Creation, the Incarnation, Super Flumina Babylonis and others, with a second group of translations of the Spanish songs). The English is a different selection and division from Silverio's Spanish Poesias, so it is its own book. Verse translators are not named in the scan's poems section.",
            desc_pt='Os poemas de São João da Cruz em verso inglês, do volume de Lewis e Zimmerman (1912-1919).', composed='1568–1591',
            translator='Various (David Lewis and Benedict Zimmerman edition)',
            srcdesc='Poems section of the volume, pp. 251-310.' + NOTE), ch, i_poems, i_end)
