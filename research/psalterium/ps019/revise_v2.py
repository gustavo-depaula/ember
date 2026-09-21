"""Ps 19 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps019/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


data['version'] = 2
data['status'] = 'reviewed'

# 19:4 first colon — the Latinist (major: the plural), the blind reader (heard 'Lembre-se' as an order to the listener)
d = decisions['omnis']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «O plural é defensável como interpretação distributiva, mas altera o singular do latim»'
             ' → ‘todo o teu sacrifício’; the blind reader heard ‘Lembre-se de todos os teus sacrifícios’ FIRST as an order to the listener'
             ' («lembre-se dos seus sacrifícios») and ‘sacrifícios’ first as personal privations. Both taken: the singular kept by ‘cada’ (which'
             ' also says ‘every’ and points to discrete offerings, not to self-denial as ‘todo o teu sacrifício’ would), and the subject named'
             ' (D2: a subject hidden in a verb ending may be named) so that the jussive cannot be heard as an imperative.')
demote(d)
data['verses']['19:4'] = '{omnis}: * e {pingue}.'
old = d['options']
d['options'] = [
    option('Que ele se lembre de cada sacrifício teu', {'omnis': 'Que ele se lembre de cada sacrifício teu'},
           'Ruling (draft 2): the singular kept by ‘cada’ (the Latinist’s number; the Diurnal’s ‘cada oferta’, DM1962), the subject named so that'
           ' ‘Lembre-se’ is not heard as said to the listener.', 'latinist'),
    option('Que ele se lembre de todo o teu sacrifício', {'omnis': 'Que ele se lembre de todo o teu sacrifício'},
           'The Latinist’s words: the singular with ‘todo’, which is heard as ‘the whole of your sacrifice’ — the self-denial the blind reader'
           ' heard first.', 'latinist'),
    option('Lembre-se de todos os teus sacrifícios', {'omnis': 'Lembre-se de todos os teus sacrifícios'},
           'Draft 1 (Douay-Rheims, Matos Soares 1932): the plural for ‘every’; ‘Lembre-se’ heard first as an order to the listener.', 'DRB'),
    option('Lembre-se de cada sacrifício teu', {'omnis': 'Lembre-se de cada sacrifício teu'}, old[1]['note'], 'DM1962'),
]

# 19:4 second colon — the Latinist (fiat = become), the stylist ('gordo' prosaic)
d = decisions['pingue']
d['why'] += (' Heard (draft 1): the Latinist (within the same major) — «Fiat exprime tornar-se ou ser feito; “seja” apresenta apenas um estado» →'
             ' ‘se torne gordo’; the stylist — «“Gordo”, aplicado diretamente a “holocausto”, soa involuntariamente prosaico» → ‘seja rico em'
             ' gordura’; the blind reader heard the fat animal first, ‘an abundant offering’ second — the image and its sense. The Latinist'
             ' taken (the verb); the stylist’s ‘rico em gordura’ refused, kept as an option: it keeps the fat, but adds ‘rico’ and keeps the'
             ' ‘seja’ the Latinist refused. ‘holocausto’ was listed as unknown and heard beside the Holocaust — the Latin’s word, kept.')
demote(d)
old = {o['label']: o for o in d['options']}
d['options'] = [
    option('o teu holocausto se torne gordo', {'pingue': 'o teu holocausto se torne gordo'},
           'Ruling (draft 2): fíeri as becoming (the Latinist; Douay-Rheims ‘be made fat’, the Greek πιανάτω ‘be fattened’). Here fíeri has a'
           ' predicate adjective, so the glossary’s jussive ‘Seja’ (118:76, 80, where Fiat stands alone) does not apply.', 'latinist'),
    option('o teu holocausto seja gordo', {'pingue': 'o teu holocausto seja gordo'}, d['options'][0]['note'], 'draft'),
    option('o teu holocausto seja rico em gordura', {'pingue': 'o teu holocausto seja rico em gordura'},
           'The stylist’s line: the fat kept in a noun; ‘rico’ added, and the state ‘seja’ the Latinist refused.', 'stylist'),
    old['o teu holocausto seja pingue'],
    old['o teu holocausto lhe seja agradável'],
]

# 19:5 — the Latinist (major: number, and 'conselhos' heard as advice); the blind reader heard advice given to others first
d = decisions['consilium']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Consilium designa aqui o plano ou propósito, no singular. “Todos os teus conselhos”'
             ' altera o número e sugere recomendações» → ‘todo o teu desígnio’; the blind reader heard ‘confirme todos os teus conselhos’ FIRST as'
             ' «os conselhos dados a outras pessoas». Two readers against the glossary word in this place: taken. The glossary row consílium'
             ' → conselho holds where the word is advice or a council (1:1, 12:2); a person’s own plan, confirmed by God, is ‘desígnio’ here'
             ' (Matos Soares 1932’s word, in the singular). Cost: ‘desígnios’ was listed as unknown by a blind reader in Ps 9 — it is the'
             ' Church’s word for God’s plans, and was not listed here.')
demote(d)
d['options'].insert(0, option('confirme todo o teu desígnio', {'consilium': 'confirme todo o teu desígnio'},
                              'Ruling (draft 2): the Latinist’s fix — the singular, and the plan (not advice).', 'latinist'))
d['options'].insert(2, option('confirme todo o teu conselho', {'consilium': 'confirme todo o teu conselho'},
                              'The glossary word in the Latin’s number; still heard as advice (or a council).', 'glossary'))

# 19:7b — the stylist's worst line ('em poderes')
d = decisions['potentatibus']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «“Em poderes” não encontra apoio no português corrente: o ouvinte precisa'
             ' reconstruir a expressão enquanto reza. A inversão aumenta essa dificuldade» → ‘a salvação da sua direita está em atos de poder’.'
             ' The Latinist passed ‘em poderes’. Taken: the stylist changes how the plural is said (the natural order, and the plural of power'
             ' as acts of power — δυναστεῖαι), not what it says; ‘poder’ keeps the root.')
demote(d)
d['options'].insert(0, option('a salvação da sua direita está em atos de poder',
                              {'potentatibus': 'a salvação da sua direita está em atos de poder'},
                              'Ruling (draft 2): the stylist’s line — natural order, the plural said as ‘atos de poder’.', 'stylist'))

# 19:8 — the blind reader heard 'carros' first as automobiles
d = decisions['hi']
d['why'] += (' Heard (draft 1): the blind reader heard ‘carros’ FIRST as automobiles («embora cavalos possa sugerir veículos antigos») and'
             ' the verbless colon as ‘uns andam em carros’ (travel) before ‘confiam’. The first is a wrong first hearing: taken — ‘carros de'
             ' guerra’ is the Portuguese name of the chariot, not a gloss on it (currus in battle, where 19:9 has the fallen). The colon stays'
             ' verbless, as the Latin.')
demote(d)
d['options'].insert(0, option('Uns em carros de guerra, e outros em cavalos', {'hi': 'Uns em carros de guerra, e outros em cavalos'},
                              'Ruling (draft 2): the chariot named so that it is not heard as a car; verbless as the Latin.', 'ambiguity'))
d['options'] = [o for i, o in enumerate(d['options']) if not (i > 0 and o['label'] == 'Uns em carros de guerra, e outros em cavalos')]

# 19:7a — the Latinist's minor (the perfect): refused
d = decisions['cognovi']
d['why'] += (' Heard (draft 1): the Latinist, minor — «O presente exprime defensavelmente o resultado de cognovi, mas não conserva o perfeito'
             ' que enuncia a aquisição desse conhecimento» → ‘agora reconheci’. Refused: ‘reconhecer’ is to acknowledge (another verb),'
             ' and the state is what the perfect of a knowing-verb says (the glossary’s novit → conhece); ‘agora conheci’ and ‘agora soube’'
             ' keep the perfect and are options. The blind reader did not stop at it.')
d['options'].append(option('agora reconheci', {'cognovi': 'agora reconheci'},
                           'The Latinist’s fix: the perfect kept; ‘reconhecer’ is to acknowledge.', 'latinist'))

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
