
## Termos

| qualitates primae tangibiles | qualidades primeiras tangíveis | Calor, frieza, umidade e secura. |
| materia prima / materia proxima | matéria primeira / matéria próxima | Distinção aplicada à matéria comum e à matéria determinada pelas formas e qualidades dos elementos. |
| sesquialtera | sesquiáltera | Proporção de três para dois. |
| Simplicius | Simplício | |
| Ptolomaeus | Ptolomeu | |
| seyn | *seyn* | Conservada a forma recebida; o próprio texto a explica como o movimento dos corpos levados para cima. |

## Decisões

- Conservado o único parágrafo de origem como um único bloco de citação, com as notas do tradutor após ele.
- Mantidos os lemas latinos acompanhados de glosa, entre eles *in genus respiciens*, *plumbo mineo*, *unde et quo*, *latas* e *una materia*; traduzidas as proposições meramente destacadas em itálico e os dois lemas finais em negrito e itálico.
- Acrescentada a nota `[^9]` para explicitar que a identificação da mina com o óbolo pertence ao texto recebido.
- Acrescentada a nota `[^10]` para explicar a proporção sesquiáltera no exemplo numérico.
- Acrescentada a nota `[^11]` para assinalar, sem emenda conjectural, “causa do vazio”, a comparação entre duas quantidades de ar e “desceria” no argumento sobre a diferença do leve.
- Conservadas outras leituras problemáticas, entre elas “número linear” para quatro, “leveza” no argumento atribuído a Temístio, “semelhança” na explicação das exalações de Demócrito, “não são bem divididos” e a força do contínuo “para ser dividido” na discussão final.

## Review log

### Part 1 of 5, Round 1 (claude, full read)
Verdict: 3 meaning-level, 4 minor. Read g1-c001 to g1-c015 in full against the Latin. Fixed a lemma rendering in g1-c015 that empties Tomás's gloss and his note on the variant reading, a garbled supposition in g1-c014, and four minor slips: an untranslated *aetherem*, two work titles not italicized, and one ungrammatical verb form.
- `pt-BR/g1-c015.md` [3]: “Também se pode tentar demonstrá-lo de modo mais lógico, assim.” → “Também se pode tentar demonstrá-lo de modo mais racional, assim.” — The source says *rationabilius*. Tomás glosses it in [11] as 'magis per viam logicam' and cites another, clearer version with *logice*. Rendering the lemma as 'mais lógico' makes that gloss tautological, and the comparison with the other version is lost. It also conflicts with the lemma in g1-c013 [24], 'De modo mais racional'. *(meaning)*
- `pt-BR/g1-c015.md` [11]: “***de modo mais lógico***, isto é, mais pela via lógica” → “***de modo mais racional***, isto é, mais pela via lógica” — The lemma is *rationabilius*. The gloss explains it as 'mais pela via lógica', so the lemma must not already say 'lógico'. *(meaning)*
- `pt-BR/g1-c014.md` [4]: “um agente alterante igual aquele que altera algo igual em tempo igual; um menor, porém, altera algo menor em tempo igual, e um maior, algo maior” → “que um agente alterante igual altere algo igual em tempo igual; um menor, porém, algo menor em tempo igual, e um maior, algo maior” — The source is *aequale quidem in aequali tempore aequale alterans*: an equal agent alters an equal thing. 'igual aquele' reads as 'igual àquele' (equal to that which alters), which distorts the supposition. *(meaning)*
- `pt-BR/g1-c004.md` [22]: “chamando o quinto corpo de *aetherem*” → “chamando o quinto corpo de éter” — *aetherem* is a Latin accusative left untranslated. Unlike g1-c007, nothing here depends on the Latin form.
- `pt-BR/g1-c006.md` [18]: “como fica claro no livro I da Física” → “como fica claro no livro I da *Física*” — The file italicizes *Física* everywhere else.
- `pt-BR/g1-c007.md` [14]: “conforme se diz nas categorias” → “conforme se diz nas *Categorias*” — The source *in praedicamentis* is the work's title. The book renders it *Categorias* elsewhere.
- `pt-BR/g1-c012.md` [11]: “Por conseguinte, resultar-se-á no mesmo impossível.” → “Por conseguinte, resultará o mesmo impossível.” — 'resultar' is not pronominal, so 'resultar-se-á' is ungrammatical. The source is *Quare idem erit impossibile*.
- Rejected: audit: parentheses and emphasis flags (g1-c001 to g1-c015) — The source's parentheses are replaced by dashes. Italics are added for *aethera*, *thein*, *aethein*, *totura* and *Física*. — The parenthetical content is kept in full in every flagged paragraph, so this is a consistent style choice. The added italics mark retained Greek or Latin words and a work title, which the house rules require.

