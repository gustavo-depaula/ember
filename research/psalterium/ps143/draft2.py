"""Ps 143 draft 2 from draft 1 (prayed.v1.json) after the v1 readers.
python3.13 research/psalterium/ps143/draft2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
P = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
P['version'] = 2
P['status'] = 'reviewed'
V = P['verses']
V['143:1'] = 'Bendito o Senhor, meu Deus, que {docet} as minhas mãos para a batalha, * e os meus dedos para a guerra.'
V['143:2b'] = 'O meu protetor, e nele esperei: * {subdit} o meu povo sob mim.'
V['143:3'] = 'Senhor, que é o homem, {quia3a} {innotuisti}? * ou o filho do homem, {quia3b} {reputas}?'
V['143:7'] = 'Enviai a vossa mão do alto, {eripe7}, e livrai-me {aquis}: * da mão dos {alieni7}.'
V['143:8'] = 'Cuja boca {locutum8} {vanitatem8}: * e a sua direita é direita de iniquidade.'
V['143:11'] = 'E {erue11} da mão dos {alieni11}, cuja boca {locutum11} {vanitatem11}: * e a sua direita é direita de iniquidade:'
V['143:12b'] = 'As suas filhas estão {compositae}: * {circum} {similitudo}.'
V['143:13'] = 'Os seus celeiros estão cheios, * {eructantia} {exhoc}.'
V['143:14'] = 'Não há ruína de {maceria}, nem {transitus}: * nem clamor nas suas praças.'

D = {d['id']: d for d in P['decisions']}

# fulgura: the stylist's plainer verb now option 0
f = D['fulgura']
f['options'] = [
    {"label": "Fazei brilhar o relâmpago", "forms": {"fulgura": "Fazei brilhar o relâmpago"}, "note": "v2, the stylist's: the plainer of two faithful verbs (D2); 'fulgurar' was unknown to the ambiguity reader and bookish to the stylist. MS1932 'Faze brilhar'.", "from": "stylist"},
    {"label": "Fazei fulgurar o relâmpago", "forms": {"fulgura": "Fazei fulgurar o relâmpago"}, "note": "v1. Keeps the root of fulguráre.", "from": "draft"},
    {"label": "Lançai o relâmpago", "forms": {"fulgura": "Lançai o relâmpago"}, "note": "Loses the verb's light.", "from": "draft"},
]
f['why'] += " v2: the stylist asked 'brilhar' and the ambiguity reader did not know 'fulgurar'; taken as the plainer of two faithful words — both render a verb of flashing light, and 'relâmpago' carries the lightning."

inn = D['innotuisti']
inn['options'] = [
    {"label": "a ele vos tenhais dado a conhecer", "forms": {"innotuisti": "a ele vos tenhais dado a conhecer"}, "note": "v2, the stylist's order: the colon lands on the stressed end of 'conhecer' instead of a weak 'a ele'. Order only (D2).", "from": "stylist"},
    {"label": "vos tenhais dado a conhecer a ele", "forms": {"innotuisti": "vos tenhais dado a conhecer a ele"}, "note": "v1.", "from": "draft"},
    {"label": "vos deis a conhecer a ele", "forms": {"innotuisti": "vos deis a conhecer a ele"}, "note": "Shorter; the perfect lost.", "from": "draft"},
    {"label": "a ele vos tenhais manifestado", "forms": {"innotuisti": "a ele vos tenhais manifestado"}, "note": "MS1932's verb.", "from": "MS1932"},
]

sim = D['similitudo']
sim['why'] += " v2: a comma before it, from the stylist's line (breath)."

new = [
    {"id": "quia", "refs": ["143:3"], "latin": "quia innotuísti ei? … quia réputas eum?", "kind": "grammar",
     "why": "The Latinist (v1, minor) reads 'quia' as a plain 'that' and hears a purpose in 'para que'. The same question in 8:5 (quod memor es … quóniam vísitas) is built 'que é o homem, para que …?' and was held there against two Latinist majors (D25): it is how Portuguese asks this question, presupposing the fact, and MS1932 builds it the same way here ('para que a ele te tenhas manifestado'). His fix 'que é o homem, que vos tenhais dado a conhecer a ele?' is not a Portuguese question. Refused; kept as an option.",
     "options": [
         {"label": "para que … para que", "forms": {"quia3a": "para que", "quia3b": "para que"}, "note": "Draft; 8:5's build (D25); MS1932.", "from": "draft"},
         {"label": "que … que", "forms": {"quia3a": "que", "quia3b": "que"}, "note": "The Latinist's fix.", "from": "latinist"},
     ]},
    {"id": "docet", "refs": ["143:1"], "latin": "qui docet manus meas ad prǽlium", "kind": "glossary",
     "why": "The same Latin as 17:35 'Qui docet manus meas ad prǽlium' → 'Que ensina as minhas mãos para a batalha', so the same Portuguese (rule 6). The stylist asks 'adestra' (the CNBB's verb, from the Hebrew לְמַד too — circulation.md): 'ensinar … para' is a calque to him. Refused: docére → ensinar is the row's (17:35–36b echo 'ensina … me ensinará'), and the Ps 17 stylist's 'instrui' was refused for the same reason. If taken, 17:35 moves with it.",
     "options": [
         {"label": "ensina", "forms": {"docet": "ensina"}, "note": "Draft = 17:35.", "from": "glossary"},
         {"label": "adestra", "forms": {"docet": "adestra"}, "note": "The v1 stylist; MS1932 'adestra' too. Another verb (train).", "from": "stylist"},
     ]},
    {"id": "subdit", "refs": ["143:2b"], "latin": "qui subdit pópulum meum sub me", "kind": "grammar",
     "why": "The stylist heard the bare 'que' as having lost its antecedent (the titles are two cola back) and 'que sujeita' as possibly 'que [é] sujeita'; the ambiguity reader heard the same loose 'que' and 'sujeita' as an adjective. Naming the subject is grammar (D2) and settles both; the verb stays 17:48's.",
     "options": [
         {"label": "ele, que sujeita", "forms": {"subdit": "ele, que sujeita"}, "note": "v2, the stylist's.", "from": "stylist"},
         {"label": "que sujeita", "forms": {"subdit": "que sujeita"}, "note": "v1; the Latin's bare relative.", "from": "draft"},
     ]},
    {"id": "aquis", "refs": ["143:7"], "latin": "de aquis multis", "kind": "glossary",
     "why": "The same Latin as 17:17 'assúmpsit me de aquis multis' → 'de muitas águas' (rule 6; 76:20, 106:23 'em muitas águas'). The stylist hears it clipped and asks 'das muitas águas' (MS1932's). The article is grammar and D2 would allow it, but it would break a phrase that stands three times; refused, option — if taken, taken in 17:17 too.",
     "options": [
         {"label": "de muitas águas", "forms": {"aquis": "de muitas águas"}, "note": "Draft = 17:17.", "from": "glossary"},
         {"label": "das muitas águas", "forms": {"aquis": "das muitas águas"}, "note": "The v1 stylist; MS1932.", "from": "stylist"},
     ]},
    {"id": "alieni", "refs": ["143:7", "143:11"], "latin": "de manu filiórum alienórum", "kind": "glossary",
     "why": "The aliénus row keeps 'estranho' (wider than 'estrangeiro': anyone not one's own), and 17:46 'Os filhos estranhos' was held after a blind reader heard 'odd children'. Here the stylist and the ambiguity reader both heard 'strange, odd children' again — the second psalm with that finding, recorded in the row for the coordinator. Held for the row and the Ps 17 twin; 'filhos estrangeiros' (the stylist) and 'filhos de estrangeiros' (17:46's option) are options, both slots together.",
     "options": [
         {"label": "filhos estranhos", "forms": {"alieni7": "filhos estranhos", "alieni11": "filhos estranhos"}, "note": "Draft = 17:46.", "from": "glossary"},
         {"label": "filhos estrangeiros", "forms": {"alieni7": "filhos estrangeiros", "alieni11": "filhos estrangeiros"}, "note": "The v1 stylist. Narrows aliénus to foreigners.", "from": "stylist"},
         {"label": "filhos de estrangeiros", "forms": {"alieni7": "filhos de estrangeiros", "alieni11": "filhos de estrangeiros"}, "note": "17:46's option.", "from": "glossary"},
     ]},
    {"id": "locutum", "refs": ["143:8", "143:11"], "latin": "Quorum os locútum est vanitátem", "kind": "word",
     "why": "loqui → 'falar', with the accusative of content kept, as 37:13 'falaram vaidades', 16:9b 'falou soberba', 121:8 'falava paz' (the loqui pacem row). The stylist asks 'proferiu' as more idiomatic with an abstract object. Refused: another verb for the Latin's plain 'speak', and it would split this formula from its kin. Option.",
     "options": [
         {"label": "falou", "forms": {"locutum8": "falou", "locutum11": "falou"}, "note": "Draft; MS1932 'falou vaidade'.", "from": "draft"},
         {"label": "proferiu", "forms": {"locutum8": "proferiu", "locutum11": "proferiu"}, "note": "The v1 stylist.", "from": "stylist"},
     ]},
    {"id": "circum", "refs": ["143:12b"], "latin": "circumornátæ", "kind": "order",
     "why": "The stylist found 'adornadas em volta' stiff and 'volta à' a clump, and asked 'ornadas em redor,' with a comma for breath. Taken: same meaning, 'ornar' is nearer circum-ornáre than 'adornar', and 'em redor' is the Latin's 'circum'.",
     "options": [
         {"label": "ornadas em redor,", "forms": {"circum": "ornadas em redor,"}, "note": "v2, the stylist's.", "from": "stylist"},
         {"label": "adornadas em volta", "forms": {"circum": "adornadas em volta"}, "note": "v1.", "from": "draft"},
     ]},
    {"id": "exhoc", "refs": ["143:13"], "latin": "ex hoc in illud", "kind": "grammar",
     "why": "The stylist heard 'deste para aquele' dangling with no noun and asked 'de um para outro', the Portuguese idiom; the ambiguity reader could not place 'deste para aquele' either. Taken: the idiom says 'from this one into that one' as the Latin does. 74:9's 'ex hoc in hoc' → 'deste para aquele' is not the same Latin (a cup poured), so rule 6 does not bind. His 'transbordando' was refused (the eructantia decision).",
     "options": [
         {"label": "de um para outro", "forms": {"exhoc": "de um para outro"}, "note": "v2, the stylist's; MS1932 'duns para outros'.", "from": "stylist"},
         {"label": "deste para aquele", "forms": {"exhoc": "deste para aquele"}, "note": "v1; 74:9's words.", "from": "draft"},
     ]},
    {"id": "maceria", "refs": ["143:14"], "latin": "ruína macériæ", "kind": "glossary",
     "why": "macéria → 'cerca' is the row's (61:4, 79:13; φραγμός). The stylist hears a fence and asks 'muro' (MS1932 'ruína de muro'); the ambiguity reader could mishear 'cerca' as 'cerca de' (about). L&S macéria is a wall of loose stones, an enclosure. Held for the row and its two psalms; 'muro' is murus's word elsewhere. Evidence added to the row.",
     "options": [
         {"label": "cerca", "forms": {"maceria": "cerca"}, "note": "Draft = 61:4, 79:13.", "from": "glossary"},
         {"label": "muro", "forms": {"maceria": "muro"}, "note": "The v1 stylist; MS1932.", "from": "stylist"},
     ]},
]
D['eructantia']['why'] += " v2: the stylist asked 'transbordando' (jorrar of grain odd) — refused, the row's root kept; option 1."
D['eripere']['why'] += " v1 Latinist (minor) asked 'arrancai-me' at 143:10 for one Portuguese verb per éripe; refused: with no source named 'arrancai-me' hangs (the row's Ps 6 / 118:153 finding), and it would merge éripe (10) with érue (11) where the two Latin verbs touch. His reading is option 3."
P['decisions'].extend(new)

P['choices']['143:6'] += " The ambiguity reader found no antecedent for 'os' (dispersareis, perturbareis): the Latin's 'eos' has none either (the enemies appear in 143:7); kept."
P['choices']['143:8'] += " The ambiguity reader heard 'direita' without 'mão' as 'what is right' or the political right: the déxtera row keeps the bare noun, as 17:36a, 117:16; recorded, not changed."
P['choices']['143:15'] += " The ambiguity reader could not tell who 'disseram' are and heard both lines as one approving statement: the Latin leaves it just so (no 'sed'); kept."

P['audit'].extend([
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, read latin.json. 2 minor, both refused with reasons; 'faithful, close rendering throughout'.",
     "outcomes": [
         {"verse": "143:3", "remark": "'para que' adds purpose to 'quia'", "outcome": "option", "decision": "quia", "reason": "8:5's build, held under D25; his fix is not a Portuguese question"},
         {"verse": "143:10", "remark": "éripe → 'arrancai-me' as in 143:7", "outcome": "option", "decision": "eripere", "reason": "no source named: 'arrancai-me' hangs; merges éripe with érue at 10/11"},
     ]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, read latin.json. 11 remarks in 10 verses; best 143:5, worst 143:13. 5 taken (all order, grammar, or the plainer of two faithful words), 6 kept as options.",
     "outcomes": [
         {"verse": "143:1", "remark": "'adestra' for 'ensina'", "outcome": "option", "decision": "docet", "reason": "17:35 is the same Latin; docére → ensinar"},
         {"verse": "143:2b", "remark": "name the subject: 'ele, que sujeita'", "outcome": "taken", "decision": "subdit"},
         {"verse": "143:3", "remark": "front 'a ele'", "outcome": "taken", "decision": "innotuisti"},
         {"verse": "143:6", "remark": "'brilhar' for 'fulgurar'", "outcome": "taken", "decision": "fulgura"},
         {"verse": "143:7", "remark": "'das muitas águas'", "outcome": "option", "decision": "aquis", "reason": "17:17 is the same Latin"},
         {"verse": "143:7", "remark": "'filhos estrangeiros'", "outcome": "option", "decision": "alieni", "reason": "the aliénus row and 17:46; evidence added to the row"},
         {"verse": "143:8", "remark": "'proferiu' for 'falou'", "outcome": "option", "decision": "locutum", "reason": "loqui → falar with accusative, as 37:13"},
         {"verse": "143:11", "remark": "same as 7–8", "outcome": "option", "decision": "alieni", "reason": "as 143:7–8"},
         {"verse": "143:12b", "remark": "'ornadas em redor,'", "outcome": "taken", "decision": "circum"},
         {"verse": "143:13", "remark": "'transbordando de um para outro'", "outcome": "taken", "decision": "exhoc", "reason": "idiom taken; 'transbordando' refused for the eructáre row (option in eructantia)"},
         {"verse": "143:14", "remark": "'muro' for 'cerca'", "outcome": "option", "decision": "maceria", "reason": "macéria → cerca, 61:4, 79:13"},
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 30 readings; unknown: fulgurar, saltério, fumegarão, iniquidade, celeiros, amparo. It attached 12–14 to the strange sons, as the Latin's 'quorum' intends.",
     "outcomes": [
         {"verse": "143:2b", "remark": "loose 'que'; 'sujeita' heard as adjective", "outcome": "taken", "decision": "subdit"},
         {"verse": "143:3", "remark": "'filho do homem' heard as Christ", "outcome": "refused", "reason": "the Latin's phrase invites it (fílius hóminis row, 8:5); lowercase kept"},
         {"verse": "143:4", "remark": "'vaidade' heard as conceit", "outcome": "option", "decision": "vanitas", "reason": "the row stands; evidence added for the coordinator"},
         {"verse": "143:6", "remark": "'fulgurar' unknown; 'os' has no antecedent", "outcome": "taken", "decision": "fulgura", "reason": "verb taken; the antecedent is missing in the Latin too"},
         {"verse": "143:7", "remark": "'filhos estranhos' heard as odd children", "outcome": "option", "decision": "alieni", "reason": "the row and 17:46"},
         {"verse": "143:8", "remark": "'direita' not heard as the hand", "outcome": "refused", "reason": "the déxtera row"},
         {"verse": "143:13", "remark": "'deste para aquele' unclear", "outcome": "taken", "decision": "exhoc"},
         {"verse": "143:14", "remark": "'cerca' as 'cerca de'; the line obscure", "outcome": "option", "decision": "maceria", "reason": "the row; the Latin line is itself terse"},
         {"verse": "143:15", "remark": "who 'disseram' are", "outcome": "refused", "reason": "the Latin leaves it open; no 'but' added"},
         {"verse": "143:9", "remark": "'saltério' unknown / heard as the book", "outcome": "refused", "reason": "the psaltérium row; 'de dez cordas' names the instrument"},
     ]},
    {"step": "revision", "version": 2, "note": "v2 (draft 1 kept as prayed.v1.json): 143:2b subject named; 143:3 'a ele' fronted; 143:6 'Fazei brilhar'; 143:12b 'ornadas em redor,'; 143:13 'de um para outro'. Seven reader remarks became options (quia, docet, aquis, alieni, locutum, maceria, eripere). Script: ps143/draft2.py."},
])

(here / 'prayed.json').write_text(json.dumps(P, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('written v2')
