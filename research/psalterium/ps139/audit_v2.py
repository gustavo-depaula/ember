"""Record the v2 Latinist gate in prayed.json's audit. Refuses to run twice."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already applied')
d['audit'].append({
    'step': 'latinist',
    'file': 'critic/v2.latinist.json',
    'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'Gate on v2: no majors, 1 minor, refused with a reason. Overall: close and literal; the hard readings (v. 9 *a desidério meo peccatóri*, v. 10 *caput circúitus eórum*, v. 14 *cum vultu tuo*) kept without smoothing toward the Hebrew; tenses, persons, moods and mediants preserved.',
    'outcomes': [{
        'verse': '139:5b',
        'remark': 'minor: *derrubar* blurs the heel-trip of *supplantáre*; *fazer tropeçar os meus passos*',
        'outcome': 'refused',
        'decision': 'supplant',
        'reason': 'v1 had *fazer tropeçar*; the stylist heard *tropeçar* (5b) and *tropeço* (6b, scándalum) as one root twice, which merges two Latin words the psalm keeps apart. *Derrubar* is the supplantáre row\'s verb, and with *gressus* it matches 36:31 *os seus passos não serão derrubados*, which passed its gate. Readers pulled both ways on a minor, so the row is held; *fazer tropeçar* stays as option 1.',
    }],
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
