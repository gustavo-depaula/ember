"""Ps 130 draft 2: take the stylist's *sentia* (2a) and his order for the apodosis (2b, article kept); record the three readers."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    print('already v2')
    raise SystemExit
dec = {x['id']: x for x in d['decisions']}

# 2a: sentia com humildade becomes option 0
h = dec['humiliter']
h['options'].insert(0, {
    'label': 'sentia com humildade', 'forms': {'humiliter': 'sentia com humildade'},
    'note': "Stylist (v1), taken: *sentiébam* is a disposition, not an opinion; *sentir* is the Latin's own verb and the plainer word, and *pensar com humildade* is not a turn Brazilians say. Keeps the imperfect against *exaltei*.",
    'from': 'stylist'})
h['options'][1]['note'] = "Draft 1. φρονεῖν is a verb of mind; the stylist heard *pensava* as an intellectual opinion, where the Latin names a disposition."

# 2b: the apodosis reordered to end on the noun; the article before the possessive kept (rule 5)
i = dec['ita']
i['refs'] = ['130:2b']
i['options'][0] = {
    'label': 'assim, na minha alma, a retribuição', 'forms': {'ita': 'assim, na minha alma,', 'inanima': 'a retribuição'},
    'note': "v2, the stylist's order (his *em minha alma* with the article restored, rule 5). Still verbless: the Latin's ellipsis kept, *está* of the first colon carrying over as *est* does; the mood (curse or statement) left to the one who prays. The colon now ends on the key noun, and no longer echoes *alma* from 2a.",
    'from': 'stylist'}
i['options'].insert(1, {
    'label': 'assim a retribuição na minha alma', 'forms': {'ita': 'assim a retribuição', 'inanima': 'na minha alma'},
    'note': "Draft 1: the Latin's order. The stylist heard it as a fragment that lurches after the long *retribuição*.",
    'from': 'draft'})
for o in i['options'][2:]:
    if o['label'] == 'assim seja a retribuição':
        o['forms'] = {'ita': 'assim seja, na minha alma,', 'inanima': 'a retribuição'}
        o['label'] = 'assim seja, na minha alma, a retribuição'
        o['note'] += " The ambiguity reader found the verbless line unclear (wish or statement? reward or payback?) — that openness is the Latin's; this is the option if Gustavo prefers the traditional reading spelled out."
    elif o['label'].startswith('… sobre'):
        o['forms'] = {'ita': 'assim, sobre a minha alma,', 'inanima': 'a retribuição'}
        o['label'] = 'assim, sobre a minha alma, a retribuição'

# the stylist's dropped article: refused, kept visible as an option
dec['est']['options'].append({
    'label': 'está sobre sua mãe', 'forms': {'est': 'está', 'supermatre': 'sobre sua mãe'},
    'note': "Stylist (v1): drops the article to ease *so-bre‿a-su-a*. Refused: rule 5 keeps the article before possessives; *sobre‿a sua* elides in the mouth.",
    'from': 'stylist'})

d['version'] = 2
d['choices']['130:2b'] += " v2: the ambiguity reader listed *desmamada* as a word he did not know; kept — it is the everyday verb (*desmamar*) and Almeida's word; *a criança que deixou o peito* would explain an image the Latin gives in one word."
d['choices']['130:1a'] += " The ambiguity reader heard the colloquial *exaltar-se* ('get worked up') as available but not first (decision `exaltatum` weighed it); kept."

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': "1 minor. Overall: faithful; the oath-conditional kept unresolved, *super matre* and *retribútio* kept.",
     'outcomes': [
         {'verse': '130:3', 'remark': "'para todo o sempre' amplifies 'usque in sǽculum'; 'para sempre'", 'outcome': 'refused',
          'reason': "D37 settled *usque in …* → *para todo o sempre* (the *usque* is the 'todo'); the formula is word for word 112:2b, 113:26, 120:8, 124:2b, and D23 keeps bare *para sempre* for *in ætérnum / in sǽculum* without *usque*."}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': "3 remarks, all in 2a–2b; best line 130:3, worst 130:2b. 2 taken (one with the article restored), 1 refused.",
     'outcomes': [
         {'verse': '130:2a', 'remark': "'pensava com humildade' sounds like an opinion; 'sentia com humildade'", 'outcome': 'taken'},
         {'verse': '130:2b', 'remark': "drop the article: 'sobre sua mãe'", 'outcome': 'refused', 'decision': 'est',
          'reason': "Rule 5 keeps the article before possessives; the syllables elide when sung."},
         {'verse': '130:2b', 'remark': "verbless colon reads as a fragment; 'assim, em minha alma, a retribuição'", 'outcome': 'taken', 'decision': 'ita',
          'reason': "Taken for the order (grammar/order, D2), with the article kept (*na minha alma*); still no verb supplied."}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': "10 items, 1 unknown word (*desmamada*). The real finding is 2a–2b: the conditional was heard as a confession or a dangling 'if', and *retribuição* as payback or reward — both the Latin's own openness, which the Latinist praised; the *seja* option spells out the curse if wanted. Acted on by the reorder of 2b only.",
     'outcomes': [
         {'verse': '130:1a', 'remark': "'se exaltou' can be heard as 'got worked up'", 'outcome': 'refused', 'decision': 'exaltatum', 'reason': "Heard as pride first; Lc 14:11 *quem se exalta* in Brazilian ears; the echo with *exaltei* is the Latin's."},
         {'verse': '130:1b', 'remark': "'andei em grandezas' may be heard as living in luxury", 'outcome': 'refused', 'decision': 'inmagnis', 'reason': "First hearing was right ('did not pursue great things'); the Latin's walk kept."},
         {'verse': '130:2a', 'remark': 'the conditional heard as a confession or a dangling if', 'outcome': 'refused', 'decision': 'ita', 'reason': "The Latin's conditional with a verbless apodosis; *assim seja* is the option that closes it."},
         {'verse': '130:2b', 'remark': "'retribuição' heard as payback, clashing with the child; verbless", 'outcome': 'option', 'decision': 'ita', 'reason': "Neutral by the retribútio row; the clash is the Latin's (the Greek's misreading of the Hebrew)."},
         {'verse': '130:2b', 'remark': "'desmamada' unknown", 'outcome': 'refused', 'reason': "Everyday Brazilian verb (*desmamar*), Almeida's word; any paraphrase explains."},
         {'verse': '130:2b', 'remark': "'sobre a sua mãe': on / about / above", 'outcome': 'refused', 'decision': 'est', 'reason': "Heard 'lies on its mother' first; the openness of *super* is the Latin's."}]},
    {'step': 'revision', 'version': 2,
     'note': "v2: 130:2a *pensava* → *sentia com humildade* (stylist); 130:2b apodosis reordered to *assim, na minha alma, a retribuição* (stylist's order, article kept), still verbless. Draft 1 kept as prayed.v1.json."}]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
