# Translation Journal — The Passion of the Scillitan Martyrs (pt-BR)

Source: en-US (J. Armitage Robinson translation, Ante-Nicene Fathers Vol. 9)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Scillitan Martyrs | Mártires Escilitanos | "Scillitani" (from Scillium/Scillita, a town in Roman Africa) takes the same word-initial prosthetic vowel Portuguese always adds before an *sC-* cluster (cf. *schola* → *escola*), giving "Escilitanos" rather than a bare "Scilitanos". |
| Præsens (consul) | Praesens | Civil dating reference only (never speaks, not a martyr) — the æ ligature is dropped as a typographic adaptation (Portuguese has no æ), but no Portuguese-adapted name form is invented for an otherwise unknown consul with no cult or martyrology entry. Distinct treatment from the martyrs' names below, which do get full Portuguese adaptation. |
| Claudianus | Claudiano | Standard Latin -us → Portuguese -o; "Claudiano" is itself an attested Portuguese name/form. |
| Saturninus (proconsul) | Saturnino | Standard, well-attested Portuguese form (cf. São Saturnino). |
| Cæsar | César | Standard Portuguese form, matches `justin-martyr/martyrdom-of-justin-chariton-and-other-roman-martyrs` precedent. |
| Speratus | Esperato | Latin -us → -o, plus the prosthetic vowel Portuguese requires before word-initial *sp-* (cf. *spiritus* → *espírito*, *Stephanus* → *Estêvão*). Judgment call — flagged for a reviewer to double-check against any attested Portuguese martyrology form, since this is the principal named martyr. |
| Nartzalus | Nartzalo | Latin -us → -o; the medial "-rtz-" cluster is kept as-is (no attested simplification, treated as an opaque Berber/Punic name transliterated via Latin). |
| Cittinus | Citino | Latin -us → -o; doubled "tt" simplified to single "t" (Portuguese orthography does not use "tt"). |
| Donata | Donata | Already a valid Portuguese form; unchanged. |
| Secunda | Segunda | Regular Portuguese sound-reflex of Latin intervocalic -c- > -g- (cf. *securus* → *seguro*, *acutus* → *agudo*); "Segunda" is itself the ordinary Portuguese word for "second". |
| Vestia | Véstia | Added acute accent to mark the stress on the first syllable (Ves-ti-a), which Portuguese's default stress rule (penultimate syllable) would otherwise misplace. |
| Veturius | Vetúrio | Latin -us → -o, accented for correct stress. |
| Felix | Félix | Standard Portuguese form of the name. |
| Aquilinus | Aquilino | Standard, well-attested Portuguese name. |
| Lætantius | Letâncio | **Not** the same person as the Church Father Lactantius (`lactantius/*`, whose established Portuguese form in this corpus is "Lactâncio" — see `lactantius/phoenix/book.json`). This martyr's name is spelled differently in the source (Lætantius, no "c"), so it is deliberately rendered with a distinct Portuguese form (Letâncio, not Lactâncio) to avoid conflating the two figures. |
| Januaria | Januária | Standard Portuguese feminine name, accented for stress. |
| Generosa | Generosa | Already a valid Portuguese word/name; unchanged. |
| the proconsul | o procônsul | Roman civil office, direct cognate; matches the `justin-martyr` sibling file's "o prefeito" pattern for the equivalent office in that account. |
| judgment-hall | tribunal | Matches "judgment-seat" → "tribunal" in `justin-martyr/martyrdom-of-justin-chariton-and-other-roman-martyrs/pt-BR`. |
| genius of our lord the Emperor | gênio de nosso senhor o Imperador | "Genius" here is the Roman religious concept of the emperor's tutelary spirit, not modern "genius" (talent) — kept as the direct scholarly cognate, consistent with how the corpus renders other classical-religious technical terms without a translator's note. |

## Translation Decisions

- No footnotes (author or editor) in the source — a continuous, unbroken dialogue transcript. Nothing to drop.
- No YAML frontmatter; single-file, single-chapter book (like several other short church-fathers works in this corpus).
- The source uses **no quotation marks** around direct speech ("Saturninus the proconsul said: You can win..." — no `"..."`), unlike the sibling `justin-martyr` account, which does quote. Preserved exactly as in the source rather than imposing the sibling file's convention — the two source texts simply use different typographic conventions for direct speech, and the translation must match its own source, not a different one.
- **Grammatical person (tu/vós) traced turn-by-turn against who Saturninus is actually addressing at each point**, per the defect class documented in this book's own genre-sibling (`justin-martyr/martyrdom-of-justin-chariton-and-other-roman-martyrs/pt-BR/translation-journal.md`):
  - Plural (**vós**) where Saturninus addresses the group of defendants as a whole: the opening "You can win the indulgence..." (no one has spoken yet — addressed to all six standing in the hall), "as you also ought to do", "to the rest: Cease to be of this persuasion", "Be not partakers of this folly" (continuing the address to "the rest"), and "Have a delay of thirty days and bethink yourselves" (English "yourselves" is explicitly plural).
  - Singular (**tu/te**) where Saturninus and Speratus address each other one-to-one: "If you will peaceably lend me your ears" (Speratus → Saturninus), "I will not lend mine ears to you... when you begin to speak" (Saturninus → Speratus), "Do you persist in being a Christian?" (explicitly "said to Speratus" in the source), and the two follow-on lines continuing that same exchange — "Will you have a space to consider?" and "What are the things in your chest?" ("your chest", singular, Speratus's own chest of books) — both read as continuing the direct Saturninus–Speratus exchange rather than reverting to the group, since Speratus alone answers each in turn.
- Scripture references: book names translated to their standard Portuguese form (1 Timothy → 1 Timóteo, Romans → Romanos), chapter:verse numerals kept as-is — matches the convention already used throughout this corpus (cf. `ignatius/epistle-to-polycarp/pt-BR`, `barnabas/epistle/pt-BR`).
- The italicized scriptural allusion in the source (*whom no man has seen, nor with these eyes can see*) is kept in italics in the translation, matching the source's own emphasis.
- The source names only six defendants as initially brought to trial ("Speratus, Nartzalus, Cittinus, Donata, Secunda and Vestia") but the closing sentence and execution order list twelve names in total (adding Veturius, Felix, Aquilinus, Lætantius, Januaria, Generosa). This is a known feature of the historical account (the Scillitan Martyrs were twelve in number; the opening line names only those who are individually examined, "and the rest" covers the other six) and is preserved exactly as in the source, not "corrected" — same rule the corpus already follows for source-level naming quirks (cf. the Chariton/Charito/Hierax naming mismatch noted in the `justin-martyr` sibling journal).
- `book.json` updated: added `pt-BR` to `languages`, added `pt-BR` name/title entries (book title and the single `ch001` TOC entry) and a `pt-BR` author entry ("Miscellaneous" → "Diversos", matching how this corpus's `miscellaneous/` author field is not itself a proper name).
