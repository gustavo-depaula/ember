"""Ps 85 draft 2 from draft 1 (prayed.v1.json) and the three v1 readers.

usage: python3.13 research/psalterium/ps085/revise2.py
"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'

# 85:9 — the Latin's comma after fecísti, so the ear does not run 'fizestes virão' into 'fizestes vir' (ambiguity reader)
d['verses']['85:9'] = 'Todas as nações que fizestes, virão, e adorarão diante de vós, Senhor: * e glorificarão o vosso nome.'

dec = {x['id']: x for x in d['decisions']}


def promote(did, label, forms, note, frm, why_add=None, demote_note=None):
    x = dec[did]
    old = x['options'][0]
    if demote_note:
        old['note'] = demote_note
    rest = [o for o in x['options'] if o['label'] != label]
    x['options'] = [{'label': label, 'forms': forms, 'note': note, 'from': frm}] + rest
    if why_add:
        x['why'] += ' ' + why_add


promote(
    'secundum', 'igual às vossas obras', {'secundum': 'igual às vossas obras'},
    'Ruling (v2): the Latinist\'s fix — no subject supplied, so "nothing" and "no one" both stay open, as the Latin.', 'latinist',
    why_add='v2: the Latinist (minor) found that "nada" settles the subject as neuter, where the Latin could equally continue "non est símilis tui" (no one). "igual" leaves it open and keeps "não há … e não há".',
    demote_note='Draft 1: supplies "nothing", closing what the Latin leaves open (Latinist).',
)
promote(
    'imperium', 'domínio', {'imperium': 'domínio'},
    'Ruling (v2): keeps the sense of rule the Latinist asked for, without the cognate\'s "empire".', 'latinist',
    why_add='v2: the Latinist (minor) found "poder" too general (strength, not command) and asked for "império"; the ambiguity reader heard "poder" as "give strength". "império" refused (heard first as "empire" in Brazil); "domínio" gives the command/dominion sense L&S puts first after "command".',
    demote_note='Draft 1; MS1932. Plain, but heard as strength, not rule (Latinist, ambiguity reader).',
)
promote(
    'inferiori', 'mais profundo', {'inferiori': 'mais profundo'},
    'Ruling (v2): the stylist\'s; MS1932. Still a comparative, still downward.', 'stylist',
    why_add='v2: the stylist found "mais baixo" flat at the final cadence and asked for "mais profundo". Taken under D2: both are comparatives of downward place, the plainer and more usual wins; the link to 62:10 "mais baixas" is a root, not a formula.',
    demote_note='Draft 1: the root of inferior (62:10); flat at the cadence (stylist).',
)

# puer: Latinist asked 'criado' — refused, recorded
dec['puer']['why'] += ' v2: the Latinist (minor) asked "criado" to keep púer apart from servus (85:2, 3). Refused: the row (68:18) serves every place, the "servo … serva" pair in one colon is the pairing the Latin builds with "fílium ancíllæ", and "ao vosso criado" can also be heard as the participle "created". If Gustavo wants the distinction, "criado" is option 2.'
for o in dec['puer']['options']:
    if o['label'] == 'criado':
        o['note'] = 'Latinist (v1, minor): keeps púer apart from servus (85:2, 3); also heard as "created".'
        o['from'] = 'latinist'

# conspectu: stylist asked 'diante dos seus olhos' — refused, added as option
dec['conspectu']['why'] += ' v2: the stylist called "diante da sua vista" a calque and asked "diante dos seus olhos" (his worst line). Refused: 53:5 has the same words and the twin should sound as one; "olhos" is óculus\'s word (the conspéctus row refused "aos olhos" at 14:4a for the same reason); the ambiguity reader understood the line. His wording is option 3.'
dec['conspectu']['options'].append({'label': 'diante dos seus olhos', 'forms': {'conspectu': 'diante dos seus olhos'}, 'note': 'Stylist (v1); DRB "before their eyes". óculus\'s word.', 'from': 'stylist'})

# signum: stylist asked 'de bem' — refused, option
dec['signum']['why'] += ' v2: the stylist heard "para o bem" dangle and asked "um sinal de bem". Refused: "de bem" makes it a sign OF good, where "in bonum" (εἰς ἀγαθόν) is a sign FOR good; the ambiguity reader heard "give me a good sign" first, which is right. Option 4.'
dec['signum']['options'].append({'label': 'Fazei comigo um sinal de bem', 'forms': {'signum': 'Fazei comigo um sinal de bem'}, 'note': 'Stylist (v1): smoother; changes the relation.', 'from': 'stylist'})

# ettu, ut, servum: ambiguity remarks — held
dec['ettu']['why'] += ' v2: the ambiguity reader heard it as an unfinished statement and supplied "sois" mentally — exactly the Latin\'s two readings, the statement first. Held.'
dec['ut']['why'] += ' v2: the ambiguity reader found joy-then-fear puzzling and heard "rejoicing in reverence" loosely; "tema" as the noun could intrude in fast recitation. The puzzle is the Latin\'s own; held, with the Greek-based option.'
dec['servum']['why'] += ' v2: the ambiguity reader: the ear "briefly attaches" the relative to "meu Deus", then settles on the servant, as foreseen. Held.'

d['choices']['85:1'] += ' v2: the stylist (asking "necessitado") and the ambiguity reader both heard "carente" as emotional neediness first. Held under D38 ("necessitado" is egénus\'s, which 85:1 does not have but the psalter pairs with inops in 34:10); the evidence is added to the D38 row for Gustavo.'
d['choices']['85:2'] += ' v2: the ambiguity reader heard "porque sou santo" as a boast — the Latin\'s word, kept (rule 1); Douay-Rheims says the same.'
d['choices']['85:9'] += ' v2: comma after "fizestes", as the Latin after "fecísti": the ambiguity reader could run "fizestes virão" into "fizestes vir".'
d['choices']['85:16'] += ' The ambiguity reader heard Mary and Christ in "o filho da vossa serva" — the Latin carries the same echo (Lk 1:38 "ancílla Dómini"); kept.'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Three minors, no major: 85:8 taken, 85:16 impérium taken in part (domínio, not império), 85:16 púero refused.',
     'outcomes': [
         {'verse': '85:8', 'remark': '"nada" settles the subject the Latin leaves open', 'outcome': 'taken', 'decision': 'secundum'},
         {'verse': '85:16', 'remark': 'impérium = command/dominion; "poder" too abstract → "império"', 'outcome': 'taken', 'decision': 'imperium'},
         {'verse': '85:16', 'remark': 'púero merged with servus → "criado"', 'outcome': 'option', 'decision': 'puer', 'reason': 'The púer row (68:18); servo/serva pair with fílium ancíllæ; "criado" also heard as "created".'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Four remarks; best 85:10, worst 85:14. One taken (85:13), three refused and kept as options or recorded.',
     'outcomes': [
         {'verse': '85:1', 'remark': '"carente" emotional → "necessitado"', 'outcome': 'refused', 'reason': 'D38 (inops → carente); "necessitado" is egénus\'s. Evidence added to the row.'},
         {'verse': '85:13', 'remark': '"mais baixo" flat → "mais profundo"', 'outcome': 'taken', 'decision': 'inferiori'},
         {'verse': '85:14', 'remark': '"diante da sua vista" calque → "diante dos seus olhos"', 'outcome': 'option', 'decision': 'conspectu', 'reason': 'Twin of 53:5; olhos is óculus\'s word.'},
         {'verse': '85:17', 'remark': '"para o bem" dangles → "de bem"', 'outcome': 'option', 'decision': 'signum', 'reason': '"de bem" changes "in bonum" (for good) into a sign of good.'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. 18 ambiguities, 2 unknown words (iníquos; carente in its material sense). One change (85:9 comma); the rest are the Latin\'s own openings or known costs of settled rows (inferno, alma, congregação, carente).',
     'outcomes': [
         {'verse': '85:1', 'remark': '"carente" heard as emotional need', 'outcome': 'refused', 'reason': 'D38; recorded on the row.'},
         {'verse': '85:2', 'remark': '"sou santo" heard as a boast', 'outcome': 'refused', 'reason': 'The Latin\'s word (sanctus row).'},
         {'verse': '85:2', 'remark': 'relative briefly attached to "meu Deus"', 'outcome': 'refused', 'decision': 'servum', 'reason': 'Settles on the servant; the Latin order serves the Preces split.'},
         {'verse': '85:5', 'remark': '"suave" vague', 'outcome': 'refused', 'decision': 'suavis', 'reason': 'The suávis row (33:9).'},
         {'verse': '85:7', 'remark': 'causality of "porque me escutastes"', 'outcome': 'refused', 'reason': 'The Latin\'s quia; = 16:6.'},
         {'verse': '85:9', 'remark': '"fizestes virão" run together', 'outcome': 'taken'},
         {'verse': '85:11', 'remark': 'joy/fear puzzling; "tema" as noun', 'outcome': 'refused', 'decision': 'ut', 'reason': 'The Latin\'s ut; option kept.'},
         {'verse': '85:13', 'remark': 'inferno heard as hell of the damned', 'outcome': 'refused', 'reason': 'inférnus row, for Gustavo.'},
         {'verse': '85:14', 'remark': '"a minha alma" heard spiritually; "congregação" religious; "iníquos" unknown', 'outcome': 'refused', 'reason': 'ánima, synagóga and iníquus rows; 53:5 twin.'},
         {'verse': '85:15', 'remark': 'verbless heard as unfinished statement', 'outcome': 'refused', 'decision': 'ettu', 'reason': 'Both readings are the Latin\'s.'},
         {'verse': '85:16', 'remark': '"filho da vossa serva" heard as Christ; "poder" as strength', 'outcome': 'taken', 'decision': 'imperium'},
         {'verse': '85:17', 'remark': '"comigo" as "along with me"', 'outcome': 'refused', 'decision': 'signum', 'reason': 'Heard rightly first ("give me a good sign").'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 85:8 "igual às vossas obras" (Latinist); 85:9 comma after "fizestes" (ambiguity reader); 85:13 "mais profundo" (stylist); 85:16 "domínio" (Latinist, in part). Draft 1 kept as prayed.v1.json (flat prayed.v1.vos.json, which the v1 readers read). Script: ps085/revise2.py.'},
]

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
