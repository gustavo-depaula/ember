"""Apply the v2 revisions to ps108/prayed.json (after the v1 readers)."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text())
d['version'] = 2
v = d['verses']
v['108:10'] = '{nutantes} os seus filhos, e mendiguem: * e sejam lançados fora das suas habitações.'
v['108:11'] = '{fenerator} {scrutetur} {substantia}: * e estranhos saqueiem os seus trabalhos.'
v['108:12'] = 'Não haja {adjutor}: * nem haja quem tenha piedade dos seus órfãos.'
v['108:15'] = 'Estejam sempre {contradom}, e da terra {dispereat} a memória deles: * porque não se lembrou de fazer misericórdia.'

dec = {x['id']: x for x in d['decisions']}

n = dec['nutantes']
n['why'] += (' v2: the stylist found the detached participle at the head made the colon stumble. The verb now leads and the'
             ' participle follows between commas; D43 *transportar* is kept (the stylist\'s *levados* is addúcere\'s verb, D42).')
n['options'].insert(0, {'label': 'Sejam transportados, vacilantes,', 'forms': {'nutantes': 'Sejam transportados, vacilantes,'},
                        'note': 'v2 — the verb first (stylist); D43 kept', 'from': 'stylist'})
n['options'][1]['from'] = 'draft'
n['options'][1]['note'] = 'v1 draft — the Latin order; stumbles at the head'

f = dec['fenerator']
f['why'] += (' v2: the ambiguity reader heard *Sonde o usurário* as an imperative ("probe the usurer"). The subject now comes first,'
             ' so the jussive is heard, and the colon matches the second (*e estranhos saqueiem*).')
f['options'][0]['forms'] = {'fenerator': 'O usurário'}
f['options'][1]['forms'] = {'fenerator': 'O credor'}

s = dec['scrutetur']
s['why'] += ' v2: follows the subject (see fenerator).'
s['options'][0]['forms'] = {'scrutetur': 'sonde'}
s['options'][1]['forms'] = {'scrutetur': 'esquadrinhe'}

a = dec['adjutor']
a['why'] += (' v2: the Latinist and the stylist both asked for the person. *quem o auxilie* keeps the row\'s verb, makes the helper'
             ' audible and gives the Latin\'s *Non sit … nec sit qui* its parallel; *illi* is carried by *o*. A local departure from the open row.')
a['options'] = [
    {'label': 'quem o auxilie', 'forms': {'adjutor': 'quem o auxilie'}, 'note': 'v2 — Latinist + stylist; parallels *quem tenha piedade*', 'from': 'latinist'},
    {'label': 'auxílio para ele', 'forms': {'adjutor': 'auxílio para ele'}, 'note': 'v1 draft — the row; abstract', 'from': 'glossary'},
    {'label': 'para ele auxiliador', 'forms': {'adjutor': 'para ele auxiliador'}, 'note': 'the agent noun; rare in speech'},
]

fm = dec['facmecum']
fm['why'] += (' v2: the stylist and the ambiguity reader both heard *fazei comigo* as cut off, a word missing. The stylist\'s *agi comigo*'
              ' falls to rule 3. The row\'s *tratai-me* is complete in Portuguese without an object and adds nothing.')
fm['options'] = [fm['options'][1], fm['options'][0]] + fm['options'][2:]
fm['options'][0]['note'] = 'v2 — the fácere cum row; complete without an object'
fm['options'][1]['note'] = 'v1 draft — the Latin as it stands; heard as cut off'

d['decisions'].append({
    'id': 'dispereat',
    'refs': ['108:15'],
    'latin': 'et dispéreat de terra memória eórum',
    'kind': 'glossary',
    'why': ('The disperíre row (open) gives *perecer de todo* for the intensive *dis-*. The Latinist found *de todo* an added phrase;'
            ' the stylist found *pereça de todo a memória* trips (heard for a moment as *de todo a…*). *pereça* alone is the Latin\'s verb,'
            ' and the curse is not weakened: a memory that perishes from the earth is gone. A local departure; the row stays open.'),
    'options': [
        {'label': 'pereça', 'forms': {'dispereat': 'pereça'}, 'note': 'v2 — Latinist', 'from': 'latinist'},
        {'label': 'pereça de todo', 'forms': {'dispereat': 'pereça de todo'}, 'note': 'v1 draft — the row; trips', 'from': 'glossary'},
        {'label': 'desapareça', 'forms': {'dispereat': 'desapareça'}, 'note': 'stylist; another verb', 'from': 'stylist'},
    ],
})

c = d['choices']
c['108:15'] = ('*dispéreat → pereça* (decision dispereat). *eórum → deles*, apart from the singular *ejus → seu* of the curses.'
               ' *fácere misericórdiam → fazer misericórdia* (102:6 *faz misericórdias*). The subject of *Estejam* is unnamed, as in the Latin'
               ' (the sins of 108:14); the ambiguity reader heard it as people, but naming it would add a word. The Latin\'s 108:15 includes'
               ' the Greek and Hebrew v. 16; DO has no 108:16.')
c['108:11'] = c['108:11'] + ' v2: subject first (decision fenerator).'

d['audit'].append({
    'step': 'critics v1',
    'note': 'Latinist, stylist and ambiguity readers (claude-opus-5-5, fresh context; Latinist and stylist with latin.json), stored in critic/v1.*.json.',
    'outcomes': [
        'latinist 108:12 adjutor as a person — accepted: *Não haja quem o auxilie* (with the stylist)',
        'latinist 108:15 *de todo* added — accepted: *pereça* (new decision dispereat)',
        'stylist 108:7 -ado rhyme — refused: *julgado / condenado* is the Latin\'s *judicátur / condemnátus*, and the fix inverts the colon to an oxytone end; logged',
        'stylist 108:10 stumbling head, *transportados* — partly accepted: verb first (*Sejam transportados, vacilantes,*); *levados* refused (D43 transportar settled; levar is addúcere\'s)',
        'stylist 108:12 auxílio abstract — accepted (as the Latinist)',
        'stylist 108:15 *pereça de todo a* trips — accepted (as the Latinist); *desapareça* kept as an option',
        'stylist 108:17 *carente* heard as emotional — refused: D38 inops → carente is settled; *indigente* is not the ruling',
        'stylist 108:21 *fazei comigo* cut off — accepted in part: *tratai-me* (the fácere cum row); *agi comigo* refused by rule 3',
        'stylist 108:23 *fui levado* — refused: D41 auferre → tirar settled; levar is addúcere\'s (D42)',
        'ambiguity 108:11 *Sonde o usurário* heard as an imperative — accepted: *O usurário sonde todos os seus bens*',
        'ambiguity 108:21 *fazei comigo* incomplete — accepted (tratai-me)',
        'ambiguity 108:15 subject of *Estejam*, *não se lembrou* near *o Senhor*; 108:6 *sobre ele*; 108:24 *por causa do óleo*; 108:27 *a fizestes*; 108:31 subject of *se pôs* — kept: the Latin is open in each, and the translation keeps it open',
        'ambiguity unknown words (episcopado, vacilantes, usurário, sonde, compungido, cinge, desonra) — kept: each is the ruling for its Latin word (episcopátus, nutáre, fænerátor, scrutári row, compúngi row, præcíngere, pudor)',
    ],
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
