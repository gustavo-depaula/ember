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
