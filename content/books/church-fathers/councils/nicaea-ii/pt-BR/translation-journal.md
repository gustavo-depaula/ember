
## Termos

| double monastery / canoness | mosteiro duplo / canonisa | Conservados os termos institucionais da fonte. |
| Tarasius / Constantine / Irene | Tarásio / Constantino / Irene | |
| Apollinarius (Appolinarius) / Nestorius / Eutyches / Dioscorus | Apolinário / Nestório / Eutiques / Dióscoro | |
| Gregory Theologus | Gregório, o Teólogo | |
| reverence / veneration / worship in spirit | reverência / veneração / adoração em espírito | Preservada a distinção exposta na carta sinodal. |
| latria | *latria* | Conservado o termo da fonte para o culto devido somente a Deus. |

## Decisões

- Chamada 3: traduzidos os parágrafos 228–254, conservando as 27 unidades da fonte; a nota do tradutor 5 constitui uma unidade adicional.
- Nota do tradutor 5, após o parágrafo 246: explica a alusão à paz contida no nome grego de Irene.
- Conservadas as diferenças entre os cânones e seus Epítomes Antigos, inclusive a restrição à hospitalidade no Epítome do cânon 21.
- No parágrafo 248, conservada a referência “1 Reis 20:41” tal como numerada na fonte, sem convertê-la para “1 Samuel 20:41”.
- Todos os termos gregos da carta foram conservados em itálico, com sua grafia original, inclusive na explicação etimológica e nas distinções entre reverência e adoração.
- Na carta, conservado “vós” ao dirigir-se aos soberanos e a Deus; a exortação citada a honrar Belém e a apóstrofe final à nova Sião mantêm o singular “tu”.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 4 minor. Read all 254 paragraphs, the footnotes, book.json and the journal. The text is faithful and complete; the only fixes are two inconsistent "Tom." abbreviations and the Eutyches spelling in [247] and the Key Terms row.
- `pt-BR/ch001.md` [140]: “*Tomo VII, col. 552*” → “*t. VII, col. 552*” — The source has "Tom. VII."; the rest of the file renders it "t. VII".
- `pt-BR/ch001.md` [242]: “*Concilia*, tomo VII, col. 577.” → “*Concilia*, t. VII, col. 577.” — The source has "Tom. VII."; the rest of the file renders it "t. VII".
- `pt-BR/ch001.md` [247]: “concebida por Êutiques e Dióscoro” → “concebida por Eutiques e Dióscoro” — Paragraphs [34], [108], [109] and [145] spell the name "Eutiques". This is the only place with "Êutiques".
- `pt-BR/translation-journal.md`: “| Apolinário / Nestório / Êutiques / Dióscoro |” → “| Apolinário / Nestório / Eutiques / Dióscoro |” — The text uses "Eutiques" in five places. After the fix to [247], "Êutiques" does not occur.
- Rejected: pt-BR/ch001.md [117]–[135] — The anathema numbers "(1)"–"(19)" are bold in the translation but not in the source (audit flag). — The bolding is applied consistently across the series and does not change the content or the sense.
- Rejected: pt-BR/ch001.md [16], [109], [143], [171] — Parentheses differ from the source (audit flag). — Each parenthetical, such as "(said he)" or "(like the Monophysites)", is still there, only set off with commas instead. No content is lost.
- Rejected: pt-BR/ch001.md [248] — "1 Reis 20:41" points modern Brazilian readers to a different verse; the passage is 1 Samuel 20:41. — The source uses the LXX/Vulgate naming, which matches "histórias dos Reis" in the text. The journal decided to keep it, and there is no new argument against that decision.
- Rejected: pt-BR/ch001.md [5], [24], [25] et al. — Italics were added around retained Latin and Greek (audit flag). — This follows the journal's convention of italicizing retained Latin and Greek.
- Rejected: pt-BR/ch001.md [16] — "with unsparing hand" is rendered "sem poupar esforços". — The rendering is defensible, and the reader is not misinformed about the injunction to cut away innovations.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 7 minor. Lidos os 254 parágrafos integralmente, as cinco notas, book.json, o diário e os apontamentos da auditoria: um defeito de sentido e sete de formatação.
- `pt-BR/ch001.md` [3]: “Concilia” → “*Concilia*” — O título latino conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [7]: “venerável jussio” → “venerável *jussio*” — O termo latino conservado deve estar em itálico.
- `pt-BR/ch001.md` [10]: “Concilia” → “*Concilia*” — O título latino conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md` [43]: “o restabelecimento das enfermidades” → “a cura das enfermidades” — A fonte diz “the curing of sicknesses”: curam-se as enfermidades, não se restabelecem. *(meaning)*
- `pt-BR/ch001.md` [66]: “por sua honrosa jussio” → “por sua honrosa *jussio*” — O termo latino conservado deve estar em itálico.
- `pt-BR/ch001.md` [66]: “com a piedosa jussio” → “com a piedosa *jussio*” — O termo latino conservado deve estar em itálico.
- `pt-BR/ch001.md` [140]: “Concilia” → “*Concilia*” — O título latino conservado deve estar em itálico, conforme a regra de formatação.
- `pt-BR/ch001.md`: “Sacra e jussio designam” → “Sacra e *jussio* designam” — Na nota 1, o termo latino conservado também deve estar em itálico.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch001 [2]–[11], [42]–[44], [65]–[67] and [139]–[141], plus note 1: all 8 changes are correct; the fix in [43] repeated "a cura", and one minor fix corrects it.
- `pt-BR/ch001.md` [43]: “receberam graça para a cura de doenças, a cura das enfermidades e a expulsão de demônios” → “receberam graça para curar doenças, sarar enfermidades e expulsar demônios” — The source has "healing of diseases and the curing of sicknesses". The round 2 fix left "a cura" twice in a row. Two distinct verbs keep the sense without the repetition.
- Rejected: pt-BR/ch001.md [140] — Period and lowercase "t." after "*Concilia*" — The source has "Concilia. *Tom." with the same period, so the translation follows it.
- Rejected: pt-BR/ch001.md nota 1 — "Sacra" is not in italics, while "*jussio*" now is — The headings in [2] and [8] use "Sacra" as a document name without italics, and the note follows them. The note's facts (imperial documents, a 15-year indiction cycle, the seventh year) are correct.
- Rejected: pt-BR/ch001.md [66] — "slave" rendered as "servo" — This is a formula of humility, and "servo" is a defensible rendering that does not change the sense.

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente os parágrafos [42]–[44], a alteração em [43], as cinco notas, book.json, o diário e a auditoria aplicável ao trecho. A alteração preserva o sentido e a gramática; nenhum defeito objetivo encontrado.
