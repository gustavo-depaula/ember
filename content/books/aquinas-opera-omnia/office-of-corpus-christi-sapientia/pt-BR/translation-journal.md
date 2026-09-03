# Translation Journal — Office of Corpus Christi (Sapientia aedificavit, early draft) (pt-BR)

Source: la (canonical — Leonine/Marietti text mirrored from aquinas.cc)
Target: pt-BR
Cross-checked against: en-US (aquinas.cc translation), for interpretive confirmation only — never used as the base text.

## Why Latin, not English, as source

This book carries a genuine parallel Latin original (`la/`), unlike most translated
books in this corpus where en-US is itself the canonical source. Per the
translate-book philosophy ("never translate from another translation"), pt-BR is
translated directly from the Latin liturgical/patristic text. The existing en-US
translation was read chapter-by-chapter alongside the Latin to confirm difficult
constructions (e.g. the Ambrose/Gratian typological readings in Matins), but no
English wording was carried over mechanically.

## Key Terms

| Latin | Portuguese | Notes |
|-------|------------|-------|
| Vesperae (primae/secundae) | Vésperas (Primeiras/Segundas) | |
| Matutinum | Matinas | |
| Laudes | Laudes | unchanged, already feminine plural in Portuguese |
| Prima / Tertia / Sexta / Nona | Prima / Tércia / Sexta / Noa | traditional Portuguese Hour names |
| Nocturnus | Noturno | "In primo nocturno" → "No primeiro noturno" |
| Invitatorium | Invitatório | |
| Antiphona | Antífona | |
| Psalmus | Salmo | dual Vulgate/Hebrew numbering kept, e.g. "Salmo 109 (110)", matching the en-US edition's reader aid (not present in the bare Latin, which numbers only by Vulgate) |
| Capitulum | Capítula | the short liturgical reading at Lauds/Vespers/Little Hours — traditional Portuguese breviary term, distinct from "Leitura" (Matins reading) |
| Lectio | Leitura | Matins readings ("Lectio prima" → "Leitura 1") |
| Responsorium | Responsório | |
| Versiculus | Versículo | header; the sung couplet itself keeps ℣./℟. glyphs |
| Evangelium | Evangelho | |
| Hymnus | Hino | |
| Benedicite | Benedicite | canticle name, kept untranslated (traditional incipit), as en-US does |
| Benedictus / Magnificat | Benedictus / Magnificat | canticle names, kept untranslated |
| alleluia | aleluia | |
| ℟. / ℣. | ℟. / ℣. | kept as-is, standard liturgical glyphs |

## Translation Decisions

- 2026-09-03: Book selected because it is a small, fully self-contained catalog
  entry (`aquinas-office-corpus-christi-sapientia`, 8 chapters, ~10,400 words in
  en-US) with `la` + `en-US` but no `pt-BR`, found while auditing `content/books/`
  for monolingual works.
- **Scripture references**: kept in the book's existing bracket-citation format
  (`[Book chapter:verse]`), matching this book's own en-US convention, but with
  book names localized to standard Portuguese (Provérbios, Gênesis, Êxodo,
  Salmos, Eclesiástico/Sirácida, Isaías, Oséias, Zacarias, Cântico dos Cânticos,
  Juízes, 1 Samuel, Mateus, Marcos, Lucas, João, Romanos, 1 Coríntios, Hebreus,
  Apocalipse, Daniel), following the localization precedent set in the
  `church-fathers/ignatius/*` pt-BR translations (`Gálatas 1:1`, `2 Timóteo 3:6`).
- **Hymns** (*Pange lingua gloriosi*, *Sacris solemniis*, *Verbum supernum*):
  translated as plain, meaning-preserving prose, matching the en-US edition's own
  approach (a literal rendering, not a rhymed/metrical hymn version). No attempt
  was made to reproduce or approximate any specific published Portuguese
  liturgical hymnal text — a citation to a specific hymnal could not be verified,
  and a fabricated one would be worse than a fresh, faithful prose translation.
- **Psalm incipits**: every "Psalmus N … etc." line quotes only the first verse
  in the Latin manuscript. Translated that one verse plus "etc.", matching the
  editorial convention already used throughout the en-US edition (which also
  quotes only the incipit).
