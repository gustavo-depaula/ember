"""Ps 30 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps030/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; appends audit_v2.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}
verses = data['verses']


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


def decision(id, refs, latin, kind, why, options):
    data['decisions'].append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options})


data['version'] = 2
data['status'] = 'reviewed'

# 30:10 + 30:11b — the Latinist's majors (the perfect passive) and the stylist's (plural agreement, 'na ira' first)
verses['30:10'] = 'Tende piedade de mim, Senhor, porque estou atribulado: * {conturbatus}:'
decision('conturbatus', ['30:10', '30:11b'], 'conturbátus est in ira óculus meus … et ossa mea conturbáta sunt', 'grammar',
         'The psalm says conturbáre twice, two verses apart (ἐταράχθη … ἐταράχθησαν). Draft 1 had the state, \'está perturbado … estão'
         ' perturbados\' (Douay-Rheims \'is troubled … are disturbed\'; 6:3 and 6:8 have the state). Heard (draft 1): the Latinist, MAJOR on'
         ' both — «O perfeito passivo foi substituído por um estado presente» → ‘foi perturbado …’, ‘os meus ossos foram perturbados’;'
         ' the stylist on 30:10 — «O verbo no singular, o complemento interposto e a enumeração posterior dificultam reconhecer … o conjunto'
         ' dos sujeitos» → ‘Na ira, estão perturbados o meu olho, a minha alma e o meu ventre’. Taken, both: the Latinist\'s tense and voice,'
         ' the stylist\'s order and plural agreement (grammar, D2; the Latin\'s singular agrees with the nearest subject). The two verses now'
         ' say the same verb in the same tense, as the Latin does. Cost: 30:11b no longer reads word for word as the formula of 6:3'
         ' (\'os meus ossos estão perturbados\'; 6:3 has \'conturbáta sunt ossa mea\', another order) — recorded on the formula row.'
         ' \'na ira\' keeps the Latin\'s ownerless wrath (the blind reader heard the speaker\'s own anger first, God\'s second).',
         [option('na ira foram perturbados … e os meus ossos foram perturbados',
                 {'conturbatus': 'na ira foram perturbados o meu olho, a minha alma e o meu ventre', 'ossa': 'e os meus ossos foram perturbados'},
                 'Ruling (draft 2): the Latinist\'s tense, the stylist\'s order.', 'latinist'),
          option('está perturbado na ira … e os meus ossos estão perturbados',
                 {'conturbatus': 'está perturbado na ira o meu olho, a minha alma e o meu ventre', 'ossa': 'e os meus ossos estão perturbados'},
                 'Draft 1: the state (6:3, 6:8).', 'draft'),
          option('na ira estão perturbados … e os meus ossos estão perturbados',
                 {'conturbatus': 'na ira estão perturbados o meu olho, a minha alma e o meu ventre', 'ossa': 'e os meus ossos estão perturbados'},
                 'The stylist\'s line whole; the state kept.', 'stylist')])
verses['30:11b'] = 'O meu vigor {infirmata} na pobreza: * {ossa}.'
decision('infirmata', ['30:11b'], 'Infirmáta est in paupertáte virtus mea', 'grammar',
         'infirmári (ἠσθένησεν, an active intransitive in the Greek): \'grew weak\'. Heard (draft 1): the Latinist, MAJOR (with the bones) —'
         ' «A construção passiva foi substituída por uma construção intransitiva» → ‘O meu vigor foi enfraquecido na pobreza’. Taken in part:'
         ' the reflexive \'se enfraqueceu\' is Portuguese\'s middle voice, the form the psalter already uses for this verb (17:37 \'não se'
         ' enfraqueceram\', 26:2b \'se enfraqueceram\', both passed by the Latinist); \'foi enfraquecido\' asks for an agent the Latin and'
         ' the Greek do not have.',
         [option('se enfraqueceu', {'infirmata': 'se enfraqueceu'}, 'Ruling (draft 2): the middle voice (17:37, 26:2b).', 'draft'),
          option('foi enfraquecido', {'infirmata': 'foi enfraquecido'}, 'The Latinist: the passive to the letter.', 'latinist'),
          option('enfraqueceu', {'infirmata': 'enfraqueceu'}, 'Draft 1.', 'draft')])

# 30:12 — the Latinist's minor (super = more than) and the stylist's worst line (the hanging 'muito')
d = decisions['super_omnes']
d['why'] += (' Heard (draft 1): the Latinist, minor — «não conserva o valor comparativo de «super omnes»» → ‘Mais que todos os meus'
             ' inimigos’. Taken: it is the Latin\'s preposition read as the Latinist and Matos Soares 1932 read it. The blind reader had'
             ' heard the draft\'s line rightly; the comparison is the stronger claim, and the Latin makes it.')
demote(d)
d['options'].insert(0, option('Mais que todos os meus inimigos,', {'super_omnes': 'Mais que todos os meus inimigos,'},
                              'Ruling (draft 2): the Latinist; Matos Soares 1932.', 'latinist'))
d['options'] = [x for x in d['options'] if x['label'] != 'Mais que todos os meus inimigos']
d = decisions['valde']
d['why'] += (' Heard (draft 1): the stylist\'s worst line — «“Muito” fica suspenso … não se liga naturalmente ao substantivo “afronta”» →'
             ' ‘e grande afronta para os meus vizinhos’; the blind reader heard \'muito\' possibly as \'many neighbours\'. Taken in substance'
             ' with Matos Soares 1932\'s adverb, \'sobretudo\': it says the degree of the dative (\'and to my neighbours above all\') without'
             ' repeating \'afronta\', which the Latin says once. A local departure from the valde row (\'muito\'), recorded there.')
demote(d)
d['options'].insert(0, option('sobretudo', {'valde': 'sobretudo'}, 'Ruling (draft 2): the adverb bound to the dative.', 'MS1932'))
d['options'] = [x for x in d['options'] if not (x['label'] == 'sobretudo' and x['from'] == 'MS1932' and 'Ruling' not in x['note'])]
d['options'].append(option('e grande afronta', {'valde': 'grande afronta'}, 'The stylist: the noun repeated, which the Latin does not.', 'stylist'))
verses['30:12'] = '{super_omnes} tornei-me uma afronta, e {valde} para os meus vizinhos: * e temor para os meus conhecidos.'

# 30:12b — the stylist ('para fora' hangs): 'a me … a corde' → 'longe de mim … longe do coração'
verses['30:12b'] = 'Os que me viam {foras}: * {oblivioni}, como um morto, {a_corde}.'
decision('foras', ['30:12b'], 'Qui vidébant me, foras fugérunt a me', 'order',
         'foras goes with fugérunt, as DO\'s comma has it (Douay-Rheims reads \'saw me without\'). Heard (draft 1): the stylist — «“Para fora”'
         ' chega como um acréscimo depois de uma construção que já parecia completa» → ‘fugiram para fora, para longe de mim’. Taken, with'
         ' one \'para\': \'longe de mim\' says the \'a me\' as \'longe do coração\' says the \'a corde\' of the second colon, so the Latin\'s'
         ' repeated preposition is heard twice.',
         [option('fugiram para fora, longe de mim', {'foras': 'fugiram para fora, longe de mim'}, 'Ruling (draft 2): the stylist\'s order.', 'stylist'),
          option('fugiram de mim para fora', {'foras': 'fugiram de mim para fora'}, 'Draft 1.', 'draft')])
d = decisions['a_corde']
d['why'] += ' Draft 2: \'longe de mim\' in the first colon now answers it (a me … a corde).'

# 30:13 — the blind reader heard 'vaso perdido' as a misplaced vase
d = decisions['perditum']
d['why'] += (' Heard (draft 1): the blind reader — likely \'Um vaso que foi extraviado\', a wrong first hearing (\'ruined\' second).'
             ' Changed to Douay-Rheims\'s \'destroyed\': the ruin the Latin participle says (pérdere, \'destroy\'), without Matos Soares\'s'
             ' specific breaking.')
demote(d)
d['options'].insert(0, option('destruído', {'perditum': 'destruído'}, 'Ruling (draft 2): DRB \'destroyed\'; no \'misplaced\' hearing.', 'DRB'))

# 30:14 — the stylist ('deliberaram' is minutes-of-a-meeting); the blind reader listed it as unknown
d = decisions['consiliati']
d['why'] += (' Heard (draft 1): the stylist — «“Deliberaram” traz um tom de ata ou conselho formal» → ‘planejaram’; the blind reader listed'
             ' \'deliberaram\' as unknown. Taken: the plainer of two faithful words (D2); D33 already gives consílium-as-a-plan its own word.')
demote(d)
d['options'].insert(0, option('planejaram', {'consiliati': 'planejaram'}, 'Ruling (draft 2): the stylist.', 'stylist'))

# 30:21 — the stylist ('da perturbação' hangs after the pause)
verses['30:21'] = 'Vós os escondereis {in_abscondito} da vossa face, * {a_conturb}.'
decision('a_conturb', ['30:21'], 'a conturbatióne hóminum', 'grammar',
         'Heard (draft 1): the stylist — «Depois da pausa, este complemento fica solto» → ‘longe da perturbação dos homens’. Taken: the'
         ' same \'a\' of separation as 30:12b (\'longe de mim … longe do coração\'); in 30:21b \'proteger de\' governs by itself and stays.'
         ' conturbátio → perturbação (the noun of conturbáre → perturbar).',
         [option('longe da perturbação dos homens', {'a_conturb': 'longe da perturbação dos homens'}, 'Ruling (draft 2): the stylist.', 'stylist'),
          option('da perturbação dos homens', {'a_conturb': 'da perturbação dos homens'}, 'Draft 1.', 'draft')])

# 30:24 — the stylist (two 'com' phrases, 'procedem' bureaucratic)
d = decisions['facientibus']
d['why'] += (' Heard (draft 1): the stylist — «As duas locuções com “com” alongam um segundo colo já extenso; “procedem” acrescenta uma'
             ' solenidade burocrática» → ‘retribuirá abundantemente aos que agem com soberba’. Taken whole: \'abundantemente\' is the'
             ' Latin\'s adverb as an adverb, \'agem\' the plainer verb (D2).')
demote(d)
d['options'].insert(0, option('abundantemente aos que agem com soberba', {'facientibus': 'abundantemente aos que agem com soberba'},
                              'Ruling (draft 2): the stylist.', 'stylist'))
for x in d['options'][1:]:
    x['forms'] = {'facientibus': 'com abundância aos que ' + x['forms']['facientibus']}
d['options'] = [x for x in d['options'] if x['forms']['facientibus'] != 'com abundância aos que agem com soberba']
verses['30:24'] = 'Amai o Senhor, vós, todos os seus santos: * porque o Senhor {requiret} a verdade, e retribuirá {facientibus}.'

# refused stylist remarks, kept as options
d = decisions['confundar']
d['why'] += (' Heard (draft 1): the stylist — «A posição de “para sempre” faz a frase soar montada» → ‘não serei envergonhado para sempre’.'
             ' Refused: that order puts the negation over \'para sempre\' (\'not for ever\'), the fault D27 recorded at 9:19; the blind reader'
             ' heard draft 1 as \'Nunca serei envergonhado\', rightly. His order is an option. The Latinist passed both places.')
d['options'].append(option('não serei envergonhado para sempre … não serei envergonhado',
                           {'confundar2': 'não serei envergonhado para sempre', 'confundar17': 'não serei envergonhado'},
                           'The stylist\'s order: heard \'not for ever\'.', 'stylist'))
d = decisions['commendo']
d['why'] += (' Heard (draft 1): the stylist — the proparoxytone \'espírito\' at the mediant → ‘O meu espírito entrego nas vossas mãos’.'
             ' Refused: the verse is the Compline responsory, whose first half is \'In manus tuas, Dómine\', and the inversion puts the object'
             ' first for the cadence\'s sake; the Latin\'s own mediant is \'spíritum meum\'. His order is an option.')
verses['30:6'] = '{order6} * vós me {redemisti}, Senhor, Deus da verdade.'
decision('order6', ['30:6'], 'In manus tuas comméndo spíritum meum:', 'order',
         'See decision commendo: the stylist\'s order, refused.',
         [option('Nas vossas mãos … o meu espírito:', {'order6': 'Nas vossas mãos {commendo} o meu espírito:'}, 'Ruling: the Latin\'s and the responsory\'s order.', 'draft'),
          option('O meu espírito … nas vossas mãos:', {'order6': 'O meu espírito {commendo} nas vossas mãos:'}, 'The stylist: the cadence.', 'stylist')])
d = decisions['illustra']
d['why'] += (' Heard (draft 1): the stylist — «“iluminar a face” pede luz dirigida à face; “sobre o vosso servo” não se encaixa» → ‘Fazei'
             ' brilhar’. Refused, as at 118:135 (twice): one Greek verb with 118:135, whose wording this colon repeats; the blind reader'
             ' paraphrased it rightly (\'Fazei vosso rosto brilhar sobre o servo\'). \'Fazei brilhar\' is option 1.')
verses['30:22'] = 'Bendito o Senhor: * porque {mirificavit} a sua misericórdia para mim numa cidade fortificada.'
decision('mirificavit', ['30:22'], 'mirificávit misericórdiam suam mihi', 'glossary',
         'mirificáre → fazer maravilhoso (glossary; 4:4 \'fez maravilhoso o seu santo\', 16:7 \'Fazei maravilhosas as vossas misericórdias\','
         ' 15:3). ἐθαυμάστωσεν. Heard (draft 1): the stylist — «“Fez maravilhosa” soa como decalque» → ‘mostrou de modo maravilhoso a sua'
         ' misericórdia para comigo’. Refused: \'mostrou\' is a verb the Latin does not have, and the row\'s build stands in three psalms;'
         ' the blind reader did not stumble here. His line is an option. Matos Soares 1932 \'maravilhosamente usou comigo da sua misericórdia\'.',
         [option('fez maravilhosa', {'mirificavit': 'fez maravilhosa'}, 'Ruling: the row.', 'glossary'),
          option('mostrou de modo maravilhoso', {'mirificavit': 'mostrou de modo maravilhoso'}, 'The stylist: a verb supplied.', 'stylist')])

steps = json.loads((folder / 'audit_v2.json').read_text(encoding='utf-8'))
data['audit'].extend(steps)
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
