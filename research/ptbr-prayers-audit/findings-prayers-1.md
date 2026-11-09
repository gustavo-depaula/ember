Note: the file `/tmp/ptaudit/findings-prayers-1.md` was not written because the harness blocks subagents from writing report files. The findings are below.

# pt-BR prayer audit: prayers-1 (a-solis-ortus-cardine to chaplet-precious-blood)

## anima-christi (content/practices/anima-christi/manifest.json .flow.sections[2].inline)
- **Sev 1**: "Sangue de Cristo, embriagai-me." → **"Sangue de Cristo, inebriai-me."** "Embriagar" suggests drunkenness to a Brazilian ear; Brazilian devotionals use "inebriai-me". Confidence: high.
- **Sev 2**: "Ó bom Jesus, escutai-me." → **"Ó bom Jesus, ouvi-me."** Received form. Confidence: high.
- **Sev 2**: "Nas Vossas chagas escondei-me." → **"Dentro de vossas chagas, escondei-me."** Received form. Confidence: high.
- **Sev 2**: "Do maligno defendei-me." → **"Do espírito maligno, defendei-me."** (variant: "Do inimigo maligno defendei-me"). The corpus drops the noun. Confidence: high.
- **Sev 2**: "Na hora da minha morte chamai-me / e mandai-me vir a Vós," → **"Na hora da morte, chamai-me / e mandai-me ir para Vós,"** Received form. Confidence: high.
- **Sev 2**: "pelos séculos dos séculos" → **"por todos os séculos dos séculos"** Most printed Brazilian versions have this form. Confidence: medium.

## act-consecration-sacred-heart (content/practices/act-consecration-sacred-heart/flow.json .sections[2].inline)
- **Sev 3**: "e chamei-os ao porto da verdade" → **"chamai-os"**. "Chamei" is the past tense ("I called"). The imperative is "chamai". This is a grammatical error. Confidence: high.
- **Sev 3**: The paragraph "Réspice dénique misericórdiæ óculis illíus gentis fílios…" is missing. It is in the Latin and the English but not in the pt-BR. Confidence: high.
- **Sev 4**: "para estarmos mais seguros unidos a Vós" → "para mais firmemente nos unirmos a Vós". "Mais seguros unidos" does not parse well in Portuguese. Confidence: high.
- **Sev 4**: "fazei que a terra reverbere de polo a polo com um só grito: Glória ao Divino Coração…" → "fazei que de um a outro polo da terra ressoe uma só voz: Louvado seja o Divino Coração que nos trouxe a salvação; a Ele glória e honra por todos os séculos". "Reverbere" and "grito" are literalisms. Latin: "una resonet vox". Confidence: medium.
- **Sev 4**: "Sede o Rei, ó Senhor" → "Sede Rei, Senhor," (Brazilian booklet form). Confidence: medium.

## act-contrition (content/practices/act-contrition/flow.json .sections[1].inline)
- **Sev 3**: "que sois infinitamente bom e que merecia todo o meu amor" → "**mereceis**". "Merecia" is first or third person imperfect, so the sentence now says "I deserved" or "it deserved". This is a grammatical and meaning error. Confidence: high.
- **Sev 3**: The capitalisation is inconsistent within the prayer: "ter-Vos ofendido" vs "porque vos ofendi". Confidence: high.
- **Sev 2**: The text is a translation of the American Baltimore act. The best-known Brazilian act is "Meu Deus, porque sois infinitamente bom e Vos amo de todo o meu coração, pesa-me de Vos ter ofendido; e, com o auxílio da Vossa divina graça, proponho firmemente emendar-me e nunca mais Vos tornar a ofender. Peço e espero o perdão das minhas culpas pela Vossa infinita misericórdia. Amém." Confidence: high.
- **Note**: The corpus has two different Acts of Contrition (act-contrition and act-of-contrition) with different pt-BR texts.

