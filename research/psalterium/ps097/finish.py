"""Record the v2 Latinist gate in ps097's audit and mark it reviewed (idempotent)."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on v2, claude-opus-5-5, fresh context, with latin.json. No major. One minor, repeated from v1: 97:8 *manu*; held with the option (reason below). He passed the three v2 changes (97:1b *para si*, 97:5 articles, 97:8 *juntos* after the verb) without remark.",
        "outcomes": [
            {"verse": "97:8", "remark": "manu unexpressed: baterão palmas com a mão", "outcome": "option", "decision": "plaudent",
             "reason": "D43's idiom already holds the hands in *palmas*; *baterão palmas com a mão* is a redundant line no one says, and the singular is idiom in the Latin and the Greek alike; *aplaudirão com a mão* remains the option"}]})
    for dec in d['decisions']:
        if dec['id'] == 'plaudent':
            dec['why'] += " v2 gate: asked again (*baterão palmas com a mão*), minor; held."
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
else:
    print('already recorded')
