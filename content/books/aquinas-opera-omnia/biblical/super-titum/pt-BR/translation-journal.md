# Diário de Tradução — Comentário à Epístola a Tito (pt-BR)

Fonte canônica: `la/` (texto Leonino / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Larcher, revisado pelo Aquinas Institute), só para registro e terminologia; estrutura e texto seguem o latim, conforme o precedente de *Do Ente e da Essência*, do *Comentário a Filêmon* e do *Comentário à Segunda Epístola aos Tessalonicenses*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Pr. / C. N / Lectio N | Pr. / C. N / Lição N | Como em *2 Tessalonicenses*. |
| salutatio / epistolaris narratio | saudação / narração epistolar | |
| ibi (divisão do texto) | onde diz | |
| et cetera / id est / scilicet / quasi dicat | etc. / isto é / a saber / como se dissesse | |
| Apostolus / Glossa / Philosophus / Tullius | o Apóstolo / a Glosa / o Filósofo / Túlio | "Túlio", como em *Filêmon*. |
| praelatus / subditus | prelado / súdito | |
| paterfamilias | pai de família | |
| caritas / dilectio | caridade / amor | Conforme as obras irmãs. |
| amare / diligere (2, 4) | amar / querer bem | O n. 55 distingue *ament* (amor mais ardente, aos maridos) de *diligant* (mais natural, aos filhos); por isso dois verbos. |
| servus / servitus | servo / servidão | Como em *Filêmon*. |
| crimen / peccatum | crime / pecado | O n. 13 os distingue. |
| presbyter / episcopus | presbítero / bispo | |
| sine crimine | sem crime | |
| unius uxoris vir | marido de uma só mulher | |
| non subditos (1, 6) | insubmissos | Glosa: *non obedientes* → "não obedientes". |
| percussor / percutere | espancador / ferir | A segunda glosa do n. 19 (*non percutientem conscientias*) usa "ferir". |
| vinolentus | dado ao vinho | |
| turpis lucri cupidus | cobiçoso de lucro torpe | |
| sermo fidelis | palavra fiel | |
| fides bona (2, 10) | boa-fé | Honestidade no serviço, oposta à fraude (n. 65); composto com hífen. |
| doctrina sana | sã doutrina | |
| arguere / redarguere / increpare | repreender / refutar / repreender | |
| vaniloquus / seductor | vão falador / sedutor | |
| habitus (2, 3) | traje | Também 1 Tm 2, 9. |
| criminatrix | caluniadora | |
| gravitas / integritas | gravidade / integridade | |
| imperium (2, 15) | império | Glosa: *cum auctoritate*. |
| erudire | instruir | |
| saecularia desideria / tempora saecularia | desejos seculares / tempos seculares | |
| benignitas / humanitas | benignidade / humanidade | |
| lavacrum regenerationis | banho da regeneração | |
| praeesse (3, 8; 3, 14) | presidir | O n. 97 o lê como presidir aos fiéis; verso vertido de modo igualmente aberto. |
| insipientes / errantes | insipientes / errantes | |
| haereticus / haeresis | herege / heresia; *haeresis* na etimologia | “Heresia” nos n. 64 e 68; no n. 102 conserva-se *haeresis*, explicado como “escolha”. |
| correptio | correção | |
| Titus, Creta, Epimenides, Artemas, Tychicus, Zenas, Apollo, Nicopolis | Tito, Creta, Epimênides, Ártemas, Tíquico, Zenas, Apolo, Nicópolis | |
| Hieronymus, Augustinus, Ambrosius, Dionysius, Boetius, Arrius, Manichaei, Thalmuth | Jerônimo, Agostinho, Ambrósio, Dionísio, Boécio, Ário, maniqueus, Talmude | |

## Decisões

