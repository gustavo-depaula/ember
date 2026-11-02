import sys, re, difflib; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
from bellarmine_psalmi import rfull, norm
paras = bc.clean_volume(9).split('\n\n')
end = next(i for i, p in enumerate(paras) if re.match(r'^FINIS CONCIONUM', p))
RX = re.compile(r'^CONCIO\.?\s+([IVXLCTYl1i|]{1,9})[.,]?\s*(.*)$')
out = []; n = 1; first = None
for i in range(0, end):
    p = paras[i]
    m = RX.match(p) if len(p) < 200 else None
    if not m: continue
    x = norm(m.group(1))
    for k in (0, 1, 2):
        if difflib.SequenceMatcher(None, x, rfull(n + k)).ratio() >= .84:
            n += k; out.append((n, i, m.group(2).strip())); n += 1; break
print(len(out), [k for k in range(1, out[-1][0] + 1) if k not in [a for a, b, c in out]])
pre = [bc.fix(p) for p in clean_body(paras[:out[0][1]])]
chapters = []
def ttl(t):
    t = re.sub(r"^IN['’]? ", 'In ', t.strip(' .'), flags=re.I) if t else ''
    return t[:1].upper() + t[1:].lower() if t.isupper() else t
for k, (n, i, inl) in enumerate(out):
    nxt = out[k + 1][1] if k + 1 < len(out) else end
    body = [bc.fix(p) for p in clean_body(paras[i + 1:nxt])]
    t = ttl(inl); h = f'Concio {n}' + (f'. {t}' if t else '')
    chapters.append(dict(id=f'c{n:03d}', title={'la': h, 'en-US': h}, md={'la': (h, body)}))
if words(' '.join(pre)) >= 100: chapters.insert(0, dict(id='praefatio', title={'la': 'Praefatio', 'en-US': 'Preface'}, md={'la': ('Praefatio', pre)}))
names = {'la': 'Conciones habitae Lovanii', 'en-US': 'The Louvain Sermons', 'pt-BR': 'Sermões de Lovaina'}
descs = {'la': 'Conciones quas Bellarminus Lovanii habuit (1570-76), per anni liturgici dies et festa ordinatae. Textus ex editione Vivès (1870-74), tomo IX, ex scanno OCR.',
         'en-US': 'The sermons Bellarmine preached at Louvain (1570-76), arranged by the days and feasts of the liturgical year. Latin only: the Vivès edition (1870-74), volume 9, from an OCR scan.',
         'pt-BR': 'Os sermões pregados por Belarmino em Lovaina (1570-76), ordenados pelos dias e festas do ano litúrgico.'}
d = mkbook('bellarmine-conciones-lovanienses', 'conciones', names, descs, '1570-76', ['la'], {'la': dict(VIVES_ED)}, [vives_source(9)])
print(write_book('conciones', d, chapters)); author_file()
