"""Record the v2 Latinist gate for Ps 72 in prayed.json's audit."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
d['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'Gate on draft 2: no major, 6 minors, all held as options (five asked at v1 too). The v2 fixes (72:4, 72:12, 72:13, 72:18, 72:23, 72:25) passed without remark.',
    'outcomes': [
        {'verse': '72:6', 'remark': 'tenuit a state; a soberba os prendeu', 'outcome': 'option', 'decision': 'tenere', 'reason': 'asked at v1 (*reteve*); one verb for ténuit / Tenuísti (ἐκράτησεν / ἐκράτησας) is the psalm\'s turn, and his two fixes (*prendeu*, *Segurastes*) break it. Options 2–3.'},
        {'verse': '72:24', 'remark': 'tenuisti held; Segurastes', 'outcome': 'option', 'decision': 'tenere', 'reason': 'as 72:6; *segurar* for both is option 2, weak at 72:6. For Gustavo.'},
        {'verse': '72:7', 'remark': 'singular affectum; ao afeto', 'outcome': 'option', 'decision': 'affectus', 'reason': 'asked at v1; the singular is heard as fondness. Option 2.'},
        {'verse': '72:10', 'remark': 'hic locative; aqui', 'outcome': 'option', 'decision': 'hic', 'reason': 'asked at v1; *se voltará aqui* is not Brazilian with a verb of turning. Option 2.'},
        {'verse': '72:17', 'remark': 'plural novissimis; as últimas coisas deles', 'outcome': 'option', 'decision': 'novissimis', 'reason': 'asked at v1; option 2.'},
        {'verse': '72:28b', 'remark': 'praedicatio narrowed; todas as vossas proclamações', 'outcome': 'option', 'decision': 'praedicationes', 'reason': 'he calls *louvores* defensible; αἰνέσεις, DRB and MS1932 agree. Option 2.'},
    ],
})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
