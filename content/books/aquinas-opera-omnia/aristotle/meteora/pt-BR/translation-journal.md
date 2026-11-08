
## Termos

| forma substantialis | forma substancial | Princípio do conhecimento da essência do corpo. |
| cognitio quidditativa | conhecimento quiditativo | Conhecimento do que uma coisa é. |
| ratio | definição / razão formal | “Definição” nas comparações entre partes e todo; “razão formal” na contraposição à matéria. |
| aequivoce | em sentido equívoco | Aplicação de um mesmo nome a coisas que não conservam a mesma definição. |
| genitura / sperma / semen | sêmen | Uniformização das denominações presentes neste trecho. |

## Decisões

- Mantida a diferença entre as “fibras” do sangue no texto comentado e as “vias, isto é, poros” no comentário, assim como as afirmações divergentes sobre a coagulação do sêmen.
- Conservada a comparação segundo a qual a água queima mais que a fumaça, e a pedra mais que a água, sem substituir “fumaça” por “vapor”.
- Traduzido *syntecta* por “produtos da decomposição”, conforme sua apresentação como produtos de putrefação.

## Review log

### Part 1 of 3, Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Read g1-c001 to g2-c002 in full; two meaning fixes (clavis rendered as “prego” in g1-c003 [29], a distorted clause in g1-c016 [8]); the rest, including the audit flags and translator's notes, is sound.
- `pt-BR/g1-c003.md` [29]: “a faca está em potência no prego, e o prego na faca” → “a faca está em potência na chave, e a chave na faca” — source: cultellus est potentia in clavi, et clavis in cultello; clavis is “chave” (key), not “prego” (clavus, nail) *(meaning)*
- `pt-BR/g1-c016.md` [8]: “Além disso, mesmo admitindo a água que se produz e a que existe a cada dia, não se deve conceber o princípio dos rios como certas lagoas separadas sob a terra” → “Além disso, não se deve conceber o princípio dos rios como água que, já produzida, existe a cada dia, à maneira de certas lagoas separadas sob a terra” — source: non ea quae fit, sed existente aqua quotidie, non tale esse principium; Aristotle rejects water stored ready-made each day (cf. Thomas [128]), he does not concede both kinds of water *(meaning)*
- Rejected: mechanical audit, emphasis and parentheses flags — marker counts differ from the source — the PT repairs malformed source bolding (***x* **), adds italics for retained Greek (dali, aeges, hypeccauma, psecades) and replaces parentheses with dashes; no content was lost
- Rejected: pt-BR/g1-c008.md [4] — length outlier — checked clause by clause; complete, with no additions beyond what Portuguese syntax requires
- Rejected: pt-BR/g1-c011.md [27] — “**72.**” is bold while the source has a plain “72.” — the source bolding slip is normalized to the file's paragraph-number format
- Rejected: pt-BR/translation-journal.md Termos — rows (sêmen, fibras do sangue, syntecta) do not occur in part 1 — these match Meteorologica IV material, probably in g4-pr, which is outside this part; they cannot be judged false here
- Rejected: pt-BR/g1-c015.md [15] — “a água que se condensa rapidamente … torna-se quente” departs from Thomas's paraphrase — it is a defensible literal rendering of Calida autem fit cito constans aqua

