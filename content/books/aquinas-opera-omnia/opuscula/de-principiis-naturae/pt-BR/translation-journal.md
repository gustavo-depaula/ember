# Translation Journal — Dos Princípios da Natureza (pt-BR)

Source: la (Latin — canonical; en-US, Kocourek 1948 revised by the Aquinas Institute, consulted only for register/terminology, never as the source text)
Target: pt-BR

## Key Terms

Scholastic vocabulary follows the Key Terms table of `de-ente-et-essentia/pt-BR/translation-journal.md`.

| Latin | Português | Notes |
|-------|-----------|-------|
| ens / non ens | ente / não ente | as in *De Ente* |
| esse (noun) | ser | *esse substantiale/accidentale* → ser substancial/acidental; *non esse* → não ser |
| esse (finite verb, existential) | existir / ser | "existir" where bare "ser" would be ambiguous ("quando iam idolum est" → "quando a estátua já existe"; "per se nunquam potest esse" → "por si nunca pode existir") |
| esse aliquid | ser algo | |
| potentia / actus | potência / ato | *in potentia ad* → em potência para |
| materia / forma / privatio | matéria / forma / privação | |
| materia prima | matéria-prima | hyphenated, standard Brazilian Thomistic usage |
| materia ex qua / in qua | matéria da qual / matéria na qual | |
| subiectum | sujeito | |
| habitus | hábito | the positive correlate of privation (privação e hábito) |
| simpliciter | simplesmente | *generatio simpliciter* → geração simplesmente |
| secundum quid | sob certo aspecto | |
| per se / per accidens | por si / por acidente | as in *De Ente* |
| per prius / per posterius | anteriormente / posteriormente | joint *per prius et posterius* (ch006 ¶3) → segundo o anterior e o posterior; ch005 ¶2 "alia per prius alia per posterius" → "umas anteriores, outras posteriores" |
| ratio | noção | the definitional notion (*differunt ratione* → diferem pela noção); *habet rationem imperfecti* → tem razão de imperfeito (character sense, as *De Ente* ch006) |
| generatio / corruptio | geração / corrupção | |
| fieri / in facto esse | fazer-se / ser feito | substantive *in fieri* → no fazer-se (ch002 ¶4, ¶5; ch003 ¶1); finite clauses use "se faz" (ch001 ¶5); after *natus est* → "vir a ser" (ch002 ¶3 "natus est fieri habitus", ¶4 "nata sit fieri forma ignis") |
| efficiens / agens / movens | eficiente / agente / motor | |
| finis / intendere | fim / intentar | |
| causalitas | causalidade | |
| elementum | elemento | |
| idolum | estátua | statue, not "ídolo" |
| aes / cuprum | bronze | see decisions |
| figura / infiguratum / indispositum | figura / sem figura / não disposto | |
| natus est | é apto por natureza | |
| yle | *yle* | kept in Latin, italic as in the source |
| univoce / aequivoce / analogice | univocamente / equivocamente / analogicamente | |
| convenientia / convenire | conveniência / convir | |
| principiata | principiados | |
| praedicamenta | predicamentos | |
| Philosophus / Commentator | o Filósofo / o Comentador | Aristóteles is named in this work as "Aristoteles" → Aristóteles |
| Avicenna | Avicena | |
| Socrates / Plato / Tullius / Cicero | Sócrates / Platão / Túlio / Cícero | |

## Translation Decisions

- Translated from the Latin (`la/`). Paragraph structure mirrors the Latin exactly (chapters 1–6, 7/10/7/11/6/4 paragraphs).
- Chapter headings mirror the Latin's bare `# Caput N` → `# Capítulo N`. The descriptive titles exist only in en-US headings; pt-BR toc titles in `book.json` follow the *De Ente* pattern ("Capítulo N — …"), translated from the en-US toc titles.
- Work citations follow *De Ente*: "no V da *Metafísica*", "no II da *Física*", "no livro *Sobre a Geração*", "no XVI de *Sobre os Animais*". Ch006's "in IV Metaphysicae" is unitalicized in the Latin; italicized in pt-BR for consistency with the other citations.
- *aes* and *cuprum* are used interchangeably by Aquinas for the material of the statue; both rendered "bronze" (as en-US does) so the running example reads as one material.
- Quoted formulas and examples ("non videt", "chimaera non videt", "Grammaticus aedificat", the question-and-answer about the doctor) translated, matching *De Ente*'s policy for quotations inside an all-Latin source. Double straight quotes for quoted words, italics where the Latin italicizes.
- Ch002 "aqua est materia liquabilium" → "matéria das coisas liquefazíveis" (medieval: water as the matter of fusible bodies such as metals); not "soluções aquosas" as in en-US.
- Ch006 "canis dicitur de latrabili et de caelesti" → "cão se diz do que ladra e do celeste" (the Dog Star), literal; no translator note.
- Ch006 "vetula" → "uma velha" (an old woman practicing folk medicine), literal, not en-US "midwife".
- Ch004 "vir … puer" → "varão … menino".
- No footnotes in the source; none added. No source edits.

