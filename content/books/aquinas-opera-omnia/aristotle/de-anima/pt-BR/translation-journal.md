
## Termos

| vegetabilis; vegetativus | vegetativo(a) | g3-c011. |
| augmentum, status, detrimentum | crescimento, estabilidade, declínio | g3-c011 [3], [18]. |
| corpus processivum; mansivum; manens | corpo progressivo; estacionário; que permanece | g3-c011 [5], [6], [32]-[37]. |
| excellentia; superfluitas (sensibilis) | excesso | g3-c011 [22]; g3-c012 [6]-[7], [20]-[22]. |
| medietas; medium (inter contraria) | meio-termo | g3-c011 [22]; g3-c012 [4], [14]. |
| immutatio; immutare | imutação; imutar | g3-c011 [23], [56], [64]; g3-c012 [12]. |
| salvari; salus animalis | conservar-se; conservação do animal | g3-c011 [8], [56], [61]. |
| delectabile et triste; delectatio et tristitia | deleitável e desagradável; deleite e desprazer | g3-c012 [10], [23]-[24]. |
| depulsio et ictus | embate e golpe | g3-c012 [6], [20]. |
| daemones | demônios | g3-c011 [38]. |
| Apuleius | Apuleio | g3-c011 [38]. |
| *De sensu et sensato* | *Sobre o sentido e o sensível* | g3-c012 [24]. |

## Decisões

- g3-c011 [13]: *mata est* lido como *mota est* (“é movida”), como o tem o comentário ([63]); *tinxerit* / *tingat* vertido “mergulhar algo na cera”, segundo a leitura de Tomás (cera liquefeita); *levis* vertido “liso”, não “leve”.
- g3-c011 [6], [36], [38]: *Quare enim non habebit?* mantido como pergunta no texto de Aristóteles; Tomás discute as leituras relativa e interrogativa, e a tradução “por que, com efeito, não o terá” admite ambas.
- g3-c012 [6]: *humor* vertido “sabor”, como o lê Tomás ([21]).
- g3-c012 [22]: *vita animal* lido como *vita animalis*.
- g3-c012 [8], [23]; g3-c011 [61]: *propter bene (esse)* vertido “em vista do bem” no texto e “em vista do bem-estar” no comentário.
- g3-c012 [13]: *impossibile est quod nullum elementorum sit* vertido “nenhum dos elementos pode ser”, desfazendo a dupla negação latina.
- Notas do tradutor: g3-c011 [^1] (Apuleio e a definição dos demônios, *De deo Socratis*, citada por Agostinho, *A Cidade de Deus*, VIII, 16); g3-c012 [^1] (alusão provável ao basilisco).

## Review log

### Part 1 of 3, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Read all 19 files of part 1 (g1-c001 to g2-c004), source beside translation; found two meaning defects in g1-c009 ('todo o corpo' for 'every body'; a mistranslated 'why') and one wrong cross-reference in a g1-c008 translator's note.
- `pt-BR/g1-c009.md` [9]: “E isso em todo o corpo, se de fato” → “E isso em qualquer corpo, se de fato” — source *Et secundum omne corpus* means 'in every body', as Thomas reads it in n. 140 (*in quolibet corpore erit animal*); in Portuguese 'todo o corpo' means 'the whole body' *(meaning)*
- `pt-BR/g1-c009.md` [13]: “que é aquilo que se corrompe quando a alma falta?” → “que é aquilo por causa do qual se corrompe, quando a alma falta?” — source *quid est propter quod corrumpitur* asks why it is corrupted, not what is corrupted *(meaning)*
- `pt-BR/g1-c008.md`: “(*tectonica*, n. [14] acima)” → “(*tectonica*, no texto de Aristóteles acima)” — the note points to 'n. [14]', an internal paragraph index the reader never sees; no numbered section 14 exists in this lecture (its sections run from 107 to 131)
- Rejected: pt-BR/g1-c007.md [37] — PT has 'o de IX em relação ao de VI' where the source reads *ad eum qui V.* — 9:5 is not sesquialtera and the hammer weights given are XII, IX, VIII, VI; this is an OCR slip for VI, so the translation's sense is correct
- Rejected: audit: emphasis and parentheses flags (all 37) — counts of markers and parentheses differ from the source — each case is merged bold spans, italics added for Latin, Greek or work titles, or dashes rendered as parentheses; no content was lost
- Rejected: audit: length outliers g1-c005 [3], [4], [48] — the PT runs to about 165% of the source's length — the source is elliptical Latin and each clause is translated completely; nothing was added
- Rejected: pt-BR/g1-c004.md [^1], g1-c009 [^1] and [^2], g1-c012 [^1], g2-c001 [^1] — factual claims in the translator's notes (Greek readings, fragment numbers, Dicaearchus, Cicero on *endelecheia*) — each claim checks against the Greek texts and standard references

