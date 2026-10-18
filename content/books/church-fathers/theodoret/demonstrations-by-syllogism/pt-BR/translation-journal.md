# Diário de tradução — Demonstrações por Silogismo (pt-BR)

Fonte: en-US/ (Blomfield Jackson, NPNF Second Series, vol. 3, via New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Theodoret | Teodoreto | autor no book.json |
| God the Word | o Deus Verbo | "the Word" sozinho → o Verbo |
| substance / of one substance / consubstantial | substância / da mesma substância / consubstancial | |
| immutable / mutation / change, alteration | imutável / mutação / mudança, alteração | "mutation" sempre "mutação" |
| was made flesh | se fez carne | |
| took / assumption (of the flesh, of the soul) | tomou / assunção | |
| tabernacle / tabernacled / dwelt | tabernáculo / fez o seu tabernáculo / habitou | |
| Godhead / manhood | divindade / humanidade | |
| union without confusion / confound | união sem confusão / confundir | |
| unimpaired | intacto(a) | |
| impassible / impassibility / passible | impassível / impassibilidade / passível | |
| the passion | a paixão | |
| circumscribed / uncircumscribed | circunscrito / incircunscrito | |
| loving-kindness | amor pelos homens | Gk *philanthrōpia*; "kindness" (¶12) → bondade |
| Master Christ / Lord Christ | o Senhor Cristo | ver Decisões |
| the Saviour Christ / our Saviour Christ | o Cristo Salvador / o Cristo nosso Salvador | |
| giver of life / life-giving | vivificante | |
| antitypes / type | antítipos / tipo | nota do tradutor em ¶18 |
| firstfruits / first born | primícias / primogênito | |
| seed (of Abraham, of David) | descendência | |
| fruit of his loins | fruto de seus lombos | |
| the Evangelist / the Apostle | o Evangelista / o Apóstolo | maiúscula como na fonte |
| the divine / most divine / thrice blessed | o divino / diviníssimo / três vezes bem-aventurado | epítetos mantidos |
| Arius / Eunomius / Arians / Eunomians | Ário / Eunômio / arianos / eunomianos | |
| Nicæa | Niceia | |
| Stephen / Joseph / Jacob / Abraham / David | Estêvão / José / Jacó / Abraão / Davi | |
| Catholic Epistle | Epístola Católica | |
| handwriting (Col 2:14) | o escrito | mantém a imagem das "letras" do argumento |

## Decisões

- Os números de parágrafo do autor (`1.` etc.), reiniciados em cada seção, viram texto em negrito (`**1.**`).
- "Master Christ" (Gk *Despotēs*) e "Lord Christ" (*Kyrios*) ficam ambos "o Senhor Cristo"; "Soberano" ou "Mestre" soariam estranhos ou mudariam o sentido.
- Pronomes referentes a Deus e a Cristo em minúscula ("ele", "seu"), como na prosa católica brasileira atual.
- Lucas 23:46 → "Pai, em vossas mãos encomendo o meu espírito" (vós reverente). "Commend" → "encomendar" e "yield" → "entregar", para manter o contraste do ¶40 ("a encomendou ao Pai; não a entregou à morte"). Fórmulas dos evangelistas no ¶40: Lucas, Marcos e João "rendeu o espírito"; Mateus ("yielded up") "entregou o espírito".
- ¶21: "one and the same spirit" segue a minúscula da fonte.
- ¶25: a fonte não tem pontuação em "spirit it was flesh"; usam-se dois-pontos.
- Nota do tradutor no ¶18 (antítipos = pão e vinho eucarísticos) e no ¶31 (*psychē* = vida/alma), pois o argumento depende desses termos.
- A fonte não traz referências bíblicas no texto; nenhuma foi acrescentada.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1]–[44] against en-US: the translation is complete and faithful with no language defects; one wrong paragraph location in the journal is fixed.
- `pt-BR/translation-journal.md`: “"kindness" (¶10) → bondade” → “"kindness" (¶12) → bondade” — the journal's ¶ numbers are file paragraph numbers (¶18, ¶31, ¶40 match the file); "kindness" occurs in file paragraph [12] (the author's §10), not [10]
- Rejected: pt-BR/ch001.md [3]–[44] — mechanical audit: emphasis markers differ (source 0, pt-BR 4) — the author's paragraph numbers are rendered as bold `**n.**` by design, as the journal's Decisões record
- Rejected: pt-BR/ch001.md [44] — "mesmo quando crucificada" could be read as the divine nature being crucified — the English "conjoined to it even when crucified" has the same ambiguity; the feminine participle agrees with the human nature ("lhe"), and the next clause ("não recebendo dor da paixão") settles the sense
- Rejected: pt-BR/ch001.md [16] — "nos impede de reconhecer que a carne é carne e que Deus é Deus" for "either … or" — under the negative verb the Portuguese reads as "neither", which is what the source means
- Rejected: pt-BR/ch001.md [35] — "persuadir os Apóstolos que duvidavam de que ele tinha destruído a morte" seems to drop the object of "persuadir" — the content clause is still understood as what they were to be persuaded of; the meaning is kept

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos 44 parágrafos, do book.json, do diário e da auditoria: duas chamadas de notas sem definição no texto fornecido; nenhum defeito de sentido identificado.
- `pt-BR/ch001.md` [18]: “Pois o tipo é supérfluo quando a realidade é destruída.” → “Pois o tipo é supérfluo quando a realidade é destruída.

[^1]: Nota do tradutor: Os “antítipos” designam aqui o pão e o vinho eucarísticos.” — A chamada [^1] está sem definição no texto fornecido. Acrescenta-se a nota anunciada no diário.
- `pt-BR/ch001.md` [31]: “em favor das ovelhas, que têm alma e corpo.” → “em favor das ovelhas, que têm alma e corpo.

[^2]: Nota do tradutor: O termo grego *psychē* pode significar “vida” ou “alma”, o que explica a passagem de um termo ao outro no argumento.” — A chamada [^2] está sem definição no texto fornecido. Acrescenta-se a nota anunciada no diário.
- Rejected: pt-BR/ch001.md [3]–[44] — Quarenta divergências na quantidade de marcadores de ênfase. — Correspondem à numeração em negrito prevista no diário; não são defeitos.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [17]–[19] and [30]–[32]: the two added translator's notes are correct and match the journal; no defects.
- Rejected: pt-BR/ch001.md [18], [31] — The shown PT text ends with the footnote call and does not show the [^1]/[^2] definitions added last round. — The paragraph view does not display a footnote definition as its own block. The content of both notes matches the source and the journal: the antitypes are the Eucharistic bread and wine, and *psychē* means life/soul, which explains the shift from 'life' to 'soul' in [31]. A possible duplicate definition elsewhere in the file falls outside what was shown and cannot be checked here.
- Rejected: pt-BR/ch001.md [18] — 'substitute the antitypes' rendered as 'põem em seu lugar os antítipos'. — This is a faithful literal rendering of the source; the note added in this paragraph makes the sense clear.
- Rejected: pt-BR/ch001.md [32] — 'wild' rendered as 'insensatos'. — This is a defensible choice for the pejorative sense in a polemic; it is not a defect.
- Revertida (orquestrador): a nota acrescentada em `pt-BR/ch001.md` [18] duplicava a definição já existente do mesmo marcador; o revisor não via as notas do tradutor.
- Revertida (orquestrador): a nota acrescentada em `pt-BR/ch001.md` [31] duplicava a definição já existente do mesmo marcador; o revisor não via as notas do tradutor.
