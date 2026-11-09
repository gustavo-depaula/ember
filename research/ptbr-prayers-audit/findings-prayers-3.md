# pt-BR audit: prayers-3

The findings file was not written: the harness blocks subagents from creating report files. This answer holds the full findings instead.

## practice/pax-in-caelo (content/practices/pax-in-caelo/flow.json .sections[0].inline)
- **Severity 3, the most urgent in this chunk:** the whole pt-BR text is in Spanish.
  - Corpus: "Paz en el cielo, paz en la tierra. Paz a todo pueblo. Paz a los sacerdotes de las Iglesias de Dios. / Jesucristo Rey pacifico, su trono permanece firme para siempre..."
  - Correct: the Portuguese of the Opus Dei *Devocionário* that the manifest cites, e.g. "Paz no céu, paz na terra, paz a todo o povo, paz aos sacerdotes das Igrejas de Deus… Jesus Cristo, Rei pacífico… Ele é a nossa paz… Glória a Deus nas alturas e paz na terra aos homens de boa vontade."
  - Why: the Spanish edition was imported instead of the Portuguese one.
  - Confidence: high.

## practice/o-bona-crux (content/practices/o-bona-crux/flow.json .sections[0].text)
- **Severity 3:** "Atribuída a Santo Andrés Apóstolo" should be "Atribuída a Santo André Apóstolo".
  - Why: "Andrés" is the Spanish spelling.
  - Confidence: high.

## practice/psalm-50 (content/practices/psalm-50/flow.json .sections[0].verses)
- **Severity 1, verses [12] and [13]:**
  - Corpus v.12 ends "…e os pecadores voltarão a Vós. Livrai-me do meu sangue derramado."
  - Corpus v.13 reads "Ó Deus, meu Salvador; possa minha língua aclamar a vossa benignidade."
  - Problem 1: the verses are misaligned. The first half of v.13 has slipped into v.12.
  - Problem 2: "Livrai-me do meu sangue derramado" means "deliver me from my own spilled blood". That is wrong and comic; *de sanguinibus* means bloodguilt.
  - Received form (Ave-Maria Bible): "Livrai-me da pena do sangue, ó Deus, Deus de minha salvação, e minha língua exaltará vossa justiça." *Iustitiam* is "justiça", not "benignidade".
  - Confidence: high.
- **Severity 3, verse [4]:** "Porque reconheço ter sido dado à luz na iniquidade" should be "Eis que nasci na culpa, e minha mãe concebeu-me no pecado".
  - Why: "Porque reconheço" is a stray copy from v.2, and the Latin *Ecce* is lost.
  - Confidence: high.
- **Severity 3, verse [15]:** "mas o holocausto não Vos agradam" should be "não Vos agrada".
  - Why: the verb does not agree with its singular subject.
  - Confidence: high.
- **Severity 4, verse [9]:** "ó Deus um coração puro" needs a comma: "ó Deus, um coração puro".
  - Confidence: high.

## practice/prayer-st-michael (content/practices/prayer-st-michael/flow.json)
- **Severity 2, short prayer (options[0].sections[2]):**
  - Corpus: "Sede nosso amparo contra as perversidades e ciladas do demônio. Que Deus o repreenda, humildemente o pedimos; e vós, ó Príncipe da milícia celestial…"
  - Received: "São Miguel Arcanjo, defendei-nos no combate; sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos; e vós, príncipe da milícia celeste, pela virtude divina, precipitai no inferno a Satanás e aos outros espíritos malignos, que andam pelo mundo para perder as almas. Amém."
  - Why: the corpus is a calque of the English ("rebuke", "humbly pray").
  - Confidence: high.
- **Severity 3, Leo XIII exorcism (options[1].sections[2]):**
  - Corpus mixes tu and vós in one address: "A Santa Igreja te venera… a ti o Senhor confiou… Rogai… Apresentai… para que tu agarres o dragão… e o acorrentando, o precipites".
  - Correct, using vós throughout: "vos venera… a vós o Senhor confiou… para que vos apodereis do dragão… e, acorrentando-o, o precipiteis".
  - "o acorrentando" is also bad clitic placement.
  - Confidence: high.
- **Severity 3, closing prayer (options[1].sections[6]):** "digneis ajudar-nos" should be "Vos digneis ajudar-nos".
  - Why: "dignar-se" is pronominal, so the sentence is ungrammatical without "Vos".
  - Confidence: high.

