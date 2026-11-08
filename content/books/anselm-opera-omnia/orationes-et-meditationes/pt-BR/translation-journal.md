
## Termos

| Martinus | Martinho | o71 |
| Benedictus | Bento | o72 |
| Dunstanus | Dunstano | o73 |
| Maria Magdalena | Maria Madalena | o74 |
| Psal. | Salmo (número da Vulgata, como na fonte) | o71–o74 |
| Joan. / Luc. / Math. | João / Lucas / Mateus | o71, o74 |
| Ezech. | Ezequiel | o73 |
| dux / ducatus | capitão / comando | o72 |
| sancta conversatio | santa conversão | o72 |
| gastrimargia / cenodoxia | gula / vanglória | o72, com nota |
| rector / regere | reitor / reger | o75 |
| vicarius | vigário | o75 |
| N. | N. | o75, nome do santo a inserir |

## Decisões

- o71 ¶4, ¶6, ¶13 e ¶15: o *Domine/domine* da fonte segue a capitalização de Migne: “Senhor” para Deus, “senhor” para Martinho. ¶15 *tu jubendo, tu consulendo* e *tu per concessionem, tu per intercessionem* “um… o outro”; o par seguinte com os vocativos “vós, Senhor… vós, Martinho”, como em o65 ¶15. *qui es benedictus in saecula* “que é bendito pelos séculos”, para não atribuir o *es* a Martinho.
- o71 erros do OCR lidos pelo sentido: ¶3 *migitet* = *mitiget*; ¶6 *eo um* = *eorum*; ¶7 *quanto tempore* lido *quanto tepore* (“em que tibieza”), pela série *tepore / stupore / torpore*; ¶10 *agitur* = *igitur*; ¶11 *os super me* = *est super me*. ¶5 a oração repetida *opera tua trahunt me ad intercessionem tuam* mantida como está.
- o71 ¶4 *Psal. II, 13* (o texto é de Joel 2:13) mantido como “Salmo 2:13”; o74 ¶6 *Joan. XX, 19* (o texto é João 20:15) e *Joan. XX, 13* mantidos como na fonte.
- o73 ¶6 *directam* lido *dilectam* (“amada”); ¶7 *viveret. mori*: o ponto do OCR lido como vírgula. o74 ¶6 *quia causam… narrare posset, nisi…* traduzido “só poderia narrar… interrompendo”, sem acrescentar o *non* que falta.
- o74 ¶7 *veritas* tratado como apelativo de Cristo (“ó Verdade”), em *vós*. o74 ¶4 *domino… et amico tuo* (Cristo) “Senhor”, apesar da minúscula de Migne. Palavras de Cristo a Maria Madalena em *tu*; de Maria ao jardineiro, em *tu*.
- o75 ¶3: o *Domine* de *fac, Domine…*, *Tu ergo, Domine*, *Non me gravet, Domine* e *non me impediant, Domine* segue a maiúscula de Migne (“Senhor”), embora o trecho possa dirigir-se ao santo. A repetição *fac, Domine, quod mihi injunctum est facere pro te* mantida; *imo fac non me, sed pro te* lido *non pro me*. ¶2 *tu orando, tu donando* “um orando, o outro concedendo”.
- Notas do tradutor: o72 [^1] (*Benedictus* / *benedictio*), [^2] (*gastrimargia* e *cenodoxia*, termos de Cassiano); o73 [^1] (quem foi Dunstano), [^2] (a visão na Ascensão de 988 e a morte a 19 de maio); o74 [^1] (identificação medieval de Maria Madalena com a pecadora de Lucas 7 e com Maria de Betânia); prologus [^1] (prólogo do próprio Anselmo à coleção).

## Review log

