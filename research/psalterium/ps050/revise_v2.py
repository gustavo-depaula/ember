"""Draft 2 of Ps 50 from the three v1 reads. Run once."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def lead(did, option, why=None):
    x = dec[did]
    x['options'] = [option] + [o for o in x['options'] if o['forms'] != option['forms']]
    if why:
        x['why'] += ' ' + why


d['version'] = 2

lead('incerta', {'label': 'vós me manifestastes …', 'forms': {'incerta': 'vós me manifestastes as coisas incertas e ocultas da vossa sabedoria'}, 'note': 'Ruling in v2 (stylist): no *-astes* rhyme between mediant and final; the verb up front with the subject named, as 50:9.', 'from': 'stylist'},
     'v2: the stylist heard *amastes … manifestastes* rhyme at mediant and final and the verb held back to the end of a long colon; the verb now leads (named subject and proclisis, as *Vós me aspergireis* in 50:9), and the colon ends on *sabedoria*. The Latin\'s asyndeton is kept (the stylist\'s *e me manifestastes* adds a conjunction), and *coisas* keeps the plural.')
for o in dec['incerta']['options']:
    if o['label'] == 'objects first, verb last':
        o['note'] = 'v1 ruling; the Latin\'s order. The stylist: rhymes with the mediant (*amastes … manifestastes*) and runs out of breath.'

lead('dealbabor', {'label': 'ficarei mais branco que a neve', 'forms': {'dealbabor': 'ficarei mais branco que a neve'}, 'note': 'Ruling in v2; the stylist\'s tighter *que*.', 'from': 'stylist'},
     'v2: *do que* → *que* (stylist). The Latinist asked for the passive (*serei branqueado mais do que a neve*, parallel to *serei purificado*); refused: *ficar* + adjective is the Portuguese resultative of a passive (the whitening is done to me, by the God named in *lavareis*), and *branqueado* is laundry and bleach. Kept as an option.')
dec['dealbabor']['options'].append({'label': 'serei branqueado mais do que a neve', 'forms': {'dealbabor': 'serei branqueado mais do que a neve'}, 'note': 'the Latinist\'s fix (v1): the passive kept, parallel to *serei purificado*.', 'from': 'latinist'})

lead('benigne', {'label': 'Tratai benignamente … a Sião, na vossa boa vontade', 'forms': {'benigne': 'Tratai benignamente, Senhor, a Sião, na vossa boa vontade'}, 'note': 'Ruling in v2: the Latinist\'s act (*fac*) and the stylist\'s order.', 'from': 'latinist'},
     'v2: the Latinist: *benígne fac* is an act, not a state, fix *Tratai benignamente … a Sião*; 118:124 already has *Fac cum servo tuo → Tratai o vosso servo*. The stylist: *com Sião* dangled after the comma; Sião now follows the verb and the colon ends on *vontade*. The antiphon\'s own division (*Benígne fac, Dómine, * in bona voluntáte tua Sion*) is an antiphon\'s, not this verse\'s mediant, and the Portuguese intonation still opens *Tratai benignamente, Senhor*.')

lead('imponent', {'label': 'sobre o vosso altar porão bezerros', 'forms': {'imponent': 'sobre o vosso altar porão bezerros'}, 'note': 'Ruling in v2 (stylist): ends on the victims as the Latin on *vítulos*; the place first steers *porão* to the verb.', 'from': 'stylist'},
     'v2: the stylist and the ambiguity reader both heard the noun *porão* in *então porão bezerros*; the stylist\'s order puts the place first, so that *porão* is plainly a verb, and ends the psalm on *bezerros* as the Latin on *vítulos*.')

d['decisions'].append({
    'id': 'utique',
    'refs': ['50:18'],
    'latin': 'dedíssem útique',
    'kind': 'order',
    'why': 'v2 (stylist): *eu certamente o teria dado* stumbled before the mediant; *útique* goes back to the end, where the Latin has it, and the colon closes on the paroxytone *certamente*.',
    'options': [
        {'label': 'eu o teria dado certamente', 'forms': {'utique': 'eu o teria dado certamente'}, 'note': 'Ruling in v2; the Latin\'s order.', 'from': 'stylist'},
        {'label': 'eu certamente o teria dado', 'forms': {'utique': 'eu certamente o teria dado'}, 'note': 'v1.', 'from': 'draft'},
    ],
})
d['verses']['50:18'] = 'Porque, se quisésseis sacrifício, {utique}: * com holocaustos não vos {delectaberis}.'

dec['sanguinibus']['why'] += ' v2: the Latinist asked again for *dos sangues*; refused by D29, which is settled. The ambiguity reader heard *do sangue* as bloodshed or violence rather than bloodguilt — the plural would not make bloodguilt clearer.'
dec['exsultabit']['why'] += ' v2: the Latinist asked for the transitive *exultará a vossa justiça* (the accusative object). Refused: none of the fourteen finished uses of *exultar* is transitive (pfind), and *exultar* + object is not Portuguese; the preposition is the psalter\'s own (12:6b, 34:9). The transitive stays option 1 for the gate.'
dec['contribulatus']['why'] += ' The ambiguity reader noted the everyday *atribulado* = \'hectic\'; with *espírito* and beside *contrito* it is heard as afflicted, and the weaker sense is still tribulation. Kept.'
dec['principali']['why'] += ' The ambiguity reader heard *soberano* as God\'s own sovereign spirit or a domineering one; the first is a patristic reading of *spíritus principális* the Latin allows, the second is not heard beside *firmai-me*. Kept.'

c = d['choices']
c['50:20'] = 'Sion → *Sião*; Jerúsalem → *Jerusalém* (the final oxytone is the name). *benignamente* keeps the adverb *benígne*; bona volúntas → *boa vontade* (row).'
c['50:21'] = c['50:21'].replace('*tunc … tunc* kept as *Então … então*.', '*tunc … tunc* kept as *Então … então*. The Latin\'s order at the end of the psalm (the victims last) kept in v2.')

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
