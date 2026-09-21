"""Ps 35 draft 1. python3.13 research/psalterium/ps035/build_v1.py → prayed.json (overwrites; run only before the critics)."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


decisions = []


def dec(id, refs, latin, kind, why, *options):
    decisions.append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': list(options)})


verses = {
    '35:2': '{semetipso}: * não há temor de Deus diante dos seus olhos.',
    '35:3': 'Porque {dolose} à sua vista: * para que a sua iniquidade {odium}.',
    '35:4': 'As palavras da sua boca são iniquidade e engano: * não quis entender para {bene}.',
    '35:5': 'Meditou a iniquidade no seu leito: * {astitit} em todo caminho que não é bom, e a {malitia} não odiou.',
    '35:6': 'Senhor, no céu está a vossa misericórdia: * {v6b}.',
    '35:7': 'A vossa justiça é como os montes de Deus: * os vossos juízos são {abyssus}.',
    '35:7b': 'Salvareis os homens e os {jumenta}, Senhor: * {quemadmodum} multiplicastes a vossa misericórdia, ó Deus.',
    '35:8': 'Mas os filhos dos homens * esperarão {tegmine} das vossas asas.',
    '35:9': '{inebriabuntur} da {ubertate} da vossa casa: * e da torrente das vossas delícias {potabis}.',
    '35:10': 'Porque {apud} está a fonte da vida: * e na vossa luz veremos a luz.',
    '35:11': '{praetende} a vossa misericórdia aos que vos conhecem, * e a vossa justiça aos que são retos de coração.',
    '35:12': 'Não venha {mihi} o pé da soberba: * e a mão do pecador não me {moveat}.',
    '35:13': 'Ali caíram os que praticam a iniquidade: * foram expulsos, e não puderam estar de pé.',
}

dec('semetipso', ['35:2'], 'Dixit injústus ut delínquat in semetípso', 'ambiguity',
    'Two readings the Latin holds (and the Greek, φησὶν ὁ παράνομος τοῦ ἁμαρτάνειν ἐν ἑαυτῷ): he said *within himself* that he would'
    ' sin (Douay-Rheims, Matos Soares 1932), or he said he would sin *in himself*. The Latin\'s order leaves *in semetípso* after the'
    ' verb of sinning; so does the Portuguese of option 0, which keeps both hearings. delínquere → *cometer faltas* (row; 33:22–23);'
    ' injústus → *o injusto* (apart from iníquus → iníquo, ímpius → ímpio).',
    o('Disse o injusto que cometeria faltas em si mesmo', {'semetipso': 'Disse o injusto que cometeria faltas em si mesmo'},
      'Ruling: the Latin\'s order, both readings open.', 'draft'),
    o('Disse o injusto em si mesmo que cometeria faltas', {'semetipso': 'Disse o injusto em si mesmo que cometeria faltas'},
      'Douay-Rheims\'s reading: within himself.', 'DRB'),
    o('Disse o injusto em si mesmo que havia de pecar', {'semetipso': 'Disse o injusto em si mesmo que havia de pecar'},
      'Matos Soares 1932: peccáre\'s verb.', 'MS1932'))

dec('dolose', ['35:3'], 'Quóniam dolóse egit in conspéctu ejus', 'glossary',
    'dolóse ágere → the dolus row (open) names this place (*dolóse egit* 35:3). 5:11a *dolóse agébant* → *enganavam* (the Greek\'s one'
    ' verb, ἐδολιοῦσαν; ἐδόλωσεν here too); \'agiu com engano\' keeps ágere, the Latin\'s verb, and dolus\'s noun — and *enganou* with'
    ' no object would ask \'whom?\'. in conspéctu ejus → \'à sua vista\' (the conspéctus row, *à vista de*): whose sight — God\'s'
    ' (from 35:2) or his own — the Latin leaves open, and \'sua\' does too.',
    o('agiu com engano', {'dolose': 'agiu com engano'}, 'Ruling: ágere kept.', 'draft'),
    o('enganou', {'dolose': 'enganou'}, '5:11a\'s verb; wants an object.', 'glossary'))

dec('odium', ['35:3'], 'ut inveniátur iníquitas ejus ad ódium', 'grammar',
    'ad ódium: \'unto hatred\' — so that his iniquity may be found, to be hated (the Greek: τοῦ εὑρεῖν … καὶ μισῆσαι, two verbs).'
    ' Douay-Rheims keeps the phrase (\'found unto hatred\'); Matos Soares 1932 explains (\'se tornou mais odiosa\'). \'seja'
    ' encontrada e odiada\' says the phrase\'s sense with a participle, as the Greek\'s second verb does; \'para o ódio\' is the'
    ' calque. invenire → encontrar (20:9 *seja encontrada*).',
    o('seja encontrada e odiada', {'odium': 'seja encontrada e odiada'}, 'Ruling.', 'draft'),
    o('seja encontrada para o ódio', {'odium': 'seja encontrada para o ódio'}, 'The Latin\'s phrase; opaque.', 'DRB'),
    o('seja encontrada digna de ódio', {'odium': 'seja encontrada digna de ódio'}, 'Adds \'digna\'.', 'draft'))

dec('bene', ['35:4'], 'nóluit intellégere ut bene ágeret', 'word',
    'bene ágere (ἀγαθῦναι): to act well. \'agir bem\' keeps ágere as 35:3 keeps it (egit … ágeret: one verb twice in two verses);'
    ' Matos Soares 1932 \'fazer o bem\'. intellégere → entender (glossary).',
    o('agir bem', {'bene': 'agir bem'}, 'Ruling: ágere, as in 35:3.', 'draft'),
    o('fazer o bem', {'bene': 'fazer o bem'}, 'Matos Soares 1932.', 'MS1932'))

dec('astitit', ['35:5'], 'ástitit omni viæ non bonæ', 'glossary',
    'astáre with a dative (παρέστη πάσῃ ὁδῷ): the row\'s split (Ps 5) names 35:5 among the places that take *pôr-se*. \'pôs-se em todo'
    ' caminho\' — *todo* without the article is \'every\' (33:2). *non bonæ* is the Latin\'s litotes (οὐκ ἀγαθῇ), kept as \'que não é'
    ' bom\', not turned into \'mau\'. Matos Soares 1932 \'deteve-se\' is stare\'s (1:1).',
    o('pôs-se', {'astitit': 'pôs-se'}, 'Ruling: the row.', 'glossary'),
    o('deteve-se', {'astitit': 'deteve-se'}, 'Matos Soares 1932; 1:1\'s verb for stare.', 'MS1932'))

dec('malitia', ['35:5'], 'malítiam autem non odívit', 'word',
    'malítia (κακία), 7 lines (grep: 35:5, 49:19, 51:3, 51:5, 93:23, 106:34, 140:4); nequítia (πονηρία) has *maldade* (7:10) — two'
    ' Greek words, so two Portuguese. The cognate \'malícia\' is in Brazil also slyness, even innuendo; the ear will say if that'
    ' comes first here. odívit → \'não odiou\': a past in a narrative of pasts (meditátus est, ástitit); the present sense taken at'
    ' 24:19 and 25:5 belongs to the first person\'s standing hatred. The line ends on the verb, as the Latin\'s.',
    o('malícia', {'malitia': 'malícia'}, 'Ruling: the cognate.', 'MS1932'),
    o('maldade', {'malitia': 'maldade'}, 'nequítia\'s word.', 'draft'))

dec('v6b', ['35:6'], 'Dómine, in cælo misericórdia tua: * et véritas tua usque ad nubes', 'grammar',
    'Both cola are verbless. The first takes \'está\' (the antiphon of Wednesday Lauds I, *Dómine, * in cælo misericórdia tua*, and'
    ' the versicle of Matins, *V. Dómine, in cælo misericórdia tua. R. Et véritas tua usque ad nubes* — Psalmi major.txt, Psalmi'
    ' matutinum.txt, grep); the second keeps the Latin\'s ellipsis, \'e a vossa verdade, até as nuvens\', which also reads alone'
    ' as the response. Matos Soares 1932 supplies \'chega\', \'(eleva-se)\'.',
    o('e a vossa verdade, até as nuvens', {'v6b': 'e a vossa verdade, até as nuvens'}, 'Ruling: the ellipsis.', 'draft'),
    o('e a vossa verdade chega até as nuvens', {'v6b': 'e a vossa verdade chega até as nuvens'}, 'A verb supplied (MS1932).', 'MS1932'))

dec('abyssus', ['35:7'], 'judícia tua abýssus multa', 'word',
    'abýssus multa (ἄβυσσος πολλή): \'a great deep\' (Douay-Rheims). multus is size here; \'um grande abismo\' keeps it; Matos Soares'
    ' 1932 \'um abismo profundo\' shifts to depth. judícium → juízo (D15).',
    o('um grande abismo', {'abyssus': 'um grande abismo'}, 'Ruling.', 'DRB'),
    o('um abismo profundo', {'abyssus': 'um abismo profundo'}, 'Matos Soares 1932.', 'MS1932'))

dec('jumenta', ['35:7b'], 'Hómines, et juménta salvábis', 'word',
    'juménta (κτήνη), beasts of burden and cattle. \'jumentos\' is a donkey in Brazil. \'animais\' is the word 8:8 gave pécora (the same'
    ' Greek κτήνη; D15\'s test lets them share it). The plain order (verb first) ends the colon on \'Senhor\' as the Latin\'s does;'
    ' the Latin fronts the objects.',
    o('animais', {'jumenta': 'animais'}, 'Ruling: 8:8\'s word (κτήνη).', 'glossary'),
    o('gado', {'jumenta': 'gado'}, 'Narrower.', 'draft'))

dec('quemadmodum', ['35:7b'], 'quemádmodum multiplicásti misericórdiam tuam, Deus', 'word',
    'quemádmodum is \'as, in the way that\'. The Greek ὡς at the head of its verse 8 can be an exclamation (\'how you have'
    ' multiplied!\'), and Douay-Rheims and Matos Soares 1932 read it so (\'O how\', \'Quanto\'); the Latin word is comparative, and'
    ' the Latin is translated. The antiphon of Wednesday Lauds II is another Latin, *Multiplicásti, Deus, * misericórdiam tuam*'
    ' (grep). \'como\' alone would hold both.',
    o('assim como', {'quemadmodum': 'assim como'}, 'Ruling: the Latin\'s comparison.', 'draft'),
    o('como', {'quemadmodum': 'como'}, 'Holds the Greek\'s exclamation too.', 'draft'),
    o('quanto', {'quemadmodum': 'quanto'}, 'Matos Soares 1932: the exclamation.', 'MS1932'))

dec('tegmine', ['35:8'], 'in tégmine alárum tuárum sperábunt', 'word',
    'tegmen: a cover (from tégere → cobrir, 31:1; σκέπῃ, shelter). *sombra* is umbra\'s (16:8b *Sob a sombra das vossas asas*, where'
    ' the Latin has umbra), so not here. \'ao abrigo\' is the plain word for a sheltering cover; \'sob a cobertura\' keeps the'
    ' root and is heard in Brazil as a roof, an insurance, an icing. alæ → asas (glossary).',
    o('ao abrigo', {'tegmine': 'ao abrigo'}, 'Ruling.', 'draft'),
    o('sob a cobertura', {'tegmine': 'sob a cobertura'}, 'tégere\'s root.', 'draft'),
    o('à sombra', {'tegmine': 'à sombra'}, 'Matos Soares 1932; umbra\'s word.', 'MS1932'))

dec('inebriabuntur', ['35:9'], 'Inebriabúntur ab ubertáte domus tuæ', 'glossary',
    'inebriáre → embriagar (row; the row names 35:9; the image kept unexplained, 22:5b). The future passive kept: \'Serão embriagados\''
    ' (μεθυσθήσονται). The colon is a versicle and responsory of the Brazilian feast of the Eucharistic Heart (horas Tempora/Brasilia,'
    ' grep) and, with 35:9b, an Alleluia (missa Sancti/01-31).',
    o('Serão embriagados', {'inebriabuntur': 'Serão embriagados'}, 'Ruling: the passive.', 'draft'),
    o('Embriagar-se-ão', {'inebriabuntur': 'Embriagar-se-ão'}, 'Reflexive, with mesóclise (Matos Soares 1932).', 'MS1932'))

dec('ubertate', ['35:9'], 'ab ubertáte domus tuæ', 'word',
    'ubértas (πιότης, \'fatness\' in the Greek): fruitfulness, plenty. *abundância* is abundántia\'s (row, Ps 29). \'fartura\' is the'
    ' plain Brazilian word for plenty at table, which is the image (drink, a house\'s store); 64:12 *campi tui replebúntur ubertáte*'
    ' is the other place (grep).',
    o('fartura', {'ubertate': 'fartura'}, 'Ruling.', 'draft'),
    o('abundância', {'ubertate': 'abundância'}, 'Matos Soares 1932; abundántia\'s word.', 'MS1932'),
    o('fertilidade', {'ubertate': 'fertilidade'}, 'Of land.', 'draft'))

dec('potabis', ['35:9'], 'et torrénte voluptátis tuæ potábis eos', 'grammar',
    'potáre (ποτιεῖς): to give to drink. \'lhes dareis de beber\' is the Portuguese verb for it; the Latin\'s order (the torrent first,'
    ' the verb last) kept, which ends the verse on \'beber\'. voluptas → delícias (row; the row names 35:9). The Matins antiphon of'
    ' Pent02-5 has *potábis nos* (grep).',
    o('lhes dareis de beber', {'potabis': 'lhes dareis de beber'}, 'Ruling.', 'draft'),
    o('os fareis beber', {'potabis': 'os fareis beber'}, 'Matos Soares 1932.', 'MS1932'))

dec('apud', ['35:10'], 'Quóniam apud te est fons vitæ', 'glossary',
    'apud te → *junto de vós* (row, 21:26): the Latin\'s *apud*, \'with, beside\'. Matos Soares 1932 \'em ti\' is *in te*. The verse is a'
    ' versicle (Sancti/08-06) and an antiphon (Pent02-5) (grep). The second colon keeps the Latin\'s echo *lúmine … lumen* as \'luz'
    ' … luz\' (lumen → luz, glossary).',
    o('junto de vós', {'apud': 'junto de vós'}, 'Ruling: the row.', 'glossary'),
    o('em vós', {'apud': 'em vós'}, 'Matos Soares 1932.', 'MS1932'))

dec('praetende', ['35:11'], 'Præténde misericórdiam tuam sciéntibus te', 'word',
    'prætendere, only here (grep): to stretch out before (παράτεινον, extend, prolong). \'Estendei\' (Matos Soares 1932, Douay-Rheims'
    ' \'Extend\'); safe at the vós imperative (past *estendi*). sciéntibus te → \'aos que vos conhecem\' (scire with a person →'
    ' conhecer, the scire row).',
    o('Estendei', {'praetende': 'Estendei'}, 'Ruling.', 'MS1932'),
    o('Prolongai', {'praetende': 'Prolongai'}, 'The Greek\'s \'prolong\'.', 'draft'))

dec('mihi', ['35:12'], 'Non véniat mihi pes supérbiæ', 'word',
    'mihi, a dative: \'come to me\'. \'a mim\' keeps it; Matos Soares 1932 \'sobre mim\' makes an attack of it (the foot trampling),'
    ' which the Latin implies but does not say. supérbia → soberba (glossary).',
    o('a mim', {'mihi': 'a mim'}, 'Ruling.', 'draft'),
    o('sobre mim', {'mihi': 'sobre mim'}, 'Matos Soares 1932.', 'MS1932'))

dec('moveat', ['35:12'], 'et manus peccatóris non móveat me', 'glossary',
    'movére, active (σαλεύσαι, shake): the movéri row → *ser abalado*; its active is \'abalar\' (28:8 *abala*). \'não me mova\' is'
    ' literal and weak (\'not move me\' — or \'not touch me emotionally\'); Matos Soares 1932 \'não me comova\' is that sense.',
    o('abale', {'moveat': 'abale'}, 'Ruling: the row.', 'glossary'),
    o('mova', {'moveat': 'mova'}, 'The calque.', 'draft'))

choices = {
    '35:2': 'The second colon = 13:3d\'s last colon (*non est timor Dei ante óculos eórum*), copied: *não há temor de Deus diante dos seus olhos* (Rom 3:18 in Ps 13\'s notes).',
    '35:4': 'The first colon is verbless; \'são\' supplied (grammar). dolus → engano (row).',
    '35:5': 'meditári + accusative → meditar (2:1); cubíle → leito (4:5 *nos vossos leitos*); the natural order, the verb first.',
    '35:7': 'Both cola verbless; \'é\', \'são\' supplied. *montes Dei* kept (not \'great mountains\').',
    '35:8': 'Fílii hóminum → os filhos dos homens; speráre → esperar.',
    '35:10': 'The Latin\'s *lúmine … lumen* kept as *luz … luz* — one word twice, as asked.',
    '35:11': 'rectus corde → reto de coração (row).',
    '35:13': 'operári iniquitátem → praticar a iniquidade (row); expéllere → expulsar (row, names 35:13); stare → estar de pé (17:39 *e não poderão estar de pé*). *Ibi* → \'Ali\'.',
}

audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm35.txt, 13 prayed verses (35:2–35:13 with 35:7b; no 35:1, the titulus, D7). No flex. Liturgy by grep (ps032/uses.py): Wednesday Lauds — antiphon *Dómine, * in cælo misericórdia tua* (Lauds I, Psalmi major.txt) and *Multiplicásti, Deus, * misericórdiam tuam* (Lauds II; another Latin than 35:7b); Matins versicle *V. Dómine, in cælo misericórdia tua. R. Et véritas tua usque ad nubes*; 35:9 an Alleluia (missa Sancti/01-31) and a Brazilian versicle; 35:10 a versicle (Sancti/08-06) and an antiphon with 35:9b (Pent02-5). In the Diurnal Monástico (from the Hebrew; used only as a witness of diction).'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps035.md (Latin, LXX, WLC, Douay-Rheims, Diurnal 1962, Matos Soares 1932). DO\'s Portuguese not used (D12). Counts with ps005/grep_latin.py: prætendere, fons only here; malítia 7 lines, juménta 5, ubértas 2. Glossary applied: delínquere, dolus, conspéctus (à vista de), astáre + dative (pôr-se), inebriáre, voluptas, apud te, lumen, rectus corde, supérbia, movéri, operári iniquitátem, expéllere, stare; 35:2b copies 13:3d. Latin (= Greek) readings kept against the Hebrew: 35:2 (the unjust *said* he would sin, not \'transgression speaks\'), 35:3 *agiu com engano à sua vista … seja encontrada e odiada*, 35:4 *não quis entender*, 35:7b *assim como multiplicastes*, 35:8 *esperarão*, 35:12 *o pé da soberba … não me abale*, 35:13 *foram expulsos*. Tests for the readers: \'cometeria faltas em si mesmo\', \'à sua vista\', \'encontrada e odiada\', \'pôs-se em todo caminho\', \'malícia\', \'ao abrigo\', \'fartura\', \'junto de vós\', \'não me abale\'.'},
]

data = {'psalm': 35, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft', 'verses': verses,
        'decisions': decisions, 'choices': choices, 'audit': audit}
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(verses), 'verses,', len(decisions), 'decisions')
