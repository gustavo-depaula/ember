import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
paras = bc.clean_volume(8).split('\n\n')
lo = next(i for i, p in enumerate(paras) if p == 'DE ASCENSIONE MENTIS IN DEUM')
hi = next(i for i, p in enumerate(paras) if i > lo and p.startswith('DE STERNA FELICITATE SANCTORUM') or p.startswith('DE AETERNA FELICITATE SANCTORUM') and i > lo)
G = ['PRIMUS','SECUNDUS','TERTIUS','QUARTUS','QUINTUS','SEXTUS','SEPTIMUS','OCTAVUS','NONUS','DECIMUS','UNDECIMUS','DUODECIMUS','DECIMUS TERTIUS','DECIMUS QUARTUS','DECIMUS QUINTUS']
RG = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV']
heads = []; k = 0
for i in range(lo, hi):
    if k < 15 and re.fullmatch(r'G[A-Za-z]{0,3}ADUS ' + G[k].replace('C', '[CG]') + r'\.?', paras[i]): heads.append(i); k += 1
assert len(heads) == 15, heads
pre = [p for p in paras[lo:heads[0]]]
# preface: after the title block, up to the 'SCALAE' title
pref = clean_body(paras[lo:heads[0]])
pref = [p for p in pref if not p.startswith('SCAL')]
chapters = [dict(id='praefatio', title={'la': 'Praefatio', 'en-US': 'Preface'}, md={'la': ('Praefatio', [bc.fix(p) for p in pref])})]
for n in range(15):
    a = heads[n]; b = heads[n+1] if n < 14 else hi
    t, j = title_after(paras, a, '')
    body = [bc.fix(p) for p in clean_body(paras[j:b])]
    h = f'Gradus {RG[n]}'
    chapters.append(dict(id=f'g{n+1:02d}', title={'la': f'{h}: {t}' if t else h}, md={'la': (f'{h}: {t}' if t else h, body)}))
# English: Monialis 1925
E = en_paras(bc.SRC + '/en/mindsascenttogod00bell.txt')
ST = re.compile(r'^(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH):? STEP\b\s*(.*)$')
ci = next(i for i, p in enumerate(E) if ST.match(p) and 'CHAPTER' in p and i > 40)
ii = [i for i, p in enumerate(E) if re.match(r'^INTRODUCTION\b', p) and i > 40 and i < ci]
steps = [i for i in range(ci, len(E)) if ST.match(E[i])]
end = next(i for i in range(steps[-1], len(E)) if re.match(r'^(THE END|FINIS|INDEX)', E[i])) if any(re.match(r'^(THE END|FINIS|INDEX)', p) for p in E[steps[-1]:]) else len(E)
print(len(steps), ii, end)
intro = [p for p in E[ii[-1] + 1:ci]]
en = {}
en['praefatio'] = ('Preface', intro)
for n, a in enumerate(steps):
    b = steps[n + 1] if n < 14 else end
    m = ST.match(E[a]); head = m.group(2)
    stitle = re.sub(r'\s*CHAPTER.*$', '', head).strip(' .')
    if not stitle and a + 1 < b and len(E[a+1]) < 60 and E[a+1].isupper(): stitle = E[a+1]
    body = []; cn = 0; seg = [p for p in E[a + 1:b] if p != stitle and not re.match(r'(?i)^(printed by|index\b)', p)]
    k = next((i for i, p in enumerate(seg) if re.match(r'(?i)^(printed by|index\b)', p)), len(seg))
    cut = next((i for i, p in enumerate(E[a + 1:b]) if re.match(r'(?i)^(printed by|index\b)', p)), None)
    seg = [p for p in (E[a + 1:b][:cut] if cut is not None else E[a + 1:b]) if p != stitle]
    i = 0
    if 'CHAPTER' in E[a] and seg and len(seg[0]) < 90:
        cn = 1; body.append(f'## Chapter 1: {seg[0].strip(" .")}'); i = 1
    while i < len(seg):
        p = seg[i]; m2 = re.match(r'^CHAPTER\s+\S+\s*(.*)$', p)
        if m2 and len(p) < 140:
            cn += 1; t = m2.group(1).strip()
            if not t and i + 1 < len(seg) and len(seg[i+1]) < 90: t = seg[i+1]; i += 1
            body.append(f'## Chapter {cn}' + (f': {t.strip(" .")}' if t else ''))
        else: body.append(p)
        i += 1
    for k, q in enumerate(body):
        mm = re.search(r'Print\w* By\b', q)
        if mm: body = body[:k] + ([q[:mm.start()].strip()] if q[:mm.start()].strip() else []); break
    body = dropcap_merge([p for p in body if not isjunk(p)])
    en[f'g{n+1:02d}'] = (f'Step {RG[n]}: {titlecase(stitle)}', body)
chap_no = 0
for ch in chapters:
    ch['title']['en-US'] = en[ch['id']][0] if ch['id'] in en else ch['title']['la']
    if ch['id'] in en: ch['md']['en-US'] = en[ch['id']]
names = {'la': 'De ascensione mentis in Deum per scalas rerum creatarum', 'en-US': "The Mind's Ascent to God by the Ladder of Created Things", 'pt-BR': 'A ascensão da mente a Deus pela escada das criaturas'}
descs = {'la': 'Quindecim gradus ex creaturarum consideratione ad Deum ascendentium (1615), opus ascetica ex anno recessus conscriptum. Textus ex editione Vivès (1870-74), ex scanno OCR.',
         'en-US': "Fifteen steps of ascent to God through the consideration of creatures, written on Bellarmine's annual retreat (1615). The Latin is the Vivès edition (1870-74) from an OCR scan; the English is the 1925 translation by a Religious of the Church of England (A. R. Mowbray).",
         'pt-BR': 'Quinze degraus de ascensão a Deus pela consideração das criaturas, escritos no retiro anual do cardeal (1615).'}
srcs = [vives_source(8), {'language': 'en-US', 'url': 'https://archive.org/details/mindsascenttogod00bell', 'edition': "The Mind's Ascent to God, trans. a Religious of the Church of England (Monialis), with a preface by P. N. Waggett (London: A. R. Mowbray, 1925).", 'description': 'Archive.org OCR (djvu.txt), paragraphs rejoined and page heads removed; the steps hold the translator\'s chapters as ## headings; the translator\'s division of the Latin into chapters is kept inside each step. Some chapter-opening letters lost to the drop-cap are not restored.', 'tier': 'A', 'tierEvidence': 'Published 1925 in Great Britain; the translator was anonymous and the book is public domain in the US.'}]
d = mkbook('bellarmine-de-ascensione-mentis', 'de-ascensione-mentis', names, descs, '1615', ['la', 'en-US'],
           {'la': dict(VIVES_ED), 'en-US': {'translator': 'A Religious of the Church of England ("Monialis")', 'year': 1925}}, srcs)
wc = write_book('ascetica/de-ascensione-mentis', d, chapters)
author_file(); print(wc)
