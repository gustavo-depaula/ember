"""Draft 15 of Ps 118: draft 14 (kept as prayed.v14.json) revised after the Latinist gate on it
(critic/v14.latinist.part4.json). Two verses change, 118:138 and 118:140 — the two that draft 14 had changed
for the blind reader and that the Latinist then refused. Nothing in 118:1–128 changes.
Run once:  python3.13 research/psalterium/ps118/revise_v15.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 14:
    sys.exit(f"prayed.json is version {data['version']}, expected 14")
if not (here / 'prayed.v14.json').exists():
    sys.exit('prayed.v14.json is missing — copy prayed.json to it first')
C = data['choices']
byId = {d['id']: d for d in data['decisions']}

# ---- 118:138: back to the "como" build the Latinist had passed; the mishearing cured in the verb
v138 = byId['v138']
v138['options'][0]['note'] += ' REFUSED by the Latinist on draft 14 (major): "que … sejam" makes a clause of command out of accusatives that depend on mandásti — a clause the Latin does not have. Draft 15 leaves it.'
v138['options'][1]['label'] = 'Mandastes os vossos testemunhos como justiça … e como a vossa verdade'
v138['options'].insert(0, {
    'label': 'Ordenastes os vossos testemunhos como justiça … e como a vossa verdade',
    'forms': {'v138': 'Ordenastes {t_acc} como justiça: * e como a vossa verdade, {nimis138}'},
    'note': 'Ruled in draft 15. Two readers pull this verse opposite ways. The blind reader heard draft 13\'s "Mandastes os vossos testemunhos" as "you SENT reports" (mandar + a bare object); draft 14 cured that with "Mandastes que … sejam", and the Latinist marked the new clause major — while he had passed draft 13\'s "como … como" without a word. So the build of draft 13 returns, and the mishearing is cured where it arose, in the verb: "ordenar" with a thing as object is to decree it, and cannot be heard as sending. Cost: 118:4 and 118:138 no longer share a verb (mandastes / Ordenastes) — one Latin verb, two Portuguese, because Portuguese "mandar" is two verbs. "Ordenastes" was already the second option of decision "mandasti".',
    'from': 'latinist'})
byId['mandasti']['why'] += ' Draft 15: in 118:138 the text is ruled locally by decision "v138" ("Ordenastes": with a bare object "Mandastes" was heard as "you sent"); the slot Mandasti138 lives on in that decision\'s other options.'
C['118:138'] = 'Decisions "v138" and "nimis138". Draft 13 "Mandastes os vossos testemunhos como justiça" (heard as "you sent"); draft 14 "Mandastes que … sejam justiça" (the Latinist: major, a clause the Latin lacks); draft 15 "Ordenastes os vossos testemunhos como justiça: * e como a vossa verdade, sem medida" — the build the Latinist passed, with a verb that cannot mean "send". The verse is as hard in Latin as in Portuguese. The blind reader hears "testemunhos" first as reports of what God did, here as throughout the psalm (the cost of the cognate, accepted in D15).'

# ---- 118:140: a passive state that is still plainly fire
for o in byId['eloquia']['options']:
    o['forms']['e_oa'] = 'o' if o['label'].startswith('ditos') else 'a'
ign = byId['ignitum']
ign['options'][0]['note'] += ' REFUSED by the Latinist on draft 14 (critical): it identifies the word with fire itself, where ignítum is a passive participle — a thing submitted to fire, made to glow. Draft 15 leaves it.'
ign['options'].insert(0, {
    'label': 'está todo em brasa', 'forms': {'ignitum': 'está tod{e_oa} em brasa'},
    'note': 'Ruled in draft 15. Again two readers: "é muito ardente" (draft 13) passed the Latinist expressly and was heard by the blind reader as "fervent" before "burning"; "é fogo muito ardente" (draft 14) named the fire and was marked critical by the Latinist, rightly — a noun predicate is not a participle. "Em brasa" is what igníre does to iron: heated until it glows — a passive state, and nothing but fire to the ear. veheménter → "todo": the idiomatic intensive of "em brasa" ("muito em brasa" is not said). It agrees in gender with whichever form of the term stands as subject (slot {e_oa} in decision "eloquia").', 'from': 'latinist'})
ign['options'].insert(1, {
    'label': 'é intensamente abrasado', 'forms': {'ignitum': 'é intensamente abrasad{e_oa}'},
    'note': 'The Latinist\'s own fix (with "A vossa palavra … abrasada"): the participle kept as a participle. "Abrasado" is literary in Brazil and "intensamente" is six syllables.', 'from': 'latinist'})
ign['why'] += ' Drafts: 13 "é muito ardente" (Latinist passed; heard as "fervent"); 14 "é fogo muito ardente" (Latinist: critical); 15 "está todo em brasa".'
C['118:140'] = 'The singular elóquium as subject: D16\'s clause, "O que dissestes", with the pronoun illud → "o" and the agreement of "todo" carried by the decision "eloquia" so that every option agrees. Decision "ignitum" (draft 15: "está todo em brasa"). diléxit → "amou" (dilígere → amar).'

data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v14.latinist.part4.json', 'note': 'Draft 14, 118:129–176 only. He passed every verse draft 14 had rebuilt for the stylist (118:152, 158, 160, 169) and "Julgai a minha causa" (118:154). Two new findings, both on wordings draft 14 had changed for the blind reader: 118:140 CRITICAL ("é fogo muito ardente" identifies the word with fire; ignítum is a passive participle) and 118:138 MAJOR ("que … sejam" is a clause the Latin does not have). Both taken in substance — neither by adopting his line, because his lines bring back what the blind reader misheard or the glossary excludes ("A vossa palavra", "sobremaneira"). The same six minors on the clause "o que dissestes" as on draft 13 (he named 118:140 under the critical this time): refused under D16.',
     'outcomes': [
         {'verse': '118:138', 'remark': 'MAJOR: "Mandastes que … sejam" turns the accusatives into a clause of command the Latin lacks; wants the bare apposition "Mandastes a justiça, os vossos testemunhos … sobremaneira"', 'outcome': 'taken', 'decision': 'v138', 'reason': 'The clause is withdrawn; the build he passed on draft 13 ("como … como") returns, with "Ordenastes" so that the verb is not heard as "sent". His bare apposition stays an option; "sobremaneira" failed both other readers at 118:96.'},
         {'verse': '118:140', 'remark': 'CRITICAL: "é fogo muito ardente" replaces the image — ignítum says the word has been submitted to fire, not that it is fire; wants "A vossa palavra é intensamente abrasada"', 'outcome': 'taken', 'decision': 'ignitum', 'reason': 'The noun is withdrawn; "está todo em brasa" keeps the passive state and the fire. His own wording is option 1 (without "A vossa palavra", which is D16\'s question).'},
     ] + [{'verse': v, 'remark': 'minor: the clause "o que dissestes" dates an utterance the noun leaves timeless; wants "a vossa palavra"', 'outcome': 'refused', 'decision': 'eloquia',
           'reason': 'D16, as on draft 13.'} for v in ['118:133', '118:154', '118:169', '118:170', '118:172']]},
    {'step': 'revision', 'version': 15, 'note': 'Draft 15 (draft 14 kept as prayed.v14.json; ps118/revise_v15.py). Two verses: 118:138 "Ordenastes os vossos testemunhos como justiça: * e como a vossa verdade, sem medida"; 118:140 "O que dissestes está todo em brasa: * e o vosso servo o amou". Both are the third wording of their verse: each had to satisfy the blind reader (a wrong sense heard first) and the Latinist (a structure the Latin lacks) at once. 118:1–128 untouched.'},
]
data['version'] = 15
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 15 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
