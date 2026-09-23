"""Ps 141 draft 2 from draft 1 after the v1 readers. python3.13 research/psalterium/ps141/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
V = d['verses']
V['141:3'] = 'Derramo a minha oração {conspectu}, * e {pronuntio} diante dele a minha tribulação.'
V['141:5b'] = 'A fuga {periit}, * e não há quem {requirat} a minha alma.'
dec = {x['id']: x for x in d['decisions']}

dec['conspectu']['why'] += (' Draft 2 moves the phrase after the object (Derramo a minha oração na sua presença), the stylist\'s order: '
                            'the two colons no longer both end on a minha …ção. Order only (D2).')

lq = dec['laqueum']
lq['options'] = [lq['options'][1], lq['options'][0], lq['options'][2]]
lq['options'][0]['note'] = 'draft 2 — the stylist\'s: the clitic is what the prayed register expects; the dative is as open as the Latin mihi (aimed at me / hidden from me)'
lq['options'][0]['from'] = 'stylist'
lq['options'][1]['note'] = 'draft 1 — DRB \'hidden a snare for me\''
lq['options'][1]['from'] = 'draft'
lq['why'] += (' Ruled in draft 2 for the clitic (stylist): it is grammar, not a word, and the reading \'hid it from me\' that made draft 1 avoid it '
              'is a true sense of a hidden snare, not a wrong one.')

cs = dec['considerabam']
cs['options'][1]['note'] += '; the stylist\'s proposal (Olhava à direita), refused: olhar is the plain verb of looking, κατενόουν is looking closely, and the row gives observar for the absolute use (93:9). The pronoun is kept because olhava / observava is also \'he\'.'
cs['options'][1]['from'] = 'stylist'
cs['options'][1]['label'] = 'Olhava'
cs['options'][1]['forms'] = {'considerabam': 'Olhava'}

pe = dec['periit']
pe['options'] = [
    {'label': 'se perdeu para mim', 'forms': {'periit': 'se perdeu para mim'},
     'note': 'draft 2 — the subject first (stylist and ambiguity reader both stumbled on the inversion of draft 1); the verb kept', 'from': 'stylist'},
    {'label': 'pereceu para mim', 'forms': {'periit': 'pereceu para mim'}, 'note': 'the row\'s working verb (9:7b Pereceu a memória deles)', 'from': 'glossary'},
    {'label': 'foi-se de mim', 'forms': {'periit': 'foi-se de mim'}, 'note': 'plain, keeps \'from me\' as de mim; loses the sense of loss'},
]
pe['why'] += (' Draft 1 had Perdeu-se para mim a fuga (the Latin\'s order); the stylist called it the worst line (the subject dangles) and the ambiguity reader '
              'found it hard to parse, so draft 2 puts the subject first. The stylist\'s Não há mais fuga para mim was refused: it drops the verb (périit) and '
              'makes a statement of existence out of an event; it would also make the verse say não há twice where the Latin has périit … non est.')
pe['options'].append({'label': 'não existe mais para mim', 'forms': {'periit': 'não existe mais para mim'},
                      'note': 'the stylist\'s sense (Não há mais fuga para mim) in the slot; drops périit', 'from': 'stylist'})

dec['et_tu']['why'] += (' The Latinist (v1, minor, his only remark) asked for the et back. Refused: after quando the Portuguese e opens nothing — '
                        'it would be heard as a second temporal clause left without a main verb; MS1932 drops it too. The emphatic tu stays as vós named. Kept as option 1.')
dec['et_tu']['options'][1]['from'] = 'latinist'

d['decisions'].append({
    'id': 'retribuas', 'refs': ['141:8'], 'latin': 'donec retríbuas mihi', 'kind': 'glossary',
    'why': 'retribúere → retribuir (115:3, 137:8, 17:21); the open row makes Recompensai only for the vós imperative (118:17), where retribuí collides with the past. '
           'The stylist found retribuais bookish at the cadence and asked recompenseis; the ambiguity reader listed retribuais as unknown. Refused: the subjunctive has no '
           'collision, and the family retribuir / retribuição is kept across the psalter (the row). Recompensar also decides for reward, where the Latin (and the '
           'ambiguity reader) hear repayment either way.',
    'options': [
        {'label': 'me retribuais', 'forms': {'retribuas': 'me retribuais'}, 'note': 'draft — the row', 'from': 'glossary'},
        {'label': 'me recompenseis', 'forms': {'retribuas': 'me recompenseis'}, 'note': 'the stylist\'s; 118:17\'s imperative verb; decides for reward', 'from': 'stylist'},
    ]})
V['141:8'] = V['141:8'].replace('me retribuais', '{retribuas}')

d['choices']['141:6'] += (' The stylist asked e disse and minha porção without the article, for breath: refused — the article before possessives is a style rule, '
                          'and e supplies a conjunction the Latin lacks (the same reason the apodotic et of 141:4 is not supplied); eu disse as 118:57.')
d['choices']['141:7'] += ' The ambiguity reader heard humilhado as \'shamed\' first, \'brought low\' second; the row is shared with 37:9 and 115:1, kept.'
d['choices']['141:4'] = 'The ambiguity reader listed veredas and desfalecia as unknown: both are rows (sémita → vereda, D15, often reported unknown and kept; desfalecer, 76:4) and kept.'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': '1 minor (141:4 the dropped et); refused, kept as an option. Overall: close and faithful.',
     'outcomes': [{'verse': '141:4', 'remark': 'paratactic et dropped', 'outcome': 'option', 'decision': 'et_tu',
                   'reason': 'After quando, Portuguese e opens no main clause and would be heard as a second dangling clause; conjunction is grammar (D2); MS1932 drops it.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': '6 remarks; 3 taken (141:3 order, 141:4b clitic, 141:5b order — the last partly: his order problem, not his wording), 3 refused and kept as options or choices. Best line 141:2, worst 141:5b.',
     'outcomes': [
         {'verse': '141:3', 'remark': '-ação rhyme at mediant and final', 'outcome': 'taken', 'reason': 'Order only: na sua presença moved after the object.'},
         {'verse': '141:4b', 'remark': 'para mim flat; esconderam-me um laço', 'outcome': 'taken', 'decision': 'laqueum'},
         {'verse': '141:5', 'remark': 'observava clinical; Olhava', 'outcome': 'option', 'decision': 'considerabam',
          'reason': 'olhar is plain looking; κατενόουν is looking closely and the row gives observar for the absolute use (93:9); the pronoun is kept because observava is also third person.'},
         {'verse': '141:5b', 'remark': 'inverted calque; Não há mais fuga para mim', 'outcome': 'option', 'decision': 'periit',
          'reason': 'The inversion was fixed by order (A fuga se perdeu para mim); his wording drops périit and doubles não há.'},
         {'verse': '141:6', 'remark': 'second colon too long; e disse, minha porção', 'outcome': 'refused',
          'reason': 'Article before possessives is a style rule; e is a supplied conjunction; eu disse as 118:57. The length is the Latin colon\'s (19).'},
         {'verse': '141:8', 'remark': 'retribuais bookish; recompenseis', 'outcome': 'option', 'decision': 'retribuas',
          'reason': 'retribuir is the row (115:3, 137:8); recompensar only at the imperative (118:17) and it decides for reward.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '15 ambiguities, 3 unknown words. Every likely hearing is the Latin\'s sense or one the Latin also leaves open (the prison literal/figurative, the just waiting, retribution as reward or repayment). 141:5b procure heard as care first — the test the requirat decision asked for; the hostile sense noted as possible, kept. 141:5b inversion hard to parse — mended by order. Unknown: veredas, desfalecia, retribuais — rows, kept.',
     'outcomes': [
         {'verse': '141:5b', 'remark': 'Perdeu-se para mim a fuga hard to parse', 'outcome': 'taken', 'reason': 'subject put first.'},
         {'verse': '141:5b', 'remark': 'procure: care or hostile seeking', 'outcome': 'refused', 'decision': 'requirat', 'reason': 'Heard as care first, the sense; procurar is the row.'},
         {'verse': '141:4', 'remark': 'veredas, desfalecia unknown', 'outcome': 'refused', 'reason': 'Rows (D15; 76:4).'},
         {'verse': '141:8', 'remark': 'retribuais unknown', 'outcome': 'refused', 'decision': 'retribuas', 'reason': 'The row; see decision.'},
         {'verse': '141:7', 'remark': 'humilhado heard as shamed', 'outcome': 'refused', 'reason': 'Shared with 37:9, 115:1; the Latin humiliátus holds both.'}]},
    {'step': 'revision', 'version': 2,
     'note': 'v2: 141:3 na sua presença after the object (stylist, rhyme); 141:4b esconderam-me um laço (stylist); 141:5b A fuga se perdeu para mim (stylist + ambiguity, order). New decision retribuas records the refused recompenseis. prayed.v1.json kept. Checks re-run: hard pass; the 141:3 rhyme flag is gone; the other soft flags are those accepted in v1.'},
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
