"""Ps 26 draft 1, before any critic read it: the decision `castra` takes the verb into its slot, so that the plural option agrees.
python3.13 research/psalterium/ps026/fix_castra.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
data['verses']['26:3'] = 'Se contra mim {castra}, * o meu coração não temerá.'
d = next(d for d in data['decisions'] if d['id'] == 'castra')
forms = ['se postar um acampamento', 'se postarem acampamentos', 'se postar um exército acampado']
for option, form in zip(d['options'], forms):
    option['forms'] = {'castra': form}
    option['label'] = form
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(data['verses']['26:3'])
