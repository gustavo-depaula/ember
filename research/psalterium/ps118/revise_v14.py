"""Draft 14 of Ps 118: draft 13 (kept as prayed.v13.json) revised after its three blind readers
(critic/v13.latinist.part4.json, v13.stylist.part4.json, v13.ambiguity.part4.json), who read 118:129–176 only.
Nothing in 118:1–128 changes.   Run once:  python3.13 research/psalterium/ps118/revise_v14.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 13:
    sys.exit(f"prayed.json is version {data['version']}, expected 13")
if not (here / 'prayed.v13.json').exists():
    sys.exit('prayed.v13.json is missing — copy prayed.json to it first')
V, C = data['verses'], data['choices']
byId = {d['id']: d for d in data['decisions']}


def lead(decisionId, option):
    """Put a new option first (it becomes the ruling); the old ruling stays as option 1."""
    d = byId[decisionId]
    keys = set(d['options'][0]['forms'])
    if set(option['forms']) != keys:
        sys.exit(f'{decisionId}: new option has slots {set(option["forms"])}, expected {keys}')
    d['options'].insert(0, option)


def promote(decisionId, label, note=None):
    d = byId[decisionId]
    chosen = next(o for o in d['options'] if o['label'] == label)
    d['options'].remove(chosen)
    d['options'].insert(0, chosen)
    if note:
        chosen['note'] += ' ' + note


# ---- 118:138 (ambiguity): "Mandastes os vossos testemunhos" was heard as "you SENT reports"
lead('v138', {'label': 'Mandastes que os vossos testemunhos sejam justiça … e a vossa verdade', 'forms': {'v138': '{Mandasti138} que {t_acc} sejam justiça: * e a vossa verdade, {nimis138}'},
              'note': 'Ruled in draft 14. The blind reader heard draft 13\'s "Mandastes os vossos testemunhos" first as "Enviastes relatos ou provas": with a bare object, "mandar" is "to send" in Brazil — a wrong sense. Built now as 118:4 is ("Vós mandastes que … se guardem"): "que … sejam" is the supplied grammar (a conjunction and a copula, D2), the present subjunctive as in 118:4 because the command stands. The second colon is left as elliptical as the Latin\'s: "(and that they be) your truth, without measure".', 'from': 'ambiguity'})
byId['v138']['options'][1]['note'] = 'Draft 13. "como" supplied twice and nothing else — but the bare object made "Mandastes" be heard as "you sent" (blind reader).'
for o in byId['mandasti']['options']:
    if o['label'] == 'destes ordem':
        o['forms']['Mandasti138'] = 'Destes ordem'
C['118:138'] = 'Decisions "v138", "nimis138", and "mandasti" (the same verb as 118:4, and now the same build: mandar que + subjunctive — draft 13\'s bare object was heard as "you sent"). The verse is as hard in Latin as in Portuguese; the second colon keeps the Latin\'s ellipsis. The blind reader heard "testemunhos" first as reports of what God did, here as throughout the psalm (the cost of the cognate, accepted in D15).'

# ---- 118:154 (ambiguity): "Julgai o meu juízo" was heard first as "evaluate the opinion I formed"
promote('judica154', 'Julgai a minha causa', 'RULED in draft 14: the blind reader heard "Julgai o meu juízo" first as "Avaliai o julgamento ou a opinião que eu formei" — a wrong sense, not a strange one ("o meu julgamento" runs the same risk). By the reasoning of D10 and D20 a lost feature is the lesser evil beside a wrong sense. Costs: one of the psalm\'s 23 judícium is not "juízo"; the figura etymologica goes; and where judícium and causa stand together (9:5 judícium meum et causam meam; 34:23) this cannot be copied — those verses decide locally.')
byId['judica154']['options'][1]['note'] = 'Draft 13: the Latin\'s two words of one root; Douay-Rheims "Judge my judgment". Heard by the blind reader first as "evaluate the opinion I formed".'
data['decisions'].append({
    'id': 'v154b', 'refs': ['118:154'], 'latin': 'et rédime me: * propter elóquium tuum vivífica me', 'kind': 'order',
    'why': 'The stylist heard "resgatai-me … vivificai-me" as a rhyme at both cadences and proposed turning the second colon round. But the echo is the Latin\'s own (rédime me … vivífica me: rule 5\'s exception), and vivífica me closes three verses of this stanza (118:154, 156, 159) and nine of the psalm — always last, always "vivificai-me" last in the Portuguese.',
    'options': [
        {'label': 'por causa do que dissestes vivificai-me', 'forms': {'v154b': '{e_propter} {vivifica}'}, 'note': 'Ruled: the Latin\'s order and the stanza\'s threefold close kept.', 'from': 'draft'},
        {'label': 'vivificai-me por causa do que dissestes', 'forms': {'v154b': '{vivifica} {e_propter}'}, 'note': 'The stylist\'s order: no echo at the cadences; the verse leaves the refrain.', 'from': 'stylist'},
    ],
})
V['118:154'] = '{judica154}, e {redime154}: * {v154b}.'
C['118:154'] = 'Decisions "judica154" (draft 14: "a minha causa", after the blind reader), "redime", "v154b". propter → "por causa de" (glossary): after this preposition the clause "do que dissestes" is heard as cause — and here cause is what the Latin says; the blind reader did not stumble and the stylist\'s own line keeps it. The Greek has λόγον, the Latin elóquium; the Latin is followed. "resgatai-me … vivificai-me": the Latin has the same echo (rédime me … vivífica me).'

# ---- 118:140 (ambiguity): "muito ardente" was heard as "fervent" before "burning"
lead('ignitum', {'label': 'é fogo muito ardente', 'forms': {'ignitum': 'é fogo muito ardente'},
                 'note': 'Ruled in draft 14. The blind reader heard draft 13\'s "é muito ardente" first as "intenso ou fervoroso" and only second as something that burns; rule 5 keeps concrete images concrete, so the fire is named — "fogo" is the root of ignítum itself (ignis), and Matos Soares 1932 also supplies a noun ("chama ardente"). The Latinist had passed "ardente" expressly.', 'from': 'ambiguity'})
byId['ignitum']['options'][1]['note'] = 'Draft 13: fire kept in the adjective alone — heard by the blind reader as "fervent" first.'
C['118:140'] = C['118:140'].replace('Decision "ignitum".', 'Decision "ignitum" (draft 14: "é fogo muito ardente" — the bare adjective was heard as "fervent").')

# ---- 118:152 (stylist, worst line): "conheci dos" is no current regency; rebuilt
V['118:152'] = '{de152}, conheci {initio}: * que os fundastes {aet}.'
byId['de152']['options'] = [
    {'label': 'Sobre os vossos testemunhos', 'forms': {'de152': 'Sobre {t_acc}'}, 'note': 'Ruled in draft 14, from the stylist, whose worst line this was: "conheci dos" has no current regency, so the openness of de could not be kept in Portuguese anyway. "Sobre" decides for "concerning", with Douay-Rheims and Matos Soares 1932 ("Acerca dos") — and it is what the blind reader had understood from draft 13 ("Soube, a respeito dos testemunhos"). The plainer of two faithful words (D2) against "acerca de". The phrase goes first, as in Matos Soares.', 'from': 'stylist'},
    {'label': 'Acerca dos vossos testemunhos', 'forms': {'de152': 'Acerca {t_gen}'}, 'note': 'Matos Soares 1932\'s preposition; bookish.', 'from': 'MS1932'},
    {'label': 'Dos vossos testemunhos', 'forms': {'de152': 'D{t_acc}'}, 'note': 'The open "de" (concerning / from — the Greek has ἐκ), fronted ("D" + the term\'s accusative form gives "Dos vossos …"). Draft 13 had it after the verb ("conheci dos vossos testemunhos"), which the stylist refused as not native.', 'from': 'draft'},
]
byId['de152']['why'] += ' Draft 14: the stylist refused "conheci dos" (regency) and the pause that followed it; the verse now opens with the phrase, and the ruling moved to "Sobre".'
for o in byId['initio']['options']:
    o['forms']['initio'] = o['forms']['initio'][0].lower() + o['forms']['initio'][1:]
    o['label'] = o['label'][0].lower() + o['label'][1:]
byId['initio']['why'] += ' Draft 14: the adverb now stands after the verb (the stylist\'s order), so its forms are lowercase.'
C['118:152'] = 'Rebuilt in draft 14 after the stylist (his worst line): "Sobre os vossos testemunhos, conheci desde o início: * que os fundastes para sempre". Decisions "de152", "initio". cognóscere stays "conhecer" (glossary; "Conheci, Senhor, que …" stands at 118:75) — the stylist\'s "soube" is scíre\'s. fundásti → "fundastes", as 118:90. in ætérnum → "para sempre" (D23), closing the verse. The blind reader heard "desde o início" as the beginning of the speaker\'s life with God — one of the Latin\'s two readings.'

# ---- 118:158 (stylist): the needless "eu"
V['118:158'] = 'Vi {prae158}, e {tab158}: * porque não guardaram {e_acc}.'
C['118:158'] = C['118:158'].replace('Decision "tabescere"; "eu" because "definhava" is first or third person.', 'Decision "tabescere"; draft 13 had "e eu definhava" — the stylist heard an emphasis with no ground, and "Vi" has already set the person.')

# ---- 118:160 (stylist): natural order
promote('v160b', 'todos os juízos da vossa justiça são para sempre', 'RULED in draft 14: the stylist heard "para sempre são todos …" as a sentence hanging until its subject arrives; order is the ear\'s (D2).')
C['118:160'] = C['118:160'].replace('Decision "v160b";', 'Decision "v160b" (draft 14: natural order, from the stylist);')

# ---- 118:169 (stylist): "aproximar-se na" — the verb's own preposition
cons = byId['in_conspectu']
forms169 = {'na vossa presença': 'da vossa presença', 'à vossa vista': 'da vossa vista', 'diante de vós': 'diante de vós'}
for o in cons['options']:
    o['forms']['consp169'] = forms169[o['label']]
cons['why'] += ' Draft 14: the stylist heard "Aproxime-se … na vossa presença" as motion joined to a place; the noun phrase stays identical in the three verses and each verb takes its own preposition (estão na … / Aproxime-se … da … / Entre … na …) — grammar, which D2 gives to the ear. His own line changed the verb (Venha), which is refused: appropinquáre → aproximar-se is the glossary\'s, and Tau takes up Coph\'s Appropinquavérunt (118:150).'
V['118:169'] = 'Aproxime-se {deprecatio} {consp169}, Senhor: * {e_juxta} dai-me {intellectum}.'
C['118:169'] = C['118:169'] + ' Draft 14: "da vossa presença" (aproximar-se de), after the stylist.'

# ---- 118:173 (stylist, refused): his line becomes an option of "fiat"
fiat = byId['fiat']
seja = next(o for o in fiat['options'] if o['label'] == 'Seja')
fiat['options'].append({'label': 'Que a vossa mão me venha salvar (118:173 only)', 'forms': {**seja['forms'], 'v173a': 'Que a vossa mão me venha salvar'},
                        'note': 'The stylist on draft 13: "Seja a vossa mão" seems to wait for a predicate. His line puts veníre where the Latin has fíeri; kept as an option. The other two Fiat verses stay as ruled under this label.', 'from': 'stylist'})
C['118:173'] = C['118:173'] + ' The stylist found "Seja a vossa mão para me salvar" incomplete; it stands, because the build is that of 118:76, which he had passed, and his line changes the verb (option in "fiat"). The Latin is as bare: γενέσθω ἡ χείρ σου τοῦ σῶσαί με.'

# ---- 118:162 (ambiguity): "despojos" half-heard as remains
data['decisions'].append({
    'id': 'spolia', 'refs': ['118:162'], 'latin': 'sicut qui invénit spólia multa', 'kind': 'word',
    'why': 'The blind reader listed "despojos" as a word a hearer may not know, and gave "restos ou sobras, inclusive restos mortais" beside "bens tomados numa vitória" — adding that the comparison with joy points to riches. spólia is the booty of war (σκῦλα).',
    'options': [
        {'label': 'muitos despojos', 'forms': {'spolia': 'muitos despojos'}, 'note': 'Ruled: the word itself (Matos Soares 1932 "muitos despojos"); the verse\'s own joy steers the hearer, as the blind reader said.', 'from': 'MS1932'},
        {'label': 'muitos despojos de guerra', 'forms': {'spolia': 'muitos despojos de guerra'}, 'note': 'Removes the doubt by naming the war — two words the Latin does not have.', 'from': 'ambiguity'},
        {'label': 'um grande tesouro', 'forms': {'spolia': 'um grande tesouro'}, 'note': 'The Diurnal Monástico 1962 ("como ao achar um tesouro"): the image changed.', 'from': 'DM1962'},
    ],
})
V['118:162'] = 'Eu me alegrarei {e_com}: * como quem encontrou {spolia}.'

# ---- 118:135, 148, 158, 162: refused stylist remarks, recorded in the notes
byId['illumina135']['options'][1]['note'] += ' Asked for by the stylist on draft 13 ("iluminar a face sobre alguém" sounds carried over from the Latin); refused under D2 — it puts another verb in the place of the Latin\'s and dissolves the stanza\'s illúminat … illúmina. The blind reader understood the ruled line at once ("Fazei o vosso rosto brilhar sobre o servo").'
byId['eloquia']['why'] += ' HEARD (draft 13, 118:129–176). Latinist: six minors, one for each singular — the clause "dates" an utterance the noun leaves timeless (D16\'s named cost); nothing on the plural. Stylist: NO remark on the clause in any of the six places, and his own proposed lines for 118:154 and 118:169 keep it ("por causa do que dissestes", "conforme o que dissestes"); the plural "os vossos ditos" REFUSED in all three places (118:148, 158, 162: "máximas ou frases célebres", "uma coleção de máximas", "coloração de máxima ou anedota"), each time for "palavras". Blind reader: understood every place — 118:169 "como prometestes", 118:158 "Não obedeceram ao que Deus disse" — and did not list "ditos" as unknown. Kept under D16; for Gustavo.'

# ---- audit
data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v13.latinist.part4.json', 'note': 'Draft 13, 118:129–176 only. No major. Six minors, all one remark: at each singular elóquium (118:133, 140, 154, 169, 170, 172) the clause "o que dissestes" adds a past tense the noun does not have; he asks for "a vossa palavra" each time. That is D16\'s named cost and D16\'s named retreat; refused under D16, all six. He passed the rest without remark — 118:138, 131, 136, 176 among them — and said of 118:140 that "ardente" is no error (ignítus as adjective, Lewis & Short). The gate is clean of anything but D16.',
     'outcomes': [{'verse': v, 'remark': 'the clause "o que dissestes" dates an utterance the noun elóquium leaves timeless; wants "a vossa palavra"', 'outcome': 'refused', 'decision': 'eloquia',
                   'reason': 'D16: the clause is the ruled form of the singular; its past tense is the cost D16 names; "palavra" is the retreat D16 names and is option "palavras" of this decision, one touch for the whole psalm.'}
                  for v in ['118:133', '118:140', '118:154', '118:169', '118:170', '118:172']]},
    {'step': 'stylist', 'file': 'critic/v13.stylist.part4.json', 'note': 'Draft 13, 118:129–176 only. Nine verses remarked (ten remarks); best line 118:142, worst 118:152. Taken: 118:152 rebuilt, 118:158 "eu" dropped, 118:160 natural order, 118:169 the verb\'s own preposition (his verb refused). Refused and kept as options: 118:135 (Fazei brilhar), 118:154 (his order), 118:173 (me venha salvar). Refused under D16: "ditos" at 118:148, 158, 162. He said nothing against the clause "o que dissestes" in any of its six places, and two of his own lines keep it. Overall: "sobriedade e boa sustentação oral … As imagens difíceis não são, por si, defeitos de dicção e devem conservar sua estranheza quando ela pertence ao latim."',
     'outcomes': [
         {'verse': '118:135', 'remark': '"Iluminai a vossa face sobre" sounds carried over from the Latin; wants "Fazei brilhar a vossa face"', 'outcome': 'option', 'decision': 'illumina135', 'reason': 'D2: it puts another verb for the Latin\'s and dissolves the repetition illúminat … illúmina inside the stanza; the Diurnal has the same build; the blind reader understood it at once.'},
         {'verse': '118:148', 'remark': '"ditos" suggests maxims; wants "nas vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16: the plural stays "os vossos ditos"; "palavras" is that decision\'s retreat option. Logged as evidence in the glossary.'},
         {'verse': '118:152', 'remark': '"conheci dos" has no current regency, and the clause after the pause must be rebuilt by the hearer (worst line)', 'outcome': 'taken', 'decision': 'de152', 'reason': 'Rebuilt with the phrase first and "Sobre"; his "soube" not taken (cognóscere → conhecer, as 118:75).'},
         {'verse': '118:154', 'remark': '"resgatai-me / vivificai-me" rhyme at both cadences; wants the second colon turned round', 'outcome': 'option', 'decision': 'v154b', 'reason': 'The Latin has the same echo (rédime me … vivífica me — rule 5\'s exception), and vivífica me closes three verses of the stanza.'},
         {'verse': '118:158', 'remark': '"e eu definhava": an emphasis with no ground', 'outcome': 'taken'},
         {'verse': '118:158', 'remark': '"ditos" sounds like a collection of maxims; wants "as vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16, as 118:148.'},
         {'verse': '118:160', 'remark': '"para sempre são todos os juízos" hangs until the subject comes; wants natural order', 'outcome': 'taken', 'decision': 'v160b'},
         {'verse': '118:162', 'remark': '"ditos" has the colour of a maxim or anecdote; wants "com as vossas palavras"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16, as 118:148.'},
         {'verse': '118:169', 'remark': '"Aproxime-se … na vossa presença" joins motion and place; wants "Venha para a vossa presença a minha prece"', 'outcome': 'taken', 'decision': 'in_conspectu', 'reason': 'Taken as grammar ("da vossa presença"); his verb refused — appropinquáre → aproximar-se is the glossary\'s.'},
         {'verse': '118:173', 'remark': '"Seja a vossa mão para me salvar" seems to wait for a predicate; wants "Que a vossa mão me venha salvar"', 'outcome': 'option', 'decision': 'fiat', 'reason': 'His line replaces fíeri with veníre; the build is that of 118:76, which he passed, and the Latin and Greek are as bare.'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v13.ambiguity.part4.json', 'note': 'Draft 13, 118:129–176, the Portuguese alone. 42 entries, most of them the psalm\'s standing costs (testemunhos heard as reports; guardar as obeying or remembering; juízo; vivificai-me, preceitos, equidade, iniquidade listed as unknown) or the Latin\'s own openness. Three wrong senses heard FIRST, all changed: 118:138 "Mandastes os vossos testemunhos" = "you sent reports"; 118:154 "Julgai o meu juízo" = "evaluate the opinion I formed"; 118:140 "muito ardente" = "fervent". One half-heard and kept with a decision: 118:162 "despojos". elóquium: understood in every place — see decision "eloquia".',
     'outcomes': [
         {'verse': '118:138', 'remark': '"Mandastes os vossos testemunhos" heard first as "Enviastes relatos ou provas"', 'outcome': 'taken', 'decision': 'v138'},
         {'verse': '118:154', 'remark': '"Julgai o meu juízo" heard first as "evaluate the judgment or opinion I formed"', 'outcome': 'taken', 'decision': 'judica154'},
         {'verse': '118:140', 'remark': '"muito ardente" heard first as intense or fervent, second as something that burns', 'outcome': 'taken', 'decision': 'ignitum'},
         {'verse': '118:162', 'remark': '"despojos": remains or leftovers beside spoils; listed as unknown', 'outcome': 'option', 'decision': 'spolia', 'reason': 'It is the word; the reader himself says the joy of the comparison points to riches.'},
         {'verse': '118:136', 'remark': '"porque não guardaram a vossa lei" heard first of the eyes', 'outcome': 'refused', 'reason': 'The Latin names no subject either, and the eyes are its nearest plural too; D2 keeps an ambiguity the Latin has.'},
         {'verse': '118:132', 'remark': '"segundo o juízo dos que amam o vosso nome" heard first as a judgment made BY those who love', 'outcome': 'refused', 'reason': 'The Latin genitive is open in exactly this way; Matos Soares explains it, which goes beyond the Latin.'},
         {'verse': '118:133', 'remark': '"injustiça" heard first as injustice done to me, second as my own', 'outcome': 'refused', 'reason': 'Both are in omnis injustítia.'},
         {'verse': '118:139', 'remark': '"O meu zelo" heard as careful attention, its object unclear', 'outcome': 'refused', 'reason': 'zelus meus is the Latin\'s reading and is as bare.'},
         {'verse': '118:152', 'remark': '"Desde o início": of my life with God, or of the testimonies', 'outcome': 'refused', 'reason': 'Both are in Inítio; the verse was rebuilt for the stylist and the adverb kept.'},
         {'verse': '118:161', 'remark': '"Os príncipes" heard as kings\' sons before rulers', 'outcome': 'refused', 'reason': 'príncipes → príncipes stands since 118:23; the cognate\'s cost.'},
         {'verse': '118:165', 'remark': '"tropeço" heard as difficulty first, fall into sin second', 'outcome': 'refused', 'reason': 'Both are in scándalum; the image is kept.'},
         {'verse': '118:168', 'remark': '"Observei" heard as "I fulfilled" first, "I examined" second', 'outcome': 'refused', 'reason': 'The first hearing is the right one.'},
     ]},
    {'step': 'revision', 'version': 14, 'note': 'Draft 14 (draft 13 kept as prayed.v13.json; ps118/revise_v14.py). 118:1–128 untouched. From the blind reader: 118:138 rebuilt as 118:4 ("Mandastes que os vossos testemunhos sejam justiça: * e a vossa verdade, sem medida"), 118:154 "Julgai a minha causa", 118:140 "é fogo muito ardente", decision "spolia". From the stylist: 118:152 rebuilt ("Sobre os vossos testemunhos, conheci desde o início"), 118:158 without "eu", 118:160 natural order, 118:169 "da vossa presença". New options: "v154b", a fourth option in "fiat". The six Latinist minors and the three stylist refusals of "ditos" stand under D16.'},
]
data['version'] = 14
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 14 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