### Part 1 of 3, Round 2 (codex, full read)
Verdict: 19 meaning-level, 1 minor. Leitura integral dos 19 capítulos, notas, metadados, diário e alertas: 18 correções de terminologia óptica, uma de quantificador e uma de concordância.
- `pt-BR/g1-c003.md` [29]: “a matéria comum de ambos é o ferro” → “a matéria comum de ambas é o ferro” — O pronome retoma dois substantivos femininos: faca e chave.
- `pt-BR/g1-c004.md` [20]: “raios ***refratados***” → “raios ***rebatidos***” — O próprio latim explica refractos por reverberatos: são raios refletidos pela terra, não refratados. *(meaning)*
- `pt-BR/g1-c008.md` [4]: “o ar que recebe uma refração” → “o ar que recebe uma reflexão” — Refractionem designa aqui a reflexão, explicada no comentário como repercussio luminis no ar adensado. *(meaning)*
- `pt-BR/g1-c008.md` [4]: “Pela refração, porém,” → “Pela reflexão, porém,” — O trecho trata expressamente de um speculum e da imagem nele recebida: trata-se de reflexão. *(meaning)*
- `pt-BR/g1-c008.md` [18]: “a saber, pela refração” → “a saber, pela reflexão” — Retoma a segunda causa, definida em [17] como repercussio luminis, isto é, reflexão da luz. *(meaning)*
- `pt-BR/g1-c008.md` [18]: “se dá a refração da luz” → “se dá a reflexão da luz” — O referente é a reflexão da luz no corpo que o próprio texto chama de espelho. *(meaning)*
- `pt-BR/g1-c009.md` [6]: “nossa visão é refratada em direção ao sol” → “nossa visão é refletida em direção ao sol” — A explicação em [20] diz que o raio visual repercutitur até o sol e que a umidade funciona como speculum. *(meaning)*
- `pt-BR/g1-c009.md` [21]: “fica oculto por mais tempo que quaisquer outras estrelas” → “fica oculto por mais tempo que algumas outras estrelas” — O latim diz quam aliquae aliae stellae, sem universalizar a comparação. *(meaning)*
- `pt-BR/g1-c009.md` [22]: “a visão refratada dos homens” → “a visão refletida dos homens” — Refractus retoma a repercussão da visão na umidade, já descrita no mesmo parágrafo como reflexão. *(meaning)*
- `pt-BR/g1-c010.md` [5]: “cabeleira em razão da refração” → “cabeleira em razão da reflexão” — Retoma a hipótese de Hipócrates: a umidade reflete o raio visual até o sol, funcionando como espelho. *(meaning)*
- `pt-BR/g1-c010.md` [7]: “uma refração de tal extensão” → “uma reflexão de tal extensão” — A objeção concerne ao percurso da visão refletida até o sol, não à refração entre meios. *(meaning)*
- `pt-BR/g1-c010.md` [24]: “em razão da refração da visão” → “em razão da reflexão da visão” — Refractionem visus retoma a reflexão no vapor descrito como espelho na exposição da hipótese de Hipócrates. *(meaning)*
- `pt-BR/g1-c010.md` [26]: “uma refração tão grande de nossa visão” → “uma reflexão tão grande de nossa visão” — O argumento discute a distância do percurso refletido da visão até o sol. *(meaning)*
- `pt-BR/g1-c011.md` [7]: “pela refração de uma cor dessa natureza” → “pela reflexão de uma cor dessa natureza” — O comentário em [32] explica esse fenômeno como reverberatio ad nubem, reflexão na nuvem. *(meaning)*
- `pt-BR/g1-c011.md` [8]: “certa refração, como o halo” → “certa reflexão, como o halo” — Em [34], a mesma hipótese é explicitamente chamada repercussio da visão em direção à estrela. *(meaning)*
- `pt-BR/g1-c012.md` [9]: “uma refração de nossa visão em direção ao sol” → “uma reflexão de nossa visão em direção ao sol” — O comentário em [30] explica que a visão seria repercutida pelas estrelas, tomadas como espelho. *(meaning)*
- `pt-BR/g1-c012.md` [10]: “em direção ao qual se dá a refração” → “em direção ao qual se dá a reflexão” — O argumento compara observador, espelho e objeto refletido; [34] chama esse percurso de repercussio visus. *(meaning)*
- `pt-BR/g1-c012.md` [11]: “a visão se refrate em direção ao sol” → “a visão se reflita em direção ao sol” — Trata-se da visão refletida em água e espelhos; [35] explica a dificuldade em termos de duas repercussiones. *(meaning)*
- `pt-BR/g1-c012.md` [12]: “nem uma refração.” → “nem uma reflexão.” — A conclusão retoma a hipótese da reflexão da visão pelas estrelas até o sol, assim explicitada em [36]. *(meaning)*
- `pt-BR/g1-c013.md` [4]: “por refração, aparece o halo” → “por reflexão, aparece o halo” — O comentário em [15] traduz o mecanismo por repercussionem radiorum: reflexão dos raios. *(meaning)*
- Rejected: pt-BR/g1-c003.md [16] — “Se transmutam em si mesmos” poderia sugerir que os elementos se transformam neles próprios. — No contexto da divisão, “em si mesmos” admite a leitura de elementos considerados em si, em contraste com sua participação nos mistos; não há erro inequívoco.
- Rejected: pt-BR/g1-c015.md [4] — “Lugares menos temperados” diverge de “lugares mais temperados” em [26]. — A divergência está no latim: intemperatioribus no texto comentado e magis temperatis no comentário. Não cabe harmonizá-los.
- Rejected: pt-BR/g2-c001.md [40] — Identificação do Cáspio com o mar Pôntico. — A identificação consta expressamente da fonte: quod est mare Ponticum. Não é um acréscimo da tradução.

