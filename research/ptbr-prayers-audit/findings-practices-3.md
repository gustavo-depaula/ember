The harness blocked the write to `/tmp/ptaudit/findings-practices-3.md` (subagents may not write report files), so the findings are below as text only. No repository files were edited.

# pt-BR audit: practices chunk 3

## practice/thursday-eucharist (content/practices/thursday-eucharist/flow.json .sections[14])
- **Sev 1**: "Conservai puros os seus lábios, diariamente **purpurinados** com o Vosso precioso Sangue". Use "diariamente **tingidos (rubros)** com o vosso preciosíssimo Sangue". In Brazil *purpurina* is glitter, so this reads as lips "glittered" with the Blood of Christ. It is a comic calque of "empurpled". Confidence: high.

## practice/st-anthony-novena (content/practices/st-anthony-novena/flow.json .sections[14])
- **Sev 2**: "Se buscais milagres, fogem a morte, o erro, as calamidades; … tudo isto vem de vós."
  - The received text is the Responsório de Santo Antônio: "Se milagres desejais, / recorrei a Santo Antônio; / vereis fugir o demônio / e as tentações infernais. / Recupera-se o perdido, / rompe-se a dura prisão / e no auge do furacão / cede o mar embravecido. / Pela sua intercessão / foge a peste, o erro, a morte, / o fraco torna-se forte / e torna-se o enfermo são. / Todos os males humanos / se moderam, se retiram, / digam-no aqueles que o viram / e digam-no os paduanos."
  - The corpus has a prose re-translation instead.
  - It also confuses who is addressed: "Se buscais milagres" is said to the saint (vós), so it means "if you, Anthony, seek miracles".
  - Confidence: high.

## practice/saturday-mary (content/practices/saturday-mary/flow.json .sections[14])
- **Sev 2**: "Ó minha Senhora e minha Mãe, eu me ofereço inteiramente a Vós, e para Vos provar a minha devoção, Vos consagro neste dia … todo o meu ser. Já que sou Vosso, ó incomparável Mãe…"
  - Received text: "Ó Senhora minha, ó minha Mãe, eu me ofereço todo(a) a vós, e, em prova da minha devoção para convosco, vos consagro neste dia meus olhos, meus ouvidos, minha boca, meu coração e inteiramente todo o meu ser. E porque assim sou vosso, ó incomparável Mãe, guardai-me e defendei-me como coisa e propriedade vossa."
  - This is one of the most-prayed Brazilian prayers, and the corpus paraphrases it.
  - Confidence: high.

## practice/preces-opus-dei (content/practices/preces-opus-dei/flow.json)
- **Sev 3**, .sections[1].verses[0].r: "divindade suprema e única, **indivisa e Santa Trindade**".
  - The Latin is "sancta et una **Unitas**", so the third part should be "santa e una Unidade". The corpus repeats "Trindade" and invents "indivisa".
  - Received Preces: "Graças a Vós, ó Deus, graças a Vós: verdadeira e una Trindade, una e suprema Divindade, santa e una Unidade."
  - Confidence: high on the meaning error, medium on the exact received wording.
- **Sev 2**, .sections[7].verses[3].r: "E brilhe sobre eles a vossa luz". The received Requiem versicle is "E a luz perpétua os ilumine". The corpus drops "perpétua" and rewords a fixed formula. Confidence: high.
- **Sev 2/3**, .sections[5].verses[0].r: "Que Deus o conserve e lhe dê vida e **o faça santo** na terra".
  - Received Oremus pro Pontifice: "O Senhor o conserve, lhe dê vida, **o faça feliz** na terra e não o entregue nas mãos de seus inimigos".
  - "beatum faciat" means happy or blessed, not "santo"; the error comes from the English "holy".
  - Confidence: high.
- **Sev 3**, .sections[5].verses[1].r: "Senhor, que ele apascente, **vigilante**, o seu rebanho".
  - "vigilante" is invented, and "Stet" (may he stand firm) is lost.
  - Better: "Que ele se mantenha firme e apascente o rebanho com a vossa fortaleza, Senhor, na grandeza do vosso nome."
  - Confidence: medium.
