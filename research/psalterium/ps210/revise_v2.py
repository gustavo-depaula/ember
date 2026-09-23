"""v2 of ps210 from prayed.v1.json: the v1 readers' remarks (critic/v1.*.json)."""
import json
from pathlib import Path

here = Path(__file__).parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))

# Clementine prints 'spiritus et animæ justorum', 'sancti et humiles corde' with no comma (consult/bolls-VULG-27-3.json)
commas = {'{cete}, e tudo': '{cete} e tudo', 'espíritos, e almas': 'espíritos e almas', 'santos, e humildes': 'santos e humildes'}

def fix(s):
    for a, b in commas.items():
        s = s.replace(a, b)
    return s

def walk(x):
    if isinstance(x, str):
        return fix(x)
    if isinstance(x, dict):
        return {k: walk(v) for k, v in x.items()}
    if isinstance(x, list):
        return [walk(v) for v in x]
    return x

p['verses'] = walk(p['verses'])
for d in p['decisions']:
    for o in d['options']:
        o['forms'] = walk(o['forms'])

p['verses']['3:75'] = p['verses']['3:75'].replace('louvemo-lo e {sx75}', '{eum75}')

dec = {d['id']: d for d in p['decisions']}
sx = dec['superexaltare']
sx75 = {o['label']: o['forms'].pop('sx75') for o in sx['options']}
sx['refs'].remove('3:75')
sx['why'] += ' In 3:75 the verb stands inside the decision `eum75`, which uses the option chosen here.'

tail = {'sumamente': 'sumamente', 'muito': 'muito', 'exaltai-o (prefix dropped)': '', 'acima de tudo': 'acima de tudo'}
adv = tail[sx['options'][0]['label']]
dec75 = {
    'id': 'eum75', 'refs': ['3:75'], 'latin': 'laudémus et superexaltémus eum', 'kind': 'grammar',
    'why': "The hortative with the singular *eum* after the three Persons. Enclisis on a first person plural (*louvemo-lo*) is correct, but the v1 stylist called it bookish and the worst line. The CNBB drops the pronoun (*louvemos e exaltemos*, fetched, `circulation.md`). The adverb follows the option chosen in `superexaltare`.",
    'options': [
        {'label': 'a ele louvemos e exaltemos', 'forms': {'eum75': f'a ele louvemos e exaltemos {adv}'.rstrip().replace('  ', ' ')},
         'note': "v2, the v1 stylist's line. *Eum* is kept as *a ele* and put first, so the singular after the three Persons is heard and stressed. A direct object with a preposition is literary, but it is common in prayer (*a ele a glória*). It is not the same shape as *louvai-o e exaltai-o* in 3:57/3:74, but 3:75 already differs from them in the Latin (a new person and a new verse).", 'from': 'stylist'},
        {'label': 'louvemo-lo e exaltemo-lo', 'forms': {'eum75': ('louvemo-lo e ' + sx75[sx['options'][0]['label']])},
         'note': "Draft 1. The Latin's order, with the refrain's enclisis carried into the first person. Correct, but it is the bookish *-mo-lo* twice.", 'from': 'draft'},
        {'label': 'louvemos e exaltemos (pronoun dropped)', 'forms': {'eum75': f'louvemos e exaltemos {adv}'.rstrip().replace('  ', ' ')},
         'note': "The CNBB's form. Easy on the ear, but it loses *eum*.", 'from': 'CNBB'},
    ],
}
p['decisions'].insert(p['decisions'].index(dec['cum']) + 1, dec75)

sp = dec['spiritus']
order = ['sopros', 'ventos', 'espíritos']
sp['options'].sort(key=lambda o: order.index(o['label']))
sp['options'][0]['note'] = "v2, asked by both the v1 Latinist and the v1 stylist. It is the 102:16 solution: *sopro* is wind and breath at once, so it leaves open what the Latin leaves open. *ventos* would decide it. The weather list around it still gives the sense. Cost: in the plural it can sound like puffs."
sp['options'][0]['from'] = 'glossary'
sp['options'][1]['note'] = "Draft 1, with 148:8 (*spíritus procellárum* → *vento*). This is the sense the list gives. DM1962 has *ventos de Deus*; CNBB has *Brisa e ventos*. Both v1 readers found that it closes the Latin's double sense."

