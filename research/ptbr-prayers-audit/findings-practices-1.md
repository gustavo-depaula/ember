# pt-BR audit: practices-1

The task asked me to write this to `/tmp/ptaudit/findings-practices-1.md`, but the harness blocked writing a report file from a subagent. That file does not exist; the full findings are below. I read all 3,595 lines (448 blocks).

## practice/guardian-angels-novena: `content/practices/guardian-angels-novena/flow.json` `.sections[14].inline`
- **Severity 1, high confidence.** Corpus: "Santo Anjo do Senhor, meu zeloso guardador, se a mim confiou a piedade divina, sempre me rege, me guarda, me governa e me ilumina."
  - Received form: "Santo Anjo do Senhor, meu zeloso guardador, se a ti me confiou a piedade divina, sempre me rege, me guarda, me governa, me ilumina. Amém."
  - Why: "se a mim confiou" reverses the meaning: God's goodness has given the angel to me, instead of giving me to the angel. This is the best-known children's prayer in Brazil.

## practice/angelus: `content/practices/angelus/flow.json`
- **Severity 2, high confidence (Regina Caeli).** `.sections[0].options[1].sections[3].inline` and `.sections[5].verses[0].v`. Corpus: "Rainha do Céu, alegra-te, aleluia: / Pois aquele que mereceste trazer no teu seio… / Roga por nós a Deus, aleluia." and "Alegra-te e exulta, Virgem Maria, aleluia."
  - Received form: "Rainha do céu, alegrai-vos, aleluia, / porque quem merecestes trazer em vosso seio, aleluia, / ressuscitou como disse, aleluia. / Rogai a Deus por nós, aleluia. — Exultai e alegrai-vos, ó Virgem Maria, aleluia."
  - Why: Brazilians pray the Regina Caeli with *vós*. The *tu* here is copied from the Latin, and it clashes with the Angelus beside it, which uses "Vós".
- **Severity 2, medium confidence (Regina Caeli prayer).** `.sections[0].options[1].sections[8].inline`. Corpus: "Ó Deus, que pela ressurreição de Vosso Filho… destes alegria ao mundo inteiro, concedei-nos… alcançar a alegria da vida eterna."
  - Received form: "Ó Deus, que vos dignastes alegrar o mundo com a ressurreição do vosso Filho Jesus Cristo, Senhor nosso, concedei-nos, vos suplicamos, que por sua Mãe, a Virgem Maria, alcancemos as alegrias da vida eterna."
  - Why: the corpus is a paraphrase, not the received text.
- **Severity 2, medium-high confidence (Angelus prayer).** `.sections[0].options[0].sections[16].inline`. Corpus: "Infundi, Senhor, nós vos pedimos, em nossas almas a vossa graça, para que nós, que conhecemos pela anunciação do Anjo… cheguemos por sua paixão e sua cruz à glória da ressurreição."
  - Received form: "Infundi, Senhor, como vos pedimos, a vossa graça em nossas almas, para que nós, que pela anunciação do Anjo viemos ao conhecimento da encarnação de Jesus Cristo, vosso Filho, por sua paixão e morte de cruz sejamos conduzidos à glória da ressurreição."
  - Why: the overall shape is right, but it is not the wording Brazilians say from memory.
- The Angelus versicles match the received text.

## practice/annunciation-novena: `content/practices/annunciation-novena/flow.json` `.sections[14].inline`
- **Severity 3, medium confidence.** Corpus: "Infundi, Senhor, nós vos pedimos, a vossa graça em meu coração… eu seja conduzido"
  - Correct form: "vos peço…", or keep the received plural throughout.
  - Why: it starts with "we ask" and then speaks as one person.

## practice/holy-hour-sacred-heart: `content/practices/holy-hour-sacred-heart/flow.json` `.sections[7].inline`
- **Severity 2, high confidence.** Corpus: "Ó Sacramento Santíssimo, ó Sacramento divino, todo louvor e toda ação de graças sejam a cada momento Vossos."
  - Received form: "Graças e louvores se deem a todo momento ao Santíssimo e diviníssimo Sacramento."
  - Why: this is a word-for-word copy of the English. The received form is the one every Brazilian Holy Hour uses.

## practice/chaplet-of-divine-mercy and practice/divine-mercy-novena
Files: `content/practices/chaplet-of-divine-mercy/flow.json` `.sections[11].inline` and `content/practices/divine-mercy-novena/flow.json` `.sections[14].inline`.
- **Severity 2, medium confidence.** Corpus: "olhai bondosamente para nós e aumentai em nós a Vossa misericórdia, para que em momentos difíceis não nos desesperemos"
  - Received form (Diary 950, Brazilian edition): "olhai propício para nós e multiplicai em nós a Vossa misericórdia, para que nos momentos difíceis não desesperemos nem desanimemos"
  - Why: the corpus is a new translation from the English.