### Part 1 of 5, Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Li integralmente g1-c001.md a g1-c015.md, suas notas, a auditoria, o diário e os metadados; encontrei três defeitos de sentido.
- `pt-BR/g1-c005.md` [24]: “ora, disse-se acima que a cada corpo simples corresponde um único movimento natural.” → “ora, disse-se acima que um mesmo movimento é natural a um único corpo simples.” — O latim atribui um movimento a um único corpo simples, premissa necessária para concluir a identidade de natureza dos corpos. A tradução apresenta a relação inversa. *(meaning)*
- `pt-BR/g1-c006.md` [34]: “à terra do que à água, com a qual concorda em uma qualidade, a saber, a secura.” → “à terra, com a qual concorda em uma qualidade, a saber, a secura, do que à água.” — O antecedente de «cum qua» é a terra: é com ela que o fogo compartilha a secura. A posição da oração portuguesa atribui essa qualidade à água. *(meaning)*
- `book.json`: “Tomás de Aquino comentou o Livro I e parte do Livro III antes de sua morte.” → “Tomás de Aquino comentou os Livros I e II e parte do Livro III antes de sua morte.” — A descrição omite o Livro II, também comentado por Tomás e presente no sumário com suas 28 lições. *(meaning)*
- Rejected: pt-BR/g1-c010.md [3] — G é identificado como centro, enquanto o comentário em [7] identifica A como centro. — A indicação «G [centro]» já consta do latim fornecido; a tradução a conserva. Não cabe corrigir apenas o português por conjectura.

### Part 1 of 5, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Read g1-c001 to g1-c015 in full against the Latin, with the notes, journal and book.json. One minor title-consistency fix in g1-c014; the round 1 and 2 fixes hold.
- `pt-BR/g1-c014.md` [36]: “como se diz no livro I de *Sobre a geração*” → “como se diz no livro I *Da geração*” — The source is *I De generat.* Everywhere else the book renders the work as *Da geração* (g1-c004 [12], g1-c006 [34], g1-c007 [13]); the title drifts here.
- Rejected: pt-BR/g1-c006.md [34] — Rechecked the round-2 fix that makes earth the antecedent of *cum qua*. — Fire (hot and dry) shares dryness with earth (cold and dry), not with water (cold and wet). The fix is correct.
- Rejected: pt-BR/g1-c014.md [4] — The stray marker “*Seja, pois,* Texto 64.” sits inside the sentence. — It mirrors the source's editorial marker “* Sit itaque * Text. 64.” in place. This is not a translation defect.
- Rejected: pt-BR/g1-c013.md [20] — The dash parenthetical opened before “pois no livro III da *Física*” is never closed. — It ends with the sentence, as the source parenthesis does. Portuguese needs no closing dash before a full stop.
- Rejected: audit: parentheses and emphasis flags — Parentheses become dashes, and italics are added for retained Greek or Latin words and work titles. — Round 1 already rejected these flags. The content is kept in full in every flagged paragraph; no new argument.

### Part 1 of 5, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Li integralmente os parágrafos [35]–[37] de pt-BR/g1-c014.md e a nota [^6]; a correção do título está adequada e não encontrei novos defeitos.

