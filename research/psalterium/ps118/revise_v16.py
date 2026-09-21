"""Draft 16 of Ps 118: draft 15 (kept as prayed.v15.json) revised after its blind reader and its second
stylist pass (critic/v15.ambiguity.part4.json, critic/v15.stylist.part4.json; the Latinist gate on draft 15,
critic/v15.latinist.part4.json, was clean). Five verses change: 118:136, 138, 152, 154, 175.
Nothing in 118:1–128 changes.   Run once:  python3.13 research/psalterium/ps118/revise_v16.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 15:
    sys.exit(f"prayed.json is version {data['version']}, expected 15")
if not (here / 'prayed.v15.json').exists():
    sys.exit('prayed.v15.json is missing — copy prayed.json to it first')
V, C = data['verses'], data['choices']
byId = {d['id']: d for d in data['decisions']}

# ---- 118:136 (stylist): "fizeram descer nascentes" was heard as springs moved downwards
byId['exitus']['options'].insert(0, {
    'label': 'Os meus olhos verteram nascentes de água', 'forms': {'v136a': 'Os meus olhos verteram nascentes de água'},
    'note': 'Ruled in draft 16. The stylist heard "fizeram descer nascentes" as springs being shifted downwards, a mechanical motion, and asked for "derramaram nascentes de água" — keeping the strange image, as he said it should be kept. Taken with "verter" in place of his "derramar": it is the idiom of tears (verter lágrimas), it still says a making-flow-down, and it leaves "derramar" free for effúndere (41:5, 61:9, 141:3). Matos Soares 1932 has "derramaram", so this is inside D2\'s bound.', 'from': 'stylist'})
byId['exitus']['options'][1]['note'] += ' Draft 13–15; refused by the stylist on draft 15 (he had let it pass on draft 13).'
C['118:136'] = 'Decision "exitus" (draft 16: "verteram", after the stylist). The subject of non custodiérunt is not named, as in the Latin: the blind reader took it for the eyes on one reading and for unnamed others on the next — the Latin\'s own openness.'

# ---- 118:138 (stylist, worst line): the second "como" and the comma go — the Latin has neither
byId['v138']['options'].insert(0, {
    'label': 'Ordenastes como justiça os vossos testemunhos … e a vossa verdade sem medida',
    'forms': {'v138': 'Ordenastes como justiça {t_acc}: * e a vossa verdade {nimis138}'},
    'note': 'Ruled in draft 16: the stylist\'s line, whole. He heard the second "como" as the start of a comparison and the comma before "sem medida" as leaving it hanging. His line drops a supplied word and a supplied comma, so it stands NEARER the Latin (et veritátem tuam nimis has neither) — a fix of order and grammar only (D2). "sem medida" now leans on "verdade", as nimis leans on veritátem. The blind reader heard "Ordenastes" rightly on draft 15 ("Determinastes os vossos ensinamentos").', 'from': 'stylist'})
C['118:138'] = C['118:138'].replace('draft 15 "Ordenastes os vossos testemunhos como justiça: * e como a vossa verdade, sem medida" — the build the Latinist passed, with a verb that cannot mean "send".',
                                      'draft 15 "Ordenastes os vossos testemunhos como justiça: * e como a vossa verdade, sem medida" (the Latinist: clean; the blind reader: "Determinastes"; the stylist: his worst line, for the second "como" and the comma); draft 16 the stylist\'s own line, which drops both.')

# ---- 118:152 (stylist): "saber de" is the native regency, and "soube" is the perfect's "came to know"
V['118:152'] = '{de152}: * que os fundastes {aet}.'
for o in byId['initio']['options']:
    o['forms']['initio'] = o['forms']['initio'][0].upper() + o['forms']['initio'][1:]
    o['label'] = o['label'][0].upper() + o['label'][1:]
byId['initio']['why'] += ' Draft 16: the adverb is back at the head of the verse (capital forms); it now sits inside the forms of decision "de152".'
byId['de152']['latin'] = 'Inítio cognóvi de testimóniis tuis: quia …'
byId['de152']['options'] = [
    {'label': 'Desde o início soube dos vossos testemunhos', 'forms': {'de152': '{initio} soube {t_gen}'},
     'note': 'Ruled in draft 16: the stylist\'s line, whole. What he had refused in draft 13 was the regency "conhecer de", and draft 14\'s cure ("Sobre …, conheci desde o início") left the verb waiting for its object across the pause. "Saber de" is native; the perfect "soube" is exactly "came to know", which is what cognóvi is (the perfect "conheci" is rather "I met"); and "de" is again as open as the Latin\'s (about / from). Cost: cognóscere is "conhecer" elsewhere in the psalm (118:75, 79) — but 118:125 already gave scíre to "conhecer" for the sake of a collocation, and the Greek merges the two verbs.', 'from': 'stylist'},
    {'label': 'Sobre os vossos testemunhos, conheci desde o início', 'forms': {'de152': 'Sobre {t_acc}, conheci desde o início'}, 'note': 'Draft 14–15: the glossary verb kept, "de" decided as "concerning" (Douay-Rheims, Matos Soares 1932). The stylist on draft 15: the verb waits for its object until after the pause, and "Sobre" opens like an exposition.', 'from': 'draft'},
    {'label': 'Desde o início conheci dos vossos testemunhos', 'forms': {'de152': '{initio} conheci {t_gen}'}, 'note': 'Draft 13: the stylist\'s worst line there ("conheci dos" has no current regency).', 'from': 'draft'},
    {'label': 'Desde o início conheci acerca dos vossos testemunhos', 'forms': {'de152': '{initio} conheci acerca {t_gen}'}, 'note': 'Matos Soares 1932\'s preposition ("Acerca dos teus testemunhos, desde o princípio reconheci"); bookish.', 'from': 'MS1932'},
]
byId['de152']['why'] += ' Draft 16: the stylist\'s second proposal taken whole — the fault was the verb\'s regency, not the preposition.'
C['118:152'] = 'Decisions "de152" and "initio". Draft 13 "Desde o início conheci dos vossos testemunhos" (regency refused by the stylist); draft 14–15 "Sobre os vossos testemunhos, conheci desde o início" (refused again: the verb waits across the pause); draft 16 the stylist\'s own line, "Desde o início soube dos vossos testemunhos". fundásti → "fundastes", as 118:90. in ætérnum → "para sempre" (D23), closing the verse. The blind reader hears "desde o início" as the beginning of the speaker\'s life with God — one of the Latin\'s readings.'

# ---- 118:154 (stylist): "a minha causa … por causa do" — one word in two senses; the figure recovered
byId['judica154']['options'].insert(0, {
    'label': 'Julgai em juízo a minha causa', 'forms': {'judica154': 'Julgai em {jd_sg} a minha causa'},
    'note': 'Ruled in draft 16, from the stylist, who asked that the reformulation "recover the root-repetition of Júdica judícium". It gives back the law-word and the figure (Julgai … juízo) that draft 14 had given up, and keeps the noun that made the blind reader hear the right sense (he no longer listed the verse on draft 15). Cost: judícium is rendered twice over ("em juízo" and "causa"); two syllables over the Latin.', 'from': 'stylist'})
for o in byId['eloquia']['options']:
    o['forms']['e_propter'] = {'por causa do que dissestes': 'pelo que dissestes', 'por causa do vosso dito': 'pelo vosso dito', 'por causa da vossa promessa': 'pela vossa promessa',
                               'por causa da vossa fala': 'pela vossa fala', 'por causa da vossa palavra': 'pela vossa palavra'}[o['forms']['e_propter']]
byId['eloquia']['why'] += ' Draft 16, 118:154: propter → "por" ("pelo que dissestes"), because "Julgai … a minha causa, … por causa do que dissestes" set one word in two senses side by side (the stylist). The handoff\'s warning — "pelo que dissestes" is heard as cause — is no objection here: propter IS cause. HEARD AGAIN (draft 15): the Latinist made no remark at all, not even his six minors on the unchanged clause; the blind reader listed none of the nine places; the stylist refused the plural "ditos" a second time in all three places (118:148, 158, 162 — six refusals in six readings) and again said nothing against the clause at 118:133, 140, 169, 170, 172; at 118:154 the faults he named were the echo causa / por causa and the rhyme, though the line he proposed reads "pela vossa palavra, dai-me vida".'
C['118:154'] = 'Decisions "judica154" (draft 13 "Julgai o meu juízo", heard as "evaluate my opinion"; draft 14 "Julgai a minha causa"; draft 16 "Julgai em juízo a minha causa", which recovers the figure), "redime", "v154b". propter → "por" here ("pelo que dissestes"): the glossary\'s "por causa de" would echo "a minha causa" in another sense; after this preposition the clause is heard as cause, and cause is what the Latin says. The Greek has λόγον, the Latin elóquium; the Latin is followed. "resgatai-me … vivificai-me": the Latin has the same echo (rédime me … vivífica me), and vivífica me closes three verses of the stanza — kept against the stylist twice.'
byId['v154b']['options'][0]['label'] = 'pelo que dissestes vivificai-me'
byId['v154b']['options'][1]['label'] = 'vivificai-me pelo que dissestes'
byId['v154b']['why'] += ' The stylist repeated the remark on draft 15; refused again for the same reasons.'

# ---- 118:175 (stylist): natural order back; the rhyme with 118:174 avoided by the periphrastic future
V['118:175'] = 'A minha alma viverá, e vos louvará: * e {jd_acc} {adjuvabunt}.'
for o in byId['adjuva']['options']:
    o['forms']['adjuvabunt'] = o['forms']['adjuvabunt'].replace('me auxiliarão', 'me hão de auxiliar').replace('me ajudarão', 'me hão de ajudar')
byId['adjuva']['why'] += ' 118:175 adjuvábunt me → "me hão de auxiliar": the simple future "auxiliarão" rhymed with the final of 118:174 ("meditação"); draft 13 avoided it by inversion, which the stylist heard as written, not spoken; the periphrastic future keeps natural order and the verb, and closes on "-ar".'
C['118:175'] = 'Vivet … laudábit → simple futures. adjuvábunt → "me hão de auxiliar" (decision "adjuva": one family with auxílio): the periphrastic future, because "auxiliarão" would rhyme with the final of 118:174 ("meditação") where the Latin has no echo; draft 13–15 avoided the rhyme by putting the verb first, which the stylist refused on draft 15.'

# ---- refused again: 118:135, 118:173
byId['illumina135']['options'][1]['note'] += ' Asked for a second time on draft 15 ("iluminar a face é lançar luz sobre ela"); refused again, same ground. For Gustavo\'s ear.'
fiat = byId['fiat']
fiat['options'][-1]['note'] += ' On draft 15 he repeated the remark and proposed "Venha a vossa mão me salvar"; refused again — veníre for fíeri. For Gustavo\'s ear: it is the one build of this portion the stylist refused twice that was held for the Latin\'s word.'
C['118:173'] = C['118:173'] + ' Refused by the stylist a second time on draft 15 ("Venha a vossa mão me salvar"); held.'
C['118:135'] = C['118:135'] + ' The stylist asked twice for "Fazei brilhar"; held, for the stanza\'s repetition (decision "illumina135"); the blind reader paraphrased the ruled line rightly both times.'

data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v15.latinist.part4.json', 'note': 'Draft 15, 118:129–176 only. CLEAN: no verse remarked. "Não identifiquei erros de adequação nos 48 versículos; as construções incomuns do latim foram preservadas"; he calls "em brasa" defensible for ignítum. Worth recording for D24: on this reading he did not repeat the six minors he had given twice to the unchanged clause "o que dissestes" — the gate varies between runs.', 'outcomes': []},
    {'step': 'ambiguity', 'file': 'critic/v15.ambiguity.part4.json', 'note': 'Draft 15, the Portuguese alone. The three wrong senses of draft 13 are gone: 118:138 "Ordenastes os vossos testemunhos" heard first as "Determinastes os vossos ensinamentos"; 118:140 "está todo em brasa" heard as ardent / powerful, then as a thing submitted to fire — the image, no longer "fervent"; 118:154 no longer listed. None of the nine elóquium places is listed. What remains is the psalm\'s standing costs (testemunhos, juízo, príncipes, the unknown-word list) and the Latin\'s own openness (118:132, 133, 136, 152, 165).',
     'outcomes': [
         {'verse': '118:138', 'remark': '"Ordenastes": decreed first, "put in order" second', 'outcome': 'refused', 'reason': 'The first hearing is the right one; the wrong sense of draft 13 ("sent") is gone.'},
         {'verse': '118:140', 'remark': '"está todo em brasa": ardent / powerful, or submitted to fire and purified', 'outcome': 'refused', 'reason': 'Both are the fire image of ignítum; nothing to mend.'},
         {'verse': '118:162', 'remark': '"despojos": spoils, or remains; "something valuable found" is what is heard', 'outcome': 'option', 'decision': 'spolia', 'reason': 'As on draft 13.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v15.stylist.part4.json', 'note': 'Draft 15, second pass. Ten verses; best line 118:142 again, worst 118:138. Taken whole: 118:138 (his line), 118:152 (his line). Taken in substance: 118:136 ("verteram" for his "derramaram"), 118:154 ("Julgai em juízo a minha causa"; "pelo que dissestes" to end the echo causa / por causa), 118:175 (natural order, with the periphrastic future against the rhyme). Refused a second time, kept as options: 118:135, 118:173, the order of 118:154b. Refused under D16, a second time: "ditos" at 118:148, 158, 162.',
     'outcomes': [
         {'verse': '118:135', 'remark': 'second time: "Iluminai a vossa face sobre" lacks natural support; wants "Fazei brilhar"', 'outcome': 'option', 'decision': 'illumina135', 'reason': 'As on draft 13: another verb for the Latin\'s, and the stanza\'s repetition illúminat … illúmina dissolved.'},
         {'verse': '118:136', 'remark': '"fizeram descer nascentes" makes one hear springs moved downwards; wants "derramaram nascentes de água"', 'outcome': 'taken', 'decision': 'exitus', 'reason': 'With "verteram", which leaves "derramar" to effúndere.'},
         {'verse': '118:138', 'remark': 'worst line: the second "como" promises a comparison, the comma leaves "sem medida" hanging', 'outcome': 'taken', 'decision': 'v138'},
         {'verse': '118:148', 'remark': '"ditos" recalls maxims; wants "nas vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16; second refusal, logged as evidence.'},
         {'verse': '118:152', 'remark': '"conheci" waits for its object across the pause; "Sobre" opens like an exposition; wants "Desde o início soube dos vossos testemunhos"', 'outcome': 'taken', 'decision': 'de152'},
         {'verse': '118:154', 'remark': '"causa / por causa": an echo of two senses; the root-repetition of Júdica judícium should be recovered', 'outcome': 'taken', 'decision': 'judica154'},
         {'verse': '118:154', 'remark': '"resgatai-me / vivificai-me" rhyme; his line: "pela vossa palavra, dai-me vida"', 'outcome': 'option', 'decision': 'v154b', 'reason': 'The Latin has the echo (rédime me … vivífica me) and the stanza closes three verses on vivífica me; "palavra" is D16\'s question and "dai-me a vida" is the option of decision "vivifica".'},
         {'verse': '118:158', 'remark': '"ditos": bookish; wants "as vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16; second refusal.'},
         {'verse': '118:162', 'remark': '"ditos": the register of a collection of sayings; wants "com as vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16; second refusal.'},
         {'verse': '118:173', 'remark': 'second time: "Seja a vossa mão" announces an identification that does not come; wants "Venha a vossa mão me salvar"', 'outcome': 'option', 'decision': 'fiat', 'reason': 'veníre for fíeri; the build is that of 118:76 and the decision "fiat" keeps the psalm\'s three Fiat alike.'},
         {'verse': '118:175', 'remark': '"e me auxiliarão os vossos juízos": the inversion is written, not spoken', 'outcome': 'taken', 'decision': 'adjuva', 'reason': 'Natural order restored; the rhyme with 118:174 that the inversion was avoiding is avoided by "me hão de auxiliar".'},
     ]},
    {'step': 'revision', 'version': 16, 'note': 'Draft 16 (draft 15 kept as prayed.v15.json; ps118/revise_v16.py). Five verses: 118:136 "verteram nascentes de água"; 118:138 "Ordenastes como justiça os vossos testemunhos: * e a vossa verdade sem medida"; 118:152 "Desde o início soube dos vossos testemunhos"; 118:154 "Julgai em juízo a minha causa, e resgatai-me: * pelo que dissestes vivificai-me"; 118:175 "e os vossos juízos me hão de auxiliar". 118:1–128 untouched.'},
]
data['version'] = 16
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 16 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
