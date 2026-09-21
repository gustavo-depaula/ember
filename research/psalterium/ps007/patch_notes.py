"""Notes only (no verse text changes): the Greek behind congregátio checked for 105:17–18. Safe to re-run."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
for d in data['decisions']:
    if d['id'] == 'synagoga':
        old = 'a merge on D15’s test only if the Greek is συναγωγή behind congregátio too, which was not checked for every place; 105:17–18, where they stand in neighbouring verses, will decide locally.'
        new = 'a merge on D15’s test: in 105:17–18, where congregatiónem and synagóga stand in neighbouring verses, the Greek has συναγωγή both times (read in consult/parallels/ps105.md), so the Latin’s variation there carries no difference of sense; the other places of congregátio (61:9, 67:31a, 73:2, 110:1) were not checked.'
        note = d['options'][0]['note']
        if old in note:
            d['options'][0]['note'] = note.replace(old, new)
            print('patched')
    if d['id'] == 'redimat':
        old = 'redímere has twelve verses (grep:'
        if old in d['why']:
            d['why'] = d['why'].replace(old, 'redímere has twelve verses with the present stem (grep:').replace('Not yet in the glossary.', 'Nine more have the perfect stem (30:6 redemísti me, Dómine, Deus veritátis; 70:23, 73:2, 76:15, 77:42, 105:10, 106:2, 135:24, 143:10). Not yet in the glossary.')
    if d['id'] == 'v5a':
        for o in d['options']:
            o['note'] = o['note'].replace('(‘pagarei os meus votos’, 21:26, 115:14)', '(‘pagarei os meus votos’, 21:26, 115:5, 115:9)')
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