### Part 2 of 5, Round 1 (claude, full read)
Verdict: 3 meaning-level, 5 minor. Full read of g1-c016 to g2-c001 (16 files): fixed one recurring false friend ('de novo', two places), one misidentified premise, one ambiguous 'por acidente', a wrong lemma, a copied OCR dittography, a missing italic and a 'por que' for 'que'.
- `pt-BR/g1-c016.md` [3]: “Digamos agora por que tampouco é possível haver vários céus” → “Digamos agora que tampouco é possível haver vários céus” — source 'Quia ... dicamus' introduces what is to be shown ('that'), not a reason; Aquinas restates it as 'restat dicendum quod non est possibile'
- `pt-BR/g1-c016.md` [33]: “logo, também é falsa a primeira suposição, a saber, que há vários mundos” → “logo, também é falso o que se admitiu de início, a saber, que há vários mundos” — source 'primum est falsum' is the initial hypothesis (several worlds). 'primeira suposição' points the reader to the first of the three suppositions listed in [29], which is a different claim *(meaning)*
- `pt-BR/g1-c018.md` [13]: “mas são movidos pelo que remove o impedimento por acidente, e não por si” → “mas, pelo que remove o impedimento, são movidos por acidente, e não por si” — source 'a removente prohibens, per accidens et non per se': 'per accidens' qualifies the being moved, not the removing; the word order made it read as an accidental removal
- `pt-BR/g1-c021.md` [38]: “como se diz no livro IV da Física” → “como se diz no livro IV da *Física*” — the work title is italicized everywhere else in the file, including earlier in this paragraph
- `pt-BR/g1-c022.md` [34]: “onde diz: ***feito inteiramente, porém*** etc.” → “onde diz: ***que aquilo que foi feito se corrompa inteiramente*** etc.” — in 'totaliter autem factum corrumpi', 'totaliter' modifies 'corrumpi'; the lemma should match the text in g1-c023 [6] and [16]
- `pt-BR/g1-c023.md` [2]: “as outras duas opiniões, as outras duas opiniões apresentadas” → “as outras duas opiniões apresentadas” — the source has an OCR dittography ('aliae duae opiniones aliae duae opiniones'); the translation copied the repetition
- `pt-BR/g1-c023.md` [21]: “Platão diz não apenas que o céu foi feito de novo, mas também” → “Platão diz não apenas que o céu foi feito, tendo começado a existir, mas também” — Latin 'factum de novo' means newly made, with a beginning; Portuguese 'de novo' means 'again' *(meaning)*
- `pt-BR/g2-c001.md` [42]: “se algum movimento começa de novo, é necessário” → “se algum movimento começa quando antes não existia, é necessário” — Latin 'incipit de novo' means begins anew, as a new motion; Portuguese 'começa de novo' means 'begins again' *(meaning)*
- Rejected: mechanical audit, parentheses (23 flags) — source parentheses missing in pt-BR — each one was rendered as an em-dash aside or an equivalent clause with the content kept; this is a punctuation choice, not a loss
- Rejected: mechanical audit, emphasis (g1-c017 [15], g1-c021 [51], g1-c024 [7], g2-c001 [41]) — extra italic markers — they mark the retained Latin variant reading, the Greek terms (encyclia, euphtharton, thein, Theon) and similar, as the house rule requires
- Rejected: pt-BR/g1-pr.md [4], pt-BR/g2-c001.md [31], [42] — quotations from Aristotle, Boethius and Plato left in Latin — each has a translator's note giving an accurate Portuguese translation, so the reader loses nothing
- Rejected: pt-BR/g1-c020.md [4], [18], [20] — 'continuum/continuari' rendered as 'contíguo/contiguidade' — Aquinas states in [18] that the spheres do not form one continuous body; the rendering follows his gloss
- Rejected: book.json description pt-BR — says Books I and II, where en-US says Book I — pt-BR is correct: the commentary covers Books I and II and Book III up to lecture 8, as the toc shows

### Part 2 of 5, Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 16 arquivos apresentados, das notas, do journal, dos campos pt-BR de book.json e dos apontamentos mecânicos: dois defeitos de sentido.
- `pt-BR/g1-c024.md` [30]: “pois ser ou tornar-se impossível se diz de dois modos” → “pois algo se diz impossível de existir ou de vir a ser de dois modos” — Em 'impossibile esse seu fieri', existir ou vir a ser é o objeto da impossibilidade; não se trata de algo tornar-se impossível. *(meaning)*
- `pt-BR/g1-c026.md` [4]: “é impossível o triângulo ter dois ângulos retos” → “é impossível a soma dos ângulos do triângulo ser igual a dois ângulos retos” — 'Trigonum ... duos rectos habere' exprime abreviadamente a igualdade da soma dos ângulos a dois retos, como esclarece o comentário no parágrafo 35; não afirma que o triângulo possui dois ângulos retos. *(meaning)*
- Rejected: pt-BR/g1-c019.md [29] — O exemplo do círculo sem matéria sensível parece contradizer a afirmação imediatamente anterior. — A dificuldade já está no texto canônico: 'sicut si intelligamus circulum sine materia sensibili'. A tradução o reproduz; não cabe emendar a edição por conjectura.
- Rejected: pt-BR/g1-c027.md [3] — A negação de 'poder sempre existir' foi formulada como 'poder não existir sempre'. — O comentário no parágrafo 14 esclarece expressamente que a negação incide sobre 'sempre existir', não sobre a possibilidade. A tradução segue essa interpretação.

### Part 2 of 5, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g1-c024 [29–31] and g1-c026 [3–5]: both round-2 fixes are correct and the shown paragraphs are clean.
- Rejected: pt-BR/g1-c024.md [30] — Check of the round-2 fix 'algo se diz impossível de existir ou de vir a ser de dois modos' — Matches 'impossibile esse seu fieri dicitur dupliciter': being or coming to be is what is impossible. The sentence and the following 'De um modo… de outro modo' still read correctly.
- Rejected: pt-BR/g1-c026.md [4] — Check of the round-2 fix 'a soma dos ângulos do triângulo ser igual a dois ângulos retos', an expansion of 'duos rectos habere' — This is the standard sense of Aristotle's example, glossed so by the commentary. The parallel 'e que a diagonal é comensurável' and the dash aside stay intact.
- Rejected: pt-BR/g1-c024.md [29] — 'quasi non genitum' rendered '***ainda não gerado***', which adds 'ainda' — A literal 'não gerado' would merely repeat the rendering of 'ingenitum'. 'ainda' states the sense the passage gives ('quia nondum est generatum'), so this is a defensible choice, not a defect.
- Rejected: pt-BR/g1-c026.md [4] — Mechanical audit: source parentheses missing in pt-BR — The aside is rendered between em-dashes with its content kept; round 1 already rejected these flags as a punctuation choice.