### Part 1 of 3, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of g1-c001 to g2-c002 with notes, audit flags and journal: one optical term left as “refratada” in g1-c009 [6], one ambiguous genitive in g1-c012 [36]; the rest is sound.
- `pt-BR/g1-c009.md` [6]: “a visão dos homens não pode ser refratada em direção ao sol” → “a visão dos homens não pode ser refletida em direção ao sol” — visus hominum fractus ferri ad solem: Thomas [58] glosses it as visus hominum repercuti ab humore ad solem, a reflection; same correction round 2 made in [6] and [22], missed here *(meaning)*
- `pt-BR/g1-c012.md` [36]: “nem é a reflexão da visão das estrelas em direção ao sol” → “nem é a reflexão da visão pelas estrelas em direção ao sol” — repercussio visus a stellis ad solem: our sight reflected by the stars; “da visão das estrelas” reads as the stars' own vision
- Rejected: pt-BR/g1-c010.md [21] — “o cometa não é um único dos astros errantes” could mean “not a single one of” — with the premise of several comets appearing at once, the sentence reads as intended; defensible wording
- Rejected: pt-BR/g1-c005.md [34] — lemma “portanto, quanto a produzir” does not match the opening words of blockquote [8] — it renders the source lemma eius quidem igitur quod est fieri; abbreviated lemmas recur throughout and do not mislead
- Rejected: pt-BR/g1-c016.md [8], [10], [26] — “minações” for scaturigines — an attested word for water seeping from the ground, used consistently; a style choice

### Part 1 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os cinco parágrafos apresentados e a nota do tradutor; verificadas as duas correções, ambas corretas e sem novos defeitos no contexto mostrado.

### Part 2 of 3, Round 1 (claude, full read)
Verdict: 1 meaning-level, 5 minor. Read g2-c003 to g2-c010 in full against the Latin. Found broken spacing in 'vulturno'/'círcio' (5 fixes) and one misreadable sentence in c010 [97]; the audit flags are not defects.
- `pt-BR/g2-c010.md` [66]: “o vult ur no, que nasce” → “o vulturno, que nasce” — Vulturnus; spaces inside the word
- `pt-BR/g2-c010.md` [67]: “contrário ao cí r cio, porque” → “contrário ao círcio, porque” — Circius; spaces inside the word
- `pt-BR/g2-c010.md` [69]: “entre nós se chama cí r cio.” → “entre nós se chama círcio.” — Circius; spaces inside the word
- `pt-BR/g2-c010.md` [69]: “entre o vult ur no e o setentrião” → “entre o vulturno e o setentrião” — Vulturnus; spaces inside the word
- `pt-BR/g2-c010.md` [72]: “setentrião e cí r cio, que ficam” → “setentrião e círcio, que ficam” — Circius; spaces inside the word
- `pt-BR/g2-c010.md` [97]: “E aquecem o austro, o zéfiro e o euro” → “E produzem calor o austro, o zéfiro e o euro” — source: calefactivi sunt Auster, Zephyrus et Eurus; as written, the three winds read as the object being heated *(meaning)*
- Rejected: audit: parentheses differ (g2-c006 to g2-c010) — Source parentheses missing in PT — Each parenthetical is kept with its content, set off by dashes or commas; nothing dropped
- Rejected: audit: emphasis markers differ (g2-c010) — Bold-italic counts differ — Lemma spans were regrouped to match Portuguese word order, and italics were added for retained Greek terms (ourioi, sompham, achimos, sixis); no lemma lost
- Rejected: pt-BR/g2-c010.md [77] — Length outlier, 171% of source — Full and faithful rendering of the parenthesis and the seasonal list; no added content
- Rejected: pt-BR/g2-c010.md [156] — 'espumosas/espumoso' for spumosa where the sense is windy — The Latin source reads spumosa; the literal rendering is defensible and the commentary [198] glosses it
- Rejected: pt-BR/g2-c010.md [42] — 'nem ao tráscias, em G' where the diagram point is C — The source itself reads G; source errors are not corrected
- Rejected: pt-BR/g2-c009.md footnote [^7] — Identification of Canícula as Sírius and of its rising as the heliacal rising — Correct