### Part 1 of 3, Round 2 (codex, full read)
Verdict: 4 meaning-level, 6 minor. Leitura integral dos 19 arquivos apresentados, das notas, de book.json e do diário: 4 defeitos de sentido e 6 menores.
- `pt-BR/g1-c001.md` [6]: “é absolutamente e de todo dos mais difíceis” → “é absolutamente e de todo uma das coisas mais difíceis” — O partitivo latino difficillimorum exige aqui uma construção nominal completa em português.
- `pt-BR/g1-c001.md` [19]: “é absolutamente e de todo dos mais difíceis” → “é absolutamente e de todo uma das coisas mais difíceis” — Corrige a mesma construção incompleta na retomada do lema.
- `pt-BR/g1-c001.md` [24]: “os que existem por si mesmos” → “os que existem em vista de si mesmos” — Propter se ipsa indica finalidade intrínseca, não existência independente; a explicação seguinte é que honramos os fins. *(meaning)*
- `pt-BR/g1-c001.md` [24]: “as especulativas, por si mesmas” → “as especulativas, em vista de si mesmas” — Propter se ipsas contrapõe a finalidade das ciências especulativas à finalidade prática, propter opus. *(meaning)*
- `pt-BR/g1-c001.md` [37]: “é absolutamente e de todo dos mais difíceis” → “é absolutamente e de todo uma das coisas mais difíceis” — Corrige a mesma construção incompleta na retomada do lema.
- `pt-BR/g1-c003.md` [54]: “, são coisas contrárias e que não podem subsistir juntas” → “ envolve afirmações contrárias que não podem subsistir juntas” — O sujeito singular 'o fato de' não concorda com 'são coisas'; a correção conserva a incompatibilidade das afirmações.
- `pt-BR/g1-c007.md` [44]: “pode-se tomar várias séries” → “podem-se tomar várias séries” — Na construção passiva, o verbo deve concordar com o sujeito plural 'várias séries'.
- `pt-BR/g2-c001.md` [60]: “e a ela sobreviesse a alma” → “e a ele sobreviesse a alma” — Em superveniat ei anima, ei retoma o corpo previamente constituído, não a forma. *(meaning)*
- `pt-BR/g2-c004.md` [4]: “divididas, parecem viver e separadas umas das outras” → “divididas e separadas umas das outras, parecem viver” — Corrige a coordenação quebrada entre o infinitivo 'viver' e o particípio 'separadas', preservando divisa e separata.
- `pt-BR/g2-c004.md` [4]: “mas, em potência, em várias” → “mas, em potência, múltipla” — Potentia autem pluribus afirma que a alma é potencialmente múltipla, não que existe potencialmente em várias plantas; o comentário no n. 264 confirma isso. *(meaning)*
- Rejected: pt-BR/g1-c009.md [9] — 'Muito fácil de investigar' poderia parecer excessivo para multum investigabilis. — O comentário no n. 139 explicita valde manifestum e facile scire, sustentando a tradução.
- Rejected: pt-BR/g1-c013.md [17] — O '[não]' produz uma dupla negação problemática. — A tradução conserva exatamente o [non] editorial da fonte; suprimi-lo corrigiria a edição.
- Rejected: auditoria — linhas delectabile et triste e depulsio et ictus — As formas portuguesas indicadas não foram encontradas pela auditoria. — As duas linhas remetem a g3-c012, fora desta parte; os parágrafos fornecidos não permitem confirmar defeito nessas linhas.