### Part 3 of 5, Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Lidos todos os parágrafos de g2-c002 a g2-c016, com as notas e as marcas da auditoria. Corrigidos "equinócio" (que deve ser "equador") em g2-c011 [25] e uma frase ambígua sobre os corpos das esferas em g2-c013 [8].
- `pt-BR/g2-c011.md` [25]: “mais afastada dos polos e mais próxima do equinócio” → “mais afastada dos polos e mais próxima do equador” — O original diz "propinquior aequinoctiali", isto é, o círculo equinocial (o equador). "Equinócio" nomeia outra coisa. O próprio texto usa "equador" ou "círculo equinocial" nos outros lugares. *(meaning)*
- `pt-BR/g2-c013.md` [8]: “no céu existem não apenas corpos distintos dos astros, mas também das esferas” → “no céu existem como corpos distintos não apenas os astros, mas também as esferas” — O original diz "esse in caelo non solum corpora stellarum distincta, sed etiam sphaerarum": as esferas também são corpos distintos. A forma atual pode ser lida como "corpos diferentes dos astros e das esferas", o que inverte o argumento. *(meaning)*
- Rejected: pt-BR/g2-c014.md [11] — Palavra repetida "desse desse". — É o verbo "desse" seguido de "desse modo". A frase está gramaticalmente correta.
- Rejected: várias lições (auditoria de parênteses) — Parênteses do original trocados por travessões. — O conteúdo dos parênteses está preservado em todos os casos. A troca é escolha de estilo.
- Rejected: pt-BR/g2-c006.md [6], pt-BR/g2-c009.md [4] — Parágrafos marcados como muito mais longos que o original. — A extensão vem da explicitação das linhas geométricas e de construções em português. Não há conteúdo acrescentado.
- Rejected: pt-BR/g2-c010.md [41], pt-BR/g2-c012.md [14] — Itálicos sem correspondente no original. — Marcam o título de uma obra (*Sobre a alma*) e o termo grego *Stilbon*, como pede a regra da casa.
- Rejected: pt-BR/g2-c011.md [14] — "Heráclito Pôntico" seria Heráclides do Ponto. — O original diz "Heraclitus Ponticus". A tradução segue o texto e não corrige o autor nem a edição.
- Rejected: book.json description pt-BR — Diz "Livros I e II e parte do Livro III", enquanto a descrição em inglês diz "Book I and part of Book III". — A versão em português corresponde ao conteúdo da obra, que inclui o comentário ao Livro II.

### Part 3 of 5, Round 2 (codex, full read)
Verdict: 2 meaning-level, 6 minor. Lidos integralmente os 15 capítulos de g2-c002 a g2-c016, suas notas, os metadados, o diário e todos os alertas: encontrados 2 defeitos de sentido e 6 menores.
- `pt-BR/g2-c002.md` [50]: “no livro III da *Da alma*” → “no livro III de *Da alma*” — Corrige a regência diante do título iniciado por preposição.
- `pt-BR/g2-c003.md` [11]: “está de onde nascem os astros” → “está na parte de onde nascem os astros” — A construção locativa com 'está' exige explicitar o lugar; 'de onde' indica a origem do nascimento dos astros.
- `pt-BR/g2-c004.md` [26]: “no livro II da *Da alma*” → “no livro II de *Da alma*” — Corrige a regência diante do título iniciado por preposição.
- `pt-BR/g2-c004.md` [27]: “no livro II da *Da alma*” → “no livro II de *Da alma*” — Corrige a regência diante do título iniciado por preposição.
- `pt-BR/g2-c004.md` [40]: “no livro II da *Da geração*” → “no livro II de *Da geração*” — Corrige a regência diante do título iniciado por preposição.
- `pt-BR/g2-c004.md` [45]: “no livro II da *Da geração*” → “no livro II de *Da geração*” — Corrige a regência diante do título iniciado por preposição.
- `pt-BR/g2-c008.md` [18]: “não dividida em ato, de modo que nela se possam assinalar em ato um princípio e um fim.” → “sem uma divisão em ato que permita assinalar nela, em ato, um princípio e um fim.” — O latim nega uma divisão que permita designar princípio e fim. A oração consecutiva atual afirma que eles podem ser assinalados, contrariando o argumento. *(meaning)*
- `pt-BR/g2-c015.md` [14]: “segundo esse outro movimento, o planeta superior parece mover-se mais lentamente.” → “segundo esse atraso em relação ao primeiro movimento, o planeta superior parece mover-se mais lentamente.” — O relativo feminino 'secundum quam' retoma 'deficientiam a primo motu', não 'alium motum'. A tradução troca o antecedente do original. *(meaning)*
- Rejected: pt-BR/g2-c010.md [6], [56] — 'Mediante o atrito' explicita uma relação causal que o comentário posteriormente reconsidera. — O ablativo absoluto admite leitura causal, desenvolvida expressamente em [36]. A reconsideração em [56] pertence ao próprio argumento; não há erro inequívoco que justifique alterar a tradução.