### Part 2 of 3, Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos oito arquivos, com notas, metadados, diário e auditoria: duas correções de sentido.
- `pt-BR/g2-c010.md` [77]: “como *ourioi*, em direção ao mesmo ponto” → “como ventos favoráveis à navegação, em direção ao mesmo ponto” — Ourioi significa ventos favoráveis à navegação; o termo ficou sem tradução ou explicação, perdendo-se essa qualificação. *(meaning)*
- `pt-BR/g2-c010.md` [109]: “nem das regiões nem dos tempos em que ocorre esse fenômeno.” → “pois nem todas as regiões nem todos os tempos participam desse fenômeno.” — O latim afirma que o fenômeno não ocorre em todas as regiões nem em todos os tempos, restrição confirmada pelo comentário no parágrafo 137 e omitida na tradução. *(meaning)*
- Rejected: pt-BR/g2-c010.md [92] — Referências a solstícios de outono e de primavera. — O próprio latim diz 'solstitio autumnali' e 'solstitio vernali'; a tradução conserva a terminologia da fonte.

### Part 2 of 3, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g2-c010 [76]-[78] and [108]-[110] with footnotes: both previous fixes ([77] ourioi, [109] regions and seasons) are correct and the shown paragraphs have no defects.
- Rejected: pt-BR/g2-c010.md [77] — “ventos favoráveis à navegação” for *ourioi* — Correct: οὔριοι are fair winds for sailing (Meteor. II.6, 364b); the sentence's concord and its following clause are intact
- Rejected: pt-BR/g2-c010.md [109] — “nem todas as regiões nem todos os tempos participam desse fenômeno” — Matches *neque regiones, neque tempora quaecumque participant*: not any region or season whatever, so not all; the sentence reads correctly
- Rejected: pt-BR/g2-c010.md [77] — “retornos de verão” for *versiones aestivales* — A defensible rendering of the solstitial turnings, consistent with the parallel “os de inverno”; not a defect
- Rejected: pt-BR/g2-c010.md footnote [^8] — Spelling “Éuripo” instead of the usual “Euripo” — The note mirrors the body text's form, which was not shown in this delta; correcting only the note would make it inconsistent with the text it serves

