"""Record the v2 Latinist gate in Ps 60's audit."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
        'note': 'Gate on draft 2: 2 minor, no major; both refused for settled rulings. Every v2 change (60:3 order, 60:4 Vós me guiastes, 60:7 aos dias / de geração e geração, 60:8 Ele, 60:9 order) passed without remark.',
        'outcomes': [
            {'verse': '60:5', 'remark': 'velaméntum abstracted to abrigo; prótegar could be subjunctive; sob a cobertura', 'outcome': 'option', 'decision': 'velamento',
             'reason': 'σκέπη = 35:8 tegmen → abrigo (D15); the tegmen row refuses sob a cobertura (heard as a roof or insurance). The future matches inhabitábo and the Greek future σκεπασθήσομαι, which is not a wish.'},
            {'verse': '60:9', 'remark': 'in sǽculum sǽculi singular; pelo século do século', 'outcome': 'refused',
             'reason': 'D27 settled pelos séculos dos séculos; the Latinist has asked the singular before and it is held (number is grammar, D2).'},
        ]})
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
