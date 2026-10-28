# Diário de tradução — A Lenda de Barlaão e Josafá (pt-BR)

Fonte: en-US/, tradução de D. M. Kay, Ante-Nicene Fathers, vol. 9 (ed. Allan Menzies, 1896), revista por Kevin Knight para a New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Barlaam and Josaphat | Barlaão e Josafá | Formas portuguesas usuais. |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Apology of Aristides | Apologia de Aristides | |
| O King | ó Rei | Vocativo recorrente; tratamento por *tu*. |
| elements | elementos | |
| by necessity | por necessidade | Fórmula recorrente dos §§ 1–7. |
| a work of God | uma obra de Deus | Fórmula conclusiva recorrente. |
| sky / heaven | céu | |
| luminaries | luzeiros | |
| from sign to sign | de signo em signo | Signos do zodíaco. |
| ordered universe (Kosmos) | universo ordenado (*Kosmos*) | Grego mantido como na fonte, em itálico conforme a regra de formatação. |
| Chaldæans / Greeks / Egyptians / Jews / Christians | caldeus / gregos / egípcios / judeus / cristãos | Minúsculas, como gentílicos. |
| brute creatures | criaturas irracionais | |
| dispensation | economia | Termo patrístico (*oikonomia*). |
| only-begotten Son | Filho unigênito | |
| the Truth | a Verdade | Maiúscula como na fonte ([61]). |
| Kronos / Rhea / Zeus / Tartaros | Cronos / Reia / Zeus / Tártaro | Cronos e Reia conforme miscellaneous/ambrose. |
| Aphrodite | Afrodite | A fonte usa a forma grega; miscellaneous/ambrose tem Vênus porque sua fonte usa a latina. |
| Europe / Danae / Leda / Antiope / Semele | Europa / Dânae / Leda / Antíope / Sêmele | Conforme miscellaneous/ambrose. |
| Dionysos / Zethus / Amphion / Herakles / Apollo / Artemis / Perseus | Dioniso / Zeto / Anfião / Héracles / Apolo / Ártemis / Perseu | |
| Kastor / Helenes / Polydeukes | Castor / Helena / Polideuces | “Helenes” é Helena. |
| Minos / Rhadamanthys / Sarpedon / Muses / Ganymedes | Minos / Radamanto / Sarpédon / Musas / Ganimedes | |
| Hephaistos / Hermes / Asklepios / Ares / Eros | Hefesto / Hermes / Asclépio / Ares / Eros | |
| Tyndareos / Lacedaimon / Titans | Tíndaro / Lacedêmon / Titãs | |
| Anchises / Adonis / Hades / Persephone | Anquises / Adônis / Hades / Perséfone | |
| Isis / Osiris / Typhon / Horos / Byblus | Ísis / Osíris / Tifão / Hórus / Biblos | |
| Abraham / Isaac / Jacob / Moses / Pilate | Abraão / Isaac / Jacó / Moisés / Pilatos | |

## Decisões

