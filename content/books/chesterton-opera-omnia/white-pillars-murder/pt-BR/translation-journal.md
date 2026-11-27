# Diário de tradução — O Assassinato dos Pilares Brancos (pt-BR)

Fonte: en-US/, The White Pillars Murder (English Life, 1925), Project Gutenberg Australia, ebooks13/1301671h.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The White Pillars Murder / G. K. Chesterton | O Assassinato dos Pilares Brancos / G. K. Chesterton | Formas dos metadados recebidos. |
| White Pillars / The White Pillars Mystery | Pilares Brancos / O Mistério dos Pilares Brancos | Nome da propriedade traduzido para conservar sua relação com a arquitetura e o título. |
| Dr Adrian Hyde / the Master | dr. Adrian Hyde / o Mestre | Tratamento conforme a obra irmã; maiúscula de “Mestre” preservada. |
| John Brandon / Jack Brandon / Walter Weir | John Brandon / Jack Brandon / Walter Weir | Conservados o nome e a forma familiar de Brandon. |
| Alfred Morse / Melchior Morse / Barbara Butler / Graves / Barton / Caxton | Alfred Morse / Melchior Morse / Barbara Butler / Graves / Barton / Caxton | Nomes das personagens conservados. |
| Mr. / Mrs. / Miss / gentleman | sr. / sra. / srta. / cavalheiro | Convenções das obras irmãs. |
| God / devil / hell / religion / good works | Deus / diabo / inferno / religião / boas obras | Vocabulário religioso; caixa conforme o contexto. |
| England / Irish / Great War | Inglaterra / irlandês / Grande Guerra | Convenções das obras irmãs. |
| St Peter’s / Napoleon / Dionysius, the Tyrant | São Pedro / Napoleão / Dionísio, o Tirano | Formas portuguesas; “São Pedro” designa a basílica e seu conjunto arquitetônico. |
| private detective / detective agency / criminologist | detetive particular / agência de detetives / criminologista | Distinções profissionais do original. |
| eavesdropping / listening / hearing | escutar às escondidas / escutar / ouvir | Preservada a distinção que sustenta o raciocínio de Weir. |
| whispering gallery | galeria de sussurros | Fenômeno acústico explicado na nota [^1]. |
| footprint / fingerprints / cigar-stump | pegada / impressões digitais / ponta de charuto | Pistas materiais centrais. |
| money-lender / usurer / blackmail | agiota / usurário / chantagem | “Money-lending business”: negócio de emprestar dinheiro. |
| solicitor / butler / secretary / archdeacon | advogado / mordomo / secretário / arquidiácono | Funções e cargo eclesiástico. |

## Decisões

- Mantidos os 83 parágrafos da fonte, inclusive o título, com uma definição de nota do tradutor acrescentada após o parágrafo a que se refere.
- Empregados “tu” no tratamento singular e “vós” quando Hyde se dirige aos dois assistentes; preservados os tratamentos nominais “sr.” e “dr.”.
- Uniformizados como “Walter” e “Caxton” os nomes que aparecem isoladamente como “Waiter” e “Claxton”, variantes evidentes da própria fonte.
- Conservada a imagem “pedra rolante” e sua retomada como pedra rejeitada pelos construtores, sem acrescentar referência bíblica ausente do original.
- Acrescentada a nota [^1] para explicar a Orelha de Dionísio e o funcionamento da galeria de sussurros, necessários à alusão e à cena.
- Traduzido “business” por “negócio” nas falas decisivas do secretário, preservando a ambiguidade entre assunto e atividade comercial.
- Conservada, no raciocínio final, a formulação da fonte segundo a qual a reprodução da pegada era “uma prova, e não o original”, embora a entrevista anterior a apresente simplesmente como cópia.
- “Priestcraft of our time” foi traduzido por “artifícios sacerdotais do nosso tempo”, preservando a metáfora irônica aplicada à autoridade da ciência.
- “Sweep crossings” foi traduzido por “varrer passagens de pedestres”, conservando a referência ao trabalho de limpeza das travessias de rua e o contraste moral com o ofício de detetive.
- Preservadas as entradas em português já fornecidas nos metadados; acrescentados o idioma em `languages` e o título português no sumário.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 83 parágrafos, do book.json e do diário; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch01-the-white-pillars-murder.md [12], [13], [48] — Aspas desbalanceadas — A fala continua no parágrafo seguinte, sem aspas de fechamento, como na fonte.
- Rejected: pt-BR/ch01-the-white-pillars-murder.md [19] — Parênteses da fonte trocados por travessões — Escolha de pontuação equivalente; o conteúdo do parêntese está completo.
- Rejected: pt-BR/translation-journal.md (Termos) — “detetive particular” ×0 no pt-BR — A forma ocorre no plural, em “agência de detetives particulares” [2] e “detetives particulares” [83]; o termo do quadro é respeitado.
- Rejected: pt-BR/ch01-the-white-pillars-murder.md [15] — Acréscimo de “na memória” em “essas silhuetas ficam muito nítidas” — Explicita que a nitidez é a do que o mordomo guardou; não altera o sentido da fala.
- Rejected: pt-BR/ch01-the-white-pillars-murder.md [80] — “prova” para “proof” contrastaria com “cópia” em [16] — O diário registra a decisão; “prova” também tem o sentido de cópia fotográfica, como “proof” em inglês.
- Rejected: pt-BR/ch01-the-white-pillars-murder.md [48], nota [^1] — Exatidão da nota sobre a Orelha de Dionísio — Gruta de Siracusa conhecida pela acústica, associada pela tradição ao tirano Dionísio, que ali escutaria os prisioneiros. Os fatos estão corretos.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 83 parágrafos, da nota do tradutor, dos metadados e do diário; conferidos os alertas mecânicos, sem novos defeitos objetivos.
