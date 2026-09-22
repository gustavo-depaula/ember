"""Record the v2 gate in Ps 50's prayed.json (options + audit). Run once."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def add(did, option):
    if all(o['forms'] != option['forms'] for o in dec[did]['options']):
        dec[did]['options'].append(option)


add('dealbabor', {'label': 'serei alvejado mais que a neve', 'forms': {'dealbabor': 'serei alvejado mais que a neve'}, 'note': 'the gate\'s fix (v2); *alvejado* is first heard as \'shot at\' (alvo). Refused.', 'from': 'latinist'})
add('exsultabit', {'label': 'exaltará com júbilo a vossa justiça', 'forms': {'exsultabit': 'exaltará com júbilo a vossa justiça'}, 'note': 'the gate\'s fix (v2); keeps the object by changing the verb (exaltáre) and adding a noun. Refused.', 'from': 'latinist'})

d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Gate, claude-opus-5-5 (fresh context). No major. Three minors, all repeats of draft 1\'s refused points; every draft-2 change passed (8, 18, 20, 21). Held, with reasons; the fixes added as options.', 'outcomes': [
    {'verse': '50:9', 'remark': 'passive *dealbábor*: *serei alvejado mais que a neve*', 'outcome': 'option', 'decision': 'dealbabor', 'reason': '*alvejado* is heard as \'shot at\'; *ficar* + adjective is the Portuguese resultative'},
    {'verse': '50:16', 'remark': 'plural *dos sangues*', 'outcome': 'refused', 'reason': 'D29 (settled)'},
    {'verse': '50:16', 'remark': 'transitive object: *exaltará com júbilo a vossa justiça*', 'outcome': 'option', 'decision': 'exsultabit', 'reason': 'another Latin verb plus a supplied noun; *exultar* takes no object in Portuguese'},
]})
d['audit'].append({'step': 'glossary', 'note': 'Rows added (open, Ps 50): réddere (give back) → devolver, principális → soberano, contribuláre → atribulado, incértus → incerto, víscera → entranhas, ámplius → ainda mais, dealbári → ficar mais branco, benígne fac → tratar benignamente, impónere super → pôr sobre, contra me (ἐνώπιον) → diante de mim, audítus → ouvido, hyssópus → hissopo, spíritus sanctus tuus (lower case); formula rows *Dómine, lábia mea apéries*, *Aspérges me*, *Cor mundum crea in me*. Evidence added to miseratiónes, mundáre, gáudium, vítulus, proícere, confirmáre, convértere (D25 extended), despícere (God) (50:19 → desprezar by the Greek), réddere, sanguínes, delectátio, contérere, oblátio, exsultáre, *Miserére mei*. PROGRESS row inserted after Ps 49.'})
d['status'] = 'done'
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded')