- Os números de seção da Apologia (1 a 17), que na fonte abrem o parágrafo, foram mantidos como texto em negrito (`**1.**`), não como marcadores de lista.
- “Among you” em [9] foi traduzido por “entre vós”, pois se refere ao povo do rei, não só a ele. Nos demais casos, o rei é tratado por *tu*.
- Pronomes referentes a Deus e a Cristo em minúscula, porque a fonte é inconsistente no uso de maiúsculas.
- Os colchetes de [25] e os parênteses do editor ([18], [25], [34], [45]) foram mantidos como na fonte.
- “Unbegotten” ([55]) foi traduzido literalmente por “não gerado”. Foi acrescentada uma nota do tradutor para explicar que se trata do nascimento virginal (grego *asporōs*) e não de uma negação da geração eterna do Filho.
- “Dispensation” foi traduzido por “economia”, termo patrístico, inclusive na repetição da fonte (“admirável economia… augusta economia”).
- A fonte não tem notas do editor. Não há referências bíblicas explícitas; a alusão de [53] (“mão poderosa e braço erguido”) foi traduzida a partir da redação da fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]–[61], the footnote, the journal and book.json: no defects; the audit flags are the house-style bold section numbers and a compact but complete [8].
- Rejected: pt-BR/ch001.md [3]–[61] (17 places) — Emphasis markers differ (source 0, pt-BR 4) — These are the section numbers rendered as `**n.**`, as the journal decides; this is the house format.
- Rejected: pt-BR/ch001.md [8] — Length outlier at 70% of the source's word count — Every clause is present; the Portuguese is simply more compact ("which of them … which of them in error" → "quais deles … quais do erro").
- Rejected: pt-BR/ch001.md [31] — "e praticantes de outras terríveis iniquidades" may look detached after "se tornassem os homens adúlteros e as mulheres lascivas" — It reads as a third predicative of "se tornassem", with men and women as its subject. The source says the same and the grammar holds.
- Rejected: pt-BR/ch001.md [61] — "heirs" (plural) is rendered as "herdeiro" (singular) — The king is addressed as *tu*, per the Key Terms table, so the singular follows from the singular address; nothing is lost.
- Rejected: pt-BR/ch001.md [^1] — The footnote says "unbegotten" renders the Greek *asporōs* — This is correct: the Greek of Barlaam reads ἀσπόρως τε καὶ ἀφθόρως, which the source renders as "unbegotten and immaculate".

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 2 minor. Leitura integral de [1]–[61], nota do tradutor, diário e book.json: um defeito de sentido e duas correções menores relacionadas ao itálico.
- `pt-BR/ch001.md` [15]: “universo ordenado (Kosmos)” → “universo ordenado (*Kosmos*)” — O termo grego conservado deve receber itálico, conforme a regra de formatação desta revisão.
- `pt-BR/translation-journal.md`: “| ordered universe (Kosmos) | universo ordenado (Kosmos) | Grego mantido como na fonte, sem itálico. |” → “| ordered universe (Kosmos) | universo ordenado (*Kosmos*) | Grego mantido como na fonte, em itálico conforme a regra de formatação. |” — Atualiza a decisão para corresponder à regra de itálico para termos gregos conservados e à correção em [15].
- `pt-BR/ch001.md` [56]: “abstêm-se de toda conversa ilícita e de toda impureza” → “abstêm-se de todas as relações ilícitas e de toda impureza” — Neste uso antigo, 'unlawful conversation' refere-se a relações ou trato ilícitos; 'conversa' restringe indevidamente o sentido à fala. *(meaning)*
- Rejected: pt-BR/ch001.md, 17 ocorrências sinalizadas pela auditoria — Diferença na quantidade de marcadores de ênfase. — Os marcadores adicionais põem os números de seção em negrito, conforme o formato exigido.
- Rejected: pt-BR/ch001.md [8] — Tradução com apenas 70% da contagem de palavras da fonte. — Todas as orações e qualificações estão presentes; a diferença decorre da concisão do português.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [14]–[16] and [55]–[57] and the journal row: the round-2 fixes are correct and nothing else needs fixing.
- Rejected: pt-BR/ch001.md [56] — Whether “relações ilícitas” is the right rendering of “unlawful conversation”, against an alternative such as “conduta ilícita” — Archaic “conversation” here renders the Greek συνουσία ἄνομος, unlawful union or intercourse; “relações ilícitas” carries that sense, and the sentence's concord holds.
- Rejected: pt-BR/ch001.md [57] — “alegram-se com ele” for “rejoice over him” could read as rejoicing together with him — In context it reads naturally as rejoicing at his arrival, like rejoicing over a brother; this is a defensible rendering, not a defect.
- Rejected: pt-BR/ch001.md [14]–[57] — Audit flags: emphasis markers differ — They are the bold section numbers (`**n.**`) and, in [15], the italic *Kosmos*; both are the house format.
