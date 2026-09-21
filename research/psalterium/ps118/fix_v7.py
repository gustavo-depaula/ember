"""Draft 7, mended after its first checks run and BEFORE any critic read it (so still version 7):
two mediant/final rhymes the Latin does not have, removed by word order alone; the checks audit step.
Run once:  python3.13 research/psalterium/ps118/fix_v7.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 7 or any(s.get('file', '').endswith('part3.json') for s in data['audit']):
    sys.exit('expected version 7 before its critics')
V, C = data['verses'], data['choices']
byId = {d['id']: d for d in data['decisions']}

if '{jd_De}' not in V['118:102']:
    sys.exit('already applied')

# 118:92 — "meditação: * … humilhação." rhymed at mediant and final
V['118:92'] = '{nisi_quod}: * então, {humilitate}, talvez eu tivesse perecido.'
C['118:92'] += ' Order: "na minha humilhação" is moved inside the second colon, because with the Latin\'s order the verse rhymed at mediant and final (meditação … humilhação) — checks.py flagged it; the Latin has only the faint echo mea est … mea.'

# 118:102 — "apartei: * … lei." rhymed at mediant and final
V['118:102'] = 'Não me apartei {jd_gen}: * porque vós {legem_posuisti}.'
C['118:102'] += ' Order: natural order in the first colon ("Não me apartei dos vossos juízos"), because the Latin\'s order gave a rhyme at mediant and final (apartei … lei), flagged by checks.py.'
for o in byId['judicia']['options']:
    o['forms'].pop('jd_De')
byId['judicia']['latin'] = byId['judicia']['latin'].replace(' · A judíciis tuis', ' · a judíciis tuis')

for s in data['audit']:
    if s['step'] == 'draft' and s.get('version') == 7:
        s['note'] = s['note'].replace('41 new verse-local decisions', '43 new verse-local decisions')

data['audit'].append({'step': 'checks', 'note': 'Draft 7, via ps118/partial.py: hard checks pass (128 of 176 verses, ids and marks match). Two rhymes at mediant and final that the Latin does not have were removed by order alone before any reader saw the draft (118:92 meditação / humilhação; 118:102 apartei / lei). Accepted: neighbouring finals 118:111 / 118:112 (coração / retribuição — a suffix rhyme; both words are fixed by the glossary and each closes a one-phrase colon); and inside 118:111 "a exultação do meu coração" (exsultátio cordis mei — no other order is Portuguese). Length: long cola are nearly all "os vossos mandamentos" (accepted psalm-wide) or "pus toda a esperança" (118:81, 114; the decision of 118:43); 118:96b is +6 ("o vosso mandamento é amplo sobremaneira" for latum mandátum tuum nimis) against a first colon of −3 — the short option "é muito amplo" is in decision "latum96"; 118:95a +4 for the unmistakable "para me fazer perecer". Short cola (118:83b, 94b, 117b, −4/−5) are where "os vossos preceitos" stands for the seven syllables of justificatiónes tuas. 118:111 opens on "Adquiri", a first-person past that equals the vós imperative of adquirir: the reverse of rule 3\'s trap; left, because "acquire your testimonies by inheritance" is no sentence anyone would hear addressed to God.'})

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
