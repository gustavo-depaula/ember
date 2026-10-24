
## Termos

| en-US | pt-BR | Observação |
|---|---|---|
| Diodorus / Dionysius | Diodoro / Dionísio | Autores citados no capítulo 13, §8. |
| Orpheus / Hadrian | Orfeu / Adriano | |
| impassible Essence | Essência impassível | “Impassível” designa a impossibilidade de sofrer. |
| bloodless and reasonable sacrifices | sacrifícios incruentos e racionais | Mantido “racionais” também na formulação “spiritual and rational sacrifices”. |
| first-fruit | primícia | |
| Lord's day | dia do Senhor | |

## Decisões

- Preservada a correspondência dos 229 parágrafos do arquivo, incluindo o título, o subtítulo, o prólogo e os dezoito títulos de capítulo, além das cinco notas do tradutor; mantidos sem numeração, como na fonte, os parágrafos não numerados dos capítulos 8, 11 e 17.
- No capítulo 13, §8, “decimated themselves” foi explicitado como “sacrificarem um décimo de sua própria população”, preservando o sentido quantitativo.
- Mantido “tu” nas interpelações ao interlocutor nos capítulos 16, §8, e 17, §7, e a Constantino no capítulo 18; empregado “vós” na interpelação aos filósofos no capítulo 17, §13, e nas falas dirigidas a destinatários plurais.
- Preservadas as formulações bíblicas próprias da edição, inclusive “cada um se extraviou dessa maneira”, no capítulo 15, §12, “em meu nome”, no capítulo 16, §8, e “sobre uma rocha”, no capítulo 17, §8, sem harmonização com outras traduções.
- Nota do tradutor [^5], após o capítulo 17, §4: esclarece que a explicação da denominação dos edifícios se apoia em “casas do Senhor”, vínculo verbal que a palavra portuguesa “igreja” não reproduz.
- No capítulo 18, §1, preservados os colchetes editoriais de “[gracious]” em “[benevolente]”.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of 229 paragraphs and 5 translator's notes: translation faithful and complete; fixed a false paragraph count and a headerless Key Terms table in the journal.
- `pt-BR/translation-journal.md`: “Preservada a correspondência dos 67 parágrafos fornecidos nesta chamada, incluindo os cinco títulos de capítulo, além da definição da nota do tradutor; mantido sem numeração o parágrafo final do capítulo 17.” → “Preservada a correspondência dos 229 parágrafos do arquivo, incluindo o título, o subtítulo, o prólogo e os dezoito títulos de capítulo, além das cinco notas do tradutor; mantidos sem numeração, como na fonte, os parágrafos não numerados dos capítulos 8, 11 e 17.” — The file has 229 paragraphs, 20 headings and 5 translator's notes, not 67 paragraphs and 5 headings; unnumbered paragraphs also occur in chapters 8 and 11.
- `pt-BR/translation-journal.md`: “| Diodorus / Dionysius | Diodoro / Dionísio | Autores citados no capítulo 13, §8. |” → “| en-US | pt-BR | Observação |
|---|---|---|
| Diodorus / Dionysius | Diodoro / Dionísio | Autores citados no capítulo 13, §8. |” — The Key Terms table has no header row, so Markdown does not render it as a table.
- Rejected: pt-BR/ch001.md [217] — Source parenthesis rendered with em dashes (audit: parentheses differ) — The parenthetical content is complete. Em dashes are a defensible punctuation choice.
- Rejected: pt-BR/ch001.md [125] — “Mateus 11:12” for “os que estão sãos não precisam de médico” (actually Mt 9:12) — The source gives Matthew 11:12. The translation keeps the source reference, and the source is not corrected.
- Rejected: pt-BR/ch001.md (all numbered paragraphs) — Audit: emphasis markers differ (bold paragraph numbers) — House format is `**n.**` bold paragraph numbers.
- Rejected: pt-BR/ch001.md [5] — “a escolha deste último” may point to human rather than divine knowledge — It mirrors the source's own “the choice of the latter”.

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 229 parágrafos, das cinco notas, do book.json e do diário, com conferência dos alertas mecânicos: dois defeitos de sentido.
- `pt-BR/ch001.md` [29]: “nem está escrita ou gravada em tábuas, sujeita, portanto, aos estragos do tempo” → “nem é uma lei escrita ou gravada em tábuas e, portanto, sujeita aos estragos do tempo” — A fonte nega que a Lei seja escrita em tábuas e, por isso, sujeita ao tempo. O aposto afirmativo da tradução atribui essa sujeição à própria Lei divina. *(meaning)*
- `pt-BR/ch001.md` [40]: “ele é verdadeira e unicamente filósofo” → “ele é verdadeiramente o único filósofo” — No contexto, 'he truly and only is a philosopher' afirma que somente ele é verdadeiramente filósofo; a tradução afirma que ele é exclusivamente filósofo. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [28]–[30] and [39]–[41]: both previous fixes are correct and fit their sentences; no defects in the paragraphs shown.
- Rejected: pt-BR/ch001.md [29] — “Lei … nem é uma lei escrita” repeats the noun, in different case — The lower-case “lei” is generic (“a written law”). The repetition makes it clear that the negation covers both “escrita ou gravada” and “sujeita aos estragos do tempo”, which is what the source says. Sense and grammar are correct.
- Rejected: pt-BR/ch001.md [40] — “verdadeiramente o único filósofo” for “truly and only is a philosopher” — The rendering matches the source's claim that he alone is truly a philosopher. It is consistent with the “alone” claims around it (“o único digno”, “o único livre”) and the sentence's concord is intact.
