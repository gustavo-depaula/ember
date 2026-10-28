
## Termos

| Firstborn | Primogênito | distinto de “Unigênito” |
| Watchers / Watcher | Vigilantes / Vigilante | seres angélicos; o singular designa o anjo no sonho dos Magos e na saudação a Maria |
| Paraclete | Paráclito | |
| Godhead | Divindade | |
| Evil One / Abhorred One | Maligno / Abominável | epítetos substantivados |
| Nisan / Conun | Nisan / Conun | nomes dos meses conservados conforme a edição |
| Ephrata / Bethlehem / Sion | Éfrata / Belém / Sião | |
| Micah / Balaam / Joshua | Miqueias / Balaão / Josué | |
| All-Life giver / All-Releaser / All-Purifier | aquele que dá vida a todos / Libertador de todos / aquele que a todos purifica | epítetos traduzidos por seu sentido |

## Decisões

- Traduzidos os parágrafos 294–497, com um parágrafo por unidade da fonte, além da nota do tradutor; mantidos os títulos dos Hinos 15–19, os refrães, os destaques e os travessões. Conservado o refrão vazio “R.,” no parágrafo 413 e o parêntese externo sem fechamento no parágrafo 391.
- Nos apelos à Igreja, a Belém, a Éfrata, a Maria e ao Povo personificado, empregado “tu”; nos apelos às nações e aos demais destinatários plurais, “vós”. Mantido “vós” para Deus e Cristo, inclusive na citação do parágrafo 473.
- “All of You”, no Hino 16, foi traduzido por “vós por inteiro”, preservando a referência à totalidade daquele a quem o hino se dirige.
- Conservadas as formulações incomuns da fonte: o refrão “Blessed be by Your Worship” no parágrafo 379; “como cego” no parágrafo 444; “segundo Filho” no parágrafo 489; e “como quarto dia” no parágrafo 491, sem emendas conjecturais.
- “Vesper-day”, no parágrafo 493, foi traduzido por “dia da Véspera”, mantendo a designação da fonte.
- Acrescentada a nota `[^4]` no parágrafo 496 para assinalar que a fonte imprime “God” (“Deus”) na passagem sobre a primeira letra do nome de Jesus e seu valor numérico; a leitura foi preservada, sem substituição conjectural.

## Review log

### Round 1 (claude, full read)
Verdict: 3 meaning-level, 1 minor. Full read of ch001 [1]–[497], footnotes, book.json and journal; 4 fixes (3 meaning: Eve's birth subject, John and the latchet, 'por nós' agent; 1 minor: nisã→Nisan per Key Terms).
- `pt-BR/ch001.md` [4]: “A Eva, nossa mãe, deu à luz um homem que ele próprio não havia nascido.” → “Um homem que não havia nascido deu à luz Eva, nossa mãe.” — Source: 'To Eve our mother a man gave birth, who himself had had no birth' (Adam gave birth to Eve). The PT reads as 'Eve gave birth to a man', and the relative clause 'que ele próprio não havia nascido' is ungrammatical. *(meaning)*
- `pt-BR/ch001.md` [49]: “inspirava temor a João, ao desatar a correia de sua sandália” → “inspirava a João temor de desatar a correia de sua sandália” — Source: 'He was awful to John for him to loose His shoe's latchet' (John was too awed to loose it). The PT has John fearing while loosening the strap, or leaves the subject of 'desatar' unclear. *(meaning)*
- `pt-BR/ch001.md` [61]: “no mês de nisã” → “no mês de Nisan” — The Key Terms table keeps 'Nisan' as in the edition, and [318] uses 'Nisan'.
- `pt-BR/ch001.md` [384]: “foram realizadas por nós em vosso Nascimento” → “foram realizadas em nosso favor em vosso Nascimento” — Source: 'have been done for us'. In PT, 'por nós' reads as the agent ('by us'). *(meaning)*
- Rejected: pt-BR/ch001.md [243]–[497] (mechanical audit) — Emphasis markers differ from the source — The difference comes from the bold paragraph numbers (**1.**), a house format that also keeps 'N. ' from rendering as a Markdown list. No italics were lost or added.
- Rejected: pt-BR/ch001.md [277] — 'décimo terceiro ano' where the sequence expects the thirtieth — The source reads 'thirteenth'. The edition is not corrected.
- Rejected: pt-BR/ch001.md [3] — 'Isaías 10:19' looks like a wrong reference — It reproduces the source. References are not corrected.
- Rejected: pt-BR/ch001.md [7] [^1] — Translator's note on Josué/Jesus — The claim is accurate: both names are Iēsous in Greek, and the English edition uses 'Jesus' (cf. Hebrews 4:8 KJV).

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos parágrafos [1]–[497], das quatro notas, de book.json, do diário e dos alertas mecânicos: um defeito de sentido e um de regência.
- `pt-BR/ch001.md` [234]: “e Aquele que tudo basta restaurou” → “e Aquele que a tudo basta restaurou” — Falta a preposição exigida por «bastar» neste sentido de ser suficiente.
- `pt-BR/ch001.md` [273]: “e sustentou nossa causa.” → “e ganhou nossa causa.” — No contexto judicial, «carried our cause» significa ganhar a causa; «sustentou» expressa sua defesa, mas omite o resultado favorável. *(meaning)*
- Rejected: pt-BR/ch001.md [195] — «filhas das virgens dos chefes» parece confundir filhas virgens com filhas de virgens. — Embora [477] sugira a primeira leitura, a fonte deste parágrafo traz expressamente «virgins' daughters». A anomalia não pode ser atribuída com segurança à tradução.
- Rejected: pt-BR/ch001.md [385] — «se adornou» emprega construção reflexiva onde a fonte apresenta «has been adorned». — O contexto imediato afirma que ele próprio se revestiu de nosso corpo; a construção reflexiva é defensável nesse contexto.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [233]–[235] and [272]–[274]: both changes ([234] regency, [273] 'ganhou nossa causa') are correct and the paragraphs around them are clean.
- Rejected: pt-BR/ch001.md [234] — Whether 'Aquele que a tudo basta' renders 'the all-sufficient One' correctly. — 'Bastar a' (to suffice for) gives the epithet's sense, and the fix supplies the preposition the verb requires in this sense.
- Rejected: pt-BR/ch001.md [273] — Whether 'ganhou nossa causa' is right for 'carried our cause'. — In a courtroom context, 'carry a cause' means to win it. The rendering is faithful and fits the 'tribunal' clause before it.
- Rejected: pt-BR/ch001.md [272] — 'Ele entrou no Inferno, saqueou-o, Isaías 49:24 e saiu' leaves out the 'and' between 'entered' and 'spoiled'. — The asyndeton keeps every action and the reference in place. It is a defensible style choice.