### Part 3 of 3, Round 1 (claude, full read)
Verdict: 5 meaning-level, 21 minor. Read g3-pr.md and g4-pr.md in full: fixed a wrong work title, four fidelity errors (g4 [80], [134], [136], [201]) and 19 lemmas left in Latin in g4 [142]–[213].
- `pt-BR/g3-pr.md` [91]: “ou no livro Sobre a visão, isto é, na óptica geral” → “ou no livro Sobre o sentido, isto é, na óptica geral” — source: in libro de sensu; the title was changed to “Sobre a visão” *(meaning)*
- `pt-BR/g3-pr.md` [161]: “***aparece, pois, um arco-íris***” → “***apareceria então um arco-íris***” — lemma apparet utique iris is rendered in [127] and [154] as “apareceria então um arco-íris”; keep the quotation consistent
- `pt-BR/g4-pr.md` [8]: “a matéria dessas substâncias é a exalação” → “a matéria dessas substâncias é a evaporação” — source: evaporatio est materia praedictorum
- `pt-BR/g4-pr.md` [80]: “ou pela quantidade de frio naquilo que sofre *hepsesis*” → “ou pela grande quantidade presente naquilo que sofre *hepsesis*” — source: aut propter multitudinem quae in hepsesim patiente; “de frio” is added, and the commentary in [83] reads it as the quantity of moisture to be digested *(meaning)*
- `pt-BR/g4-pr.md` [134]: “O melhor ferro é aquele que necessita de menor purificação.” → “O melhor ferro é aquele que passou por menor purificação.” — source: quod habet minorem purificationem; the commentary in [143] reads it as ferrum minus purificatum *(meaning)*
- `pt-BR/g4-pr.md` [136]: “Tampouco é ressecado pela água, nem cozido em líquido pelo fogo” → “A água nele contida tampouco se resseca, nem é cozida em líquido pelo fogo” — source: Non desiccatur autem aqua, et neque elixatur ab igne; aqua is the subject (its water is not dried off), not the agent *(meaning)*
- `pt-BR/g4-pr.md` [201]: “Quando sai quente de um rio, porém, o úmido evapora” → “Quando o calor sai por ação do rio, porém, o úmido evapora” — source: a fluvio autem calidum exiens; the heat leaves because of the river, the amber does not come out of a river hot *(meaning)*
- `pt-BR/g4-pr.md` [142]: “***quaecumque quidem*** etc.” → “***entre as coisas compostas de terra e água*** etc.” — lemma left in Latin; earlier lemmas are quoted from the translated text, here [134]
- `pt-BR/g4-pr.md` [146]: “***quaecumque autem*** etc.” → “***entre as coisas coaguladas pelo calor seco*** etc.” — lemma left in Latin; quote the translated text of [135]
- `pt-BR/g4-pr.md` [147]: “***quaecumque autem mixta*** etc.” → “***todas as coisas que são misturas de terra e água*** etc.” — lemma left in Latin; quote the translated text of [137]
- `pt-BR/g4-pr.md` [148]: “***adhuc autem haec*** etc.” → “***além disso, algumas dessas coisas são solúveis*** etc.” — lemma left in Latin; quote the translated text of [138]
- `pt-BR/g4-pr.md` [156]: “***de coagulabili quidem igitur*** etc.” → “***já se falou anteriormente, em termos gerais, do coagulável*** etc.” — lemma left in Latin; quote the translated text of [152]
- `pt-BR/g4-pr.md` [169]: “***sunt autem liquabilium*** etc.” → “***entre as coisas fusíveis e infusíveis*** etc.” — lemma left in Latin; quote the translated text of [159]
- `pt-BR/g4-pr.md` [172]: “***sunt autem et haec quidem*** etc.” → “***alguns corpos são flexíveis*** etc.” — lemma left in Latin; quote the translated text of [160]
- `pt-BR/g4-pr.md` [174]: “***et haec quidem frangibilia*** etc.” → “***algumas coisas são quebráveis*** etc.” — lemma left in Latin; quote the translated text of [161]
- `pt-BR/g4-pr.md` [181]: “***impressibilium autem*** etc.” → “***entre as coisas impressíveis*** etc.” — lemma left in Latin; quote the translated text of [177]
- `pt-BR/g4-pr.md` [182]: “***sunt autem capibilia*** etc.” → “***são compressíveis*** etc.” — lemma left in Latin; quote the translated text of [177]
- `pt-BR/g4-pr.md` [183]: “***trahibilia autem*** etc.” → “***são extensíveis*** etc.” — lemma left in Latin; quote the translated text of [178]
- `pt-BR/g4-pr.md` [184]: “***sunt autem et haec quidem ductilia*** etc.” → “***algumas coisas também são dúcteis*** etc.” — lemma left in Latin; quote the translated text of [178]
- `pt-BR/g4-pr.md` [185]: “***sunt autem et haec quidem scissibilia*** etc.” → “***algumas coisas também são fendíveis*** etc.” — lemma left in Latin; quote the translated text of [178]
- `pt-BR/g4-pr.md` [188]: “***commassabilia autem*** etc.” → “***são aglomeráveis*** etc.” — lemma left in Latin; quote the translated text of [179]
- `pt-BR/g4-pr.md` [195]: “***exhalabilia autem*** etc.” → “***são exaláveis*** etc.” — lemma left in Latin; quote the translated text of [191]
- `pt-BR/g4-pr.md` [196]: “***ustibilia autem*** etc.” → “***parecem ser combustíveis*** etc.” — lemma left in Latin; quote the translated text of [192]
- `pt-BR/g4-pr.md` [213]: “***humidorum quidem igitur*** etc.” → “***portanto, entre os líquidos*** etc.” — lemma left in Latin; quote the translated text of [200]
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/g4-pr.md` [206]: “***qualia autem calida*** et cetera.” → “***quais corpos coagulados ou líquidos são quentes ou frios*** etc.” — lemma left in Latin, with “et cetera” instead of “etc.”; quote the translated text of [217]
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/g4-pr.md` [209]: “***humidorum quidem igitur*** et cetera.” → “***portanto, entre os líquidos*** etc.” — lemma left in Latin, with “et cetera” instead of “etc.”; quote the translated text of [200]
- Rejected: pt-BR/g4-pr.md [7], [196] — audit repeated words “despreza despreza” and “chama chama” — both are grammatical: “quem a despreza despreza a si mesmo”, “se chama chama”
- Rejected: pt-BR/g3-pr.md and g4-pr.md, audit parentheses flags — source parentheses rendered with dashes or commas — content is kept in every flagged paragraph; the punctuation change is a style choice
- Rejected: pt-BR/g3-pr.md [241] — “havia uma nuvem” conflicts with the question's premise non existente nube — the source reads et tamen erat nubes; a missing non is not an unmistakable OCR slip, so the translation follows the source
- Rejected: pt-BR/g4-pr.md [179] vs [188] — commassabilia defined in the text as keeping the compression and in the commentary as not keeping it — the contradiction is in the Latin source; both renderings are faithful
- Rejected: pt-BR/g3-pr.md [^10] — translator's note on halurgum glossed as subalbum — a factual note on a puzzling gloss in the text, not a doctrinal comment
- Rejected: pt-BR/g4-pr.md [184], [185], [188], [195] — Latin words kept inside the commentary (ut est dicere ad omne, adnatos, capturam mansivam, spiritus) — each is immediately glossed in Portuguese with “isto é”; a defensible way to quote the term

