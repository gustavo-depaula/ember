# Catechetical Improvement Adventure — Journal

A working log of an autonomous catechetical content improvement session.
Keeps track of what was found, what was changed, and why.

---

## Mission

Improve the catechetical formation content in Ember:
- The 90-session **Catechetical Formation** book (curated daily formation track)
- **Aquinas's Catechetical Instructions** (1273 Naples sermons, 1939 trans.)
- **Catechism of St. Pius X** (1912)
- **Roman Catechism of Trent** (1566)
- The daily **Catechetical Formation practice** that ties them together

Free to be bold: editorial content, reformatting, new commentary from saints,
importing entire new books via the import-book skill. The goal is depth of
formation for the laity — not preserving the status-quo of generated artifacts.

## Snapshot of starting state

Sourced from a thorough Explore audit on 2026-04-27.

| Library | Files | Languages | Format | Notes |
|---|---|---|---|---|
| catechetical-formation | 280 | en-US, pt-BR | 90 markdown sessions + images | The curated daily track |
| catechetical-instructions | 82 | en-US, pt-BR | 42 chapters | Aquinas Naples sermons (Collins 1939) |
| catechism-pius-x-1912 | 65 | it, pt-BR, en-US | 21–22 chapters | 433 Q&A |
| catechism-of-trent | 85 | en-US, pt-BR | 42 chapters | Roman Catechism (McHugh-Callan 1923 EN; Pires Martins 1951 PT) |

All public domain. ~42.8 MB on disk.

## Working principle

- **Atomic commits** with descriptive messages.
- **Editorial freedom**: I can author bridge text, modernize phrasing, add
  saint-quote pull-outs, reorganize for the lay reader. No need to preserve
  generation scripts as the source of truth.
- **Subagents** parallelize research and audits to keep main context lean.
- **Bias toward saint commentary** geared to lay formation — not academic
  apparatus.

---

## Log

### 2026-04-27 — Phase 1: orphan-H2 fix, editorial layer, Virtues cluster

**Architecture I had to learn (the hard way):**

The 90-session catechetical-formation book is **generated**, not
hand-authored. The build pipeline is:

  sessions.json (structural spine: Pius X Q ranges, Aquinas + Trent refs)
  + content.json (per-session ekphrasis, scripture, closing reflection)
  + source books (catechism-pius-x-1912, catechetical-instructions, catechism-of-trent)
  → build.py → en-US/session-NNN.md, pt-BR/session-NNN.md, book.json

I spent the first hour writing pastoral commentary directly into the
`session-NNN.md` files. Those edits would have been silently overwritten
the next time anyone ran build.py. Worse, I labelled my prose under
"## St. Thomas teaches" — the same heading the build uses for verbatim
excerpts of Aquinas's Catechetical Instructions. That is misattribution.

I reset four commits and re-did the work properly.

**The slicing bug (real, latent in source for some time):**

`extract_pius_x_range` in build.py walked Q-by-Q, capturing every line
whose preceding `**N.**` marker was inside the requested range. Pius X
source chapters carry section markers like `## § 2. Hope - Charity`
placed *before* the first Q of the next subsection. When the previous
Q was the last in the requested slice, the orphan header rode along at
the tail. Visible on the rendered page as a subheading announcing
content that lived in tomorrow's session.

Fix: after the existing trailing-blank trim, also strip a single
trailing H2 + surrounding blanks. Internal H2 headings are preserved.
Affects exactly two sessions in the current corpus (055 and 036).
Commit: `68a2dbf`.

**The editorial layer:**

To avoid mislabelling original prose as verbatim Aquinas, build.py
gained a new optional section labelled "## A pastoral reading"
("## Uma leitura pastoral" in PT). It reads from a new
`editorial/<lang>/<session_id>.md` overlay file — plain markdown so
prose stays diffable and readable. Renders after the verbatim
Aquinas/Trent section, before the Scripture cap. The book.json source
description was rewritten to spell out which H2 labels carry verbatim
text and which carry editorial. Commits: `bacdd87` (infra), `45406a7`
(file-overlay path + Virtues cluster authoring).