### Part 3 of 5, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of g2-c002, g2-c003, g2-c004, g2-c008 and g2-c015: all eight fixes from the previous round are correct; no new defects in the shown paragraphs or footnotes.
- Rejected: pt-BR/g2-c015.md [14] — Whether 'secundum quam' should refer to 'alium motum', since in the retardation account the upper planet is actually faster — 'Quam' is feminine and can only refer back to 'deficientiam'. In that account the upper planet's smaller lag makes its own motion *seem* slower ('videtur'). The fix follows the grammar and the argument.
- Rejected: pt-BR/g2-c008.md [18] — 'sem ruptura, sem uma divisão' repeats 'sem' — The repetition is deliberate and keeps the gloss of 'infrangibilis' clear. The negated consecutive clause now matches 'non divisa in actu, ut possit…'.
- Rejected: pt-BR/g2-c003.md [11] — Fix 'está na parte de onde nascem os astros' adds a word — 'Na parte' only supplies the place that 'unde ortus astrorum' implies after 'está'. No content is added.

### Part 4 of 5, Round 1 (claude, full read)
Verdict: 4 meaning-level, 2 minor. Full read of g2-c017 to g3-c007: four meaning fixes (a quo, de novo, ex quibus causantur, non oportuit) and two italics-consistency fixes; audit flags reviewed and dismissed.
- `pt-BR/g2-c021.md` [30]: “não era necessário atribuir-lhe um sentido manifestamente contrário à intenção de Platão” → “não convinha arrastar seu significado para um sentido manifesto, contrário à intenção de Platão” — source: non oportuit significationem eius trahere ad manifestum sensum contra intentionem Platonis; 'non oportuit' is 'should not', not 'was not necessary', and 'manifestum' qualifies the sense, not the contrariety *(meaning)*
- `pt-BR/g2-c022.md` [33]: “por que seria sustentada a água?” → “o que sustentaria a água?” — source: a quo sustentaretur aqua; asks by what the water is held up, not why *(meaning)*
- `pt-BR/g2-c027.md` [20]: “tivesse sido gerada do nada que era antes” → “tivesse sido gerada como algo novo” — source: terra esset generata de novo; 'de novo' means newly generated, not generated from nothing *(meaning)*
- `pt-BR/g3-c001.md` [18]: “dos quais recebem sua causalidade” → “pelos quais são causados” — source: ex quibus causantur; the mixed bodies are caused by the simple bodies, they do not receive causality from them *(meaning)*
- `pt-BR/g2-c018.md` [62]: “no livro II de Sobre a alma” → “no livro II de *Sobre a alma*” — the same title is italicized in [61] of this file; keep the file consistent
- `pt-BR/g3-c007.md` [38]: “no livro VIII da Física, depois” → “no livro VIII da *Física*, depois” — *Física* is italicized everywhere else in this file
- Rejected: parentheses flags (g2-c018, g2-c019, g3-c003–g3-c007) — source parentheses missing in PT — the content is kept and set off with commas or dashes; nothing is lost
- Rejected: emphasis flags (g2-c018 [32], g2-c020 [4], g2-c021 [3] [24], g2-c025 [6], g2-c028 [4]) — extra italics — retained Greek terms (euechia, antichthona, trichos, amphicurtos) are italicized per house rule
- Rejected: length outliers g2-c024 [3], g2-c026 [9], g3-c003 [12] — PT much longer than source — the length comes from expanding elliptical Latin (e.g. 'aeris' as bronze vessel); no content is added
- Rejected: pt-BR/g2-c017.md [24] — qualitatem motuum rendered 'natureza dos movimentos' — defensible rendering; the sense is unchanged
- Rejected: book.json description pt-BR — says Books I and II, unlike en-US — pt-BR is the factually correct statement; the commentary covers Book II in full

