# Translation Journal — On the Trinity (pt-BR)

Source: en-US (Salmond translation, Ante-Nicene Fathers vol. 6, via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| substance | substância | |
| genus | gênero | |
| subsistence(s) | subsistência(s) | |
| the Divine Persons | as Pessoas Divinas | |
| the Holy Trinity | a Santíssima Trindade | traditional Portuguese devotional form |
| begotten | gerado | |
| Word (as title for the Son) | Verbo | italicized on first technical use, matching source's *Word* |
| word conceived / uttered / articulated | palavra concebida / proferida / articulada | the three non-substantial "words" of the analogy |
| Catholic and Apostolic Church | Igreja Católica e Apostólica | |
| curator (*curatorem*) | curador (*curatorem*) | Latin kept inline per source |

## Translation Decisions

- Kept all inline Latin terms (*curatorem*, *unita est*, *rationale*, *aere efformatus*, *aequiparat*) exactly as in the source, in italics, following the source's own pattern of gloss-then-Latin.
- Scripture references translated to Portuguese book names (João, Mateus) with chapter:verse unchanged, matching the convention used elsewhere in `church-fathers/` (e.g. `ambrose/mysteries/pt-BR/ch001.md`). Quoted Scripture text was translated directly from the source's English wording rather than substituted with the Douay-Rheims Portuguese, since the source quotes loosely/paraphrases at points (e.g. the John 17:6 citation) and fidelity to the author's own citation is the priority here, not liturgical-text matching.
- Preserved as-is a source peculiarity: the sentence "And on the mount the Father spoke... Matthew 3:17" pairs "on the mount" with the Baptism account's reference (Matt 3:17 is the Jordan, not a mountain — the Transfiguration in Matt 17:5 has the same words "This is my beloved Son" and is set on a mountain). This looks like a conflation already present in the source text (English translation from the Latin fragment), not something introduced by this translation — left as the source has it, no translator's note added since it doesn't obstruct comprehension.
- Left "haines subsistent" in the source as "nomes subsistentes" ("names subsistent") — read this as an OCR/typographical artifact of "names" in the New Advent digitization; the surrounding argument (Father/Son/Spirit as subsistent names/persons) makes "names" the only sense that fits.
- No editor footnotes present in the source to drop; no author footnotes to preserve. Single unbroken paragraph in the source preserved as a single paragraph in the translation.
- No translator notes added — the text, while doctrinally dense, doesn't require glosses a general reader couldn't get from context.

## Post-Merge Review Corrections

A review pass after the initial merge found six objective defects, all of them fluent, correctly-accented Portuguese that said something subtly wrong. Recorded here so the same readings aren't re-derived later:

| Was | Now | Why |
|-----|-----|-----|
| Vejo em todos os **três o essencial** | Vejo em **todas as coisas três elementos essenciais** | "I see in all three essentials" attaches *all* to an elliptical noun, not to *three*: the sense is "in all things, three essentials", which the following illustration confirms (man/servant/curator is one referent under three headings). The old reading gave "os três" an antecedent that doesn't exist yet — the Divine Persons are introduced two sentences later. |
| quase sucessor dos apóstolos | **sucessor próximo** dos apóstolos | "Near successor" is the adjective of proximity — Gregory placed close to the apostolic origin in the line of succession. *Quase* ("almost") inverts a patristic honorific into a hedge about whether he was a successor at all. |
| são chamadas **a** Santíssima Trindade | são chamadas Santíssima Trindade | With *chamar* + predicative, the article makes "a" parse as the preposition, giving "called **to** the Holy Trinity". |
| e **estes** são também nomes subsistentes | e **estas** são também nomes subsistentes | Antecedent is "Todas (as pessoas)", with correct feminine agreement on *são chamadas* in the same clause. The demonstrative agrees with the antecedent, not with the predicative *nomes*. |
| nem tampouco aos nomes, **pois** estes são eternos | nem tampouco aos nomes, **mas** estes são eternos | The source's adversative "but" had become causal. Every other "but" in the fragment is *mas*. |
| inseparáve**l** e ilimitadamente | inseparave**lmente** e ilimitadamente | An adjective coordinated with an adverb, where the source has two adverbials ("inseparably and without limit"). *Inseparavelmente* is already the form used three times elsewhere in `church-fathers/*/pt-BR`. |

Nothing in `en-US/ch001.md` was touched: the two peculiarities noted above (the Matthew 3:17 / "on the mount" pairing and "haines subsistent") belong to the imported public-domain Salmond text, not to this translation.

## Second Review Round

A further review after that merge found two more defects. Both are pronouns pointing at the wrong antecedent — the same failure mode the first round identified as dominant, which is why the file was re-read for it specifically:

| Was | Now | Why |
|-----|-----|-----|
| visto que **este** está muito distante da natureza humana | visto que **aquele** está muito distante da natureza humana | The clause offers two masculine-singular antecedents in order — *um objeto espiritual*, then *um objeto corpóreo*. *Este* selects the nearest (corpóreo), asserting that the **corporeal** object is far removed from human nature, which inverts the argument: the corporeal is precisely what is proper to man, and the next sentence restates the intended sense ("uma matéria espiritual está acima da condição humana"). English "that" is distal and reaches the spiritual object; *aquele* is its Portuguese counterpart. |
| é eterno **consigo mesmo**, e é inseparável dele | é eterno **com ele mesmo**, e é inseparável dele | *Si/consigo* is the reflexive third-person prepositional pronoun and is obligatorily bound by the clause subject, so this asserted that the Word is eternal *with itself* — while the coordinated *é inseparável dele* uses a non-reflexive pronoun that must then denote someone else. That split referent is not in the English, where "Himself" and "Him" are one and the same divine referent (cf. the underlying *cum ipso aeternum est, et ab eo inseparabile*), and it dissolves the co-eternity claim the passage is making. Two non-reflexive pronouns mirror the source. |

**Divine pronouns stay lowercase mid-sentence.** The first draft of the second fix used a reverential capital (*com Ele mesmo*), which would have been the only such capital in `church-fathers/*/pt-BR` — all 25 mid-sentence instances across the sibling translations are lowercase (`dele` ×12, `nele` ×13), as is this file's own *dele* in the very same clause. The grammatical work is done by *ele* being non-reflexive, not by the capital, so lowercase costs the fix nothing.

Two candidates raised in this round were examined and **ruled out** as non-defects, recorded so they aren't re-litigated:

- `nomes são estes — Adão, Abraão, Isaque, Jacó` for "names are such as these". The bare plural subject (*nomes*, not *os nomes*) already carries the illustrative reading in Portuguese; the exhaustive reading would require the definite article. *Tais como estes* is a phrasing preference.
- `e, por ser espiritual, a sua investigação torna-se impraticável` for "and because it is spiritual, its investigation becomes impracticable". Portuguese adverbial reduced infinitives do not carry English's prescriptive subject-control requirement, and the antecedent is present inside the matrix subject as the possessor (*a sua investigação* = the investigation *of the generation*). Ambiguity at worst, not a false assertion.

## Third Review Round

A third review after that merge found one defect, and it is not a fidelity defect at all — it is a punctuation convention imported from the source's typesetting:

| Was | Now | Why |
|-----|-----|-----|
| fala assim**:—** | fala assim**:** | The colon-plus-em-dash is a 19th-century English typesetting convention that the Salmond text uses to introduce a quoted discourse. Portuguese does not stack the two marks. Corpus evidence: unspaced `:—` occurs in 479 `en-US` files and 10 Latin files under `content/books/`, and in no pt-BR file except this one; *paragraph-final* colon-dash (nothing following on the line, the discourse resuming in the next paragraph, as here) occurs in 233 `en-US` files and, in pt-BR, on this one line in the entire corpus. Where pt-BR does use a colon-dash at all — 22 files, e.g. `morrow-my-catholic-faith/pt-BR/lesson-004.md` (*contradição: — Ele*) and `sales-introduction-to-the-devout-life/pt-BR/part-i-chapter-xiii.md` — it is spaced (`: —`) and introduces speech continuing on the same line, which is not this position. A plain colon is the standard Portuguese way to introduce a discourse that begins in the next paragraph. |

**The em-dash parity check is now 9 (pt-BR) against 10 (en-US), by design.** Earlier rounds tracked em-dash count as a 10/10 structural invariant. That invariant covered the mid-sentence parenthetical dashes, which still pair 1:1 with the source; the tenth English dash is this attribution-line typesetting mark, which has no pt-BR counterpart to preserve. Structural parity is a check on whether content was dropped, not a rule that punctuation conventions must be transplanted.

Three candidates raised in this round were examined and **ruled out** as non-defects:

- `*o homem*` italicizing the article, where the source has `the *man*` with the article outside the italics. The passage turns on the contrast between the bare noun (the common substance) and the articled noun (the individual subsistence). English gets that contrast from bare-vs-definite syntax and can leave "the" outside the emphasis; Portuguese needs the article inside the mentioned expression for the same contrast to land. The earlier `*homem*` in the file is bare because *its* English exemplar is bare — the two files are parallel where it matters.
- `ele se iguala (*aequiparat*) ... ao Espírito Santo` for "He supplies in the same equality (*aequiparat*) the Holy Spirit". *Aequiparat* means "equals / is on a par with", and Salmond's "supplies" is his own strained rendering of it — which is precisely why he glossed it inline. The sentence completes a three-part chain of equalities (equal with the Father as spiritual, equal with us as corporeal, equal with the Spirit as spiritual). A bestowal reading would assert a subordinationist claim the passage does not make and the Latin does not support.
- `a quem podemos considerá-lo semelhante` as resumptive pronominal doubling (*cauda pronominal*). It is not doubling: `considerar X semelhante a Y` has two argument slots, and the two pronouns fill different ones — `-lo` is the direct object of *considerar* (= *Aquele*), `a quem` is the fronted complement of the predicative *semelhante*. The English does the same thing with two distinct pronouns ("whom can we reckon **Him** to resemble"). Dropping the clitic, as proposed, would delete the object.

Verification after the fix: mechanical re-check (40/40 sentence alignment, 14/14 italic spans, 9/10 em-dashes as above, 5/5 parentheses, 15/15 semicolons, 3/3 quotation pairs, all five Latin terms byte-identical, Scripture chapter:verse identical, H1s matching `book.json`, no encoding artifacts), a fresh cold bilingual read that did not consult this journal, and a monolingual pt-BR proofread — all three clean.
