"""Writes ps018/prayed.json, draft 1."""
import json
import pathlib

here = pathlib.Path(__file__).parent

verses = {
    '18:2': 'Os céus {enarrant} a glória de Deus: * e o {firmamentum} anuncia as obras das suas mãos.',
    '18:3': 'O dia ao dia {eructat} a palavra, * e a noite à noite indica {scientiam}.',
    '18:4': 'Não há {loquelae} nem palavras, * {quorum}.',
    '18:5': 'Por toda a terra saiu o som deles: * e até os confins {orbis} as palavras deles.',
    '18:6a': 'No sol pôs {tabernaculum}: * e ele, como um esposo que sai do seu {thalamo}:',
    '18:6b': 'Exultou como um {gigas} para correr o caminho, * do {summo} do céu é a sua saída:',
    '18:7b': 'E a sua {occursus} até o seu {summum}: * e não há quem se esconda do seu calor.',
    '18:8': 'A lei do Senhor é imaculada, {convertens}: * o testemunho do Senhor é fiel, {praestans}.',
    '18:9': 'As justiças do Senhor são retas, {laetificantes}: * o decreto do Senhor é {lucidum}, {illuminans}.',
    '18:10': 'O temor do Senhor é santo, {permanens} pelos séculos dos séculos: * os juízos do Senhor são verdadeiros, justificados em si mesmos.',
    '18:11': '{desiderabilia} que o ouro e que {lapidem}: * e mais doces que o mel e o favo.',
    '18:12': 'Pois o vosso servo os guarda, * em guardá-los há {multa}.',
    '18:13': 'Quem entende as {delicta}? † Das minhas {occultis} purificai-me: * e das {alienis} poupai o vosso servo.',
    '18:14b': 'Se não me {dominati}, então serei imaculado: * e serei purificado da {maximo}.',
    '18:15a': 'E {eloquia}: * e a meditação do meu coração, sempre à vossa vista.',
    '18:15b': 'Senhor, meu {adjutor}, * e meu redentor.',
}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def dec(id_, refs, latin, kind, why, options):
    return {'id': id_, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}


