# Prayer Memorization

> The prayers you already pray, learned by heart.

Catholics memorized prayers for 1900 years. Memorization was the dominant mode of Catholic prayer until a single generation lost it. This feature is Ember's quiet, daily, content-grounded support for putting the prayers of the corpus back into the bones of the faithful.

It is not "Anki for the soul." Anki is autodidact study; this is *meditatio* — the medieval lectio-divina step of putting the text to memory through repetition until it can pray itself in you when the page is closed. The flashcard mechanics support that goal; they are not the goal.

---

## Pillar fit

The feature is genuinely cross-pillar:

- **Wisdom** — preserves and transmits the prayers themselves; memorization is the oldest delivery mechanism for Catholic tradition.
- **Fidelity** — slots into Plan of Life as a daily practice ("Memory work"), trackable on the Wall like any other.
- **Devotion** — a quiet read-only "prayers known by heart" surface (deferred to v1.1) celebrates progress without gamifying it.

Anchor primarily in **Fidelity** with a **Wisdom** content backbone. Devotion is a later, lightweight surface.

The corpus itself is the strongest justification: every prayer in `content/prayers/*.json` is already a multilingual line-array. The deck exists. The user does not author cards.

---

## Audience

Primary, in order of acuteness of pull:

1. **Converts, reverts, late-bloomers** — they feel the deficit at every Rosary, every Latin Mass; high motivation, immediate value.
2. **Cradle Catholics returning to practice** — they "kind of" know the standards and want to firm them up, often adding Latin.
3. **Devout daily-prayer Catholics** — they know the canonical prayers; their pull is for deeper repertoire (long psalms, hymns, lesser-known prayers) and for keeping memorized prayers fresh.

Deferred:

- **Beginners pre-conversion** — no pinned practices yet to feed the deck; shape with onboarding work, not within memorization v1.
- **Parents catechizing kids** — fundamentally different UX (parent-led, audio-first, large fonts); a v3+ concern.

---

## Jobs to be done

Four distinct jobs hide under "memorization":

| Job | Description | Addressed by |
|---|---|---|
| **Acquisition** | I don't know it; teach me. | v1 — Cued mode, line-by-line growth |
| **Maintenance** | I knew it; keep it from slipping. | v1 — Cold mode + SM-2 intervals |
| **Performance** | I can recite alone, but I freeze leading the Rosary publicly. | Partly — Cold mode tests cold initiation |
| **Internalization** | I want this prayer to pray itself in me. | The spiritual goal SR supports but doesn't deliver — informs tone, not mechanics |

---

## Product principles

These are the hard rails. The feature ships dead before any of these are violated.

1. **No XP, no streaks, no leaderboards, no celebratory animations.** Memorization is the easiest place in the app to slip into Duolingo-mode. Resist.
2. **Reverent UI defaults.** No skip-fast button, no aggressive timers, no mascot. Generous whitespace. Closer to lectio than to flashcards.
3. **Honest framing.** Reviewing a flashcard is not praying. Memory work is its own distinct practice — *meditatio*, formation. Closing copy says "well learned," not "well prayed." Memory work fills only its own Wall cell — never the Wall cell of the prayer being studied.
4. **The corpus is the deck. The user does not author cards.** v1, v2, v3.
5. **Honor-system review with light forgiveness.** Self-rating is unreliable; Catholic users skew scrupulous. The signal is "tap the last line you got" — concrete, low scrupulosity tax. Lenient on near-misses.
6. **Cap the daily queue.** ~10 cards/day, allocated 80/20 review-to-new (per the Hafiz tradition). Excess defers quietly to tomorrow. Never a guilt-trip "47 due."

---

## The card model

### Single state per card

One row per `(prayer_id, language, portion_index)`. The state is one number plus standard SR fields:

- `mastery` — the furthest line within the portion the user has correctly recited so far. Grows or regresses based on test outcomes.
- `interval_days`, `ease`, `due_at`, `last_seen_at` — standard SM-2 fields.

`portion_index` is `0` for prayers that aren't broken into portions (the entire prayer is one portion). For long prayers with `memorize.portions` defined, there is one row per portion per language.

### Three test modes

The same card surfaces in one of three modes per review, picked by the mode selector:

**Cued.** Body of the portion visible up through line `mastery`; line `mastery + 1` hidden. The user recites that next line internally; tap to reveal.
- Outcome: two buttons — *Got it* (mastery advances by 1, modest interval) or *Missed it* (mastery unchanged, short interval).