## practice/prayer-st-joseph (content/practices/prayer-st-joseph/flow.json .sections[1].inline)
- **Severity 2:** the corpus back-translates the English instead of using the received Leo XIII text.
  - Corpus: "A vós, ó bem-aventurado José, recorremos na nossa aflição… confiantes imploramos também o vosso patrocínio… olheis com bondade para a herança… toda a corrupção do vício e do erro…"
  - Received: "A vós, São José, recorremos em nossa tribulação, e, depois de ter implorado o auxílio de vossa santíssima Esposa, cheios de confiança solicitamos também o vosso patrocínio. Por esse laço sagrado de caridade… que lanceis um olhar benigno sobre a herança que Jesus Cristo conquistou com o seu sangue… Protegei, ó guarda providente da divina Família, a raça eleita de Jesus Cristo. Afastai para longe de nós, ó pai amantíssimo, a peste do erro e do vício. Assisti-nos do alto do céu, ó nosso fortíssimo sustentáculo… possamos viver virtuosamente, piedosamente morrer e obter no céu a eterna bem-aventurança. Amém."
  - Confidence: high.

## practice/pange-lingua (content/practices/pange-lingua/manifest.json .flow.sections[0].inline)
- **Severity 1:** "e no mundo conversando" should be "e no mundo tendo habitado" or "convivendo com os homens".
  - Why: Latin *conversatus* means "dwelling". In pt-BR "conversando" means "chatting", a comic false friend.
  - Confidence: high.
- **Severity 2, Tantum ergo stanzas:** the corpus opens with the received first line, then turns into prose. The result is a hybrid nobody prays.
  - Corpus: "Tão sublime Sacramento, / prostrados, veneremos: / e o antigo documento / ceda lugar ao novo rito; / supra a fé o défice / dos nossos sentidos."
  - Received (sung throughout Brazil): "Tão sublime Sacramento / adoremos neste altar, / pois o Antigo Testamento / deu ao Novo seu lugar. / Venha a fé, por suplemento, / os sentidos completar. // Ao eterno Pai cantemos / e a Jesus, o Salvador, / ao Espírito exaltemos, / na Trindade eterno amor. / Ao Deus uno e trino demos / a alegria do louvor. Amém."
  - Confidence: high.
- **Severity 3:** "défice" is European Portuguese. Use "déficit", or better the received text above.
  - Confidence: high.
- **Severity 4:** "Canta, ó língua, do glorioso / Corpo o mistério" and "que, em preço do mundo, / fruto de ventre generoso" follow the Latin word order and read as translated, not prayed.
  - Confidence: high.

## practice/opening-verse (content/practices/opening-verse/manifest.json .flow.sections[0].inline)
- **Severity 2:** "Ó Deus, vinde em meu auxílio. / Senhor, socorrei-me e apressai-vos." should be the Brazilian Liturgia das Horas form: "Vinde, ó Deus, em meu auxílio. — Socorrei-me sem demora."
  - Confidence: high.
- **Severity 2 (low):** "Assim como era no princípio, agora e sempre, e pelos séculos dos séculos. Amém."
  - The Liturgia das Horas has "Como era no princípio, agora e sempre. Amém."
  - psalm-2 in this same chunk uses "Assim como era no princípio, agora e sempre. Amém.", so the corpus is inconsistent with itself.
  - Confidence: medium.

## practice/prayer-pope-bishop (content/practices/prayer-pope-bishop/flow.json)
- **Severity 3 (.sections[0].text):** "com a respetiva resposta" should be "respectiva".
  - Why: "respetiva" is the European spelling.
  - Confidence: high.
- **Severity 3 (.sections[2].verses[0].r):** "Que Deus o conserve e lhe dê vida e o faça santo na terra" should be "O Senhor o conserve, lhe dê vida, o faça feliz na terra e não o entregue nas mãos de seus inimigos".
  - Why: *beatum faciat* means "make him happy/blessed", not "holy". The corpus copies a mistranslation in the English.
  - Confidence: medium-high.
- **Severity 4 (.sections[9].verses[0].r):** "que ele apascente, vigilante, o seu rebanho" should be along the lines of "Que ele se mantenha firme e apascente o rebanho com a vossa fortaleza, Senhor, na grandeza do vosso nome".
  - Why: "vigilante" is invented, and *stet* is dropped.
  - Confidence: medium.

## practice/prayer-of-st-ambrose (content/practices/prayer-of-st-ambrose/flow.json .sections[0].inline)
- **Severity 3:** "Livrai-me, ó Pai Clementíssimo, todas as minhas iniquidades e pecados" should be "Livrai-me de todas as minhas iniquidades e pecados" or "Tirai de mim…".
  - Why: ungrammatical; the preposition is missing.
  - Confidence: high.
- **Severity 3:** "a mesa do vosso doce convite" should be "do vosso dulcíssimo banquete".
  - Why: in Brazil "convite" means "invitation"; the sense "banquet" is archaic or European.
  - Confidence: medium.
- **Severity 4:** "a minha língua.." has a double period, and "eu, pecador não presumindo" needs a comma after "pecador".
  - Confidence: high.

