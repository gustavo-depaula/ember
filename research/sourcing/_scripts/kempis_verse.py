"""Rebuild vita-boni-monachi and epitaphium-monachorum with verse line breaks kept (Pohl IV, 1918).
A blank-separated block whose lines mostly end in punctuation and are short is verse; the rest is prose."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from kempis_common import segments, clean, mend, fix, capsish, LN
import kempis_fix as kf
from kempis_cantica import noise, LNUM

F = 'research/sourcing/kempis/pohl/operaomnia0000thom_q8k7.txt'
L = open(F, errors='replace').read().split('\n')


def strip_ln(t):
    t = re.sub(r'^' + LN + r'(?=\s*[A-Za-z])\s*', '', t.strip())
    t = re.sub(r'(?<=[a-z,.;:?!])\s+(?:5|10|15|20|25|30|35|40|io|to|i0)$', '', t)
    return t


def render(lines):
    ls = [strip_ln(re.sub(r'\s+', ' ', l)) for l in lines if l.strip() and not noise(l) and not (re.search(r'EPITAPHIVM MONACHORVM|VITA BONI MONACHI', l) and capsish(l))]
    ls = [x for x in ls if x]
    vs = [bool(re.search(r'[;:.?!,]$', x)) and len(x) < 48 for x in ls]
    # verse = runs of at least 4 short lines that end in punctuation
    isv = [False] * len(ls)
    i = 0
    while i < len(ls):
        if vs[i]:
            j = i
            while j < len(ls) and vs[j]:
                j += 1
            if j - i >= 4:
                for k in range(i, j):
                    isv[k] = True
            i = j
        else:
            i += 1
    out, i = [], 0
    while i < len(ls):
        j = i
        while j < len(ls) and isv[j] == isv[i]:
            j += 1
        seg = ls[i:j]
        if isv[i]:
            seg = [kf.tidy(kf.fix_ocr(fix(x))) for x in seg]
            st, cur = [], []
            for x in seg:
                cur.append(x)
                if len(cur) >= 4 and re.search(r'[.?!]$', x):
                    st.append('  \n'.join(cur))
                    cur = []
            if cur:
                st.append('  \n'.join(cur))
            out.append(('v', '\n\n'.join(st)))
        else:
            t = ''
            for x in seg:
                t = t[:-1] + x if t.endswith('-') and x[:1].islower() else (t + ' ' + x).strip()
            out.append(('p', kf.tidy(kf.fix_ocr(fix(t)))))
        i = j
    merged = []
    for k, v in out:
        if k == 'p' and merged and merged[-1][0] == 'p':
            merged[-1] = ('p', merged[-1][1] + ' ' + v)
        else:
            merged.append((k, v))
    return '\n\n'.join(v for k, v in merged)


def rebuild(slug, a, b, titles, first_pre=None):
    d = f'content/books/kempis-opera-omnia/{slug}'
    pre, segs = segments(L, r'CAPITVLVM', a, b, (), True)
    assert len(segs) == len(titles), (len(segs), len(titles))
    bj = json.load(open(d + '/book.json'))
    for f in os.listdir(d + '/la'):
        os.remove(f'{d}/la/{f}')
    toc, words, n0 = [], 0, 0
    if first_pre:
        t = '0. ' + first_pre[0]
        txt = f'# {first_pre[0]}\n\n' + render(L[first_pre[1]:first_pre[2]]) + '\n'
        open(f'{d}/la/p1-00.md', 'w').write(txt)
        words += len(txt.split())
        toc.append({'id': 'p1-00', 'title': {'la': first_pre[0]}})
    for i, ((gi, ls, pt), title) in enumerate(zip(segs, titles), 1):
        t = f'{i}. {title}'
        txt = f'# {t}\n\n' + render(ls) + '\n'
        open(f'{d}/la/p1-{i:02d}.md', 'w').write(txt)
        words += len(txt.split())
        toc.append({'id': f'p1-{i:02d}', 'title': {'la': t}})
    bj['toc'] = toc
    json.dump(bj, open(d + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(d + '/book.json', 'a').write('\n')
    print(slug, words, len(toc))


rebuild('vita-boni-monachi', 6311, 6621, ['De renuntiatione saeculi', 'De remediis vitiorum', 'De exemplis eremitarum', 'De patientia martyrum', 'De studio doctorum', 'De labore et oratione confessorum', 'De extirpatione vitiorum', 'De exercitiis monachorum', 'De corona et praemio monachorum'], ('Prooemium', 6313, 6329))
rebuild('epitaphium-monachorum', 5829, 6257, ['De recta via iustorum ad regnum caelorum', 'De bona custodia cordis et oris', 'De frequenti invocatione nominis Iesu et Mariae', 'De certamine contra cotidiana vitia', 'De optimis bonis animae', 'De vera et interna consolatione animae', 'De recollectione cordis in silentio oris', 'De remediis contra vanam gloriam et laudem', 'De munditia cordis a vitiis et passionibus occultis', 'De vera pace cordis in virtutibus'])

D = 'content/books/kempis-opera-omnia/'
for f, old, new in [('vita-boni-monachi/la/p1-00', 'Ue e devote clerice: attende senex WAV, o et parvule, doctrinam bonae P. vitae.', 'Audi devote clerice: attende senex et parvule, doctrinam bonae vitae.'),
                    ('epitaphium-monachorum/la/p1-05', 'DES te Domine virtus mea.', 'Diligam te Domine virtus mea.'),
                    ('epitaphium-monachorum/la/p1-03', 'NE me et salvus ero. WAL Stude', '[...] me et salvus ero. Stude'),
                    ('vita-boni-monachi/la/p1-01', 'Nf onache', 'Monache'), ('vita-boni-monachi/la/p1-01', 'JEN? quare', 'Quare')]:
    t = open(D + f + '.md').read()
    assert old in t, old
    open(D + f + '.md', 'w').write(t.replace(old, new, 1))