### Part 1 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 5 minor. Full read of the 19 files of part 1 (g1-c001 to g2-c004), with notes, book.json and journal: no meaning defects; 5 minor defects, all cross-reference lemmas in g1-c006/g1-c007 that do not match the passages they cite.
- `pt-BR/g1-c006.md` [17]: “***transmitidos, porém, três modos***” → “***dos três modos transmitidos***” — lemma points to g1-c012 [3], which reads 'Dos três modos transmitidos'; the cited words do not occur there
- `pt-BR/g1-c006.md` [18]: “***como, porém, o conhecer é da alma***” → “***visto que é próprio da alma conhecer***” — lemma points to g1-c014 [3], which reads 'Visto que é próprio da alma conhecer' (also the lemma of g1-c014 [9]); the cited words do not occur there
- `pt-BR/g1-c006.md` [21]: “***muito mais irrazoável, porém, do que o que foi dito***” → “***mas, muito mais do que as coisas que foram ditas, é irracional***” — lemma points to g1-c011 [3], which reads 'Mas, muito mais do que as coisas que foram ditas, é irracional'; 'irrazoável' does not occur there
- `pt-BR/g1-c006.md` [24]: “***mais razoavelmente, porém, alguém duvidará***” → “***com mais razão, porém, alguém poderia duvidar***” — lemma points to g1-c010 [3], which reads 'Com mais razão, porém, alguém poderia duvidar' (also the lemma of g1-c010 [9]); the cited words do not occur there
- `pt-BR/g1-c007.md` [12]: “***há também uma outra opinião***” → “***outra opinião, porém, foi transmitida***” — lemma points to g1-c009 [3], which reads 'Outra opinião, porém, foi transmitida'; the cited words do not occur there
- Rejected: pt-BR/g1-c011.md [9] — translator inserted '[o corpo]' in square brackets, which this book uses for editorial brackets — the subject is implied by Aristotle's Greek; the clarification is defensible and does not misinform
- Rejected: pt-BR/g1-c012.md [29] — 'mais simples' for *simplicior* might seem to lose the sense 'more foolish' — 'simples' in Portuguese also means naive or simple-minded, so the sense is kept
- Rejected: pt-BR/g1-c003.md [36] — the double negative *licet non … non conveniant* is resolved as 'não concordem todos' — this is the only coherent reading, given that [37]–[38] go on to describe two groups of Pythagoreans

### Part 1 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as cinco alterações e lidos integralmente os parágrafos e as notas apresentados: nenhum novo defeito. Os alertas mecânicos remetem a trechos não exibidos e já avaliados no diário.

### Part 2 of 3, Round 1 (claude, full read)
Verdict: 0 meaning-level, 6 minor. Read g2-c005 to g2-c024 in full: one footnote marker missing (g2-c018 [^2]), one regency slip, three book titles drifting from Key Terms, one ungrammatical clause with an unitalicized Greek word.
- `pt-BR/g2-c005.md` [39]: “o tato é o sentido que discerne ***destas***” → “o tato é o sentido discretivo ***destas***” — source: sensus discretivus horum; “discernir” is transitive, so “discerne destas” breaks the regency
- `pt-BR/g2-c016.md` [24]: “no livro *Do sentido e do sensível*” → “no livro *Sobre o sentido e o sensível*” — Key Terms row: *De sensu et sensato* → *Sobre o sentido e o sensível*
- `pt-BR/g2-c021.md` [42]: “no livro *Do sentido e do sensível*” → “no livro *Sobre o sentido e o sensível*” — Key Terms row: *De sensu et sensato* → *Sobre o sentido e o sensível*
- `pt-BR/g2-c022.md` [19]: “no livro *Do sentido e do sensível*” → “no livro *Sobre o sentido e o sensível*” — Key Terms row: *De sensu et sensato* → *Sobre o sentido e o sensível*
- `pt-BR/g2-c018.md` [27]: “que é nome próprio de um lugar,” → “que é nome próprio de um lugar[^2],” — the chapter defines translator's note [^2] (on the Achelous) but no paragraph carries its marker; this is where Thomas names the place
- `pt-BR/g2-c020.md` [6]: “têm um phragma e, como um véu, as pálpebras, sem as mover nem retrair não se vê” → “têm um *phragma* e, como um véu, as pálpebras, e quem não as move nem retrai não vê” — source: quas aliquis non movens neque retrahens non videt; the PT clause has no connector and is ungrammatical; the retained Greek word should be in italics, as in [28]
- Rejected: pt-BR/g2-c016.md [6] — repeated word “soa soa” — renders sonans ad aliquid sonat: “o que soa soa contra algo”, so the repetition is the source's
- Rejected: pt-BR/g2-c021.md [6] — parentheses added — they mark the parenthetical clauses of the Latin period for clarity; no content is added or lost
- Rejected: pt-BR/g2-c005.md [4], [37] — “dulce et triste” / “delectabile et triste” rendered “doce e triste” / “deleitável e triste”, not the Key Terms “deleitável e desagradável” — here “triste” is Aristotle's lemma, which Thomas glosses himself (delectabile et dolorosum); keeping the lemma word preserves the gloss. The Key Terms row is located in g3-c012
- Rejected: journal Key Terms “depulsio et ictus” — audit counts 1 in source, 0 in pt-BR — the phrase does not occur in g2-c005 to g2-c024; the row concerns g3-c012
- Rejected: pt-BR/g2-c008.md [29] — “differenter” rendered “de modo indiferente” — the sense (instruments serve any form indifferently) requires indifferenter; the rendering follows the evident reading and is not a mistranslation
- Rejected: emphasis-marker audit flags (50) — counts of bold-italic markers differ — spot checks (g2-c006 [12], g2-c014 [31] among them) show lemma spans merged or split by Portuguese word order, with no lemma dropped

