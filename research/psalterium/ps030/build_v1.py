"""Ps 30 draft 1. python3.13 research/psalterium/ps030/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '30:2': 'Em vós, Senhor, esperei: {confundar2}: * {libera}.',
    '30:3': 'Inclinai para mim o vosso ouvido, * apressai-vos a {eruas}.',
    '30:3b': 'Sede para mim {in_deum}, e uma casa de refúgio: * para me salvardes.',
    '30:4': 'Porque vós sois a minha força e o meu refúgio: * e por causa do vosso nome me guiareis, e me {enutries}.',
    '30:5': 'Vós me tirareis deste laço {abscond5}: * porque vós sois o meu protetor.',
    '30:6': 'Nas vossas mãos {commendo} o meu espírito: * vós me {redemisti}, Senhor, Deus da verdade.',
    '30:7': '{odisti} os que observam {vanitates}, * em vão.',
    '30:7b': 'Eu, porém, esperei no Senhor: * exultarei, e me alegrarei na vossa misericórdia.',
    '30:8': 'Porque olhastes para a minha {humilitatem}, * salvastes a minha alma das {necessitatibus}.',
    '30:9': 'E não me {conclusisti} nas mãos do inimigo: * firmastes os meus pés num lugar espaçoso.',
    '30:10': 'Tende piedade de mim, Senhor, porque estou atribulado: * está perturbado na ira o meu olho, a minha alma e o meu ventre:',
    '30:11': 'Porque a minha vida desfaleceu na dor: * e os meus anos, em gemidos.',
    '30:11b': 'O meu vigor enfraqueceu na pobreza: * e os meus ossos estão perturbados.',
    '30:12': '{super_omnes} tornei-me uma afronta, e {valde} para os meus vizinhos: * e temor para os meus conhecidos.',
    '30:12b': 'Os que me viam fugiram de mim para fora: * {oblivioni}, como um morto, {a_corde}.',
    '30:13': 'Tornei-me como um vaso {perditum}: * porque ouvi a {vituperatio} de muitos que moram ao redor.',
    '30:14': 'Enquanto se reuniam juntos contra mim, * {consiliati} tomar a minha alma.',
    '30:15': 'Eu, porém, esperei em vós, Senhor: * disse: Vós sois o meu Deus: nas vossas mãos {sortes}.',
    '30:16': 'Arrancai-me da mão dos meus inimigos, * e dos que me perseguem.',
    '30:17': '{illustra} a vossa face sobre o vosso servo, salvai-me na vossa misericórdia: * Senhor, {confundar17}, porque vos invoquei.',
    '30:18': '{erubescant} os ímpios, e sejam {deducantur} ao {inferno}: * tornem-se mudos os lábios enganadores.',
    '30:19': 'Que falam iniquidade contra o justo: * com soberba e com {abusione}.',
    '30:20': 'Como é grande, Senhor, a multidão da vossa doçura, * que escondestes para os que vos temem!',
    '30:20b': '{perfecisti} para os que esperam em vós, * à vista dos filhos dos homens.',
    '30:21': 'Vós os escondereis {in_abscondito} da vossa face, * da perturbação dos homens.',
    '30:21b': 'Vós os protegereis na vossa tenda, * da {contradictione} das línguas.',
    '30:22': 'Bendito o Senhor: * porque fez maravilhosa a sua misericórdia para mim numa cidade fortificada.',
    '30:23': 'Eu, porém, disse, {excessu}: * Fui lançado para longe da face dos vossos olhos.',
    '30:23b': '{ideo} escutastes a voz da minha oração, * quando eu clamava a vós.',
    '30:24': 'Amai o Senhor, vós, todos os seus santos: * porque o Senhor {requiret} a verdade, e retribuirá com abundância aos que {facientibus}.',
    '30:25': '{viriliter}, e que o vosso coração se fortaleça, * todos vós que esperais no Senhor.',
}

dec('confundar', ['30:2', '30:17'], 'non confúndar in ætérnum … Dómine, non confúndar', 'glossary',
    'confúndi → ser envergonhado (D15, settled): the Latin says \'non confúndar\' twice, and the two are one wording here. The form is both'
    ' the future and the present subjunctive (3rd conjugation); the Greek has the optative μὴ καταισχυνθείην in both places, and Douay-Rheims'
    ' (\'let me never be confounded\', \'Let me not be confounded\') and Matos Soares 1932 (\'Não permitas que eu seja jamais confundido\','
    ' \'não seja eu confundido\') take the wish. Ruled for the future, as 24:1 = 24:20 \'non erubéscam\' → \'não corarei\' (confidence,'
    ' the Greek\'s optative the option there too), because it is what the Latin form gives first, it keeps the two places and the psalter'
    ' consistent, and it lets 30:2 take D23\'s formula for a negated in ætérnum: \'para sempre\' first, so that the negation is not heard'
    ' as \'not for ever\' (14:5b \'para sempre não será abalado\', 29:7). **D15 said this line would be decided here:** 30:2a is the last'
    ' line of the Te Deum (Common/Prayers.txt, \'In te, Dómine, sperávi: * non confúndar in ætérnum\', grep) and = 70:1, and the'
    ' traditional Portuguese \'não serei confundido\' (from memory, unverified) is given up for D15\'s \'envergonhado\' — the blind reader'
    ' of Ps 118 heard \'confundido\' as \'confused\'. \'Jamais\' is what two stylists have asked for in this formula (14:5b, 29:7).',
    o('para sempre não serei envergonhado … não serei envergonhado',
      {'confundar2': 'para sempre não serei envergonhado', 'confundar17': 'não serei envergonhado'},
      'Ruling: the future, D15\'s verb, D23\'s formula.', 'glossary'),
    o('jamais serei envergonhado … não serei envergonhado',
      {'confundar2': 'jamais serei envergonhado', 'confundar17': 'não serei envergonhado'},
      'The stylists\' \'jamais\' (14:5b, 29:7): drops the phrase of in ætérnum.', 'stylist'),
    o('não seja eu envergonhado para sempre … não seja eu envergonhado',
      {'confundar2': 'não seja eu envergonhado para sempre', 'confundar17': 'não seja eu envergonhado'},
      'The wish (the Greek optative; DRB, MS1932). \'não … para sempre\' risks \'not for ever\'.', 'DRB'),
    o('para sempre não serei confundido … não serei confundido',
      {'confundar2': 'para sempre não serei confundido', 'confundar17': 'não serei confundido'},
      'The traditional verb (Te Deum, unverified): heard as \'confused\' (D15).', 'MS1932'))

dec('libera', ['30:2'], 'in justítia tua líbera me', 'order',
    'liberáre → livrar (glossary). The natural order, as 5:9 \'guiai-me na vossa justiça\'; the colon ends on a paroxytone. The Latin\'s order'
    ' is the Monday Sext antiphon \'In tua justítia * líbera me, Dómine\' (Psalmi minor.txt, grep), which can be built in its own order'
    ' (\'Na vossa justiça * livrai-me, Senhor\') as 26:1\'s antiphon was.',
    o('livrai-me na vossa justiça', {'libera': 'livrai-me na vossa justiça'}, 'Ruling: natural order (5:9).', 'draft'),
    o('na vossa justiça livrai-me', {'libera': 'na vossa justiça livrai-me'}, 'The Latin\'s order and the antiphon\'s.', 'draft'))

dec('eruas', ['30:3'], 'accélera ut éruas me', 'glossary',
    'éruere → arrancar with a source, libertar without (the row\'s proposal from 24:17/24:20; 118:153, 170 for erípere). Here no source is'
    ' named: \'arrancar-me\' would hang. acceleráre → apressar-se (glossary; the row names this verse). 70:2 has \'et salva me\' in its place.'
    ' Douay-Rheims \'make haste to deliver me\'; Matos Soares 1932 \'acode prontamente a livrar-me\'.',
    o('libertar-me', {'eruas': 'libertar-me'}, 'Ruling: the row, no source named.', 'glossary'),
    o('arrancar-me', {'eruas': 'arrancar-me'}, 'The row\'s verb with a source; hangs here.', 'glossary'))

dec('in_deum', ['30:3b'], 'Esto mihi in Deum protectórem, et in domum refúgii', 'grammar',
    '\'in\' + accusative of what one becomes (εἰς θεὸν ὑπερασπιστὴν … εἰς οἶκον καταφυγῆς, the Hebraism): \'be to me a protecting God\'.'
    ' The predicate said plainly, the preposition not reproduced (Douay-Rheims \'Be thou unto me a God, a protector, and a house of refuge\','
    ' Matos Soares 1932 \'Sê para mim um Deus protector, e uma casa de refúgio\'). protéctor → protetor (glossary); 70:3 = the first half'
    ' (\'in locum munítum\' there).',
    o('um Deus protetor', {'in_deum': 'um Deus protetor'}, 'Ruling: the predicate plain.', 'MS1932'),
    o('como Deus protetor', {'in_deum': 'como Deus protetor'}, 'The \'in\' heard as \'as\'.', 'draft'))

dec('enutries', ['30:4'], 'dedúces me, et enútries me', 'word',
    'enutríre: \'nourish, bring up\' (διαθρέψεις; 54:23 \'et ipse te enútriet\' the only other place, grep). 22:2 \'educávit me\' (ἐξέθρεψεν,'
    ' the same Greek root) → \'me nutriu\'; one root, one verb. dedúcere → guiar (D22). The two futures echo (-ireis / -areis) as the Latin\'s'
    ' dedúces / enútries do. Matos Soares 1932 \'me sustentarás\'; Douay-Rheims \'nourish me\'.',
    o('nutrireis', {'enutries': 'nutrireis'}, 'Ruling: 22:2\'s verb.', 'DRB'),
    o('sustentareis', {'enutries': 'sustentareis'}, 'Matos Soares 1932.', 'MS1932'),
    o('alimentareis', {'enutries': 'alimentareis'}, 'Plainer; food only.', 'draft'))

dec('abscond5', ['30:5'], 'de láqueo hoc, quem abscondérunt mihi', 'word',
    'abscóndere: the psalm says the root four times (30:5 abscondérunt, 30:20 abscondísti, 30:21 Abscóndes … in abscóndito): the snare'
    ' they hid for me, the sweetness you hid for those who fear you, the hiding place of your face. \'esconder\' in all four keeps the echo.'
    ' \'que me esconderam\' is heard as \'hid from me\'; \'para mim\' says the dative (Douay-Rheims \'which they have hidden for me\').'
    ' Matos Soares 1932 \'que me armaram escondidamente\' (a verb supplied). edúcere de → tirar de (29:4). láqueus → laço (glossary).',
    o('que esconderam para mim', {'abscond5': 'que esconderam para mim'}, 'Ruling: the root kept, the dative said.', 'DRB'),
    o('que me armaram às escondidas', {'abscond5': 'que me armaram às escondidas'}, 'Matos Soares 1932\'s build; the echo lost.', 'MS1932'))

dec('commendo', ['30:6'], 'In manus tuas comméndo spíritum meum', 'word',
    'commendáre: \'give in charge, entrust\' (παραθήσομαι, \'deposit with\'; only here in the psalter, grep). The verse stands alone as the'
    ' Compline short responsory (\'R.br. In manus tuas, Dómine, * Comméndo spíritum meum. V. Redemísti nos, Dómine, Deus veritátis\','
    ' Psalterium/Special/Minor Special.txt, grep) and is Christ\'s last word in Luke 23:46 (Clementine, fetched to'
    ' consult/bolls-VULG-42-23.json: \'Pater, in manus tuas commendo spiritum meum\' — the psalm\'s words after \'Pater\'). \'entrego\' is'
    ' the plain verb and how the line is said; it loses the deposit (\'into safe keeping\'). \'encomendo\' is the cognate (Matos Soares'
    ' 1932; Douay-Rheims \'commend\') but in Brazil is first \'to order goods\'. \'confio\' keeps the trust but is heard first as'
    ' \'I trust\'. The present tense is the Latin\'s (the Greek has a future). In Tridentine Compline 30:2–6 was said as a psalm'
    ' (Psalmi minor.txt [Tridentinum] \'Completorium … 4,30(2-6),90,133\'); in 1962 the psalm is Monday Sext (30(2-9), 30(10-19),'
    ' 30(20-25)).',
    o('entrego', {'commendo': 'entrego'}, 'Ruling: plain; how the line lives.', 'draft'),
    o('encomendo', {'commendo': 'encomendo'}, 'The cognate (MS1932, DRB).', 'MS1932'),
    o('confio', {'commendo': 'confio'}, 'The trust kept; heard first as \'I trust\'.', 'draft'))

dec('redemisti', ['30:6'], 'redemísti me, Dómine, Deus veritátis', 'glossary',
    'redímere → resgatar (glossary, open; the row names this verse and asks it to be weighed against \'remir\'). Weighed: \'remistes\' is'
    ' safe here (a perfect, no homograph), and it is the verb of the Redeemer; but the imperatives cannot take it (\'remi-me\' = \'I redeemed'
    ' myself\', rule 3; 118:134, 154 and 25:11 already say \'resgatai-me\'), so \'remir\' here would split one Latin verb (λυτρόομαι in'
    ' all its places) into two. \'Vós me resgatastes\' also serves the responsory\'s versicle \'Redemísti nos\' (\'Vós nos resgatastes\').'
    ' Deus veritátis → \'Deus da verdade\' (Douay-Rheims \'the God of truth\'); \'Deus de verdade\' (Matos Soares 1932) is heard \'a true God\'.',
    o('resgatastes', {'redemisti': 'resgatastes'}, 'Ruling: the row\'s one verb.', 'glossary'),
    o('remistes', {'redemisti': 'remistes'}, 'The Redeemer\'s verb (MS1932 \'remiste\'); splits the Latin verb.', 'MS1932'))

dec('odisti', ['30:7'], 'Odísti observántes vanitátes', 'grammar',
    'odísse is a perfect with present sense; 24:19 (\'me odeiam\') and 25:5 (\'Odeio\') took the present at the Latinist\'s asking. God hates'
    ' (the Greek ἐμίσησας is second person too; the Hebrew\'s \'I hate\' is not followed). \'Vós odiais\' names the subject, so the verse'
    ' does not open on a bare verb that could be heard as an order.',
    o('Vós odiais', {'odisti': 'Vós odiais'}, 'Ruling: the present sense (24:19, 25:5).', 'draft'),
    o('Odiastes', {'odisti': 'Odiastes'}, 'The perfect form (DRB \'Thou hast hated\').', 'DRB'))

dec('vanitates', ['30:7'], 'observántes vanitátes, * supervácue', 'glossary',
    'vánitas → vaidade (glossary; heard as conceit first, \'o que é vão\' the row\'s option). observáre: \'keep, pay heed to\''
    ' (διαφυλάσσοντας) — \'observar\' in its sense of keeping an observance, as of rites; here the vain things are idols or omens.'
    ' supervácue → \'em vão\' (glossary, 24:4), alone after the asterisk as DO points it; whether it goes with \'odiais\' or with'
    ' \'observam\' the Latin leaves open, and so does the Portuguese. Matos Soares 1932 \'os que inutilmente observam coisas vãs\'.',
    o('vaidades', {'vanitates': 'vaidades'}, 'Ruling: the row.', 'glossary'),
    o('coisas vãs', {'vanitates': 'coisas vãs'}, 'Matos Soares 1932; the row\'s option in spirit.', 'MS1932'))

dec('humilitatem', ['30:8'], 'respexísti humilitátem meam', 'glossary',
    'humílitas → humilhação (glossary, open; 9:14, 24:18, 118:153 \'Vede a minha humilhação\'); ταπείνωσις. \'humildade\' is heard as the'
    ' virtue. respícere → olhar para (12:3 \'olhai\'; ἐπεῖδες). Douay-Rheims \'my humility\'; Matos Soares 1932 \'o meu abatimento\'.',
    o('humilhação', {'humilitatem': 'humilhação'}, 'Ruling: the row.', 'glossary'),
    o('humildade', {'humilitatem': 'humildade'}, 'The cognate; heard as the virtue.', 'DRB'),
    o('abatimento', {'humilitatem': 'abatimento'}, 'Matos Soares 1932.', 'MS1932'))

dec('necessitatibus', ['30:8'], 'salvásti de necessitátibus ánimam meam', 'glossary',
    'necéssitas (plural) → necessidades (glossary, open; 24:17 \'libertai-me das minhas necessidades\'; the row names 30:8 and the refrain'
    ' of Ps 106). ἀναγκῶν, straits. Matos Soares 1932 \'das angústias\'; Douay-Rheims \'out of distresses\'.',
    o('necessidades', {'necessitatibus': 'necessidades'}, 'Ruling: the row.', 'glossary'),
    o('angústias', {'necessitatibus': 'angústias'}, 'Matos Soares 1932: the straits named.', 'MS1932'))

dec('conclusisti', ['30:9'], 'Nec conclusísti me in mánibus inimíci', 'word',
    'conclúdere: \'shut up, enclose\' (συνέκλεισας). \'encerrar\' is to shut someone in; 16:9b \'fecharam a sua gordura\' is another use'
    ' (to close). Douay-Rheims \'shut me up\'; Matos Soares 1932 \'não me entregaste\' (the sense, another verb).',
    o('encerrastes', {'conclusisti': 'encerrastes'}, 'Ruling: shut in.', 'DRB'),
    o('entregastes', {'conclusisti': 'entregastes'}, 'Matos Soares 1932: another verb.', 'MS1932'))

dec('super_omnes', ['30:12'], 'Super omnes inimícos meos factus sum oppróbrium et vicínis meis valde', 'ambiguity',
    'super + accusative (παρὰ πάντας τοὺς ἐχθρούς μου): \'beyond\' or \'among\'. Douay-Rheims \'among all my enemies\'; Matos Soares 1932'
    ' \'Mais que todos os meus inimigos\' (a comparison, which in Portuguese says the enemies are also a reproach). \'Entre\' keeps the'
    ' plainer sense and parallels the dative that follows. oppróbrium → afronta (glossary; 21:7 \'a afronta dos homens\').',
    o('Entre todos os meus inimigos', {'super_omnes': 'Entre todos os meus inimigos'}, 'Ruling: Douay-Rheims.', 'DRB'),
    o('Mais que todos os meus inimigos', {'super_omnes': 'Mais que todos os meus inimigos'}, 'Matos Soares 1932: a comparison.', 'MS1932'),
    o('Diante de todos os meus inimigos', {'super_omnes': 'Diante de todos os meus inimigos'}, 'Before them: a place.', 'draft'))

dec('valde', ['30:12'], 'et vicínis meis valde', 'glossary',
    'valde → muito (glossary). The adverb bears on the dative (\'and very much to my neighbours\'); \'sobretudo\' (Matos Soares 1932)'
    ' says the degree as a preference.',
    o('muito', {'valde': 'muito'}, 'Ruling: the row.', 'glossary'),
    o('sobretudo', {'valde': 'sobretudo'}, 'Matos Soares 1932.', 'MS1932'))

dec('oblivioni', ['30:12b'], 'oblivióni datus sum', 'word',
    '\'given to oblivion\' (the Greek simply ἐπελήσθην, \'I was forgotten\'). \'fui entregue ao esquecimento\' is how Portuguese says'
    ' oblivióni dare (136:5 \'oblivióni detur déxtera mea\' will want the same). Cost: \'entregar\' also stands in 30:6 for another verb.'
    ' Douay-Rheims \'I am forgotten\'; Matos Soares 1932 \'Fui esquecido\'.',
    o('fui entregue ao esquecimento', {'oblivioni': 'fui entregue ao esquecimento'}, 'Ruling: the Latin\'s phrase, idiomatic.', 'draft'),
    o('fui dado ao esquecimento', {'oblivioni': 'fui dado ao esquecimento'}, 'datus to the letter.', 'draft'),
    o('fui esquecido', {'oblivioni': 'fui esquecido'}, 'The sense (DRB, MS1932); the phrase lost.', 'DRB'))

dec('a_corde', ['30:12b'], 'tamquam mórtuus a corde', 'word',
    '\'as one dead, away from the heart\' — out of mind (ἀπὸ καρδίας). Douay-Rheims \'as one dead from the heart\'; Matos Soares 1932'
    ' \'pelos corações\' (turns it into the agent). \'longe do coração\' keeps the heart and the \'a\' of separation; \'fora\' is avoided'
    ' because the first colon has \'para fora\' (foras).',
    o('longe do coração', {'a_corde': 'longe do coração'}, 'Ruling: the separation said.', 'draft'),
    o('fora do coração', {'a_corde': 'fora do coração'}, 'Echoes \'para fora\' of the first colon.', 'draft'))

dec('perditum', ['30:13'], 'tamquam vas pérditum', 'word',
    'vas pérditum (σκεῦος ἀπολωλός): a vessel that is lost / ruined. vas → vaso (glossary, 2:9 \'vaso de oleiro\'). \'perdido\' keeps the'
    ' participle; Douay-Rheims \'destroyed\', Matos Soares 1932 \'quebrado\' (explains the ruin as breaking).',
    o('perdido', {'perditum': 'perdido'}, 'Ruling: the participle kept.', 'draft'),
    o('quebrado', {'perditum': 'quebrado'}, 'Matos Soares 1932.', 'MS1932'),
    o('arruinado', {'perditum': 'arruinado'}, 'The ruin said.', 'draft'))

dec('vituperatio', ['30:13'], 'audívi vituperatiónem multórum commorántium in circúitu', 'word',
    'vituperátio (ψόγος, \'blame\'; only here). \'vitupério\' is the cognate and bookish; \'censura\' is blame spoken; \'injúrias\''
    ' (Matos Soares 1932) is insult. commoráre → morar (\'that dwell\'; παροικούντων, sojourning); in circúitu → ao redor (glossary).',
    o('censura', {'vituperatio': 'censura'}, 'Ruling: blame spoken.', 'DRB'),
    o('difamação', {'vituperatio': 'difamação'}, 'Blame spread.', 'draft'),
    o('vitupério', {'vituperatio': 'vitupério'}, 'The cognate; bookish.', 'draft'))

dec('consiliati', ['30:14'], 'accípere ánimam meam consiliáti sunt', 'word',
    'consiliári (ἐβουλεύσαντο): \'took counsel\' — the family of consílium → conselho. \'deliberaram\' keeps the council; \'tramaram\''
    ' judges it. accípere → receber (glossary) — here \'take\' (λαβεῖν), as 17:17 \'me tomou\'. In eo dum → \'Enquanto\'; convenire →'
    ' reunir-se (2:2 \'se reuniram juntos\'); simul → juntos (glossary).',
    o('deliberaram', {'consiliati': 'deliberaram'}, 'Ruling: the council kept.', 'draft'),
    o('resolveram', {'consiliati': 'resolveram'}, 'Matos Soares 1932: the outcome.', 'MS1932'),
    o('tramaram', {'consiliati': 'tramaram'}, 'Judges the council.', 'draft'))

dec('sortes', ['30:15'], 'in mánibus tuis sortes meæ', 'word',
    'sortes: lots (plural). The Greek has οἱ καιροί μου, \'my times\' (the Hebrew too); the Latin reads another word, and the Latin is'
    ' followed. \'as minhas sortes\' keeps the number; singular \'a minha sorte\' is heard as \'my fate\', close, but a count lost. Douay-Rheims'
    ' \'My lots\'; Matos Soares 1932 \'o meu destino\'. A copula supplied (\'estão\').',
    o('estão as minhas sortes', {'sortes': 'estão as minhas sortes'}, 'Ruling: the plural kept.', 'DRB'),
    o('está a minha sorte', {'sortes': 'está a minha sorte'}, 'Singular: my fate.', 'draft'),
    o('está o meu destino', {'sortes': 'está o meu destino'}, 'Matos Soares 1932.', 'MS1932'))

dec('illustra', ['30:17'], 'Illústra fáciem tuam super servum tuum', 'glossary',
    'illustráre (only here) and 118:135 \'Fáciem tuam illúmina super servum tuum\' are one Greek verb (ἐπίφανον τὸ πρόσωπόν σου ἐπὶ'
    ' τὸν δοῦλόν σου in both, Rahlfs, consult/parallels/ps030.md and ps118.md): D15\'s test merges them, and the colon becomes 118:135\'s'
    ' word for word, \'Iluminai a vossa face sobre o vosso servo\' (the Sunday None antiphon quotes 118:135). The row illumináre stands'
    ' against the stylist\'s \'Fazei brilhar\' (118:135, twice). Douay-Rheims \'Make thy face to shine\'; Matos Soares 1932 \'Resplandeça a'
    ' claridade do teu rosto\'.',
    o('Iluminai', {'illustra': 'Iluminai'}, 'Ruling: = 118:135 (one Greek verb).', 'glossary'),
    o('Fazei brilhar', {'illustra': 'Fazei brilhar'}, 'The 118:135 stylist; DRB\'s idiom.', 'stylist'),
    o('Fazei resplandecer', {'illustra': 'Fazei resplandecer'}, 'Keeps a word of its own for illustráre.', 'draft'))

dec('erubescant', ['30:18'], 'Erubéscant ímpii', 'glossary',
    'erubéscere → corar (glossary, open; 6:11, 24:1): blind readers have listed it as unknown more than once. Here it answers 30:17\'s'
    ' \'não serei envergonhado\' (confúndi) — the Latin changes verb, and so does the Portuguese.',
    o('Corem', {'erubescant': 'Corem'}, 'Ruling: the row.', 'glossary'),
    o('Envergonhem-se', {'erubescant': 'Envergonhem-se'}, 'Merges with confúndi (D15).', 'MS1932'))

dec('deducantur', ['30:18'], 'deducántur in inférnum', 'word',
    'dedúci in (καταχθείησαν εἰς ᾅδου, \'be brought down\'): D22\'s \'guiar\' is for guidance, D25\'s \'fazer descer\' (7:6) has no passive'
    ' that can be said. \'conduzidos\' keeps dúcere, and the passive is safe (the homograph ban is on the imperative). Matos Soares 1932'
    ' \'sejam conduzidos ao sepulcro\'; Douay-Rheims \'brought down to hell\'.',
    o('conduzidos', {'deducantur': 'conduzidos'}, 'Ruling: the root and the passive kept.', 'MS1932'),
    o('levados', {'deducantur': 'levados'}, 'Plainer; ferre\'s word.', 'draft'),
    o('precipitados', {'deducantur': 'precipitados'}, 'The \'down\' said; too violent.', 'draft'))

dec('inferno', ['30:18'], 'in inférnum', 'glossary',
    'inférnus → inferno (glossary, open, for Gustavo — D22). Here a curse on the wicked, as 9:18: the damned\'s hell is no mishearing.'
    ' ᾅδου. Douay-Rheims \'hell\'; Matos Soares 1932 \'ao sepulcro\'.',
    o('inferno', {'inferno': 'inferno'}, 'Ruling: the row.', 'glossary'),
    o('mundo dos mortos', {'inferno': 'mundo dos mortos'}, 'The sense, explained.', 'draft'))

dec('abusione', ['30:19'], 'in supérbia, et in abusióne', 'word',
    'abúsio (only here; ἐξουδένωσις, \'contempt\', the noun of ἐξουδενόω, 21:7 abjéctio → desprezo). supérbia → soberba (16:9b).'
    ' Douay-Rheims \'with pride and abuse\'; Matos Soares 1932 \'com soberba e com despreso\'.',
    o('desprezo', {'abusione': 'desprezo'}, 'Ruling: the Greek\'s sense (MS1932).', 'MS1932'),
    o('abuso', {'abusione': 'abuso'}, 'The cognate: misuse, not scorn.', 'DRB'))

dec('perfecisti', ['30:20b'], 'Perfecísti eis, qui sperant in te', 'grammar',
    'perfícere → aperfeiçoar (glossary). The object is 30:20\'s \'quam\' (the sweetness), which governs both verbs; a verse of its own'
    ' needs the pronoun (\'a\'), and \'Vós\' so that it does not open on a clitic. ἐξειργάσω (\'wrought\'); Douay-Rheims \'Which thou hast'
    ' wrought\'. The Epiphany II responsory sings 30:20–20b (Tempora/Epi2-1.txt, grep: \'Et perfecísti eis qui sperant in te, Dómine\').',
    o('Vós a aperfeiçoastes', {'perfecisti': 'Vós a aperfeiçoastes'}, 'Ruling: the row\'s verb, the object supplied.', 'glossary'),
    o('E a realizastes', {'perfecisti': 'E a realizastes'}, 'The Greek\'s \'wrought\'.', 'draft'))

dec('in_abscondito', ['30:21'], 'Abscóndes eos in abscóndito faciéi tuæ', 'glossary',
    'in abscóndito → no lugar escondido (glossary, 26:5; the row names this verse). The root twice, as the Latin (and ἐν ἀποκρύφῳ).'
    ' Matos Soares 1932 \'no secreto da tua face\'.',
    o('no lugar escondido', {'in_abscondito': 'no lugar escondido'}, 'Ruling: 26:5.', 'glossary'),
    o('no segredo', {'in_abscondito': 'no segredo'}, 'Shorter; the root lost.', 'draft'))

dec('contradictione', ['30:21b'], 'a contradictióne linguárum', 'glossary',
    'contradíctio → contenda (glossary, 17:44: \'contradições\' was heard as inconsistencies). ἀντιλογίας. Cost: \'tenda … contenda\' in one'
    ' verse, an internal echo the Latin does not have (tabernáculo / contradictióne); the mediant is \'tenda\', the final \'línguas\', so no'
    ' cadence rhymes.',
    o('contenda', {'contradictione': 'contenda'}, 'Ruling: the row.', 'glossary'),
    o('contradição', {'contradictione': 'contradição'}, 'The cognate; heard as inconsistency (17:44).', 'MS1932'))

dec('excessu', ['30:23'], 'in excéssu mentis meæ', 'word',
    'excéssus mentis (ἐν τῇ ἐκστάσει μου): the mind going out of itself — alarm, bewilderment (the titulus \'pro extasi\'). \'excesso\' is'
    ' \'too much\' in Portuguese; \'êxtase\' is heard as mystical joy. \'fora de mim\' says the going-out plainly, which is the image'
    ' (ex-cédere); the word for mind is not said separately. 115:2 \'in excéssu meo\' and 67:28a \'in mentis excéssu\' can follow.'
    ' Douay-Rheims \'in the excess of my mind\'; Matos Soares 1932 \'no transporte do meu espírito\'.',
    o('fora de mim', {'excessu': 'fora de mim'}, 'Ruling: the going-out said.', 'draft'),
    o('no arrebatamento da minha mente', {'excessu': 'no arrebatamento da minha mente'}, 'mentis kept; heavy, and heard as rapture.', 'draft'),
    o('no excesso da minha mente', {'excessu': 'no excesso da minha mente'}, 'Douay-Rheims to the letter.', 'DRB'))

dec('ideo', ['30:23b'], 'Ídeo exaudísti', 'word',
    'Ídeo: \'therefore\' (διὰ τοῦτο). The Hebrew has \'but\'; the Latin (with the Greek) says \'therefore\', and is followed even where'
    ' it surprises. Matos Soares 1932 \'Mas tu ouviste\' (the Hebrew\'s sense).',
    o('Por isso', {'ideo': 'Por isso'}, 'Ruling: the Latin.', 'DRB'),
    o('Mas', {'ideo': 'Mas'}, 'Matos Soares 1932: the Hebrew\'s sense.', 'MS1932'))

dec('requiret', ['30:24'], 'veritátem requíret Dóminus', 'glossary',
    'requírere (to seek) → procurar (glossary, 24:10, 26:4, 26:8); ἀληθείας ἐκζητεῖ. The other row (\'pedir contas\', 9:13) is for'
    ' blood and sin. Douay-Rheims \'will require truth\'; Matos Soares 1932 \'procurará a verdade\'.',
    o('procurará', {'requiret': 'procurará'}, 'Ruling: the row (MS1932).', 'MS1932'),
    o('exigirá', {'requiret': 'exigirá'}, 'Douay-Rheims \'require\'.', 'DRB'))

dec('facientibus', ['30:24'], 'retríbuet abundánter faciéntibus supérbiam', 'word',
    'fácere supérbiam (100:7 \'qui facit supérbiam\', grep): \'to do pride\'. \'procedem com soberba\' (Matos Soares 1932\'s words) keeps'
    ' soberba and supplies the verb of conduct; \'praticam\' is operári\'s (glossary). retribúere → retribuir (17:21a); abundánter →'
    ' \'com abundância\' (abundántia → abundância, 29:7).',
    o('procedem com soberba', {'facientibus': 'procedem com soberba'}, 'Ruling: Matos Soares 1932.', 'MS1932'),
    o('agem com soberba', {'facientibus': 'agem com soberba'}, 'Plainer verb.', 'draft'))

dec('viriliter', ['30:25'], 'Viríliter ágite', 'glossary',
    'viríliter ágere → portar-se como homem (glossary, 26:14 \'porta-te como homem\'; the row proposes this plural). \'Agi\' is also \'I'
    ' acted\' (rule 3). The whole verse follows 26:14\'s second half (\'e que o teu coração se fortaleça\'). The verse is a versicle in'
    ' Sancti/Urbis/11-29 (grep).',
    o('Portai-vos como homens', {'viriliter': 'Portai-vos como homens'}, 'Ruling: 26:14 in the plural.', 'glossary'),
    o('Portai-vos varonilmente', {'viriliter': 'Portai-vos varonilmente'}, 'Matos Soares 1932; \'varonilmente\' was unknown to the Ps 26 reader.', 'MS1932'))

data = {
    'psalm': 30, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
    'verses': verses,
    'decisions': decisions,
    'choices': {
        '30:3': 'inclína ad me aurem tuam → the formula \'inclinai para mim o vosso ouvido\' (16:6; = 70:2a).',
        '30:3b': 'salvum me fácere → salvar (glossary); \'para me salvardes\' (the personal infinitive; \'para que me salveis\' rhymed with 30:4\'s \'nutrireis\' at the next final). = 70:3 up to \'in domum refúgii\' (70:3 \'in locum munítum\').',
        '30:4': 'fortitúdo → força; refúgium → refúgio; dedúcere → guiar (D22); \'por causa do vosso nome\' for propter nomen tuum.',
        '30:5': 'edúcere de → tirar de (29:4); protéctor → protetor (glossary). \'Vós me tirareis\' rather than the mesóclise.',
        '30:6': 'The verse stands alone, as the Compline responsory needs: \'Nas vossas mãos, Senhor, * entrego o meu espírito. V. Vós nos resgatastes, Senhor, Deus da verdade.\' The mediant falls on a proparoxytone (\'espírito\'), accepted: the Latin\'s own is \'spíritum meum\', and \'o espírito meu\' would be an inversion for its own sake.',
        '30:7b': 'exsultáre / lætári → exultar / alegrar-se (glossary).',
        '30:9': 'statúere → firmar (glossary; 39:3 \'státuit super petram pedes meos\'); in loco spatióso → \'num lugar espaçoso\', as the latitúdo row reserved.',
        '30:10': 'Miserére mei → Tende piedade de mim (formula); tribuláre → atribular (glossary); conturbáre → perturbar; óculus singular (glossary), as 6:8 \'O meu olho está perturbado pelo furor\'. The Latin\'s \'in ira\' has no owner, and neither has the Portuguese. The verb agrees with the nearest subject, as the Latin\'s.',
        '30:11': 'defícere → desfalecer (glossary); dolor → dor; gémitus → gemido.',
        '30:11b': 'infirmári → enfraquecer (17:37, 26:2b); virtus of a man → vigor (21:16, 29:8); paupértas → pobreza (πτωχεία; the Hebrew\'s \'iniquity\' not followed); the formula \'os meus ossos estão perturbados\' (6:3).',
        '30:12': 'vicínus → vizinho; timor → temor; noti → conhecidos.',
        '30:12b': 'foras goes with fugérunt, as DO\'s comma has it (Douay-Rheims reads \'saw me without\').',
        '30:13': 'commorári → morar; in circúitu → ao redor (glossary).',
        '30:15': 'The confession \'Deus meus es tu\' → \'Vós sois o meu Deus\'.',
        '30:16': 'erípere with a source → arrancar (glossary); pérsequi → perseguir.',
        '30:17': 'salvum me fac → salvai-me; invocáre → invocar.',
        '30:18': 'lábia dolósa → os lábios enganadores (11:3–4, 16:1b); mutus → mudo; fíeri + adjective → tornar-se.',
        '30:19': 'loqui iniquitátem → falar iniquidade (16:9b \'falou soberba\'); supérbia → soberba.',
        '30:20': 'Quam magna → \'Como é grande\' (8:2a \'como é admirável\'); multitúdo → multidão (glossary; \'a multidão da vossa doçura\', the Latin\'s image kept); dulcédo → doçura (glossary); timéntes te → os que vos temem. The Epiphany II responsory sings this verse (Tempora/Epi2-1.txt, grep).',
        '30:20b': 'in conspéctu → à vista de (glossary, 5:9); filii hóminum → os filhos dos homens.',
        '30:21b': 'prótegere → proteger; tabernáculum → tenda (glossary; 26:5).',
        '30:22': 'Benedíctus Dóminus → Bendito o Senhor (27:6); mirificáre → fazer maravilhoso (glossary); cívitas muníta → cidade fortificada (59:11 = 107:11).',
        '30:23': 'projícere → lançar (21:10); a fácie → da face de (glossary), \'para longe\' saying the \'a\'.',
        '30:23b': 'exaudíre → escutar (D3); vox oratiónis → a voz da minha oração; clamáre → clamar.',
        '30:24': 'dilígere → amar (safe: \'amai\' ≠ \'amei\'); sancti ejus (ὅσιοι) with \'vós\' so that the vocative is not heard as a second object (29:5 \'vós, seus santos\'); retribúere → retribuir.',
        '30:25': 'confortári → fortalecer-se, with \'que\' (26:14); speráre in → esperar em.',
    },
    'audit': [
        {'step': 'source', 'note': 'Latin = DO Psalm30.txt, 31 prayed verses: DO repeats 30:3, 30:7, 30:11, 30:12, 30:20, 30:21, 30:23, keyed with b by latin.readVerses. No 30:1 (the titulus, D7). No flex. Not in the Diurnal Monástico (the parallels file has no DM block). Clementine (Bolls VULG, fetched to consult/bolls-VULG-19-30.json): no difference of wording. Uses checked by grep in DO\'s Latin: Monday Sext, 30(2-9), 30(10-19), 30(20-25), antiphon \'In tua justítia * líbera me, Dómine\' (Psalmi minor.txt); Tridentine Compline 4, 30(2-6), 90, 133 (same file, [Tridentinum]); the Compline short responsory \'In manus tuas, Dómine, * Comméndo spíritum meum. V. Redemísti nos, Dómine, Deus veritátis\' (Special/Minor Special.txt); the Te Deum\'s last line = 30:2a (Common/Prayers.txt); responsory 30:20–20b (Tempora/Epi2-1.txt); versicle 30:25 (Sancti/Urbis/11-29). Luke 23:46 (Clementine, consult/bolls-VULG-42-23.json): \'Pater, in manus tuas commendo spiritum meum\'. 70:1–3 is near-identical to 30:2–3b.'},
        {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps030.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: commendáre, paupértas, vituperátio, commorári, consiliári, sortes, illustráre, abúsio, conturbátio, abundánter only here; enutríre 30:4, 54:23; excéssus 30:23, 67:28a, 115:2; fácere supérbiam 30:24, 100:7; civitas / locus munítus 30:22, 59:11, 70:3, 107:11. Latin (= Greek) readings kept against the Hebrew: 30:7 \'Vós odiais\' (not \'I hate\'), 30:11b \'na pobreza\' (not \'iniquity\'), 30:12b–13 order, 30:15 \'as minhas sortes\' (the Latin against the Greek\'s \'times\' too), 30:23b \'Por isso\' (not \'but\'). Tests for the readers: \'para sempre não serei envergonhado\', \'observam vaidades, em vão\', \'vaso perdido\', \'longe do coração\', \'fora de mim\', \'as minhas sortes\', \'tenda … contenda\', \'Vós a aperfeiçoastes\'.'},
    ],
}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(decisions), 'decisions')
