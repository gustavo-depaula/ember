"""Append the v1 reader steps and the v2 revision to prayed.json's audit (run once)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))


def o(verse, remark, outcome, reason, decision=None):
    x = {'verse': verse, 'remark': remark, 'outcome': outcome, 'reason': reason}
    if decision:
        x['decision'] = decision
    return x


d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': '7 minor, no major. 4 taken (77:17, 38b, 48 in another form, 57), 3 refused (77:2, 35, 72).',
     'outcomes': [
         o('77:2', 'propositiones is a noun parallel to parabolis: *proposições*', 'option', 'D43 settled the clause (48:5); *proposições* was bookish to Ps 48\'s stylist and unknown to its blind reader. Kept as option 3 for Gustavo.', 'propositiones'),
         o('77:17', 'God should be the object: *incitaram à ira o Excelso*', 'taken', 'Taken as the Latin build with *despertar* (*despertaram o Excelso para a ira*): *incitar à ira* is concitáre\'s (77:40, 58), and *despertar* keeps the echo with 77:65. His wording is an option.', 'excitaverunt'),
         o('77:35', 'adjutor an agent noun: *auxiliador*', 'refused', 'Glossary: adjútor → auxílio, the formula *meu auxílio e meu redentor*; *auxiliador* is not in the psalter\'s Portuguese.'),
         o('77:38b', '*muitas vezes* is the Hebrew/DRB: *E foi abundante em desviar*', 'taken', 'The Latin\'s abundance (πληθυνεῖ) restored.', 'abundavit'),
         o('77:48', '*posse* is the right, not the things: *possessão*', 'taken', 'The fault taken; the fix refused because *possessão* is demonic possession in Brazil: the stylist\'s *os seus bens*.', 'possessio'),
         o('77:57', 'patres eorum is the subject of conversi sunt; the comma resolves the ambiguity', 'taken', 'Comma dropped; the fathers are the subject.', 'conversi'),
         o('77:72', 'plural intellectibus made singular', 'refused', 'D28: *os entendimentos das suas mãos* is not Portuguese; the ambiguity reader already found the singular odd. The plural is heard in no Portuguese build.'),
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': '16 remarks; worst line 77:29, best 77:39. 12 taken whole or in part, 4 refused.',
     'outcomes': [
         o('77:5b', '*fizessem conhecer* a calque: *dessem a conhecer*', 'taken', ''),
         o('77:6', '-arão / -arão rhyme; mixed builds', 'taken', '', 'nascentur'),
         o('77:8', '*que exaspera* hangs: *provocadora*', 'refused', '*provocar* is exacerbáre\'s (D27, three times in this psalm); the exasperáre row keeps the absolute (67:7b). The Latin has no object either.'),
         o('77:18', '*para … para*: *pedindo*', 'taken', ''),
         o('77:24', '*para … para*: *fez chover-lhes*', 'taken', ''),
         o('77:26', '*Transportou* is freight: *Fez passar*', 'taken', 'D15: the Greek (ἀπῆρεν) differs from 45:3\'s, so the settled *transportar* need not hold.', 'transtulit'),
         o('77:29', 'weak passive; subject of *trouxe* unclear', 'taken', 'Taken in part: *saciaram-se* keeps saturári\'s verb (the stylist\'s *fartaram-se* is another), and *ele* named.'),
         o('77:31', '*os gordos* comic; *entravou* rare', 'taken', '*os mais robustos* taken; *entravou* kept (impedíre\'s image, the shackled feet; no common verb carries it).', 'pinguis'),
         o('77:34', 'dactylic mediant *buscavam-no*', 'taken', ''),
         o('77:42', '*do que atribula* stiff: *de quem os afligia*', 'taken', 'In part: *de quem atribula* — glossary *atribular* kept, *afligir* is another Latin verb\'s.'),
         o('77:45', 'rhyme *devorou / exterminou*', 'refused', 'dispérdere → exterminar is the glossary\'s (also 77:38); the Latin\'s two clauses are parallel and the echo is the Latin\'s.'),
         o('77:48', '*posse* a legal abstraction: *os seus bens*', 'taken', '', 'possessio'),
         o('77:49', '*o que enviou* clumsy: *investidas*', 'refused', 'The clause keeps *Misit … immissiónes*, one root twice (the Latin\'s repetition); *investidas* adds an image (attacks). Options remain.', 'immissiones'),
         o('77:57', '*converteram-se* heard as religious conversion: *tornaram-se*', 'taken', '', 'conversi'),
         o('77:59', '*muito* before the verb: *sobremaneira*', 'taken', '', 'valde'),
         o('77:65', '*como quem dorme* contradictory: *dormia*', 'taken', ''),
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '77:38 *será clemente com os pecados deles* heard as \'forgive\' — no reading of favouring sin (the point of the propitiári row). Acted on: 77:20 *Porque* (heard *Por que*), 77:31 *gordos*, 77:46 *fadigas* (tiredness), 77:54b *por sorte* (luck), 77:57 conversion, 77:65, 77:70 *das que*. Unknown words: Tânis, odre, Excelso, entravou, atribula, mosca canina, amoreiras, vereda, primícias, Cam, Silo, pranteadas, davam cria — names and glossary words kept.',
     'outcomes': [
         o('77:2', '*o que foi proposto* heard as a plan', 'option', 'D43 settled; the noun and *enigmas* are options.', 'propositiones'),
         o('77:20', '*Porque* heard as *Por que*', 'taken', '*Visto que*.', 'quoniam20'),
         o('77:21', '*adiou* makes no sense next to the fire', 'refused', 'Rule 1: *dístulit* is the Latin (ἀνεβάλετο); the Hebrew\'s anger is not followed.', 'distulit'),
         o('77:31', '*os gordos* comic', 'taken', '', 'pinguis'),
         o('77:46', '*fadigas* heard as tiredness', 'taken', '*trabalhos* here and in 77:51.', 'labores'),
         o('77:54b', '*por sorte* heard as luck', 'taken', '*por sorteio*.'),
         o('77:57', '*converteram-se* religious', 'taken', '', 'conversi'),
         o('77:60', '*Silo* heard as a grain silo', 'refused', 'A place name, kept as the Brazilian Bibles spell it.'),
         o('77:62', '*encerrou* heard as \'ended\'', 'refused', 'Glossary conclúdere → encerrar (the row names 77:62); *sob a espada* option.', 'gladio'),
         o('77:65', '*como quem dorme* contradictory', 'taken', '*dormia*.'),
         o('77:70', '*das que* has no noun', 'taken', '*das ovelhas*.', 'foetantes'),
         o('77:72', '*entendimento das suas mãos* odd', 'refused', 'Glossary intelléctus → entendimento; *destreza* option.', 'intellectibus'),
     ]},
    {'step': 'checks', 'note': 'v2 re-rendered and re-checked: hard pass; the same soft flags as v1 accepted (77:23/24 *céu*, 77:63/64 *-adas*).'},
    {'step': 'revision', 'version': 2,
     'note': 'v2: 77:5b *dessem a conhecer*; 77:6 *se hão de levantar*; 77:17 God the object (*despertaram o Excelso para a ira*); 77:18 *pedindo*; 77:20 *Visto que*; 77:24 *fez chover-lhes*; 77:26 *Fez passar*; 77:29 *saciaram-se … ele lhes trouxe*; 77:31 *os mais robustos*; 77:34 *eles o buscavam*; 77:38b *foi abundante em desviar*; 77:42 *de quem atribula*; 77:46/51 *trabalho(s)*; 77:48 *os seus bens* (new decision `possessio`); 77:54b *por sorteio*; 77:57 fathers the subject, *se tornaram um arco torto* (new decision `conversi`); 77:59 *sobremaneira*; 77:65 *dormia*; 77:70 *das ovelhas que davam cria*. prayed.v1.json kept. Scripts: tools/revise_v2.py, tools/audit_v2.py.'},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
