# pt-BR audit, prayers-2 (chaplet-st-michael to morning-offering-therese)

I couldn't create `/tmp/ptaudit/findings-prayers-2.md`: the harness refused the write because subagents may not write report files, so the findings are below. I read the whole input file (552 blocks) and edited nothing in the repository.

Severity: 1 = wrong or crude word, 2 = not the received text, 3 = non-Brazilian, ungrammatical or a meaning error, 4 = awkward literalism.

## litany-st-joseph (`content/practices/litany-st-joseph/flow.json`)
- **Sev 1** · `São José, consólo dos desgraçados,` should be "São José, consolo dos infelizes" (or "consolo dos aflitos"). In Brazil "desgraçado" is mainly an insult, so the line sounds crude. "consólo" has also been misspelled since 1971; it should be "consolo". Confidence: high.
- **Sev 2** · `São José, pai adotivo do Filho de Deus,` should be the received "pai nutrício do Filho de Deus" (Latin *nutricie*). Confidence: medium-high.
- **Sev 3** · `ilustre descendente de David` should be "Davi", the Brazilian spelling. Confidence: medium.
- **Sev 4** · Capitals are inconsistent. `Guardião do Redentor`, `Servo de Cristo`, `Ministro da salvação` and `Amparo nas dificuldades` are capitalised, but the other invocations are lowercase. Confidence: high.
- **Sev 4** · The collect ends `Que viveis e reinais…`. It should read "Vós que viveis e reinais…", because a bare "Que" leaves the clause hanging. Confidence: high.

## litany-sacred-heart (`content/practices/litany-sacred-heart/flow.json`)
- **Sev 3** · `da cuja plenitude todos nós recebemos` is ungrammatical. It should be "de cuja plenitude todos nós recebemos". Confidence: high.
- **Sev 2** · `templo sagrado de Deus` should be the received "templo santo de Deus". Confidence: medium-high.
- **Sev 2** · `vaso de justiça e amor` should be the received "receptáculo de justiça e de amor". Confidence: medium-high.
- **Sev 2** · `desejo dos eternos outeiros` should be the received "desejo das colinas eternas". Confidence: medium-high.
- **Sev 2** · `paciente e misericordiosíssimo` should be the received "paciente e de muita misericórdia" (Latin *multae misericordiae*). Confidence: medium-high.
- **Sev 2** · `carregado de opróbrios` should be the received "saturado de opróbrios". Confidence: medium.
- **Sev 2** · `esmagado pelas nossas ofensas` should be the received "despedaçado por causa dos nossos crimes". Confidence: medium.
- **Sev 2** · `vítima pelos nossos pecados` follows the English. The Latin *victima peccatorum* gives the received "vítima dos pecadores". Confidence: medium-high.
- **Sev 4** · `Filho do Eterno Pai` is usually prayed as "Filho do Pai Eterno". Confidence: medium.

## litany-loreto (`content/practices/litany-loreto/flow.json`)
- **Sev 2** · `Santíssima Virgem das virgens` should be the received "Santa Virgem das virgens". Confidence: high.
- **Sev 2** · `Para que sejamos tornados dignos das promessas de Cristo.` copies the Latin/English passive word for word. The received form is "Para que sejamos dignos das promessas de Cristo." Confidence: high.
- **Sev 2** · `Consoladora dos migrantes` should be the pt-BR rendering "Conforto (Consolo) dos migrantes". Confidence: medium.

## litany-holy-name (`content/practices/litany-holy-name/flow.json`)
- **Sev 3** · The oration has `divínissimo`, which should be "diviníssimo". Confidence: high.
- **Sev 2** · `Pai do futuro século` should be the received "Pai do século futuro". Confidence: high.
- **Sev 2** · `brilho da luz eterna` should be the received "esplendor (candor) da luz eterna". Confidence: medium-high.
- **Sev 2** · `Da negligência de Vossas inspirações` should be the received "Do desprezo das vossas inspirações". Confidence: medium.
- **Sev 4** · `Pela Vossa instituição da Santíssima Eucaristia` copies the English possessive. The received form is "Pela instituição da Santíssima Eucaristia". Confidence: medium.
- **Sev 4** · `Que viveis e reinais` should be "Vós que viveis e reinais". Confidence: high.

