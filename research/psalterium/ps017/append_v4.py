"""Stage two: append 17:26–17:51 to draft 3 → draft 4. Existing term decisions get new slots; new verse-local decisions are added.
python3.13 research/psalterium/ps017/append_v4.py  (reads prayed.v3.json, literal.v3.json; writes prayed.json, literal.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v3.json').read_text(encoding='utf-8'))
literal = json.loads((here / 'literal.v3.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source='draft'):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def new(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    dec[id] = d


def addSlot(decisionId, refs, formsByIndex, whyAdd):
    d = dec[decisionId]
    for i, o in enumerate(d['options']):
        o['forms'].update(formsByIndex(i, o))
    for r in refs:
        if r not in d['refs']:
            d['refs'].append(r)
    d['why'] += ' ' + whyAdd


literal['verses'].update({
    '17:26': 'Com o santo santo serás, * e com o homem inocente inocente serás:',
    '17:27': 'E com o eleito eleito serás: * e com o perverso serás pervertido.',
    '17:28': 'Porque tu o povo humilde salvo farás: * e os olhos dos soberbos humilharás.',
    '17:29': 'Porque tu iluminas a minha lâmpada, Senhor: * meu Deus, ilumina as minhas trevas.',
    '17:30': 'Porque em ti serei arrancado da tentação, * e no meu Deus passarei além do muro.',
    '17:31': 'Meu Deus, imaculado o seu caminho: † as palavras do Senhor examinadas no fogo: * protetor é de todos os que esperam nele.',
    '17:32': 'Porque quem [é] Deus além do Senhor? * ou quem [é] Deus além do nosso Deus?',
    '17:33': 'Deus, que me cingiu de poder: * e pôs imaculado o meu caminho.',
    '17:34': 'Que aperfeiçoou os meus pés como [os] dos cervos, * e sobre as alturas estabelecendo-me.',
    '17:35': 'Que ensina as minhas mãos para a batalha: * e puseste, como arco de bronze, os meus braços.',
    '17:36a': 'E deste-me a proteção da tua salvação: * e a tua direita me amparou:',
    '17:36b': 'E a tua disciplina corrigiu-me até o fim: * e a tua disciplina, ela mesma, me ensinará.',
    '17:37': 'Alargaste os meus passos debaixo de mim: * e não se enfraqueceram as minhas pegadas:',
    '17:38': 'Perseguirei os meus inimigos e prendê-los-ei: * e não voltarei, até que desfaleçam.',
    '17:39': 'Quebrá-los-ei, nem poderão estar de pé: * cairão debaixo dos meus pés.',
    '17:40': 'E cingiste-me de poder para a guerra: * e derrubaste os que se levantavam contra mim debaixo de mim.',
    '17:41': 'E os meus inimigos deste-me [de] costas, * e os que me odeiam exterminaste.',
    '17:42': 'Clamaram, e não havia quem [os] salvasse, ao Senhor: * e não os escutou.',
    '17:43': 'E esmigalhá-los-ei, como o pó diante da face do vento: * como a lama das praças apagá-los-ei.',
    '17:44': 'Arrancar-me-ás das contradições do povo: * estabelecer-me-ás por cabeça das nações.',
    '17:45': 'O povo que não conheci serviu-me: * ao ouvir do ouvido obedeceu-me.',
    '17:46': 'Os filhos estranhos mentiram-me, * os filhos estranhos envelheceram, e coxearam [longe] das suas veredas.',
    '17:47': 'Vive o Senhor, e bendito [é] o meu Deus: * e seja exaltado o Deus da minha salvação.',
    '17:48': 'Deus, que dás vinganças a mim, e sujeitas os povos debaixo de mim: * libertador meu dos meus inimigos irados.',
    '17:49': 'E dos que se levantam contra mim exaltar-me-ás: * do homem iníquo arrancar-me-ás.',
    '17:50': 'Por isso dar-te-ei graças entre as nações, Senhor: * e ao teu nome direi um salmo.',
    '17:51': 'Engrandecendo as salvações do seu Rei, † e fazendo misericórdia ao seu Cristo Davi: * e à sua semente até para sempre.',
})
literal['range'] = '17:2–17:51'

data['verses'].update({
    '17:26': 'Com o santo sereis santo, * e com o homem inocente sereis inocente,',
    '17:27': 'E com o eleito sereis eleito, * e com o perverso {perverteris}.',
    '17:28': 'Porque vós salvareis o povo humilde, * e humilhareis os olhos dos soberbos.',
    '17:29': 'Porque vós iluminais a minha lâmpada, Senhor: * meu Deus, iluminai as minhas trevas.',
    '17:30': 'Porque em vós serei arrancado da tentação, * e no meu Deus {murum}.',
    '17:31': '{v31}, † {eloquia}: * ele é o {p31} de todos os que nele esperam.',
    '17:32': 'Porque quem é Deus senão o Senhor? * ou quem é Deus senão o nosso Deus?',
    '17:33': 'É Deus que me cingiu de {virt33}, * e {p33}.',
    '17:34': 'Que {perfecit} os meus pés como os dos cervos, * e sobre as alturas {statuens}.',
    '17:35': 'Que ensina as minhas mãos para a batalha, * e {p35}.',
    '17:36a': 'E me destes a proteção da vossa salvação, * e a vossa direita {susc36}.',
    '17:36b': 'E a vossa disciplina me corrigiu {finem}, * e a vossa disciplina, ela mesma, me ensinará.',
    '17:37': '{dilatasti} os meus passos debaixo de mim, * e não se enfraqueceram {vestigia}.',
    '17:38': 'Perseguirei os meus inimigos e os prenderei, * e não voltarei atrás até que {deficiant}.',
    '17:39': 'Eu os {confringam}, e não poderão estar de pé, * cairão debaixo dos meus pés.',
    '17:40': 'E me cingistes de {virt40} para a guerra, * e {supplantasti} debaixo de mim os que se levantavam contra mim.',
    '17:41': '{dorsum}, * e exterminastes os que me odeiam.',
    '17:42': '{v42}, * e ele não os escutou.',
    '17:43': 'E eu os {comminuam} como o pó diante da face do vento, * como a lama das ruas os {delebo}.',
    '17:44': 'Vós me arrancareis das {contradictio} do povo, * e me estabelecereis como cabeça das nações.',
    '17:45': 'Um povo que eu não conhecia me serviu, * {auditu} obedeceu-me.',
    '17:46': 'Os {alieni46a} me mentiram, * os {alieni46b} envelheceram, e {claudicaverunt} fora das suas veredas.',
    '17:47': 'Vive o Senhor, e bendito o meu Deus, * e {exaltetur} o Deus da minha salvação.',
    '17:48': 'Deus, que me dais as vinganças, e sujeitais os povos debaixo de mim, * meu libertador dos meus inimigos irados.',
    '17:49': 'E me exaltareis acima dos que se levantam contra mim, * do homem iníquo me arrancareis.',
    '17:50': 'Por isso vos {confitebor} entre as nações, Senhor, * e {psalmum} ao vosso nome.',
    '17:51': '{magnificans}, † e usando de misericórdia com o seu Cristo, Davi, * e com a sua {semen} para sempre.',
})
data['range'] = '17:2–17:51'
data['version'] = 4
data['status'] = 'draft'

# ---- slots added to existing term decisions -------------------------------------------------------------
addSlot('protector', ['17:31'], lambda i, o: {'p31': o['forms']['protector']},
        'Stage two: 17:31 protéctor est ómnium sperántium in se, slot p31, filled from the same option.')
addSlot('posuit', ['17:33', '17:35'],
        lambda i, o: {'p33': ['fez imaculado o meu caminho', 'pôs imaculado o meu caminho', 'fez imaculado o meu caminho'][i],
                      'p35': ['fizestes os meus braços como um arco de bronze', 'pusestes os meus braços como um arco de bronze', 'fizestes os meus braços como um arco de bronze'][i]},
        'Stage two: the same build twice more, 17:33 pósuit immaculátam viam meam (slot p33) and 17:35 posuísti, ut arcum ǽreum, brácchia mea (slot p35) — pónere + a predicate, three times in the psalm, one verb three times: "fez … fez … fizestes" (option 1 has "pôs … pôs … pusestes").')
addSlot('susceptor', ['17:36a'], lambda i, o: {'susc36': 'me susteve' if o['from'] == 'MS1932' else 'me amparou'},
        'Stage two: 17:36a déxtera tua suscépit me — the verb of the same family (D19: suscéptor → amparo, suscípere → amparar; the pair is heard across the psalm, 17:3c … 17:36a), slot susc36. MS1932\'s option has his verb there, "me susteve".')

# ---- new decisions for stage two ------------------------------------------------------------------------
new('perverteris', ['17:27'], 'et cum pervérso pervertéris', 'word',
    'The stanza turns on a figure: with the holy you will be holy, with the innocent innocent, with the elect elect — and with the perverse pervertéris, a passive verb where the three before are "eris" + adjective (the Greek has an active verb here, διαστρέψεις, "you will twist"). God is the subject. Douay-Rheims: "thou wilt be perverted". Matos Soares 1932 glosses it away ("serás como ele merece").',
    [opt('vos pervertereis', {'perverteris': 'vos pervertereis'}, 'Ruling: the Latin\'s verb and root, the pronominal form for the passive with middle sense as elsewhere in the glossary; keeps the jolt the Latin keeps — the figure ends on a verb, not on "eris".'),
     opt('sereis perverso', {'perverteris': 'sereis perverso'}, 'The fourth member made like the other three (eris + adjective); the root kept, the verb lost.'),
     opt('sereis pervertido', {'perverteris': 'sereis pervertido'}, 'Douay-Rheims to the letter; in Brazil "um pervertido" is first a sexual word.', 'DRB'),
     opt('sereis como ele merece', {'perverteris': 'sereis como ele merece'}, 'Matos Soares 1932: an explanation. Refused under D2.', 'MS1932')])
new('murum', ['17:30'], 'transgrédiar murum', 'word',
    'transgrédior "step across, pass over"; ὑπερβήσομαι τεῖχος "I shall go over a wall".',
    [opt('transporei o muro', {'murum': 'transporei o muro'}, 'Ruling: trans- kept in one plain verb (transpor, to get across or over).'),
     opt('passarei por cima do muro', {'murum': 'passarei por cima do muro'}, 'The same, spelled out; three syllables longer.'),
     opt('trespassarei a muralha', {'murum': 'trespassarei a muralha'}, 'Matos Soares 1932: trespassar is to pierce through, not to go over.', 'MS1932')])
new('v31', ['17:31'], 'Deus meus, impollúta via ejus', 'grammar',
    'A hanging nominative: "My God — undefiled is his way" (Douay-Rheims "As for my God, his way is undefiled"). impollútus here, immaculátus in 17:24 and 17:33: the Greek has ἄμωμος in all three, so by D15\'s test one Portuguese word may serve — and it lets the three be heard as one thread (I shall be blameless with him … his way is blameless … he made my way blameless).',
    [opt('Imaculado é o caminho do meu Deus', {'v31': 'Imaculado é o caminho do meu Deus'}, 'Ruling: the hanging nominative made a genitive (grammar, D2; Matos Soares 1932 "Sem mácula é o caminho do meu Deus"), the adjective first as in the Latin; imaculado for impollútus with 17:24 and 17:33.', 'MS1932'),
     opt('O meu Deus: imaculado é o seu caminho', {'v31': 'O meu Deus: imaculado é o seu caminho'}, 'The Latin\'s build; "O meu Deus" is heard as a vocative and "o seu caminho" then hangs.'),
     opt('Impoluto é o caminho do meu Deus', {'v31': 'Impoluto é o caminho do meu Deus'}, 'The cognate keeps impollútus apart from immaculátus as the Latin does; impoluto is a literary word ("honra impoluta").')])
new('eloquia', ['17:31'], 'elóquia Dómini igne examináta', 'glossary',
    'D27 rules that 17:31 follows 11:7 (As palavras do Senhor são palavras puras … prata examinada no fogo): outside Ps 118 elóquium is decided locally, and here it is a subject with a genitive, where the clause "o que dissestes" cannot serve. The Latin has no verb (the participle stands in apposition to what goes before).',
    [opt('as palavras do Senhor examinadas no fogo', {'eloquia': 'as palavras do Senhor, examinadas no fogo'}, 'Ruling: D27\'s wording, verbless as the Latin; examináre → examinar (glossary, 11:7).', 'glossary'),
     opt('as palavras do Senhor são examinadas no fogo', {'eloquia': 'as palavras do Senhor são examinadas no fogo'}, 'A copula supplied (D2); but "são examinadas" is heard as a process going on, where the participle is a state (tried, refined).'),
     opt('o que o Senhor disse, examinado no fogo', {'eloquia': 'o que o Senhor disse, examinado no fogo'}, 'D26\'s clause, as in Ps 118; D27 ruled it out here.')])
new('virtus', ['17:33', '17:40'], 'præcínxit me virtúte · præcinxísti me virtúte ad bellum', 'glossary',
    'virtus (δύναμις) twice, in one phrase — "girded me with virtus". The glossary\'s open row gives virtus → poder and keeps it apart from fortitúdo → força, which this psalm has in its first line (17:2 fortitúdo mea).',
    [opt('poder', {'virt33': 'poder', 'virt40': 'poder'}, 'Ruling: the glossary row, so that 17:2 força and 17:33/40 poder stay two words as the Latin\'s two.', 'glossary'),
     opt('força', {'virt33': 'força', 'virt40': 'força'}, 'Douay-Rheims "strength", Matos Soares 1932 "força": the plain word for girding, but it merges virtus with fortitúdo in one psalm.', 'MS1932'),
     opt('vigor', {'virt33': 'vigor', 'virt40': 'vigor'}, 'Physical strength, apart from both; not the glossary\'s word anywhere else.')])
new('perfecit', ['17:34'], 'Qui perfécit pedes meos tamquam cervórum', 'glossary',
    'The glossary row perfícere → aperfeiçoar was tried by the Ps 8 agent on this very verse ("17:34 perfécit pedes meos"). καταρτιζόμενος "fitting, making ready".',
    [opt('aperfeiçoou', {'perfecit': 'aperfeiçoou'}, 'Ruling: the row; "aperfeiçoou os meus pés como os dos cervos".', 'glossary'),
     opt('fez', {'perfecit': 'fez'}, 'Matos Soares 1932 "que fez os meus pés (velozes) como os dos veados" — his gloss shows the gap the plain verb leaves.', 'MS1932')])
new('statuens', ['17:34'], 'et super excélsa státuens me', 'glossary',
    'statúere → firmar is the open row (118:38; 39:3 státuit super petram pedes meos is the same build: to set firm on a height). A present participle after a perfect; ἱστῶν με.',
    [opt('me firma', {'statuens': 'me firma'}, 'Ruling: the row, present as the participle is.', 'glossary'),
     opt('me estabelece', {'statuens': 'me estabelece'}, 'Matos Soares 1932 "me estabeleceu": constitúere\'s verb (17:44).', 'MS1932'),
     opt('me põe de pé', {'statuens': 'me põe de pé'}, 'The Greek\'s standing; stare\'s phrase (17:39).')])
new('finem', ['17:36b'], 'corréxit me in finem', 'glossary',
    'D27 kept in finem apart from in ætérnum and named this verse as one that decides for itself. The Greek is εἰς τέλος ("to the end, completely"); the verb is corrígere, "set straight" (ἀνώρθωσεν, "set upright"). Here nothing is negated — the failure D27 found at 9:19 was "não … até o fim" — and the verb is a past act, so "para sempre" would make the correcting perpetual.',
    [opt('até o fim', {'finem': 'até o fim'}, 'Ruling: "to the end", as both Vulgate-family versions have it (Douay-Rheims "unto the end", Matos Soares 1932 "até ao fim"), and as εἰς τέλος says; open between "right up to the end" and "thoroughly" as the Latin is. Not "para sempre": perpetuity is not what a past correcting says. So in finem now has two renderings in the psalter, as D27 foresaw — "para sempre" where it says perpetuity (9:7a, 9:19, 12:1), "até o fim" here.', 'DRB'),
     opt('para sempre', {'finem': 'para sempre'}, 'The working rendering of the glossary row (D27); with a perfect it says "once for all", which the Latin does not.', 'glossary'),
     opt('de todo', {'finem': 'de todo'}, 'The "completely" sense of εἰς τέλος alone; closes the openness.')])
new('dilatasti', ['17:37'], 'Dilatásti gressus meos subtus me', 'glossary',
    'dilatáre → dilatar is the open row for the heart (118:32); with steps it is the widening of the way beneath the feet (ἐπλάτυνας). The psalm has latitúdo → amplidão in 17:20, of the same image.',
    [opt('Alargastes', {'dilatasti': 'Alargastes'}, 'Ruling: the plain verb for widening a path; "dilatar os passos" is not said.'),
     opt('Dilatastes', {'dilatasti': 'Dilatastes'}, 'The glossary\'s cognate (118:32 dilatastes o meu coração); odd with steps.', 'glossary')])
new('vestigia', ['17:37'], 'et non sunt infirmáta vestígia mea', 'word',
    'vestígium: "a footstep, track" (the sole of the foot, then the print). ἴχνη "tracks". Both Vulgate-family versions have "feet". infirmári → enfraquecer (glossary).',
    [opt('as minhas pegadas', {'vestigia': 'as minhas pegadas'}, 'Ruling: the Latin\'s image kept, as gressus → passos keeps its own in the first colon.'),
     opt('os meus pés', {'vestigia': 'os meus pés'}, 'Douay-Rheims "my feet", Matos Soares 1932 "os meus pés": the sense, but pes has its own word in 17:34 and 17:39.', 'DRB')])
new('deficiant', ['17:38'], 'donec defíciant', 'glossary',
    'defícere → desfalecer (open row); the row found at 11:2 that desfalecer fails with a person as subject meaning "is gone". Here the sense is "until they give out" (ἐκλίπωσιν), in battle.',
    [opt('desfaleçam', {'deficiant': 'desfaleçam'}, 'Ruling, to be tested: the row\'s verb; of an enemy pursued, "until they faint" is the sense, not "until they are gone".', 'glossary'),
     opt('se acabem', {'deficiant': 'se acabem'}, 'Until they come to an end — the plain verb; closer to Douay-Rheims "till they are consumed".'),
     opt('sejam aniquilados', {'deficiant': 'sejam aniquilados'}, 'Matos Soares 1932: a passive and a stronger verb than the Latin\'s.', 'MS1932')])
new('confringam', ['17:39'], 'Confríngam illos', 'glossary',
    'confríngere → quebrar (open; the same Greek family as contérere — here ἐκθλίψω, "crush").',
    [opt('quebrarei', {'confringam': 'quebrarei'}, 'Ruling: the row.', 'glossary'),
     opt('despedaçarei', {'confringam': 'despedaçarei'}, 'The row\'s named option if confríngere must stand apart from frángere.'),
     opt('esmagarei', {'confringam': 'esmagarei'}, 'The Greek\'s crushing; another verb.')])
new('supplantasti', ['17:40'], 'et supplantásti insurgéntes in me subtus me', 'word',
    'supplánto: "to trip up one\'s heels, to throw down" (L&S) — the planta, the sole, is in the word. 16:13 supplánta eum, 36:31, 139:5 supplantáre gressus meos are the other places.',
    [opt('derrubastes', {'supplantasti': 'derrubastes'}, 'Ruling: "throw down", plain; "debaixo de mim" (subtus me) carries the rest.'),
     opt('fizestes tropeçar', {'supplantasti': 'fizestes tropeçar'}, 'Keeps the tripping, which fits 36:31 and 139:5 (gressus); three syllables longer in an already long colon.'),
     opt('abatestes', {'supplantasti': 'abatestes'}, 'Matos Soares 1932.', 'MS1932'),
     opt('suplantastes', {'supplantasti': 'suplantastes'}, 'The cognate: in Portuguese it means to surpass. Refused.')])
new('dorsum', ['17:41'], 'Et inimícos meos dedísti mihi dorsum', 'grammar',
    'A double accusative: "you gave me my enemies (as) back" — made them show me their backs, in flight (τοὺς ἐχθρούς μου ἔδωκάς μοι νῶτον).',
    [opt('E me destes os meus inimigos de costas', {'dorsum': 'E me destes os meus inimigos de costas'}, 'Ruling: dare, mihi, inimícos and dorsum all kept; "de costas" is the Portuguese for a body turned away.'),
     opt('E fizestes que os meus inimigos me voltassem as costas', {'dorsum': 'E fizestes que os meus inimigos me voltassem as costas'}, 'Douay-Rheims "thou hast made my enemies turn their back upon me": the sense, another verb.', 'DRB')])
new('v42', ['17:42'], 'Clamavérunt, nec erat qui salvos fáceret ad Dóminum', 'order',
    '"ad Dóminum" stands at the end of the colon, after the clause it does not belong to: they cried — and there was none to save them — to the Lord (Douay-Rheims keeps the order).',
    [opt('Clamaram ao Senhor, e não havia quem os salvasse', {'v42': 'Clamaram ao Senhor, e não havia quem os salvasse'}, 'Ruling: the phrase joined to its verb (order, D2); nothing added.'),
     opt('Clamaram, e não havia quem os salvasse, ao Senhor', {'v42': 'Clamaram, e não havia quem os salvasse, ao Senhor'}, 'The Latin\'s order; "salvasse ao Senhor" is heard as "save the Lord".'),
     opt('Clamaram, e não havia quem os salvasse; clamaram ao Senhor', {'v42': 'Clamaram, e não havia quem os salvasse; clamaram ao Senhor'}, 'Matos Soares 1932 supplies "(clamaram)" in brackets. Refused: adds a verb.', 'MS1932')])
new('comminuam', ['17:43'], 'commínuam eos … delébo eos', 'word',
    'commínuo: "to break or crumble to pieces" (L&S); λεπτυνῶ "grind fine". deléo: "blot out, efface"; the verb of 50:3 (dele iniquitátem meam).',
    [opt('esmigalharei … apagarei', {'comminuam': 'esmigalharei', 'delebo': 'apagarei'}, 'Ruling: crumbling to pieces, as the dust the simile names; delére → apagar, the verb Ps 50:3 will want.'),
     opt('reduzirei a pó … apagarei', {'comminuam': 'reduzirei a pó', 'delebo': 'apagarei'}, 'The image anticipated: "a pó … como o pó" says the dust twice.'),
     opt('desfarei … esmagarei', {'comminuam': 'desfarei', 'delebo': 'esmagarei'}, 'Matos Soares 1932\'s verbs; esmagar is not delére.', 'MS1932')])
new('contradictio', ['17:44'], 'de contradictiónibus pópuli', 'word',
    'contradíctio (ἀντιλογία): gainsaying, opposition in words; 30:21 a contradictióne linguárum, 80:8 and 105:32 aquam contradictiónis.',
    [opt('contradições', {'contradictio': 'contradições'}, 'Ruling, to be tested: the Latin\'s word (Douay-Rheims, Matos Soares 1932); "sinal de contradição" keeps the sense of opposition alive in church Portuguese. Risk: heard as logical inconsistency.', 'MS1932'),
     opt('contendas', {'contradictio': 'contendas'}, 'Disputes: the sense, another word.')])
new('auditu', ['17:45'], 'in audítu auris obedívit mihi', 'word',
    '"at the hearing of the ear" (εἰς ἀκοὴν ὠτίου): they obeyed as soon as they heard — the ear named, as the Latin names it.',
    [opt('ao ouvir com o ouvido', {'auditu': 'ao ouvir com o ouvido,'}, 'Ruling: the Latin\'s pleonasm kept (hearing, ear).'),
     opt('mal me ouviu', {'auditu': 'mal me ouviu,'}, 'The sense in speech; the ear lost.'),
     opt('ao ouvir a minha voz', {'auditu': 'ao ouvir a minha voz,'}, 'Matos Soares 1932: a voice supplied, the ear lost.', 'MS1932')])
new('alieni', ['17:46'], 'Fílii aliéni … fílii aliéni', 'glossary',
    'aliénus → estranho (glossary: wider than estrangeiro, anyone not one\'s own). The Latin says the phrase twice and so does the Portuguese.',
    [opt('filhos estranhos', {'alieni46a': 'filhos estranhos', 'alieni46b': 'filhos estranhos'}, 'Ruling: the glossary word; Matos Soares 1932 "Os filhos estranhos". Risk: "estranho" is also "odd".', 'glossary'),
     opt('filhos alheios', {'alieni46a': 'filhos alheios', 'alieni46b': 'filhos alheios'}, 'Other people\'s sons — exactly "not one\'s own"; not the glossary\'s word.'),
     opt('filhos de estrangeiros', {'alieni46a': 'filhos de estrangeiros', 'alieni46b': 'filhos de estrangeiros'}, 'The plainest sense; narrows aliénus to foreign.')])
new('claudicaverunt', ['17:46'], 'claudicavérunt a sémitis suis', 'word',
    'claudico "to limp, be lame"; ἐχώλαναν. With a (ἀπό): they limped away from their paths.',
    [opt('coxearam', {'claudicaverunt': 'coxearam'}, 'Ruling: the plain verb for limping in written Portuguese.'),
     opt('mancaram', {'claudicaverunt': 'mancaram'}, 'The everyday Brazilian verb; colloquial.'),
     opt('claudicaram', {'claudicaverunt': 'claudicaram'}, 'The cognate (Matos Soares 1932); literary.', 'MS1932')])
new('exaltetur', ['17:47'], 'et exaltétur Deus salútis meæ', 'glossary',
    'exaltáre → exaltar (glossary); the jussive passive. Ps 9:33 exaltétur manus tua → "exalte-se a vossa mão".',
    [opt('exalte-se', {'exaltetur': 'exalte-se'}, 'Ruling: as 9:33, the pronominal jussive.', 'glossary'),
     opt('seja exaltado', {'exaltetur': 'seja exaltado'}, 'The passive to the letter (Matos Soares 1932 "Seja exaltado").', 'MS1932')])
new('confitebor', ['17:50'], 'confitébor tibi in natiónibus', 'glossary',
    'D5: confitéri (to God) → dar graças a.',
    [opt('darei graças', {'confitebor': 'darei graças'}, 'Ruling: D5, the dative kept ("vos darei graças"), as 9:2.', 'glossary'),
     opt('louvarei', {'confitebor': 'louvarei'}, 'Matos Soares 1932 "te louvarei"; laudáre\'s verb (17:4 Laudans → Louvando). Refused by D5.', 'MS1932')])
new('psalmum', ['17:50'], 'et nómini tuo psalmum dicam', 'glossary',
    'psalmum dícere renders ψαλῶ, the verb that psállere renders elsewhere (7:18 psallam nómini Dómini → entoarei salmos ao nome). By D15\'s test the Latin\'s variation is an elegance, and D25\'s wording can serve with the Latin\'s noun in the singular.',
    [opt('entoarei um salmo', {'psalmum': 'entoarei um salmo'}, 'Ruling: D25\'s verb with the Latin\'s singular noun; the colon echoes 7:18b "e entoarei salmos ao nome …".', 'glossary'),
     opt('direi um salmo', {'psalmum': 'direi um salmo'}, 'The Latin\'s verb; "dizer um salmo" is said, but thin.'),
     opt('cantarei um salmo', {'psalmum': 'cantarei um salmo'}, 'Matos Soares 1932, Douay-Rheims "sing"; cantar is cantáre\'s.', 'MS1932')])
new('magnificans', ['17:51'], 'Magníficans salútes Regis ejus, et fáciens misericórdiam', 'grammar',
    'The psalm ends on two participles that hang on nothing in the verse (the Latin turns to the third person: Regis ejus, Christo suo). magnificáre → engrandecer (glossary). salútes is plural (σωτηρίας): kept.',
    [opt('Engrandecendo as salvações do seu Rei', {'magnificans': 'Engrandecendo as salvações do seu Rei'}, 'Ruling: the participles as gerunds, dangling as the Latin\'s do (the glossary row "participle + finite verb → gerund"); the plural kept.'),
     opt('Ele engrandece as salvações do seu Rei', {'magnificans': 'Ele engrandece as salvações do seu Rei'}, 'A subject and a finite verb supplied (the second participle would follow: "e usa de misericórdia"); clearer, and it decides that the subject is God.'),
     opt('Engrandecendo a salvação do seu Rei', {'magnificans': 'Engrandecendo a salvação do seu Rei'}, 'The plural made singular, as usage prefers; the Latin\'s number is lost.')])
new('semen', ['17:51'], 'et sémini ejus', 'word',
    'semen for offspring, the Latin\'s (and the Greek\'s) image. In Portuguese "a sua semente" for descendants belongs to older Bibles; the ear hears seed.',
    [opt('descendência', {'semen': 'descendência'}, 'Ruling: the plain word; the image is the language\'s, not the psalm\'s own figure.'),
     opt('semente', {'semen': 'semente'}, 'Douay-Rheims "his seed": the image kept.', 'DRB'),
     opt('posteridade', {'semen': 'posteridade'}, 'Matos Soares 1932.', 'MS1932')])

data['choices'].update({
    '17:26': 'The address turns to God ("eris", second person — vós, sereis). sanctus (ὅσιος) → santo; vir → homem; ínnocens → inocente. The figure (with X you will be X) kept four times, the adjective repeated each time.',
    '17:28': 'húmilis → humilde (D27) and humiliáre → humilhar: the Latin\'s echo húmilem … humiliábis is heard (humilde … humilhareis). superbus → soberbo. salvum fácere → salvar.',
    '17:29': 'lucérna → lâmpada (glossary); illumináre → iluminar, twice as the Latin. Rule 3: "iluminai" is safe (past "iluminei").',
    '17:30': 'in te … in Deo meo → "em vós … no meu Deus", the Latin\'s preposition twice (Douay-Rheims "by thee … through my God"). erípere a → arrancar (glossary). tentátio → tentação (the Latin\'s reading; the Hebrew has a troop).',
    '17:31': 'speráre in → esperar em. "ele é" supplied for "protéctor est" so that the colon does not open on a bare noun.',
    '17:32': 'præter → senão (Douay-Rheims "but"), twice as the Latin; the double question kept.',
    '17:33': '"É Deus que" — the Latin\'s Deus, qui continues the answer to 17:32 ("who is God but our God? God, who …"); a copula supplied so that the three relatives of 17:33–35 have something to hang on. præcíngere → cingir.',
    '17:34': 'cervus → cervo; "como os dos cervos" supplies the pronoun (tamquam cervórum, genitive). excélsa → as alturas.',
    '17:35': 'docére → ensinar (glossary) — and 17:36b docébit → ensinará, the echo kept. prǽlium → batalha, bellum (17:40) → guerra. The Latin turns to the second person in mid-verse (posuísti); so does the Portuguese (fizestes).',
    '17:36a': 'protéctio → proteção (glossary); salútis tuæ → "da vossa salvação" (the Latin\'s tuæ, not the Greek\'s μου). déxtera → a direita (glossary).',
    '17:36b': 'disciplína → disciplina (glossary), twice; "ela mesma" for ipsa, set off, so that the repetition is heard as the Latin\'s emphasis.',
    '17:37': 'gressus → passos; subtus → debaixo de, all three times in the psalm (17:37, 39, 40).',
    '17:38': 'pérsequi → perseguir, comprehéndere → prender (glossary rows; this verse is in the row\'s list); convérti → voltar, with "atrás" as Portuguese says "turn back".',
    '17:39': 'stare → estar de pé (glossary). "Eu" supplied so that the verse does not open on a clitic.',
    '17:40': 'insúrgere in → levantar-se contra (glossary); the present participle after a perfect → imperfect (os que se levantavam). A long colon (the Latin is 14 syllables); accepted for the two phrases the Latin has.',
    '17:41': 'dispérdere → exterminar (glossary); odiéntes me → os que me odeiam (17:18 has the same phrase).',
    '17:42': 'exaudíre → escutar (D3); "ele" supplied: the subject changes from them to the Lord.',
    '17:43': 'ante fáciem → diante da face de (glossary); plátea → rua (Matos Soares 1932 "das ruas"; a plátea is a broad street).',
    '17:44': 'erípere de → arrancar (glossary); constitúere → estabelecer (glossary); in caput → como cabeça. gentes → nações (glossary); 17:50 natiónes → nações too (one Greek word, ἔθνη).',
    '17:45': 'cognóvi: the perfect of knowing, "que eu não conhecia"; servíre → servir; obedíre → obedecer.',
    '17:46': 'inveteráre → envelhecer (glossary, which names 17:46); sémita → vereda (D15); "fora das suas veredas" for a sémitis suis (the separation of ἀπό).',
    '17:47': 'Vivit Dóminus: "Vive o Senhor". "bendito o meu Deus" verbless, as the Latin, open between a statement and a wish (117:26a "Bendito o que vem" has the same build).',
    '17:48': 'vindíctæ → vinganças (plural kept); subdere → sujeitar (the glossary\'s verb for subjícere, 8:8 — one Greek verb, ὑποτάσσω; 143:2 qui subdit pópulum meum sub me will follow); iracúndus → irado. The second colon is a vocative, like 17:2 "Senhor, minha força".',
    '17:49': 'exaltáre → exaltar; ab insurgéntibus → "acima dos que se levantam" (Douay-Rheims "above them that rise up"); vir iníquus → homem iníquo; erípere → arrancar.',
    '17:50': 'Proptérea → Por isso. natiónes → nações.',
    '17:51': 'Christus → Cristo (D19); David → Davi. misericórdiam fácere cum → usar de misericórdia com (the light verb yields, as bonitátem fácere cum → usar de bondade com, 118:65). usque in sǽculum → para sempre (in sǽculum, glossary).',
})

data['audit'].append({'step': 'draft', 'note': "Stage two (17:26–17:51), appended as draft 4 (append_v4.py; draft 3 kept as prayed.v3.json, literal.v3.json). Glossary applied: húmilis → humilde / humiliáre → humilhar (the echo kept), lucérna → lâmpada, illumináre → iluminar, erípere → arrancar, elóquium → palavras (D27: 17:31 follows 11:7), examináre → examinar, protéctor → protetor (slot p31), virtus → poder (kept apart from 17:2 fortitúdo → força), perfícere → aperfeiçoar (the row was tried on 17:34), statúere → firmar, docére → ensinar, protéctio → proteção, suscípere → amparar (slot susc36 in decision susceptor), déxtera → a direita, disciplína → disciplina, infirmári → enfraquecer, pérsequi → perseguir, comprehéndere → prender, convértere → voltar, confríngere → quebrar, stare → estar de pé, insúrgere in → levantar-se contra, dispérdere → exterminar, exaudíre → escutar, ante fáciem → diante da face, constitúere → estabelecer, aliénus → estranho, inveteráre → envelhecer, sémita → vereda, exaltáre → exaltar (9:33's jussive), confitéri → dar graças (D5), psállere → entoar salmos (D25, for psalmum dícere = ψαλῶ), magnificáre → engrandecer, Christus → Cristo (D19), in sǽculum → para sempre. in finem (17:36b) decided here as D27 asked: 'até o fim', not merged — see decision finem. pónere + predicate three times (17:12, 33, 35) → one verb, fazer (slots p33, p35 in decision posuit). Places where the Latin follows the Greek against the Hebrew and is followed: 17:26–27 (the Latin's 'santo … inocente … eleito … vos pervertereis', not the Hebrew's), 17:30 tentação (not a troop), 17:36a 'da vossa salvação' (the Latin's tuæ against the Greek's μου), 17:36b the disciplina (not the Hebrew's gentleness), 17:37 pegadas, 17:43 lama das ruas, 17:45–46 the Latin's tenses, 17:46 'coxearam fora das suas veredas'. Rule 3: the only vós imperative of stage two is 17:29 'iluminai' (safe)."})

(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(here / 'literal.json').write_text(json.dumps(literal, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
