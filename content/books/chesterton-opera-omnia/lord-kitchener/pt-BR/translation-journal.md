# Diário de tradução — Lord Kitchener (pt-BR)

Fonte: en-US/, *Lord Kitchener* (Hodder & Stoughton, 1917), Project Gutenberg #25795.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Lord Kitchener / G. K. Chesterton | Lord Kitchener / G. K. Chesterton | Formas dos metadados recebidos; título e tratamento preservados. |
| God / Christian / Christendom | Deus / cristão / cristandade | Convenções das obras irmãs. |
| St. Paul / Crusades / crusader | São Paulo / Cruzadas / cruzado | Formas portuguesas tradicionais. |
| England / Englishman / Britain / British Empire | Inglaterra / inglês / Grã-Bretanha / Império Britânico | Preservada a distinção nacional das obras irmãs. |
| Prussia / Prussian / Prussian Empire | Prússia / prussiano / Império Prussiano | Convenções das obras irmãs. |
| common sense / sane / lunacy | senso comum / são / loucura | Convenções das obras irmãs; adaptação sintática contextual. |
| Mahomet / Mahomedan / Moslem / Mahomedanism | Maomé / muçulmano / muçulmano / islamismo | Convenções das obras irmãs; unificadas as designações dos adeptos. |
| Islam / Prophet / Mahdi / Khalifa | Islã / Profeta / Mádi / Califa | Títulos e maiúsculas contextuais; “mahdista” como adjetivo e substantivo. |
| Ahmed / Abdullahi / Mahmoud / Osman Digna | Ahmed / Abdullahi / Mahmoud / Osman Digna | Grafias da fonte conservadas. |
| Hannibal / Alexandria / Galilee / Holy Land | Aníbal / Alexandria / Galileia / Terra Santa | Formas portuguesas tradicionais, conforme as obras irmãs quando aplicável. |
| Egypt / Soudan / Khartoum / Cairo | Egito / Sudão / Cartum / Cairo | Topônimos portugueses. |
| Omdurman / Dongola / Fashoda / Suakin | Omdurman / Dongola / Fashoda / Suakin | Grafias históricas da fonte conservadas. |
| Cyprus / Anatolia / Erzerum / Himalayas | Chipre / Anatólia / Erzurum / Himalaia | Formas portuguesas e grafia atual de Erzurum. |
| Engineers / reconnaissance / Intelligence Department | Corpo de Engenheiros / reconhecimento / Serviço de Informações | Vocabulário militar contextual. |
| Khedive / Pasha / Sirdar / Mudir | quediva / paxá / sirdar / mudir | Cargos e títulos; “sirdar” explicado pelo próprio autor como comandante-chefe. |
| firman / dervish / Sepoys | firmã / dervixe / sipaios | Vocabulário administrativo, religioso e militar. |
| Fellaheen / Boers | felás / bôeres | Designações dos grupos históricos. |
| Great War / Allies / New Armies / Kitchener's Army | Grande Guerra / Aliados / Novos Exércitos / Exército de Kitchener | Designações históricas; maiúsculas conforme a fonte. |
| Trades Unions / Guilds | sindicatos / corporações de ofício | “Corporações de ofício” conforme a obra irmã *Poemas*. |
| blood and iron / blood and bone | sangue e ferro / sangue e ossos | Preservado o paralelismo que sustenta o argumento sobre o organismo vivo. |
| Superman | Super-Homem | Conservada a maiúscula da alusão conceitual. |

## Decisões