## practice/confession: `content/practices/confession/flow.json` `.sections[0].options[1].sections[3].inline`
- **Severity 3, high confidence.** Corpus: "Mãe Maria, mantenha-me perto de Seu Filho."
  - Correct form: "Virgem Maria, minha Mãe, conservai-me junto de vosso Filho."
  - Why: it switches to *você* (mantenha, Seu) in the middle of a prayer that uses *Vós*, and "Mãe Maria" comes from English.
- **Severity 4, medium confidence.** Corpus: "Obrigado pelo sacerdote que ocupou o Vosso lugar" and "usar bem este novo começo".
  - Correct form: "Eu Vos agradeço pelo sacerdote que fez as Vossas vezes" and "aproveitar bem este recomeço".
  - Why: "Obrigado" next to "agradeço-Vos" mixes registers, and the second phrase reads as translated.

## practice/evening-rule-byzantine: `content/practices/evening-rule-byzantine/flow.json`
- **Severity 3, high confidence.** `.sections[34].inline`. Corpus: "a Vós que, sem corrupção, destes nascimento ao Verbo de Deus — a Vós, verdadeira Mãe de Deus, nós Vos magnificamos."
  - Correct form: "vós que, sem corrupção, destes à luz Deus Verbo, verdadeira Mãe de Deus, nós vos engrandecemos."
  - Why: "destes nascimento" copies "gave birth" (Portuguese says "dar à luz"), and the repeated "a Vós… Vos" is ungrammatical.
- **Severity 4, medium confidence.** `.sections[31].inline`, and also practice/jesus-prayer `.sections[1].inline`. Corpus: "tende misericórdia de mim, pecador".
  - Usual form: "tende piedade de mim, pecador".
  - Why: both forms exist, but "tende piedade" matches the rest of the corpus.

## practice/akathist-hymn-to-the-theotokos-and-ever-vrgin-mary: `content/practices/akathist-hymn-to-the-theotokos-and-ever-vrgin-mary/flow.json`
- **Severity 2, high confidence.** `.sections[11].inline`. Corpus: "Deus santo, Santo forte, Santo imortal, tende piedade de nós."
  - Received form: "Santo Deus, Santo Forte, Santo Imortal, tende piedade de nós."
  - Why: the word order is wrong, and the evening rule (`.sections[10]`) already has the correct form, so the two practices disagree.
- **Severity 2, medium-high confidence.** `.sections[9].inline` and `.sections[77].inline`. Corpus: "Cristo ressuscitou dos mortos! Pela morte pisou a Morte; e aos que estavam nos túmulos deu a vida."
  - Received form: "Cristo ressuscitou dos mortos, pela morte venceu a morte, e aos que estavam nos sepulcros deu a vida."
  - Why: "pisou" copies "trampled", and "túmulos" is not the liturgical word.
- **Severity 3, high confidence.** `.sections[43].inline`. Corpus: "Alegrai-vos, amor que vencei todo desejo!"
  - Correct form: "amor que venceis todo desejo".
  - Why: "vencei" is the command form; the sentence needs the present tense.
- **Severity 4, medium confidence.** The refrain throughout: "Alegrai-vos, Esposa não desposada!"
  - Usual forms: "Ave, Esposa sem esposo!" or "Ave, ó Virgem Esposa!", with each greeting usually starting "Ave," rather than "Alegrai-vos,".
  - Why: "Esposa não desposada" copies "Unwedded Bride".
- **Severity 4, medium confidence.** `.sections[7].inline`. Corpus: "ó Bondoso" and "tudo preencheis".
  - Usual forms: "ó Bom" and "tudo plenificais".
  - Why: both read as translated.
- **Severity 4, medium confidence.** `.sections[1]` and `.sections[75]`. Corpus: "Reverendo Padre, dai a bênção."
  - Usual form: "Abençoai, Padre."

## practice/immaculate-heart-novena: `content/practices/immaculate-heart-novena/flow.json`
- **Severity 3, medium-high confidence.** `.sections[3].inline`. Corpus: "a vós viemos cheios de confiança".
  - Correct form: "a vós vimos".
  - Why: "viemos" means "we came"; the prayer means "we come".
