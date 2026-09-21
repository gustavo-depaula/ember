"""Ps 29 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps029/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; appends audit_v2.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}
verses = data['verses']


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


def decision(id, refs, latin, kind, why, options):
    data['decisions'].append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options})


data['version'] = 2
data['status'] = 'reviewed'

# 29:13 — the Latinist's minor (the passive) and the stylist's worst line ('compunja' needs deciphering)
d = decisions['compungar']
d['why'] += (' Heard (draft 1): the Latinist, minor — «Compúngar está na voz passiva. A construção pronominal … não conserva explicitamente essa'
             ' voz» → ‘e eu não seja compungido’; the stylist\'s worst line — «“Compunja” exige decifração e sugere especificamente'
             ' arrependimento; perde-se a abertura da imagem latina de ser ferido» → ‘e eu não seja ferido’; the blind reader: \'compunja\''
             ' unknown, remorse if understood. Taken: the Latinist\'s wording. It keeps the Latin\'s voice and word, and the rare subjunctive'
             ' \'compunja\' gives way to the participle \'compungido\', which is current in Catholic speech (\'coração compungido\'). The'
             ' stylist\'s \'ferido\' keeps the image and is plainer, but says any wound — it is an option.')
demote(d)
d['options'].insert(0, option('não seja compungido', {'compungar': 'não seja compungido'},
                              'Ruling (draft 2): the passive kept (the Latinist).', 'latinist'))
d['options'].insert(2, option('não seja ferido', {'compungar': 'não seja ferido'},
                              'The stylist: the image of the wound, plainer; any wound.', 'stylist'))
d['options'] = [x for x in d['options'] if x['label'] != 'não seja mais ferido de dor']

# 29:9 — the stylist: the rhyme clamarei / suplicarei at the two cadences
verses['29:9'] = 'A vós, Senhor, {clamabo}: * e ao meu Deus suplicarei.'
decision('clamabo', ['29:9'], 'Ad te, Dómine, clamábo: * et ad Deum meum deprecábor', 'grammar',
         'Two futures ending both cola (clamábo … deprecábor). In Portuguese \'clamarei … suplicarei\' rhyme at the mediant and the final, which the'
         ' Latin\'s -abo / -abor barely echoes. Heard (draft 1): the stylist — «A rima dos dois futuros fecha os membros com uma cantilena muito'
         ' marcada» → ‘A vós, Senhor, hei de clamar’. Taken: the periphrastic future is the same tense (grammar, D2), the mediant falls on an'
         ' oxytone, and the rhyme is gone. deprecári → suplicar (D35).',
         [option('hei de clamar', {'clamabo': 'hei de clamar'}, 'Ruling (draft 2): the stylist; no rhyme.', 'stylist'),
          option('clamarei', {'clamabo': 'clamarei'}, 'Draft 1: rhymes with \'suplicarei\'.', 'draft')])

# 29:6b — the stylist's order refused; kept as an option
d = decisions['vesperum']
d['why'] += (' Heard (draft 1): the stylist — «O sujeito depois do futuro longo torna a frase mais literária que oral» → ‘O pranto se demorará'
             ' à tarde: * e pela manhã, a alegria’. Refused, kept as an option: evening and morning at the head of each colon is the verse\'s'
             ' antithesis (the Latin\'s ad … ad), and the second colon keeps its adverb first either way — his order makes a chiasm the Latin'
             ' does not have. The blind reader heard the verse rightly (weeping lasts the evening; joy comes in the morning).')
verses['29:6b'] = '{order6b}: * e {matutinum}, a alegria.'
decision('order6b', ['29:6b'], 'Ad vésperum demorábitur fletus', 'order',
         'See decision vesperum: the stylist\'s order, refused.',
         [option('À tarde se demorará o pranto', {'order6b': '{vesperum} se {demorabitur} o pranto'},
                 'Ruling: the adverbs head both cola, as the Latin.', 'draft'),
          option('O pranto se demorará à tarde', {'order6b': 'O pranto se {demorabitur} à tarde'},
                 'The stylist: the subject first; a chiasm.', 'stylist')])

# 29:7 — the stylist's 'Jamais' refused (D23; 14:5b)
d = decisions['non_movebor']
d['why'] += (' Heard (draft 1): the stylist — «A sequência “para sempre não” soa transposta e faz hesitar sobre o alcance da negação» →'
             ' ‘Jamais serei abalado’. Refused, as at 14:5b: D23\'s words, and \'para sempre\' before the negation is what keeps its scope'
             ' (the blind reader heard \'I shall not be shaken\', rightly). The second stylist to ask for \'jamais\' — evidence on the'
             ' formula row; the option stays one touch away.')

# 29:11 — the Latinist's MAJOR 'auxiliador': held (D19, D24)
d = decisions['adjutor']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Adjútor designa aquele que auxilia; “auxílio” substitui o agente pela ajuda prestada»'
             ' → ‘auxiliador’. HELD on purpose, as at 9:10, 17:3b, 18:15b, 118:114 (D24): the row\'s one word, and here with \'se fez\''
             ' the abstract is the natural predicate (\'became my help\', as 9:10 \'se fez refúgio\'); no reader misheard it.')

# 29:10 — the blind reader heard 'corrupção' as moral corruption: kept (glossary), an option added
d = next(x for x in data['decisions'] if x['id'] == 'corruptio') if any(x['id'] == 'corruptio' for x in data['decisions']) else None
if d is None:
    verses['29:10'] = 'Que {utilitas} há no meu sangue, * enquanto desço à {corruptio}?'
    decision('corruptio', ['29:10'], 'dum descéndo in corruptiónem', 'glossary',
             'corrúptio → corrupção (glossary, open; 15:10 \'ver a corrupção\' = Acts 2:27, fetched). διαφθοράν, bodily decay. Heard (draft 1):'
             ' the blind reader — likely hearing «desonestidade ou … degradação moral; esse é o sentido mais corrente de “corrupção”», decay'
             ' second — the same fault as 15:10. Kept: one Latin word, the Acts twin in 15:10, and here \'desço\' with the blood of the first'
             ' colon points to death. The second place heard so: evidence for the row, with \'decomposição\' offered as the row\'s option.',
             [option('corrupção', {'corruptio': 'corrupção'}, 'Ruling: glossary (15:10).', 'glossary'),
              option('decomposição', {'corruptio': 'decomposição'}, 'The sense (decay); no moral hearing; not the Acts word.', 'ambiguity')])

steps = json.loads((folder / 'audit_v2.json').read_text(encoding='utf-8'))
data['audit'].extend(steps)
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
