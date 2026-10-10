# Translation Journal — Nicaea I (325) (pt-BR)

Source: en-US (Henry Percival translation, NPNF Second Series Vol. 14, via New Advent)
Target: pt-BR

## Key Terms

Conventions carried over from `athanasius/*/pt-BR` and `ambrose/repentance/pt-BR`: curly double quotes, Creed wording as in `athanasius/statement-of-faith` (`very God of very God` → **verdadeiro Deus de verdadeiro Deus**, `the quick and the dead` → **os vivos e os mortos**, `Only-begotten` → **Unigênito**).

| English | Portuguese | Notes |
|---------|-----------|-------|
| Nice / Nicea / Nicaea | Niceia | current orthography (no accent) |
| Councils (author) | Concílios | book.json `author` |
| Synod / synod | Sínodo / sínodo | capitalization mirrors the source |
| Ecthesis | Ectese | |
| of one substance (ὁμοούσιον) | consubstancial | Greek and Latin glosses kept |
| begotten | gerado | |
| Holy Ghost | Espírito Santo | |
| anathematize | anatematizar | |
| canon / Canon | cânon / Cânon | capitalization mirrors the source |
| presbyter / presbyterate | presbítero / presbiterado | not "sacerdote" — the canons distinguish orders |
| Metropolitan / Metropolis | Metropolita / Metrópole | |
| Chorepiscopus | corepíscopo | |
| spiritual laver | lavacro espiritual | |
| novice (1 Tim 3:6) | neófito | |
| *subintroducta* | *subintroducta* | Latin kept in italics, as in source |
| hearers / prostrators | ouvintes / prostrados | penitential grades |
| communicate in prayers | estar em comunhão nas orações | |
| oblation | oblação | |
| lapsed / fallen | os que caíram | |
| Cathari | cátaros | |
| Paulianists | paulianistas | |
| deaconesses | diaconisas | |
| Viaticum | Viático | |
| Lord's Day | Dia do Senhor | |
| Ælia | Élia | |
| Licinius / Constantine / Arius / Meletius / Alexander | Licínio / Constantino / Ário / Melécio / Alexandre | |
| Theonas of Marmorica / Secundes of Ptolemais | Teonas de Marmárica / Secundo de Ptolemaida | |
| Pentapolis / Libya (Lybia) | Pentápole / Líbia | |
| Easter | Páscoa | |

## Translation Decisions

- 2026-10-10: Single chapter; no footnotes in the source, so none dropped or added.
- 2026-10-10: Bracketed editorial insertions ([from heaven], [of penance], …) and the bracketed gloss in Canon 7 are kept, translated, since they are part of the NPNF text as imported.
- 2026-10-10: Scripture quotations without references in the source (1 Timothy 3:6 in Canon 2, Psalm 15:5 in Canon 17) translated from Percival's wording; no references added.
- 2026-10-10: Creed: "the Catholic and Apostolic Church anathematizes them" keeps the source's resumptive pronoun ("a todos os que assim dizem, a Igreja … os anatematiza").
- 2026-10-10: "Lybia" in the Synodal Letter is the edition's spelling; rendered with the standard "Líbia". "Secundes" rendered with the standard Portuguese form "Secundo" (Secundus).
- 2026-10-10: Stray space before the period in "in the Lord ." not reproduced.

## Source Edits

- en-US Synodal Letter: "assembled at Niece" → "assembled at Nice" (OCR slip; the edition reads "Nice" elsewhere in the same text).

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (30 source paragraphs aligned 1:1), plus the mechanical audit. Verdict: clean, no changes.

Rejected findings:
- Canon 8, "a time [of restoration] fixed" → "um tempo [de reconciliação] fixado": in the penitential context "restoration" means readmission to communion, which is what "reconciliação" names. Not a mistranslation.
- Canon 8, "Or, if this should not be satisfactory" → "se isso não lhe agradar": the added "lhe" makes the bishop the one dissatisfied. That is the plain reading of the source, where the bishop is the one who then acts.
- Canon 8, a `;` added before "de modo que": punctuation only. No content is merged or split.
- Creed, *consubstantialem* italicized where the source has it in roman: the skill puts inline Latin in italics. This is a format convention, not a defect.
- Synodal Letter, "he has even destroyed Theonas" → "chegou a perder também Teonas": "chegou a" renders "even", and "também" anticipates the next clause, "they also". The meaning is unchanged.

