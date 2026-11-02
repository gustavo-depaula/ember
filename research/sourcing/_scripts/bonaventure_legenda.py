"""Legenda maior / minor: Latin from the poliba mirror, English (Lockhart 1868) for the maior.
usage: python3 -I bonaventure_legenda.py   (from repo root)"""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

MIR = 'research/sourcing/francis-of-assisi/mirror-bari/rilievo.poliba.it/bsc/bsc/st/cc/orm/francescani/fonti/'

def la_text(name):
    b = open(MIR + name, 'rb').read().decode('cp1252', errors='replace')
    b = re.sub(r'(?is)<(script|style).*?</\1>', '', b)
    b = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</h\d>|</tr>|</li>', '\n', b)
    import html
    return deaccent_la(html.unescape(re.sub(r'<[^>]+>', '', b)))

def la_chapters(t, headre, start):
    lines = t.split('\n')[start:]
    chs = []; cur = None; para = None
    for ln in lines:
        s = ln.strip()
        if not s or s in ('»Index', '«  »Index', '«  Index') or s.startswith('«') or s.startswith('Trascrizione') or s.startswith('Per informazioni'):
            continue
        m = headre.match(s)
        if m:
            cur = {'head': s, 'paras': []}; chs.append(cur); para = None; continue
        if cur is None: continue
        if re.fullmatch(r'\d+', s):
            para = []; cur['paras'].append(para); continue
        m = re.match(r'(\d+) (.*)', s)
        if m and para is not None:
            para.append(m.group(2)); continue
        if para is not None and ln[:1] == '\t':  # unnumbered continuation
            para.append(s)
    return chs

def md(title, chs_paras):
    return '# %s\n\n' % title + '\n\n'.join(' '.join(p) for p in chs_paras if p)

def clean_en(lines):
    """Lockhart OCR block -> paragraphs. Page headers sit in runs of >=2 blank lines."""
    out = []; cur = []; blank = 0
    hdr = re.compile(r'^(\d+\s+)?[A-Z][A-Z ,.\'’;:-]{6,}\.?,?(\s+\d+)?$')
    for ln in lines:
        s = ln.strip()
        if not s:
            blank += 1; continue
        if blank >= 2 and hdr.match(s) and (s[0].isdigit() or s[-1].isdigit() or 'FRANCIS' in s or 'MIRACLES' in s or 'PROLOGUE' in s):
            blank = 0; continue
        if blank == 1 and cur:
            out.append(cur); cur = []
        blank = 0
        cur.append(s)
    if cur: out.append(cur)
    paras = []
    for p in out:
        t = ''
        for s in p:
            if t.endswith('-') and s[:1].islower(): t = t[:-1] + s
            else: t = (t + ' ' + s) if t else s
        paras.append(re.sub(r'\s+', ' ', t).strip())
    return paras

def roman_to_int(r):
    v = {'I':1,'V':5,'X':10}; n = 0
    for i, c in enumerate(r):
        n += -v[c] if i+1 < len(r) and v[c] < v[r[i+1]] else v[c]
    return n

def build_maior():
    t = la_text('ff_leggendamaggiore_lat.html')
    chs = la_chapters(t, re.compile(r'^(Prologus\.$|Caput [IVX]+ - |[IVX]+ - |Incipit prologus)'), 46)
    files = {'la': {}}; toc = []
    for c in chs:
        h = c['head']
        if h.startswith('Prologus.') or h.startswith('Incipit prologus'):
            if not c['paras']: continue
            cid, title = 'prologus', 'Prologus in vitam beati Francisci'
        elif h.startswith('Caput'):
            m = re.match(r'Caput ([IVX]+) - (.*?)\.?$', h)
            n = roman_to_int(m.group(1)); cid = 'c%02d' % n; title = 'Caput %s. %s' % (m.group(1), m.group(2))
        else:
            m = re.match(r'([IVX]+) - (.*?)\.?$', h)
            n = roman_to_int(m.group(1)); cid = 'm%02d' % n; title = 'Miracula %s. %s' % (m.group(1), m.group(2))
        files['la'][cid] = md(title, c['paras'])
        toc.append((cid, {'la': title}))
    # group the miracles under one node
    main = [x for x in toc if not x[0].startswith('m')]
    mir = [x for x in toc if x[0].startswith('m')]
    toc = main + [('miracula', {'la': 'De miraculis post mortem ostensis'}, mir)]
    return files, toc

