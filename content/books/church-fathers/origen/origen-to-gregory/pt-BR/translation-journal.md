# Translation Journal — Origen to Gregory (pt-BR)

Source: en-US (Crombie translation, Ante-Nicene Fathers, Vol. 4)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Origen | Orígenes | matches the pt-BR author form already established in the sibling `africanus-to-origen` translation |
| Gregory | Gregório | the addressee, Gregory Thaumaturgus; the letter never uses his epithet "Thaumaturgus," only "my son" and "Gregory," so the title alone needed the localized form |
| holy of holies | santo dos santos | standard Portuguese Bible term |
| mercy-seat | propiciatório | standard term (cf. Almeida, Figueiredo) |
| golden coffer (of the manna) | cofre dourado | deliberately *not* "arca" — "arca" is reserved here for "the ark" (the Ark of the Covenant) earlier in the same sentence; using it twice for two different objects in one list would blur the distinction the source itself keeps |
| showbread | pães da proposição | standard liturgical/biblical term |
| Ader, the Idumæan | Ader, o idumeu | kept as the source's own (Septuagint-derived) form of the name, *not* corrected to the Douay-Rheims/Vulgate form "Adad, o edomita" (confirmed against `content/books/douay-rheims-challoner/en-US/1ki011.md`) — per the corpus convention of transliterating a Father's own naming rather than harmonizing it to a different Bible edition |
| Bethel | Betel | standard Portuguese Bible form |
| Dan | Dã | standard Portuguese Bible form |
| Joshua, the son of Nun | Josué, filho de Num | standard Portuguese Bible form |
| Pharaoh | Faraó | standard Portuguese Bible form |
| brethren (of Ader) | irmãos (de Ader) | figurative — heretics, not literal kinsmen; kept literal per source's own metaphor |

## Translation Decisions

- 2026-09-04: Preserved the source's plain ordered-list numbering (`1.`, `2.`, `3.`) for the letter's three paragraphs, rather than bolding it — the source file itself uses Markdown `1. `/`2. `/`3. ` list syntax, not `**1.**`.
- 2026-09-04: No footnotes (author or editor) present in the source file — none to drop or translate.
- 2026-09-04: The two Scripture quotations ("These be your gods, O Israel...", "Knock, and it shall be opened...", "Ask, and it shall be given unto you") were translated directly from the English (matching the letter's own KJV-flavored English wording) rather than substituted with a canonical Portuguese Bible translation's wording, since Origen is paraphrasing/summarizing rather than quoting a fixed liturgical text verbatim, and the letter's argument doesn't turn on the exact wording of any one Bible edition.
- 2026-09-04: "children of Israel" rendered consistently as "filhos de Israel" throughout (not "israelitas"), matching the source's consistent phrasing.

## Review Rounds

- 2026-09-04, round 1 (adversarial bilingual clause-by-clause): clean. Verified all 9 negations, all 3 Scripture quotations, all proper names/references, and no omitted/added content against the en-US source. No defects found.
- 2026-09-04, round 2 (cold monolingual pt-BR-only proofread): **three genuine defects found and fixed**, all verified against the en-US source before fixing:
  - **"se havia... seriam feitos" → "se houvesse... seriam feitos".** Mood mismatch: the passage is a hypothetical ("if there was a third and fourth quality of gold, from it would be made the holy vessels" — en-US's own loose historical-conditional), which in Portuguese pairs an imperfect-subjunctive protasis (*se houvesse*) with the conditional apodosis, not an indicative "se havia".
  - **"ganharam com essa morada que não lhes faltasse..." → "ganharam disso o seguinte: que não lhes faltava...".** Broken verb valency — *ganhar* doesn't take a bare "que" clause; the en-US has "they gained **this** from their dwelling there, **that** they had no lack..." (object + appositive clause), which the first draft had dropped the object of. Also fixed the mood: "that they had no lack" is a factual appositive, not a hypothetical, so indicative *faltava* replaces the wrongly-subjunctive *faltasse*.
  - **"a irmã de sua mulher" → "a irmã da mulher deste".** Pronoun ambiguity: en-US "was made a kinsman of Pharaoh by marrying **his** wife's sister" is itself ambiguous on "his," but the correct referent (per 1 Kings 11:19-20 Douay-Rheims: Pharaoh gave Adad "the own sister of his wife, Taphnes the queen") is Pharaoh, not Ader. Portuguese "sua" defaults to the grammatically nearest antecedent (the subject, Ader), producing an incoherent reading (Ader marrying his own already-established wife's sister) that the English's real-world-resolved ambiguity doesn't have. "Deste" unambiguously points back to the immediately preceding "Faraó."
  - One finding rejected as a faithful mirror of the source: "trabalho costurado e bordado, ... costurado com a sabedoria de Deus" repeats *costurado*, matching the en-US's own "needed **sewed** and embroidered work, **sewed** with the wisdom of God" — not a translation defect.
- 2026-09-04, round 3 (adversarial bilingual, independently re-deriving the round-2 fixes without reading this journal + fresh full clause-by-clause pass): all three round-2 fixes independently re-derived and confirmed CORRECT. **One more genuine omission found and fixed**: "Saudação em Deus, excelentíssimo senhor..." → "Saudação em Deus, **meu** excelentíssimo senhor...". The en-US salutation is "Greeting in God, **my** most excellent sir, and venerable son Gregory" — the possessive (part of the formal epistolary address, applying to both "sir" and "son") had been dropped with no compensation. No other new defects found in the rest of the chapter; all proper names, negations, and Scripture quotations re-verified clean.
