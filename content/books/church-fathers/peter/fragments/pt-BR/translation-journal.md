# Diário de tradução — Fragmentos (pt-BR)

Fonte: en-US/ (James B. H. Hawkins, Ante-Nicene Fathers, vol. 6, 1886; revisão de Kevin Knight para o New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Peter of Alexandria | São Pedro de Alexandria | forma do autor no book.json; no texto (¶27) "Pedro, mártir e arcebispo de Alexandria" |
| Meletius | Melécio | |
| parish | paróquia | sentido antigo (*paroikía*): o território do bispo; mantido para seguir a fonte |
| priests | sacerdotes | |
| the Word | o Verbo | "God the Word" → "Deus Verbo" |
| the Word (Escritura, ¶12) / Word of salvation (¶23) | a Palavra / a Palavra da salvação | aqui a fonte se refere à Escritura, não à Pessoa do Verbo |
| Godhead / divinity | divindade | |
| Passover | Páscoa | sempre com maiúscula, também nas citações bíblicas |
| typical / shadowy (Passover, lamb) | figurativo / de sombras | "typical" no sentido de *typus*; "típico" sugeriria ao leitor "habitual" |
| legal Passover | Páscoa legal | |
| preparation | preparação | a parasceve |
| vernal equinox | equinócio da primavera | |
| month Abib / Phamenoth / Pharmuthi | Abib / Famenot / Farmuti | meses hebraico e coptas |
| hall of judgment / judgment-seat / the Pavement / Gabbatha | sala do julgamento / tribunal / Pavimento / Gábata | traduz a redação da fonte, sem recorrer a "pretório" |
| Mother of God / Ever-Virgin | Mãe de Deus / sempre Virgem | |
| forbearance / long-suffering | tolerância / longanimidade | |
| the Preacher | o Pregador | como em athanasius/apologia-de-fuga |
| Moses / Joshua, son of Nun / Vespasian / Caiaphas / Pilate / Gabriel | Moisés / Josué, filho de Num / Vespasiano / Caifás / Pilatos / Gabriel | |
| Sirach | Eclesiástico | nome católico em português |

## Decisões

- Os pronomes que se referem a Deus e a Cristo ficam em minúscula ("o", "ele", "meu nome"), como nas edições católicas brasileiras modernas.
- Os números de parágrafo da seção 5 ("1." a "7.") foram convertidos em negrito inerte (`**1.**`). O título "## 5.— …" mantém o travessão da fonte.
- As fórmulas de corte dos excertos foram padronizadas assim: "and afterwards other things" → "e depois outras coisas"; "and after other things" → "e depois de outras coisas"; "And after a few things (more)" → "E pouco depois" ou "E, um pouco mais adiante".
- "is there adored by the faithful" (¶19, ¶21) → "é venerado pelos fiéis". O inglês antigo usa "adored" com o sentido de veneração (*proskýnesis*). Em português, "adorado" indicaria culto de latria a um livro.
- "Hail, you that are highly favoured" → "Ave, tu que és muito favorecida". A tradução segue a redação da fonte, não a fórmula "cheia de graça".
- ¶5, ¶12, ¶13, ¶14, ¶15, ¶16, ¶17, ¶18, ¶19, ¶21, ¶23, ¶25, ¶27, ¶29: frases muito longas da fonte foram divididas em frases menores dentro do mesmo parágrafo, para facilitar a leitura. Nenhuma oração foi omitida e a ordem foi mantida.
- ¶5: a construção "neither 'though He was rich did He become poor' that He might…" foi reordenada como "“sendo rico, se fez pobre” … não para … mas para …", mantendo o sentido.
- ¶27: o inglês tem uma frase truncada ("which Peter… expounding, says, this and other things like"). Foi traduzida como "Comentando essa passagem, Pedro… diz isto e outras coisas semelhantes".
- Erros de digitação da fonte foram corrigidos em silêncio: "Jest" (lest, ¶5), "bath" (hath, ¶12), "mitten" (written, ¶17), "defined" (defiled, ¶19), "that might), servant" (that mighty servant, ¶16), "Nun. who" (¶16). Também foram acrescentados espaços e pontuação ausentes (¶5, ¶12, ¶18).
- Deslizes da fonte foram mantidos, sem correção: "Numbers 12:24" (a passagem é Números 13:20-24); Eclesiástico atribuído ao "Pregador" (¶16); "Filho de Deus" em Lucas 22:48 (¶7); a pergunta a Judas atribuída a Mateus (¶27). As citações sem referência na fonte (Salmo 95 no ¶14, Mateus 5:17 no ¶18, Gênesis 1:11-12 no ¶12, 1 Pedro 3:18 no ¶5, João 19:13-14 no ¶19) ficaram sem referência.
- Não houve notas de editor a remover nem nota do tradutor.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Leitura completa dos 29 parágrafos, do book.json e do diário. Há dois erros de sentido no ¶19: "the divine" traduzido como adjetivo e "vítima por aqueles" lido como agente.
- `pt-BR/ch001.md` [19]: “Assim nos ensina João, o divino evangelista,” → “Assim nos ensina João, o teólogo e evangelista,” — A fonte diz "John, the divine and evangelist". Aqui "divine" é substantivo e quer dizer teólogo (*theologos*); "o divino evangelista" perde esse título. *(meaning)*
- `pt-BR/ch001.md` [19]: “Ele foi feito vítima por aqueles que haviam de participar” → “Ele foi feito vítima em favor daqueles que haviam de participar” — A fonte diz "made the victim to those who were about to partake by faith". Com a voz passiva, "por aqueles" se lê como agente e faz dos fiéis os autores do sacrifício. *(meaning)*
- Rejected: pt-BR/ch001.md [12]-[18] — A auditoria aponta marcas de ênfase que diferem da fonte. — É o negrito `**1.**`–`**7.**` dos números de parágrafo, adotado por decisão registrada no diário.
- Rejected: pt-BR/ch001.md [12] — "Isso importa sobretudo porque" parece acrescentar uma ponte que a fonte não tem. — É a forma de ligar a oração causal depois da divisão da frase longa. O nexo com o período definido do mês continua o mesmo.
- Rejected: pt-BR/ch001.md [17] — "For the ancients" foi traduzido como "Mas os antigos". — Depois da reestruturação da concessiva ("Podes levantar a acusação…"), o contraste é a leitura natural e o sentido se mantém.
- Rejected: pt-BR/ch001.md [29] — "Entretanto" poderia ser lido como adversativo. — "Entretanto" tem o sentido dicionarizado de "nesse meio-tempo", que corresponde a "In the meanwhile". É escolha defensável.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 29 blocos, do book.json, do diário e da auditoria: um deslize menor de correlação temporal.
- `pt-BR/ch001.md` [12]: “quando as novas sementes brotaram, são bem limpas” → “quando as novas sementes brotam, são bem limpas” — A fonte descreve um processo habitual. O pretérito “brotaram” quebra a correlação temporal com “são bem limpas”; o presente restabelece essa correlação.
- Rejected: pt-BR/ch001.md [12]-[18] — Diferenças nas marcas de ênfase apontadas pela auditoria. — Correspondem ao negrito dos números de parágrafo, conforme a decisão registrada no diário e validada na rodada anterior.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Leitura delta de ch001 [11]-[13]. A correção da rodada 2 está certa. Há um problema de sentido em [13]: "em seu tempo" deve ser "no tempo devido".
- `pt-BR/ch001.md` [13]: “como os antigos a celebravam em seu tempo” → “como os antigos a celebravam no tempo devido” — A fonte diz "how they celebrated it in its season", isto é, a Páscoa na sua estação própria. "em seu tempo", logo depois de "os antigos", se lê como "na época deles", e o argumento sobre a data correta se perde. *(meaning)*
- Rejected: pt-BR/ch001.md [12] — Correção da rodada 2: "brotam" por "have sprung up". — O presente habitual concorda com "são bem limpas" e com o restante da descrição. A correção está certa e não quebra a frase.
- Rejected: pt-BR/ch001.md [12]-[18] — A auditoria aponta marcas de ênfase que diferem da fonte. — É o negrito dos números de parágrafo (`**1.**`–`**7.**`), adotado por decisão registrada no diário e já aceito nas rodadas anteriores.
- Rejected: pt-BR/ch001.md [12] — "Nisto seguimos a Palavra" acrescenta o verbo "seguimos". — A fonte é elíptica ("and in this, according to the Word"). O verbo completa a construção sem mudar o sentido.

### Round 4 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 29 blocos, cotejados com a fonte, e verificação do book.json, do diário e da auditoria; nenhum novo defeito encontrado.
- Rejected: pt-BR/ch001.md [12]-[18] — Diferenças nas marcas de ênfase apontadas pela auditoria. — Correspondem exclusivamente ao negrito dos números de parágrafo, conforme a decisão registrada no diário e validada nas rodadas anteriores.