**Letters.** First-letter notation of the entire portion is visible (every word reduced to its first letter, punctuation preserved). Title visible. The user recites the full portion internally; tap to reveal the full text.
- Outcome: tap the last line they correctly recited. That tapped line `K` becomes the new mastery (can grow or shrink). Tapping nothing = "couldn't get past the cue" — mastery floors at 1 (don't punish a single bad day with a full reset).

Example for Sub Tuum:
```
Sub Tuum Praesidium

S t p c,
S D G.
N d n d i n,
s a p c l n s, V g e b.
```

**Cold.** Title only, body fully hidden. The user recites the full portion internally; tap to reveal.
- Outcome: same tap-the-last-line signal as Letters.

### Mode selection — interweaved, not staged

Modes are not sequential phases. They mix from early on:

- `mastery < 2`: Cued only — the user needs a foothold before Letters or Cold are meaningful.
- `mastery in [2, total_lines)`: alternate Cued and Letters. Cued targets the next-unknown line; Letters tests cumulative recall under a reduced cue.
- `mastery = total_lines`: alternate Letters and Cold for ~2 successful exposures, then Cold becomes the dominant mode and SM-2 intervals start growing.
- A regression in Cold (tapping K < total_lines) drops the card back into the Letters/Cued mix automatically — no special "demotion" logic, the mastery score does the work.

For v1, **strict alternation** between Cued and Letters in the middle range is sufficient. Probabilistic weighting is a v1.1 refinement.

### Why three modes, not two

Cued tests *continuation under cue* — given prior context, can you produce the next line. Letters tests *recall with a structural skeleton* — can you reconstruct the exact words from a thin prompt. Cold tests *cold initiation* — can you produce the prayer from nothing but its name. These are different cognitive tasks, and a user who can do one cannot necessarily do the others. Without intermediate modes, the cliff between cued continuation and cold initiation is too steep, especially for prayers above 5–6 lines.

The first-letter notation (Letters mode) is the smooth gradient between full-text scaffolding and no scaffolding. It scales linearly to any length: Sub Tuum's 4 lines and Psalm 50's 20 verses both reduce to a manageable letter map.

---

## Long content — portions

### The problem

Linear line-by-line memorization works for prayers up to ~12-15 lines (the canonical Catholic memorization curriculum: Pater, Ave, Credo, Memorare, Anima Christi, Salve Regina, Suscipe, Sub Tuum, Beatitudes, Act of Contrition, etc.). Above that, the model collapses: 20 days of Cued grinding to acquire a psalm; Letters and Cold modes asking for impossibly long uncued recall; a single "tap the last line" can't represent the multi-stumble pattern of a 20-verse recitation.

### The solution — portions

Long prayers are broken into author-marked **portions** (3–7 lines each). Each portion is its own card and is learned independently using the exact same Cued/Letters/Cold model. Mastery is per-portion. The user makes incremental progress one portion at a time, which matches both monastic tradition (memorize-by-stanza) and the Hafiz tradition (one page at a time).

Once all portions reach Cold mastery, **bridging cards** unlock — testing transitions between portions (last line of N → first line of N+1). Bridging is **deferred to v1.1**; v1 ships portion-mastered prayers as a series of independently-learned chunks.

### The complementary path for psalms

For long prayers — psalms especially — the monastic tradition memorized through *daily liturgical use*, not flashcard study. The Office was the spaced repetition. The flashcard surface alone cannot match this; it works best as a complement.

When a user opts a long prayer into the deck for the first time, a one-time bottom sheet says:

> *Psalms are deep waters. Memorizing a psalm by flashcard alone is slow; the traditional path is to pray it daily until it becomes familiar. Would you like to add this prayer to your Plan of Life as well?*

Tapping yes adds the prayer as a Plan of Life slot (independent of Memory Work). Tapping no proceeds with flashcards only. We are honest that the flashcards alone are not the whole story.

This is a single bottom sheet, not a separate UI. The `/memorize` surface itself is unified for all content.

---

## Content schema

A new optional field on prayer JSONs at `content/prayers/<id>.json`:

```json
{
  "title": { ... },
  "body": [ ... ],
  "memorize": {
    "eligible": true,
    "portions": [
      { "lines": [1, 4] },
      { "lines": [5, 7], "label": { "en-US": "I know my iniquity" } },
      { "lines": [8, 13] },
      { "lines": [14, 18] },
      { "lines": [19, 20] }
    ]
  }
}
```

Field semantics:

- **Field omitted entirely** — default. The prayer is eligible, treated as a single portion (the whole prayer is one card per language). All current corpus prayers behave this way without modification.
- **`memorize.eligible: false`** — the prayer is not memorizable. Tapping "Learn by heart" shows a soft message ("This prayer is best learned through daily praying") and offers to add it to Plan of Life. Use this for content that is too long, too situational, or too tradition-bound for flashcard memorization (e.g. very long hymns, situational prayers).
- **`memorize.portions: [...]`** — the prayer is split into portions. Each `portions[i].lines` is a `[startLine, endLine]` 1-indexed inclusive range over `body` after split-on-`\n`. Optional `label` is shown in the UI ("Learning portion 2: 'I know my iniquity'"). Lines must cover the full body without gaps.

### Lines come from the body string

Default line splitting: `body[].inline[lang].split('\n').filter(nonEmpty)`. The existing corpus already uses `\n` between lines. For prayers where the default split is wrong (e.g. multi-paragraph prose where `\n\n` would be more meaningful), authors can address this case by setting `memorize.portions` explicitly — there is no separate "line override" mechanism.

### Each language is independent

A user memorizing the Pater in Latin and English is two distinct memory tasks; they progress at different rates. Schema reflects this — one card per `(prayer_id, language, portion_index)`. No "this prayer is mastered" signal that crosses languages.

### Canonical authoring set for v1

- **Short, no portions needed (~10 prayers):** Sign of the Cross, Glory Be, Pater Noster, Ave Maria, Apostles' Creed, Memorare, Anima Christi, Salve Regina, Suscipe, Sub Tuum Praesidium, Act of Contrition, Angel of God.
- **Long, portions authored (~5-8 prayers):** Te Deum, Magnificat, Benedictus, Beatitudes, possibly Psalm 50 (Miserere) and Psalm 22 (Dominus regit me).

Portion authoring is content work, not engineering. A separate content task tracks the v1 set.

---

## Daily queue — 80/20

The Hafiz tradition (the most refined long-text memorization practice in the world) is unanimous: 80% of daily memorization time is review of older material, 20% is new content. v1 follows this:

- Default daily cap: **10 cards** (configurable).
- Allocation: **8 review cards + 2 new cards**.
- "New" = a card whose mastery is `0` — the user has never recalled any line of this portion.
- "Review" = mastery > 0; existing mastery of any depth.
- New cards are introduced from prayers the user has opted in but not yet started, in the order they were opted in. (No surprise additions, no system-driven discovery.)
- Review cards are picked by `due_at`, oldest first.
- If review queue is empty (no cards due today), the cap relaxes — up to all available new cards may be introduced.
- If the day's allocation is exceeded, overflow defers quietly to tomorrow. **No "47 cards due" alarm copy.**

---

## Surfaces and user journeys

### `/memorize` (new)

Single-purpose daily review screen. Cards in, cards out. Modes (Cued / Letters / Cold) handled per card. Quiet closing screen at end-of-session.

### Prayer detail (existing)

A subtle "Learn by heart" entry point appears below the prayer body for any prayer where `memorize.eligible !== false`. If the prayer is already in the deck, the entry shows status: *Learning* (any mastery > 0 in any portion), *Remembering* (all portions at Cold mastery, currently in maintenance).

### Practice detail (existing)

For practices that contain multiple memorizable prayers, a single "Learn the prayers of this practice" affordance opens a sheet listing the practice's prayers with per-prayer opt-in toggles.

### Plan of Life (existing)

Memory Work is a slottable practice with its own schedule. Default tier: **Extra**. Users may promote to Ideal or Essential. The Wall cell for Memory Work fills when the user completes any review session that day. Completing a review of the Hail Mary does NOT fill the Hail Mary's Wall cell.

### "Prayers known by heart" devotion scroll (deferred to v1.1)

A read-only illuminated scroll listing prayers the user has reached Cold mastery on, with the date learned. No progress bars, no comparisons, no exports. A quiet record of formation.

### First-time opt-in flow

1. User on prayer detail taps "Learn by heart."
2. Bottom sheet: language picker (EN / PT-BR / Latin / multiple). Brief description: *"A few minutes a day. We'll show you a line, you recall it, mark how it went."*
3. Tap confirm. If first-ever opt-in, silently create the Memory Work slot in Plan of Life (Extra tier).
4. Show the post-opt-in sheet: *"Make memory work part of your daily Plan of Life?"* (defaults yes; user can decline or change tier). For long prayers, this sheet also includes the psalms-are-deep-waters nudge with an "Add this prayer to my Plan of Life" affordance.
5. Begin the first review session.

### Subsequent opt-ins

Steps 1–2 only. No re-prompt about Plan of Life. No bottom sheet for short prayers; just a confirmation toast.

### Daily flow

User opens Plan of Life → sees Memory Work checkbox → tap navigates to `/memorize` → review session → checkbox auto-checks on completion. Or user navigates to `/memorize` directly via the home shortcut.

### Lapsed user

Returning after multiple days away: the queue rebalances quietly — review cards deferred during absence are not piled into a single oversized queue. The day's allocation honors the cap. Copy: *"Welcome back. Let's start gently — three today."* No guilt copy, no "you missed N days" counter.

---

## Persistence

The data model fits one new logical entity. Implementation choice (new SQLite table vs. preferences-store JSON) is deferred to implementation time per the project's "lightweight changes only" policy.

Logical schema:

```
memorization_state:
  prayer_id          text     (catalog id, e.g. "prayer/our-father")
  language           text     ("en-US" | "pt-BR" | "la")
  portion_index      integer  (0 for whole-prayer; 1+ for portioned content)
  mastery            integer  (0..total_lines)
  total_lines        integer  (cached portion line count)
  interval_days      real     (SM-2 interval)
  ease               real     (SM-2 ease, default 2.5)
  due_at             text     (ISO date)
  last_seen_at       text     (ISO datetime, nullable)
  created_at         text     (ISO datetime)
  PRIMARY KEY (prayer_id, language, portion_index)
```

Volume estimate: even an aggressive user with 30 prayers × 3 languages × avg 1.5 portions = ~135 rows. Trivially small.

The Memory Work practice slot itself is a normal `user_practice_slots` row pointing at a built-in `practice/memory-work` manifest. No special-casing.

---

## Tone and copy

### Allowed

- *Memory work*, *committing to memory*, *learning by heart*
- *Well learned*, *the prayer is taking root*, *known by heart*
- *Today's practice*, *today's review*
- Quotes from saints on memorization (sparingly; rotated; Augustine, Hugh of St. Victor, Therese)

### Banned

- *Streak*, *XP*, *level*, *score*, *points*, *mastered* (as achievement)
- *Practiced*, *prayed*, *completed* (when referring to flashcard reviews — these conflate memory work with prayer)
- Celebratory animations, confetti, badges
- "N due!" alarm copy. Numbers exist but are quiet.
- "You missed N days." No guilt language for absence.

### End-of-session

Single short line, rotated. Examples:
- *"Well learned. Until tomorrow."*
- *"The prayer is taking root."*
- *"St. Augustine memorized the entire psalter. You are taking one step closer."*
- *"Done for today."*

---

## Algorithm details (implementation-bound, named here for the spec)

- **Algorithm:** SM-2 with lenient defaults.
- **Initial interval:** 1 day on first Got it / clean Letters tap.
- **Ease:** start at 2.5, bounded `[1.3, 3.0]`. Missed it / regression in Letters reduces ease by 0.2; Got it leaves ease unchanged; reaching Cold for the first time bumps ease by 0.15.
- **No leech suspension.** A card that is repeatedly missed surfaces a one-time prompt to consider adding the prayer to the user's Plan of Life as a real prayer slot. Failure becomes formation, not punishment.
- **Forgiveness on missed days.** Multi-day absence does not pile reviews into a single session; the daily cap is honored.

---

## Phasing

### v1 — ship target

- Three modes: Cued / Letters / Cold
- Single mastery score, tap-the-last-line signal, two-button Cued
- EN, PT-BR, Latin from launch (no audio)
- Short prayers (no portions) and long prayers (with author-marked portions) — both via the same surface
- `memorize` field on prayer JSONs (`eligible`, `portions`)
- `/memorize` screen
- "Learn by heart" entry point on prayer detail
- First-time opt-in flow + Memory Work POL slot auto-creation + long-prayer nudge sheet
- 80/20 daily queue allocation, ~10 card cap
- SM-2 with lenient defaults, no leech suspension
- Reverent end-of-session copy
- Canonical content set authored: ~12 short prayers eligible; ~5–8 long prayers with portions

### v1.1

- Bridging cards for portion transitions on long prayers
- "Prayers known by heart" devotion scroll (read-only)
- Liturgical-season-aware recommendations (Stabat Mater in Lent, Veni Creator at Pentecost, etc.)
- Probabilistic weighting in mode selection (replacing strict alternation)
- Pyramid review tiers (yesterday / this week / older) — refinement over flat SM-2

### v2

- **Audio.** Recorded ecclesiastical-Latin pronunciation for the canonical 8 prayers (Pater, Ave, Credo, Salve, Anima Christi, Memorare, Suscipe, Sub Tuum). Played as preview in opt-in flow; available as a re-listen on any review.
- Recognition / follow-along mode for long prayers — distinct from production mode, supports the "I want to pray along with the Office" use case.
- Optional active-recall mode (typed or spoken) for users who want it.
- Scripture memorization as a deliberate adjacent product, not bolted onto prayer memorization.

### v3+

- Kid mode (parent-led, audio-mandatory, large fonts, parental milestone framing)
- Book-quote memorization (after a highlight feature lands in the book reader)
- Multi-modal recall (typing the first letter as you recite, recording yourself)

---

## Anti-patterns explicitly out of scope

- User-authored cards
- Card decks shared between users
- Public stats, leaderboards, social comparisons
- Achievements, badges, trophies, levels
- Streak counters as a primary surface
- Confetti, celebratory animations, mascots
- Memory palace / method of loci helpers (powerful but require user-side mental construction the app cannot automate well)
- Auto-feeding the deck from pinned practices without explicit per-prayer opt-in
- Treating a flashcard review as having prayed the prayer

---

## Open questions

These will be resolved during implementation; flagged here so they don't get lost.

1. **Letters notation rendering.** How do we treat punctuation, apostrophes, hyphens, contractions ("don't" → "d't"? "d"?). Latin has fewer edge cases than English; PT-BR needs clarification on contractions ("d'agua"). Likely answer: preserve apostrophes within words, emit just the leading letter. Decide in implementation.
2. **Capitalization in Letters mode.** Match the original word's capitalization (matches Bible Memory app convention), or always uppercase. Likely the former — proper nouns retain their capital, regular words lower. Confirm during build.
3. **Mode selection weighting.** v1 uses strict alternation between Cued and Letters in the middle range. v1.1 may shift to probabilistic weighting based on `mastery / total_lines`. Track impact through real use before tuning.
4. **Letters at very low mastery.** Currently Letters mode unlocks at mastery ≥ 2. For short prayers (e.g. 4-line Sub Tuum) this means Letters appears immediately; for long portions it stays Cued for longer. Probably fine; revisit if user testing shows the threshold needs adjusting per prayer length.
5. **Practice manifest for Memory Work.** Memory Work is a built-in practice — the manifest needs authoring (`practice/memory-work`). Defaults: Extra tier, daily schedule, flexible time block. Practice flow: a single section that links to `/memorize`.
6. **Long-prayer nudge as a setting.** Whether the psalms-are-deep-waters bottom sheet can be permanently dismissed or appears every long-prayer opt-in. Lean toward "shown once per session, then suppressed for that session" — but defer.

---

## References

- `docs/README.md` — mission and pillars
- `docs/features/features-overview.md` — Plan of Life, tiers, Wall semantics
- `docs/ARCHITECTURE.md` — corpus model, prayer JSON shape
- `docs/CONVENTIONS.md` — code style
- `docs/journal.md` — "windows, not trophies" framing precedent (saints cards)

External research informing this spec:

- Roediger & Karpicke, "The Power of Testing Memory" — testing effect for prose retention
- Miller (1956), "The Magical Number Seven" — chunking foundation
- Hafiz tradition — Fifty Method, 80/20 review-to-new ratio, pyramid review
- Christian monastic tradition — *meditatio*, *ruminatio*, psalter memorization through liturgical use
- First-letter method — Bible Memory and similar apps; the smooth cue gradient between full text and title-only
- Accumulative method (poetry) — line 1 → 1+2 → 1+2+3, stanza by stanza, with overlap