decisions = [
    dec('enarrant', ['18:2'], 'Cæli enárrant glóriam Dei', 'glossary',
        'enarráre (διηγοῦνται): two places (18:2, 49:16 *Quare tu enárras justítias meas*); the glossary has narráre → narrar (117:17). The compound kept on the simple verb, as the Greek has one verb for both. DRB *shew forth*, MS1932 *publicam*, the Diurnal (from the Hebrew) *Narram*.',
        [opt('narram', {'enarrant': 'narram'}, 'Ruling: one family with narráre → narrar; the Greek narrates.', 'draft'),
         opt('proclamam', {'enarrant': 'proclamam'}, 'Heard as louder; proclamar is prædicáre\'s (glossary).', 'draft'),
         opt('publicam', {'enarrant': 'publicam'}, 'MS1932; heard today as printing.', 'MS1932')]),
    dec('firmamentum', ['18:2'], 'annúntiat firmaméntum', 'glossary',
        'firmaméntum here is the sky (στερέωμα, the vault of Gen 1:6), not God as support: D31 keeps *esteio* for the second and names 18:2 as the place for *firmamento*. annuntiáre → anunciar (glossary, kept apart from prædicáre → proclamar). The Latin puts the object first (*ópera mánuum ejus annúntiat firmaméntum*); Portuguese order puts the subject first (D2), as MS1932 does.',
        [opt('firmamento', {'firmamentum': 'firmamento'}, 'Ruling: D31.', 'D31'),
         opt('céu', {'firmamentum': 'céu'}, 'Plain; but cæli already stands in the first colon, and the Latin has two words.', 'draft')]),
    dec('eructat', ['18:3'], 'Dies diéi erúctat verbum', 'glossary',
        'eructáre (ἐρεύγεται): the glossary row (open) names this verse and renders *fazer jorrar* at 118:171, keeping the gush and not the belch. verbum → palavra (glossary). índicat → indica (the Latin\'s word; the Greek repeats ἀναγγέλλει, the Latin varies). DRB *uttereth*, MS1932 *transmite esta mensagem*.',
        [opt('faz jorrar', {'eructat': 'faz jorrar'}, 'Ruling: the row\'s verb; the day pouring out speech to the day.', 'glossary'),
         opt('profere', {'eructat': 'profere'}, 'Plain utterance (church Latin sense), the image lost.', 'DRB'),
         opt('transmite', {'eructat': 'transmite'}, 'MS1932; the passing on from day to day, the image lost.', 'MS1932')]),
    dec('scientiam', ['18:3'], 'índicat sciéntiam', 'glossary',
        'sciéntia (γνῶσις): the glossary row (open) is *o saber* (118:66), naming 18:3; *ciência* heard as science.',
        [opt('o saber', {'scientiam': 'o saber'}, 'Ruling: the row.', 'glossary'),
         opt('o conhecimento', {'scientiam': 'o conhecimento'}, 'The row\'s option.', 'glossary')]),
    dec('loquelae', ['18:4'], 'Non sunt loquélæ, neque sermónes', 'lexical',
        'loquéla (λαλιαί): only here in the psalter (grep); L&S "speech, language, words, discourse". sermo → palavra (D15; its own row), so loquéla needs a second word. The Latin says there is no speech of any kind whose voice is not heard: the heavens\' message reaches every tongue. DRB *speeches nor languages*, MS1932 *linguagem nem idioma*.',
        [opt('linguagens', {'loquelae': 'linguagens'}, 'Ruling: "language" is L&S\'s second sense and DRB/MS1932\'s reading; keeps *palavras* for sermónes.', 'draft'),
         opt('falas', {'loquelae': 'falas'}, 'Closer to λαλιά (talk, speech); heard as spoken turns.', 'draft'),
         opt('línguas', {'loquelae': 'línguas'}, 'Heard as tongues (organ or nations) — lingua is another word.', 'draft')]),
    dec('quorum', ['18:4'], 'quorum non audiántur voces eórum', 'grammar',
        'The relative with a resumptive pronoun (*quorum … eórum*), a Hebraism through the Greek (ὧν … αὐτῶν): Portuguese says it once. The subjunctive kept (a consecutive relative after a negative). Grammar only (D2).',
        [opt('cujas vozes não sejam ouvidas', {'quorum': 'cujas vozes não sejam ouvidas'}, 'Ruling: *cujas* carries both quorum and eórum; the passive kept.', 'draft'),
         opt('em que não se ouçam as suas vozes', {'quorum': 'em que não se ouçam as suas vozes'}, 'MS1932\'s build (*em que*); the pronominal passive.', 'MS1932')]),
    dec('orbis', ['18:5'], 'in fines orbis terræ verba eórum', 'glossary',
        'orbis terræ → o mundo (D30); fines → confins (glossary). Rom 10:18 quotes 18:5 word for word (Vulgate *in omnem terram exívit sonus eórum, et in fines orbis terræ verba eórum*; Greek τὰ πέρατα τῆς οἰκουμένης), fetched into consult/bolls-VULG-45-10.json and bolls-TISCH-45-10.json — the psalm must read as the apostle\'s quotation does. *in omnem terram … in fines*: motion to; *Por toda a terra … até os confins* is Portuguese for it. sonus → som; verba → palavras (as 18:4 sermónes: the Greek has λόγοι and ῥήματα, the Latin sermónes and verba; both *palavras*, D15). The verb supplied from the first colon by ellipsis, as the Latin.',
        [opt('do mundo', {'orbis': 'do mundo'}, 'Ruling: D30.', 'D30'),
         opt('do orbe da terra', {'orbis': 'do orbe da terra'}, 'D30\'s option; *orbe* unknown to a blind reader.', 'D30')]),
    dec('tabernaculum', ['18:6a'], 'In sole pósuit tabernáculum suum', 'glossary',
        'tabernáculum → tenda (glossary; 14:1). In the Latin (and the Greek) God sets his tent *in* the sun; the Hebrew has a tent *for* the sun (the Diurnal). The Latin\'s reading kept (rule 1). The subject of *pósuit* is left unnamed, as the Latin; MS1932 supplies *(Deus)*.',
        [opt('tenda', {'tabernaculum': 'a sua tenda'}, 'Ruling: the glossary.', 'glossary'),
         opt('tabernáculo', {'tabernaculum': 'o seu tabernáculo'}, 'MS1932; heard as the church tabernacle.', 'MS1932')]),
    dec('thalamo', ['18:6a'], 'tamquam sponsus procédens de thálamo suo', 'lexical',
        'thálamus (παστός): only here (grep). The bridal chamber. sponsus → esposo (MS1932; *noivo* the Diurnal). procédens → *que sai*, the participle as a relative (Portuguese has no active participle of *sair* that stands).',
        [opt('tálamo', {'thalamo': 'tálamo'}, 'Ruling: the Latin\'s word, in MS1932 and the Diurnal; literary but current in the psalm\'s tradition.', 'MS1932'),
         opt('quarto nupcial', {'thalamo': 'quarto nupcial'}, 'Plain; the chamber explained.', 'draft'),
         opt('câmara nupcial', {'thalamo': 'câmara nupcial'}, 'DRB *bride chamber*.', 'DRB')]),
    dec('gigas', ['18:6b'], 'Exsultávit ut gigas ad curréndam viam', 'lexical',
        'gigas (γίγας): 18:6b and 32:16 *nec gigas salvábitur in multitúdine virtútis suæ* (grep). The Latin\'s word; the Hebrew has "a strong man" (the Diurnal *atleta*). exsultáre → exultar (glossary). ad curréndam viam → *para correr o caminho* (the gerundive of purpose).',
        [opt('gigante', {'gigas': 'gigante'}, 'Ruling: the Latin\'s word (rule 1); DRB and MS1932.', 'draft'),
         opt('herói', {'gigas': 'herói'}, 'The sense of γίγας as mighty man; another word.', 'draft')]),
    dec('summo', ['18:6b', '18:7b'], 'a summo cælo egréssio ejus … usque ad summum ejus', 'lexical',
        'summus twice (ἀπ᾿ ἄκρου … ἕως ἄκρου): the Latin repeats the word, the second time without *cælum* (*ad summum ejus*, "to its height/end"). One Portuguese word for both (D2: repetitions kept). *extremo* says both the end and the far edge (MS1932 *extremidade … extremidade*, DRB *end … end*). egréssio → saída.',
        [opt('extremo … extremo', {'summo': 'extremo', 'summum': 'extremo'}, 'Ruling: one word twice, as the Latin.', 'draft'),
         opt('alto … alto', {'summo': 'alto', 'summum': 'alto'}, 'summus as "highest"; the course from the height to the height.', 'draft'),
         opt('cimo … cimo', {'summo': 'cimo', 'summum': 'cimo'}, 'The literal "top"; heard as a mountain\'s.', 'literal')]),
    dec('occursus', ['18:7b'], 'Et occúrsus ejus usque ad summum ejus', 'lexical',
        'occúrsus (κατάντημα): only here. L&S "a meeting, falling in with". The Greek word is the arrival, the goal reached — the pair of ἔξοδος / egréssio (*saída*) in the line before: the sun goes out from one end and arrives at the other. DRB *circuit*, MS1932 *o seu curso* follow the Hebrew\'s "circuit".',
        [opt('chegada', {'occursus': 'chegada'}, 'Ruling: the pair of *saída*; the Greek word; the Latin\'s "meeting" is the arriving.', 'draft'),
         opt('percurso', {'occursus': 'percurso'}, 'DRB/MS1932 (*circuit*, *curso*); from the Hebrew\'s sense.', 'MS1932'),
         opt('encontro', {'occursus': 'encontro'}, 'L&S\'s first sense; heard as a meeting with someone.', 'literal')]),
    dec('participles', ['18:8', '18:9', '18:10'], 'convértens … præstans … lætificántes … illúminans … pérmanens', 'grammar',
        'Six predicates in three verses, each an adjective and an active participle (Greek the same). Portuguese has no present participles that stand: the adjective takes a copula (*é imaculada*, as MS1932) and the participle becomes a finite verb in the same tense (*converte*, *dá*, *alegram*, *ilumina*, *permanece*), the verses heard as statements, as the Latin\'s are. One ruling for the series so the six stand alike. justificáta (a perfect passive participle) stays a participle: *justificados em si mesmos*.',
        [opt('finite verbs', {'praestans': 'dá sabedoria aos pequeninos', 'laetificantes': 'alegram os corações', 'illuminans': 'ilumina os olhos', 'permanens': 'permanece'}, 'Ruling: MS1932\'s build for 18:8.', 'MS1932'),
         opt('gerunds', {'praestans': 'dando sabedoria aos pequeninos', 'laetificantes': 'alegrando os corações', 'illuminans': 'iluminando os olhos', 'permanens': 'permanecendo'}, 'Closer in form; the copula still needed, and six gerunds in a row.', 'literal'),
         opt('relatives', {'praestans': 'que dá sabedoria aos pequeninos', 'laetificantes': 'que alegram os corações', 'illuminans': 'que ilumina os olhos', 'permanens': 'que permanece'}, 'The participle as a relative; longer.', 'draft')]),
    dec('convertens', ['18:8'], 'convértens ánimas', 'glossary',
        'convértere → *voltar* in the glossary (open), because *converter* is heard as religious conversion; D25 overruled it at 7:13 where that is the sense. Here too: the law turns souls back to God (ἐπιστρέφων ψυχάς), the verse the Church reads of conversion; DRB *converting*, MS1932 *converte as almas*. *faz voltar as almas* is the row\'s verb. (The participles decision covers the other five; this slot is ruled here, finite as they are.)',
        [opt('converte as almas', {'convertens': 'converte as almas'}, 'Ruling: D25\'s exception — the sense is conversion.', 'D25'),
         opt('faz voltar as almas', {'convertens': 'faz voltar as almas'}, 'The row\'s verb, causative; heard as restoring.', 'glossary')]),
    dec('lucidum', ['18:9'], 'præcéptum Dómini lúcidum', 'lexical',
        'præcéptum → decreto (D19; its list names 18:9). lúcidus (τηλαυγής, shining far): only here in the psalter of this sense. justítiæ plural → *as justiças* (glossary row, open; the Greek is δικαιώματα here, but the Latin\'s word is justítiæ and it is kept). lætificáre → alegrar (the verb, not *lætári*\'s reflexive). illumináre → iluminar (glossary).',
        [opt('luminoso', {'lucidum': 'luminoso'}, 'Ruling: full of light, the pair of *ilumina*; DRB *lightsome*.', 'DRB'),
         opt('claro', {'lucidum': 'claro'}, 'Plainer; heard also as "easy to understand".', 'draft')]),
    dec('desiderabilia', ['18:11'], 'Desiderabília super aurum et lápidem pretiósum multum: et dulcióra super mel et favum', 'grammar',
        'The verse has no verb and no subject: the judgments of 18:10 are *desiderabília … dulcióra*. *super* with a positive (*desiderabília super*) is the comparative, as the next colon\'s *dulcióra super*; Portuguese says both with *mais … que*. The verbless line kept, as the Latin (DRB supplies nothing either). favus → favo (only here).',
        [opt('Mais desejáveis', {'desiderabilia': 'Mais desejáveis'}, 'Ruling.', 'draft'),
         opt('São mais desejáveis', {'desiderabilia': 'São mais desejáveis'}, 'A copula supplied (D2).', 'draft'),
         opt('Mais para desejar', {'desiderabilia': 'Mais para desejar'}, 'The gerundive sense of -bilis; stiff.', 'draft')]),
    dec('multa', ['18:11', '18:12'], 'lápidem pretiósum multum … retribútio multa', 'repetition',
        'multus twice, in consecutive verses (πολύν … πολλή): kept as one word (D2: the Latin\'s repetitions). *lápidem pretiósum multum* is the collective singular ("much precious stone"). retribútio → retribuição (glossary).',
        [opt('muita … muita', {'lapidem': 'muita pedra preciosa', 'multa': 'muita retribuição'}, 'Ruling: the repetition, the collective singular kept.', 'draft'),
         opt('muitas … grande', {'lapidem': 'muitas pedras preciosas', 'multa': 'grande retribuição'}, 'DRB (*many precious stones … a great reward*); the repetition lost.', 'DRB')]),
    dec('delicta', ['18:13', '18:14b'], 'Delícta quis intéllegit? … a delícto máximo', 'glossary',
        'delíctum → falta (glossary row delínquere / delíctum, open, naming 18:13; kept apart from peccátum → pecado). Three times in two verses (the plural, *ab occúltis meis*, *ab aliénis*, and 18:14b *a delícto máximo*): the adjectives *occúltis* and *aliénis* stand without a noun in the Latin, and Portuguese needs the noun once — supplied in the first (*faltas ocultas*) and carried by the feminine into *das estranhas*. intellégere → entender (glossary).',
        [opt('faltas', {'delicta': 'faltas', 'occultis': 'faltas ocultas', 'maximo': 'maior falta'}, 'Ruling: the row.', 'glossary'),
         opt('delitos', {'delicta': 'delitos', 'occultis': 'delitos ocultos', 'maximo': 'maior delito'}, 'The cognate; legal.', 'literal'),
         opt('(no noun) coisas ocultas', {'delicta': 'faltas', 'occultis': 'coisas ocultas', 'maximo': 'maior falta'}, 'No noun supplied; *das estranhas* then refers to *coisas*.', 'draft')]),
    dec('alienis', ['18:13'], 'et ab aliénis parce servo tuo', 'glossary',
        'aliénus → estranho (glossary row, working): in the Latin *ab aliénis* is "from others\' [faults]" (DRB *from those of others*) or "from strangers" (ἀπὸ ἀλλοτρίων; the Hebrew "from the presumptuous", the Diurnal *deuses estranhos*). *das estranhas* keeps the Latin\'s ambiguity with the noun supplied by 18:13. párcere → poupar (18:13, 71:13).',
        [opt('estranhas', {'alienis': 'estranhas'}, 'Ruling: the row; open between the faults of others and the faults that are foreign to me.', 'glossary'),
         opt('alheias', {'alienis': 'alheias'}, 'Others\' faults, plainly — closes the ambiguity.', 'DRB')]),
    dec('dominati', ['18:14b'], 'Si mei non fúerint domináti', 'grammar',
        'Future perfect in the condition (*fúerint domináti*); Portuguese says the future subjunctive: *Se não me dominarem*. dominári with a genitive (*mei*) → *dominar* with a direct object. The subject is the faults of 18:13.',
        [opt('dominarem', {'dominati': 'dominarem'}, 'Ruling.', 'draft'),
         opt('tiverem dominado', {'dominati': 'tiverem dominado'}, 'The compound future subjunctive, closer to the tense; heavy.', 'literal')]),
    dec('maximo', ['18:14b'], 'emundábor a delícto máximo', 'lexical',
        'máximus → *maior* (the superlative relative: "the greatest"); mundáre / emundáre → *purificar* (καθαρίζω both times; four lines in the psalter — 18:13, 18:14b, 50:4, 88:45 — and the adjective mundus 23:4, 50:12). Only 11:7 *purgátum* is already *purificada* (one line; another Greek word): noted for the row. immaculátus → imaculado (glossary; 18:8 and 18:14b both have it).',
        [opt('maior falta', {'maximo': 'maior falta'}, 'Ruling.', 'draft'),
         opt('falta máxima', {'maximo': 'falta máxima'}, 'The Latin\'s word; heard as a scale.', 'literal')]),
    dec('eloquia', ['18:15a'], 'Et erunt ut compláceant elóquia oris mei', 'glossary',
        'elóquium: D26 made it the clause *o que dissestes* in Ps 118; D27 lets the psalm decide outside it. Here verbum (18:3, 18:5) and sermo (18:4) are already *palavra(s)*, so the clause keeps elóquia apart: *o que disser a minha boca*. *erunt ut compláceant* (ἔσονται εἰς εὐδοκίαν, "shall be for good pleasure") → *há de agradar*, the future kept. complacére → agradar.',
        [opt('E há de agradar o que disser a minha boca', {'eloquia': 'há de agradar o que disser a minha boca'}, 'Ruling: D26\'s clause, the future.', 'D26'),
         opt('E serão agradáveis as palavras da minha boca', {'eloquia': 'serão agradáveis as palavras da minha boca'}, 'MS1932-family; *palavras* shared with verbum and sermo.', 'MS1932'),
         opt('E os ditos da minha boca hão de agradar', {'eloquia': 'os ditos da minha boca hão de agradar'}, 'The noun D26 retired.', 'D16')]),
    dec('adjutor', ['18:15b'], 'Dómine, adjútor meus, et redémptor meus', 'glossary',
        'adjútor → auxílio (glossary, open; held against the Latinist\'s minor twice at 117:6–7). Here it stands beside an agent noun, redémptor → redentor (18:15b, 77:35 — the only two places, and 77:35 has adjútor beside it too). λυτρωτής: *redentor*, not *resgatador* (redímere → resgatar is the verb\'s row, open).',
        [opt('auxílio', {'adjutor': 'auxílio'}, 'Ruling: the glossary; the one family with adjutórium.', 'glossary'),
         opt('auxiliador', {'adjutor': 'auxiliador'}, 'The agent noun, the pair of *redentor*; the Latinist\'s ask at 117:6–7.', 'latinist')]),
]

