"""Ps 75 draft 2 from draft 1 + the three v1 readers. Run from anywhere: python3.13 research/psalterium/ps075/revise_v2.py"""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, from_=None, note=None, new=None):
    """Move the option with this label to position 0 (or insert a new one)."""
    opts = dec[did]['options']
    hit = [o for o in opts if o['label'] == label]
    if hit:
        o = hit[0]
        opts.remove(o)
    else:
        o = new
    if note:
        o['note'] = note
    if from_:
        o['from'] = from_
    opts.insert(0, o)


d['version'] = 2

# 75:4 — singular, so 'potências' is not heard as world powers (ambiguity reader)
promote('potentias', 'a potência dos arcos', from_='draft', note="draft 2 — the row's word; the singular, because the ambiguity reader heard the plural 'potências' as world powers (nations) and could not place the phrase; number is grammar (D2)")
dec['potentias']['options'][1]['note'] = "draft 1 — the Latin's number; heard as 'powers, nations' by the ambiguity reader"

# 75:5 — 'dos' (stylist; the ambiguity reader heard 'desde' pull toward time)
promote('amontibus', 'dos montes eternos', from_='stylist', note="draft 2 — the stylist's; also removes 'desde', which the ambiguity reader heard as possibly temporal ('since ancient times')")
dec['amontibus']['options'][1]['note'] = "draft 1; one syllable longer; heard as possibly temporal"
dec['amontibus']['options'][1]['from'] = 'draft'
dec['illuminans']['options'].append({"label": "Vós iluminais admiravelmente", "forms": {"illuminans": "Vós iluminais admiravelmente"}, "note": "stylist: lighter than 'maravilhosamente'; refused — admirável is admirábilis's word (and 'maravilhosamente' is mirabíliter at 44:5b)", "from": "stylist"})

# 75:6 — stylist's Latin order refused, kept as option
dec['viri']['options'].append({"label": "Latin order: e nada encontraram todos os homens de riquezas nas suas mãos", "forms": {"viri": "os homens de riquezas"}, "note": "stylist (verb first, as the Latin); refused — 'os homens de riquezas nas suas mãos' is heard as 'men with riches in their hands'. The order change itself is recorded here; the slot keeps the noun phrase", "from": "stylist"})

# 75:7 — Latinist: the perfect
promote('ascenderunt', 'os que montaram cavalos', from_='latinist', note="draft 2 — the Latinist's fix: the Latin's perfect, with equos kept as the object", new={"label": "os que montaram cavalos", "forms": {"ascenderunt": "os que montaram cavalos"}})
dec['ascenderunt']['options'][1]['note'] = "draft 1 — MS1932's imperfect; the Latinist marked the tense shift (minor)"

# 75:7 — stylist's 'Ante a vossa repreensão' refused (formula row)
d['decisions'].append({
    "id": "increpatio", "refs": ["75:7"], "latin": "Ab increpatióne tua", "kind": "glossary",
    "why": "The formula row Ab increpatióne tua → 'À vossa repreensão' (17:16b; 103:7 to come). The stylist heard the crasis first as a dative ('to your rebuke') and asked 'Ante'; the ambiguity reader heard 'because of your rebuke' first, which is the sense. Kept for the formula; the stylist's wording is an option, and if taken it should be taken in all four places.",
    "options": [
        {"label": "À vossa repreensão", "forms": {"increpatio": "À vossa repreensão"}, "note": "the formula row (17:16b)", "from": "glossary"},
        {"label": "Ante a vossa repreensão", "forms": {"increpatio": "Ante a vossa repreensão"}, "note": "stylist — refused for the formula", "from": "stylist"},
        {"label": "Diante da vossa repreensão", "forms": {"increpatio": "Diante da vossa repreensão"}, "note": "DM1962's build ('Diante de tua ameaça')", "from": "DM1962"}
    ]})
d['verses']['75:7'] = "{increpatio}, Deus de Jacó, * {dormitaverunt} {ascenderunt}."

