# pt-BR prayer audit, chunk 4 (quem-terra-pontus-sidera to way-of-the-cross-opus-dei)

I could not create /tmp/ptaudit/findings-prayers-4.md: the harness blocks subagents from writing report files. The full findings are below instead.

## veni-creator-spiritus (content/practices/veni-creator-spiritus/manifest.json)
- **Severity 1**
  - Corpus: "os peitos que criastes"
  - Correct form: "os corações que criastes", or the received Liturgia das Horas hymn: "Ó vinde, Espírito Criador, / as nossas almas visitai / e enchei os nossos corações / com vossos dons celestiais".
  - Why: it is a calque of *pectora*, and to a Brazilian "peitos" reads as "breasts", which is comic in a hymn.
  - Confidence: high.
- **Severity 2**
  - Corpus: the whole hymn is a word-for-word prose rendering ("Vinde, Espírito Criador, / as almas visitai").
  - Correct form: the received Brazilian Liturgia das Horas text ("Ó vinde, Espírito Criador, as nossas almas visitai…").
  - Confidence: high.
- **Severity 4**
  - Corpus: "Vós, sete vezes Dador"
  - Correct form: "Vós, que sois o Dom septiforme", or the Liturgia das Horas line "Sois doador dos sete dons".
  - Why: a literal rendering of *septiformis munere* that reads oddly.
  - Confidence: medium.

## regina-caeli (content/practices/regina-caeli/manifest.json)
- **Severity 2**
  - Corpus: "Rainha do Céu, alegra-te, aleluia: / pois aquele que mereceste trazer no teu seio, aleluia, / ressuscitou como disse, aleluia. / Roga por nós a Deus, aleluia."
  - Received form: "Rainha do céu, alegrai-vos, aleluia, / porque aquele que merecestes trazer em vosso seio, aleluia, / ressuscitou como disse, aleluia. / Rogai por nós a Deus, aleluia."
  - Why: Brazilians pray this in the Vós form; the tu form follows the English.
  - Confidence: high.
- **Severity 2**
  - Corpus: "Alegra-te e exulta, Virgem Maria, aleluia."
  - Received versicle: "Exultai e alegrai-vos, ó Virgem Maria, aleluia."
  - Confidence: high.
- **Severity 4 (note only)**
  - Corpus collect: "destes alegria ao mundo inteiro, concedei-nos… alcançar a alegria da vida eterna". This is an acceptable variant.
  - Received form: "Ó Deus, que vos dignastes alegrar o mundo com a ressurreição do vosso Filho… concedei-nos, vos suplicamos, que por sua Mãe, a Virgem Maria, alcancemos as alegrias da vida eterna."
  - Confidence: medium.

## te-deum (content/practices/te-deum/manifest.json)
- **Severity 2/3**
  - Corpus: "Pai Eterno e omnipotente"
  - Correct form: "onipotente". "Omnipotente" is the European spelling.
  - Why: the whole text ("Nós vos louvamos, ó Deus, nós vos bendizemos, Senhor… a falange venerável dos Profetas… Haveis de vir como Juiz, segundo a nossa fé") is the Portuguese (Portugal) Liturgia das Horas version, not the Brazilian one.
  - The Brazilian Liturgia das Horas reads: "A vós, ó Deus, louvamos, / a vós, Senhor, cantamos. / A vós, Eterno Pai, / adora toda a terra. / A vós cantam os anjos, / os céus e seus poderes: / Sois Santo, Santo, Santo, / Senhor, Deus do universo!…"
  - Confidence: high on the spelling, medium-high that the source is Portugal's.

## tantum-ergo (content/practices/tantum-ergo/manifest.json)
- **Severity 2**
  - Corpus: "Supra a fé novo alento / Às limitações do olhar."
  - Received form: "Venha a fé, por suplemento, / os sentidos completar."
  - Why: the rest of the hymn ("Tão sublime Sacramento / adoremos neste altar…") is the received Brazilian text; these two lines are not.
  - Confidence: medium-high.