### Part 1 of 3, Round 1 (claude, full read)
Verdict: 2 meaning-level, 4 minor. Full read of m01–m16: added four missing footnote markers (m09 ×3, m11) and fixed two meaning slips (a lost conditional in m01 [14], the wrong subject of 'chorando' in m15 [5]); the rest is faithful and clean.
- `pt-BR/m09.md` [7]: “afadigava-se com o muito malefício.” → “afadigava-se com o muito malefício.[^1]” — footnote [^1] (satagebat circa frequens maleficium / Lucas 10:40) is defined in the file but has no marker in the text
- `pt-BR/m09.md` [17]: “cuja profundidade, a sabedoria insondável.” → “cuja profundidade, a sabedoria insondável.[^2]” — footnote [^2] (the four dimensions, Efésios 3:18) is defined but has no marker
- `pt-BR/m09.md` [18]: “na manhã do primeiro dia do sábado perpétuo,” → “na manhã do primeiro dia do sábado perpétuo,[^3]” — footnote [^3] (the three days) is defined but has no marker
- `pt-BR/m11.md` [2]: “e destrói a morte das almas.” → “e destrói a morte das almas.[^1]” — footnote [^1] (authenticity and Cur Deus homo) is defined but has no marker in the text
- `pt-BR/m01.md` [14]: “tirando consolo apenas do fato de a defender a consciência das boas obras” → “tirando consolo apenas de uma coisa: se a defender a consciência das boas obras” — source: inde solatium solum capiens, si eam bonorum operum conscientia defendit; the conditional 'si' was turned into a statement of fact *(meaning)*
- `pt-BR/m15.md` [5]: “quando o consolava, chorando sobre os seus joelhos, com as cantigas que podia” → “quando o consolava, chorando ele sobre os seus joelhos, com as cantigas que podia” — source: cum eum lacrymantem super genua sua… consolaretur; the child is weeping, but the gerund as written refers to the mother *(meaning)*
- Rejected: pt-BR/m14.md [6] — audit flag: repeated word 'ama ama' — 'A alma que não vos busca nem vos ama ama o mundo' is correct: the relative clause ends in 'ama' and the main verb is 'ama'
- Rejected: pt-BR/m06.md [3] — audit flag: parentheses (ut aiunt) dropped — rendered as the parenthetical ', como dizem,'; no content lost
- Rejected: pt-BR/m09.md [17], m15.md [8] [11] [18], m16.md [3] — audit flag: fewer emphasis markers — italic Scripture spans split by inquit/ait/enim were merged after moving the verb outside; every quotation is still italicized and complete
- Rejected: pt-BR/m14.md [9], m15.md [5] [17], m07.md [2] — wrong book in references (Jó for John 17, João 23 for Luke 23, Lucas 19 for John 19, Eclesiástico for Ecclesiastes) — these errors are in the Migne source, and the journal policy keeps source references as printed; none is an unmistakable OCR slip