### Part 2 of 3, Round 2 (codex, full read)
Verdict: 6 meaning-level, 3 minor. Leitura integral das 20 lições, notas, auditoria, journal e book.json: 6 defeitos de sentido e 3 menores.
- `pt-BR/g2-c007.md` [6]: “não é possível que nenhum dos corruptíveis permaneça” → “nenhum dos corruptíveis pode permanecer” — O latim nega que qualquer corruptível possa permanecer numericamente o mesmo; a dupla negação portuguesa inverte essa afirmação. *(meaning)*
- `pt-BR/g2-c007.md` [48]: “não é possível que nenhum dos corruptíveis permaneça” → “nenhum dos corruptíveis pode permanecer” — “Nihil corruptibilium contingit ... permanere” significa que nenhum corruptível pode permanecer, não que seja impossível nenhum permanecer. *(meaning)*
- `pt-BR/g2-c014.md` [7]: “e assim seria o fogo ou a presença de algo semelhante no diáfano” → “e assim seria a presença do fogo ou de algo semelhante no diáfano” — “Presentia” rege tanto “ignis” como “huiusmodi alicuius”: trata-se da presença do fogo ou de outro corpo semelhante. *(meaning)*
- `pt-BR/g2-c017.md` [5]: “pois o animado não tem ar em toda parte, a parte que há de ser movida” → “pois a parte animada que há de ser movida não tem ar em toda parte” — A passagem descreve a parte animada que será movida; na tradução, “a parte que há de ser movida” ficou sintaticamente solto. *(meaning)*
- `pt-BR/g2-c018.md` [7]: “pois por esta parte os que andam com pés” → “pois nesta parte os que andam com pés” — “Hac ... parte” indica onde há mais calor, conforme as duas interpretações expostas nos números 474–475, não o instrumento que o produz. *(meaning)*
- `pt-BR/g2-c018.md` [10]: “mas os que dizem assim erram” → “mas os que dizem que os peixes respiram erram” — O comentário no número 478 explicita que o erro é afirmar que os peixes respiram. “Assim” remete, em português, à negação imediatamente anterior. *(meaning)*
- `pt-BR/g2-c021.md` [41]: “***o austero e o pôntico***, que se reduzem a um mesmo,” → “***o austero e o pôntico*** (estes dois se reduzem a um mesmo sabor),” — Completa a expressão truncada “a um mesmo” e explicita os dois referentes de “quae duo”.
- `pt-BR/g2-c023.md` [20]: “e é manifesto que os corpos ***que se tocam um ao outro na água é necessário*** que tenham entre si” → “e é manifesto que ***é necessário*** que os corpos ***que se tocam um ao outro na água*** tenham entre si” — Corrige o encadeamento sintático: “os corpos” é sujeito de “tenham”, dentro da oração dependente de “é necessário”.
- `pt-BR/g2-c024.md` [34]: “Outra lição traz “feret”,” → “Outra lição traz “*feret*”,” — A leitura latina conservada deve estar em itálico.
- Rejected: auditoria de ênfases — Contagens diferentes de marcadores de ênfase. — Os casos examinados refletem divisão ou reunião dos lemas, mudança de ordem, ênfase adicional ou correção da marcação, sem perda de conteúdo.
- Rejected: pt-BR/g2-c016.md [6]; pt-BR/g2-c021.md [6] — Repetição “soa soa” e parênteses acrescentados. — A repetição traduz “sonans ... sonat”; os parênteses delimitam explicações já presentes no latim.
- Rejected: journal: delectabile et triste; depulsio et ictus — Formas portuguesas da tabela não encontradas pela auditoria. — Em g2-c005, “triste” preserva o lema que Tomás explica; a linha sobre “depulsio et ictus” pertence a g3-c012, fora desta parte.