**Aquinas Scripture citations modernized (en-US):**

The 1939 Collins translation carried 1939-era Anglo-Catholic style —
Douay book names + Roman numerals — across 882 citations
(`Osee, ii.20`, `I Cor., vii. 4`, `Apoc., xxi. 1`, `Ecclus., iii. 25`,
`Ps. cxviii. 66`). The pt-BR sibling was already modern. A one-shot
idempotent script at `scripts/modernize-aquinas-citations.py`
(authored by a parallel subagent) rewrites them all to the modern form
(`Hosea 2:20`, `1 Corinthians 7:4`, `Revelation 21:1`, `Sirach 3:25`,
`Psalm 118:66`). Disambiguates I/II Kings vs. III/IV Kings, Esdras,
Maccabees. Skips non-Biblical refs (Sent., Summa Theol., loc. cit.,
Roman Catechism Pt./Ch.) via a NON_BIBLICAL_BOOKS list and a
saint-name lookbehind. Idempotent: a second run is a no-op. Commit:
`13ddc12` (modernization), `8b0f86a` (propagation rebuild).

**Authored editorial readings for the Virtues cluster (sessions 055–058):**

Sessions 055–058 had no pastoral teacher (Aquinas's Naples sermons
don't address the theological virtues / cardinal virtues / capital
vices in their own right; Trent wasn't mapped for this range). The
sessions previously rendered as Pius X Q&A → Scripture → closing
reflection — formation skeleton with no flesh.

Authored ≈300-word readings (EN + PT each) that:
  * 055 — virtue as *habitus*, theological virtues as infused, faith
    as the door (with the Aquinas marriage/eternal-life-now framing
    from his Catechetical Instructions on faith)
  * 056 — hope vs. optimism (Aquinas's twofold object: eternal
    beatitude + divine help); charity as friendship with God grounded
    on John 15:15 (Summa II-II Q23 a1); charity as form of the other
    virtues (Q23 a8)
  * 057 — *cardo* etymology; the four powers Aquinas says each cardinal
    virtue perfects (practical reason / will / irascible appetite /
    concupiscible appetite); operational questions; Christ as exemplar
  * 058 — Aquinas against the stoics (Christ had passions); seven
    capital vices as counterfeits of corresponding virtues; the
    Beatitudes as the kingdom's program

All quotes from saints are inline-attributed and visually demarcated
(blockquotes). The H2 label "A pastoral reading" itself signals
editorial-vs-verbatim provenance. Commit: `45406a7`.

### 2026-04-27 — Phase 2: more editorial readings, Aquinas formatting, Liguori integration

**More editorial readings for thin or context-needy sessions:**

  * **053 — Church Precepts I (Mass + Friday).** The precepts as
    *the floor* of practicing Catholicism, not extra weight; Aquinas's
    defense of authority via "He who hears you hears me"; the *why*
    of Sunday Mass and Friday abstinence. Commit: `fef85ac`.
  * **054 — Church Precepts II.** Fasting as the body learning to
    obey something greater than its hunger; Aquinas's threefold reason
    (reparation, discipline, lifting the mind to prayer); "at least"
    in the yearly precept; offering as participation in the Body.
    Commit: `fef85ac`.
  * **002 — Heaven/Hell/Trinity/Incarnation.** Reading the catechism's
    pivot at Q19 from heaven/hell to the Trinity — we are not made
    for moral observance but for the inner life of God Himself.
    Aquinas's *opus admirabile*. Commit: `a6a337e`.
  * **046 — Suicide and Dueling.** Surface the Church's pastoral
    tenderness underneath an old penalty — pt-BR includes the
    Brazilian CVV (188) suicide-prevention hotline. Commit: `cd6c00d`.
  * **075 — Penance / Satisfaction / Indulgences.** The shame that
    helps vs. the shame that hides; satisfaction as the soft tissue
    healing after the wound is closed; indulgences re-framed as
    healing aid drawing on Christ's and the saints' merits.
    Commit: `cd6c00d`.
  * **080 — Marriage Duties.** Reframes Trent's "subjection" with
    Eph 5:21 (mutual submission); spouses as ministers of the
    sacrament to each other. Commit: `cd6c00d`.
  * **090 — Hail Mary.** Brings St. Alphonsus Liguori's *Glories of
    Mary* (already in this repo) into the closing day with a quoted
    St. Bernard passage on Mary's intercession. Closes with a
    benediction to the reader who has walked the full ninety-day
    arc. Commit: `292e883`.
  * **028 — Communion of Saints.** Frames Pius X's 1912 list (which
    includes "Jews", "Muslims", "heretics") with the Second Vatican
    Council's pastoral language: full vs. imperfect communion
    (LG 16); Jewish people as elder brothers (Nostra Aetate 4).
    Closes with Liguori on Mary's mercy reaching every living
    person. Commit: `6b6ec3c`.
  * **066 — Eucharist intro.** Aquinas's *Adoro Te Devote* with the
    word *latens* (hidden) as the heart of Real Presence: the
    failure in the Eucharist is human seeing, not the Presence.
    Vatican II's *fons et culmen* alongside Aquinas's *consummatio*.
    Commit: `78e2600`.
  * **035 — Decalogue intro.** The Ten as the *geometry of love* —
    three toward God, seven toward neighbor, hung on Christ's double
    command of charity. Pushes back on "isn't this just rules?".
    Highlights Pius X Q165 (every commandment *can* be observed by
    grace) as the key sentence. Orients the reader for the next
    eighteen sessions. Commit: `65301c9`.

