# Ps 4 — what earned its keep

2026-09-20. One psalm, ten prayed verses, pushed through every step `design.md` proposes. The question for each step: did it change the prayed text, catch a real error, or only cost effort? One psalm is thin evidence — these are verdicts to test on Ps 90, not laws.

| Step | Verdict | Evidence from Ps 4 |
| --- | --- | --- |
| Collation against the Clementine | **Keep, as is** | Cheap (one script, reusable). Found no wording divergence — which is itself the result that lets the DO text be the working text — and surfaced three facts the README had wrong or missing: `Psalm94.txt` is the Epiphany form, `‡` is a second mediant, prayed verses cross biblical boundaries. The Hetzenauer page read is small per psalm. |
| Machine parse (LatinCy) | **Drop as a translator's input; keep only for lemma counts** | ~7 errors in 110 tokens, clustered exactly where it matters: both deponent imperatives (*Miserére*, *Irascímini*) tagged as proper nouns, *mei* as a possessive, *cum clamávero* as a preposition. All three critic runs listed the same errors unprompted — every model in the loop reads this Latin better than the parser does. Parsing colon by colon also invents syntactic roots (Astra's point). The parse never changed a rendering. |
| Rare-lemma flag | **Simplify** | Threshold "< 3 in the psalter" flagged 4 lemmas; one was a parser artefact (*irascimini*), and the genuinely hard phrases (*gravi corde*, *a fructu*, *dilatásti mihi*) are made of common words. Frequency finds rare *words*; the danger here is rare *senses*. Worth keeping as a cheap tripwire for the human route, not as a guide to where the difficulty is. |
| LXX / Hebrew / *iuxta Hebraeos* parallels | **Keep — the most useful input** | Explained five of the ten verses: *gravi corde* = βαρυκάρδιοι, *a fructu* = καρποῦ against Rahlfs' καιροῦ, *in idípsum* = ἐπὶ τὸ αὐτό (and Jerome's own *simul*), *singuláriter* = κατὰ μόνας, the person switch in 4:2a. Every one of these is a place a translator working from a modern Bible goes wrong. **But** give them at psalm level: the Vulgate's verse division is not the Hebrew/LXX one, and the hand-made verse map (`parallels.json`) was the most tedious artefact here. The Lagarde OCR needed hand repair for a nine-verse psalm; at scale that needs a better *iuxta Hebraeos* source or it goes. |
| Lewis & Short lookups | **Keep, on demand** | Settled *mirifico* (L&S cites this verse), *compungi*, *signo*. A lookup script, not a dossier field. It is classical-first; Blaise/Souter would matter for harder psalms and are not digitised here. |
| Interlinear (tier 1) | **Drop from the working pipeline** | Cost: a gloss per lemma plus overrides for every parser error. It changed nothing in tiers 2–3; no critic used it. If a public translation table ever wants a word-level column, generate it then, from a reviewed parse. |
| Literal tier (tier 2) | **Keep, cheaply** | Both Latinist critics passed it with one remark (*in idípsum*). Its value is not the critique — it is that the prayed tier's departures become visible by comparison (`table.md`), which is what makes the final text auditable. It is cheap. |
| Latinist critic (different model family) | **Keep, but it is a gate, not a guide** | Four runs (gpt-5.5 and Astra on the literal tier, Astra on prayed drafts 1 and 2), one remark in total — gpt-5.5, minor, *in idípsum* → *juntamente* — and that suggestion was later rejected by two other reviewers. A pass is reassuring; it did not improve the text. Expect it to earn more on Ps 90 and Ps 118 than on a psalm this short. |
| Deterministic checks | **Keep** | The hard checks (ids, marks) are the contract with the Latin column and cost nothing. The syllable check changed one word (*Assinalada* → *Marcada*) and made one deviation explicit (4:5, five syllables short). Rhyme and cadence checks found nothing — but they are free once written. The syllable counter is a heuristic (±1, no sinalefa); do not tune it further until a human ear disagrees with it. |
| MQM judges | **Simplify to one blind judge per family; drop the scoring** | Astra: penalty 0. Claude (fresh context, saw neither my reasoning nor other verdicts): penalty 2, and its two flags were precisely the two renderings I had already marked as open. Useful as a second opinion on *where* the decisions are; the numbers carry no information at this scale. Multi-run aggregation would have been pure cost. |
| Back-translation | **Keep — better than expected** | The returned Latin was near-identical to the source, which proves little (the model knows the psalm by heart, whatever the prompt says). The **ambiguity list** it was asked for is the real product: it caught *os bens* = possessions and the lost subject of *multiplicáti sunt*, which no critic raised. Reframe the role as "ambiguity reader": someone who sees only the Portuguese and says what it could mean. |
| Stylist critic | **Keep — and it is the one that matters most** | The only reviewer that disagreed with the draft: 8 of 10 verses "not native". Three of its points were taken at no cost in fidelity (4:6, 4:7, 4:9/4:10 via different fixes). The rest are fluency bought by leaving the Latin — see `decisions.md`. That conflict is the project's real question and no pipeline step can answer it. Next time the stylist must be told what is *not* negotiable (no supplied verbs, the Latin's repetitions stay), or it spends its authority on fixes that cannot be taken. |
| Refiner as a separate role | **Drop** | Drafting at psalm level and revising verse by verse happened in one head; a separate "refiner" would only have added the polish the design doc warns against. |
| Provenance | **Keep, as files** | Prompts as files, verdicts stored verbatim with prompt and target hashes, draft 1 kept beside draft 2, `choices` per verse, `table.md` generated. No per-verse JSON record was needed; the folder is the record. |

## What the method looks like after Ps 4

1. Read the psalm's Hetzenauer page; run `collate.py`.
2. Gather LXX, Hebrew, *iuxta Hebraeos* **for the whole psalm**; look up hard words on demand; write `hard-readings.md` — this is where the translating is actually decided.
3. Literal tier, then prayed tier, drafted at psalm level with a `choices` note per verse.
4. `checks.py` (hard checks must pass).
5. Three blind readers from another model family or a fresh context: **Latinist gate**, **stylist** (with the non-negotiables stated), **ambiguity reader** (Portuguese only).
6. Revise; re-run the gate; write `decisions.md`.
7. A human prays it and decides.

Dropped: machine parse as input, interlinear, separate refiner, MQM scoring, multi-run judging.

## Things that came up and belong to the whole project

- **`ouvi`**: under *vós*, the imperative of every *-ir* verb is also the first-person preterite. That is a cost of *vós* the sample sheet now shows, and it pushed *exaudire* to *atender*.
- **Formulas are not only refrains.** *in idípsum* (six places) and *mirificáre* (four) turned up as glossary decisions inside a ten-verse psalm. The glossary will grow from collisions like these, psalm by psalm, not from a list drawn up first.
- **`‡` verses have two pointings** and must sing under both.
- The seed of v0 artefacts, extracted from the work rather than designed: glossary candidates — *exaudire* → atender, *mirificare* → fazer maravilhoso, *tribulatio* → tribulação, *sanctus* (ὅσιος) → santo, *in idípsum* (open); exemplar candidates once decided — 4:2b, 4:9; stylist rubric — `prompts/stylist.md` as run, plus the non-negotiables.
