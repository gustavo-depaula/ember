"""Stage two: append 9:22–9:39 to draft 4 → draft 5. Existing term decisions get new slots; new verse-local decisions are added.
python3.13 research/psalterium/ps009/append_v5.py  (reads prayed.v4.json, literal.v4.json, literal_part2.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v4.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def addSlot(decisionId, refs, formsByIndex, whyAdd):
    d = dec[decisionId]
    for i, o in enumerate(d['options']):
        o['forms'].update(formsByIndex(i, o))
    for r in refs:
        if r not in d['refs']:
            d['refs'].append(r)
    d['why'] += ' ' + whyAdd


# ---- slots added to existing decisions -------------------------------------------------------------------
addSlot('opportunitatibus', ['9:22'], lambda i, o: {'opp22': o['forms']['opportunitatibus']},
        'Second stage: 9:22 has the phrase word for word (slot opp22), filled from the same option.')
addSlot('comprehensus', ['9:23'], lambda i, o: {'comprehenduntur': {0: 'ficam presos', 1: 'são presos', 2: 'são apanhados'}[i]},
        'Second stage: 9:23 comprehendúntur (συλλαμβάνονται), the present plural of the same verb, slot comprehenduntur (the glossary row comprehéndere lists 9:23).')
addSlot('humilitatem', ['9:31'], lambda i, o: {'humil31': {0: 'humilhará', 1: 'abaterá', 2: 'humilhará'}[i]},
        'Second stage: 9:31 humiliábit eum (ταπεινώσει), the verb of the same family, slot humil31 — the glossary row sets noun and verb together.')
addSlot('exaltas', ['9:33'], lambda i, o: {'exalt33': {0: 'exalte-se', 1: 'levante-se', 2: 'erga-se'}[i]},
        'Second stage: 9:33 exaltétur manus tua (ὑψωθήτω), slot exalt33 — the pronominal form for the passive jussive, as Ps 7:7a exaltáre → exaltai-vos (glossary row Exaltáre).')


def requiret(i, o):
    label = o['label']
    if 'procurar' in label:
        return {'requiret': 'procurará'}
    if 'requerer' in label:
        return {'requiret': 'requererá'}
    if 'vingando' in label:
        return {'requiret': 'vingará'}
    return {'requiret': 'pedirá contas'}


addSlot('requirens', ['9:34'], requiret,
        'Second stage: 9:34 ends the wicked man’s words with the same verb, Non requíret (οὐκ ἐκζητήσει) — slot requiret: ‘Não pedirá contas’, the answer to 9:13 in the psalm’s own words, and exactly Douay-Rheims’ ‘He will not require it’.')

fin = dec['in_finem']
fin['options'][0]['forms']['finem32'] = 'para nunca mais ver'
fin['options'][1]['forms']['finem32'] = 'para não ver até o fim'
fin['options'].append(opt('para sempre, also in 9:32', {'finem': 'para sempre', 'finem32': 'para não ver para sempre'},
                          'The ruling applied to the letter in 9:32 too: ‘para não ver para sempre’ stacks two ‘para’ and is heard as ‘not for ever’ (a limited not-seeing).', 'draft'))
fin['refs'].append('9:32')
fin['why'] += (' Second stage: 9:32 ne vídeat in finem (slot finem32). There the negation belongs to a purpose clause, and ‘para não ver para sempre’ would be heard as a not-seeing that '
               'ends; option 0 says the Latin’s ‘so as never to see’ with ‘nunca mais’ (Matos Soares 1932 ‘para não ver jamais’) — the negation and the perpetuity in one Portuguese word, which is grammar.')

dec['in_aeternum']['refs'].append('9:37')
dec['in_aeternum']['why'] += ' Second stage: 9:37 Dóminus regnábit in ætérnum, et in sǽculum sǽculi (through decision saeculi, slot v37end).'
for o in dec['saeculi']['options']:
    o['forms']['v37end'] = o['forms']['v6end']
dec['saeculi']['refs'].append('9:37')
dec['saeculi']['why'] += ' Second stage: 9:37 has the same formula (slot v37end), filled from the same option, so the two cannot drift.'

paup = {0: ['o pobre', 'o pobre', 'o pobre', 'o pobre', 'os pobres', 'os pobres', 'o pobre', 'dos pobres'],
        1: ['o pobre', 'o pobre', 'o pobre', 'o pobre', 'os pobres', 'os pobres', 'o infeliz', 'dos pobres'],
        2: ['o oprimido', 'o oprimido', 'o oprimido', 'o oprimido', 'os oprimidos', 'os oprimidos', 'o oprimido', 'dos oprimidos']}
addSlot('pauper', ['9:23', '9:30a', '9:30b', '9:31', '9:33', '9:35b', '9:38'],
        lambda i, o: {f'pauper{k + 5}': paup[i][k] for k in range(8)},
        'Second stage: eight more slots (pauper5–12: 9:23, 9:30a, 9:30b twice, 9:31, 9:33, 9:35b, 9:38), ten places in all in the psalm, one word throughout. The Greek has πτωχός and πένης in these places; the Latin makes them one. Matos Soares 1932 varies once more (9:35b ‘o infeliz’).')
dec['pauper']['options'][1]['label'] = 'pobre / infeliz (Matos Soares 1932)'
dec['pauper']['options'][1]['note'] = 'Matos Soares 1932 varies in 9:19b (‘infelizes’) and 9:35b (‘o infeliz’); the Latin does not.'

addSlot('conspectu', ['9:26a'], lambda i, o: {'conspectu26': {0: 'à vista dele', 1: 'na presença dele', 2: 'diante dele'}[i]},
        'Second stage: 9:26a Non est Deus in conspéctu ejus (slot conspectu26): no motion, and the sense is exactly sight — God is not before his eyes (Douay-Rheims ‘before his eyes’).')

# adjútor: a new term decision over both verses (9:10 had it as plain text)
data['verses']['9:10'] = data['verses']['9:10'].replace('auxílio {opportunitatibus}', '{adj10} {opportunitatibus}')
assert '{adj10}' in data['verses']['9:10']

V = data['verses']
V.update({
    '9:22': 'Por que, Senhor, vos retirastes para longe, * {despicis} {opp22}, na tribulação?',
    '9:23': 'Enquanto o ímpio se ensoberbece, {pauper5} {incenditur}: * {comprehenduntur} {consiliis}.',
    '9:24': 'Porque o pecador é louvado nos desejos da sua alma: * e o iníquo {benedicitur}.',
    '9:25': 'O pecador {exacerbavit} o Senhor, * segundo {multitudo} da sua ira não buscará.',
    '9:26a': 'Não há Deus {conspectu26}: * os caminhos dele estão {inquinatae} em todo o tempo.',
    '9:26b': '{auferuntur}: * dominará todos os seus inimigos.',
    '9:27': 'Pois disse no seu coração: * Não serei {movebor} de geração em geração{sine_malo}.',
    '9:28': 'A sua boca está cheia de maldição, e de amargura, e de {dolo}: * {v28b}.',
    '9:29': 'Senta-se {ins29} com os ricos {occ29}: * para matar o inocente.',
    '9:30a': 'Os seus olhos {respiciunt} {pauper6}: * {ins30a} {abs30}, como um leão no seu {spelunca}.',
    '9:30b': '{ins30b} para arrebatar {pauper7}: * arrebatar {pauper8}, {attrahit}.',
    '9:31': 'No seu laço o {humil31}: * {inclinabit}, quando tiver dominado {pauper9}.',
    '9:32': 'Pois disse no seu coração: Deus se esqueceu, * desviou a sua face {finem32}.',
    '9:33': 'Levantai-vos, Senhor Deus, {exalt33} a vossa mão: * não esqueçais {pauper10}.',
    '9:34': 'Por que razão {irritavit} o ímpio a Deus? * pois disse no seu coração: Não {requiret}.',
    '9:35a': '{vides} {labor35} e a dor: * para os entregardes nas vossas mãos.',
    '9:35b': '{derelictus} {pauper11}: * vós sereis {adj35} para {pupillo35}.',
    '9:36': '{contere} o braço do pecador e {maligni}: * o pecado dele será buscado, e não será encontrado.',
    '9:37': 'O Senhor reinará {v37end}: * {peribitis}.',
    '9:38': 'O Senhor escutou o desejo {pauper12}: * {auris}.',
    '9:39': '{v39a}, * para que o homem não {apponat} a engrandecer-se sobre a terra.',
})

new = [
    {'id': 'adjutor', 'refs': ['9:10', '9:35b'], 'latin': 'adjútor', 'kind': 'glossary',
     'why': 'adjútor → auxílio (glossary, open: Ps 117:6–7, 118:114). Twice in Ps 9 (9:10 adjútor in opportunitátibus; 9:35b órphano tu eris adjútor, βοηθός both). The Latinist of stage one asked for the agent noun: minor on draft 1, MAJOR on drafts 2 and 3 with the words unchanged — the pattern D24 records at 118:114. Made a decision in stage two, when its second place came, so that both places turn together.',
     'options': [
         opt('auxílio', {'adj10': 'auxílio', 'adj35': 'auxílio'}, 'Ruling: the glossary word, the same metonymy as suscéptor → amparo (D19) and refúgium → refúgio beside it in 9:10. Held against the Latinist’s majors (stage one), as at 118:114.', 'glossary'),
         opt('auxiliador', {'adj10': 'auxiliador', 'adj35': 'auxiliador'}, 'The Latinist’s agent noun (minor, then major twice). Exact, but long and rare in Brazilian speech.', 'latinist'),
         opt('socorro', {'adj10': 'socorro', 'adj35': 'socorro'}, 'The Diurnal’s verb in 9:35b (‘Tu és o que socorre’) as a noun; plain, but it leaves the family of adjutórium → auxílio.', 'DM1962'),
     ]},
    {'id': 'despicis', 'refs': ['9:22'], 'latin': 'déspicis in opportunitátibus', 'kind': 'word',
     'why': 'despícere: ‘look down on, disregard’ (ὑπερορᾷς, ‘overlook, disdain’). The glossary row despícere (enemies) → olhar de cima was built for the victor looking down on his enemies (53:9, 117:7); said of God to the afflicted it would be heard as God watching over them from above — the reverse. No object, as in the Latin (Douay-Rheims supplies ‘us’). recédere → ‘retirar-se’ (Douay-Rheims ‘retired’); ‘afastar’ is taken by discédere and amovére.',
     'options': [
         opt('desdenhais', {'despicis': 'desdenhais'}, 'Ruling. The disregard the Greek and Latin name, plain; free in the glossary (spérnere → desprezar).', 'draft'),
         opt('desprezais', {'despicis': 'desprezais'}, 'Douay-Rheims ‘slight’; plain, but desprezar is spérnere’s and contémnere’s.', 'DRB'),
         opt('olhais de cima', {'despicis': 'olhais de cima'}, 'The glossary’s row for enemies; here heard as God’s watching over.', 'glossary'),
     ]},
    {'id': 'incenditur', 'refs': ['9:23'], 'latin': 'incénditur pauper', 'kind': 'word',
     'why': 'A passive, ‘is set on fire’ (ἐμπυρίζεται, ‘is burnt up’); Douay-Rheims ‘is set on fire’, Matos Soares 1932 ‘é abrasado’. The fire is the Latin’s image.',
     'options': [
         opt('é abrasado', {'incenditur': 'é abrasado'}, 'Ruling: Matos Soares 1932’s word, the passive kept, the fire kept.', 'MS1932'),
         opt('arde', {'incenditur': 'arde'}, 'Plainer, but active: the voice changes.', 'draft'),
         opt('é queimado', {'incenditur': 'é queimado'}, 'Plain; a burn more than a blaze.', 'draft'),
     ]},
    {'id': 'consiliis', 'refs': ['9:23'], 'latin': 'in consíliis quibus cógitant', 'kind': 'word',
     'why': 'consílium → conselho (glossary), cogitáre → pensar em (glossary). Who is caught is not said: the plural could be the proud or the poor, as in the Latin (the Greek συλλαμβάνονται is as open). Douay-Rheims ‘they are caught in the counsels which they devise’; Matos Soares 1932 inserts ‘(por fim os ímpios)’.',
     'options': [
         opt('nos conselhos em que pensam', {'consiliis': 'nos conselhos em que pensam'}, 'Ruling: both glossary words; ‘em que pensam’ is the verb’s own regency (pensar em). The subject stays unnamed.', 'glossary'),
         opt('nos conselhos que tramam', {'consiliis': 'nos conselhos que tramam'}, 'Douay-Rheims ‘devise’; livelier, another verb.', 'DRB'),
         opt('nas intrigas que urdiram', {'consiliis': 'nas intrigas que urdiram'}, 'Matos Soares 1932: another noun and tense.', 'MS1932'),
     ]},
    {'id': 'benedicitur', 'refs': ['9:24'], 'latin': 'et iníquus benedícitur', 'kind': 'glossary',
     'why': 'benedícere, men blessing a man (ἐνευλογεῖται): the glossary row (men → men, 117:26b) keeps bendizer. Douay-Rheims ‘is blessed’; Matos Soares 1932 ‘é felicitado’.',
     'options': [
         opt('é bendito', {'benedicitur': 'é bendito'}, 'Ruling: the glossary verb, the passive with its usual participle.', 'glossary'),
         opt('é abençoado', {'benedicitur': 'é abençoado'}, 'The everyday verb; the glossary keeps it for God → man, open.', 'draft'),
         opt('é felicitado', {'benedicitur': 'é felicitado'}, 'Matos Soares 1932; another verb.', 'MS1932'),
     ]},
    {'id': 'exacerbavit', 'refs': ['9:25'], 'latin': 'Exacerbávit Dóminum peccátor', 'kind': 'glossary',
     'why': 'exacerbáre (παρώξυνεν, ‘provoked’) beside irritáre (9:34 irritávit ímpius Deum, also παρώξυνεν): the Latin varies the verb for one Greek verb. The glossary row irritáre → provocar proposes exasperar for exacerbáre where the two stand together (105:32, 106:11); exacerbáre has 8 verses (grep: 9:25, 77:40, 77:41, 77:56, 104:28, 105:32, 105:43, 106:11). Douay-Rheims ‘provoked’ both times; Matos Soares 1932 ‘irritou’ both times.',
     'options': [
         opt('exasperou', {'exacerbavit': 'exasperou'}, 'Ruling, as the glossary row proposes: the Latin’s variation kept at no cost, since Portuguese has the pair.', 'glossary'),
         opt('provocou', {'exacerbavit': 'provocou'}, 'One Greek verb, one Portuguese (D15’s test) — 9:25 and 9:34 would then be the same verb.', 'DRB'),
         opt('irritou', {'exacerbavit': 'irritou'}, 'Matos Soares 1932; ‘irritar’ has sunk to ‘annoy’.', 'MS1932'),
     ]},
    {'id': 'multitudo', 'refs': ['9:25'], 'latin': 'secúndum multitúdinem iræ suæ non quæret', 'kind': 'glossary',
     'why': 'multitúdo → multidão (glossary, open: 5:7b, 5:11b; odd with a singular abstract, as the Latin is). The Greek κατὰ τὸ πλῆθος τῆς ὀργῆς αὐτοῦ. Whose wrath, and what he will not seek, the Latin leaves open (suæ is the sinner’s by grammar; non quæret has no object): Douay-Rheims supplies ‘him’, Matos Soares 1932 rewrites (‘por causa da sua grande arrogância’). The verse is left rough, as the Latin is.',
     'options': [
         opt('a multidão', {'multitudo': 'a multidão'}, 'Ruling: the glossary word.', 'glossary'),
         opt('a grandeza', {'multitudo': 'a grandeza'}, 'Plainer with an abstract; magnitúdo’s word.', 'draft'),
     ]},
    {'id': 'inquinatae', 'refs': ['9:26a'], 'latin': 'inquinátæ sunt viæ illíus', 'kind': 'word',
     'why': 'inquináre, ‘to befoul, defile’ (βεβηλοῦνται, ‘are profaned’); Douay-Rheims ‘are filthy’; Matos Soares 1932 ‘viciosos’.',
     'options': [
         opt('manchados', {'inquinatae': 'manchados'}, 'Ruling: the concrete stain (rule 5), plain.', 'draft'),
         opt('contaminados', {'inquinatae': 'contaminados'}, 'Defilement; clinical today.', 'draft'),
         opt('sujos', {'inquinatae': 'sujos'}, 'Douay-Rheims ‘filthy’; too low.', 'DRB'),
     ]},
    {'id': 'auferuntur', 'refs': ['9:26b'], 'latin': 'Auferúntur judícia tua a fácie ejus', 'kind': 'word',
     'why': 'auférre → tirar (glossary, row amputáre); a fácie → da face de (glossary, 1:4). The present passive kept. judícia → juízos (D15). The sudden ‘tua’ — the psalmist turns to God in the middle of the portrait — is the Latin’s.',
     'options': [
         opt('Os vossos juízos são tirados da face dele', {'auferuntur': 'Os vossos juízos são tirados da face dele'}, 'Ruling: the subject first (order, D2), every word the Latin’s.', 'draft'),
         opt('São tirados os vossos juízos da face dele', {'auferuntur': 'São tirados os vossos juízos da face dele'}, 'The Latin’s order.', 'draft'),
         opt('Os vossos juízos são afastados de diante dele', {'auferuntur': 'Os vossos juízos são afastados de diante dele'}, 'Douay-Rheims ‘removed from his sight’, Matos Soares 1932 ‘afastou-os de diante da sua vista’: another verb, the face lost.', 'MS1932'),
     ]},
    {'id': 'movebor', 'refs': ['9:27'], 'latin': 'Non movébor', 'kind': 'word',
     'why': 'movéri (σαλευθῶ, ‘be shaken’). Douay-Rheims ‘I shall not be moved’; Matos Soares 1932 ‘Não serei abalado’. The same ‘Non movébor’ is said by the psalmist himself in 29:7 (in abundántia mea) and 61:3 (grep): the words should match there.',
     'options': [
         opt('abalado', {'movebor': 'abalado'}, 'Ruling: Matos Soares 1932; the Greek’s shaking; the plain Portuguese for a man who thinks himself secure (and for 29:7, 61:3).', 'MS1932'),
         opt('movido', {'movebor': 'movido'}, 'The cognate; in Portuguese ‘ser movido’ is first ‘to be moved (by feeling)’.', 'DRB'),
     ]},
    {'id': 'sine_malo', 'refs': ['9:27'], 'latin': 'sine malo', 'kind': 'ambiguity',
     'why': 'ἄνευ κακοῦ: ‘without harm’ (no misfortune will touch me) or ‘without evil’. The Latin is bare and loose in the sentence; Douay-Rheims supplies ‘and shall be without evil’, Matos Soares 1932 ‘livre do infortúnio’.',
     'options': [
         opt('sem mal', {'sine_malo': ', sem mal'}, 'Ruling: bare, open between harm and wickedness, loose as in the Latin.', 'draft'),
         opt('sem mal algum', {'sine_malo': ', sem mal algum'}, 'Smoother; ‘algum’ supplied.', 'draft'),
         opt('e estarei sem mal', {'sine_malo': ', e estarei sem mal'}, 'Douay-Rheims’ verb supplied.', 'DRB'),
         opt('livre do infortúnio', {'sine_malo': ', livre do infortúnio'}, 'Matos Soares 1932: closes the ambiguity on misfortune.', 'MS1932'),
     ]},
    {'id': 'dolo', 'refs': ['9:28'], 'latin': 'et dolo', 'kind': 'glossary',
     'why': 'dolus → engano (glossary, open; 5:7b, 5:11a). Douay-Rheims ‘deceit’; Matos Soares 1932 ‘dolo’ (the cognate is criminal law in Brazil). Cujus maledictióne os plenum est: the relative pronoun is made a possessive (‘A sua boca’), as Matos Soares 1932 does; the Latin’s polysyndeton (et … et) kept.',
     'options': [
         opt('engano', {'dolo': 'engano'}, 'Ruling: the glossary word.', 'glossary'),
         opt('dolo', {'dolo': 'dolo'}, 'Matos Soares 1932; a legal term.', 'MS1932'),
         opt('fraude', {'dolo': 'fraude'}, 'The CNBB (from the Hebrew); another word.', 'draft'),
     ]},
    {'id': 'labor', 'refs': ['9:28', '9:35a'], 'latin': 'labor et dolor · labórem et dolórem', 'kind': 'word',
     'why': 'The pair returns (κόπος καὶ πόνος in 9:28; πόνον καὶ θυμόν in 9:35a, where the Latin keeps its own pair): the Latin repeats it, and so must the Portuguese. dolor → dor (glossary). labor (κόπος, toil that wears out) — Douay-Rheims ‘labour’; in Brazil ‘trabalho’ is first a job. 89:10 labor et dolor will want the same. The glossary row laboráre → cansar-se (6:7) is the verb’s family.',
     'options': [
         opt('fadiga', {'labor28': 'fadiga', 'labor35': 'a fadiga'}, 'Ruling: toil and its weariness in one plain word; it rhymes with nothing near.', 'draft'),
         opt('trabalho', {'labor28': 'trabalho', 'labor35': 'o trabalho'}, 'Douay-Rheims and Matos Soares 1932 (in 9:35a); heard as a job.', 'DRB'),
         opt('cansaço', {'labor28': 'cansaço', 'labor35': 'o cansaço'}, 'The family of laboráre → cansar-se; the state rather than the toil.', 'glossary'),
     ]},
    {'id': 'v28b', 'refs': ['9:28'], 'latin': 'sub lingua ejus labor et dolor', 'kind': 'grammar',
     'why': 'The Latin colon has no verb. The brief lets a copula be supplied; Matos Soares 1932 supplies ‘estão’. sub → ‘debaixo de’, the living preposition (glossary row subjícere).',
     'options': [
         opt('debaixo da sua língua, fadiga e dor', {'v28b': 'debaixo da sua língua, {labor28} e dor'}, 'Ruling: verbless, as the Latin, like Ps 3:9’s second colon; the comma carries it.', 'draft'),
         opt('debaixo da sua língua estão a fadiga e a dor', {'v28b': 'debaixo da sua língua estão {labor35} e a dor'}, 'Matos Soares 1932’s copula.', 'MS1932'),
     ]},
    {'id': 'insidiae', 'refs': ['9:29', '9:30a', '9:30b'], 'latin': 'in insídiis · insidiátur · Insidiátur', 'kind': 'word',
     'why': 'insídiæ and insidiári three times in two verses (ἐνέδρα, ἐνεδρεύει twice): one family in the Latin, one in the Portuguese. Matos Soares 1932 ‘de emboscada … arma ciladas … arma ciladas’; the Diurnal ‘espreitam’.',
     'options': [
         opt('emboscada', {'ins29': 'de emboscada', 'ins30a': 'fica de emboscada', 'ins30b': 'Fica de emboscada'}, 'Ruling: the noun and the verb heard as one family, three times, and the lion lying in wait is concrete.', 'MS1932'),
         opt('ciladas', {'ins29': 'em ciladas', 'ins30a': 'arma ciladas', 'ins30b': 'Arma ciladas'}, 'Matos Soares 1932’s verb; ‘senta-se em ciladas’ is odd.', 'MS1932'),
         opt('espreita', {'ins29': 'à espreita', 'ins30a': 'espreita', 'ins30b': 'Espreita'}, 'The Diurnal’s verb; natural, a little weaker than an ambush.', 'DM1962'),
     ]},
    {'id': 'occultis', 'refs': ['9:29', '9:30a'], 'latin': 'in occúltis · in abscóndito', 'kind': 'word',
     'why': 'The Greek has one word twice (ἐν ἀποκρύφοις / ἐν ἀποκρύφῳ); the Latin varies (occúlta, abscónditum). Portuguese has a plain pair, so the Latin’s variation is kept at no cost (as serváre / custodíre in 118:167–168). The plural of 9:29 kept. cum divítibus is the Latin’s and the Greek’s reading (not the Hebrew’s villages).',
     'options': [
         opt('em lugares ocultos / às escondidas', {'occ29': 'em lugares ocultos', 'abs30': 'às escondidas'}, 'Ruling: two phrases for two Latin words; Matos Soares 1932 has ‘em lugares ocultos’.', 'MS1932'),
         opt('em segredo / em segredo', {'occ29': 'em segredo', 'abs30': 'em segredo'}, 'One phrase for the Greek’s one word.', 'draft'),
     ]},
    {'id': 'respiciunt', 'refs': ['9:30a'], 'latin': 'Óculi ejus in páuperem respíciunt', 'kind': 'glossary',
     'why': 'The same colon is Ps 10:5b word for word, translated by the Ps 10 agent as ‘Os seus olhos estão voltados para o pobre’ (the stylist there refused ‘olhos olham’ as a jingle the Latin does not have). Copied, so that identical Latin gets identical Portuguese.',
     'options': [
         opt('estão voltados para', {'respiciunt': 'estão voltados para'}, 'Ruling: Ps 10:5b’s wording.', 'glossary'),
         opt('olham para', {'respiciunt': 'olham para'}, 'Matos Soares 1932 (in 10:5b); ‘olhos olham’.', 'MS1932'),
     ]},
    {'id': 'spelunca', 'refs': ['9:30a'], 'latin': 'quasi leo in spelúnca sua', 'kind': 'word',
     'why': 'spelúnca: ‘cave, den’ (μάνδρα, ‘fold, lair’); Douay-Rheims ‘den’, Matos Soares 1932 ‘cova’ (lacus’s word in the glossary), the Diurnal ‘toca’.',
     'options': [
         opt('covil', {'spelunca': 'covil'}, 'Ruling: a beast’s den, plain, free.', 'DRB'),
         opt('caverna', {'spelunca': 'caverna'}, 'The cave, a proparoxytone-free but less animal word.', 'draft'),
         opt('toca', {'spelunca': 'toca'}, 'The Diurnal; a burrow more than a lion’s den.', 'DM1962'),
     ]},
    {'id': 'attrahit', 'refs': ['9:30b'], 'latin': 'dum áttrahit eum', 'kind': 'word',
     'why': 'attráhere: ‘draw to oneself’ (ἐν τῷ ἑλκύσαι αὐτόν); Douay-Rheims ‘whilst he draweth him to him’, Matos Soares 1932 ‘atraindo-o a si’. The doubled ‘rápere páuperem’ is the Latin’s and stays.',
     'options': [
         opt('enquanto o atrai', {'attrahit': 'enquanto o atrai'}, 'Ruling: the cognate, which in Portuguese says the luring as well as the drawing.', 'MS1932'),
         opt('enquanto o arrasta', {'attrahit': 'enquanto o arrasta'}, 'The physical drag; says ‘away’ rather than ‘to himself’.', 'draft'),
         opt('atraindo-o a si', {'attrahit': 'atraindo-o a si'}, 'Matos Soares 1932 with the reflexive.', 'MS1932'),
     ]},
    {'id': 'inclinabit', 'refs': ['9:31'], 'latin': 'inclinábit se, et cadet', 'kind': 'ambiguity',
     'why': 'κύψει καὶ πεσεῖται: he will stoop and fall — the lion crouching to spring on the poor, or the wicked man bowing and falling in defeat; the Latin does not say which. Matos Soares 1932 decides (‘se deixará cair sobre os pobres’). cum dominátus fúerit páuperum → ‘quando tiver dominado os pobres’ (the future perfect kept).',
     'options': [
         opt('ele se inclinará, e cairá', {'inclinabit': 'ele se inclinará, e cairá'}, 'Ruling: the hidden subject named as ‘ele’ (D2), open as the Latin.', 'draft'),
         opt('inclinar-se-á, e cairá', {'inclinabit': 'inclinar-se-á, e cairá'}, 'Mesóclise; no subject needed.', 'MS1932'),
         opt('ele se agachará, e cairá', {'inclinabit': 'ele se agachará, e cairá'}, 'The crouch made explicit — closes the reading of defeat.', 'draft'),
     ]},
    {'id': 'irritavit', 'refs': ['9:34'], 'latin': 'Propter quid irritávit ímpius Deum?', 'kind': 'glossary',
     'why': 'irritáre → provocar (glossary, open; the row lists 9:34). Propter quid → ‘Por que razão’, kept apart from 9:22 Ut quid → ‘Por que’: the Latin varies and Portuguese has the pair.',
     'options': [
         opt('provocou', {'irritavit': 'provocou'}, 'Ruling: the glossary word (Douay-Rheims ‘provoked’).', 'glossary'),
         opt('irritou', {'irritavit': 'irritou'}, 'Matos Soares 1932; weakened to ‘annoyed’.', 'MS1932'),
     ]},
    {'id': 'vides', 'refs': ['9:35a'], 'latin': 'Vides quóniam tu labórem et dolórem consíderas', 'kind': 'ambiguity',
     'why': 'βλέπεις ὅτι σὺ … κατανοεῖς. Douay-Rheims ‘Thou seest it, for thou considerest’ (quóniam causal, an object supplied); ‘You see that you consider’ is grammatically possible and says little. The emphatic tu kept. consideráre → considerar (glossary).',
     'options': [
         opt('Vós vedes, porque vós considerais', {'vides': 'Vós vedes, porque vós considerais'}, 'Ruling: quóniam causal (Douay-Rheims), no object supplied; ‘vedes’ is the indicative (the imperative is ‘vede’).', 'DRB'),
         opt('Vós o vedes, porque vós considerais', {'vides': 'Vós o vedes, porque vós considerais'}, 'Douay-Rheims’ ‘it’ supplied.', 'DRB'),
         opt('Vós vedes que vós considerais', {'vides': 'Vós vedes que vós considerais'}, 'quóniam as ‘that’.', 'draft'),
     ]},
    {'id': 'derelictus', 'refs': ['9:35b'], 'latin': 'Tibi derelíctus est pauper', 'kind': 'word',
     'why': 'derelínquere → abandonar (glossary; 9:11 ‘não abandonastes’). Here the poor man is left, abandoned to God (ἐγκαταλέλειπται): the same verb, now with God as the one he is left to. Matos Soares 1932 ‘A ti se abandona o infeliz’ (reflexive: he entrusts himself).',
     'options': [
         opt('A vós foi abandonado', {'derelictus': 'A vós foi abandonado'}, 'Ruling: the Latin’s verb and voice, echoing 9:11.', 'draft'),
         opt('A vós se abandona', {'derelictus': 'A vós se abandona'}, 'Matos Soares 1932: the pious sense of ‘abandonar-se a’, but a change of voice and tense.', 'MS1932'),
         opt('A vós foi deixado', {'derelictus': 'A vós foi deixado'}, 'Plainer; loses the echo of 9:11.', 'draft'),
     ]},
    {'id': 'pupillus', 'refs': ['9:35b', '9:39'], 'latin': 'órphano · pupíllo', 'kind': 'word',
     'why': 'The Latin varies the word for the orphan (órphanus 9:35b, pupíllus 9:39) where the Greek has ὀρφανός both times — D15’s test says one Portuguese word. By grep: pupíllus 5 verses (9:39, 81:3, 93:6, 108:12, 145:9 — 16:8a pupíllam óculi is another word, the eye’s pupil), órphanus 3 (9:35b, 67:5b, 108:9): whoever meets them should keep one word.',
     'options': [
         opt('órfão / órfão', {'pupillo35': 'o órfão', 'pup39': 'órfão'}, 'Ruling: one word, as the Greek (Douay-Rheims ‘orphan … fatherless’ varies; Matos Soares 1932 ‘órfão’ both).', 'MS1932'),
         opt('órfão / pupilo', {'pupillo35': 'o órfão', 'pup39': 'pupilo'}, 'The Latin’s variation; ‘pupilo’ is a ward or protégé in Brazil.', 'draft'),
     ]},
    {'id': 'contere', 'refs': ['9:36'], 'latin': 'Cóntere brácchium peccatóris', 'kind': 'glossary',
     'why': 'contérere → quebrar (glossary, open; 3:8). Safe at the vós imperative (past quebrei). Douay-Rheims ‘Break’, Matos Soares 1932 ‘Quebra’; the Diurnal ‘Quebra, esmaga’.',
     'options': [
         opt('Quebrai', {'contere': 'Quebrai'}, 'Ruling: the glossary verb.', 'glossary'),
         opt('Esmagai', {'contere': 'Esmagai'}, 'The Diurnal; the con- heard as crushing.', 'DM1962'),
     ]},
    {'id': 'maligni', 'refs': ['9:36'], 'latin': 'et malígni', 'kind': 'glossary',
     'why': 'malígnus → malvado (settled, D24; the row names 9:36): ‘o maligno’ was heard as the devil in Ps 5:6.',
     'options': [
         opt('do malvado', {'maligni': 'do malvado'}, 'Ruling: D24.', 'glossary'),
         opt('do maligno', {'maligni': 'do maligno'}, 'The cognate (Douay-Rheims ‘malignant’); heard as the devil.', 'DRB'),
         opt('do mau', {'maligni': 'do mau'}, 'Matos Soares 1932; malus’s word.', 'MS1932'),
     ]},
    {'id': 'peribitis', 'refs': ['9:37'], 'latin': 'períbitis, gentes, de terra illíus', 'kind': 'grammar',
     'why': 'ἀπολεῖσθε ἔθνη ἐκ τῆς γῆς αὐτοῦ: ‘you shall perish out of his land’. períre → perecer (glossary). D20 found at 2:12 that ‘perecer de’ names the cause of death (‘perecer de fome’) and ruled ‘fora de’ for de via. The vocative plural is vós (plural humans).',
     'options': [
         opt('perecereis, nações, fora da terra dele', {'peribitis': 'perecereis, nações, fora da terra dele'}, 'Ruling: D20’s preposition, Matos Soares 1932’s at 2:12.', 'glossary'),
         opt('perecereis, nações, da terra dele', {'peribitis': 'perecereis, nações, da terra dele'}, 'The calque; ‘perish of his land’.', 'draft'),
         opt('sereis exterminadas, nações, da terra dele', {'peribitis': 'sereis exterminadas, nações, da terra dele'}, 'Matos Soares 1932; dispérdere’s word.', 'MS1932'),
     ]},
    {'id': 'auris', 'refs': ['9:38'], 'latin': 'præparatiónem cordis eórum audívit auris tua', 'kind': 'word',
     'why': 'audíre → ouvir (D3), auris → ouvido: in Portuguese noun and verb are one root (‘o vosso ouvido ouviu’), which in the Latin they are not (auris / audívit; the Greek προσέσχεν τὸ οὖς σου, ‘your ear attended’). præparátio cordis (ἑτοιμασία τῆς καρδίας): Douay-Rheims ‘the preparation of their heart’; Matos Soares 1932 ‘a prece do seu coração’ (interprets). The turn from ‘the Lord’ to ‘your ear’ is the Latin’s.',
     'options': [
         opt('o vosso ouvido ouviu a preparação do coração deles', {'auris': 'o vosso ouvido ouviu a preparação do coração deles'}, 'Ruling: every word the Latin’s; the jingle is the cost of D3 and the plain noun.', 'draft'),
         opt('a preparação do coração deles, ouviu-a o vosso ouvido', {'auris': 'a preparação do coração deles, ouviu-a o vosso ouvido'}, 'The Latin’s order, with a resumptive pronoun; the two words apart.', 'draft'),
         opt('o vosso ouvido atendeu à prece do coração deles', {'auris': 'o vosso ouvido atendeu à prece do coração deles'}, 'Matos Soares 1932: two words changed (atender is inténdere’s; prece is deprecátio’s).', 'MS1932'),
     ]},
    {'id': 'v39a', 'refs': ['9:39'], 'latin': 'Judicáre pupíllo et húmili', 'kind': 'grammar',
     'why': 'An infinitive of purpose with datives (κρῖναι ὀρφανῷ καὶ ταπεινῷ): ‘to judge for the orphan’ — to do him justice. judicáre → julgar (glossary). húmilis → humilde (the set proposed with pauper). Douay-Rheims ‘To judge for the fatherless’; Matos Soares 1932 ‘para fazeres justiça ao órfão’.',
     'options': [
         opt('Para julgar em favor do órfão e do humilde', {'v39a': 'Para julgar em favor do {pup39} e do humilde'}, 'Ruling: the verb kept; ‘em favor de’ says the dative of advantage (Douay-Rheims ‘for’).', 'DRB'),
         opt('Para fazer justiça ao órfão e ao humilde', {'v39a': 'Para fazer justiça ao {pup39} e ao humilde'}, 'Matos Soares 1932: the datives kept, the verb unpacked (and justítia’s word spent).', 'MS1932'),
         opt('Para julgar o órfão e o humilde', {'v39a': 'Para julgar o {pup39} e o humilde'}, 'The datives lost: heard as passing judgment on them.', 'draft'),
     ]},
    {'id': 'apponat', 'refs': ['9:39'], 'latin': 'ut non appónat ultra magnificáre se homo super terram', 'kind': 'word',
     'why': 'appónere + infinitive, ‘add to doing’, i.e. do again (μὴ προσθῇ ἔτι τοῦ μεγαλαυχεῖν). magnificáre → engrandecer (glossary). Douay-Rheims ‘may no more presume to magnify himself’; Matos Soares 1932 ‘cesse de se engrandecer’.',
     'options': [
         opt('volte mais', {'apponat': 'volte mais'}, 'Ruling: ‘não volte mais a’ — the Portuguese idiom for doing again, with ultra as ‘mais’.', 'draft'),
         opt('continue mais', {'apponat': 'continue mais'}, 'Closer to ‘add’, less natural.', 'draft'),
     ]},
]
data['decisions'].extend(new)

data['choices'].update({
    '9:22': 'The second stage begins here, where Hebrew Ps 10 begins. Ut quid → ‘Por que’ (9:34 Propter quid → ‘Por que razão’). recédere longe → ‘retirar-se para longe’ (Douay-Rheims ‘retired afar off’). The Latin’s one question runs across both cola, with no ‘and’ between the verbs: kept.',
    '9:23': 'supérbire → ensoberbecer-se (Matos Soares 1932). Who is caught (comprehendúntur) is not said: kept open.',
    '9:24': 'laudáre → louvar; desidérium → desejo; ánima → alma; iníquus → iníquo (glossary, kept apart from ímpius and peccátor).',
    '9:25': 'The verse is rough in the Latin (whose wrath; seek whom): left rough. non quæret (οὐκ ἐκζητήσει) → ‘não buscará’, quǽrere → buscar (glossary), kept apart from 9:34 requíret.',
    '9:26a': '‘Não há Deus’ for Non est Deus (Matos Soares 1932 ‘Diante dele não há Deus’): the existential sense, as the Latin allows. illíus → ‘dele’. in omni témpore → ‘em todo o tempo’.',
    '9:26b': 'dominári + genitive → ‘dominar’ with a direct object (9:31 again).',
    '9:27': 'Dixit enim in corde suo → ‘Pois disse no seu coração’ (9:32, 9:34 the same). The words he says begin with a capital, as DO prints them; no quotation marks are added (as Ps 2:3). a generatióne in generatiónem → ‘de geração em geração’ (glossary formula).',
    '9:28': 'maledíctio → maldição; amaritúdo → amargura.',
    '9:29': 'interfícere → matar; ínnocens → inocente. ‘para matar’ for ut interfíciat (the subject is the same).',
    '9:30b': 'rápere → arrebatar (glossary), twice, as the Latin.',
    '9:31': 'láqueus → laço (glossary). The Greek ταπεινώσει is humbling, the Latin humiliábit the same.',
    '9:32': 'Oblítus est Deus → ‘Deus se esqueceu’ (the absolute use; Matos Soares 1932 ‘Deus esqueceu-se’). avértere → desviar (glossary, open; ‘can serve avérte fáciem tuam’). The face is God’s (suam, in the wicked man’s words).',
    '9:33': '‘Exsúrge, Dómine’ → ‘Levantai-vos, Senhor’ (glossary formula; 9:20). oblivísci + genitive → ‘esquecer’ with a direct object (glossary; 9:13 ‘não esqueceu o clamor’): ‘não esqueçais os pobres’.',
    '9:34': 'Non requíret → ‘Não pedirá contas’: 9:13’s verb (decision requirens), the question the psalm raised answered in its own words.',
    '9:35a': 'trádere → entregar (glossary); ‘para os entregardes’ for ut tradas eos: the personal infinitive; eos left as open as the Latin (labour and sorrow, or the wicked).',
    '9:35b': 'tu eris → ‘vós sereis’, the emphatic pronoun kept; the dative órphano → ‘para o órfão’, the build of 9:10 (‘refúgio para o pobre’).',
    '9:36': 'quǽrere → buscar; inveníre → encontrar; the two futures passive kept.',
    '9:37': 'regnáre → reinar. The formula of 9:6 (decision saeculi) returns whole.',
    '9:38': 'exaudíre → escutar (D3), audíre → ouvir (D3), one verse, two verbs, as the Latin.',
    '9:39': 'magnificáre se → ‘engrandecer-se’ (glossary magnificáre); super terram → ‘sobre a terra’. The psalm ends on ‘terra’, as the Latin on terram.',
})

data['range'] = '9:2–9:39'
data['version'] = 5
data['status'] = 'draft'
data['audit'].append({'step': 'draft', 'note': 'Stage two (9:22–9:39, Hebrew Ps 10), appended as draft 5 (append_v5.py; draft 4 kept as prayed.v4.json, literal.v4.json). Latin followed where it is rough and the Hebrew family smooth: 9:25 (whose wrath, seek whom), 9:26a ‘Não há Deus’, 9:27 sine malo, 9:29 cum divítibus (not villages), 9:31 open between crouching and falling, 9:35a Vides quóniam, 9:38 præparatiónem. Repeats found with ps005/grep_latin.py: 9:22b = 9:10b; 9:30a first colon = 10:5b (copied from the Ps 10 agent’s draft); 9:27 = 9:32 = 9:34 Dixit enim in corde suo; 9:37 = 9:6 the doxology formula; labor et dolor 9:28 = 9:35a (and 89:10). Slots added to existing term decisions rather than new ones: opportunitatibus (9:22), comprehensus (9:23), humilitatem (9:31), exaltas (9:33), requirens (9:34 ‘Não pedirá contas’), in_finem (9:32), in_aeternum and saeculi (9:37), pauper (eight slots), conspectu (9:26a); adjútor became a decision over 9:10 and 9:35b. Rule 3 checked at every vós imperative: Levantai-vos, Quebrai — safe (no new -ir imperative). Glossary applied: D3, D20 (‘fora da terra dele’), D24 (malvado), irritáre → provocar, dolus → engano, multitúdo → multidão, contérere → quebrar, derelínquere → abandonar, rápere → arrebatar. Proposed: exacerbáre → exasperar, insídiæ / insidiári → emboscada, labor → fadiga, órphanus = pupíllus → órfão, despícere (said of God) → desdenhar.'})

(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

lit = json.loads((here / 'literal.v4.json').read_text(encoding='utf-8'))
lit['verses'].update(json.loads((here / 'literal_part2.json').read_text(encoding='utf-8')))
lit['range'] = '9:2–9:39'
(here / 'literal.json').write_text(json.dumps(lit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 5 written:', len(data['verses']), 'verses,', len(data['decisions']), 'decisions')
