"""Record the v2 Latinist gate in Ps 56's audit. Run once."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
f = here / 'prayed.json'
d = json.loads(f.read_text(encoding='utf-8'))
d['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'claude-opus-5-5 (fresh context), the gate on draft 2. No remarks, no major: the Septuagintal readings (*dedit in oppróbrium*, *dormívi conturbátus*, *incurvavérunt*, the address to glory, psaltery and harp) kept, nothing added or explained, pointing matches; *se engrandeceu* and *darei graças* within the latitude.',
    'outcomes': [],
})
f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
