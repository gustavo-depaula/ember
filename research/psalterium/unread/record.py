"""Append the audit steps of the unread-drafts review (2026-09-21) to each psalm's prayed.json.

Every remark is recorded with "outcome": "pending" — the text is the main session's to change — and with this
reviewer's "recommendation" (take / refuse / option) and its reason. Idempotent: a step whose file is already in the
audit is not added twice.

python3.13 research/psalterium/unread/record.py
"""

import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
who = 'review of unread drafts (sub-agent, 2026-09-21)'

# (psalm, role, version, file, which verses were read, note)
steps = [
    ('ps004', 'latinist', 3, 'critic/prayed-v3.latinist.astra.json', 'the whole psalm (prayed.vos.json) with the pilot’s own prompt, prompts/latinist-critic.md',
     'Draft 3 (D8: escutar ×3, 4:3 verb supplied, 4:8 subject named), never read by a Latinist before. Every verse none but 4:3 (minor: the supplied “tereis” fixes a tense the verbless Latin leaves implicit — he proposes draft 2’s wording, which is option 2 of “gravi”). escutar passed in 4:2a, 4:2b, 4:4; “eles se multiplicaram” passed. His “disagreementsWithTheDossier” are about the machine parse in dossier.json, not the translation.'),
    ('ps004', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verses with one verse either side (ps004/unread/blind/)',
     'First ambiguity reading of Ps 4. One real fault on a changed verse: 4:8 “eles se multiplicaram”, the subject D8 named so that the verb would not be heard of the produce, is still heard of the produce (trigo, vinho e azeite) — the supplied pronoun attaches to the nearest nouns. Unknown word: compungi-vos.'),
    ('ps006', 'latinist', 3, 'critic/v3.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 3 (D21: 6:2 “repreendais”). Clean: no verse remarked, every mark confirmed.'),
    ('ps006', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verse with one verse either side (ps006/unread/blind/)',
     '6:2 “repreendais” heard rightly. Two items, both the Latin’s own range; no unknown word.'),
    ('ps007', 'latinist', 3, 'critic/v3.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 3 (D25: 7:13 “converterdes”). Clean: no verse remarked. He did not repeat the 7:5b major he had raised on drafts 1 and 2 (the words are unchanged) — D24’s variance once more.'),
    ('ps007', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verse with one verse either side (ps007/unread/blind/)',
     '7:13 “Se não vos converterdes” heard as said to people (“vocês”), not to God: the cost of vós found on draft 1 (voltardes) does not recur. Unknown word: brandirá (unchanged).'),
    ('ps009', 'latinist', 7, 'critic/v7.latinist.part1.json', 'stage one, 9:2–9:21 (ps009/part1/, built by ps009/part.py 2 21 part1), which holds both unread verses',
     'Drafts 4 (9:12 “os seus feitos”) and 7 (D30: 9:8b “o mundo”) on stage one. Both unread verses clean. Four remarks on verses already read: 9:4 MAJOR asking to go back to draft 1’s “Ao voltar para trás”, the very wording his own draft-1 major replaced; 9:6 minor (fourth time), 9:10 MAJOR (third) and 9:13 MAJOR (second), all three repeats of remarks already held.'),
    ('ps009', 'ambiguity', 7, 'critic/v7.ambiguity.unread.json', 'the changed verses with one verse either side (ps009/unread/blind/)',
     '9:8b “o mundo” and 9:12 “os seus feitos” heard rightly. Unknown: equidade (9:8b, unchanged word), Sião. No fault on a changed verse.'),
    ('ps016', 'latinist', 4, 'critic/v4.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 4 (16:14b “foi enchido”, the v3 gate’s own words). Clean: no verse remarked.'),
    ('ps016', 'ambiguity', 4, 'critic/v4.ambiguity.unread.json', 'the changed verse with one verse either side (ps016/unread/blind/)',
     '16:14b: “o ventre deles” likely heard as the belly of “os poucos da terra” (the nearest group) — the Latin’s venter eórum is as open; the change of voice drew no remark. Unknown: ímpio (16:13).'),
    ('ps017', 'latinist', 5, 'critic/v5.latinist.part1.json', 'stage one, 17:2–17:25 (ps017/part1/, built by ps017/part.py 2 25 part1), which holds 17:13',
     'Draft 3’s 17:13 fix (“Diante do clarão, na sua presença, …”), unread until now. 17:13 clean. Two minors on 17:3b–c (adjútor, suscéptor), the remarks held there since draft 1 (majors on draft 2).'),
    ('ps017', 'ambiguity', 5, 'critic/v5.ambiguity.unread.json', 'the changed verse with one verse either side (ps017/unread/blind/)',
     '17:13: “na sua presença” heard as God’s; “passaram as nuvens” heard as “the clouds went away”, and the hail and coals possibly as a separate item — both within the Latin’s own range. No unknown word.'),
    ('ps030', 'latinist', 3, 'critic/v3.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 3 (30:12 “sobremaneira”, the v2 gate’s own fix). 30:12 clean. Three remarks on verses he had passed twice unchanged: 30:2 and 30:17 MAJOR (confúndar as optative → “não seja eu envergonhado”; D23’s formula, the Te Deum line), 30:23b minor (exaudísti → atender, against D3).'),
    ('ps030', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verse with one verse either side (ps030/unread/blind/)',
     'The changed word itself, “sobremaneira” (30:12), is listed as UNKNOWN. 30:12 “uma afronta” is heard as an offence the speaker gives, not a disgrace he suffers (unchanged word).'),
    ('ps031', 'latinist', 3, 'critic/v3.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 3 (31:9b, the supplied “Senhor,” removed — the v2 gate’s fix). Clean: no verse remarked.'),
    ('ps031', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verse with one verse either side (ps031/unread/blind/)',
     '31:9b without “Senhor,”: “que não se aproximam de vós” is heard as said to the listeners — the mishearing draft 2’s vocative had mended is back, as foreseen (HANDOFF, item 16). Unknown: mulo, cabresto, maxilas, flagelos (all unchanged).'),
    ('ps117', 'latinist', 3, 'critic/v3.latinist.json', 'the whole psalm (prayed.vos.json)',
     'Draft 3 (D13: 117:19 “Abri-me”). 117:19 clean. Three remarks on verses already read: 117:6–7 minors (adjútor, held since draft 1), 117:27b MAJOR (condénsis → “nas espessuras”, as on draft 1; silent on draft 2).'),
    ('ps117', 'ambiguity', 3, 'critic/v3.ambiguity.unread.json', 'the changed verse with one verse either side (ps117/unread/blind/)',
     '117:19 “Abri-me” heard as the imperative (the homograph with “I opened” noticed, not taken) — D13 holds for the ear. No unknown word.'),
    ('ps118', 'latinist', 17, 'critic/v17.latinist.unread.json', 'only the 19 verses no Latinist had read in their present wording (ps118/unread/, built by unread/build.py): 118:9, 16, 17 (D15 palavras), 38, 41, 50, 58, 67, 76 (D16 clause, and 38/50 reordered), 89, 93, 98, 111, 112 (D23 para sempre), 11, 103, 148, 158, 162 (D26 plural clause)',
     'D15 palavras (118:9, 16, 17) and D23 para sempre (118:89, 93, 98, 111, 112) clean. FIVE MAJORS on D26: every plural elóquia rendered “o que dissestes” (118:11, 103, 148, 158, 162) — the plural lost and a past verb of saying added; he proposes “as vossas palavras”, which would collide with D15’s sermo → palavras. Six minors on the singular clause (D16’s tense remark again) and one on 118:50 “Isto” for feminine Hæc.'),
    ('ps118', 'ambiguity', 17, 'critic/v17.ambiguity.unread.json', 'the same 19 verses, Portuguese only (ps118/unread/blind/)',
     'Every changed wording heard rightly: “o que dissestes” understood as what God said/promised in all eleven places, “palavras”, “para sempre”. Unknown words, all unchanged terms: preceitos (×3 — D15’s justificatiónes), vivificar (×3), exultação, definhava, despojos (118:162, heard as remains).'),
    ('ps233', 'latinist', 2, 'critic/v2.latinist.json', 'the whole canticle (prayed.vos.json)',
     'Draft 2 (2:32 “para a revelação”). Clean. No ambiguity reader: the change is an article, nothing a listener hears differently.'),
]