## three-oclock-prayer (content/practices/three-oclock-prayer/flow.json)
- **Severity 2**
  - Corpus: "Tu expiraste, Jesus… envolve o mundo inteiro e derrama-te sobre nós."
  - Received form (Brazilian edition of the Diário): "Expirastes, Jesus, mas a fonte de vida jorrou para as almas… Ó Fonte de Vida, insondável Misericórdia Divina, envolvei o mundo inteiro e derramai-Vos sobre nós."
  - Why: it uses tu where Brazilians say Vós.
  - Confidence: high.
- **Severity 3**
  - Corpus: "Ó Sangue e Água, que jorraste do Coração de Jesus… eu confio em Vós"
  - Correct form: "que jorrastes". The received line is "Ó Sangue e Água que jorrastes do Coração de Jesus como fonte de misericórdia para nós, eu confio em Vós."
  - Why: the verb is in the tu form while the address is Vós, so the agreement breaks.
  - Confidence: high.
- **Severity 2**
  - Corpus: "Deus Santo, Deus Santo e Forte, Deus Santo e Imortal, tende misericórdia de nós e do mundo inteiro."
  - Common Brazilian chaplet form: "Deus Santo, Deus Forte, Deus Imortal, tende piedade de nós e do mundo inteiro."
  - Confidence: medium.
- **Severity 3**
  - Corpus: "e, se ao menos por um breve momento, mergulha em Minha Paixão"
  - Correct form: "e, ainda que por um breve momento, mergulha (or medita) na Minha Paixão".
  - Why: "se ao menos" is an ungrammatical calque of "if only".
  - Confidence: high.

## salve-mater-misericordiae (content/practices/salve-mater-misericordiae/flow.json)
- **Severity 3**
  - Corpus: "que superastes todas as virgens e no céu ocupas o maior assento"
  - Correct form: "superastes… ocupais".
  - Why: Vós and tu are mixed in one clause.
  - Confidence: high.
- **Severity 3**
  - Corpus: "Seja, ó Mãe, nosso consolo, seja vós, Ó Virgem, nossa alegria; … alegres, nos una ao coro dos céus"
  - Correct form: "Sede, ó Mãe, nosso consolo; sede vós, ó Virgem, nossa alegria; … uni-nos, alegres, ao coro celeste".
  - Why: "seja vós" is ungrammatical, and the imperatives are in the 3rd person.
  - Confidence: high.
- **Severity 3**
  - Corpus: "pois o que senta à destra do Pai"
  - Correct form: "aquele que se senta à direita do Pai".
  - Why: "sentar" needs the reflexive here.
  - Confidence: high.
- **Severity 4**
  - Corpus: "Mãe plena da Santa Alegria" and "depois desse exílio".
  - Correct forms: "Mãe cheia de santa alegria" and "deste exílio".
  - Confidence: medium.

## sub-tuum-praesidium (content/practices/sub-tuum-praesidium/manifest.json)
- **Severity 3**
  - Corpus: "A vossa proteção recorremos"
  - Correct form: "**À** vossa proteção recorremos".
  - Why: the crase is missing ("recorrer a"). The rest of the received text is exact.
  - Confidence: high.

## spiritual-communion (content/practices/spiritual-communion/flow.json)
- **Severity 3**
  - Corpus: "Agradeço-Vos por haverdes Vos dado a nós"
  - Correct form: "por Vos terdes dado a nós" (or "por Vos haverdes dado").
  - Why: the clitic is misplaced and doubled.
  - Confidence: high.

## spiritual-communion-opus-dei (content/practices/spiritual-communion-opus-dei/manifest.json, source note)
- **Severity 3**
  - Corpus: "secção da adoração eucarística"
  - Correct form: "seção".
  - Why: European spelling. This is in the source note, not the prayer.
  - Confidence: high.