- `book.json`: "Santo Tomás de Aquino" como autor e "Comentário à Epístola a Tito" como nome, no padrão das obras irmãs; pt-BR acrescentado a `name`, `author`, `description` (o campo já existia), `languages` e aos títulos do sumário. Os títulos traduzem os cabeçalhos dos arquivos (que o `la/` traz em inglês), com a referência bíblica em estilo português.
- Referências bíblicas com abreviaturas portuguesas e "capítulo, versículo" (`Mt 24, 45`). Numeração e nomes da Vulgata mantidos (Sl 115, 1 Rs = *I Reg.*, 3 Rs = *III Reg.*, 2 Rs = *II Reg.*, Eclo, Ecl, 2 Cr = *II Par.*). *Ab.* (Habacuc) → Hab; *Abd.* (Abdias) → Ab. `ult.` → "No último capítulo de …"; `cap. unico` → "capítulo único". Citações sem número (*Eccli.:*, *Prov. XIII*, *Io. XIV*) ficam como estão; citações erradas da edição são espelhadas, não corrigidas pelo inglês (p. ex. 1 Cor 8, 10 para "ferindo a consciência fraca", n. 19).
- Citações bíblicas traduzidas da redação latina do texto, sem harmonizar com outra Bíblia; em itálico, sem aspas, como no latim. Os lemas seguem o latim mesmo quando diferem do versículo (n. 44 *mentes* contra *mens*; n. 60 *praebe te in exemplum omnibus*; n. 66 *Salvatoris nostri Domini*; n. 105 *discant autem et vestri* contra *nostri*; n. 102 *post primam et secundam*).
- Estrutura espelhada linha a linha: marcadores `^c:v^`, blockquotes irregulares, as linhas "Lição N" sem ênfase, as linhas de versículo inteiramente enfatizadas (2, 1; 2, 11), as marcas `[n. N]`, os "E" pendentes antes das divisões e os números de parágrafo no formato da fonte (`**3**.`). Os segmentos de ênfase quebrados da fonte (c02 título da Lição 3; n. 52; n. 74; n. 105) foram reproduzidos tal como estão.
- Etimologias latinas mantidas em itálico, porque o argumento depende da palavra: *fur* / *furno* (n. 1, espelhado como está na edição), *bestiae* / *vastiae* (n. 31), *bria* (n. 71), *bona igneitas* (n. 88), *haeresis* (n. 102).
- n. 97, *confirmes viatores, id est, praelatos*: vertido literalmente ("os viajantes, isto é, os prelados"), como o en-US.
- Nenhuma nota de editor na fonte; nenhuma nota do tradutor acrescentada.

## Edições no texto-fonte

- `la/titus-c04.md`, n. 85: *quaelibet alia vita* → *quaelibet alia vitia*. Erro de digitalização; o contexto (*ut sunt ambitio et avaritia*) e o en-US ("other vices") exigem *vitia*.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo contra `la/`, incluindo citações, lemas e referências. Veredito: **ISSUES 6**, todos corrigidos. Localizações `[n]` abaixo seguem os blocos das cópias de leitura.
- Correções:
  - `titus-c02` [57], n. 14: “várias meretrizes, o que é mais incontinente” → “várias meretrizes, que são mais incontinentes”; *quae magis sunt incontinentes* qualifica o antecedente feminino plural, não o ato.
  - `titus-c02` [101], n. 26: “vaniloquio” → “vanilóquio”; acentuação do substantivo português que traduz *vaniloquio*.
  - `titus-c02` [102], n. 27: “repreende, suplica, increpa” → “repreende, suplica, repreende”; *argue, obsecra, increpa* passa a seguir a equivalência já fixada de *increpare* no glossário.
  - `titus-c03` [42], n. 52: “com os cães do meu rebanho” → “com os meus cães”; *cum canibus meis* não contém rebanho.
  - `titus-c03` [112], n. 68: “e nosso Salvador” → “e do nosso Salvador”; *et Salvatoris nostri* é genitivo dependente de *gratia*.
  - `titus-c04` [119], n. 105: “provêm aos seus pregadores” → “proveem aos seus pregadores”; *provident* é prover, não provir.