- **Severity 4, medium confidence.** `.sections[14].inline`. Corpus: "a vós nos consagramos e tudo o que somos".
  - Correct form: "a vós nos consagramos, com tudo o que somos".
  - Why: "nos" and "tudo o que somos" don't fit together as objects of the same verb.

## practice/little-office-passion-by-s-francis-of-assisi: `content/practices/little-office-passion-by-s-francis-of-assisi/flow.json`
- **Severity 3, high confidence.** `.sections[1].options[0].sections[0].options[4].sections[3].verses[10].text`. Corpus: "Retribuíram-me mal por bem, e Sl 37,21 me difamavam".
  - Why: a stray Bible reference ("Sl 37,21"), copied from the English, sits inside the text people pray.
- **Severity 3, high confidence.** `.sections[1].options[0].sections[0].options[5].sections[3].verses[12].text`. Corpus: "Pai santo, seguraste minha mão direita; e por vossa vontade me conduzistes".
  - Correct form: "segurastes".
  - Why: one sentence mixes *tu* and *vós*.
- **Severity 4, medium confidence.** A repeated verse. Corpus: "Trazei vossos próprios corpos e levai sua santa cruz".
  - Correct form: "Oferecei os vossos corpos e tomai a sua santa cruz".
  - Why: word-for-word from "Bring your own bodies".
- **Severity 4, medium confidence.** Corpus: "Bendito seja o Senhor Deus de Israel, que só ele faz maravilhas."
  - Correct form: "…o único que faz maravilhas".
  - Why: the clause is ungrammatical.
- **Severity 4, medium confidence.** Corpus: "Vossa destra, Senhor, é magnificada em poder".
  - Correct form: "glorificou-se em poder".
  - Why: copies "is magnified".
- **Severity 4, medium confidence.** Corpus: "proteja-te o Nome do Deus de Jacó; que ele." and "Rei do céu e da terra, porque."
  - Why: these copy unfinished cue phrases from the English and read as broken text.

## practice/friday-mortification: `content/practices/friday-mortification/flow.json` `.sections[8].inline`
- **Severity 4, medium confidence.** Corpus: "ofereço esta pequena coisa em união à vossa Paixão".
  - Correct form: "ofereço este pequeno sacrifício em união com a vossa Paixão".
  - Why: "pequena coisa" copies "small thing".

## practice/epiphany-novena: `content/practices/epiphany-novena/flow.json` `.sections[3]` and `.sections[14]`
- **Severity 4, high confidence (cosmetic).** Corpus: "Vos revelastes… à vossa manjedoura… Vos buscar" and "a vossa luz… Vos contemplarmos".
  - Why: within each prayer, Vos/vossa is capitalised inconsistently.

## practice/holy-souls-novena: `content/practices/holy-souls-novena/flow.json` `.sections[14].inline`
- **Severity 4, medium confidence.** Corpus: "e que a luz perpétua os ilumine".
  - Received form: "e a luz perpétua os ilumine".

## Checked and acceptable
- Pai-Nosso and the Glória forms
- "Ó Deus, vinde em meu auxílio / Senhor, apressai-vos em socorrer-me"
- The Stations of the Cross versicle "Nós Vos adoramos, ó Cristo, e Vos bendizemos…"
- "Jesus, manso e humilde de coração…"
- The Sacred Heart short prayers and litany lines, and the opening of "Vinde, Espírito Santo"
- The evening-rule psalm, which follows the Ave-Maria Bible
- The newly written novena opening and closing prayers, which are idiomatic

## Overall judgement
The problem is real in this chunk but concentrated. The newly written novena prayers are mostly idiomatic, with consistent *vós*. The damage is in the short prayers Brazilians know by heart:
- **Santo Anjo:** the meaning is reversed ("se a mim confiou").
- **Regina Caeli:** rendered in *tu* from the Latin.
- **Holy Hour:** "Graças e louvores…" was replaced by a word-for-word copy of the English.
- **Angelus prayer, Regina Caeli prayer and Divine Mercy closing prayer:** new translations instead of the received texts.
- **Byzantine material:** the same cause shows up — it was translated from English, which produced the wrong Trisagion order, "pisou a Morte", "destes nascimento" and "Esposa não desposada".
- **Confession thanksgiving:** slips into *você*.

Fix first: the Santo Anjo, the Holy Hour "Graças e louvores", the Regina Caeli, the Trisagion and the Easter troparion. After those, the Angelus, Regina Caeli and Divine Mercy prayers, which are close to the received text but not word-perfect. Translated-sounding wording in the Franciscan Little Office and the akathist is widespread but low severity.