### Part 1 of 3, Round 2 (codex, full read)
Verdict: 10 meaning-level, 20 minor. Leitura integral de m01–m16, notas, book.json, diário e auditoria: 10 correções de sentido e 20 correções menores de pontuação editorial.
- `pt-BR/m01.md` [2]: “Deus*.—Desperta” → “Deus*. Desperta” — Remove a pontuação composta transplantada da edição latina, conforme a regra editorial.
- `pt-BR/m01.md` [3]: “sem fim*.—Acaso” → “sem fim*. Acaso” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [4]: “dentro de nós*.—Mas” → “dentro de nós*. Mas” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [5]: “de Cristo*.—Desperta” → “de Cristo*. Desperta” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [6]: “de Cristo*.—E” → “de Cristo*. E” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [7]: “um só Cristo*.—Mas” → “um só Cristo*. Mas” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [8]: “todos estes bens*.—Mas” → “todos estes bens*. Mas” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [9]: “todos estes bens*.—Para” → “todos estes bens*. Para” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [10]: “do lamaçal*.—Que” → “do lamaçal*. Que” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [11]: “desta vida*.—Entretanto” → “desta vida*. Entretanto” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [13]: “da alma*.—Volto” → “da alma*. Volto” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [14]: “do corpo*.—Deus” → “do corpo*. Deus” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [15]: “à esquerda*.—E” → “à esquerda*. E” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m01.md` [16]: “à direita*.—Enquanto” → “à direita*. Enquanto” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m03.md`: “jogos de som entre palavras de mesma raiz” → “jogos de som entre palavras” — A nota inclui horrorem, terrorem e dolorem, que rimam, mas não têm a mesma raiz. *(meaning)*
- `pt-BR/m06.md` [6]: “vendo-se todavia criada por vós” → “vendo-a todavia criada por vós” — Videns tem como sujeito Cristo, a quem se dirige a súplica; é ele quem vê a criatura como criada por si. *(meaning)*
- `pt-BR/m07.md` [2]: “no mundo*.— Nada” → “no mundo*. Nada” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m07.md` [3]: “de Deus*.—Miserável” → “de Deus*. Miserável” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m07.md` [4]: “divinos*.—Ah” → “divinos*. Ah” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m07.md` [6]: “do pecado*.—Eu” → “do pecado*. Eu” — Remove a pontuação composta transplantada da edição latina.
- `pt-BR/m07.md` [6]: “desprezando tantos bens que me destes” → “vendo tantos bens que me destes” — Prospiciens significa vendo ou contemplando; o desprezo aparece depois, em spreto honore. *(meaning)*
- `pt-BR/m08.md` [6]: “e que não deixarei de achar junto de vós a fonte da vossa misericórdia” → “e que não desfalecerei junto de vós, fonte da vossa misericórdia” — Non deficiam significa não desfalecerei; fontem está em aposição a te, não é objeto de um verbo achar. *(meaning)*
- `pt-BR/m08.md` [9]: “na cruz do trabalho penal e da vossa misericórdia aceitável” → “na cruz do trabalho penal e aceitável à vossa misericórdia” — Poenalis e acceptabilis qualificam laboris; misericordiae tuae indica a quem esse trabalho é aceitável. *(meaning)*
- `pt-BR/m09.md` [11]: “a causa de toda a contrição, de toda a confusão” → “a causa de todo o sofrimento, de toda a confusão” — Contritio designa aqui o sofrimento infligido a Cristo, não arrependimento pelos pecados. *(meaning)*
- `pt-BR/m09.md` [12]: “pela contrição daquele homem amável” → “pelo sofrimento daquele homem amável” — Contritione refere-se ao padecimento físico de Cristo descrito no parágrafo, não à contrição penitencial. *(meaning)*
- `pt-BR/m13.md` [4]: “e neles vos temem esses príncipes” → “e nessas potestades vos temem esses príncipes” — In illis retoma as potestades angélicas nas quais os príncipes infernais temem o poder de Deus; neles aponta para os próprios príncipes. *(meaning)*
- `pt-BR/m14.md` [4]: “e conteis todas as coisas sem as rodear” → “e contendes todas as coisas sem as rodear” — Contines é do verbo conter: a forma de vós no presente é contendes. Conteis pertence ao verbo contar. *(meaning)*
- `pt-BR/m15.md` [11]: “Que ela dê tudo o que tem; de mim espere” → “Ela dá tudo o que tem; de mim espere” — Praestat é indicativo: Cristo afirma o que Maria oferece; somente exspectet expressa a exortação seguinte. *(meaning)*
- `pt-BR/m16.md` [1]: “meditação.—Dos benefícios presentes” → “meditação. Dos benefícios presentes” — Remove a pontuação composta transplantada da edição latina.
- `book.json`: “décima quinta meditação.—Dos benefícios presentes de Deus” → “décima quinta meditação. Dos benefícios presentes de Deus” — Mantém o título do sumário conforme o título corrigido de m16.
- Rejected: Auditoria: m06.md [3]; m09.md [17]; m15.md [8], [11], [18]; m16.md [3]; m14.md [6] — Diferenças de parênteses e itálicos; repetição de ama. — Confirmadas as decisões anteriores: o inciso foi preservado entre vírgulas, as citações continuam completas e destacadas, e os dois ama pertencem a orações distintas.
- Rejected: pt-BR/m07.md [13] — A afirmação de que odiar equivale a não poder parece incompatível com o contexto. — O segmento latino hoc est odisse, quod non posse está sintaticamente corrompido; não proponho reconstrução conjectural sem uma leitura segura da fonte.
- Rejected: pt-BR/m15.md [7] — Virgem poderia qualificar o Esposo, em vez de designar a destinatária. — Virginem também pode ser objeto de delectet, designando aquela a quem agrada seguir o Esposo; o tratamento da destinatária como virgem é sustentado pelo contexto.

### Part 1 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of m01–m16 against the Latin, with all translator's notes checked as claims of fact; no defects found this round.
- Rejected: pt-BR/m07.md [8] — 'beneficiis tuis debitis' rendered 'benefícios vossos imerecidos', the opposite of 'debitis' — Likely a slip for 'indebitis' (cf. 'tam indebitae gratiae tuae' in [6]); there is no secure alternative reading, so the rendering is left as it stands
- Rejected: pt-BR/m07.md [7] — 'Eu sou aquele fraquíssimo que me expus' / 'aquele homem que ... me entreguei': first-person agreement after 'aquele que' — Agreement with the personal pronoun is an accepted construction in Portuguese; not a grammatical error
- Rejected: pt-BR/m12.md [2] — 'Addamus, si placet' rendered 'se quiserem', with a plural addressee not in the text — Understandable and harmless; a style choice, not a mistranslation
- Rejected: pt-BR/m11.md [2] / m15.md [9] — 'Habacuque' in m11, 'Habacuc' in m15 — Both are standard Portuguese forms; each file is internally consistent
- Rejected: book.json toc m17 — pt-BR title still has the transplanted '.—' — m17 belongs to part 2; its heading must be fixed together with m17.md by that part's reviewer
- Rejected: audit: m06 [3], m09 [17], m15 [8] [11] [18], m16 [3], m14 [6] — Parentheses, emphasis-marker and repeated-word flags — Already rejected in rounds 1 and 2 with reasons; rechecked, no new argument

### Part 2 of 3, Round 1 (claude, full read)
Verdict: 0 meaning-level, 4 minor. Full read of m17–o28 (33 files): four minor fixes (two clitic forms; the transplanted “.—” in the m17 heading, in the file and book.json); fidelity and translator's notes checked out.
- `pt-BR/o06.md` [5]: “Tudo o que o Senhor quis, fez-o no céu” → “Tudo o que o Senhor quis, fê-lo no céu” — after a verb ending in -z the enclitic is -lo: “fê-lo”, not “fez-o”
- `pt-BR/o10.md` [12]: “Retirastes-na da vista” → “Retiraste-la da vista” — after a verb ending in -s the enclitic is -la (“retiraste-la”); “-na” applies only after nasal endings
- `pt-BR/m17.md` [1]: “décima quinta meditação.—Dos benefícios futuros de Deus” → “décima quinta meditação. Dos benefícios futuros de Deus” — source punctuation “.—” transplanted; m16’s parallel title uses “. ”
- `book.json`: “Meditação XVII. Ou terceira parte da décima quinta meditação.—Dos benefícios futuros de Deus” → “Meditação XVII. Ou terceira parte da décima quinta meditação. Dos benefícios futuros de Deus” — same transplanted “.—” in the toc; m16’s entry uses “. ”
- Rejected: pt-BR/o28.md [3] — audit flag: repeated word “nos nos” — “amando-nos nos criastes” is a correct gerund clitic followed by a clitic of the main verb
- Rejected: pt-BR/o10.md [4] — audit flag: length outlier 189% — a list of two-word Latin phrases, each rendered with article and preposition; nothing added or dropped
- Rejected: pt-BR/o10.md [13] — “não serão confundidos” adds a negation absent from *confundentur* — the Psalm (Vulgate *non confundentur*) and the contrast with *peribunt* show a dropped *non*; the reading follows the sense
- Rejected: pt-BR/o22.md [3] — *tua praesentia* rendered “a vossa paciência” — the passage repeats o20 [3], which has *tua patientia … toleravit*; “presence tolerated” makes no sense, so the reading by parallel text stands
- Rejected: pt-BR/m20.md [3] — *sicut gliris bastulam suam tenacitate infectam* rendered with “visco” and “bichinho” — a corrupt OCR passage with no secure reading; the rendering is a reasonable guess and keeps the image of sticky entrapment
- Rejected: audit: emphasis/parentheses counts (m17, m18, m20, o02, o06, o10, o15, o17, o19, o20, o22, o28) — italic and parenthesis counts differ from the source — each is a merged or split italic span around a non-italic word, the dropped OCR *t* in o19 [6], the Greek Θεοτόκος italicized per house rule, or a parenthesis added for *quod absit* / *quod verum est*; no content lost

### Part 2 of 3, Round 2 (codex, full read)
Verdict: 8 meaning-level, 12 minor. Leitura integral dos 33 capítulos de m17 a o28, com notas, metadados, journal e auditoria: 8 correções de sentido e 12 menores.
- `pt-BR/m17.md` [2]: “Mas quem concede aos seus no presente tanto quanto lhes guarda para o futuro?” → “Mas aquele que concede aos seus tantos bens no presente, quantos lhes reserva para o futuro?” — A construção «qui ... tanta ... quanta» pergunta pela grandeza dos bens futuros reservados por quem já concede tantos bens presentes; não pergunta quem concede quantidades iguais. *(meaning)*
- `pt-BR/m19.md` [2]: “do homem criado*.—Quando” → “do homem criado*. Quando” — Remover a pontuação editorial «.—» transplantada da fonte, conforme a regra da coleção.
- `pt-BR/m19.md` [4]: “qualquer homem*.—Assim” → “qualquer homem*. Assim” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m19.md` [7]: “essencialmente bom*.—Suavíssimo” → “essencialmente bom*. Suavíssimo” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m19.md` [10]: “seu Criador*.—Louva-vos” → “seu Criador*. Louva-vos” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m19.md` [12]: “seu Criador*.—Deus” → “seu Criador*. Deus” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m19.md` [13]: “às profundezas*.—O homem” → “às profundezas*. O homem” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m19.md` [14]: “o livre-arbítrio*.—Ó” → “o livre-arbítrio*. Ó” — Remover a pontuação editorial «.—» transplantada da fonte.
- `pt-BR/m21.md` [16]: “e prometeis receber, para que” → “e prometeis que receberemos, para que” — «Promittis accipere» retoma a promessa feita aos que pedem: eles receberão. A tradução faz de Deus o sujeito de «receber». *(meaning)*
- `pt-BR/m21.md`: “No texto aqui reproduzido o olho do copista saltou de um *panem* (“pão”) ao outro, e as palavras intermédias se perderam; a tradução segue o texto tal como está.” → “A tradução segue o texto latino aqui reproduzido.” — A comparação permite reconhecer a lacuna, mas não comprova que tenha sido causada pelo salto do olho de um copista. Retirar a explicação causal apresentada como fato.
- `pt-BR/o02.md` [11]: “me tornasse aplacável à vossa piedade” → “me tornasse aceitável à vossa piedade” — «Tuae redderet pietati placabilem» significa tornar o pecador novamente aceitável a Deus. «Aplacável» faz do pecador alguém cuja ira pode ser aplacada. *(meaning)*
- `pt-BR/o08.md` [2]: “para operardes a salvação da minha alma” → “para que eu operasse a salvação da minha alma” — Os membros são dados ao orante para que os empregue na salvação da própria alma; segue-se o contraste com o uso pecaminoso que ele fez deles. *(meaning)*
- `pt-BR/o10.md` [12]: “perto de vós não se demora a escassez nem do frio nem do calor” → “perto de vós não há sofrimento causado pelo frio nem pelo calor” — «Frigoris nec aestus ... penuria» designa a penúria causada pelo frio e pelo calor, entre os sofrimentos ausentes da bem-aventurança; não a escassez dessas condições. *(meaning)*
- `pt-BR/o15.md` [4]: “[ *al*. possum]” → “[ *al*. *possum*]” — A leitura latina conservada no aparato deve estar em itálico.
- `pt-BR/o15.md` [4]: “[ *al*. subita]” → “[ *al*. *subita*]” — A leitura latina conservada no aparato deve estar em itálico.
- `pt-BR/o15.md` [4]: “na cidadela das virtudes pelo suave odor delas, sinto” → “na cidadela das virtudes, sinto, em lugar do seu suave odor,” — «Pro suavi odore earum» contrapõe o odor das virtudes ao fedor dos vícios: sente este em lugar daquele. Não explica por que julgava estar na cidadela. *(meaning)*
- `pt-BR/o16.md` [6]: “e chorava longa e muito;” → “e chorava longamente e muito;” — «Diu» modifica o verbo; «longa» não funciona como advérbio nessa construção.
- `pt-BR/o18.md` [5]: “Em paz, nele mesmo, dormirei e repousarei” → “Em paz, ao mesmo tempo, dormirei e repousarei” — «In idipsum» é aqui uma locução adverbial de simultaneidade, não um pronome pessoal que signifique «nele mesmo». *(meaning)*
- `pt-BR/o19.md` [6]: “[ *al*., adducta tenebrarum]” → “[ *al*., *adducta tenebrarum*]” — A leitura latina conservada no aparato deve estar em itálico.
- `pt-BR/o23.md` [5]: “se preocupa com os outros.” → “se preocupa com os pecados dos outros.” — «Pro alienis» retoma «peccatis», em contraste com «de peccatis meis»: trata-se dos pecados alheios, não apenas das outras pessoas. *(meaning)*
- Rejected: pt-BR/m18.md [15] — A construção «Não permitais que esta alma ...; não mandeis ...» parece sintaticamente interrompida. — A interrupção e a retomada do pedido reproduzem «Non permittas ... non jubeas ... separari eam»; o sentido permanece recuperável.
- Rejected: pt-BR/m19.md [8] — «Nunca houve tempo em que não fôsseis» acrescenta uma negação ausente de «nunquam fuit quando fueris». — «Semper fuisti» e a repetida afirmação da existência eterna tornam inequívoca a falha textual; a tradução restitui o sentido do próprio contexto.

