# Translation Journal — Africanus to Origen (pt-BR)

Source: en-US (Crombie translation, Ante-Nicene Fathers, Vol. 4)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Africanus | Africano | Julius Africanus, referred to by his cognomen as in the source |
| Origen | Orígenes | standard Portuguese form |
| Susanna | Susana | book/figure from the deuterocanonical addition to Daniel |
| Agnomon | Agnômon | interlocutor's name, transliterated as in source |
| holm-tree | azinheira | the tree species behind the Greek pun (πρῖνος) |
| saw asunder | serrar ao meio | the Greek pun (πρίσαι) — kept close to source's literal rendering |
| mastich-tree | lentisco | the tree species behind the Greek pun (σχῖνος) |
| rend asunder | rasgado / rasgar (ao meio) | the Greek pun (σχίσαι) — realized as "rasgado ao meio" in the narrative and as bare "rasgar" in the sound-alike list, mirroring the source's own bare "rend" there |
| Chaldæans | caldeus | modernized spelling, standard Portuguese |
| Joakim | Joaquim | king's name, Portuguese form |
| partner of his throne | parceiro de seu trono | **masculine** — the one enthroned is Joakim, not his wife (see round 4) |
| the Daniel received among the Jews | o Daniel recebido entre os judeus | referring to the Hebrew canon of Daniel |

## Translation Decisions

- 2026-09-04: Kept the transliterated Greek words (*prinos*, *prisein*, *schinos*, *schisthenai*) in italics exactly as in the source, since Africanus's argument turns on the Greek sound-alikes — translating them away would break the point being made.
- 2026-09-04: The paragraph break and inline "2." numbering from the source are preserved as-is (single continuous letter with one numbered division).
- 2026-09-04: No editor footnotes present in this source file — none to drop.

## Review Rounds

- 2026-09-04, round 1 (bilingual + monolingual): Bilingual pass clean. Monolingual pass flagged "nunca por inspiração profética" as a logical contradiction with the preceding list ("por visões, por sonhos e pela aparição de um anjo"). Verified against the en-US source — the identical apparent contradiction is present verbatim in the canonical English ("by visions, and dreams, and an angel appearing to him, never by prophetic inspiration"). Not a translation defect; the source itself draws this contrast (mediated forms of revelation vs. the sudden ecstatic seizure described a sentence earlier — "the prophet is seized by the Spirit, and cries out"). No change made.
- 2026-09-04, round 2 (bilingual + monolingual): Both passes clean, no regressions. Bilingual pass independently re-verified names/references, the gambling idiom ("perdidos e ganhos no jogo"), "parceira de seu trono", and the biblical quotation's polarity — all correct. One non-defect stylistic note raised ("Ora" vs "Mas" as the connector before "todos os livros do Antigo Testamento..."); left as-is since "Ora" is a legitimate formal-register connector and doesn't change the sense.
- 2026-09-04, round 3 (bilingual + monolingual): Both passes clean, no new defects, no regressions. Two consecutive clean rounds (2, 3) — closing the review.
- 2026-09-04, round 4 (post-merge; bilingual + cold monolingual + structural/metadata): Structural pass clean. **Three defects found and fixed — two of which rounds 1–3 had seen and explicitly cleared:**
  - **"parceira de seu trono" → "parceiro de seu trono".** Portuguese must commit to a gender where the English "whom the king of the Babylonians had made partner of his throne" is ambiguous, and the feminine made the *wife* the one elevated to the Babylonian king's throne. The referent is Joakim: the Greek relative is masculine accusative (ὅν), the allusion is to Jehoiachin/Joakim's elevation in 2 Kings 25:27–30 / Jer. 52:31–34, and Africanus's very next sentence ("if it was not this Joakim, but some other from the common people, whence had a captive such a mansion and spacious garden?") only works as an argument if Joakim is the one enthroned. Round 2 had inspected this exact phrase and pronounced it "correct".
  - **"Ora, todos os livros do Antigo Testamento" → "Mas todos os livros...".** Round 2 raised this and dismissed it as a stylistic preference. It is not: this "But" is the hinge of the argument (the pun works in Greek but not Hebrew — *but* the whole Old Testament was translated *from* Hebrew *into* Greek, therefore the passage cannot be a rendering of a Hebrew original). Rendering it "Ora" flattens a load-bearing contrast into a topic shift, and duplicated the "Ora" already opening the preceding sentence. The English repeats "but ... But" here; the Portuguese now mirrors it.
  - **"citado a outrem" → "citado outrem".** *Citar* takes a bare direct object in Portuguese; the personal "a" is a Hispanicism that also invites a dative reading ("quoted *to* another"), inverting the sense of the source's "quoted from another word for word".
- Two findings raised in round 4 and rejected as faithful mirrors of the archaic English, not defects: the plural "onde a haviam visto" against the distributive "a cada um" (en-US: "asked them severally where **they saw** her"), and "que se conta de sua juventude" as an unidiomatic predicate (en-US: "which **is related of** his youth").
- 2026-09-04, round 5 (bilingual, adversarially primed to distrust the round-4 fixes + cold monolingual): clean. The bilingual pass re-derived all three corrections from the English and from Portuguese grammar independently and confirmed each; no regressions, no new defects. The monolingual pass raised four items, all verified as verbatim mirrors of the English and rejected: "nunca por inspiração profética" (already settled in round 1), the unintroduced plural in "ele os desmascara" (en-US: "he detects **them**", equally unintroduced), the cataphoric "seu" in "as outras duas ao seu final" (en-US: "the other two at **the end of it**"), and the paragraph numbered "2." with no preceding "1." (identical in the en-US source).
- 2026-09-04, round 6 (cold monolingual copy-edit proofread + adversarial bilingual with a journal/book.json audit): chapter text clean in both passes — no misspellings, diacritic errors, agreement errors, invalid constructions, dropped/doubled words, unbalanced punctuation, or markdown defects; `book.json` language-key coverage complete. The adversarial pass re-derived all three round-4 corrections a second time, independently, and confirmed each. It found one defect **in this journal rather than in the translation**: the Key Terms row for "rend asunder" claimed a verbatim "rasgar ao meio" that occurs nowhere in the chapter (the text has "rasgado ao meio" in the narrative and bare "rasgar" in the sound-alike list — itself a faithful mirror of the source's bare "rend" in that same list). Row corrected. Two consecutive clean rounds for the text (5, 6) — closing the review.
- **Second process note: audit the journal against the text, not just the text against the source.** The false Key Terms row survived every round of PR #398 and round 4 here, because each round checked the translation and treated the journal as a record of it. A journal row that misstates what the text says is a trap for the *next* translator, who will reuse it as an established term choice — so verifying each row's claim actually appears in the chapter belongs in every review round, and a row describing an inflected or context-varying realization should say so rather than assert one canonical string.
- **Process note for the next reviewer of this file:** rounds 1–3 closed this translation as clean on the "two consecutive clean rounds" rule, and rounds 2 specifically examined *two of the three* defects round 4 later fixed and cleared them both. Consecutive clean rounds are evidence, not proof — a reviewer who inspects a phrase and calls it correct has not thereby made it correct. The two misses share a shape worth naming: both are places where the **English is ambiguous or merely idiomatic and the Portuguese has to commit** — a gender the English leaves open, a connector whose force the English carries in a word Portuguese splits into two. Those are exactly the spots where "checked, matches the source" is too weak a test, because more than one Portuguese rendering matches the source's *words* while only one matches its *sense*.
