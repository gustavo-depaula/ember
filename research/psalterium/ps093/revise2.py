"""ps093 v2: apply the v1 readers' outcomes (idempotent on prayed.v1.json)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
d['version'] = 2
d['status'] = 'reviewed'
V = d['verses']
V['93:4'] = 'Proferirão e falarão iniquidade: * falarão todos os que praticam a injustiça?'
V['93:18'] = 'Se eu dizia: O meu pé {motus}, * a vossa misericórdia, Senhor, me auxiliava.'
V['93:2'] = 'Exaltai-vos, vós que julgais a terra: * {redde} a retribuição aos soberbos.'


def front(did, opt):
    x = dec[did]
    x['options'].insert(0, opt)


# 93:8 in populo: the Latinist's point, taken with the existing DRB option
s = dec['sapite']
s['options'][0], s['options'][1] = s['options'][1], s['options'][0]
s['options'][0]['note'] = 'Ruling (v2): the Latin\'s locative kept, as the Latinist asked (minor); his "no povo" is not idiomatic, "entre o povo" is DRB\'s "among".'
s['options'][1]['note'] = 'draft 1 — "do povo" (MS1932); the Latinist heard it as partitive/possessive.'

# 93:13 mitiges: the Latinist's fix
m = dec['mitiges']
m['options'][0]['note'] = 'draft 1 — made the days the object; the Latinist (minor): "a diébus malis" is separative. "abrandeis" was unknown to the ambiguity reader.'
front('mitiges', {"label": "Para que lhe deis alívio dos dias maus", "forms": {"mitiges": "Para que lhe deis alívio dos dias maus"},
                  "note": "Ruling (v2): the Latinist's fix — the dative 'lhe' and the separative 'dos' both kept; the verb becomes verb + noun (grammar). Costs the link with 84:4 'Abrandastes' (mitigáre's only other place).", "from": "latinist"})

# 93:2 redde
d['decisions'].append({"id": "redde", "refs": ["93:2"], "latin": "redde retributiónem supérbis", "kind": "glossary",
    "why": "The stylist hears 'pagar a retribuição' as 'pay the payment'. reddere is 'pagar' in 27:4b 'pagai-lhes a retribuição deles' (the same phrase) and 61:12 'pagareis a cada um', and again in this psalm at 93:23 'lhes pagará': the psalm's first and last verses echo each other (redde … reddet), and 'dar' would break both the formula and the echo.",
    "options": [
        {"label": "pagai", "forms": {"redde": "pagai"}, "note": "Ruling: as 27:4b and 93:23.", "from": "draft"},
        {"label": "dai", "forms": {"redde": "dai"}, "note": "stylist ('dai aos soberbos a retribuição'); refused for the formula and the echo with 93:23.", "from": "stylist"}]})

# 93:16 stabit: stylist option
dec['stabit']['options'].insert(1, {"label": "ficará firme comigo", "forms": {"stabit": "ficará firme comigo"}, "note": "stylist: 'estará de pé' limp; refused — stare → estar de pé (glossary, 23:3; 37:12 'ficaram de pé'); same length, so it does not solve the breath.", "from": "stylist"})

# 93:18 motus: stylist's vacilou exists as option
dec['motus']['options'][1]['note'] = "MS1932 'está vacilante'; the row's option; the stylist's request (worst line). Refused for the family: 16:5, 37:17, 72:2 say it of feet with 'abalar'."
dec['motus']['options'][1]['from'] = 'stylist'

# 93:20 preceito
dec['fingis']['options'].insert(1, {"label": "formais a fadiga no preceito", "forms": {"fingis": "formais a fadiga no preceito"}, "note": "stylist: 'decreto' juridical; refused — præcéptum → decreto is settled (D19, which lists 93:20), 'preceitos' is justificatiónes's.", "from": "stylist"})

# 93:23 disperdet: stylist's periphrasis taken
ds = dec['disperdet']
ds['options'] = [ds['options'][2], ds['options'][0], ds['options'][1]]
ds['options'][0]['note'] = "Ruling (v2): the stylist's. The verb still opens the colon and is the same verb in the same tense; only the clitic moves (grammar, D2) — a colon that starts on a bare 'os' after the asterisk jars in chant."
ds['options'][0]['from'] = 'stylist'
ds['options'][1]['note'] = 'draft 1 — identical halves; the stylist heard the bare clitic at the head of the colon as a deflation.'

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No major; two minors, both taken.",
    "outcomes": [
        {"verse": "93:13", "remark": "'a diébus malis' is separative, not the object", "outcome": "taken"},
        {"verse": "93:8", "remark": "'in pópulo' locative; 'do povo' looser", "outcome": "taken"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Seven remarks: three taken (all grammar or punctuation), four kept as options. Best line 93:21, worst 93:18.",
    "outcomes": [
        {"verse": "93:2", "remark": "'pagar a retribuição' sounds like accounting; 'dai'", "outcome": "option", "decision": "redde", "reason": "reddere → pagar is 27:4b's formula and echoes 93:23 'pagará'."},
        {"verse": "93:4", "remark": "comma breaks the verb pair; add article 'a iniquidade'", "outcome": "taken", "reason": "Comma removed. The article refused: 'falar iniquidade' is 30:19's wording and the Latin has no article."},
        {"verse": "93:12", "remark": "'ensinar da lei' calque; 'na vossa lei'", "outcome": "refused", "decision": "delege", "reason": "'na' makes the law the matter taught; 'de lege' is its source. 'na vossa lei' stays option 3; the ambiguity reader understood 'da'."},
        {"verse": "93:16", "remark": "overlong; 'ficará firme comigo'", "outcome": "option", "decision": "stabit", "reason": "stare → estar de pé (glossary); the proposal is no shorter."},
        {"verse": "93:18", "remark": "two colons in a row; 'foi abalado' stiff, 'vacilou'", "outcome": "option", "decision": "motus", "reason": "Punctuation taken (comma at the mediant). 'vacilou' refused for the movéri family already said of feet (16:5, 37:17, 72:2); option."},
        {"verse": "93:20", "remark": "'decreto' juridical; 'preceito'", "outcome": "option", "decision": "fingis", "reason": "D19 settles præcéptum → decreto and names 93:20."},
        {"verse": "93:23", "remark": "colon opening on bare clitic 'os'; 'há de exterminá-los'", "outcome": "taken", "decision": "disperdet"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Unknown words: abrandeis (removed with the 93:13 fix), proferirão, fadiga (kept: effári needs a verb apart from falar; labor → fadiga is the glossary's). Heard 93:2 'vós que julgais a terra' as said to human judges — the Latin's own opening, the address to God becomes clear at 93:5 'o vosso povo'; kept. 93:10 and 93:20 heard as obscure, as the Latin is. 93:17 'inferno' heard as hell first, as the glossary row foresaw.",
    "outcomes": [
        {"verse": "93:13", "remark": "'abrandeis' unknown", "outcome": "taken", "reason": "Replaced with the Latinist's fix."},
        {"verse": "93:2", "remark": "'vós que julgais' heard as human judges", "outcome": "refused", "reason": "The Latin has no vocative either; supplying 'Senhor' would add a word. The next verse names the Lord."},
        {"verse": "93:4", "remark": "'proferirão' unknown", "outcome": "refused", "reason": "effári needs its own verb beside loqui → falar; 'proferir' is current Portuguese."},
        {"verse": "93:20", "remark": "'fadiga' unknown; colon obscure", "outcome": "refused", "reason": "labor → fadiga (glossary); the obscurity is the Latin's."},
        {"verse": "93:17", "remark": "'inferno' heard as hell", "outcome": "refused", "reason": "The glossary row (open, for Gustavo) keeps the Latin's word."}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 93:13 Latinist's fix (lhe deis alívio dos dias maus); 93:8 'entre o povo'; 93:4 comma removed; 93:18 comma at the mediant; 93:23 'há de exterminá-los'. New decision 'redde' records the refused stylist proposal. Draft 1 kept as prayed.v1.json."})
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