### Part 2 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of m17–o28 (33 files) against the Latin: one minor spelling fix (“em baixo” → “embaixo” in o16); fidelity, references, notes and audit flags check out.
- `pt-BR/o16.md` [5]: “jazer muito em baixo” → “jazer muito embaixo” — source *nimis deorsum jacere*; the Brazilian spelling of the adverb is one word, “embaixo”
- Rejected: pt-BR/o28.md [3] — audit: repeated word “nos nos” — “amando-nos nos criastes” is a gerund clitic followed by the main verb's clitic; correct
- Rejected: pt-BR/o10.md [4] — audit: length outlier 189% — a list of two-word Latin phrases, each rendered with article and preposition; nothing added or dropped
- Rejected: audit: emphasis/parentheses counts (m17, m18, m20, o02, o06, o10, o15, o17, o19, o20, o22, o28) — italic and parenthesis counts differ from the source — merged or split italic spans, Θεοτόκος italicized, apparatus readings italicized, and parentheses added for *quod absit* / *quod verum est* / the o28 aside; no content lost
- Rejected: pt-BR/o10.md [12] — “Retiraste-la” looks like a slip — vós form *retirastes* + *a* gives “retiraste-la”; correct
- Rejected: pt-BR/o17.md [6] — *discernis hoc rectum et justum esse* rendered “discernis se é reto e justo” — a literal “judge this to be right” would contradict the argument that follows; the rhetorical reading is sound
- Rejected: pt-BR/o20.md [4] — *Cur… te praesentem non transfixit gladius* recast as “não estavas presente, para que te traspassasse” — the surrounding lament about not having been present and the counterfactual *cum ferre non posses* support the reading
- Rejected: pt-BR/m20.md [3] — *quorum studio et tua pulchritudine illuminetur* rendered with “a tua beleza” as subject — the *et… et* correlation with *oculus… erigatur* supports reading *pulchritudo*; the passage is corrupt and the reading is reasonable
- Rejected: pt-BR/o10.md [12] — second *abscondisti* rendered “tirastes” — the repeated verb is a textual slip; *abstulisti* in the next sentence shows the intended contrast