## act-of-contrition (content/practices/act-of-contrition/manifest.json .flow.sections[0].inline)
- **Sev 2**: "Meu Deus, pesa-me muito ter-Vos ofendido, porque sois infinitamente bom e o pecado Vos desagrada. Proponho firmemente… não Vos ofender mais e evitar as ocasiões de pecado." This drops the Latin's "detestor… quia… poenas a Te iuste statutas promeritus sum". It also matches neither the Latin nor the received Brazilian form ("Meu Deus, porque sois infinitamente bom…", see above). Confidence: medium.

## act-of-faith (content/practices/act-of-faith/manifest.json .flow.sections[0].inline)
- **Sev 1**: "um só Deus em três Pessoas igualmente distintas" → **"três Pessoas realmente distintas"**. The catechism formula is "realmente distintas". "Igualmente distintas" is theologically meaningless. Confidence: high.

## act-of-hope (content/practices/act-of-hope/manifest.json .flow.sections[0].inline)
- **Sev 4**: "esperando em Vossas promessas e na infinita bondade que tendes" → "confiado em Vossa infinita bondade e em Vossas promessas". "Que tendes" is a translated-sounding filler. Confidence: medium.

## act-of-reparation (content/practices/act-of-reparation/manifest.json .flow.sections[4].inline)
- **Sev 3**: "cuja caridade transbordante para com os homens é tão pouco correspondida pelo esquecimento, negligência e desprezo" → received: "cujo imenso amor para com os homens é por eles tão ingratamente correspondido com esquecimentos, friezas e desprezos". The corpus says the charity is "barely reciprocated *by* forgetfulness", which is nonsense. Confidence: high.
- **Sev 4**: "eis-nos prostrados diante de Vós" → received: "eis-nos prostrados diante de vossos altares". Confidence: medium.
- **Sev 3**: "Lembrando, porém, que nós mesmos…" The English "alas" is rendered as "porém" ("however"), which changes the sense. Received: "Lembrados, porém, de que também nós…" / "ai de nós". Confidence: medium.
- **Sev 4**: "declaramos nossa prontidão para reparar" is an anglicism ("declare our readiness"). Better: "estamos dispostos a reparar". Confidence: high.

## adoro-te-devote (content/practices/adoro-te-devote/manifest.json .flow.sections[0].inline)
- **Sev 3 (minor)**: "seja feliz na visão da vossa glória". It uses lowercase "vossa" while the rest of the prayer has "Vos/Vós", which is inconsistent within one prayer. Confidence: high.

## angelic-trisagion (content/practices/angelic-trisagion/flow.json)
- **Sev 3** (.sections[5].verses[0].v): "a Vós temos de dar graças pelos séculos dos séculos" → **"a Vós a ação de graças pelos séculos dos séculos, ó Trindade Beatíssima!"** (Opus Dei Devocionário). "Temos de dar graças" is a clumsy obligation construction. It breaks the parallel "a Vós o louvor, a Vós a glória". Confidence: high.
- **Sev 3** (.sections[11].inline): The prayer ends "Por Nosso Senhor Jesus Cristo, Vosso Filho, na unidade do Espírito Santo." It is truncated mid-formula and has no "que convosco vive e reina…" and no Amém. The Latin has the short ending "Per Christum Dominum nostrum" → **"Por Cristo, Senhor nosso. Amém."** Confidence: high.
- **Sev 2 (low)** (.sections[1].verses[1]): "Deus, vinde em nosso auxílio. / Senhor, socorrei-nos e salvai-nos." This is the rosary/terço form, but the Latin is singular and Office-style. The LH form is "Vinde, ó Deus, em meu auxílio. / Socorrei-me sem demora." This is acceptable as a devotional variant. Confidence: medium.
- **Sev 4 (punct.)** (.sections[1].verses[0].v): "Abri, Senhor os meus lábios." → "Abri, Senhor, os meus lábios." The comma is missing in a vocative. Confidence: high.

## ante-studium (content/practices/ante-studium/manifest.json .flow.sections[2].inline)
- **Sev 4**: "Orientai o começo, dirigi o progresso e completai a conclusão" → "Orientai o início, dirigi o progresso e coroai o término" (or "levai a bom termo o fim"). "Completai a conclusão" is redundant. Confidence: medium.

