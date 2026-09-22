"""Draft 2 of Ps 81 from draft 1 and the v1 readers. Run: python3.13 research/psalterium/ps081/revise_v2.py"""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def lead(did, label, forms, note, source, why_add):
    """Put a new or existing option first and extend the why."""
    opts = dec[did]['options']
    rest = [o for o in opts if o['label'] != label]
    for o in rest:
        if o['note'].startswith('Ruling'):
            o['note'] = 'draft 1 — ' + o['note'][len('Ruling: '):]
    dec[did]['options'] = [{'label': label, 'forms': forms, 'note': note, 'from': source}] + rest
    dec[did]['why'] += ' ' + why_add


d['version'] = 2

# 81:1 — the stylist's order, so that *deuses* no longer stands at both cadences
lead('inmedio', 'e julga os deuses no meio deles', {'inmedio': 'e julga os deuses no meio deles'},
     'Ruling (v2): the stylist\'s order; *deuses* leaves the final.', 'stylist',
     'v2: the stylist heard the doubled *deuses* at mediant and final as a flat chime (checks flagged it too); his order ends on *deles*, a faint assonance, not the same word. The Latinist asked *porém* for *autem* (minor): refused — δέ here continues the scene (he stands in the council, and in its midst he judges), there is no contrast to mark, and *porém* in a short colon weighs more than the Latin particle; *e no meio, porém, julga os deuses* is kept as an option. *deles* stays: the Latinist called it harmless.')
dec['inmedio']['options'].append({'label': 'e no meio, porém, julga os deuses', 'forms': {'inmedio': 'e no meio, porém, julga os deuses'}, 'note': 'the Latinist\'s: *autem* as *porém*, nothing supplied; *deuses* back at both cadences.', 'from': 'latinist'})

# 81:2 — singular face
lead('facies', 'aceitais a face dos pecadores', {'facies': 'aceitais a face dos pecadores'},
     'Ruling (v2): the face kept, in the singular.', 'stylist',
     'v2: the stylist found the plural *faces* heard as cheeks and asked the singular (number is grammar, D2: *a face dos pecadores* is distributive, as in *a face da terra*). His verb *acolheis* is refused: the ambiguity reader already heard *aceitar* as \'welcome sinners\', and *acolher* is the welcoming verb itself; it is kept as an option.')
dec['facies']['options'].append({'label': 'acolheis a face dos pecadores', 'forms': {'facies': 'acolheis a face dos pecadores'}, 'note': 'the stylist\'s verb; heard as hospitality.', 'from': 'stylist'})

# 81:4 — the Latinist's *Arrancai*
lead('eripite', 'Arrancai', {'eripite': 'Arrancai'},
     'Ruling (v2): the Latinist\'s; the row\'s verb where a source is named in the verse.', 'latinist',
     'v2: the Latinist (minor) found *libertai … livrai* two near-synonyms where the Latin\'s verbs differ (*erípere* is to snatch away). The row gives *arrancar* where a source is named, and *da mão do pecador* is named in the same verse and is heard with both verbs (the Greek has ἐκ χειρὸς between them). Taken.')

# 81:6 — the copula repeated
d['verses']['81:6'] = 'Eu disse: {diiestis}, * e sois todos filhos do {excelsi}.'
d['choices']['81:6'] = '*e sois todos filhos do Excelso* (v2, the stylist\'s): the copula of the first colon repeated, which D2 allows; draft 1\'s verbless *e todos filhos do Excelso* sounded clipped to him. *omnes* before *filhos* (MS1932\'s order). *Excelso* was listed as unknown by the ambiguity reader; kept under the row (decision `excelsi`).'

# 81:8 — *em*
lead('inomnibus', 'em todas as nações', {'inomnibus': 'em todas as nações'},
     'Ruling (v2): the Latin\'s *in*; the stylist\'s preposition.', 'stylist',
     'v2: the stylist found *herdar entre* odd and asked *em*, which is the Latin\'s preposition too; the ambiguity reader could not place *entre*. Taken. His cleft *porque sois vós que herdareis* is refused: it adds an emphasis construction for the plain *tu*, and *vós* already stands named; kept as an option.')
