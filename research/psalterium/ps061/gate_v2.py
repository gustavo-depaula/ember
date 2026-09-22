"""Record the v2 Latinist gate in Ps 61's audit."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
        'note': 'Gate on draft 2, read with latin.json: 3 minor, no major; all held as options. The v1 major (61:7) is answered: *não partirei* passed without remark, as did 61:4 *que pende*, 61:6 order and 61:10 *para que eles mesmos … enganem*.',
        'outcomes': [
            {'verse': '61:3', 'remark': 'Nam et: the et unrendered; Pois também ele mesmo é', 'outcome': 'option', 'decision': 'namet',
             'reason': '*também* was heard as \'he too, besides other gods\' by the stylist and the blind reader; *mesmo* carries the stress of *et ipse*. His wording would bring the misreading back and lengthen the colon; draft 1\'s *Pois também ele é* is option 2.'},
            {'verse': '61:7', 'remark': 'adjútor → auxílio collapses adjutor / auxilium (61:8); o meu ajudador', 'outcome': 'option', 'decision': 'adjutor',
             'reason': 'the uniform row (D24), open for Gustavo; asked at v1 too.'},
            {'verse': '61:9', 'remark': 'Deus adjútor noster; o nosso ajudador', 'outcome': 'option', 'decision': 'adjutor', 'reason': 'as 61:7.'},
        ]})
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