## responsory-subvenite (content/practices/responsory-subvenite/flow.json)
- **Severity 3**
  - Corpus (sections[4].verses[0].v): "Livrai, Senhor, a sua alma"
  - Correct form: the ℣ should be "Das portas do inferno", with "Livrai, Senhor, a sua alma" as the ℟.
  - Why: the Latin ℣ is "A porta ínferi". The response stands in the versicle's place and the versicle is missing.
  - Confidence: high.
- **Severity 3**
  - Corpus: "E brilhe(m) para ele(s) a vossa luz."
  - Correct form: "E brilhe para ele(s) a vossa luz".
  - Why: the subject "a vossa luz" is singular, so the "(m)" is wrong.
  - Confidence: high.
- **Severity 3**
  - Corpus: "Concedei-\n-lhe(s) a luz e a paz"
  - Correct form: "Concedei-lhe(s)".
  - Why: a line break and doubled hyphen were carried over from the PDF.
  - Confidence: high.

## responsory-for-the-dead (content/practices/responsory-for-the-dead/flow.json)
- **Severity 4 (note only)**
  - Corpus: "O Senhor esteja convosco. ℟. Ele está no meio de nós"
  - Literal form: "E com o teu espírito".
  - Why: this is the Brazilian Mass response. Where the Latin has "Et cum spiritu tuo" it is acceptable but not literal.
  - Confidence: medium.
- The rest follows the received Brazilian forms (for example "Dai-lhe(s), Senhor, o eterno descanso, entre os resplendores da luz perpétua").

## way-of-the-cross-opus-dei (content/practices/way-of-the-cross-opus-dei/flow.json)
- **Severity 2**
  - Corpus: "Jesus, José e Maria. ℟. Dou-vos o coração e a alma minha…"
  - Received Brazilian form: "Jesus, **Maria e José**, eu vos dou o coração e a alma minha / … assisti-me na última agonia / … expire em paz convosco a alma minha."
  - Why: "José e Maria" is the Spanish order.
  - Confidence: medium-high.
- **Severity 3**
  - Corpus: "estabelecestes que todos os homens tem que morrer"
  - Correct form: "**têm**".
  - Why: the plural accent is missing.
  - Confidence: high.
- **Severity 3**
  - Corpus, three missing crases:
    - "para obedecer a Vossa amável Vontade" should be "à".
    - "os laços que atam o meu coração as criaturas" should be "às criaturas".
    - "comparecer a Vossa presença" should be "à".
  - Confidence: high.
- **Severity 3**
  - Corpus: "pronunciando esses nomes por toda a eternidade"
  - Correct form: "pronunciando esses dulcíssimos nomes, que espero bendizer por toda a eternidade".
  - Why: "que espero exaltar" is left out, so the line says the dying man pronounces the names for all eternity.
  - Confidence: high.
- **Severity 3**
  - Corpus: the station structure has ℣ "Senhor, pequei." ℟ "Tende piedade e misericórdia de mim."
  - Why: the Pai-Nosso and Ave-Maria lines are missing, while en-US has them.
  - Confidence: medium.
- **Severity 4**
  - Corpus: "podem rezar-se estas orações"
  - Correct form: "podem-se rezar estas orações" (or "pode-se rezar").
  - Why: European clitic placement.
  - Confidence: medium.

## victimae-paschali (content/practices/victimae-paschali/flow.json)
- **Severity 3**
  - Corpus: "Diz-nos, ó Maria"
  - Correct form: "**Dize**-nos, ó Maria".
  - Why: in this formal register the tu imperative of "dizer" is "dize".
  - Confidence: high.
- **Severity 3**
  - Corpus: "tende piedade de nós. Amen. Aleluia."
  - Correct form: "Amém".
  - Why: the Latin spelling was left in the pt-BR text.
  - Confidence: high.
- **Severity 2 (note)**
  - Corpus: a prose version of the sequence.
  - What Brazilians hear at Easter is the Lecionário sequence: "Cantai, cristãos, afinal: 'Salve, ó vítima pascal!'…"
  - Confidence: medium.