- Mantidos os 25 parágrafos da fonte, incluindo o título, sem divisões ou fusões; as duas notas do tradutor são acréscimos identificados.
- Preservados o horizonte histórico de 1917, os juízos políticos e religiosos e as caracterizações dos povos feitas pelo autor, sem atualizações ou correções factuais silenciosas.
- As alusões bíblicas não identificadas pela fonte permanecem sem referências acrescentadas ao texto; sua redação foi traduzida a partir do inglês fornecido.
- “Romance” e termos afins recebem soluções contextuais como “aventura romântica” e “romântico”, conservando o contraste entre imaginação heroica e cálculo prático.
- “Free lance” foi traduzido por “combatente independente”, mantendo sua ligação com “cavaleiro andante” na mesma frase.
- “Firmã” conserva o itálico do termo estrangeiro na fonte; não há citações latinas ou gregas no trecho.
- Nota [^1]: esclarece que Murray designa os guias de viagem da editora John Murray.
- Nota [^2]: distingue o sindicalismo revolucionário mencionado na passagem da participação sindical em sentido geral.
- Os lemas familiares empregam “tu” singular: “Podes quebrar-me...” e “Podes dobrar-me...”.
- “Shot her bolt” foi vertido por “disparara sua última flecha”, preservando a imagem de um disparo cujo recurso já se esgotou.
- Mantidos os textos existentes de `name`, `author` e `description` em pt-BR no `book.json`; acrescentados apenas o idioma à lista e o título localizado ao sumário.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of 25 paragraphs and 2 notes; one dropped qualifier ("rough") in [3]; audit flags, notes and journal checked and correct.
- `pt-BR/ch01-lord-kitchener.md` [3]: “está para o esboço a lápis em que se baseia” → “está para o esboço tosco a lápis em que se baseia” — source says "a rough pencil sketch"; the qualifier carries the contrast with the "rigid" diagram and was dropped *(meaning)*
- Rejected: pt-BR/ch01-lord-kitchener.md [6], [11] — audit: parentheses missing — the source's parentheses are rendered as paired dashes with identical content; no clause lost
- Rejected: pt-BR/ch01-lord-kitchener.md [12] — "perhaps the first of the Mahdist generals" rendered "talvez o principal" — "first" here means foremost; "principal" is a correct reading
- Rejected: pt-BR/ch01-lord-kitchener.md [7] — "the guns were to follow" rendered "os canhões os seguiriam" — the pronoun refers to the fugitives heading to Erzurum; it does not change the sense that the guns later reached Erzurum
- Rejected: pt-BR/ch01-lord-kitchener.md [25] — "has long been a dark continent" rendered "há muito era" — the narrative past tense, set against the present "contém", is defensible and the sense is kept

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 25 parágrafos, das duas notas, dos metadados, do diário e dos apontamentos mecânicos; encontrado um defeito de sentido.
- `pt-BR/ch01-lord-kitchener.md` [17]: “a relativa cavalaria e nobreza” → “o relativo cavalheirismo e a nobreza” — “Comparative chivalry” designa a conduta cavalheiresca dos adversários, não a cavalaria como instituição ou força militar. *(meaning)*
- Rejected: pt-BR/ch01-lord-kitchener.md [11] — “na ‘organização’ do homem que o fez” poderia sugerir que o homem foi organizado. — No contexto, o complemento pode designar a organização realizada por esse homem; a leitura compatível com a fonte é defensável.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of [16]–[18]: the round 2 fix in [17] is correct; one meaning defect in [18], where "possibly" was rendered "com verdade".
- `pt-BR/ch01-lord-kitchener.md` [18]: “depois de dito tudo o que se possa dizer, com verdade ou plausibilidade, contra” → “depois de dito tudo o que de algum modo ou com alguma plausibilidade se possa dizer contra” — source says "all is said that can possibly or plausibly be said"; "possibly" means anything conceivable, while "com verdade" has the author concede that the criticisms are true *(meaning)*
- Rejected: pt-BR/ch01-lord-kitchener.md [17] — "o relativo cavalheirismo e a nobreza" (round 2 fix) — matches "comparative chivalry and nobility"; concord and regency correct, nothing lost
- Rejected: pt-BR/ch01-lord-kitchener.md [17] — "by a movement unusually and unconsciously dramatic" rendered "num gesto excepcional e inconscientemente dramático" — "excepcional" applied to the gesture keeps the sense that the gesture was unusually dramatic; a defensible style choice
- Rejected: pt-BR/ch01-lord-kitchener.md [18] — "native and historic ideals" rendered "ideais nacionais e históricos" — in the context of the homeward return, "nacionais" is a defensible rendering of "native"

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Lidos integralmente os parágrafos [17]–[19], as duas notas e o diário fornecido; correção anterior validada e encontrado um defeito gramatical menor.
- `pt-BR/ch01-lord-kitchener.md` [19]: “quase como se a levava para ver o rei” → “quase como era levada para ver o rei” — A construção “como se a levava” é gramaticalmente inadequada; a fonte compara duas ocasiões em que a criança era levada a ver alguém.
- Rejected: pt-BR/ch01-lord-kitchener.md [18] — Correção de “possibly or plausibly” para “de algum modo ou com alguma plausibilidade”. — A correção preserva a possibilidade e a plausibilidade das críticas, sem afirmar sua veracidade, e mantém a frase gramatical.

### Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of [18]–[20] and the two notes: the round 4 fix in [19] is correct and no new defect was found.
- Rejected: pt-BR/ch01-lord-kitchener.md [19] — Round 4 fix “quase como era levada para ver o rei”: the subject of “era levada” is implicit. — The subject is the “criança” of the same sentence, so the comparison of the two occasions is kept; concord and regency are correct.
- Rejected: pt-BR/ch01-lord-kitchener.md [20] — “better appreciated” rendered “mais bem compreendidos”. — In context, being rightly valued instead of merely praised is close to being understood; the sense of the argument is kept and the choice is defensible.
- Rejected: pt-BR/ch01-lord-kitchener.md [20] — “Tendia a desprezar” has an implicit subject that could be read as Kitchener. — The nearest subject is “grande parte da imprensa e da classe dirigente”, which the sentence continues naturally; the reading matches the source.