### Part 2 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente o16 [4–6] e a nota do tradutor; a correção para «embaixo» está correta e não prejudica o contexto. Nenhum novo defeito encontrado.

### Part 3 of 3, Round 1 (claude, full read)
Verdict: 0 meaning-level, 3 minor. Full read of o29–o75 and the prologus, source beside translation. Only defect: the missing accent in 'sereníssima' at three places. Translator's notes (Fécamp, Pange lingua, Virago, Odo of Cluny, Mary of Egypt/Theophilus, Cassian, Stephen, Lawrence, Dunstan, Magdalene) check out.
- `pt-BR/o58.md` [4]: “Virgem serenissima, para que” → “Virgem sereníssima, para que” — source *serenissima*; Portuguese superlative needs the accent: sereníssima
- `pt-BR/o59.md` [3]: “Ó Virgem serenissima,” → “Ó Virgem sereníssima,” — source *serenissima*; missing accent: sereníssima
- `pt-BR/o60.md` [3]: “Virgem serenissima, santa Maria” → “Virgem sereníssima, santa Maria” — source *serenissima*; missing accent: sereníssima
- Rejected: pt-BR/o34.md [3], o43.md [3], o52.md [13], o68.md [9], o69.md [10] — emphasis-marker counts differ from the source — Portuguese word order splits or merges the italic Scripture spans; all quoted words are still italic and no quotation is lost
- Rejected: pt-BR/o37.md [3] — *in ulnas suas* kept in Latin (emphasis flag) — the source glosses its own word (*id est in brachia sua*); keeping the Latin preserves the gloss
- Rejected: pt-BR/o37–o39.md [1] — parentheses '( .)' dropped from the titles — empty OCR residue of a dropped note marker, with no content to translate
- Rejected: pt-BR/o40.md [95], [126] — space before punctuation — the lacuna dots reproduce the source exactly
- Rejected: pt-BR/o73.md [6] — length outlier, 161% of the source — every clause is present; the growth comes from the Portuguese rendering of the Latin participles
- Rejected: pt-BR/o46.md [3] — source *deprecor, Domine* rendered 'Senhora' — the whole prayer addresses Mary (*Filio tuo… cujus tu mater es*); *Domine* is an evident slip for *Domina*
- Rejected: pt-BR/o55.md [3] — *tam parvum* rendered 'tão perversa' — 'nothing so small that prayer cannot erase' is senseless; the reading *pravum* is the evident sense
- Rejected: pt-BR/o43.md [7], [8]; o66.md [2] — wrong source references (Joan. XXIII, 42; ibid. IX, 43; Matth. VIII, 2) — kept as in the source, consistent with the journal's policy for o71/o74

