"""Ps 142 draft 2 from the v1 readers. python3.13 research/psalterium/ps142/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    raise SystemExit('already v2')
V = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 142:3b — the Latin's order in the second colon (verb before subject), the stylist's; grammar and order, D2.
V['142:3b'] = V['142:3b'].replace('e o meu espírito se angustiou sobre mim,', '{anxiatus},')
d['decisions'].append({
    "id": "anxiatus", "refs": ["142:3b"], "latin": "et anxiátus est super me spíritus meus", "kind": "order",
    "why": "The stylist heard 'espírito se angustiou' as a stumble (the proclitic between a proparoxytone and the verb) and asked for the Latin's own order, verb first. The words are unchanged; the two halves of the colon now mirror each other as in the Latin (verb … subject · in me … verb … subject).",
    "options": [
        {"label": "e angustiou-se sobre mim o meu espírito", "forms": {"anxiatus": "e angustiou-se sobre mim o meu espírito"}, "note": "v2, the stylist's; the Latin's order.", "from": "stylist"},
        {"label": "e o meu espírito se angustiou sobre mim", "forms": {"anxiatus": "e o meu espírito se angustiou sobre mim"}, "note": "Draft 1; subject first.", "from": "draft"}
    ]})

# 142:8b — 'por onde eu ande' (stylist): the preposition a Portuguese road takes; grammar, D2.
o = dec['ambulem']['options']
o[0], o[1] = o[1], o[0]
o[0]['note'] = "v2, the stylist's: 'em que eu ande' is a calque; a road in Portuguese is walked 'por onde'. The mood and the verb unchanged."
o[0]['from'] = 'stylist'
o[1]['note'] = "Draft 1. The Latin's 'in' kept; the stylist heard it as a calque."

# 142:3b saeculi — the Latinist's genitive kept as options.
dec['saeculi']['options'].append({"label": "do século", "forms": {"saeculi": "do século"}, "note": "The Latinist (v1, minor): the bare genitive kept. Refused: heard in Brazil first as 'of the century'. 'outrora' was listed unknown by the ambiguity reader, who still heard 'the long-dead' rightly.", "from": "latinist"})
dec['saeculi']['why'] += " v1 readers: the Latinist (minor) asked the genitive back ('do século'); the ambiguity reader listed 'outrora' as unknown but heard 'the long-dead'. 'de séculos' keeps the root but ends the mediant on a proparoxytone. Held."

# 142:10b vivificabis — record the seventh unknown and the stylist's request.
dec['vivificabis']['why'] += " v1: the stylist asked 'vós me dareis a vida' (five-syllable Latinism) and the ambiguity reader listed 'vivificareis' as unknown — the seventh psalm to report it. Held for the row's ruling, for identity with 137:7."
dec['vivificabis']['options'][1]['from'] = 'stylist'
# 142:6 tibi — the stylist's 'diante de vós' already option 1.
dec['tibi']['why'] += " v1: the stylist heard 'para vós … para vós' (ad te / tibi) as an accidental echo and asked 'é, diante de vós, como terra sem água' — that closes the dative to 'before you', which the Latin leaves open; the ambiguity reader heard 'thirsts for you' first, which the draft means to allow. Kept; his reading is option 1."
dec['tibi']['options'][1]['from'] = 'stylist'
dec['similis']['why'] += " v1: the ambiguity reader said the plain 'e' invites the wrong reading, though most would infer 'otherwise'. Held: the Latin says 'et' and the future; 'senão serei' is one touch away."

d['version'] = 2
d['status'] = 'draft'
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, read latin.json. One minor (142:3b 'de outrora' narrows sǽculi); held, 'do século' added as an option. Overall: faithful, tenses, moods and marks kept.",
     "outcomes": [{"verse": "142:3b", "remark": "sǽculi narrowed by 'de outrora'; wants 'do século'", "outcome": "option", "decision": "saeculi", "reason": "'do século' is heard as 'of the century'; both Vulgate-family witnesses (DRB, MS1932) read 'of old'."}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, read latin.json. 8 remarks: 2 taken (142:3b order, 142:8b 'por onde'), 6 refused (kept as options where they are renderings). Best 142:7a, worst 142:10b.",
     "outcomes": [
        {"verse": "142:3b", "remark": "'Colocou-me em lugares escuros' flat; wants 'Pôs-me nas trevas'", "outcome": "refused", "decision": "obscuris", "reason": "collocáre → colocar (row; 'pôr' is pónere's) and 'trevas' is ténebræ's; 'nas trevas' is already option 2 of 'obscuris'."},
        {"verse": "142:3b", "remark": "'espírito se angustiou' stumbles; wants verb first", "outcome": "taken", "decision": "anxiatus"},
        {"verse": "142:6", "remark": "'para vós … para vós' accidental echo; wants 'diante de vós'", "outcome": "option", "decision": "tibi", "reason": "'diante de vós' closes the Latin's open dative."},
        {"verse": "142:8b", "remark": "'em que eu ande' a calque; wants 'por onde eu ande'", "outcome": "taken", "decision": "ambulem"},
        {"verse": "142:10b", "remark": "'por causa do vosso nome' prosaic; wants 'pelo vosso nome'", "outcome": "refused", "reason": "the psalter's formula for 'propter nomen tuum' (24:11, 30:4, 43:26, 108:21); 'pelo' would also be heard as an oath."},
        {"verse": "142:10b", "remark": "'vivificareis' a Latinism; wants 'dareis a vida'", "outcome": "option", "decision": "vivificabis", "reason": "held for identity with 137:7 until the vivificáre row is ruled; the evidence is added to the row."},
        {"verse": "142:10b", "remark": "'guiará à' vowel clash; wants 'há de guiar-me'", "outcome": "refused", "reason": "the Latin's plain future; the auxiliary adds a syllable to a colon already over the Latin, and 'guiará à' elides."},
        {"verse": "142:12b", "remark": "'fareis perecer' weak, breaks the disperdes/perdes echo; wants 'destruireis' in 11b and 12b", "outcome": "refused", "reason": "D24 settled pérdere → fazer perecer, apart from dispérdere → exterminar (the pérdere row names 142:12b); the Latin's two verbs are two (ἐξολεθρεύσεις / ἀπολεῖς), and merging them into 'destruir' loses one; 'destruir' also fails rule 3 at the imperative elsewhere."}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 18 readings, nearly all heard as meant (142:2 'do not judge your servant'; 142:6 'thirsts for you'; 142:8b 'the way I should walk'). Unknown: vivente, outrora, vivificareis, equidade, atribulam — all glossary or formula words, kept.",
     "outcomes": [
        {"verse": "142:7b", "remark": "'e serei' may be heard as the result of the request", "outcome": "option", "decision": "similis", "reason": "the reader says most infer 'otherwise'; the Latin's 'et' kept, 'senão serei' is option 1."},
        {"verse": "142:3a", "remark": "'humilhou na terra' heard as 'here on earth' first", "outcome": "refused", "reason": "the Latin 'in terra' carries both; 7:6 has the same words 'na terra a minha vida'."},
        {"verse": "142:10b", "remark": "'terra reta' image unclear", "outcome": "refused", "decision": "terramrectam", "reason": "the reader heard both senses the draft means to keep open (level ground, upright land)."},
        {"verse": "142:10b", "remark": "unknown 'vivificareis', 'equidade'", "outcome": "refused", "decision": "vivificabis", "reason": "glossary words (vivificáre row open; æquitas → equidade, 118:40); evidence added to the row."},
        {"verse": "142:3b", "remark": "unknown 'outrora'", "outcome": "refused", "decision": "saeculi", "reason": "heard rightly in context ('the long-dead')."}
     ]},
    {"step": "revision", "version": 2, "note": "v2: 142:3b second colon in the Latin's order (stylist); 142:8b 'por onde eu ande' (stylist). Nothing else changed in the text; options added for the Latinist's 'do século'. prayed.v1.json kept."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
