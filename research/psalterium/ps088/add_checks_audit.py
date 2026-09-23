"""Ps 88 helper: append the v1 checks audit step and the 88:12 rhyme note to prayed.json."""
import json, pathlib

p = pathlib.Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
d['choices']['88:12'] += " Rhyme *fundastes … criastes* accepted (checks): it is the Latin's own parallel *tu fundásti … tu creásti*."
if not any(a['step'] == 'checks' for a in d['audit']):
    d['audit'].append({"step": "checks", "note": "Hard pass. Soft flags accepted: 88:2b and 88:5 −6 (the formula *de geração em geração* is shorter than the Latin's); 88:4b +4 (*para todo o sempre*, D37); 88:9b +3 and 88:25a +4 (copula *está / estarão* and articles supplied); 88:15 +3/+4 (*irão diante da*, *bem-aventurado*); 88:16a −3; 88:22a −4 (*ajudará* is shorter than *auxiliábitur*); 88:30a +5 (*pelos séculos dos séculos*, the formula); 88:31b −4, 88:35b −4, 88:44b −3, 88:51a −3 (the Portuguese is complete); 88:36 +4/+5 (the oath made explicit, *permanecerá*); 88:42b +3; 88:47a +3 (D27 formula); 88:53b +4 (D41 *assim seja*); 88:12 rhyme (the Latin's parallel)."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