- **Severity 4**
  - Corpus: "que precederá na Galileia os discípulos"
  - Correct form: "irá à vossa frente na Galileia".
  - Why: the Latin *praecedet vos* means "goes before you"; the person shifts.
  - Confidence: medium.

## veni-sancte-spiritus (content/practices/veni-sancte-spiritus/flow.json)
- **Severity 2**
  - Corpus: "Vinde Santo Espírito e do céu mandai luminoso raio…"
  - Received form (the Brazilian Lecionário sequence for Pentecost): "Espírito de Deus, enviai dos céus um raio de luz! / Vinde, Pai dos pobres, dai aos corações vossos sete dons. / Consolo que acalma, hóspede da alma, doce alívio, vinde!…"
  - Confidence: medium, since the corpus text is a metrical version taken from the Opus Dei source.
- **Severity 4**
  - Corpus: "Vinde pai dos pobres doador dos dons luz dos corações"; "que oram com vibrantes sons".
  - Why: there is almost no punctuation, so it is hard to read, and "que oram com vibrantes sons" is a padded line.
  - Confidence: high.

## sacris-solemniis (content/practices/sacris-solemniis/manifest.json)
- **Severity 3**
  - Corpus: "Come do Senhor o pobre, o servo e o humilde."
  - Correct form: "O pobre, o servo e o humilde comem o Senhor" (*manducat Dominum*).
  - Why: "come do Senhor" reads as a partitive, "eats some of the Lord".
  - Confidence: medium-high.
- **Severity 4**
  - Corpus: "em que se crê que Cristo o cordeiro e os ázimos / deu aos irmãos" and "inteiro a todos como inteiro a cada um, / confessamos, por Suas mãos".
  - Why: these keep the Latin word order and barely parse. The rest of the hymn is the same kind of word-for-word prose.
  - Confidence: high.

## verbum-supernum (content/practices/verbum-supernum/manifest.json)
- **Severity 3**
  - Corpus: "que nos conceda a vida sem fim, / na pátria, juntamente. Amém."
  - Correct form: "que nos conceda a vida sem fim na pátria celeste".
  - Why: "juntamente" has no basis in the Latin and leaves the line dangling.
  - Confidence: high.
- **Severity 4**
  - Corpus: "O Verbo supremo, procedendo, / … saindo para a Sua obra"
  - Why: gerunds copied from the Latin participles read awkwardly. The "Ó Hóstia salutar" stanza is fine.
  - Confidence: medium.

## universal-prayer (content/practices/universal-prayer/flow.json)
- **Severity 3**
  - Corpus: "Que me afaste das faltas passadas"
  - Correct form: "Que chore as faltas passadas".
  - Why: the Latin *defleam* means "may I weep for"; the meaning drifts.
  - Confidence: medium.
- **Severity 4**
  - Corpus: "atai-me com a vossa justiça"
  - Correct form: "contende-me" or "refreai-me" (Latin *contine*).
  - Why: "atai-me" ("tie me up") is odd.
  - Confidence: medium.
- **Severity 4**
  - Corpus: "Fazei-me preparar a morte"
  - Correct form: "Fazei que me prepare para a morte".
  - Confidence: medium.

## te-ioseph (content/practices/te-ioseph/flow.json)
- **Severity 3**
  - Corpus: "veio um anjo do céu / a revelar-vos o segredo de Deus"; "ao Egito a fugir o acompanhastes"; "a bendizer-Vos em cânticos de júbilo".
  - Correct forms: "veio um anjo do céu revelar-vos…"; "na fuga ao Egito o acompanhastes"; "para bendizer-Vos".
  - Why: "a + infinitive" is a European construction.
  - Confidence: medium.

## rorate-caeli (content/practices/rorate-caeli/flow.json)
- **Severity 4**
  - Corpus: "Não vos ireis, Senhor"
  - Correct form: "Não vos irriteis, Senhor".
  - Why: the form is correct (*irar-se*), but it is spelled like the future of "ir" ("you will not go"), so it reads wrong.
  - Confidence: medium.