Evidence: `ember-translation-evidence/church-fathers__councils__nicaea-i/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read, plus the mechanical audit. Verdict: 1 defect, fixed.

Fixed:
- Synodal Letter ¶2, "through the grace of Christ and our most religious Sovereign Constantine, who brought us together": "pela graça de Cristo e de nosso religiosíssimo Soberano Constantino" → "… e por nosso religiosíssimo Soberano Constantino". "e de" made Constantine a co-possessor of the grace. The relative clause makes him the agent who convened the synod, and the Greek genitive absolute (καὶ τοῦ βασιλέως Κωνσταντίνου συναγαγόντος ἡμᾶς) confirms that reading.

Rejected findings:
- Canon 10, "through the ignorance, or even with the previous knowledge of the ordainers" → "por ignorância, ou mesmo com o conhecimento prévio dos ordenantes": "dos ordenantes" governs both nouns, as in the source.
- Canon 6, "it being reasonable" → "sendo este razoável": this commits "it" to the common suffrage, the reading the Greek requires (κοινῆς ψήφου εὐλόγου οὔσης).
- Synodal Letter ¶4, "the bishops …, who are serving under … Alexander" → restrictive "que servem sob": the Greek τῶν ὑπὸ Ἀλέξανδρον is attributive, so the restrictive reading is not wrong.
- Synodal Letter ¶4, "the law and ordinance of the Church" → "a lei e a ordem": "ordem" covers "ordinance". This is a style choice.

Evidence: `ember-translation-evidence/church-fathers__councils__nicaea-i/review-2.md`.

### Round 3

Focus: a source-blind cold read, then a sweep of spelling, diacritics, crase, hyphenation and punctuation, plus the mechanical audit. Verdict: clean, no changes.

Rejected findings:
- Canon 8, "all of the ordained are found to be of these only" → "todos os ordenados se achem ser somente deles": "achar-se ser" is heavy but attested in formal Portuguese. The meaning matches.
- Canons 1 and 2, "cease [from his ministry]" / "cease from the clerical office" → "cesse [de seu ministério]" / "cesse do ofício clerical": "cessar de" + noun is a formal juridical regency, used consistently in both canons.
- Canon 13, "when his life was despaired of" → "quando se desesperava de sua vida": the "se" is the indeterminate subject and renders the agentless passive.
- Synodal Letter ¶4, "decreed that he should remain … but that those … shall … be admitted" → "permanecesse … sejam admitidos": the tense shift follows the source. A present subjunctive after a past verb is acceptable for a decree still in force.
- Creed, "the only-begotten of his Father" → lowercase "unigênito": this mirrors the source. The capitalized "Unigênito" convention applies to "his only Begotten Son" in the Letter.
- Creed, Greek "ἤν ποτε" (standard form ἦν): this is the edition's form as imported, and pt-BR copies it. It is not an unmistakable OCR slip, so the source was not edited.

Evidence: `ember-translation-evidence/church-fathers__councils__nicaea-i/review-3.md`.

### Round 4

Focus: function words, headings and forced commitments (demonstratives, prepositions, connectors, seu/sua, consigo, pronoun antecedents, the vós address in the Synodal Letter), plus the mechanical audit. Verdict: clean, no changes.

Rejected findings:
- Canon 16, "a man belonging to another, without the consent of his own proper bishop" → "um homem que pertence a outro, sem o consentimento do bispo próprio deste": masculine "outro" reads "another [bishop]", as the Greek τῷ ἑτέρῳ allows. "deste" ties the bishop to the man carried off, which the Greek ἀφ' οὗ ἀνεχώρησεν confirms.
- Synodal Letter ¶3, "he has even destroyed Theonas" → "chegou a perder também Teonas": the null subject reads as "a sua impiedade". That matches the Greek, where ἡ ἀσέβεια is the subject of συναπολέσαι, so it is not a wrong antecedent.
- Canon 2, "the person … and he should be convicted" → "na pessoa … e ela for convencida": "ela" agrees grammatically with "pessoa" and asserts no sex.
- Canon 18, "whereas neither canon nor custom permits" → "quando nem o cânon nem o costume permitem": the adversative "quando" ("when in fact") carries "whereas".
- Canon 19, "if the examination should discover them to be unfit" → "os mostrar indignos": the Greek ἀνεπιτήδειοι means "unsuitable". Here it stands against "blameless and without reproach", so "indignos" is a defensible rendering.
- Synodal Letter ¶5, "These are the particulars, which are of special interest" → no comma before "que": the restrictive reading does not change what is asserted. This is punctuation only.

Evidence: `ember-translation-evidence/church-fathers__councils__nicaea-i/review-4.md`.
