import json
from pathlib import Path
p = Path('research/psalterium/ps105/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
V = d['verses']
dec = {x['id']: x for x in d['decisions']}
def slot(vid, old, name):
    assert V[vid].count(old) == 1, (vid, old)
    V[vid] = V[vid].replace(old, '{' + name + '}')
slot('105:32', 'foi maltratado', 'vexatus')
slot('105:24', 'tiveram em nada', 'pro_nihilo')
slot('105:31', 'contado', 'reputatum')
slot('105:41', 'e os dominaram', 'proclisis')
forms = {
 'vexatus': ['foi maltratado', 'foi afligido', 'foi castigado'],
 'pro_nihilo': ['tiveram em nada', 'tiveram por nada', 'desprezaram'],
 'reputatum': ['contado', 'atribuído', 'imputado'],
 'proclisis': ['e os dominaram', 'e dominaram-nos'],
}
for k, fs in forms.items():
    for o, f in zip(dec[k]['options'], fs):
        o['forms'] = {k: f}
dec['proclisis']['why'] += ' The slot sits on 105:41 (the worst case); the other refs follow the same ruling.'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