## aquinas-after-communion (content/practices/aquinas-after-communion/manifest.json .flow.sections[2].inline)
- **Sev 4**: "perfeita quietação dos meus movimentos carnais e espirituais" → "perfeito apaziguamento (sossego) dos meus impulsos…". "Quietação" is a Latinate calque. Confidence: medium.

## aquinas-before-communion (content/practices/aquinas-before-communion/manifest.json .flow.sections[2].inline)
- **Sev 4**: "Rogo à abundância da Vossa imensa generosidade que Vos digneis curar…" → "Rogo, pois, à Vossa infinita bondade que Vos digneis curar…". This is a calque of "immensae largitatis tuae abundantiam". Confidence: medium.
- **Sev 4**: "com tal propósito e intenção como convém" → "com tal propósito e intenção, quanto convém". The correlative does not match the "tanta… tal" construction earlier in the sentence. Confidence: medium.

## athanasian-creed (content/practices/athanasian-creed/flow.json)
- **Sev 3** (verses[4], v.5): "Porque uma só é a Pessoa do Pai, outra a do Filho" → **"Porque uma é a Pessoa do Pai, outra a do Filho, outra a do Espírito Santo."** "Uma só" ("only one") contradicts "outra". This is a meaning error. Confidence: high.
- **Sev 3** (verses[20], v.21): "O Filho procede do Pai" → **"O Filho é só do Pai"**. "Procede" is the technical term for the Spirit, as v.22 uses it. The corpus also drops "solo". Confidence: medium-high.
- **Sev 3** (verses[28], v.29): "gerado na substância do Pai" → **"gerado da substância do Pai"** (Latin "ex substantia"). Confidence: high.
- **Sev 4** (verses[27], v.28): "consiste, pois, em crer ainda e confessar" has a stray "ainda". Confidence: medium.
- **Sev 4** (verses[23], v.24): "não há nem mais antigo nem menos antigo" → "nada há anterior ou posterior". "Prius aut posterius" means before/after, not older/less old. Confidence: medium.
- **Sev 4** (.sections[8].inline): The conclusion "Por Jesus Cristo Senhor Nosso." truncates the Latin's long ending "…qui tecum vivit et regnat…". Confidence: medium.

## ave-maris-stella (content/practices/ave-maris-stella/flow.json .sections[0].inline)
- **Sev 3**: "Recebeste aquele 'Ave' da boca de Gabriel: assegurai-nos a paz…". It uses the tu verb "recebeste" and then Vós imperatives "assegurai", "mostrai que sois", "Vosso Filho", which mixes registers within one stanza. → "Recebendo aquele 'Ave' da boca de Gabriel, firmai-nos na paz…". Confidence: high.

## ave-verum (content/practices/ave-verum/flow.json .sections[0].inline)
- **Sev 3**: "Oxalá nós o bebamos na hora da morte." "Esto nobis praegustatum" means "be for us a foretaste". "Beber" introduces a drinking image the Latin lacks, and "oxalá" is odd in prayer. → "Sede para nós antegozo (penhor) na hora da morte." Confidence: medium-high.
- **Sev 4**: "que pelo homem padeceu e foi imolado" omits "vere" and "in cruce" from v.1. "In cruce" is misplaced into v.2 ("transpassado na Cruz"). → "que verdadeiramente padeceu e foi imolado na cruz pelo homem". Confidence: medium.

## blessed-be-your-purity (content/practices/blessed-be-your-purity/flow.json .sections[0].inline)
- **Sev 3**: "Bendita seja tua pureza… A ti, celestial Princesa, Virgem Maria, vos ofereço… Olhai-me com compaixão, não me deixes, Mãe minha." This mixes tu ("tua", "a ti", "deixes") with vós ("vos ofereço", "olhai-me") within one sentence. It also calques the Spanish "Bendita sea tu pureza". Received Brazilian: **"Bendita seja a vossa pureza, e eternamente o seja, pois todo um Deus se deleita em tão graciosa beleza. A vós, celestial Princesa, Virgem Sagrada Maria, eu vos ofereço neste dia alma, vida e coração. Olhai-me com compaixão, não me deixeis, Mãe minha."** Confidence: high.
- **Sev 4**: "se recreia" is the Spanish "se recrea" left as is. Brazilian: "se deleita / se compraz". Confidence: medium.

