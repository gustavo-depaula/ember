# Diário de tradução — Evangelho de Tomé (c. 200) (pt-BR)

Fonte: en-US/, tradução de Alexander Walker, em Ante-Nicene Fathers, vol. 8, edição de Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revisão e edição para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Gospel of Thomas | Evangelho de Tomé | |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Thomas / Joseph / Mary | Tomé / José / Maria | |
| Jesus Christ / Lord / Son of God | Jesus Cristo / Senhor / Filho de Deus | Conforme os livros irmãos. |
| Holy Spirit / Spirit of God | Espírito Santo / Espírito de Deus | Espírito Santo conforme os livros irmãos. |
| God Almighty / God the Father Almighty | Deus todo-poderoso / Deus Pai todo-poderoso | |
| Annas / Zacchæus / Zacheus | Anás / Zaqueu / Zaqueu | As duas grafias inglesas do mestre recebem a mesma forma portuguesa. |
| James / Herod | Tiago / Herodes | Tiago conforme os livros irmãos. |
| Zeno / Sinoo | Zenão / Sinoo | Preservada a diferença entre as formas gregas e a forma latina. |
| Nazareth / Jerusalem / Egypt / Judah | Nazaré / Jerusalém / Egito / Judá | Jerusalém e Judá conforme os livros irmãos. |
| Israelite / house of Israel | israelita / casa de Israel | |
| heathen / Gentiles | pagãos / gentios | Mantida a distinção vocabular da fonte. |
| scribes / Pharisees / high priests | escribas / fariseus / sumos sacerdotes | Sumo sacerdote conforme os livros irmãos. |
| Sabbath / passover | sábado / Páscoa | |
| infancy / childhood / boyhood | infância / infância / meninice | |
| teacher / master / schoolmaster | mestre / mestre / mestre-escola | “Mestre-escola” conserva a designação específica do professor de primeiras letras. |
| letters / alphabet | letras / alfabeto | “Aprender as letras” designa a aprendizagem da leitura. |
| Alpha / Beta / Omega | Alfa / Beta / Ômega | Mantidos A, B e T onde a fonte usa essas letras. |
| law / Scripture / holy Scripture | lei / Escritura / santa Escritura | |
| bless / curse / blaspheme | abençoar / amaldiçoar / blasfemar | Preservadas as diferenças entre as recensões. |
| adore / glorify / give thanks | adorar / glorificar / dar graças | |
| grace / wisdom | graça / sabedoria | |
| soul / immortality | alma / imortalidade | |
| viper / serpent / poison | víbora / serpente / veneno | Conforme os livros irmãos. |
| couch / cross piece | leito / travessa | Contexto do trabalho de carpintaria. |
| plough / yoke / ox-yoke | arado / jugo / jugo para bois | |
| kor / peck | coro / peck | Medidas de capacidade distintas, sem conversão. |
| Luke | Lucas | Nas duas referências presentes na fonte. |
| for ever / for ever and ever | para sempre / pelos séculos dos séculos | Conforme os livros irmãos. |
| Amen | Amém | |

## Decisões