d['verses']['81:8'] = 'Levantai-vos, Deus, julgai a terra: * porque {tuher} {inomnibus}.'
for o in dec['inomnibus']['options']:
    o['forms']['tuher'] = 'vós herdareis'
dec['inomnibus']['options'].append({'label': 'sois vós que herdareis em todas as nações', 'forms': {'tuher': 'sois vós que herdareis', 'inomnibus': 'em todas as nações'}, 'note': 'the stylist\'s cleft; an emphasis construction for the plain *tu*.', 'from': 'stylist'})

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Two minors; one taken, one refused. Praised *aceitais as faces*, *serão abalados*, *julgai em favor do*.',
     'outcomes': [
         {'verse': '81:1', 'remark': '*autem* flattened to *e*; *deles* supplied', 'outcome': 'refused', 'decision': 'inmedio', 'reason': 'δέ continues the scene, no contrast to mark; *deles* he called harmless. *porém* kept as an option.'},
         {'verse': '81:4', 'remark': '*libertai* merges *erípere* with *liberáre*; *Arrancai*', 'outcome': 'taken', 'decision': 'eripite'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Four remarks; two taken whole, two taken in part. Best line 81:7, worst 81:2.',
     'outcomes': [
         {'verse': '81:1', 'remark': '*deuses* at mediant and final', 'outcome': 'taken', 'decision': 'inmedio'},
         {'verse': '81:2', 'remark': '*aceitais as faces* a calque; plural heard as cheeks; *acolheis a face*', 'outcome': 'option', 'decision': 'facies', 'reason': 'singular taken; *acolher* refused — it is the welcoming verb, and the ambiguity reader already heard welcome.'},
         {'verse': '81:6', 'remark': 'verbless *e todos filhos*; *e sois todos filhos*', 'outcome': 'taken'},
         {'verse': '81:8', 'remark': '*herdar entre* odd; *porque sois vós que herdareis em*', 'outcome': 'option', 'decision': 'inomnibus', 'reason': '*em* taken; the cleft refused — an emphasis construction for the plain *tu*.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. Ten readings, most the Latin\'s own openness (who the \'gods\' are, who speaks in 81:6, whether 81:5\'s shaking is now or to come). Unknown: *Excelso*, *congregação* as a divine council.',
     'outcomes': [
         {'verse': '81:1', 'remark': '*congregação* heard as the church congregation (third reading)', 'outcome': 'refused', 'decision': 'synagoga', 'reason': 'heard first as a divine council; the row keeps one word for the four places. *assembleia* stays an option.'},
         {'verse': '81:2', 'remark': '*aceitais as faces* heard as welcoming sinners', 'outcome': 'refused', 'decision': 'facies', 'reason': 'the image is the Latin\'s (rule 5); singular taken for the stylist; *acolher* would make the misreading worse.'},
         {'verse': '81:1, 81:6', 'remark': '\'gods\' as pagan gods, judges, or all men; speaker of 81:6', 'outcome': 'refused', 'reason': 'the Latin\'s own openness; nothing supplied.'},
         {'verse': '81:7', 'remark': '*príncipes* may suggest Lucifer', 'outcome': 'refused', 'reason': 'a reading the Latin allows (patristic); earthly rulers heard first.'},
         {'verse': '81:8', 'remark': '*Levantai-vos* might be said to the judges', 'outcome': 'refused', 'reason': 'the vocative *Deus* settles it; heard as a plea to God.'},
         {'verse': '81:8', 'remark': '*herdar entre* unclear', 'outcome': 'taken', 'decision': 'inomnibus'},
         {'verse': '81:6', 'remark': '*Excelso* unknown', 'outcome': 'refused', 'decision': 'excelsi', 'reason': 'the row (D43) keeps it apart from *Altíssimo*; option there.'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 81:1 *e julga os deuses no meio deles* (stylist, no doubled cadence); 81:2 *a face* singular (stylist); 81:4 *Arrancai* (Latinist); 81:6 *e sois todos filhos* (stylist, copula); 81:8 *em todas as nações* (stylist, the Latin\'s *in*).'},
]

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
