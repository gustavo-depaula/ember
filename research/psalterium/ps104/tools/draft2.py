import json
p = 'research/psalterium/ps104/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['104:5'] = 'Lembrai-vos das maravilhas que ele fez: * dos seus prodígios, e dos juízos da sua boca.'
v['104:15'] = 'Não toqueis nos meus {christos}: * e não façais mal aos meus profetas.'
v['104:19'] = '{eloquium} {inflammavit}: * mandou o rei, e o soltou; o príncipe dos povos, e o deixou ir.'
v['104:30'] = 'A terra deles produziu rãs: * nos aposentos dos seus próprios reis.'

dec = {x['id']: x for x in d['decisions']}
e = dec['eloquium']
opts = {o['label']: o for o in e['options']}
e['options'] = [opts['A palavra do Senhor'], opts['O que o Senhor disse'], opts['O dito do Senhor']]
e['options'][0]['note'] = 'Ruling (v2): the Latinist and the stylist, independently; the precedent outside Ps 118 (11:7, 17:31, 18:15 all *palavra(s) do Senhor*). It meets the *verbum* of 104:18 in one Portuguese word, as Ps 18 already does.'
e['options'][1]['note'] = 'v1 ruling (D26 clause). The stylist: "O que … o" is heard first as "the one who" and trips the tongue; the Latinist: a paraphrase of a noun subject.'
e['why'] = ("D16 and D26 made elóquium the clause 'o que dissestes' in Ps 118 and left the places outside it to decide locally. Where elóquium is a subject with 'Dómini', those places took 'palavra(s) do Senhor' (11:7, 17:31, 18:15). v1 tried the clause ('O que o Senhor disse o inflamou') to keep elóquium apart from the verbum that ends 104:18. Both readers refused it: the Latinist called it a paraphrase of a noun subject; the stylist said 'O que … o' is misheard and made it the psalm's worst line. v2 follows the precedent outside Ps 118. The cost is D15's distinction (λόγος 104:18 / λόγιον 104:19), which is not heard here. The two colons now join, 'até que viesse a sua palavra: A palavra do Senhor o inflamou', and the listener may take them as one word. The Latin allows that reading, since the second may be the fulfilment of the first.")

d['choices']['104:5'] = "judícia → juízos (D15). v2 (stylist): the comma and 'suas' are dropped, so 'que ele fez' is a plain restrictive clause. The ejus is carried by 'ele fez' (grammar, D2)."
d['choices']['104:15'] = "malignári → 'fazer mal a'. The row's absolute 'fazer o mal' (36:8) loses its article when there is a dative object, which is the Portuguese idiom (stylist v1). The v1 chiasm with a fronted dative was refused as a lurch. The Latin's order (in prophétis … nolíte malignári) gives way to the ear (D2)."
d['choices']['104:19'] = ("DO joins Vulgate 104:19b–20 in one prayed verse (no 104:20 id). misit rex → 'mandou o rei' (v2, stylist): the verb comes first as in the Latin, and 'mandar' is the plain verb for a king who sends word without a stated object. v1's 'o rei enviou' left 'enviou' hanging (the stylist and the ambiguity reader). misit is 'enviou' at 104:17, 26, 28, where it has an object. There is no clash with mandáre, which is 'ordenou' at 104:8. dimíttere (let go) → deixar ir (row).")
d['choices']['104:30'] = "penetrália → aposentos (inner rooms); MS1932's 'câmaras' is heard as a legislature in Brazil. v2 (stylist): 'ipsórum' → 'seus próprios' before the noun, where the emphasis sits in Portuguese; 'próprios reis deles' piled up. It also removes one 'deles' rhyme against 104:29."

