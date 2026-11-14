# Diário de tradução — Documentos de fundação da Companhia (pt-BR)

Fonte: es-ES/, San Ignacio de Loyola - Documentos, PDF de Documenta Catholica Omnia (versões castelhanas das Fórmulas e dos Cinco Capítulos latinos; minuta castelhana de Inácio para a Forma da Companhia).
Destino: pt-BR.

## Termos

| Espanhol | Português | Notas |
|---|---|---|
| San Ignacio de Loyola | Santo Inácio de Loyola | como nas obras irmãs |
| Iñigo | Íñigo | nome que Inácio usa na minuta de 1541 |
| la Compañía / Compañía profesa | a Companhia / Companhia professa | |
| Prepósito / Prepósito general | Prepósito / Prepósito Geral | nota do tradutor |
| prelado / perlado | prelado | |
| Consejo | Conselho | maiúscula espelhada da fonte |
| Instituto / Fórmula / Constituciones / Regla | Instituto / Fórmula / Constituições / Regra | |
| Vicario (de Cristo) | Vigário | |
| Romano Pontífice / Sumo Pontífice | Romano Pontífice / Sumo Pontífice | |
| Sede Apostólica | Sé Apostólica | |
| su Santidad | Sua Santidade | |
| milicia de Jesucristo | milícia de Jesus Cristo | |
| ser soldado para Dios / militar para Dios | ser soldado de Deus / militar por Deus | |
| bandera de la Cruz | bandeira da Cruz | |
| celo, pero sin discreción | zelo, mas sem discrição | |
| provecho de las almas | proveito das almas | |
| probación / probar | provação / provar | |
| escolares / estudiantes | escolares / estudantes | |
| coadjutores | coadjutores | nota do tradutor |
| Profesos | Professos | |
| los Nuestros | os Nossos | maiúscula espelhada |
| bienes estables | bens de raiz | |
| proventos / rentas / censos / posesiones | proventos / rendas / censos / possessões | |
| derecho civil | direito civil | |
| colación (de bienes) | colação | |
| oficio divino | ofício divino | |
| Urbe | Urbe | Roma |
| Congregación | Congregação | |
| Sacrificios | Sacrifícios | maiúscula espelhada (missas) |
| cédula | cédula | voto escrito |
| voz (voto na eleição) | voto | |
| asunto (cargo) | encargo | |
| plática | prática | |
| oblación | oblação | como no *Diário espiritual* |
| Pascua de Flores | Páscoa Florida | nota do tradutor |
| Santo Pedro (de) Montorio | São Pedro in Montorio | |
| siete estaciones / siete iglesias | sete estações / sete igrejas | nota do tradutor |
| cántabros / saboyardos | cântabros / saboianos | nota do tradutor |
| nemine discrepante / dempto / tandem / etiam / in Domino / per ordinem / osculum pacis | idem em itálico | latim em itálico; glosados em nota |
| Regimini militantis Ecclesiae / Exposcit debitum | “Regimini militantis Ecclesiae” / “Exposcit debitum” | títulos das bulas entre aspas, como na fonte |

## Decisões

