"""Record the v2 Latinist gate and set the status of Ps 81. Run: python3.13 research/psalterium/ps081/finish.py"""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: one minor, 81:1 (*autem* as *e*, the supplied *deles*), held. Everything taken in v2 (*Arrancai*, *a face*, *e sois todos*, *em todas as nações*) passed; he named them Septuagintal idioms preserved.', 'outcomes': [
        {'verse': '81:1', 'remark': '*autem* flattened to *e*; *deles* narrows *in médio* to the gods (minor; repeated from v1, now with *deles* as the weight)', 'outcome': 'refused', 'decision': 'inmedio', 'reason': 'the assembly is the assembly of the gods, so *no meio deles* and *in médio* name one place; bare *no meio* hangs in Portuguese, and at the end of the stylist\'s order (*julga os deuses no meio*) worse; δέ continues the scene. His fix *e no meio julga os deuses* is option 4, *porém* option 5.'}]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
