"""Ps 32 draft 1. python3.13 research/psalterium/ps032/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '32:1': 'Exultai no Senhor, {justi}: * aos retos {decet} o louvor.',
    '32:2': '{confitemini} ao Senhor {in_c} cítara: * {in_p} saltério de dez cordas {psallite2}.',
    '32:3': 'Cantai-lhe um cântico novo: * {bene} com {vocif}.',
    '32:4': 'Porque a palavra do Senhor é reta, * e todas as suas obras, {fide}.',
    '32:5': 'Ele ama a misericórdia e {judicium}: * {v5b}.',
    '32:6': '{verbo} do Senhor os céus foram firmados: * e pelo {spiritu} da sua boca, {virtus6}.',
    '32:7': '{congregans} como num odre as águas do mar: * {ponens} os abismos {thesauris}.',
    '32:8': 'Toda a terra tema o Senhor: * e {commov} todos os que habitam o mundo.',
    '32:9': 'Porque ele disse, e {facta}: * ele {mandavit}, e {creata}.',
    '32:10': 'O Senhor {dissipat} os {consilia_g} das nações: * e rejeita os pensamentos dos povos, e rejeita os {consilia_p} dos príncipes.',
    '32:11': 'Mas o {consilium} do Senhor permanece para sempre: * os pensamentos do seu coração, de geração em geração.',
    '32:12': 'Bem-aventurada a nação {cujus}: * o povo que ele escolheu para sua herança.',
    '32:13': 'Do céu olhou o Senhor: * viu todos os filhos dos homens.',
    '32:14': 'Da sua morada preparada * olhou {super14} todos os que habitam a terra.',
    '32:15': 'Ele, que {finxit} {sigil} os corações deles: * que entende todas as obras deles.',
    '32:16': 'O rei não {salvatur} por muito {virt16a}: * e o gigante não será salvo na {multitudine} do seu {virt16b}.',
    '32:17': '{fallax} para a salvação: * e na abundância do seu {virt17} não será salvo.',
    '32:18': 'Eis os olhos do Senhor sobre os que o temem: * e sobre os que esperam na sua misericórdia:',
    '32:19': 'Para {eruat} da morte as almas deles: * e {alat} na fome.',
    '32:20': 'A nossa alma espera pelo Senhor: * porque o nosso {adjutor} e protetor é ele.',
    '32:21': 'Porque nele se alegrará o nosso coração: * e no seu {nomen} esperamos.',
    '32:22': '{fiat}: * assim como esperamos em vós.',
}

dec('justi', ['32:1'], 'Exsultáte, justi, in Dómino', 'grammar',
    'The vocative justi (δίκαιοι). The glossary\'s vocative row (28:1, 29:5): mark the vocative — \'ó\' before a bare noun. Bare, \'Exultai,'
    ' justos, no Senhor\' can be heard as an adjective (\'exult, being just\'). The vocative goes to the end of the colon: in the Latin'
    ' order (Matos Soares 1932 \'Exultai, ó justos, no Senhor\') the mediant \'Senhor\' rhymes with the final \'louvor\', an echo the'
    ' Latin (Dómino / collaudátio) does not have; order is the ear\'s (D2). The first colon is sung in many Introits (Pasc2-0, 11-01 … grep) and the'
    ' Monday Matins antiphon is its second colon (\'Rectos decet * collaudátio\', Psalmi matutinum.txt [Daya1]).',
    o('ó justos', {'justi': 'ó justos'}, 'Ruling: the vocative marked (glossary row, 28:1).', 'MS1932'),
    o('justos', {'justi': 'justos'}, 'Bare, as the Latin; may be heard as an adjective.', 'draft'))

dec('decet', ['32:1'], 'rectos decet collaudátio', 'word',
    'decet: \'it is fitting, it becomes\' (πρέπει). \'convém\' is the verb Portuguese uses for what befits (\'como convém\'); in everyday'
    ' Brazilian it also says \'it is advisable\', which here does no harm. \'fica bem\' is Matos Soares 1932\'s (colloquial, and heard as'
    ' \'looks good on\'). collaudátio is only here (grep); its Greek αἴνεσις is laus\'s in 33:2 (ἡ αἴνεσις αὐτοῦ), so by D15\'s test it takes'
    ' laus\'s word, louvor. rectus → reto (glossary, rectus corde → reto de coração). Douay-Rheims \'praise becometh the upright\'. The'
    ' antiphon \'Rectos decet * collaudátio\' is served: \'Aos retos * convém o louvor\'.',
    o('convém', {'decet': 'convém'}, 'Ruling: the verb of what befits.', 'draft'),
    o('fica bem', {'decet': 'fica bem'}, 'Matos Soares 1932; colloquial.', 'MS1932'),
    o('cabe', {'decet': 'cabe'}, 'Plain; \'is due to\'.', 'draft'))

dec('confiteri', ['32:2'], 'Confitémini Dómino', 'glossary',
    'confitéri to God → dar graças a (D5), with its dative (\'ao Senhor\'). Matos Soares 1932 \'Louvai\' is laudáre\'s verb (D5).',
    o('Dai graças', {'confitemini': 'Dai graças'}, 'Ruling: D5.', 'glossary'),
    o('Louvai', {'confitemini': 'Louvai'}, 'Matos Soares 1932: laudáre\'s verb.', 'MS1932'))

dec('in_cithara', ['32:2'], 'in cíthara … in psaltério decem chordárum', 'grammar',
    'The instrument with \'in\' (ἐν κιθάρᾳ, ἐν ψαλτηρίῳ): the Latin has one preposition twice, so the Portuguese has one twice. \'com a'
    ' cítara … com o saltério\' is how Portuguese names the instrument played (Matos Soares 1932 has exactly this); \'na cítara\' is'
    ' \'on the harp\' (\'tocar na cítara\'), also good; \'ao som da\' explains. cíthara → cítara (10 lines, grep), psaltérium → saltério (9;'
    ' 143:9 \'in psaltério decachórdo\' is the near twin of this colon) — new glossary rows.',
    o('com a … com o', {'in_c': 'com a', 'in_p': 'com o'}, 'Ruling: the instrument played (Matos Soares 1932).', 'MS1932'),
    o('na … no', {'in_c': 'na', 'in_p': 'no'}, 'The preposition to the letter.', 'draft'),
    o('ao som da … ao som do', {'in_c': 'ao som da', 'in_p': 'ao som do'}, 'Explains.', 'draft'))

dec('psallite', ['32:2', '32:3'], 'psállite illi … bene psállite ei', 'glossary',
    'psállere → entoar salmos (D25), twice in two verses with its dative (illi, ei → \'-lhe\'); 32:3 sets it beside cantáre (\'Cantáte ei\')'
    ' — the reason D25 could not use \'cantar\'.',
    o('entoai-lhe salmos', {'psallite2': 'entoai-lhe salmos', 'psallite3': 'entoai-lhe'}, 'Ruling: D25.', 'glossary'),
    o('cantai-lhe salmos', {'psallite2': 'cantai-lhe salmos', 'psallite3': 'cantai-lhe'},
      'Plainer; collides with Cantáte in 32:3 (D25).', 'draft'))

dec('bene', ['32:3'], 'bene psállite ei in vociferatióne', 'order',
    'bene: \'well\' (καλῶς) — to sing well is the Latin\'s whole point, not the Hebrew\'s \'play skilfully\'. Portuguese cannot put \'bem\''
    ' before a bare plural (\'bem salmos\' is \'quite a few psalms\'), so the adverb goes after the verb and the noun takes its article:'
    ' \'entoai-lhe bem os salmos\'. Douay-Rheims \'sing well unto him\'; Matos Soares 1932 paraphrases (\'louvai-o com concerto de'
    ' instrumentos e de vozes\').',
    o('{psallite3} bem os salmos', {'bene': '{psallite3} bem os salmos'}, 'Ruling: the adverb after the verb.', 'draft'),
    o('{psallite3} salmos, e bem,', {'bene': '{psallite3} salmos, e bem,'}, 'The adverb set apart; heavier.', 'draft'),
    o('{psallite3} salmos com arte', {'bene': '{psallite3} salmos com arte'}, 'Explains \'well\' as skill (the Hebrew\'s sense).', 'draft'))

dec('vociferatio', ['32:3'], 'in vociferatióne', 'glossary',
    'vociferátio → aclamação (glossary, open; 26:6b \'hóstiam vociferatiónis\'; the row names this verse). ἀλαλαγμός, the shout of'
    ' acclaim. Douay-Rheims \'with a loud noise\'. \'júbilo\' is left to gáudium / jubilátio (the row).',
    o('aclamação', {'vocif': 'aclamação'}, 'Ruling: glossary (26:6b).', 'glossary'),
    o('brados', {'vocif': 'brados'}, 'The shout, plainer.', 'draft'),
    o('alta voz', {'vocif': 'alta voz'}, 'Douay-Rheims \'a loud noise\'; loses the acclaim.', 'DRB'))

dec('fide', ['32:4'], 'et ómnia ópera ejus in fide', 'word',
    'fides here is God\'s: his works are \'in faithfulness\' (ἐν πίστει). Only here in the psalter (grep). Portuguese \'fé\' of God\'s works'
    ' would be heard as the believer\'s faith; \'fidelidade\' names the sense and is free — the glossary keeps it off véritas (→ verdade),'
    ' so the two stay apart. The second colon stays verbless, carrying the first colon\'s \'é\', as the Latin carries \'est\'. Douay-Rheims'
    ' supplies a participle (\'are done with faithfulness\'); Matos Soares 1932 paraphrases (\'a sua fidelidade brilha em todas as suas'
    ' obras\').',
    o('em fidelidade', {'fide': 'em fidelidade'}, 'Ruling: verbless, the preposition kept.', 'draft'),
    o('com fidelidade', {'fide': 'com fidelidade'}, 'The manner, plainer.', 'draft'),
    o('são feitas com fidelidade', {'fide': 'são feitas com fidelidade'}, 'Douay-Rheims\'s participle; longer.', 'DRB'),
    o('na fé', {'fide': 'na fé'}, 'The Latin\'s word; heard as the believer\'s faith.', 'draft'))

dec('judicium', ['32:5'], 'Díligit misericórdiam et judícium', 'glossary',
    'judícium → juízo (D15). κρίσις. The pair mercy and judgment (Douay-Rheims \'mercy and judgment\'); Matos Soares 1932 \'a justiça\' is'
    ' justítia\'s word. The Introit of Easter II (Pasc2-0, missa) sings the second colon.',
    o('o juízo', {'judicium': 'o juízo'}, 'Ruling: D15.', 'glossary'),
    o('a justiça', {'judicium': 'a justiça'}, 'Matos Soares 1932: justítia\'s word.', 'MS1932'))

dec('order5', ['32:5'], 'misericórdia Dómini plena est terra', 'order',
    'The Latin fronts the mercy, so that the verse turns on the word twice (misericórdiam … misericórdia). Portuguese says it subject first;'
    ' the fronted order (\'Da misericórdia do Senhor está cheia a terra\') is an inversion for its own sake, which the style rules refuse,'
    ' though the Introit (Pasc2-0) begins with the word. Matos Soares 1932 has the natural order.',
    o('a terra está cheia da misericórdia do Senhor', {'v5b': 'a terra está cheia da misericórdia do Senhor'},
      'Ruling: natural order (Matos Soares 1932).', 'MS1932'),
    o('da misericórdia do Senhor está cheia a terra', {'v5b': 'da misericórdia do Senhor está cheia a terra'},
      'The Latin\'s order; the Introit\'s first word first.', 'draft'))

dec('verbo', ['32:6'], 'Verbo Dómini', 'word',
    'verbum → palavra (D15; the same word as 32:4 \'rectum est verbum Dómini\'). The Fathers read the verse of the Trinity — the Word, and'
    ' the Spirit of his mouth (DO\'s own Matins lesson quotes it so: \'Verbum enim Dómini Fílius est Patris\', Commune/C1.txt, grep); the'
    ' Latin does not say it, and the reader who knows will hear it in \'palavra\' as the Latin reader hears it in verbum. A capital'
    ' \'Verbo\' would explain. It is sung with 32:5 in the Introit of Easter II and as the Trinity versicle (Pent01-0.txt).',
    o('Pela palavra', {'verbo': 'Pela palavra'}, 'Ruling: D15, as 32:4.', 'glossary'),
    o('Pelo Verbo', {'verbo': 'Pelo Verbo'}, 'The patristic reading made explicit; explains.', 'draft'))

dec('spiritu', ['32:6'], 'et spíritu oris ejus', 'word',
    'spíritus (πνεῦμα): the breath of his mouth, and — for the Fathers, as with verbum — the Spirit. \'espírito\' keeps the Latin\'s word and'
    ' both readings (Douay-Rheims \'spirit\', Matos Soares 1932 \'espírito\'); \'sopro\' names the breath only and closes the other reading.'
    ' Unlike 10:7 \'spíritus procellárum\' (wind), a mouth\'s spíritus can be said \'espírito\' without being wrong.',
    o('espírito', {'spiritu': 'espírito'}, 'Ruling: the Latin\'s word; both readings open.', 'DRB'),
    o('sopro', {'spiritu': 'sopro'}, 'The breath; closes the Spirit.', 'draft'))

dec('virtus6', ['32:6'], 'omnis virtus eórum', 'glossary',
    'virtus → poder (glossary): the heavens\' virtus is their host (δύναμις), as \'Dóminus virtútum\' → \'o Senhor dos poderes\' (23:10).'
    ' \'deles\' so that the power is the heavens\', not the Lord\'s (\'o seu\' would be heard as his). Matos Soares 1932 \'todo o seu'
    ' exército\' explains (his note: the stars). Douay-Rheims \'all the power of them\'. The colon is verbless, as the Latin: the first'
    ' colon\'s \'foram firmados\' serves it.',
    o('todo o poder deles', {'virtus6': 'todo o poder deles'}, 'Ruling: glossary; the owner made plain.', 'glossary'),
    o('todo o seu exército', {'virtus6': 'todo o seu exército'}, 'Matos Soares 1932: explains.', 'MS1932'))

dec('congregans', ['32:7'], 'Cóngregans sicut in utre aquas maris: * ponens in thesáuris abýssos', 'grammar',
    'Two participles hang on \'Dóminus\' of 32:6 (συνάγων … τιθείς). Portuguese gerunds opening a verse (\'Juntando … pondo\') dangle'
    ' further than the Latin\'s participles, which agree with their noun; the finite verbs with the subject named are grammar (D2),'
    ' as Matos Soares 1932 builds it (\'Ele junta … ele põe\'). No \'e\' is added between the cola: the Latin has none. congregáre → juntar'
    ' here (the waters gathered as into a wineskin); 15:4b has \'congregar\' for gathering assemblies, and the blind reader of Ps 15 did'
    ' not know it. uter → odre (glossary, 118:83).',
    o('Ele junta … põe', {'congregans': 'Ele junta', 'ponens': 'põe'}, 'Ruling: finite verbs (Matos Soares 1932).', 'MS1932'),
    o('Juntando … pondo', {'congregans': 'Juntando', 'ponens': 'pondo'}, 'The participles as gerunds (as 17:51).', 'draft'),
    o('Ele congrega … põe', {'congregans': 'Ele congrega', 'ponens': 'põe'}, '15:4b\'s verb.', 'draft'))

dec('thesauris', ['32:7'], 'ponens in thesáuris abýssos', 'word',
    'thesáurus: a store, a treasury (θησαυροῖς); 134:7 \'qui prodúcit ventos de thesáuris suis\' is the same image. \'tesouros\' keeps the'
    ' Latin\'s word — the deeps laid up as treasure — and Portuguese \'tesouro\' still means a treasury; Douay-Rheims \'storehouses\' and'
    ' Matos Soares 1932 \'reservatórios\' name the use.',
    o('em tesouros', {'thesauris': 'em tesouros'}, 'Ruling: the Latin\'s word and image.', 'draft'),
    o('em depósitos', {'thesauris': 'em depósitos'}, 'Douay-Rheims \'storehouses\'; plainer.', 'DRB'),
    o('nos seus reservatórios', {'thesauris': 'nos seus reservatórios'}, 'Matos Soares 1932.', 'MS1932'))

dec('commov', ['32:8'], 'ab eo autem commoveántur omnes inhabitántes orbem', 'word',
    'commovéri (σαλευθήτωσαν, \'be shaken\') → ser abalado, the glossary\'s movéri, and 28:8 \'commovéntis desértum\' → \'que abala\''
    ' (the active). ab eo → \'por ele\': the Latin\'s preposition, which lets him be the one who shakes; Douay-Rheims \'be in awe of him\''
    ' and Matos Soares 1932 \'tremam diante dele\' read the fear the first colon names. orbis → o mundo (D30); inhabitántes → \'os que'
    ' habitam\' (23:1). autem → \'e\': the verse is a parallel, not a contrast.',
    o('por ele sejam abalados', {'commov': 'por ele sejam abalados'}, 'Ruling: the Latin\'s verb and preposition.', 'glossary'),
    o('diante dele tremam', {'commov': 'diante dele tremam'}, 'Matos Soares 1932: the fear.', 'MS1932'))

dec('facta', ['32:9'], 'ipse dixit, et facta sunt: * ipse mandávit, et creáta sunt', 'grammar',
    'facta sunt, creáta sunt: neuter plurals with no subject — \'things came to be\'. Portuguese \'foram feitas … foram criadas\''
    ' (feminine plural) is heard the same way, with \'as coisas\' understood, and keeps the Latin\'s bareness; Matos Soares 1932 supplies'
    ' \'(tudo)\'. 148:5 is the same verse word for word (grep) — formula row. The Genesis echo (dixit … factum est) is the Latin\'s.',
    o('foram feitas … foram criadas', {'facta': 'foram feitas', 'creata': 'foram criadas'}, 'Ruling: bare, as the Latin.', 'draft'),
    o('tudo foi feito … tudo foi criado', {'facta': 'tudo foi feito', 'creata': 'tudo foi criado'},
      'Matos Soares 1932: a subject supplied.', 'MS1932'))

dec('mandavit', ['32:9'], 'ipse mandávit', 'glossary',
    'mandáre (ἐνετείλατο), with no object. The mandáre row (open) has three candidates: \'mandar\' only with \'que\' or beside mandáta'
    ' (bare \'mandastes\' + object was heard as \'sent\', 118:138), \'ordenar\' with a thing as object. Bare \'ele mandou\' is'
    ' understood (\'he gave the order\'), but \'ordenou\' cannot be misheard and pairs with \'disse\'. 148:5 should follow.',
    o('ordenou', {'mandavit': 'ordenou'}, 'Ruling: the row\'s safe verb.', 'glossary'),
    o('mandou', {'mandavit': 'mandou'}, 'Matos Soares 1932; the mandáta family.', 'MS1932'))

dec('consilia', ['32:10', '32:11'], 'consília géntium … consília príncipum … Consílium autem Dómini', 'glossary',
    'D33: consílium → desígnio where it is what someone intends — this is the verse D33 named as the test. The nations\' and princes\''
    ' plans are brought to nothing, the Lord\'s plan stands: one word three times, as the Latin (βουλάς … βουλάς … βουλή), so the'
    ' contrast is heard. \'conselhos\' would be heard as advice given. Matos Soares 1932 varies (\'projectos … planos … desígnios\');'
    ' Douay-Rheims \'counsels\'. Heard at Mass: 32:11 with 32:19 is the Introit of the Sacred Heart (Pent02-5, missa).',
    o('desígnios … desígnio', {'consilia_g': 'desígnios', 'consilia_p': 'desígnios', 'consilium': 'desígnio'}, 'Ruling: D33.', 'glossary'),
    o('conselhos … conselho', {'consilia_g': 'conselhos', 'consilia_p': 'conselhos', 'consilium': 'conselho'},
      'Douay-Rheims; heard as advice.', 'DRB'),
    o('planos … plano', {'consilia_g': 'planos', 'consilia_p': 'planos', 'consilium': 'plano'}, 'Plainest; Matos Soares 1932 in part.', 'MS1932'))

dec('dissipat', ['32:10'], 'Dóminus díssipat consília géntium', 'glossary',
    'dissipáre (διασκεδάζει, \'scatters, brings to nothing\'). The row (open) proposes \'dissipar\' where the object is a thing, \'dispersar\''
    ' where it is people (17:15). Plans are things: \'dissipa\' (Matos Soares 1932). Douay-Rheims \'bringeth to naught\'.',
    o('dissipa', {'dissipat': 'dissipa'}, 'Ruling: the row\'s verb for a thing.', 'glossary'),
    o('desfaz', {'dissipat': 'desfaz'}, 'Plainer; the row\'s option.', 'glossary'))

dec('cujus', ['32:12'], 'Beáta gens, cujus est Dóminus, Deus ejus', 'grammar',
    'The Latin: the nation whose Lord is its God (οὗ ἐστιν κύριος ὁ θεὸς αὐτοῦ). \'cujo Deus é o Senhor\' says it in the relative Portuguese'
    ' has; Matos Soares 1932 \'que tem o Senhor por seu Deus\' says the same with a verb. beátus → bem-aventurado (D19). The versicle'
    ' \'Beáta gens, cujus est Dóminus Deus\' (111-0.txt) and the Gradual (Pent17-0, missa) are other wordings of it.',
    o('cujo Deus é o Senhor', {'cujus': 'cujo Deus é o Senhor'}, 'Ruling: the relative.', 'draft'),
    o('que tem o Senhor por seu Deus', {'cujus': 'que tem o Senhor por seu Deus'}, 'Matos Soares 1932.', 'MS1932'))

dec('super14', ['32:14'], 'respéxit super omnes', 'word',
    'respícere super (ἐπέβλεψεν ἐπί): the look from above. \'olhou para\' is how Portuguese says it; \'olhou sobre\' (Matos Soares 1932)'
    ' keeps super but is heard as \'looked over\' (past). 32:13 has the same verb bare (\'Do céu olhou o Senhor\'); the respícere row\'s'
    ' \'estar voltado para\' is for a state (eyes that look), not this act.',
    o('para', {'super14': 'para'}, 'Ruling: natural.', 'draft'),
    o('sobre', {'super14': 'sobre'}, 'Matos Soares 1932: super kept.', 'MS1932'))

dec('finxit', ['32:15'], 'Qui finxit sigillátim corda eórum', 'word',
    'fíngere (ὁ πλάσας): to form, as a potter or a sculptor. The plasmáre row (118:73 → \'moldar\') keeps itself apart from fíngere and'
    ' formáre; \'formar\' is the plain word (Matos Soares 1932 \'formou\'). sigillátim (κατὰ μόνας, only here, grep): one by one — each'
    ' heart singly. Douay-Rheims \'the hearts of every one of them\'; Matos Soares 1932 \'o coração de cada um deles\' (a singular). The'
    ' plural \'corações\' and \'deles\' twice are the Latin\'s (corda eórum … ópera eórum).',
    o('formou um por um', {'finxit': 'formou', 'sigil': 'um por um'}, 'Ruling: plain.', 'MS1932'),
    o('moldou um por um', {'finxit': 'moldou', 'sigil': 'um por um'}, 'plasmáre\'s verb (118:73).', 'glossary'),
    o('formou, a cada um,', {'finxit': 'formou', 'sigil': 'a cada um,'}, 'Closer to Matos Soares 1932.', 'MS1932'))

dec('virtus16', ['32:16', '32:17'], 'per multam virtútem … in multitúdine virtútis suæ … in abundántia virtútis suæ', 'glossary',
    'virtus three times in two verses, one Greek word each time (δύναμιν, ἰσχύος, δυνάμεως — the second differs): the king\'s might, the'
    ' giant\'s, the horse\'s. One Portuguese word for the Latin\'s one. \'poder\' is the row\'s; \'vigor\' (the row\'s proposal for a'
    ' man\'s own bodily strength, 21:16, 29:8) fits the giant and the horse but not the king\'s army (Douay-Rheims \'a great army\');'
    ' \'força\' is fortitúdo\'s.',
    o('poder', {'virt16a': 'poder', 'virt16b': 'poder', 'virt17': 'poder'}, 'Ruling: the row\'s word, three times.', 'glossary'),
    o('vigor', {'virt16a': 'vigor', 'virt16b': 'vigor', 'virt17': 'vigor'}, 'The row\'s word for a man\'s strength.', 'glossary'),
    o('força', {'virt16a': 'força', 'virt16b': 'força', 'virt17': 'força'}, 'Douay-Rheims \'strength\'; fortitúdo\'s.', 'DRB'))

dec('multitudine', ['32:16'], 'in multitúdine virtútis suæ', 'glossary',
    'multitúdo + genitive → multidão (glossary, open; 5:7b \'na multidão da vossa misericórdia\'), odd with a singular abstract as the'
    ' Latin is (the row says so). Here it stands beside abundántia in 32:17 (→ abundância, the row\'s own contrast), so the two'
    ' Latin nouns stay two. \'grandeza\' is magnitúdo\'s.',
    o('multidão', {'multitudine': 'multidão'}, 'Ruling: glossary.', 'glossary'),
    o('grandeza', {'multitudine': 'grandeza'}, 'magnitúdo\'s word; natural.', 'draft'))

dec('salvatur', ['32:16'], 'Non salvátur rex', 'grammar',
    'salvátur, present passive, beside salvábitur, future passive, twice. \'não se salva\' (the se-passive, and the present sense \'is'
    ' saved / saves himself\') against \'não será salvo\' twice: the Latin\'s tenses kept, one voice-form each.',
    o('se salva', {'salvatur': 'se salva'}, 'Ruling: the se-passive for the present.', 'MS1932'),
    o('é salvo', {'salvatur': 'é salvo'}, 'The periphrastic passive, as the futures.', 'draft'))

dec('fallax', ['32:17'], 'Fallax equus ad salútem', 'word',
    'fallax (ψευδής, \'false\'), only here (grep): the horse deceives the one who trusts it for safety. \'Enganoso\' is the plain word and'
    ' stays apart from dolósus → enganador (glossary). \'Falaz\' is bookish. The colon is verbless in Latin; the copula comes after the'
    ' fronted adjective. Douay-Rheims \'Vain is the horse\'; Matos Soares 1932 explains (\'O cavalo engana a quem espera dele a salvação\').'
    ' salus → salvação (D6).',
    o('Enganoso é o cavalo', {'fallax': 'Enganoso é o cavalo'}, 'Ruling: plain; the adjective first, as the Latin.', 'draft'),
    o('O cavalo é enganoso', {'fallax': 'O cavalo é enganoso'}, 'Subject first.', 'draft'),
    o('Vão é o cavalo', {'fallax': 'Vão é o cavalo'}, 'Douay-Rheims \'Vain\'; vanus\'s word.', 'DRB'))

dec('eruat', ['32:19'], 'Ut éruat a morte ánimas eórum', 'glossary',
    'éruere with a source (a morte) → arrancar (glossary, open: arrancar with a source, libertar without). \'arrancar da morte\' is also'
    ' the Portuguese idiom. Matos Soares 1932 \'livrar\' is liberáre\'s. The purpose clause as \'Para\' + infinitive, the subject being'
    ' the Lord of 32:18 in both languages. This verse and 32:11 make the Introit of the Sacred Heart.',
    o('arrancar', {'eruat': 'arrancar'}, 'Ruling: glossary.', 'glossary'),
    o('livrar', {'eruat': 'livrar'}, 'Matos Soares 1932: liberáre\'s verb.', 'MS1932'))

dec('alat', ['32:19'], 'et alat eos in fame', 'word',
    'álere (διαθρέψαι): to nourish, feed. \'alimentar\' is the plain concrete verb; \'sustentar\' (Matos Soares 1932) is also \'support\';'
    ' \'nutrir\' is ēducáre\'s (22:2). in fame → \'na fome\' (Matos Soares 1932 \'no tempo da fome\' explains).',
    o('alimentá-los', {'alat': 'alimentá-los'}, 'Ruling: plain and concrete.', 'draft'),
    o('sustentá-los', {'alat': 'sustentá-los'}, 'Matos Soares 1932.', 'MS1932'))

dec('adjutor', ['32:20'], 'quóniam adjútor et protéctor noster est', 'glossary',
    'adjútor → auxílio (glossary, open, D19/D24), protéctor → protetor (glossary). The pair is the one the protéctor row names (27:7, 39:18,'
    ' 113:17–19). The Latinist has asked for \'auxiliador\' in eight places; the agents\' standing proposal on the row is \'auxiliador\''
    ' only where adjútor is paired with another agent noun — as here, with protéctor. Not ruled; the row\'s word is followed, one noster'
    ' for both nouns as the Latin. Douay-Rheims \'our helper and protector\'; Matos Soares 1932 \'nosso amparo e protector\'.',
    o('auxílio', {'adjutor': 'auxílio'}, 'Ruling: the row\'s word (D19, D24).', 'glossary'),
    o('auxiliador', {'adjutor': 'auxiliador'}, 'The agent noun, beside protetor (the row\'s standing proposal).', 'latinist'))

dec('nomen', ['32:21'], 'in nómine sancto ejus', 'order',
    'nomen sanctum: the adjective after, as the Latin (and the glossary\'s \'monte santo\'), or before, as Portuguese says the holy name'
    ' of God in prayer (\'o seu santo nome\', Matos Soares 1932). Before the noun it is the name\'s epithet, which is what the phrase is'
    ' in the psalter (102:1, 104:3, 105:47 — grep: nómini sancto). speráre in → esperar em; sperávimus (perfect) → \'esperamos\', which'
    ' Portuguese hears as present and past alike.',
    o('santo nome', {'nomen': 'santo nome'}, 'Ruling: the epithet before, as prayed.', 'MS1932'),
    o('nome santo', {'nomen': 'nome santo'}, 'The Latin\'s order.', 'draft'))

dec('fiat', ['32:22'], 'Fiat misericórdia tua, Dómine, super nos', 'glossary',
    'Fiat → Seja (glossary; 118:76 \'Seja a vossa misericórdia para me consolar\'). This verse is the second-last line of the Te Deum'
    ' (Common/Prayers.txt) and the versicle of the Preces (Preces.txt, Major Special.txt), so each colon must stand alone (they do).'
    ' In the Latin order the mediant \'sobre nós\' rhymes with the final \'em vós\', an echo the Latin (nos / te) does not have, so'
    ' \'sobre nós\' comes forward — Portuguese order, and the mercy ends the colon. quemádmodum → \'assim como\'; sperávimus → \'esperamos\''
    ' (as 32:21). Douay-Rheims \'Let thy mercy, O Lord, be upon us\'; Matos Soares 1932 \'Exerça-se … sobre nós a tua misericórdia\'.',
    o('Seja sobre nós, Senhor, a vossa misericórdia', {'fiat': 'Seja sobre nós, Senhor, a vossa misericórdia'},
      'Ruling: no nós / vós rhyme at the cadences.', 'draft'),
    o('Seja a vossa misericórdia, Senhor, sobre nós', {'fiat': 'Seja a vossa misericórdia, Senhor, sobre nós'},
      'The Latin\'s order (118:76\'s build); rhymes with \'em vós\'.', 'draft'),
    o('Venha sobre nós, Senhor, a vossa misericórdia', {'fiat': 'Venha sobre nós, Senhor, a vossa misericórdia'},
      'veníre for fíeri.', 'draft'))

choices = {
    '32:2': 'decem chordárum → \'de dez cordas\' (Matos Soares 1932, Douay-Rheims).',
    '32:3': 'cánticum novum → \'um cântico novo\' (143:9, 149:1 the same phrase; grep).',
    '32:4': 'rectus → reto; verbum → palavra (D15); ópera → obras (glossary).',
    '32:5': 'dilígere → amar (glossary); the subject \'Ele\' supplied (the Latin verb ending; the Lord of 32:4).',
    '32:8': '\'Toda a terra tema o Senhor\' — the subject first (Matos Soares 1932): with the verb first, \'Tema o Senhor\' opens like an imperative to one person.',
    '32:11': 'manére → permanecer (μένει); the permanére row has the same verb, and they never meet in one verse. in ætérnum → para sempre (D23). \'In generatióne et generatiónem\' → \'de geração em geração\' (formula row, 118:90); the colon verbless as the Latin, sharing \'permanece\'.',
    '32:12': 'in hereditátem sibi → \'para sua herança\' (Matos Soares 1932); elígere → escolher (118:30, 118:173).',
    '32:13': 'respícere → olhar (the act; 21:2, 24:16 \'olhai para\'); fílii hóminum → filhos dos homens (glossary). The Latin order kept: it is also Portuguese.',
    '32:14': 'præparátum habitáculum → \'a sua morada preparada\' (ἑτοίμου: ready, prepared); Matos Soares 1932 makes a clause (\'da morada que ele preparou para si\'). No mark at the end of the first colon, as the Latin.',
    '32:15': 'intellégere → entender (glossary). The verse is two relative clauses in apposition to the Lord of 32:13–14, as the Latin: \'Ele, que … que …\'. The rhyme \'deles … deles\' at the two cadences is the Latin\'s own (eórum … eórum); kept.',
    '32:16': 'gigas → gigante (glossary, open; the row names this verse). The echo \'poder … poder\' at the two cadences is the Latin\'s (virtútem … virtútis); kept.',
    '32:18': 'ecce → eis (glossary); verbless, as the Latin and Matos Soares 1932 (\'Eis os olhos do Senhor postos sobre\'); metúere and timére share one Greek verb (φοβέομαι) → temer; speráre super → esperar em (glossary); in eis → \'sobre os que\', the preposition repeated so that the second group is heard as another object of the eyes.',
    '32:20': 'sustinére → esperar por (D36). The two nouns share one \'o nosso\', as the Latin shares noster. The copula and \'ele\' go last, where the Latin has \'noster est\': in the order \'porque ele é o nosso auxílio e protetor\' the final \'protetor\' rhymes with the mediant \'Senhor\'.',
    '32:6': 'firmáre (ἐστερεώθησαν, the verb of firmaméntum) → \'foram firmados\': the Latin\'s passive; the root is heard with 18:2\'s \'firmamento\' (D31). Both cola +4 on the Latin: Portuguese needs the prepositions the Latin\'s ablatives do not.',
    '32:17': 'abundántia → abundância (glossary, open; the row names this verse). The subject of \'não será salvo\' is left as open as the Latin (the horse, or the man on it). First colon +7 on a very short Latin colon (8 syllables): \'para a salvação\' is D6\'s noun; accepted.',    '32:21': 'lætári → alegrar-se (glossary).',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm32.txt, 22 prayed verses (32:1 is text: DO prints no titulus here, the Clementine\'s \'Psalmus David\' being its 32:1 heading). No repeated ids, no flex. Clementine (Bolls VULG, fetched to consult/bolls-VULG-19-32.json; ps033/show_vulg.py prints it): identical wording. Not in the Diurnal Monástico (the dossier has no DM1962 block). Uses checked by grep (ps032/uses.py): Monday Matins antiphon \'Rectos decet * collaudátio\' (Psalmi matutinum.txt [Daya1]); 32:1 as the Introit verse of many Masses (Pasc2-0, 11-01 …); 32:5–6 the Introit of Easter II (Pasc2-0); 32:6 the Trinity versicle (Pent01-0.txt); 32:11 + 32:19 the Introit of the Sacred Heart (Pent02-5, missa); 32:12 a Gradual (Pent17-0 and others) and a versicle (111-0.txt) in other wordings; 32:22 the Te Deum\'s second-last line (Common/Prayers.txt) and a Preces versicle (Preces.txt, Major Special.txt).'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps032.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: fides, collaudátio, sigillátim, fallax only here; cíthara 10 lines, psaltérium 9; suávis 7 (for Ps 33). Glossary applied: D5 (dar graças), D25 (entoar salmos), D15 (palavra, juízo), D30 (o mundo), D33 (desígnio — the test the ruling named), D23, D19 (bem-aventurado), D36 (esperar por), D6, adjútor → auxílio (held row). Latin (= Greek) readings kept against the Hebrew: 32:5 \'misericórdia e juízo\' (the Hebrew\'s righteousness), 32:6 \'foram firmados\' (not \'made\'), 32:7 \'como num odre\' (the Hebrew\'s heap), 32:8 \'sejam abalados\' (not \'stand in awe\'), 32:9 \'foram criadas\' (not \'stood fast\'), 32:10 the third member \'e rejeita os desígnios dos príncipes\' (absent from the Hebrew), 32:15 \'um por um\' (not \'together\'), 32:16 \'gigante\'. Tests for the readers: \'ó justos\', \'convém\', \'em fidelidade\', \'espírito\', \'todo o poder deles\', \'em tesouros\', \'por ele sejam abalados\', \'foram feitas\', \'desígnios\', \'na multidão do seu poder\', \'Enganoso é o cavalo\', \'Seja sobre nós\'.'},
]

data = {'psalm': 32, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
