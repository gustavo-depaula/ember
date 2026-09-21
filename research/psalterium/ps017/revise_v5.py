"""Stage two, draft 4 → draft 5 after the three blind readers of the new portion (critic/v4.*.part2.json).
python3.13 research/psalterium/ps017/revise_v5.py   (reads prayed.v4.json, writes prayed.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v4.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source='draft'):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def new(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    dec[id] = d


def setVerse(verseId, old, newText):
    assert old in V[verseId], (verseId, old, V[verseId])
    V[verseId] = V[verseId].replace(old, newText)


def promote(decisionId, index, why):
    d = dec[decisionId]
    d['options'].insert(0, d['options'].pop(index))
    d['why'] += ' ' + why


# 17:34 státuens: the Latinist's gerund
s = dec['statuens']
s['options'].insert(0, opt('me firmando', {'statuens': 'me firmando'}, 'Ruling from draft 5, the Latinist\'s fix (minor): the Latin\'s present participle kept as a gerund after the perfect "aperfeiçoou", as the Latin sets perfécit beside státuens; the row\'s verb (statúere → firmar).', 'latinist'))
s['options'][1]['label'] = 'me firma'
s['options'][1]['note'] = 'Draft 4: a finite present; the Latinist (minor) — it regularises the Latin\'s participle.'
s['why'] += ' Draft 5: the gerund, at the Latinist\'s request.'

# 17:34 cervórum: heard as "servos"
setVerse('17:34', 'como os dos cervos', 'como os {cervorum}')
new('cervorum', ['17:34'], 'tamquam cervórum', 'word',
    'cervus: the hart. The blind reader heard "os meus pés como os dos cervos" as "the feet of SERVANTS" — cervo and servo sound alike in Brazil, and "servos" is the likelier word in church. The other places (28:9 cervos, 41:2 cervus ad fontes aquárum, 103:17 cervis) have the animal\'s context around them; here nothing but "pés" follows.',
    [opt('das corças', {'cervorum': 'das corças'}, 'Ruling from draft 5: the same animal, the female; no homophone; the Latin\'s plural kept. Cost: the gender (cervórum is masculine) — a hind for a hart.'),
     opt('dos cervos', {'cervorum': 'dos cervos'}, 'Draft 4: the Latin\'s word; heard by the blind reader as "servos".'),
     opt('dos veados', {'cervorum': 'dos veados'}, 'Matos Soares 1932\'s word, the everyday Brazilian name of the animal; in Brazil "veado" is also a slur, which in choir would be heard.', 'MS1932')])

# 17:33 "tornou imaculado" (stylist)
p = dec['posuit']
p['options'][0]['forms']['p33'] = 'tornou imaculado o meu caminho'
p['options'][2]['forms']['p33'] = 'tornou imaculado o meu caminho'
p['options'].append(opt('fez … fez imaculado … fizestes', {'posuit': 'fez das trevas o seu esconderijo', 'p33': 'fez imaculado o meu caminho', 'p35': 'fizestes os meus braços como um arco de bronze'}, 'Draft 4: one verb, fazer, all three times; the stylist heard "fez imaculado o meu caminho" as a calque (Portuguese says "tornar" + adjective).'))
p['why'] += ' Draft 5: pónere is said with the verb each build takes in Portuguese — "fazer de" (17:12), "tornar" + adjective (17:33, the stylist\'s: "fez imaculado" was heard as a calque), "fazer … como" (17:35). The Latin\'s one verb is neither of them; draft 4\'s one-verb version is the last option.'

# 17:36b "a vossa própria disciplina" (stylist)
setVerse('17:36b', '* e a vossa disciplina, ela mesma, me ensinará.', '* e {ipsa} me ensinará.')
new('ipsa', ['17:36b'], 'et disciplína tua ipsa me docébit', 'order',
    'ipsa marks the repeated subject: "and your discipline — it — will teach me". The repetition of disciplína tua is kept either way.',
    [opt('a vossa própria disciplina', {'ipsa': 'a vossa própria disciplina'}, 'Ruling from draft 5, the stylist: "ela mesma" between two pauses broke the colon and sounded explanatory; "própria" is how Portuguese says ipsa with a noun.', 'stylist'),
     opt('a vossa disciplina, ela mesma,', {'ipsa': 'a vossa disciplina, ela mesma,'}, 'Draft 4: the pronoun set off, as the Latin\'s ipsa after the noun.'),
     opt('essa vossa mesma disciplina', {'ipsa': 'essa vossa mesma disciplina'}, 'Matos Soares 1932 ("essa tua mesma disciplina"); heavier.', 'MS1932')])

# subtus → sob, three times (and 17:48 sub me), stylist's order in 17:40
setVerse('17:37', 'os meus passos debaixo de mim', 'os meus passos {sub37}')
setVerse('17:39', 'cairão debaixo dos meus pés', 'cairão {sub39}')
setVerse('17:40', 'e {supplantasti} debaixo de mim os que se levantavam contra mim.', 'e {supplantasti} {sub40} os que contra mim se levantavam.')
setVerse('17:48', 'Deus, que me dais as vinganças, e sujeitais os povos debaixo de mim,', 'Deus, que me dais vinganças e sujeitais os povos {sub48},')
new('subtus', ['17:37', '17:39', '17:40', '17:48'], 'subtus me (17:37, 17:40) · subtus pedes meos (17:39) · sub me (17:48)', 'word',
    'The Latin says subtus three times in four verses (the steps widened under me, the enemies fall under my feet, those who rose against me thrown down under me), and sub me in 17:48 (the peoples subjected under me). One Portuguese preposition throughout keeps the thread.',
    [opt('sob', {'sub37': 'sob mim', 'sub39': 'sob os meus pés', 'sub40': 'sob mim', 'sub48': 'sob mim'}, 'Ruling from draft 5: the stylist asked for "sob mim" in 17:40 (the colon was heavy and "debaixo de mim" delayed the object) and in 17:48; taken in all four places so that the repetition stays one word. 17:10 sub pédibus ejus already has "sob os seus pés".', 'stylist'),
     opt('debaixo de', {'sub37': 'debaixo de mim', 'sub39': 'debaixo dos meus pés', 'sub40': 'debaixo de mim', 'sub48': 'debaixo de mim'}, 'Draft 4: the plainer preposition in speech, and 8:8\'s "debaixo dos seus pés"; one syllable or two longer each time.')])

# 17:34 / 17:35 stylist remarks refused → options
dec['perfecit']['options'].append(opt('tornou perfeitos', {'perfecit': 'tornou perfeitos'}, 'The stylist (draft 4): "aperfeiçoou os" is a run of vowels hard to say daily. Refused: the glossary row, and "tornou" would come twice in two verses (17:33).', 'stylist'))
setVerse('17:35', 'Que ensina as minhas mãos', 'Que {docet} as minhas mãos')
new('docet', ['17:35'], 'Qui docet manus meas ad prǽlium', 'glossary',
    'docére → ensinar (glossary). The psalm says it twice, one verse apart: docet (17:35) and docébit (17:36b, "me ensinará") — the hands taught for battle, the man taught by discipline.',
    [opt('ensina', {'docet': 'ensina'}, 'Ruling: the glossary verb, which keeps the echo with 17:36b.', 'glossary'),
     opt('instrui', {'docet': 'instrui'}, 'The stylist (draft 4): "ensinar as mãos para" leaves the ear waiting for another construction. Refused: it breaks the echo, and instruir is erudíre\'s (2:10).', 'stylist'),
     opt('adestra', {'docet': 'adestra'}, 'Matos Soares 1932 ("que adestra as minhas mãos para a peleja"): the idiom for training hands, another verb.', 'MS1932')])

# 17:41 worst line (stylist)
d = dec['dorsum']
d['options'].insert(0, opt('E me destes as costas dos meus inimigos', {'dorsum': 'E me destes as costas dos meus inimigos'}, 'Ruling from draft 5, the stylist\'s (his worst line on draft 4): every word of the Latin kept — dedísti, mihi, inimícos, dorsum — with the double accusative turned into a genitive (grammar, D2); "you gave me my enemies\' backs" is heard at once as their flight.', 'stylist'))
d['options'][1]['note'] = 'Draft 4: the double accusative kept as "de costas"; the stylist heard "dar alguém de costas" as a body\'s position, and the blind reader could not tell whether they fled or surrendered.'
d['why'] += ' Draft 5: the stylist\'s wording.'

# 17:44 contradições heard as inconsistency
promote('contradictio', 1, 'Draft 5: the blind reader heard "as contradições do povo" FIRST as the people\'s inconsistencies or internal disagreements, "not evidently directed against the speaker" — the fault draft 4 feared. → "contendas" (strife, disputes), which the psalter does not need for another word (no contentio in the psalms, grep).')
dec['contradictio']['options'][0]['note'] = 'Ruling from draft 5: the sense of ἀντιλογία (gainsaying, strife) in a plain word; the cognate is kept as the option, and for 80:8 / 105:32 aquam contradictiónis, a proper name, it may stay.'

# 17:46 mancaram (stylist + blind reader)
promote('claudicaverunt', 1, 'Draft 5: "coxearam" was listed as unknown by the blind reader and called uncurrent by the stylist, who asked for "mancaram" → taken.')
dec['claudicaverunt']['options'][0]['from'] = 'stylist'
dec['claudicaverunt']['options'][0]['note'] = 'Ruling from draft 5: the everyday Brazilian verb for limping; plain rather than colloquial in a verse of image.'

data['version'] = 5
data['audit'] += [
    {'step': 'checks', 'note': "Draft 4, whole psalm, the ordinary checks.py: exit 0 (hard pass: 54 ids, marks). Mended before the critics: 17:46 'mentiram-me' (proparoxytone at the mediant) → 'me mentiram'. Soft flags accepted in stage two: 17:40 second colon +6 (the two phrases subtus me and insurgéntes in me), 17:44 second colon +5 ('e' supplied, 'como cabeça'), 17:31 last colon +4 ('ele é' supplied), 17:49 +4, 17:35, 17:36b, 17:38, 17:39, 17:43, 17:48 +3; 17:28 −3, 17:50 −4 (Latin polysyllables). Rhymes: none new."},
    {'step': 'latinist', 'file': 'critic/v4.latinist.part2.json', 'note': 'Stage two, draft 4, the new verses only (part2/, 17:26–17:51). One verse, minor: 17:34 the participle státuens made finite — taken. Everything else passes, including the readings the draft thought hardest: "vos pervertereis" (17:27), "Imaculado é o caminho do meu Deus" (17:31), "as palavras do Senhor, examinadas no fogo" (D27), "É Deus que me cingiu de poder", "me corrigiu até o fim" (17:36b, in finem decided here), "E me destes os meus inimigos de costas", the order of 17:42, "entoarei um salmo" for psalmum dicam, the gerunds of 17:51. Marks confirmed.',
     'outcomes': [{'verse': '17:34', 'remark': 'státuens (present participle) turned into a finite indicative, regularising the Latin\'s perfécit … státuens (minor) → "e sobre as alturas me firmando"', 'outcome': 'taken', 'decision': 'statuens', 'reason': 'Voice, tense and mood are kept where Portuguese can keep them; a gerund can.'}]},
    {'step': 'stylist', 'file': 'critic/v4.stylist.part2.json', 'note': 'Stage two, draft 4. Eight verses; best 17:29, worst 17:41. "O salmo tem gravidade e imagens fortes … Os tropeços vêm sobretudo de algumas construções calcadas no latim e de trechos sobrecarregados; as imagens insólitas, por si mesmas, não prejudicam a oração." Six taken (17:33, 17:36b, 17:40, 17:41, 17:46, 17:48), two refused as options (17:34 aperfeiçoou, 17:35 ensina).',
     'outcomes': [
         {'verse': '17:33', 'remark': '"fez imaculado o meu caminho" sounds calqued → "tornou imaculado o meu caminho"', 'outcome': 'taken', 'decision': 'posuit', 'reason': 'Which verb Portuguese uses for pónere + adjective is grammar (D2); neither fazer nor tornar is the Latin\'s verb.'},
         {'verse': '17:34', 'remark': 'the vowels of "aperfeiçoou os" are hard to say every day → "Que tornou perfeitos os meus pés"', 'outcome': 'option', 'decision': 'perfecit', 'reason': 'perfícere → aperfeiçoar is the glossary row, tried on this verse by the Ps 8 agent; "tornou perfeitos" would also say "tornou" twice in two verses after 17:33.'},
         {'verse': '17:35', 'remark': '"ensinar as mãos para" leaves the ear expecting another construction → "Que instrui as minhas mãos para a batalha"', 'outcome': 'option', 'decision': 'docet', 'reason': 'docére → ensinar (glossary), and the psalm echoes it: docet (17:35) … docébit (17:36b, "me ensinará"). instruir is erudíre\'s verb (2:10 row).'},
         {'verse': '17:36b', 'remark': '"ela mesma" between two pauses breaks the colon and sounds explanatory → "e a vossa própria disciplina me ensinará"', 'outcome': 'taken', 'decision': 'ipsa', 'reason': 'Order and form only; ipsa is kept.'},
         {'verse': '17:40', 'remark': 'the colon is heavy, "mim … mim" hammers, and "debaixo de mim" delays the object → "e derrubastes sob mim os que contra mim se levantavam"', 'outcome': 'taken', 'decision': 'subtus', 'reason': 'Taken, and "sob" carried to all four places of subtus / sub so that the Latin\'s repetition stays one word.'},
         {'verse': '17:41', 'remark': 'WORST LINE: "dar alguém de costas" sounds like a body\'s position → "E me destes as costas dos meus inimigos"', 'outcome': 'taken', 'decision': 'dorsum', 'reason': 'All the Latin\'s words kept; a double accusative becomes a genitive (grammar).'},
         {'verse': '17:46', 'remark': '"coxearam" is not current in Brazil and heavy → "envelheceram e mancaram"', 'outcome': 'taken', 'decision': 'claudicaverunt', 'reason': 'With the blind reader, who did not know "coxearam". The comma before "e" is kept (the Latin\'s et joins a third verb after a pause).'},
         {'verse': '17:48', 'remark': 'the first colon piles up length and pauses → "Deus, que me dais vinganças e sujeitais os povos sob mim"', 'outcome': 'taken', 'decision': 'subtus', 'reason': 'Article and comma dropped (vindíctas has none); "sob mim" for sub me.'}]},
    {'step': 'ambiguity', 'file': 'critic/v4.ambiguity.part2.json', 'note': 'Stage two, draft 4, Portuguese only. 44 items, 10 unknown words (transporei, imaculado ×2, cingiu, cingistes, cervos, desfaleçam, coxearam, veredas, iníquo). Two real faults, both mended: 17:34 "cervos" heard as "servos" (→ corças), 17:44 "contradições" heard as inconsistencies (→ contendas). The rest are the Latin\'s own figures heard as the Latin reads: God "holy with the holy … perverse with the perverse" (17:26–27, which the Latin says), whose King and whose Christ (17:51), who magnifies (17:51), Christ and David as one or two (17:51, D19).',
     'outcomes': [
         {'verse': '17:26', 'remark': '"Com o santo sereis santo" may sound like a change in God', 'outcome': 'refused', 'reason': 'The Latin\'s figure, word for word (eris); the reader himself heard "God deals holily with the holy" first.'},
         {'verse': '17:27', 'remark': '"com o eleito sereis eleito" heard as God also being chosen', 'outcome': 'refused', 'reason': 'The Latin says exactly that (eléctus eris); Douay-Rheims "with the elect thou wilt be elect".'},
         {'verse': '17:27', 'remark': '"com o perverso vos pervertereis" heard as God becoming perverse', 'outcome': 'refused', 'decision': 'perverteris', 'reason': 'The Latin\'s own jolt (pervertéris, Douay-Rheims "thou wilt be perverted"); the Latinist passed it; the explanation (Matos Soares\'s "como ele merece") is refused under D2 and kept as an option.'},
         {'verse': '17:34', 'remark': '"os meus pés como os dos cervos" may be heard as "servos"', 'outcome': 'taken', 'decision': 'cervorum', 'reason': 'A homophone the listener cannot undo → "corças".'},
         {'verse': '17:36b', 'remark': '"a vossa disciplina": instruction, punishment, or God\'s self-control', 'outcome': 'refused', 'reason': 'disciplína (παιδεία) is both instruction and correction, and the verse says both (corrigiu … ensinará).'},
         {'verse': '17:37', 'remark': '"as minhas pegadas" is usually the marks on the ground', 'outcome': 'refused', 'decision': 'vestigia', 'reason': 'The Latin\'s image (vestígia); the reader heard the sense, steps firm.'},
         {'verse': '17:41', 'remark': '"me destes os meus inimigos de costas": fleeing or surrendered?', 'outcome': 'taken', 'decision': 'dorsum', 'reason': 'Mended with the stylist\'s wording, "as costas dos meus inimigos".'},
         {'verse': '17:44', 'remark': '"as contradições do povo" heard as the people\'s inconsistencies, not opposition to the speaker', 'outcome': 'taken', 'decision': 'contradictio', 'reason': 'A wrong first hearing → "contendas".'},
         {'verse': '17:46', 'remark': '"Os filhos estranhos": foreigners not perceived; heard as others\' children or odd ones', 'outcome': 'refused', 'decision': 'alieni', 'reason': 'aliénus is "not one\'s own" before it is "foreign" (glossary row aliénus → estranho, wider than estrangeiro); "others\' children" is inside the Latin.'},
         {'verse': '17:47', 'remark': '"exalte-se": that people exalt God, or God exalt himself', 'outcome': 'refused', 'decision': 'exaltetur', 'reason': 'As 9:33 (the glossary\'s jussive); the reader heard the right one first.'},
         {'verse': '17:48', 'remark': '"me dais vinganças": lets me avenge myself, or avenges me', 'outcome': 'refused', 'reason': 'The Latin (das vindíctas mihi) is open the same way.'},
         {'verse': '17:51', 'remark': 'who magnifies and shows mercy; whose King and whose Christ; "o seu Cristo, Davi" as Jesus, or as two persons', 'outcome': 'refused', 'decision': 'magnificans', 'reason': 'The Latin\'s participles hang on nothing and its possessives are as open; Christus → Cristo is settled (D19), and the Church has heard Christ in it.'},
         {'verse': '17:30', 'remark': 'unknown words: transporei; cingiu, cingistes (17:33, 17:40); desfaleçam (17:38); iníquo (17:49); veredas (17:46); imaculado (17:31, 17:33)', 'outcome': 'refused', 'reason': 'Each was paraphrased rightly in the same reply (transpor = get over an obstacle; desfaleçam = lose strength); cingir is the Latin\'s image of girding; iníquo, vereda, imaculado are glossary words.'},
         {'verse': '17:46', 'remark': 'unknown word: coxearam', 'outcome': 'taken', 'decision': 'claudicaverunt', 'reason': '→ mancaram, with the stylist.'}]},
    {'step': 'revision', 'version': 5, 'note': 'Stage two, draft 5 (revise_v5.py; draft 4 kept as prayed.v4.json): 17:33 "e tornou imaculado o meu caminho"; 17:34 "como os das corças … e sobre as alturas me firmando" (new decision cervorum; the Latinist\'s gerund); 17:36b "e a vossa própria disciplina me ensinará" (new decision ipsa); subtus / sub → "sob" in 17:37, 39, 40, 48 (new decision subtus); 17:40 "e derrubastes sob mim os que contra mim se levantavam"; 17:41 "E me destes as costas dos meus inimigos"; 17:44 "das contendas do povo"; 17:46 "e mancaram"; 17:48 "Deus, que me dais vinganças e sujeitais os povos sob mim".'},
]
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['decisions']), 'decisions')