- **Sev 3**, .sections[1].verses[4].r: "Se os inimigos vierem contra mim, não temerá meu coração; se me combaterem, em Deus esperarei" paraphrases Ps 26:3. Received/biblical form: "Ainda que um exército acampe contra mim, meu coração não temerá; ainda que se levante contra mim a guerra, mesmo assim terei confiança." Confidence: medium.
- **Sev 4**, .sections[3].verses[0].r: "de **falar coisas boas de nós**" sounds colloquial ("say nice things about us"). Better: "Lembrai-Vos, Virgem Mãe de Deus, quando estiverdes na presença do Senhor, de falar em nosso favor." Confidence: medium.
- **Sev 4**, .sections[3].verses[1].r: "Deus colocou-vos no lugar de Pai do Rei e de senhor da sua casa" leaves out "universae". Better: "Deus vos constituiu como pai do Rei e senhor de toda a sua casa." Confidence: medium.
- **Sev 4**, .sections[5].verses[3].r: "toda cidade ou casa **internamente** dividida não se manterá" adds a word not in the text. Use "dividida contra si mesma não subsistirá" (Mt 12:25). Confidence: medium.
- **Sev 4**, .sections[17]: "a **conversão** da nossa vida" for "emendationem vitae". Received: "a emenda da vida". Confidence: medium.
- **Sev 4** (consistency), .sections[14]: "Nós **Vos** pedimos … com a **vossa** inspiração … em **Vós** comecem". The capitalisation of Vós/vossa changes within one prayer. Confidence: high.

## practice/seven-sorrows and practice/seven-sorrows-scriptural (content/practices/seven-sorrows/flow.json and content/practices/seven-sorrows-scriptural/flow.json)
- **Sev 3**, .sections[7].inline: "**Vós, Salvador do mundo**, que com o Pai … viveis e reinais".
  - The conclusion "Per te, Jesu Christe" has been lost, leaving a dangling vocative.
  - It should read "**Por Vós, Jesus Cristo**, Salvador do mundo, que com o Pai e o Espírito Santo viveis e reinais…".
  - Confidence: high.
- **Sev 3**, same prayer: "Interceda por nós, **vo-lo pedimos**". "vo-lo" has no antecedent and sounds European or archaic. Brazilian missals say "vos pedimos". Confidence: medium.
- **Sev 3**, .sections[4].sections[1].verses[0].v: "Condoemo-nos **contigo**, ó Maria, por esta **tua** dor".
  - This addresses Mary as "tu", but the same practice addresses her as "vós" ("Rogai por nós, ó Virgem dolorosíssima").
  - Use "Compadecemo-nos de vós, ó Maria, por esta vossa dor."
  - Confidence: medium.

## practice/way-of-light and practice/way-of-light-scriptural (content/practices/way-of-light/flow.json and content/practices/way-of-light-scriptural/flow.json)
- **Sev 3**, .sections[2]: "concedei que, ao caminharmos convosco nesta Via Lucis, **nossos corações ardentes**, e que nós…" has no verb, so the sentence is broken. Use "…nossos corações ardam dentro de nós e que, contemplando…". Confidence: high.
- **Sev 3**, .sections[6]: "Que os nossos corações, como os dos discípulos de Emaús, **ardentes de amor por Vós**." also has no verb. Use "ardam de amor por Vós". Confidence: high.
- **Sev 3**, .sections[6]: "**Que viveis** e reinais pelos séculos dos séculos." should be "Vós que viveis e reinais…". Confidence: high.

## practice/st-john-paul-ii-novena (content/practices/st-john-paul-ii-novena/flow.json .sections[3])
- **Sev 3**: "como destemido **testemunho** de Cristo" should be "destemida **testemunha** de Cristo". A person is a *testemunha*; *testemunho* is the act of witnessing. Confidence: high.

