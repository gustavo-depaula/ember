"""Apply the v2 Latinist gate to ps067/prayed.json (after build_v2.py).
Run: python3.13 research/psalterium/ps067/build_gate.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in p['decisions']}

d = dec['etenim']
row = next(o for o in d['options'] if o['label'] == 'pois')
d['options'].remove(row)
row['note'] = 'final — the glossary row (gate: *até* adds an "even" the Latin does not carry)'
d['options'].insert(0, row)
d['options'][1]['note'] = 'draft 2 — the stylist\'s *pois também* complaint answered with *até*; the gate refused the added "even"'
d['why'] += ' Gate: *até* (draft 2) adds an "even"; the row\'s bare *pois* in all three places answers both the stylist (no *também*) and the gate.'

p['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'Gate: 7 minor, no major, no critical. 2 taken (one decision), 5 refused with reasons; nothing held.',
    'outcomes': [
        {'verse': '67:9', 'remark': '*até* adds "even"; *pois os céus*', 'outcome': 'taken', 'decision': 'etenim'},
        {'verse': '67:19b', 'remark': '*até* adds "even"; the participle made imperfect; *Pois os que não creem*', 'outcome': 'taken', 'decision': 'etenim',
         'reason': '*até* dropped; *acreditavam* kept — *creem/criam* were heard as *criar* by two v1 readers, and the past follows 67:19a'},
        {'verse': '67:13', 'remark': '*cabe* supplies a verb', 'outcome': 'refused', 'decision': 'speciei',
         'reason': 'as v1: the bare dative + infinitive is unsayable and was not understood even with *cabe*; option 2'},
        {'verse': '67:14', 'remark': '*o seu dorso, por trás* loses the noun phrase; *a parte de trás do seu dorso*', 'outcome': 'refused',
         'reason': 'that was draft 1, changed at the stylist\'s request; the meaning (the back, behind) is kept'},
        {'verse': '67:19a', 'remark': '*levastes cativo* imports Eph 4:8; *tomastes o cativeiro*', 'outcome': 'refused', 'decision': 'captivitatem',
         'reason': 'the Pauline reading is this verse\'s own tradition; *tomastes o cativeiro* is opaque aloud; option 2'},
        {'verse': '67:20', 'remark': '*salutárium* plural', 'outcome': 'refused', 'decision': 'salutarium', 'reason': 'as v1 (D27: number is grammar)'},
        {'verse': '67:36', 'remark': '*seja* supplies a mood', 'outcome': 'refused', 'decision': 'benedictus', 'reason': 'as v1'},
    ],
})
p['status'] = 'reviewed'
p['version'] = 3
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('applied gate')
