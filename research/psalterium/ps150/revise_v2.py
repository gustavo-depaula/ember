"""v2: readers' outcomes recorded; no wording taken (every remark refused with reason or already an option)."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'

dec = {x['id']: x for x in d['decisions']}

b = dec['benesonantibus']
b['why'] += (" The Latinist (v1, minor) said 'sonoros' drops *bene* and leans to 'loud'. It does not."
             " dicio.com.br gives *sonoro* sense 2 as 'que tem som claro e agradável: voz sonora' and sense 4 as 'melodioso, harmonioso, suave ao ouvido' (fetched 2026-09-23, circulation.md)."
             " So the quality *bene* names is inside the ordinary word. The calque stays an option.")
for o in b['options']:
    if o['label'] == 'bem sonantes':
        o['note'] = "The calque. Latinist v1 (minor) asked for it. Bookish."
        o['from'] = 'latinist'

org = dec['organo']
org['why'] += (" Readers: the stylist asked for 'o órgão' (the list should close on a concrete noun). The ambiguity reader found the singular with the article 'oddly specific'."
               " The Latinist named the generic 'instrumento' as a feature preserved. The ruling is held. 'órgão' would put the pipe organ into the psalm, and it stays option 3.")
for o in org['options']:
    if o['label'] == 'o órgão':
        o['note'] += " The stylist asked for it on v1."
        o['from'] = 'stylist'

j = dec['jubilationis']
j['why'] += (" The stylist asked for 'de júbilo' (plainer, and what Brazilian ears know). Refused: D43 settles the family as 'aclamação', and it names this verse; 'júbilo' is kept for *gáudium*."
             " The ambiguity reader heard 'cymbals played with shouts of joy', which is the Greek's ἀλαλαγμός.")
for o in j['options']:
    if o['label'] == 'de júbilo':
        o['note'] += " The stylist asked for it on v1."
        o['from'] = 'stylist'

dec['choro']['why'] += " The ambiguity reader heard 'a choir of singers' first and a circle dance second, which is the cost named above."
dec['spiritus']['why'] += (" The ambiguity reader heard 'every spirit' as souls or spiritual beings before 'all that breathes'."
                           " That is the Latin word's own first sense for a Latin reader too (DRB 'every spirit'), so the ruling is held.")

d['audit'].append({
    "step": "latinist", "file": "critic/v1.latinist.json",
    "note": "Reader: claude-opus-5-5, fresh context, with latin.json. There was one minor remark, and no majors. Overall: close and faithful. It named in sanctis, virtutibus, multitudinem magnitudinis and generic organum as preserved.",
    "outcomes": [
        {"verse": "150:5", "remark": "benesonantibus: 'sonoros' drops bene; fix 'bem sonantes'", "outcome": "refused",
         "decision": "benesonantibus",
         "reason": "Dicio gives 'sonoro' as 'que tem som claro e agradável' (sense 2), so *bene* is carried. MS1932, DM1962 and the CNBB all print 'címbalos sonoros'. The calque is bookish, and it stays an option."}
    ]
})
d['audit'].append({
    "step": "stylist", "file": "critic/v1.stylist.json",
    "note": "Reader: claude-opus-5-5, fresh context, with latin.json. There were three remarks, all refused. Best line 150:1, worst line 150:4.",
    "outcomes": [
        {"verse": "150:2", "remark": "'da sua grandeza' → 'de sua grandeza'", "outcome": "refused",
         "reason": "Rule 5 keeps the article before possessives. The colon is already 4 syllables short of the Latin."},
        {"verse": "150:4", "remark": "'o instrumento' is generic and flat; use 'o órgão'", "outcome": "option", "decision": "organo",
         "reason": "The glossary row and 136:2 (ὄργανον). 'órgão' is heard as the church pipe organ, which the psalm does not name. The Latinist counted the generic word a fidelity."},
        {"verse": "150:5", "remark": "'de aclamação' official and long; use 'de júbilo'", "outcome": "option", "decision": "jubilationis",
         "reason": "D43 (settled) gives *jubilátio* → 'aclamação' and names 150:5. 'júbilo' belongs to *gáudium*."}
    ]
})
d['audit'].append({
    "step": "ambiguity", "file": "critic/v1.ambiguity.json",
    "note": "Reader: claude-opus-5-5, fresh context. There were eight ambiguities and five unknown words (firmamento, saltério, cítara, címbalos, tamborim, all instrument or glossary words kept under D2 and D31, as in earlier psalms).",
    "outcomes": [
        {"verse": "150:1", "remark": "'nos seus santos': saints, holy places, or by the saints; heard as the saints (people)", "outcome": "refused", "decision": "sanctis",
         "reason": "Same wording as 67:36. The place-reading is lost, and it is recorded as the cost. Options stand."},
        {"verse": "150:1", "remark": "'firmamento do seu poder': sky or firmness; heard as sky", "outcome": "refused", "decision": "firmamento",
         "reason": "Heard as intended (D31, the sky)."},
        {"verse": "150:2", "remark": "'nos seus poderes': deeds, attributes or the angelic Powers", "outcome": "refused", "decision": "virtutibus",
         "reason": "That is the openness the Latin *in virtútibus* has, and it is kept on purpose."},
        {"verse": "150:2", "remark": "'multidão' first suggests a crowd", "outcome": "refused",
         "reason": "The known cost of the *multitúdo* row (heard the same way at 30:20). The Latin image is kept. The stylist agreed it must stay."},
        {"verse": "150:4", "remark": "'o coro' heard as a choir of singers first", "outcome": "option", "decision": "choro",
         "reason": "The cost named in the decision. The word agrees with 149:3, and 'a dança' is an option."},
        {"verse": "150:4", "remark": "'o instrumento' generic; singular with article oddly specific", "outcome": "option", "decision": "organo",
         "reason": "The Latin's singular *órgano* is kept. 'a flauta' and 'o órgão' are options."},
        {"verse": "150:5", "remark": "'címbalos de aclamação': heard as cymbals with shouts of joy", "outcome": "refused", "decision": "jubilationis",
         "reason": "Heard as intended (ἀλαλαγμός)."},
        {"verse": "150:5", "remark": "'todo espírito' heard as souls or spiritual beings rather than all that breathes", "outcome": "refused", "decision": "spiritus",
         "reason": "That is the Latin word's own first hearing (DRB 'every spirit'). 'todo sopro' and 'tudo o que respira' are options."}
    ]
})
d['audit'].append({
    "step": "revision", "version": 2,
    "note": "v2 has the same wording as v1: no reader remark was taken into the text. The decisions now record the readers' remarks, and the benesonantibus decision now has the dictionary evidence. v1 kept as prayed.v1.json."
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
