"""Draft 13, mended after its first checks run and BEFORE any critic read it (so still version 13):
two rhymes the Latin does not have removed by word order, two lengths mended, and the checks audit step.
Run once:  python3.13 research/psalterium/ps118/fix_v13.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 13 or any(s.get('file', '').endswith('part4.json') for s in data['audit']):
    sys.exit('expected version 13 before its critics')
V, C = data['verses'], data['choices']
byId = {d['id']: d for d in data['decisions']}
if 'v163a' in byId:
    sys.exit('already applied')

# 118:163 — "abominei: * … lei." rhymed at mediant and final; the Latin has no echo (abominátus sum … diléxi)
V['118:163'] = '{v163a}: * mas amei a vossa lei.'
data['decisions'].append({
    'id': 'v163a', 'refs': ['118:163'], 'latin': 'Iniquitátem ódio hábui, et abominátus sum', 'kind': 'order',
    'why': 'The handoff set ódio hábui → "tive ódio", object first (118:113, 128), and draft 13 first read "À iniquidade tive ódio, e a abominei: * mas amei a vossa lei" — which rhymes at mediant and final (abominei … lei; checks.py flagged it) where the Latin has no echo. The final must be "lei" or "amei", and any first-person perfect before the asterisk rhymes with either; so the mediant has to fall on "iniquidade", which means both verbs come first and share one direct object. "Ter ódio a" cannot share an object with "abominar", so the plain verb is used here. It is the same root (ódio → odiei), one Greek verb stands behind odívi and ódio hábui alike (ἐμίσησα), and the periphrasis had come back at 118:113 and 128 only for the ear\'s sake — here the ear asks for the opposite.',
    'options': [
        {'label': 'Odiei e abominei a iniquidade', 'forms': {'v163a': 'Odiei e abominei a iniquidade'}, 'note': 'Ruled: the order of Douay-Rheims ("I have hated and abhorred iniquity") and Matos Soares 1932 ("Odiei e detestei a iniquidade"); mediant on a paroxytone, no rhyme with the final. abominári → abominar (glossary).', 'from': 'checks'},
        {'label': 'À iniquidade tive ódio, e a abominei', 'forms': {'v163a': '{odio163}, e a abominei'}, 'note': 'The periphrasis of 118:113 and 128, object first as the Latin; it follows decision "odio_habui". Rhymes abominei / lei at mediant and final.', 'from': 'draft'},
    ],
})
byId['odio_habui']['why'] += ' In 118:163 the text itself is ruled by decision "v163a" (a rhyme forced the plain verb there); the slot odio163 lives on in that decision\'s second option.'
C['118:163'] = 'Decision "v163a" (order, for a rhyme the Latin does not have); the periphrasis of decision "odio_habui" is its second option. abominári → abominar (glossary). autem → "mas". The assonance inside the second colon ("amei a vossa lei") is that of 118:113, already accepted.'

# 118:174 / 118:175 — neighbouring finals "meditação" / "auxiliarão"; the Latin has est / me
V['118:175'] = 'A minha alma viverá, e vos louvará: * e {adjuvabunt} {jd_acc}.'
C['118:175'] += ' Order: the verb before its subject in the second colon ("e me auxiliarão os vossos juízos"), because with natural order the verse closed on "auxiliarão" straight after 118:174\'s "meditação" — neighbouring finals rhyming where the Latin has none (checks.py).'

# 118:176 — first colon +5
for o in byId['periit']['options']:
    o['forms']['periit'] = o['forms']['periit'].replace('como uma ovelha', 'como ovelha')
    o['label'] = o['label'].replace('como uma ovelha', 'como ovelha')
C['118:176'] += ' "como ovelha", without the article (the first colon was +5 with it; the Latin has none to give).'

# 118:141 — both cola −4; the diminutive wants saying
adol = byId['adolescentulus']
order = {'muito jovem': 0, 'jovem': 1, 'pequeno': 2}
adol['options'].sort(key=lambda o: order[o['label']])
adol['options'][0]['note'] = 'Ruled (after the checks run: both cola of the verse were four syllables short with bare "jovem"): Douay-Rheims "very young", which is Lewis & Short\'s gloss word for word — the diminutive is said. Cost: one more "muito" in a psalm that spends it on nimis and veheménter.'
adol['options'][1]['note'] = 'The word of 118:9, bare: the diminutive goes unsaid, and the colon is short.'

data['audit'].append({'step': 'checks', 'note': 'Draft 13, via ps118/partial.py (which now reports the whole psalm: 176 of 176; its progress line raised IndexError on a complete psalm and was made conditional — nothing else in it changed): hard checks pass, ids and marks match the Latin in all 176 verses. Mended before any reader saw the draft: 118:163 rhyme at mediant and final (abominei / lei) → both verbs first, decision "v163a"; 118:174 / 175 neighbouring finals (meditação / auxiliarão) → the verb moved before its subject in 118:175; 118:176a +5 → "como ovelha" without the article (+3); 118:141 both cola −4 → "muito jovem" (the diminutive said). Accepted: 118:154 "resgatai-me … vivificai-me" at mediant and final — the Latin has the same echo (rédime me … vivífica me), rule 5\'s exception. Long cola (+3/+4) are the psalm-wide cost of "os vossos mandamentos" and of the formulas (118:134b = 146b, 147b "pus toda a esperança", 151b, 168b, 172b) or a verb of motion with its complement (118:148a "se adiantaram para vós ao amanhecer", 19 syllables for the Latin\'s 15 — sayable in one breath, watched). Short cola (118:129b, 141b, 155b, 167b; −3/−4) are where "os vossos preceitos" or a plain "muito" stands for a long Latin word (justificatiónes, veheménter); short is easier on a psalm tone than long, left.'})

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