- Achados rejeitados:
  - `titus-c01` [7], *fur a furno dicitur*: “*fur* (ladrão) … *furno*”; `titus-c02` [114], *bestiae dicuntur, quasi vastiae*: “*bestiae* (feras) … *vastiae*”; `titus-c04` [57], *bona igneitas*: “*bona igneitas* (bom ardor)”. Os parênteses traduzem palavras conservadas para a etimologia; as diferenças de ênfase não indicam omissão ou acréscimo substantivo.
  - `titus-c02` [51], *in libro de Eccl. Hierar.* → “no livro *Da Hierarquia Eclesiástica*”: itálico de título permitido; `titus-c03` [121], *bria enim mensura est* → “pois *bria* é medida”: itálico do vocábulo retido permitido.
  - `titus-c04` [23], *principibus … et potestatibus … subditos esse*: “a que estejam submissos aos príncipes … e às potestades”. A ordem portuguesa reúne segmentos de ênfase; não perde o verbo nem as glosas.
  - Aspas retas: `titus-c02` [26], *accipitur aeternum* → “se toma "eterno"”; [145], *hoc nomen stultus* → “este nome "estulto"”; `titus-c03` [40], *forte vel fere* → “"talvez" ou "quase"”; `titus-c04` [32], *hic blasphemare* → “aqui "blasfemar"”; [106], *huius nominis haereticus* → “deste nome "herege"”. Emprego metalinguístico legítimo; `books.md` veda normalização de aspas neste tipo de revisão. Em [106], *haeresis dicitur electio* → “*haeresis* quer dizer escolha” também justifica o itálico adicional.
  - Glossário *vaniloquus*: em `titus-c02` [78], [101], *vaniloqui* → “vãos faladores”, plural regular de “vão falador”; a ausência literal do singular não invalida a tabela.
  - `titus-c03` [47], *coram matre mea, et docebat me* → “diante de minha mãe, e ela me ensinava”: o sujeito feminino é defensável no contexto do ensino doméstico materno; o latim não marca gênero no verbo.
  - `titus-c03` [139], *peccantes coram omnibus argue* → “repreende diante de todos os que pecam”: considerou-se mudar a ordem, mas “diante de todos” pode ser adjunto e “os que pecam” objeto posposto. A ambiguidade não confirma defeito objetivo; texto preservado.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-1.md`.

### Round 2

- Foco: leitura bilíngue cláusula a cláusula contra `la/`. Veredito: **ISSUES 1**, corrigido.
- Correção:
  - `titus-c02` [54], n. 13: “Se alguém houver tal.” → “Se alguém for tal.”; *Si quis talis erit* é cópula (objeção que 1 Jo 1, 8 responde); “haver” com sujeito “alguém” não forma frase.
- Achados rejeitados:
  - `titus-c02` [55], n. 14, *leges Romanas, quibus Apostolus scribebat* → “sob as quais viviam aqueles a quem o Apóstolo escrevia”: expansão do dativo *quibus* (os romanos destinatários); o argumento não muda.
  - `titus-c02` [69], n. 19, *incendium irae* → “o incentivo da ira”: figura do que ateia a ira; sentido preservado.
  - `titus-c03` [45], n. 53, *Quantum ad convictum* → “Quanto à convivência”: o latim traz *convictum*, não *victum*; vertido como em n. 52 (*per convictum* → “pela convivência”).
  - `titus-c02` [138], n. 38, *pseudo quidam* → “alguns falsos”: elipse da própria fonte, mantida.
  - `titus-c04` [123], n. 106, *in fide Christi existentes* → “na fé de Cristo, por estarem nela”: leitura causal do particípio, apoiada pelo *quia* seguinte.
  - `titus-c04` [102], n. 100, *intromittendum se* → “Não se deve … intrometer”: um só “se” acumula valor impessoal e reflexivo; português aceitável.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-2.md`.

### Round 3

- Foco: leitura fria integral do pt-BR antes do latim, seguida de varredura de ortografia, diacríticos, crase, hifenização e pontuação. Veredito: **ISSUES 2**, corrigidos (contagem por ocorrência).
- Correções:
  - `titus-c03` [71], Tt 2, 10: “boa fé” → “boa-fé”; *fidem bonam* designa honestidade no serviço, substantivo composto com hífen.
  - `titus-c03` [95], n. 65: “boa fé” → “boa-fé”; mesma correção no lema, cuja glosa *sine fraude* confirma o sentido. Equivalência registrada nos Termos-chave.
