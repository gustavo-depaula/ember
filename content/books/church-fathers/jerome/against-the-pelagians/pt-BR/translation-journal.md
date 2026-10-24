
## Termos

| Tully | Túlio | Conforme o diário dos *Prefácios* de São Jerônimo; designa Cícero |
| Antony | Antônio | Aqui, o orador romano |
| Cyprian / Augustine / Origen | Cipriano / Agostinho / Orígenes | Conforme as obras irmãs de São Jerônimo |
| Fidus / Marcellinus / Heraclian / Hilary | Fido / Marcelino / Heracliano / Hilário | |
| remission of sins | remissão dos pecados | |
| infant baptism | batismo das crianças | |

## Decisões

- Traduzidos os parágrafos 52–64 de `ch003.md`, concluindo o Livro III; preservados os 13 parágrafos e as seções 17–19.
- Mantida a referência João 3:3 tal como consta na fonte, sem ajustá-la à redação da citação.
- Preservada a imagem de obras “na bigorna”, isto é, ainda em elaboração, e a imagem proverbial de levar lenha para uma floresta.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 18 minor. Full read of Books I–III against en-US: complete and faithful. Fixed 16 verse numbers wrongly bolded as section numbers, one inconsistent spelling of Habakkuk, and one missing article.
- `pt-BR/ch001.md` [102]: “**17.** Quem se vangloriará” → “17. Quem se vangloriará” — a verse number in the Proverbs reference list, not a section number (Book I sections here run 33–41); bolding presents it as a section heading
- `pt-BR/ch001.md` [95]: “Habacuque 3:1.” → “Habacuc 3:1.” — ch002 [191] uses the Catholic form Habacuc; the book name should be spelled one way
- `pt-BR/ch002.md` [4]: “Em Salmo 32:5.” → “No Salmo 32:5.” — 'Salmo' takes the article in Portuguese
- `pt-BR/ch002.md` [31]: “**14.**” → “14.” — Eccl 8:14, a verse number, not a section number (it comes before section 6)
- `pt-BR/ch002.md` [32]: “**17.**” → “17.” — Eccl 8:17, a verse number, not a section number
- `pt-BR/ch002.md` [54]: “**7.**” → “7.” — 1 Cor 4:7, a verse number; it sits between sections 8 and 9
- `pt-BR/ch002.md` [55]: “**19.**” → “19.” — 1 Cor 4:19, a verse number, not a section number
- `pt-BR/ch002.md` [62]: “**24.**” → “24.” — Gal 3:24, a verse number, not a section number
- `pt-BR/ch002.md` [72]: “**37.**” → “37.” — Matt 5:37, a verse number, not a section number
- `pt-BR/ch002.md` [117]: “**27.**” → “27.” — Luke 18:27, a verse number, not a section number
- `pt-BR/ch002.md` [121]: “**46.**” → “46.” — Luke 22:46, a verse number, not a section number
- `pt-BR/ch002.md` [125]: “**19.**” → “19.” — John 7:19, a verse number; it sits between sections 17 and 18
- `pt-BR/ch002.md` [136]: “**8.**” → “8.” — James 3:8, a verse number, not a section number
- `pt-BR/ch002.md` [145]: “**39.**” → “39.” — Ps 37:39, a verse number, not a section number
- `pt-BR/ch002.md` [152]: “**10.**” → “10.” — Ps 77:10, a verse number, not a section number
- `pt-BR/ch002.md` [171]: “**14.**” → “14.” — 2 Kings 18:14, a verse number, not a section number
- `pt-BR/ch002.md` [231]: “**20.**” → “20.” — Dan 9:20, a verse number continuing the sentence of [230]; bolding breaks the sentence
- `pt-BR/ch002.md` [232]: “**24.**” → “24.” — Dan 9:24, a verse number, not a section number
- Rejected: pt-BR/ch001.md [66] — garbled Greek and reference run kept as is — the corruption is in the source; it is kept verbatim and the translator's note states this accurately
- Rejected: audit: Scripture references differ — references added in pt-BR — bare chapter numbers in the source are written as chapter:verse; book and numbers are unchanged
- Rejected: audit: parentheses differ (ch001 [7], [12]; ch003 [4], [28]) — parentheses added or replaced by dashes — punctuation choice only; no content lost
- Rejected: audit: emphasis markers differ — extra bold and italics — bold section numbers and italic Greek follow house format; the only defects are the verse numbers fixed above
- Rejected: pt-BR/ch003.md [18] — 'depois, leva a coroa' reads the source's last clause as an imperative — the English clause is ambiguous and the ironic imperative is a defensible reading
- Rejected: pt-BR/ch002.md [29] — 'Eclesiástico 1:18' for a verse from Ecclesiastes — the source has 'Ecclus.'; the source edition is not corrected

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Lidos integralmente os 400 parágrafos dos Livros I–III, as quatro notas, book.json, diário e alertas mecânicos: uma correção menor de regência; nenhum defeito de sentido.
- `pt-BR/ch003.md` [28]: “pela qual não trabalhaste nem fizeste crescer” → “pela qual não trabalhaste e que não fizeste crescer” — As regências são diferentes: trabalhar pela planta, mas fazer a planta crescer. O segundo verbo precisa do relativo como objeto direto, correspondente a 'it' na fonte.
- Rejected: pt-BR/ch002.md [17] — ‘não são fáceis, como diz Pelágio’ poderia atribuir a Pelágio a afirmação de que os mandamentos são difíceis. — ‘Como diz Pelágio’ também pode retomar ‘fáceis’, leitura sustentada pelo contexto explícito. A formulação admite o sentido da fonte.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch003 [27]–[29]: the regency fix in the Jonah 4:10 quotation is correct and fits its sentence; no defects found.
- Rejected: pt-BR/ch003.md [28] — Romans 2:5 'in the day of wrath' rendered 'para o dia da ira' — The English 'in the day' here means 'against the day', as the Douay has it. 'para o dia' gives that sense; nothing is lost.
- Rejected: pt-BR/ch003.md [28] — 'Pelo mesmo raciocínio' used twice, for 'Upon the same showing' and 'You may as well' — Both render the same argumentative move. This is a style choice, not a defect.
