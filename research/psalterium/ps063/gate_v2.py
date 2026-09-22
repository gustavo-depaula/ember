"""Ps 63: record the v2 Latinist gate and make draft 3 (draft 2 kept as prayed.v2.json)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
o = dec['scrutinio']['options']
o.insert(0, {'label': 'no sondar', 'forms': {'scrutinio': 'no {scrutInf}'}, 'note': 'v3 ruling — the Latinist at the v2 gate: *seu* is not in the Latin; the bare ablative', 'from': 'latinist'})
dec['scrutinio']['why'] += " **v3:** the gate (minor) found *seu* added; *no sondar* taken — the article and infinitive alone, as the bare ablative."
o = dec['narraverunt']['options']
first = o[0]
drafted = next(x for x in o if x['forms']['narraverunt'] == 'Narraram como esconderiam')
drafted['note'] = "draft 1; the v2 gate asked for it back (minor) after the v1 Latinist had asked it away"
dec['narraverunt']['why'] += " **v2 gate:** the Latinist now asks for draft 1's *como* (minor) — the opposite of the v1 run's fix. Held at *que*: the two runs contradict each other, both are minor, and neither Portuguese construction is the Latin's *ut* exactly; *que esconderiam* is DRB's 'talked of hiding', *como* is 'how'. For Gustavo's ear; one touch."
d['version'] = 3
d['audit'] += [
 {'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context)', 'note': 'The gate on draft 2, with latin.json: 2 minor, no major. One taken, one held (the runs contradict).', 'outcomes': [
  {'verse': '63:6b', 'remark': '*que esconderiam* makes the ut-clause an indirect statement; *como esconderiam*', 'outcome': 'option', 'decision': 'narraverunt', 'reason': 'the v1 Latinist asked the opposite (*como* → *que*); held at *que*, *como* one touch away'},
  {'verse': '63:7', 'remark': '*seu* not in the Latin; *no sondar*', 'outcome': 'taken', 'decision': 'scrutinio'}]},
 {'step': 'revision', 'version': 3, 'note': 'v3: 63:7 *no seu sondar* → *no sondar* (the gate). No critic has read v3; the change removes one word the gate asked away. Script: gate_v2.py.'}]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