- Achados rejeitados:
  - titus-c02 [153], n. 43: “e infiéis, isto é, que têm má fé” / *et infidelibus, id est, qui habent malam fidem*. Não substituir por “má-fé”: neste contexto a glosa qualifica a fé religiosa dos infiéis, e não necessariamente uma intenção dolosa. Adjetivo e substantivo podem permanecer separados.
  - titus-c02 [54], n. 13: “Se alguém for tal.” / *Si quis talis erit.*. A frase suspensa vem da fonte, seguida pela objeção bíblica e sua resposta. A correção da cópula feita na rodada 2 está presente; completar a oração seria explicitação editorial.
  - titus-c02 [69], n. 19: “as minhas faces aos que mas arrancavam” / *et genas meas vellentibus*. “Mas” é a contração de “me” e “as”, cujo antecedente é “faces”; não é a conjunção adversativa. A imagem estranha reproduz o objeto expresso no latim. Não substituir por uma barba ausente da fonte.
  - titus-c02 [87], n. 23: “A matéria do estudo não devem ser fábulas” / *Materia studii non debent esse fabulae*. A concordância de “ser” com o predicativo plural é admissível também na locução verbal. Não corrigir automaticamente “devem” para “deve”.
  - titus-c02 [88], n. 23: “Mas alguns estudam nelas de dois modos” / *Sed aliqui student in eis dupliciter*. A retomada plural é pouco transparente, mas já está em “eis”; pode retomar as matérias de estudo em discussão. Não substituir por um antecedente singular que a fonte não explicita.
  - titus-c02 [111], n. 30: “ele que dizia convir que ele morresse” / *qui dicebat expedire eum mori*. Os dois pronomes têm referentes distintos: Caifás, que fala, e aquele cuja morte ele propõe. O contexto de Jo 11 e o contraste entre “qui” e “eum” tornam a referência recuperável; não há afirmação de que Caifás propunha a própria morte.
  - titus-c02 [135], n. 36: “a própria doutrina […] são fábulas” / *ipsa doctrina […] sunt fabulae*. Concordância admissível de “ser” com o predicativo plural; a fonte faz a mesma identificação. Não se confirmou erro de concordância.
  - titus-c03 [48], n. 53: “E diz bem para que ensinem a prudência às anciãs mais do que aos varões” / *Et bene dicit ut prudentiam doceant magis ad anus quam ad viros*. “Às anciãs” pode depender de “diz”, fora do lema destacado, como “ad anus” na fonte. O parágrafo explica por que a incumbência é dirigida às anciãs; não é necessário alterar o destinatário do ensino.
  - titus-c03 [100], [120]–[122], [125], n. 71–72: “vivamos sóbria, e justa, e piamente; Sóbria, quanto a si mesmo; Justa, quanto ao próximo; vivamos sóbria, pia e justamente” / *sobrie, et juste, et pie vivamus; Sobrie ad se; Iuste ad proximum; sobrie et pie et iuste vivamus*. As formas sem “-mente” participam da coordenação adverbial; os lemas isolados retomam essa redação. Não são adjetivos que exijam concordância com “nós”.
  - titus-c04 [26], n. 79: “se deve obedecer antes a Deus, quanto maior ele é” / *magis Deo obediendum est, quo maior est*. A comparação relaciona a precedência da obediência com a superioridade de Deus. A redação é incomum, mas a relação é recuperável e corresponde a “magis […] quo maior”; reformular por fluência não seria correção objetiva.
  - titus-c04 [71], n. 95: “e que também por isto se tornem herdeiros” / *et quod etiam per hoc efficiantur haeredes*. A passagem do homem genérico singular aos beneficiários plurais já ocorre no latim e retoma os justificados/herdeiros do contexto. Não impor singular à conclusão.
  - titus-c04 [102], n. 100: “Não se deve, pois, intrometer” / *Non est ergo intromittendum se*. Mantida a decisão da rodada 2: a construção admite a leitura impessoal/reflexiva sem duplicação obrigatória de “se”.
  - titus-c01 [7], n. 1 — ênfase e parênteses: “fur (ladrão) se diz de furno” / *fur a furno dicitur*. Os termos latinos conservados para a etimologia recebem itálico; o parêntese traduz “fur”. Não há conteúdo novo independente.
  - titus-c02 [51], n. 12 — ênfase: “no livro Da Hierarquia Eclesiástica” / *in libro de Eccl. Hierar.*. O itálico adicional é o do título da obra, permitido pelas diretrizes.
  - titus-c02 [114], n. 31 — ênfase e parênteses: “bestiae (feras) como que vastiae” / *bestiae dicuntur, quasi vastiae*. O parêntese traduz a palavra conservada para a etimologia; os itálicos adicionais identificam esses vocábulos latinos.
  - titus-c03 [121], n. 71 — ênfase: “pois bria é medida” / *bria enim mensura est*. Itálico adicional legítimo do vocábulo latino retido.
  - titus-c04 [23], n. 78 — ênfase: “a que estejam submissos aos príncipes […] e às potestades” / *principibus […] et potestatibus […] subditos esse*. A ordem portuguesa reúne segmentos destacados; preserva submissão, destinatários e glosas.
  - titus-c04 [57], n. 88 — ênfase e parênteses: “bona igneitas (bom ardor)” / *bona igneitas*. Tradução breve da expressão etimológica conservada em latim; itálico e parênteses justificados.
  - titus-c02 [26], n. 7 — aspas: “se toma "eterno"” / *accipitur aeternum*. Aspas retas pareadas em emprego metalinguístico; books.md proíbe sua normalização nesta revisão.
  - titus-c02 [145], n. 40 — aspas: “este nome "estulto"” / *hoc nomen stultus*. Aspas metalinguísticas pareadas; não há defeito.
  - titus-c03 [40], n. 52 — aspas: “"talvez" ou "quase"” / *forte vel fere*. Ambos os pares delimitam advérbios citados como palavras; não há defeito.
  - titus-c04 [32], n. 81 — aspas: “aqui "blasfemar"” / *hic blasphemare*. Aspas metalinguísticas pareadas; não há defeito.
  - titus-c04 [106], n. 102 — aspas e ênfase: “deste nome "herege"; haeresis quer dizer escolha” / *huius nominis haereticus; haeresis dicitur electio*. Aspas metalinguísticas pareadas e itálico adicional do termo grego conservado em transliteração latina; não há defeito.
  - glossário vaniloquus; titus-c02 [78], [101]: “vãos faladores; vanilóquio” / *vaniloqui; vaniloquio*. “Vãos faladores” é o plural regular de “vão falador”. A contagem por radical inclui “vaniloquio”, traduzido por “vanilóquio”, não uma terceira ocorrência exigível do adjetivo. A tabela não faz uma afirmação falsa ao registrar o singular lexical.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-3.md`.

### Round 4

- Foco: palavras funcionais, cabeçalhos e escolhas forçadas (gênero, antecedente, tu/vós). Veredito: **CLEAN**, sem alterações.
- Achados rejeitados:
  - `titus-c04` [36], n. 83, *considera te qualis fueris* → “considera quem tu foste”: “quem foste” também indica a qualidade da pessoa. O imperativo singular segue o latim.
  - `titus-c04` [115], n. 105, *Alios misit* → “Enviou os outros”: o artigo retoma os dois discípulos recém-nomeados, distintos de Tito.
  - `titus-c03` [69], Tt 2, 8, *verbum sanum* → “com palavra sã”: a preposição liga o acusativo a *praebe exemplum … in*. O sentido não muda.
  - `titus-c03` [137], n. 75, 1 Pd 2, 10 → “vós que outrora não éreis o seu povo”: o português exige pessoa verbal; a 2.ª do plural segue os destinatários do versículo.
  - `titus-c02` [168], n. 46, *Tertio tertium* → “a terceira”: concorda com “três coisas” do bloco anterior.
  - `titus-c03` [57], n. 55, *adolescentulas et viros* → “aos maridos”: *viros* retoma *viros suos*.
  - Tu/vós: as paráfrases dirigidas a Tito usam tu (c03 [14], [76]; c04 [23], [118]); *detis*, *vobis* e *vestri* (c03 [63], [80]; c04 [115], [119], [124]) usam vós. Tudo confere com o latim.
  - Rótulos sem artigo (`titus-c02` [76] “Reprovação dos hereges”, [118] “Mentirosos”; `titus-c04` [79] “Evita os hereges”): seguem a forma do rótulo latino. É questão de estilo.
  - `titus-c03` [124] “instrui-o”, `titus-c04` [104] “que são os hereges” e [113] “acerca dele mesmo” deixam o referente tão aberto quanto *eum*, *quod haeretici* e *ipsum*.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-4.md`.


