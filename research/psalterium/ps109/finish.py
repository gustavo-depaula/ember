"""Record the v2 Latinist gate in the audit (idempotent)."""
import json

p = 'research/psalterium/ps109/prayed.json'
d = json.load(open(p, encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        'step': 'latinist', 'file': 'critic/v2.latinist.json',
        'model': 'claude-opus-5-5 (fresh context, with latin.json)',
        'note': "v2 gate: no major, one minor. Overall: 'a close, faithful rendering: every clause, tense, person and image of the Latin is kept'. The supplied *está* was judged within the working rule.",
        'outcomes': [{
            'verse': '109:6', 'remark': "na terra de muitos fixes multórum to terra (the heads of many is possible); the reader himself says 'keep as is'",
            'outcome': 'refused',
            'reason': "The Latin's word order is kept, which leaves *de muitos* where the Latin leaves *multórum*. The v1 Latinist named it as unresolved, and DRB does the same. Moving it (*as cabeças de muitos*) would choose MS1932's reading.",
        }],
    })
    d['audit'].append({'step': 'finish', 'note': 'Glossary: 14 rows given evidence, 4 new term rows (conquassáre, lucíferum, implére ruínas, Melchísedech), 2 formula rows (109:1, 109:4). PROGRESS row added. Scripts: revise.py, finish.py, glossary_rows.json, progress_insert.py.'})
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('audit updated')
else:
    print('already recorded')
