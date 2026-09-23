import json
from pathlib import Path
p = Path('research/psalterium/ps105/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'checks' for a in d['audit']):
    d['audit'].append({'step': 'checks', 'note': "Hard checks pass. Soft: length -6 at 105:31b (the D37 formula 'de geração em geração para todo o sempre' is shorter than the Latin), -5 at 105:29a ('invenções' for adinventiónibus), +5 at 105:19b ('imagem esculpida', the row, for scúlptile), +4 at 105:24a, 105:33b, 105:35b, 105:44a, 105:48b (the D41 formula), -4 at 105:4a, 105:15a, 105:39a, 105:43a; +3/-3 elsewhere — each one breath, accepted. Rhyme -ões at 105:27 (nações / regiões): the Latin's own echo (natiónibus / regiónibus), accepted."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
