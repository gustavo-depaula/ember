
## Termos

| chrism / holy chrism / unction | crisma / santo crisma / unção | “Crisma” no masculino, designando o óleo, conforme obras irmãs. |
| Hilary / Gratian / Decius / Maximinus / Maximus | Hilário / Graciano / Décio / Maximino / Máximo | Formas portuguesas; preservada a alternativa “Maximino (ou Máximo)” na fórmula consular. |
| Eleazar / Aaron / Ham / Shem / Japhet / Noah | Eleazar / Aarão / Cam / Sem / Jafé / Noé | |
| seat of the apostles / primates | sé dos apóstolos / primazes | |
| extraneous judgments / appeal / arraigned | julgamentos de fora / apelação / réu | Terminologia dos procedimentos judiciais da terceira epístola. |
| infamy / infamous | infâmia / infame | Condição também jurídica; nota do tradutor [^4]. |
| affinity / consanguinity / generation / degree | afinidade / consanguinidade / geração / grau | Preservada a distinção terminológica da fonte nos decretos matrimoniais. |
| oblation / presbyter / Lord’s Nativity | oblação / presbítero / Natividade do Senhor | |

## Decisões

- Traduzidos os 49 parágrafos 80–128, mantendo a correspondência individual e acrescentando apenas a definição da nota [^4].
- Mantido “tu” quando Hilário é destinatário individual; na exortação conjunta a ele e aos demais dirigentes da Igreja, emprega-se “vós”. Nas citações dirigidas a Deus, preservado o tratamento reverente por “vós”.
- Preservados “1 Timóteo 2:24”, o subtítulo “Dos julgamentos de fora” sem numeral e as duas ocorrências do título “Os Decretos do Papa Fabiano”. “Sirach xxviii” foi vertido como “Eclesiástico 28”.
- Preservadas as formulações incomuns sobre retirar “todo apoio e toda correção” (86), não serem “admirados” reciprocamente clérigos e leigos (88), as “quatro pessoas” da investigação judicial (89) e a purificação e a dádiva “com os ombros” (90), sem harmonizá-las com outras fontes.
- No parágrafo 100, “indulgence (*induciæ*)” foi traduzido por “dilação (*induciæ*)”, pelo contexto de concessão de prazo processual.
- Mantida a designação “Decretal de Graciano” (106), sem substituí-la por outro título.
- Nos decretos matrimoniais, preservadas “geração” e “grau” conforme cada ocorrência, sem converter os números para sistemas modernos de contagem de parentesco.
- Nota do tradutor [^4], após o parágrafo 89: esclarece o sentido jurídico de “infâmia” e sua relação com a capacidade de acusar ou testemunhar.

## Review log