## practice/psalm-2 (content/practices/psalm-2/flow.json)
- **Severity 3 (.sections[7].inline):** "Ó Deus, onipotente e eterno Deus, que tudo quisestes instaurar" repeats "Deus".
  - Better, following the Missal's Christ the King collect: "Deus eterno e todo-poderoso, que quisestes restaurar todas as coisas em vosso amado Filho, Rei do universo…"
  - Confidence: high.
- **Severity 3 (verses[3]):** "Aquele que habita nos céus Ri-se, o Senhor zomba deles."
  - The capital in "Ri-se" is a stray. The enclisis also sounds European; Brazilian usage prefers "se ri".
  - Confidence: high.
- **Severity 3 (verses[6]):** "O Senhor disse-me" should be "O Senhor me disse".
  - Why: enclisis after a subject noun is European usage.
  - Confidence: medium.

## practice/prayer-card-arturo-alvarez (flow.json .sections[2].inline)
- **Severity 3:** "Deus Todo-Poderoso, que concedeste ao vosso servo" should be "concedestes".
  - Why: a tu verb form inside a vós address.
  - Confidence: high.

## practice/prayer-card-juan-ignacio-larrea (flow.json .sections[2].inline)
- **Severity 3:** "Senhor, que concedeste ao vosso servo Juan" should be "concedestes".
  - Why: tu and vós are mixed.
  - Confidence: high.

## practice/prayer-card-ernesto-cofino (flow.json .sections[2].inline)
- **Severity 3:** "que cumulaste de graças ao vosso filho Ernesto" should be "que cumulastes de graças o vosso filho Ernesto".
  - Why: tu and vós are mixed, and "cumular" takes a direct object.
  - Confidence: high.

## practice/prayer-card-encarnita-ortega (flow.json .sections[0].inline)
- **Severity 3:** "Dignai-vos glorificar a vossa filha Encarnita e alcançai-me por sua intercessão" should be "concedei-me por sua intercessão".
  - Why: "alcançai-me" ("obtain for me") is said to an intercessor, not to God. Every other card uses "concedei-me".
  - Confidence: medium-high.

## practice/prayer-card-guadalupe-ortiz-de-landazuri (flow.json .sections[0].inline)
- **Severity 3:** "contagiar a minha fé e alegria a todas as pessoas" should be "contagiar com a minha fé e alegria todas as pessoas" or "transmitir a minha fé e alegria a todas as pessoas".
  - Why: "contagiar algo a alguém" is a Spanish construction.
  - Confidence: medium.

## practice/prayer-card-marcelo-camara (flow.json .sections[2].inline)
- **Severity 3:** "todos aqueles com que convivo e trabalho" should be "com quem convivo e trabalho".
  - Why: "com que" is wrong for people.
  - Confidence: high.
- **Severity 4:** the punctuation garbles the meaning.
  - Corpus: "abraçando com amor a Santa Cruz especialmente, através da enfermidade, vivida com alegria e paz cristã infundindo sentido redentor…"
  - Better: "abraçando com amor a Santa Cruz, especialmente na enfermidade vivida com alegria e paz cristã; infundindo sentido redentor…"
  - Confidence: high.
- Outside pt-BR: the en-US title of this card is in Spanish ("Oración para la devoción privada").

## practice/prayer-card-toni-zweifel (flow.json .sections[2].inline)
- **Severity 4:** the petition ends "…(*peça-se*)." with no "Amém.", unlike every other card.
  - Confidence: high.

## practice/prayer-mary-help-of-christians (manifest.json .flow.sections[0].inline)
- **Severity 3:** "Tu, que só destruíste toda heresia em todo o mundo" should be "tu, que sozinha destruíste todas as heresias no mundo inteiro".
  - Why: "só destruíste" reads as "you only destroyed"; the meaning is "you alone".
  - Confidence: high.
- **Severity 4:** a capital "Tu" appears mid-sentence after a semicolon.
  - Confidence: medium.

## practice/prayer-holy-spirit-mercier (manifest.json .flow.sections[0].inline)
- **Severity 3:** the verb moods are wrong; the future subjunctive is needed.
  - Corpus: "submeter-me a quanto desejais de mim e aceitar tudo quanto permitais que me aconteça"
  - Received: "Prometo submeter-me a tudo o que desejardes de mim e aceitar tudo o que permitirdes que me aconteça".
  - Confidence: medium-high.

## practice/offering-to-sacred-heart (manifest.json .flow.sections[0].inline)
- **Severity 2:** the corpus translates the US Apostleship of Prayer offering. The Brazilian Apostolado da Oração prays its own form:
  - "Divino Coração de Jesus, eu vos ofereço, por meio do Coração Imaculado de Maria, as orações, obras e sofrimentos deste dia, em reparação das ofensas por nós cometidas e por todas as intenções pelas quais continuamente vos imolais sobre o altar. Eu vo-los ofereço de modo especial…"
  - Confidence: medium.
