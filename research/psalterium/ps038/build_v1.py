"""Ps 38 draft 1. python3.13 research/psalterium/ps038/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '38:2': 'Eu disse: {custodiam} os meus caminhos, * para não {delinquam} {inlingua2}.',
    '38:2b': 'Pus {custodia} à minha boca, * quando o pecador {consisteret} contra mim.',
    '38:3': 'Emudeci, e fui humilhado, e fiquei em silêncio {abonis}: * e a minha dor se renovou.',
    '38:4': 'O meu coração {concaluit} dentro de mim: * e na minha meditação {exardescet}.',
    '38:5': 'Falei {inlingua5}: * {notum}, Senhor, o meu fim.',
    '38:5b': 'E qual é o número dos meus dias: * para que eu saiba o que me falta.',
    '38:6': 'Eis que {mensurabiles} os meus dias: * e {substantia6} é como nada diante de vós.',
    '38:6b': '{verumtamen6}, tudo é vaidade, * todo homem que vive.',
    '38:7': '{verumtamen7}, o homem passa {imagine}: * mas também em vão se perturba.',
    '38:7b': '{thesaurizat}: * e {ignorat} para quem os juntará.',
    '38:8': 'E agora, {exspectatio} Não é o Senhor? * E {substantia8} está {apud8}.',
    '38:9': '{erue} de todas as minhas iniquidades: * {dedisti}.',
    '38:10': 'Emudeci, e não abri a minha boca, {fecisti}: * afastai de mim {plagas}.',
    '38:12': '{fortitudine} da vossa mão eu desfaleci nas repreensões: * por causa da iniquidade castigastes o homem.',
    '38:12b': 'E fizestes a sua alma definhar como uma aranha: * {verumtamen12}, em vão se perturba todo homem.',
    '38:13': '{exaudi}: * dai ouvidos às minhas lágrimas.',
    '38:13b': 'Não fiqueis em silêncio: porque eu sou {advena} {apud13}, e {peregrinus}, * como todos os meus pais.',
    '38:14': '{remitte}, para que eu {refrigerer} antes que eu parta, * {nonero}.',
}

dec('custodia', ['38:2', '38:2b'], 'Custódiam vias meas … Pósui ori meo custódiam', 'word',
    'The Latin sounds one word twice in two cola: *custódiam* the verb (I will guard) and *custódiam* the noun (a guard) — in'
    ' the Greek too, φυλάξω … φυλακήν. custodíre → guardar (glossary); its noun is *guarda*, so the echo survives: *Guardarei'
    ' os meus caminhos … Pus guarda à minha boca*. *pôr guarda a* without the article is Matos Soares 1932\'s wording and a living'
    ' idiom. The custodíre row records that *guardar caminhos* left one blind reader unsure (followed? watched?); here the next'
    ' colon says what the guarding is for. MS1932 *Velarei sobre o meu proceder* loses both the ways and the echo. The two cola'
    ' are quoted in the Rule of St Benedict, ch. 6 (DO Regula/01-24, grep), and 38:2b is a versicle (Sancti/Bavaria 05-16);'
    ' 140:3 *Pone, Dómine, custódiam ori meo* should copy the noun.',
    o('Guardarei … guarda', {'custodiam': 'Guardarei', 'custodia': 'guarda'}, 'Ruling: the root twice, as the Latin and the Greek.', 'glossary'),
    o('Guardarei … uma guarda', {'custodiam': 'Guardarei', 'custodia': 'uma guarda'}, 'The article supplied; heavier, a sentry more than a watch.', 'draft'),
    o('Velarei sobre … guarda', {'custodiam': 'Velarei sobre', 'custodia': 'guarda'}, 'Matos Soares 1932\'s verb; breaks the echo.', 'MS1932'))

dec('delinquam', ['38:2'], 'ut non delínquam in lingua mea', 'glossary',
    'delínquere → cometer faltas (row; 18:13, 24:7, 33:22 kept it apart from peccáre → pecar). Here the Greek is ἁμαρτάνειν,'
    ' the verb behind peccáre, and Douay-Rheims / Matos Soares 1932 both write \'sin\' — but the Latin chose delínquere, and the'
    ' row keeps the Latin\'s two verbs two. The final infinitive after *para não* is the Portuguese build when the subject is'
    ' the same (118:60).',
    o('cometer faltas', {'delinquam': 'cometer faltas'}, 'Ruling: the row.', 'glossary'),
    o('pecar', {'delinquam': 'pecar'}, 'The Greek\'s verb, DRB, MS1932; peccáre\'s word in this psalter.', 'MS1932'))

dec('inlingua', ['38:2', '38:5'], 'in lingua mea (twice)', 'grammar',
    '*in lingua mea* twice in four verses: the instrument (ἐν γλώσσῃ, the Hebrew בִלְשֹׁונִי). Portuguese says the instrument'
    ' with *com* (Douay-Rheims \'with my tongue\', Matos Soares 1932 \'com a minha língua\' both times); *na minha língua* is heard'
    ' as \'in my language\'. One wording for both places, as the Latin has one.',
    o('com a minha língua', {'inlingua2': 'com a minha língua', 'inlingua5': 'com a minha língua'}, 'Ruling.', 'MS1932'),
    o('na minha língua', {'inlingua2': 'na minha língua', 'inlingua5': 'na minha língua'}, 'The preposition kept; heard as \'in my language\'.', 'draft'))

dec('consisteret', ['38:2b'], 'cum consísteret peccátor advérsum me', 'word',
    'consístere: to take one\'s stand, take up a position (L&S; in law, to appear as accuser against). συστῆναι … ἐναντίον μου.'
    ' Douay-Rheims \'stood against me\', Matos Soares 1932 \'se apresentava contra mim\'. *postar-se* is exactly taking a'
    ' position; *levantar-se* and *pôr-se* are spoken for (insúrgere / exsúrgere, astáre). 26:3 *Si consístant … castra* took'
    ' *se instalar* (a camp); a person stands.',
    o('se postava', {'consisteret': 'se postava'}, 'Ruling: takes a position.', 'draft'),
    o('se apresentava', {'consisteret': 'se apresentava'}, 'Matos Soares 1932; the courtroom sense.', 'MS1932'),
    o('se levantava', {'consisteret': 'se levantava'}, 'Plainer; the verb of insúrgere.', 'draft'))

dec('abonis', ['38:3'], 'et sílui a bonis', 'ambiguity',
    'silére → ficar em silêncio (row; 34:22 and 38:13b *ne síleas* → *não fiqueis em silêncio*). *a bonis* (ἐξ ἀγαθῶν) is'
    ' open: kept silent even about good things, or silent and cut off from good things. Douay-Rheims \'kept silence from good'
    ' things\' keeps both; Matos Soares 1932 \'nem mesmo falei de coisas boas\' chooses the first. Portuguese has no'
    ' \'silent from\'; *sobre coisas boas* is the nearer reading and the one both witnesses lean to. bona → *coisas boas* (12:6b'
    ' row) — *os bens* would be heard as property.',
    o('sobre coisas boas', {'abonis': 'sobre coisas boas'}, 'Ruling: silent about good things.', 'draft'),
    o('até sobre coisas boas', {'abonis': 'até sobre coisas boas'}, 'MS1932\'s \'even\' — adds a word.', 'MS1932'),
    o('longe das coisas boas', {'abonis': 'longe das coisas boas'}, 'The separative reading.', 'draft'))

dec('fire', ['38:4'], 'Concáluit cor meum intra me: et in meditatióne mea exardéscet ignis', 'grammar',
    'Two verbs of heat, a perfect then a future (ἐθερμάνθη … ἐκκαυθήσεται, the same tenses). concaléscere is to grow thoroughly'
    ' warm (L&S); exardéscere → inflamar-se (row, 117:12). Matos Soares 1932 has *inflamou-se … acendiam-se*, which spends the'
    ' row\'s verb on the first and makes the future a past; Douay-Rheims keeps the future (\'a fire shall flame out\'). The'
    ' future is the Latin\'s: the fire is still coming.',
    o('se aqueceu … um fogo se inflamará', {'concaluit': 'se aqueceu', 'exardescet': 'um fogo se inflamará'}, 'Ruling: two verbs, the tenses kept.', 'draft'),
    o('ardeu … um fogo se inflamará', {'concaluit': 'ardeu', 'exardescet': 'um fogo se inflamará'}, 'Stronger than warm.', 'draft'),
    o('se aqueceu … se acendia um fogo', {'concaluit': 'se aqueceu', 'exardescet': 'se acendia um fogo'}, 'MS1932\'s past.', 'MS1932'))

dec('notum', ['38:5'], 'Notum fac mihi, Dómine, finem meum', 'glossary',
    '15:11 *Notas mihi fecísti vias vitæ* → *Fizestes-me conhecer os caminhos da vida*: the same build, so the same verb. Matos'
    ' Soares 1932 \'Faze-me conhecer\'.',
    o('Fazei-me conhecer', {'notum': 'Fazei-me conhecer'}, 'Ruling: 15:11.', 'draft'),
    o('Dai-me a conhecer', {'notum': 'Dai-me a conhecer'}, 'Also current; breaks with 15:11.', 'draft'))

dec('mensurabiles', ['38:6'], 'Ecce mensurábiles posuísti dies meos', 'word',
    'mensurábilis: that can be measured (L&S). The Greek is παλαιστάς, \'handbreadths\' (the Hebrew\'s image); the Latin has'
    ' made it \'measurable\', and the Latin is followed. The pónere + predicate row: the Portuguese build\'s verb (*tornar*),'
    ' as 17:33. Matos Soares 1932 \'puseste os meus dias em medida\' keeps *pôr*, and Douay-Rheims \'made my days measurable\'.',
    o('tornastes mensuráveis', {'mensurabiles': 'tornastes mensuráveis'}, 'Ruling: the adjective kept.', 'draft'),
    o('pusestes em medida', {'mensurabiles': 'pusestes em medida'}, 'Matos Soares 1932; keeps pónere.', 'MS1932'),
    o('fizestes do tamanho de um palmo', {'mensurabiles': 'fizestes do tamanho de um palmo'}, 'The Greek and Hebrew image; not the Latin.', 'draft'))

dec('substantia', ['38:6', '38:8'], 'substántia mea (twice)', 'glossary',
    '*substántia mea* twice (ὑπόστασις both times): what the man is, his being, set against nothing (38:6) and found with God'
    ' (38:8). One wording for both. *a minha substância* is the calque (Douay-Rheims) and in Portuguese is chemistry or'
    ' philosophy; *o meu ser* is Matos Soares 1932 in 38:6 (in 38:8 he has *todos os meus bens*, which is 108:11\'s sense —'
    ' property — not this one). New row proposed; 88:48 *quæ mea substántia* and 138:15 can follow, 108:11 (property) and 68:3'
    ' (*non est substántia*, footing) decide locally.',
    o('o meu ser', {'substantia6': 'o meu ser', 'substantia8': 'o meu ser'}, 'Ruling.', 'MS1932'),
    o('a minha substância', {'substantia6': 'a minha substância', 'substantia8': 'a minha substância'}, 'The calque (DRB).', 'DRB'),
    o('a minha existência', {'substantia6': 'a minha existência', 'substantia8': 'a minha existência'}, 'Plain; abstract.', 'draft'))

dec('verumtamen', ['38:6b', '38:7', '38:12b'], 'Verúmtamen (three times)', 'glossary',
    'verúmtamen → todavia (row, open; 31:6b, 90:8). Three times here, so the Portuguese says one word three times. The Greek'
    ' has πλήν, μέντοιγε, πλήν — often asseverative (\'surely\'), and Douay-Rheims reads \'And indeed … Surely … surely\';'
    ' Matos Soares 1932 \'Ah! sim … Sim … Sim\'. But the Latin word is adversative (\'but yet\'), and in each place it turns'
    ' against what went before (my being is nothing before you — yet all is vanity; he wastes away — yet all men fret in vain).'
    ' *Na verdade* is the option that follows the asseverative reading.',
    o('Todavia', {'verumtamen6': 'Todavia', 'verumtamen7': 'Todavia', 'verumtamen12': 'todavia'}, 'Ruling: the row, three times.', 'glossary'),
    o('Na verdade', {'verumtamen6': 'Na verdade', 'verumtamen7': 'Na verdade', 'verumtamen12': 'na verdade'}, 'The asseverative reading (DRB).', 'DRB'))

dec('imagine', ['38:7'], 'in imágine pertránsit homo', 'ambiguity',
    'ἐν εἰκόνι: man passes \'in an image\' — as a mere likeness, a shadow of reality. Douay-Rheims \'as an image\'; Matos Soares'
    ' 1932 \'como uma sombra\' (another word). *em imagem* keeps the preposition and is not Portuguese; *como uma imagem* is the'
    ' plain build of the Latin\'s sense and keeps the word *imagem*. imágo also 72:20.',
    o('como uma imagem', {'imagine': 'como uma imagem'}, 'Ruling.', 'DRB'),
    o('em imagem', {'imagine': 'em imagem'}, 'The preposition kept; stiff.', 'draft'),
    o('como uma sombra', {'imagine': 'como uma sombra'}, 'Matos Soares 1932; another image.', 'MS1932'))

dec('thesaurizat', ['38:7b'], 'Thesaurízat', 'word',
    'One verb, a colon to itself (θησαυρίζει). *Entesoura* is the verb of the same root (Matos Soares 1932) and current. The'
    ' thesáurus row (32:7 *depósitos*, because *tesouros* was heard as riches) is about storehouses of nature; here riches are'
    ' the sense. *Acumula* (plainer) loses the treasure.',
    o('Entesoura', {'thesaurizat': 'Entesoura'}, 'Ruling.', 'MS1932'),
    o('Acumula tesouros', {'thesaurizat': 'Acumula tesouros'}, 'Longer; plain.', 'draft'),
    o('Acumula', {'thesaurizat': 'Acumula'}, 'Plainest; the treasure gone.', 'draft'))

dec('ignorat', ['38:7b'], 'et ignórat cui congregábit ea', 'word',
    'ignoráre with a question after it: \'does not know for whom\'. 34:8 *quem ignórat* → *que desconhece* and 34:11 *quæ'
    ' ignorábam* → *o que eu desconhecia* took *desconhecer* with a noun object; with an indirect question Portuguese says'
    ' *não sabe* (34:15 *et ignorávi* → *e eu não soube*, the Latinist\'s word there). congregáre → juntar (32:7, 34:15);'
    ' *ea* (neuter plural, \'these things\') → *os*, the treasures of *Entesoura*.',
    o('não sabe', {'ignorat': 'não sabe'}, 'Ruling: 34:15.', 'draft'),
    o('desconhece', {'ignorat': 'desconhece'}, '34:8, 34:11 with a noun object.', 'draft'))

dec('exspectatio', ['38:8'], 'Et nunc quæ est exspectátio mea? Nonne Dóminus?', 'glossary',
    'exspectátio → *o que aguardo* (row, D24, D36: *aguardar* is exspectáre\'s; *expectativa* failed the stylist as bureaucratic;'
    ' 118:116 *pelo que aguardo*). The noun becomes a clause (grammar): *que é que eu aguardo? Não é o Senhor?* The answer'
    ' still names what is awaited. Greek ὑπομονή. Douay-Rheims and Matos Soares 1932 \'hope / esperança\' — spes\'s word,'
    ' refused under D36.',
    o('que é que eu aguardo?', {'exspectatio': 'que é que eu aguardo?'}, 'Ruling: the row\'s clause.', 'glossary'),
    o('qual é a minha espera?', {'exspectatio': 'qual é a minha espera?'}, 'A noun; *espera* sounds *esperar*.', 'draft'),
    o('qual é a minha esperança?', {'exspectatio': 'qual é a minha esperança?'}, 'DRB, MS1932 — spes\'s word.', 'MS1932'))

dec('apud', ['38:8', '38:13b'], 'substántia mea apud te est … ádvena ego sum apud te', 'glossary',
    'apud te → junto de vós (row; 21:26, 35:10). Twice here, so the same words twice. In 38:8 the Greek has παρὰ σοῦ (\'from'
    ' you\'), and the row follows the Latin\'s *apud* (Douay-Rheims \'with thee\'); in 38:13b παρὰ σοί (\'with you\'), and'
    ' Douay-Rheims \'with thee\', Matos Soares 1932 \'diante de ti\'.',
    o('junto de vós', {'apud8': 'junto de vós', 'apud13': 'junto de vós'}, 'Ruling: the row.', 'glossary'),
    o('em vós … diante de vós', {'apud8': 'em vós', 'apud13': 'diante de vós'}, 'Matos Soares 1932 in 38:13b; two wordings.', 'MS1932'))

dec('erue', ['38:9'], 'Ab ómnibus iniquitátibus meis érue me', 'glossary',
    'éruere with a source → arrancar (row; 21:21, 31:7 *arrancai-me dos que me cercam*, 36:40). Without a source the row'
    ' gives *libertar* (24:20, D37 review). Here the source is named. The Portuguese order puts the verb first (natural order,'
    ' D2).',
    o('Arrancai-me', {'erue': 'Arrancai-me'}, 'Ruling: the row.', 'glossary'),
    o('Libertai-me', {'erue': 'Libertai-me'}, 'The source-less form; MS1932 \'Livra-me\' is liberáre\'s.', 'draft'))

dec('dedisti', ['38:9'], 'oppróbrium insipiénti dedísti me', 'grammar',
    '*dare* + a predicate noun (ἔδωκάς με ὄνειδος ἄφρονι): you made me a reproach to the fool. oppróbrium → afronta (row);'
    ' insípiens → insensato (row). Douay-Rheims \'thou hast made me a reproach to the fool\', Matos Soares 1932 \'tu me'
    ' fizeste um objecto de opróbrio para o insensato\'. The pónere + predicate row: the Portuguese build\'s verb. Keeping'
    ' *dar* (*me destes como afronta ao insensato*) makes \'afronta ao insensato\' heard as an insult offered TO the fool;'
    ' *para* keeps the fool as the one who scorns.',
    o('fizestes de mim uma afronta para o insensato', {'dedisti': 'fizestes de mim uma afronta para o insensato'}, 'Ruling.', 'MS1932'),
    o('me destes como afronta ao insensato', {'dedisti': 'me destes como afronta ao insensato'}, 'The verb kept; the dative ambiguous.', 'draft'))

dec('fecisti', ['38:10'], 'quóniam tu fecísti', 'ambiguity',
    'fecísti has no object in the Latin: \'because you did (it)\'. The Greek has ὅτι σὺ εἶ ὁ ποιήσας με, \'you are the one who'
    ' made me\' — the Latin does not. Portuguese needs an object pronoun: *o* (Douay-Rheims \'thou hast done it\', Matos'
    ' Soares 1932 \'tu o fizeste\'). *tu* is emphatic, so *vós* is said.',
    o('porque vós o fizestes', {'fecisti': 'porque vós o fizestes'}, 'Ruling.', 'MS1932'),
    o('porque fostes vós que o fizestes', {'fecisti': 'porque fostes vós que o fizestes'}, 'The emphasis made a cleft; longer.', 'draft'),
    o('porque vós me fizestes', {'fecisti': 'porque vós me fizestes'}, 'The Greek\'s \'made me\' — not the Latin.', 'draft'))

dec('plagas', ['38:10'], 'ámove a me plagas tuas', 'word',
    'plaga is a blow, a stroke; its Greek here is μάστιγας, the same word behind flagélla (31:10, 34:15 → *os flagelos*). By'
    ' D15\'s test (one Greek word, no difference of sense) the Portuguese may be one: *os vossos flagelos* (Matos Soares 1932;'
    ' Douay-Rheims \'thy scourges\'). The blind reader of Ps 34 did not know *flagelos* (heard calamities); *golpes* is plain'
    ' and is plaga\'s own sense. amovére → afastar (row; 118:29 *Afastai de mim*).',
    o('os vossos flagelos', {'plagas': 'os vossos flagelos'}, 'Ruling: one Greek word, one Portuguese.', 'MS1932'),
    o('os vossos golpes', {'plagas': 'os vossos golpes'}, 'plaga\'s own sense; plain.', 'draft'))

dec('fortitudine', ['38:12'], 'A fortitúdine manus tuæ ego deféci in increpatiónibus', 'word',
    '*a* + ablative (ἀπὸ τῆς ἰσχύος): by, from the strength of your hand. fortitúdo → força (row); defícere → desfalecer'
    ' (row, a person fainting — not the \'is gone\' of 11:2); increpátio → repreensão (17:16b). *Pela força* keeps the cause;'
    ' Matos Soares 1932 \'Debaixo da força\' makes it a place. The DO pointing puts *in increpatiónibus* with *deféci*,'
    ' against the Greek\'s verse division; the Latin is followed.',
    o('Pela força', {'fortitudine': 'Pela força'}, 'Ruling.', 'draft'),
    o('Sob a força', {'fortitudine': 'Sob a força'}, 'MS1932\'s place.', 'MS1932'))

dec('exaudi', ['38:13'], 'Exáudi oratiónem meam, Dómine, et deprecatiónem meam', 'order',
    'D3 escutar, D35 prece, D4 *dar ouvidos a* in the second colon (as 53:4, 5:2, 16:1b). The Latin puts the vocative between'
    ' the two objects; Portuguese can keep that order, and it lets the two nouns be heard as two (*a minha oração … e a minha'
    ' prece*). The colon is a versicle for St Benedict Joseph Labre (Sancti/aliquibus locis/04-16, grep); and the Matins'
    ' versicle *Deus, ne síleas a me, remítte mihi* and a responsory (Epi2-2) join 38:13–14 with 27:1.',
    o('Escutai a minha oração, Senhor, e a minha prece', {'exaudi': 'Escutai a minha oração, Senhor, e a minha prece'}, 'Ruling: the Latin\'s order.', 'draft'),
    o('Escutai, Senhor, a minha oração e a minha prece', {'exaudi': 'Escutai, Senhor, a minha oração e a minha prece'}, 'The vocative first.', 'draft'))

dec('advena', ['38:13b'], 'quóniam ádvena ego sum apud te, et peregrínus', 'glossary',
    'ádvena here is πάροικος — the Greek behind íncola in 118:19 *Íncola ego sum in terra* → *Eu sou forasteiro na terra*.'
    ' The íncola row said \'kept apart from ádvena\' before the Greek was checked; by D15\'s test the two may share'
    ' *forasteiro*, and the prayer is then heard as the same confession. peregrínus (παρεπίδημος, one staying a while) →'
    ' *peregrino* (Matos Soares 1932, Douay-Rheims \'sojourner\'); 68:9 will follow. *estrangeiro* is the option (alienus →'
    ' estranho already). 93:6, 145:9 (ádvena, the stranger in the land) decide in their psalms.',
    o('forasteiro … peregrino', {'advena': 'forasteiro', 'peregrinus': 'peregrino'}, 'Ruling: 118:19\'s word.', 'glossary'),
    o('estrangeiro … peregrino', {'advena': 'estrangeiro', 'peregrinus': 'peregrino'}, 'Another plain word; breaks 118:19.', 'draft'),
    o('adventício … peregrino', {'advena': 'adventício', 'peregrinus': 'peregrino'}, 'Matos Soares 1932; the cognate, unknown to most.', 'MS1932'))

dec('remitte', ['38:14'], 'Remítte mihi', 'word',
    'remíttere + dative, no object: \'forgive me\' (Douay-Rheims \'O forgive me\'), or \'let up on me, give me respite\' — the'
    ' Greek ἄνες μοι is the second (relax, let go). The Latin word is remíttere, which this psalter has as *perdoar* (31:1'
    ' *remíssæ sunt iniquitátes*); Matos Soares 1932 \'Deixa que eu tome algum alento\' paraphrases the respite. The Latin'
    ' leaves it open; *Perdoai-me* is its commonest sense and the Vulgate-family reading.',
    o('Perdoai-me', {'remitte': 'Perdoai-me'}, 'Ruling.', 'DRB'),
    o('Dai-me trégua', {'remitte': 'Dai-me trégua'}, 'The Greek\'s sense.', 'draft'),
    o('Poupai-me', {'remitte': 'Poupai-me'}, 'Spare me; between the two.', 'draft'))

dec('refrigerer', ['38:14'], 'ut refrígerer priúsquam ábeam', 'word',
    'refrigeráre: to cool, to refresh (L&S); ἀναψύξω, to cool, revive, get one\'s breath back. *tomar alento* (Matos Soares'
    ' 1932) is to get one\'s breath and strength back — the Greek\'s sense and the Latin\'s. *ser refrescado* (Douay-Rheims'
    ' \'refreshed\') is heard as physical cooling; *refrigério* (65:12, the refection row) was unknown to a blind reader.',
    o('tome alento', {'refrigerer': 'tome alento'}, 'Ruling.', 'MS1932'),
    o('seja refrescado', {'refrigerer': 'seja refrescado'}, 'The passive kept (DRB).', 'DRB'),
    o('encontre refrigério', {'refrigerer': 'encontre refrigério'}, 'The Church\'s noun; a verb supplied.', 'draft'))

dec('nonero', ['38:14'], 'et ámplius non ero', 'word',
    '*ero* absolute: I shall not be any more (οὐκέτι μὴ ὑπάρξω). The Latin is an independent future, not governed by'
    ' *priúsquam*. *e não serei mais* is the bare verb and hangs in Portuguese (\'not be more — what?\'); *existir* is what *esse*'
    ' means when it stands alone. Matos Soares 1932 \'e deixe de existir\' puts it under \'before\'.',
    o('e já não existirei', {'nonero': 'e já não existirei'}, 'Ruling: ámplius as *já não*.', 'draft'),
    o('e não existirei mais', {'nonero': 'e não existirei mais'}, 'ámplius as *mais*; rhymes with *pais* at the end of 38:13b (checks).', 'checks'),
    o('e não serei mais', {'nonero': 'e não serei mais'}, 'The bare verb (DRB \'be no more\'); the same rhyme.', 'DRB'),
    o('e deixe de existir', {'nonero': 'e deixe de existir'}, 'MS1932; under priúsquam.', 'MS1932'))

choices = {
    '38:2': 'Dixi → *Eu disse* (the subject named; DRB \'I said\'). via → caminho (row).',
    '38:3': 'obmutéscere → *emudecer*, the same word in 38:10 (the only two places, grep). humiliátus sum → *fui humilhado* (118:107). renováre → *renovar-se*. First colon +6: three verbs, and silére takes the row\'s two-word *ficar em silêncio* (kept, so that 38:13b and 34:22 are heard with it); accepted.',
    '38:9': 'Second colon +4: *fazer de mim* is the build Portuguese gives the predicate (see `dedisti`); accepted. iníquitas → iniquidade.',
    '38:5b': 'scire with an indirect question → *saber* (the scire row: collocation leads). desse → *faltar* (22:1 *nada me faltará*).',
    '38:6': 'Ecce → *Eis que* (row). ante te → *diante de vós*.',
    '38:6b': '*univérsa* (neuter plural, τὰ σύμπαντα) → *tudo*; *omnis homo vivens* in apposition → *todo homem que vive*. vánitas → vaidade (row).',
    '38:7': 'frustra (38:7) and vane (38:12b) are one Greek word (μάτην) → *em vão* both, and *conturbátur* → *se perturba* both (conturbáre row), so 38:12b answers 38:7. *sed et* → *mas também*.',
    '38:10': 'Emudeci as in 38:3. aperíre → abrir (the first person, no ban).',
    '38:12': 'corrípere → castigar (D21). ego → *eu*.',
    '38:13': 'áuribus pércipe → *dai ouvidos a* (D4 names 38:13). lácrimæ → lágrimas (row) — a proparoxytone at the final, where the Latin ends on *meas*; no plain word avoids it, and the possessive after the noun would be inversion for its own sake. First colon −5: the Latin\'s long words.',
    '38:13b': '*Ne síleas* → *Não fiqueis em silêncio*, as 34:22 and 27:1. *ego sum* → *eu sou*. patres → pais.',
    '38:14': 'priúsquam ábeam → *antes que eu parta*. First colon +3 (the purpose clause needs its subject and verb); accepted.',
    '38:12b': 'tabéscere → definhar (row; 118:139 *me fez definhar*). *sicut aráneam* → *como uma aranha* (DRB \'like a spider\'), left where it may go with the soul or with the wasting, as the Latin. The finals of 38:12 and 38:12b both end on *homem*: the Latin has the same word at both ends (*hóminem … homo*), so the echo is kept.',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm38.txt, 18 prayed verses (38:2–38:14 with 38:2b, 5b, 6b, 7b, 12b, 13b; no 38:1, the titulus, D7; DO has no 38:11 — its Latin is joined to 38:10 and 38:12). No flex. Uses by grep (ps032/uses.py): 38:2–3 quoted in the Rule of St Benedict ch. 6 (Regula/01-24); 38:2, 38:2b versicles and a short responsory for St John Nepomuk (Sancti/Bavaria/05-16); 38:4 an Alleluia verse (missa Sancti/05-26); 38:13 a versicle for St Benedict Joseph Labre (Sancti/aliquibus locis/04-16); the Matins versicle *Deus, ne síleas a me, remítte mihi* and the responsory Epi2-2 join 38:13–14 to 27:1. Not in the Diurnal Monástico parallels. The Hetzenauer print read is skipped and owed.'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps038.md (Latin, LXX, WLC, Douay-Rheims, Matos Soares 1932). DO\'s Portuguese not used (D12). Formulas checked with ps038/xref.py (the Latin of the finished psalms beside their Portuguese) and ps005/grep_latin.py: *ne síleas* = 34:22, 27:1; *áuribus pércipe* = D4; *Exáudi oratiónem meam* = 4:2b, 53:4; *Notum fac* ≈ 15:11; *ámove a me* = 118:29; *nihil déerit* 22:1; *érue* with a source 31:7, 36:40; *Humiliátus sum* 118:107; *tabéscere fecit* 118:139; *apud te* 21:26, 35:10; *íncola ego sum* 118:19; flagélla (μάστιγες) 31:10, 34:15. Rulings applied: D3, D4, D21, D24/D36 (exspectátio), D35. D37 and D38 have no place here (no *usque in ætérnum*, no *inops*). Latin readings kept against the Greek: 38:10 *quóniam tu fecísti* (not \'made me\'), 38:6 *mensurábiles* (not \'handbreadths\'), 38:14 *Remítte* as \'forgive\'. Tests for the readers: \'guardar os meus caminhos\', \'se postava\', \'fiquei em silêncio sobre coisas boas\', \'o meu ser\', \'como uma imagem\', \'Entesoura … os juntará\', \'que é que eu aguardo?\', \'fizestes de mim uma afronta para o insensato\', \'flagelos\', \'tome alento\', \'não existirei mais\'.'},
]

data = {'psalm': 38, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