### Part 2 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of g2-c005 to g2-c024 against the Latin: 2 minor defects (an antecedent wrongly made feminine in g2-c009 [64], an incomplete comparison gloss in g2-c018 [36]); no meaning-level defects; audit flags and journal rows checked with no further issues.
- `pt-BR/g2-c009.md` [64]: “gerar outro tal ***qual ela mesma*** é” → “gerar outro tal ***qual ele mesmo*** é” — source: generare alterum tale quale ipsum est; ipsum (neuter) is the living thing that generates, as in [12] “um tal qual ele mesmo”, not the soul; the feminine “ela mesma” makes the vegetative soul the thing reproduced
- `pt-BR/g2-c018.md` [36]: “deve entender-se assim: que os outros animais;” → “deve entender-se assim: mais que os outros animais;” — source: intelligendum est: aliis animalibus, glossing “plus calorem aliis” as “more than the other animals”; the PT fragment “que os outros animais” leaves the comparison unstated
- Rejected: pt-BR/g2-c012.md [13] — per intentionem et disciplinam rendered “pela aplicação”; inventionem may be the intended reading — not an unmistakable slip in the edition; the rendering of the printed word is defensible
- Rejected: pt-BR/g2-c016.md [24] — *Da geração* where other files have *Sobre a geração* — no Key Terms row fixes this title; the sense is unchanged and the file is internally consistent
- Rejected: pt-BR/g2-c024.md [^1] — translator's note on fetet/feret may only restate the text — it supplies the meaning of the untranslated variant feret (“levará”), which the text does not give

### Part 2 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificados os dois ajustes, os seis parágrafos exibidos, suas notas e os campos pertinentes de book.json; nenhum novo defeito. Os alertas sobre trechos não exibidos permanecem cobertos pelas decisões anteriores.
- Rejected: pt-BR/g2-c009.md [64] — A primeira ocorrência de “ela mesma” permanece no feminino. — Nessa oração, o antecedente é “cada coisa”, corretamente feminino. Na passagem corrigida, “ele mesmo” remete ao ser que gera, apresentado como “algo” no parágrafo anterior.

### Part 3 of 3, Round 1 (claude, full read)
Verdict: 0 meaning-level, 5 minor. Read g2-c025 to g3-c012 in full; translation faithful and notes accurate; fixed an orphan footnote marker in g2-c028 and the immutare drift in g3-c006 [49].
- `pt-BR/g2-c028.md` [52]: “tomado de visão ou aparição, como abaixo se dirá)” → “tomado de visão ou aparição,[^3] como abaixo se dirá)” — the chapter defines [^3] (on *phantasia* and 'aparição') but no paragraph carries the marker; the note refers to the 'aparição' of this sentence
- `pt-BR/g3-c006.md` [49]: “***o ar***, modificado pela cor” → “***o ar***, imutado pela cor” — immutatus; Key Terms and the rest of the book render immutare as 'imutar'
- `pt-BR/g3-c006.md` [49]: “a pupila assim modificada, modifica ***outra coisa***” → “a pupila assim imutada, imuta ***outra coisa***” — immutata, immutat; Key Terms 'imutar'
- `pt-BR/g3-c006.md` [49]: “o ouvido, modificado pelo ar, modifica o sentido comum” → “o ouvido, imutado pelo ar, imuta o sentido comum” — auditus immutatus ab aere immutat; Key Terms 'imutar'
- `pt-BR/g3-c006.md` [49]: “em que terminam as modificações destes sentidos” → “em que terminam as imutações destes sentidos” — immutationes; Key Terms 'imutação'
- Rejected: pt-BR/g3-c011.md [12] — audit flag: repeated word 'altera altera' — 'o que altera altera permanecendo no mesmo lugar' is a relative subject followed by its verb; grammatical and faithful to 'unum manens in eodem loco alterat'
- Rejected: journal Key Terms — 'deleitável e desagradável' and 'embate e golpe' counted ×0 — both occur with articles ('do deleitável e do desagradável', g3-c012 [10]; 'um embate e um golpe', [6] and [20]); the rows are accurate
- Rejected: emphasis-marker flags (54) — bold-italic counts differ from source — spans split or merged by Portuguese word order; the sampled paragraphs are balanced and mark the same lemma words
- Rejected: pt-BR/g3-c004.md [^2] — Metafísica 'livro XI' glossed as Λ — correct: Thomas's numbering here cites Λ as XI; the passage is Λ 3