### Part 3 of 3, Round 2 (codex, full read)
Verdict: 10 meaning-level, 1 minor. Leitura integral dos 48 arquivos, das notas, do journal e dos campos pertinentes de book.json, com conferência da auditoria: 10 correções de sentido e 1 menor.
- `pt-BR/o46.md` [7]: “Milhares de centenas de milhares de homens” → “Mil vezes cem mil homens” — Millies centena millia significa mil vezes cem mil; a tradução altera o multiplicador. *(meaning)*
- `pt-BR/o47.md` [2]: “de todos os que creem naquele a quem ele nos mandou chamar pai.” → “de todos os que creem nele, que nos mandou chamá-lo pai.” — Se patrem indica que ele mandou chamar pai a si próprio; a tradução introduz outro referente. *(meaning)*
- `pt-BR/o52.md` [9]: “todo aquele que se volta para vós e é olhado por vós” → “todo aquele que é convertido por vós e é olhado por vós” — A te conversus exprime conversão operada por Maria, não o movimento de voltar-se para ela. *(meaning)*
- `pt-BR/o65.md` [10]: “a vida da justiça, pela qual perde a vida bem-aventurada” → “a vida da justiça e, com isso, perde a vida bem-aventurada” — Per quod retoma a perda da vida da justiça; não é a própria vida justa que faz perder a bem-aventurança. *(meaning)*
- `pt-BR/o65.md` [16]: “seja pela voz da vossa confissão.” → “seja pela voz da confissão de fé em vós.” — Confessionis tuae é a profissão de fé em Cristo pela qual ele reconhece o seu filho, não uma confissão feita por Cristo. *(meaning)*
- `pt-BR/o68.md` [3]: “e, dentre os que Deus ama, o mais rico nesse amor.” → “e o mais rico no amor por aqueles que Deus ama.” — Eorum dilectione quos diligit Deus designa o amor pelos que Deus ama, acrescentando o amor do próximo ao amor de Deus. *(meaning)*
- `pt-BR/o71.md` [5]: “Pois não podeis só estes, e não podeis aqueles.” → “Pois não é que possais só estes, e não aqueles.” — A negação abrange a limitação aos bens corporais; o autor afirma que Martinho também pode conceder os espirituais. *(meaning)*
- `pt-BR/o73.md` [7]: “Ó insigne e admirável graça de intimidade, a cuja vontade, só dela, cedem o voto e a vontade de toda a dignidade do alto!” → “Ó insigne e admirável graça de intimidade! À vontade de um só cedem o voto e a vontade de toda a dignidade do alto!” — Cujus solius voluntati refere-se à vontade de Dunstano, não a uma vontade da graça. *(meaning)*
- `pt-BR/o73.md` [7]: “aquela prefere que se faça o que não quer, antes que deixe de se fazer o que esta quer.” → “a assembleia celeste prefere que se faça o que ela não quer, antes que deixe de se fazer o que ele quer.” — O contraste é entre a vontade da assembleia celeste e a de Dunstano; os demonstrativos portugueses não permitem recuperar esses referentes. *(meaning)*
- `pt-BR/o74.md` [7]: “Mas vós me sois consciente, ó Verdade;” → “Mas vós conheceis a minha intenção, ó Verdade;” — Mihi conscia es significa que a Verdade conhece a intenção do orante, explicitada a seguir; 'me sois consciente' não exprime essa relação em português. *(meaning)*
- `pt-BR/o75.md` [3]: “Alcancemos por ele a vossa graça, por ele por meio de quem” → “Alcancemos a vossa graça por ele, por meio de quem” — Elimina a duplicação acidental de 'por ele' e mantém a relação entre per ipsum e per quem.
- Rejected: pt-BR/o40.md [175–176]; pt-BR/o46.md [4] — Marcadores de ênfase acrescentados. — Os itálicos assinalam palavras gregas ou latinas conservadas e explicadas nas notas: Soter, ousion, eleyson e virago.

