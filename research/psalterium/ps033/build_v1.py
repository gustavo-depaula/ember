"""Ps 33 draft 1. python3.13 research/psalterium/ps033/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '33:2': 'Bendirei o Senhor {tempore}: * {laus2}.',
    '33:3': 'No Senhor {laudabitur} a minha alma: * ouçam os mansos, e se alegrem.',
    '33:4': 'Engrandecei comigo o Senhor: * e exaltemos {idipsum} o seu nome.',
    '33:5': '{exquisivi} o Senhor, e ele me escutou: * e de todas as minhas tribulações me {eripuit}.',
    '33:6': 'Aproximai-vos dele, e {illuminamini}: * e {facies}.',
    '33:7': 'Este pobre clamou, e o Senhor o escutou: * e de todas as suas tribulações o salvou.',
    '33:8': 'O anjo do Senhor {immittet} ao redor dos que o temem: * e os {eripiet}.',
    '33:9': '{gustate}, e vede {quoniam9} o Senhor é {suavis}: * bem-aventurado o homem que espera nele.',
    '33:10': 'Temei o Senhor, {sancti}: * porque não há {inopia} para os que o temem.',
    '33:11': 'Os ricos {eguerunt}: * mas os que {inquirentes} o Senhor {minuentur}.',
    '33:12': 'Vinde, filhos, {audite}: * eu vos ensinarei o temor do Senhor.',
    '33:13': 'Quem é o homem que quer a vida: * que ama ver dias bons?',
    '33:14': '{prohibe} a tua língua do mal: * e que os teus lábios não falem engano.',
    '33:15': '{diverte} do mal, e faz o bem: * {inquire} a paz, e {persequere}.',
    '33:16': 'Os olhos do Senhor estão sobre os justos: * e os seus ouvidos, {aures}.',
    '33:17': 'Mas o rosto do Senhor está sobre os que fazem {mala}: * para fazer perecer da terra a memória deles.',
    '33:18': 'Clamaram os justos, e o Senhor os escutou: * e de todas as suas tribulações os livrou.',
    '33:19': 'Perto está o Senhor dos que {tribulato}: * {humiles}.',
    '33:20': 'Muitas são as tribulações dos justos: * e de todas elas os livrará o Senhor.',
    '33:21': 'O Senhor guarda todos os ossos deles: * {unum} será quebrado.',
    '33:22': 'A morte dos pecadores é {pessima}: * e os que odeiam o justo {d22}.',
    '33:23': 'O Senhor resgatará as almas dos seus servos: * e {none23}.',
}

dec('tempore', ['33:2'], 'Benedícam Dóminum in omni témpore', 'word',
    'in omni témpore (ἐν παντὶ καιρῷ): at every time. In Brazilian Portuguese \'todo\' without the article is \'every\' (\'em todo tempo\','
    ' at all times), with it \'the whole\' (\'em todo o tempo\', Matos Soares 1932, which a Brazilian also hears as \'all the time\')'
    ' — the tota die row (D24) shows how the article moves the sense. benedícere with the accusative → \'bendizer o Senhor\' (glossary,'
    ' the row names 33:2). The colon is the versicle of the grace after meals (Appendix/Benedictio mensae.txt) and an Introit verse'
    ' (03-10, 06-15 … grep), so it must stand alone; it does.',
    o('em todo tempo', {'tempore': 'em todo tempo'}, 'Ruling: \'at every time\'.', 'draft'),
    o('em todo o tempo', {'tempore': 'em todo o tempo'}, 'Matos Soares 1932.', 'MS1932'),
    o('a todo momento', {'tempore': 'a todo momento'}, 'Plainer; momento is not the Latin\'s word.', 'draft'))

dec('laus2', ['33:2'], 'semper laus ejus in ore meo', 'grammar',
    'The second colon is verbless (διὰ παντὸς ἡ αἴνεσις αὐτοῦ ἐν τῷ στόματί μου). Portuguese needs a verb; the first colon\'s future governs'
    ' the verse, so \'estará\' (Matos Soares 1932; Douay-Rheims \'shall be\'). laus → louvor (glossary).',
    o('o seu louvor estará sempre na minha boca', {'laus2': 'o seu louvor estará sempre na minha boca'},
      'Ruling: the future supplied (Matos Soares 1932).', 'MS1932'),
    o('sempre o seu louvor estará na minha boca', {'laus2': 'sempre o seu louvor estará na minha boca'}, 'The Latin\'s order.', 'draft'),
    o('o seu louvor está sempre na minha boca', {'laus2': 'o seu louvor está sempre na minha boca'}, 'A present supplied.', 'draft'))

dec('laudabitur', ['33:3'], 'In Dómino laudábitur ánima mea', 'word',
    'laudábitur is a passive: \'shall be praised\' (Douay-Rheims \'In the Lord shall my soul be praised\'), the Greek ἐπαινεσθήσεται the'
    ' same form. Matos Soares 1932 \'se gloriará\' is the Hebrew\'s \'boast\' (תתהלל), which rule 1 does not import. The passive is'
    ' odd — the soul praised in the Lord — and it is the Latin\'s oddness; the Alleluia of Pent12-0 and a versicle (Epi2-1.txt) sing it.',
    o('será louvada', {'laudabitur': 'será louvada'}, 'Ruling: the Latin\'s passive (Douay-Rheims).', 'DRB'),
    o('se gloriará', {'laudabitur': 'se gloriará'}, 'Matos Soares 1932: the Hebrew\'s sense.', 'MS1932'))

dec('idipsum', ['33:4'], 'et exaltémus nomen ejus in idípsum', 'glossary',
    'in idípsum, the second of its six places (4:9, 33:4, 40:7, 61:10, 73:6, 121:3); D9 deferred it, and the glossary row warns that one'
    ' rendering may not serve all. Here it is ἐπὶ τὸ αὐτό with a plural subject (\'let us exalt\'): people doing one thing together'
    ' (Douay-Rheims \'together\', Matos Soares 1932 \'todos à uma\'). The same Greek phrase stands behind \'in unum\' in 2:2 (συνήχθησαν'
    ' ἐπὶ τὸ αὐτό, read in consult/parallels/ps002.md), which the glossary renders \'juntos\' — D15\'s test lets the two Latin phrases'
    ' share it. 4:9\'s \'a um só tempo\' is right for one man\'s two verbs (sleep and rest) but would make the call to praise a matter'
    ' of timing. Ruled locally; proposal on the row.',
    o('juntos', {'idipsum': 'juntos'}, 'Ruling: together (the in unum row; one Greek phrase).', 'glossary'),
    o('a um só tempo', {'idipsum': 'a um só tempo'}, '4:9\'s rendering.', 'glossary'),
    o('todos à uma', {'idipsum': 'todos à uma'}, 'Matos Soares 1932; \'à uma\' is literary.', 'MS1932'))

dec('quaerere', ['33:5', '33:11', '33:15'], 'Exquisívi Dóminum … inquiréntes autem Dóminum … inquíre pacem', 'glossary',
    'exquírere → procurar (glossary; 118:2, 10 …), kept apart from quǽrere → buscar; requírere was merged into it on the Greek ἐκζητέω'
    ' (118:145, 13:2, 21:27). Here 33:5 exquisívi (ἐξεζήτησα) and 33:11 inquiréntes (ἐκζητοῦντες) are that Greek verb, so inquírere'
    ' joins them; 33:15 inquíre is ζήτησον (quǽrere\'s Greek), but it is the same Latin word as 33:11 six lines up, and what repeats in'
    ' the Latin repeats in the Portuguese. Matos Soares 1932 \'Busquei … buscam … busca\'; Douay-Rheims \'sought … seek … seek after\'.',
    o('Procurei … procuram … procura', {'exquisivi': 'Procurei', 'inquirentes': 'procuram', 'inquire': 'procura'},
      'Ruling: the exquírere row, one verb three times.', 'glossary'),
    o('Busquei … buscam … busca', {'exquisivi': 'Busquei', 'inquirentes': 'buscam', 'inquire': 'busca'},
      'Matos Soares 1932: quǽrere\'s verb.', 'MS1932'))

dec('eripere', ['33:5', '33:8'], 'erípuit me (ex ómnibus tribulatiónibus) … et erípiet eos', 'glossary',
    'erípere: the glossary row (open) keeps \'arrancar\' where a source is named and \'libertar\' where none is (6:5, 118:153, 170, 21:9).'
    ' 33:5 has a source (\'de todas as minhas tribulações me arrancou\', 53:9\'s formula \'de toda tribulação me arrancastes\'); 33:8 has'
    ' none (\'e os libertará\'). The psalm varies its verbs of rescue (erípuit 33:5, salvávit 33:7, erípiet 33:8, liberávit 33:18,'
    ' liberábit 33:20) and the Portuguese keeps them apart: arrancar / salvar / libertar / livrar.',
    o('arrancou … libertará', {'eripuit': 'arrancou', 'eripiet': 'libertará'}, 'Ruling: the row, by source.', 'glossary'),
    o('libertou … libertará', {'eripuit': 'libertou', 'eripiet': 'libertará'}, 'One verb for erípere in the psalm (the row\'s "never fails").', 'glossary'),
    o('livrou … livrará', {'eripuit': 'livrou', 'eripiet': 'livrará'}, 'Matos Soares 1932: liberáre\'s verb; merges with 33:18, 33:20.', 'MS1932'))

dec('illuminamini', ['33:6'], 'Accédite ad eum, et illuminámini', 'grammar',
    'illuminámini is an imperative passive (φωτίσθητε), \'be enlightened\' (Douay-Rheims). \'sede iluminados\' keeps mood and voice;'
    ' Matos Soares 1932 \'e sereis iluminados\' makes it a promise. illumináre → iluminar (glossary). The verse is a Gradual verse'
    ' (Pent07-0, Quad4-3, missa) and an antiphon (Willibrordus, grep).',
    o('sede iluminados', {'illuminamini': 'sede iluminados'}, 'Ruling: imperative passive.', 'DRB'),
    o('sereis iluminados', {'illuminamini': 'sereis iluminados'}, 'Matos Soares 1932: a future.', 'MS1932'),
    o('deixai-vos iluminar', {'illuminamini': 'deixai-vos iluminar'}, 'The erudímini build (glossary, 2:10).', 'glossary'))

dec('facies', ['33:6'], 'et fácies vestræ non confundéntur', 'glossary',
    'fácies → face (glossary; vultus → rosto, 33:17 has vultus). confúndi → ser envergonhado (D15). The plural \'as vossas faces\' can'
    ' also be heard as cheeks — which is where shame shows, and not a wrong image. Matos Soares 1932 \'os vossos rostos não serão cobertos'
    ' de confusão\'; Douay-Rheims \'your faces shall not be confounded\'.',
    o('as vossas faces não serão envergonhadas', {'facies': 'as vossas faces não serão envergonhadas'}, 'Ruling: glossary.', 'glossary'),
    o('os vossos rostos não serão envergonhados', {'facies': 'os vossos rostos não serão envergonhados'},
      'vultus\'s word (Matos Soares 1932).', 'MS1932'))

dec('immittet', ['33:8'], 'Immíttet Ángelus Dómini in circúitu timéntium eum', 'word',
    'immíttere is \'to send in, set in\' (L&S), here with no object: the Latin\'s word for the Greek παρεμβαλεῖ, \'will encamp\' — an'
    ' army sent in and set down around. Douay-Rheims reads it so (\'shall encamp round about\'); Matos Soares 1932 \'andará à roda\''
    ' softens it. \'acampará\' says the image the Latin carries; a bare \'enviará\' would lack its object. in circúitu → ao redor de'
    ' (glossary; the row names 33:8). The colon with its second half is an antiphon (Psalmi minor.txt, Feria IV; 10-02, the Guardian'
    ' Angels) and, with 33:9a, a Communion (Quad1-4, Pent14-0, missa).',
    o('acampará', {'immittet': 'acampará'}, 'Ruling: the Latin\'s image, as Douay-Rheims reads it.', 'DRB'),
    o('se porá', {'immittet': 'se porá'}, 'The bare verb \'set\'; loses the camp.', 'draft'),
    o('andará', {'immittet': 'andará'}, 'Matos Soares 1932 (\'andará à roda\').', 'MS1932'))

dec('gustate', ['33:9'], 'Gustáte, et vidéte', 'word',
    'gustáre (γεύσασθε), only here (grep): to taste. \'Provai\' is how Brazilian Portuguese says tasting food, but \'provar\' is probáre\'s'
    ' verb (25:2 \'Provai-me, Senhor\'; the probáre row), so the two would meet across psalms. \'Saboreai\' is the taste only and is'
    ' free. Matos Soares 1932 \'Gostai\' is archaic in Brazil (\'gostar\' = to like). The verse is the Communion of Pent08-0 (missa'
    ' Tempora/Pent08-0.txt, grep), an Alleluia (10-03) and a Matins antiphon (TemporaM/Pent02-5.txt); 1 Pet 2:3 alludes to it in'
    ' another wording (\'si tamen gustastis quoniam dulcis est Dominus\', Clementine, fetched to consult/bolls-VULG-60-2.json).',
    o('Provai', {'gustate': 'Provai'}, 'Ruling: the Portuguese verb of tasting; shares a word with probáre across psalms.', 'draft'),
    o('Saboreai', {'gustate': 'Saboreai'}, 'Free; a little literary.', 'draft'),
    o('Gostai', {'gustate': 'Gostai'}, 'Matos Soares 1932; archaic.', 'MS1932'))

dec('suavis', ['33:9'], 'quóniam suávis est Dóminus', 'word',
    'suávis (χρηστός): sweet, pleasant, kind. 7 lines (grep: 85:5 \'suávis et mitis\', 99:5, 108:21, 134:3, 144:9 \'Suávis Dóminus'
    ' univérsis\'). The cognate \'suave\' is current (gentle, pleasant) and keeps the word the Latin repeats; 1 Pet 2:3 has \'dulcis\''
    ' for the same Greek (Clementine, fetched), and 24:8 \'Dulcis et rectus Dóminus\' (χρηστός) → \'doce\' (glossary, open) — so \'doce\''
    ' would join the taste to sweetness, but merge two Latin words. quóniam here is \'that\' (ὅτι): \'vede que\'; Matos Soares 1932'
    ' \'quão suave\' makes an exclamation.',
    o('suave', {'suavis': 'suave'}, 'Ruling: the cognate, current.', 'DRB'),
    o('doce', {'suavis': 'doce'}, '1 Pet 2:3\'s dulcis; dulcis\'s word (24:8).', 'draft'))

dec('quoniam9', ['33:9'], 'vidéte quóniam suávis est Dóminus', 'grammar',
    'quóniam after a verb of seeing is \'that\' (Douay-Rheims \'see that the Lord is sweet\'). \'como\' (\'vede como o Senhor é suave\')'
    ' turns it into an exclamation, as Matos Soares 1932 does (\'quão\').',
    o('que', {'quoniam9': 'que'}, 'Ruling: \'that\'.', 'DRB'),
    o('como', {'quoniam9': 'como'}, 'An exclamation (Matos Soares 1932\'s \'quão\').', 'MS1932'))

dec('sancti', ['33:10'], 'Timéte Dóminum, omnes sancti ejus', 'grammar',
    'The vocative \'omnes sancti ejus\' (οἱ ἅγιοι αὐτοῦ). Bare, \'Temei o Senhor, todos os seus santos\' is heard as a second object (fear'
    ' the Lord and all his saints). The glossary\'s vocative row (29:5 \'vós, seus santos\'): \'vós,\' before a possessive. Matos Soares'
    ' 1932 \'vós todos os Santos\'. The Offertory of All Saints (11-01) and the Gradual of 08-08 have another wording (\'quóniam nihil'
    ' deest\').',
    o('vós, todos os seus santos', {'sancti': 'vós, todos os seus santos'}, 'Ruling: the vocative marked (29:5).', 'glossary'),
    o('todos os seus santos', {'sancti': 'todos os seus santos'}, 'Bare: heard as a second object.', 'draft'))

dec('inopia', ['33:10'], 'quóniam non est inópia timéntibus eum', 'glossary',
    'inópia (ὑστέρημα, \'want\'). The inops row (open) proposes \'indigência\' for inópia (33:10, 43:24, 87:9, 106:41), beside'
    ' \'indigente\' for inops — which the blind readers did not know three times. The noun may fare better than the adjective; Matos'
    ' Soares 1932 has it here. \'falta\' is delíctum\'s (glossary); \'necessidade\' is wanted for eguérunt in 33:11; \'penúria\' is'
    ' the free plain word.',
    o('indigência', {'inopia': 'indigência'}, 'Ruling: the row\'s proposal (Matos Soares 1932).', 'MS1932'),
    o('penúria', {'inopia': 'penúria'}, 'Free and plain.', 'draft'),
    o('míngua', {'inopia': 'míngua'}, 'Plain; a little old.', 'draft'))

dec('eguerunt', ['33:11'], 'Dívites eguérunt et esuriérunt', 'grammar',
    'Two verbs: egére \'be in need\' (15:2 \'precisar\', with an object) and esuríre \'hunger\'. Portuguese says both with one verb and two'
    ' nouns, \'passaram necessidade e fome\' — the Latin\'s two ideas, the grammar the ear\'s (D2). Matos Soares 1932 \'tiveram'
    ' necessidade e fome\' does the same. The Greek\'s first verb is \'became poor\' (ἐπτώχευσαν), which the Latin does not follow.',
    o('passaram necessidade e fome', {'eguerunt': 'passaram necessidade e fome'}, 'Ruling: one verb, two nouns.', 'draft'),
    o('tiveram necessidade e fome', {'eguerunt': 'tiveram necessidade e fome'}, 'Matos Soares 1932.', 'MS1932'),
    o('ficaram necessitados e tiveram fome', {'eguerunt': 'ficaram necessitados e tiveram fome'}, 'Two verbs, as the Latin; heavy.', 'draft'))

dec('minuentur', ['33:11'], 'non minuéntur omni bono', 'word',
    'minúere, passive (ἐλαττωθήσονται): \'be made less, lack\'. Douay-Rheims \'shall not be deprived of any good\'; Matos Soares 1932'
    ' \'não terão falta de bem algum\'. \'não serão privados de bem algum\' keeps the passive and the future; \'falta\' is delíctum\'s'
    ' word. The literal \'diminuídos\' is not said of persons lacking a good. omne bonum → \'bem algum\' under the negation.',
    o('não serão privados de bem algum', {'minuentur': 'não serão privados de bem algum'}, 'Ruling: Douay-Rheims.', 'DRB'),
    o('não terão falta de bem algum', {'minuentur': 'não terão falta de bem algum'}, 'Matos Soares 1932.', 'MS1932'),
    o('não serão diminuídos em bem algum', {'minuentur': 'não serão diminuídos em bem algum'}, 'The Latin\'s verb; stiff.', 'draft'))

dec('audite', ['33:12'], 'Veníte, fílii, audíte me', 'glossary',
    'audíre → ouvir (glossary, D3), kept apart from exaudíre → escutar, which this psalm has three times (33:5, 7, 18). The bare vós'
    ' imperative \'ouvi\' is banned (D1); D13 lets it stand with an enclitic, and says \'Ouvi-me\' may be used where the Latin is'
    ' \'audi me\' — this is such a place (Matos Soares 1932 \'ouvi-me\'). Here the children are addressed, and \'Vinde\' before it fixes'
    ' the mood. Gradual of Pent07-0, Quad4-3 and others (grep).',
    o('ouvi-me', {'audite': 'ouvi-me'}, 'Ruling: D13\'s enclitic exception; audíre apart from exaudíre.', 'MS1932'),
    o('escutai-me', {'audite': 'escutai-me'}, 'exaudíre\'s verb (the row\'s fall-back).', 'glossary'))

dec('prohibe', ['33:14'], 'Próhibe linguam tuam a malo', 'glossary',
    'prohibére → reter (glossary, open; 118:101 \'Retive os meus pés\'; the row names 33:14). The tu imperative \'Retém\'. The one'
    ' addressed is the man of 33:13, singular (tu). Matos Soares 1932 \'guarda\' is custodíre\'s (33:21). The Rule of St Benedict quotes'
    ' 33:13–14 (Regula/01-03.txt); 1 Pet 3:10 in another wording (\'coërceat linguam suam\', Clementine, fetched).',
    o('Retém', {'prohibe': 'Retém'}, 'Ruling: the row.', 'glossary'),
    o('Guarda', {'prohibe': 'Guarda'}, 'Matos Soares 1932; custodíre\'s verb.', 'MS1932'))

dec('diverte', ['33:15'], 'Divérte a malo, et fac bonum', 'glossary',
    'divértere (ἔκκλινον, only here with \'a malo\'; grep) has the Greek of declináre a → apartar-se de (glossary, 118:115), and 36:27'
    ' \'Declína a malo, et fac bonum\' is the same line with that verb — so by D15\'s test the two share \'Aparta-te do mal\', and'
    ' 36:27 should copy this colon. \'desviar\' is avértere\'s. Matos Soares 1932 \'Desvia-te\'. 1 Pet 3:11 \'Declinet a malo\''
    ' (Clementine, fetched) has declináre. \'faz o bem\': the tu imperative of fazer, in its current form.',
    o('Aparta-te', {'diverte': 'Aparta-te'}, 'Ruling: declináre\'s word (one Greek verb; 36:27).', 'glossary'),
    o('Desvia-te', {'diverte': 'Desvia-te'}, 'Matos Soares 1932; avértere\'s verb.', 'MS1932'))

dec('persequere', ['33:15'], 'inquíre pacem, et perséquere eam', 'glossary',
    'pérsequi → perseguir (glossary): pursue it (δίωξον). \'persegue-a\' is heard as \'pursue\' after \'procura a paz\', not as'
    ' \'persecute\'. 1 Pet 3:11 has \'sequatur\' (another verb); Matos Soares 1932 \'vai em seu seguimento\' explains.',
    o('persegue-a', {'persequere': 'persegue-a'}, 'Ruling: glossary.', 'glossary'),
    o('segue-a', {'persequere': 'segue-a'}, 'sequi\'s verb (1 Pet 3:11).', 'draft'))

dec('aures', ['33:16'], 'et aures ejus in preces eórum', 'grammar',
    'Both cola are verbless in the Latin (Óculi … super justos: et aures … in preces). The first takes \'estão\'; the second keeps the'
    ' Latin\'s \'in\' (εἰς, towards) with the participle of direction the glossary uses for eyes (24:15 \'estão sempre voltados para o'
    ' Senhor\'). Matos Soares 1932 supplies \'(estão atentos)\' in parentheses — an explanation. preces → preces (δέησιν: D35\'s word).'
    ' \'deles\' so that the prayers are the just men\'s. 33:16–17a is quoted word for word in 1 Pet 3:12 (Clementine, fetched to'
    ' consult/bolls-VULG-60-3.json) — formula row; the Epistle of Pent05-0 carries it.',
    o('voltados para as preces deles', {'aures': 'voltados para as preces deles'}, 'Ruling: direction, as the Latin\'s in.', 'draft'),
    o('atentos às preces deles', {'aures': 'atentos às preces deles'}, 'Matos Soares 1932\'s gloss; explains.', 'MS1932'),
    o('às preces deles', {'aures': 'às preces deles'}, 'Verbless.', 'draft'))

dec('mala', ['33:17'], 'super faciéntes mala', 'grammar',
    'faciéntes mala: \'those who do evil things\' (Douay-Rheims; ποιοῦντας κακά). \'os que fazem o mal\' (Matos Soares 1932) is how'
    ' Portuguese says it; the plural is grammar (D27). \'super\' kept as \'sobre\' in both 33:16 and 33:17 — the same preposition'
    ' for the eyes on the just and the face on the wicked, as the Latin; Douay-Rheims turns the second \'against\'. vultus → rosto'
    ' (glossary). pérdere → fazer perecer (D24; the row names 33:17).',
    o('o mal', {'mala': 'o mal'}, 'Ruling: Matos Soares 1932.', 'MS1932'),
    o('males', {'mala': 'males'}, 'The plural kept.', 'draft'))

dec('tribulato', ['33:19'], 'iis, qui tribuláto sunt corde', 'grammar',
    'tribuláto corde: \'of a troubled heart\' (the Latin\'s word, against the Greek\'s and Hebrew\'s \'crushed\'). \'dos que têm o coração'
    ' atribulado\' (Matos Soares 1932) is the Portuguese build for \'who are of a troubled heart\'. húmiles spíritu → \'os humildes de'
    ' espírito\' (húmilis → humilde, D27). An Alleluia verse (06-02, 09-27, C3a-1).',
    o('têm o coração atribulado', {'tribulato': 'têm o coração atribulado'}, 'Ruling: Matos Soares 1932.', 'MS1932'),
    o('são de coração atribulado', {'tribulato': 'são de coração atribulado'}, 'Closer to the Latin; stiffer.', 'draft'))

dec('humiles', ['33:19'], 'et húmiles spíritu salvábit', 'order',
    'húmiles spíritu → \'os humildes de espírito\' (húmilis → humilde, D27). In the plain order (Matos Soares 1932 \'e salvará os humildes'
    ' de espírito\') the verse ends on \'espírito\', a proparoxytone at the final cadence (rule 4). The Latin\'s own order — object first,'
    ' the verb last — ends on an oxytone and is still sayable; it is taken for the cadence, not for its own sake.',
    o('e os humildes de espírito salvará', {'humiles': 'e os humildes de espírito salvará'}, 'Ruling: the Latin\'s order; the cadence.', 'draft'),
    o('e salvará os humildes de espírito', {'humiles': 'e salvará os humildes de espírito'}, 'Matos Soares 1932; ends on a proparoxytone.', 'MS1932'),
    o('e salvará os de espírito humilde', {'humiles': 'e salvará os de espírito humilde'}, 'The adjective moved; loses the noun \'os humildes\'.', 'draft'))

dec('unum', ['33:21'], 'unum ex his non conterétur', 'grammar',
    '\'not one of them shall be broken\' (Douay-Rheims). \'nem um deles\' keeps the Latin\'s \'unum\' and its emphasis; \'nenhum deles\''
    ' is plainer. contérere → quebrar (glossary). John 19:36 \'Os non comminuetis ex eo\' (Clementine, fetched to'
    ' consult/bolls-VULG-43-19.json) is another wording and another verb; the psalm keeps its own. A versicle (Commune/C1p.txt) and'
    ' with 33:20 a Tract/Gradual (06-15).',
    o('nem um deles', {'unum': 'nem um deles'}, 'Ruling: the \'unum\' heard.', 'DRB'),
    o('nenhum deles', {'unum': 'nenhum deles'}, 'Plainer.', 'draft'))

dec('pessima', ['33:22'], 'Mors peccatórum péssima', 'word',
    'péssima: the superlative of malus (πονηρός). The cognate keeps it, and Matos Soares 1932 has it; in everyday Brazilian \'péssimo\''
    ' is also \'awful (of quality)\', which the context rules out. \'muito má\' says the degree plainly.',
    o('péssima', {'pessima': 'péssima'}, 'Ruling: the Latin\'s word (Matos Soares 1932).', 'MS1932'),
    o('muito má', {'pessima': 'muito má'}, 'Douay-Rheims \'very evil\'; plain.', 'DRB'))

dec('delinquent', ['33:22', '33:23'], 'et qui odérunt justum, delínquent … et non delínquent omnes qui sperant in eo', 'glossary',
    'delínquere → cometer faltas (glossary, open; 24:8 \'aos que cometem faltas\'), twice: the psalm ends on the word, the haters of the'
    ' just against those who hope in the Lord (πλημμελήσουσιν … οὐ μὴ πλημμελήσωσιν). One verb both times. Douay-Rheims \'shall be guilty …'
    ' shall offend\' varies; Matos Soares 1932 \'perecerão\' (twice) is not the Latin\'s verb. odérunt → \'odeiam\' (the perfect with'
    ' present sense, 24:19).',
    o('cometerão faltas … cometerá falta', {'d22': 'cometerão faltas', 'd23': 'cometerá falta'}, 'Ruling: the row, twice.', 'glossary'),
    o('serão culpados … será culpado', {'d22': 'serão culpados', 'd23': 'será culpado'}, 'Douay-Rheims\'s first verb.', 'DRB'),
    o('perecerão … perecerá', {'d22': 'perecerão', 'd23': 'perecerá'}, 'Matos Soares 1932: períre\'s verb.', 'MS1932'))

dec('none23', ['33:23'], 'et non delínquent omnes qui sperant in eo', 'grammar',
    '\'non … omnes\' is \'none\' (Douay-Rheims \'none of them that trust in him shall offend\'). Portuguese \'não cometerão faltas todos os'
    ' que …\' is heard as \'not all\'; \'nenhum dos que\' says the Latin\'s sense. The Monastic Ordo\'s versicle (OrdoM.txt) has another'
    ' verb (\'non relínquet\').',
    o('nenhum dos que esperam nele {d23}', {'none23': 'nenhum dos que esperam nele {d23}'}, 'Ruling: \'none\'.', 'DRB'),
    o('não {d22} todos os que esperam nele', {'none23': 'não {d22} todos os que esperam nele'},
      'The Latin\'s build; heard as \'not all\'.', 'draft'))

choices = {
    '33:3': 'mansuétus → manso (glossary; the row names 33:3); audíre → ouvir (no object, as the Latin; Matos Soares 1932 adds \'-no\'); lætári → alegrar-se.',
    '33:4': 'magnificáre → engrandecer; exaltáre → exaltar (glossary). \'comigo\' before the object, as Matos Soares 1932: \'Engrandecei o Senhor comigo\' would end the colon on the pronoun. The Christmas responsory \'Magnificáte Dóminum mecum\' (Nat2-0.txt) sings the first colon.',
    '33:5': 'exaudíre → escutar (D3). The echo \'escutou … arrancou\' at the two cadences is the Latin\'s own (exaudívit me … erípuit me); kept. So in 33:7 (\'escutou … salvou\') and 33:18 (\'escutou … livrou\').',
    '33:6': 'accédere → aproximar-se (\'Aproximai-vos\' is safe: past \'aproximei\').',
    '33:7': 'Iste pauper → \'Este pobre\' (pauper → pobre, D27); clamáre → clamar; salváre → salvar.',
    '33:9': 'beátus vir → bem-aventurado o homem (D19); speráre in → esperar em.',
    '33:12': 'Veníte, fílii → \'Vinde, filhos\' (no \'ó\': \'filhos\' cannot be heard as an object of \'Vinde\'); docére → ensinar (glossary). \'eu vos ensinarei\' — the subject named and natural order for the Latin\'s fronted object.',
    '33:13': 'dilígere → amar (glossary). The Latin\'s second colon has no \'qui\'; \'que\' is supplied. dies boni → \'dias bons\' (not \'felizes\', Matos Soares 1932). The man addressed from here to 33:15 is singular: tu (D1).',
    '33:14': 'lábia → lábios; loqui dolum → \'falar engano\' (dolus → engano, glossary). \'e que os teus lábios não falem\': the jussive with \'que\', so that it follows \'Retém\' as a command.',
    '33:17': 'memória → memória (glossary).',
    '33:18': 'Clamavérunt justi → \'Clamaram os justos\', the Latin\'s order (the antiphon and Introit verse — Commune/C1.txt, C3a-1.txt, 03-10 … — sing it so; it is also natural). liberáre → livrar (glossary).',
    '33:19': 'juxta → perto (row perto / longe); the Latin\'s order \'Perto está o Senhor\', natural in Portuguese.',
    '33:20': 'The first colon is verbless in the Latin; \'são\' supplied. \'de ómnibus his\' → \'de todas elas\'. With 33:21 a Gradual/Tract of 06-15 and 11-05 (grep).',
    '33:21': 'custodíre → guardar (glossary); os ossa → os ossos.',
    '33:23': 'redímere → resgatar (glossary; the row names 33:23); servus → servo; ánimæ → almas (32:19).',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm33.txt, 22 prayed verses 33:2–33:23 (no 33:1: the titulus, D7). No repeated ids, no flex. Clementine (Bolls VULG, fetched to consult/bolls-VULG-19-33.json; ps033/show_vulg.py): identical wording. Alphabetic in Hebrew; nothing reproduced. Not in the Diurnal Monástico. NT places fetched (Clementine, Bolls VULG) before any claim: 1 Pet 2:3 \'si tamen gustastis quoniam dulcis est Dominus\' (another wording of 33:9a); 1 Pet 3:10–12: 3:12 \'oculi Domini super justos, et aures ejus in preces eorum: vultus autem Domini super facientes mala\' = 33:16–17a word for word, 3:10–11 another wording (coërceat, declinet, sequatur); John 19:36 \'Os non comminuetis ex eo\' — another wording of 33:21b, with another verb. Uses checked by grep (ps032/uses.py): 33:9 Communion of Pent08-0, Alleluia of 10-03, Matins antiphon (TemporaM/Pent02-5.txt); 33:8 an antiphon (Psalmi minor.txt [Completorium] Feria IV; 10-02) and, with 33:9a, the Communion of Quad1-4 and Pent14-0; 33:2 versicle of the grace (Benedictio mensae.txt) and Introit verses; 33:3 Alleluia of Pent12-0; 33:4 a Christmas responsory (Nat2-0.txt); 33:6 and 33:12 Gradual verses (Pent07-0, Quad4-3 …); 33:18 an antiphon (Commune/C1.txt) and Introit/Gradual of martyrs; 33:19 an Alleluia; 33:20–21 a Gradual (06-15); 33:21 a versicle (C1p.txt); 33:13–14 in the Rule of St Benedict (Regula/01-03.txt).'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps033.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Counted with ps005/grep_latin.py: gustáre, immíttere, divértere + a malo only here; suávis 7 lines; inópia 4. Glossary applied: D3 (escutar ×3), D13 (ouvi-me), D15 (ser envergonhado), D19, D24 (fazer perecer), D27 (pobre, humilde), D35 (preces), exquírere → procurar, erípere by source, prohibére → reter, delínquere → cometer faltas, redímere → resgatar, mansuétus → manso, in circúitu → ao redor de. in idípsum (D9, deferred) ruled locally \'juntos\'. Latin (= Greek) readings kept against the Hebrew: 33:3 \'será louvada\' (not \'boast\'), 33:5 \'tribulações\' (the Greek has \'sojournings\', the Hebrew \'fears\' — the Latin followed), 33:6 \'Aproximai-vos dele, e sede iluminados\' (not \'they looked … and were radiant\'), 33:11 \'Os ricos\' (the Hebrew\'s young lions), 33:19 \'coração atribulado\', 33:22 \'cometerão faltas\'. Tests for the readers: \'será louvada\', \'juntos\', \'sede iluminados\', \'as vossas faces\', \'acampará\', \'Provai\', \'suave\', \'indigência\', \'não serão privados\', \'ouvi-me\', \'Retém\', \'Aparta-te\', \'persegue-a\', \'voltados para as preces\', \'péssima\', \'cometerão faltas\'.'},
    {'step': 'checks', 'note': 'Draft 1: hard pass. Rhymes accepted as the Latin\'s own: 33:5 escutou / arrancou, 33:7 escutou / salvou, 33:18 escutou / livrou (exaudívit … erípuit / salvávit / liberávit, each with the same pronoun), 33:16 / 33:17 deles / deles (eórum / eórum). 33:19 second colon put in the Latin\'s order for the final cadence (decision humiles). Lengths: 33:18 second colon −7 and 33:7 −5 (the Latin\'s long tribulatiónibus), 33:9 second +5 and 33:22 second +5 (bem-aventurado; cometerão faltas), 33:16 second +5 (voltados para), 33:2 second +4 (estará supplied); accepted.'},
]

data = {'psalm': 33, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