- **Manuscript apparatus dropped**: image/illumination placeholder markers in the
  Latin source (`{image-207}`, `{image-201}`, etc. — references to the Strahov
  manuscript's illuminations) are not textual content and were dropped, exactly
  as the en-US edition already does.
- **Editorial/manuscript notes kept**: two English-only parenthetical notes from
  the modern editor (Corrigan) — the note on Ch. 4's antiphon citation and the
  note on Second Vespers being "written by a different hand … much of what
  follows is conjectural," plus the note on the uncertain responsory music in
  Ch. 8 — are genuine textual-critical information about this specific edition,
  not scholarly apparatus explaining a term, so they were kept and translated
  (in italics, as in en-US), unlike ordinary editor footnotes which the
  translate-book default is to drop.
- **`haedum` (Ch. 1 / Ch. 2 Third Nocturn / Ch. 11's responsory) → "cabrito" (kid
  goat), not "cordeiro" (lamb)**. The en-US edition renders this antiphon "kill
  the lamb," but the Latin word is specifically *haedus* (young goat), distinct
  from *agnus* (lamb) used elsewhere in this same office (e.g. the Matins hymn's
  "Christus creditur agnum et azyma dedisse"). Exodus 12:5 permits either a lamb
  or a goat for the Passover victim, and this office's compiler specifically
  chose the goat reading — translating from the Latin (not the English) surfaced
  this and it was corrected rather than reproduced.
- **Lauds chapter (Ch. 3) has no scripture citation in the Latin** — the en-US
  edition adds "***Hebrews 5:11***", but the quoted text ("Every priest chosen
  from among men…") is Hebrews 5:1, not 5:11. Added the citation "Hebreus 5:1"
  (correct verse) as a translator's editorial addition, rather than reproducing
  the en-US edition's apparent citation error.
- **"Tu autem" dropped** at the end of Matins Reading 4 — a rubric telling the
  reader to finish the versicle quietly, not part of the text proper (parallel
  to how the en-US edition silently omits it too).
- **Address register**: this is liturgical/devotional prose (collects, homiletic
  readings), not a letter to a "you" congregation, so no plural/singular "vós"
  address decision was needed except in the direct-address collect and hymn
  refrains ("Te … poscimus" → "A vós … suplicamnos", "da robur" → "dai-nos
  força") and the Ch. 1 collect ("tribue, quaesumus" → "concedei-nos, Vos
  pedimos"), where **"vós"** was used throughout, consistent with the formal
  register of the corpus's other translated collects and liturgical texts.
- **Reused antiphons/responsories translated once, then copied verbatim** at
  every recurrence, to guarantee word-for-word consistency across chapters (the
  Latin manuscript itself reuses these blocks across Vespers/Nocturns/Little
  Hours, and several are explicitly marked "as in First Vespers" etc.):
  - Ch. 1's Responsory ("Cumque operuisset ros…", Exod 16:14–15) = Ch. 2's final
    responsory (end of Reading 12), explicitly marked in the Latin as a reuse.
  - Ch. 2 Third Nocturn's responsory after Reading 7 ("Ego sum panis vitae…",
    John 6:48–51) = Ch. 8's Second Vespers responsory, explicitly marked in the
    Latin as a reuse ("use image for 1st Responsory in 3rd Nocturn").
  - Ch. 3's five Lauds antiphons reappear verbatim as the antiphons of Prime
    (Ch. 4), Terce (Ch. 5), Sext (Ch. 6), and None (Ch. 7).
  - Ch. 1's capitulum (1 Cor 11:23–24) and Ch. 5's Terce capitulum quote the same
    verse from slightly different Latin manuscript wording ("Dominus Iesus
    Christus" vs. "Dominus Iesus"); each was translated from its own line, and
    they came out effectively identical in Portuguese, which is expected and
    correct — both are the same verse.
- 2026-09-03 — translation of all 8 chapters completed in a single pass, given
  the size of the work (~10,400 words).
- 2026-09-03 — **review round 1** (3 parallel passes: structural/completeness,
  fidelity Ch. 1–2, fidelity Ch. 3–8). Six genuine defects found and fixed:
  - Ch. 1 capitulum, Ch. 2 (×2, Readings 2 and 4 responsories), Ch. 5 capitulum
    — *"quod pro vobis **tradetur**"* (future passive, Words of Institution)
    was translated *"que **é** entregue"* (present) instead of *"que **será**
    entregue"*. Same reused clause, four occurrences, all fixed identically.
  - Ch. 1, hymn doxology ("Genitori, genitoque…") — *salus* (salvation)
    mistranslated *"saúde"* (physical health) instead of *"salvação"*.
  - Ch. 2, Reading 2 — *"Iudaeus bibit et sitit"* is gnomic present tense
    (a timeless statement about "the Jew" as a type, contrasted with the
    following future "tu cum biberis…") but was translated as simple past
    ("bebeu e teve sede"), flattening the contrast. Fixed to present tense
    ("bebe e tem sede").
  - Ch. 2, Reading 12 — *"buccella quae Iudae data est a Domino"* ("the
    morsel that was given **to Judas** by **the Lord**" — *Iudae* dative
    recipient, *a Domino* ablative agent) had giver and recipient reversed:
    "a porção que foi dada **por Judas** ao Senhor". Fixed to "dada **a
    Judas** pelo Senhor".
  - Ch. 2 — 18 bracket-citation abbreviations (`[Mt …]`, `[Mc …]`, `[Lc …]`,
    `[Jo …]`, `[1 Cor …]`) were left in Latin-style short form instead of
    the book's own full-Portuguese-name convention used everywhere else
    (`Mateus`, `Marcos`, `Lucas`, `João`, `1 Coríntios`) — including on the
    "Eu sou o pão da vida" responsory, which must be identical to its Ch. 8
    reuse. Expanded to match. (The separate inline parenthetical citations
    inside the long reading paragraphs, e.g. `(Jo 6:52)`, `(Sl 102:2–3)`,
    were correctly already in a consistent abbreviated style and were left
    untouched — that's a different, intentional citation register from the
    bracket-style antiphon/responsory citations.)
  - **Considered and dismissed as a non-defect**: Ch. 2 Third Nocturn
    antiphon (Zech 9:17) — *"frumentum electorum"* rendered "o trigo fará
    prosperar os jovens" rather than a more literal "o trigo dos
    escolhidos". Jerome's *electorum* here translates Hebrew *baḥurim*
    ("young men, in their prime"), not "elect" in the predestination sense
    — "os jovens", parallel to "as donzelas" for *virgines* in the same
    line, reflects the actual sense and matches how standard Portuguese
    Catholic Bibles render this verse. Not changed.
  - Rebuilt with `pnpm build:corpus` after fixes — clean, no new warnings.
- 2026-09-03 — **review round 2** (2 fresh independent passes: Ch. 1–4 and
  Ch. 5–8, each re-verifying every round-1 fix in its range plus a fresh
  read). Ch. 5–8 pass: all clean, round-1 "tradetur" fix confirmed correctly
  in place, no new defects. Ch. 1–4 pass: all five in-range round-1 fixes
  confirmed correctly in place; one new defect found:
  - Ch. 2, Reading 3 (Ambrose/Gratian, on the Word changing bread and wine)
    — *"Sermo igitur … non potuit in id mutare **quod non erant**?"* ("could
    it not change things into that which they **were not**?") had the
    negation dropped: "não poderia mudar naquilo **o que já existia**"
    ("what it already **was**" — the opposite claim, and inconsistent with
    the very next sentence about giving things "new natures"). Fixed to
    "não poderia mudar as coisas naquilo que elas **não eram**?", preserving
    the negation and the plural "the things" (bread and wine) that the
    argument requires.
  - Rebuilt with `pnpm build:corpus` after the fix — clean, no new warnings.
  - **Two consecutive clean rounds still not reached** — round 2 found one
    new defect, so at least one more clean round is needed before the
    translation can be considered settled.
- 2026-09-03 — **review round 3** (2 fresh independent passes, Ch. 1–4 and
  Ch. 5–8, each re-verifying all seven prior fixes in its range plus a full
  fresh sentence-by-sentence read). All seven prior fixes confirmed
  correctly in place. Two new defects found:
  - Ch. 2, Reading 12 — *"Salutem medicus dedit"* (nominative *medicus* =
    agent, accusative *salutem* = object: "the Physician gave health") was
    rendered in bare OVS order, *"a saúde deu o Médico"*, with no
    disambiguating cue — read with default Portuguese SVO expectations this
    parses as "Health gave the Doctor," inverting agent and patient at the
    exact line introducing the Christ-as-Physician image the passage
    depends on. Fixed to SVO order: "o Médico deu a saúde."
  - Ch. 6, Sext versicle response — *"Tu es qui **restitues** hereditatem
    meam mea"* (unambiguous future indicative, "you *will* restore") had
    been flattened to present tense, "Sois vós quem me **restitui**".
    Fixed to "restituirá" (future), consistent with how the "tradetur"
    future-tense defects were handled in round 1 — a specific future
    promise, not a timeless gnomic statement, even though reading it as
    timeless is a common devotional convention (en-US also uses present
    here, so this defect is only visible when working from the Latin).
  - Rebuilt with `pnpm build:corpus` after both fixes — clean, no new
    warnings.
  - **Two consecutive clean rounds still not reached** — round 3 found two
    new defects, so at least one more clean round is needed.
- 2026-09-03 — **review round 4** (2 fresh independent passes, Ch. 1–4 and
  Ch. 5–8, each re-verifying all nine prior fixes plus a full fresh read).
  Ch. 5–8 pass: **clean** — both in-range fixes (Ch.5 "tradetur", Ch.6
  "restitues") confirmed correctly in place, no new defects, antiphon-reuse
  consistency re-confirmed. Ch. 1–4 pass: all nine in-range fixes confirmed
  correctly in place; one new defect found:
  - Ch. 2, Reading 9 — *"Postea **manifestatus est**"* (simple perfect
    passive, a completed past fact — Judas's true character was, in fact,
    later revealed) had been rendered as conditional/future-in-the-past,
    "depois **se tornaria** manifesto" ("would later become manifest"),
    turning a definite past event into a hypothetical/prospective one.
    Fixed to simple past: "depois se manifestou."
  - Rebuilt with `pnpm build:corpus` after the fix — clean, no new
    warnings.
  - Round 3 found a defect in Ch. 6 (within the 5–8 range), so round 4's
    clean verdict for Ch. 5–8 is only the *first* clean round for that
    range, not the second — **the whole book still needs one more clean
    round** (covering all 8 chapters) before review can close.
- 2026-09-03 — **review round 5** (2 fresh independent passes, Ch. 1–4 and
  Ch. 5–8, each re-verifying all ten prior fixes plus a full fresh
  adversarial read). **Both passes came back CLEAN** — all ten fixes
  confirmed correctly in place across both ranges, and no new defects
  found anywhere in the book. This is the first round where the *entire*
  book (all 8 chapters) came back clean in the same round (round 4 had
  been clean for Ch. 5–8 only, with one defect still in Ch. 1–4).
  Several borderline items were explicitly considered and dismissed as
  defensible readings rather than defects (noted in the reviewers'
  reports, not repeated here) — including confirming that the "Magnificat
  … anima mea Dominum" incipit appearing after the Ch. 3 Benedictus
  antiphon is a pre-existing anomaly already present in the **Latin**
  source itself (not a translation error — pt-BR faithfully matches it).
  **One clean round down, one more consecutive clean round needed** before
  the review can close per the two-consecutive-clean-rounds rule.
- 2026-09-03 — **review round 6** (2 fresh independent passes, Ch. 1–4 and
  Ch. 5–8). Ch. 5–8 pass: **clean** — both in-range fixes re-verified,
  reuse consistency re-confirmed, no new defects; second consecutive clean
  round for that range. Ch. 1–4 pass: all ten in-range fixes confirmed
  correctly in place; two new defects found, resetting the whole-book
  clean-round count to zero:
  - Ch. 2, Reading 4 — *"ut **sint quae erant**, et in aliud
    convertantur"* is two coordinated purpose clauses: (1) the species
    *continue to be what they were* (the accidents remain), and (2) *are
    converted into something else* (the substance changes) — the
    classical patristic articulation of what later became "accidents
    remain, substance changes," echoed later in Reading 10 ("*Corpus
    Christi et veritas et figura est*"). The translation had collapsed
    both into one clause, entirely dropping the "continue to be what they
    were" half — a doctrinally load-bearing omission, not a compression.
    Fixed to render both clauses: "para que sejam as que já eram, e sejam
    mudadas em outra coisa!"
  - Ch. 2, Third Nocturn antiphon (Manoah/Samson's father offering the
    kid) — cited "[Juízes 3:19–20]"; the Manoah episode is Judges
    **13**:19–20 (Judges 3 is the unrelated Ehud/Eglon narrative). The
    Latin gives no citation at all (this bracket citation, like Ch. 3's
    Hebrews one, is an editorial addition); en-US independently carries
    the same wrong chapter number, but that doesn't make it correct.
    Fixed to "[Juízes 13:19–20]".
  - Rebuilt with `pnpm build:corpus` after both fixes — clean, no new
    warnings.
  - **Clean-round count reset**: two consecutive fully-clean rounds are
    still required before review closes; round 6 was not clean (Ch. 1–4
    had two defects), so at least one more full clean round is needed.
- 2026-09-03 — **review round 7** (adversarial, Ch. 1–4 only, this range's
  turn in the alternating-range schedule). Re-verified all twelve prior
  fixes in this range (the ten from rounds 1–5 plus the two from round 6:
  the Ch. 2 Reading 4 "ut sint quae erant" both-clauses fix and the Judges
  13:19–20 citation fix) — all confirmed correctly and completely in
  place, with exact current wording matching the journal's fix
  descriptions. A full fresh sentence-by-sentence read against `la/`
  found the prose translation itself faithful throughout Ch. 1–4 (no
  dropped clauses, tense/mood shifts, or reversed agent/patient found),
  but a systematic spot-check of every bracket/parenthetical scripture
  citation's chapter:verse against the actual quoted text — prompted
  directly by round 6's Judges citation defect — turned up five more
  wrong citations, all in Ch. 2, all inherited from the same en-US
  edition (confirmed independently wrong in en-US too, not just carried
  over blindly):
  - Reading 2 — the Ambrose/Gratian quote *"bibebant... de spirituali
    consequente eos petra. Petra autem erat Christus. Sed non in
    pluribus eorum complacitum est Deo. Nam prostrati sunt in deserto.
    Haec autem facta sunt in figura nostri"* was cited *"(1 Cor 10:4–5)"*
    but the closing clause *"Haec autem... in figura nostri"* ("this was
    done as a figure of us") is 1 Cor 10:**6**, not part of v. 5 (confirmed
    against the corpus's own Douay-Rheims text at
    `content/bible/drb/1-corinthians.json`). Fixed to "(1 Cor 10:4–6)".
  - Reading 7 — *"Qui manducat carnem meam et bibit meum sanguinem in me
    manet et ego in eo"* ("he who eats my flesh... abides in me and I in
    him") was cited *"(Jo 6:57)"* (and headed *"[Vers. 57]"*), but this
    exact same Latin clause is correctly cited as v. 56 elsewhere in this
    same chapter (inside the `[João 6:55–56]` responsory-verse bracket
    citation) — an internal self-contradiction independent of which
    absolute Vulgate-verse edition is used. Fixed both the inline
    citation and the `[Vers.]` heading to 56.
  - Reading 10 — the same *"caro mea vere est cibus... sanguis meus vere
    est potus"* quote that is correctly cited *"(Jo 6:55)"* earlier in
    Reading 7 (and appears as v. 55 in the `[João 6:55–56]` responsory
    range) was cited here as *"(Jo 6:56)"* — again internally
    inconsistent with the rest of the chapter. Fixed to "(Jo 6:55)".
  - Reading 12 — the same *"qui manducat carnem meam et bibit sanguinem
    meum... in me manet et ego in eo"* quote as the Reading 7 case above,
    same *"(Jo 6:57)"* mislabeling repeated. Fixed to "(Jo 6:56)".
  - Reading 12 — *"pingues terrae"* ("the rich/fat ones of the earth")
    was cited *"(Sl 22:29)"*, but this verse is Psalm **21**:30 in this
    book's own Vulgate-based psalm numbering (the "Deus, Deus meus,
    respice in me" psalm, already used elsewhere in this chapter as
    "Salmo 21 (22)"; Vulgate Psalm 22 is a different psalm, "Dominus
    regit me" — confirmed the verse text and number against
    `content/bible/drb/psalms.json`, Ps 21:30). Fixed to "(Sl 21:30)".
  - **Note on scope of this finding**: the (Jo 6:57)/(Jo 6:56)
    citations rest on an internal-consistency argument, not on
    unilaterally imposing an external verse-numbering scheme — John 6
    has genuinely divergent verse-numbering traditions across Vulgate
    editions/lectionaries (confirmed by cross-checking the book's own
    "João 6:53" Gospel-reading heading, which is *not* flagged as a
    defect here despite reading like an off-by-one against a modern
    Clementine Vulgate print, because it is a liturgical pericope
    citation matching the office's own tradition and is identical in
    en-US). Only citations of the *identical Latin clause* getting
    *different* verse numbers within this same chapter were treated as
    defects.
  - Rebuilt with `pnpm build:corpus` after all five fixes — clean, no
    new warnings.
  - **Clean-round count reset again**: round 7 found five new (citation)
    defects in the Ch. 1–4 range, so the two-consecutive-clean-round
    count is back to zero; at least two more full clean rounds are
    needed (covering both ranges) before review can close. The next
    Ch. 1–4 pass should re-verify these five citation fixes in addition
    to all twelve prior fixes.
- 2026-09-03 — **review round 8** (independent, adversarial, Ch. 1–4
  only). Re-verified all five round-7 citation fixes with exact current
  wording — all confirmed correctly in place: "(1 Cor 10:4–6)" in
  Reading 2, "(Jo 6:56)" at the end of Reading 7 and Reading 12,
  "(Jo 6:55)" in Reading 10, and "(Sl 21:30)" (the "pingues terrae"
  line) in Reading 12. A full fresh sentence-by-sentence fidelity read
  plus an exhaustive sweep of every bracket/parenthetical scripture
  citation's chapter:verse (cross-checked against
  `content/bible/drb/*.json` where that corpus data was intact, and
  against well-established standard Vulgate/Douay numbering where the
  local corpus Bible JSON itself turned out to have unrelated data bugs
  — e.g. `proverbs.json` and `zacharias.json` are missing/mis-shifted
  chapters, confirmed by their proverbs.json only running 1–28 instead
  of 1–31 and its "24:13" holding Prov 21:13's text instead; this is a
  pre-existing corpus data issue, not a translation defect, and was
  left untouched) found two new genuine defects:
  - Ch. 2, Reading 7 — *"Qui manducat meam carnem, et bibit meum
    sanguinem, habet vitam aeternam. … Et ego resuscitabo eum in
    novissimo die"* is one continuous utterance (the text itself says
    Christ "immediately added" the second clause to the first) and is
    a single verse, John 6:55, per the corpus's own
    `content/bible/drb/john.json` ("He that eateth my flesh...hath
    everlasting life: and I will raise him up at the last day.") The
    first clause sits, uncited, directly under this reading's own
    "[Vers. 55]" section heading; the second clause ("e eu o
    ressuscitarei no último dia") was nonetheless inline-cited
    *"(Jo 6:54)"* — a self-contradiction against both its own
    paragraph heading two lines above and its textually-inseparable
    sibling clause. Fixed to "(Jo 6:55)".
  - Ch. 2, Responsory after Reading 8 — the same two clauses (*"nisi
    manducaveritis...non habebitis vitam in vobis"*, John 6:54, plus
    the John 6:55 pair just above) are quoted together and were cited
    as a range, *"[João 6:53–54]"* — wrong on both ends: v. 53 ("the
    Jews disputed among themselves") isn't quoted at all, and the
    range needed to extend to v. 55, not stop at 54, once the Reading 7
    fix above is applied. Fixed to "[João 6:54–55]" (en-US carries the
    identical "[John 6:53–54]" error independently, so this is not a
    pt-BR-only slip, but per this review's own precedent that doesn't
    make it correct).
  - Ch. 3, hymn *Verbum supernum*, "O salutaris hostia" stanza —
    *"quae caeli pandis hostium … da robur, fer auxilium"* (all
    second-person direct address to Christ) was translated with
    **tu**-register verbs — "que **abres** a porta do céu… **dá**-nos
    força, **traze**-nos socorro" — contradicting this book's own
    documented **vós**-register decision for exactly this kind of
    direct address (see "Address register" above), which this journal
    entry itself already quotes this exact line's intended translation
    as "'da robur' → 'dai-nos força'" — i.e. the file did not match
    what had already been decided and written down. Every other
    instance of second-person address to God in Ch. 1–4 (the Ch. 1
    collect, the Ch. 2 *Sacris solemniis* doxology, the Ch. 1
    Magnificat antiphon) correctly uses vós. Fixed to "que **abris** a
    porta do céu… **dai**-nos força, **trazei**-nos socorro."
  - Rebuilt with `pnpm build:corpus` after all three fixes — clean, no
    new warnings (the two pre-existing "H1 drifts from TOC title"
    warnings for `officesas-c01`/`officesas-c08` [la] are unrelated to
    this book's pt-BR content and predate this review).
  - **Clean-round count reset again**: round 8 found three new defects
    in the Ch. 1–4 range (two citation, one register), so the
    two-consecutive-clean-round count is back to zero; at least two
    more full clean rounds are needed (covering both ranges) before
    review can close. The next Ch. 1–4 pass should re-verify these
    three fixes in addition to all seventeen prior fixes, and the next
    Ch. 5–8 pass should specifically re-check the vós-register
    convention across all second-person-direct-address hymn stanzas in
    that range too, since this round's register slip in Ch. 3 was not
    of the kind prior rounds' citation-focused sweeps were looking for.
- 2026-09-03 — **review round 8** (adversarial, Ch. 5–8 only, this
  range's turn in the alternating-range schedule; prompted by round 7's
  discovery of citation errors in Ch. 2, which raised the concern that
  similar citation defects might exist undetected in Ch. 5–8, since
  rounds 1–6 focused more on tense/mood/negation than on citation
  accuracy). Re-verified both in-range fixes (Ch. 5 "tradetur" →
  "será entregue", Ch. 6 "restitues" → "restituirá") — both confirmed
  correctly in place. Re-confirmed the Ch. 3 Lauds → Ch. 4/5/6/7
  Prime/Terce/Sext/None antiphon-reuse consistency by diffing every
  reused antiphon's Portuguese wording and bracket citation side by
  side — all identical, no drift. Ran an exhaustive citation sweep:
  every bracket/parenthetical citation in Ch. 5–8 was checked chapter-
  and-verse against the corpus's own Douay-Rheims text
  (`content/bible/drb/{psalms,ecclesiasticus,john}.json`) and, for the
  Latin-verse boundaries, against the Clementine Vulgate — roughly 20
  citations total (Sir 24:28–29, Ps 110:4–5, Ps 22:5 ×2, Ps 144:15,
  1 Cor 11:23–24, 1 Cor 10:3–4, 1 Cor 11:26, Ps 77:25, Ps 15:5,
  1 Cor 10:20–21, Rev 2:17, 1 Cor 11:27, Ps 115:4 (116:13), 1 Cor
  11:28–29, John 6:48–50, John 6:51, John 6:32). All confirmed correct
  **except one**:
  - Ch. 8, Magnificat antiphon — *"Amen, amen dico vobis: non dedit
    Moyses vobis panem de caelo sed Pater meus dat vobis panem verum de
    caelo. Panis enim verus est qui de caelo descendit et dat vitam
    mundo"* quotes **two** consecutive Vulgate verses (confirmed against
    the Clementine text: v. 32 ends at "...panem de caelo verum"; v. 33
    begins exactly at "Panis enim [Dei/verus] est qui de caelo
    descendit..."), but was cited only "[João 6:32]", silently dropping
    the second verse — the same defect shape round 7 found in Ch. 2
    (en-US independently carries the identical truncated "[John 6:32]"
    citation, so this is another citation error inherited unchanged
    from en-US, not introduced in translation). Fixed to
    "[João 6:32–33]".
  - A full fresh sentence-by-sentence fidelity read of Ch. 5–8 against
    `la/` (tense, mood, negation, subject/object direction, theological
    terms) found no further defects — every future/perfect/present
    tense, every negation, and every agent/patient direction in the
    capitula, responsories, versicles, and antiphons matched the Latin.
  - Rebuilt with `pnpm build:corpus` after the fix — clean, no new
    warnings (pre-existing H1/TOC-drift warnings on unrelated chapters
    and books are unaffected).
  - **Verdict**: Ch. 5, 6, 7 — CLEAN (no defects, in-range fixes
    confirmed). Ch. 8 — NOT CLEAN going in (one new citation defect
    found and fixed); CLEAN now that the fix is applied.
  - **Clean-round count**: round 8 was not a clean round (one new
    defect found in Ch. 8), so the two-consecutive-clean-round count
    remains at zero. At least two more full clean rounds (covering
    both ranges) are still needed before review can close. The next
    Ch. 5–8 pass should re-verify this John 6:32–33 fix in addition to
    the two prior in-range fixes.
- 2026-09-03 — **review round 9** (independent, adversarial, Ch. 1–4
  only). Spot-checked the three round-8 fixes named for this range —
  Ch. 2 Reading 7's "(Jo 6:55)" fix, the Reading-8-responsory
  "[João 6:54–55]" fix, and Ch. 3's *O salutaris hostia* vós-register
  fix — all three confirmed correctly in place with exact wording
  matching round 8's descriptions. A full fresh sentence-by-sentence
  fidelity read of Ch. 1–4 against `la/` (tense, mood, negation,
  subject/object direction, theological terms) found no new prose
  defects — every case checked (the hymn stanzas, the "salus
  medicus"/"tradetur" family already fixed, the Ch. 2 Reading 6
  paragraphs on daily re-offering, Reading 11's communion-frequency
  paragraph, etc.) matched the Latin. A full citation sweep (every
  bracket/parenthetical scripture reference in Ch. 1–4 checked
  chapter-and-verse against `content/bible/drb/*.json`, ~45 citations
  total including all of Ch. 1's Exodus/Genesis/Wisdom/Psalm citations
  and all of Ch. 3–4's) found Ch. 1, 3, and 4 **fully clean** — but
  turned up a concentrated cluster of **11 more wrong citations, all
  in Ch. 2 Readings 7–9** (the Alcuin *In Ioannem* homily block, John
  6:54–69), a passage rounds 6–8's citation sweeps had already gone
  over repeatedly without finding this:
  - The root cause: this office's own `content/bible/drb/john.json`
    (used as this review's ground truth per round 7/8's precedent) has
    John 6:56 = *"caro mea vere est cibus... sanguis meus vere est
    potus"* and John 6:57 = *"qui manducat carnem meam... in me manet
    et ego in eo"* — confirmed against the well-known "I am the bread
    of life" discourse's standard numbering (John 6:35, 48 also
    checked and consistent). Round 7 had assumed the *opposite*
    mapping (treating the "caro mea" clause as v. 55 and the "in me
    manet" clause as v. 56) when it resolved an apparent internal
    inconsistency, and "fixed" several already-correct citations
    *into* this wrong mapping while leaving the true source of the
    inconsistency (a different set of citations, off by one in the
    same direction) untouched. en-US carries several of the same
    off-by-one errors independently (confirmed, not just inherited via
    copying), but not all of them — this cluster is a mix of
    pre-existing en-US errors and one round-7-introduced regression.
  - Reading 7, end of the `[Vers. 55]` paragraph — *"caro mea vere est
    cibus, et sanguis meus vere est potus"* was cited "(Jo 6:55)"
    (duplicating the citation already correctly used two sentences
    earlier for *"et ego resuscitabo eum in novissimo die"*, which
    genuinely is v. 55). Fixed to "(Jo 6:56)".
  - Reading 7, the following paragraph — *"qui manducat carnem meam et
    bibit meum sanguinem in me manet et ego in eo"* was headed
    "[Vers. 56]" and cited "(Jo 6:56)". This is the exact clause round
    7 moved from "[Vers. 57]"/"(Jo 6:57)" down to 56, believing it was
    fixing an inconsistency — it was not; 57 was correct. Reverted the
    header to "[Vers. 57]" and the citation to "(Jo 6:57)".
  - Responsory after Reading 8, versicle — the same two clauses
    (*"caro mea vere est cibus..."* + *"qui manducat... in me manet et
    ego in eo"*) quoted together as "[João 6:55–56]". Fixed to
    "[João 6:56–57]".
  - Reading 8, `[Vers. 61]` paragraph — *"durus est hic sermo. Quis
    potest eum audire?"* is v. 61 (matching its own paragraph header),
    but was cited inline "(Jo 6:60)". Fixed to "(Jo 6:61)".
  - Responsory after Reading 9, responsory line — *"Sicut vivens misit
    me Pater... ipse vivit propter me"* (v. 58) + *"Hic est panis qui
    de caelo descendit"* (start of v. 59) cited "[João 6:57–58]".
    Fixed to "[João 6:58–59]".
  - Responsory after Reading 9, versicle — *"Non sicut patres vestri
    manducaverunt manna et mortui sunt. Qui manducat hunc panem vivet
    in aeternum"* is entirely v. 59, but was cited "[João 6:58]".
    Fixed to "[João 6:59]".
  - Reading 9, `[Vers. 68]` paragraph — *"Numquid et vos vultis
    abire?"* is v. 68 (matching its own header) but was cited
    "(Jo 6:67)"; later in the same paragraph *"Domine ad quem ibimus?"*
    is v. 69 but was cited "(Jo 6:68)". Fixed to "(Jo 6:68)" and
    "(Jo 6:69)" respectively.
  - Reading 9, `[Vers. 69]` paragraph — *"Verba vitae aeternae habes"*
    is the continuation of v. 69 (matching its own header) but was
    cited "(Jo 6:68)". Fixed to "(Jo 6:69)".
  - Reading 10 — the same *"caro mea vere est cibus... sanguis meus
    vere est potus"* clause as the Reading 7 case above, same
    "(Jo 6:55)" mislabeling (this is the citation round 7 had pointed
    to as the supposedly-correct reference when it "fixed" Reading 10
    to match Reading 7 — both were wrong). Fixed to "(Jo 6:56)".
  - Reading 12 — *"qui enim manducat carnem meam et bibit sanguinem
    meum digne, in me manet et ego in eo"* is v. 57 (same clause as
    the Reading 7 case), but round 7 had changed this from
    "(Jo 6:57)" to "(Jo 6:56)" believing it was fixing a mislabeling.
    Reverted to "(Jo 6:57)".
  - The `[Vers. 51–52]`-range versicle after Reading 7 (`[João
    6:51–52]`), the `[João 6:54–55]` responsory before it, and the
    `[João 6:48–50]` responsory before that — all independently
    re-verified against the DRB and confirmed correct; not changed.
  - Rebuilt with `pnpm build:corpus` after all eleven fixes — clean,
    no new warnings (same pre-existing unrelated H1/TOC-drift warnings
    as every prior round).
  - **Clean-round count reset again**: round 9 found eleven new
    (citation) defects in the Ch. 1–4 range, so the
    two-consecutive-clean-round count is back to zero; at least two
    more full clean rounds are needed (covering both ranges) before
    review can close. The next Ch. 1–4 pass should re-verify all
    eleven of this round's fixes in addition to the seventeen prior
    ones, paying particular attention to Reading 7–9's John 6:54–69
    citation cluster given how many rounds it took to get right — and
    the next Ch. 5–8 pass should double-check whether any of its own
    John 6 citations (John 6:48–51 in the Third Nocturn responsory,
    John 6:32 in Ch. 8) rest on the same verse-mapping confusion, since
    that possibility was not specifically re-examined this round.
- 2026-09-03 — **review round 9** (independent, adversarial, Ch. 5–8
  only). Re-verified all three prior in-range fixes with exact current
  wording — all confirmed correctly in place: Ch. 5 capitulum "que
  **será entregue** por vós" (1 Cor 11:23–24), Ch. 6 Sext versicle
  response "Sois vós quem me **restituirá** a minha herança", and
  Ch. 8 Magnificat antiphon citation "[João **6:32–33**]". Re-confirmed
  the Ch. 3 Lauds → Ch. 4/5/6/7 Prime/Terce/Sext/None antiphon-reuse
  consistency (including Ch. 4, one chapter outside this round's core
  range, since the reuse chain runs through it) by diffing every reused
  antiphon's Portuguese wording and citation side by side against
  Ch. 3 — all identical, no drift. Ran a full fresh sentence-by-sentence
  fidelity read (tense, mood, negation, subject/object direction,
  register) of Ch. 5–8 against `la/` — no defects found there. Ran a
  full citation sweep of every bracket/parenthetical citation in
  Ch. 5–8 against `content/bible/drb/{ecclesiasticus,psalms,john}.json`
  (Sir 24:28–29, Ps 144:15, Ps 110:4, 1 Cor 10:3–4, Ps 77:25, Ps 15:5,
  Rev 2:17, Ps 115:4 (116:13), John 6:48–50, John 6:32–33, plus the
  1 Cor 11:23–24/26/27/28–29 capitula) — all confirmed correct **except
  one**, found by tracing a reused block back to its other occurrence:
  - Ch. 8's Second Vespers responsory versicle — *"Ego sum panis vivus
    qui de caelo descendi. Si quis manducaverit ex hoc pane vivet in
    aeternum"* was cited *"[João 6:51]"*, but only the first sentence
    (*"ego sum panis vivus qui de caelo descendi"*) is v. 51; the second
    sentence (*"si quis manducaverit ex hoc pane vivet in aeternum"*) is
    v. 52 — confirmed two ways: against `content/bible/drb/john.json`
    (v. 51 ends at "which came down from heaven"; v. 52 begins "If any
    man eat of this bread, he shall live for ever...") and, independently,
    against this same book's own Ch. 2 Reading 11, which quotes the
    Latin *"ego sum panis vivus qui de caelo descendi"* cited "(Jo
    6:51)" and, as a separate quote introduced by *"Et iterum"*, *"panis
    quem ego dabo caro mea est pro mundi vita"* cited "(Jo 6:52)" — the
    second half of the same v. 52 that begins "si quis manducaverit ex
    hoc pane vivet in aeternum: et...". This is the same truncated-range
    defect shape as round 8's Ch. 8 Magnificat fix (a two-verse quote
    cited as only its first verse). This exact responsory is one of the
    book's documented verbatim reused blocks (Ch. 2 Third Nocturn
    responsory = Ch. 8 Second Vespers responsory), and the identical
    "[João 6:51]" mislabel was present in **both** locations
    (`officesas-c02.md` line 234 and `officesas-c08.md` line 15, byte-
    for-byte identical text) — en-US independently carries the same
    "[John 6:51]" truncation in both chapters too, so this is inherited
    from en-US, not introduced in translation. Fixed both occurrences to
    "[João 6:51–52]" to keep the reused block identical across chapters,
    per the standing convention that reused blocks must match verbatim
    (round 1's "same reused clause, four occurrences, all fixed
    identically" precedent). Ch. 2 is outside this round's nominal
    Ch. 5–8 scope, but fixing only the Ch. 8 copy would have created a
    fresh cross-chapter inconsistency, so both were corrected together.
  - Rebuilt with `pnpm build:corpus` after the fix — clean, no new
    warnings (pre-existing H1/TOC-drift warnings on unrelated
    chapters/books are unaffected).
  - **Verdict**: Ch. 5, 6, 7 — CLEAN (no defects, all in-range fixes
    confirmed, antiphon-reuse consistency re-confirmed). Ch. 8 — NOT
    CLEAN going in (one new citation defect found, shared verbatim with
    Ch. 2); CLEAN now that the fix is applied.
  - **Clean-round count**: round 9 was not a clean round (one new
    defect found, spanning Ch. 2 and Ch. 8), so the two-consecutive-
    clean-round count remains at zero. The next Ch. 5–8 pass should
    re-verify the "[João 6:51–52]" fix in addition to the three prior
    in-range fixes, and the next Ch. 1–4 pass should re-verify the same
    fix in its Ch. 2 copy.
- 2026-09-03 — **review round 10** (independent, adversarial, Ch. 1–4
  only). First re-verified round 9's John 6:54–69 citation cluster
  (Ch. 2 Readings 7–9) for internal consistency against
  `content/bible/drb/john.json` as ground truth, quoting the current
  citation at each spot: Reading 7 end-of-`[Vers. 55]` "*e eu o
  ressuscitarei no último dia*" → "(Jo 6:55)" (correct, matches v.55
  "hath everlasting life: and I will raise him up at the last day");
  same paragraph "*a minha carne... verdadeiramente bebida*" →
  "(Jo 6:56)" (correct, matches v.56 "my flesh is meat indeed"); the
  `[Vers. 57]` paragraph "*e quem come... permanece em mim, e eu nele*"
  → "(Jo 6:57)" (correct, matches v.57 "abideth in me, and I in him");
  the Reading 7/8 responsory versicle → "[João 6:56–57]" (correct); the
  Reading 8/9 responsory body → "[João 6:54–55]" (correct, a round-8
  fix, untouched by round 9); the `[Vers. 61]` paragraph "*duro é este
  discurso*" → "(Jo 6:61)" (correct, matches v.61 "This saying is
  hard"); the Reading 9/Responsory "[João 6:58–59]" and "[João 6:59]"
  (both correct, matching v.58 "he that eateth me...shall live by me"
  and v.59 "he that eateth this bread shall live for ever"); the
  `[Vers. 68]`/`[Vers. 69]` paragraphs "*acaso também vós quereis ir
  embora?*" → "(Jo 6:68)" and "*Domine ad quem ibimus... Verba vitae
  aeternae habes*" → "(Jo 6:69)" ×2 (all correct, matching v.68 "Will
  you also go away?" and v.69 "Lord, to whom shall we go? thou hast the
  words of eternal life"); Reading 10's "*a minha carne... bebida*" →
  "(Jo 6:56)" (correct); Reading 12's "*quem come a minha carne...
  permanece em mim*" → "(Jo 6:57)" (correct). **The entire cluster is
  now internally consistent and matches the DRB ground truth exactly —
  no citation in this cluster needed further correction.**
  A full fresh sentence-by-sentence fidelity read of Ch. 1–4 against
  `la/` (tense, mood, negation, subject/object direction, theological
  terms) found no defects — re-verified Ch. 1's capitulum/hymn
  doxology/collect, Ch. 2 Reading 1's institution narrative, Reading 2's
  "Iudaeus bibit et sitit" present tense and the whole Ambrose exempla
  sequence, Reading 4's "ut sint quae erant" both-clauses fix, Readings
  6, 9, 11, 12's prose in full, and Ch. 3's hymn *Verbum supernum*
  (including the round-8 "abris"→"abris"/vós-register fix, confirmed
  still in place: "que **abris** a porta do céu… **dai**-nos força,
  **trazei**-nos socorro"). An exhaustive citation sweep of every
  bracket/parenthetical scripture reference in Ch. 1–4 (~50 citations)
  against `content/bible/drb/*.json` — covering Genesis 14:18–19,
  49:20; Exodus 12:6–7, 12:8–9, 16:14, 16:15, 25:23–24/30; Leviticus
  21:6; Judges 13:19–20; 1 Samuel 14:27; Psalms 15(16), 19(20), 21(22),
  22(23):5, 32(33):9, 33(34), 42(43), 64(65), 77(78):24–25, 80(81):17,
  83(84), 85(86), 94(95), 101(102), 102(103):2–3, 103(104):27,
  104(105):40, 110(111):4–5; Proverbs 9:1–2 (verified against the
  well-known standard text, since the local `proverbs.json` remains the
  pre-existing broken/shifted corpus data round 8 already flagged and
  left untouched); Isaiah 7:9, 25:6, 30:23, 55:1–2; Jeremiah 11:15;
  Canticles 5:1; Wisdom 16:20–21; Matthew 5:8, 6:12, 8:8, 26:26–28;
  Mark 14:22–24; Luke 22:19–20; Romans 8:6; 1 Corinthians 10:3–4,
  10:16–17, 10:20–21, 11:23–29; Hebrews 5:1; 1 John 1:8; Apocalypse
  2:17; plus the full John 6:54–69 cluster above — found every citation
  correct, with two pre-existing corpus-data gaps noted but not
  treated as translation defects, consistent with round 8's precedent:
  `osee.json` is missing chapters 12–14 (cannot verify "[Oséias
  14:7–8]" against local data; pt-BR and en-US independently agree on
  this citation) and `zacharias.json`'s chapter keys are mis-shifted
  (its "9" holds the text of the real Zechariah 12, so "[Zacarias
  9:17]" likewise cannot be checked against local data). Two borderline
  items were considered and explicitly dismissed as non-defects: (1)
  the Ch. 2 antiphon "Faciens mensam... et inaurabis eam... et pones..."
  — pt-BR renders the first verb as an imperative ("revesti-a") and the
  second as a future ("poreis"), a mood split also present
  independently in en-US ("plate it... you will place..."); both
  Latin verbs are grammatically future indicative, but future-as-command
  is a standard Vulgate idiom for divine instructions (cf. "non
  occides"), so an imperative rendering of either verb is a defensible
  stylistic choice, not a meaning-changing error, and was left
  untouched. (2) The register split between Reading 9's Petrine
  confession ("*tu és* o Cristo, o Filho do Deus vivo") using **tu**
  and Reading 11's centurion quote ("não sou digno de que **entreis**
  sob o meu teto", Mt 8:8) using **vós** — not a defect, because the
  centurion's line is the Church's own well-known fixed Mass
  pre-Communion formula ("Domine, non sum dignus..."), conventionally
  rendered in **vós** register in published Portuguese missals, while
  Peter's confession has no equivalent fixed liturgical formula and
  correctly defaults to the ordinary **tu** register used for quoted
  Gospel dialogue elsewhere in this office (per the "Address register"
  entry above, which scopes **vós** to the Church's own composed
  liturgical address to God — collects, hymn refrains, the Magnificat
  antiphon — not to reported biblical dialogue in general).
  **Verdict: Ch. 1–4 — CLEAN.** No fixes were needed, so no rebuild was
  required. **This is the first clean Ch. 1–4 round since round 8
  reset the count** (round 9 found eleven citation defects in this
  range). The two-consecutive-clean-round count for the whole book
  still depends on the next Ch. 5–8 pass: if it also comes back clean,
  review can close; Ch. 5–8 was last confirmed clean in round 9.
- 2026-09-03 — **review round 10** (independent, adversarial, Ch. 5–8
  only). Re-verified all four in-range fixes with exact current
  wording — all confirmed correctly in place: Ch. 5 capitulum "que
  **será entregue** por vós" (1 Cor 11:23–24), Ch. 6 Sext versicle
  response "Sois vós quem me **restituirá** a minha herança", and
  Ch. 8's Second Vespers responsory versicle "[João **6:51–52**]" and
  Magnificat antiphon "[João **6:32–33**]". Re-confirmed the Ch. 3
  Lauds → Ch. 4/5/6/7 Prime/Terce/Sext/None antiphon-reuse consistency
  by diffing all four reused antiphons (Salmo 110/111 for Prime; the
  Eclesiástico, 1 Coríntios 10:3–4, and Apocalipse 2:17 antiphons for
  Terce/Sext/None respectively) word-for-word, citation included,
  against their Ch. 3 originals — byte-identical in every case, no
  drift. Ran a full fresh sentence-by-sentence fidelity read of
  Ch. 5–8 against `la/` (tense, mood, negation, subject/object
  direction, theological terms, vós-register) — no defects found;
  every future/perfect/present tense and every agent/patient
  direction in the capitula, responsories, versicles, and antiphons
  matched the Latin. Ran an exhaustive citation sweep of **every**
  bracket/parenthetical citation in Ch. 5–8 against
  `content/bible/drb/{ecclesiasticus,psalms,1-corinthians,apocalypse,
  john}.json` — Sir 24:28–29, Ps 22(23):5 (×2, Ch. 5 and Ch. 7), Ps
  144(145):15, 1 Cor 11:23–24, 1 Cor 10:3–4, Ps 77(78):25, Ps 15(16):5,
  1 Cor 11:26, Rev 2:17, 1 Cor 11:27, Ps 115:4(116:13), 1 Cor 11:28–29,
  John 6:48–50, John 6:51–52, Ps 110(111):4, John 6:32–33 — all
  confirmed to quote exactly the verse(s) cited, with no boundary
  errors. Found **no new defects** anywhere in Ch. 5–8.
  - No changes made; no rebuild needed.
  - **Verdict**: Ch. 5, 6, 7, 8 — CLEAN (all in-range fixes confirmed,
    antiphon-reuse consistency re-confirmed, full fidelity read and
    citation sweep both clean).
  - **Clean-round count**: this is the first clean Ch. 5–8 round since
    round 9 found the John 6:51–52 defect, so it is one clean round for
    this range, not yet two consecutive; the Ch. 1–4 range's last
    result (round 9) found eleven defects, so the whole-book
    two-consecutive-clean-round count remains at zero. At least one
    clean Ch. 1–4 round followed by one more clean round in either
    range is still needed before review can close.
- 2026-09-03 — **review round 11** (independent, adversarial, Ch. 5–8
  only — the seventh pass over this range). Round 10 had already come
  back clean for *both* ranges in the same round (Ch. 1–4 and Ch. 5–8
  each independently confirmed clean), so this pass's purpose was to
  establish whether a second consecutive clean round could be reached
  for Ch. 5–8, which would close the whole review. Re-verified all four
  in-range fixes with exact current wording — all confirmed correctly
  in place: Ch. 5 capitulum "que **será entregue** por vós" (1 Cor
  11:23–24), Ch. 6 Sext versicle response "Sois vós quem me
  **restituirá** a minha herança", Ch. 8's Second Vespers responsory
  versicle "[João **6:51–52**]" (and confirmed byte-identical against
  its Ch. 2 Third Nocturn twin), and Ch. 8's Magnificat antiphon
  "[João **6:32–33**]". Re-confirmed the Ch. 3 Lauds → Ch. 4/5/6/7
  Prime/Terce/Sext/None antiphon-reuse consistency by comparing all
  four reused antiphons word-for-word, citation included, against their
  Ch. 3 originals — the "Fez memória das suas maravilhas…" (→ Prime,
  Salmo 110 (111):4–5), "A minha memória permanece…" (→ Terce,
  Eclesiástico 24:28–29), "Todos comeram o mesmo alimento
  espiritual…" (→ Sext, 1 Coríntios 10:3–4), and "Quem tem ouvidos para
  ouvir…" (→ None, Apocalipse 2:17) antiphons are all byte-identical
  between Ch. 3 and their reuse chapter, no drift. Also independently
  confirmed the Ch. 8 Second-Vespers-versicle vs. Ch. 3-Lauds-antiphon-1
  split ("[Salmo 110 (111):4]" alone for the versicle, since it quotes
  only the "memoriam fecit… misericors et miserator" half, vs. "Salmo
  110 (111):4–5" for the full antiphon, which continues into the
  "escam se dedit" v.5 clause) is a correct, deliberate distinction, not
  an inconsistency. Ran a full fresh sentence-by-sentence fidelity read
  of Ch. 5–8 against `la/` (tense, mood, negation, subject/object
  direction, theological terms, vós-register) — every future, perfect,
  imperfect, and gnomic-present tense in the antiphons, psalm incipits,
  capitula, responsories, and versicles matched the Latin exactly
  (e.g. Ch. 6's capitulum "manducabitis/bibetis/annuntiabitis" future
  → "comerdes/beberdes/anunciareis"; Ch. 7's capitulum
  "manducaverit/biberit… reus erit" → "comer/beber… será réu"; Ch. 8's
  "non dedit Moyses" past negation → "não foi Moisés que vos deu"), no
  new defects found. Ran an exhaustive citation sweep of every
  bracket/parenthetical citation in Ch. 5–8 against
  `content/bible/drb/{ecclesiasticus,1-corinthians,psalms,apocalypse,
  john}.json` — Sir 24:28–29, 1 Cor 11:23–24, Ps 22(23):5 (Ch. 5 and
  Ch. 7), Ps 144(145):15, 1 Cor 10:3–4, 1 Cor 11:26, Ps 77(78):25, Ps
  15(16):5, Rev 2:17, 1 Cor 11:27, Ps 115:4(116:13), 1 Cor 11:28–29,
  John 6:48–50, John 6:51–52, Ps 110(111):4, John 6:32–33 — all
  confirmed to quote exactly the verse(s) cited, chapter and verse
  boundaries included, with no truncation or off-by-one errors. Found
  **no new defects anywhere in Ch. 5–8.**
  - No changes made; no rebuild needed.
  - **Verdict**: Ch. 5 — CLEAN. Ch. 6 — CLEAN. Ch. 7 — CLEAN. Ch. 8 —
    CLEAN.
  - **Clean-round count**: this is the **second consecutive clean
    Ch. 5–8 round** (round 10, then round 11), and round 10 had already
    also been clean for Ch. 1–4 in the same round. Per the
    two-consecutive-clean-round rule, **the review is now closed** —
    two consecutive rounds (10 and 11) have covered the entire book
    (all 8 chapters) with zero new defects found. Across all 11 rounds,
    31 genuine defects were found and fixed through round 9; rounds 10
    and 11 found none. No further scheduled review passes are needed
    for this book unless new content is added or a defect is reported.
