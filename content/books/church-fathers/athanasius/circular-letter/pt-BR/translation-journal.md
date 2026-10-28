# Diário de tradução — Carta Circular (pt-BR)

Fonte: en-US/ (trad. M. Atkinson e Archibald Robertson, Nicene and Post-Nicene Fathers, Second Series, vol. 4, 1892; revisada para New Advent por Kevin Knight).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Athanasius | Atanásio | como nos `athanasius/*` irmãos |
| Circular Letter / *Epistola Encyclica* | Carta Circular / *Epistola Encyclica* | título latino mantido em itálico |
| fellow-ministers | companheiros de ministério | |
| beloved lords | amados senhores | fórmula de abertura e de fecho |
| sends health in the Lord | envia saúde no Senhor | fórmula epistolar |
| Eusebius and his fellows | Eusébio e os seus companheiros | como em `de-decretis` |
| Arian madmen | loucos arianos | |
| Arians / Arian heretics / Arianism | arianos / hereges arianos / arianismo | |
| impiety / impious / piety | impiedade / ímpio / piedade | como em `de-decretis` |
| schools of religion | escolas de piedade | religion → piedade, como em `de-decretis` |
| Canons / ecclesiastical Canons | cânones / cânones eclesiásticos | minúscula, como "bispo" nos irmãos |
| Bishop / Presbyter / Clergy / laity | bispo / presbítero / clero / leigos | minúscula |
| the Church / the Catholic Church | a Igreja / a Igreja Católica | |
| Churches (comunidades) / churches (edifícios) | Igrejas / igrejas | ver Decisões |
| Prefect / Governor / Emperor / magistrates | prefeito / governador / imperador / magistrados | cargos em minúscula, como em `historia-acephala` |
| heathen(s) | pagãos | |
| virgins / ascetics / monks | virgens / ascetas / monges | |
| Holy Table / Baptistery / Psalter | Santa Mesa / Batistério / Saltério | |
| chancel rails | grades do presbitério | |
| Lent / Easter / the Preparation | Quaresma / Páscoa / a Preparação | |
| the Lord's day of the holy Feast | o dia do Senhor da santa Festa | |
| Council | Concílio | maiúscula da fonte |
| Gregory (of Cappadocia) / Philagrius / Pistus / Ammon / Alexander | Gregório (da Capadócia) / Filágrio / Pisto / Amon / Alexandre | |
| Constantius / Caiaphas / Pilate / Daniel | Constâncio / Caifás / Pilatos / Daniel | |
| Egypt / Thebais / Libya / Gaul / Alexandria / Rome | Egito / Tebaida / Líbia / Gália / Alexandria / Roma | |
| the Levite / tribe of Judah / Book of Judges | o levita / tribo de Judá / Livro dos Juízes | |

## Decisões

