"""Draft 2 of canticle 211 from the v1 readers (prayed.v1.json kept). Run once."""
import json
from pathlib import Path

path = Path(__file__).parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
assert d['version'] == 1
d['version'] = 2
dec = {x['id']: x for x in d['decisions']}

# 29:11c — the whole second colon becomes the slot, so the stylist's word order can stand as an option
d['verses']['29:11c'] = 'Vosso, Senhor, é o reino, * {super}.'
dec['super']['why'] += (' The stylist (v1) heard the proparoxytone final príncipes as a weak cadence and asked for the order '
                        '"e sobre todos os príncipes estais vós". Refused: the Latin ends on the same word with the same stress '
                        '(PRÍN-ci-pes), so the tone meets the Portuguese exactly as it meets the Latin; and ending on "estais vós" is an '
                        'inversion the ear notices as literary, which rule 5 forbids for its own sake. Kept as an option.')
dec['super']['options'] = [
    {'label': 'sobre', 'forms': {'super': 'e vós estais sobre todos os príncipes'}, 'note': 'Draft 1 and 2: the majority precedent (94:3, 96:9, 98:2); 12 syllables against the Latin\'s 10; the Latin\'s final word and stress.', 'from': 'draft'},
    {'label': 'acima de', 'forms': {'super': 'e vós estais acima de todos os príncipes'}, 'note': '95:4\'s build; says rank more plainly; +4 syllables on the colon.', 'from': 'draft'},
    {'label': 'e sobre todos os príncipes estais vós', 'forms': {'super': 'e sobre todos os príncipes estais vós'}, 'note': 'Stylist v1: an oxytone final for the tone; an inversion, and it moves tu from the head of the clause to its end.', 'from': 'stylist'},
]

# 29:12b — 'de todas as coisas' → 'sobre todas as coisas' (stylist; ambiguity reader's third reading; the Latinist's own fix has 'sobre')
dec['omnium']['why'] += (' Draft 2: in 29:12b the genitive after domínio is objective (dominion over all), and "o domínio de todas as coisas" '
                         'was heard by the ambiguity reader as possibly "the domain that all things have"; the stylist asked for "sobre", '
                         'and the Latinist\'s own proposal also has "o domínio sobre". A preposition is grammar (D2). The gender question '
                         '(the Latinist\'s minor) stays ruled for the neuter: 29:12b\'s Greek τὰ πάντα is neuter and 29:11b has just said cuncta.')
