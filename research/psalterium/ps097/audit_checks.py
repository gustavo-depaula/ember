"""Append the v1 checks step to ps097's audit (idempotent)."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'checks' for a in d['audit']):
    d['audit'].append({"step": "checks", "note": "v1: hard checks pass. Soft flags accepted: 97:3 second colon +4 (*para com*, for the dative's sense; *à casa* is the Latin's length and option 1 of `domui`); 97:5 first colon +5 (*entoar salmos*, D25's two words for *psállite*, and the article with *cítara* as everywhere in the psalter) and second colon +4 (*de metal batido*; *de metal* saves two, option 1 of `ductilibus`) — both still one breath each on a long verse; 97:8 second colon −3 (= 95:12b, word for word); 97:9 first colon −4 (D30: *orbem terrárum* is *o mundo*)."})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
