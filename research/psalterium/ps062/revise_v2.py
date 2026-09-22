"""Ps 62 draft 2: apply the reader outcomes to prayed.json (draft 1 kept as prayed.v1.json)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note=None, why_add=None, new=None):
    x = dec[did]
    if new:
        x['options'].insert(0, new)
    else:
        i = next(i for i, o in enumerate(x['options']) if o['label'] == label)
        o = x['options'].pop(i)
        x['options'].insert(0, o)
    if note:
        x['options'][0]['note'] = note
    if why_add:
        x['why'] += ' ' + why_add


d['version'] = 2
d['status'] = 'reviewed'

# 62:2b — stylist: the commas stalled the colon
promote('multipliciter', None, new={
    'label': 'e de quantos modos a minha carne, por vós!',
    'forms': {'multipliciter': 'e de quantos modos a minha carne, por vós!'},
    'note': 'Ruling (v2); the stylist\'s line; verbless, *tibi* kept at the close.', 'from': 'stylist'},
    why_add='**v2:** the stylist heard *por vós* boxed in by commas and the colon stall; his *e de quantos modos a minha carne, por vós!* is taken — the same words, a supplied *e* (grammar, D2), *por vós* moved to the close where it lands on the oxytone. Still verbless, as the Latin.')
dec['multipliciter']['options'][1]['note'] = 'Draft 1; *por vós* between commas stalled the colon (stylist).'

# 62:6 — stylist + ambiguity reader
d['verses']['62:6'] = 'Que a minha alma {repleatur} como {adipe}: * e com lábios de exultação {laudabit}.'
x = dec['repleatur']
x['options'] = [
    {'label': 'se farte', 'forms': {'repleatur': 'se farte'}, 'note': 'Ruling (v2); the stylist\'s verb; the jussive with *Que*, the subject first.', 'from': 'stylist'},
    {'label': 'seja repleta', 'forms': {'repleatur': 'seja repleta'}, 'note': 'Draft 1; the root and the passive; bookish (stylist).', 'from': 'draft'},
    {'label': 'seja saciada', 'forms': {'repleatur': 'seja saciada'}, 'note': 'MS1932; *satiáre*\'s word.', 'from': 'MS1932'},
]
x['why'] += (' **v2:** the stylist found *seja repleta* stiff and the subjunctive hard to hear; *se farte* taken — a plain verb of being filled with food, the passive made reflexive (grammar, D2), and it is not *satiáre*\'s *saciar*. '
             'The colon is reordered: the ambiguity reader heard *Como de banha* at the head of the verse as "I eat lard" (*como* = I eat). With *Que a minha alma se farte* first, *como* can only be "like". The order is grammar (D2).')
x = dec['adipe']
x['why'] += (' **v2:** the stylist (worst line) heard *banha* as a kitchen word that draws a smile and asked *de tutano e de gordura*. Refused: *tutano* (marrow) is DRB\'s gloss, not *adeps* (lard, the soft fat — L&S), and the Latin itself says fat twice (rule 2: the repetition and the image stay). '
             'His other complaint — the word at the head of the verse — is met by the reorder (decision `repleatur`): *banha* now stands mid-colon after *como de*. **For Gustavo\'s ear:** the price of the concrete image here is a homely word; *tutano* is kept as an option.')
x['options'].append({'label': 'de tutano e de gordura', 'forms': {'adipe': 'de tutano e de gordura'}, 'note': 'the stylist; DRB\'s \'marrow\'; not the Latin\'s word.', 'from': 'stylist'})

# 62:8b — Latinist: post te
promote('post', 'apegou-se a vós, seguindo-vos', note='Ruling (v2); the Latinist\'s fix; *post* kept by a participle.',
        why_add='**v2:** the Latinist (minor) asked for *post te* back, with this very fix. Taken: the following behind is the Latin\'s image (D2 keeps images), and the participle supplies no sense the preposition lacks. The colon still reads alone as the antiphon.')
dec['post']['options'][1]['note'] = 'Draft 1; *post* lost (Latinist, minor), as DRB and MS1932.'

# 62:10 — Latinist: inferiora
promote('inferiora', 'nas partes mais baixas', note='Ruling (v2); the Latin\'s comparative, DRB\'s \'lower parts\'.',
        why_add='**v2:** the Latinist (minor) asked for the Latin\'s comparative, proposing *nas partes inferiores*. The comparative taken, his word refused: *partes inferiores* is heard as the lower body. *as partes mais baixas da terra* (DRB) keeps *inferióra* as a place and a degree, at no length cost against the Latin colon. 138:15 *in inferióribus terræ* should follow.')
dec['inferiora']['options'][1]['note'] = 'Draft 1; plain, but the comparative lost (Latinist, minor).'

# 62:7 — stylist cama → leito: refused
x = dec['stratum']
x['why'] += (' **v2:** the stylist found *cama* flat beside *madrugadas* and asked *no meu leito*. Refused: *leito* is *lectus*\'s word in the row, and the pair *leito / cama* is how 6:7 and 40:4 keep *lectus* and *stratum* apart; *cama* is plain and concrete (rule 5). His line is option 3.')
next(o for o in x['options'] if o['label'] == 'no meu leito')['note'] = 'MS1932, the stylist; *lectus*\'s word.'

# 62:12 — stylist: refused
x = dec['iniqua']
x['why'] += (' **v2:** the stylist found *coisas* a filler and asked *foi tapada a boca dos que falam o que é iníquo*. Refused: *coisas iníquas* is 25:4\'s wording for the same neuter plural (rule 6), and *tapada* is heard in Brazil as a hand over the mouth (decision `obstructum`). *o que é iníquo* is an option.')
x['options'].append({'label': 'o que é iníquo', 'forms': {'iniqua': 'o que é iníquo'}, 'note': 'the stylist; collective singular.', 'from': 'stylist'})
next(o for o in dec['obstructum']['options'] if o['label'] == 'foi tapada')['note'] = 'the letter; DRB \'stopped\'; the stylist asked it (refused: a hand over the mouth).'

d['choices']['62:3'] += ' The ambiguity reader did not hear the comparison *as in the desert, so in the holy place*: it is the Latin\'s *sic* with the comparison unstated; not supplied (D2: an ambiguity the Latin leaves).'
d['choices']['62:7'] += ' The ambiguity reader found the conditional *Se me lembrei* odd and heard "whenever" as a second reading; the Latin\'s *Si* is kept (DRB *If*). He listed *auxílio* as unknown (the row, 14/14; kept).'
d['choices']['62:6'] += ' *exultação* listed as unknown again by the ambiguity reader (the row records it; kept).'
d['choices']['62:12'] += ' *iníquas* listed as unknown by the ambiguity reader; kept (the *iníquus* row). The ambiguity reader heard *por ele* first as God — the Latin leaves God and the king open.'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json; run by the coordinator)',
     'note': '2 minor, both taken (62:8b with his words; 62:10 the comparative with DRB\'s words, his *partes inferiores* refused).',
     'outcomes': [
         {'verse': '62:8b', 'remark': 'post te flattened', 'outcome': 'taken'},
         {'verse': '62:10', 'remark': 'inferióra comparative lost', 'outcome': 'taken', 'reason': 'the comparative taken as *partes mais baixas*; his *partes inferiores* is heard as the lower body'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json; run by the coordinator)',
     'note': '5 remarks on 4 verses; best 62:4, worst 62:6. Taken: 62:2b order, 62:6 *se farte*. Refused and kept as options: 62:6 *tutano*, 62:7 *leito*, 62:12 *o que é iníquo* / *tapada*.',
     'outcomes': [
         {'verse': '62:2b', 'remark': 'por vós boxed in by commas; the colon stalls', 'outcome': 'taken'},
         {'verse': '62:6', 'remark': 'banha draws a smile; tutano', 'outcome': 'option', 'decision': 'adipe', 'reason': 'tutano is DRB\'s gloss (marrow), not adeps (lard); the head-of-verse problem met by reordering'},
         {'verse': '62:6', 'remark': 'seja repleta stiff', 'outcome': 'taken'},
         {'verse': '62:7', 'remark': 'cama flat; no meu leito', 'outcome': 'option', 'decision': 'stratum', 'reason': 'leito is lectus\'s word; the row\'s pair (6:7, 40:4)'},
         {'verse': '62:12', 'remark': 'coisas a filler; o que é iníquo, tapada', 'outcome': 'option', 'decision': 'iniqua', 'reason': 'coisas iníquas = 25:4 (rule 6); tapada heard as a hand over the mouth'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context, Portuguese only; run by the coordinator)',
     'note': '31 items, 3 unknown words (*iníquas*, *exultação*, *auxílio* — all glossary rows, kept). One real mishearing mended: 62:6 *Como de banha* heard as "I eat lard" — the colon reordered. The rest are the Latin\'s own openness (62:3 *sic*, 62:12 *rex*, *in eo*) or understood rightly.',
     'outcomes': [
         {'verse': '62:6', 'remark': 'Como heard as "I eat"', 'outcome': 'taken'},
         {'verse': '62:2b', 'remark': 'verb missing; predicate unrecoverable', 'outcome': 'taken', 'reason': 'met by the stylist\'s order; still verbless as the Latin'},
         {'verse': '62:3', 'remark': 'the as/so comparison not audible', 'outcome': 'refused', 'reason': 'the Latin leaves it unstated (sic alone); supplying *como* would explain'},
         {'verse': '62:7', 'remark': 'the conditional sounds odd', 'outcome': 'refused', 'reason': 'the Latin\'s Si, as DRB'},
         {'verse': '62:12', 'remark': 'O rei unintroduced; por ele God or king', 'outcome': 'refused', 'reason': 'the Latin\'s own openness'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 62:2b stylist\'s order; 62:6 reordered with *Que … se farte* (stylist + ambiguity); 62:8b *seguindo-vos* and 62:10 *partes mais baixas* (Latinist). Draft 1 kept as prayed.v1.json.'},
]

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
