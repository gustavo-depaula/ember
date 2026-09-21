"""Ps 32 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps032/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


def add(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    D[id] = d


data['version'] = 2
data['status'] = 'reviewed'

# 32:1 — the blind reader heard 'aos retos convém o louvor' as 'the upright deserve praise'
d = D['decet']
d['why'] += (' Heard (draft 1): the blind reader took \'aos retos convém o louvor\' FIRST as \'the upright deserve to be praised\' — a wrong'
             ' first hearing the Latin does not have (collaudátio is the praise they give). Draft 2 says the noun as the verb it names,'
             ' \'aos retos convém louvar\' — grammar (D2), as D16 turned a noun into a clause; the antiphon becomes \'Aos retos * convém louvar\'.')
V['32:1'] = 'Exultai no Senhor, {justi}: * aos retos {decet}.'
d['options'] = [
    opt('convém louvar', {'decet': 'convém louvar'}, 'Ruling (draft 2): the praise given, as a verb; no wrong hearing.', 'ambiguity'),
    opt('convém o louvor', {'decet': 'convém o louvor'}, 'Draft 1: heard as praise received.', 'draft'),
    opt('fica bem o louvor', {'decet': 'fica bem o louvor'}, 'Matos Soares 1932; colloquial.', 'MS1932'),
    opt('cabe louvar', {'decet': 'cabe louvar'}, 'Plain.', 'draft'),
]

# 32:2 — the stylist: 'cítara' (proparoxytone) at the mediant; the instrument fronted in both cola
V['32:2'] = '{order2}: * {in_p} saltério de dez cordas {psallite2}.'
D['confiteri']['options'][0]['forms'] = {'confitemini': 'dai graças', 'Confitemini': 'Dai graças'}
D['confiteri']['options'][1]['forms'] = {'confitemini': 'louvai', 'Confitemini': 'Louvai'}
D['in_cithara']['options'][0]['forms'] = {'in_c': 'Com a', 'in_c_l': 'com a', 'in_p': 'com o'}
D['in_cithara']['options'][1]['forms'] = {'in_c': 'Na', 'in_c_l': 'na', 'in_p': 'no'}
D['in_cithara']['options'][2]['forms'] = {'in_c': 'Ao som da', 'in_c_l': 'ao som da', 'in_p': 'ao som do'}
add('order2', ['32:2'], 'Confitémini Dómino in cíthara', 'order',
    'Heard (draft 1): the stylist — «“Cítara” é proparoxítona: deixa duas sílabas depois do acento na chegada à cadência» → ‘Com a cítara'
    ' dai graças ao Senhor: * com o saltério de dez cordas entoai-lhe salmos’. Taken: order only (D2); the mediant now falls on the'
    ' oxytone \'Senhor\', and the two cola open alike on their instruments, which the Latin\'s \'in … in\' also pairs.',
    [opt('Com a cítara dai graças ao Senhor', {'order2': '{in_c} cítara {confitemini} ao Senhor'}, 'Ruling (draft 2): the stylist\'s order.', 'stylist'),
     opt('Dai graças ao Senhor com a cítara', {'order2': '{Confitemini} ao Senhor {in_c_l} cítara'}, 'Draft 1: the Latin\'s order; cítara at the mediant.', 'draft')])

# 32:4 — the stylist: the ellipsis hangs; Douay-Rheims's participle
d = D['fide']
d['why'] += (' Heard (draft 1): the stylist — «A elipse deixa uma expressão suspensa; falta um verbo que dê apoio à recitação» → ‘e todas'
             ' as suas obras são feitas com fidelidade’. Taken: a verb supplied is grammar (D2), and it is Douay-Rheims\'s own'
             ' (\'are done with faithfulness\'), a witness of the Latin\'s sense.')
V['32:4'] = 'Porque a palavra do Senhor é reta, * e todas as suas obras{fide}.'
d['options'] = [d['options'][2], d['options'][0], d['options'][1], d['options'][3]]
d['options'][0]['forms'] = {'fide': ' são feitas com fidelidade'}
for o in d['options'][1:]:
    o['forms'] = {'fide': ', ' + o['forms']['fide']}
d['options'][0]['note'] = 'Ruling (draft 2): the stylist\'s line, Douay-Rheims\'s participle.'
d['options'][0]['from'] = 'stylist'
d['options'][1]['note'] = 'Draft 1: verbless; hangs.'

# 32:6 — the stylist's worst line: the verb far away, and a change of number
V['32:6'] = '{verbo} do Senhor os céus foram firmados: * e pelo {spiritu} da sua boca{firm6} {virtus6}.'
add('firm6', ['32:6'], 'et spíritu oris ejus omnis virtus eórum', 'grammar',
    'The second colon has no verb in the Latin: \'firmáti sunt\' serves both, the Latin carrying it across a change of number. Heard'
    ' (draft 1): the stylist\'s worst line — «O verbo fica longe demais, no outro membro, e precisa ser recuperado com mudança de'
    ' número» → ‘e pelo espírito da sua boca foi firmado todo o poder deles’. Taken: the Latin\'s own verb said again in the number'
    ' Portuguese needs — grammar (D2), no word added that the Latin does not mean.',
    [opt('foi firmado', {'firm6': ' foi firmado'}, 'Ruling (draft 2): the stylist; the verb repeated.', 'stylist'),
     opt('(verbless)', {'firm6': ','}, 'Draft 1: verbless, as the Latin.', 'draft')])

# 32:7 — the Latinist (minor) and the blind reader: 'tesouros' heard as riches
d = D['thesauris']
d['why'] += (' Heard (draft 1): the Latinist, minor — «Thesauris designa aqui os depósitos onde algo é guardado … em português brasileiro'
             ' sugere os bens guardados» → ‘em depósitos’; the blind reader heard \'among riches\' and found the image hard. Taken: the'
             ' image the Latin means is the store, and Portuguese \'tesouro\' now says the thing stored.')
d['options'] = [d['options'][1], d['options'][0], d['options'][2]]
d['options'][0]['note'] = 'Ruling (draft 2): the Latinist; the store, not the riches.'
d['options'][0]['from'] = 'latinist'
d['options'][1]['note'] = 'Draft 1: heard as riches.'
# 'depósitos' is proparoxytone: said at the final it drags; the Latin's own order (in thesáuris abýssos) ends on 'abismos'
d['why'] += (' Draft 2 also takes the Latin\'s order, \'põe em depósitos os abismos\', so the colon ends on the paroxytone \'abismos\''
             ' as it ends on abýssos, not on the proparoxytone \'depósitos\'.')
V['32:7'] = '{congregans} como num odre as águas do mar: * {ponens} {thesauris}.'
d['options'][0]['forms'] = {'thesauris': 'em depósitos os abismos'}
d['options'][1]['forms'] = {'thesauris': 'os abismos em tesouros'}
d['options'][2]['forms'] = {'thesauris': 'os abismos nos seus reservatórios'}

# 32:8 — the stylist: agent and passive before a long subject
V['32:8'] = 'Toda a terra tema o Senhor: * e {v8b}.'
D['commov']['options'][0]['forms'] = {'commov': 'sejam abalados por ele'}
D['commov']['options'][0]['label'] = 'sejam abalados por ele'
D['commov']['options'][1]['forms'] = {'commov': 'tremam diante dele'}
D['commov']['options'][1]['label'] = 'tremam diante dele'
add('order8', ['32:8'], 'ab eo autem commoveántur omnes inhabitántes orbem', 'order',
    'Heard (draft 1): the stylist — «A sucessão de agente, verbo passivo e sujeito comprido soa traduzida e atrasa a compreensão» → ‘e todos'
    ' os que habitam o mundo sejam abalados por ele’. Taken: order only (D2). The blind reader heard \'shaken\' as awe first, bodily'
    ' shaking second — both in the Latin.',
    [opt('todos os que habitam o mundo sejam abalados por ele', {'v8b': 'todos os que habitam o mundo {commov}'},
         'Ruling (draft 2): subject first (the stylist).', 'stylist'),
     opt('por ele sejam abalados todos os que habitam o mundo', {'v8b': 'por ele sejam abalados todos os que habitam o mundo'},
         'Draft 1: the Latin\'s order.', 'draft')])

# 32:9 — the stylist: the feminine plural without antecedent
d = D['facta']
d['why'] += (' Heard (draft 1): the stylist — «O feminino plural surge sem antecedente em português: o ouvido procura o que foi feito» →'
             ' ‘e as coisas foram feitas’; the blind reader supplied \'all things\' himself. Taken: naming the subject the neuter plural'
             ' carries is grammar (D2); \'as coisas\' says only what facta says, and the second member then needs nothing.')
d['options'].insert(0, opt('as coisas foram feitas … foram criadas', {'facta': 'as coisas foram feitas', 'creata': 'foram criadas'},
                           'Ruling (draft 2): the stylist; the neuter\'s subject named once.', 'stylist'))
d['options'][1]['note'] = 'Draft 1: bare.'

# 32:10 — the stylist: 'príncipes' (proparoxytone) at the final; refused
V['32:10'] = 'O Senhor {dissipat} os {consilia_g} das nações: * e rejeita os pensamentos dos povos, {v10c}.'
add('principes', ['32:10'], 'et réprobat consília príncipum', 'order',
    'Heard (draft 1): the stylist — «“Príncipes” encerra um membro já longo com uma proparoxítona» → ‘e dos príncipes rejeita os desígnios’.'
    ' Refused, kept as an option: the Latin itself ends on the proparoxytone (príncipum), the colon\'s two \'rejeita\' members are built'
    ' alike in the Latin (réprobat … et réprobat), and his order breaks that parallel for an inversion. The blind reader heard'
    ' \'príncipes\' first as kings\' sons, rulers second: the Latin\'s word (princeps, ἄρχων) and the glossary\'s (23:7); the context'
    ' of nations and peoples carries the ruler\'s sense.',
    [opt('e rejeita os desígnios dos príncipes', {'v10c': 'e rejeita os {consilia_p} dos príncipes'}, 'Ruling: the Latin\'s parallel.', 'draft'),
     opt('e dos príncipes rejeita os desígnios', {'v10c': 'e dos príncipes rejeita os {consilia_p}'}, 'The stylist: the cadence.', 'stylist')])

# 32:12 — the blind reader heard 'para sua herança' as 'to receive an inheritance'
V['32:12'] = 'Bem-aventurada a nação {cujus}: * o povo que ele escolheu {hered}.'
add('hered', ['32:12'], 'pópulus, quem elégit in hereditátem sibi', 'grammar',
    'in hereditátem sibi (εἰς κληρονομίαν ἑαυτῷ): chosen to be his own inheritance. Heard (draft 1): the blind reader took \'para sua'
    ' herança\' FIRST as \'chosen to receive an inheritance\' — a wrong first hearing. Draft 2 \'como sua herança\' says what the'
    ' people is. heréditas → herança (glossary). Matos Soares 1932 \'para sua herança\' (draft 1).',
    [opt('como sua herança', {'hered': 'como sua herança'}, 'Ruling (draft 2): the people is the inheritance.', 'ambiguity'),
     opt('para sua herança', {'hered': 'para sua herança'}, 'Draft 1 (Matos Soares 1932): heard as \'to receive\'.', 'MS1932')])

# 32:15 — the stylist: 'deles … deles' at both cadences
V['32:15'] = 'Ele, que {v15a}: * que entende todas as obras deles.'
add('order15', ['32:15'], 'Qui finxit sigillátim corda eórum', 'order',
    'Heard (draft 1): the stylist — «As duas terminações em “deles” produzem um eco pouco expressivo. A repetição pode permanecer sem ocupar'
    ' ambas as cadências» → ‘Ele, que formou os corações deles um por um’. Taken: order only (D2); the Latin\'s repeated eórum stays,'
    ' and the mediant now falls on \'um\' (oxytone).',
    [opt('formou os corações deles um por um', {'v15a': '{finxit} os corações deles {sigil}'}, 'Ruling (draft 2): the stylist\'s order.', 'stylist'),
     opt('formou um por um os corações deles', {'v15a': '{finxit} {sigil} os corações deles'}, 'Draft 1.', 'draft')])
D['finxit']['options'][2]['forms'] = {'finxit': 'formou', 'sigil': 'um a um'}
D['finxit']['options'][2]['label'] = 'formou … um a um'

# 32:16 — the stylist: 'poder … poder' at both cadences
V['32:16'] = '{v16a}: * e o gigante não será salvo na {multitudine} do seu {virt16b}.'
add('order16', ['32:16'], 'Non salvátur rex per multam virtútem', 'order',
    'Heard (draft 1): the stylist — «A repetição necessária de “poder” cai nas duas cadências e faz o verso soar rimado» → ‘Por muito poder'
    ' não se salva o rei’. Taken: order only (D2); the word stays twice, as the Latin\'s virtútem … virtútis, but not at both cadences.',
    [opt('Por muito poder não se salva o rei', {'v16a': 'Por muito {virt16a} não {salvatur} o rei'}, 'Ruling (draft 2): the stylist.', 'stylist'),
     opt('O rei não se salva por muito poder', {'v16a': 'O rei não {salvatur} por muito {virt16a}'}, 'Draft 1: rhymes at the cadences.', 'draft')])

# 32:20 — the Latinist's MAJOR 'auxiliador' held; the stylist's order refused
d = D['adjutor']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Adjutor designa aquele que ajuda; “auxílio” substitui o agente pela ajuda,'
             ' transformando a designação pessoal em abstração» → ‘o nosso auxiliador e protetor’. HELD on purpose, as at 9:10, 17:3b,'
             ' 18:15b, 26:9b, 27:7, 29:11, 118:114 (D19, D24): the row\'s one word until Gustavo rules it. This is the case the row\'s'
             ' standing proposal names (paired with another agent noun), so the verse is evidence for it; \'auxiliador\' is one touch away.')
V['32:20'] = 'A nossa alma espera pelo Senhor: * porque {v20b}.'
add('order20', ['32:20'], 'quóniam adjútor et protéctor noster est', 'order',
    'Draft 1 put \'é ele\' last so that \'protetor\' does not rhyme with the mediant \'Senhor\'. Heard (draft 1): the stylist — «O sujeito'
    ' adiado dá a “é ele” uma ênfase demonstrativa que pesa na conclusão» → ‘porque ele é nosso auxílio e protetor’. Refused, kept as an'
    ' option: his order brings the rhyme Senhor / protetor back to the two cadences (rule 5), and the Latin also ends on the verb'
    ' (noster est).',
    [opt('o nosso auxílio e protetor é ele', {'v20b': 'o nosso {adjutor} e protetor é ele'}, 'Ruling: no rhyme at the cadences.', 'draft'),
     opt('ele é o nosso auxílio e protetor', {'v20b': 'ele é o nosso {adjutor} e protetor'}, 'The stylist: direct order; rhymes with Senhor.', 'stylist')])

# the D33 test: 'desígnios' unknown to the blind reader
D['consilia']['why'] += (' Heard (draft 1): the blind reader listed \'desígnios\' and \'desígnio\' as unknown (as in Ps 9); the stylist and'
                         ' the Latinist passed them. Kept for D33; \'planos\' is one touch away — evidence for the ruling.')

audit = data['audit']
audit += [
    {'step': 'checks', 'note': 'Draft 1: hard pass. Rhymes mended before the readers: 32:1 (Senhor / louvor, vocative moved), 32:20 (Senhor / protetor, copula last). Accepted as the Latin\'s own: 32:15 deles / deles, 32:16 poder / poder (both then moved by the stylist). Lengths: 32:6 +4 and +4, 32:17 first +7 (a very short Latin colon), 32:11 second −6.'},
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. One major (32:20 auxiliador, the known adjútor objection), one minor (32:7 tesouros). «A tradução conserva, no restante, o sentido do latim, inclusive suas construções e imagens menos usuais.» Passed \'desígnios\', \'espírito\', \'por ele sejam abalados\', \'Enganoso é o cavalo\', \'na multidão do seu poder\', \'em fidelidade\'.',
     'outcomes': [
         {'verse': '32:7', 'remark': 'minor: thesauris are storehouses; \'tesouros\' suggests the goods stored → \'em depósitos\'', 'outcome': 'taken', 'decision': 'thesauris'},
         {'verse': '32:20', 'remark': 'MAJOR: \'auxílio\' puts the help for the helper → \'o nosso auxiliador e protetor\'', 'outcome': 'refused', 'decision': 'adjutor',
          'reason': 'Held (D19, D24): the row\'s one word until ruled; recorded as evidence for the row\'s standing proposal (paired with protéctor).'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Nine verses; best 32:22, worst 32:6. «O ouvido tropeça sobretudo nas elipses transportadas do latim e em algumas inversões.» Seven taken (order, a verb supplied, a subject named), two refused with options.',
     'outcomes': [
         {'verse': '32:2', 'remark': 'cítara (proparoxytone) at the mediant → instrument first', 'outcome': 'taken', 'decision': 'order2'},
         {'verse': '32:4', 'remark': 'the ellipsis hangs → \'são feitas com fidelidade\'', 'outcome': 'taken', 'decision': 'fide'},
         {'verse': '32:6', 'remark': 'worst line: the verb too far, change of number → \'foi firmado todo o poder deles\'', 'outcome': 'taken', 'decision': 'firm6'},
         {'verse': '32:8', 'remark': 'agent + passive + long subject → subject first', 'outcome': 'taken', 'decision': 'order8'},
         {'verse': '32:9', 'remark': 'feminine plural without antecedent → \'as coisas foram feitas\'', 'outcome': 'taken', 'decision': 'facta'},
         {'verse': '32:10', 'remark': '\'príncipes\' proparoxytone at the final → \'e dos príncipes rejeita os desígnios\'', 'outcome': 'option', 'decision': 'principes',
          'reason': 'The Latin ends on príncipum too, and the two réprobat members are built alike; his order is an inversion.'},
         {'verse': '32:15', 'remark': '\'deles … deles\' at both cadences → \'os corações deles um por um\'', 'outcome': 'taken', 'decision': 'order15'},
         {'verse': '32:16', 'remark': '\'poder … poder\' at both cadences → \'Por muito poder não se salva o rei\'', 'outcome': 'taken', 'decision': 'order16'},
         {'verse': '32:20', 'remark': '\'é ele\' last is emphatic → \'porque ele é nosso auxílio e protetor\'', 'outcome': 'option', 'decision': 'order20',
          'reason': 'Brings back the rhyme Senhor / protetor at the cadences (rule 5); the Latin ends on est.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Draft 1. 23 items, 6 unknown words (Exultai, cítara, saltério, odre, desígnios ×2). Wrong first hearings mended: 32:1 \'aos retos convém o louvor\' (heard as the upright deserving praise), 32:12 \'para sua herança\' (heard as receiving an inheritance), 32:7 \'tesouros\' (riches). Heard rightly or within the Latin\'s range: \'espírito\' (the Spirit first, the breath second — both the Latin\'s), \'todo o poder deles\', \'abalados\', 32:9 \'all things\', \'na multidão do seu poder\', 32:17 the subject left open, \'no seu santo nome esperamos\' (trust).',
     'outcomes': [
         {'verse': '32:1', 'remark': '\'aos retos convém o louvor\' heard as the upright deserving praise', 'outcome': 'taken', 'decision': 'decet'},
         {'verse': '32:12', 'remark': '\'para sua herança\' heard as chosen to receive an inheritance', 'outcome': 'taken', 'decision': 'hered'},
         {'verse': '32:7', 'remark': '\'em tesouros\' heard as among riches', 'outcome': 'taken', 'decision': 'thesauris'},
         {'verse': '32:10', 'remark': '\'príncipes\' heard as kings\' sons first', 'outcome': 'refused', 'decision': 'principes',
          'reason': 'The Latin\'s word and the glossary\'s (23:7); nations and peoples around it carry the rulers\' sense.'},
         {'verse': '32:19', 'remark': '\'as almas\' heard as the spiritual soul (death as damnation) first', 'outcome': 'refused', 'decision': 'eruat',
          'reason': 'ánima → alma (glossary); the Latin\'s word carries both, as in 53:5.'},
         {'verse': '32:10', 'remark': '\'desígnios\', \'desígnio\' unknown', 'outcome': 'refused', 'decision': 'consilia',
          'reason': 'D33\'s word, passed by the Latinist and the stylist; evidence recorded for the ruling.'},
         {'verse': '32:2', 'remark': '\'cítara\', \'saltério\', \'odre\', \'Exultai\' unknown', 'outcome': 'refused', 'decision': 'in_cithara',
          'reason': 'The Latin\'s instruments and images (glossary: exultar, odre); not explained (D2).'}]},
    {'step': 'revision', 'version': 2,
     'note': 'ps032/revise_v2.py: 32:1 \'aos retos convém louvar\' (the blind reader); 32:2 the instrument first, 32:8 subject first, 32:15 and 32:16 order (the stylist); 32:4 \'são feitas com fidelidade\', 32:6 \'foi firmado\', 32:9 \'as coisas\' (the stylist: a verb or subject supplied); 32:7 \'põe em depósitos os abismos\' (the Latinist and the blind reader; the Latin\'s order, so the final is not the proparoxytone); 32:12 \'como sua herança\' (the blind reader). Refused with options: 32:10 the stylist\'s order, 32:20 his order (rhyme). Held: 32:20 \'auxílio\' against the Latinist\'s major.'},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written;', len(data['decisions']), 'decisions')
