"""Ps 136 draft 2 from draft 1 and the v1 readers. python3.13 research/psalterium/ps136/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
p['status'] = 'draft'
v = p['verses']
v['136:3a'] = 'Porque ali nos pediram os que nos levaram cativos * palavras de canções:'
v['136:9'] = 'Bem-aventurado quem {tenebit} * e {allidet} os teus pequeninos contra {petram}.'

dec = {d['id']: d for d in p['decisions']}

d = dec['interrogaverunt']
d['why'] = d['why'].replace(
    'The subject is moved before the verb and the object after the mark (order, D2).',
    'v2: the Latin\'s own order (verb, then the subject clause, then the object after the mark), the stylist\'s: draft 1 put the subject clause first and the ear waited too long for the verb.')
v['136:3a'] = v['136:3a'].replace('nos pediram', '{interrogaverunt}')
d['options'][0]['note'] = 'v1 and v2. MS1932 \'pediam\'; DRB \'required of us\'. v2 in the Latin\'s order (stylist).'

d = dec['misera']
d['why'] += (' v2: the stylist and the ambiguity reader both heard \'miserável\' first as the insult (scoundrel), and the ambiguity reader as '
             '\'stingy\' too — which intensifies the curse. \'Infeliz\' (the stylist\'s) is plain, says the wretched and doomed one of ταλαίπωρος, '
             'and takes its stress on the last syllable at the mediant. Taken.')
d['options'] = [
    {'label': 'infeliz', 'forms': {'misera': 'infeliz'}, 'note': 'v2, the stylist\'s: wretched, unfortunate; oxytone at the mediant.', 'from': 'stylist'},
    {'label': 'mísera', 'forms': {'misera': 'mísera'}, 'note': 'The Latin\'s word and cadence; literary.', 'from': 'draft'},
    {'label': 'miserável', 'forms': {'misera': 'miserável'}, 'note': 'v1; DRB \'miserable\'. Heard as \'scoundrel\' or \'stingy\' by two readers.', 'from': 'draft', 'warn': True},
    {'label': 'desgraçada', 'forms': {'misera': 'desgraçada'}, 'note': 'MS1932. Heard in Brazil as a curse-word: it intensifies.', 'from': 'MS1932', 'warn': True},
]

d = dec['tenebit']
d['why'] = ('tenére with no object (κρατήσει, will take hold). v1 departed from the row tenére → tomar (72:6, 72:24) for \'agarrar\', fearing '
            'that an absolute \'tomar\' would be heard as drinking. The stylist found \'agarrar\' grabby and colloquial, asked for the row\'s '
            '\'tomar\', and removed the comma before \'e\', so that \'tomar e arremessar\' share the one object, as the Latin\'s \'tenébit, et allídet '
            'párvulos\' do. With the comma gone the drinking sense has no room; no reader raised it. v2 returns to the row.')
d['options'] = [
    {'label': 'tomar', 'forms': {'tenebit': 'tomar'}, 'note': 'v2. The row (72:6, 72:24); the stylist\'s.', 'from': 'stylist'},
    {'label': 'agarrar', 'forms': {'tenebit': 'agarrar'}, 'note': 'v1. Seize; the stylist: grabby, colloquial.', 'from': 'draft'},
    {'label': 'segurar', 'forms': {'tenebit': 'segurar'}, 'note': 'The row\'s option; hold, softer than seize.', 'from': 'glossary'},
]

d = dec['in_ea']
d['options'].append({'label': 'até o fundamento nela', 'forms': {'in_ea': 'até o fundamento nela'},
                     'note': 'The Latinist (v1, minor): the locative kept. Not a Portuguese phrase aloud (\'down to the foundation in her\').', 'from': 'latinist'})

d = dec['oblivioni']
d['why'] += (' v1 ambiguity reader: \'a minha direita\' heard uncertainly as the hand (also side, entitlement), and \'a / à minha\' sound alike. '
             'The row keeps \'direita\' without \'mão\' where the Latin has no manus; the hand is the likeliest hearing even to him. '
             'The option with \'mão\' stays for Gustavo.')

p['choices']['136:2'] += (' The ambiguity reader could attach \'dela\' to Sião, the last name heard. So can the Latin: Sion is indeclinable and '
                          '\'ejus\' can point to either; the Latin leaves it to the context, and so does this.')
p['choices']['136:9'] = ('Translated faithfully, as the brief requires for this verse: \'Bem-aventurado\' (D19), \'tomar\' for tenébit (row), '
                         '\'arremessar … contra a rocha\' for allídet ad petram, \'os teus pequeninos\' (row) — the Latin\'s words, no gloss, no softening, '
                         'no added violence. v2: no comma after the mediant (the stylist). The ambiguity reader listed \'arremessar\' as unknown; it is '
                         'kept — the everyday word of the throw in Brazil (\'arremesso\'), and \'lançar\' (option) is weaker than \'dash\'.')

p['audit'].append({
    'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. One minor (136:7b in ea); refused, kept as an option. Overall: faithful; Esvaziai praised as the Septuagintal reading kept.',
    'outcomes': [{'verse': '136:7b', 'remark': "'dela' makes 'in ea' a genitive; fix 'até o fundamento nela'", 'outcome': 'option', 'decision': 'in_ea',
                  'reason': "'o fundamento nela' is not a Portuguese phrase aloud; 'dela' names the same city and keeps the singular."}]})
p['audit'].append({
    'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. 3 remarks, all taken. Best line 136:4, worst 136:3a.',
    'outcomes': [
        {'verse': '136:3a', 'remark': 'subject clause before the verb makes the colon top-heavy', 'outcome': 'taken'},
        {'verse': '136:8', 'remark': "'miserável' heard as scoundrel/stingy; 'infeliz'", 'outcome': 'taken'},
        {'verse': '136:9', 'remark': "'agarrar' colloquial, dangling; 'tomar' and no comma", 'outcome': 'taken'}]})
p['audit'].append({
    'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context. 21 readings, 4 unknown words (Edom, salgueiros, arremessar, retribuíste). Acted on: miserável (with the stylist). The rest are the Latin\'s own openness or kept on purpose.',
    'outcomes': [
        {'verse': '136:8', 'remark': "'miserável' likely heard as villainous", 'outcome': 'taken'},
        {'verse': '136:2', 'remark': "'no meio dela' may attach to Sião", 'outcome': 'refused', 'reason': "Latin 'ejus' after indeclinable 'Sion' is open the same way; not resolved (rule 2)."},
        {'verse': '136:5', 'remark': "'a minha direita' heard uncertainly as the hand", 'outcome': 'option', 'decision': 'oblivioni', 'reason': "The déxtera row; the hand still the likeliest hearing; 'mão direita' is an option."},
        {'verse': '136:1', 'remark': "'Sobre os rios' literally 'on top of'", 'outcome': 'refused', 'reason': "He himself names 'by the rivers' as what is heard; the Latin's word (decision super)."},
        {'verse': '136:7a', 'remark': "'Lembrai-vos … dos filhos de Edom' hostile only from 7b; 'no dia de Jerusalém' unclear", 'outcome': 'refused', 'reason': "The Latin's own ellipsis; MS1932's '(da ruína)' is a gloss."},
        {'verse': '136:7b', 'remark': "'Esvaziai' only vaguely destruction", 'outcome': 'refused', 'reason': "The Latin's and the Greek's image (decision exinanite); 'Arrasai' stays the option."},
        {'verse': '136:9', 'remark': "'arremessar' unknown", 'outcome': 'refused', 'reason': "Everyday Brazilian word (arremesso); weaker verbs soften the verse."},
        {'verse': '136:8', 'remark': "triple 'retribuir' hard to parse; 'retribuíste' unknown", 'outcome': 'refused', 'reason': "The Latin's triple root, kept (rule 2); the pagar-triple is the option."}]})
p['audit'].append({'step': 'revision', 'version': 2,
                   'note': "v2: 136:3a in the Latin's order (stylist); 136:8 'infeliz' for 'miserável' (stylist + ambiguity); 136:9 'tomar' (the row, stylist) and no comma after the mark. Draft 1 kept as prayed.v1.json."})

(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