### Round 5

- Foco: termos em ambos os sentidos, afirmações do diário e nomes próprios, com leitura integral contra `la/`. Veredito: **ISSUES 3**, corrigidos (duas ocorrências nos capítulos e uma entrada do glossário).
- Correções:
  - `titus-c02` [18], n. 5: “isto é, quando virmos face a face” → “a saber, quando virmos face a face”; *scilicet quando videbimus facie ad faciem*. Adequação à equivalência expressamente fixada de *scilicet*, sem mudança do sentido.
  - `titus-c02` [161], n. 45: “isto é, com os lábios exteriores” → “a saber, com os lábios exteriores”; *scilicet labiis exterioribus*. Mesma divergência da equivalência fixada.
  - Termos-chave, *haeresis*: “*haeresis* (escolha)” → “heresia; *haeresis* na etimologia”. A entrada sem restrição não descrevia *Haeresis enim incepit* → “começou […] a heresia” (`titus-c03` [89], n. 64) nem *in ignorantia et haeresi* → “na ignorância e na heresia” ([114], n. 68). A retenção latina e “escolha” pertencem à explicação etimológica de `titus-c04` [106], n. 102; os capítulos já estão corretos.
- Achados rejeitados:
  - *vaniloqui* → “vãos faladores” (`titus-c02` [78], [101]): duas ocorrências; *vaniloquio* → “vanilóquio” ([101]) é substantivo distinto, não terceira ocorrência do adjetivo. O singular lexical da tabela é válido.
  - Colisões na busca inversa: *amor* e *dilectio* → “amor” (c03 [41]); *famuli/famulus* → “servos/servo” (c01 [7]); *instruat* → “instrua” (c02 [88]); *correctione/correctionem* → “correção” (c02 [50], c03 [79]); *reprehendi* → “repreendê-los” (c02 [132]). São sinônimos contextuais legítimos, não substituições de conceitos distintos; a busca inversa não torna o glossário uma bijeção. *Subditos esse* → “sejam submissos” (c03 [70]) é construção adjetival, não ocorrência do substantivo “súdito”. *Errans* → “quem […] erra” (c04 [107]) conserva o particípio por uma oração relativa. *Habitus* → “hábito” (c02 [13]) e *habitu* → “porte” (c04 [58]) estão fora do escopo de Tt 2, 3 fixado para “traje”. *Ibi* → “ali” (c04 [83]) não é divisão do texto.
  - Flags de ênfase/parênteses: *fur a furno* → “*fur* (ladrão) […] *furno*” (c01 [7]); *bestiae […] vastiae* → “*bestiae* (feras) […] *vastiae*” (c02 [114]); *bona igneitas* → “*bona igneitas* (bom ardor)” (c04 [57]); *bria* → “*bria*” (c03 [121]); *de Eccl. Hierar.* → “*Da Hierarquia Eclesiástica*” (c02 [51]); *haeresis dicitur electio* → “*haeresis* quer dizer escolha” (c04 [106]). Traduções das palavras retidas e itálicos legítimos. Em c04 [23], *principibus […] et potestatibus […] subditos esse* reúne-se em “a que estejam submissos aos príncipes […] e às potestades”; a mudança de segmentos não suprime conteúdo.
  - Aspas metalinguísticas: *accipitur aeternum*, *hoc nomen stultus*, *forte vel fere*, *hic blasphemare*, *huius nominis haereticus* (c02 [26], [145]; c03 [40]; c04 [32], [106]) correspondem a “eterno”, “estulto”, “talvez”/“quase”, “blasfemar”, “herege”. Mantidas conforme `books.md`.
  - Nomes: *Heli* → “Heli” (c02 [59]) e *Hevei* → “heveu” (c02 [23]) são formas portuguesas atestadas; não impor “Eli” ou “hevita”. *Raguel et Sara* → “Raguel e Sara” (c03 [64]) reproduz os nomes da fonte; não substituir Sara por outro nome a partir de outra edição bíblica. *Artemam/Arthemam* → “Ártemas” (c04 [83], [115]) conserva o mesmo nome, apesar da variante gráfica latina.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-5.md`.

### Round 6

- Foco: completude parágrafo a parágrafo contra `la/`, com conferência de nomes bíblicos e de capítulo e versículo. Veredito: **CLEAN**, sem alterações.
- Achados rejeitados:
  - `titus-c01` [7], Ab cap. único, *si fures introissent ad te* → “se ladrões tivessem entrado em tua casa”: “casa” explicita o antecedente, já presente em *perfodi domum*; sentido preservado.
  - `titus-c02` [68], Sl 100, 5, *cum hoc non edebam* → “com o de olho soberbo … não comia”: “com o” faz o papel de *hoc*.
  - Flags mecânicos (ênfase, parênteses, aspas retas, *vaniloquus*): são os já decididos nas rodadas 1, 3 e 5.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-6.md`.


