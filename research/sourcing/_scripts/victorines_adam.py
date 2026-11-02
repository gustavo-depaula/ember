"""Adam of St Victor: Sequentiae (PL 196 col. 1423ff, Corpus Corporum text 6466) as verse chapters. usage: python3 -I victorines_adam.py"""
import re, sys
sys.path.insert(0, 'research/sourcing/_scripts')
from victorines_lib import *
from victorines_hugh import N, D
from bernard_common import clean_inline

F = 'research/sourcing/victorines/cc/w6466.xml'
x = open(F, encoding='utf-8').read()
x = x[x.index('<text>'):]
nodes = []
for div in re.split(r'<div1>', x)[1:]:
    m = re.search(r'<head>(.*?)</head>', div, re.S)
    head = clean_title(clean_inline(m.group(1)))
    head = re.sub(r'^([IVXLC]+)\.?\s+', lambda mm: '%s. ' % mm.group(1), head)
    body = div[m.end():]
    paras = []
    for pm in re.finditer(r'<p>(.*?)</p>', body, re.S):
        p = pm.group(1)
        if '<l' in p:
            lines = [clean_inline(l) for l in re.findall(r'<l[^>]*>(.*?)</l>', p, re.S)]
            paras.append('  \n'.join(l for l in lines if l))
        else:
            t = clean_inline(p)
            if t: paras.append(t)
    head = re.sub(r'\b(\w)(\w*)', lambda mm: mm.group(0) if mm.group(0) in ('I','II') else mm.group(1).upper() + mm.group(2), head)
    head = re.sub(r'\b(De|In|Et|Alia|Ad)\b(?!\.)', lambda mm: mm.group(1).lower() if mm.start() > 6 else mm.group(1), head)
    nodes.append({'kind': 'ch', 'title': head, 'paras': paras})
print(len(nodes), sum(len(' '.join(n['paras']).split()) for n in nodes))
# intro paragraphs (Migne's Latin notes) precede the verse; keep them as a leading italic-free note block
for n in nodes:
    ps = n['paras']
    i = next((k for k, p in enumerate(ps) if '  \n' in p), 0)
    n['paras'] = ps
d = write_book('adam', 'sequentiae', [F], N('Sequentiae', 'Sequences', 'Sequências'),
  D('Sequentiae Adami de Sancto Victore: triginta et sex prosae de temporali et sanctorali, cum annotationibus Migne.',
    'The sequences (proses) attributed to Adam of St. Victor in Migne, thirty-six liturgical poems for the feasts of the Lord and of the saints, each with the Latin editor’s note on its rhythm and occasion. One verse to a line.',
    'As sequências atribuídas a Adão de São Vítor por Migne, trinta e seis poemas litúrgicos para as festas do Senhor e dos santos, cada um com a nota do editor sobre o seu ritmo e ocasião. Um verso por linha.'),
  'c. 1130-1170', nodes)
print(d)