# (psalm, verse, a word from the remark) -> (recommendation, reason[, decision])
verdicts = {
    ('ps004', '4:3', 'tereis'): ('option', 'It is option 2 of “gravi” already. D8 supplied the verb under D2 (a verb Portuguese needs; the stylist asked for it); a verbless “até quando de coração pesado?” was the draft-2 wording. Keep D8, the option stays.', 'gravi'),
    ('ps004', '4:8', 'multiplicaram'): ('take', 'A real fault on a changed verse: D8 named the subject so the verb would not be heard of the produce, and it still is. The main session should find an order that ties “eles” to the people (Douay-Rheims: “they are multiplied”), e.g. the subject before the verb at the head of the second colon, keeping the mark.', 'multiplicati'),
    ('ps004', '4:3', 'vaidade'): ('refuse', 'Unchanged word, the glossary’s vánitas → vaidade; heard as vanity of appearance. Evidence for that row, not a change here.'),
    ('ps004', '4:3', 'coração pesado'): ('refuse', 'Heard as a sad heart; gravi corde is heaviness/dullness of heart — the Latin’s own image kept literally. No change.'),
    ('ps004', '4:4', 'santo'): ('refuse', 'The Latin’s word (sanctum suum); the cost of “santo” as a canonised saint is known. No change.'),
    ('ps030', '30:2', 'envergonhado'): ('option', 'confúndar is future or subjunctive by form; the future is D23’s formula and the Te Deum line (= 70:1), and he passed it on drafts 1 and 2. The optative is option 3 of “confundar”. Keep, held on purpose; Gustavo’s call.', 'confundar'),
    ('ps030', '30:17', 'envergonhado'): ('option', 'Same slot as 30:2 (decision “confundar”, option 3). Keep with 30:2.', 'confundar'),
    ('ps030', '30:23b', 'escutastes'): ('refuse', 'D3: exaudíre → escutar across the psalter.'),
    ('ps030', '30:12', 'sobremaneira'): ('option', 'The changed word is unknown to the blind reader. “grandemente” (option 3 of “valde”) is degree, as the gate wanted, and current; “muito” was heard as “many neighbours”. Recommend the main session weigh “grandemente”.', 'valde'),
    ('ps030', '30:12', '“uma afronta”'): ('refuse', 'Unchanged word (opprobrium); heard as an offence given, not a disgrace suffered. Evidence for the glossary row, not a change here.'),
    ('ps031', '31:9b', 'aproximam'): ('option', 'The foreseen mishearing (HANDOFF item 16): without a vocative the vós is heard as the congregation. Now two blind readings agree. Whether a vocative may be supplied is Gustavo’s ruling; draft 2’s “Senhor,” is the wording to restore if he allows it.'),
    ('ps009', '9:4', 'voltar'): ('refuse', 'He asks for draft 1’s “Ao voltar para trás”, which his own draft-1 major replaced with “Ao fazer voltar” (taken). The same reader contradicting himself on unchanged words (D24).', 'convertendo'),
    ('ps009', '9:6', 'séculos'): ('option', 'Fourth time; the glossary formula, held with the singular as option.'),
    ('ps009', '9:10', 'auxílio'): ('refuse', 'Third time; adjútor → auxílio held against the gate on purpose (D24, D27), waiting on Gustavo’s ruling of the row (HANDOFF item 15).'),
    ('ps009', '9:13', 'sangue'): ('option', 'Second time; held on draft 3 because the Gallican is the Greek word for word (τὰ αἵματα αὐτῶν). Stays held.'),
    ('ps017', '17:3b', 'auxílio'): ('option', 'Held since draft 1 (D24); the adjútor row waits on Gustavo.', 'adjutor'),
    ('ps017', '17:3c', 'amparo'): ('refuse', 'D19 settles suscéptor → amparo; “amparador” is not current Portuguese.', 'susceptor'),
    ('ps117', '117:6', 'auxílio'): ('option', 'Held since draft 1 (decision “adjutor”); the row waits on Gustavo.', 'adjutor'),
    ('ps117', '117:7', 'auxílio'): ('option', 'The same slot as 117:6.', 'adjutor'),
    ('ps117', '117:27b', 'ramos'): ('option', 'Refused on draft 1 (the Greek’s boughs, Douay-Rheims “boughs”); silent on draft 2; his fix is option 2 of “condensis”. Keep.', 'condensis'),
    ('ps118', '118:50', 'Hæc'): ('refuse', 'Portuguese has no gendered demonstrative without a noun (“Esta me consolou” asks “esta quê?”); the referent is the next colon, as the blind reader heard. Passed unchanged on drafts 4 and 5.'),
    ('ps118', '118:162', 'despojos'): ('refuse', 'Unchanged word (spólia); heard as remains. Evidence for the row, not a change here.'),
}
# the D26 majors and the D16 minors on Ps 118
for vid in ('118:11', '118:103', '118:148', '118:158', '118:162'):
    verdicts[('ps118', vid, 'dissestes')] = ('option', 'D26 against the gate: five majors on the plural clause. His fix “as vossas palavras” collides with D15 (sermo → palavras, 118:9, 16, 17 — passed in this same reading), so not as proposed. The gate cannot be ignored: either D26 is held on purpose with its reason written in decision “eloquia”, or the plural goes back to “os vossos ditos”, which the Latinist passed (drafts 10 and 16) and the stylist refused. Main session’s ruling.', 'eloquia')