### Part 3 of 3, Round 2 (codex, full read)
Verdict: 8 meaning-level, 12 minor. Li integralmente os 18 capítulos, suas notas, o diário, book.json e os apontamentos da auditoria; encontrei 8 defeitos de sentido e 12 menores.
- `pt-BR/g2-c026.md` [40]: “e o visto em ato e a visão dele” → “e a vista em ato e a visão dela” — Visum é aqui o acusativo de visus, a faculdade da vista, cuja operação se percebe; não significa o objeto visto. *(meaning)*
- `pt-BR/g2-c026.md` [43]: “***do sensitivo está no sensitivo***” → “***do sensitivo estão no sensitivo***” — O sujeito composto, ligado por «tanto... quanto», exige o verbo no plural.
- `pt-BR/g2-c026.md`: “grego ψόφησις,” → “grego *ψόφησις*,” — A regra editorial exige itálico para o termo grego conservado.
- `pt-BR/g2-c026.md`: ““audição” (ἄκουσις)” → ““audição” (*ἄκουσις*)” — A regra editorial exige itálico para o termo grego conservado.
- `pt-BR/g2-c028.md` [7]: “Parece, porém, que o engano e a ciência dos contrários são o mesmo.” → “Parece, porém, que a ciência é a mesma para ambos os contrários, assim como o engano.” — Não se identifica a ciência com o engano: afirma-se que conhecer um contrário implica conhecer o outro, e analogamente quanto ao erro, como explica [42]. *(meaning)*
- `pt-BR/g2-c028.md` [42]: “***a ciência e o engano dos contrários parecem ser o mesmo***” → “***a ciência parece ser a mesma para ambos os contrários, assim como o engano***” — Eadem refere-se à identidade do conhecimento de ambos os contrários e, respectivamente, do engano acerca deles; não à identidade entre ciência e engano. *(meaning)*
- `pt-BR/g2-c028.md`: “é a μῆτις,” → “é a *μῆτις*,” — A regra editorial exige itálico para o termo grego conservado.
- `pt-BR/g2-c028.md`: “do grego φαντασία:” → “do grego *φαντασία*:” — A regra editorial exige itálico para o termo grego conservado.
- `pt-BR/g2-c028.md`: “verbo grego φαίνεσθαι,” → “verbo grego *φαίνεσθαι*,” — A regra editorial exige itálico para o termo grego conservado.
- `pt-BR/g2-c029.md` [12]: “Mas à opinião acompanha a crença” → “Mas à opinião é inerente a crença” — Corrige a regência de «acompanhar» e traduz diretamente opinioni inheret fides.
- `pt-BR/g3-c002.md`: “Aristóteles (τὸ μεγέθει εἶναι)” → “Aristóteles (*τὸ μεγέθει εἶναι*)” — A regra editorial exige itálico para a expressão grega conservada.
- `pt-BR/g3-c002.md`: “decalca τὸ τί ἦν εἶναι,” → “decalca *τὸ τί ἦν εἶναι*,” — A regra editorial exige itálico para a expressão grega conservada.
- `pt-BR/g3-c003.md` [14]: “e ***nenhum*** deles está ***em ato, antes de entender***” → “e não é ***nenhum*** deles ***em ato, antes de entender***” — O sujeito de nihil eorum est actu é o intelecto: ele não é em ato nenhum dos inteligíveis; não se afirma que nenhum inteligível esteja em ato. *(meaning)*
- `pt-BR/g3-c005.md` [5]: “que Cleon é branco” → “que Cléon é branco” — Falta o acento no nome português Cléon, já empregado em g2-c025.
- `pt-BR/g3-c005.md` [22]: “***que Cleon é branco, mas***” → “***que Cléon é branco, mas***” — Falta o acento no nome português Cléon.
- `pt-BR/g3-c005.md` [22]: “***que*** Cleon ***será***” → “***que*** Cléon ***será***” — Falta o acento no nome português Cléon.
- `pt-BR/g3-c010.md` [6]: “às vezes, porém, como a esfera, um apetite move o outro apetite” → “às vezes, porém, move a si mesmo, como a esfera: um apetite move o outro apetite” — A tradução omitiu movet se ipsum, «move a si mesmo». *(meaning)*
- `pt-BR/g3-c011.md` [33]: “está junto aquilo ***de onde nasceram*** para se nutrirem” → “está junto aquilo ***de que são naturalmente aptos*** a nutrir-se” — Nata sunt nutriri exprime aptidão natural para nutrir-se, não nascimento com a finalidade de alimentar-se. *(meaning)*
- `pt-BR/g3-c012.md` [7]: “porque é necessário que tenha só este” → “porque só este lhe é necessário” — Só o tato é necessário; não é necessário que o animal tenha exclusivamente tato. *(meaning)*
- `pt-BR/g3-c012.md` [22]: “enquanto ***é necessário*** que ***só este*** sentido esteja presente no animal” → “enquanto ***só este*** sentido ***é necessário*** ao animal” — Solum restringe quais sentidos são necessários, sem excluir a presença dos demais. *(meaning)*
- Rejected: pt-BR/g3-c007.md [27] — «Indivisíveis em potência» parece pedir «inteligíveis em potência». — A tradução reproduz indivisibilia do texto canônico; não há base suficiente para tratar a leitura da fonte como erro inequívoco de OCR.

