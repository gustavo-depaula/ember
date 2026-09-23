"""One-off v1 -> v2 revision of ps212/prayed.json after the v1 readers (keeps key order)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['13:4'] = "{ideo} entre as {ignorant}, * para que {narretis} as suas maravilhas,"
v['13:8'] = "Eu, porém, na terra do meu cativeiro lhe darei graças: * porque mostrou a sua majestade {ingentem} nação pecadora."
dec = {x['id']: x for x in d['decisions']}

ideo = dec['ideo']
ideo['why'] = ("Quóniam → Porque (the default); ídeo 'for this reason' points forward to 'ut vos enarrétis' (ídeo … ut, 'to this end … that'). "
    "Word for word 'Porque por isso vos dispersou' stutters (the porque/por fault D14 names), and 'por isso' is heard in Portuguese as pointing back ('because of that'), "
    "which the ambiguity reader confirmed for draft 1's cleft 'foi por isso que'. 'para isto' points forward (isto, the near demonstrative, announces what follows) "
    "and is resolved by 'para que' in the second colon. The stylist found draft 1's cleft a pile of unstressed monosyllables and asked for a named subject "
    "so that 'vos' and 'o' do not blur: 'ele' is supplied (God, the subject since 13:3). dispérgere → dispersar: 43:12 'nos dispersastes entre as nações'.")
ideo['options'] = [
    {"label": "Porque para isto ele vos dispersou", "forms": {"ideo": "Porque para isto ele vos dispersou"},
     "note": "Draft 2: forward-pointing 'para isto', named subject (stylist); no cleft.", "from": "ambiguity"},
    {"label": "Porque por isso ele vos dispersou", "forms": {"ideo": "Porque por isso ele vos dispersou"},
     "note": "The stylist's line: shorter, but 'Porque por' stutters and 'por isso' is heard as 'because of that'.", "from": "stylist"},
    {"label": "Porque foi por isso que vos dispersou", "forms": {"ideo": "Porque foi por isso que vos dispersou"},
     "note": "Draft 1's cleft; heavy (stylist) and still heard as pointing back (ambiguity).", "from": "draft"},
    {"label": "Pois para isso vos dispersou", "forms": {"ideo": "Pois para isso vos dispersou"},
     "note": "Shortest; but 'pois' is kept for quia before questions (D42).", "from": "draft"},
]

ign = dec['ignorant']
ign['why'] += (" The Latinist asked for the comma the Latin has ('inter gentes, quæ ignórant eum'): the clause describes the Gentiles, all of whom do not know him; "
    "without the comma the Portuguese restricts it to some nations. Taken.")
ign['options'] = [
    {"label": "nações, que não o conhecem", "forms": {"ignorant": "nações, que não o conhecem"}, "note": "Draft 2: the Latin's comma (Latinist).", "from": "latinist"},
    {"label": "nações que não o conhecem", "forms": {"ignorant": "nações que não o conhecem"}, "note": "Draft 1: restrictive.", "from": "draft"},
    {"label": "nações, que o ignoram", "forms": {"ignorant": "nações, que o ignoram"}, "note": "The cognate; heard in Brazil as 'who snub him'.", "from": "draft"},
]

narr = {
    "id": "narretis", "refs": ["13:4"], "latin": "ut vos enarrétis", "kind": "order",
    "why": ("The Latin names the subject, 'vos', where the verb alone would do: it is you, scattered, who are to tell. The stylist heard 'para que vós narreis' as a stiff "
            "s-n-r-r-s cluster and proposed the pronoun after the verb, where Portuguese puts an emphatic subject in a purpose clause. It keeps the Latin's word, and "
            "'narreis vós' also marks the hearers (plural men) against the 'vós' of God (D1). Taken. 47:14 ut enarrétis (no vos) → 'para que narreis'."),
    "options": [
        {"label": "narreis vós", "forms": {"narretis": "narreis vós"}, "note": "Draft 2 (stylist).", "from": "stylist"},
        {"label": "vós narreis", "forms": {"narretis": "vós narreis"}, "note": "Draft 1: the Latin's order.", "from": "draft"},
        {"label": "narreis", "forms": {"narretis": "narreis"}, "note": "As 47:14, where the Latin has no vos; drops the Latin's pronoun.", "from": "draft"},
    ],
}
d['decisions'].insert(d['decisions'].index(ign) + 1, narr)

ing = dec['ingentem']
ing['why'] = ("in + accusative: 'toward' (DRB) or 'upon / against'. The majesty was shown to a sinful nation — in the exile that punished it, or in the mercy that will save it; "
    "the verses around it say both (13:6). 'sobre' (MS1932) keeps both; the ambiguity reader heard it as 'over' (dominion), which is one of them. "
    "The Latin has no article. The Latinist proposed 'a nação pecadora' so as not to point away from Israel; refused: Latin gentem without a determiner is indefinite by default "
    "(DRB 'a sinful nation', MS1932 'uma nação pecadora', and 42:1 de gente non sancta → 'de uma nação'), and 'a nação pecadora' decides the other way, naming a nation already known. "
    "'uma' leaves which nation open, as the ambiguity reader heard it ('some sinful people, without knowing which'). gens singular → 'nação' (42:1).")
ing['options'] = [
    {"label": "sobre uma", "forms": {"ingentem": "sobre uma"}, "note": "Draft: power displayed over; which nation left open.", "from": "draft"},
    {"label": "sobre a", "forms": {"ingentem": "sobre a"}, "note": "Latinist: the definite article, pointing to Israel (the 'nós' of 13:6).", "from": "latinist"},
    {"label": "a uma", "forms": {"ingentem": "a uma"}, "note": "'mostrou … a uma nação pecadora': revelation to them.", "from": "draft"},
    {"label": "para com uma", "forms": {"ingentem": "para com uma"}, "note": "DRB 'toward'; leans to favour.", "from": "DRB"},
]

fac = dec['facite']
fac['why'] += (" The stylist heard 'fazer a justiça' as carrying out a sentence ('fazer justiça com as próprias mãos') and proposed 'praticai'; the ambiguity reader, on the same text, "
    "heard 'act justly / do what is right'. Refused: the article already keeps it from 'fazer justiça' (avenge), the listener heard it rightly, and 'praticar' is operári's verb, "
    "so taking it would merge two Latin verbs the psalter keeps apart (105:3 against 14:2).")
fac['options'][1]['from'] = 'stylist'
fac['options'][1]['note'] = "Stylist; clearer, but operári's verb (14:2)."

fa = dec['faciat']
fa['why'] += (" The stylist heard 'usará convosco da' as breaking the set phrase 'usar de misericórdia' and proposed the complement first; taken — it is 17:51's order "
    "('usando de misericórdia com o seu Cristo'), and the colon ends on 'convosco', the people addressed. The ambiguity reader listed 'usar de' as a word a listener may not know, "
    "but heard it rightly ('he will be merciful to you'); kept for 17:51.")
fa['options'] = [
    {"label": "usará da sua misericórdia convosco", "forms": {"faciat": "usará da sua misericórdia convosco"}, "note": "Draft 2 (stylist): the set phrase kept whole, as 17:51.", "from": "stylist"},
    {"label": "usará convosco da sua misericórdia", "forms": {"faciat": "usará convosco da sua misericórdia"}, "note": "Draft 1: the Latin's order (vobíscum before misericórdiam).", "from": "draft"},
    {"label": "fará convosco a sua misericórdia", "forms": {"faciat": "fará convosco a sua misericórdia"}, "note": "The Latin's verb, as 102:6; 'fazer misericórdia com' is a biblical calque.", "from": "draft"},
]

inf = dec['inferos']
inf['why'] += (" The ambiguity reader heard 'conduzis aos infernos' as 'you send to hell', and listed the plural 'infernos' as a word a listener may not know. "
    "Held for draft 2: the psalter renders inférnus 'inferno' throughout (an open row), 'trazeis de volta' in the same line tells the listener this is a place one comes back from, "
    "and changing the word here alone would split 212 from the rest of the psalter; the question is proposed as a glossary formula row (212, 223, 234) for a ruling, "
    "with 'à morada dos mortos' as the alternative.")

c = d['choices']
c['13:4'] = c['13:4'].replace("the Latin's own 'vos' is kept ('para que vós narreis') — the subject named, which also marks the plural men (glossary, Ps 10:2 remedy).",
    "the Latin's own 'vos' is kept, after the verb (decision narretis).")
c['13:7'] += (" The stylist heard a hiatus in 'e exaltai' after the asterisk and proposed 'exaltai também'; refused: 'também' is not in the Latin (the -que is 'e'), "
    "and the two e-sounds of 'e exaltai' run together in speech and song without loss.")
c['13:9'] = c['13:9'].replace("credéntes → 'crendo'", "credéntes → 'crendo'") + " In draft 2 the colon is 'crendo que ele usará da sua misericórdia convosco' (decision faciat)."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json",
    "note": "Draft 1. Two minor remarks: the comma of 13:4 taken; the article of 13:8 refused (kept as an option). Overall: faithful, marks right.",
    "outcomes": [
        {"verse": "13:4", "remark": "restrictive relative; the Latin's comma", "outcome": "taken"},
        {"verse": "13:8", "remark": "'uma nação' → 'a nação'", "outcome": "option", "decision": "ingentem",
         "reason": "Latin gentem without a determiner is indefinite (DRB, MS1932, 42:1 'uma nação'); 'a' decides for Israel, 'uma' leaves it open."},
    ]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json",
    "note": "Draft 1. Five remarks: 13:4 cleft (taken in part: the cleft goes and 'ele' is named, but 'para isto' instead of its 'por isso'), 13:4 'narreis vós' taken, 13:9 order of 'usar de' taken, 13:9 'praticai' refused, 13:7 'também' refused. Worst line 13:4, best 13:6.",
    "outcomes": [
        {"verse": "13:4", "remark": "cleft 'foi por isso que' heavy; name the subject", "outcome": "taken",
         "reason": "Taken with 'para isto' rather than the proposed 'por isso', which stutters after 'Porque' and is heard as pointing back (ambiguity); the proposal stays as an option.", "decision": "ideo"},
        {"verse": "13:4", "remark": "'vós narreis' → 'narreis vós'", "outcome": "taken"},
        {"verse": "13:9", "remark": "'fazei a justiça' → 'praticai a justiça'", "outcome": "option", "decision": "facite",
         "reason": "'praticar' is operári's verb (14:2) and 105:3 has 'fazem a justiça'; the article already keeps off 'avenge', and the ambiguity reader heard 'act justly'."},
        {"verse": "13:9", "remark": "'usará convosco da' → 'usará da sua misericórdia convosco'", "outcome": "taken"},
        {"verse": "13:7", "remark": "hiatus 'e exaltai' → 'exaltai também'", "outcome": "refused",
         "reason": "'também' is not in the Latin; 'e exaltai' elides naturally."},
    ]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json",
    "note": "Draft 1, Portuguese only. Twenty items; most are the Latin's own openness heard rightly (Rei dos séculos, nas vossas obras, fez conosco, sobre, nele, dias de alegria). Acted on: 13:4 'por isso' heard as pointing back (fixed by 'para isto'). Held: 13:2 'infernos' heard as hell (psalter-wide row, flagged for ruling). Unknown words: flagelais, infernos, iniquidades, usar de — kept (glossary rows and 17:51).",
    "outcomes": [
        {"verse": "13:4", "remark": "'foi por isso que' heard as pointing back", "outcome": "taken"},
        {"verse": "13:2", "remark": "'conduzis aos infernos' heard as 'send to hell'", "outcome": "refused", "decision": "inferos",
         "reason": "The psalter renders inférnus 'inferno' throughout (open row); 'trazeis de volta' disambiguates; proposed as a glossary formula row (212, 223, 234) for a ruling, with 'à morada dos mortos' as the option."},
        {"verse": "13:8", "remark": "'sobre uma nação pecadora' — which nation, over or toward", "outcome": "refused",
         "reason": "The Latin's own openness (in + accusative, no article); kept on purpose (decision ingentem)."},
        {"verse": "13:2", "remark": "'flagelais' unknown / literal whip", "outcome": "refused",
         "reason": "flagéllum row (D39); kept apart from castigar in 13:6."},
        {"verse": "13:9", "remark": "'usar de misericórdia' unknown", "outcome": "refused",
         "reason": "17:51's idiom; heard rightly; the stylist's reorder keeps the phrase whole."},
    ]})
d['audit'].append({"step": "revision", "version": 2,
    "note": "v2: 13:4 'Porque foi por isso que vos dispersou entre as nações que não o conhecem, * para que vós narreis' → 'Porque para isto ele vos dispersou entre as nações, que não o conhecem, * para que narreis vós'; "
            "13:9 'usará convosco da sua misericórdia' → 'usará da sua misericórdia convosco'. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the v1 readers read)."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