# 75:11 — stylist: dative made explicit (my own option 2)
promote('diemfestum', 'celebrará para vós um dia de festa', from_='stylist', note="draft 2 — the stylist's: with the clitic after the verb he heard 'celebrates you as a feast day'; order only")
dec['diemfestum']['options'][1]['note'] = "draft 1"
dec['diemfestum']['options'][1]['from'] = 'draft'

# 75:12 — 'ao seu redor' taken (order), 'ofertas' refused (múnera row)
d['verses']['75:12'] = "Fazei votos, e {reddite} ao Senhor, vosso Deus: * todos vós que ao seu redor trazeis {munera}."
dec['munera']['options'].append({"label": "ofertas", "forms": {"munera": "ofertas"}, "note": "stylist — paroxytone cadence; refused: oferta is oblátio's family (D41), and the row's option presentes already gives a paroxytone", "from": "stylist"})

# 75:13 — 'diante dos reis' (stylist); 'alento' refused
promote('apud', 'diante dos', from_='stylist', note="draft 2 — the stylist's: 'para os reis' made apud 'in the kings' opinion'; 'diante' keeps the Greek's παρά 'in the presence of'")
dec['apud']['options'][1]['note'] = "draft 1 — MS1932; heard by the stylist as 'in the kings' opinion'"
d['decisions'].append({
    "id": "spiritum", "refs": ["75:13"], "latin": "qui aufert spíritum príncipum", "kind": "word",
    "why": "The stylist disliked the two proparoxytones before the mediant (espírito dos príncipes) and offered 'alento' for spíritus, himself only if the word is accepted. Refused: spíritus is espírito throughout, and both proparoxytones are the Latin's own (spíritum príncipum). The ambiguity reader heard 'takes away their courage/pride' first, 'their life' second — both are in the Latin.",
    "options": [
        {"label": "o espírito dos príncipes", "forms": {"spiritum": "o espírito dos príncipes"}, "note": "draft", "from": "draft"},
        {"label": "aos príncipes o espírito", "forms": {"spiritum": "aos príncipes o espírito"}, "note": "stylist's first reorder; still proparoxytone", "from": "stylist"},
        {"label": "o alento aos príncipes", "forms": {"spiritum": "o alento aos príncipes"}, "note": "stylist — changes the word; refused", "from": "stylist"}
    ]})
d['verses']['75:13'] = "Ao terrível, e ao que tira {spiritum}, * ao terrível {apud} reis da terra."

