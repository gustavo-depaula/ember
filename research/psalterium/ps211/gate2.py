"""Record the v2 Latinist gate in ps211/prayed.json (run once)."""
import json
from pathlib import Path

path = Path(__file__).parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
d['audit'].append({
    'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': 'Draft 2, claude-opus-5-5 in a fresh context with latin.json (run by the coordinator). No majors; one minor, the same as v1 (ínclitum). It called the rendering faithful and complete, every item of the lists kept in order and number, and passed "damos graças" as a legitimate sense of confitéri. Gate clean of majors.',
    'outcomes': [
        {'verse': '29:13', 'remark': 'ínclitum is renowned/illustrious, not glorious; glorioso blurs it with glória (29:11, 29:12); asks "o vosso nome ilustre"', 'outcome': 'option', 'decision': 'inclitum',
         'reason': 'Held a second time, and flagged for Gustavo because two readings raised it. "glorious" is among L&S\'s senses of inclutus and is DRB\'s word; it is what the CNBB Liturgia das Horas and the Brazilian Lectionary say at this line; "ilustre" (option 2, his fix) is heard as social rank in current Brazilian use. The echo with glória is the cost the draft named; ínclitus and gloriósus never meet in the Latin.'},
    ],
})
d['status'] = 'reviewed'
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