## Review log

### Round 1

Focus: paragraph-by-paragraph completeness against `la/`, plus the mechanical audit. Verdict: clean, no changes. The work has no Scripture; the eleven work citations match the Latin.

Rejected findings:
- ch002 ¶2 "quia materia a privatione non denudatur" → "porque a matéria nunca se despoja da privação". "nunca" is stronger than "non", but the clause states a general truth, its own gloss ("enquanto está sob uma forma, tem a privação de outra") makes it hold always, and ch002 ¶10 says "nunquam denudatur". The meaning is unchanged.
- ch004 ¶2 "—ut sit sanitas—" → "— por exemplo, de que haja saúde —". "ut" can be read as illustrative; the clause names what the efficient cause brings about. Defensible.
- ch004 ¶7 "ex dispositione contrariorum componentium" → "da disposição dos contrários que a compõem". The pronoun makes the matter the thing the contraries compose. The Latin participle leaves that open, and the matter of a mixed body is composed of contrary elements. Defensible.
- Key Terms row "Philosophus → o Filósofo": "Philosophus" does not occur in this work, but the row's note already says Aristotle is named as "Aristoteles". The row is a convention carried over from *De Ente*, not a claim about this text.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read against `la/`, all six chapters, plus the mechanical audit. Verdict: chapter text and `book.json` clean; two false claims in this journal fixed.

Fixed:
- Key Terms, row "per prius / per posterius": note cited *secundum prius et posterius*, which does not occur in the work. The joint form is *per prius et posterius* (ch006 ¶3), rendered "segundo o anterior e o posterior". The note now names that form and records the adjectival rendering in ch005 ¶2.
- Round 1 entry: "the ten work citations" → "the eleven". The Latin cites works eleven times (ch003: 8, ch004: 2, ch006: 1), and the pt-BR has all eleven.

Rejected findings:
- ch002 ¶3 "cum generatio sit ex non esse" → "embora a geração se dê a partir do não ser". The concessive reading fits the argument: generation is from non-being, yet negation is not called a principle. Defensible.
- ch002 ¶5 "Sed ex quo iam idolum est" → "Mas, desde que a estátua já existe". With the indicative, "desde que" reads as "once/since", not "provided that". The meaning is unchanged.
- ch003 ¶3 "quod esset absonum" → "o que seria dissonante". *absonum* can mean "out of tune" or "absurd". The musical sense fits the lyre-player example.
- ch003 ¶7 "et si etiam non dividatur" → "e, mesmo que nem sequer se divida". This renders the Latin as printed. The Latin is elliptical, and the pt-BR does not resolve it differently.
- ch006 ¶3 "nullum genus praedicatur … sed praedicatur analogice" → "mas o ente se predica analogicamente". The Latin leaves the subject implicit. The sentence argues that *ens* is not a genus, so the subject of "praedicatur analogice" is *ens* (as in ch006 ¶1, "non praedicatur univoce sed analogice"). Supplying it is correct.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, each mark then verified against `la/`; then a mechanical sweep of spelling, diacritics, crase, hyphenation, punctuation and quote pairing, plus the mechanical audit. Verdict: clean, no changes.

