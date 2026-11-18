# Diário de tradução — Do reconhecimento da própria fragilidade (pt-BR)

Fonte: la/, *De recognitione propriae fragilitatis*, ed. M. J. Pohl (Freiburg: Herder 1904), Opera omnia II; OCR bruto do archive.org.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Thomas a Kempis | Tomás de Kempis | Convenção das obras irmãs e dos metadados. |
| recognitio propriae fragilitatis | reconhecimento da própria fragilidade | Título dos metadados. |
| fragilitas / infirmitas | fragilidade / fraqueza | Conservada a distinção lexical. |
| vana gloria | glória vã | Convenção de *O Hospício dos Pobres*. |
| supportatio / sustinere / tolerare | suportar | Título de p1-04 em forma verbal. |
| inopia spiritualis / paupertas gratiae | indigência espiritual / pobreza da graça | |
| subtractio / subtrahere | subtração / subtrair | Termo próprio da retirada da consolação. |
| suavitas / dulcedo | suavidade / doçura | |
| consolatio / solacium | consolação | Convenção das obras irmãs. |
| resignatio / se resignare | renúncia de si / renunciar a si mesmo | |
| subiectio / subiectus | sujeição / sujeito | |
| profectus | progresso | Convenção das obras irmãs. |
| religiosus / frater / conventus | religioso / irmão / comunidade | Convenções das obras irmãs. |
| humilitas / caritas / patientia | humildade / caridade / paciência | Convenções das obras irmãs. |
| concupiscentia / cupiditas | concupiscência / cobiça | |
| flagella / flagellare | açoites / açoitar | |
| beneplacitum | beneplácito | Convenção das obras irmãs. |
| divinum officium / chorus / horae | ofício divino / coro / horas | Vocabulário da vida religiosa. |
| animus | ânimo | |
| David | Davi | Forma portuguesa das obras irmãs. |
| Dominus Iesus Christus / Salvator / Creator | Senhor Jesus Cristo / Salvador / Criador | Convenções das obras irmãs. |
| tu, dirigido ao leitor | tu | Exortações individuais. |
| tu, dirigido a Deus | vós | Tratamento reverente das obras irmãs. |
| gaudium, apostrofado em p1-07 | tu | Apóstrofe à alegria. |

## Decisões

- Cabeçalhos correntes (*DE RECOGNITIONE PROPRIAE FRAGILITATIS*), números de linha e lixo de OCR no meio do texto foram omitidos; iniciais capitulares deturpadas foram restituídas pelo sentido.
- p1-01: a citação de abertura (Salmo 118:75 da Vulgata) aparece partida no OCR, com *iudicia tua: et in veritate tua* deslocado para a frase sobre o senhor da terra; restituída no seu lugar. Nota do tradutor sobre a numeração do Salmo.
- p1-01 [3] e p1-03 [3] começam no meio de uma frase, por quebra de página do OCR; mantidos como parágrafos separados, conforme a fonte.
- p1-02: a capitular deturpada (*Ded Erum*) foi lida como *Verum* (“Na verdade”).
- p1-04 [2]: o início está ilegível no OCR (*Im doctrina*); marcado como lacuna “[…]” em vez de conjeturar uma palavra.
- p1-04 [4]: parágrafo que contém só lixo de OCR (provável vinheta tipográfica); vertido como separador “* * *” para conservar a contagem de parágrafos.
- p1-06: *autem* do OCR lido como *aurem* (“inclina o ouvido”). p1-08: *locum* lido como *cum*. p1-07: capitular *Ises* lida como *Disce*.
- p1-07: a oração ao Senhor estende-se por dois parágrafos; o segundo reabre as aspas, e a apóstrofe à alegria usa aspas simples.
- p1-07: *confitere* vertido por “confessa”, para conservar o paralelismo dos dois membros.
- p1-07: nota do tradutor sobre o jogo *dolor*/*dolus*.
- p1-08: nota do tradutor sobre “rins” e o eco do Salmo 25:2 da Vulgata. *Lege* vertido por “recita”, como em *O Hospício dos Pobres*.
- Aspas acrescentadas às citações diretas, que a edição de Pohl marca só pela pontuação.
- *Explicit* final vertido em caixa-alta, como na fonte: “AQUI TERMINA O LIVRINHO DO RECONHECIMENTO”.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of p1-01 to p1-08, book.json and the journal: the translation is complete and faithful, with no defects found; both audit flags are deliberate, documented choices.
- Rejected: pt-BR/p1-04.md [4] — Emphasis markers differ (source 0, pt-BR 3) — The asterisks are the '* * *' separator standing in for an OCR-garbage paragraph, as the journal records; it is not emphasis.
- Rejected: pt-BR/p1-07.md [2] — Unbalanced quotes (one opening, no closing) — The prayer runs on into [3], which reopens the quotation marks. This is the Portuguese convention for multi-paragraph quotations, and the journal records it.
- Rejected: pt-BR/p1-03.md [3] — 'Quando tiveres cuidado bem das tuas coisas' reads awkwardly — It is the compound future perfect of 'cuidar' with an adverb, grammatical and faithful to 'Cum tua bene curaveris'.
- Rejected: pt-BR/p1-06.md [2] — 'palavras do Santo' capitalized for 'sermonibus sancti' — The phrase echoes Job 6:10 Vg ('nec contradicam sermonibus Sancti'), where it means the Holy One, so the reading is defensible.
- Rejected: pt-BR/p1-03.md [5] — 'apenas um' for 'vix unus' — 'apenas' can mean 'mal, a custo' in Portuguese, so it covers the sense of 'vix'.
- Rejected: pt-BR/p1-01.md [^1], pt-BR/p1-08.md [^1] — Psalm citations in translator's notes — Both are correct: Ps 118:75-76 Vg ('Cognovi, Domine, quia aequitas iudicia tua…'; 'Fiat misericordia tua ut consoletur me…') and Ps 25:2 Vg ('ure renes meos et cor meum').

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de p1-01 a p1-08, notas do tradutor, book.json e diário; conferidos os dois alertas mecânicos, sem defeitos objetivos encontrados.