## litany-saints (`content/practices/litany-saints/flow.json`)
- **Sev 3** · `Para que nos levais à verdadeira penitência` uses the indicative. It should be the subjunctive "leveis", like every other petition. Confidence: high.
- **Sev 2** · `Santa Teresinha de Lisieux` does not match the Latin *a Iesu Infante*. The received form is "Santa Teresinha do Menino Jesus". Confidence: medium-high.
- **Sev 4** · `De uma morte repentina e imprevista` should be the received "Da morte repentina e imprevista". Confidence: medium.

## litany-precious-blood (`content/practices/litany-precious-blood/flow.json`)
- **Sev 3** · `bebida eucarística e refrigério das almas` follows the English "refreshment". The Latin *lavacrum* means washing. The received form is "na Eucaristia bebida e purificação das almas". Confidence: medium-high.
- **Sev 4** · `derramado na terra durante a Agonia` is usually "correndo em terra na agonia". Minor. Confidence: medium.

## litany-blessed-sacrament (`content/practices/litany-blessed-sacrament/flow.json`)
- **Sev 3** · `imolado no altar por nós e para nós` loses the English "by us": "para nós" means "for us". Confidence: medium.

## confiteor (`content/practices/confiteor/flow.json`)
- **Sev 3** · The second formula says `pequei muitas vezes por palavras e obras`. The Latin *cogitatione, verbo et opere* needs "por pensamentos, palavras e obras". Confidence: high.
- **Sev 2 (low)** · `a vós, irmãos`: the current Missal (3rd edition, 2023) has "irmãos e irmãs". The older form is still legitimate. Confidence: medium.
- **Sev 4** · The first formula's `minha tão grande culpa` has no closing period.

## exsultet (`content/practices/exsultet/flow.json`)
- **Sev 3** · European Portuguese throughout:
  - `omnipotente` (twice): onipotente
  - `Unigénito`: Unigênito
  - `Egipto`: Egito
  - `crêem`: creem
  - `connosco`: conosco
  - `género`: gênero
  - `protecção`: proteção

  Confidence: high.
- **Sev 3** · `Ó pecado cie, Adão` is an OCR garble of "Ó pecado de Adão". Confidence: high.
- **Sev 3** · `mystérios` should be "mistérios" and `Dêmos graças` should be "Demos graças"; both are pre-reform spellings. Confidence: high.
- **Sev 3** · `Observai também o nosso devotíssimo Imperador (Se não é coroado, diz-se: eleito. N.,…`: the parenthesis is never closed. "Observai" is also a calque of *Respice*; it should be "Olhai também". Confidence: high.
- **Sev 3** · `Ó noite deveras ditosa, que só tu conheceste` switches to "tu" for no reason. It should read "que só ela mereceu conhecer". Confidence: medium.
- **Sev 4** · `Vos suplicamos, pois` and `Vos suplicamos, ainda` open a solemn sentence with the pronoun. Use "Suplicamo-vos" or "Nós vos suplicamos". Confidence: medium.
- **Sev 4** · `Que convosco, e com o Espírito Santo, vive e reina` leaves the clause hanging. It should read "Ele que convosco… vive e reina". Confidence: high.
- **Sev 2** · `Assim os temos para o Senhor.` is not a Brazilian response. The received forms are "O nosso coração está em Deus" or "Já os temos elevados ao Senhor". Confidence: medium-high.

## gloria-in-excelsis (`content/practices/gloria-in-excelsis/flow.json`)
- **Sev 3** · `Filho Unigénito` should be "Unigênito". Confidence: high.
- **Sev 4** · Commas are inconsistent: `Vós que tirais…` against `Vós, que tirais…`. The rest of the wording is acceptable for a traditional-Mass text. Confidence: medium.

## gloria-laus (`content/practices/gloria-laus/flow.json`)
- **Sev 3** · `foram aceites` is European; it should be "foram aceitos". Confidence: high.
- **Sev 4** · `David` should be "Davi". Confidence: medium.

## come-holy-spirit (`content/practices/come-holy-spirit/manifest.json`)
- **Sev 3** · `Ó Deus que instruíste` mixes "tu" with "vossos" and "fazei". It should be "Ó Deus, que instruístes". Confidence: high.
- **Sev 2** · `e gozemos da sua consolação` drops "sempre" (Latin *semper*). The received form is "…e gozemos **sempre** da sua consolação". Confidence: high.
- **Sev 4** · `Vinde Espírito Santo` needs the comma: "Vinde, Espírito Santo". Capitals are inconsistent: "vossos fiéis" against "Vosso Amor". Confidence: high.

