
## Termos

| Ursacius / Valens / Macarius | Ursácio / Valente / Macário | Conforme apologia-ad-constantium. |
| Hosius / Julius / Liberius | Ósio / Júlio / Libério | Conforme ad-episcopus-aegypti-et-libyae. |
| Treveri | Tréveris | Adotada a forma de apologia-ad-constantium; historia-acephala emprega Tréveros. |
| Chorepiscopus / oblation | corepíscopo / oblação | Conforme os concílios de Niceia e Neocesareia. |
| Ischyras / Arsenius / Rufus | Isquiras / Arsênio / Rufo | |
| Flavius Hemerius / Secontarurus | Flávio Hemério / Secontaruro | |
| Adamantius / Anubion / Agathammon / Arbethion | Adamâncio / Anúbion / Agatâmon / Arbétion | |
| Receiver-General / Tax-collector / Order book | recebedor-geral / coletor de impostos / livro de ordens | Terminologia administrativa da carta do § 85. |
| Martyry of the Saviour | Martírio do Salvador | “Martírio” designa aqui o santuário, conforme indica o contexto da consagração. |

## Decisões

- Mantidos em negrito os números autorais dos parágrafos (1–90).
- Nota do tradutor [^10]: esclarece “corepíscopo” como título episcopal ligado ao ministério em regiões rurais.
- Mantido o singular na carta de Alexandre a Dionísio e na ordem ao coletor de impostos; empregado “vós” nas cartas dirigidas aos bispos e ao povo de Alexandria.
- Preservadas as fórmulas administrativas “sua Divindade” e “minha Devoção”, bem como a datação pelas calendas, sem substituição por data moderna.
- No § 89, conservado o referente singular Ósio no parêntese sobre a cessão temporária diante das ameaças e dos açoites de Constâncio.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 5 minor. Full read of ch001 and ch002 against en-US: two misleading clauses in parallel letters (ch002 [70], [72]), one Key Terms drift, a regency slip, a misspelt province, a transplanted `:—`, and a false claim in the journal.
- `pt-BR/ch001.md` [30]: “mediante uma convocação do arrecadador-geral” → “mediante uma convocação do recebedor-geral” — Receiver-general; the Key Terms table and ch002 [88]–[89] use “recebedor-geral”
- `pt-BR/ch001.md` [91]: “Compadecemos com nossos irmãos que sofrem” → “Compadecemo-nos de nossos irmãos que sofrem” — “compadecer-se” is pronominal and governs “de”
- `pt-BR/ch001.md` [135]: “da Augustâmica” → “da Augustâmnica” — Augustamnica; the Portuguese form keeps the “n”
- `pt-BR/ch002.md` [64]: “cujos nomes estão subscritos:—” → “cujos nomes estão subscritos:” — source punctuation `:—` must not be transplanted
- `pt-BR/ch002.md` [70]: “melecianos vindos do Egito, porque ali não havia nenhum, além de colutianos e arianos enlouquecidos de outras partes, e prepará-los” → “melecianos vindos do Egito — porque ali não havia nenhum — e colutianos e arianos enlouquecidos de outras partes, e prepará-los” — source: collect Meletians from Egypt (none were there) and Colluthians and Arians from elsewhere; “não havia nenhum, além de colutianos” reads as “there were none except Colluthians” *(meaning)*
- `pt-BR/ch002.md` [72]: “melecianos vindos do Egito, porque ali não havia nenhum, além de colutianos e arianos enlouquecidos de outras partes, e prepará-los” → “melecianos vindos do Egito — porque ali não havia nenhum — e colutianos e arianos enlouquecidos de outras partes, e prepará-los” — same defect as ch002 [70]: “além de” after the causal clause misattributes who was present *(meaning)*
- `pt-BR/translation-journal.md`: “Preservados os 25 parágrafos da chamada, além da definição adicional da nota do tradutor; os números autorais 81–90 permanecem em negrito.” → “Mantidos em negrito os números autorais dos parágrafos (1–90).” — false claim: the book has far more than 25 paragraphs, and every author's number from 1 to 90 is bold, not only 81–90
- Rejected: audit: parentheses differ (15 places) — source parentheses missing — each was rendered with em dashes or by restructuring the sentence; no content is lost
- Rejected: audit: emphasis markers differ — extra `**` in pt-BR — bold paragraph numbers, as the house format requires
- Rejected: pt-BR/ch001.md [87] vs [77] — [87] makes Athanasius the subject of “frustrara os desígnios”, while [77] keeps “ele” — the source is ambiguous; reading the subject as Athanasius, through his own presbyters, fits [49]
- Rejected: pt-BR/ch001.md / ch002.md — “ariomaníacos” / “arianos insensatos” / “arianos enlouquecidos” used for “Arian madmen” — not in the Key Terms table, and each rendering is defensible; a style choice
- Rejected: pt-BR/ch002.md [73] vs [97] — Arbécion vs Arbétion — the source spells them differently (Arbæthion / Arbethion)

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 3 minor. Leitura integral dos 251 blocos, das 10 notas do tradutor, de book.json e do diário: três correções menores; nenhum defeito de sentido identificado.
- `pt-BR/ch002.md` [76]: “nem permitas que vos movais” → “nem te permitas agir” — A carta dirige-se somente a Dionísio, tratado por tu; “vos movais” introduz indevidamente o plural.
- `pt-BR/ch002.md` [86]: “Tendo vindo de diversas províncias” → “Depois que viemos de diversas províncias” — Quem veio foram os bispos (“we”), mas o gerúndio fica ligado ao sujeito da oração principal, “a graça de Deus”. A oração desenvolvida explicita o sujeito correto.
- `pt-BR/translation-journal.md`: “pt-BR/ch002.md [73] vs [87] — Arbécion vs Arbétion” → “pt-BR/ch002.md [73] vs [97] — Arbécion vs Arbétion” — A ocorrência de Arbétion está no bloco [97], que contém o § 87, e não no bloco [87].
- Rejected: pt-BR/ch001.md [50] — A expressão “nem o acusado fosse considerado inocente” poderia parecer uma inversão. — O original diz expressamente “nor the person on his trial be accounted innocent”; a tradução preserva essa ressalva.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch002 [75]–[77] and [85]–[87], the footnotes and the journal entry: the three round-2 fixes are correct and no new defects were found.
- Rejected: pt-BR/ch002.md [76] — The source says “suffer yourselves” (plural), but the translation now has “te permitas” (singular). — The letter is addressed only to Count Dionysius, who is called “tu” throughout the paragraph. The journal records the singular for letters to an individual. The plural “vos” was inconsistent with the rest of the letter.
- Rejected: pt-BR/ch002.md [86] — “Depois que viemos” replaces a participial phrase. — The finite clause gives the verb the correct subject (the bishops). The main clause “a graça de Deus nos concedeu” still reads correctly, and no content was lost.
- Rejected: pt-BR/ch002.md [76] — The audit reports that parentheses differ. — The source parenthesis is rendered with em dashes, and its content is complete.
- Rejected: pt-BR/ch002.md [75], [77], [87] — The audit reports that emphasis markers differ. — The extra markers are the bold paragraph numbers that the house format requires.
