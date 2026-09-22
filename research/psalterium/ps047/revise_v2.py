"""Ps 47 draft 2 from draft 1 (prayed.v1.json) after the three v1 readers. Run from the repo root."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
v = p['verses']
dec = {d['id']: d for d in p['decisions']}


def opt(label, forms, note, frm):
    return {'label': label, 'forms': forms, 'note': note, 'from': frm}


# 47:3 — the slot now takes the subject too, so the stylist's order can be selected
v['47:3'] = '{fundatur}, * {latera}, a cidade do grande Rei.'
d = dec['fundatur']
for o in d['options']:
    o['forms']['fundatur'] = o['forms']['fundatur'] + ' o monte Sião'
    o['label'] = o['label'] + ' o monte Sião'
d['options'].append(opt('O monte Sião é fundado com a exultação de toda a terra',
                        {'fundatur': 'O monte Sião é fundado com a exultação de toda a terra'},
                        'stylist (v1): natural order, subject first. Refused: the appositions after the asterisk (*os lados do norte, a cidade do grande Rei*) would then follow *toda a terra*, and be heard as describing the earth, not Sion; the Latin puts *mons Sion* last so that they touch it.',
                        'stylist'))

# 47:4 — the stylist's shorter colon
d = dec['suscipiet']
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (v2); the stylist: *ele a am-* clogs a seven-syllable colon; the Latin names no subject, and the ambiguity reader heard God protecting the city.'
d['options'][1]['note'] = 'draft 1: subject supplied so that *a* is not heard as a preposition; no reader heard it so.'
d['why'] += ' v2: the supplied *ele* is dropped (stylist); no reader took the clitic for a preposition.'

# 47:5 — Porque / Pois, and the in unum formula, as options
v['47:5'] = '{quoniam} eis que os reis da terra {congregati}: * {inunum}.'
p['decisions'].append({
    'id': 'quoniam', 'refs': ['47:5'], 'latin': 'Quóniam ecce', 'kind': 'word',
    'why': 'quóniam → *porque* is the default across the psalter (and 47:15 *Porque este é Deus*). The stylist heard *Porque eis que* as two stacked connectives and asked for *Pois*. 42:2 took *Pois* only because two *por que* questions followed (the quia row says so); here nothing forces it, and 47:5 and 47:15 open with the same Latin word.',
    'options': [
        opt('Porque', {'quoniam': 'Porque'}, 'Ruling; the default, = 47:15.', 'glossary'),
        opt('Pois', {'quoniam': 'Pois'}, 'stylist (v1): lighter onset; refused to keep quóniam one word in the psalm.', 'stylist'),
    ]})
p['decisions'].append({
    'id': 'inunum', 'refs': ['47:5'], 'latin': 'convenérunt in unum', 'kind': 'glossary',
    'why': 'The in unum row names this place: 2:2 *convenérunt in unum* → *se reuniram juntos* (the Latinist\'s fix there, against *como um só*). The stylist hears *reunir juntos* as a school pleonasm and asks for *vieram juntos*. Refused: identical Latin gets identical Portuguese (rule 6), and *juntos* is there because in unum is; *vir* would also drop con-venire\'s together. Kept as an option, which would have to be taken in 2:2 too.',
    'options': [
        opt('reuniram-se juntos', {'inunum': 'reuniram-se juntos'}, 'Ruling; = 2:2.', 'glossary'),
        opt('vieram juntos', {'inunum': 'vieram juntos'}, 'stylist (v1).', 'stylist'),
    ]})

# 47:6 — perturbaram-se (voice is grammar), proclisis after the subject
v['47:6'] = 'Eles, ao verem, assim {admirati}, {passives}: * o tremor {apprehendit}.'
p['decisions'].append({
    'id': 'passives', 'refs': ['47:6'], 'latin': 'conturbáti sunt, commóti sunt', 'kind': 'grammar',
    'why': 'The stylist found the first colon too long (+5) and the two analytic passives heavy, and asked for three reflexives. *perturbaram-se* is taken: conturbári is ἐταράχθησαν, a middle as much as a passive, and voice is grammar (D2). *abalaram-se* is refused: the movéri row is *ser abalado*, and *abalar-se* is also colloquial Brazilian for "to take off, leave" — the kings did flee, but that is the Hebrew\'s sense (נֶחְפָּזוּ), not σαλεύω\'s.',
    'options': [
        opt('perturbaram-se, foram abalados', {'passives': 'perturbaram-se, foram abalados'}, 'Ruling (v2); stylist in part.', 'stylist'),
        opt('foram perturbados, foram abalados', {'passives': 'foram perturbados, foram abalados'}, 'draft 1.', 'draft'),
        opt('perturbaram-se, abalaram-se', {'passives': 'perturbaram-se, abalaram-se'}, 'stylist (v1) whole; *abalar-se* = "leave" colloquially.', 'stylist'),
    ]})
d = dec['apprehendit']
d['options'][0]['forms']['apprehendit'] = 'se apoderou deles'
d['options'][0]['label'] = 'se apoderou deles'
d['options'][0]['note'] = 'Ruling; MS1932; proclisis after the subject (stylist v1: the enclitic is European / bookish).'

# 47:10, 47:11 — the bare vocative, with *ó Deus* as an option
v['47:10'] = '{suscepimus}, {deus}, a vossa misericórdia, * no meio do vosso templo.'
v['47:11'] = '{secundum} o vosso nome, {deus}, assim também o vosso louvor{infines} os confins da terra: * {justitia}.'
p['decisions'].append({
    'id': 'deus', 'refs': ['47:10', '47:11'], 'latin': 'Deus (vocative, twice)', 'kind': 'glossary',
    'why': 'The glossary\'s working rule gives the vocative no *ó* unless the Latin has *O* (42:1 *Julgai-me, Deus*; 5:11a; 21:21). The stylist heard the bare *Deus* mid-sentence as abrupt, twice, and asked for *ó Deus*. Kept for the rule; the option fills both verses at once, so the two stay alike.',
    'options': [
        opt('Deus', {'deus': 'Deus'}, 'Ruling; the vocative rule.', 'glossary'),
        opt('ó Deus', {'deus': 'ó Deus'}, 'stylist (v1); MS1932 *ó Deus*.', 'stylist'),
    ]})

# 47:11 — no comma: the praise reaches the ends of the earth
d = dec['infines']
d['options'] = [opt(' até (no comma)', {'infines': ' até'}, 'Ruling (v2); stylist: the comma stranded the phrase; without it *até os confins* goes with *o vosso louvor*, still without a verb.', 'stylist')] + d['options']
d['options'][1]['note'] = 'draft 1; the ellipsis marked with a comma, as 18:5.'
d['why'] += ' v2: the comma is dropped (stylist): the ellipsis stays, and the phrase is heard as the reach of the praise.'

# 47:14 — the Latinist: no supplied object
v['47:14'] = 'Ponde os vossos corações no seu {virtute}: * e {distribuite} as suas casas, para que {narreis} {progenie}.'
p['decisions'].append({
    'id': 'narreis', 'refs': ['47:14'], 'latin': 'ut enarrétis', 'kind': 'grammar',
    'why': 'Draft 1 supplied *o* (DRB "relate it"). The Latinist (minor): enarráre has no object in the Latin, and the added pronoun is not a needed copula or subject. Taken: *narrar a alguém* stands without an object, and *a outra geração* after it is heard as the hearers (the ambiguity reader heard "to the next generation" with the pronoun, and the pronoun itself had three referents for him).',
    'options': [
        opt('narreis', {'narreis': 'narreis'}, 'Ruling (v2); Latinist.', 'latinist'),
        opt('o narreis', {'narreis': 'o narreis'}, 'draft 1; DRB "relate it".', 'DRB'),
    ]})
dec['progenie']['why'] = dec['progenie']['why'].replace('*o* is supplied because *narrar* wants an object (DRB \'relate it\'); without it *a outra geração* would be heard as the object. ', 'Draft 1 supplied *o* (see `narreis`). ')

p['choices']['47:6'] = 'conturbári → *perturbar* (row; now *perturbaram-se*, see `passives`); commovéri → *ser abalado* (movéri row; σαλεύω). The Latin\'s three verbs are kept three. *ao verem* leaves the object unstated, as *vidéntes* does (the ambiguity reader heard the city).'
p['choices']['47:7'] += ' The ambiguity reader could not tell who *quebrareis* addresses (God or the hearers): the Latin turns to God with no vocative, and so does the Portuguese; kept. *Társis* was unknown to him — a proper name, kept.'
p['choices']['47:3'] += ' The ambiguity reader could not place *os lados do norte* (unknown to him as a phrase). The Latin apposition is itself obscure (a famous crux); kept, with *nos lados do norte* an option in `latera`.'
p['choices']['47:14'] += ' The ambiguity reader heard *partilhai as suas casas* as hospitality, owner unclear; the Latin *distribúite domos ejus* is as open (see `distribuite`). *seu poder*: God\'s or Sion\'s, as *ejus*.'
p['choices']['47:15'] += ' *regerá* was unknown to the ambiguity reader; it is the régere row (22:1, 27:9), kept.'

(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