- Traduzidas do inglês fornecido as três formas do relato, inclusive a seção intitulada “Forma latina”; não foi substituído o texto inglês por outra edição.
- Conservadas separadamente as três formas e suas diferenças narrativas, incluindo idades, materiais dos ramos, morte ou desfalecimento dos mestres e contrastes entre rezar, abençoar, blasfemar e amaldiçoar.
- Os números autorais das duas formas gregas foram apresentados como texto em negrito, sem listas automáticas. Conservados os níveis dos títulos e o itálico do título da segunda forma grega.
- Empregado “tu” no diálogo com um interlocutor e “vós” no plural; empregado “vós” nas invocações explícitas a Deus. Na passagem “mas vós sois estrangeiros”, da forma latina, a interpelação foi entendida como coletiva.
- Conservados os pronomes e as formulações difíceis da fonte, incluindo “sou teu”, “fui feito antes de ti”, a pergunta sobre a pouca importância do menino e a conclusão sobre a “vontade da imortalidade”, sem harmonização.
- Conservadas com reticências as interrupções textuais dos parágrafos 12 e 70. No parágrafo 65, a repetição irregular de “I” foi acomodada em “eu e tu a estiquemos”, mantendo os dois participantes da ação.
- Conservadas as descrições obscuras dos traços da primeira letra, sem reconstruir uma explicação ausente da fonte; mantidos os parênteses e os trechos em itálico.
- Acrescentada a nota do tradutor [^1], após o relato da distribuição dos grãos e da retirada das sobras por José, para identificar a antiga medida de capacidade.
- Acrescentada a nota do tradutor [^2], após a distribuição da colheita na forma latina, para explicar “peck”, medida empregada pela tradução inglesa, distinta do coro da primeira forma grega.
- Mantidas somente as referências bíblicas fornecidas: Lucas 2:41-52 e Lucas 1:28, nos mesmos lugares.
- No book.json, acrescentadas as entradas pt-BR de nome, autoria e título do sumário, além do idioma. A descrição bibliográfica em sources permaneceu integralmente como fornecida, pois é uma cadeia de texto, não um campo de traduções por idioma.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Leitura completa das três formas (76 parágrafos), do book.json e do diário. A tradução está fiel e completa; único ajuste: reduzir a nota [^1] ao que é certo.
- `pt-BR/ch001.md` [15]: “[^1]: *Nota do tradutor:* O coro é uma antiga medida de capacidade para produtos secos.” → “[^1]: *Nota do tradutor:* O coro é uma antiga medida hebraica de capacidade.” — Nota do tradutor sem respaldo na fonte. O coro também medía líquidos (Ez 45,14, coro de azeite), então a restrição a produtos secos não é certa; fica só o que é seguro.
- Rejected: pt-BR/ch001.md [4]-[35] — Auditoria mecânica: número de marcas de ênfase diferente do da fonte — A diferença vem dos números de parágrafo em negrito (**1.**), formato previsto nas regras da casa e no diário. Os itálicos da fonte estão mantidos.
- Rejected: pt-BR/ch001.md [35], [65] — Imperativo "faz" ao lado de "faze-me" — As duas formas são aceitas na norma para o imperativo de "fazer" com tu. Não é erro.
- Rejected: pt-BR/ch001.md [18] — "another master again" traduzido só por "outro mestre" — "Outro" já indica o novo mestre, e o sentido se mantém.
- Rejected: pt-BR/ch001.md [70] — "take him home with joy" traduzido por "deves levá-lo" e não pelo imperativo — É uma variação de modo que mantém o sentido de exortação. É escolha de estilo.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Lidos integralmente os 76 parágrafos, as duas notas, o book.json, o diário e os alertas mecânicos; encontrados dois defeitos menores.
- `pt-BR/ch001.md` [54]: “e sei que sois para mim como vasos” → “e sei que és para mim como vasos” — Jesus continua dirigindo-se ao mesmo mestre, tratado por tu nas demais orações; manter a concordância de tratamento.
- `pt-BR/translation-journal.md`: “após a primeira ocorrência de “coros”” → “após o relato da distribuição dos grãos e da retirada das sobras por José” — O marcador está depois de “José levou o que restou deles”, não depois da ocorrência de “coros”.
- Rejected: pt-BR/ch001.md [18] — “laughed at him” traduzido por “riu para ele”. — O contexto é de aprovação do testemunho do mestre; não exige entender o riso como escárnio.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [53]-[55], the footnotes and the journal fix: the two changes are correct and the paragraphs are clean.
- Rejected: pt-BR/ch001.md [54] — “és para mim como vasos”: a singular verb with a plural comparison — The source has “you are to me like vessels”, said to the one teacher. The singular verb is right and the simile stays plural, as in the source.
- Rejected: pt-BR/ch001.md [55] — “mortos por minha causa” and “atingidos por alguma enfermidade por suas palavras” for “through me” and “through His words” — The Portuguese keeps the source's ambiguity between cause and agency and does not narrow its meaning.
