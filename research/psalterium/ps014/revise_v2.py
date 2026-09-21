"""Ps 14 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps014/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2
data['status'] = 'reviewed'

# 14:3a — 'usou de … na sua língua' heard as built on the Latin
d = decisions['dolum']
d['why'] += ' Heard (draft 1): the stylist — «A combinação de “usou de” com “na sua língua” soa montada sobre o latim e dificulta a compreensão ao ouvir» → ‘que não praticou engano com a sua língua’. The Latinist passed draft 1.'
d['options'][0]['note'] = 'Draft 1. ' + d['options'][0]['note'].removeprefix('Ruling: ')
d['options'][0]['from'] = 'draft'
d['options'].insert(0, option('não usou de engano com a sua língua', {'dolum': 'não usou de engano com a sua língua'}, 'Ruling (draft 2): the stylist’s preposition taken — ‘in lingua sua’ is instrumental, as linguis suis in 13:3b / 5:11a (‘com as suas línguas’); a preposition follows Portuguese use (D2). His verb ‘praticou’ refused: ‘praticar’ is operári’s, and operátur justítiam stands in the verse before (‘pratica a justiça’) — egit and operátur would become one verb. dolus keeps its noun; ‘enganar’ stays free for décipere (14:4b).', 'stylist'))
d['options'].append(option('não praticou engano com a sua língua', {'dolum': 'não praticou engano com a sua língua'}, 'The stylist’s line. Refused: ‘praticar’ is operári’s (14:2 ‘pratica a justiça’, one verse before).', 'stylist'))

# 14:3b — the stylist wants 'fez mal ao seu próximo'
d = decisions['proximo']
d['why'] += ' Heard (draft 1): the stylist — «A separação de “fez” e “mal” retarda uma expressão naturalmente imediata na fala» → ‘nem fez mal ao seu próximo’. Refused: it puts the proparoxytone ‘próximo’ at the mediant (rule 4; the glossary row próximus, and Ps 11:3 was recast for the same reason); his line is option 2.'
d['options'][1]['from'] = 'stylist'
d['options'][1]['note'] = 'The stylist’s line (the everyday order); the mediant falls on the proparoxytone ‘próximo’ (rule 4).'

# 14:4a — 'À vista dele' / 'Aos olhos dele'
d = decisions['adnihilum']
d['why'] += ' Heard (draft 1): the stylist — «“À vista dele” soa como indicação de algo presenciado fisicamente; “aos olhos dele” exprime com mais naturalidade esse olhar que julga». The blind reader heard ‘À vista dele’ first as ‘aos olhos do homem descrito’ — the judging look, rightly.'
d['options'].insert(1, option('Aos olhos dele, o malvado foi reduzido a nada', {'adnihilum': 'Aos olhos dele, o malvado foi reduzido a nada'}, 'The stylist’s line. Refused: ‘olho’ is óculus’s word (ante óculos → diante dos olhos, 13:3d) and conspéctus keeps ‘vista’ (glossary, open; 9:20, 9:26a); the blind reader heard ‘à vista dele’ as the judging look, so nothing is lost by it.', 'stylist'))

# 14:4b — 'e não aceitou' -> 'nem aceitou'
data['verses']['14:4b'] = '{q4b} jura ao seu próximo, e {decipit}, * {q4b2} não deu o seu dinheiro {usuram}, {nec} {munera} contra o inocente.'
data['decisions'].append({
    'id': 'nec', 'refs': ['14:4b'], 'latin': 'et múnera super innocéntem non accépit', 'kind': 'grammar',
    'why': 'The second colon of 14:4b is the psalm’s longest (27 Latin syllables). The stylist: «A vírgula seguida de “e não” provoca uma retomada pesada» → ‘nem aceitou dádivas’. ‘nem’ is ‘e não’ in one word — grammar (D2).',
    'options': [
        option('nem aceitou', {'nec': 'nem aceitou'}, 'Ruling (draft 2): the stylist’s conjunction; every word of the Latin kept, accépit still ‘aceitou’ as in 14:3b. His dropping of the article (‘seu dinheiro’) not taken: the glossary keeps the article before possessives.', 'stylist'),
        option('e não aceitou', {'nec': 'e não aceitou'}, 'Draft 1: ‘et … non’ word for word.', 'draft'),
    ],
})

# 14:5b — the stylist's worst line: 'para sempre não será abalado'
d = decisions['aeternum']
d['why'] += ' Heard (draft 1): the stylist named it the worst line of the psalm — «A anteposição de “para sempre” à negação soa estrangeira e enfraquece a segurança da conclusão» → ‘jamais será abalado’. The blind reader heard ‘Permanecerá firme’ — the right sense, with no hint of ‘not permanently’. The Latinist passed it.'
d['options'][0]['note'] = 'Ruling (drafts 1–2), held against the stylist: his ‘jamais’ drops in ætérnum’s own phrase, which D23 fixed as ‘para sempre’ for all its places, and the adverb must stand before the negation, as 118:93 ‘Para sempre não esquecerei’, or the line is heard as ‘not shaken for good’ (D27’s fault at 9:19). Heard rightly by the blind reader. For Gustavo’s ear: this is the place where D23 costs most, and ‘jamais será abalado’ (the Diurnal, and the stylist) is one touch away. 124:1 non commovébitur in ætérnum and 111:6 will meet the same choice.'
d['options'][2]['from'] = 'stylist'
d['options'][2]['note'] = 'The stylist’s line, and the Diurnal’s (Matos Soares 1932 ‘não será jamais comovido’): the natural Portuguese for ‘never’; it drops in ætérnum’s word (D23).'

data['choices']['14:3a'] = 'loqui veritátem → ‘falar a verdade’ (véritas → verdade, glossary); in corde suo → ‘no seu coração’, as the Latin. in lingua sua → ‘com a sua língua’: the instrumental in, as linguis suis in 13:3b.'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
