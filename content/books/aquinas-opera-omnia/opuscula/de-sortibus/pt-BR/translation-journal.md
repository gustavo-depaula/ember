# Diário de Tradução — Das Sortes (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/`, somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| sors / sortes | sorte / sortes | Termo do título; “sortes” no plural quando o latim o usa (lançar as sortes). |
| sors diuisoria / consultoria / diuinatoria | sorte divisória / consultória / divinatória | |
| inquisitio sortium | indagação das sortes | *inquirere* → “indagar”; *exquirere/requirere* → “procurar/buscar”. Exceções: *inquisiuit signum roris a Domino* (cap. 3 §9) → “pediu ao Senhor o sinal”; o título *Ad inquisitiones Ianuarii* → *Às perguntas de Januário*. |
| industria (humana) | empenho (humano) | O esforço ou engenho próprio, oposto ao que excede a capacidade humana. |
| prudentia / consilium | prudência / conselho | |
| euentus | acontecimento; resultado | “Resultado” só quando é o desfecho de um ato (o resultado das sortes, do uso, dos atos humanos); o curso das coisas é “acontecimento”. |
| fortuna / fortuitus | fortuna / fortuito | *bene fortunati / infortunati* → “afortunados / desafortunados”. |
| per accidens | por acidente | Conforme as obras irmãs. |
| dispositio diuina / prouidentia | disposição divina / providência | Em Sb 9 (cap. 2 §6), *prouidentie nostre* = “as nossas previsões” (a previdência humana, não a Providência). |
| uirtus | virtude | Sentido de poder ou eficácia (virtude das sortes, dos corpos celestes); “força” para *uirtus* nos duelos. |
| corpora celestia / sydera / stelle | corpos celestes / astros / estrelas | *astra* (Ptolomeu, cap. 4 §10; Agostinho, cap. 4 §21) também → “astros”. |
| fantasmata | fantasmas | Termo técnico das imagens da imaginação, como nas obras irmãs. |
| appetitus sensitiuus | apetite sensitivo | |
| nugatoria / noxia superstitio | superstição frívola / nociva | |
| societas demonum | sociedade dos demônios | Mantido “sociedade”, que retoma *socios* de 1 Cor 10. |
| omen / augurium / auspicium | presságio / augúrio / auspício | |
| nigromantici / geomantia / chiromantia / spatulamantia | nigromantes / geomancia / quiromancia / espatulomancia | |
| geneatici | genetlíacos | |
| Aristotiles | Aristóteles | *Philosophus* não ocorre; o texto nomeia Aristóteles diretamente (cap. 4 §6 e §18). |
| Dyonisius / Tholomeus / Maximus Valerius / Beda | Dionísio / Ptolomeu / Valério Máximo / Beda | |

## Decisões

- 2026-10-03: Tradução diretamente do latim, incluindo citações e rubricas; preservados os parágrafos e os subtítulos em itálico negrito de cada capítulo. Os títulos descritivos do sumário em `book.json` traduzem as rubricas latinas, como em *Da Perfeição da Vida Espiritual*.
- Citações bíblicas traduzidas segundo o texto citado, com abreviaturas portuguesas e capítulos em algarismos arábicos, sem acrescentar versículos ausentes da fonte. *I Reg.* permanece “1 Rs” (nomenclatura da Vulgata, como nas obras irmãs); *II Paral.* → “2 Cr”. Referências imprecisas da edição são conservadas (p. ex., *Ioh. XVII* para “anunciar-vos-á as coisas que hão de vir”). Salmos citados sem número permanecem “o Salmo”.
- Obras citadas: *A Cidade de Deus*, *Sobre o Gênesis ao pé da letra*, *A Doutrina Cristã*, *Às perguntas de Januário*, *Carta a Honorato* (Agostinho); *Hierarquia Eclesiástica* (Dionísio); *Centilóquio* (Ptolomeu); *Da Boa Fortuna* (Aristóteles); *Sobre Lucas* (Ambrósio); *Sobre os Atos dos Apóstolos* (Beda). Títulos de obras em itálico, conforme as diretrizes da skill, embora a fonte não os destaque.
- Cap. 2: *unde et uerbum sortiendi a sortibus sumptum esse uidetur* — conservados os termos latinos *sortiri* / *sortes*, com glosa entre parênteses, porque a observação etimológica se perde em português.
- Cap. 3: “rei Persa” / “Persa” mantidos sem substituir por “Perseu”, porque o presságio depende da homonímia entre o rei e o cãozinho.
- Cap. 4 e 5: os incisos explicativos inseridos nas citações de Dionísio e Beda (*id est diuinum*, *quasi nondum…*) ficam em itálico entre travessões, como na fonte.
- Sem notas editoriais na fonte; nenhuma nota do tradutor acrescentada.
- `book.json`: entradas pt-BR acrescentadas a `name`, `author`, `description` (campo já existente) e aos títulos do sumário; `pt-BR` incluído em `languages`.