## practice/rosary-54-day-novena (content/practices/rosary-54-day-novena/flow.json)
- **Sev 2**, .sections[3].sections[11] (St Alphonsus' spiritual communion): "Abraço-vos como se já estivésseis comigo e uno-me inteiramente a Vós. Nunca permitais que eu me separe de Vós."
  - Received text: "…Abraço-me convosco como se já estivésseis comigo; uno-me convosco inteiramente. Ah! não permitais que de vós me separe."
  - The capitalisation of vos/Vós also changes within this one prayer.
  - It differs from the spiritual communion in visit-blessed-sacrament .sections[6].options[1]; the corpus should use one received text.
  - Confidence: medium-high.
- **Sev 4**, .sections[3].sections[2].*: "ofereço esta coroa de rosas … **em petição**" is an anglicism. Use "como súplica" or "em súplica". Confidence: high.

## practice/st-joseph-novena (content/practices/st-joseph-novena/flow.json)
- **Sev 2**, .sections[13]: "A vós, **ó bem-aventurado José**, recorremos em nossa tribulação, e, tendo implorado … com confiança solicitamos…"
  - The received Brazilian text (Leo XIII) is: "A vós, São José, recorremos em nossa tribulação e, depois de ter implorado o auxílio de vossa santíssima Esposa, cheios de confiança solicitamos também o vosso patrocínio. Por esse laço sagrado de caridade que vos uniu à Virgem Imaculada Mãe de Deus, e pelo amor paternal que tivestes ao Menino Jesus…"
  - The corpus follows an abridged English version, but Brazilians know this prayer by heart.
  - Confidence: medium. The corpus may intend the abridged form, but the opening still differs from what Brazilians pray.
- **Sev 4**, .sections[3]: "A vossos cuidados **confio a mim mesmo**" is awkward. Use "A vós me confio, e todos os que me são caros…". Confidence: medium.

## practice/stational-vespers-on-the-holy-day-of-easter (.sections[24], Victimae paschali)
- **Sev 4**: "A morte e a vida travaram um **duelo** admirável" copies the Latin "duello" word for word. The received Brazilian prose has "travaram um admirável combate". Confidence: medium.
- **Sev 4**: "**de nós, Rei vencedor, tende piedade**" uses an unidiomatic inversion. Use "Ó Rei vencedor, tende piedade de nós." Confidence: high.
- **Sev 4**: "o sudário e **os panos**" should be "o sudário e as vestes". Confidence: medium.
- I did not flag the psalms: they follow a Vulgate-style translation.

## practice/st-ignatius-antioch-novena (content/practices/st-ignatius-antioch-novena/flow.json .sections[3])
- **Sev 3**: "concedei-nos, que honramos seu testemunho, partilhar de seu ardente amor" has broken syntax. Use "concedei que nós, que honramos seu testemunho, partilhemos de seu ardente amor". Confidence: high.

## practice/st-augustine-novena (content/practices/st-augustine-novena/flow.json .sections[3])
- **Sev 4**: "que Vos buscou **longa e distantemente**" renders "long and far" word for word. Use "que Vos buscou por longo tempo e por caminhos distantes". Confidence: high.

## practice/st-hildegard-novena (content/practices/st-hildegard-novena/flow.json .sections[3])
- **Sev 4**: "a sabedoria e o **assombro** que ela recebeu". In pt-BR "assombro" leans toward fright or haunting. Use "admiração" or "encantamento". Confidence: medium.

## practice/st-clare-novena (content/practices/st-clare-novena/flow.json .sections[14])
- **Sev 4**: "**erguei-me** diante de vosso Senhor" turns "hold me before" into "lift me up". Use "apresentai-me" or "sustentai-me diante de vosso Senhor". Confidence: medium.

## practice/seven-sorrows-novena (content/practices/seven-sorrows-novena/flow.json .sections[3])
- **Sev 4**: "uma **parte** do vosso **amor que não falha**" is literal. Use "participação no vosso amor indefectível". Confidence: medium.

## practice/st-john-baptist-novena (content/practices/st-john-baptist-novena/flow.json .sections[3])
- **Sev 4**: "a **apontar** sempre os outros **para** Cristo" is an anglicism ("point others to"). Use "a conduzir sempre os outros a Cristo". Confidence: medium.

## practice/ss-louis-zelie-martin-novena and practice/st-gianna-novena (.sections[3] and .sections[14])
- **Sev 4**: "nos deveres de **cada dia comum**" renders "each ordinary day" word for word. Use "nos deveres do dia a dia" or "da vida cotidiana". Confidence: high.

## practice/st-michael-novena (content/practices/st-michael-novena/flow.json .sections[3])
- **Sev 4**: "defendei-nos no **combate da santidade**" should be "no combate pela santidade". Confidence: medium.

## practice/tuesday-angels (content/practices/tuesday-angels/flow.json .sections[13])
- **Sev 4**: "conduzi-nos com segurança **ao Lar**". The capitalised "Lar" copies the English "home". Use "à Casa do Pai". Confidence: medium.

## practice/sunday-devotion (content/practices/sunday-devotion/flow.json .sections[11])
- **Sev 4** (typographic): "que **conVosco** vive e reina" has a non-standard capital inside the word. Use "convosco" or "Convosco". Confidence: high.

## Overall judgement
This chunk is mostly sound, and much better than the Anima Christi case. Most of it is newly written novena prayers (two per saint), which have no received text. They read naturally, keep the vós register throughout, and contain no European Portuguese. Their defects are minor literalisms: "cada dia comum", "em petição", "longa e distantemente", "testemunho" for "testemunha".

The real problems are in the traditional prayers that have a received Brazilian form, where the corpus re-translated from English or Latin instead of taking the received text:
- **Responsório de Santo Antônio:** rewritten as prose that confuses who is addressed.
- **"Ó Senhora minha, ó minha Mãe":** paraphrased.
- **St Alphonsus' spiritual communion:** two different variants in the corpus.
- **Leo XIII's "A vós, São José":** opens differently from the received text.
- **Opus Dei Preces (the worst prayer in the chunk):**
  - the Trinity acclamation is mistranslated;
  - "perpétua" is dropped from the Requiem versicle;
  - the Pope is made "santo" instead of "feliz";
  - "vigilante" is invented.

The one crude-word error is "purpurinados" (glittered) in the prayer for priests, which sounds comic to a Brazilian. Two more texts need fixing regardless of sourcing:
- the Way of Light prayers have two broken sentences with no verb and a dangling "Que viveis e reinais";
- the Seven Sorrows prayer has lost its closing "Por Vós, Jesus Cristo".