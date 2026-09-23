"""Record the v2 Latinist gate in ps216's audit and mark the canticle reviewed (idempotent).
python3.13 research/psalterium/ps216/gate2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')

s = next(x for x in d['decisions'] if x['id'] == 'salvatur')
s['options'][1]['note'] += " The v2 Latinist gate (minor) asked it back for the voice. It is held as the option; see the audit."

d['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Gate on v2. Reader: claude-opus-5-5, fresh context, with latin.json. Two minors, no majors; pointing correct. Both are held as written, with the reasons recorded.',
    'outcomes': [
        {'verse': '36:10', 'remark': "qui salvátur is passive; escapa is active and narrows it; asks quem se salva back", 'outcome': 'option', 'decision': 'salvatur',
         'reason': ("He grants that the sense, the survivor, is right. *Quem se salva* is reflexive and so is not the passive either. The ambiguity reader heard it as "
                    "'whoever is saved' in the religious sense, a curse on the saved, and that misreading costs more in a prayer than the voice does. "
                    "The v1 Latinist had passed *se salva*, so the two readers split. Held for Gustavo, with *quem se salva* as option 2.")},
        {'verse': '36:11', 'remark': "inimicórum as noun or adjective; príncipes inimigos reads as the adjective; offers príncipes dos inimigos, noted only", 'outcome': 'refused',
         'reason': ("He calls it defensible and noted it only. *Príncipes inimigos* keeps some of the openness: they are the enemies' princes, and they are hostile. "
                    "*dos príncipes dos inimigos* stacks two *dos* in a short colon.")},
    ],
})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded; status reviewed')
