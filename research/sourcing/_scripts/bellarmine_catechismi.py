import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
import bellarmine_tcp as T
paras = explode(bc.clean_volume(12).split('\n\n'))
def idx(rx, after=0):
    return next(i for i in range(after, len(paras)) if re.match(rx, paras[i]) and len(paras[i]) < 80)
SUB = re.compile(r'^(DEL|DELLA|DELLE|DELL|DEI|DE7|BELL|JDELLE|DELL5)\b')
def body_it(ps):
    out = []
    for p in ps:
        if len(p) <= 70 and capsy(p):
            if SUB.match(p): out.append('## ' + titlecase(p.strip(' .')))
            continue
        if len(p) <= 3 or isjunk(p): continue
        out.append(p)
    return out
def it_fix(p):
    if p.startswith('## '): return p
    p = re.sub(r"\b([NnAaDdSs][eaou]?l)[Fl]?F(?=[a-zàèéìòù])", r"\1l'", p)
    p = re.sub(r"\b(ne|De|de|a|A|da|su|co)ir(?=[aeiou])", lambda m: m.group(1) + "ll'" , p)
    p = re.sub(r"\b([Aa])li[ea]\b", r"\1lle", p); p = re.sub(r"\bohe\b", "che", p)
    return p
log = []
# ---- Dichiarazione piu copiosa
d0 = idx(r'^DICHIARAZIONE PI[UÙ] COPIOSA', 3000)
d1 = idx(r'^DOTTRINA CRISTIANA\.?$', idx(r'^CAP\.? ?XXII', d0) )
bks = walk(paras, d0, d1, book_re=None, nbooks=1, gap=2)
chs = bks[0][2]
print('dich chapters', [c[0] for c in chs])
chap = []
it = {}
for k, (n, i, inl) in enumerate(chs):
    nxt = chs[k + 1][1] if k + 1 < len(chs) else d1
    prev = paras[i - 1] if i > d0 and capsy(paras[i - 1]) and len(paras[i - 1]) < 150 and not re.match(r'^(DICHIAR|DOTTRINA|[CG]AP)', paras[i - 1]) else ''
    t = titlecase(prev.strip(' .;')) if prev else (inl and titlecase(inl) or '')
    if k == 0: t = titlecase(paras[d0 + 5].strip(' .;')) if False else t
    # the next chapter's title sits just before its heading: drop it from this body
    end = nxt - 1 if k + 1 < len(chs) and capsy(paras[nxt - 1]) and len(paras[nxt - 1]) < 150 and not re.match(r'^(DICHIAR|DOTTRINA|[CG]AP)', paras[nxt - 1]) else nxt
    body = [it_fix(p) for p in body_it(paras[i + 1:end])]
    it[n] = (t, body)
prevn = 0
for n in sorted(it):
    if n != prevn + 1: log.append(f'dichiarazione: chapter(s) {prevn+1}-{n-1} lost (heading not read)')
    prevn = n
# English Hadock
E = T.chapters(bc.SRC + '/tcp/A07972.xml')
en = {}
for d in E:
    h = d.find(T.NS + 'head'); ht = T.txt(h) if h is not None else ''
    m = re.match(r'^(?:CHAP|Cap|Chap)\.?\s*([IVXL]+|\d+)\.?\s*(.*)$', ht)
    if not m: continue
    n = int(m.group(1)) if m.group(1).isdigit() else rom(m.group(1))
    if n == 2 and 'Theologicall' in ht: n = 11
    en[n] = (m.group(2).strip(' .'), [p for p in T.paras(d)])
print('en', sorted(en))
chapters = []
for n in sorted(it):
    t, body = it[n]
    h = f'Capo {roman(n)}' + (f'. {t}' if t else '')
    ch = dict(id=f'c{n:02d}', title={'it': h}, md={'it': (h, body)})
    if n in en:
        et, eb = en[n]; eh = f'Chapter {n}' + (f'. {et}' if et else '')
        ch['md']['en-US'] = (eh, eb); ch['title']['en-US'] = eh
    else: ch['title']['en-US'] = h
    chapters.append(ch)
orph = [n for n in en if n not in it]
for n in orph:
    # English chapter whose Italian heading was unread: appended to the nearest preceding chapter
    pn = max(k for k in it if k < n)
    et, eb = en[n]
    c = next(c for c in chapters if c['id'] == f'c{pn:02d}')
    if 'en-US' not in c['md']: c['md']['en-US'] = (c['title']['it'], [])
    c['md']['en-US'][1].extend([f'## Chapter {n}. {et}'] + eb); log.append(f'dichiarazione: English chapter {n} appended to chapter {pn}')
