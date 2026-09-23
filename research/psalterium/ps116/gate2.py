import json
p='research/psalterium/ps116/prayed.json'
d=json.load(open(p))
if not any(a.get('file')=='critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step":"latinist","file":"critic/v2.latinist.json","note":"Gate on v2 (text identical to v1); claude-opus-5-5, fresh context, with latin.json. One minor, held as an option; no major. Note that the v1 run of the same reader on the same words had accepted *se firmou*.","outcomes":[
      {"verse":"116:2","remark":"confirmáta est → se firmou: the pronominal reads as middle voice (the mercy grew firm by itself), losing the passive's implied agent; fix *foi confirmada*","outcome":"option","decision":"confirmata","reason":"Held: the Portuguese pronominal is the ordinary way to say the Greek/Latin passive of state without a named agent (87:8 *Sobre mim se firmou o vosso furor* = *confirmátus est super me*, the same build, passed its readers); the proposed *foi confirmada* is the cognate the decision refuses because Brazilian ears hear 'proved' (the CNBB's own *comprovado*). *foi firmada* (passive, the row's verb) and *foi confirmada* stay options 2 and 1 — for Gustavo if he wants the voice over the idiom."}]})
for x in d['decisions']:
    if x['id']=='confirmata' and 'v2 Latinist' not in x['why']:
        x['why']+=" The v2 Latinist gate asked (minor) for the passive *foi confirmada*, for the voice; held — see the audit."
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
