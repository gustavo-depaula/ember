# Diário de tradução — Atas ou Disputa contra Fortunato, o Maniqueu (pt-BR)

Fonte: en-US/, tradução de Albert H. Newman (Nicene and Post-Nicene Fathers, First Series, vol. 4, ed. Philip Schaff, 1887; revista por Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Augustine of Hippo | Agostinho de Hipona | autor no book.json, como nos irmãos |
| Acts or Disputation Against Fortunatus the Manichaean | Atas ou Disputa contra Fortunato, o Maniqueu | título, toc e cabeçalho |
| Disputation of the First / Second Day | Disputa do primeiro dia / Disputa do segundo dia | cabeçalhos `##` |
| Augustine said: / Fortunatus said: | Agostinho disse: / Fortunato disse: | fórmula fixa de cada fala |
| Manichæans / heresy | maniqueus / heresia | |
| elder (of the Manichæans) | presbítero | |
| Elect / Auditor | Eleitos / Ouvinte | maiúscula como na fonte; nota do tradutor [^2] |
| race of darkness | raça das trevas | fixo em todo o texto |
| substance / nature / contrary nature | substância / natureza / natureza contrária | |
| commingling | mistura | |
| domains / kingdom (of God) | domínios / reino | |
| inviolable / incorruptible / incontaminable / impenetrable | inviolável / incorruptível / incontaminável / impenetrável | |
| injure / injury | lesar / dano | "suffer injury" → "sofrer dano" |
| virtue (sent by God) / power | virtude / poder | segue a alternância da fonte |
| liberator / liberate | libertador / libertar | |
| free will / free choice / free exercise of will | livre-arbítrio / livre escolha / livre exercício da vontade | como nos irmãos |
| necessity | necessidade | |
| sin / penalty of sin / avenger | pecado / pena do pecado / vingador | |
| repentance / forgiveness of sins | arrependimento / perdão dos pecados | |
| deserts | merecimentos | como em `rebuke-and-grace` |
| habit | hábito | cap. 22 |
| mind (Fil 2:5) | sentimento | caps. 7–8 |
| mind of the flesh (Rm 8:7) | pensamento da carne | caps. 21–22; distinto de "mind" = mente |
| covetousness (1 Tm 6:10) | cobiça | "lusts against" (Gl 5:17) → "cobiça contra"; "lusts of our flesh" (Ef 2:3) → "concupiscências" |
| righteousness / righteous | justiça / justo | |
| Paraclete | Paráclito | |
| your dignity | Vossa Dignidade | cap. 21 |
| limit / restraint / unrestrained | limite / freio / desmedido, desmedida | segundo dia, caps. 33–36 |
| going forth (of the soul) | saída | segundo dia, caps. 29–30 |
| lay down my soul / take it (Jo 10:18) | depor a minha alma / retomá-la | "soul", e não "vida": o argumento depende da palavra |
| Arcadius Augustus, Rufinus | Arcádio Augusto, Rufino | |
| Hippo Regius / baths of Sossius | Hipona Régia / termas de Sósio | |

## Decisões

- Tratamento: Agostinho e Fortunato tratam-se por *tu*. Quando o "you" ou "your" se refere à seita ("your heresy", "your Elect", "according to your faith", "when I was among you"), usa-se *vós*/*vossa*. Nas falas da alma dirigidas a Deus (caps. 17 e 21), usa-se *vós*. No cap. 17 quem fala é a alma (concordância no feminino). No cap. 21 é o próprio Agostinho, em primeira pessoa (masculino).
- Os números de parágrafo da fonte ("1.", "2." …) vão em negrito inerte (`**1.**`).
- As referências bíblicas ficam no lugar e na forma da fonte, sem parênteses, inclusive as que a fonte dá de modo impreciso: Gálatas 5:14 (é 6:14), Efésios 5:12 (é 6:12), Mateus 12:35 (é 12:33), Romanos 11:1 no meio da frase.
- No cap. 22 (parágrafo de Fortunato), a fonte fecha uma aspa sem tê-la aberto, depois de "domination of darkness". Foi suprimida, porque o trecho é discurso indireto.
- O colchete editorial "[*i.e.*, Jews]" foi traduzido como "[*isto é*, os judeus]". O termo *Codex* fica em latim e itálico, como na fonte.
- "You know the necessity by which I am preserved" (cap. 17) foi traduzido como "pela qual sou retida", pelo sentido (*teneor*), já que "preserved" não faz sentido em português.
- Foram mantidas as frases obscuras ou ilógicas da fonte, como "agree in forms and in names" (cap. 14) e "Can the substance of God … be subject to no passions?" (cap. 11). A tradução não as corrige.
- Em João 10:18 (segundo dia, caps. 32–34), mantém-se "alma", como na fonte, porque Fortunato apoia nessa palavra a sua tese sobre a alma enviada por Deus.
- No cap. 33 (parágrafo de Fortunato), a fonte tem "bodies,which" sem espaço. A falha tipográfica foi corrigida.
- No último parágrafo de Fortunato, "Without prejudice to my profession" foi traduzido literalmente, como "Sem prejuízo da minha profissão", e "it will be in my contemplation" como "terei em vista".
- Notas do tradutor: [^1], com o ano do consulado (392), no parágrafo de abertura; [^2], sobre Eleitos e Ouvintes, no cap. 3.
- O campo `description` de `sources` no book.json é uma string e não um objeto por idioma. Por isso ficou sem entrada pt-BR.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 3 minor. Full read of ch001 (82 paragraphs, footnotes, journal, book.json): faithful and complete; 3 minor fixes (Key Terms drift, an ambiguous relative clause, a comma between subject and verb).
- `pt-BR/ch001.md` [50]: “de modo que nelas se signifique o livre-arbítrio” → “de modo que nelas se signifique a livre escolha” — source says "free choice may be there signified"; the Key Terms table gives free choice → livre escolha, as used earlier in the same paragraph and in [56]
- `pt-BR/ch001.md` [63]: “soprou nele uma alma que certamente sabia de antemão” → “soprou nele uma alma que ele certamente sabia de antemão” — source says "which assuredly He foreknew"; without "ele" the soul reads as the subject of "sabia"
- `pt-BR/ch001.md` [37]: “porque o apóstolo, Romanos 11:1 estava preso à lei” → “porque o apóstolo Romanos 11:1 estava preso à lei” — the added comma separates the subject "o apóstolo" from its verb "estava"; the source has no comma there
- Rejected: pt-BR/ch001.md [4] … [80] — audit flag: emphasis markers differ (source 0, pt-BR 4) — these are the bold paragraph numbers `**n.**` that the journal sets as house format
- Rejected: pt-BR/ch001.md [48] — audit flag: parentheses differ — the parentheses render the source's em-dash parenthesis "— which must especially be attended to …"; the content is intact
- Rejected: pt-BR/ch001.md [48] — masculine "contaminado", "oprimido" in the soul's speech — Augustine speaks in the first person here, as the journal records; cap. 17 keeps the feminine for the soul
- Rejected: pt-BR/ch001.md [49] — "E dizes que isto é pecado da alma" attributes the second clause to Augustine — the source puts both "that" clauses under "as you say"; the rendering follows the source's structure
- Rejected: pt-BR/ch001.md [73] — "Deus a retoma" is ambiguous between the soul and the contrary nature — the source "God takes the same" is equally ambiguous; no commitment is forced

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos 82 blocos, notas, diário, book.json e flags da auditoria: duas correções menores de concordância e regência.
- `pt-BR/ch001.md` [35]: “nas almas da desobediência; entre os quais” → “nas almas da desobediência; entre as quais” — O relativo retoma “almas”, tradução de “souls”, e deve concordar no feminino.
- `pt-BR/ch001.md` [48]: “das quais, no entanto, ele é de longe mais excelente” → “em comparação com as quais, no entanto, ele é de longe mais excelente” — A fonte estabelece uma comparação (“than which”); “das quais” não rege corretamente os comparativos “mais excelente” e “mais eminente”.
- Rejected: pt-BR/ch001.md [4]–[80], 37 flags de ênfase — Marcadores de ênfase ausentes na fonte. — São os números de parágrafo em negrito, conforme a convenção registrada no diário.
- Rejected: pt-BR/ch001.md [48] — Parênteses adicionais. — Substituem os travessões que delimitam o inciso da fonte, preservando seu conteúdo.
- Rejected: pt-BR/ch001.md [36] — “Preserved” traduzido como “retida”. — A leitura como permanência sob a necessidade é defensável no contexto de sujeição; não é seguro impor aqui o sentido de proteção.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [34]–[49]: both round-2 changes (concord in [35], comparative regency in [48]) are correct, and the paragraphs shown are complete and faithful, with no new defects.
- Rejected: pt-BR/ch001.md [35] — Check of the round-2 fix "entre as quais" — The source's "among whom" goes back to "souls of disobedience", which is rendered "almas", so the feminine is right. The rest of the Ephesians quotation is complete and faithful.
- Rejected: pt-BR/ch001.md [48] — Check of the round-2 fix "em comparação com as quais" — The phrase renders the comparison "than which" correctly, and the sentence stays grammatical with both comparatives.
- Rejected: pt-BR/ch001.md [48] — "Wherefore if it is reverential to believe…" is split into an assertion followed by "Por isso…", which drops the "if" — The "if" works as a concessive "since". Restating it as an assertion keeps the source's logical consequence.
- Rejected: pt-BR/ch001.md [36] — "so that we … may be made alive … and may have peace" is rendered in the indicative ("somos vivificados", "temos paz") — Read as a statement of result, the sense is the same. This is a defensible style choice.
- Rejected: pt-BR/ch001.md [47], [49] — The connectives "since" and "for" are rendered "Mas" — In context both clauses work as counter-arguments to Augustine, so the reasoning is preserved.
- Rejected: pt-BR/ch001.md [48] — Audit flag: parentheses differ — Round 1 already rejected this. The parentheses replace the source's em-dash aside, and its content is intact.
