"""v1 -> v2 of canticle 232 after the Latinist, stylist and ambiguity readers.
python3.13 research/psalterium/ps232/revise_v2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
assert d['version'] == 1
d['version'] = 2
v = d['verses']
v['1:48'] = 'Porque olhou para a {humilitas} da sua serva: * pois eis que, desde agora, {dicent}.'
v['1:55'] = 'Como falou aos nossos pais, * {abraham} {insaecula}.'
v['1:51'] = '{v51a}: * dispersou os soberbos {mente} do seu coração.'
dec = {x['id']: x for x in d['decisions']}

# 1:49 — fez por mim
fecit = dec['fecit']
fecit['why'] += (' v2: the v1 stylist heard *me fez grandes coisas* as "made me into great things", and the ambiguity reader '
                 'also listed that hearing, second. The clitic dative is not safe here, and D2 gives way to the ear on grammar. '
                 '*por mim* is the dative of advantage, as the LH has it.')
fecit['options'] = [fecit['options'][2], fecit['options'][0], fecit['options'][1]]
fecit['options'][0]['note'] = ('v2: the LH\'s preposition; the dative of advantage made explicit so that *me* is not heard as '
                               'the object (the v1 stylist).')
fecit['options'][0]['from'] = 'stylist'
fecit['options'][1]['note'] = 'v1 draft: the Latin\'s dative as a clitic. The v1 stylist heard "made me into great things".'

# 1:52 — Derrubou
dep = dec['deposuit']
dep['why'] += (' v2: the ambiguity reader listed *Depôs* as an unknown word. Both CNBB books and the Diurnal say *Derrubou do '
               'trono os poderosos*. Taking a ruler down from the throne is the sense of depónere and of καθεῖλεν, so under the '
               'brief\'s rule the familiar word is taken.')
dep['options'] = [dep['options'][1], dep['options'][0], dep['options'][2]]
dep['options'][0]['note'] = ('v2: the Lectionary, the LH and the Diurnal, word for word with the draft\'s order; the sense of '
                             'the Latin (to put a ruler down from his seat). The v1 ambiguity reader did not know *Depôs*.')
dep['options'][1]['note'] = ('v1 draft and MS1932: the Latin\'s own verb (*depor* a king). The v1 ambiguity reader listed it '
                             'as unknown.')

# 1:51 — hold agiu com potência; record the Latinist's and stylist's forms
v51 = dec['v51a']
v51['why'] += (' v2: the Latinist (minor) asked for fecit to stay transitive, as *fez potência*. The stylist asked for *mostrou o seu '
               'poder*, finding *com … com* and *potência* flat. Both are held: row 135 (*agir com poder*) was held against the '
               'same Latinist request at 107:14, and *potência* is the poténtia row, held against stylists at 88:13 and 216. '
               'A colon is added before the mediant, so the two actions are heard apart; the ambiguity reader had heard '
               '*com potência* possibly running on into *dispersou*.')
v51['options'].append({'label': 'Com o seu braço fez potência', 'forms': {'v51a': 'Com o seu braço fez potência'},
                       'note': 'The v1 Latinist: potentia kept as the object of fecit. It is not Portuguese (*fazer potência*).',
                       'from': 'latinist'})
v51['options'].append({'label': 'Com o seu braço mostrou o seu poder', 'forms': {'v51a': 'Com o seu braço mostrou o seu poder'},
                       'note': 'The v1 stylist. It supplies "showing" (as MS1932 and the books do) and spends virtus\'s word *poder*.',
                       'from': 'stylist'})

# 1:55 — keep a Abraão; add the stylist's form as an option
ins = dec['insaecula']
d['decisions'].append({
    'id': 'abraham', 'refs': ['1:55'], 'latin': 'Ábraham, et sémini ejus', 'kind': 'ambiguity',
    'why': ('Ábraham does not decline, so it may be a dative beside sémini (he spoke *to Abraham and to his seed*, DRB, the '
            'Vulgate\'s usual reading) or stand in apposition to patres. *a Abraão e à sua descendência* is the dative pair. '
            'The v1 stylist heard a stumble in *a Abraão e à* and asked to drop the preposition. The hiatus is accepted, as '
            '104:42 *a Abraão, seu servo* and 231 1:73 *a Abraão, nosso pai*.'),
    'options': [
        {'label': 'a Abraão e à sua descendência', 'forms': {'abraham': 'a Abraão e à sua descendência'}, 'note': 'Draft: the dative pair, as 104:42 and 231.', 'from': 'draft'},
        {'label': 'Abraão, e à sua descendência', 'forms': {'abraham': 'Abraão, e à sua descendência'},
         'note': 'The v1 stylist. It takes Abraham as apposition to *pais* and leaves *e à sua descendência* hanging on *falou*.',
         'from': 'stylist'},
    ],
})

d['choices']['1:48'] += (' v2: commas around *desde agora*, as the v1 stylist asked, so that the voice rests after *pois eis que*; '
                         '*pois* stays for enim.')
d['choices']['1:51'] += ' v2: a colon before the mediant, as the Latin has.'
d['choices']['1:52'] = d['choices']['1:52'].replace('exaltáre', 'Derrubou (v2; decision deposuit). exaltáre')

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'claude-opus-5-5, fresh context, read latin.json. One minor, no majors. It confirmed the tenses, persons, images (dimisit inanes, mente cordis sui), the open Abraham construction, and the + and * marks.',
     'outcomes': [{'verse': '1:51', 'remark': 'fecit potentiam: the object turned into a manner; fez potência', 'outcome': 'option',
                   'decision': 'v51a', 'reason': 'Row 135 agir com poder was held against the same request at 107:14; *fazer potência* is not Portuguese. It is recorded as an option.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'claude-opus-5-5, fresh context, read latin.json. Four remarks: two taken, two held as options. Worst line 1:51, best 1:53.',
     'outcomes': [
         {'verse': '1:48', 'remark': 'pois eis que runs together, long colon; commas', 'outcome': 'taken',
          'reason': 'Commas around desde agora; pois kept for enim, as the stylist allowed.'},
         {'verse': '1:49', 'remark': 'me fez grandes coisas heard as "made me into"; fez por mim … aquele que é poderoso', 'outcome': 'taken',
          'decision': 'fecit', 'reason': 'fez por mim taken. aquele que refused: +2 syllables, and quem é poderoso was heard rightly by the ambiguity reader. The subject stays last, as in the Latin.'},
         {'verse': '1:51', 'remark': 'com … com; potência technical; no pause; mostrou o seu poder', 'outcome': 'option',
          'decision': 'v51a', 'reason': 'The pause is taken (a colon before *). potência is the poténtia row, refused to stylists at 88:13 and 216; mostrou adds a verb and spends virtus\'s poder.'},
         {'verse': '1:55', 'remark': 'a Abraão e à hiatus; Abraão in apposition', 'outcome': 'option', 'decision': 'abraham',
          'reason': 'The dative pair is the Latin\'s likelier construction, and the hiatus has precedent (104:42; 231 1:73).'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'claude-opus-5-5, fresh context, read the Portuguese only. Thirteen readings; two unknown words (soberbos, Depôs).',
     'outcomes': [
         {'verse': '1:48', 'remark': 'humildade heard as the virtue first', 'outcome': 'refused', 'decision': 'humilitas',
          'reason': 'The Latin carries both senses; the lowliness reading is listed second. pequenez stays the option for Gustavo.'},
         {'verse': '1:49', 'remark': 'me fez … heard as "made me into"; quem as a question', 'outcome': 'taken', 'decision': 'fecit',
          'reason': 'fez por mim.'},
         {'verse': '1:51', 'remark': 'com potência may run into dispersou', 'outcome': 'taken', 'reason': 'A colon before the mediant.'},
         {'verse': '1:51', 'remark': 'seu coração: God\'s heart possible', 'outcome': 'refused', 'decision': 'mente',
          'reason': 'sui is open in the Latin; kept deliberately.'},
         {'verse': '1:52', 'remark': 'Depôs unknown', 'outcome': 'taken', 'decision': 'deposuit',
          'reason': 'Derrubou, the word in both CNBB books and the Diurnal, in the Latin\'s sense.'},
         {'verse': '1:51', 'remark': 'soberbos unknown', 'outcome': 'refused', 'reason': 'The supérbus row (118:21), used across the psalter.'},
         {'verse': '1:55', 'remark': 'pelos séculos attached to falou or descendência', 'outcome': 'refused',
          'reason': 'The Latin has the same attachment question; the likely hearing is the Latin\'s.'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': 'v2: 1:48 commas around desde agora; 1:49 fez por mim (decision fecit); 1:51 a colon before *; 1:52 Derrubou (decision deposuit). New decision abraham for the stylist\'s refused form. prayed.v1.json and prayed.v1.vos.json are kept: they are the text the v1 readers read.'},
]
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
