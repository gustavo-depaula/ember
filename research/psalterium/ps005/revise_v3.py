"""Draft 2 -> draft 3 of Ps 5 (draft 2 is kept as prayed.v2.json). Run once."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
assert data['version'] == 2, 'already revised'
data['version'] = 3

adtemplum = next(d for d in data['decisions'] if d['id'] == 'adtemplum')
adtemplum['why'] += " Draft 2 had the gerund 'voltando-me para' (to avoid a gendered participle); the Latinist gate marked it major: it adds an action of turning that the Latin does not express."
gerund, participle, direction, calque, inside = adtemplum['options']
participle['label'] = 'no vosso temor adorarei voltado para o vosso templo santo'
participle['note'] = "Draft 3. The stylist's own line: 'voltado para' is a state, not an action — it says which way the worshipper faces, which is all that ad says — and it is how Portuguese says it. Cost, known and accepted: a masculine participle the Latin does not have. It was the reason for draft 2's gerund; but the praying voice of the Latin psalter is masculine wherever its grammar shows (6:3 infírmus sum is the next case), so the Portuguese cannot avoid it in general, and here the alternatives are an added action (refused by the Latinist) or a preposition the stylist heard as a route."
gerund['note'] = "Draft 2: the stylist's order and verb, as a gerund so that no gendered word is added. Refused in draft 3: the Latinist gate (major) — 'voltando-me' adds an action of turning round that the Latin does not express."
gerund['from'] = 'draft'
direction['label'] = 'no vosso temor adorarei em direção ao vosso templo santo'
direction['forms'] = {'adtemplum': 'no vosso temor adorarei em direção ao vosso templo santo'}
direction['note'] = "The Latinist's fix on draft 2: draft 1's preposition (Douay-Rheims 'towards') in the stylist's order. Faithful and genderless; the stylist heard 'em direção ao' as a route indication ('soa como indicação de percurso'). The fall-back if 'voltado' is not wanted."
direction['from'] = 'latinist'
adtemplum['options'] = [participle, direction, gerund, calque, inside]

data['audit'] += [
    {
        'step': 'checks',
        'note': "Draft 2: hard pass. 5:8b second colon now +5 ('voltando-me para'); 5:11b first colon −3; the other soft flags as in draft 1, accepted.",
    },
    {
        'step': 'latinist',
        'file': 'critic/v2.latinist.json',
        'note': "Draft 2. The stylist's five reorderings and 'o malvado' passed without remark — 5:13b's new construction included. One remark, major, on my own change to the stylist's line: 5:8b 'voltando-me' adds an action.",
        'outcomes': [
            {'verse': '5:8b', 'remark': "major: 'voltando-me' adds an action of turning that the Latin does not express; ad gives the direction of the worship → 'no vosso temor adorarei em direção ao vosso templo santo'", 'outcome': 'taken', 'decision': 'adtemplum', 'reason': "The fault is taken: the gerund goes. Of the two ways to mend it, draft 3 takes the stylist's participle of state ('voltado para', which adds no action) and keeps the Latinist's own wording as option 2, because the stylist had already refused 'em direção ao'. The gate is re-run on it."},
        ],
    },
    {
        'step': 'revision',
        'version': 3,
        'note': "v3. One change: 5:8b 'no vosso temor adorarei voltado para o vosso templo santo' (was 'voltando-me para'). Draft 2 is prayed.v2.json (flat text prayed.v2.vos.json, the file the v2 Latinist read).",
    },
]
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok, version', data['version'])
