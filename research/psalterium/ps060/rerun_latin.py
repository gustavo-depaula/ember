"""Record the readers rerun with latin.json (claude-opus-5-5); mark the earlier Latinist/stylist steps superseded."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v1.stylist.json' and 'with latin.json' in a.get('model', '') for a in d['audit']):
    print('already recorded')
    raise SystemExit
for a in d['audit']:
    if a.get('step') in ('latinist', 'stylist') and a.get('file', '').startswith('critic/'):
        a['file'] = a['file'].replace('.json', '.no-latin.json')
        a['note'] = 'Read without latin.json, superseded. ' + a['note']
model = 'claude-opus-5-5 (fresh context, with latin.json)'
d['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': model,
     'note': 'Rerun on draft 1 with the Latin: the same three minors as the reading without it, no major. Nothing new; the v2 draft already answers them.',
     'outcomes': [
         {'verse': '60:4', 'remark': 'a fácie → diante do gives position only; contra a face do inimigo', 'outcome': 'option', 'decision': 'afacie', 'reason': '= 43:17 (rule 6) and the a fácie row; diante de holds facing and shelter.'},
         {'verse': '60:5', 'remark': 'velaméntum generalized to abrigo; sob a cobertura', 'outcome': 'option', 'decision': 'velamento', 'reason': 'σκέπη = 35:8 tegmen → abrigo (D15); the tegmen row refuses cobertura.'},
         {'verse': '60:7', 'remark': 'de geração em geração the idiom; de geração e geração', 'outcome': 'taken', 'decision': 'generationis'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': model,
     'note': 'Rerun on draft 1 with the Latin: 5 verses remarked, best 60:5, worst 60:7. Every point of substance was already met by draft 2 (60:3 order, 60:4 Vós me guiastes, 60:7 de geração e geração) or already stands as an option; nothing new changes the text.',
     'outcomes': [
         {'verse': '60:3', 'remark': 'inverted se angustiava o meu coração; uma rocha weak; quando o meu coração se angustiava, sobre a rocha', 'outcome': 'taken', 'decision': 'anxiaretur', 'reason': 'the order was taken in v2; a rocha refused — 26:6 sobre uma rocha, the petra row asks the copy, and the Latin has no article.'},
         {'verse': '60:4', 'remark': 'Guiastes-me heavy; Vós me guiastes', 'outcome': 'taken', 'decision': 'deduxisti'},
         {'verse': '60:7', 'remark': 'does not parse; e os seus anos até o dia de geração e geração', 'outcome': 'taken', 'decision': 'generationis', 'reason': 'the letter taken in v2; the added e refused (the Latin has none), kept as an option; the comma kept to mark the ellipsis of the verb.'},
         {'verse': '60:8', 'remark': 'procurará clumsy, flat; second possessive missing; a sua misericórdia e a sua verdade, quem as há de buscar?', 'outcome': 'option', 'decision': 'requiret', 'reason': 'buscar is quǽrere\'s and requírere → procurar is the row in four psalms; the Latin has one ejus (the fuller possessive is option 2 of ejus); há de adds syllables to a colon at length.'},
         {'verse': '60:9', 'remark': 'first colon long; cantarei for entoarei', 'outcome': 'option', 'decision': 'v9order', 'reason': 'psalmum dícere → entoar um salmo (17:50, 26:6b); cantar is cantáre\'s. The length was eased in v2 by moving the formula first.'},
     ]},
    {'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': model,
     'note': 'Gate on draft 2 with the Latin: 2 minor, no major — the same two points (60:4 a fácie, 60:5 velaméntum), both held as above. Every v2 change passed.',
     'outcomes': [
         {'verse': '60:4', 'remark': 'a fácie: contra a face do inimigo', 'outcome': 'option', 'decision': 'afacie', 'reason': '= 43:17 (rule 6); the Preces response reads alone as Diante do inimigo.'},
         {'verse': '60:5', 'remark': 'velaméntum: sob a cobertura', 'outcome': 'option', 'decision': 'velamento', 'reason': 'σκέπη = 35:8 tegmen (D15).'},
     ]},
])
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