names = {'it': 'Dichiarazione più copiosa della dottrina cristiana', 'en-US': 'An Ample Declaration of the Christian Doctrine', 'pt-BR': 'Declaração mais ampla da doutrina cristã'}
descs = {'it': 'Dottrina cristiana in forma di dialogo tra maestro e discepolo: il Credo, il Padre nostro, l\'Ave Maria, i comandamenti, i sacramenti, le virtù, i peccati e i novissimi (1598). Testo dell\'edizione Vivès (1870-74), da scansione OCR.',
         'en-US': 'The longer catechism in dialogue form: the Creed, the Our Father, the Hail Mary, the commandments, the sacraments, the virtues, sins and the last things (1598). The Italian is the Vivès edition (1870-74) from an OCR scan; the English is Richard Hadock\'s translation of 1604 (EEBO-TCP), in the spelling of its time.',
         'pt-BR': 'O catecismo maior em forma de diálogo entre mestre e discípulo: Credo, Pai-nosso, Ave-Maria, mandamentos, sacramentos, virtudes, pecados e novíssimos (1598).'}
src_it = vives_source(12, 'Italian.'); src_it['language'] = 'it'
src_en = {'language': 'en-US', 'url': 'https://github.com/textcreationpartnership/A07972', 'edition': 'An ample declaration of the Christian doctrine, trans. Richard Hadock (Douai?, 1604), EEBO-TCP A07972.', 'description': 'Keyed transcription (CC0) in early-modern spelling; long s normalised, marginal notes dropped; the chapters follow the Italian, the English merging two of them where the Italian heading was not read.', 'tier': 'A', 'tierEvidence': 'Printed 1604; EEBO-TCP text released into the public domain (CC0).'}
d = mkbook('bellarmine-dichiarazione-piu-copiosa', 'dichiarazione-piu-copiosa', names, descs, '1598', ['it', 'en-US'],
           {'it': dict(VIVES_ED), 'en-US': {'translator': 'Richard Hadock', 'year': 1604}}, [src_it, src_en])
d['author'] = {'it': AUTHOR['it'], 'en-US': AUTHOR['en-US'], 'pt-BR': AUTHOR['pt-BR']}
print(write_book('catechismi/dichiarazione-piu-copiosa', d, chapters)); author_file()

# ---- Dottrina cristiana breve
b0 = idx(r'^INTRODUZIONE', idx(r'^CLEMENTE VIII', d0 - 1100 if False else 2000))
b1 = idx(r'^MODO\b', b0)
cl = [i for i in range(b0, b1) if re.match(r'^(PRIMA|SECONDA|TERZA|QUARTA) CLASSE', paras[i])]
atti = idx(r'^ATTI .*VIRTU', cl[-1]); ist = idx(r'^ISTRUZIONE', atti)
print(b0, cl, atti, ist, b1)
secs = [('introduzione', 'Introduzione', b0 + 1, cl[0])]
names_c = ['Prima classe', 'Seconda classe', 'Terza classe', 'Quarta classe']
for k in range(4): secs.append((f'classe{k+1}', names_c[k], cl[k] + 1, cl[k + 1] if k < 3 else atti))
secs += [('atti-delle-virtu', 'Atti delle virtù', atti + 1, ist), ('istruzione', 'Istruzione', ist + 1, b1)]
chapters = []
for cid, t, a, b in secs:
    body = [it_fix(p) for p in body_it(paras[a:b])]
    chapters.append(dict(id=cid, title={'it': t, 'en-US': {'Introduzione': 'Introduction', 'Prima classe': 'First class', 'Seconda classe': 'Second class', 'Terza classe': 'Third class', 'Quarta classe': 'Fourth class', 'Atti delle virtù': 'Acts of the virtues', 'Istruzione': 'Instruction'}[t]}, md={'it': (t, body)}))
names = {'it': 'Dottrina cristiana breve', 'en-US': 'The Short Christian Doctrine', 'pt-BR': 'Doutrina cristã breve'}
descs = {'it': 'Il catechismo breve, composto per ordine di Clemente VIII (1597), in quattro classi di domande e risposte da imparare a memoria, con gli atti delle virtù. Testo dell\'edizione Vivès (1870-74), da scansione OCR.',
         'en-US': 'The short catechism composed by order of Clement VIII (1597), in four classes of questions and answers to be learned by heart, with the acts of the virtues. Italian only: the Vivès edition (1870-74) from an OCR scan.',
         'pt-BR': 'O catecismo breve composto por ordem de Clemente VIII (1597), em quatro classes de perguntas e respostas para decorar.'}
d = mkbook('bellarmine-dottrina-cristiana-breve', 'dottrina-cristiana-breve', names, descs, '1597', ['it'], {'it': dict(VIVES_ED)}, [src_it])
print(write_book('catechismi/dottrina-cristiana-breve', d, chapters))
print('\n'.join(log))
