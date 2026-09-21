"""Ps 29 draft 1. python3.13 research/psalterium/ps029/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '29:2': 'Eu vos exaltarei, Senhor, porque me {suscepisti}: * e não {delectasti} os meus inimigos {super_me}.',
    '29:3': 'Senhor, meu Deus, clamei a vós, * e me curastes.',
    '29:4': 'Senhor, {eduxisti} do {inferno} a minha alma: * salvastes-me dos que descem à cova.',
    '29:5': '{Psallite} ao Senhor, {sancti}: * e {confitemini} à {memoriae} da sua santidade.',
    '29:6': 'Porque {ira6}: * e {vita6}.',
    '29:6b': '{vesperum} se {demorabitur} o pranto: * e {matutinum}, a alegria.',
    '29:7': 'Eu, porém, disse na minha {abundantia}: * {non_movebor}.',
    '29:8': 'Senhor, {voluntate8}, * {praestitisti} {virtutem8} {decori}.',
    '29:8b': 'Desviastes de mim a vossa face, * e fiquei perturbado.',
    '29:9': 'A vós, Senhor, clamarei: * e ao meu Deus suplicarei.',
    '29:10': 'Que {utilitas} há no meu sangue, * enquanto desço à corrupção?',
    '29:10b': 'Acaso o pó vos {confitebitur}, * ou anunciará a vossa verdade?',
    '29:11': 'O Senhor ouviu, e teve piedade de mim: * o Senhor se fez o meu {adjutor}.',
    '29:12': '{convertisti} o meu {planctum} em {gaudium} para mim: * rasgastes {saccum}, e me cercastes de alegria:',
    '29:13': 'Para que a minha {gloria_mea} vos cante, e eu {compungar}: * Senhor, meu Deus, para sempre vos {confitebor}.',
}

dec('suscepisti', ['29:2'], 'quóniam suscepísti me', 'glossary',
    'suscípere with a person as object → amparar (D19; ὑπέλαβές με, \'you took me up\'). 3:6 \'o Senhor me amparou\', 17:36a. The Matins antiphon'
    ' \'Exaltábo te, * Dómine, quóniam suscepísti me\' (Psalmi matutinum.txt) and the versicle of the Immaculate Conception and of Our Lady'
    ' Aparecida (Sancti/12-08.txt, Sancti/Brasilia/10-12-BMVApparecida.txt, grep) sing this colon. Douay-Rheims \'upheld me\'; Matos Soares'
    ' 1932 \'me recebeste\'.',
    o('amparastes', {'suscepisti': 'amparastes'}, 'Ruling: D19.', 'glossary'),
    o('recebestes', {'suscepisti': 'recebestes'}, 'Matos Soares 1932: accípere\'s word.', 'MS1932'),
    o('acolhestes', {'suscepisti': 'acolhestes'}, 'The glossary\'s suscípere with a thing (6:10).', 'glossary'))

dec('delectasti', ['29:2'], 'nec delectásti inimícos meos', 'word',
    'delectáre: \'delight, gladden\' — here causative, with the enemies as object (οὐκ ηὔφρανας, the verb behind lætificáre → alegrar,'
    ' glossary, 20:7, 18:9). D15\'s test lets the two Latin verbs share \'alegrar\'; \'deleitar\' is bookish and would be heard as sensual'
    ' pleasure. Douay-Rheims \'hast not made my enemies to rejoice\'; Matos Soares 1932 \'não permitiste que … se alegrassem\' (supplies a'
    ' permission the Latin does not have).',
    o('alegrastes', {'delectasti': 'alegrastes'}, 'Ruling: lætificáre\'s verb (one Greek verb).', 'draft'),
    o('deleitastes', {'delectasti': 'deleitastes'}, 'The cognate; bookish.', 'draft'),
    o('deixastes alegrar-se', {'delectasti': 'deixastes alegrar-se'}, 'Matos Soares 1932\'s permission: not the Latin\'s causative.', 'MS1932'))

dec('super_me', ['29:2'], 'inimícos meos super me', 'grammar',
    'super me: \'over me\' — the enemies\' joy standing over the fallen man (ἐπ᾽ ἐμέ). \'sobre mim\' after \'alegrar\' is heard as \'about me\''
    ' and the colon hangs; \'à minha custa\' is how Portuguese says the gloating relation (Matos Soares 1932\'s words), a preposition'
    ' changed, the image of joy over someone kept. Douay-Rheims \'over me\'. The versicle\'s response \'Nec delectásti inimícos meos super me\''
    ' (12-08) closes on it.',
    o('à minha custa', {'super_me': 'à minha custa'}, 'Ruling: the gloating relation in Portuguese (Matos Soares 1932).', 'MS1932'),
    o('sobre mim', {'super_me': 'sobre mim'}, 'The preposition to the letter (Douay-Rheims \'over me\').', 'DRB'))

dec('eduxisti', ['29:4'], 'eduxísti ab inférno ánimam meam', 'glossary',
    'edúcere → fazer sair (glossary, open; 17:20); the row says the places with a source (\'de\', here \'ab\') may want \'tirar de\' (30:5,'
    ' 39:3, 106:14). \'tirastes do inferno a minha alma\' is plain and keeps the source; \'fizestes sair\' is heavier. ἀνήγαγες (\'brought up\').'
    ' Douay-Rheims \'brought forth\'; Matos Soares 1932 \'tiraste\'.',
    o('tirastes', {'eduxisti': 'tirastes'}, 'Ruling: tirar de, as the row foresees for a source.', 'MS1932'),
    o('fizestes sair', {'eduxisti': 'fizestes sair'}, 'The glossary\'s verb (17:20).', 'glossary'))

dec('inferno', ['29:4'], 'ab inférno', 'glossary',
    'inférnus → inferno (glossary, open, for Gustavo — D22; 6:6, 9:18, 15:10, 17:6 hold it). Here the soul brought back from it: the'
    ' realm of the dead (the Hebrew\'s Sheol; the Greek ᾅδου). The blind readers of 6:6 and 15:10 heard the hell of the damned first.'
    ' Matos Soares 1932 keeps \'inferno\' here (his note explains \'the grave\'); Douay-Rheims \'hell\'.',
    o('inferno', {'inferno': 'inferno'}, 'Ruling: the row\'s word, pending Gustavo.', 'glossary'),
    o('mundo dos mortos', {'inferno': 'mundo dos mortos'}, 'The sense, explained.', 'draft'))

dec('sancti', ['29:5'], 'Psállite Dómino, sancti ejus', 'grammar',
    'The vocative \'sancti ejus\' (οἱ ὅσιοι αὐτοῦ): bare, \'ao Senhor, seus santos\' is heard as a second dative (to the Lord and his saints).'
    ' \'vós\', the plural address pronoun, marks it (D2: a subject pronoun may be supplied); Matos Soares 1932 turns the order'
    ' (\'Santos do Senhor, cantai-lhe hinos\'), Douay-Rheims \'O ye his saints\'. sanctus (ὅσιος) → santo (glossary). The Matins versicle'
    ' \'V. Psállite Dómino sancti ejus. R. Et confitémini memóriæ sanctitátis ejus\' (Psalmi matutinum.txt, grep) is this verse.',
    o('vós, seus santos', {'sancti': 'vós, seus santos'}, 'Ruling: the vocative marked.', 'draft'),
    o('ó seus santos', {'sancti': 'ó seus santos'}, 'Douay-Rheims \'O ye\'.', 'DRB'),
    o('seus santos', {'sancti': 'seus santos'}, 'Bare: heard as a second dative.', 'draft'))

dec('psallite', ['29:5'], 'Psállite Dómino', 'glossary',
    'psállere → entoar salmos (D25). \'Entoai\' is safe (past \'entoei\').',
    o('Entoai salmos', {'Psallite': 'Entoai salmos'}, 'Ruling: D25.', 'glossary'))

dec('confiteri', ['29:5', '29:10b', '29:13'], 'confitémini … confitébitur tibi … confitébor tibi', 'glossary',
    'confitéri to God → dar graças a (D5), three times in the psalm, each with its dative: \'dai graças à memória\', \'vos dará graças\','
    ' \'vos darei graças\'. 29:10b is 6:6\'s question in another mouth (\'no inferno, porém, quem vos dará graças?\'), and holds the same'
    ' words; 29:13 closes the psalm as 117:28a does (\'e eu vos darei graças\').',
    o('dai graças … dará graças … darei graças',
      {'confitemini': 'dai graças', 'confitebitur': 'dará graças', 'confitebor': 'darei graças'}, 'Ruling: D5.', 'glossary'),
    o('louvai … louvará … louvarei', {'confitemini': 'louvai', 'confitebitur': 'louvará', 'confitebor': 'louvarei'},
      'Matos Soares 1932 (29:13 \'eu te louvarei\'): laudáre\'s verb (D5).', 'MS1932'))

dec('memoriae', ['29:5'], 'confitémini memóriæ sanctitátis ejus', 'word',
    'memória: \'remembrance, memorial\' (τῇ μνήμῃ τῆς ἁγιωσύνης αὐτοῦ). The Latin\'s phrase is kept whole: thanks given to the memory of his'
    ' holiness. 96:12 has the near twin \'confitémini memóriæ sanctificatiónis ejus\' (grep; another noun) — formula row. Douay-Rheims'
    ' \'give praise to the memory of his holiness\'; Matos Soares 1932 \'celebrai a sua santa memória\' (the genitive made an adjective).',
    o('memória', {'memoriae': 'memória'}, 'Ruling: the Latin\'s word.', 'DRB'),
    o('lembrança', {'memoriae': 'lembrança'}, 'Plainer; memória\'s everyday sense.', 'draft'))

dec('ira6', ['29:6'], 'Quóniam ira in indignatióne ejus: * et vita in voluntáte ejus', 'grammar',
    'Two verbless members (ὅτι ὀργὴ ἐν τῷ θυμῷ αὐτοῦ, καὶ ζωὴ ἐν τῷ θελήματι αὐτοῦ): in his indignation there is wrath, in his will there is'
    ' life. \'há\' is the existential verb Portuguese supplies, once, and the second member shares it — the Latin\'s balance kept. Douay-Rheims'
    ' \'wrath is in his indignation\' makes the nouns subjects; Matos Soares 1932 paraphrases (\'ele castiga-nos na sua ira, e dá-nos a vida\').'
    ' indignátio → indignação; volúntas → vontade (glossary: the Latin\'s word, not the Hebrew\'s \'favour\').',
    o('há ira na sua indignação … vida na sua vontade',
      {'ira6': 'há ira na sua indignação', 'vita6': 'vida na sua vontade'}, 'Ruling: the existential verb, once.', 'draft'),
    o('a ira está na sua indignação … a vida na sua vontade',
      {'ira6': 'a ira está na sua indignação', 'vita6': 'a vida na sua vontade'}, 'Douay-Rheims\'s build.', 'DRB'))

dec('vesperum', ['29:6b'], 'Ad vésperum … et ad matutínum', 'word',
    'Evening and morning, both with \'ad\' (τὸ ἑσπέρας … εἰς τὸ πρωί). \'À tarde … pela manhã\' are the plain adverbials; Ps 24:13\'s note'
    ' already foresaw \'à tarde se demorará o pranto\'. mane → de manhã is the glossary\'s for mane; matutínum is another word (\'pela'
    ' manhã\'). \'Ao entardecer … ao amanhecer\' keeps the preposition\'s \'towards\' and the parallel exactly, at the cost of two longer'
    ' words. Matos Soares 1932 \'De tarde … e de manhã\'.',
    o('À tarde … pela manhã', {'vesperum': 'À tarde', 'matutinum': 'pela manhã'}, 'Ruling: plain.', 'draft'),
    o('Ao entardecer … ao amanhecer', {'vesperum': 'Ao entardecer', 'matutinum': 'ao amanhecer'}, 'The \'ad\' and the parallel exact.', 'draft'),
    o('De tarde … de manhã', {'vesperum': 'De tarde', 'matutinum': 'de manhã'}, 'Matos Soares 1932.', 'MS1932'))

dec('demorabitur', ['29:6b'], 'demorábitur fletus', 'glossary',
    'demorári → demorar-se (glossary, open; 24:13 \'A sua alma se demorará entre coisas boas\'; αὐλισθήσεται, \'shall lodge for the night\'):'
    ' weeping lingers as a guest for the evening. fletus → pranto (glossary, 6:9). Douay-Rheims \'weeping shall have place\'.',
    o('demorará', {'demorabitur': 'demorará'}, 'Ruling: glossary (24:13).', 'glossary'),
    o('hospedará', {'demorabitur': 'hospedará'}, 'The Greek\'s \'lodge\'; not the Latin\'s verb.', 'draft'))

dec('abundantia', ['29:7'], 'in abundántia mea', 'word',
    'abundántia (εὐθηνία, \'prosperity\'): the Latin\'s word, 8 lines (grep: 32:17, 71:7, 77:25, 121:6–7, 122:4, 144:7). Douay-Rheims'
    ' \'in my abundance\'; Matos Soares 1932 \'no meio da minha prosperidade\' (the Greek\'s sense).',
    o('abundância', {'abundantia': 'abundância'}, 'Ruling: the Latin\'s word.', 'DRB'),
    o('prosperidade', {'abundantia': 'prosperidade'}, 'Matos Soares 1932: the sense named.', 'MS1932'))

dec('non_movebor', ['29:7'], 'Non movébor in ætérnum', 'glossary',
    'movéri → ser abalado (glossary); in ætérnum → para sempre (D23). Under a negation \'para sempre\' must stand before it, as 14:5b'
    ' (\'para sempre não será abalado\') and 118:93, or \'Não serei abalado para sempre\' is heard as \'I shall be shaken, but not for'
    ' ever\'. The stylist of Ps 14 named that build his worst line and asked for \'jamais\' — the option. 9:27 and 61:3 have \'Non movébor\''
    ' with other complements (grep).',
    o('Para sempre não serei abalado', {'non_movebor': 'Para sempre não serei abalado'}, 'Ruling: 14:5b\'s build.', 'glossary'),
    o('Jamais serei abalado', {'non_movebor': 'Jamais serei abalado'}, 'The Ps 14 stylist\'s word; drops in ætérnum\'s phrase.', 'stylist'),
    o('Não serei abalado para sempre', {'non_movebor': 'Não serei abalado para sempre'}, 'The Latin\'s order: \'not for ever\'.', 'draft'))

dec('voluntate8', ['29:8'], 'Dómine, in voluntáte tua', 'grammar',
    '\'in\' here is instrumental — by your good will (ἐν τῷ θελήματί σου); in 29:6 it is locative (life is in his will). The noun repeats'
    ' (vontade … vontade), the preposition follows the sense: \'pela vossa vontade\'. Douay-Rheims \'in thy favour\'; Matos Soares 1932 \'foi'
    ' por tua vontade\'.',
    o('pela vossa vontade', {'voluntate8': 'pela vossa vontade'}, 'Ruling: the instrumental heard.', 'MS1932'),
    o('na vossa vontade', {'voluntate8': 'na vossa vontade'}, 'The preposition as 29:6.', 'DRB'))

dec('praestitisti', ['29:8'], 'præstitísti decóri meo virtútem', 'word',
    'præstáre: \'furnish, supply\' (παρέσχου). \'dar\' is plain; \'conceder\' marks the gift as favour. 18:8 \'sapiéntiam præstans\' (grep) is'
    ' the other place.',
    o('destes', {'praestitisti': 'destes'}, 'Ruling: plain.', 'draft'),
    o('concedestes', {'praestitisti': 'concedestes'}, 'The favour named.', 'draft'))

dec('virtutem8', ['29:8'], 'virtútem', 'glossary',
    'virtus: the glossary gives God\'s virtus \'poder\' and proposes \'vigor\' for a man\'s own strength (21:16). Here the strength is the'
    ' man\'s, given to his decor (δύναμιν): \'vigor\'. Douay-Rheims \'strength\'; Matos Soares 1932 \'firmeza\'.',
    o('vigor', {'virtutem8': 'vigor'}, 'Ruling: the row\'s proposal for a man\'s strength.', 'glossary'),
    o('poder', {'virtutem8': 'poder'}, 'The row\'s word for God\'s virtus.', 'glossary'),
    o('força', {'virtutem8': 'força'}, 'Douay-Rheims; fortitúdo\'s word.', 'DRB'))

dec('decori', ['29:8'], 'decóri meo', 'glossary',
    'decor → esplendor (glossary, open; 20:6; the row names 29:8), kept apart from pulchritúdo → beleza. τῷ κάλλει μου (\'my beauty\').'
    ' The object after the gift, the Latin\'s order (the dative before the accusative is inverted to put the thing given first, as'
    ' Portuguese does). Douay-Rheims \'to my beauty\'; Matos Soares 1932 \'à minha prosperidade\'.',
    o('ao meu esplendor', {'decori': 'ao meu esplendor'}, 'Ruling: glossary.', 'glossary'),
    o('à minha beleza', {'decori': 'à minha beleza'}, 'Douay-Rheims; pulchritúdo\'s word.', 'DRB'))

dec('utilitas', ['29:10'], 'Quæ utílitas in sánguine meo', 'word',
    'utílitas: \'profit, advantage\' (ὠφέλεια). Only here (grep). \'proveito\' is the plain word; \'utilidade\' (Matos Soares 1932) is heavy'
    ' and technical. The verb \'há\' supplied (the Latin is verbless). sanguis → sangue (the singular; D29 is about the plural). \'dum descéndo\''
    ' → \'enquanto desço\', the Latin\'s present.',
    o('proveito', {'utilitas': 'proveito'}, 'Ruling: plain.', 'DRB'),
    o('utilidade', {'utilitas': 'utilidade'}, 'Matos Soares 1932: the cognate.', 'MS1932'))

dec('adjutor', ['29:11'], 'Dóminus factus est adjútor meus', 'glossary',
    'adjútor → auxílio (glossary, open; D19, D24): the Latinist has asked for \'auxiliador\' at 9:10, 17:3b, 18:15b, 117:7, 118:114. The'
    ' build is 17:19\'s (\'e o Senhor se fez o meu protetor\') and 9:10\'s (\'E o Senhor se fez refúgio\'); here the predicate noun can be an'
    ' abstract (\'became my help\') as naturally as an agent. Douay-Rheims \'became my helper\'; Matos Soares 1932 \'fez-se meu protector\'.',
    o('auxílio', {'adjutor': 'auxílio'}, 'Ruling: the row\'s word.', 'glossary'),
    o('auxiliador', {'adjutor': 'auxiliador'}, 'The Latinist\'s agent noun (elsewhere).', 'latinist'))

dec('convertisti', ['29:12'], 'Convertísti planctum meum in gáudium mihi', 'glossary',
    'convértere → voltar (glossary), but with \'in\' + result the verb says \'turn X into Y\', and Portuguese says that with \'converter em\''
    ' (Douay-Rheims \'turned … into\'; Matos Soares 1932 \'converteste … em\'); \'voltar em\' is not said. Heard as religious conversion? not'
    ' with \'o meu lamento em\' after it. The same build 65:6, 77:44, 104:29, 113:8 (grep) — proposal for the row: \'converter em\' for'
    ' change into. ἔστρεψας.',
    o('Convertestes', {'convertisti': 'Convertestes'}, 'Ruling: the Portuguese verb of changing into.', 'MS1932'),
    o('Mudastes', {'convertisti': 'Mudastes'}, 'Plainer; mutáre\'s word.', 'draft'),
    o('Transformastes', {'convertisti': 'Transformastes'}, 'Plain, longer.', 'draft'))

dec('planctum', ['29:12'], 'planctum meum', 'word',
    'planctus: \'lamentation, beating of the breast\' (κοπετός), another word than fletus (\'weeping\', κλαυθμός) of 29:6b, which the glossary'
    ' gives \'pranto\'. \'lamento\' keeps them apart. Only here (grep). Douay-Rheims \'mourning\'; Matos Soares 1932 \'pranto\' (merges).',
    o('lamento', {'planctum': 'lamento'}, 'Ruling: apart from fletus → pranto.', 'draft'),
    o('pranto', {'planctum': 'pranto'}, 'Matos Soares 1932: merges with 29:6b.', 'MS1932'),
    o('luto', {'planctum': 'luto'}, 'Douay-Rheims \'mourning\': the state rather than the cry.', 'DRB'))

dec('gaudium', ['29:12'], 'in gáudium', 'glossary',
    'gáudium → júbilo (glossary, open, for a ruling; 20:7). Here gáudium and lætítia stand in one verse (the Latin varies; the Greek has'
    ' χορόν \'dance\' and εὐφροσύνην), so \'alegria\', lætítia\'s word, cannot serve both. Followed as the row stands; evidence for the row.'
    ' The Ps 20 blind reader did not know \'júbilo\'; \'regozijo\' is the row\'s other candidate.',
    o('júbilo', {'gaudium': 'júbilo'}, 'Ruling: the row\'s current word.', 'glossary'),
    o('regozijo', {'gaudium': 'regozijo'}, 'The row\'s other candidate.', 'glossary'),
    o('alegria', {'gaudium': 'alegria'}, 'lætítia\'s word, four words later.', 'draft'))

dec('saccum', ['29:12'], 'conscidísti saccum meum', 'word',
    'saccus: sackcloth, the mourner\'s garment (σάκκον). Only here (grep); cilícium (34:13, 68:12) is another word. \'o meu saco\' is a bag'
    ' in Portuguese, and in Brazil a vulgarity — a wrong first hearing. \'pano de saco\' keeps the Latin\'s word and says it is cloth, without'
    ' explaining what it was for (Matos Soares 1932 adds \'(de penitência)\' in parentheses). conscídere → rasgar (διέρρηξας).',
    o('o meu pano de saco', {'saccum': 'o meu pano de saco'}, 'Ruling: the word kept, heard as cloth.', 'draft'),
    o('a minha veste de saco', {'saccum': 'a minha veste de saco'}, 'A garment named.', 'draft'),
    o('o meu saco', {'saccum': 'o meu saco'}, 'Douay-Rheims \'my sackcloth\' to the letter: a bag, and worse.', 'DRB'),
    o('o meu cilício', {'saccum': 'o meu cilício'}, 'cilícium\'s word (34:13).', 'draft'))

dec('gloria_mea', ['29:13'], 'Ut cantet tibi glória mea', 'word',
    'glória mea (ἡ δόξα μου): the Latin\'s word, which the psalter also sets as a thing that sings and wakes (56:9 = 107:3 \'Exsúrge, glória'
    ' mea\', 107:2 \'cantábo, et psallam in glória mea\'; 3:4, 61:8 of God, grep): read as the self or the soul, it is not explained here.'
    ' Matos Soares 1932 explains it as \'a minha alma\'; Douay-Rheims \'my glory\'.',
    o('glória', {'gloria_mea': 'glória'}, 'Ruling: the Latin\'s word.', 'DRB'),
    o('alma', {'gloria_mea': 'alma'}, 'Matos Soares 1932: explains.', 'MS1932'))

dec('compungar', ['29:13'], 'et non compúngar', 'glossary',
    'compúngi → compungir-se (glossary, open; 4:5 \'compungi-vos\'): the sting of grief (κατανυγῶ). Only these two places (grep). The'
    ' stylist of Ps 4 preferred \'arrepender-se\' (another word, pænitére). Douay-Rheims \'and I may not regret\'; Matos Soares 1932 \'e eu'
    ' não tenha mais penas\'.',
    o('não me compunja', {'compungar': 'não me compunja'}, 'Ruling: glossary (4:5).', 'glossary'),
    o('não seja mais ferido de dor', {'compungar': 'não seja mais ferido de dor'}, 'The image explained.', 'draft'),
    o('não me arrependa', {'compungar': 'não me arrependa'}, 'Douay-Rheims \'regret\'; pænitére\'s word.', 'DRB'))

data = {
    'psalm': 29, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
    'verses': verses,
    'decisions': decisions,
    'choices': {
        '29:2': 'exaltáre → exaltar; \'Eu vos exaltarei\' as 117:28a (\'e eu vos exaltarei\'), the subject pronoun so that the verse does not open on a clitic. The Matins antiphon \'Exaltábo te, * Dómine\' is served: \'Eu vos exaltarei, * Senhor\'.',
        '29:3': 'clamáre → clamar (glossary); sanáre → curar (glossary; the row names 29:3; \'sarar\' of Matos Soares 1932 is what the patient does in Brazil).',
        '29:4': 'salváre → salvar; lacus → cova (glossary: \'os que descem à cova\', the row names 29:4).',
        '29:6b': 'lætítia → alegria (the gáudium row: alegria is lætítia\'s); the verb of the first member serves the second, as the Latin.',
        '29:8b': 'avértere fáciem → desviar a face (12:1, 21:25b); fíeri + participle → ficar (\'fiquei perturbado\'); conturbáre → perturbar (glossary).',
        '29:9': 'deprecári → suplicar (D35).',
        '29:10': 'corrúptio → corrupção (glossary; 15:10 = Acts 2:27).',
        '29:10b': 'numquid → acaso (glossary); annuntiáre → anunciar; véritas → verdade. 6:6\'s question, \'quem vos dará graças?\', answered in kind.',
        '29:11': 'audíre → ouvir (not at the imperative); miseréri → ter piedade; fíeri + predicate → fazer-se (17:19).',
        '29:12': 'circumdáre → cercar (glossary; the Greek girds, περιέζωσας — the Latin\'s verb followed); lætítia → alegria; \'para mim\' for mihi at the mediant.',
        '29:13': 'cantáre → cantar; in ætérnum → para sempre (D23), before the verb as the Latin.',
    },
    'audit': [
        {'step': 'source', 'note': 'Latin = DO Psalm29.txt, 15 prayed verses: DO repeats 29:6, 29:8, 29:10, keyed 29:6b, 29:8b, 29:10b by latin.readVerses. No 29:1 (the titulus, D7). No flex. Not in the Diurnal Monástico. Uses checked by grep in DO\'s Latin: Matins antiphon \'Exaltábo te, * Dómine, quóniam suscepísti me\' and versicle \'Psállite Dómino sancti ejus. R. Et confitémini memóriæ sanctitátis ejus\' (Psalmi matutinum.txt); versicle \'Exaltábo te, Dómine, quóniam suscepísti me. R. Nec delectásti inimícos meos super me\' and responsory (Sancti/12-08.txt, Sancti/Brasilia/10-12-BMVApparecida.txt); Introit verse (Commune/C4b.txt); 29:12 as a responsory text (Sancti/aliquibus locis/Quad2-5-SindonDNJC.txt).'},
        {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps029.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: saccus, planctus, utílitas only here; compúngi 4:5, 29:13; memóriæ sanct- 29:5, 96:12; abundántia 8 lines; Non movébor 9:27, 29:7, 61:3; factus est … adjútor 9:10, 29:11 (93:22 adjutórium). Latin (= Greek) readings kept against the Hebrew: 29:2 \'me amparastes\' (not \'drew me up\'), 29:6 \'há ira na sua indignação\' (not \'his anger is but a moment\'), 29:8 \'destes vigor ao meu esplendor\' (not \'made my mountain stand strong\'), 29:12 \'me cercastes de alegria\' (the Latin\'s verb, not the Greek\'s girding either), 29:13 \'a minha glória … não me compunja\' (not \'not be silent\'). Tests for the readers: \'à minha custa\', \'pano de saco\', \'lamento\' against \'pranto\', \'júbilo\', \'não me compunja\', \'Para sempre não serei abalado\', \'vós, seus santos\'.'},
    ],
}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(decisions), 'decisions')
