"""Ps 82 draft 2: apply the v1 readers' outcomes. Idempotent (does nothing if version is already 2)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    raise SystemExit('already v2')
dec = {x['id']: x for x in d['decisions']}
V = d['verses']

# 82:5 de gente — stylist (worst line) and ambiguity: 'como nação' clipped and double-read
g = dec['degente']
g['options'] = [
    {"label": "para não serem nação", "forms": {"degente": ", para não serem nação"}, "note": "draft 2 — DRB's reading ('so that they be not a nation') in the shortest build; the stylist's worst line and the ambiguity reader's second reading ('as a nation', we acting) both removed", "from": "stylist"},
    {"label": "como nação", "forms": {"degente": "como nação"}, "note": "draft 1 — the singular kept in two words; the stylist heard it clipped and ambiguous, the ambiguity reader could hear 'we, as a nation'; the Latinist passed it", "from": "draft"},
    {"label": "que deixem de ser nação", "forms": {"degente": ", que deixem de ser nação"}, "note": "the stylist's own words; 'deixar de' adds a verb of ceasing", "from": "stylist"},
    {"label": "do meio das nações", "forms": {"degente": "do meio das nações"}, "note": "MS1932; the plural and 'from among' are not the Latin's", "from": "MS1932"},
]
g['why'] += " Draft 2 takes the clause: the stylist named 'como nação' his worst line (clipped, 'in the manner of a nation', and the chime -mo-los co-mo at the mediant), and the ambiguity reader could hear 'we, as a nation'. The infinitive keeps it two syllables shorter than DRB's finite clause."

# 82:4 tramaram — refused (concinnáre's verb, D44)
dec['malignaverunt']['options'].append({"label": "tramaram com malícia um desígnio", "forms": {"malignaverunt": "tramaram com malícia um desígnio"}, "note": "stylist ('formar um desígnio' a calque; one 'trama' a design); refused — tramar is concinnáre's verb (D44, 49:19, 57:3)", "from": "stylist"})

# 82:10 name order — refused
dec['madian']['options'].append({"label": "Sísara, e a Madiã (order swapped)", "forms": {"madian": "Madiã"}, "note": "stylist: swap the names so the mediant is the oxytone Madiã; refused — the Latin's order (Madian, then Sisara, as in Judges) is not a matter of Portuguese grammar, and the Latin's own mediant is the proparoxytone Sísaræ. The slot keeps the name; the order change is recorded here", "from": "stylist"})

# 82:15 floresta — refused (D44)
d['decisions'].append({
    "id": "silva", "refs": ["82:15"], "latin": "combúrit silvam", "kind": "glossary",
    "why": "silva → selva is settled (D44; 49:10, 73:6 where the stylist's 'mata' was refused). The v1 stylist asked 'floresta' (selva = jungle to a Brazilian ear) and the ambiguity reader heard jungle as a second reading. Held for the row; the evidence is added to the glossary for the coordinator.",
    "options": [
        {"label": "a selva", "forms": {"silva": "a selva"}, "note": "draft — D44", "from": "glossary"},
        {"label": "a floresta", "forms": {"silva": "a floresta"}, "note": "stylist: the plain word; same cadence", "from": "stylist"},
        {"label": "a mata", "forms": {"silva": "a mata"}, "note": "the everyday word (73:6's stylist)", "from": "stylist"}
    ]})
V['82:15'] = "Como o fogo que queima {silva}: * e como a chama que queima os montes:"

# 82:19 só vós sois — refused
dec['nomen']['options'].append({"label": "vós só sois o Altíssimo", "forms": {"nomen": "o vosso nome é Senhor", "solus": "vós só sois o Altíssimo"}, "note": "stylist: 'só vós sois' hisses; refused — 'vós só sois' is as sibilant and can be heard 'you are only the Most High'", "from": "stylist"})

# 82:6 — the ambiguity reader could not place the tents; a dash sets them off as the subject
V['82:6'] = "Porque {cogit6} {unanimiter}: * juntos firmaram aliança contra vós {tents} as tendas dos idumeus e os ismaelitas:"
d['decisions'].append({
    "id": "tents", "refs": ["82:6"], "latin": "…disposuérunt, tabernácula Idumæórum et Ismahelítæ:", "kind": "ambiguity",
    "why": "The Latin names the allies after the verb, in apposition to its subject, and runs the list on into 82:8. With a comma, the ambiguity reader could not tell whether the tents were the allies, the target of the alliance, or an apposition to 'vós'. A dash marks what follows as the list of who made it; punctuation only.",
    "options": [
        {"label": "vós — as tendas", "forms": {"tents": "—"}, "note": "draft 2 — the dash sets off the list of allies", "from": "ambiguity"},
        {"label": "vós, as tendas", "forms": {"tents": ","}, "note": "draft 1 — the Latin's comma; three readings possible", "from": "draft"}
    ]})

d['choices']['82:18'] += " The ambiguity reader again listed *Corem* unknown and heard *correm* as possible — the erubéscere row's known cost (Pss 30, 69); kept, the row is for the coordinator."
d['choices']['82:3'] += " The ambiguity reader listed *ressoaram* unknown and heard the uproar only by inference; kept for D43, the periphrases are options of decision sonuerunt."

d['version'] = 2
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No remarks: tenses, moods, persons, images and names all found faithful; 'formaram com malícia um desígnio' and 'como nação' judged within the Latin's sense.", "outcomes": []},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Five remarks: one taken (82:5), four kept as options. Best line 82:14, worst 82:5.",
     "outcomes": [
        {"verse": "82:4", "remark": "'formar um desígnio' a calque; 'tramaram'", "outcome": "option", "decision": "malignaverunt", "reason": "tramar is concinnáre's verb (D44); MS1932 has 'Formaram desígnios'."},
        {"verse": "82:5", "remark": "'como nação' clipped, ambiguous; chime at the mediant", "outcome": "taken", "decision": "degente"},
        {"verse": "82:10", "remark": "proparoxytone mediant Sísara; swap the names", "outcome": "option", "decision": "madian", "reason": "The order of the names is the Latin's (and Judges'), not a matter of Portuguese grammar; the Latin's own mediant is proparoxytone."},
        {"verse": "82:15", "remark": "'selva' = jungle; 'floresta'", "outcome": "option", "decision": "silva", "reason": "silva → selva is settled (D44); evidence passed to the glossary."},
        {"verse": "82:19", "remark": "'só vós sois' hisses; 'vós só sois'", "outcome": "option", "decision": "nomen", "reason": "The proposal is as sibilant and can be heard 'you are only the Most High'."}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 28 readings, 20 unknown words (15 of them proper names, kept). Two acted on: 82:5 (with the stylist) and 82:6 (the dash). The rest are the Latin's own openness (who perished at Endor, whose princes, who will seek the name, future or wish in 82:16) or known costs (Corem, ressoaram, desígnio, ignomínia).",
     "outcomes": [
        {"verse": "82:5", "remark": "'como nação' could be 'we, as a nation'", "outcome": "taken", "decision": "degente"},
        {"verse": "82:6", "remark": "the tents' role unclear (subject / target / apposition)", "outcome": "taken", "decision": "tents"},
        {"verse": "82:18", "remark": "Corem unknown, heard as 'correm'", "outcome": "refused", "reason": "The erubéscere row (corar) keeps the three shame-words apart; the known cost, for the coordinator."},
        {"verse": "82:3", "remark": "ressoaram unknown", "outcome": "refused", "decision": "sonuerunt", "reason": "D43 settled; periphrases are options."},
        {"verse": "82:4", "remark": "desígnio, maquinaram unknown; 'santos' heard as canonized saints", "outcome": "refused", "reason": "desígnio is D33's (the same finding in Pss 9, 32); maquinar is plain Portuguese; sanctus → santo is the row (30:24, 31:6 the same hearing)."},
        {"verse": "82:15", "remark": "selva heard as jungle", "outcome": "option", "decision": "silva", "reason": "D44; as the stylist's remark."},
        {"verse": "82:17", "remark": "ignomínia unknown", "outcome": "refused", "decision": "ignominia", "reason": "The Latin's cognate; ἀτιμία; desonra is taken (D43)."},
        {"verse": "82:16", "remark": "prediction or request", "outcome": "refused", "reason": "The Latin is a future (persequéris, turbábis; the Greek too); the Latinist confirmed."}
     ]},
    {"step": "revision", "version": 2, "note": "v2: 82:5 ', para não serem nação' (stylist + ambiguity); 82:6 a dash before the list of allies (ambiguity); new decisions silva and tents record held and taken remarks. Draft 1 kept as prayed.v1.json."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print('v2 written')
