# Diário de tradução — Ad Afros Epistola Synodica (pt-BR)

Fonte: en-US/, tradução de Archibald Robertson (Nicene and Post-Nicene Fathers, Second Series, vol. 4, 1892), revista por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Athanasius | Atanásio | como nos `athanasius/*` irmãos |
| Ad Afros Epistola Synodica | Ad Afros Epistola Synodica | título latino mantido, como `historia-acephala` |
| coessential / Coessential | coessencial / Coessencial | *homoousios*; ver Decisões |
| essence / Essence / substance | essência / Essência / substância | distintas, como em `de-decretis`; maiúscula da fonte |
| subsistence / Subsistence | subsistência / Subsistência | |
| of the essence | da essência | como em `de-decretis` |
| originate / things originate | originado / coisas originadas | como em `de-decretis` |
| offspring / Offspring | gerado / Gerado | como em `de-decretis` |
| Creature / creature | Criatura / criatura | maiúscula espelhada da fonte |
| the Word / Power / Wisdom / Image | o Verbo / o Poder / a Sabedoria / a Imagem | |
| express Image / brightness | imagem expressa / resplendor | Hebreus 1:3 |
| Only-begotten / Godhead / Deity | Unigênito / Divindade / Divindade | |
| Very God / true God | Deus verdadeiro | |
| Lord of powers | Senhor dos poderes | como em `de-decretis` |
| irreligious / impiety / piety | ímpio / impiedade / piedade | como em `de-decretis` |
| unscriptural | alheio à Escritura | |
| synod / Synod / council / Council | sínodo / Sínodo / concílio / Concílio | maiúscula da fonte |
| ecumenical | ecumênico | |
| Faith / faith | Fé / fé | maiúscula da fonte |
| fathers / Fathers | padres / Padres | maiúscula da fonte; "pais" onde o sentido é filial ("seus pais") |
| fellow-minister | companheiro de ministério | como em `circular-letter` |
| beloved | amados | |
| Eusebius and his fellows | Eusébio e os seus companheiros | como em `de-decretis` |
| Arians / Arian heresy / Anomœans | arianos / heresia ariana / anomeus | |
| the Shepherd | o Pastor | de Hermas, como em `de-decretis` |
| Ariminum / Ariminian | Rímini / de Rímini | forma portuguesa usual do concílio de 359 |
| Damasus / Auxentius / Ursacius / Valens / Eudoxius / Demophilus / Gregory | Dâmaso / Auxêncio / Ursácio / Valente / Eudóxio / Demófilo / Gregório | |
| Constantius / Arius / Eusebius of Cæsarea | Constâncio / Ário / Eusébio de Cesareia | |
| the Great Rome | a grande Roma | |
| Gaul / Italy / Dalmatia / Dardania / Macedonia / Epirus / Greece / Crete | Gália / Itália / Dalmácia / Dardânia / Macedônia / Epiro / Grécia / Creta | |
| Sicily / Cyprus / Pamphylia / Lycia / Isauria / the Libyas / Arabians | Sicília / Chipre / Panfília / Lícia / Isáuria / as Líbias / árabes | |
| Syria / Cilicia / Mesopotamia / Thrace / Sirmium / Constantinople / Antioch / Milan | Síria / Cilícia / Mesopotâmia / Trácia / Sírmio / Constantinopla / Antioquia / Milão | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Holy Trinity | Santa Trindade | |

## Decisões

- "Coessential" (Robertson) traduzido por "coessencial", e não pelo "uno em essência" de `de-decretis`, que traduz outra expressão inglesa (Newman, "one in essence"). Mantém visível o vínculo com "essência", de que depende o argumento das seções 4 a 9.
- Os números das seções (`1.` a `11.`) passam a texto em negrito (`**1.**`), seguidos do sumário em itálico, para não virarem listas Markdown.
- As referências bíblicas ficam no mesmo lugar da fonte, dentro das aspas da citação. Os espaços deixados pelos marcadores de nota do editor ("Jeremiah has it ,", "nearly 200 )") foram removidos junto com as notas.
- Citações dirigidas a Deus em segunda pessoa (Salmos: "na vossa luz", "quem se assemelhará a vós") em *vós* reverente. "Não removas os limites" (Provérbios 22:28) e "crê" (o Pastor) no singular, como nos originais.
- "God is not" (seção 4) traduzido por "Deus não é", e não por "Não há Deus", para manter o laço com "ser" e "existência" do argumento.
- Pronomes referidos a Deus e a Cristo em minúscula ("ele", "seu"), contra a maiúscula da fonte inglesa, segundo o uso editorial português.
- "Brother-opinion" traduzido por "opinião irmã".
- Algumas frases longas da fonte foram divididas em períodos menores, sem omitir nenhuma oração nem alterar a ordem dos argumentos.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Leitura completa de ch001 [1]–[25], com o journal e o book.json: dois conectivos lógicos perdidos em frases divididas ([13] contraste e finalidade, [11] 'in that'); os avisos da auditoria não são defeitos.
- `pt-BR/ch001.md` [13]: “As Criaturas, visto que não existem por si mesmas sem causa, mas têm um princípio da sua existência, são ditas “de Deus”; assim, só o Filho” → “Desse modo, enquanto as Criaturas, visto que não existem por si mesmas sem causa, mas têm um princípio da sua existência, são ditas “de Deus”, só o Filho” — a fonte diz 'so that whereas the Creatures ... are said to be "of God", the Son alone might be deemed proper'. A divisão perdeu o contraste ('whereas') e o vínculo com a fórmula dos bispos, e o 'assim' passou a parecer consequência de as criaturas serem ditas 'de Deus' *(meaning)*
- `pt-BR/ch001.md` [11]: “respiram o espírito da Escritura. Deus diz no Êxodo” → “respiram o espírito da Escritura, visto que Deus diz no Êxodo” — a fonte diz 'in that God says in Exodus'. A divisão da frase omitiu o conectivo que apresenta as citações como prova
- Rejected: pt-BR/ch001.md [11] — Palavra repetida “Êxodo Êxodo” — Espelha a fonte ('in Exodus Exodus 3:14'): o nome do livro seguido da referência no mesmo lugar, conforme a decisão do journal
- Rejected: pt-BR/ch001.md [4]–[24] — Contagem de marcadores de ênfase diferente da fonte — Os números de seção em negrito (**1.**) seguem uma decisão registrada no journal
- Rejected: pt-BR/ch001.md [5] — Parêntese acrescentado — Apenas pontuação para o aposto 'we mean Auxentius…'; nada foi acrescentado nem omitido
- Rejected: journal, Key Terms — “ímpio” ×0 para “irreligious” — O termo ocorre na forma feminina “heresia ímpia” em [5]; a linha da tabela está correta
- Rejected: pt-BR/ch001.md [17] — “porque não seria semelhante” traduz 'because He is not like' (mudança de modo) — A oração explica a hipótese do 'a não ser que'. O condicional mantém o sentido
- Rejected: pt-BR/ch001.md [19] — “Sustentais que…” traduz 'If it is from virtue … that you hold' — A condicional é retórica: os adversários afirmaram exatamente isso em [17]. A asserção não informa mal o leitor

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de ch001.md [1]–[25], book.json, diário e auditoria: nenhum novo defeito objetivo; mantidas as rejeições fundamentadas da rodada anterior.
