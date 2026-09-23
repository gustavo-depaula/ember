import json, sys
p = sys.argv[1]
d = json.load(open(f'research/psalterium/ps{p}/prayed.json'))
g = json.load(open(f'research/psalterium/ps{p}/critic/v3.latinist.json'))
ids = [v['id'] for v in json.loads(g['reply'])['verses']]
print('version', d['version'], 'status', d['status'])
for vid in ids:
    print('VERSE', vid, d['verses'].get(vid))
print('--- decisions')
for dec in d['decisions']:
    print(dec['id'], dec['refs'], '|', ' / '.join(o['label'] for o in dec['options']))
print('--- choices for gate verses')
for vid in ids:
    if vid in d.get('choices', {}):
        print(vid, d['choices'][vid])
print('--- prior outcomes on gate verses')
for a in d['audit']:
    for o in a.get('outcomes', []) or []:
        if not isinstance(o, dict):
            continue
        v = o.get('verse') or o.get('id')
        if any(v and (v == i or v.startswith(i) or i.startswith(v)) for i in ids):
            print(a.get('step'), a.get('file', ''), json.dumps(o, ensure_ascii=False))
print('--- why of decisions on gate verses')
for dec in d['decisions']:
    if any(r in ids for r in dec['refs']):
        print('#', dec['id'], dec['refs'], dec.get('why'))
        for o in dec['options']:
            print('    -', o['label'], '|', o.get('note', ''), '|', o.get('from', ''))
