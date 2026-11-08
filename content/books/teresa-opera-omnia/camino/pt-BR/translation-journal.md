
## Termos

| temor de Dios | temor de Deus | Mantida a expressão espiritual tradicional. |
| pecado venial / pecado mortal | pecado venial / pecado mortal | Terminologia moral católica. |
| de advertencia | conscientemente / plenamente consciente | Conforme o contexto, indica consciência do ato; “advertência” conservada quando a autora distingue seus graus. |
| santa libertad | santa liberdade | Liberdade de trato fundada no amor e no temor de Deus. |
| Protestación | Declaração de submissão | No prólogo, profissão de submissão ao ensinamento da Igreja. |
| Padre Presentado | Padre Apresentado | Conservado o título acadêmico religioso. |
| Nuestra Señora del Carmen / San Josef de Avila | Nossa Senhora do Carmo / São José de Ávila | Formas portuguesas da invocação e do nome do mosteiro. |
| Santo Domingo / Domingo Báñez | São Domingos / Domingo Báñez | Distinguidos o santo fundador e o confessor de Teresa. |
| Teutonio de Braganza / Ana de San Pedro | Teotônio de Bragança / Ana de São Pedro | Formas portuguesas dos nomes nas notas do prólogo. |
| San Gregorio / San Leandro de Sevilla | São Gregório / São Leandro de Sevilha | Formas portuguesas dos nomes na nota 10 do prólogo. |

## Decisões

- c41–c42 e prólogo: conservados os 72 parágrafos fornecidos, incluindo títulos e 40 definições de notas editoriais. Não foram acrescentadas notas do tradutor, dada a abundância do aparato.
- c41: conservados os colchetes de “ente[n]dais” e dos acréscimos de Frei Luís de Leão, além do superlativo por repetição “muito, muito”. “Encogimiento” e “apretura” foram traduzidos por “retraimento” e “constrangimento”, conforme o contexto.
- c42: a citação de Lucas 22:15 segue o espanhol, “Com desejo desejei cear convosco”, sem acrescentar “Páscoa”, presente apenas na referência inglesa. Conservado o latim do título e traduzida a fórmula espanhola por “mas livrai-nos do mal”.
- c42, nota 2: conservados os fragmentos espanhóis interrompidos da emenda de Báñez, acompanhados de tradução entre colchetes, sem completar as palavras truncadas.
- Prólogo: “Protestación” foi traduzido por “Declaração de submissão”, conforme o conteúdo; conservados “Jhs.” e os colchetes de “[acer]tado”. No título e na apresentação, manteve-se “Teresa de Jesus”, conforme a forma usada no original.
- Nas notas gramaticais e ortográficas, conservaram-se as formas espanholas necessárias à compreensão das variantes, com equivalentes portugueses entre colchetes quando úteis.

## Review log

### Part 1 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 2 minor. Full read of c01–c22 with all footnotes and audit flags. Fixed one broken conditional (c21 [7]), one lost plural that contradicts its footnote (c17 [7]) and two typos in footnote word forms (c02 [14], c13 [11]).
- `pt-BR/c21.md` [7]: “Se, por um maravedi de interesse, dispõem-se a passar muitas noites sem dormir e a vos inquietar corpo e alma.” → “Pelo contrário, por um maravedi de interesse se disporão a passar muitas noites sem dormir e a vos inquietar corpo e alma.” — source "sino que por un maravedí de interese se pornán a no dormir…" is an adversative, not a condition. The PT opens a conditional that never gets its main clause, so the sentence is a fragment. *(meaning)*
- `pt-BR/c17.md` [7]: “Se ficasse como Madalena, absorta[^4]” → “Se ficassem como Madalena, absortas[^4]” — source has the plural "embebidas". Footnote 4 says the plural refers not to Marta but to the nuns who, like Madalena, enjoy contemplation. The singular makes the text point to Marta and contradicts the note. *(meaning)*
- `pt-BR/c02.md` [14]: “M urierdes por muriereis” → “Murierdes por muriereis” — stray space splits the Spanish form (text has "murierdes").
- `pt-BR/c13.md` [11]: “No original, “en jemplo”” → “No original, “enjemplo”” — the source text in c13 [6] reads "enjemplo" as one word, so the quoted form is wrong.
- Rejected: pt-BR/c16.md [3]–[5] — unbalanced opening quotes — a multi-paragraph quotation opens each paragraph and closes only at the end of [6]. The source does the same with « / ».
- Rejected: c01 [8], c02 [9], c04 [9], c16 [7], c17 [9], c18 [6]/[9], c21 [5]/[11], c22 [9]/[14], c13 [12] and others — parentheses differ from the source — parenthetical asides are rendered with dashes and none of their content is lost. c12 [16] adds a "(" to balance the source's stray ")". c22 [9] corrects a mismatched bracket. All are defensible.
- Rejected: c16 [22], c19 [18], c20 [10] — extra emphasis markers — retained Latin titles and quotations are italicized, as the house rule requires.
- Rejected: c15 [9], c17 [10], c18 [11] — switch from vós to tu — it follows Teresa's singular "vos" (and "Mira") when she addresses one daughter. Elsewhere the plural address keeps vós. This is a defensible commitment, not an error.
- Rejected: c16 [8] — "con advertencia" rendered "de propósito" against the Key Terms row — the row allows context-dependent rendering and the sense is unchanged.