d['choices']['75:12'] = d['choices']['75:12'].replace("In circúitu ejus → 'ao redor dele' (row), placed before the verb so it is not heard as 'bring gifts around him'.", "In circúitu ejus → 'ao seu redor' (the row's ao redor; the possessive form taken from the stylist in draft 2), placed before the verb so it is not heard as 'bring gifts around him'.")
d['choices']['75:7'] = "The formula row Ab increpatióne tua → 'À vossa repreensão' (17:16b; decision increpatio), with the vocative Deus Jacob → 'Deus de Jacó' as 45:8."

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5 (fresh context, read latin.json). One minor: 75:7 tense. Taken. Everything else passed, including Illúminans as a finite verb, ex tunc kept verbless, relíquiæ … diem festum.",
     "outcomes": [{"verse": "75:7", "remark": "ascendérunt perfect rendered as imperfect montavam", "outcome": "taken"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5 (fresh context, read latin.json). 8 remarks in 6 verses; 4 taken (75:5 dos, 75:11 order, 75:12 ao seu redor, 75:13 diante dos), 4 refused as options. Worst line 75:11, best 75:9.",
     "outcomes": [
        {"verse": "75:5", "remark": "maravilhosamente takes the breath; admiravelmente dos montes", "outcome": "taken", "decision": "amontibus", "reason": "'dos' taken; 'admiravelmente' refused and kept as an option in decision illuminans — admirável is admirábilis's, maravilhosamente is mirabíliter at 44:5b."},
        {"verse": "75:6", "remark": "follow the Latin order, verb first", "outcome": "option", "decision": "viri", "reason": "With the verb first, 'os homens de riquezas nas suas mãos' is heard as men with riches in their hands."},
        {"verse": "75:7", "remark": "À heard as a dative; Ante a vossa repreensão", "outcome": "option", "decision": "increpatio", "reason": "Formula row (17:16b); the ambiguity reader heard the cause first. If taken, all four places change."},
        {"verse": "75:11", "remark": "vos celebrará heard as 'celebrates you'; celebrará para vós", "outcome": "taken", "decision": "diemfestum"},
        {"verse": "75:12", "remark": "proparoxytone dádivas; ao seu redor trazeis ofertas", "outcome": "option", "decision": "munera", "reason": "'ao seu redor' taken (order). 'ofertas' refused: oblátio's family (D41); the múnera row stands, the proparoxytone is the Latin's own (múnera)."},
        {"verse": "75:13", "remark": "two proparoxytones at the mediant; alento", "outcome": "option", "decision": "spiritum", "reason": "spíritus → espírito; the proparoxytones are the Latin's (spíritum príncipum); he accepted the accommodation himself."},
        {"verse": "75:13", "remark": "para os reis sounds like 'in their opinion'; diante dos", "outcome": "taken", "decision": "apud"}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5 (fresh context, Portuguese only). 22 readings, 4 unknown words (dormitaram, potências, dádivas, insensatos). Acted on two: 75:4 potências heard as world powers → singular; 75:5 desde heard as temporal → dos (with the stylist). The rest are the Latin's own openness or obscurity (75:6 sleep = death, 75:8 ex tunc, 75:11 the remnant of thought, 75:13 the dangling datives, spíritus as courage or life) and are kept.",
     "outcomes": [
        {"verse": "75:4", "remark": "potências heard as nations/world powers; unknown in the sense of force", "outcome": "taken", "decision": "potentias"},
        {"verse": "75:5", "remark": "desde pulls toward temporal", "outcome": "taken", "decision": "amontibus"},
        {"verse": "75:7", "remark": "dormitaram unknown", "outcome": "refused", "decision": "dormitaverunt", "reason": "The row keeps dormitáre apart from dormíre, which stands one verse earlier; adormeceram is the option."},
        {"verse": "75:8", "remark": "desde então, a vossa ira a fragment", "outcome": "refused", "decision": "extunc", "reason": "The Latin is a verbless fragment too; joining it closes one of its readings."},
        {"verse": "75:8", "remark": "terrível has a colloquial sense", "outcome": "refused", "reason": "Settled D43; heard rightly in context."},
        {"verse": "75:11", "remark": "o resto do pensamento unclear; hostile-thought reading not audible", "outcome": "refused", "decision": "reliquiae", "reason": "The Latin is obscure; the hostile-wrath reading is the Hebrew's (ḥămat), not the Latin's."},
        {"verse": "75:12", "remark": "Fazei votos can mean wishing well; dádivas unknown", "outcome": "refused", "decision": "munera", "reason": "pagai-os fixes the sense of votos; dádivas is the row's word (presentes the option)."},
        {"verse": "75:13", "remark": "the datives dangle; espírito as courage or life", "outcome": "refused", "decision": "spiritum", "reason": "The Latin's construction and word; both senses are in spíritus."},
        {"verse": "75:5", "remark": "insensatos unknown", "outcome": "refused", "reason": "insípiens row (insensato), passed elsewhere."}
     ]},
    {"step": "revision", "version": 2, "note": "v2: 75:4 a potência dos arcos (singular); 75:5 dos montes eternos; 75:7 os que montaram cavalos; 75:11 celebrará para vós um dia de festa; 75:12 ao seu redor; 75:13 diante dos reis da terra. Two new decisions record refused proposals (increpatio, spiritum). Draft 1 kept as prayed.v1.json."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