Rejected findings:
- ch001 ¶6 "do não ser ou não ente para o ser ou ente". The Latin prints "de non esse vel ente", but the parallel with "ad esse vel ens" requires "non ente". The pt-BR supplies the negation, which is correct.
- ch003 ¶4 "no livro da *Física*" has no book number. The Latin "in libro *Physicorum*" has none either.
- ch004 ¶1 "cuja causa é o bronze e o artífice". A singular verb before a compound subject agrees with the nearer noun and mirrors "cuius causa est cuprum et artifex". It is grammatical.
- ch006 ¶2 "assim como são se diz do corpo". "são" is the adjective (*sanum*), unmarked like "cão se diz" and "médico se diz" in the same chapter. Style, not a defect.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-3.md`.

### Round 4

Focus: function words, headings and places where the Portuguese must commit and the Latin is open (pronoun antecedents, gender, possessives, connectors), plus the mechanical audit. Verdict: one defect, fixed.

Fixed:
- ch004 ¶5 "per quorum diversitatem" (*quorum* = the two modes of "prior"): "e, por sua diversidade," → "e, pela diversidade desses modos,". Coming right after "como diz Aristóteles no XVI de *Sobre os Animais*:", "sua" read as Aristotle's. The fix names the plural antecedent the Latin marks.

Rejected findings:
- ch004 ¶4 "dicuntur enim ad compositum sicut partes ad totum" → "e dizem-se em relação ao composto…". The connector is "e", not "pois". The clause adds a second relation of matter and form, so it does not explain the first. Linking it with "e" does not change the meaning.
- ch004 ¶1 "Non autem est impossibile ut idem sit causa contrariorum" → "Tampouco é impossível". After "não é impossível que…", "tampouco é impossível" means "nor is it impossible", which is the same claim.
- ch002 ¶3 "de his quae sunt nata videre" → "daqueles que…". The masculine generic stands for the neuter plural. The referents are seeing beings.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-4.md`.

### Round 5

Focus: per-paragraph term-frequency diff against the Key Terms table in both directions, a grep of every falsifiable claim in this journal, and proper names and work titles against the standard Portuguese forms and sibling pt-BR works, plus the mechanical audit. Verdict: chapter text and `book.json` clean; one Key Terms row fixed.

Fixed:
- Key Terms, row "fieri / in facto esse": the row gave "fazer-se" for every *fieri*, but after *natus est* the text has "vir a ser" (ch002 ¶3 "in quo scilicet natus est fieri habitus" → "em que o hábito é apto por natureza a vir a ser"; ch002 ¶4 "circa quod nata sit fieri forma ignis" → "em que a forma do fogo seja apta por natureza a vir a ser"), and ch001 ¶5 uses the finite "se faz". Both renderings are correct, so the row now records them.

Rejected findings:
- ch001 ¶2 "sicut sperma hominis et homo albedinis" → "assim como o esperma é matéria do homem e o homem é matéria da brancura". The repeated "matéria" fills the Latin ellipsis, whose subject is "potest dici materia". Nothing is added to the meaning.
- ch003 ¶3 "per locum a maiori" → "pelo argumento do maior". *locus a maiori* is the dialectical topic "from the greater". The literal rendering keeps the term.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-5.md`.

### Round 6

Focus: paragraph-by-paragraph completeness against `la/` (paragraph counts, sentence counts, every quotation, dash parenthetical, italic formula and work citation), plus the mechanical audit. Verdict: clean, no changes. The work has no Scripture, so the Bible-book check does not apply.

Rejected findings:
- ch002 ¶9 "Sed unum numero dicitur duobus modis" → "Mas "um em número" diz-se de dois modos". The quotes are not in the Latin. They mark a term being defined, which the Latin does by syntax alone. Nothing is added to the meaning.
- ch005 ¶1 "*Quia medicus sanavit*" → "*Porque o médico o curou*". The object pronoun "o" is implied by the question "Quare est iste sanus?". It is not added content.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read against `la/`, all six chapters (negation, subject and object, tense and mood, qualifiers), plus the mechanical audit. Verdict: clean, no changes.

Rejected findings:
- ch005 ¶2 "sed animal est magis remota, et iterum substantia remotior est" → "mas animal é mais remota, e, ainda, substância é mais remota". *magis remota* and *remotior* are the same comparative, and "ainda" renders *iterum*, so the progression is kept.
- ch003 ¶7 "sicut aqua cuius quaelibet pars est aqua" → "assim como a água, cuja parte qualquer é água". The word order is unusual but grammatical, and the meaning is exact. Style.

Evidence: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-principiis-naturae/review-7.md`.
