
## Termos

| natural (or animate) body / spiritual body | corpo natural (ou animado) / corpo espiritual | Preservada a alternância entre “natural” e “animado”, fundamental ao argumento do capítulo 53. |
| Marcion / Valentinus / Valentinians | Marcião / Valentino / valentinianos | Conforme *Prescrição contra os hereges* e *Contra Práxeas*; adotado “Valentino” diante da variante “Valentim” em outras obras irmãs. |
| Paraclete / Holy Ghost | Paráclito / Espírito Santo | Conforme *Contra Práxeas* e *Sobre a monogamia*. |
| dispensation | dispensação | Conforme *Sobre a monogamia* e *Contra Práxeas*. |
| impassible | impassível | Incapaz de sofrer; relacionado a “impassibilidade” em *Contra Práxeas*. |
| incorruption / immortality | incorrupção / imortalidade | Distinção explícita entre restauração do corpo e superação da morte. |

## Decisões

- Traduzidos os parágrafos 106–129, mantendo as 24 unidades da fonte, além da definição da nota do tradutor; concluída a obra.
- Preservadas as formulações incomuns da fonte: a negação da identidade do grão quanto à espécie no capítulo 52; a comparação entre Marcião e Valentino no capítulo 56; “repeating of death”, literalmente “repetição da morte”, no capítulo 57; e a referência Êxodo 24:8 no capítulo 61.
- Na citação de 1 Coríntios 15:53 do capítulo 60, preservado “immorality” como “imoralidade”, sem harmonização silenciosa. Acrescentada a nota do tradutor [^6] para indicar o aparente lapso por “immortality”, usado nas demais citações da passagem.
- “Concubinage”, nos capítulos 60–61, traduzido por “união sexual”, pois designa a função reprodutiva em geral, sem restringi-la a uma união extramatrimonial.
- Mantido o interlocutor singular em “tu”, inclusive na apóstrofe final à alma; preservado “vosso” na citação plural de 1 Coríntios 3:22.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 11 minor. Full read of ch001 [1]–[129], footnotes, journal and book.json: content complete; fixed Key Terms drift (incorruptibilidade → incorrupção, 8 places) and three small grammar/sense slips.
- `pt-BR/ch001.md` [74]: “ao revestir-se da veste da incorruptibilidade” → “ao revestir-se da veste da incorrupção” — Key Terms: incorruption → incorrupção; align with the rest of the file
- `pt-BR/ch001.md` [86]: “este corruptível se revista de incorruptibilidade” → “este corruptível se revista de incorrupção” — Key Terms: incorruption → incorrupção; same verse (1 Cor 15:53) is rendered 'incorrupção' in [117] and [123]
- `pt-BR/ch001.md` [86]: “estando despidos, não sejamos encontrados nus” → “estando despidos, não seremos encontrados nus” — 'se é que' takes the indicative; matches the same verse in [84]
- `pt-BR/ch001.md` [102]: “deve revestir-se de incorruptibilidade, e este mortal (isto é, o sangue)” → “deve revestir-se de incorrupção, e este mortal (isto é, o sangue)” — Key Terms: incorruption → incorrupção
- `pt-BR/ch001.md` [104]: ““herdará a incorruptibilidade”” → ““herdará a incorrupção”” — Key Terms: incorruption → incorrupção
- `pt-BR/ch001.md` [104]: “de toda herança da incorruptibilidade” → “de toda herança da incorrupção” — Key Terms: incorruption → incorrupção
- `pt-BR/ch001.md` [104]: “a corrupção não herdará a incorruptibilidade; em outras palavras” → “a corrupção não herdará a incorrupção; em outras palavras” — Key Terms: incorruption → incorrupção
- `pt-BR/ch001.md` [104]: ““Pois este corruptível deve revestir-se de incorruptibilidade,” → ““Pois este corruptível deve revestir-se de incorrupção,” — Key Terms: incorruption → incorrupção; same verse as [117]
- `pt-BR/ch001.md` [104]: “suscetível de incorruptibilidade e imortalidade” → “suscetível de incorrupção e imortalidade” — Key Terms: incorruption → incorrupção
- `pt-BR/ch001.md` [96]: “Para quê? Para a carne?” → “Para o quê? Para a carne?” — source 'To what?' (dead to what); 'Para quê?' reads as 'for what purpose'
- `pt-BR/ch001.md` [125]: “já não estamos desacostumados a refrear” → “não estamos desacostumados a refrear” — source 'we are not unaccustomed'; 'já não' adds 'no longer'
- Rejected: pt-BR/ch001.md [98] — audit: emphasis markers 24 vs 22 — source splits one word as '*resur* *rection*' (OCR break); PT italicizes 'ressurreição' once; no emphasis lost
- Rejected: pt-BR/ch001.md [14], [22], [42] — 'Permiti-me'/'permitam-me' (plural) beside 'tu' address — a hortative addressed to the readers in general, not to the singular interlocutor; defensible
- Rejected: pt-BR/ch001.md [16], [52], [125] — odd references (Gênesis 3:31, 2 Coríntios 6:7, Apocalipse xvi, Êxodo 24:8) — copied from the source as printed; the source is not corrected

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 129 parágrafos, das seis notas, do diário e de book.json: uma correção menor de regência; nenhum defeito de sentido identificado.
- `pt-BR/ch001.md` [54]: “não apenas usam, mas até abusam” → “não apenas usam, mas dos quais até abusam” — A fonte distingue usar os dons de abusar deles; nesse sentido, «abusar» exige a preposição «de».
- Rejected: pt-BR/ch001.md [98] — Diferença na contagem dos marcadores de ênfase. — Confirmada a conclusão anterior: a fonte divide «resurrection» entre dois segmentos em itálico; a tradução mantém a palavra inteira em itálico, sem perda de ênfase.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [53]–[55] and of the footnotes: the regency fix in [54] is right, and no new defect was found.
- Rejected: pt-BR/ch001.md [54] — Verified the change 'não apenas usam, mas dos quais até abusam' — Correct: 'usar' is transitive and 'abusar' takes 'de'; the antecedent 'dons' and the concord hold, and the rest of the sentence is intact
- Rejected: pt-BR/ch001.md [54] — Comma before the parenthesis in 'Contarás, (suponho), cebolas' — It follows the source punctuation 'reckon, (I suppose)'; the comma does not change the sense and is not an objective defect
