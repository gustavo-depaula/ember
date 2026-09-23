"""v1 slot restructure: qui slots carry only the pronoun; fines carries its verb."""
import json
from pathlib import Path
p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
v = d['verses']
v['147:4'] = '{q4} envia à terra {eloquium}: * depressa corre a sua palavra.'
v['147:5'] = '{q5} dá a neve como lã: * espalha a névoa como cinza.'
v['147:8'] = '{q8} anuncia a sua palavra a Jacó: * {justitias} e os seus juízos a Israel.'
for dec in d['decisions']:
    if dec['id'] == 'qui':
        dec['options'] = [
            {"label": "Ele pôs … Ele envia … Ele dá … Ele anuncia", "forms": {k: "Ele" for k in ("q3", "q4", "q5", "q8")}, "note": "draft — 65:9, 134:10", "from": "draft"},
            {"label": "É ele que pôs … É ele que envia …", "forms": {k: "É ele que" for k in ("q3", "q4", "q5", "q8")}, "note": "MS1932 ('Foi ele que … É ele que'); two syllables longer in each colon", "from": "MS1932"},
            {"label": "Que pôs … Que envia …", "forms": {k: "Que" for k in ("q3", "q4", "q5", "q8")}, "note": "the Latin's relative; heard as a question at the head of a verse", "from": "draft"},
        ]
    if dec['id'] == 'fines':
        for o, f in zip(dec['options'], ["pôs a paz nas tuas fronteiras", "fez das tuas fronteiras a paz", "pôs a paz nos teus confins"]):
            o['forms'] = {"fines": f}
            o['label'] = f
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