choices = {
    '18:2': 'Cæli → os céus; glória Dei → a glória de Deus; ópera mánuum ejus → as obras das suas mãos (narráre / ópera row).',
    '18:3': 'Dies diéi … nox nocti → *O dia ao dia … a noite à noite*: the Latin\'s datives, not MS1932\'s "um dia … ao outro dia".',
    '18:5': 'sonus → som; *deles* for eórum (the heavens\').',
    '18:6b': 'viam → o caminho; egréssio → saída; *é* supplied (the colon has no verb).',
    '18:7b': 'nec est qui se abscóndat → *e não há quem se esconda*; calor → calor.',
    '18:10': 'timor → temor; in sǽculum sǽculi → *pelos séculos dos séculos* (settled, D27); judícia → juízos (D15); in semetípsa → *em si mesmos*.',
    '18:12': 'Étenim → Pois (glossary); custódit → guarda; *in custodiéndis illis* → *em guardá-los*; *há* supplied.',
    '18:15a': 'meditátio → meditação (glossary); in conspéctu tuo → *à vossa vista* (conspéctus row); semper → sempre.',
    '18:15b': 'Dómine bare in the vocative.',
}

audit_extra = [
    {'step': 'checks', 'note': 'Draft 1: hard pass (checks.py exit 0). Soft flags accepted: 18:3 first colon +4 (*faz jorrar*, the articles the Latin lacks); 18:6a first colon −5 (*tabernáculum* → *tenda*, two syllables for five); 18:6b first colon +4 (*como um … para*); 18:9 second colon +3 and 18:10 first colon +5 (the copulas the participles decision supplies, and *pelos séculos dos séculos*); 18:13 middle colon +4 (the noun *faltas* supplied, *purificai-me* for *munda me*); 18:14b −3. Rhyme flag 18:5 (*deles … deles*): the Latin\'s own *eórum … eórum* at both cadences — kept, rule 5\'s exception.'},
]
audit = [
    {'step': 'source', 'note': 'Latin = DO Psalm18.txt, sixteen prayed verses with DO\'s ids (18:2, 3, 4, 5, 6a, 6b, 7b, 8, 9, 10, 11, 12, 13, 14b, 15a, 15b); inline (7a), (14a) markers not reproduced. Collated against the Clementine Vulgate fetched from Bolls (consult/bolls-VULG-19-18.json): identical (intelligit / intéllegit is spelling). 18:5 checked against its quotation in Rom 10:18 (consult/bolls-VULG-45-10.json, bolls-TISCH-45-10.json): word for word in the Vulgate.'},
    {'step': 'draft', 'note': 'Psalm-level draft from consult/parallels/ps018.md (LXX, Hebrew, Douay-Rheims, Matos Soares 1932 text layer, the Diurnal — from the Hebrew, not used for sense). DO\'s Portuguese not used (D12). Repeats checked with ps005/grep_latin.py: loquél- (1), redémpt- (2: 18:15b, 77:35), enarr- (2), eruct- (5), thálam- (1), gigas (2), favus (1), delíct- (9), (e)mund- (4 verbs), purg- (1: 11:7), párc- (2). L&S read for occúrsus, loquéla (consult/ls_O.json, ls_L.json). Septuagintal readings kept against the Hebrew: 18:4 (no speech whose voice is not heard), 18:5 *som* (Hebrew "line"), 18:6a the tent *in* the sun, 18:6b *gigante*, 18:7b *chegada*, 18:13 *das estranhas*. 23 decisions.'},
]

d = {'psalm': 18, 'tier': 3, 'version': 1, 'address': 'vós', 'status': 'draft',
     'verses': verses, 'decisions': decisions, 'choices': choices, 'audit': audit + audit_extra}
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok', len(decisions))
