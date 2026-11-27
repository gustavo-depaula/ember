# Diário de tradução — A vida feliz (pt-BR)

Fonte: la/, texto maurino (Beneditinos de Saint-Maur, 1679–1700), reproduzido em Migne, Patrologia Latina, no site augustinus.it, conforme book.json.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| De beata vita | A vida feliz | Título estabelecido nos metadados. |
| Aurelius Augustinus Hipponensis / Augustinus | Agostinho de Hipona / Agostinho | Conforme os metadados e as obras irmãs. |
| Deus / Dominus / Dei Filius | Deus / Senhor / Filho de Deus | Convenções das obras irmãs. |
| Dei Sapientia / Trinitas / substantia | Sabedoria de Deus / Trindade / substância | Conforme as obras irmãs; maiúsculas nas designações divinas. |
| Veritas | Verdade | Maiúscula na designação do Filho. |
| beata vita / beatus / miser / miseria | vida feliz / feliz / infeliz / infelicidade | Série central da argumentação; “bem-aventurança” permanece o equivalente geral de beatitudo nas obras irmãs. |
| egestas / egere / egens | indigência / ser indigente; carecer / indigente | “Indigência” abrange a privação espiritual, sobretudo de sabedoria. |
| plenitudo / abundantia / opulentia | plenitude / abundância / opulência | Conservadas as distinções expressamente discutidas. |
| sapientia / stultitia | sabedoria / insensatez | Contrários centrais à demonstração. |
| modus / summus modus | medida / medida suprema | Conservada a unidade terminológica entre a moderação da alma e a argumentação final. |
| modestia / temperantia / temperies | modéstia / temperança / equilíbrio | Relações etimológicas explicadas na nota 4. |
| frugalitas / nequitia / frux | frugalidade / iniquidade / fruto | Convenção de “iniquidade” das obras irmãs; jogo etimológico explicado na nota 2. |
| virtus / fortitudo / superbia | virtude / coragem / soberba | “Coragem” no argumento sobre os temores do sábio. |
| anima / animus / mens / corpus | alma / alma; mente / mente / corpo | Conforme as distinções das obras irmãs; animus vertido segundo o contexto. |
| spiritus immundus / daemon | espírito impuro / demônio | Distinção discutida em 3.18. |
| fides / spes / caritas | fé / esperança / caridade | Conforme as obras irmãs. |
| propitius / adversus / infestus | propício / contrário / hostil | Mantida a distinção vocabular da discussão. |
| Deum habere / Deo perfrui | ter Deus / fruir de Deus | Fórmulas centrais da conclusão. |
| philosophia / Academici | filosofia / acadêmicos | “Acadêmicos” designa os filósofos da Academia mencionados na discussão. |
| Theodorus / Navigius / Trygetius / Licentius | Teodoro / Navígio / Trigécio / Licêncio | Nomes portugueses dos interlocutores e do destinatário. |
| Lastidianus / Rusticus / Adeodatus / Alypius | Lastidiano / Rústico / Adeodato / Alípio | Nomes dos participantes e do amigo ausente. |
| Cicero / Tullius / Sallustius / Plotinus | Cícero / Túlio / Salústio / Plotino | Conservadas as duas designações de Cícero. |
| Sergius Orata / Hymettius | Sérgio Orata / do Himeto | Nome romano e referência ao monte conhecido por seu mel. |
| Hortensius | Hortênsio | Título do diálogo de Cícero. |
| Terentius / Plutarchus / Ambrosius | Terêncio / Plutarco / Ambrósio | Nomes dos autores das referências editoriais. |
| Ioannes / Matthaeus / I ad Corinthios | João / Mateus / 1 Coríntios | Nomes bíblicos conforme as obras irmãs; referências com dois-pontos. |

## Decisões

