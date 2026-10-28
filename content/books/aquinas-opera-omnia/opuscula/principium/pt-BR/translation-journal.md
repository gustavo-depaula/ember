# Diário de tradução — Sermões Inaugurais (Rigans montes / Hic est liber) (pt-BR)

Fonte: la/ — edição latina Leonina / Marietti (domínio público), espelhada de dhspriory.org pelo repositório Geremia/AquinasOperaOmnia. A tradução inglesa (en-US) foi consultada só para registro e terminologia.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| principium | sermão inaugural | ch001 [38]; no título do livro, "Sermões Inaugurais" |
| commendatio / commendare | recomendação / recomendar | título da Parte 1; *commendatur nobis sapientia* = "a sabedoria nos é recomendada" |
| partitio | divisão | título da Parte 2 |
| eloquium | discurso; palavras (nos Salmos) | como em `contra-errores-graecorum` |
| verbum (o Filho) / verbum, sermo (palavra) | Verbo / palavra | "Verbo" também em Eclesiástico 1 (*verbum Dei in excelsis*) |
| sacra doctrina | doutrina sagrada | |
| doctor / auditor | doutor / ouvinte | *doctores Ecclesiae* = "doutores da Igreja"; *doctor doctorum* = "doutor dos doutores" |
| praedicare / legere / disputare | pregar / lecionar / disputar | os três ofícios do mestre; *lectio* = "lição", *disputatio* = "disputa" |
| virtus | virtude | potência operativa, também em Romanos 1 ("virtude de Deus"), como nas obras irmãs |
| mandatum coactorium / monitorium | mandamento coercitivo / admonitório | |
| rex / praeco / nuntius / pater | rei / arauto / mensageiro / pai | |
| Agiographi / apocryphi | hagiógrafos / apócrifos | minúscula no texto |
| lex publica / privata | lei pública / privada | |
| virtutes politicae / purgatoriae / purgati animi / exemplares | virtudes políticas / purificadoras / da alma purificada / exemplares | graus de Plotino |
| superiora (Sl 103 [104]:13) | alturas | "de suas alturas"; Glosa *de altioribus archanis* = "dos arcanos mais altos" |
| munitio / muniti | fortificação / fortificados | ch002 [16] e [19] |
| improperare | lançar em rosto | |
| dominus | Senhor | o latim escreve em minúscula |
| spiritus sanctus | Espírito Santo | maiúsculas, como nas obras irmãs |
| Angelus | anjo | minúscula, como nas obras irmãs |
| Eccli. / Eccle. / Cant. | Eclesiástico / Eclesiastes / Cântico dos Cânticos | *cantica* (ch001 [32]) = "os Cânticos" |
| Paralipomenon | Paralipômenos | |
| Augustinus / Dionysius / Damascenus / Gregorius / Hieronymus / Plotinus | Agostinho / Dionísio / Damasceno / Gregório / Jerônimo / Plotino | |
| Glossa | a Glosa | |

Obras citadas em itálico: *Da Doutrina Cristã*, *Da Trindade* (Agostinho); *Hierarquia Eclesiástica* (Dionísio); *Regra Pastoral*, *Morais* (Gregório).

## Decisões