## morning-offering-franciscan (`content/practices/morning-offering-franciscan/flow.json`)
- **Sev 3** · `que nos trouxeste` ("tu") is mixed with "defendei-nos… vosso poder". It should be "trouxestes", or the breviary's "que nos fizestes chegar ao começo deste dia". Confidence: high.

## memorare (`content/practices/memorare/manifest.json`)
- **Sev 2/3** · `que recorreram à vossa proteção, implorado o vosso auxílio ou pedido vossa intercessão` is ungrammatical: the participles have no helping verb. The received form is "que algum daqueles que **têm recorrido** à vossa proteção, implorado a vossa assistência e reclamado o vosso socorro, fosse por vós desamparado". Confidence: high.
- **Sev 4** · `a vossos pés` should be the received "aos vossos pés". Capitals are inconsistent: Vós, vossos, vossa. Confidence: medium.

## morning-offering-suscipe (`content/practices/morning-offering-suscipe/flow.json`)
- **Sev 2** · `Vós me destes tudo isto; a Vós, Senhor, o devolvo` and `pois isto me basta` differ from the received Loyola text: "Vós mo destes; a Vós, Senhor, o restituo… disponde de tudo inteiramente segundo a vossa vontade… que esta me basta". "devolvo" is flat, everyday wording. Confidence: medium-high.

## formulas-of-catholic-doctrine (`content/practices/formulas-of-catholic-doctrine/flow.json`)
- **Sev 3** · `Tudo aquilo que quereis que os homens façam a vós, Fazei-o vós mesmos a eles.` has a stray capital F and an awkward "façam a vós". The received Mt 7,12 is "Tudo o que quereis que os homens vos façam, fazei-o também vós a eles." Confidence: high.
- **Sev 3** · Precept 1 has `permanecer livres de trabalhos`, a plural with no plural subject. The pt-BR Compendium has "permanecer livre". Confidence: medium.
- **Sev 4** · `pobres de coração` does not match the Latin *spiritu*. The liturgical form is "pobres em espírito". Confidence: medium.
- **Structural, not language:** the pt-BR lists don't line up with the Latin/English entries, so readers comparing columns will see mismatches.
  - Beatitudes 2 and 3 are swapped between the Latin and English.
  - `1. Infirmos visitare` sits beside `1. Dar de comer aos famintos`.
  - `Molestos patienter sustinere` sits beside the English "Forgive offences willingly".
  - `1. Ignorantes instruere` sits beside `1. Aconselhar os duvidosos`.

## crux-fidelis (`content/practices/crux-fidelis/flow.json`)
- **Sev 3** · `Ó Cruz, em que tenho fé` (six times) mistranslates *Crux fidelis*, which means "faithful Cross". The received form is "Ó Cruz fiel, árvore única em nobreza". Confidence: medium-high.
- **Sev 4** · `este digno rio` adds "digno", which is not in the Latin. Confidence: medium.
- **Sev 4** · `foste o primeiro piloto que o conduziu ao porto` drifts from the Latin image of an ark preparing a harbour. Confidence: medium.

## lauda-sion (`content/practices/lauda-sion/manifest.json`)
- **Sev 4** · `Tanto quanto possas, ouses tu louvá-lo` reads as a calque. Better: "Ousa louvá-lo quanto puderes". Confidence: medium.
- **Sev 3** · `nem o estado, nem as dimensões… são alteradas` should be "alterados". Confidence: medium.
- **Sev 3** · The address shifts from "tu" (`não vaciles, mas recorda`) to "vós" (`vede como`). Confidence: medium.
- **Sev 3** · `co-herdeiros` should be "coerdeiros" (post-2009 spelling). Confidence: high.

## concede-mihi (`content/practices/concede-mihi/manifest.json`)
- **Sev 4** · `esperante em Vós` is not idiomatic; use "esperando em Vós" or "confiante em Vós". Confidence: high.
- **Sev 4** · `corrigindo o próximo… edificando-o` breaks the run of adjectives around it. Confidence: medium.
- **Sev 4** · `toda paz`: the Latin *quies* means rest ("repouso"). Confidence: medium.

## christus-vincit (`content/practices/christus-vincit/flow.json`)
- **Sev 4** · `Tempos felizes tenham!` keeps the Latin word order. Better: "Tenham tempos felizes os remidos pelo Sangue de Cristo!" Confidence: medium-high.
- **Sev 4** · `Com alegria!` renders the threefold *Feliciter!* as one weak phrase. An acclamation is expected, such as "Felicidades!" three times. Confidence: medium.

