
## Termos

| lust | paixão | Para a *libido* agostiniana; “carnal lust” = “paixão carnal”, “prurient desire” = “desejo lascivo”. |
| concupiscence | concupiscência | Distinta de “paixão” no argumento dos capítulos 38–44. |
| exsufflation | exsuflação | Rito pré-batismal; ver nota [^6] do Livro II. |
| the pledge / bond of union | o penhor / o vínculo da união | O *sacramentum* do matrimônio; ver nota [^5] do Livro II. |
| Ambrose | Ambrósio / Santo Ambrósio | |
| Novatians | novacianos | |
| Platonists | platônicos | |
| Melchizedek | Melquisedeque | |
| beast | animal | “O vício do homem é a natureza do animal” (capítulo 46). |

## Decisões

- Nos Salmos e demais citações dirigidas a Deus ou a Cristo com “You/Your” (capítulos 29 e 33), usa-se *vós*: “Criai em mim”, “o vosso trono”, “Vós sois Sacerdote para sempre”.
- Os destinatários do tratado são tratados por *vós* (“dizei-me”, capítulo 35; “não vos são desconhecidas”, capítulo 39; “ledes”, capítulo 48). O “podes ler” da citação de Ambrósio (capítulo 47) mantém o *tu* genérico da fonte.
- “The *maker* of man… *made* man” (capítulo 38) foi traduzido por “*fez* o homem… foi *feito* homem”, para conservar o jogo de palavras.
- “The pride of the Destroyer is destroyed” (capítulo 46) foi mantido como “a soberba do Destruidor é destruída”.
- O cabeçalho do capítulo 33 conserva o número “[XVIII.]” da fonte, embora a sequência peça XXVIII.
- A referência “1 Maccabbees 2:69” da fonte foi grafada “1 Macabeus 2:69”.
- No capítulo 29, a frase “were not themselves partakers of them” segue a redação da fonte inglesa.
- Notas do tradutor do Livro II, continuação: [^5] relaciona os três bens do matrimônio à tríade *proles, fides, sacramentum* (capítulo 39); [^6] explica a exsuflação (capítulo 45); [^7] informa que o comentário de Ambrósio a Isaías se perdeu (capítulo 47).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos Livros I e II; duas falhas menores de grafia e conjugação no Livro II, sem defeitos de sentido.
- `pt-BR/ch002.md` [50]: “afirma claríssimamente que” → “afirma clarissimamente que” — advérbios em -mente perdem o acento gráfico do adjetivo (clarissimamente)
- `pt-BR/ch002.md` [52]: “a Igreja já se precavém mais diretamente” → “a Igreja já se previne mais diretamente” — precaver é defectivo e não tem a 3ª pessoa do singular do presente; “precavém” é forma inexistente
- Rejected: pt-BR/ch002.md [26] — audit: emphasis markers 0 vs 2 — o itálico marca o grego retido (*ἀναμάρτητος*), conforme a regra da casa; a fonte traz o termo partido por erro de OCR
- Rejected: pt-BR/ch002.md [70] — audit: parentheses 0 vs 1 — “(não, nem um só)” troca os travessões da fonte por parênteses; é escolha de pontuação, sem perda de sentido
- Rejected: pt-BR/ch001.md [26], [70], [110] — referências 2 Coríntios 4:6, Efésios 1:8 e 1 Coríntios 13:13 parecem erradas (4:16, 2:8, 13:12) — a tradução reproduz a fonte; não se corrige a edição
- Rejected: pt-BR/ch002.md [54] — “civilmente” em vez de “courteously” — verte o *civiliter* latino, que o inglês traduz mal, e a nota [^3] justifica a escolha; é defensável
- Rejected: pt-BR/ch002.md [40] — “como se… pudessem ter outra coisa que não a morte eterna” parece inverter o inglês — o inglês é ambíguo e a versão portuguesa dá o sentido correto do argumento de Agostinho
- Rejected: notas do tradutor, Livros I e II — verificação de fatos (Melânia/Albina, posse/velle/esse, Demetríade, Assuero e Ester gregos, Rufino Sírio, De peccatorum meritis, cronologia de Matusalém, tríade proles/fides/sacramentum, comentário perdido a Isaías) — todas as afirmações conferem com o que se sabe

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 2 minor. Leitura integral dos 210 blocos, das 13 notas, do book.json e do diário: 1 defeito de sentido e 2 menores.
- `pt-BR/ch001.md` [24]: “não só é recomendado, mas instado sobre nós até que o aceitemos” → “não só é recomendado, mas nos é proposto com insistência até que o aceitemos” — “Pressed upon us” indica apresentação insistente; “instado sobre nós” é um decalque com regência inadequada.
- `pt-BR/ch002.md` [50]: “rescrito do Concílio africano, província em que” → “rescrito do Concílio da África, província em que” — A fonte identifica a África como província; a redação atual liga indevidamente esse aposto ao Concílio.
- `pt-BR/ch002.md` [96]: “em Adão. Assim, como nele estou sujeito à culpa do pecado e condenado à morte, também em Cristo serei justificado.” → “em Adão, para que, assim como nele estou sujeito à culpa do pecado e à morte, também em Cristo eu seja justificado.” — “So as that […] I may be also justified” exprime finalidade, não uma afirmação no futuro. “Subject to death” significa sujeito à morte. *(meaning)*
- Rejected: pt-BR/ch002.md [26] — Diferença na quantidade de marcadores de ênfase. — O itálico identifica o grego retido, conforme a regra da casa.
- Rejected: pt-BR/ch002.md [70] — Parênteses ausentes na fonte. — Substituem os travessões em “no, not one”, preservando integralmente o sentido.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [23–25] and ch002 [49–51], [95–97] with their notes: the three fixes of round 2 are correct and the shown paragraphs have no defects.
- Rejected: pt-BR/ch001.md [24] — “nos é proposto com insistência” could be checked against “pressed upon us” — It renders the sense of insistent presentation with correct regency and fits the series “recomendado… proposto”.
- Rejected: pt-BR/ch002.md [50] — “Concílio da África, província em que” could be checked against “African Council, into which province” — The appositive now refers to Africa as the province, as in the source; the sentence reads well.
- Rejected: pt-BR/ch002.md [96] — “para que, assim como nele estou sujeito à culpa do pecado e à morte, também em Cristo eu seja justificado” could be checked against the source — It keeps the purpose of “so as that … I may be justified”, with “eu seja” in the subjunctive, and both complements depend on “sujeito”; it joins the preceding clause correctly.
- Rejected: pt-BR/ch002.md [96] — “como podes ler” (tu) beside “como podeis ler” (vós) in [50] — The journal records this choice: it keeps the generic tu of Ambrose's quotation.
