"""v2 of Ps 147: the v1 readers' fixes taken, options added, outcomes recorded."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['147:3'] = '{q3} {fines}: * e te sacia {adipe}.'
v['147:6'] = 'Lança o seu {crystallum} {buccellas}: * {faciem} do seu frio, quem {sustinebit}?'
v['147:9'] = 'Não fez assim {omni}: * e não lhes manifestou os seus juízos.'

dec = {x['id']: x for x in d['decisions']}


def opt(label, forms, note, frm):
    return {"label": label, "forms": forms, "note": note, "from": frm}


# 147:3 order (stylist) — adipe forms become 'com a …'
a = dec['adipe']
a['options'] = [
    opt("com a gordura do trigo", {"adipe": "com a gordura do trigo"}, "v2 — the stylist's order ('e te sacia com …'); the noun phrase = 80:17 'da gordura do trigo'", "stylist"),
    opt("com a flor do trigo", {"adipe": "com a flor do trigo"}, "the Brazilian LH/lectionary wording (fetched); MS1932 'da flor da farinha'. An interpretation of 'adeps'", "draft"),
]
a['why'] += " v2: the stylist found the fronted object with the clitic at the end ('e da gordura do trigo te sacia') translated-sounding and asked for the natural order, which ends the colon on the image; taken (order, D2). The ambiguity reader heard 'gordura do trigo' as puzzling, literal fat — the Latin's image, kept (rule 5); 'flor do trigo' stays the option."

# 147:4 eloquium → a sua fala (Latinist minor + stylist, same fix)
e = dec['eloquium']
e['options'] = [
    opt("a sua fala", {"eloquium": "a sua fala"}, "v2 — the Latinist's and the stylist's fix, independently: a noun, kept apart from sermo → palavra in the next colon", "latinist"),
    opt("o que diz", {"eloquium": "o que diz"}, "v1 — D26's clause, present as 103:34; the stylist's worst line, the Latinist's minor", "draft"),
    opt("a sua palavra", {"eloquium": "a sua palavra"}, "as 11:7, 104:19 where elóquium stood alone; here it would repeat 'palavra' in the verse where the Latin varies", "glossary"),
    opt("o seu dito", {"eloquium": "o seu dito"}, "the noun D16 tried; refused by the stylist nine times in Pss 11 and 118", "glossary"),
]
e['why'] += " v2: both the Latinist (minor: a noun object turned into a clause) and the stylist (worst line: a thin gloss, flat at the mediant) asked, each on his own, for 'a sua fala'. Taken: it keeps D15's distinction (λόγιον apart from λόγος, which is 'palavra' here and in 147:7–8) with a noun. Cost: in 55:11 'fala' rendered sermo (beside verbum); here it renders elóquium beside sermo — 'fala' is the psalter's second word for speech where two stand together, not a fixed equivalent. Proposed as such in the glossary."

# 147:6 buccellas → migalhas (stylist; ambiguity reader did not know 'bocados')
b = dec['buccellas']
b['options'] = [
    opt("como migalhas", {"buccellas": "como migalhas"}, "v2 — the stylist's: the ordinary word for morsels of bread; 'bocados' was listed unknown by the ambiguity reader", "stylist"),
    opt("como bocados", {"buccellas": "como bocados"}, "v1 — DRB 'like morsels'; closer in size, heard as 'chunks' or not known", "DRB"),
    opt("aos pedaços", {"buccellas": "aos pedaços"}, "MS1932; loses 'sicut'", "MS1932"),
]
b['why'] += " v2: the stylist heard 'bocados' as bites or chunks and no picture; the ambiguity reader listed it as unknown. 'migalhas' keeps the simile and the bread (buccella is a morsel of bread); it is a smaller morsel than the Latin's, a plainer word of the same image (D2)."

# 147:6 sustinebit → suportará (Latinist minor; stylist 'resistirá'; 'subsistirá' unknown to the ambiguity reader)
d['decisions'].insert(d['decisions'].index(dec['faciem']) + 1, {
    "id": "sustinebit", "refs": ["147:6"], "latin": "quis sustinébit?", "kind": "glossary",
    "why": "v1 copied 129:3's 'quem subsistirá?' (same two Latin words). Here the verb has a thing to bear — the cold before which one stands — and the sustinére row (D36) gives 'suportar' where the object is a thing to endure (68:8; the row also names 129:3). The Latinist (minor) asked 'quem o suportará?', the stylist 'quem resistirá?' ('subsistirá' bookish), and the ambiguity reader did not know 'subsistirá'. Taken: 'quem suportará?', the row's verb, absolute as the Latin (the object is left implied, as 'sustinébit' leaves it). 'resistirá' (MS1932) is refused as a word of opposition, not of bearing; kept as an option. Consequence: 129:3 now differs from this line; whoever rules the row should say whether 129:3 follows (proposed in the glossary).",
    "options": [
        opt("suportará", {"sustinebit": "suportará"}, "v2 — the Latinist's sense, the sustinére row's verb for a thing endured", "latinist"),
        opt("subsistirá", {"sustinebit": "subsistirá"}, "v1 — = 129:3; unknown to the ambiguity reader", "glossary"),
        opt("resistirá", {"sustinebit": "resistirá"}, "the stylist's; MS1932 'quem poderá resistir'; opposition rather than endurance", "stylist"),
    ]})

# 147:9 omni → com toda nação (Latinist number + stylist 'com')
o = dec['omni']
o['options'] = [
    opt("com toda nação", {"omni": "com toda nação"}, "v2 — the stylist's 'fazer assim com' and the Latinist's singular: 'toda nação' is 'every nation', the Latin's number and form", "latinist"),
    opt("com todas as nações", {"omni": "com todas as nações"}, "the stylist's line as he wrote it (plural)", "stylist"),
    opt("a todas as nações", {"omni": "a todas as nações"}, "v1; 'fazer assim a' is not how Brazil says it (stylist)", "draft"),
    opt("com nenhuma outra nação", {"omni": "com nenhuma outra nação"}, "resolves the idiom and adds 'outra' (DM1962 'a nenhum outro povo', from the Hebrew)", "draft"),
]
o['why'] = "'Non … omni' is literally 'not to every nation', a Hebraism for 'to none (other)'. The draft keeps the Latin's form: 'Não fez assim com toda nação' says what is meant — this was not done for every nation, only for Israel — without supplying 'outra'. v2 takes two v1 remarks together: the Latinist (minor) asked the singular back ('a toda nação'), and the stylist found 'fazer assim a' unidiomatic and asked 'com'. The ambiguity reader heard 'not the same for the other nations', with room left for 'not all, only some' — that room is the Latin's own."

# 147:7 spíritus — the ambiguity reader heard the Spirit first
s = dec['spiritus']
s['why'] += " v1 ambiguity reader: both readings listed, 'his Spirit, in a spiritual sense' likely heard first — so the ambiguity is kept, leaning the other way from the context. Held: 'vento' would close what the Latin leaves open; it stays option 1."

# 147:2 seras — 'ferrolhos' unknown to the ambiguity reader
sr = dec['seras']
sr['why'] += " v1 ambiguity reader listed 'ferrolhos' as unknown; 'trancas' was unknown to another (106:16). Both are the concrete word; no plainer name for a door-bar exists. Held."

c = d['choices']
c['147:6'] = "Mittit → Lança (βάλλοντος, throwing; as the míttere rows 21:18, 80:15) kept apart from emíttere → enviar (147:4, 147:7; row of 103:10)."
c['147:3'] = "saturáre/satiáre → saciar (row). v2: the natural order, verb before its complement (stylist)."
c['147:9'] = "manifestáre → manifestar (row of 79:2b). The object moved after the verb (natural order, D2); the Latin puts 'judícia sua' first. Soft flag: second colon -3 (the Latin's long 'manifestávit'); accepted. The ambiguity reader heard 'os seus juízos' as God's, rightly."
c['147:7'] += " The ambiguity reader found 'os' without a clear antecedent ('gelo' is singular); the Latin's 'ea' is as loose (neuter plural for snow, mist and ice together). Held. The futures are the Latin's."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "3 minor, no major; all three taken (147:4 in the Latinist's own words; 147:6 as 'quem suportará?' without the supplied 'o'; 147:9 singular, with the stylist's 'com').",
    "outcomes": [
        {"verse": "147:4", "remark": "eloquium noun made a clause 'o que diz'", "outcome": "taken", "decision": "eloquium"},
        {"verse": "147:6", "remark": "'subsistirá' loses bearing the cold; 'quem o suportará?'", "outcome": "taken", "decision": "sustinebit", "reason": "taken without the pronoun 'o': the Latin leaves the object implied"},
        {"verse": "147:9", "remark": "omni natióni singular made plural", "outcome": "taken", "decision": "omni"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "5 remarks on 4 verses; worst line 147:4, best 147:5. 4 taken, 1 kept as an option.",
    "outcomes": [
        {"verse": "147:3", "remark": "fronted object, clitic at the end: 'e te sacia com a gordura do trigo'", "outcome": "taken", "decision": "adipe"},
        {"verse": "147:4", "remark": "'o que diz' a thin paraphrase → 'a sua fala'", "outcome": "taken", "decision": "eloquium"},
        {"verse": "147:6", "remark": "'bocados' ambiguous → 'migalhas'", "outcome": "taken", "decision": "buccellas"},
        {"verse": "147:6", "remark": "'subsistirá' bookish → 'resistirá'", "outcome": "option", "decision": "sustinebit", "reason": "the Latinist's 'suportar' taken instead: 'resistir' is opposition, 'sustinére' here is bearing; the sustinére row's verb"},
        {"verse": "147:9", "remark": "'fazer assim a' unidiomatic → 'com todas as nações'", "outcome": "taken", "decision": "omni", "reason": "'com' taken; the number follows the Latinist (singular); the plural is an option"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "13 ambiguities, 3 unknown words (ferrolhos, subsistirá, bocados). Two unknown words replaced (subsistirá, bocados); the rest are the Latin's own openness or its concrete images, held.",
    "outcomes": [
        {"verse": "147:2", "remark": "subject of 'fortaleceu' not named", "outcome": "refused", "reason": "the Latin names none either; 147:1 sets 'o Senhor … o teu Deus' just before"},
        {"verse": "147:2", "remark": "'em ti' within / through you", "outcome": "refused", "decision": "inte", "reason": "the Latin's 'in te' is as open; heard as within the city, the likely sense"},
        {"verse": "147:2", "remark": "'ferrolhos' unknown", "outcome": "refused", "decision": "seras", "reason": "the concrete word; 'trancas' was unknown to another reader"},
        {"verse": "147:3", "remark": "'gordura do trigo' puzzling, literal fat", "outcome": "refused", "decision": "adipe", "reason": "the Latin's image, = 80:17 (rule 5); 'flor do trigo' is the option"},
        {"verse": "147:4", "remark": "'o que diz' could be 'whoever speaks'", "outcome": "taken", "decision": "eloquium", "reason": "gone with 'a sua fala'"},
        {"verse": "147:5", "remark": "'névoa' mist vs frost; ash image hard", "outcome": "refused", "reason": "the Latin says nébula (ὁμίχλη, mist); the Hebrew's frost not followed (rule 1)"},
        {"verse": "147:6", "remark": "'bocados' unknown / unclear", "outcome": "taken", "decision": "buccellas"},
        {"verse": "147:6", "remark": "'subsistirá' unknown", "outcome": "taken", "decision": "sustinebit"},
        {"verse": "147:6", "remark": "whose cold", "outcome": "refused", "reason": "'frígoris ejus' is as open; heard as God's, rightly"},
        {"verse": "147:7", "remark": "antecedent of 'os'", "outcome": "refused", "reason": "the Latin's neuter plural 'ea' is as loose"},
        {"verse": "147:7", "remark": "'espírito' heard as the Spirit first", "outcome": "refused", "decision": "spiritus", "reason": "both readings heard; the Latin's word keeps both; 'vento' is the option"},
        {"verse": "147:7", "remark": "future vs habitual", "outcome": "refused", "reason": "the Latin's futures"},
        {"verse": "147:8", "remark": "'justiças' / 'juízos' several senses", "outcome": "refused", "decision": "justitias", "reason": "the Latin's words (D15 for judícia); no reader heard the courts as the main sense"},
        {"verse": "147:9", "remark": "'a todas' leaves 'not all, only some' open", "outcome": "refused", "decision": "omni", "reason": "that openness is the Latin's 'non … omni'"},
        {"verse": "147:9", "remark": "'lhes … os seus juízos' whose", "outcome": "refused", "reason": "heard as God's, rightly; the Latin's 'sua' is as open"}]})
d['audit'].append({"step": "revision", "version": 2,
    "note": "v2: 147:3 order (stylist); 147:4 'a sua fala' (Latinist + stylist); 147:6 'como migalhas' (stylist, unknown 'bocados') and 'quem suportará?' (Latinist, the sustinére row; 'subsistirá' unknown); 147:9 'Não fez assim com toda nação' (Latinist's number, stylist's preposition). Draft 1 kept as prayed.v1.json."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