### Round 7

- Foco: fidelidade bilíngue cláusula a cláusula contra `la/`, com leitura integral. Veredito: **ISSUES 2**, corrigidos.
- Correções:
  - `titus-c02` [12], n. 4: “servo, porém, é aquele que é causa de outro” → “servo, porém, é aquele que existe em função de outro”; *servus vero est qui est causa alterius* expressa finalidade, não que o servo cause outro. A explicação seguinte (*propter causam finalem […] servi Dei, quia propter Deum faciunt*) confirma a relação.
  - `titus-c04` [43], n. 84: “Mas errávamos” → “Mas erramos”; *Sed erramus incidentes in contrariam opinionem* está no presente da explicação geral do erro intelectual, não no imperfeito da condição passada descrita no versículo.
- Achados rejeitados:
  - `titus-c01 [7]`: *fur a furno dicitur* → “*fur* (ladrão) se diz de *furno*”. Os parênteses traduzem o vocábulo conservado para a etimologia; os itálicos identificam os termos latinos.
  - `titus-c02 [51]`: *in libro de Eccl. Hierar.* → “no livro *Da Hierarquia Eclesiástica*”. Itálico legítimo de título, sem alteração de conteúdo.
  - `titus-c02 [114]`: *bestiae dicuntur, quasi vastiae* → “chamam-se *bestiae* (feras) como que *vastiae*”. O parêntese traduz o termo latino retido; a ênfase adicional decorre da etimologia.
  - `titus-c03 [121]`: *bria enim mensura est* → “pois *bria* é medida”. Itálico legítimo do vocábulo latino retido.
  - `titus-c04 [23]`: *principibus, id est, maioribus […] et potestatibus, id est, aliis officialibus, subditos esse* → “a que estejam submissos aos príncipes […] e às potestades, isto é, aos outros oficiais”. A anteposição portuguesa de “submissos” reúne segmentos destacados; verbo, destinatários e glosas permanecem.
  - `titus-c04 [57]`: *quae dicitur bona igneitas* → “que se diz *bona igneitas* (bom ardor)”. Tradução breve da expressão etimológica retida; parênteses e itálico justificados.
  - `titus-c02 [26]`: *accipitur aeternum* → “se toma "eterno"”. Aspas metalinguísticas pareadas; books.md veda normalizar seu estilo nesta revisão.
  - `titus-c02 [145]`: *hoc nomen stultus* → “este nome "estulto"”. Aspas metalinguísticas pareadas, sem defeito.
  - `titus-c03 [40]`: *forte vel fere* → “"talvez" ou "quase"”. Aspas delimitam palavras citadas; não há defeito de formatação.
  - `titus-c04 [32]`: *hic blasphemare* → “aqui "blasfemar"”. Aspas metalinguísticas legítimas.
  - `titus-c04 [106]`: *huius nominis haereticus; haeresis dicitur electio* → “deste nome "herege"; *haeresis* quer dizer escolha”. Aspas metalinguísticas e itálico da transliteração conservada justificam ambos os sinais mecânicos.
  - `titus-c02 [78], [101]`: *vaniloqui; vaniloquio* → “vãos faladores; vanilóquio”. O plural regular realiza a entrada lexical “vão falador”; vaniloquio é substantivo, não terceira ocorrência do adjetivo.
  - `titus-c04 [118]`: *isti autem non habebant aliquam curam* → “ao passo que estes não tinham cuidado algum”. “Cuidado” admite o sentido de encargo; o contraste com o episcopado de Tito permite essa leitura, sem afirmar necessariamente negligência.
  - `titus-c04 [122]`: *salutem optant* → “desejam-te a saúde”. Salus admite saúde/bem-estar na fórmula de saudação; a tradução não exige restringir a palavra à salvação eterna.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-7.md`.

### Round 8

- Foco: leitura fria do pt-BR sem a fonte, verificação de cada marca contra `la/`, e varredura de ortografia, crase, hifenização e aspas. Veredito: **CLEAN**, sem alterações.
- Achados rejeitados:
  - `titus-c02` [62], n. 16, *secundo sine quibus debet esse* → “sem que coisas deve ser”: “que coisas” é o determinante que verte *quibus*, como em [64] “de que coisas” (*a quibus*); não é a conjunção “sem que”.
  - `titus-c03` [44], n. 53, *quae similiter praesumunt de aliis* → “que igualmente presumem dos outros”: o antecedente aberto é o do latim.
  - `titus-c03` [136], n. 75, *sed ab omnibus, quae quis … superaddidit* → “mas de todos os que alguém acrescentou”: elipse de “pecados” igual à do latim.
  - `titus-c04` [115], n. 105, *Voluit tamen praemitti Arthemam* → “Quis, contudo, que fosse enviado adiante Ártemas”: fiel ao latim.
  - `titus-c02` [56], n. 14, “mais retamente” (*rectius*): advérbio dicionarizado. `titus-c04` [107], “estoicos”: sem acento, correto.
  - Sinais mecânicos (ênfase, parênteses, aspas retas, *vaniloquus*): os já decididos nas rodadas 1, 3, 5 e 7.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-8.md`.