## Alterações na fonte

- `la/ch001.md`: *nullatenus in uita communica* → *communicat* (letra final perdida; o verbo exige a 3ª pessoa).
- `la/ch005.md` (revisão, rodada 1): na carta a Honorato, *et qui eorum maneant, ne morte omnium* → *et qui eorum fugiant* (repetição de *maneant* na transcrição; a antítese com *ne fuga omnium* e a conclusão *qui maneant et qui fugiant* exigem *fugiant*, que é o texto de Agostinho, Ep. 228). O pt-BR já dizia “quais devem fugir”.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo (alinhamento 1:1 com `la/`, citações, incisos, referências bíblicas), mais a auditoria mecânica. Veredito: 4 defeitos, corrigidos. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-1.md`.

Corrigidos:
- `ch003.md` §9: “como no arúspice, segundo o qual” → “como na aruspicina, segundo a qual”. *aruspicium* é a prática (inspeção das vísceras), não o sacerdote (*aruspex*).
- `ch004.md` §19 (Dionísio): “tearquico” → “teárquico” (proparoxítona; falta o acento).
- `ch005.md` §2: *suspicionem mali futuri* “o presságio de um mal futuro” → “a suspeita de um mal futuro”. *suspicio* é a conjectura de quem teme, não o sinal; e “presságio” é o termo técnico de *omen* (cap. 3), que não convém confundir.
- `la/ch005.md`: *maneant* → *fugiant* (ver “Alterações na fonte”).

Considerados e rejeitados:
- `ch005.md` §14, *quamuis enim rector querendus sit non sorte sed industria prudens* → “pelo empenho prudente”: *prudens* nominativo poderia concordar com *rector*, mas o sentido (buscar o governante pelo empenho, não por sorte) é o mesmo, e a referência inglesa lê igual. Não é defeito.
- `ch004.md` §7 (Agostinho, *Cidade de Deus* V): *sicut solaribus accessibus et recessibus; uidemus etiam…* traduzido como uma só oração (“como vemos que, com as aproximações… variam”). Segue a sintaxe do original agostiniano (*sicut in solaribus… uidemus*); o ponto e vírgula é pontuação da edição; nada omitido.
- `ch003.md` §1, *plerique homines* → “Muitíssimos homens”: *plerique* = “muitíssimos / a maior parte”; escolha defensável.
- `ch002.md` §6, Ester: “para saber em que dia” acrescenta só o nexo exigido pela oração interrogativa indireta; nenhum conteúdo novo.
- `ch005.md` §1, *phitones* → “pitões”: forma vernácula do termo da Vulgata (Dt 18,11); não é erro.
- `1 Rs 10` / `1 Rs 30` para *I Reg.*: decisão registrada acima (nomenclatura da Vulgata).

### Round 2

Foco: leitura bilíngue oração por oração (`la/` ↔ `pt-BR/`), mais a auditoria mecânica (parágrafos 1:1, rubricas, acentuação, `book.json`). Veredito: 2 defeitos, corrigidos. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-2.md`.

Corrigidos:
- `ch004.md` §16 (Is 26): *omnia opera nostra operatus est in nobis* “Todas as nossas obras, tu as operaste em nós” → “Todas as nossas obras, ele as operou em nós”. A fonte traz a 3ª pessoa (*est*); a 2ª pessoa vinha do texto bíblico corrente (*operatus es*), não do citado.
- `ch005.md` §2: *contra morbum quem potest sanare* “contra a doença que ele pode curar” → “que o remédio pode curar”. O sujeito latino é o remédio (o argumento é sobre a virtude da coisa usada); “ele”, logo após “um doente” como sujeito, se lia como o doente.

Considerados e rejeitados:
- `ch002.md` §4, *Iosue Achor de anathemate surripientem* → “Acã”: *Achor* é a forma medieval do nome (cf. o vale de Acor, Js 7,26); o referente é inequivocamente o ladrão de Js 7, cuja forma portuguesa corrente é Acã. Não é nome errado.
- `ch004.md` §16 (Fl 2), *pro bona uoluntate* → “segundo a sua boa vontade”: o possessivo explicita o referente que o versículo tem (a boa vontade de Deus, como lê também a referência inglesa); não acrescenta conteúdo.
- `ch005.md` §12 (Agostinho a Honorato), *qui maneant et qui fugiant, sorte legendi sunt* → “os que permanecem e os que fogem”: o subjuntivo latino é de interrogativa indireta/relativa; o presente português, após “devem ser escolhidos”, já tem valor prospectivo. Escolha defensável.

