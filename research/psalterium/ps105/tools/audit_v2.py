import json
from pathlib import Path
p = Path('research/psalterium/ps105/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already')
dec = {x['id']: x for x in d['decisions']}
dec['cito']['options'].append({'label': 'Depressa fizeram,', 'forms': {'cito': 'Depressa fizeram,'}, 'note': "the v2 Latinist; 'fazer' without its object is not Portuguese", 'from': 'latinist'})
dec['cito']['why'] += " Gate (v2 Latinist, minor): asked 'Depressa fizeram' and the comma — held: the bare transitive is ungrammatical, and the ambiguity reader could not place 'o' until the colon."
dec['distinxit']['why'] += " Gate (v2 Latinist, minor): asked 'distinguiu' — held under the 65:13 row; already an option (DRB)."
dec['infecta']['why'] += " Gate: the plural asked again — held, D29."
dec['dedit']['why'] += " Gate (v2 Latinist, minor): called 'fez que achassem' a paraphrase and asked 'E os entregou às misericórdias' — held: the word-for-word build was heard by the blind reader as its opposite, and 'entregar' is trádere's (105:41). His form added as an option. For Gustavo."
dec['dedit']['options'].append({'label': 'E os entregou às misericórdias', 'forms': {'dedit': 'E os entregou às misericórdias'}, 'note': "the v2 Latinist; trádere's verb; risk of 'at their mercy'", 'from': 'latinist', 'warn': True})
d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Gate: claude-opus-5-5, fresh context, with latin.json. No major; four minors, all held with reasons (three repeat v1).',
  'outcomes': [
    {'verse': '105:13', 'remark': "'o' added; 'Depressa fizeram'", 'outcome': 'option', 'decision': 'cito', 'reason': 'fazer needs an object in Portuguese; rule 2.'},
    {'verse': '105:33', 'remark': "'distinguiu'", 'outcome': 'option', 'decision': 'distinxit', 'reason': '65:13 row (the same Greek).'},
    {'verse': '105:39', 'remark': "plural 'sangues'", 'outcome': 'refused', 'decision': 'infecta', 'reason': 'D29.'},
    {'verse': '105:46', 'remark': "paraphrase; 'E os entregou às misericórdias'", 'outcome': 'option', 'decision': 'dedit', 'reason': "the literal build was heard as the captors' mercy; entregar is trádere's."}]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(d['verses']), 'verses', len(d['decisions']), 'decisions')
