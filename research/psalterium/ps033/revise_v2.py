"""Ps 33 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps033/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def add(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    D[id] = d


data['version'] = 2
data['status'] = 'reviewed'

# 33:5, 33:7, 33:18 — the refrain 'e de todas as … tribulações … o salvou / os livrou': the stylist, three times
V['33:5'] = '{exquisivi} o Senhor, e ele me escutou: * {v5b}.'
V['33:7'] = 'Este pobre clamou, e o Senhor o escutou: * {v7b}.'
V['33:18'] = 'Clamaram os justos, e o Senhor os escutou: * {v18b}.'
add('order_trib', ['33:5', '33:7', '33:18'], 'et ex ómnibus tribulatiónibus meis erípuit me … salvávit eum … liberávit eos', 'order',
    'The refrain of the psalm: a hearing (exaudívit) and a rescue from all tribulations, three times with the same build. Draft 1 kept the'
    ' Latin\'s order, object first and the verb last, and accepted the echo exaudívit … erípuit / salvávit / liberávit as the Latin\'s own.'
    ' Heard (draft 1): the stylist, at all three — «A rima entre “escutou” e “arrancou” fica muito exposta. O objeto antecipado também dá'
    ' à segunda metade uma ordem mais escrita que falada» (33:5), «Três terminações em “-ou” fazem o verso soar rimado» (33:7), «A ordem'
    ' invertida culmina novamente numa rima verbal» (33:18). Taken, the same way in all three so the refrain stays one: order only (D2);'
    ' the verb comes forward and the colon ends on \'tribulações\'. 33:20 (*de todas elas os livrará o Senhor*) ends on the subject, no'
    ' rhyme, and keeps the Latin\'s order.',
    [opt('verb first (… me arrancou de todas as minhas tribulações)',
         {'v5b': 'e me {eripuit} de todas as minhas tribulações', 'v7b': 'e o salvou de todas as suas tribulações',
          'v18b': 'e os livrou de todas as suas tribulações'}, 'Ruling (draft 2): the stylist, in all three.', 'stylist'),
     opt('the Latin\'s order (e de todas as … me arrancou)',
         {'v5b': 'e de todas as minhas tribulações me {eripuit}', 'v7b': 'e de todas as suas tribulações o salvou',
          'v18b': 'e de todas as suas tribulações os livrou'}, 'Draft 1: rhymes -ou at both cadences, three times.', 'draft')])

# 33:6 — 'sede' unknown to the blind reader (the noun 'thirst' / 'seat')
d = D['illuminamini']
d['why'] += (' Heard (draft 1): the blind reader listed \'sede\' as an unknown word — the imperative of ser is spelled and said as'
             ' the nouns \'sede\' (thirst, seat), and in a line about coming near and being lit a listener can take it so. Draft 2'
             ' \'deixai-vos iluminar\' keeps the imperative and the passive sense (be lit — let yourselves be lit), with no homograph;'
             ' an imperative with an enclitic, allowed (D13). *sede iluminados* is option 2.')
d['options'] = [d['options'][2], d['options'][0], d['options'][1]]
d['options'][0]['note'] = 'Ruling (draft 2): the imperative kept, no homograph.'
d['options'][0]['from'] = 'ambiguity'
d['options'][1]['note'] = 'Draft 1: \'sede\' not recognized by the blind reader.'

# 33:10 — 'indigência': the stylist ('administrativo') and the blind reader (unknown)
V['33:10'] = 'Temei o Senhor, {sancti}: * porque {inopia}.'
d = D['inopia']
d['why'] += (' Heard (draft 1): the stylist — «“Indigência” traz um timbre administrativo e abstrato» → ‘porque os que o temem não passam'
             ' necessidade’; the blind reader listed \'indigência\' as unknown. Taken, not in his words: \'passar necessidade\' is'
             ' eguérunt\'s in the next verse (33:11), and the Latin keeps inópia and egére apart. Draft 2 \'porque nada falta aos que o'
             ' temem\' says want as a verb — grammar (D2), as 32:1 turned a noun into a verb; the verb faltar is not the noun falta'
             ' (delíctum\'s, 33:22–23), and Douay-Rheims says the same (\'there is no want to them that fear him\'). The Offertory of All'
             ' Saints has another Latin (\'quóniam nihil deest\'), which this Portuguese would also fit.')
d['options'] = [
    opt('nada falta aos que o temem', {'inopia': 'nada falta aos que o temem'}, 'Ruling (draft 2): want said as a verb; plain.', 'stylist'),
    opt('não há indigência para os que o temem', {'inopia': 'não há indigência para os que o temem'},
        'Draft 1: the inops row\'s proposal; unknown to the blind reader, bureaucratic to the stylist.', 'draft'),
    opt('não há penúria para os que o temem', {'inopia': 'não há penúria para os que o temem'}, 'The noun kept, plainer.', 'draft'),
    opt('os que o temem não passam necessidade', {'inopia': 'os que o temem não passam necessidade'},
        'The stylist: merges inópia with 33:11 eguérunt.', 'stylist'),
]

# 33:14 — the stylist's worst line: 'Retém … do mal' and 'e que'
V['33:14'] = '{prohibe} a tua língua do mal: * e {jussive14}.'
add('jussive14', ['33:14'], 'et lábia tua ne loquántur dolum', 'grammar',
    'ne loquántur: a jussive after the imperative (1 Pet 3:10 has another wording, *et lábia ejus ne loquántur dolum*). Heard (draft 1):'
    ' the stylist\'s worst line — «“Reter a língua do mal” tem regência pouco espontânea; “falar engano” também soa transplantado. A'
    ' passagem do imperativo para “e que” enfraquece a continuidade da advertência» → ‘Afasta a tua língua do mal: * e não deixes que'
    ' os teus lábios falem com engano’. Taken in part: the \'que\' goes, so the jussive follows the imperative directly (\'e os teus'
    ' lábios não falem engano\'), which the ear takes as one warning. Refused in part: *reter* is prohibére\'s (glossary, 118:101;'
    ' *afastar* and *desviar* are taken by other verbs — 33:15 divértere is *apartar-se*); \'engano\' is dolus as object (glossary;'
    ' *com engano* turns the thing said into a manner); *não deixes que* adds a verb. The blind reader heard \'não falem engano\' as'
    ' \'do not tell lies\', rightly.',
    [opt('e os teus lábios não falem engano', {'jussive14': 'os teus lábios não falem engano'}, 'Ruling (draft 2): the jussive, no \'que\'.', 'stylist'),
     opt('e que os teus lábios não falem engano', {'jussive14': 'que os teus lábios não falem engano'}, 'Draft 1.', 'draft'),
     opt('e não deixes que os teus lábios falem com engano', {'jussive14': 'não deixes que os teus lábios falem com engano'},
         'The stylist: adds a verb; engano as manner.', 'stylist')])

# 33:15 — 'persegue-a' at the final: refused
d = D['persequere']
d['why'] += (' Heard (draft 1): the stylist — «“persegue-a” termina com duas sílabas depois da tônica … o encontro entre o verbo e o'
             ' pronome também exige cuidado no canto» → ‘procura a paz, e vai atrás dela’. Refused, kept as an option: *persequere*'
             ' is a verb of pursuit and the Latin also ends on it (*persequere eam*); \'vai atrás\' loosens the word (D2), and 1 Pet'
             ' 3:11 (*sequátur eam*) is the Clementine\'s other wording, not the psalm\'s.')
d['options'].append(opt('vai atrás dela', {'persequere': 'vai atrás dela'}, 'The stylist: the cadence; the verb loosened.', 'stylist'))

# 33:17 — 'fazer perecer da terra': refused (D24)
d = D['mala']
d['why'] += (' Heard (draft 1): the stylist — «“Perecer da terra” não se acomoda à regência portuguesa» → ‘para fazer desaparecer da'
             ' terra a memória deles’. Refused: pérdere → fazer perecer is settled (D24), and this row names 33:17; *de terra* is the'
             ' Latin\'s (ἐκ γῆς), and a memory made to perish from the earth is the image. The blind reader did not remark on it.')

# 33:19 — the stylist: 'Perto está o Senhor dos que' heard as 'the Lord of those who'
V['33:19'] = '{v19a} dos que {tribulato}: * {humiles}.'
add('order19', ['33:19'], 'Juxta est Dóminus iis, qui tribuláto sunt corde', 'order',
    'Heard (draft 1): the stylist — «A separação entre “perto” e “dos que” deixa passar momentaneamente a leitura “o Senhor dos que”. A'
    ' inversão exige uma entonação corretiva» → ‘O Senhor está perto dos que têm o coração atribulado’. Taken: order only (D2), and it'
    ' removes a wrong first hearing (the Lord OF the afflicted).',
    [opt('O Senhor está perto', {'v19a': 'O Senhor está perto'}, 'Ruling (draft 2): the stylist.', 'stylist'),
     opt('Perto está o Senhor', {'v19a': 'Perto está o Senhor'}, 'Draft 1: the Latin\'s order; \'o Senhor dos que\' heard.', 'draft')])

# 33:22 — 'péssima' (proparoxytone) at the mediant
V['33:22'] = '{v22a}: * e os que odeiam o justo {d22}.'
add('order22', ['33:22'], 'Mors peccatórum péssima', 'order',
    'Heard (draft 1): the stylist — «“Péssima” é proparoxítona e deixa duas sílabas átonas antes da mediante» → ‘Péssima é a morte dos'
    ' pecadores’. Taken: order only (D2); the mediant now falls on the paroxytone \'pecadores\', and the adjective, first, keeps the'
    ' weight the Latin\'s verbless line gives it. The blind reader heard \'a painful or terrible death\' first, a terrible fate second —'
    ' the Latin\'s range.',
    [opt('Péssima é a morte dos pecadores', {'v22a': '{Pessima} é a morte dos pecadores'}, 'Ruling (draft 2): the stylist.', 'stylist'),
     opt('A morte dos pecadores é péssima', {'v22a': 'A morte dos pecadores é {pessima}'}, 'Draft 1: proparoxytone at the mediant.', 'draft')])
D['pessima']['options'][0]['forms'] = {'pessima': 'péssima', 'Pessima': 'Péssima'}
D['pessima']['options'][1]['forms'] = {'pessima': 'muito má', 'Pessima': 'Muito má'}

audit = data['audit']
audit += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. No remark. «Não identifiquei falhas de adequação que exijam correção: a tradução preserva o sentido do latim, inclusive suas construções peculiares.» Passed \'será louvada\', \'juntos\' (in idípsum), \'acampará\', \'suave\', \'não serão privados de bem algum\', \'fazer perecer\', \'cometerão faltas\'.',
     'outcomes': []},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Nine verses; best 33:2, worst 33:14. «O ouvido tropeça sobretudo em algumas regências calcadas no latim e nas rimas verbais produzidas pelas inversões.» Six taken (four for order), one in part, two refused.',
     'outcomes': [
         {'verse': '33:5', 'remark': 'rhyme escutou / arrancou; object first → verb first', 'outcome': 'taken', 'decision': 'order_trib'},
         {'verse': '33:7', 'remark': 'three -ou endings → \'e o salvou de todas as suas tribulações\'', 'outcome': 'taken', 'decision': 'order_trib'},
         {'verse': '33:10', 'remark': '\'indigência\' administrative → \'os que o temem não passam necessidade\'', 'outcome': 'taken', 'decision': 'inopia',
          'reason': 'Taken in other words — \'nada falta aos que o temem\': his \'passar necessidade\' is 33:11 eguérunt\'s.'},
         {'verse': '33:14', 'remark': 'worst line: \'Retém … do mal\', \'falar engano\', \'e que\' → \'Afasta a tua língua do mal: * e não deixes que os teus lábios falem com engano\'', 'outcome': 'taken', 'decision': 'jussive14',
          'reason': 'In part: \'que\' dropped. *reter* (prohibére, glossary) and \'engano\' as object (dolus) kept; his line is option 3.'},
         {'verse': '33:15', 'remark': '\'persegue-a\' at the final → \'e vai atrás dela\'', 'outcome': 'option', 'decision': 'persequere',
          'reason': 'The Latin\'s verb of pursuit, and the Latin ends on it too (persequere eam); \'vai atrás\' loosens the word.'},
         {'verse': '33:17', 'remark': '\'perecer da terra\' regency → \'fazer desaparecer da terra\'', 'outcome': 'refused', 'decision': 'mala',
          'reason': 'D24 (pérdere → fazer perecer, settled; the row names 33:17); de terra is the Latin\'s.'},
         {'verse': '33:18', 'remark': 'the inverted order rhymes again → \'e os livrou de todas as suas tribulações\'', 'outcome': 'taken', 'decision': 'order_trib'},
         {'verse': '33:19', 'remark': '\'Perto está o Senhor dos que\' heard as \'o Senhor dos que\' → \'O Senhor está perto dos que\'', 'outcome': 'taken', 'decision': 'order19'},
         {'verse': '33:22', 'remark': '\'péssima\' proparoxytone at the mediant → \'Péssima é a morte dos pecadores\'', 'outcome': 'taken', 'decision': 'order22'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Draft 1. 26 items, 2 unknown words (\'sede\' 33:6, \'indigência\' 33:10 — both mended). Heard rightly or within the Latin\'s range: \'o seu louvor\' (praise given to the Lord), \'Este pobre\' (the speaker himself), \'e os libertará\' (the angel), \'Provai\' (experience it), \'suave\' (kind, gentle — χρηστός, the Latin\'s sense; 1 Pet 2:3 Clementine \'dulcis\'), \'espera nele\' (trust), \'filhos\' (spiritual sons), \'quer a vida\', \'não falem engano\' (lies), \'humildes de espírito\' (without pride), \'cometerão faltas\' (sins), \'resgatará as almas\' (saved after death first, kept from danger second).',
     'outcomes': [
         {'verse': '33:6', 'remark': '\'sede\' unknown (the noun thirst / seat)', 'outcome': 'taken', 'decision': 'illuminamini'},
         {'verse': '33:10', 'remark': '\'indigência\' unknown', 'outcome': 'taken', 'decision': 'inopia'},
         {'verse': '33:3', 'remark': '\'No Senhor será louvada a minha alma\' heard as the soul praising the Lord, though the build says it is praised', 'outcome': 'refused', 'decision': 'laudabitur',
          'reason': 'The Latin\'s passive (laudábitur, ἐπαινεσθήσεται; Douay-Rheims \'shall be praised\'); the reader noticed the build says it. \'se gloriará\' is the Hebrew\'s, option 2.'},
         {'verse': '33:10', 'remark': '\'todos os seus santos\' heard as the canonized saints', 'outcome': 'refused', 'decision': 'sancti',
          'reason': 'The Latin\'s word (sancti, οἱ ἅγιοι); the vocative row marks it with vós.'},
         {'verse': '33:3', 'remark': '\'os mansos\' heard as the calm, unaggressive', 'outcome': 'refused',
          'reason': 'mansuétus → manso (glossary); the Latin\'s range.'},
         {'verse': '33:23', 'remark': '\'resgatará as almas\' heard as saved after death first', 'outcome': 'refused',
          'reason': 'redímere → resgatar, ánima → alma (glossary); both hearings are the Latin\'s range.'}]},
    {'step': 'revision', 'version': 2,
     'note': 'ps033/revise_v2.py: 33:5, 33:7, 33:18 the verb before \'de todas as … tribulações\' (the stylist; the refrain kept one); 33:6 \'deixai-vos iluminar\' (\'sede\' unknown); 33:10 \'porque nada falta aos que o temem\' (\'indigência\', both readers); 33:14 \'e os teus lábios não falem engano\' (the stylist, in part); 33:19 \'O Senhor está perto\' and 33:22 \'Péssima é a morte dos pecadores\' (order). Refused: 33:15 \'vai atrás dela\' (option), 33:17 \'desaparecer\' (D24).'},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written;', len(data['decisions']), 'decisions')