- Traduzido do latim. As referências bíblicas seguem o latim: só o capítulo onde ele dá só o capítulo (algarismos romanos convertidos), capítulo:versículo onde dá o versículo (Gênesis 2:17). "Psalm." sem número = "Salmo"; "Marc. ult." = "Marcos, último capítulo". Não foram importados os números de versículo da tradução inglesa.
- A epígrafe do cap. 1 (Baruc 4:1) não tem referência no latim; não foi acrescentada.
- Os títulos "**Pars 1 / Commendatio…**" e "**Pars 2 / Partitio…**" vêm no latim com um negrito aberto num parágrafo e fechado no seguinte, o que não renderiza. Cada parágrafo recebeu o seu próprio negrito. A ordem latina da Parte 2 foi mantida (a inglesa a inverte).
- "Caput 1–4" dentro do cap. 2 = "**Capítulo 1**" etc., em negrito como no latim.
- Tratamento: "vós" nas palavras dirigidas a Deus (Salmos, João 6:69, Sl 103 [104]:13 "vossas obras"); "tu" quando Deus ou o sábio falam a uma só pessoa.
- Citações bíblicas traduzidas do latim de Tomás, sem harmonizar com bíblias portuguesas (ex.: Romanos 11 "Ó altura", Sl 118 "justificações", Sl 103 "regando de suas alturas", com a mudança de pessoa do original).
- ch001 [31]: o latim diz *Iosue* entre os hagiógrafos, embora [26] ponha Josué entre os profetas (o sentido sugere Daniel). Mantido "Josué" como na fonte, sem nota.
- ch001 [37]: *quousque sponsa in thalamum…* não tem verbo; vertido por "até a entrada da esposa no tálamo".
- Encarnação, Paixão e Ressurreição de Cristo com maiúscula; "ressurreição dos ossos" em minúscula.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1–38] and ch002 [1–32] against la/, plus book.json and the journal; one minor tense fix in ch002 [30], otherwise clean.
- `pt-BR/ch002.md` [30]: “esse me servia” → “esse me serviu” — o latim de Tomás tem o perfeito *ministravit*; 'servia' é imperfeito
- Rejected: journal, Key Terms 'improperare' — audit counts 0 'lançar em rosto' in pt-BR — the row gives the infinitive; conjugated forms occur at ch001 [26] 'lança em rosto', ch002 [16] 'se lança em rosto' and ch002 [31] 'não lança em rosto'
- Rejected: emphasis-marker flags (ch001 [2],[3],[12],[13],[5],[19],[20],[38]; ch002 [4],[5],[17],[27]) — emphasis counts differ from the source — the split bold headings were closed per paragraph, a decision recorded in the journal; the extra italics mark work titles and the Greek words *agios*, *graphia*, *apo*, *cryphon*
- Rejected: pt-BR/ch001.md [8] — 'crede também em mim' adds 'também' to *et in me credite* — an idiomatic rendering of the coordinating *et*; the sense is unchanged
- Rejected: pt-BR/ch001.md [10] — *Veritas Scripturae huius doctrinae* rendered 'A verdade da doutrina desta Escritura' — the Latin genitive chain is ambiguous; the reading parallels 'desta Escritura' in [7] and [11] and keeps the sense
- Rejected: pt-BR/ch001.md [27] — *Et hoc dicitur* rendered 'E isto se faz' — the sense (the prophets set forth the edicts, first in general) is unchanged
- Rejected: pt-BR/ch001.md [31] — *obviare insidiis* rendered 'evitar as ciladas' — *obviare* includes preventing or warding off; the rendering is defensible

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral de ch001 [1–38], ch002 [1–32], book.json e diário: um defeito de sentido; alertas mecânicos justificados.
- `pt-BR/ch001.md` [28]: “e por isso se dizia:” → “e por isso dizia:” — O latim traz «dicebat», ativo, com Jeremias como sujeito na sequência da frase. A tradução impessoal altera a atribuição da fala; deve-se conservar a formulação da fonte, mesmo que a citação pareça inadequada. *(meaning)*
- Rejected: Auditoria: marcadores de ênfase — Contagens de ênfase diferentes em 12 parágrafos. — As diferenças correspondem ao fechamento dos títulos em negrito e aos itálicos de títulos de obras e expressões conservadas, conforme as decisões registradas.
- Rejected: Diário: improperare — Nenhuma ocorrência literal de «lançar em rosto». — A tabela registra o infinitivo; as três ocorrências conjugadas estão em ch001 [26], ch002 [16] e ch002 [31].

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [27–29]: the round-2 fix in [28] ('e por isso dizia') is correct and fits its sentence; no new defects.
- Rejected: pt-BR/ch001.md [28] — *dissolvit* rendered in the present ('afrouxa'), though the form could be perfect — In Jer 38:4 the princes describe Jeremiah's ongoing conduct; the present tense is the right reading
- Rejected: pt-BR/ch001.md [28] — 'era' added in 'Teu pai era amorreu' — The Latin nominal sentence needs a copula in Portuguese; the sense is unchanged
- Rejected: pt-BR/ch001.md [29] — *Evangelistis* capitalized in the Latin, 'evangelistas' lowercase in pt-BR — This is a capitalization choice and does not change the sense
- Rejected: audit: emphasis markers and improperare — Mechanical flags — Rounds 1 and 2 already rejected these with reasons; there is no new argument