## inviolata (`content/practices/inviolata/flow.json`)
- **Sev 4** · `E porta fulgente do céu,` has no verb (Latin *quae es effecta*). It should read "que fostes feita porta fulgente do céu". `Por vossas preces e rogos tão doces.` has a stray period mid-sentence. Confidence: high.

## consecration-to-our-lady (`content/practices/consecration-to-our-lady/flow.json`)
- **Sev 2 (low)** · `E como assim sou vosso` should be the received "E porque assim sou vosso". The closing "Amém." is missing. Capitals are inconsistent: Vós, Vos, vosso, Vossa. Confidence: medium.

## chaplet-st-michael (`content/practices/chaplet-st-michael/flow.json`), also in franciscan-crown
- **Sev 2** · `Senhor, socorrei-me e apressai-vos.` should be "Senhor, apressai-vos em socorrer-me" (or "Socorrei-me sem demora"). The same line is in `content/practices/franciscan-crown/flow.json`. Confidence: medium.
- **Sev 4** · `todo poderoso` should be "todo-poderoso", and `vossa igreja` should be "vossa Igreja". Confidence: high.

## grace-before-meals (`content/practices/grace-before-meals/manifest.json`)
- **Sev 2 (low)** · `e estes vossos dons que vamos receber da Vossa bondade` differs from the common form "e a estes dons que de vossa bondade vamos receber". Capitals are inconsistent. Confidence: medium.

## eternal-rest and de-profundis (both `manifest.json`)
- **Sev 2 (low)** · `entre os esplendores da vossa luz` is an older variant. The usual Brazilian form is "e a luz perpétua os ilumine", and "da vossa luz" drops "perpétua". Confidence: medium.

## guardian-angel (`content/practices/guardian-angel/flow.json`)
- **Sev 2 (low)** · `sempre me rege, guarda, governa e ilumina` is most often prayed as "me rege, me guarda, me governa e ilumina". This is a legitimate variant. Confidence: medium.

## fifteen-prayers-st-bridget (`content/practices/fifteen-prayers-st-bridget/flow.json`)
- **Sev 4** · `amantíssimo de todos os pecadores arrependidos` uses an adjective as a noun. Better: "amante misericordiosíssimo de…". Confidence: medium.
- **Sev 4** · `Ó caríssimo Senhor` (three times): in Brazilian church usage "caríssimo" is how you address people. For the Lord, "amantíssimo" or "dulcíssimo" fits. Confidence: medium.

## Checked with no issues
- divine-praises, eternal-father, divine-mercy-response, holy-god
- fatima-prayer: "da vossa misericórdia" is an accepted variant.
- hail-mary, hail-holy-queen, glory-be, magnificat, media-vita, lux-aeterna
- iesu-dulcis-memoria: consistent "tu".
- memorare-st-joseph, litany-humility, litany-holy-spirit, grace-after-meals
- the morning offerings (Carmelite, Dominican, Faustina, Montfort, Sulpician, Thérèse): the feminine forms in Faustina's come from her own voice.
- the Franciscan crown's seven joys
- lead-kindly-light: verse translation.

## Overall judgement
Only one finding is as crude as "embriagai-me": St Joseph's "consolo dos desgraçados", which reads as an insult in Brazil.

The most widespread problem is litany invocations translated from the English or Latin instead of taken from Brazilian books. The Sacred Heart litany is worst, with about eight invocations that differ from the received forms plus the ungrammatical "da cuja". Holy Name, Loreto, St Joseph, Saints and Precious Blood each have two to four such deviations.

The second problem is European Portuguese from Divinum Officium's Portuguese-from-Portugal translations. It is heavy in the Exsultet, which also has an OCR garble, and appears in the Gloria ("Unigénito") and Gloria laus ("aceites").

The rest are scattered grammar and register slips: "tu" mixed with "vós" in the Veni Sancte oration and the Franciscan collect, "levais" where the Litany of the Saints needs "leveis", and the broken participles in the Memorare.

Prayers taken directly from Brazilian sources are sound: Salve Rainha, Ave-Maria, Fátima, the Opus Dei Devocionário items and the body of the St Michael chaplet.

Fix first:
1. The litanies: replace them wholesale with the text of a Brazilian prayer book.
2. The Exsultet: respell in Brazilian norms and fix the OCR garble.
3. The Memorare.
4. The Veni Sancte oration.
5. "desgraçados".