## chaplet-precious-blood (content/practices/chaplet-precious-blood/flow.json)
The source is an 1857 Porto text, so the archaic register is expected. Flagged here only where a modern Brazilian reader would misread it.
- **Sev 1** (.data.mystery[2].text): "correu por toda a parte em rios aquele precioso licor". In Brazil "licor" means an alcoholic liqueur, which is comic or irreverent for Christ's Blood. → "aquele precioso Sangue". Confidence: high.
- **Sev 3** (.data.mystery[2].text): "em desconto de tuas impaciências, e delicadeza". Today "delicadeza" reads as gentleness, but the meaning is softness or self-indulgence. → "em reparação de tuas impaciências e moleza (comodismo)". Confidence: medium.
- **Sev 2** (.sections[0].verses[0].r): "Senhor, socorrei-me e apressai-vos." → **"Senhor, apressai-vos em socorrer-me."** (or the LH form "Socorrei-me sem demora"). The corpus word order is unnatural. Confidence: high.
- **Sev 4** (.data.mystery[0].text): "excita-te fortemente à dor das mesmas" is archaic and stilted. → "move-te a uma viva dor deles". Confidence: medium.
- **Sev 4** (.sections[11].sections[0].inline): "nascido do pélago de um amor imenso" uses "pélago", an obscure word. Brazilian: "do abismo / do oceano". Confidence: medium.

## alma-redemptoris-mater (content/practices/alma-redemptoris-mater/manifest.json .flow.sections[1].inline)
- **Sev 2 (low)**: "Augusta Mãe do Redentor, ó porta sempre aberta do céu…". The Brazilian Liturgy of the Hours opens "Ó santa Mãe do Redentor, porta do céu sempre aberta, estrela do mar, socorrei o povo que caiu e procura levantar-se…". The corpus prose is acceptable but is not the LH text. Confidence: medium.

## apostles-creed (content/practices/apostles-creed/manifest.json .flow.sections[0].inline)
- **Sev 2 (low)**: "de onde há de vir a julgar" → CNBB/missal: **"donde há de vir a julgar"**. Otherwise it matches the received form. Confidence: medium.

## Clean or acceptable (no finding)
- angele-dei: received form; "me governa e me ilumina" is a variant.
- act-of-charity
- act-of-consecration (Montfort)
- aquinas-after-study
- canticle-of-the-creatures: OFM Brazil source.
- canticle-of-the-three-children: prose canticle and versicles.
- benedictus: a recognised Bible-style rendering.
- breathe-in-me-holy-spirit: "Respirai em mim" echoes the widespread Brazilian "Respira em mim" of St Augustine's prayer.
- blessing-for-a-journey
- chaplet-five-wounds
- chaplet-infant-jesus-prague
- ave-regina-caelorum: acceptable prose.

## Overall judgement
Problems are frequent in this chunk. About a third of the substantive prayer texts have at least one sev 1–3 issue. The pattern is the one the user reported: the text was translated from the Latin or English instead of taken from Brazilian devotionals.

The worst prayers:
- **Anima Christi**: almost every line departs from the received form, plus "embriagai-me".
- **Act of Contrition**: two divergent versions, neither the familiar "Meu Deus, porque sois infinitamente bom…", and one has a grammar error ("merecia").
- **Act of Faith**: "igualmente distintas" for "realmente distintas".
- **Act of Consecration to the Sacred Heart**: "chamei-os", plus a missing paragraph.
- **Act of Reparation**: the opening clause is nonsensical.
- **Athanasian Creed**: meaning errors in vv. 5, 21 and 29.
- **Blessed Be Your Purity**: Spanish calque with tu/vós mixed.
- **Ave Maris Stella**: tu/vós mixed.
- **Ave Verum**: "bebamos".
- **Chaplet of the Precious Blood**: "precioso licor".

The Opus-Dei-sourced items (trisagion, three children) are mostly sound apart from a truncated collect and a clumsy versicle. Short versicles and the Creed are mostly correct.