# Diário de tradução — Vinho, Água e Canção (pt-BR)

Fonte: en-US/, Wine, Water, and Song (Methuen & Co., 1915), Project Gutenberg #35115.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Wine, Water, and Song / G. K. Chesterton | Vinho, Água e Canção / G. K. Chesterton | Formas dos metadados recebidos. |
| God / God Almighty / Heaven / hell / Paradise | Deus / Deus Todo-Poderoso / Céu / inferno / Paraíso | Convenções das obras irmãs; caixa contextual. |
| St. George / St. John / St. Barnabas | São Jorge / São João / São Barnabé | Formas portuguesas. |
| Eve / Adam / Moses / Nebuchadnezzar | Eva / Adão / Moisés / Nabucodonosor | Formas portuguesas. |
| England / English / Great Britain / London | Inglaterra / inglês / Grã-Bretanha / Londres | Convenções das obras irmãs. |
| parson / sexton / squire | pároco / sacristão / senhor rural | “Senhor Rural” quando o original emprega maiúsculas. |
| Sir / Lord / Mr. / Miss / gentleman | Sir / Lord / sr. / senhorita / cavalheiro | Tratamentos conforme o contexto e as convenções das obras irmãs. |
| Lancelot / Grail / King Charles / King Richard | Lancelote / Graal / Rei Carlos / Rei Ricardo | Formas portuguesas; maiúsculas contextuais. |
| inn / innkeeper / ale / flagon | estalagem / estalajadeiro / cerveja / jarra | Vocabulário recorrente das canções de beber. |
| Grocer / groces | Merceeiro / mercadeja | Preservada, tanto quanto possível, a aproximação sonora. |
| teetotaller / Heathen / Vegetarian | abstêmio / Pagão / Vegetariano | “Abstêmio” em relação ao álcool; maiúsculas contextuais. |
| The Rolling English Road | A Estrada Inglesa que Rola | Título já estabelecido na descrição recebida. |
| Quoodle / Ivywood / Roundabout | Quoodle / Ivywood / Roundabout | Nomes conservados; jogos com os dois últimos explicados em notas. |
| Me Heart / heart on my sleeve | Meu Coração / coração na manga | Título em português corrente; imagem concreta preservada. |
| Simple Life / Standard Bread / Soda Water | Vida Simples / Pão Padronizado / Água com Gás | Preservadas as maiúsculas satíricas. |
| port / sherry / claret / rum / gin | porto / xerez / clarete / rum / gim | Nomes de bebidas em português. |
| Melisande / Neoera / Darien | Melisanda / Neera / Darién | Formas portuguesas ou acentuação do topônimo. |
| Crown 8vo / Fcap. 8vo / net | in-oitavo crown / in-oitavo Fcap. / líquido | Terminologia do catálogo editorial. |

## Decisões

- Traduzidos os 99 parágrafos fornecidos, preservando estrofes, ordem e versos, sem impor rimas ou métrica que exigissem alterações de sentido.
- Conservados os valores existentes em português nos metadados, inclusive a descrição; acrescentados os títulos do sumário e a língua pt-BR.
- Os enunciados satíricos e as atribuições do original foram mantidos, inclusive “Nabucodonosor, o Rei dos Judeus” e a atribuição a “São João” no poema sobre Roundabout.
- Nos convites dirigidos ao público, empregou-se vós; em “tu e eu” e “do teu e do meu”, preservou-se o interlocutor singular.
- “Rolling” foi vertido conforme o contexto por “que rola”, “rolante” ou “que cambaleava”; preservou-se o título já estabelecido nos metadados.
- Conservadas as designações P.S.A., Eisteddfod e Pensador Superior, sem expandir alusões que o texto não explica.
- “Baggonets” e as deformações gramaticais de Quoodle foram traduzidos pelo sentido, sem criar um dialeto brasileiro; o refrão sem significado lexical “wowtyiddly” recebeu a forma sonora “uó-ti-idli”.
- Em “Meu Coração”, preservadas as imagens corporais sucessivas; as elisões do inglês irlandês não foram substituídas por fala regional brasileira.
- Nota [^1]: tradução da expressão latina e explicação do jogo entre *articulo* e “artigo”.
- Nota [^2]: duplo sentido de *short* e imagem da areia adulterante que também sugere uma ampulheta.
- Nota [^3]: sentidos idiomáticos do coração na manga, nas botas e na boca.
- Nota [^4]: composição de Ivywood e aproximação sonora com *ivy would*.
- Nota [^5]: relação entre Roundabout, os trajetos sinuosos e o giro do mundo.
- Nota [^6]: formatos bibliográficos e sentido comercial de *net* no catálogo.
- Conservado integralmente o material editorial ao final do último capítulo, inclusive anúncios, preços, dados de impressão e asteriscos que sinalizam edições.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of all 99 paragraphs and 6 notes. Found one construction error in Quoodle (the park as object), a missing subjunctive and a concord slip; metadata and journal are correct.
- `pt-BR/ch05-the-song-of-quoodle.md` [3]: “Quando se fecham a porta e a escuridão,  
O parque que um judeu cerca,” → “Quando a porta e a escuridão fecham  
O parque que um judeu cerca,” — source: 'When door and darkness closes / The park a Jew encloses'. The park is the object of 'closes', not of 'tell'. The translation makes it the thing they cannot distinguish. *(meaning)*
- `pt-BR/ch03-the-song-against-grocers.md` [4]: “Até que ela vai definhando.” → “Até que ela definhe.” — a temporal 'até que' takes the subjunctive; the source says 'Until she fades away'.
- `pt-BR/ch04-the-rolling-english-road.md` [3]: “e muitas do Senhor Rural” → “e muita do Senhor Rural” — the pronoun must agree with the singular 'maldade' ('no harm ... and plenty of the Squire').
- Rejected: pt-BR/ch03-the-song-against-grocers.md [3] — audit flag: emphasis markers differ (source 0, pt-BR 2) — italics on retained Latin *mortis in articulo* are house style.
- Rejected: pt-BR/ch05-the-song-of-quoodle.md [6] — audit flag: space before punctuation — the row of spaced dots marks an omission and is identical to the source.
- Rejected: pt-BR/ch13-the-road-to-roundabout.md [3] — '(São João)' attribution of 'peace and righteousness ... kiss', which comes from Psalm 85 — this is the author's own attribution, and the journal deliberately keeps it.
- Rejected: pt-BR/ch10-the-song-against-songs.md [5] — 'teu' and 'vos/vossa' mixed in the same stanza — the journal records this choice: 'teu e meu' keeps the singular of 'you and me'.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 99 parágrafos, das seis notas do tradutor, dos metadados e do diário; nenhum defeito objetivo adicional encontrado. Os dois alertas mecânicos permanecem justificados pelas decisões anteriores.