for vid in ('118:38', '118:41', '118:50', '118:58', '118:67', '118:76'):
    verdicts[('ps118', vid, 'dissestes')] = ('refuse', 'D16’s tense remark, raised and refused before (D16, D24); the clause for the singular stands.', 'eloquia')

defaults = {
    'latinist': ('refuse', 'No change recommended.'),
    'ambiguity': ('refuse', 'No fault: within the Latin’s own range, or heard rightly.'),
    'unknown': ('refuse', 'Unchanged word; recorded as evidence for its glossary row, no change here.'),
}


def parse(reply):
    text = re.sub(r'^```\w*\s*|\s*```$', '', reply.strip())
    try:
        return json.loads(text)
    except ValueError:
        return json.loads(re.search(r'\{.*\}', text, flags=re.S).group(0))


heard = {'multiplicaram', 'vaidade', 'coração pesado', 'santo', 'sobremaneira', '“uma afronta”', 'aproximam', 'despojos'}


def verdict(psalm, vid, text, kind):
    for (p, v, key), value in verdicts.items():
        if (key in heard) != (kind != 'latinist'):
            continue
        if p == psalm and v == vid and key.lower() in text.lower():
            return value
    return defaults[kind]


def outcome(psalm, vid, remark, kind):
    found = verdict(psalm, vid, remark, kind)
    record = {'verse': vid, 'remark': remark, 'outcome': 'pending', 'recommendation': found[0], 'reason': found[1]}
    if len(found) > 2:
        record['decision'] = found[2]
    return record


