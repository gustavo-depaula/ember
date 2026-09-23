"""Ps 128 draft 2: apply the v1 readers' remarks (see audit)."""
import json
from pathlib import Path

p = Path('research/psalterium/ps128/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
d['verses']['128:7'] = "{dequo} não encheu a mão {qui_metit}, * nem {sinum} {qui_colligit} os feixes."

dec = {x['id']: x for x in d['decisions']}

# fabricaverunt: forjaram first
f = dec['fabricaverunt']
opts = {o['label']: o for o in f['options']}
opts['forjaram']['note'] = ("Draft 2, from the stylist (v1); the Latinist (v1, minor) and the ambiguity reader also found 'trabalharam' "
                            "generic (heard as 'worked behind my back' or 'loaded their work on me'). The smith's verb, one of fabricári's own "
                            "senses (L&S 'forge'), and like fabricári it also means to contrive ('forjar uma mentira'), so the Latin's double "
                            "reach is kept. Used without an object, as the Latin is.")
opts['forjaram']['from'] = 'stylist'
opts['trabalharam']['note'] = "Draft 1. Matos Soares 1932; DRB 'wrought'. Three readers found it generic; the image of craft on the back is lost."
opts['fabricaram']['note'] = ("The Latinist's fix (v1, minor), the cognate. Refused: the 73:16 stylist heard factories in it, and without an "
                              "object 'fabricaram' is not a Portuguese sentence.")
opts['fabricaram']['from'] = 'latinist'
f['options'] = [opts['forjaram'], opts['trabalharam'], opts['fabricaram']]
f['why'] += (" Draft 2: all three readers found 'trabalharam' too vague; 'forjaram' taken (see its note).")

# justus: relative first
j = dec['justus']
j['options'] = [j['options'][1], j['options'][0]]
j['options'][0]['note'] = ("Draft 2, the stylist's (v1): the comma gives a breath and 'O Senhor justo' in one run sounded like a title. "
                           "A copula supplied in a relative (rule 2); MS1932 and DRB. +3 syllables (19 against 15).")
j['options'][0]['from'] = 'stylist'
j['options'][1]['note'] = "Draft 1. Word for word; the stylist found it stiff, like a title."

# fenum: dequo forms now the pronoun
fe = dec['fenum']
fe['options'][0]['forms']['dequo'] = 'Dela'
fe['options'][1]['forms']['dequo'] = 'Dele'
fe['refs'] = ['128:6', '128:7']

# sinum: regaço first
s = dec['sinum']
so = {o['label']: o for o in s['options']}
so['regaço']['forms'] = {'sinum': 'o regaço'}
so['regaço']['note'] = ("Draft 2, the stylist's (v1): both the stylist and the ambiguity reader heard 'seio' as the breast. The regaço is the "
                        "fold of the garment used to carry things (collecting in the regaço is its ordinary use). A local departure from the "
                        "glossary's 'sinus → seio' (open; 34:13b, 73:11, where the hand is in the bosom and 'seio' still serves). The "
                        "possessive 'suum' is not repeated, as with 'a mão' (see decision relclause).")
so['regaço']['from'] = 'stylist'
so['seio']['forms'] = {'sinum': 'o seu seio'}
so['seio']['note'] = "Draft 1. The glossary's word; DRB 'bosom'. Heard as the breast by two readers."
s['options'] = [so['regaço'], so['seio'], so['os seus braços']]
s['why'] += " Draft 2 takes 'regaço' (see its note)."

# new decision: the build of 128:7
d['decisions'].insert(d['decisions'].index(s), {
    'id': 'relclause',
    'refs': ['128:7'],
    'latin': 'De quo non implévit manum suam qui metit, et sinum suum qui manípulos cólligit',
    'kind': 'grammar',
    'why': ("The stylist (v1) found 'Da qual' at the head of a new verse a dangling relative the ear cannot tie back, and 'o que ceifa' "
            "wavering between 'what he reaps' and 'he who reaps' (the ambiguity reader heard the same and found the order hard). "
            "Taken as grammar (D2): the relative 'De quo' becomes the pronoun 'Dela' (the grass; the fenum decision fills it), "
            "'qui metit' becomes 'quem ceifa', and the body part takes the article without the possessive, as Portuguese says it "
            "('encher a mão'). The Latin order and the parallel of the two colons are kept."),
    'options': [
        {'label': 'Dela … a mão quem ceifa … quem recolhe', 'forms': {'qui_metit': 'quem ceifa', 'qui_colligit': 'quem recolhe'},
         'note': "Draft 2, the stylist's wording; 'suam' and 'suum' are carried by the article.", 'from': 'stylist'},
        {'label': 'Da qual … a sua mão o que ceifa … o que recolhe', 'forms': {'qui_metit': 'o que ceifa', 'qui_colligit': 'o que recolhe'},
         'note': "Draft 1 (with 'Da qual' and 'a sua mão'): the relative and both possessives as in the Latin. To restore it wholly, "
                 "the verse must also read 'Da qual não encheu a sua mão'.", 'from': 'draft'},
    ],
})

d['choices']['128:4'] += (" The ambiguity reader heard 'cortou os pescoços' as beheading first, and the breaking of pride (the stiff neck) "
                          "third; the Latin 'concídit cervíces' (cut to pieces the necks) is as violent, and the image is kept.")
d['choices']['128:7'] = ("'métere → ceifar' and 'manípulus → feixe' as 125:5–6b. 'et' after a negative → 'nem'. The build is decision relclause; "
                         "the word for sinus is decision sinum.")
d['choices']['128:8'] += (" 'bendissemos' was listed as unknown by the ambiguity reader and heard as a present; kept for 117:26b's identical "
                          "Latin (decision benediximus, where the present is option 2). Whether 'nós vos bendissemos' continues what "
                          "was not said or is the psalmist's own blessing stays open, as the reader found it.")

d['audit'].append({'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': "claude-opus-5-5, fresh context. One minor (128:3 'trabalharam' generic); the fix 'fabricaram' refused, the complaint met by 'forjaram'.",
                   'outcomes': [{'verse': '128:3', 'remark': "fabricavérunt → trabalharam is generic; fix 'fabricaram'", 'outcome': 'option', 'decision': 'fabricaverunt',
                                 'reason': "The fault is taken (with the stylist's 'forjaram'); the cognate itself refused — without an object it is not Portuguese, and it was heard as factories at 73:16."}]})
d['audit'].append({'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': "claude-opus-5-5, fresh context. Four remarks: three taken, one refused. Best line 128:2, worst 128:7.",
                   'outcomes': [
                       {'verse': '128:3', 'remark': "'trabalharam' flat; 'forjaram'", 'outcome': 'taken'},
                       {'verse': '128:4', 'remark': "'O Senhor justo' stiff; 'O Senhor, que é justo,'", 'outcome': 'taken'},
                       {'verse': '128:7', 'remark': "'Da qual' dangling, 'o que ceifa' wavers, redundant possessive; 'Dela não encheu a mão quem ceifa'; 'seio' heard as breast → 'regaço'", 'outcome': 'taken'},
                       {'verse': '128:8', 'remark': "set the greeting and the second colon in quotation marks", 'outcome': 'refused',
                        'reason': "This psalter sets speech after a colon with a capital and no quotation marks (4:6); and quoting the second colon would decide who speaks it, which the Latin leaves open (decision benediximus)."}]})
d['audit'].append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': "claude-opus-5-5, fresh context, blind. 14 ambiguities, 5 unknown words (iniquidade, ceifa, feixes, seio as garment fold, bendissemos).",
                   'outcomes': [
                       {'verse': '128:1', 'remark': "whether the first clause is what Israel says", 'outcome': 'refused', 'reason': "The Latin's own openness (decision dicat)."},
                       {'verse': '128:3', 'remark': "'trabalharam' heard as 'behind my back' / beast of burden", 'outcome': 'taken', 'reason': "'forjaram' (decision fabricaverunt)."},
                       {'verse': '128:4', 'remark': "'cortou os pescoços' heard as beheading", 'outcome': 'refused', 'reason': "The Latin's image is as violent; kept (choices 128:4); 'as cervizes' is option 2 of decision cervices."},
                       {'verse': '128:7', 'remark': "'seio' heard as the breast; 'o que ceifa' as 'what he reaps'; order hard", 'outcome': 'taken', 'reason': "'regaço', 'quem ceifa', 'Dela' (decisions sinum, relclause)."},
                       {'verse': '128:8', 'remark': "who speaks 'nós vos bendissemos'", 'outcome': 'refused', 'reason': "The Latin leaves it open; no 'mas' supplied (decision benediximus)."},
                       {'verse': '128:8', 'remark': "'bendissemos' heard as present / unknown", 'outcome': 'refused', 'reason': "Identical Latin at 117:26b has 'bendissemos' (rule 6); the present is option 2."}]})
d['audit'].append({'step': 'revision', 'version': 2, 'note': "v2: 128:3 'forjaram'; 128:4 'O Senhor, que é justo,'; 128:7 'Dela não encheu a mão quem ceifa, * nem o regaço quem recolhe os feixes.' Draft 1 kept as prayed.v1.json."})

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