### Part 4 of 5, Round 2 (codex, full read)
Verdict: 5 meaning-level, 1 minor. Leitura integral dos 19 capítulos, notas, metadados e alertas: cinco correções de trechos latinos sem tradução e uma correção verbal; alertas mecânicos sem defeitos adicionais.
- `pt-BR/g2-c021.md` [25]: “mas *quemadmodum in Timaeo scriptum est*” → “mas *como está escrito no Timeu*” — A segunda formulação da comparação ficou em latim, sem tradução. *(meaning)*
- `pt-BR/g2-c021.md` [31]: “a expressão *et moveri*” → “a expressão *et moveri* (“e mover-se”)” — A expressão cuja interpolação se discute precisa de tradução; conserva-se o latim para identificar a leitura. *(meaning)*
- `pt-BR/g2-c021.md` [32]: “*quemadmodum in Timaeo scriptum est*” → “*como está escrito no Timeu*” — A citação ficou em latim, sem tradução. *(meaning)*
- `pt-BR/g2-c021.md` [32]: “*revolvi et moveri*” → “*girar e mover-se*” — Traduz a primeira expressão cuja relação com a referência ao Timeu está sendo discutida. *(meaning)*
- `pt-BR/g2-c021.md` [32]: “*quod sit super statutum polum*” → “*que esteja sobre o polo fixo*” — A expressão que constitui a conclusão do argumento ficou inteiramente sem tradução. *(meaning)*
- `pt-BR/g2-c024.md` [19]: “a terra se moveria para algum lugar, porque então” → “a terra se movesse para algum lugar, porque então” — A oração está subordinada a “parece necessário que”, que exige aqui o subjuntivo, mantendo a hipótese expressa pelos verbos anteriores.
- Rejected: pt-BR/g2-c021.md [32] — Possível correção de “Heráclito do Ponto” para “Heráclides do Ponto”. — O texto canônico traz “Heraclitus Ponticus”; a tradução preserva a identificação recebida, que não cabe emendar por conjectura.
- Rejected: pt-BR/g2-c025.md [8] — “Exclui” parece inverter o latim “necessarium solum accidere”. — O demonstrativo retoma a proposição negativa anterior: o todo não se move para um único ponto. O comentário em [23] confirma expressamente essa interpretação com “hoc solum removebatur”.

### Part 4 of 5, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of g2-c017–g3-c007 against the Latin: one minor fix (italicize *Quadripartido* in g2-c018 [58]); no meaning-level defects found.
- `pt-BR/g2-c018.md` [58]: “segundo Ptolomeu no Quadripartido, as coisas” → “segundo Ptolomeu no *Quadripartido*, as coisas” — source: secundum Ptolomaeum in quadripartito; a work title, and every other cited work in this file (*Física*, *Metafísica*, *Ética*, *Sobre a alma*) is italicized
- Rejected: pt-BR/g2-c020.md [23], [26], [27] — Lemmas (‘hesitar … portanto’, ‘acerca da permanência’, ‘acerca da figura’) do not match the wording later used for the same Latin in g2-c021 [3], [7] and g2-c022 [3] — Each lemma renders its Latin correctly and the passage is identifiable; the mismatch is a cross-file wording difference, not a fidelity error
- Rejected: pt-BR/g2-c021.md [24], [25], [32]; g2-c026 [28] — Timeu and Fédon not italicized while other titles are — Plato's dialogues are consistently left in roman throughout these files; the files are internally consistent
- Rejected: pt-BR/g3-c007.md [3] — ‘inclinationem et gravitatis et levitatis’ rendered ‘de peso ou de leveza’ — The claim is that some bodies have heaviness and some lightness, as [7] and [12] confirm; ‘ou’ conveys that sense
- Rejected: pt-BR/g3-c003.md [3] — ‘abalar seus princípios’ adds a possessive object not in ‘movere’ — The antecedent is the mathematical sciences just named, which matches the commentary in [20]; the meaning is unchanged
- Rejected: audit flags (parentheses, emphasis, length) in g2-c018 to g3-c007 — Count differences — Re-checked: parentheticals are kept as commas or dashes, extra italics are retained Greek terms or glosses, and long paragraphs expand elliptical Latin with nothing added

### Part 4 of 5, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos [57]–[59] e verificada a alteração em [58]; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/g2-c018.md [58] — O número de marcadores de ênfase difere do original. — O acréscimo corresponde ao itálico de Quadripartido, título de obra; a correção é adequada e não altera o conteúdo.

