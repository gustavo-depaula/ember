"""Ps 224 v1: small fix at 15:14 and the checks audit step (one-off)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['verses']['15:14'] = 'E vós o levastes na vossa força * à vossa morada santa.'
d['choices']['15:14'] = "portáre → levar (90:12 'Nas mãos te levarão'). 'vós' supplied as subject (checks −4 without it). in fortitúdine tua → na vossa força. habitáculum → morada (D44); the adjective after, as the Latin ('habitáculum sanctum'). ad → 'à'."
d['audit'] = [a for a in d['audit'] if a['step'] != 'checks']
d['audit'].append({
    'step': 'checks',
    'note': "Hard pass (ids 15:1–15:22, marks as the Latin: one '*' per line, no † ‡). Soft flags: 15:14a was −4 → 'vós' supplied (now −3). Accepted: 15:8a +5 (a 6-syllable Latin colon; the participle 'fluens' needs a clause — 'Parou a onda que corria', +2, is option 2 of 'unda'); 15:4a +4 and 15:16a +4 (heuristic overcounts: 'como um', 'é o', 'perturbaram os', 'príncipes de Edom' elide when said; nothing added to the Latin); 15:21b +3 ('trazer de volta', 212's); 15:6 −3/−3, 15:10b −3, 15:19b −3 (nothing of the Latin left out). Rhyme flag 15:3 'glorificarei / exaltarei': the Latin's own parallel 'glorificábo / exaltábo', kept."
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
