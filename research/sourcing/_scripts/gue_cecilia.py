import re, gue_build as b, gue_en as en
lines = open(b.ROOT + 'research/sourcing/gueranger/ia/x-lifeofsaintcecil00gura.txt').read().replace('\x0c', '').split('\n')
toc_txt = ' '.join(l.strip() for l in lines[128:290])
toc_txt = re.sub(r'\s+', ' ', toc_txt)
toc_txt = re.sub(r'CONTE[XN]TS\.? ?\d* ?|PAGE\. ?', '', toc_txt)
parts = re.split(r'CHAP\.? ([IVXLCT]+)\.? ?', toc_txt)
titles = {}
for i in range(1, len(parts) - 1, 2):
    t = re.sub(r'\s*[\.\s]*\d{1,3}\s*(?=$)', '', parts[i + 1]).strip()
    t = re.sub(r'(\w)- (\w)', r'\1\2', t)
    titles[len(titles) + 1] = t
print(len(titles)); assert len(titles) == 37, len(titles)
N = 38
titles = {**{k: titles[k] for k in range(1, 36)}, 36: 'Continuation of the same subject', 37: titles[36], 38: titles[37]}
def key(s): return re.sub(r'[^A-Z]', '', s.upper())
def roman(n):
    out = ''
    for v, r in [(10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v: out += r; n -= v
    return out
def norm_num(x):
    x = re.sub(r'[^A-Za-z1]', '', x).upper()
    return x.replace('H', 'II').replace('L', 'I').replace('T', 'I').replace('U', 'I').replace('Y', 'V').replace('1', 'I')
cands = [(i, norm_num(m.group(1))) for i, l in enumerate(lines) if i > 285 and (m := re.match(r'^\s*CHAPTER\.?\s+(\S+)', l))]
pos = {}; cur = 285
for k in range(1, N + 1):
    j = next((i for i, nn in cands if i > cur and nn == roman(k)), None)
    if j is not None: pos[k] = j; cur = j
    else: pos[k] = None
# fill the gaps by title key between neighbours
for k in range(1, N + 1):
    if pos[k] is None:
        lo = max([pos[x] for x in range(1, k) if pos[x]] or [285]); hi = min([pos[x] for x in range(k + 1, N + 1) if pos[x]] or [len(lines)])
        kk = key(titles[k])[:14]
        j = next((i for i in range(lo + 1, hi) if len(key(lines[i])) >= 10 and key(lines[i]).startswith(kk[:12])), None)
        if j is None: print('MISSING', k, titles[k][:50]); j = lo + (hi - lo) // 2
        else:
            while j > lo and lines[j - 1].strip() == '': j -= 1
            if re.match(r'^\s*CHAP', lines[j - 1]): j -= 1
        pos[k] = j
pos[34] = 12950
print(pos)
pref_s = next(i for i, l in enumerate(lines) if re.match(r'^\s*P[KR]EFACE\.?\s*$', l))
app = next(i for i in range(pos[N] + 100, len(lines)) if re.match(r'^\s*APPENDIX\.?\s*$', lines[i]))
DROP = [r'^(?:\d+ )?(?:LIFE OF )?(?:ST\.|SAINT) CECILIA\.?(?: \d+)?$', r'^CHAPTER [IVXLCT]+\.?(?: \d+)?$', r'^(?:\d+ )?CHAPTER\.? [IVXLCT]+\.?$']
ch, toc = {}, []
units = [('preface', 'Preface', pref_s + 1, 128)]
for k in range(1, N + 1):
    end = pos[k + 1] if k < N else app
    units.append(('%02d' % k, 'Chapter %d' % k, pos[k] + 1, end))
units.append(('appendix', 'Appendix', app + 1, len(lines)))
for cid, t, a, e in units:
    pp = en.paras(lines[a:e], DROP)
    up = lambda x: sum(c.isupper() for c in x) / max(1, sum(c.isalpha() for c in x)) > 0.7
    while pp and (len(pp[0]) < 4 or up(pp[0])): pp = pp[1:]
    if cid.isdigit():
        k = int(cid); full = titles[k]; first = re.split(r'(?<=[a-z])\. ', full)[0].rstrip('.')
        t = 'Chapter %d. %s' % (k, first)
    ch[cid] = b.chapter_md(t, [('p', p) for p in pp], {}, merge=False); toc.append((cid, t))
d = b.book('gueranger-sainte-cecile-en', 'sainte-cecile',
 {'en-US': 'Life of Saint Cecilia, Virgin and Martyr', 'fr-FR': 'Vie de sainte Cécile, vierge et martyre (traduction anglaise de 1866)', 'pt-BR': 'Vida de santa Cecília, virgem e mártir'},
 {'en-US': 'The English translation (Philadelphia, 1866) of Dom Guéranger’s Histoire de sainte Cécile et de la société romaine aux deux premiers siècles: Alexander Severus and the Church in Rome, the legend and martyrdom of Cecilia, Valerian and Tiburtius, the Acts and their testimonies, the finding of her body under Paschal I and again under Clement VIII, the Jansenist attack on the Acts and its refutation, and the later history of her basilica.',
  'fr-FR': 'La traduction anglaise (Philadelphie, 1866) de l’Histoire de sainte Cécile de Dom Guéranger : Alexandre Sévère et l’Église de Rome, la passion de Cécile, Valérien et Tiburce, les Actes et leurs témoignages, l’invention de son corps sous Pascal Ier puis sous Clément VIII, l’attaque janséniste contre les Actes et sa réfutation, l’histoire ultérieure de sa basilique.',
  'pt-BR': 'A tradução inglesa (Filadélfia, 1866) da Histoire de sainte Cécile de Dom Guéranger: Alexandre Severo e a Igreja de Roma, a paixão de Cecília, Valeriano e Tibúrcio, os Atos e seus testemunhos, a descoberta do corpo sob Pascoal I e depois sob Clemente VIII, o ataque jansenista aos Atos e sua refutação, a história posterior de sua basílica.'},
 '1849', ['en-US'], {'en-US': {'translator': 'Anonymous (Philadelphia)', 'year': 1866}},
 [b.src('en-US', 'https://archive.org/details/lifeofsaintcecil00gura', 'Life of Saint Cecilia, Virgin and Martyr, Philadelphia, 1866 (archive.org OCR text, cleaned)', 'English only: no French text of the Histoire (1849) or of Sainte Cécile et la société romaine (1874) was found online in this pass. Page-foot notes are not separated by the OCR. Chapter titles are the first sentence of the table of contents entry.', ev='Printed 1866.')],
 b.toc_of(toc, 'en-US'))
b.write_book('sainte-cecile', d, {'en-US': ch}, {'sainte-cecile': ('english', '\n'.join(lines))})