### Part 3 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of o29–o75 and the prologus, source beside translation, with the audit flags and notes checked: 1 minor fix (wrong antecedent of 'cujo' in o30); round-2 fixes and translator's notes verified.
- `pt-BR/o30.md` [2]: “Entre estas coisas, Deus onipotente, imploro a balança da vossa piedade, cujo dia de vingança, acusando-me a consciência, muito temo: que não julgueis” → “Entre estas coisas, Deus onipotente, cujo dia de vingança muito temo, acusando-me a consciência, imploro a balança da vossa piedade: que não julgueis” — source *tuae… libramen pietatis imploro; cujus diem ultionis… pertimesco*: *cujus* refers to God, not to the balance; in the Portuguese, 'cujo' attached to 'balança/piedade' and gave the balance a day of vengeance
- Rejected: pt-BR/o65.md [12] — Paul addressed as 'Senhor' (capital) four times, though the file uses 'senhor' for him elsewhere — each occurrence opens a sentence, so the capital is required by sentence-initial capitalization; not a reverential inconsistency
- Rejected: pt-BR/o46.md [7] — *Propterea non tacebo* rendered 'Nem por isso me calarei' — both say the speaker will not keep silent after admitting he is the worst; a defensible reading of the logical link
- Rejected: pt-BR/o63.md [4] — 'Ele, contra aquele que o fez e refez' gives the devil a 'remaking' — follows the source as printed (*ille contra eum, qui se fecit et referit*); the likely missing clause is not restored by policy
- Rejected: pt-BR/o40.md [88] — 'meus' added in 'Assisti aos meus desejos' — makes explicit the speaker's desires already implied by the stanza; no change of sense
- Rejected: pt-BR/o73.md [^2] — date claim: Ascension 988, death Saturday 19 May — Julian Easter 988 fell on 8 April, so Ascension was Thursday 17 May and the following Saturday was 19 May; the note is correct

### Part 3 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificada a correção de «cujo» e lidos integralmente os dois parágrafos apresentados de o30.md contra o latim; nenhum defeito encontrado.
