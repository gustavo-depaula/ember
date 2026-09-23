"""Record the v2 Latinist gate in Ps 100's audit. Run from the repo root."""
import json

p = 'research/psalterium/ps100/prayed.json'
d = json.load(open(p, encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
o = dec['oculi']
if not any(x['label'].startswith('Os meus olhos estavam sobre') for x in o['options']):
    line = 'Os meus olhos estavam sobre os fiéis da terra, para se sentarem comigo'
    o['options'].insert(2, {'label': line, 'forms': {'oculi': line}, 'note': "the v2 gate's fix: the bare copula, 'sobre' as 33:16", 'from': 'latinist'})
    o['why'] += " v2 gate (minor): 'postos' is a participle beyond the bare copula; held — it belongs to the copula (eyes 'set on'), adds no sense the Latin lacks, and answers the stylist's fault; his 'estavam sobre' is option 3."
r = dec['direxit']
if 'v2 gate' not in r['why']:
    r['why'] += " v2 gate (minor, first raised at v2): asks 'não prosperou' for the intransitive sense; held — 58:5 'segui reto' renders the same Latin build, and 'seguir reto' keeps the image and both senses where 'prosperar' keeps one; DRB's word is option 3."
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Gate clean of majors; two minors, both held as options.', 'outcomes': [
        {'verse': '100:6', 'remark': "'postos' adds a participle beyond the copula; 'estavam sobre'", 'outcome': 'option', 'decision': 'oculi', 'reason': "The participle belongs to the copula and adds no sense; it answers the stylist's fault ('eyes in people')."},
        {'verse': '100:7', 'remark': "intransitive diréxit = prospered; 'não prosperou'", 'outcome': 'option', 'decision': 'direxit', 'reason': "58:5 'segui reto' for the same Latin; the image and both senses kept."},
    ]})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