- Tratamento: a carta se dirige a muitos bispos; segue em *vós* do começo ao fim.
- `[2] k27--`: artefato da fonte, sem conteúdo traduzível; mantido tal qual para preservar o alinhamento de parágrafos.
- Igrejas/igrejas: a fonte maiuscula "Churches" de modo irregular. "Igrejas" quando são comunidades (cânones dados às Igrejas, Igrejas católicas, cada Igreja); "igrejas" quando são edifícios tomados ou profanados (§2, §3, §5, §6, §7), como em `historia-acephala`. Singular segue a maiúscula da fonte.
- As citações bíblicas vêm sem referência na fonte (Mateus 28:19; Mateus 10:23; 1 Coríntios 4:1; 1 Coríntios 5:4; 1 Coríntios 12:26; Romanos 12:15; Juízes 19–20); nenhuma referência foi acrescentada. Traduzidas da redação inglesa.
- "[last year]" é inserção entre colchetes da edição inglesa no texto corrido; mantida como "[no ano passado]".
- "Jesus-Christ" (hífen espúrio da fonte) → "Jesus Cristo"; espaços antes de pontuação da fonte removidos.
- "cried shame upon the governor" → "bradavam contra o governador, acusando-o de infâmia", para tornar natural a expressão inglesa.
- "the candlesticks they immediately laid aside in the wall" mantido literal ("os puseram de lado na parede"), sem conjeturar o sentido.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1]-[23], journal and book.json: complete and faithful; one minor grammar fix in [21] ('temendo o que,' → 'temendo isso,').
- `pt-BR/ch001.md` [21]: “(temendo o que, Eusébio e os seus companheiros” → “(temendo isso, Eusébio e os seus companheiros” — source 'fearing which'; 'temendo o que,' followed by a comma is not a standard relative construction and reads as 'fearing what Eusebius…'. 'temendo isso' keeps the reference to the Council being called
- Rejected: pt-BR/ch001.md [17] — 'most religious Emperor' rendered 'piedosíssimo' — standard rendering of the imperial epithet; sense kept
- Rejected: pt-BR/ch001.md [6] — 'batizando-as' (feminine) against 'them' — agrees with 'todas as nações'; correct
- Rejected: pt-BR/ch001.md [19] — 'Churches' rendered 'igrejas' in 'tendo-se apoderado das igrejas' — these are buildings taken by force; follows the journal's Igrejas/igrejas decision
- Rejected: pt-BR/ch001.md [12] — 'cried shame upon the governor' expanded to 'bradavam contra o governador, acusando-o de infâmia' — recorded in the journal as a deliberate idiomatic rendering; sense kept

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral de ch001 [1]–[23], book.json e diário: dois defeitos de sentido e um defeito menor de construção gramatical.
- `pt-BR/ch001.md` [6]: “não se peça contas de nossas mãos” → “não nos sejam pedidas contas” — «Contas» exige concordância plural nessa construção passiva; «at our hands» indica de quem se exigem as contas.
- `pt-BR/ch001.md` [17]: “muitos correm perigo de ficar sem o batismo” → “muitos correm perigo por ficarem sem o batismo” — «Are endangered from missing baptism» apresenta a falta do batismo como causa do perigo, não como o acontecimento que se corre o risco de sofrer. *(meaning)*
- `pt-BR/ch001.md` [19]: “e assim as nossas escolas de piedade se transformem” → “e assim as nossas escolas de piedade não se transformem” — Na fonte, «lest» abrange tanto a propagação do mal quanto a transformação das escolas em mercado. Falta a negação na segunda oração portuguesa. *(meaning)*
- Rejected: pt-BR/ch001.md [19] — «Vingue as suas injustiças» poderia sugerir injustiças cometidas pela Igreja. — O contexto e o verbo «vingar» permitem identificar as injustiças como sofridas pela Igreja; a construção possessiva não implica autoria.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 2 minor. Delta read of ch001 [5]-[7], [16]-[20]: the three previous fixes are correct; two minor regency fixes ('de Eusébio e dos seus companheiros') in [16] and [19].
- `pt-BR/ch001.md` [16]: “cumprir as ordens de Eusébio e os seus companheiros” → “cumprir as ordens de Eusébio e dos seus companheiros” — source 'the commands of Eusebius and his fellows'; 'os seus companheiros' needs the preposition 'de' (contracted 'dos'); without it the phrase reads as a second object of 'cumprir'
- `pt-BR/ch001.md` [19]: “o drama de Eusébio e os seus companheiros” → “o drama de Eusébio e dos seus companheiros” — source 'the drama of Eusebius and his fellows'; both nouns depend on 'de', so the article contracts to 'dos'
- Rejected: pt-BR/ch001.md [6] — 'não nos sejam pedidas contas do depósito' could drift from 'the trust … required at our hands' — 'Required at our hands' means being held to account for the trust; the rendering keeps that sense, and 'para que … não' covers both clauses as 'may not' does in the source
- Rejected: pt-BR/ch001.md [17] — 'correm perigo por ficarem sem o batismo' could be a regression — It matches 'endangered from missing baptism', where the lack of baptism is the cause of the danger; the personal infinitive is correct
- Rejected: pt-BR/ch001.md [19] — 'empregaram … a fim de que … pareçam' mixes tenses — The purpose holds in the present, as in the source 'may seem'; the construction is acceptable
- Rejected: Key Terms table — should the row 'Eusébio e os seus companheiros' change after the 'dos' fixes — The row gives the nominative form, which is correct; only the dependent uses after 'de' needed the contraction

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos [15]–[20], com conferência do diário, book.json e auditoria: as duas correções estão corretas e não introduziram problemas; nenhum novo defeito encontrado.
