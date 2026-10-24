
## Termos

| Bride | Esposa | A Igreja, na imagem nupcial. |
| Song of Songs | Cântico dos Cânticos | |
| Revelation | Apocalipse | |
| Circe / Icarus | Circe / Ícaro | |
| confessors | confessores | §132, testemunhas da fé, em paralelo com mártires, virgens e sacerdotes. |
| incorruption / immortality | incorruptibilidade / imortalidade | §135. |

## Decisões

- Traduzidas as 22 unidades-fonte finais, correspondentes aos §§115–135, preservando a repetição do número 124.
- Mantidas as referências da fonte, inclusive Lucas 13:26, Mateus 12:28-29, Apocalipse 21:7 e Apocalipse 21:3, sem corrigir sua correspondência com as citações.
- Nos §§118–120, mantido o tratamento singular “tu” na apóstrofe à Igreja; nos §§127, 129 e 131, empregado “vós” para os interlocutores plurais; no §132, “Vós” no tratamento reverente a Deus e a Cristo; no §135, “tu” para o irmão.
- No §118, preservados “irmão” e “peito” conforme a formulação da fonte, sem substituí-los por termos de versões bíblicas correntes.
- No §132, “purple stripes” foi traduzido por “faixas de púrpura”, preservando a imagem de adorno nupcial da fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of both books (ch001 §§1–80 with the introduction, ch002 §§1–135), the notes, journal and book.json; fixed one fidelity slip (north wind 'hard') and cut one unverifiable link from translator's note 1.
- `pt-BR/ch002.md` [119]: “o vento norte é um vento impetuoso” → “o vento norte é um vento duro” — source: 'the north is a hard wind'; the hardness is what ties the north wind to the 'dureza de seus corações' in the same sentence, and 'impetuoso' loses that link *(meaning)*
- `pt-BR/ch001.md`: “ Ver o verbete [*οὐράνιος*, no léxico de Liddell–Scott–Jones](https://cld.bbaw.de/lemma/grc/%CE%BF%E1%BD%90%CF%81%CE%AC%CE%BD%CE%B9%CE%BF%CF%82).” → “” — cannot confirm that the linked site hosts the Liddell–Scott–Jones entry; cut back to the certain claim (Urânio < οὐράνιος, 'celeste')
- Rejected: audit: parentheses differ (ch001 [40], [44]; ch002 [67], [79], [91], [112]) — source parentheses rendered with commas, dashes or 'pois' — content is kept in every case; punctuation choice only
- Rejected: audit: repeated word ch002 [130] — 'Jeremias Jeremias 20:18' — the name followed by the inline Scripture reference, as in the source
- Rejected: audit: emphasis markers — added italics and bold — bold paragraph numbers and italic Latin are house format
- Rejected: pt-BR/ch001.md [38] vs ch002.md [97] — Enoque / Henoc — both are standard Portuguese forms, and each file is internally consistent
- Rejected: pt-BR/ch002.md [103] — 'A coxa de Jacó' commits the antecedent of 'whose thigh' — the context (Genesis 32:25, 'Heir of his body') requires Jacob
- Rejected: pt-BR/ch001.md footnote [^2] — identification of Lucifer and the link — Lucifer of Cagliari, Sardinia, 4th century, is correct; New Advent 3005 is Jerome's Dialogue against the Luciferians

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 2 minor. Leitura integral dos dois livros, das notas, do diário, de book.json e dos alertas mecânicos: dois defeitos de sentido e dois menores.
- `pt-BR/ch001.md` [16]: “esquecer-te, contigo que sempre puxei” → “esquecer-te, com quem sempre puxei” — A fonte diz “with whom”; “contigo que” não forma a oração relativa necessária.
- `pt-BR/ch001.md` [32]: “tua força, sozinho, era maior” → “tua força, por si só, era maior” — “Your power alone” qualifica a força; “sozinho” fica sem concordância na construção portuguesa.
- `pt-BR/ch001.md` [54]: “esperar daquilo que, recebido no peito, tanto o havia beneficiado quando coberto por um lenço” → “esperar, quando o recebesse no peito, daquilo que tanto o havia beneficiado quando coberto por um lenço” — A fonte distingue o benefício já recebido mediante o lenço daquele esperado ao receber o Sacramento no peito. A construção atual vincula “recebido no peito” ao benefício passado. *(meaning)*
- `pt-BR/ch001.md` [72]: “mas a cada uma, pois parece ser dito à Igreja” → “mas a cada um, pois parece ser dito à Igreja” — “To each” abrange os destinatários individualmente, incluindo Ambrósio, que aplica a mensagem a si no parágrafo seguinte. O feminino restringe indevidamente a aplicação às mulheres. *(meaning)*
- Rejected: pt-BR/ch001.md [11]; pt-BR/ch002.md [94] — As afirmações “é piedade recusar um sacrifício” e “em Cristo todos morrem” parecem anômalas. — Ambas reproduzem expressamente a fonte canônica; não cabe corrigir a edição por conjectura.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [15]-[17], [31]-[33], [53]-[55], [71]-[73]: all four round-2 fixes check out against the source and their sentences; no new defects.
- Rejected: pt-BR/ch001.md [72] — 'a cada um' could lose the link to 'that one woman' — 'To each' is open in gender, and Ambrose applies the message to himself in [73]. The generic masculine is correct.
- Rejected: pt-BR/ch001.md [54] — 'o recebesse' points ahead to 'daquilo' — The pronoun's referent is clear in the sentence. The construction now separates the benefit received through the napkin from what he expected on receiving the Sacrament in the breast, as the source does.
- Rejected: pt-BR/ch001.md [53] — 'Contempla' uses 'tu' where [17] addresses the congregation as 'vós' — 'Behold' is a rhetorical apostrophe to the reader. The singular imperative is a defensible style choice.
- Rejected: pt-BR/ch001.md [17] — 'aquele que podeis imitar' does not capitalize the source's 'One Whom' — The house rules forbid normalizing reverential capitalization. The sense (Christ) is clear from the context.
