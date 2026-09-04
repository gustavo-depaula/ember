# Translation Journal — Epistle (pt-BR)

Source: en-US (trans. S.D.F. Salmond, Ante-Nicene Fathers, Vol. 6; via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Malchion | Malquião | transliterated per the corpus's established "-ion → -ião" pattern for Greek names (cf. "Marcion" → "Marcião" in `dionysius-rome/against-the-sabellians`); used both in `book.json` author field and in the signatory list |
| Antioch | Antioquia | standard Portuguese form, matches existing corpus usage (Ignatius epistles) |
| Cappadocia | Capadócia | standard Portuguese form |
| Tarsus | Tarso | standard Portuguese form |
| Firmilian | Firmiliano | standard Portuguese form |
| Demetrianus | Demetriano | standard Portuguese form |
| Domnus | Domno | standard Portuguese form |
| Artemas | Ártemas | standard Portuguese form for this heresiarch's name |
| Paul of Samosata | Paulo de Samósata | standard Portuguese form; distinct from "Paulo" the co-signatory bishop later in the salutation — the source itself uses the same bare name for both without disambiguation, mirrored here |
| procurator | procurador | Roman civil title, transliterated |
| secretum | *secretum* | kept in Latin, italicized, per the source's own use of the untranslated Latin term for a magistrate's private audience chamber |
| gain is godliness (1 Timothy 6:5 allusion) | o lucro é piedade | translated literally from this edition's own wording rather than substituted with a standard pt-BR Bible translation's phrasing of 1 Tim 6:5, consistent with established corpus practice (cf. Gregory Thaumaturgus journal) |
| the mystery (of the faith) | o mistério (da fé) | literal |
| subservient / connives at concealing | subservientes / conivente busca ocultar | literal |

## Translation Decisions

- 2026-09-04: Single-chapter work, ~1,500 words — a mid-3rd-century synodal letter (c. 268) from the Synod of Antioch, addressed to Pope Dionysius of Rome and Maximus of Alexandria, announcing the deposition of Paul of Samosata and the election of Domnus as his successor. Preserved by Eusebius (*Church History*, Book VII); "Malchion" is the presbyter of Antioch traditionally credited as the letter's principal author, per the book's own attribution. Chosen from the `church-fathers/` backlog as a well-scoped single-work pick — the smallest remaining untranslated work in the collection at the time of selection.
- No footnotes in the source beyond the single inline Scripture cross-reference ("1 Timothy 6:5"), kept inline in the same position as the English source, per established corpus convention (cf. Gregory Thaumaturgus's Canonical Epistle, Ignatian epistles, Didache) of mirroring the source edition's own placement even where the reference's exact anchor point in the sentence is ambiguous (it most plausibly annotates "supposing that gain is godliness" a few words earlier, echoing the verse's own wording, rather than "procurator" where it currently sits — but this is a placement quirk of the digitized en-US source itself, out of scope for this translation to relocate or correct; noted here rather than silently changed).
- One evident punctuation artifact in the source — a stray sentence break ("...in the midst of the Church. in the great day of the Paschal festival...", with a lowercase word following a full stop) — was treated as a transcription/OCR glitch rather than a deliberate sentence boundary, since no coherent reading exists with the sentence split there. Rendered as one continuous clause in the translation, silently normalized (not logged as a content change, per the corpus's standing practice of fixing obvious punctuation-only artifacts rather than preserving them).
- "convicted them" (paragraph 3): the source's "though he is cognisant of them, and has convicted them" carries an archaic two-pronoun ambiguity — the first "them" refers back to "sins," the second most plausibly to "these women" (found them guilty of the sins), a shift in antecedent already present in the English. Rendered as "ele os conheça e as tenha declarado culpadas" — "os" (masculine, referring to *pecados*) and "as" (feminine, referring to *mulheres*) — which reproduces the same antecedent split in Portuguese rather than collapsing it to one referent.
- "casting the injured unfairly in their suit" (paragraph 2): an archaic legal idiom ("to be cast in a suit" = to lose a lawsuit), not literal "casting/throwing." Rendered as "fazendo os prejudicados perderem injustamente as suas causas" to carry the actual legal sense rather than a literal (and meaningless) word-for-word rendering.
- "concusses the brethren" (paragraph 2): "concuss" here is the archaic sense "to extort by intimidation," not the modern medical sense. Rendered as "extorque," not a cognate.
- Formal, dignified register throughout — this is a synodal letter of formal ecclesiastical condemnation and deposition, addressed to two bishops on behalf of an entire regional synod, so word choice favors the register of the corpus's other conciliar documents (Trent Catechism, the councils sub-works already in `church-fathers/`) over a devotional register.
- Proper names in the signatory list (Helenus, Hymenaeus, Theophilus, Theotecnus, Maximus, Proclus, Nicomas, Aelianus, Paul, Bolanus, Protogenes, Hierax, Eutychius, Theodorus, Malchion, Lucius) given standard Portuguese forms where one is well established (e.g. Teófilo, Teodoro, Lúcio); left transliterated as spelled in the English source where no standard Portuguese form is established (Nicomas, Hierax), per the corpus's established "transliterate, don't invent" rule for minor proper names (cf. Gregory Thaumaturgus journal, "Boradi").