### Round 9

- Foco: palavras funcionais, cabeçalhos e compromissos de gênero, antecedente e tratamento; leitura integral contra `la/`. Veredito: **CLEAN**; nenhuma alteração nos capítulos ou nos termos-chave.
- Achados rejeitados:
  - c02 [5], [7], [27], *apostolus autem; manifestavit autem* → “e apóstolo; e manifestou”: `autem` admite continuação/distinção; não exige oposição nestes contextos.
  - c02 [50], *in malis; in bonis* → “nos maus; nos bons”: substantivações abertas a pessoas ou coisas; a aplicação seguinte aos santos e perfeitos, como Tito, sustenta a leitura pessoal.
  - c03 [47], *coram matre mea, et docebat me* → “diante de minha mãe, e ela me ensinava”: sujeito feminino sustentado pela defesa do ensino doméstico materno; mantida a decisão da rodada 1.
  - c03 [48], *dicit ut prudentiam doceant magis ad anus quam ad viros* → “diz […] para que ensinem a prudência às anciãs mais do que aos varões”: “às anciãs” pode depender de “diz”; não se confirmou troca dos agentes. c03 [57], *adolescentulas et viros* → “às jovens e aos maridos”: retoma *viros suos*, como decidido na rodada 4.
  - c04 [66], *hunc Spiritum dat Deus Pater, quem effudit* → “este Espírito é dado por Deus Pai, que derramou”: apesar da aproximação de “Pai”, “que” admite leitura como objeto retomando Espírito, com Pai como sujeito implícito; não há erro inequívoco de antecedente.
  - c04 [115], *Alios misit […] Titus iret ad eum* → “Enviou os outros […] Tito fosse ter com ele”: artigo retoma discípulos distintos de Tito; “ele” é Paulo, não o próprio Tito. c04 [117], *licet et Apollo […] quia in Iudaismo habuit hanc dignitatem* → “embora também Apolo […] porque no judaísmo teve esta dignidade”: sujeito elíptico de “teve” é Zenas, cujo título se explica; a concessiva não obriga a atribuí-lo a Apolo.
  - Flags de ênfase/parênteses: c01 [7] *fur a furno* → “*fur* (ladrão) […] *furno*”; c02 [51] *de Eccl. Hierar.* → “*Da Hierarquia Eclesiástica*”; c02 [114] *bestiae […] vastiae* → “*bestiae* (feras) […] *vastiae*”; c03 [121] *bria* → “*bria*”; c04 [57] *bona igneitas* → “*bona igneitas* (bom ardor)”; c04 [106] *haeresis dicitur electio* → “*haeresis* quer dizer escolha”. Itálicos de título/termos retidos e traduções etimológicas legítimos. c04 [23], *principibus […] et potestatibus […] subditos esse* → “a que estejam submissos aos príncipes […] e às potestades”: reorganização sem perda do verbo ou das glosas.
  - Aspas: *accipitur aeternum; hoc nomen stultus; forte vel fere; hic blasphemare; huius nominis haereticus* (c02 [26], [145]; c03 [40]; c04 [32], [106]) → “eterno; estulto; talvez/quase; blasfemar; herege”: usos metalinguísticos pareados, preservados conforme books.md.
  - Glossário: c02 [78], [101], *vaniloqui; vaniloquio* → “vãos faladores; vanilóquio”: plural regular do adjetivo e substantivo distinto; a ausência do singular literal não torna a tabela falsa.
- Evidência, com decisões de antecedente e traçado de interlocutores: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__biblical__super-titum/review-9.md`.
