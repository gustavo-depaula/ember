"""Ps 139 v2: apply the reader outcomes to prayed.json (draft 1 kept as prayed.v1.json). Refuses to run twice."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] != 1:
    raise SystemExit('already v2')
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, why_add=None, note=None):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    o = opts.pop(i)
    if note:
        o['note'] = note
    opts.insert(0, o)
    if why_add:
        dec[did]['why'] += ' ' + why_add


def add(did, opt):
    dec[did]['options'].append(opt)


# 139:5b supplantáre -> derrubar (stylist: tropeçar/tropeço invents a repetition)
promote('supplant', 'derrubar',
        "**v2:** the stylist heard *tropeçar* (5b) and *tropeço* (6) as one root twice where the Latin has two words (*supplantáre / scándalum*) — an echo the Latin does not have. The row's *derrubar* taken.",
        "v2 (stylist). The row's verb (17:40, 36:31); keeps supplantáre apart from scándalum → *tropeço* in 139:6.")
dec['supplant']['options'][1]['note'] = "Draft 1. The heel-trip of the word, but it echoes *tropeço* (scándalum) in the next verse, which the Latin does not."

# 139:9 ne forte -> acaso (Latinist minor + stylist)
opts = dec['neforte']['options']
opts.insert(0, {"label": "para que acaso não se exaltem", "forms": {"neforte": "para que acaso não se exaltem"},
                "note": "v2. *forte* carried by *acaso* — the Latinist (minor: 'forte is dropped', fix *porventura*) and the stylist (*acaso*) both asked for it; *acaso* is the plainer word, +2 syllables.", "from": "stylist"})
opts[1]['note'] = "Draft 1. Drops *forte* (Latinist minor)."
opts.append({"label": "para que porventura não se exaltem", "forms": {"neforte": "para que porventura não se exaltem"},
             "note": "The Latinist's fix; *porventura* is heavier and bookish.", "from": "latinist"})
dec['neforte']['why'] += " **v2:** both the Latinist and the stylist missed *forte*; *acaso* restores it."

# 139:11 deícere -> lançar, ao fogo (Latinist minor + stylist)
opts = dec['carb']['options']
opts.insert(0, {"label": "carvões … ao fogo os lançareis", "forms": {"carb": "carvões", "infire": "ao fogo", "deicies": "lançareis"},
                "note": "v2. The Latinist (minor: *in ignem* + *deícies* is motion, 'cast down into the fire'; *no fogo os abatereis* reads as striking them while in it) and the stylist (*abater* is to fell or slaughter) both asked *lançar*. A local departure from the deícere row (*abater*, 36:14b), where the object is a man struck down, not thrown into something.", "from": "latinist"})
for o in opts[1:]:
    o['forms'].setdefault('infire', 'no fogo')
opts[1]['note'] = "Draft 1. Both rows; the motion of *in ignem* weakened (Latinist)."
d['verses']['139:11'] = "Cairão sobre eles {carb}, {infire} os {deicies}: * não subsistirão nas misérias."

# 139:10 labor -> a fadiga (stylist; the row's word)
promote('labor', 'a fadiga',
        "**v2:** the stylist heard *o trabalho dos lábios* as 'a job description' and asked the row's *fadiga* (toil, trouble); the ambiguity reader heard *o trabalho* simply as 'what they said'. The row's word taken: it keeps the toil of *labor*, and the psalter's other *labor* are *fadiga*.",
        "v2 (stylist). The labor row's word (9:28, 72:5, 89:10).")
dec['labor']['options'][1]['note'] = "Draft 1. The row's local departure for a product of toil; heard by the stylist as a job, by the ambiguity reader as mere speaking."

# 139:12 linguósus -> de língua solta (stylist; ambiguity reader: unknown / gossip)
opts = dec['linguosus']['options']
opts.insert(0, {"label": "de língua solta … dirigido", "forms": {"linguosus": "de língua solta", "dirig": "dirigido"},
                "note": "v2 (stylist). The tongue kept; the idiom means one who talks too much and without restraint — L&S 'talkative, loquacious' — without the comic register.", "from": "stylist"})
opts[1]['note'] = "Draft 1. The stylist: a gossip's word, half comic, will draw a smile in choir; the ambiguity reader listed it unknown and heard 'a gossip'."
opts.append({"label": "de língua solta … firmado", "forms": {"linguosus": "de língua solta", "dirig": "firmado"},
             "note": "The stylist: *dirigido* suggests driving or directing; *firmado* is the sense (Almeida *não terá firmeza*). Refused: the dirígere row (36:23, 101:29) keeps the Latin's image of a straight course; *firmar* is stabilíre's (20:12). The ambiguity reader heard 'will not be guided' — a reading the Latin allows.", "from": "stylist"})
dec['linguosus']['why'] += " **v2:** *linguarudo* → *de língua solta* (stylist, ambiguity reader); *dirigido* held."

# 139:12 cápere: stylist's apanharão / na ruína -> option
add('capient', {"label": "os males apanharão … na ruína", "forms": {"capient": "os males apanharão o homem injusto", "interitu": "na ruína"},
                "note": "The stylist ('tomarão … na destruição' flat, -ção drags). Refused: *ruína* is præcipitátio's (51:6) and intéritus is *destruição* in 9:16a, 34:7, 48:11, 54:24, 102:4; *apanhar* was colloquial to the 58:4 stylist (the same Greek θηρεύω).", "from": "stylist"})

# 139:13 carente -> desvalido option (refused under D38)
add('judic', {"label": "Eu sei … o juízo do desvalido", "forms": {"cognovi": "Eu sei", "judic": "o juízo do desvalido"},
              "note": "The stylist: *carente* is the word of social services and pop psychology. Refused under D38 (settled; *desvalido* was unknown to one reader); the ambiguity reader also named the emotional sense as audible — more evidence for D38's known cost.", "from": "stylist"})

# 139:8 stylist -> option
d['decisions'].append({
    "id": "obumbr", "refs": ["139:8"], "latin": "obumbrásti super caput meum in die belli", "kind": "word",
    "why": "obumbráre → *fazer sombra a* (90:4); *super* kept as *sobre*. The stylist found the colon long (+4) and *sombra sobre* heavy, and asked *cobristes de sombra*. Refused: *cobrir* is opéríre's in 139:10 (*os cobrirá*), two verses on, so the Latin's two verbs would merge; and the ambiguity reader heard 'you sheltered my head' first. His line is an option; *fizestes sombra à minha cabeça* (the row's regency, −1 syllable, *super* lost) is another.",
    "options": [
        {"label": "fizestes sombra sobre", "forms": {"obumbr": "fizestes sombra sobre"}, "note": "Draft. The row, with *super*.", "from": "draft"},
        {"label": "cobristes de sombra", "forms": {"obumbr": "cobristes de sombra"}, "note": "The stylist; merges with *opériet* → *cobrirá* (139:10).", "from": "stylist"},
        {"label": "fizestes sombra à", "forms": {"obumbr": "fizestes sombra à"}, "note": "The row's regency (*fazer sombra a*); shorter, *super* lost.", "from": "draft"}
    ]})
d['verses']['139:8'] = "Senhor, Senhor, {virtus} da minha salvação: * {obumbr} a minha cabeça no dia da guerra."

# 139:9 stylist's reorder -> option
dec['adesid']['why'] += " **v2:** the stylist asked the order *Não me entregueis ao pecador, Senhor, do meu desejo*; refused — *Senhor, do meu desejo* is then heard as a vocative ('Lord of my desire'), a reading the Latin does not have. The ambiguity reader let *do meu desejo* pass as noise: the Latin's own opacity (DRB keeps it bare); *contra o meu desejo* stays the option that resolves it."

# 139:14 stylist -> option in a new decision
d['decisions'].append({
    "id": "vultu", "refs": ["139:14"], "latin": "et habitábunt recti cum vultu tuo", "kind": "glossary",
    "why": "*cum vultu tuo* → *com o vosso rosto*, word for word 15:11 and 20:7 (σὺν τῷ προσώπῳ). The stylist ('not idiomatic; *com o* blurs into *como*') asked *junto ao vosso rosto*; the ambiguity reader heard 'in your presence' first, though 'strange'. Refused: the formula of 15:11 and 20:7 has held; *junto a* is *juxta*'s (139:6). Option.",
    "options": [
        {"label": "com o vosso rosto", "forms": {"vultu": "com o vosso rosto"}, "note": "Draft. = 15:11, 20:7.", "from": "glossary"},
        {"label": "junto ao vosso rosto", "forms": {"vultu": "junto ao vosso rosto"}, "note": "The stylist; *junto* is juxta's in 139:6.", "from": "stylist"}
    ]})
d['verses']['139:14'] = "Todavia, os justos darão graças ao vosso nome: * e os retos habitarão {vultu}."

d['version'] = 2
d['status'] = 'reviewed'
d['choices']['139:6'] += " v2: 5b's *derrubar* removes the *tropeçar / tropeço* echo."
d['choices']['139:4'] += " The ambiguity reader listed *áspides* unknown; the formula (13:3b, Rom 3:13) is kept."
d['choices']['139:11'] = d['choices']['139:11'] + " The ambiguity reader listed *subsistirão* unknown; kept (102:16; the Latin's word)."

A = d['audit']
A.append({"step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
          "note": "2 minors, both taken. Overall: close and faithful; the hard readings (*do meu desejo ao pecador*, *A cabeça do seu cerco*, *com o vosso rosto*) kept without smoothing.",
          "outcomes": [
              {"verse": "139:9", "remark": "*forte* dropped; *para que porventura não se exaltem*", "outcome": "taken", "decision": "neforte", "reason": "Taken with the stylist's plainer *acaso*; *porventura* kept as an option."},
              {"verse": "139:11", "remark": "*in ignem deícies* is motion; *ao fogo os lançareis*", "outcome": "taken", "decision": "carb"}]})
A.append({"step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
          "note": "11 remarks in 7 verses; best 139:7, worst 139:12. 5 taken, 6 refused and kept as options.",
          "outcomes": [
              {"verse": "139:5b", "remark": "*tropeçar* / *tropeço* invent a repetition; *derrubar*", "outcome": "taken", "decision": "supplant"},
              {"verse": "139:8", "remark": "colon long, *sombra sobre*; *cobristes de sombra*", "outcome": "option", "decision": "obumbr", "reason": "*cobrir* is opéríre's in 139:10; the two Latin verbs would merge."},
              {"verse": "139:9", "remark": "order hard to parse; *Não me entregueis ao pecador, Senhor, do meu desejo*", "outcome": "refused", "decision": "adesid", "reason": "*Senhor, do meu desejo* is heard as a vocative ('Lord of my desire')."},
              {"verse": "139:9", "remark": "*ne forte* silent; *para que acaso não se exaltem*", "outcome": "taken", "decision": "neforte"},
              {"verse": "139:10", "remark": "*o trabalho dos lábios* a job description; *a fadiga*", "outcome": "taken", "decision": "labor"},
              {"verse": "139:11", "remark": "*abater* is fell or slaughter; *lançareis*", "outcome": "taken", "decision": "carb"},
              {"verse": "139:12", "remark": "*linguarudo* comic; *de língua solta*", "outcome": "taken", "decision": "linguosus"},
              {"verse": "139:12", "remark": "*dirigido* = driving; *firmado*", "outcome": "option", "decision": "linguosus", "reason": "The dirígere row keeps the image of a straight course; *firmar* is stabilíre's."},
              {"verse": "139:12", "remark": "*tomarão … na destruição* flat; *apanharão … na ruína*", "outcome": "option", "decision": "capient", "reason": "intéritus → *destruição* across the psalter; *ruína* is præcipitátio's; *apanhar* was colloquial at 58:4."},
              {"verse": "139:13", "remark": "*carente* social-work word; *desvalido*", "outcome": "option", "decision": "judic", "reason": "D38 settled *carente*; recorded as further evidence of its cost."},
              {"verse": "139:14", "remark": "*habitar com o rosto* not idiomatic; *junto ao vosso rosto*", "outcome": "option", "decision": "vultu", "reason": "The formula of 15:11, 20:7; *junto* is juxta's in 139:6."}]})
A.append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
          "note": "26 items, 4 unknown words (*áspides*, *iníquo*, *subsistirão*, *linguarudo*). The real findings: 139:9 *do meu desejo* heard as noise, 139:10 *A cabeça do seu cerco* opaque — both the Latin's own opacity, kept; *linguarudo* heard as 'a gossip' (mended with the stylist); *carente*'s emotional sense audible (D38's cost). First hearings otherwise right (139:8 sheltered, 139:13 justice for the needy, 139:14 in your presence).",
          "outcomes": [
              {"verse": "139:3", "remark": "*Os que maquinaram* can wait for a verb", "outcome": "refused", "reason": "Heard first as a description of the men of 139:2, as the Latin's *Qui*."},
              {"verse": "139:9", "remark": "*do meu desejo* unclear, passes as noise", "outcome": "refused", "decision": "adesid", "reason": "The Latin's own crux, kept open (DRB bare); *contra o meu desejo* is the option that resolves it."},
              {"verse": "139:10", "remark": "*A cabeça do seu cerco* has no clear sense; syntax open", "outcome": "refused", "reason": "The Latin's verbless colon (DRB keeps it); explaining it would add a verb or a gloss (MS1932)."},
              {"verse": "139:10", "remark": "*o trabalho dos seus lábios* = what they said", "outcome": "taken", "decision": "labor", "reason": "Changed to *a fadiga* with the stylist."},
              {"verse": "139:12", "remark": "*linguarudo* unknown / a gossip", "outcome": "taken", "decision": "linguosus"},
              {"verse": "139:12", "remark": "*não será dirigido* heard as 'not guided'", "outcome": "refused", "decision": "linguosus", "reason": "A reading the Latin allows; the dirígere row."},
              {"verse": "139:13", "remark": "*carente* emotional sense audible", "outcome": "refused", "decision": "judic", "reason": "D38."},
              {"verse": "139:13", "remark": "*o juízo do carente* could be judgment on him", "outcome": "refused", "decision": "judic", "reason": "Heard first as justice for the needy; the genitive is the Latin's."},
              {"verse": "139:4", "remark": "*áspides* unknown", "outcome": "refused", "reason": "13:3b formula (Rom 3:13); the Latin's creature."},
              {"verse": "139:11", "remark": "*subsistirão* unknown", "outcome": "refused", "reason": "102:16; plain enough in context."}]})
A.append({"step": "revision", "version": 2, "note": "v2: 139:5b *fazer tropeçar* → *derrubar* (stylist; the row); 139:9 *para que acaso não se exaltem* (Latinist + stylist); 139:10 *o trabalho* → *a fadiga* (stylist; the row); 139:11 *no fogo os abatereis* → *ao fogo os lançareis* (Latinist + stylist); 139:12 *linguarudo* → *de língua solta* (stylist, ambiguity reader). 139:8 and 139:14 reworded as slots only, text unchanged. Draft 1 kept as prayed.v1.json."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