### Round 3

Foco: leitura do pt-BR sem a fonte, conferindo depois cada passagem marcada com o latim; em seguida, varredura de ortografia, acentos, crase, hífen e pontuação, e a auditoria mecânica. Veredito: 1 defeito, corrigido. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-3.md`.

Corrigidos:
- `ch005.md` §14: “pode-se também licitamente recorrer a tais sortes, se de outro modo a eleição não pudesse ser concorde” → “não puder”. A oração principal está no presente (“pode-se”) e não admite a condicional no imperfeito do subjuntivo. O latim *si … non posset* expressa uma condição real.

Considerados e rejeitados:
- `ch004.md` §20, “certos espíritos enganadores, … que, embora … resistam …, Deus, contudo, se serve deles”: o anacoluto é do latim (*qui, quamuis … renitantur, utitur tamen Deus eis*). A frase continua clara.
- `ch005.md` §2, “Diz-se, porém, frívolo quando…”: o masculino traduz o neutro *Nugatorium autem dicitur*. Não é erro de concordância com “superstição”.
- `ch001.md` §2, a repetição de “embora mais raramente”: está no latim (*sed rarius* duas vezes).
- `ch005.md` §9 (Agostinho a Januário), “Estes que tiram sortes …, contudo desagrada-me”: o anacoluto é do original (*hii qui … tamen ista michi displicet*).
- `ch004.md` §16, “coroada?*; e depois” e `ch005.md` §11, “alcançá-los-ei?*” sem ponto final: a pontuação segue a da fonte.

### Round 4

Foco: palavras funcionais (preposições, artigos, demonstrativos, conectivos adversativos), possessivos *seu/sua*, antecedentes, rubricas e pontos onde o português se compromete (gênero, tu/vós), mais a auditoria mecânica. Veredito: 1 defeito, corrigido. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-4.md`.

Corrigidos:
- `ch004.md` §20: *unde eorum operatio in omnibus diuine dispositioni concordat* “por isso a sua operação concorda” → “por isso a operação deles concorda”. Logo após “que fazeis a sua vontade” (de Deus), “sua” se lia como a operação de Deus; o latim *eorum* designa os espíritos ministros.

Considerados e rejeitados:
- `ch005.md` §15, *quesiuit a Domino si per manus eius populus Israel esset saluandus* → “pelas suas mãos”: *eius* já é aberto no latim entre Gedeão e o Senhor; o contexto (Jz 6, o sinal do velo) fixa Gedeão, e a leitura reflexiva (“o povo, pelas próprias mãos”) não é a natural. Não é defeito.
- `ch004.md` §16, *eius uirtute mouentur hominum uoluntates* → “pela sua virtude”, logo após o salmista: a ambiguidade é a mesma do latim, e o período inteiro fala da ação de Deus.
- `ch005.md` §2, *ad quod uirtus eius extendi non potest* → “a sua virtude”: *eius* é igualmente aberto entre *quis* e *re*; o exemplo do remédio fixa a coisa usada.
- Tratamento: vós para o correspondente no proêmio e para os destinatários plurais (Nm 12, Is 41, Sl 102, 1 Cor 10, At 1, Jo); tu para Deus nos salmos e em 2 Cr 20, para Israel em Dt 18 e para o leitor genérico de Agostinho (*De doctr. chr.* I). Coerente em todas as falas.

### Round 5

