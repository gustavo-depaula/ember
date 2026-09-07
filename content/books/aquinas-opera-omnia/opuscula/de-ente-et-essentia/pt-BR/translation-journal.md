# Translation Journal — Do Ente e da Essência (pt-BR)

Source: la (Latin — canonical; en-US is a secondary reference translation by Armand Maurer, 1949, consulted only for register/terminology, never as the source text)
Target: pt-BR

## Key Terms

| Latin | Português | Notes |
|-------|-----------|-------|
| ens | ente | "aquilo que é" — a being |
| esse | ser | the act of being/to-be, kept distinct from *ens* (ente) throughout — the ens/esse distinction is the whole point of the treatise |
| essentia | essência | |
| quiditas / quidditas | quididade | standard Brazilian Thomistic rendering (cf. Nascimento's *O Ente e a Essência*) |
| quod quid erat esse | aquilo que era o ser de algo | Aristotle's *to ti ên einai*, kept literal per Aquinas's own gloss in Ch. 1 |
| forma | forma | |
| materia | matéria | |
| materia signata / materia designata | matéria designada | Aquinas uses both Latin adjectives as synonyms (Ch. 2); unified to one Portuguese term rather than coining two near-duplicates |
| substantia | substância | |
| accidens | acidente | |
| genus | gênero | |
| species | espécie | |
| differentia | diferença | |
| diffinitio | definição | medieval spelling of *definitio*, not a distinct term |
| ratio (generis/speciei/etc.) | noção (de gênero/de espécie) | "ratio" = the intelligible notion/concept; rendered "razão" only where it means "reason/cause," judged case by case |
| natura | natureza | |
| actus | ato | |
| potentia | potência | |
| ens per se / per accidens | ente por si / ente por acidente | |
| unum per se / per accidens | um por si / um por acidente | |
| humanitas | humanidade | |
| animalitas | animalidade | |
| rationalitas | racionalidade | |
| forma totius | forma do todo | Ch. 2, humanitas as "form of the whole" vs. body/soul as parts |
| pars formalis / materialis | parte formal / parte material | |
| substantiae separatae | substâncias separadas | |
| intelligentia | inteligência | a separate substance (angel), not "intelligence" as a faculty |
| anima | alma | |
| intellectus possibilis | intelecto possível | |
| causa prima | causa primeira | |
| ipsum esse subsistens (descriptive, not a fixed phrase in this work) | o próprio ser subsistente | |
| Philosophus | o Filósofo | = Aristotle |
| Commentator | o Comentador | = Averroes |
| Avicenna | Avicena | |
| Avicebron | Avicebron | proper name, kept as in the Latin |
| Boethius | Boécio | |
| Deus | Deus | |

## Translation Decisions

- 2026-09-07: Translating from the Latin (`la/`) as the canonical source, per the "never translate from a translation" rule. `book.json` lists `en-US` (Maurer, 1949) as a secondary public-domain translation only.
- 2026-09-07: Maurer's en-US text inserts bracketed scholarly citations not present in the Latin (e.g. "*(Aristotle, Metaphysics, 1017a22–35.)*" after "as the Philosopher says in Metaphysics 5.7"). These are Maurer's own editorial apparatus, not Aquinas's text and not in the Latin source — dropped from pt-BR, matching the Latin exactly (same policy as dropping editor footnotes).
- 2026-09-07: Preserving the Latin's own heading structure per chapter rather than the en-US restructuring. Chapters 1–3 in the Latin carry a separate italicized sub-heading line under the `# Caput N` heading (e.g. `***De nominis entis et essentiae significatione***`); Chapters 4–6 have no such sub-heading in the Latin at all. pt-BR mirrors this exactly — sub-heading line for chapters 1–3 only, translated; bare `# Capítulo N` for chapters 4–6. (en-US instead folds a descriptive title into every chapter's H1, including 4–6, which have none in the Latin — an en-US-only restructuring, not followed here.)
- 2026-09-07: `ens`/`esse` distinction — this pair is the technical core of the whole treatise (Ch. 5 turns entirely on God being *ipsum esse*, not merely *ens*). Rendered strictly as *ente* (ens, a being) vs. *ser* (esse, the act of being/to-be) throughout, never swapped or blended, even where Portuguese idiom might prefer "existência" — consistency across chapters matters more than local elegance here.
- 2026-09-07: `materia signata` (Ch. 2) and `materia designata` (Ch. 2, later in the same chapter) are used interchangeably by Aquinas for the same concept (matter under determinate dimensions, the principle of individuation). Both rendered "matéria designada" in pt-BR rather than inventing two Portuguese terms for one Latin concept.
- 2026-09-07: No footnotes (author or editor) exist in the Latin source files — none to drop or preserve.
- 2026-09-07: Scripture/authority citations embedded in the prose (e.g. "ut in II *Metaphysicae* dicitur", "ut Avicenna expresse dicit") kept as inline attributions exactly as structured in the Latin, translated into Portuguese, without adding modern citation apparatus.
- 2026-09-07 (review round 1): A reviewer flagged that italicized Latin formulas Aquinas quotes from other authorities (*quod significat essentiam rei*, *quod quid erat esse*, *intellectu quoquo modo capi potest* in Ch. 1; three more in Ch. 2) were translated into Portuguese rather than left in Latin. **Kept as translated, not reverted** — the source text is Latin in its entirety, so translating every sentence (quoted formulas included) is simply what "translating the book" means here; the "keep Latin phrases inline" rule in the general guidelines targets recognizable liturgical/fixed Latin embedded in a *non-Latin* source (e.g. the Magnificat quoted inside French prose), not routine scholastic citations inside an already-Latin treatise. Confirmed against precedent: Maurer's own en-US reference translation renders all of these into English rather than leaving them in Latin (e.g. "what it is to be a thing," "the essence of a thing," "can in any way be captured by the intellect") — the same policy adopted here for pt-BR. Bare technical terms with no vernacular equivalent (*usia*) are still left untranslated, as before.
- 2026-09-07 (review round 2 fixes): Corrected six more genuine defects found by three fresh parallel review agents (prologue/ch001/ch002 came back fully clean): (1)-(3) Ch. 3 had three instances of the wrong subjunctive tense in counterfactual conditionals — "convier"/"conviesse ao homem..., ela nunca estaria..." pairs require the imperfect subjunctive "conviesse" throughout (a future subjunctive "convier" cannot pair with a conditional "estaria"/"aconteceria") — fixed all three (two in the same paragraph on singular predication, one on the necessity of species-predication). (4) Ch. 5 "não se distingue segundo a razão de natureza" used "razão" for a *ratio* that means the logical/conceptual notion of a shared nature (parallel to *ratio generis/speciei* elsewhere in the text, glossed "noção" in this journal) — fixed to "noção de natureza" for consistency. (Left ch006's two occurrences of "razão completa de essência"/"razão de essência completa" as "razão" rather than "noção" — there *ratio* means the full character/standing of being an essence, a different sense from the logical "notion" sense in Ch. 3/5, and "razão de ente" is itself a recognized Thomistic-Portuguese idiom for this sense.) (5) Ch. 5 "não se finitizam inferiormente" used a non-standard coined verb ("finitizar" is not attested in Portuguese) — fixed to "não são finitas inferiormente", matching the adjectival construction used earlier in the same sentence ("finitae superius"→"finitas superiormente"). (6) The Ch. 6 esse-secundum fix from round 1 was grammatically faithful but awkward (fronting "a coisa subsistente" as subject of "pode" and then attaching an impersonal "entender-se que seja" after it) — smoothed to the impersonal construction "sem o qual se pode entender que a coisa subsistente seja".
- 2026-09-07 (review round 1 fixes): Corrected five genuine defects found by three parallel review agents: (1) prologue heading left as raw Latin "Prooemium" instead of "Proêmio" (inconsistent with book.json's own pt-BR TOC title and with Caput→Capítulo elsewhere) — fixed. (2) Ch. 2 "lapideitas" (an *-itas* coinage parallel to humanitas/animalitas/rationalitas) had been rendered "petreidade" (root switched to native *petra*) instead of the pattern-consistent Latin-cognate "lapideidade" — fixed for consistency with the -itas→-idade convention used for the other three coinages. (3) Ch. 3 opening ablative-absolute participle "Viso" was rendered with the wrong-gender "Vista" (no feminine antecedent exists — the complement is a full clause, which takes the invariable "Visto que..." construction) — fixed to "Visto". (4) Ch. 3 *intellecta* ("understood/actualized," distinct from *intelligibilis* "able to be understood") was rendered "entendida" correctly once but "inteligível" (wrong sense — potential rather than actual) two sentences earlier for the same Latin participle — unified to "entendida". (5) Ch. 4's "componi ex quo est et quod est, vel ex quod est et esse" states two *distinct* Boethian pairings (quo est + quod est, or quod est + esse) but both branches had collapsed to the same Portuguese phrase ("daquilo que é e do ser" twice) — fixed to distinguish "daquilo pelo qual é" (quo est) from "daquilo que é" (quod est). (6) Ch. 6's "causat quoddam esse secundum ... sicut primum potest intelligi sine secundo" (a technical primeiro/segundo *esse* ordinal pairing) had been garbled into a doubled relative clause ("ser segundo o qual, sem o qual...") that obscured the primary/secondary distinction — fixed to "um certo ser secundário, sem o qual..." to restore the primeiro/segundo parallel.