### Part 3 of 3, Round 2 (codex, full read)
Verdict: 3 meaning-level, 2 minor. Leitura integral dos 537 parágrafos, das três notas, do journal e de book.json: três defeitos de sentido e dois lemas ainda em latim; os alertas mecânicos não exigem correção.
- `pt-BR/g3-pr.md` [245]: “sendo A o semicírculo acima do horizonte” → “sendo A o hemisfério acima do círculo do horizonte” — O latim diz hemisphaerio, uma metade da esfera, não um semicírculo; a construção seguinte distingue a esfera de suas seções planas. *(meaning)*
- `pt-BR/g3-pr.md` [248]: “a mesma razão que Z, B e D” → “a mesma razão que D, B e Z” — A fonte enumera expressamente D B Z. A tradução inverte os termos extremos; mesmo que a construção anterior sugira essa inversão, não cabe corrigir silenciosamente a exposição da fonte. *(meaning)*
- `pt-BR/g3-pr.md` [253]: “***com efeito, sendo o semicírculo***” → “***com efeito, sendo o hemisfério***” — O lema hemisphaerio enim existente diz hemisfério, retomando a construção de [245]. *(meaning)*
- `pt-BR/g4-pr.md` [206]: “***qualia autem calida***” → “***quais corpos coagulados ou líquidos são quentes ou frios***” — O lema permanece em latim; deve retomar o texto traduzido em [217], conforme o padrão das demais remissões.
- `pt-BR/g4-pr.md` [209]: “***humidorum quidem igitur***” → “***portanto, entre os líquidos***” — O lema permanece em latim; deve retomar [200], como já ocorre em [213].
- Rejected: pt-BR/g3-pr.md [38] — “Antes de incendiá-los” poderia alterar o sujeito de antequam igniatur. — A referência aos corpos atingidos é sustentada pelo comentário em [45], que explicita antequam ipsa igniat; não há erro demonstrável.
- Rejected: pt-BR/g3-pr.md [99] — Extensão de 163% em relação à fonte. — A expansão explicita os sujeitos e as relações geométricas do latim conciso, sem acrescentar uma proposição nem omitir conteúdo.