d['audit'].append({'step': 'critics v1', 'note': 'Latinist, stylist, ambiguity (fresh context; latin.json for the first two).', 'outcomes': [
  {'ref': '104:6', 'from': 'latinist (major)', 'outcome': 'refused on evidence. He says the LXX has the genitive δούλου αὐτοῦ. The parallels (Rahlfs, consult/parallels/ps104.md line 62) print "σπέρμα Αβρααμ δοῦλοι αὐτοῦ υἱοὶ Ιακωβ ἐκλεκτοὶ αὐτοῦ", which is plural and parallel to the ἐκλεκτοί he accepts. Decision servi kept, with the singular as the option.'},
  {'ref': '104:6', 'from': 'stylist', 'outcome': "refused: 'Descendência … seus servos' is the Latin's own collective with a plural apposition (semen … servi). Adding 'Vós' would supply a word the Latin lacks. The ambiguity reader heard the intended reading ('God's servants')."},
  {'ref': '104:9', 'from': 'latinist (minor)', 'outcome': "refused: 'dispôs com/para com Abraão' is not said in Portuguese. 'fez' is kept so that 'firmou' stays for statúere in 104:10 (decision disposuit)."},
  {'ref': '104:19', 'from': 'latinist + stylist', 'outcome': "taken: 'A palavra do Senhor o inflamou' (decision eloquium re-ruled; precedent 11:7, 17:31, 18:15)."},
  {'ref': '104:19', 'from': 'stylist + ambiguity', 'outcome': "taken: 'mandou o rei, e o soltou'."},
  {'ref': '104:24', 'from': 'latinist (minor)', 'outcome': "refused: super + accusative as a comparative has the psalter's precedent, 50:9 'mais branco que a neve' (super nivem) and 18:11 'mais desejáveis que o ouro' (super aurum). 'fortaleceu sobre' is not Portuguese. He called the comparative defensible."},
  {'ref': '104:33', 'from': 'latinist (minor)', 'outcome': "refused: lignum → árvore (row). The collective singular made plural is grammar (D2); 'arvoredo' would be a new word for one place."},
  {'ref': '104:38', 'from': 'latinist (minor)', 'outcome': "refused: 'pesava' keeps incúmbere's image of weight. The state after the perfect is the Portuguese imperfect of a lasting condition (grammar, D2). His 'caíra' is the Greek ἐπέπεσεν's image, which is kept as the option 'tinha caído'."},
  {'ref': '104:5', 'from': 'stylist', 'outcome': "taken: 'Lembrai-vos das maravilhas que ele fez'."},
  {'ref': '104:15', 'from': 'stylist', 'outcome': "taken: 'e não façais mal aos meus profetas'."},
  {'ref': '104:28', 'from': 'stylist + ambiguity', 'outcome': "refused, held for the Latin's word. 'exacerbar' in Portuguese covers both 'to make harsher' and 'to irritate, exasperate', so it holds the Latin's range. The Latinist passed it as keeping the Septuagint's oddity, and Ps 105:32's literal also has 'exacerbaram' for the same verb. The stylist's 'amargou' is kept as the option 'tornou amargas'. The colon is obscure in Latin and stays obscure."},
  {'ref': '104:30', 'from': 'stylist', 'outcome': "taken: 'nos aposentos dos seus próprios reis'."},
  {'ref': '104:32', 'from': 'stylist', 'outcome': "refused: 'fogo ardente' would be ardére's word, and at 118:140 'ardente' was heard as 'fervent'. comburéntem is transitive, 'burning up', so 'que queimava' stays."},
  {'ref': '104:3', 'from': 'ambiguity', 'outcome': "noted, kept: 'Sede louvados' was heard as the literal passive, which is the Latin (laudári row). The cost is recorded in decision laudamini, and 'Gloriai-vos' remains the option."},
  {'ref': '104:11, 16, 28', 'from': 'ambiguity (unknown words)', 'outcome': "kept: 'corda' is 77:54b's word, 'esteio' is D31's, and 'exacerbou' is discussed above. The other unknowns (grilhões, primícias, codorniz, mosca canina, Cam, confins) are established in Ps 77 or the glossary."},
  {'ref': '104:37, 38', 'from': 'ambiguity', 'outcome': "kept: the unmarked switch of 'eos' and the 'eórum … eos' of different groups are the Latin's own. Supplying names would say more than the Latin."}
]})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