### Part 5 of 5, Round 1 (claude, full read)
Verdict: 4 meaning-level, 4 minor. Full read of g3-c008 and g4-pr: fixed three dangling footnote markers, two scanning slips rendered literally, one lemma misparse, one reversed clause and one inconsistent lemma.
- `pt-BR/g3-c008.md` [60]: “Depois, quando diz: se, porém, fica manifesto que tampouco o fogo pode ser o primeiro elemento” → “Depois, quando diz: se, porém, mostra que tampouco o fogo pode ser o primeiro elemento” — Source reads “cum dicit si autem patet quod nec ignis…”: the lemma is only “si autem” (rendered “se, porém, for divisível” earlier), and “patet quod…” is the commentator's statement. The translation folds it into Aristotle's quoted words. *(meaning)*
- `pt-BR/g4-pr.md` [2]: “o misto, porém, por se constituir de menor número” → “o menor, porém, por se constituir de menor número” — Source “mistus autem” contrasts with “illud quod est majus” in the same sentence and is a scanning slip for “minus”. “O misto” makes the argument about larger and smaller fire unintelligible. *(meaning)*
- `pt-BR/g4-pr.md` [2]: “não é somente ele que muda, mas também o plano” → “não é somente ele que muda, mas também o pleno” — Source “sed etiam planum” is a scanning slip for “plenum”. The argument pairs the void with the full (pleno), and “o plano” is meaningless here. *(meaning)*
- `pt-BR/g4-pr.md` [2]: “retilíneo para cima.[^6]” → “retilíneo para cima.” — The marker [^6] has no definition among the chapter's notes (only [^9]–[^11] exist). The dangling marker is removed.
- `pt-BR/g4-pr.md` [2]: “por toda parte para baixo.[^7]” → “por toda parte para baixo.” — The marker [^7] has no definition among the chapter's notes. The dangling marker is removed.
- `pt-BR/g4-pr.md` [3]: “se movem por si.[^8]” → “se movem por si.” — The marker [^8] has no definition among the chapter's notes. The dangling marker is removed.
- `pt-BR/g4-pr.md` [4]: “já não movem, mas são movidos por causa deles” → “já não se movem; e é em vista deles que são movidos” — Source: “istis enim habitis non amplius movent: moventur autem per ista, ita ut motus quaeratur sicut via in finem”. The motion takes place for the sake of these ends, before they are reached. With “mas”, the translation says the bodies are moved after reaching them, which contradicts the clause before it. *(meaning)*
- `pt-BR/g4-pr.md` [4]: “segundo, quando diz: investigamos, porém, mostra” → “segundo, quando diz: dizemos, porém, mostra” — This is the same lemma that is later cited as “inquimus autem” and rendered “dizemos, porém”. Aristotle's words are “we say”, so “inquirimus” is a slip. The two references should match.
- Rejected: g3-c008.md [7] [10] [21] [23] [27], g4-pr.md [2] — The audit flags parentheses that differ from the source. — The parentheticals are kept as dashes, and none of their content is lost.
- Rejected: g3-c008.md [63], g4-pr.md [2] [4] — The audit flags extra emphasis markers. — The added italics mark retained Greek or Latin words (*omophilon*, *antipos*, *anti*, *pes*, *mineus*), which matches the house format.
- Rejected: book.json description pt-BR — The pt-BR says Books I and II and part of III, while en-US says Book I and part of III. — The pt-BR is correct: Aquinas commented through Book III, lecture 8. It is the en-US that is inaccurate.
- Rejected: g4-pr.md [3] — “princípio desses dois motores” for “duorum motorum”, where the context implies two motions. — “Motorum” is a real Latin form and not an unmistakable slip, so the literal rendering stands.
- Rejected: g4-pr.md [4] [^9] — The text equates the mina with the obol. — The note only reports that the received text makes this identification, which is true.

### Part 5 of 5, Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 67 parágrafos, das oito notas, do diário e dos metadados: quatro defeitos de sentido e um de concordância.
- `pt-BR/g3-c008.md` [62]: “se geravam primeiro aquilo que chamamos” → “se gerava primeiro aquilo que chamamos” — O sujeito «aquilo que chamamos» é singular e exige «se gerava».
- `pt-BR/g3-c008.md` [63]: “se alguém reunir oito retângulos em um único ponto” → “se alguém reunir oito ângulos sólidos retos em um único ponto” — «Octo rectangulos» retoma os ângulos sólidos retos das pirâmides, comparados imediatamente antes aos oito ângulos de cubos; não designa retângulos planos. *(meaning)*
- `pt-BR/g3-c008.md` [63]: “porque este é corpóreo e aquele é plano; por isso, não são iguais entre si, nem estes se compõem daqueles” → “porque o ângulo da pirâmide é corpóreo e o ângulo plano é superficial; por isso, não são iguais entre si, nem os ângulos corpóreos se compõem dos planos” — O latim distingue o ângulo piramidal corpóreo do superficial. Na sequência portuguesa, «este» retoma o ângulo plano e inverte as atribuições; os demonstrativos seguintes também tornam obscura a direção da composição negada. *(meaning)*
- `pt-BR/g4-pr.md` [3]: “princípio do movimento, este para a saúde, aquele para uma quantidade.” → “princípio do movimento: o que é curado muda para a saúde, e o que cresce, para uma quantidade.” — O latim associa a cura à saúde e o crescimento à quantidade. «Este», após a menção do membro que cresce, atribui-lhe indevidamente a saúde como termo. *(meaning)*
- `pt-BR/g4-pr.md` [3]: “este para o membro que deve crescer, aquele para a saúde.” → “o alimento para o membro que deve crescer, e aquilo que pode ser curado para a saúde.” — O latim encaminha o alimento ao membro que cresce e o sanável à saúde. A tradução usa «este» para o último referente, o sanável, invertendo as correspondências. *(meaning)*
- Rejected: pt-BR/g3-c008.md [7, 10, 21, 23, 27]; pt-BR/g4-pr.md [2] — Divergências na quantidade de parênteses. — O conteúdo dos parênteses foi conservado com travessões ou incorporado à pontuação da frase.
- Rejected: pt-BR/g3-c008.md [63]; pt-BR/g4-pr.md [2, 4] — Marcadores adicionais de ênfase. — Os itálicos adicionais assinalam termos gregos ou latinos conservados, conforme a regra editorial.