### Part 1 of 2, Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral de c01–c22, incluindo notas, alertas mecânicos, book.json e journal: duas correções de sentido.
- `pt-BR/c13.md` [12]: “quem pensar em vos impedir isso” → “quem julgar que vos há de impedir isso” — “Quien pensare que de esto os ha de estorbar” refere-se a quem julga que será um impedimento ao serviço de Deus; a tradução atribui a essa pessoa a intenção de impedi-lo. *(meaning)*
- `pt-BR/c17.md` [4]: “nem Ele o exige de nós para nos dar o prêmio” → “nem Ele nos obriga a isso” — “De premio” tem aqui o sentido antigo de imposição ou obrigação. A passagem diz que Deus não exige a contemplação; não fala em conceder uma recompensa. *(meaning)*
- Rejected: pt-BR/c19.md [13] — “Lo ha ya perdido” poderia referir-se ao juízo, em vez do temperamento impetuoso. — O antecedente também pode ser o natural impetuoso, cuja superação se manifesta em outras coisas. A referência ao hábito de vencer a vontade sustenta essa leitura; a tradução é defensável.

### Part 1 of 2, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c13 [11]–[13] and c17 [3]–[5]: both fixes from round 2 check out against the Spanish and the shown paragraphs are clean.
- Rejected: pt-BR/c13.md [12] — “quem julgar que vos há de impedir isso”: whether the new reading is right — It renders “quien pensare que de esto os ha de estorbar” word for word, without the intent the old version added. The regency of “impedir” and the sentence around it are correct.
- Rejected: pt-BR/c17.md [4] — “nem Ele nos obriga a isso” for “ni nos lo pide de premio”: whether the new reading is right — In Teresa's Spanish “de premio” means “by compulsion” (from “premia”, “apremio”). The new wording fits the next clause, “não pense que alguém lho exigirá”.
- Rejected: pt-BR/c13.md [12] — Audit: parentheses differ (source 2, pt-BR 1) — “(al menos si me creen a mi)” is rendered between commas with nothing lost, and “(estimados)” is kept. Round 1 already rejected this flag.
- Rejected: pt-BR/c13.md [12] — “pela honra dos parentes dela” commits the possessive of “sus deudos” — The relatives are those of the nun being kept, so the commitment is defensible.

### Part 2 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 6 minor. Full read of c23–prólogo: 2 meaning fixes (Quixote example lost in c28 note 7; c41 [6] necessity read as difficulty) and 6 minor fixes; journal counts and Key Terms rows are correct.
- `pt-BR/c23.md` [7]: “ainda que não mo[rre][^5] na batalha” → “ainda que não mo[rra][^5] na batalha” — “ainda que” requires the subjunctive; the bracket still marks the three restored letters
- `pt-BR/c28.md` [22]: ““ao que Dom Quixote respondeu, muito devagar e com muita fleuma”” → ““a lo cual respondió D. Quijote, muy de espacio y con mucha flema” [ao que Dom Quixote respondeu, muito devagar e com muita fleuma]” — the note illustrates the old spelling “de espacio”; translating the quotation removes the example it cites *(meaning)*
- `pt-BR/c29.md` [5]: “quem vos dera entender isso!” → “quem vos fizesse entender isso!” — source “quién os hiciese entender esto” means “who could make you understand this”, answered by “No yo”; “quem vos dera” reads as a wish
- `pt-BR/c32.md` [10]: “é verdade que Ele não a dá primeiro a nós[^7] para que a demos a Ele” → “é verdade que Ele não nos dá primeiro[^7] para que lha demos” — Valladolid reads “no nos da primero para que se la demos”; the current text renders the Escorial variant quoted in note 7, so the text and the variant read the same
- `pt-BR/c38.md` [18]: “podem causar grande dano a nós e aos outros” → “podem causar grande (dano) a nós e aos outros” — source marks “(daño)” as the editor's supplied word; keep the parentheses
- `pt-BR/c40.md` [8]: “do qual já[^16] não se pode duvidar[^17]” → “pois já[^16] não se pode duvidar dele[^17]” — source “que ya no puede dudar de él”; “do qual” adopts Báñez's emendation (“del cual”), which notes 16 and 17 report as a variant
- `pt-BR/c40.md` [18]: “até as palavras “Que esto tiene”, inclusive” → “até as palavras “Pois o amor tem isso”, inclusive” — the note locates a passage in the translated text, where those words read “Pois o amor tem isso”
- `pt-BR/c41.md` [6]: “É preciso muito para que esse temor fique profundamente impresso em nós” → “É muito necessário que esse temor fique profundamente impresso em nós” — source “Ha menester mucho que en sí quede muy impreso este temor” says the fear must be deeply impressed, not that it takes much to impress it *(meaning)*
- Rejected: audit: parentheses differ (c23–c40) — source parentheses rendered as dashes, or glosses added in parentheses in notes — punctuation choice or added glosses; no content lost
- Rejected: audit: emphasis markers differ (c30, c32, c33, c36, c38) — italics added — house rule: retained Latin is italicized
- Rejected: pt-BR/c40.md [29] — unbalanced opening quote — the source quotation is also unclosed («…), so the open quote follows the source
- Rejected: pt-BR/c42.md [14] — “tudo poderão em Cristo” for “todo lo pondrán” — the reading is “podrán” (Phil 4:13, “como decía San Pablo”); “pondrán” is an OCR slip
- Rejected: pt-BR/c40.md [5] — subject of “vos dá a vida” seems to be the devil — the source is equally implicit (“los da la vida”)

