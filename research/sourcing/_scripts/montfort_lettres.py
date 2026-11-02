import sys, re
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts/migne')
from core import *
from mkbook import make
PL = open('/tmp/mf/pauvert.txt', encoding='utf-8').read().split('\n')
D = ROOT / 'content/books/montfort-lettres'

def find(rx, a, b, last=False):
    xs = [i for i in range(a, b) if re.search(rx, PL[i])]
    return xs[-1] if last else xs[0]

def seg(a, b):
    ls = [l for l in PL[a:b + 1] if not re.fullmatch(r'\s*[—-]\s*\d+\s*[—-]\s*', l)]
    ps = clean_paras(blocks(ls))
    return [p.strip('«» ') if False else p for p in ps]

# 1-indexed line numbers of the text file -> 0-indexed here
L1 = (4081, 4156)
L2a = find(r'Le\s+5\s+juillet\s+1701', 4650, 4700) + 1
L2b = find(r'indigne\s+de\s+J', 4700, 4720) 
L3 = (4860, find(r'indigne', 4900, 4915) + 1)
sal = next((i for i in range(5008, 5030) if PL[i].strip().startswith('Monsieur')), 5027)
L4 = (sal, 5167)
L5 = (5500, 5531)
L6a = find(r'27\s+octobre\s+1703', 5530, 5545)
L6 = (L6a, 5560)
L7 = (5566, 5591)
L8 = (5617, 5659)
print(L1, (L2a, L2b), L3, L4, L6)
items = [
 ('À M. Léchassier, 6 novembre 1700', L1), ('À M. Léchassier, 5 juillet 1701', (L2a, L2b)), ('À M. Léchassier, Poitiers, 3 novembre 1701', L3),
 ('À M. Léchassier, depuis l’hôpital de Poitiers', L4), ('À sa sœur Louise, novice à Rambervillers (félicitations)', L5),
 ('À sa sœur Louise, 27 octobre 1703', L6), ('À sa sœur Louise, malade pendant son noviciat', L7), ('À sa sœur Louise, après ses vœux (1704)', L8)]
parts = []
for t, (a, b) in items:
    parts += [f'## {t}'] + seg(a, b)
w = write_md(D / 'fr-FR/lettres-choisies.md', 'Lettres citées dans la Vie de Pauvert', parts)
# testament
t0 = find(r'«\s+Je,\s+soussigné', 18590, 18610)
t1 = find(r'(Montfort|MONTFORT)', t0 + 40, t0 + 200)
print('testament', t0, t1)
tp = seg(t0, t1 + 2)
w2 = write_md(D / 'fr-FR/testament.md', 'Testament (27 avril 1716)', tp)
print(w, w2)
from olier_meta import tr
M = tr('Saint Louis-Marie Grignion de Montfort', 'St. Louis-Marie Grignion de Montfort', 'São Luís Maria Grignion de Montfort')
name = tr('Lettres choisies et Testament', 'Selected Letters and Testament', 'Cartas escolhidas e Testamento')
desc = tr('Huit lettres de saint Louis-Marie (à son directeur M. Léchassier et à sa sœur Louise, religieuse du Saint-Sacrement), et son Testament de 1716, telles que les cite Pauvert dans sa Vie du vénérable L.-M. Grignion de Montfort (1875).', 'Eight letters of St. Louis-Marie (to his director M. Léchassier and to his sister Louise, a Blessed Sacrament nun) and his Testament of 1716, as quoted in Pauvert’s Life of the Venerable L.-M. Grignion de Montfort (1875).', 'Oito cartas de são Luís Maria (a seu diretor M. Léchassier e à sua irmã Luísa, religiosa do Santíssimo Sacramento) e seu Testamento de 1716, tais como as cita Pauvert na Vida do venerável L.-M. Grignion de Montfort (1875).')
src = [{'language': 'fr-FR', 'url': 'https://archive.org/details/vieduvnrable00pauv', 'edition': 'C. Pauvert, Vie du vénérable Louis-Marie Grignion de Montfort, Poitiers: Oudin, 1875; archive.org OCR, letters and Testament extracted from the narrative.', 'description': 'Only the letters and the Testament that Pauvert prints in full are extracted (8 of the 34 known letters). OCR cleaned by script; Pauvert’s 19th-century readings of the autographs may differ from the critical text.', 'tier': 'A', 'tierEvidence': 'Montfort d. 1716; the 1875 life is public domain.'}]
toc = [{'id': 'lettres-choisies', 'title': {'fr-FR': 'Lettres citées dans la Vie de Pauvert'}}, {'id': 'testament', 'title': {'fr-FR': 'Testament (27 avril 1716)'}}]
print(make(D, 'montfort-lettres', 'montfort/lettres', name, M, desc, '1700–1716', {'fr-FR': {'editor': 'Charles Pauvert', 'year': 1875}}, src, toc=toc))
