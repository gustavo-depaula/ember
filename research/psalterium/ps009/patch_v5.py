"""Draft 5, before any critic read it: 9:36 accidental rhyme malvado / encontrado (checks.py) → 'e não se encontrará'.
python3.13 research/psalterium/ps009/patch_v5.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
assert data['version'] == 5
old = 'o pecado dele será buscado, e não será encontrado.'
if old in data['verses']['9:36']:
    data['verses']['9:36'] = data['verses']['9:36'].replace(old, 'o pecado dele será buscado, e não se encontrará.')
    data['choices']['9:36'] = ('quǽrere → buscar; inveníre → encontrar; both futures passive, the second as the pronominal passive (‘não se encontrará’): '
                               '‘não será encontrado’ rhymed with ‘malvado’ at the mediant (checks.py), a rhyme the Latin does not have.')
    data['audit'].append({'step': 'checks', 'note': 'Draft 5, whole psalm, the ordinary checks.py: exit 0 (hard pass: 42 ids, marks). Before the critics: 9:36 had the rhyme malvado / encontrado at mediant and final → ‘e não se encontrará’. Soft flags accepted: 9:19 ‘sempre … sempre’ (the Latin’s in finem twice, moved to the mediant by the stylist’s order); 9:23 first colon +8 (the heaviest line of the psalm: ‘se ensoberbece’ and the passive ‘é abrasado’ — left for the stylist to weigh); 9:27b −5 and 9:26b −4 (Latin polysyllables); 9:30b first colon +4 (the emboscada family); 9:31 first colon −4; 9:39 first colon +4 (‘em favor do’). Cadence: no flag.'})
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('patched')
else:
    print('nothing to do')