### Part 3 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Read g2-c025 to g3-c012 in full against the Latin with the notes, journal and audit flags; one minor grammar fix in g2-c027 [39], no meaning-level defects.
- `pt-BR/g2-c027.md` [39]: “o princípio sensitivo como de um só ***termo por dois***” → “o princípio sensitivo como um só ***termo por dois***” — quasi uno termino pro duobus: the principle is used as one term for two; 'usar algo como de um só termo' is not grammatical
- Rejected: pt-BR/g3-c011.md [5] — 'aquilo de onde nasceram' differs from the lemma in [33] ('de que são naturalmente aptos a nutrir-se') — [5] renders the bare 'quod unde nata sunt' of the Aristotelian text faithfully. Thomas's gloss in [33] adds 'nutriri', which governs the round-2 rendering there.
- Rejected: pt-BR/g2-c026.md [3] — 'sentir pela vista que se vê' could be read as 'what is seen' — Impersonal 'que se vê' for 'quia videt' is acceptable, and the commentary in [23] makes the sense explicit.
- Rejected: translator's notes (g2-c028 [^1]-[^2], g3-c001 [^1]-[^2], g3-c005 [^1], g3-c006 [^1], g3-c011 [^1]) — factual claims checked — All are correct: μῆτις in Empedocles, Odyssey XVIII 136–137, Alexander and the 'praeparatio' thesis, Averroes, Vulgate Gn 1:11, διωκτόν/διώκει, and Apuleius as quoted in City of God VIII, 16.

### Part 3 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Verificados a alteração e os três parágrafos apresentados: a correção anterior está correta; encontrado um defeito gramatical menor.
- `pt-BR/g2-c027.md` [39]: “Tem, pois, este princípio sensitivo comum que conhece” → “Tem, pois, este princípio sensitivo comum a propriedade de conhecer” — Habet ... quod simul cognoscat atribui ao princípio a propriedade de conhecer simultaneamente. A construção «tem ... que conhece» ficou sem complemento gramatical adequado.
- Rejected: pt-BR/g2-c027.md [39] — A contagem dos marcadores de ênfase difere da fonte. — Os segmentos correspondentes a «inquantum igitur utitur» e «et separato» foram divididos pela ordem portuguesa; os marcadores estão equilibrados e preservam a ênfase.

### Part 3 of 3, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g2-c027 [38]-[40]: the round-4 fix in [39] is correct and fits its sentence; the paragraphs are faithful and grammatical; no defects.
- Rejected: pt-BR/g2-c027.md [39] — Round-4 change 'a propriedade de conhecer simultaneamente várias coisas' for 'quod simul cognoscat plura' — Faithful to the Latin, and it gives 'Tem' a proper object. The sentence and its 'enquanto … mas, enquanto' contrast stay intact.
- Rejected: pt-BR/g2-c027.md [39] — Emphasis-marker count differs from the source (52 vs 64) — Already rejected in round 4. The lemma spans are split by Portuguese word order, the markers are balanced, and the same words are emphasized.
- Rejected: journal Key Terms — Audit counts 'deleitável e desagradável' and 'embate e golpe' ×0 in pt-BR — Already rejected in round 1. Both renderings occur with articles in g3-c012, and neither falls in the paragraphs shown.