**Aquinas Catechetical Instructions formatting:**

  * Added a new lay-reader **introduction chapter** before the
    Translator's Preface — orients new readers (Aquinas's last
    sermons, preached to ordinary working people in 1273), reframes
    Aquinas as defender of the *vetula*'s faith rather than a
    forbidding scholastic, sets reading-pace expectations, names
    what we changed (citations modernized; section headings added)
    and what we preserved (footnote apparatus, Collins's prose).
    Signed "The Ember editors". Commit: `0cf7e8a`.
  * Added internal **H2/H3 sub-structure** to four dense chapters via
    a parallel sub-agent: `creed-00-what-is-faith` (4 H2),
    `creed-11-resurrection-of-body` (8 H3 from inline (a)/(b)/(c)/(d)
    labels), `hail-mary` (5 H2 along the natural seams of the prayer),
    `lords-prayer-00-five-qualities` (1 H2 + 5 H3). Both languages,
    semantically matched. Commit: `13b8e33`.

**Running tally — 14 sessions now carry editorial readings:**
  001 (verbatim Aquinas already strong) · **002** · **028** · **035** ·
  **046** · **053** · **054** · **055** · **056** · **057** · **058** ·
  **066** · **075** · **080** · **090**.

  ~5,000 words of new pastoral commentary per language.

### 2026-04-27 — Phase 3: more editorial readings on the sacraments

Authored editorial readings for six more sessions, mostly across the
Sacraments arc:

  * **003 — Apostles' Creed intro.** Reframes the next thirty-two
    sessions as walking *through* a deposit of faith handed to the
    reader, not a quiz. Aquinas on knowing vs. believing; Pius X's
    definition of mystery (above reason, not against it). Closes:
    *the Christian life begins not when you decide what is true,
    but when what is true decides you*. Commit: `b905f7b`.
  * **062 — Baptism.** Most adults slept through their Baptism;
    recovers the day with adult mind. The three things that
    happened (original sin washed, sanctifying grace infused,
    indelible character imprinted); defends infant Baptism as the
    free gift of the entire dispensation; Pius X's clear teaching
    that anyone may baptize in necessity (with the practical:
    children are alive in heaven now because of this). Lands on
    renewing baptismal promises today as adult assent. Commit:
    `3259ce0`.
  * **064 — Confirmation.** Names what most adult Catholics actually
    remember of their Confirmation (a parish hall at fourteen;
    grandma's tears) and reframes Pius X's *soldier of Christ* as
    the sacrament of the transition where Christian life stops being
    given to you and starts being defended by you. Aquinas on
    indelible character; the seven gifts of the Holy Spirit; closes
    with 2 Tim 1:6 (*stir up the gift of God which is in thee*) as
    the Church's standing renewal-of-grace text. Commit: `eaf365c`.
  * **066 — Eucharist intro.** Aquinas's *Adoro Te Devote* — the
    word *latens* (hidden) at the heart of the Real Presence — and
    Vatican II's *fons et culmen* alongside Aquinas's *consummatio*.
    Closes: *receive Him as if for the first time. He gives Himself
    as if for the first time, every time*. Commit: `78e2600`.
  * **069 — Daily Communion.** The Pope who wrote the catechism
    above (Pius X) was the modern era's greatest advocate of daily
    Communion. *Sacra Tridentina Synodus* (1905) and *Quam Singulari*
    (1910) are named; Jansenism's long shadow on the fear of
    unworthiness; *Domine, non sum dignus* read as doctrine, not
    rhetorical apology. Lands: daily Communion is for the dependent,
    not the holy. Commit: `b905f7b`.
  * **071 — Mass as Sacrifice.** The most contested Catholic sentence:
    *the same sacrifice as Calvary*. Aquinas's distinction between
    sacrifice itself and manner of offering (bloody on Calvary,
    unbloody on the altar); the four ends of Mass (adoration,
    thanksgiving, propitiation, impetration); Pius X's three hinges
    of fitting assistance (offer with the priest, recall the Passion,
    receive Communion). Commit: `b6a8a20`.
  * **077 — Anointing of the Sick.** Corrects the widespread
    "last rites" misunderstanding. Pius X's own phrase ("when the
    illness is dangerous") — not just the dying hour — and the
    post-Vatican-II rename. Grounds in James 5:14-15 (prayer,
    anointing, forgiveness, plus Pius X's fourth element of bodily
    healing if it serves the soul). Highlights the gentle teaching
    that even mortal sins are forgiven through the sacrament when
    the only-attrite sick person can no longer confess. Issues the
    pastoral imperative: call the priest *early*. Commit: `93cbee8`.

  * **035 — Decalogue intro.** The Ten as the *geometry of love* —
    three toward God, seven toward neighbor, hung on Christ's double
    command of charity. Pushes back on "isn't this just rules?".
    Highlights Pius X Q165 as the key sentence (every commandment
    *can* be observed by grace). Commit: `65301c9`.

**Running tally — 20 of 90 sessions now carry editorial readings:**

  002 · 003 · 028 · 035 · 046 · 053 · 054 · 055 · 056 · 057 · 058 ·
  062 · 064 · 066 · 069 · 071 · 075 · 077 · 080 · 090

  ≈8,000 words of new pastoral commentary per language. All quotes
  from saints inline-attributed and visually demarcated. The H2 label
  *A pastoral reading* itself signals editorial-vs-verbatim provenance.

**What I considered but did not do:**

  * Importing *The Imitation of Christ* via `/import-book`. The skill
    pipeline is multi-step (download → structure → split → hand-clean
    × N chapters in parallel sub-agents) and would take an evening
    of its own. I judged authoring more editorials inside the existing
    formation book higher value per minute. Queued for a future
    session.
  * Reordering the 90 sessions. The traditional catechetical order
    (Creed → Decalogue → Precepts → Virtues → Sacraments → Prayer)
    has 500 years of pedagogical wisdom behind it; reordering it
    would gain creative freshness at the cost of doctrinal coherence.
    I declined.
  * Reordering Session 090's footnote block (which currently sits
    between Aquinas's Hail Mary teaching and the Scripture cap).
    Markdown renderers typically display footnotes at the document
    end regardless of source position; not a visual bug for app users.

**What's queued for next session:**

  * `/import-book` for *The Imitation of Christ* (Thomas à Kempis)
    — flagged in PIPELINE.md as Tier-1.
  * Editorial readings for sessions 015 (Incarnation), 020 (Final
    Judgment), 022 (Resurrection of the body), and the Lord's Prayer
    petitions (082-089).
  * Editorial readings for the particular commandments where the
    1912 Pius X language is most jarring to modern readers (sessions
    045-052).


