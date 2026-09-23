"""ps086: record the v2 Latinist gate in prayed.json (idempotent)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    homo = next(x for x in d['decisions'] if x['id'] == 'homo')
    homo['options'].insert(1, {
        "label": "Nasceu nela homem e homem",
        "forms": {"homo": "Nasceu nela homem e homem"},
        "note": "The v2 Latinist's (minor): the bare repetition, no 'um … outro'. Held as an option: a Portuguese subject of two bare singular nouns with no determiner is barely a sentence, and 'um … outro' is the least Portuguese needs (grammar, D2); every Vulgate witness supplies something (DRB 'this man and that man').",
        "from": "latinist"})
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on draft 2 (claude-opus-5-5, fresh context, with latin.json): no major; one minor, held with an option. He passed the v2 changes (86:4b order, 86:6 'daqueles que', 86:7 'Como de').",
        "outcomes": [{"verse": "86:5", "remark": "'outro' is an addition to 'homo, et homo'; 'Homem e homem nasceu nela'", "outcome": "option", "decision": "homo",
                      "reason": "Bare 'homem e homem' as a subject lacks the determiner Portuguese grammar needs; 'um … outro' is grammar under D2, not an interpretation of the idiom; kept as option 2."}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(d['decisions']), 'decisions')
