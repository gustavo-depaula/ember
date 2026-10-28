
## Termos

| Leo / Tabraca | Leão / Tábraca | |
| presbyterate / Metropolitans | presbiterado / metropolitanos | |

## Decisões

- Traduzido o parágrafo 546 em uma única unidade, preservando os esclarecimentos entre colchetes e as formas latinas *Sacerdotibus* e *sacerdotum*. Mantido o tratamento singular dirigido a Celestino.
- “Clearing” foi vertido como comprovação da inocência, em referência ao resultado esperado da investigação das acusações contra Apiário.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 9 minor. Full read of ch001: complete and faithful; fixed one meaning error ([430] 'put to death'), a heading typo, a mixed form of address, and term consistency (commonitório, metropolitanos).
- `pt-BR/ch001.md` [461]: “### Cânonon 115.” → “### Cânon 115.” — typo in heading; source 'Canon 115.'
- `pt-BR/ch001.md` [430]: “foram condenados à morte” → “foram mortos” — source 'were put to death' means they were killed, not sentenced to death *(meaning)*
- `pt-BR/ch001.md` [223]: “devolva o clérigo ao teu povo” → “devolva o clérigo ao vosso povo” — same sentence addresses Epigônio as 'Vossa Dignidade'; 'teu' breaks the form of address
- `pt-BR/ch001.md` [95]: “os Metropolitas se reúnam” → “os Metropolitanos se reúnam” — Key Terms table: Metropolitans → metropolitanos
- `pt-BR/ch001.md` [132]: “apresentada ao Metropolita da província” → “apresentada ao Metropolitano da província” — Key Terms table: Metropolitans → metropolitanos
- `pt-BR/ch001.md` [528]: “produziram então o Comonitório” → “produziram então o Commonitório” — rest of the file spells the term 'commonitório'
- `pt-BR/ch001.md` [528]: “trouxeram no comonitório” → “trouxeram no commonitório” — rest of the file spells the term 'commonitório'
- `pt-BR/ch001.md` [530]: “como alegava o Comonitório” → “como alegava o Commonitório” — rest of the file spells the term 'commonitório'
- `pt-BR/ch001.md` [530]: “contidos no comonitório antes mencionado” → “contidos no commonitório antes mencionado” — rest of the file spells the term 'commonitório'
- `pt-BR/ch001.md` [530]: “no referido Comonitório acerca” → “no referido Commonitório acerca” — rest of the file spells the term 'commonitório'
- Rejected: pt-BR/ch001.md [319] — space before punctuation — ellipsis line '. . . .' reproduces the source exactly
- Rejected: pt-BR/ch001.md emphasis/parentheses flags — marker counts differ — retained Latin/Greek italicized per house rule; English parentheses rendered with commas or dashes; no content lost
- Rejected: pt-BR/ch001.md [120]/[423] — 'carta formal' vs 'carta formada', two similar notes — both notes are accurate; wording difference does not misinform
- Rejected: pt-BR/ch001.md [472] — 'unequal/equal number' rendered as ímpar/par — matches the sense of the division rule

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral dos 546 parágrafos, das seis notas, dos metadados, do diário e das sinalizações mecânicas: um defeito de sentido e três menores.
- `pt-BR/ch001.md` [25]: “deve-se tomar providências” → “devem-se tomar providências” — Na construção passiva com «se», a locução verbal deve concordar com o sujeito plural «providências».
- `pt-BR/ch001.md` [104]: “a partir do dia em que se comprovar que recebeu as cartas” → “a partir da data comprovada do recebimento das cartas” — A fonte conta o prazo desde o recebimento comprovado das cartas, não desde o dia em que esse recebimento for comprovado. *(meaning)*
- `pt-BR/ch001.md` [246]: “no Domingo in albis” → “no Domingo *in albis*” — A expressão latina deve estar em itálico, conforme a regra editorial.
- `pt-BR/ch001.md` [541]: “etc....a Igreja” → “etc.... a Igreja” — Falta o espaço entre as reticências e a palavra seguinte.
- Rejected: pt-BR/ch001.md [223] — «Dos mais antigos» poderia enfraquecer «most ancient by his promotion». — A formulação inglesa admite valor elativo, sem estabelecer inequivocamente que Vítor fosse o único mais antigo; a tradução é defensável.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of four changes in ch001 ([25], [104], [246], [541]) and their neighbours: all changes are correct and no new defects.
- Rejected: pt-BR/ch001.md [104] — Checked the new wording 'a partir da data comprovada do recebimento das cartas'. — It matches 'from the day in which he is found to have received the letters': the term runs from the proven day of receipt.
- Rejected: pt-BR/ch001.md [246] — Parentheses flag: '(as is right)' is rendered with commas. — No content is lost; the round 1 log already rejected this flag.
- Rejected: pt-BR/ch001.md [542] — 'Nicene Councils' (plural) is rendered as 'Concílio de Niceia' (singular). — There is only one Council of Nicaea, so the singular is the correct reading of the source's plural.
- Rejected: pt-BR/ch001.md [24] — 'this very synod' is rendered as 'desse mesmo sínodo'. — The notary is reading from the cited council's text, so 'desse' is a defensible reference to it.