- **Severity 4**
  - Corpus: "se a dor te renovou"
  - Correct form: "porque a dor se renovou em ti" (*quia innovavit te dolor*).
  - Confidence: medium.

## veni-veni-emmanuel (content/practices/veni-veni-emmanuel/flow.json)
- **Severity 3**
  - Corpus: "Emmanuel" throughout.
  - Correct form: "Emanuel", the Brazilian spelling.
  - Confidence: medium-high.

## st-patrick-breastplate (content/practices/st-patrick-breastplate/manifest.json)
- **Severity 3**
  - Corpus: "Cristo no coração de todos a quem eu falar"
  - Correct form: "de todos os que pensam em mim" (the English says "every man who thinks of me").
  - Why: the meaning changes, though this comes from the cited Revista Ave Maria translation.
  - Also: the last stanza ("pelo Criador da criação") differs from the first ("unidade do Criador da criação").
  - Confidence: medium.

## suscipe (content/practices/suscipe/manifest.json)
- **Severity 4 (note only)**
  - Corpus: "Vós me destes tudo isto; a Vós, Senhor, o devolvo". This is an acceptable variant.
  - Common Brazilian form: "Vós mo destes; a Vós, Senhor, o restituo… Dai-me somente o vosso amor e a vossa graça, e isso me basta."
  - Confidence: medium.

## No issues found
- **Source notes only:** quem-terra-pontus-sidera, quicumque-christum-quaeritis, rector-potens-verax-deus, rerum-deus-tenax-vigor, salutis-humanae-sator, salvete-flores-martyrum, sanctorum-meritis, seven-penitential-psalms, splendor-paternae-gloriae, te-decet-laus, te-splendor-et-virtus-patris, ut-queant-laxis.
- **Prayer text checked:**
  - radiating-christ
  - sign-of-cross
  - st-benedict-medal-prayer, which matches the received "Retira-te, Satanás! Nunca me aconselhes coisas vãs…"
  - st-gertrude-souls
  - st-michael, which is the received form
  - stabat-mater, which is the Brazilian Liturgia das Horas metrical version "De pé a Mãe dolorosa"; only a stray ".." after "consolar"
  - thirty-days-prayer, a sound new translation
  - three-hail-marys
  - three-hail-marys-opus-dei, whose "Bendita seja a vossa pureza" is the received text
  - ubi-caritas
  - vexilla-regis, consistent tu, prose; only a minor pleonasm in "aos que salvas… guarda-os"
  - spiritual-communion-opus-dei (the prayer itself)

## Overall judgement
This chunk has nothing as bad as the Anima Christi, but one comparable lapse: "os peitos que criastes" in the Veni Creator, a calque of *pectora* that reads as "breasts".

The most common problem is register. The Regina Caeli, the three o'clock prayer (Divine Mercy) and parts of the Salve Mater were translated from the English in the tu form, while Brazilians pray these to Our Lady and to Christ in Vós. This also causes agreement errors such as "jorraste… confio em Vós" and "superastes… ocupas".

A second pattern is texts that come from Portugal or Spain rather than Brazil:
- The Te Deum is Portugal's Liturgia das Horas version ("omnipotente").
- Te Ioseph uses "a + infinitive".
- The Opus Dei Via Sacra says "Jesus, José e Maria", and is also missing several crases and the accent on "têm".

Third, the Latin hymns rendered as word-for-word prose (Veni Creator, Sacris solemniis, Verbum supernum, Victimae paschali) set aside the received Brazilian versions and contain real errors: "Come do Senhor", "na pátria, juntamente", "Diz-nos" and "Amen".

The worst are the Veni Creator, the Regina Caeli, the three o'clock prayer and the Te Deum. These should be replaced wholesale with the received Brazilian texts: the Liturgia das Horas and CNBB texts, the Brazilian edition of the Diário de Santa Faustina, and the Lecionário sequences.

The short staples are sound or need only a one-character fix: Sign of the Cross, São Miguel, Sub tuum (crase), Stabat Mater, Bendita seja a vossa pureza, and the Medalha de São Bento.