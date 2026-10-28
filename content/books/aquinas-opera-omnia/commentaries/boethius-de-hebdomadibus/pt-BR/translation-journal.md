# Translation Journal — Comentário ao De Hebdomadibus de Boécio (pt-BR)

Source: la (latim, texto Leonino/Marietti em `la/`, canônico; `en-US/` serve apenas de referência secundária de terminologia e registro, conforme *Do Ente e da Essência*)
Target: pt-BR

## Key Terms

Vocabulário escolástico conforme os diários de *Do Ente e da Essência* e *Das Substâncias Separadas*.

| Latin | Português | Notes |
|-------|-----------|-------|
| esse / ipsum esse | ser / o próprio ser | Nunca "existência"; distinto de *ens*. |
| id quod est / quod est | aquilo que é | |
| ens | ente | |
| actus essendi / forma essendi | ato de ser / forma de ser | |
| esse simpliciter / esse aliquid | ser simplesmente / ser algo | |
| in eo quod est (sunt) | naquilo que é (são) | Fórmula-chave do tratado; nunca variada. |
| participare (aliquo) / participatio | participar (de algo) / participação | |
| substantialia bona | bens substanciais | |
| primum bonum / summum bonum | primeiro bem / sumo bem | |
| bonitas | bondade | |
| defluere / fluere | emanar | |
| communis animi conceptio | concepção comum da mente | *animo et cogitatione* (L. 4) → "pelo espírito e pelo pensamento". |
| per se notum | conhecido por si | |
| per se / per accidens | por si / por acidente | |
| ratio | noção / razão | Noção definicional (*ratio subiecti*, *ratio trianguli*); "razão" para causa/argumento e na locução *ratio boni* → "razão de bem". |
| intentio | intenção | Sentido lógico (conceito), L. 2. |
| appetere / appetibilis / appetenda | apetecer / apetecível | |
| omnis diversitas discors | toda diversidade é discordante | *discors* predicativo (deheb-c03 [12], [21], [60]). |
| hebdomades | hebdômadas | Grafia latina variável (*ebdomadas*/*hebdomadas*) unificada. |
| Boetius / Ioannes diaconus | Boécio / João, diácono | |
| Philosophus / Plato / Aristoteles / Socrates | o Filósofo / Platão / Aristóteles / Sócrates | |
| Ethica | *Ética* | "no I da *Ética*", como em *Dos Princípios da Natureza*. |
| prooemium | proêmio | |
| ibi | ali | Fórmula de divisão do texto. |

## Translation Decisions

- 2026-10-18: Tradução integral do latim, parágrafo a parágrafo, sem perguntas e sem agentes auxiliares. Conservados a numeração autoral em negrito (`**5**.`), os blocos `>` do texto de Boécio (inclusive os parágrafos 5, 19, 40, 55 e 64, que a fonte abre dentro do bloco), os lemas em negrito-itálico e as linhas de divisão sem número. As fórmulas citadas em latim são traduzidas, conforme *Do Ente e da Essência*.
- Os títulos dos arquivos latinos estão em inglês; vertidos para o português no mesmo formato ("L. 1 - Prefácio de Boécio"). "Prologue" → "Prólogo". O sumário do `book.json` usa os mesmos títulos; `name`, `author` e o `description` já existente recebem entrada pt-BR.
- Referências bíblicas com abreviaturas portuguesas e só o capítulo que o latim dá (Sb 8, Eclo 24, Eclo 32, Eclo 33, Pr 8), como em *Artigos 30*. O latim atribui *risus dolore miscebitur* a Eclo 33 (o inglês corrige para Pr 14,13); mantido como na fonte. As citações traduzem a redação latina.
- O lema do prólogo: *lude* → "brinca", *ludus* → "jogo", *ludens* (Pr 8) → "brincando", para que a glosa encontre as palavras citadas.
- Lemas de Boécio repetidos no comentário seguem a redação com que Tomás os cita (ex.: *harum autem duplex est modus* → "delas, porém, há dois modos"), mesmo quando diferem do bloco.
- L. 5, ¶69: o suplemento editorial `<esset album>` vira "⟨fosse branco⟩"; parênteses angulares tipográficos evitam que o markdown trate o trecho como tag HTML.
- O inglês acrescenta referências entre colchetes ([22], [7]…) e versículos que o latim não traz; não foram importados. A fonte não tem notas de rodapé; nenhuma nota do tradutor acrescentada.
- Deslizes de grafia do latim lidos sem alterar a fonte (não mudam o sentido): *relinquntur* (L. 1), *Omni compositio* por *Omni composito* (L. 2), *par exemplum* por *per exemplum* (L. 3).
- Edições da fonte: nenhuma.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of the prologue and L. 1–5: one wrong pronoun referent (c02 [3]), one unresolvable pronoun (c04 [27]), a wrong L. 4–5 location in the journal and a Key Terms row whose form does not occur.
- `pt-BR/deheb-c02.md` [3]: “de quão vivamente o abraçaste antes.” → “de quão vivamente abraçaste antes estas coisas.” — source: quam haec vivaciter fueris ante complexus. 'haec' is neuter plural (these matters). 'o' points to 'o caminho'. Thomas's gloss in [22] has 'as abraçou'. *(meaning)*
- `pt-BR/deheb-c04.md` [27]: “se se toma como estando nela por si aquilo que se põe” → “se se toma como estando por si em algo aquilo que se põe” — source: si per se accipiatur inesse quod ponitur… 'nela' has no feminine antecedent in the sentence.
- `pt-BR/translation-journal.md`: “*animo et cogitatione* (L. 4–5)” → “*animo et cogitatione* (L. 4)” — the phrase occurs only in L. 4 (deheb-c05 [2], [18]). L. 5 has *mente et cogitatione*, rendered 'pela mente e pelo pensamento'.
- `pt-BR/translation-journal.md`: “| diversitas discors | diversidade discordante | |” → “| omnis diversitas discors | toda diversidade é discordante | *discors* predicativo (deheb-c03 [12], [21], [60]). |” — the form 'diversidade discordante' does not occur in the text. The text uses 'toda diversidade é discordante' throughout.
- Rejected: pt-BR/deheb-c02.md [36] — repeated word 'todo todo' — Renders omne totum: 'todo' as determiner followed by 'todo' as noun. Grammatical and faithful.
- Rejected: pt-BR/deheb-c04.md [5]; deheb-c05.md [4], [23] — repeated word 'são são' — Relative 'que são' followed by the main verb 'são'. Grammatical.
- Rejected: straight quotes (c02, c03, c04, c05) — straight quotation marks — Each file uses straight quotes consistently. Quote style is not normalized.
- Rejected: emphasis-count flags (c02 [23], [35]; c03 [46]; c04 [14]; c05 [18], [23], [24], [26]; c06 [10], [16]) — number of emphasis markers differs from the source — Lemma spans are split or merged to follow Portuguese word order. No lemma is lost or misplaced.
- Rejected: pt-BR/deheb-c05.md [3], [19] — esse rendered 'existe' against the Key Terms row 'nunca existência' — Here the sense is existential (God exists). The row targets the noun esse in the metaphysical formulas.

### Round 2 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of prologue and L. 1–5 with book.json and journal: one meaning defect (misparsed conditional in the Boethius text, c05 [4]); journal and book.json correct.
- `pt-BR/deheb-c05.md` [4]: “não seriam a partir do bem e boas; e não seriam o mesmo que boas” → “não a partir do bem, e fossem boas, não seriam o mesmo que boas” — source: si ullo modo essent, non a bono ac bona essent; ac non idem essent quod bona. 'non a bono' and 'bona essent' belong to the protasis (Thomas's gloss in [24]: si aliquo modo essent non a primo bono et tamen in se essent bona); the PT made them a negated apodosis. *(meaning)*
- Rejected: pt-BR/deheb-c01.md [4] — 'basta-se a si mesmo mais do que qualquer outro' adds a comparison term not in 'magis ipsa sibi sufficiat' — The comparative is implicit and the next sentence draws the contrast with other works. The rendering makes it explicit without changing the sense.
- Rejected: pt-BR/deheb-c03.md [61] — 'temperamentum' rendered 'temperança' — In Portuguese 'temperança' also means moderation or balance. The physical sense of the passage stays clear.
- Rejected: pt-BR/deheb-c05.md [5] — 'potius' not rendered in 'nec potius viderentur sed videretur' — The corrective sense ('não "pareceriam", mas "pareceria"') is fully carried by the construction.
- Rejected: audit flags (straight quotes, repeated words, emphasis counts) — same flags as round 1 — Already rejected in round 1. No new argument.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of deheb-c05 [3]-[5]: the round 2 fix to [4] is correct against the Latin and Thomas's gloss, the neighbouring paragraphs are intact, and no new defects were found.
- Rejected: pt-BR/deheb-c05.md [4] — Round 2 fix: 'se de algum modo fossem, não a partir do bem, e fossem boas, não seriam o mesmo que boas' might misread 'non a bono ac bona essent' (other translators read it as an apodosis: 'they would be neither from the good nor good') — In this book Thomas's own gloss governs (c05 [24]: si aliquo modo essent non a primo bono et tamen in se essent bona). The fix matches that gloss and is grammatical; the second clause and the 'sed eis aliud esset esse aliud bonis esse' clause are both kept.
- Rejected: pt-BR/deheb-c05.md [4], [5] — audit flags: 'são são' and straight quotes — Already rejected in rounds 1 and 2: 'que são' + main verb 'são' is grammatical, and the file uses straight quotes consistently. No new argument.

### Round 5 (codex, full read)
Verdict: 3 meaning-level, 1 minor. Leitura integral dos 193 blocos, do book.json, do diário e dos apontamentos da auditoria: três correções de sentido e uma menor.
- `pt-BR/deheb-c03.md` [30]: “própria e por si” → “propriamente e por si” — O latim 'proprie' é advérbio que modifica 'dicitur'; requer 'propriamente'.
- `pt-BR/deheb-c05.md` [6]: “aquele que é o único bem” → “aquele que é somente bom” — 'Id quod solum bonum est' retoma aquilo que é somente bom e nada mais, conforme o parágrafo anterior. Não afirma que seja o único bem. *(meaning)*
- `pt-BR/deheb-c05.md` [26]: “aquele que é o único bem” → “aquele que é somente bom” — 'Id quod solum bonum est' significa aquilo que é somente bom, como explica a glosa seguinte: é a própria essência da bondade. 'O único bem' altera essa afirmação. *(meaning)*
- `pt-BR/deheb-c06.md` [4]: “mas a vontade do não branco não acompanhou tal propriedade” → “mas à vontade do não branco não se seguiu tal propriedade” — Em 'voluntatem ... non est comitata talis ... proprietas', a propriedade é o sujeito e a vontade é o objeto: a propriedade não acompanhou a vontade, e não o inverso. *(meaning)*
- Rejected: pt-BR/deheb-c06.md [18] — 'O ato que a justiça recebe' poderia parecer uma tradução errada de 'o ato a que a justiça se refere'. — O latim fornecido traz 'quem recipit iustitia', não 'respicit'. A tradução corresponde ao texto canônico; alterá-la exigiria uma emenda conjectural.

### Round 6 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c03 [29]–[31], c05 [5]–[7] and [25]–[27], c06 [3]–[5]: all four round-5 fixes are correct and their neighbours are intact; no new defects.
- Rejected: pt-BR/deheb-c06.md [4] — The fix 'à vontade do não branco não se seguiu tal propriedade' breaks the parallel with 'Acompanhou, pois, a vontade do bem que fossem boas', and 'ei' is not rendered — The fix gets the subject and object of 'comitata est' right. The parallel sentence before it reads correctly with its subject clause after the verb. 'ei' is carried by the subject of 'fosse branco'.
- Rejected: pt-BR/deheb-c05.md [6], [26] — 'aquele que é somente bom' could instead render 'id quod solum bonum est' as 'the only good' — Thomas's gloss in [26] ('in quantum scilicet est ipsa essentia bonitatis') and paragraph [5] ('tantum bonum aliudque nihil') support 'somente bom'. The grammar is sound in both places.
- Rejected: pt-BR/deheb-c05.md [27] — 'algo se diz sadio, porque algo se ordena' renders the second 'quo' as causal rather than as 'pelo qual' — 'quo' can be read as a causal ablative here. The comparison with 'medicinal' stays clear. It is a defensible reading that earlier full reads did not flag.
- Rejected: pt-BR/deheb-c05.md [26]; deheb-c03.md [30]; deheb-c05.md [5] — Audit flags: emphasis count and straight quotes — Rejected in rounds 1–3. Lemma spans follow Portuguese word order, and each file uses straight quotes consistently.

### Round 8 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 193 blocos, do book.json e do diário, com conferência da auditoria: uma correção menor de formatação; nenhum novo defeito de sentido.
- `pt-BR/deheb-c02.md` [9]: “"ekdidomi" [hebdomada]” → “"*ekdidomi*" [*hebdomada*]” — Os termos estrangeiros conservados devem estar em itálico, conforme a regra de formatação.
- Rejected: Auditoria mecânica: aspas, palavras repetidas e ênfases — Possíveis falhas indicadas pelos alertas mecânicos. — As aspas são consistentes; as repetições têm funções gramaticais distintas; as diferenças de ênfase acompanham a organização portuguesa. Sem novo argumento contra as decisões anteriores.

### Round 9 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of deheb-c02 [8]–[10]: the round 8 italics fix in [9] is correct and its neighbours are intact; no new defects.
- Rejected: pt-BR/deheb-c02.md [9] — Emphasis-count flag (source 6, pt-BR 10) after the round 8 fix — The four extra markers are the italics now placed on *ekdidomi* and *hebdomada*, retained Greek and Latin terms that the format rule requires in italics. Nothing is lost.
- Rejected: pt-BR/deheb-c02.md [8] — 'como se propuseres esta' could read as 'como se' (as if), which would need the imperfect subjunctive — The phrase parses as 'como, se propuseres esta: …', which renders 'veluti si hanc proponas' with a conditional in the future subjunctive. That is grammatical, and the example sense is clear from the colon and the main clause 'ninguém… o negará'.
- Rejected: pt-BR/deheb-c02.md [10] — 'in quo quidem libro' rendered 'e neste livro' — This paragraph continues the sentence of [9] after a semicolon, so a coordinating link is a faithful way to carry the relative connection.