def outcomesOf(psalm, role, reply):
    out = []
    if role == 'latinist':
        for v in reply.get('verses', []):
            for i in v.get('issues', []):
                remark = f"{v.get('severity', '')}: “{i.get('portuguese', '')}” — {i.get('problem', '')} → “{i.get('fix', '')}”"
                out.append(outcome(psalm, v['id'], remark, 'latinist'))
    else:
        for a in reply.get('ambiguities', []):
            remark = f"“{a.get('words', '')}”: {' / '.join(a.get('readings', []))}; likely heard: {a.get('likelyHeard', '')}"
            out.append(outcome(psalm, a['id'], remark, 'ambiguity'))
        for u in reply.get('unknownWords', []):
            out.append(outcome(psalm, u['id'], f"unknown word: “{u.get('word', '')}”", 'unknown'))
    return out


for psalm, role, version, file, read, note in steps:
    path = root / psalm / 'prayed.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    # a re-run replaces this review's own step for the file, never a step of the psalm's agents
    data['audit'] = [a for a in data['audit'] if not (a.get('file') == file and who in str(a.get('note', '')))]
    if any(a.get('file') == file for a in data['audit']):
        print(psalm, file, 'already recorded by another step')
        continue
    reply = parse(json.loads((root / psalm / file).read_text(encoding='utf-8'))['reply'])
    outcomes = outcomesOf(psalm, role, reply)
    step = {
        'step': role, 'version': version, 'file': file,
        'note': f'{note} Read: {read}. Run by the {who}. Every outcome is PENDING — the text is unchanged and each remark is for the main session; “recommendation” is this reviewer’s advice.',
        'outcomes': outcomes,
    }
    data['audit'].append(step)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(psalm, file, len(outcomes), 'outcomes;', ', '.join(f"{o['verse']} {o['recommendation']}" for o in outcomes if o['recommendation'] != 'refuse' or o['reason'] not in (defaults['ambiguity'][1], defaults['unknown'][1])))