c = p['choices']
c['3:61'] = "*omnes spíritus Dei* → *todos os sopros de Deus* (decision `spiritus`, v2). " + c.get('3:61', '')
c['3:69'] = "No comma after *baleias* (v1 stylist: the pause breaks the colon in two); the Clementine has one after *cete*, DO too, but it is print, not sense. *ómnia, quæ movéntur in aquis* → *tudo o que se move nas águas*. *vólucres cæli* → *aves do céu* (8:9, 103:12). The CNBB has *pássaros*."
c['3:73'] = "*spíritus* here means spirits (of the just, beside their souls) → *espíritos*. Compare 3:61. The commas after *espíritos* and *santos* are gone in v2. The Clementine prints *spíritus et ánimæ justórum* and *sancti et húmiles corde* with no comma. Spoken, the comma cannot be heard anyway (v1 ambiguity reader), and without it *dos justos / de coração* may govern one noun or both, as in the Latin. *húmiles corde* → *humildes de coração* (*húmilis* D27; *retos de coração*)."
c['3:75'] = c['3:75'].replace("→ *louvemo-lo e exaltemo-lo*.", "→ *a ele louvemos e exaltemos* (decision `eum75`, v2).")

def o(verse, remark, outcome, reason=None, decision=None):
    r = {'verse': verse, 'remark': remark, 'outcome': outcome}
    if decision: r['decision'] = decision
    if reason: r['reason'] = reason
    return r