dec['omnium']['options'] = [
    {'label': 'todas as coisas (both)', 'forms': {'omnium1': 'todas as coisas', 'omnium2': 'sobre todas as coisas'}, 'note': 'Draft 2: the neuter reading in both places; "sobre" in 29:12b (stylist, ambiguity reader).', 'from': 'stylist'},
    {'label': 'todas as coisas, with "de" in 29:12b', 'forms': {'omnium1': 'todas as coisas', 'omnium2': 'de todas as coisas'}, 'note': 'Draft 1: the Latin genitive as a Portuguese "de"; heard once as the domain things have.', 'from': 'draft'},
    {'label': 'tudo (both)', 'forms': {'omnium1': 'tudo', 'omnium2': 'de tudo'}, 'note': 'Shorter and plainer; "sobre tudo" is avoided because it is heard as "sobretudo".', 'from': 'draft'},
    {'label': 'sobre todos (both)', 'forms': {'omnium1': 'sobre todos', 'omnium2': 'sobre todos'}, 'note': 'The masculine reading (the Latinist\'s fix, v1 minor): all men, picking up omnes príncipes; as 102:19 "dominará sobre todos". It closes the Latin the other way.', 'from': 'latinist'},
]

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1, read by claude-opus-5-5 in a fresh context with latin.json (run by the coordinator; Codex out of credits). No majors; three minors, all on words the draft had already made decisions of. All held; each stays an option.',
     'outcomes': [
         {'verse': '29:12', 'remark': 'ómnium resolved as neuter (todas as coisas); asks sobre todos, or keep if ruled', 'outcome': 'option', 'decision': 'omnium',
          'reason': 'Held for the neuter: 29:12b\'s Greek τὰ πάντα is neuter, 29:11b has just said cuncta, and DRB reads "all things" at 29:12b. Portuguese must choose a gender; the masculine is option 4. His "sobre" in 29:12b is taken.'},
         {'verse': '29:13', 'remark': 'confitémur → damos graças follows the Hebrew; asks louvamos or confessamos', 'outcome': 'refused', 'decision': 'confitemur',
          'reason': 'D5 (settled): confitéri to God is "dar graças a", ruled precisely because it stands beside laudáre, as here — "nós vos louvamos, e louvamos" is the collision D5 avoids; "confessamos" is heard as professing faith or confessing sin.'},
         {'verse': '29:13', 'remark': 'ínclitum is renowned, not glorious; glorioso repeats glória as if the same word; asks ínclito or insigne', 'outcome': 'option', 'decision': 'inclitum',
          'reason': 'The echo was the cost named in the draft. Held: L&S gives "glorious" among its senses, DRB has "glorious", and it is the wording of both the CNBB Liturgia das Horas and the Brazilian Lectionary at this line (circulation.md). "ínclito" and "insigne" are words needing a footnote (rule 5); "ilustre" (option 2) sounds social.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1, claude-opus-5-5, fresh context, with latin.json. Two remarks; one taken, one kept as an option. Best line 29:12, worst 29:11c. It judged the polysyndeton and the "vossa… na vossa mão" anaphora to carry well and the -ência/-ória echoes of 29:11 to be the Latin\'s litany, not rhyme.',
     'outcomes': [
         {'verse': '29:11c', 'remark': 'proparoxytone final príncipes; asks e sobre todos os príncipes estais vós', 'outcome': 'option', 'decision': 'super',
          'reason': 'The Latin ends on the same word with the same stress, so the tone fits both columns alike; the inversion to "estais vós" is literary (rule 5).'},
         {'verse': '29:12b', 'remark': 'second colon long and piled up; asks o domínio sobre todas as coisas', 'outcome': 'taken', 'decision': 'omnium',
          'reason': 'A preposition (grammar, D2); it also removes the ambiguity reader\'s third reading.'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Draft 1, Portuguese only, claude-opus-5-5, fresh context. Eight items, one unknown word (magnificência). Only the 29:12b attachment led to a change.',
     'outcomes': [
         {'verse': '29:10', 'remark': 'Deus do nosso pai Israel heard as the people Israel more than Jacob', 'outcome': 'refused', 'reason': 'The Latin says the same words: Israel, called our father; whether a listener pictures the patriarch or the nation descended from him is the Latin\'s own openness. The reading the order was built to exclude (God as our father) was not heard.'},
         {'verse': '29:11', 'remark': 'potência as a world power', 'outcome': 'refused', 'reason': 'He heard "power, might" first; potência is the glossary row\'s word (64:7, 70:19).'},
         {'verse': '29:11b', 'remark': 'E a vós o louvor: possession or offering', 'outcome': 'refused', 'reason': 'The Latin is verbless too (Et tibi laus) and open the same way; the options with a verb are in decision laus.'},
         {'verse': '29:11c', 'remark': 'sobre: rank or physically upon', 'outcome': 'refused', 'reason': 'He heard rank first; the precedents for super omnes (94:3, 98:2) say sobre.'},
         {'verse': '29:11c', 'remark': 'príncipes heard as sons of kings', 'outcome': 'refused', 'reason': 'The psalter\'s word for príncipes throughout (2:2, 46:10, 82:12); a local change would break it.'},
         {'verse': '29:12', 'remark': 'riches belong to you / come from you', 'outcome': 'refused', 'reason': 'He heard possession first, which is the Latin (Tuæ divítiæ).'},
         {'verse': '29:12b', 'remark': 'poder e potência heard as one doubled idea', 'outcome': 'refused', 'reason': 'The Latin doubles near-synonyms too (virtus et poténtia), as in 64:7; both keep their glossary words.'},
         {'verse': '29:12b', 'remark': 'de todas as coisas: attachment, and possibly the domain things have', 'outcome': 'taken', 'decision': 'omnium', 'reason': '"sobre todas as coisas" makes the objective genitive plain.'},
         {'verse': '29:11', 'remark': 'unknown word: magnificência', 'outcome': 'refused', 'decision': 'magnificentia', 'reason': 'Known cost of the glossary word (8 psalm places); grandeza is magnitúdo\'s in 29:12b of this canticle.'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 29:12b "o domínio de todas as coisas" → "o domínio sobre todas as coisas" (stylist; ambiguity reader; the Latinist\'s own fix has sobre). 29:11c text unchanged; its whole second colon became the slot of decision super so that the stylist\'s order stands as an option. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the v1 readers read).'},
]
d['status'] = 'draft'
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