### Part 3 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 10 minor. Read all of g3-pr.md and g4-pr.md against the Latin, with the notes, journal and book.json; found no fidelity errors, only ten lemmas that did not quote the translated text, now corrected.
- `pt-BR/g3-pr.md` [132]: “***como, porém, nem um círculo***” → “***que não é possível o arco-íris formar um círculo***” — lemma quoniam autem neque circulum; [245] reads “Que não é possível o arco-íris formar um círculo”; the lemma should quote the translated text
- `pt-BR/g3-pr.md` [133]: “***que, porém, nos menores***” → “***nos dias mais curtos***” — lemma quod autem in minoribus; [250] reads “nos dias mais curtos”; “nos menores” does not occur in the text
- `pt-BR/g3-pr.md` [140]: “***como, porém, a cor***” → “***por que a cor é assim***” — lemma quoniam autem color; [169] opens “Por que a cor é assim”; the lemma should quote the translated text
- `pt-BR/g3-pr.md` [160]: “***por isso, o arco-íris***” → “***por isso, a primeira refração do arco-íris***” — lemma propter quod iridis; [127] and [153] read “Por isso, a primeira refração do arco-íris”
- `pt-BR/g3-pr.md` [284]: “***produzem-se, porém, como dissemos***” → “***produzem-se, como dissemos***” — lemma fiunt autem sicut diximus; [265] and [268] read “Produzem-se, como dissemos”
- `pt-BR/g3-pr.md` [300]: “***produz, porém***” → “***todas essas coisas são produzidas***” — lemma facit autem; [292] reads “todas essas coisas são produzidas pela exalação vaporosa”; “produz, porém” does not occur
- `pt-BR/g3-pr.md` [302]: “***produz, porém, essas coisas***” → “***todas essas coisas são produzidas***” — lemma facit autem haec; quote the translated text of [292]
- `pt-BR/g4-pr.md` [22]: “***quanto às passivas***” → “***é preciso dizer quais são as espécies das qualidades passivas***” — lemma passivorum autem; [95] reads “É preciso dizer quais são as espécies das qualidades passivas”
- `pt-BR/g4-pr.md` [23]: “***uma vez que, a respeito dessas coisas***” → “***uma vez que se tratou dessas coisas***” — lemma quoniam autem de his; [223] reads “Uma vez que se tratou dessas coisas”
- `pt-BR/g4-pr.md` [117]: “***quanto à liquefação, porém***” → “***a liquefação ficará clara***” — lemma de liquefactione autem; [132] reads “A liquefação ficará clara”
- Rejected: pt-BR/g3-pr.md and g4-pr.md, titles of works — Titles such as Física, Sobre a alma and Metafísica are italic in some places and roman in others — The Latin source is equally irregular and the house rules do not require italics for titles; this is not an objective defect
- Rejected: pt-BR/g3-pr.md [281] — ab aere polito rendered as “bronze” and not as “ar” — The commentary pairs it with ferro and gives the example of soldiers' arms, so reading aes (bronze) is defensible
- Rejected: pt-BR/g3-pr.md [184] — “como diz a segunda suposição” cites the wrong supposition (it is the first) — The source says secunda suppositio; the translation follows the source
- Rejected: pt-BR/g4-pr.md [178] vs [184] — The text says ductile and impressible “se convertem”, while the commentary says the consequence does not convert — The disagreement is in the Latin; both renderings are faithful

### Part 3 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as dez alterações e lidos integralmente os parágrafos exibidos, as notas, o journal e book.json; nenhum defeito objetivo encontrado no material desta rodada.
