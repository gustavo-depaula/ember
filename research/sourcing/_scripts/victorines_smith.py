"""Smith 1911 'Explanation of the Rule of St Augustine' (Hugh of St Victor) -> English book. usage: python3 -I victorines_smith.py"""
import json, re, shutil
from pathlib import Path
T = Path('research/sourcing/victorines/ia-smith/smith.txt').read_text(encoding='utf-8').split('\n')
ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
def paras(lines):
    out, cur = [], []
    for l in lines + ['']:
        s = re.sub(r'\s+', ' ', l).strip()
        if not s:
            if cur: out.append(' '.join(cur)); cur = []
        else:
            cur.append(s)
    res = []
    for p in out:
        p = re.sub(r'(\w)- (\w)', r'\1\2', p) if re.search(r'[A-Z]{2,}- [A-Z]', p) else p
        if re.fullmatch(r'[\d\sivxIVX.]+', p) or (p.upper() == p and len(p.split()) <= 9 and not p.endswith('.') and len(p) < 60): continue
        if 'Explanation of the Rule' in p and len(p) < 60: continue
        res.append(p)
    return res
starts = [i for i, l in enumerate(T) if re.match(r'^\s*CHAPTER\s+[IVX]+\s*$', l)]
pref = next(i for i, l in enumerate(T) if i > 150 and l.strip() == 'PREFACE') if False else 87
chs = [('Preface', paras(T[pref + 1:T.index('CONTENTS ') if 'CONTENTS ' in T else 188]))]
end_all = next(i for i, l in enumerate(T) if re.match(r'Printed\s+at', l.strip()))
for k, s in enumerate(starts):
    e = starts[k + 1] if k + 1 < len(starts) else end_all
    j = s + 1; title = []
    while T[j].strip() == '': j += 1
    while T[j].strip() != '': title.append(re.sub(r'\s+', ' ', T[j]).strip()); j += 1
    t = ' '.join(title).replace('COM- MUNITY', 'COMMUNITY'); t = re.sub(r'\b(\w)(\w*)', lambda m: m.group(1) + m.group(2).lower(), t)
    t = re.sub(r'\b(Of|The|And|To|In|On)\b', lambda m: m.group(1).lower(), t); t = t[0].upper() + t[1:]
    chs.append(('Chapter %s. %s' % (ROM[k + 1], t), paras(T[j:e])))
root = Path('content/books/hugh-of-st-victor-opera-omnia/expositio-in-regulam-smith')
if root.exists(): shutil.rmtree(root)
(root / 'en-US').mkdir(parents=True); (root / 'sources' / 'english-originals').mkdir(parents=True)
shutil.copy('research/sourcing/victorines/ia-smith/smith.txt', root / 'sources' / 'english-originals' / 'smith-1911.txt')
toc = []
for i, (t, ps) in enumerate(chs):
    cid = 'preface' if i == 0 else 'c%02d' % i
    (root / 'en-US' / (cid + '.md')).write_text('# %s\n\n%s\n' % (t, '\n\n'.join(ps)), encoding='utf-8')
    toc.append({'id': cid, 'title': {'en-US': t}})
    print(t[:70], sum(len(p.split()) for p in ps))
A = {'la': 'Hugo de Sancto Victore', 'en-US': 'Hugh of St. Victor', 'pt-BR': 'Hugo de São Vítor'}
meta = {'id': 'hugh-expositio-in-regulam-smith', 'cover': 'classic',
 'name': {'en-US': 'Explanation of the Rule of St. Augustine', 'pt-BR': 'Explicação da Regra de Santo Agostinho'},
 'author': A,
 'description': {'en-US': 'Dom Aloysius Smith’s English version (1911) of the commentary on the Rule of St. Augustine that tradition attributes to Hugh of St. Victor (doubtful in Migne), in twelve chapters, one for each chapter of the Rule. A separate book from the Latin Expositio in regulam, which divides the text differently.',
   'pt-BR': 'A versão inglesa de Dom Aloysius Smith (1911) do comentário à Regra de Santo Agostinho atribuído a Hugo de São Vítor, em doze capítulos, um para cada capítulo da Regra.'},
 'composed': 'c. 1130 (translation 1911)', 'languages': ['en-US'], 'work': 'hugh/expositio-in-regulam',
 'editions': {'en-US': {'translator': 'Dom Aloysius Smith', 'year': 1911}},
 'sources': [{'language': 'en-US', 'url': 'https://archive.org/details/explanationofthe00vicuoft',
   'edition': 'Explanation of the Rule of St. Augustine by Hugh of St. Victor, translated by Dom Aloysius Smith (London: Sands, 1911; Edinburgh: printed by the Edinburgh Press); archive.org OCR text.',
   'description': 'The preface and the twelve chapters of the translation. Running heads and page numbers are removed; the OCR carries a few slips. The translator’s contents list and any footnotes in the scan are not kept.',
   'tier': 'A', 'tierEvidence': 'Published in London in 1911, before 1931: public domain in the US.'}],
 'toc': toc}
(root / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