def build_minor():
    t = la_text('ff_leggendaminore_lat.html')
    lines = t.split('\n')[30:]
    chs = []; cur = None; lect = None; para = None
    for ln in lines:
        s = ln.strip()
        if not s or 'Index' in s and len(s) < 12 or s.startswith('Trascrizione') or s.startswith('Per informazioni') or s.startswith('Expliciunt'): continue
        m = re.match(r'^([IVX]+) - (.*?)\.?$', s)
        if m: cur = {'n': roman_to_int(m.group(1)), 'r': m.group(1), 't': m.group(2), 'l': []}; chs.append(cur); para = None; continue
        if cur is None: continue
        if s.startswith('Lectio'):
            lect = {'h': s.rstrip('.'), 'p': []}; cur['l'].append(lect); continue
        if re.fullmatch(r'\d+', s): para = []; lect['p'].append(para); continue
        m = re.match(r'(\d+) (.*)', s)
        if m and para is not None: para.append(m.group(2))
    files = {'la': {}}; toc = []
    for c in chs:
        title = 'Caput %s. %s' % (c['r'], c['t']); cid = 'c%02d' % c['n']
        body = '# %s\n\n' % title + '\n\n'.join('## %s\n\n%s' % (l['h'], '\n\n'.join(' '.join(p) for p in l['p'])) for l in c['l'])
        files['la'][cid] = body; toc.append((cid, {'la': title}))
    return files, toc

if __name__ == '__main__':
    author_file = None
    P = 'https://web.archive.org/web/20051111/http://rilievo.poliba.it/bsc/bsc/st/cc/orm/francescani/fonti/'
    for kind, fn, ver in [('maior', build_maior, 'ff_leggendamaggiore_lat.html'), ('minor', build_minor, 'ff_leggendaminore_lat.html')]:
        files, toc = fn()
        maior = kind == 'maior'
        names = {'la': 'Legenda %s S. Francisci' % kind, 'en-US': 'The Major Legend of St. Francis' if maior else 'The Minor Legend of St. Francis', 'pt-BR': 'Legenda Maior de São Francisco' if maior else 'Legenda Menor de São Francisco'}
        descr = {
            'la': 'Vita S. Francisci a S. Bonaventura, ministro generali, ex mandato Capituli Narbonensis (1260) conscripta, anno 1266 ab Ordine unica legenda recepta. ' if maior else 'Legenda minor ad usum liturgicum, in septem capita et novem lectiones divisa, ex Legenda maiore a Bonaventura excerpta.',
            'en-US': 'The official life of St. Francis, written by the Minister General St. Bonaventure for the Chapter of Narbonne (1260) and adopted in 1266 as the only legend of the Order: fifteen chapters on his life, with ten chapters of miracles after his death. The Latin is the text of the Fonti francescane, with its scriptural cross-references.' if maior else 'The short legend for liturgical reading, in seven chapters of nine lessons each, drawn from the Major Legend by St. Bonaventure. The Latin is the text of the Fonti francescane, with its scriptural cross-references.',
            'pt-BR': 'A biografia oficial de São Francisco, escrita por São Boaventura, ministro geral, e adotada pela Ordem em 1266 como única legenda: quinze capítulos sobre a vida e dez sobre os milagres póstumos.' if maior else 'A legenda breve para leitura litúrgica, em sete capítulos de nove lições cada, extraída da Legenda Maior por São Boaventura.'}
        s = [src('la', P + ver, 'Text of the Quaracchi edition (Legendae duae de vita S. Francisci, 1898) as transcribed by M. Mastrorilli for the Biblioteca digitale Fonti francescane (rilievo.poliba.it, 2003), read from the Wayback Machine snapshot of 2005-11-11.',
                 'Lines of numbered sentence units are joined into the sections of the edition; the modern "cfr." scriptural cross-references of the transcription stay in parentheses; stray grave and acute accents of the web transcription are removed.' ,
                 'B', 'Bonaventure died in 1274; the Latin is his text. The web transcription is an anonymous digitization for scholarly use.')]
        emit('legenda-' + kind, 'bonaventure-legenda-' + kind, names, descr, '1260-1263' if maior else '1263', 'bonaventure/legenda-' + kind, ['la'],
             {'la': {'editor': 'Quaracchi (PP. Collegii S. Bonaventurae), after the Fonti francescane transcription', 'year': 1898}}, s, toc, files)
        print(kind, sum(len(x.split()) for x in files['la'].values()))