### Part 2 of 2, Round 2 (codex, full read)
Verdict: 3 meaning-level, 1 minor. Leitura integral dos 21 arquivos, com notas, auditoria, book.json e diário: três correções de sentido e uma inconsistência menor na contagem do registro anterior.
- `pt-BR/c23.md` [3]: “a única coisa que nos queremos determinar a dar” → “uma coisa que nos queremos determinar a dar” — O original diz “una cosa”, sem afirmar que seja a única coisa que nos dispomos a dar. *(meaning)*
- `pt-BR/c28.md` [13]: “se eu não tivesse tapado os olhos com as vaidades da vida para não vê-lo, isso não entendia” → “isso não entendia, embora o pudesse ver se não tivesse tapado os olhos com as vaidades da vida” — As vaidades impediam Teresa de ver; “para não vê-lo” acrescenta a intenção deliberada de não ver, ausente do original. *(meaning)*
- `pt-BR/c30.md` [4]: “nunca pensamos que somos ricos” → “nunca pensamos que chegaremos a ser ricos” — “Nunca nos pensamos ver ricos” refere-se à expectativa de alcançar a riqueza, não à avaliação de já sermos ricos. *(meaning)*
- `pt-BR/translation-journal.md`: “and 5 minor fixes; journal counts” → “and 6 minor fixes; journal counts” — A lista registra seis correções menores, conforme também informa o veredito inicial, e não cinco.
- Rejected: Auditoria mecânica de c23.md a c40.md — Diferenças de parênteses e itálicos, além da aspa aberta em c40.md [29]. — Confirmadas as decisões anteriores: travessões ou glosas explicam os parênteses; os itálicos marcam latim conservado; a citação sem fechamento reproduz o original.

### Part 2 of 2, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of c23–prólogo with notes, audit, book.json and journal: one minor fix (c42 note 4 misreports Báñez's struck words); journal counts and Key Terms correct.
- `pt-BR/c42.md` [12]: “riscando as palavras “quanto já devia estar cansado” e substituindo-as à margem por estas: “quão pouca vontade já devia ter”” → “riscando as palavras “cansado debía ya estar” [já devia estar cansado] e substituindo-as à margem por estas: “poca gana devía ya de tener” [pouca vontade já devia ter]” — source: Báñez struck only “cansado debía ya estar” (“cuan” was left), and the margin reads “poca gana devía ya de tener”; the note made him strike “quanto” too and added “quão” to his wording. Spanish kept with a gloss, as in note 2 of the same chapter
- Rejected: pt-BR/c25.md [4] — “Vê, pois” (singular) in a passage addressed to the sisters in the plural — the source has “mira”, not the plural “mirá” the edition uses elsewhere; the singular follows the source
- Rejected: pt-BR/c37.md [7] — “temeroso” rendered “temente a Deus” — in Teresa “temeroso” alone usually means God-fearing; defensible
- Rejected: pt-BR/c31.md [8] — “al menos ven” rendered with the concessive “embora vejam” — the logic holds (although they see they cannot obtain it, they think they can keep it); no change of sense
- Rejected: audit: parentheses and emphasis (c23–c40), quote in c40 [29] — parentheses dropped or added, extra italics, unclosed quote — dashes and added glosses, italics on retained Latin, quotation also unclosed in the source; confirmed as in rounds 1–2

### Part 2 of 2, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura delta de c42.md [11–13]: a correção preserva exatamente as variantes espanholas e as traduz corretamente; nenhum defeito encontrado.
