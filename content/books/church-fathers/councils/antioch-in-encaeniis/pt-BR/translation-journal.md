# Diário de tradução — Antioquia in Encaeniis (341) (pt-BR)

Fonte: en-US/ (tradução de Henry Percival, Nicene and Post-Nicene Fathers, Second Series, vol. 14, revista por Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

Convenções herdadas de `councils/nicaea-i`, `councils/ancyra`, `councils/gangra` e `councils/constantinople` (pt-BR): aspas curvas, "Niceia" sem acento, `Councils` → **Concílios**, `Synod` → **Sínodo** (maiúscula conforme a fonte), `canon` → **cânon**, `presbyter` → **presbítero**, `Chorepiscopus` → **corepíscopo**, `Synodal Letter` → **Carta Sinodal**, `fellow Ministers` → **colegas no ministério**, sobrenomes de estudiosos mantidos.

| Inglês | Português | Notas |
|---|---|---|
| Antioch in Encaeniis / *in Encæniis* | Antioquia in Encaeniis / *in Encæniis* | latim mantido |
| Historical Introduction | Introdução Histórica | |
| the Canon / of the canon | o Cânon / do cânon | lista do clero; nota do tradutor 1 |
| parish (*paroikia*) | paróquia | circunscrição do bispo; nota do tradutor 2 |
| communicate with | estar em comunhão com | |
| letters pacifical | cartas pacíficas | |
| letters canonical | cartas canônicas | |
| letters commendatory | cartas de recomendação | |
| letter dimissory | carta dimissória | |
| Communion letters | cartas de comunhão | |
| *formatæ* | “formatæ” | latim mantido, como na fonte |
| metropolis / metropolitan | metrópole / metropolita | |
| full synod | sínodo pleno | |
| bishop without a see | bispo sem sé | |
| translated (of a bishop) | transferido | |
| Emperor | Imperador | maiúscula conforme a fonte |
| Erastianism | erastianismo | nota do tradutor 3 |
| Hyperberetæus | Hiperbereteu | nota do tradutor 4 |
| Eusebians / Semi-arians / Donatists | eusebianos / semiarianos / donatistas | |
| Constantine the Great / Constantius / Julian the Apostate | Constantino, o Grande / Constâncio / Juliano, o Apóstata | |
| Pope Julius / John II / Zacharias / Leo IV | Papa Júlio / João II / Zacarias / Leão IV | |
| St. Hilary of Poictiers | Santo Hilário de Poitiers | |
| St. Chrysostom | São João Crisóstomo | |
| Socrates / Sozomen / Eustathius | Sócrates / Sozomeno / Eustátio | |
| Atticus / Leontius | Ático / Leôncio | |
| Pseudo-Isidore / Isidore Mercator / Dionysius | Pseudo-Isidoro / Isidoro Mercator / Dionísio | |
| Martin Bracarensis | Martinho de Braga | |
| John Zonaras | João Zonaras | |
| Balsamon / Van Espen / Hefele / Schelstraten / Tillemont / Plumptre / Suicer / Labbe | inalterados | |
| Cœle-Syria / Phœnicia / Cilicia / Isauria | Celessíria / Fenícia / Cilícia / Isáuria | |
| Chalcedon / Laodicea / Elvira / Council in Trullo | Calcedônia / Laodiceia / Elvira / Concílio in Trullo | |
| Canons of the Apostles / Apostolic Canons | Cânones dos Apóstolos / Cânones Apostólicos | |
| Signatories (Theodore, Nicetas, Macedonius, Anatolius, Tarcodimantus, Æthereus, Narcissus, Eustachius, Hesychius, Mauricius, Paulus) | Teodoro, Niceta, Macedônio, Anatólio, Tarcodimanto, Etéreo, Narciso, Eustáquio, Hesíquio, Maurício, Paulo | |

## Decisões

- Zonaras, no cânon 2: o inglês diz que os que se afastam da comunhão “are forbidden to be expelled”, o que contradiz o próprio cânon e o sentido do comentário; traduzido “manda-se expulsar da Igreja”.
- “Paróquia” mantida para *paroikia*, como no texto inglês, com nota do tradutor explicando que designa a circunscrição do bispo (hoje, diocese).
- Notas do tradutor: 1 (“Cânon” como lista do clero, cânon 1), 2 (*paroikía*, cânon 3), 3 (erastianismo, comentário ao cânon 11), 4 (mês Hiperbereteu e “Pentecostes” como tempo pascal, cânon 20).
- O “you” genérico do comentário ao cânon 19 vai em *tu* (“quando ouvires”).
- Títulos de obras de referência em inglês genérico traduzidos (*História Eclesiástica*, *Hist. dos Concílios*); títulos em francês, alemão, latim e o livro de Blunt mantidos como na fonte; numerais romanos minúsculos das citações mantidos.
- A citação do Apóstolo no cânon 25 segue o texto da fonte, sem referência acrescentada.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1]–[85], the footnotes, book.json and the journal; the translation is faithful and complete, with one journal fix (John Zonaras is rendered as João Zonaras, not kept unchanged).
- `pt-BR/translation-journal.md`: “| John Zonaras / Balsamon / Van Espen / Hefele / Schelstraten / Tillemont / Plumptre / Suicer / Labbe | inalterados | |” → “| John Zonaras | João Zonaras | |
| Balsamon / Van Espen / Hefele / Schelstraten / Tillemont / Plumptre / Suicer / Labbe | inalterados | |” — the row says John Zonaras is kept unchanged, but [20] renders him “João Zonaras”
- Rejected: pt-BR/ch001.md [36] — audit: Scripture reference present in pt-BR but not detected in source — the source has “2 Cor. iii. 1”, which is rendered with the same chapter and verse as 2 Coríntios 3:1
- Rejected: pt-BR/ch001.md [20] — “manda-se expulsar” reverses the source's “are forbidden to be expelled” — the journal records this decision; the English contradicts the canon itself and the rest of Zonaras's comment (which treats them as expelled, with a heavier penalty for those who hate the Communion), so “forbidden” is evidently a slip for “bidden”
- Rejected: pt-BR/ch001.md [44] — “que vigora desde” renders past “prevailed” — the present tense with “desde” is natural Portuguese for a rule still in force; it does not change the sense
- Rejected: pt-BR/ch001.md [3] — “begun by his father, Constantine the Great” restructured as “Constantino, o Grande, pai de Constâncio” — this resolves the English's forward-pointing pronoun correctly; nothing is lost

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 85 parágrafos, das quatro notas, de book.json e do diário: um ajuste menor de concordância; nenhum defeito de sentido.
- `pt-BR/ch001.md` [72]: “nos idos de outubro, que é o décimo” → “nos idos de outubro, que são o décimo” — A oração relativa retoma “idos de outubro”, no plural; o verbo deve concordar com esse antecedente.
- Rejected: pt-BR/ch001.md [36] — Referência bíblica detectada somente na tradução. — A fonte traz “2 Cor. iii. 1”, corretamente traduzido como “2 Coríntios 3:1”.
- Rejected: pt-BR/translation-journal.md — linha Balsamon / Van Espen / Hefele — O termo “inalterados” não aparece na tradução. — A palavra descreve a manutenção dos nomes próprios, não uma tradução literal a procurar. Balsamon está preservado em [51].

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [71]–[73] and footnote [^4]: the concord fix in [72] is correct and no new defects were found.
- Rejected: pt-BR/ch001.md [72] — “que são o décimo [...] dia”: plural verb with a singular predicative — With a plural subject (“idos”) and a singular predicative, the verb *ser* normally agrees with the plural; the round 2 fix is correct
- Rejected: pt-BR/ch001.md [72] — “na quarta semana do Pentecostes” could be read as the feast day — It follows the source (“fourth week of the Pentecost”), and footnote [^4] already explains that it means the fifty days of Eastertide
