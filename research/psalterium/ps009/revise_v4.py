"""Stage one, draft 3 → draft 4 after critic/v3.latinist.json: 9:12 stúdia → 'feitos'; 9:13 held, his fix and DRB's kept as options.
python3.13 research/psalterium/ps009/revise_v4.py  (reads prayed.v3.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v3.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


s = dec['studia']
s['why'] += (' Since draft 3 the Latinist (minor) asks for ‘feitos’: the plural names activities, and the Greek ἐπιτηδεύματα (what one practises) says so; '
             'the blind reader had listed ‘desígnios’ as a word he did not know.')
old = s['options']
feitos = next(o for o in old if o['label'] == 'os seus feitos')
feitos['note'] = ('Ruling since draft 4, the Latinist’s (v3, minor). What one practises and does — the Greek’s ἐπιτηδεύματα; plain; it serves 13:1b as well '
                  '(abomináveis nos seus feitos). The Diurnal and the CNBB have the word from the Hebrew (deeds): here the Latin and Greek arrive at it on their own.')
feitos['from'] = 'latinist'
desig = next(o for o in old if o['label'] == 'os seus desígnios')
desig['note'] = ('Drafts 1–3, Matos Soares 1932’s word: what someone sets himself to. The Latinist found it tilted to intention; the blind reader listed it as unknown '
                 '(though he heard ‘the Lord’s plans’).')
s['options'] = [feitos, desig] + [o for o in old if o['label'] not in ('os seus feitos', 'os seus desígnios')]

r = dec['requirens']
r['why'] += (' The Latinist on draft 3 (MAJOR, having passed these words on drafts 1 and 2) reads eórum as the genitive after recordátus est — ‘he remembered them’. '
             'That parse is possible Latin (recordári takes a genitive), but the Gallican here is the Greek word for word (ἐκζητῶν τὰ αἵματα αὐτῶν ἐμνήσθη), where αὐτῶν is the blood’s '
             'and the verb has no object; Douay-Rheims gives the pronoun to both (‘requiring their blood he hath remembered them’).')
r['options'][0]['note'] += (' Held against the Latinist’s major on draft 3 (see why): the pronoun stays with the blood, as the Greek has it, and ‘se lembrou’ is left without an object, '
                            'which leaves open whom he remembered — the blind reader heard ‘the poor; the complement is not said’.')
r['options'].insert(1, opt('ao pedir contas do sangue deles, ele se lembrou deles (Douay-Rheims)', {'requirens': 'ao pedir contas do sangue deles'},
                           'Douay-Rheims’ reading, the pronoun given to both verbs: needs the colon to end ‘se lembrou deles’ — select this and the Latinist’s option below together is not possible in one slot, so this option only records it; its full line: ‘Porque, ao pedir contas do sangue deles, ele se lembrou deles’.', 'DRB'))
data['verses']['9:13'] = 'Porque, {requirens}, ele se lembrou{v13rec}: * não esqueceu o clamor {pauper2}.'
r['options'][1]['forms'] = {'requirens': 'ao pedir contas do sangue deles', 'v13rec': ' deles'}
r['options'][1]['note'] = 'Douay-Rheims’ reading: the pronoun given to both verbs (‘requiring their blood he hath remembered them’). It satisfies both parses by saying ‘deles’ twice where the Latin says eórum once.'
r['options'][0]['forms'] = {'requirens': 'ao pedir contas do sangue deles', 'v13rec': ''}
r['options'].insert(2, opt('ao pedir contas do sangue, ele se lembrou deles', {'requirens': 'ao pedir contas do sangue', 'v13rec': ' deles'},
                           'The Latinist’s fix on draft 3 (MAJOR): eórum given to recordátus est. Possible Latin, but against the Greek the Gallican translates word for word.', 'latinist'))
for o in r['options'][3:]:
    o['forms'] = {**o['forms'], 'v13rec': ''}

data['version'] = 4
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 4 written')