### Round 1 (claude, full read)
Verdict: 4 meaning-level, 2 minor. Full read of 128 paragraphs: fixed three meaning misreadings ([66] 'em vez de execução', [71] reversed lawful/unlawful, [89] curia as 'tribunal'), one quotation drift ([12]) and two 'proibí' accent slips; the audit's parenthesis flags are dash-rendered asides, not defects.
- `pt-BR/ch001.md` [12]: “Cada um falou falsidade ao seu próximo” → “Cada um falou vaidade ao seu próximo” — source: "They spoke vanity every one with his neighbour"; 'falsidade' follows the familiar Bible wording instead of the source, which says 'vaidade' (as in 'que são vaidade' just before) *(meaning)*
- `pt-BR/ch001.md` [26]: “proibí o que é ilícito” → “proibi o que é ilícito” — imperative 'proibi' takes no accent (the final i follows a consonant, not a vowel in hiatus)
- `pt-BR/ch001.md` [66]: “(em vez de execução, *obductionis*)” → “(para a execução, *obductionis*)” — source: "veiling (for execution, obductionis)" glosses the veiling of a condemned man before execution; 'em vez de' (instead of) misreads 'for' *(meaning)*
- `pt-BR/ch001.md` [71]: “O que é lícito *para eles* não é lícito” → “*Para eles*, o que é lícito não é lícito” — source: "What is lawful is *with them* not lawful" means they treat the lawful as unlawful; the PT word order reads 'what is lawful for them is not lawful', which reverses the sense explained in the next sentence *(meaning)*
- `pt-BR/ch001.md` [88]: “proibí tais acusações” → “proibi tais acusações” — imperative 'proibi' takes no accent
- `pt-BR/ch001.md` [89]: “entregue ao tribunal (*curiæ*), ao qual deverá” → “entregue à cúria (*curiæ*), à qual deverá” — source: "given over to the court (curiæ), to which he shall devote himself zealously all the days of his life" is the penalty of lifelong service in the civic curia; one does not serve a tribunal for life, so 'tribunal' misinforms *(meaning)*
- Rejected: pt-BR/ch001.md [60]–[61] — source has 'know ye', 'ye who seek', 'devote yourselves', but the PT uses 'tu' throughout — the letter is addressed to Felix Subscribonius alone; the plurals read as honorific, and a consistent 'tu' is a defensible commitment
- Rejected: pt-BR/ch001.md [56], [61], [66], [75] — 'Dado' at the close of these letters vs 'Dada' elsewhere — both render Latin 'Datum' acceptably; it is a style choice and does not change the sense
- Rejected: pt-BR/ch001.md [80] — 'Evil communications' rendered as 'más companhias' — a defensible rendering of the sense (Greek homiliai = company); it does not misinform the reader

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 9 minor. Leitura integral dos 128 parágrafos, das quatro notas, do book.json e do diário: um defeito de sentido e nove defeitos menores.
- `pt-BR/ch001.md` [24]: “depois da penitência.)**” → “depois da penitência.**” — Parêntese de fechamento sem abertura, reproduzido da fonte.
- `pt-BR/ch001.md` [27]: “tomam parte com tais pessoas.)” → “tomam parte com tais pessoas.” — Parêntese de fechamento sem abertura.
- `pt-BR/ch001.md` [29]: “pessoas excomungadas ou com infiéis.)” → “pessoas excomungadas ou com infiéis.” — Parêntese de fechamento sem abertura.
- `pt-BR/ch001.md` [31]: “sobre a transferência de bispos.)” → “sobre a transferência de bispos.” — Parêntese de fechamento sem abertura.
- `pt-BR/ch001.md` [33]: “sobre as acusações que as leis rejeitam.)” → “sobre as acusações que as leis rejeitam.” — Parêntese de fechamento sem abertura.
- `pt-BR/ch001.md` [34]: “e aos quais admitem ao direito de herdar” → “e os quais admitem ao direito de herdar” — Na construção 'admitir alguém ao direito', a pessoa admitida é objeto direto.
- `pt-BR/ch001.md` [65]: “e delas a excluímos para os tempos futuros” → “e as excluímos dela para os tempos futuros” — Os pronomes foram invertidos: excluem-se as pessoas da função.
- `pt-BR/ch001.md` [65]: “para que não só o anunciado julgamento de Deus” → “para evitar que não só o anunciado julgamento de Deus” — A fonte usa 'lest': pretende evitar o julgamento e a perdição. 'Para que não só... mas também' apresenta esses resultados como finalidade desejada. *(meaning)*
- `pt-BR/ch001.md` [98]: “for acusado de imputações precisas” → “for acusado com base em imputações precisas” — A fonte diz 'accused on precise charges': as imputações fundamentam a acusação, não são o delito imputado.
- `pt-BR/ch001.md` [104]: “Que todos se guardem dessas coisas e “guarda tua língua do mal, e teus lábios de falar engano”.” → “Guardai-vos todos dessas coisas e “guardai vossa língua do mal, e vossos lábios de falar engano”.” — Os comandos coordenados dirigidos a todos exigem concordância de pessoa e número; o inglês 'your' permite o plural.
- Rejected: pt-BR/ch001.md [28], [46], [65], [79], [89], [90] — Diferenças na quantidade de parênteses apontadas pela auditoria. — Os apartes correspondentes estão integralmente preservados entre travessões.
- Rejected: pt-BR/ch001.md [60] — 'Depois de sua doença' parece destoar da menção anterior à morte do irmão. — A fonte diz expressamente 'after his disease'; o contexto não basta para estabelecer um erro inequívoco de OCR.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [23]-[35], [64]-[66], [97]-[99], [103]-[105]: all ten fixes from the previous round are correct, and the shown paragraphs have no new defects.
- Rejected: pt-BR/ch001.md [65] — 'para evitar que não só … mas também' might read as a double negation — 'não só … mas também' is a correlative pair, not a negation. 'evitar que' carries the source's 'lest' correctly over both members.
- Rejected: pt-BR/ch001.md [104] — The quotation 'keep your tongue from evil' (Ps 34:13, singular in the Hebrew) was changed to the plural 'guardai vossa língua' — The source's 'your' is ambiguous. In the sentence it is coordinated with a command addressed to all, so the plural is a defensible and consistent commitment.
- Rejected: pt-BR/ch001.md [66] — 'para que tua força não seja … despedaçada …, e esta consuma tuas folhas' might lose the negation of 'lest' in the second clause — In Portuguese, 'para que não' extends naturally to coordinated subjunctives, so the sense of 'lest' is kept.
- Rejected: pt-BR/ch001.md [34] — 'e os quais admitem ao direito de herdar' is awkward — It is grammatical: the relative is the direct object of 'admitir alguém a algo'. Only the style is open to dispute.