p['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': "Reader: claude-opus-5-5, fresh context, with latin.json. It made one minor remark and no majors. Overall it found the draft faithful verse by verse. It named as kept: the repeated *æstus*, the jussives of 3:66 and 3:71, the hortatives of 3:75, the plurals, and one mediant per verse.",
     'outcomes': [o('3:61', "spíritus Dei: 'ventos' closes the wind/spirit sense; fix 'sopros'", 'taken', decision='spiritus')]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': "Reader: claude-opus-5-5, fresh context, with latin.json. It made six remarks. Worst line: 3:75. Best: 3:60. It judged the litany's *Bendizei …, ao Senhor* steady, with a clean oxytone cadence at every mark.",
     'outcomes': [
        o('3:57', "refrain 'sumamente pelos séculos' drags; 'para sempre'", 'refused', "D43 settles *in sǽcula* → *pelos séculos*. The proparoxytone is the Latin's *sǽcula*, and the stylist granted that the tone can absorb it.", 'superexaltare'),
        o('3:61', "'ventos' settles spíritus and breaks the echo with 3:73; 'sopros'", 'taken', decision='spiritus'),
        o('3:64', "'gelos' odd in the plural; 'gelo e neves'", 'option', "*Gelos e neves* is the CNBB's and DM1962's line (fetched, `circulation.md`), and it keeps the Latin plural beside *nives*. The singular stays open as the *regelo … gelo* option.", 'gelu'),
        o('3:69', "comma after 'baleias' breaks the colon", 'taken'),
        o('3:73', "comma after 'espíritos' cuts it from its genitive", 'taken', "Also taken at *santos, e humildes* for the same reason. The Clementine has no comma in either place."),
        o('3:75', "'louvemo-lo e exaltemo-lo' bookish; 'a ele louvemos e exaltemos sumamente'", 'taken', decision='eum75'),
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "Reader: claude-opus-5-5, fresh context, Portuguese only. It found sixteen ambiguities and four unknown words (*firmamento*, *sumamente*, *Azarias*, *Misael*). Most are the Latin's own openness, heard correctly: *céus*, *poderes*, *filhos dos homens*, *Israel*, *servos*, *santos*, and *Bendito sois … no firmamento*.",
     'outcomes': [
        o('3:62', "'calor' twice may sound like an error", 'option', "The Latin says *æstus* twice. Rule 2 keeps its repetitions. *ardor* (CNBB) stays an option.", 'aestus'),
        o('3:66', "'louve-o e exalte-o' could be heard as a command to 'você'", 'refused', "The subject *a terra* stands in the first colon, and the reader heard it as the subject. The same holds for Israel at 3:71."),
        o('3:73', "'espíritos, e almas dos justos' / 'santos, e humildes': one group or two", 'taken', "The commas are gone (see stylist). One group or two is left open, as in the unpunctuated Latin."),
        o('3:73', "'espíritos' could be angels, the dead, or any spirit", 'refused', "It is the Latin's word, and it is next to *almas dos justos*."),
        o('3:74', "'Ananias' heard as Ananias of Acts; Azarias, Misael unknown", 'refused', "The names are the Latin's, and the CNBB and DM1962 print them. The canticle is the three young men's own song, and the rubric heading (D7, not printed) is where a reader learns this."),
        o('3:75', "singular 'lo' after three Persons may puzzle", 'refused', "It is the Latin's singular *eum*. In v2 *a ele* puts it first and stresses it."),
        o('3:57', "'sumamente' unknown", 'option', "Kept. It is said of God in the Ato de Contrição (*sumamente bom*, fetched). The CNBB drops it, and *muito* is the 36:35 retreat. For Gustavo: this is the second reader to find *sumamente* unfamiliar (after 36:35).", 'superexaltare'),
        o('3:56', "'firmamento' unknown", 'refused', "D31 is settled: *firmamento* means the sky. The CNBB has the same line."),
     ]},
    {'step': 'revision', 'version': 2,
     'note': "v2 changes: 3:61 *ventos* → *sopros*. 3:69 and 3:73 drop the commas copied from the Latin. 3:75 *louvemo-lo e exaltemo-lo* → *a ele louvemos e exaltemos* (new decision `eum75`; `superexaltare` no longer lists 3:75). Draft 1 is prayed.v1.json, and its flat text is prayed.v1.vos.json, the file the v1 critics read. Built by revise_v2.py."},
]
p['audit'].append({'step': 'checks', 'note': "Draft 2: hard pass. The soft flags are those of draft 1 (the Senhor/séculos echoes, the *sumamente* lengths, 3:67b and 3:68b at −3, the *séculos* finals), all accepted as before. The only change is 3:75b, now +4 (it was +3): *a ele* adds a syllable, which elides in speech (*a e-le*)."})
p['audit'].append({'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': "Gate on draft 2. Reader: claude-opus-5-5, fresh context, with latin.json. There were two minor remarks and no majors, and neither asked for a change. Overall it found the rendering faithful and close: every vocative, the repeated *æstus*, the jussives, the hortatives of 3:75 and the rubric are kept, nothing is added or dropped, and the marks match.",
    'outcomes': [
        o('3:61', "'sopros' settles spíritus on breath/wind and hides the echo with 3:73 'espíritos'; keep, or 'ventos'", 'option', "Kept. The reader itself calls it defensible and asks for no change. *sopro* is the psalter's word for wind and breath at once (102:16). *espíritos* would be heard as angels, and *ventos* is the other option.", 'spiritus'),
        o('3:64', "gelu (3:63 'gelo') and glácies (3:64 'gelos') share one root", 'option', "Kept, as the reader advises. *Pruína* already has *geada* (77:47, 118:83), and Portuguese has no fourth plain frost word. The number keeps the two apart, as the CNBB and DM1962 do (*Geada e frio … Gelos e neves*). *regelo … gelo* stays an option.", 'gelu'),
    ]})
p['version'] = 2
p['status'] = 'reviewed'
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote v2')