- Traduzido diretamente o latim fornecido, com correspondência dos 46 parágrafos; mantidos os quatro títulos internos como parágrafos sem nível de cabeçalho e a numeração das seções como texto em negrito.
- Conservado o tratamento singular com “tu” nas falas dirigidas a uma pessoa e o plural com “vós” nas falas ao grupo; no verso dirigido à Trindade, adotado o tratamento reverente com “Vós”.
- As citações pertencentes ao próprio texto latino foram traduzidas, conservando os itálicos existentes. Mantido o título latino Deus Creator omnium na referência editorial.
- Conservadas e traduzidas as referências editoriais entre parênteses, inclusive as que estavam em italiano; não foram acrescentadas referências bíblicas às alusões não identificadas pela fonte.
- Mantidos os colchetes da passagem de 3.22. Conservada em 4.29 a repetição da premissa “todo infeliz é indigente”, tal como fornecida, sem corrigir silenciosamente o texto.
- Em 4.26, “É difícil [...] encontrar tal vida” exprime a raridade do exemplo imaginado no contexto da abundância de bens.
- Acrescentada a nota 1 para explicar os idos de novembro.
- Acrescentada a nota 2 para explicitar as associações latinas de nequitia e frugalitas, essenciais à argumentação posterior.
- Vertido caducarii por “caidores”, conservando a explicação do próprio autor; acrescentada a nota 3 para esclarecer a aplicação jocosa do nome aos acadêmicos.
- Acrescentada a nota 4 para explicar as relações etimológicas de modestia, temperantia e opulentia que não permanecem visíveis em português.
- Mantida a continuidade dos parágrafos 4.25, dos dois versos de Terêncio e de suas explicações, bem como a divisão entre a apresentação do verso de Ambrósio e sua recitação no parágrafo seguinte.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of the 46 paragraphs, footnotes, journal and book.json: an unclosed quotation in 4.25, 'embora' with the indicative in 4.29, and an ambiguous pronoun in 2.11.
- `pt-BR/ch001.md` [34]: “que de modo algum lhe podem ser arrebatadas.” → “que de modo algum lhe podem ser arrebatadas.”” — Agostinho's speech opens with “ in [30] and ends at 4.25; [35] opens a new speech, so the quotation must close here (resolves the audit's unbalanced-quote flag)
- `pt-BR/ch001.md` [38]: “Embora não sei como podemos dizer” → “No entanto, não sei como podemos dizer” — 'embora' requires the subjunctive; the Latin 'quamquam' with the indicative is an adversative ('however')
- `pt-BR/ch001.md` [14]: “pois, a meu ver, ele deve obter aquilo que possa ter quando quiser” → “pois, a meu ver, o homem deve obter aquilo que possa ter quando quiser” — 'ei' refers to the man who wants to be happy; in the PT, 'ele' follows 'Licêncio' and seems to refer to him *(meaning)*
- Rejected: pt-BR/ch001.md [3], [7], [16], [19], [35], [42] — Source parentheses rendered as em dashes — Legitimate punctuation choice; no content lost. The editorial references remain in parentheses
- Rejected: pt-BR/ch001.md [35] — 'É difícil [...] encontrar tal vida' adds 'encontrar' — A decision justified in the journal; it does not distort the sense
- Rejected: pt-BR/ch001.md [38] — Repetition of 'todo infeliz é indigente' in the final sentence — Reproduces the Latin text as given ('quisquis miser est egeat' twice); decision recorded in the journal
- Rejected: pt-BR/ch001.md [8] — 'omne quod vivo' rendered as 'tudo o que sou' — Acceptable equivalent; the sense of owing one's whole existence to the mother is kept

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Lidos integralmente os 46 parágrafos, as quatro notas, os metadados e o diário; encontrados dois defeitos de sentido e um de formatação.
- `pt-BR/ch001.md` [4]: “fogem das proximidades da costa” → “escapam das águas próximas ao porto” — De proximo indica que escapam estando perto do porto; fugir das proximidades da costa sugere o afastamento para o mar, invertendo o movimento descrito. *(meaning)*
- `pt-BR/ch001.md` [12]: “Se tendes fome, apresentarei esse almoço, seja ele qual for.” → “Se tendes fome, mostrarei em que consiste esse almoço.” — Quod autem hoc sit prandium introduz a apresentação do conteúdo do almoço; não exprime a indiferença ou incerteza acrescentada por 'seja ele qual for'. *(meaning)*
- `pt-BR/ch001.md` [45]: “citado de Deus Creator omnium;” → “citado de *Deus Creator omnium*;” — O título latino conservado deve estar em itálico, conforme a regra para expressões latinas retidas.
- Rejected: pt-BR/ch001.md [30]–[34] — Aspas desequilibradas nos parágrafos individuais. — A fala aberta em [30] continua pelos versos e comentários e se fecha corretamente em [34].
- Rejected: pt-BR/ch001.md, flags de ênfase e parênteses — Diferenças nas contagens de marcadores. — Decorrem da numeração em negrito, da união de trechos de uma mesma citação em itálico e da substituição de parênteses por travessões; não há conteúdo perdido.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [3]-[5], [11]-[13], [44]-[46] and the footnotes: all three changes are correct, and no new defects were found.
- Rejected: pt-BR/ch001.md [4] — “escapam das águas próximas ao porto” names the port, which the Latin does not, for “de proximo fugiunt” — The port is the image of the whole passage (cf. [3] and the second and third kinds). The rendering keeps the sense that they get away close to shore with little effort and then take refuge; it does not distort it.
- Rejected: pt-BR/ch001.md [12] — “mostrarei em que consiste esse almoço” for “Quod autem hoc sit prandium … proferam” — Faithful: Augustine says he will set out what the meal is. The earlier added indifference is gone.
- Rejected: pt-BR/ch001.md [45] — The hymn verse “Acolhei os que Vos suplicam, ó Trindade” is not in italics — It is translated into Portuguese, so the italics rule for retained Latin does not apply. Only the retained Latin hymn title is italicized, which is correct.