- Os trechos que fecham os parágrafos finais dos Cinco Capítulos, da Deliberação e da Forma (“La Deliberación de los primeros Padres”, “Forma de la Compañía y Oblación”, “La carta Magna de la Compañía-en 1540 y 1550-las Fórmulas del Instituto”) são títulos correntes do PDF vazados na extração, não texto do documento; foram omitidos.
- Na Fórmula de 1550, foram omitidos dois fragmentos de notas sobre modificações posteriores (CG XXXIV) que vazaram no texto: “y el Superior Mayor bajo cuya jurisdicción se encuentre la Casa o Colegio; cfr. CIC 616 §1).” em [1:4] e “carta de la Secretaría de Estado de 10 de junio de 1995).” em [4:2], que a própria fonte declara excluir. O resto da frase foi mantido.
- Corrigido em silêncio o ponto espúrio da Forma [1:4] (“no se hallaba. Con suficiencia”) e erros de digitação evidentes da fonte (“ea afirmando”, “consiente”, “alteres” etc.).
- As fórmulas latinas dos votos ficam em latim, em itálico; a tradução vai em nota do tradutor (Forma, nota 3), como também a glosa das demais expressões latinas (nota 1).
- Notas do tradutor: Cinco Capítulos 1 (Prepósito) e 2 (alusões a Lucas 14:28-30 e 12:35); Deliberação 1 (cântabros); Forma 1 (expressões latinas), 2 (Páscoa Florida e sete igrejas), 3 (tradução dos votos); Fórmula 1550 1 (Romanos 12:1) e 2 (coadjutores).
- “Ser soldado para Dios” → “ser soldado de Deus”; “militan para Dios” → “militam por Deus”.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of all five documents, source beside translation. One factual error fixed in Forma note 3 on the companions' vow formula; the text is otherwise faithful and complete.
- `pt-BR/forma-oblacion.md`: “A dos companheiros acrescenta “e a ti, Reverendo Padre, que tens o lugar de Deus” e, no fim, “prometo obedecer acerca da instrução das crianças nos rudimentos da fé”.” → “A dos companheiros é feita a Deus onipotente “e a ti, Reverendo Padre, que tens o lugar de Deus”, sem nomear aí o Sumo Pontífice, e termina com “prometo obedecer acerca da instrução das crianças nos rudimentos da fé”.” — Coduri's formula reads 'promitto omnipotenti, coram…, et tibi Reverende Pater'. It omits 'Deo et Summo Pontifici, eius in terris Vicario', and its last clause replaces 'me curaturum ut pueri erudiantur'; it does not add to it. The note presented both differences as additions. *(meaning)*
- Rejected: pt-BR/forma-oblacion.md [4]–[13], deliberacion-primeros-padres.md [2] — audit: emphasis markers differ — The extra markers are the italics on retained Latin (and the title Monumenta Ignatiana), as the house rules require.
- Rejected: pt-BR/translation-journal.md, Key Terms — audit: 'idem em itálico' does not occur in pt-BR — The cell describes how the row's terms are rendered; it is not a rendering. The Latin terms do appear in italics.
- Rejected: pt-BR/forma-oblacion.md [4] — parenthetical about Bobadilla is grammatically loose — It mirrors the source's own broken construction in Ignatius's minute. Not a translation defect.
- Rejected: pt-BR/forma-oblacion.md note 2 — Easter 1541 date and the list of the seven churches — Both are correct: Easter fell on 17 April, which fits Friday 22 April in the octave, and the seven basilicas listed are the traditional ones.
- Rejected: pt-BR/deliberacion-primeros-padres.md note 1 — identification of the cântabros as Ignatius and Xavier — The note hedges with 'provavelmente', and the identification is consistent with the companions' origins.
- Rejected: pt-BR/deliberacion-primeros-padres.md [2] — 'Monumenta Ignaciana' changed to 'Ignatiana' — This corrects the series' Latin title. It is a slip in the source, not a change of meaning.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 7 minor. Leitura integral dos cinco documentos, notas, book.json, diário e auditoria: sete defeitos menores de concordância e de tradução de uma locução.
- `pt-BR/cinco-capitulos.md` [8]: “prometa cada um que jamais tratarão” → “prometa cada um que jamais tratará” — O sujeito é «cada um»; o verbo deve ficar no singular.
- `pt-BR/cinco-capitulos.md` [8]: “mas que deixarão todo o cuidado” → “mas que deixará todo o cuidado” — Mantém a concordância com «cada um», sujeito da promessa individual.
- `pt-BR/forma-oblacion.md` [11]: “diz *a alta voce* as palavras seguintes” → “diz em voz alta as palavras seguintes” — A locução introdutória da fonte significa «em voz alta»; «a alta voce» conserva uma construção estrangeira fora da fórmula latina dos votos.
- `pt-BR/formula-1540.md` [8]: “prometa cada um que jamais tratarão” → “prometa cada um que jamais tratará” — O sujeito é «cada um»; o verbo deve ficar no singular.
- `pt-BR/formula-1540.md` [8]: “mas que deixarão todo este cuidado” → “mas que deixará todo este cuidado” — Mantém a concordância com «cada um», sujeito da promessa individual.
- `pt-BR/formula-1550.md` [7]: “que cada um de nós, e quantos daqui em diante fizerem a mesma profissão, esteja ligado” → “que cada um de nós e quantos daqui em diante fizerem a mesma profissão estejam ligados” — O sujeito composto inclui «cada um de nós» e «quantos [...] fizerem a mesma profissão» e exige concordância no plural.
- `pt-BR/formula-1550.md` [9]: “entenda cada um que não devem tratar” → “entenda cada um que não deve tratar” — A obrigação é atribuída individualmente a «cada um»; falta concordância no singular.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the seven agreement and locution fixes in cinco-capitulos, forma-oblacion, formula-1540 and formula-1550, with their neighbouring paragraphs and notes: all correct, no new defects.
- Rejected: pt-BR/formula-1550.md [7] — «estejam ligados» departs from the source's first-person «estemos ligados», which agrees with the later «nos obrigamos». — With a compound subject that includes «quantos [...] fizerem», the third person plural is grammatical, and the meaning is unchanged. This is a defensible choice.
- Rejected: pt-BR/forma-oblacion.md [11]–[12] — «em voz alta» replaced the Italianate «a alta voce»; it might need to be in italics or glossed in note 1. — «a alta voce» is not one of the Latin formulas the journal keeps, and [12] already renders the Spanish «a alta voz» the same way. The fix is consistent.
- Rejected: pt-BR/forma-oblacion.md [11], [12]; translation-journal.md Key Terms — Mechanical audit: the emphasis marker count differs, and «idem em itálico» does not occur in pt-BR. — Round 1 already rejected both. The extra markers are the italics on retained Latin, and the cell describes a rendering; it is not a rendering itself.