### Part 5 of 5, Round 3 (claude, full read)
Verdict: 5 meaning-level, 0 minor. Full read of g3-c008 and g4-pr: five meaning fixes, three for literally rendered Latin slips that make the argument contradict itself, one for the causal clause about heating, and one for an ambiguous comparison that inverts Proclus's point.
- `pt-BR/g3-c008.md` [62]: “Na primeira parte, apresenta a segunda: se os corpos primeiros” → “Na primeira parte, diz: se os corpos primeiros” — Source “In prima dicit secundam” is a slip; this part refutes the first opinion (mudança de figura), so “apresenta a segunda” misstates what follows. *(meaning)*
- `pt-BR/g3-c008.md` [63]: “por isso, é manifesto que tampouco os naturais aquecerão por serem materiais;” → “por isso, é manifesto que tampouco os naturais aquecerão por isso, mas por serem materiais;” — Source “nec naturalia calefacient, quia materialia: non igitur propter formas suas”: natural bodies heat because they are material, not by their figure. As rendered, the clause denies the heating by materiality that the next clause affirms. *(meaning)*
- `pt-BR/g3-c008.md` [63]: “não tem essa figura, como a aguda, assim como o fogo” → “não tem essa figura, como a aguda, como a tem o fogo” — Source “non habet hanc figuram, puta acutam, sicut ignis”: fire has that figure by its substance and the sword does not. “Assim como o fogo” reads as fire also lacking it, which inverts Proclus's distinction. *(meaning)*
- `pt-BR/g4-pr.md` [2]: “Digo, porém, ser impossível mover-se de algum modo” → “Digo, porém, “poder mover-se de algum modo”” — Source “impossibile moveri aliqualiter” is a slip for “posse moveri”, the phrase just used in the definition (“per posse moveri naturaliter”). The explanation that follows (no proper names for their operations) glosses the ability to move. “Impossível” contradicts the definition. *(meaning)*
- `pt-BR/g4-pr.md` [2]: “muitas coisas pequenas, isto é, de poucas partes” → “muitas coisas pequenas, isto é, de partes pequenas” — Source “multa pauca, hoc est paucarum partium” is a slip for “parva … parvarum”: the lemma is “et multa parva”, the next sentence has “multa parvarum partium”, and the contrast is with “grossarum partium”. “De poucas partes” breaks the argument. *(meaning)*
- Rejected: pt-BR/g3-c008.md [7] [10] [21] [23] [27], pt-BR/g4-pr.md [2] — The audit flags parentheses that differ from the source. — The parenthetical content is kept with dashes or sentence punctuation, as earlier rounds found.
- Rejected: pt-BR/g3-c008.md [63], pt-BR/g4-pr.md [2] [4] — The audit flags extra emphasis markers. — The added italics mark retained Greek or Latin terms, which matches the house format.
- Rejected: pt-BR/g4-pr.md [2] — Gold “se moveriam para cima com igual velocidade”, where the argument needs downward motion. — The source reads “sursum”. This is not an OCR-type slip with a certain correction, so the literal rendering stands.
- Rejected: pt-BR/g4-pr.md [2] — “dizemos que para cima é o extremo do céu, por toda parte para baixo” is garbled. — The source “sursum ultimum caeli undique deorsum” is itself defective, and no certain correction is available.
- Rejected: pt-BR/g3-c008.md [60] — “uma parte da pirâmide não é, em todos os casos, uma pirâmide” weakens “universaliter non est”. — This matches Aristotle's point that not every part of a pyramid is a pyramid; the rendering is defensible.

### Part 5 of 5, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Conferidas as cinco alterações e relidos integralmente os seis blocos apresentados e suas notas: nenhum novo defeito inequívoco na tradução; uma inconsistência de contagem no diário.
- `pt-BR/translation-journal.md`: “four meaning fixes, three for literally rendered Latin slips that make the argument contradict itself and one” → “five meaning fixes, three for literally rendered Latin slips that make the argument contradict itself, one for the causal clause about heating, and one” — A rodada enumera cinco correções; seu resumo descreve apenas quatro, omitindo a correção da causa do aquecimento.

### Part 5 of 5, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of part 5: checked the one journal change (Round 3 summary now counts five meaning fixes, matching its entries); it is correct, and nothing else was shown or changed.