Foco: termos (contagem por parágrafo contra a tabela de termos-chave, nos dois sentidos), verificação das afirmações do diário e nomes próprios (forma portuguesa e obras irmãs), mais a auditoria mecânica. Neste diário, “§N” é o N-ésimo parágrafo de texto do capítulo, sem contar o título nem a rubrica. Veredito: 6 defeitos, corrigidos. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-5.md`.

Corrigidos:
- `ch004.md` §19: *in quantum et euentus exteriorum rerum diuine dispositioni subicitur* “tanto o resultado das coisas exteriores está sujeito” → “tanto os acontecimentos das coisas exteriores estão sujeitos”. Não é o desfecho de um ato, e o mesmo parágrafo traduz *exteriorum rerum euentibus* por “acontecimentos”; a tabela reserva “resultado” ao desfecho de um ato.
- Tabela, linha “Philosophus / Aristotiles”: *Philosophus* não ocorre em `la/` (só *philosophorum*, cap. 4 §18). Linha passa a “Aristotiles”.
- Tabela, *inquirere* → “indagar”: registradas as exceções cap. 3 §9 (*inquisiuit signum roris a Domino* → “pediu ao Senhor o sinal”) e o título *Ad inquisitiones Ianuarii*.
- Tabela, *prouidentia* → “providência”: registrada a exceção de Sb 9 (cap. 2 §6, *incerte prouidentie nostre* → “incertas as nossas previsões”, a previdência humana).
- Tabela, *sydera* → “astros”: “astros” também traduz *astra* (cap. 4 §10 e §21); registrado.
- Rodadas 3 e 4: os números de parágrafo não correspondiam aos arquivos (eram números de linha ou estavam errados). Corrigidos para a numeração de parágrafos das rodadas 1 e 2: R3 `ch005` §19 → §14, `ch004` §43 → §20, `ch005` §11 → §9, `ch004` §35 → §16, `ch005` §16 → §11; R4 `ch004` §43 → §20, `ch005` §33 → §15, `ch004` §35 → §16, `ch005` §7 → §2.

Considerados e rejeitados:
- `ch003.md` §7, *sortes dicuntur proici uel in sinum mitti* → “lançadas ou postas no regaço”, e logo Pr 16 *sortes mittuntur in sinum* → “lançadas no regaço”: o argumento é só que o nome de sorte supõe um ato humano; os dois verbos o mostram, e “lançadas” já está na glosa.
- `ch003.md` §2, *motus et situs eorum* → “as posições dos astros”: explicita o antecedente (os céus recém-nomeados); nada acrescentado.
- “força” traduz *uirtus* só nos duelos (cap. 3 §6); em cap. 4 §5 traduz *uim* e em §15 *fortiter*. Palavras-fonte diferentes; a linha *uirtus* da tabela continua exata.
- `ch004.md` §19 (Dionísio), *a diuina electione susceptum* → “aquele que foi recebido por eleição divina”: *susceptum* pode ser masculino, e a leitura pessoal (Matias) é também a da referência inglesa.
- Nomes: Valério Máximo, Ptolomeu, Dionísio, *Hierarquia Eclesiástica*, *Sobre o Gênesis ao pé da letra*, *A Cidade de Deus*, Acã, Gália, indianos — iguais às obras irmãs em pt-BR. “Lúcio Paulo” não tem ocorrência irmã; é a forma portuguesa regular.

### Round 6

Foco: completude parágrafo a parágrafo (alinhamento 1:1 com `la/`, contagem de frases, citações, incisos, frases latinas), nomes e abreviaturas dos livros bíblicos e números de capítulo, mais a auditoria mecânica. Veredito: limpo, nenhuma alteração. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-6.md`.

Considerados e rejeitados:
- Contagem de `*` maior no pt-BR (cap. 2 +4, cap. 4 +14, cap. 5 +14): vem de *sortiri* / *sortes* (cap. 2 §5), dos títulos de obras em itálico (decisão registrada) e da citação de Agostinho partida em *inquit* (cap. 4 §21, “*Deve-se confessar*, diz, *que…*”). Nada acrescentado ao texto.
- `ch002.md` §7, *diuini enim dicuntur … quasi sibi attribuentes quod est proprium Dei* → “chamam-se adivinhos”: a relação *diuini*/*Deus* fica menos visível em português, mas “adivinho” deriva de *diuinus* e a frase diz o mesmo que a fonte. Não é omissão.

### Round 7

Foco: leitura bilíngue oração por oração (`la/` ↔ `pt-BR/`) de todos os arquivos (negações, sujeito e objeto, tempo e modo, falsos cognatos, qualificadores, citações contra a redação bíblica corrente), mais a auditoria mecânica. Veredito: limpo, nenhuma alteração. Evidências: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__de-sortibus/review-7.md`.

Considerados e rejeitados:
- `ch001.md` §4, *an comedat* → “se deve comer”: subjuntivo deliberativo de interrogativa indireta; “se deve comer” é a pergunta que o consulente faria. Escolha defensável.
- `ch003.md` §4 (Valério Máximo), *spem clarissimi triumphi animo presumpsit* → “concebeu no ânimo a esperança”: *praesumere* é “tomar de antemão”, e a antecipação já está em “esperança”. Nada omitido.
- `ch004.md` §7 (Agostinho), *ad solas corporum differentias* → “para as simples diferenças dos corpos”: “simples” anteposto vale “meras”, o sentido de *solas*. Não é qualificador perdido.