- **Severity 3:** two calques.
  - "a reunião de todos os cristãos" should be "a união de todos os cristãos".
  - "Apóstolos da Oração" should be "membros do Apostolado da Oração".
  - Confidence: high.

## practice/nicene-creed (manifest.json .flow.sections[0].inline)
- **Severity 2 (low):** "e encarnou pelo Espírito Santo" should be "e se encarnou pelo Espírito Santo" (Missal text). The rest matches the received text.
  - Confidence: medium.

## practice/panis-angelicus (manifest.json .flow.sections[0].inline)
- **Severity 3:** "Come do Senhor / o pobre, o servo e o humilde" should be "O pobre, o servo e o humilde / recebem (comem) o Senhor".
  - Why: "comer do Senhor" means "eat some of the Lord", which is theologically off.
  - Confidence: medium.
- **Severity 4:** "conduzi-nos aonde tendemos" is a stiff calque of *quo tendimus*; "aonde nos dirigimos" reads better.
  - Confidence: medium.

## practice/o-salutaris-hostia (manifest.json .flow.sections[0].inline)
- **Severity 4:** "que nos conceda a vida sem fim, / na pátria, juntamente" should be "que nos conceda, na pátria, a vida sem fim".
  - Why: "juntamente" is a filler with no source in the Latin.
  - Confidence: high.

## practice/morning-offering (flow.json .sections[2], [3], [12])
- **Severity 3:** the rubric "ajoelha-te e reza" should be "ajoelhe-se e reze".
  - Why: a tu imperative in a rubric sounds European; Brazilian rubrics use the third person.
  - Confidence: medium.
- **Severity 4:** "Ó! meu Deus" appears four times; it should be "Ó meu Deus".
  - Why: the exclamation mark after "Ó" is spurious.
  - Confidence: high.
- **Severity 4:** "sois sempre fiel nas vossas promessas" should be "fiel às vossas promessas".
  - Confidence: medium.

## practice/prayer-to-our-lady-after-mass (flow.json .sections[0].inline)
- **Severity 3:** "Aquele que vos alegrava contemplar" is ungrammatical. Use "Aquele cuja vista vos alegrava" or "que vos alegráveis em contemplar".
  - Confidence: medium.
- **Severity 4:** "Vos" and "vos" are mixed within one prayer ("Eis que Vos apresento… que vos alegrava… que Vos enchia").
  - The same mix appears in prayer-to-our-lady-before-mass ("a Vós recorro… vosso amabilíssimo") and in o-sacrum-convivium ("Vos pedimos… vossa Paixão").
  - Confidence: high.

## practice/prayer-to-st-joseph-before-mass (flow.json .sections[3].inline)
- **Severity 4:** the collect drops its conclusion "Por Cristo, nosso Senhor.", and "com carinho" is invented (the Latin has *reverenter*).
  - Confidence: medium.

## practice/prayer-of-st-margaret-mary (manifest.json .flow.sections[0].inline)
- **Severity 4:** "Que eu obtenha de toda a Vossa amorosa bondade a graça…" is a literal rendering of the English. "Alcance eu da vossa infinita bondade a graça…" reads better.
  - Confidence: medium.

## Overall judgement
This chunk is uneven. The prayers taken from real Brazilian sources are in good shape: the Pai-Nosso, the Prayer of St Francis, Nada te perturbe, and most of the Opus Dei *Devocionário* texts (St Joseph before and after Mass, Bonaventure, Álvaro).

The worst problems are three:
- **Foreign text:** pax-in-caelo is entirely in Spanish, and o-bona-crux has "Santo Andrés".
- **psalm-50:** its verses are misaligned, and it has the comic "Livrai-me do meu sangue derramado".
- **Pange lingua:** "no mundo conversando" is a false friend, and the Tantum ergo is a prose hybrid instead of the universally sung "Tão sublime Sacramento / adoremos neste altar…".

The next largest group repeats the Anima Christi problem: the text was translated from English instead of taken from the form Brazilians pray, and it hits frequently prayed texts:
- São Miguel Arcanjo ("Que Deus o repreenda" instead of "Ordene-lhe Deus")
- Leo XIII's "A vós, São José"
- the opening verse ("Vinde, ó Deus, em meu auxílio")
- the Apostolado da Oração offering

A smaller but widespread group is grammar and register slips:
- tu verbs inside vós addresses on three Opus Dei prayer cards
- tu and vós mixed in the Leo XIII exorcism
- "digneis" without "Vos"
- European forms ("respetiva", "défice", "disse-me")
- agreement errors

Fix pax-in-caelo, psalm-50, St Michael, St Joseph and Pange lingua first.