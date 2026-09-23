"""Ps 224: record the v2 Latinist gate and mark the canticle reviewed (one-off)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['status'] = 'reviewed'
dec = {x['id']: x for x in d['decisions']}
dec['medio']['why'] += (" v2 Latinist (minor) asked 'no meio dele' back: the Latin leaves the sea unnamed. Held for the hearer: the sense is not changed, "
                        "and the pronoun is option 2 for Gustavo.")
d['audit'] = [a for a in d['audit'] if not (a['step'] == 'latinist' and a.get('version') == 2)]
d['audit'].append({'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': 'The gate on v2. Reader: claude-opus-5-5, fresh context, with latin.json. No majors. Two minors, both held as options. It found tenses, moods, persons, images and pointing faithful.',
    'outcomes': [
        {'verse': '15:7', 'remark': "'sopro' parts spíritus from 15:11 'espírito' (as v1)", 'outcome': 'option', 'decision': 'spiritu7',
         'reason': "Held as on v1. The reader calls it defensible. 'espírito do furor' is heard as a temper; 17:16 builds the image with 'sopro'."},
        {'verse': '15:22', 'remark': "'no meio do mar' names what the Latin's 'ejus' leaves unnamed", 'outcome': 'option', 'decision': 'medio',
         'reason': "Held. The v1 ambiguity reader could not hear who owns 'dele'. The sense is the sea (the reader agrees). 'no meio dele' is option 2."}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
