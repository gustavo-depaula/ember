"""One-off: v2 notes on the checks.py soft flags, and the v2 checks audit step."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
c = d['choices']
c['45:18'] = c['45:18'].replace(
    " Both cola end on an oxytone (céus, moldou), which the brief allows.",
    " Both cola end on an oxytone (céus, modelador), which the brief allows. v2: colon 2 is +3 on the Latin, "
    "the cost of keeping plastes a noun with its possessive (decision plastes); accepted.")
c['45:23'] = c['45:23'].replace(" Colon 1 is +3 syllables on the Latin:", " Colon 1 is +4 syllables on the Latin (v2, with 'Nada'):")
d['audit'].append({
    'step': 'checks',
    'note': 'Draft 2: hard pass. Soft flags: length +4 at 45:21b, 45:23a (Nada added) and 45:30b; +3 at 45:18b (the noun '
            'o seu modelador); −3 at 45:24a and 45:27a. Each explained in choices and accepted.'})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
