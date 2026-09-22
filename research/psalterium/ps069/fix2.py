import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
for x in d['decisions']:
    if x['id'] == 'deusvoc':
        x['why'] = x['why'].replace('the 69:6b colon', 'the 69:6 colon')
    if x['id'] == 'erubescere':
        x['why'] = x['why'].replace("69:3 has all three of the psalm's shame-words (with 69:4), so they must stay three.",
            "69:3–4 have all three (*confundántur et revereántur … erubéscant*), so they must stay three words.")
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
