"""Ps 34 draft 1. python3.13 research/psalterium/ps034/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '34:1': 'Julgai, Senhor, {nocentes}, * {expugna}.',
    '34:2': '{apprehende} as armas e o escudo: * e levantai-vos {adjutorium}.',
    '34:3': '{effunde} a espada, e {conclude} os que me perseguem: * dizei à minha alma: {salus}.',
    '34:4': 'Sejam envergonhados e {revereantur}, * os que buscam a minha alma.',
    '34:4b': '{avertantur}, e sejam envergonhados * os que {cogitantes} contra mim.',
    '34:5': 'Tornem-se como o pó diante da face do vento: * e o anjo do Senhor {coarctans}.',
    '34:6': 'Torne-se o caminho deles trevas e {lubricum}: * e o anjo do Senhor {persequens}.',
    '34:7': 'Porque sem motivo esconderam para mim {interitum}: * em vão afrontaram a minha alma.',
    '34:8': 'Venha sobre ele o laço que ele {ignorat}: e a {captio} que ele escondeu o {apprehendat}: * e {inipsum}.',
    '34:9': 'A minha alma, porém, exultará no Senhor: * e se deleitará na sua salvação.',
    '34:10': 'Todos os meus ossos dirão: * Senhor, quem é semelhante a vós?',
    '34:10b': '{vosque} o {inops} da mão dos mais fortes que ele: * o necessitado e o pobre dos que o {diripientibus}.',
    '34:11': '{surgentes} testemunhas iníquas, * interrogavam-me sobre o que eu {ignorabam}.',
    '34:12': 'Retribuíam-me males por bens: * {sterilitatem}.',
    '34:13': 'Eu, porém, quando {molesti}, * vestia-me de cilício.',
    '34:13b': 'Humilhava com o jejum a minha alma: * e a minha oração voltará {sinu}.',
    '34:14': 'Como a um próximo, e como a um irmão nosso, assim eu agradava: * como quem {lugens}, assim eu me humilhava.',
    '34:15': 'E {adversum} se alegraram, e {convenerunt}: * {congregata} sobre mim os flagelos, e eu {ignoravi}.',
    '34:16': '{dissipati}, e não foram compungidos, {tentaverunt}, {subsannatione}: * rangeram {superme16} os seus dentes.',
    '34:17': 'Senhor, quando olhareis? * {restitue} a minha alma da {malignitate} deles, {unicam}.',
    '34:18': 'Eu vos darei graças na grande assembleia, * {populo} vos louvarei.',
    '34:19': 'Não se alegrem à minha custa os que se opõem a mim {inique}: * os que me odeiam sem motivo e {annuunt}.',
    '34:20': 'Porque, na verdade, {pacifice}: * e, falando na ira da terra, {cogitabant}.',
    '34:21': 'E {dilataverunt} {superme21} a sua boca: * disseram: {euge21}, os nossos olhos viram.',
    '34:22': 'Vós vistes, Senhor, {sileas}: * Senhor, não vos afasteis de mim.',
    '34:23': 'Levantai-vos e atendei ao meu juízo: * meu Deus e meu Senhor, à minha causa.',
    '34:24': 'Julgai-me segundo a vossa justiça, Senhor, meu Deus, * e não se alegrem à minha custa.',
    '34:25': 'Não digam nos seus corações: {euge25}, à nossa alma: * nem digam: Nós o devoramos.',
    '34:26': 'Corem e {revereantur26} juntos, * os que {gratulantur} com os meus males.',
    '34:26b': 'Vistam-se de vergonha e {reverentia} * os que falam grandezas {superme26}.',
    '34:27': 'Exultem e alegrem-se os que querem a minha justiça: * {order27}.',
    '34:28': 'E a minha língua meditará a vossa justiça, * {totadie}.',
}

dec('nocentes', ['34:1'], 'Júdica, Dómine, nocéntes me', 'glossary',
    'nocéntes (τοὺς ἀδικοῦντάς με), a participle as noun with an object. The row nocéntes → *malfeitores* (open, 26:2) itself names'
    ' 34:1 as the place where the object may ask for a clause: *os malfeitores* cannot take \'me\'. \'os que me fazem mal\' is'
    ' Matos Soares 1932 word for word and Douay-Rheims\'s \'them that wrong me\'. The verse is the Introit/Tract of Passion Monday'
    ' (missa Quad6-1) and a versicle (CommuneM/C2), grep.',
    o('os que me fazem mal', {'nocentes': 'os que me fazem mal'}, 'Ruling: the participle with its object (MS1932).', 'MS1932'),
    o('os malfeitores', {'nocentes': 'os malfeitores'}, 'The row (26:2); loses \'me\'.', 'glossary'),
    o('os que me prejudicam', {'nocentes': 'os que me prejudicam'}, 'nocére\'s plain verb; weaker.', 'draft'))

dec('expugna', ['34:1'], 'expúgna impugnántes me', 'word',
    'Two compounds of one root (ex-pugna / im-pugnántes; Greek πολέμησον τοὺς πολεμοῦντάς, one verb twice). \'combatei os que me'
    ' combatem\' keeps the play with one verb, as the Greek does and as Matos Soares 1932 does. The Tuesday Matins antiphon is'
    ' *Expúgna, Dómine, * impugnántes me* (Psalmi matutinum.txt, Day2, 34(1-10); grep).',
    o('combatei os que me combatem', {'expugna': 'combatei os que me combatem'}, 'Ruling: one root heard twice.', 'MS1932'),
    o('lutai contra os que lutam contra mim', {'expugna': 'lutai contra os que lutam contra mim'}, 'The same play, longer.', 'draft'))

dec('apprehende', ['34:2', '34:8'], 'Apprehénde arma et scutum … et cáptio … apprehéndat eum', 'word',
    'apprehéndere twice in the psalm, but under two Greek verbs (ἐπιλαβοῦ ὅπλου / συλλαβέτω αὐτούς) and two senses: the Lord taking'
    ' weapons in hand, a trap catching a man. By D15\'s test the Portuguese may vary. \'Empunhai\' is to take in the fist — the'
    ' concrete image of seizing arms; \'o apanhe\' is what a trap does. The row apprehéndere disciplínam → *abraçar* (2:12) is'
    ' another use. The colon is a versicle (Tempora/081-1, TemporaM/091-0; grep).',
    o('Empunhai … o apanhe', {'apprehende': 'Empunhai', 'apprehendat': 'apanhe'}, 'Ruling: two verbs, as the Greek.', 'draft'),
    o('Tomai … o apanhe', {'apprehende': 'Tomai', 'apprehendat': 'apanhe'}, 'MS1932 \'Toma\'; plainer, weaker than seize.', 'MS1932'),
    o('Agarrai … o agarre', {'apprehende': 'Agarrai', 'apprehendat': 'agarre'}, 'One verb for the Latin\'s one; rough for arms.', 'draft'))

dec('adjutorium', ['34:2'], 'et exsúrge in adjutórium mihi', 'glossary',
    'adjutórium → auxílio (glossary); exsúrgere → levantar-se (row; *Levantai-vos* is safe: past *levantei*). \'em meu auxílio\' is'
    ' the fixed phrase, without the article the possessive usually takes (the idiom \'em meu socorro\', Matos Soares 1932). The'
    ' future *Deus, in adjutórium meum inténde* is another build.',
    o('em meu auxílio', {'adjutorium': 'em meu auxílio'}, 'Ruling: the idiom.', 'draft'),
    o('em auxílio para mim', {'adjutorium': 'em auxílio para mim'}, 'The dative mihi heard; stiff.', 'draft'))

dec('effunde', ['34:3'], 'Effúnde frámeam', 'word',
    'effúndere is \'pour out\', and of things not liquid \'drive out, cast out, send out\' (L&S); with a sword it is drawing it out'
    ' (Greek ἔκχεον ῥομφαίαν, the same image). Douay-Rheims \'Bring out the sword\', Matos Soares 1932 \'Tira da espada\' (an old'
    ' idiom). \'Derramai a espada\' is the calque and says nothing in Portuguese; \'Desembainhai\' names the scabbard, which the'
    ' Latin does not. frámea → espada (glossary; 34:3 is named on the row).',
    o('Tirai', {'effunde': 'Tirai'}, 'Ruling: draw it out (plain).', 'draft'),
    o('Desembainhai', {'effunde': 'Desembainhai'}, 'Exact of swords; supplies the sheath.', 'draft'),
    o('Derramai', {'effunde': 'Derramai'}, 'The calque; opaque.', 'draft'))

dec('conclude', ['34:3'], 'et conclúde advérsus eos, qui persequúntur me', 'grammar',
    'conclúde with no object (σύγκλεισον ἐξ ἐναντίας, \'shut in, from the front\'). Portuguese \'fechar\' needs one: Douay-Rheims'
    ' supplies \'the way\', Matos Soares 1932 \'corta a passagem\'. \'fechai a passagem contra\' supplies the object (a noun Portuguese'
    ' needs, as 2:1 *coisas vãs*) and keeps advérsus as \'contra\'. \'caminho\' is avoided because via (34:6) has it. The row'
    ' conclúdere (a person) → *encerrar* (30:9) would make the persecutors the object — another sentence.',
    o('fechai a passagem contra', {'conclude': 'fechai a passagem contra'}, 'Ruling: the object supplied.', 'draft'),
    o('encerrai', {'conclude': 'encerrai'}, 'The row\'s verb, the persecutors its object.', 'glossary'),
    o('fechai o caminho aos', {'conclude': 'fechai o caminho aos'}, 'Douay-Rheims\'s noun; meets via (34:6).', 'DRB'))

dec('salus', ['34:3'], 'dic ánimæ meæ: Salus tua ego sum', 'order',
    'The Lord is asked to speak to the soul (tu: God speaks to one, D17). \'Eu sou a tua salvação\' is the plain order (Douay-Rheims'
    ' \'I am thy salvation\', Matos Soares 1932); the Latin fronts *Salus tua* and ends on *ego sum*, which in Portuguese (\'A tua'
    ' salvação sou eu\') becomes an emphasis on \'eu\' (it is I, no other) — sayable, but louder than the Latin\'s. salus →'
    ' salvação (D6). The verse is the Tract of Passion Monday (missa Quad6-1, grep).',
    o('Eu sou a tua salvação', {'salus': 'Eu sou a tua salvação'}, 'Ruling: the plain order.', 'DRB'),
    o('A tua salvação sou eu', {'salus': 'A tua salvação sou eu'}, 'The Latin\'s order; an emphasis.', 'draft'))

dec('revereri', ['34:4', '34:26', '34:26b'], 'Confundántur et revereántur … Erubéscant et revereántur simul … Induántur confusióne et reveréntia',
    'glossary',
    'Three words of shame meet in this psalm: confúndi → *ser envergonhado* (D15), erubéscere → *corar* (row), and reveréri /'
    ' reveréntia (ἐντραπήτωσαν, ἐντροπή: to be abashed, turned in on oneself), which needs a third. \'confundidos\' (Matos'
    ' Soares 1932) is the word D15 took from confúndi, because the blind reader heard \'confused\'; it would also stand beside'
    ' the Latin *confundántur* as another verb\'s rendering. *vexar* is to shame, and *vexame* a public shame — current in Brazil;'
    ' the noun gives 34:26b \'Vistam-se de vergonha e de vexame\' for *confusióne et reveréntia*, keeping confúsio → vergonha'
    ' (confúndi\'s noun). reveréri also 39:15 (twice), 69:3, 70:24, the noun 68:20 (grep) — new row proposed. *desconcertado* is'
    ' the option that says being thrown off; it has no plain noun.',
    o('vexados … vexados … vexame', {'revereantur': 'vexados', 'revereantur26': 'sejam vexados', 'reverentia': 'de vexame'},
      'Ruling: a third word of shame, with its noun.', 'draft'),
    o('confundidos … confundidos … confusão', {'revereantur': 'confundidos', 'revereantur26': 'sejam confundidos', 'reverentia': 'de confusão'},
      'Matos Soares 1932; confúndi\'s cognate on another verb.', 'MS1932'),
    o('desconcertados … desconcerto', {'revereantur': 'desconcertados', 'revereantur26': 'sejam desconcertados', 'reverentia': 'de desconcerto'},
      'Thrown off; the noun is weak.', 'draft'))

dec('avertantur', ['34:4b'], 'Avertántur retrórsum', 'word',
    'avértere + retrórsum (ἀποστραφήτωσαν εἰς τὰ ὀπίσω): \'be turned back\'. The avértere row gives *desviar*, but \'desviados'
    ' para trás\' is not Portuguese. 39:15 has the same Greek under another Latin verb (*Convertántur retrórsum*), 69:4 this very'
    ' colon (*Avertántur retrórsum, et erubéscant*), 128:5 *convertántur retrórsum* (grep): by D15\'s test the phrase may be one'
    ' Portuguese phrase, and convértere\'s *voltar* (glossary) gives it: \'Voltem para trás\' keeps retrórsum as its own words.'
    ' Matos Soares 1932 \'voltem atrás\'.',
    o('Voltem para trás', {'avertantur': 'Voltem para trás'}, 'Ruling: verb + retrórsum; 39:15, 69:4 can copy.', 'draft'),
    o('Recuem', {'avertantur': 'Recuem'}, 'One verb; retrórsum absorbed.', 'draft'),
    o('Voltem atrás', {'avertantur': 'Voltem atrás'}, 'Matos Soares 1932.', 'MS1932'))

dec('cogitare', ['34:4b', '34:20'], 'cogitántes mihi mala … dolos cogitábant', 'glossary',
    'cogitáre → pensar em (glossary; 20:12 *pensaram em desígnios*). With a plural object of evil: \'pensam males contra mim\','
    ' \'pensavam enganos\' — the verb of thinking kept (Greek λογιζόμενοι / διελογίζοντο), where Douay-Rheims and Matos Soares 1932'
    ' supply a verb of plotting (\'devise\', \'maquinavam\'). \'mala\' plural as the Latin; *pensar mal de* (think badly of) is'
    ' avoided by the plural and by \'contra\'. dolus → engano (glossary; the row names 34:20).',
    o('pensam males … pensavam enganos', {'cogitantes': 'pensam males', 'cogitabant': 'pensavam enganos'}, 'Ruling: the glossary verb.', 'glossary'),
    o('tramam males … tramavam enganos', {'cogitantes': 'tramam males', 'cogitabant': 'tramavam enganos'}, 'Plotting: explains the thinking.', 'draft'))

dec('participles', ['34:5', '34:6'], 'et Ángelus Dómini coárctans eos … et Ángelus Dómini pérsequens eos', 'grammar',
    'Both second cola are verbless: the angel with a present participle (ἐκθλίβων / καταδιώκων). Douay-Rheims and Matos Soares 1932'
    ' supply a jussive (\'let the angel … straiten them\', \'os coarcte\'). The Brazilian gerund keeps the Latin\'s participle and'
    ' its picture — the angel at work beside the curse — but ends the verse on \'-ando-os\', two light syllables after the stress'
    ' (rule 4). A relative clause (\'que os aperta … que os persegue\') keeps the Latin\'s verbless colon and its hanging syntax'
    ' (the angel is there, pressing; no second wish is stated) and ends on a paroxytone. The jussive is the plainest and closes'
    ' the ambiguity. The two verses are built alike.',
    o('que os aperta … que os persegue', {'coarctans': 'que os {coarctare_r}', 'persequens': 'que os persegue'},
      'Ruling: the participle as a relative; the cadence.', 'draft'),
    o('apertando-os … perseguindo-os', {'coarctans': '{coarctare}-os', 'persequens': 'perseguindo-os'},
      'The gerund; a weak cadence.', 'draft'),
    o('os aperte … os persiga', {'coarctans': 'os {coarctare_j}', 'persequens': 'os persiga'}, 'A jussive (DRB, MS1932).', 'DRB'))

dec('coarctare', ['34:5'], 'coárctans eos', 'word',
    'coarctáre, only here (grep): to press together, straiten, hem in (ἐκθλίβων, press hard). \'apertar\' is the plain verb of'
    ' pressing and hemming; \'estreitar\' is Douay-Rheims\'s \'straiten\' and is heard as narrowing a thing; \'acossar\' (harry) adds'
    ' pursuit, which 34:6 has.',
    o('aperta', {'coarctare_r': 'aperta', 'coarctare': 'apertando', 'coarctare_j': 'aperte'}, 'Ruling: plain.', 'draft'),
    o('estreita', {'coarctare_r': 'estreita', 'coarctare': 'estreitando', 'coarctare_j': 'estreite'}, 'Douay-Rheims \'straiten\'.', 'DRB'),
    o('acossa', {'coarctare_r': 'acossa', 'coarctare': 'acossando', 'coarctare_j': 'acosse'}, 'Adds pursuit.', 'draft'))

dec('lubricum', ['34:6'], 'Fiat via illórum ténebræ et lúbricum', 'grammar',
    'lúbricum is a neuter adjective used as a noun (ὀλίσθημα, a slippery place), beside the noun ténebræ. Portuguese supplies the'
    ' noun (\'lugar escorregadio\'), as 2:1 *inánia* → *coisas vãs*. Matos Soares 1932 mixes noun and adjective (\'em trevas e'
    ' escorregadio\'). \'o caminho deles\' for via illórum, so that \'seu\' is not heard as said to someone.',
    o('lugar escorregadio', {'lubricum': 'lugar escorregadio'}, 'Ruling: the noun supplied.', 'draft'),
    o('escorregadio', {'lubricum': 'escorregadio'}, 'Matos Soares 1932\'s build.', 'MS1932'))

dec('interitum', ['34:7'], 'gratis abscondérunt mihi intéritum láquei sui', 'word',
    'The Latin says they hid \'the destruction of their snare\' (διαφθορὰν παγίδος αὐτῶν): the snare\'s ruin, a genitive the Greek'
    ' also has. Douay-Rheims unravels it (\'hidden their net for me unto destruction\'), Matos Soares 1932 too (\'um laço, para me'
    ' perderem\'). Kept: intéritus → destruição (row, 9:16a), láqueus → laço (glossary). gratis → *sem motivo* and supervácue →'
    ' *em vão*, the two rows, both here as the row foresaw. \'para mim\' is the dative of disadvantage (\'esconderam-me\' would be'
    ' \'hid from me\').',
    o('a destruição do seu laço', {'interitum': 'a destruição do seu laço'}, 'Ruling: the Latin\'s genitive.', 'draft'),
    o('o seu laço para a minha destruição', {'interitum': 'o seu laço para a minha destruição'}, 'Douay-Rheims\'s reading; explains.', 'DRB'))

dec('ignorare', ['34:8', '34:11', '34:15'], 'láqueus, quem ignórat … quæ ignorábam … et ignorávi', 'word',
    'ignoráre three times (γινώσκω negated each time). Brazilian \'ignorar\' is heard first as \'take no notice of\' (\'o laço que'
    ' ele ignora\' = that he disregards). \'desconhecer\' is one verb for not knowing and serves 34:8 and 34:11; 34:15 is absolute'
    ' (*et ignorávi*, \'and I knew not\'), where \'desconheci\' cannot stand: \'e eu não sabia\' — the imperfect is how Portuguese'
    ' says an unknowing (grammar).',
    o('desconhece … desconhecia … não sabia', {'ignorat': 'desconhece', 'ignorabam': 'desconhecia', 'ignoravi': 'não sabia'},
      'Ruling.', 'draft'),
    o('ignora … ignorava … ignorei', {'ignorat': 'ignora', 'ignorabam': 'ignorava', 'ignoravi': 'o ignorei'},
      'The cognate (MS1932 \'ignora … ignorava\'); heard as disregard.', 'MS1932'))

dec('captio', ['34:8'], 'et cáptio, quam abscóndit', 'word',
    'cáptio: a catching, a device for catching (θήρα, the hunt or the prey). Douay-Rheims and Matos Soares 1932 \'net / rede\'.'
    ' \'armadilha\' names what catches without borrowing rete\'s \'rede\' (9:16b, 30:5 and others). The singulars of the Latin kept'
    ' (*illi … eum … cadat*): the psalm narrows to one enemy here.',
    o('armadilha', {'captio': 'armadilha'}, 'Ruling.', 'draft'),
    o('rede', {'captio': 'rede'}, 'Douay-Rheims, Matos Soares 1932; rete\'s word.', 'MS1932'))

dec('inipsum', ['34:8'], 'et in láqueum cadat in ipsum', 'grammar',
    'The Latin doubles the preposition (in láqueum … in ipsum; ἐν τῇ παγίδι πεσοῦνται ἐν αὐτῇ): \'into the snare, into that very one\'.'
    ' \'e caia no laço, nele mesmo\' keeps the doubling; Douay-Rheims \'into that very snare\' and Matos Soares 1932 \'no próprio'
    ' laço\' fold it into one phrase. \'nele mesmo\' can also be heard \'in himself\' — ipsum is masculine in the Latin too.',
    o('caia no laço, nele mesmo', {'inipsum': 'caia no laço, nele mesmo'}, 'Ruling: the doubling kept.', 'draft'),
    o('caia nesse mesmo laço', {'inipsum': 'caia nesse mesmo laço'}, 'One phrase (DRB).', 'DRB'))

dec('inops', ['34:10b'], 'Erípiens ínopem … egénum et páuperem', 'glossary',
    'All three of the psalter\'s words for the poor in one verse (inops, egénus, pauper; πτωχόν … πτωχὸν καὶ πένητα): three'
    ' Portuguese words are needed. The row (open) proposes *indigente / necessitado / pobre*; *indigente* has been listed as'
    ' unknown by the blind readers three times (Pss 11, 13). *desvalido* is Matos Soares 1932\'s word here (\'livras o desvalido\')'
    ' and is tried as the test. erípere with a source → *arrancar* (row).',
    o('desvalido', {'inops': 'desvalido'}, 'Ruling: MS1932\'s word, a test for the row.', 'MS1932'),
    o('indigente', {'inops': 'indigente'}, 'The row\'s proposal; unknown three times.', 'glossary'))

dec('vosque', ['34:10b'], 'Erípiens ínopem de manu fortiórum ejus', 'grammar',
    'The verse continues the question of 34:10 (*quis símilis tibi, erípiens …*): a participle agreeing with the one addressed. As a'
    ' prayed verse it must stand at the head of its own line; \'Vós que arrancais\' names the one the participle belongs to, as a'
    ' vocative clause, and keeps it verbless. A bare \'que arrancais\' opens a line on a relative.',
    o('Vós que arrancais', {'vosque': 'Vós que arrancais'}, 'Ruling.', 'draft'),
    o('Que arrancais', {'vosque': 'Que arrancais'}, 'The relative bare.', 'draft'))

dec('diripere', ['34:10b'], 'a diripiéntibus eum', 'word',
    'dirípere: tear apart, plunder (διαρπαζόντων). \'despojar\' is to strip a man of what he has (Douay-Rheims \'strip him\');'
    ' \'saquear\' is said of places; Matos Soares 1932 \'roubam\' is plain theft.',
    o('despojam', {'diripientibus': 'despojam'}, 'Ruling: Douay-Rheims.', 'DRB'),
    o('roubam', {'diripientibus': 'roubam'}, 'Matos Soares 1932.', 'MS1932'),
    o('saqueiam', {'diripientibus': 'saqueiam'}, 'Said of places.', 'draft'))

dec('surgentes', ['34:11'], 'Surgéntes testes iníqui, * quæ ignorábam interrogábant me', 'grammar',
    'A participle (\'rising up, unjust witnesses questioned me\') and a finite verb. Portuguese makes the first colon a clause, as'
    ' Matos Soares 1932 (\'Levantaram-se testemunhas iníquas\'); it echoes 26:12b *Levantaram-se contra mim testemunhas iníquas*'
    ' (insurrexérunt, the Passiontide responsory) without *contra*, which is not here. interrogáre → interrogar (row; the row names'
    ' 34:11). Douay-Rheims keeps the participle (\'Unjust witnesses rising up\').',
    o('Levantaram-se', {'surgentes': 'Levantaram-se'}, 'Ruling: a clause.', 'MS1932'),
    o('Levantando-se', {'surgentes': 'Levantando-se'}, 'The participle kept.', 'DRB'))

dec('sterilitatem', ['34:12'], 'sterilitátem ánimæ meæ', 'grammar',
    'An accusative in apposition to *mala*: what they paid back was barrenness (ἀτεκνίαν τῇ ψυχῇ μου, childlessness to my soul).'
    ' *ánimæ meæ* can be genitive or dative in Latin; the Greek is dative. \'esterilidade para a minha alma\' follows the Greek and'
    ' keeps the colon verbless; \'da minha alma\' is the other Latin reading. Douay-Rheims \'to the depriving me of my soul\','
    ' Matos Soares 1932 \'(era a) desolação\' — both explain. The image of barrenness kept.',
    o('esterilidade para a minha alma', {'sterilitatem': 'esterilidade para a minha alma'}, 'Ruling: the dative (the Greek).', 'draft'),
    o('a esterilidade da minha alma', {'sterilitatem': 'a esterilidade da minha alma'}, 'The genitive.', 'draft'))

dec('molesti', ['34:13'], 'cum mihi molésti essent', 'word',
    'molestus + esse (παρενοχλεῖν, to trouble). The cognate *molestar* is heard in Brazil as harassment (sexual, first); the'
    ' adjective *molesto* (Matos Soares 1932 \'me eram molestos\') is rare. \'me importunavam\' is the plain verb of troubling;'
    ' \'afligir\' is afflígere\'s. 54:4 *in ira molésti erant mihi* should follow. The verse is a Gradual and a versicle of'
    ' Passiontide (missa Quad6-2; horas Quad5-1; grep).',
    o('me importunavam', {'molesti': 'me importunavam'}, 'Ruling.', 'draft'),
    o('me eram molestos', {'molesti': 'me eram molestos'}, 'Matos Soares 1932: the cognate adjective.', 'MS1932'))

dec('sinu', ['34:13b'], 'et orátio mea in sinu meo convertétur', 'word',
    'sinus → \'seio\' (the bosom, as \'no seio do Pai\'); convértere → voltar (glossary); the future *convertétur* kept (ἀποστραφήσεται:'
    ' the Latin and the Greek are future; Matos Soares 1932 \'dava voltas\' makes it past). The line stays as open as the Latin'
    ' (prayer returning unheard, or returning as a blessing on the one who prays). *seio* is also the breast; *peito* is pectus\'s.'
    ' 73:11, 78:12, 88:51 have sinus (grep).',
    o('ao meu seio', {'sinu': 'ao meu seio'}, 'Ruling.', 'draft'),
    o('para o meu peito', {'sinu': 'para o meu peito'}, 'pectus\'s word.', 'draft'))

dec('lugens', ['34:14'], 'quasi lugens et contristátus', 'word',
    'lugére (πενθῶν): to mourn — \'estar de luto\', Matos Soares 1932 \'traz luto\'. contristári → entristecer-se (37:7, 41:10, 54:3'
    ' have it; grep). The rhyme agradava / humilhava at the two cadences is the Latin\'s own (complacébam / humiliábar).',
    o('está de luto e entristecido', {'lugens': 'está de luto e entristecido'}, 'Ruling.', 'MS1932'),
    o('chora e se entristece', {'lugens': 'chora e se entristece'}, 'Weeping; fletus\'s image.', 'draft'))

dec('superme', ['34:15', '34:16', '34:21', '34:26b'], 'advérsum me … frenduérunt super me … dilatavérunt super me … loquúntur super me', 'word',
    'Hostile *super me* / *advérsum me*: \'contra mim\' (Douay-Rheims \'against\', Matos Soares 1932 \'contra mim\'), so that'
    ' \'sobre mim\' is not heard as \'about me\'. The scourges gathered *super me* (34:15) keep \'sobre mim\' — physically upon.'
    ' Gloating *supergáudeant mihi* (34:19, 34:24) takes the row\'s *à minha custa* (29:2).',
    o('contra mim', {'adversum': 'contra mim', 'superme16': 'contra mim', 'superme21': 'contra mim', 'superme26': 'contra mim'},
      'Ruling.', 'MS1932'),
    o('sobre mim', {'adversum': 'contra mim', 'superme16': 'sobre mim', 'superme21': 'sobre mim', 'superme26': 'sobre mim'},
      'The Latin\'s preposition; heard as \'about\'.', 'draft'))

dec('congregare', ['34:15'], 'et convenérunt: * congregáta sunt super me flagélla', 'word',
    'Two Latin verbs (convenérunt, congregáta sunt) where the Greek has one twice (συνήχθησαν συνήχθησαν). convenire → reunir-se'
    ' (2:2 *se reuniram*); congregáre → \'juntar-se\': *congregar* was unknown to the Ps 15 blind reader. flagéllum → flagelo'
    ' (glossary). The Latin\'s two kept as two.',
    o('se reuniram … juntaram-se', {'convenerunt': 'se reuniram', 'congregata': 'juntaram-se'}, 'Ruling.', 'draft'),
    o('se juntaram … juntaram-se', {'convenerunt': 'se juntaram', 'congregata': 'juntaram-se'}, 'The Greek\'s repetition.', 'draft'),
    o('se reuniram … congregaram-se', {'convenerunt': 'se reuniram', 'congregata': 'congregaram-se'}, 'The cognate.', 'draft'))

dec('dissipati', ['34:16'], 'Dissipáti sunt, nec compúncti', 'glossary',
    'dissipáre with persons → dispersar (the row\'s proposal after 17:15, where *dissipou* was unknown). compúngi → the passive'
    ' participle (29:13 *não seja compungido*). Matos Soares 1932 \'não se arrependeram\' names what the sting leads to.',
    o('Foram dispersos', {'dissipati': 'Foram dispersos'}, 'Ruling: the row (persons).', 'glossary'),
    o('Foram dissipados', {'dissipati': 'Foram dissipados'}, 'The cognate (MS1932).', 'MS1932'))

dec('tentaverunt', ['34:16'], 'tentavérunt me', 'glossary',
    'The tentáre row (Ps 25) keeps *experimentar* where God tests and *tentar* where men tempt God, and says 34:16 — men trying the'
    ' psalmist — decides here. \'tentaram-me\' is the Latin\'s verb (ἐπείρασάν), and in the middle of insults it is heard as'
    ' provoking, trying; Matos Soares 1932 \'puseram-me à prova\'.',
    o('tentaram-me', {'tentaverunt': 'tentaram-me'}, 'Ruling: the verb.', 'draft'),
    o('puseram-me à prova', {'tentaverunt': 'puseram-me à prova'}, 'Matos Soares 1932; prova is probáre\'s family.', 'MS1932'))

dec('subsannatione', ['34:16'], 'subsannavérunt me subsannatióne', 'glossary',
    'A figura etymologica (ἐξεμυκτήρισάν με μυκτηρισμόν): the Latin repeats the root, as 4:6 *Sacrificáte sacrifícium*.'
    ' subsannáre → zombar de (row; 2:4). \'zombaram de mim com zombaria\' keeps the repetition; Matos Soares 1932 \'insultaram-me'
    ' com escárnios\' varies it.',
    o('zombaram de mim com zombaria', {'subsannatione': 'zombaram de mim com zombaria'}, 'Ruling: the repetition kept.', 'draft'),
    o('zombaram de mim com escárnio', {'subsannatione': 'zombaram de mim com escárnio'}, 'Varied.', 'draft'))

dec('restitue', ['34:17'], 'restítue ánimam meam a malignitáte eórum', 'glossary',
    'restitúere → restituir (row), but the vós imperative *restituí* is also \'I restored\' (rule 3; no enclitic here). \'Restaurai\''
    ' (past \'restaurei\') keeps the sense of giving back to its first state (ἀποκατάστησον). The Matins antiphon has another'
    ' Latin (*Restítue ánimam meam * a malefáctis eórum, Dómine*, Psalmi matutinum.txt, Day2 34(11-17)). Matos Soares 1932 \'Livra\''
    ' is liberáre\'s.',
    o('Restaurai', {'restitue': 'Restaurai'}, 'Ruling: safe at the imperative.', 'draft'),
    o('Fazei voltar', {'restitue': 'Fazei voltar'}, 'convértere\'s verb.', 'draft'))

dec('malignitate', ['34:17'], 'a malignitáte eórum', 'word',
    'malígnitas, only here (grep; κακουργία, evil-doing). \'malignidade\' is the cognate, heard in Brazil first as a medical word;'
    ' \'maldade\' is nequítia\'s (7:10) but the two never meet. malígnus → *malvado* (D24).',
    o('maldade', {'malignitate': 'maldade'}, 'Ruling: plain.', 'draft'),
    o('malignidade', {'malignitate': 'malignidade'}, 'Matos Soares 1932: the cognate.', 'MS1932'))

dec('unicam', ['34:17'], 'a leónibus únicam meam', 'glossary',
    'The twin of 21:21 *et de manu canis únicam meam* → *e a minha única, da mão do cão*; the row asks for a copy. Same build: the'
    ' object first so that the verse ends on \'leões\', not on the proparoxytone \'única\'. No \'e\': the Latin has none here.',
    o('a minha única, dos leões', {'unicam': 'a minha única, dos leões'}, 'Ruling: 21:21\'s build.', 'glossary'),
    o('dos leões a minha única', {'unicam': 'dos leões a minha única'}, 'The Latin\'s order; ends on única.', 'draft'))

dec('populo', ['34:18'], 'in pópulo gravi laudábo te', 'word',
    'gravis: heavy, weighty (βαρεῖ). Douay-Rheims \'a strong people\', Matos Soares 1932 \'um povo numeroso\' (which is also the'
    ' Hebrew\'s sense). \'grave\' keeps the Latin\'s word in its Portuguese sense — weighty, solemn — which is within gravis. The'
    ' Latin\'s chiasm (Confitébor … magna / in pópulo gravi laudábo) kept; confitéri / laudáre → *dar graças / louvar* (D5 names'
    ' this very verse); in ecclésia magna → *na grande assembleia* (formula, D34).',
    o('num povo grave', {'populo': 'num povo grave'}, 'Ruling: the Latin\'s word.', 'draft'),
    o('num povo numeroso', {'populo': 'num povo numeroso'}, 'Matos Soares 1932; the Hebrew\'s sense.', 'MS1932'),
    o('num povo forte', {'populo': 'num povo forte'}, 'Douay-Rheims.', 'DRB'))

dec('inique', ['34:19'], 'qui adversántur mihi iníque', 'word',
    'iníque (ἀδίκως). \'iniquamente\' keeps iníquus\'s family (24:4 *agir iniquamente*, listed unknown by one blind reader);'
    ' \'injustamente\' is plainer and belongs to injústus (35:2). adversári → opor-se a (row).',
    o('iniquamente', {'inique': 'iniquamente'}, 'Ruling: the family (24:4).', 'glossary'),
    o('injustamente', {'inique': 'injustamente'}, 'Plainer; injústus\'s family.', 'MS1932'))

dec('annuunt', ['34:19'], 'et ánnuunt óculis', 'word',
    'annúere óculis (διανεύοντες ὀφθαλμοῖς): nodding, signalling with the eyes — the complicity of the haters. \'fazem sinais com'
    ' os olhos\' says it; \'piscam os olhos\' can be heard as mere blinking; Matos Soares 1932 \'acenam\' is waving with the hand'
    ' in Brazil.',
    o('fazem sinais com os olhos', {'annuunt': 'fazem sinais com os olhos'}, 'Ruling.', 'draft'),
    o('piscam os olhos', {'annuunt': 'piscam os olhos'}, 'The wink; can be heard as blinking.', 'draft'),
    o('acenam com os olhos', {'annuunt': 'acenam com os olhos'}, 'Matos Soares 1932.', 'MS1932'))

dec('pacifice', ['34:20'], 'Quóniam mihi quidem pacífice loquebántur', 'word',
    'pacífice (εἰρηνικά): peaceably. \'me falavam pacificamente\' keeps the adverb; \'me falavam de paz\' (27:3b *falam de paz* for'
    ' *loquúntur pacem*) is the noun build of another verse. quidem → \'na verdade\' (Douay-Rheims \'indeed\'). iracúndia → ira'
    ' (17:48 *iracúndis* → *irados*); *in iracúndia terræ* kept as the Latin has it (the Greek lacks \'of the earth\').',
    o('me falavam pacificamente', {'pacifice': 'me falavam pacificamente'}, 'Ruling.', 'DRB'),
    o('me falavam de paz', {'pacifice': 'me falavam de paz'}, '27:3b\'s build (a noun).', 'draft'))

dec('dilataverunt', ['34:21'], 'Et dilatavérunt super me os suum', 'word',
    'dilatáre os (ἐπλάτυναν τὸ στόμα): widened the mouth. The dilatáre row keeps *dilatar* for the heart (118:32); of a mouth'
    ' opened wide in mockery Portuguese says \'escancarar\' — the image of the wide-open mouth, not an explanation. Matos Soares'
    ' 1932 \'alargaram\'.',
    o('escancararam', {'dilataverunt': 'escancararam'}, 'Ruling.', 'draft'),
    o('alargaram', {'dilataverunt': 'alargaram'}, 'Matos Soares 1932: the calque.', 'MS1932'),
    o('abriram muito', {'dilataverunt': 'abriram muito'}, 'Plain.', 'draft'))

dec('euge', ['34:21', '34:25'], 'Euge, euge (twice)', 'word',
    'euge (εὖγε): \'well done!\', here in the mouths of gloaters (39:16, 69:4 the same; grep). \'Bem feito!\' is what Brazilians say'
    ' of another\'s misfortune, and is also literally \'well done\'. \'Muito bem\' is neutral; Matos Soares 1932 \'Bem, bem\' /'
    ' \'Ainda bem\'. Both places alike; 34:25\'s dative *ánimæ nostræ* kept (\'à nossa alma\': to our soul\'s content).',
    o('Bem feito, bem feito', {'euge21': 'Bem feito, bem feito', 'euge25': 'Bem feito, bem feito'}, 'Ruling.', 'draft'),
    o('Muito bem, muito bem', {'euge21': 'Muito bem, muito bem', 'euge25': 'Muito bem, muito bem'}, 'Neutral.', 'draft'))

dec('sileas', ['34:22'], 'Vidísti, Dómine, ne síleas', 'glossary',
    'silére → ficar em silêncio (row, 27:1; tacére → calar-se). The verse is a Passiontide responsory and Mass verse (horas'
    ' Quad5-1, missa Quad5-5Feria, Quad5-6; grep). discédere a → afastar-se de (row; 21:11 *não vos afasteis de mim*).',
    o('não fiqueis em silêncio', {'sileas': 'não fiqueis em silêncio'}, 'Ruling: the row.', 'glossary'),
    o('não vos caleis', {'sileas': 'não vos caleis'}, 'tacére\'s verb.', 'MS1932'))

dec('gratulantur', ['34:26'], 'qui gratulántur malis meis', 'word',
    'gratulári (ἐπιχαίροντες, rejoicing over): \'se congratulam com\' keeps the Latin root (Matos Soares 1932 \'se congratulam dos\');'
    ' \'se alegram com\' would merge with lætári.',
    o('se congratulam', {'gratulantur': 'se congratulam'}, 'Ruling.', 'MS1932'),
    o('se alegram', {'gratulantur': 'se alegram'}, 'lætári\'s verb.', 'draft'))

dec('order27', ['34:27'], 'et dicant semper: Magnificétur Dóminus: qui volunt pacem servi ejus', 'order',
    'The subject of *dicant* comes after the quoted cry (*qui volunt*, plural, οἱ θέλοντες). Kept in that order, Portuguese hears it'
    ' as part of the cry, and of the Lord (Douay-Rheims so reads it: \'who delights\'). The subject is moved before the quotation'
    ' (Matos Soares 1932): order only (D2). magnificáre → engrandecer; velle → querer; servus → servo.',
    o('e digam sempre os que querem a paz do seu servo: Engrandecido seja o Senhor',
      {'order27': 'e digam sempre os que querem a paz do seu servo: Engrandecido seja o Senhor'}, 'Ruling.', 'MS1932'),
    o('e digam sempre: Engrandecido seja o Senhor, os que querem a paz do seu servo',
      {'order27': 'e digam sempre: Engrandecido seja o Senhor, os que querem a paz do seu servo'}, 'The Latin\'s order.', 'draft'))

dec('totadie', ['34:28'], 'tota die laudem tuam', 'order',
    'tota die → *o dia todo* (D24). In the Latin\'s order (\'o dia todo o vosso louvor\') the ear takes \'todo o vosso louvor\''
    ' (all your praise). The object first. The two cola are the versicle of Tuesday Matins (*V. Lingua mea meditábitur justítiam'
    ' tuam. R. Tota die laudem tuam, Dómine*, Psalmi matutinum.txt); the response reads alone either way. meditári + accusative'
    ' → meditar (2:1).',
    o('o vosso louvor o dia todo', {'totadie': 'o vosso louvor o dia todo'}, 'Ruling.', 'draft'),
    o('o dia todo o vosso louvor', {'totadie': 'o dia todo o vosso louvor'}, 'The Latin\'s order; misparsed.', 'draft'))

choices = {
    '34:1': 'Julgai (D2 glossary judicáre → julgar). The Introit and Tract of Passion Monday and Tuesday (missa Quad6-1, Quad6-2) sing 34:1–2 (grep).',
    '34:4': 'quæréntes ánimam meam → \'os que buscam a minha alma\' (quǽrere → buscar; 53:5). 39:15 and 69:3 are near twins — copy.',
    '34:4b': '69:4\'s first colon is word for word this colon\'s start (*Avertántur retrórsum, et erubéscant*) — copy the verb.',
    '34:5': 'fíeri → tornar-se (19:4); ante fáciem venti → \'diante da face do vento\' (the face kept).',
    '34:7': 'gratis → sem motivo, supervácue → em vão (both rows; the supervácue row names 34:7); exprobráre → afrontar (row).',
    '34:9': 'exsultáre → exultar; delectári → deleitar-se (delectátio → deleite); super salutári suo → \'na sua salvação\' (D6).',
    '34:10': 'The bones speak: *Senhor, quem é semelhante a vós?* (similis → semelhante).',
    '34:12': 'retribúere → retribuir (row, not at the imperative).',
    '34:13': 'cilícium → cilício (the saccus row keeps it apart from *pano de saco*); induere → vestir-se, as in 34:26b.',
    '34:13b': 'humiliáre → humilhar (row); in jejúnio → \'com o jejum\' (instrumental, Matos Soares 1932).',
    '34:14': 'próximus → próximo (row), off the cadence; complacére → agradar (row), object-less as the Latin.',
    '34:18': 'D5 names this verse (confitéri beside laudáre).',
    '34:19': 'supergaudére → alegrar-se à minha custa (row *super me*, 29:2; the row names 34:19, 34:24).',
    '34:23': 'inténdere → atender (D3); judícium → juízo; causa → causa (the judicáre row asked that 34:23 keep the two apart). The antiphon *Exsúrge, Dómine, * et inténde judício meo* (Day2 34(18-28)).',
    '34:24': '*Dómine, Deus meus* → *Senhor, meu Deus* (formula).',
    '34:25': 'devoráre → devorar; \'Nós o devoramos\' — the pronoun subject so that the object pronoun can stand before the verb.',
    '34:26': 'erubéscere → corar (row); simul → juntos (row).',
    '34:26b': 'confúsio → vergonha (confúndi → ser envergonhado, D15); magna loqui → \'falar grandezas\' (11:4 *que fala grandezas*).',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm34.txt, 32 prayed verses (34:1–34:28 with 34:4b, 34:10b, 34:13b, 34:26b: the repeated ids suffixed by latin.readVerses). No flex. Liturgy by grep (ps032/uses.py): the psalm is Tuesday Matins in three sections, 34(1-10), 34(11-17), 34(18-28), antiphons *Expúgna, Dómine, * impugnántes me*; *Restítue ánimam meam * a malefáctis eórum, Dómine* (another Latin than 34:17); *Exsúrge, Dómine, * et inténde judício meo*; versicle *Lingua mea meditábitur justítiam tuam. R. Tota die laudem tuam, Dómine*. 34:1–3 the Introit and Tract of Passion Monday (missa Quad6-1) and a Gradual of Passion Tuesday (Quad6-2, with 34:13); 34:2 a versicle; 34:13 a Passiontide versicle and Gradual (horas Quad5-1, missa 08-02, 09-18); 34:22 a Passiontide responsory and Mass verse. Not in the Diurnal Monástico (Matins).'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps034.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counts with ps005/grep_latin.py: coarctáre, lúbricum, malígnitas, gratulári, fréndere, sterílitas only here; reveréri 5 lines, supergaudére 3, Euge 4. The imprecations kept in force: the jussives stand as wishes (*Sejam envergonhados … Tornem-se … Venha sobre ele … caia*), the angel\'s participles as the Latin\'s. Glossary applied: D5 (34:18), D6, D15 (envergonhados), D24 (tota die), D34 (assembleia), gratis, supervácue, láqueus, exprobráre, erípere by source, adversári, super me, silére, discédere, frámea, próximus, interrogáre, unicam (21:21\'s build), exsúrgere, inténdere. Latin (= Greek) readings kept against the Hebrew: 34:3 *fechai a passagem* (not the spear), 34:7 *a destruição do seu laço*, 34:12 *esterilidade*, 34:13b the future *voltará*, 34:15 *flagelos* (the Hebrew\'s smiters), 34:16 *Foram dispersos, e não foram compungidos*, 34:20 *na ira da terra*, 34:21/25 *Euge*. Tests for the readers: \'vexados / vexame\', \'Voltem para trás\', \'que os aperta\', \'lugar escorregadio\', \'a destruição do seu laço\', \'desconhece\', \'desvalido\', \'esterilidade para a minha alma\', \'me importunavam\', \'voltará ao meu seio\', \'assim eu agradava\', \'tentaram-me\', \'zombaram de mim com zombaria\', \'Restaurai\', \'num povo grave\', \'Bem feito\', \'escancararam\'.'},
    {'step': 'checks', 'note': 'Draft 1: hard pass. Rhyme accepted as the Latin\'s own: 34:14 agradava / humilhava (complacébam / humiliábar). 34:5–6 the gerunds \'apertando-os / perseguindo-os\' put two light syllables after the final stress, so the participles became relatives (decision participles). Lengths accepted: 34:14 +6 / +7 (two \'como a um\', \'está de luto e entristecido\' for two Latin words), 34:6 first +6 (\'lugar\' supplied), 34:8 first +6 (the Latin\'s longest colon), 34:19 +5 / +5 (\'à minha custa\', \'fazem sinais com os olhos\'), 34:11 first +4, 34:10b first +3 (\'Vós que\'), 34:17 second −5, 34:7 second −4, 34:23 second −4, 34:24 first −4.'},
]

data = {'psalm': 34, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
