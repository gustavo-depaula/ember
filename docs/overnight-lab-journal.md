# Overnight Lab Journal

Autonomous overnight session. Each entry records: what I picked, why, what I did, what I learned, and what broke.

Entries newest-first.

---

## Session start — 2026-04-17 (late)

Surveyed: `docs/README.md`, `docs/journal.md`, open GitHub issues (22 total), existing content libraries, tracks. Set up task tracking and this journal.

Strategy: mix content additions (fits well-established patterns, low risk, high visibility) with targeted bug fixes (#152, #130) and a polish pass. Content additions first — they're the clearest gift since they multiply the app's value without touching engine code.

User course-corrected early: **no big import/translation projects — they consume too many tokens**. Pivoting to bug fixes, polish, and small code-only improvements that move fast and don't require producing large amounts of EN+PT-BR content.

Revised queue:

1. **#130 Copy text** — probably a one-line userSelect / long-press fix.
2. **#152 Archive/re-add bug** — reproduce, fix.
3. **#142 Tamagui nested Text fontWeight/fontStyle** — font resolution bug.
4. **#133 Error handling** — surface swallowed errors, focus on high-traffic paths.
5. **Accessibility / a11y pass** — a11y labels, roles, screen-reader fixes.
6. **Empty states + offline banners polish** — thin slices of #33/#34.
7. **#140 Better "restart novena" UX** — small screen addition.

Ground rules also updated: delegate context-heavy research to sub-agents so the orchestrator context stays focused.

---

## Iteration 1 — Fix #130: Can't copy prayer text (commit 802cdab)

Root cause: `BilingualBlock`'s `TapToSwitch` wrapped the whole text body in a `Pressable` that toggled languages on press. Any long-press attempt to start a selection was intercepted, so copy was impossible and users got an unexpected language switch instead.

Fix: replaced the body-wide Pressable with a small top-right language-label pill — reuses the existing muted heading-font styling from the `secondaryMissing` indicator already in the component. Pill shows the target language ("EN"/"PT"/"LA") so users know what they'll switch to. Prayer text is now plain, selectable, and copyable.

Verified: biome clean, no new diagnostics, pre-existing test failures (missing pt-BR keys for three practices) confirmed to also fail on main — unrelated.

Learned: small-pill language toggles are already an established pattern in this file. When I added mine I naturally converged on the same look, which is a signal the codebase is internally consistent.

Side-note for later: `BilingualText` in `packages/content-engine/src/types.ts` has no per-side language info. If we ever want the toggle to show the actual source language (e.g., Latin when the content is bilingual Latin/English), we'd need to thread that through the type. Not worth doing now.

---

## Iteration 2 — Fix i18n parity test failures (commit 389ac7a)

When I ran tests before committing #130 I noticed two pre-existing test failures unrelated to my change — the i18n parity tests were flagging three practice directories without translation keys (`intimita-divina`, `mental-prayer-coloquio`, `rosary-perpetual-novena`).

Added each key to both `en-US.ts` and `pt-BR.ts` using titles straight from each practice manifest's `name` field. Canonical alphabetical insertion points. Test suite green (102/102).

Bonus: restoring parity unblocks future autonomous iterations from getting tripped by false CI-style failures.

---

## Iteration 3 — Fix #152: Archive + re-add (commit 43ba3ec)

Sub-agent scouted the archive/re-add flow and pointed at `handleAddToPlan` in the catalog detail. After reading the code directly I found the bug was broader — the issue wasn't one code path, it was an invariant-break across three:

- `createPracticeWithSlot` skipped the PracticeCreated event when the practice existed but never emitted PracticeUnarchived, so adding an archived practice via the editor left it archived with one enabled slot (hidden by the plan-of-life filters).
- `addSlot` (used by the plan detail "Add slot" button and by program begin) had the same issue.
- `setSlotsEnabled(..., 1)` same story — enabling all slots on an archived practice didn't clear the flag.
- Bonus finding: `findGroupMemberInSet` walked `s.practices` directly, so it considered *archived* practices in alt groups as "already in plan." That was why the user would see "Already in plan" on an alt-group sibling of an archived practice and couldn't add it.

Fix: centralized the unarchive-on-reactivation logic in a tiny `unarchiveEventIfNeeded` helper, and taught the three entry points to batch a PracticeUnarchived event when the target is archived. `setSlotsEnabled(..., 1)` short-circuits to just the PracticeUnarchived event since unarchiving already re-enables every slot. For the alt-group UI, I filter archived practices out of the lookup set at the call site — keeps the `findGroupMemberInSet` signature unchanged (it still takes a `has`-shaped object).

Verified: tests still pass (102/102). Did not run Playwright against this yet — database is local, flow needs live interaction; will hit it later if there's time.

Learned: the projection layer correctly maintained the invariant "archived practice has all slots disabled" but the *reverse* invariant — "no enabled slot should exist while the practice is archived" — had no enforcement, neither in projection nor at emission. The chosen fix enforces it at emission so the projection stays deterministic and pure.

---

## Iteration 4 — Fix #142 + Oratio focus mode (commits c7be17a, d9a5f8e)

Two ships this iteration.

**#142 (prose fontWeight/fontStyle) — commit c7be17a.** RN's Text quietly ignores inherited `fontWeight`/`fontStyle` once `fontFamily` is set, so Tamagui-nested Text didn't swap to the bold/italic face. ProseBlock worked around that with hardcoded strings like `'EBGaramond_700Bold'` — fine until someone swaps the body font. Replaced with a tiny `bodyFace(weight, italic)` helper that reads `bodyFont.face` directly. Now the markdown bold/italic rendering stays in sync with wherever the body font is defined.

**Oratio focus mode — commit d9a5f8e.** User course-corrected: *"be free, think of novel features, be wild."* So I pivoted from bug queue to a new feature.

Oratio is a full-screen mental-prayer timer. Three phases:
1. **Setup** — dim candle; duration chips (5/10/15/20/30/45/60 min).
2. **Running** — alive flickering candle, live countdown, "Amen" button to end early.
3. **Done** — flame slowly fades, "Amen" heading, gentle completion message, "Return" button.

The flame is a layered reanimated animation: soft golden halo behind, an outer flame ellipse, an inner bright core, each flickering with offset sin-eased timings. No SVG; just rounded rectangles. Keeps the bundle lean and the animation feels organic.

Discoverable via a new **subtle row on the home screen** below AppShortcuts, with a tiny live CandleFlame rendered inline — a small flickering surprise that invites you to tap.

Scope I deliberately left out: no completion logging, no plan-of-life integration, no audio/sound yet. First version is a contemplative space; wiring into events is a future enhancement. Committing atomically so it can ship on its own.

Learned: Tamagui's `$6` fontSize token isn't typed against display/script fonts because they declare sizes differently — the codebase's existing workaround is `fontSize={'$6' as any}`, so I reused that pattern rather than inventing a new one.

---

## Iteration 5 — Parallel work

User's second course-correction: *"you can do more than one thing at once by using sub agents."* Switching orchestration model — spawning multiple agents in parallel: a code-quality review of Iteration 4, plus research into the next target, while the orchestrator plans the next feature.

---

## Iteration 6 — Intentions (commit 9750fc6)

A living journal of prayer requests. Present them, then come back to record how God answered.

Three design choices worth naming:

1. **Event-sourced, no schema migration.** The app already stores `AppEvent`s as JSON in the `events` table and projects them into Zustand maps. Adding `IntentionAdded / Updated / Answered / Removed` to the union required zero DB changes — just a new projection branch and a `Map<number, IntentionState>` on the store. Once sync ships, intention history travels across devices for free.

2. **Counter-based IDs.** Matches the `nextCompletionId` pattern: `nextIntentionId` lives on the store, bumped at emission time. No UUIDs, no collision worries for single-device state — sync will namespace by user later.

3. **Separate screen, subtle home entry.** I considered hanging intentions off the Today hero or weaving them into the rule of life, but the three pillars say Intentions is a *devotion* (engagement), not *fidelity* (plan of life). So it gets its own screen at `/intentions`, and a subtle home row with `{count} open intention(s)` as the hint. The row shares visual DNA with the Oratio row from Iteration 4 — same height, same surface, small icon on the left, chevron on the right. The home screen is becoming a quiet index of sacred actions.

UX bits:
- Open section is always shown with a live count; answered section collapses behind a "Show / Hide" toggle so the page doesn't grow forever.
- Answered items render with strikethrough + lower opacity — visually "complete" without being shouty.
- Delete confirms via native Alert to prevent mistaken taps (an intention about a sick relative shouldn't be one gesture away from oblivion).
- Timestamps via `formatDistanceToNowStrict` with the active date-fns locale.

Noticed along the way: the pt-BR placeholder I'd drafted used *Escreve* (EP tu-imperative) but the rest of the file uses the você-imperative. Fixed in the same commit — *Escreva* + *Registre*.

Scope left out for later:
- No notification reminder ("pray for your intentions") — don't want to be pushy yet.
- No notes field on UI (schema supports it, but the list-first UX is cleaner). Could become an expanded detail view in a future pass.
- No plan-of-life "pray for your intentions" slot auto-add — might tie into the mental prayer practices later.

Verified: `pnpm exec tsc --noEmit` clean, 102/102 tests pass, biome applied.

Learned: the event store is unreasonably easy to extend. Three files touched + a repository + a hook module and the feature is done. The investment in the projection model is paying dividends — novel features cost *hours*, not *days*.

---

## Iteration 7 — Simplify pass on Intentions (commit 6e5d374)

Ran the simplify skill on the Intentions commit. Headline findings:

1. `IntentionRow` and `AnsweredRow` shared ~85% of their structure with a few deliberate divergences (answered cards drop the border, use smaller font, strike-through, lower opacity). I'd written them as separate components out of "they're different things" reflex — but collapsing to one `IntentionRow` with a `mode: 'open' | 'answered'` prop reads cleaner, loses ~40 lines, and makes the visual diffs legible rather than accidental (I caught one inconsistency where AnsweredRow's action pressables dropped padding — not on purpose).

2. Home screen subscribed to the full sorted array via `useOpenIntentions()` and read `.length`. The selector ran a filter + sort on every unrelated store update (completion logged, cursor advanced, etc.). Added `useOpenIntentionsCount` — a primitive-returning selector — so the home row resubscribes only when the count actually flips. Tiny, but principled.

3. Dead code: `getAllIntentions()` and `useIntentions()` shipped but never imported. Cut both.

Total: 83 lines removed, 56 added, zero behavior change.

Tooling note: ran the simplify in parallel with the brainstorm agent in the same turn — both finished in under 2 minutes. The orchestrator's role is increasingly *thinking about which agents to launch and how to sequence their outputs*, not doing the searches itself.

---

## Iteration 8 — Silentium (commit dfd7d4e)

A brief liturgical threshold before every practice opens. Tap a practice → the screen darkens, the word **Oremus** fades in over ~600ms in the script font and the accent color, and the flow renders when ready. Minimum hold of 900ms so even warm-cache loads give the contemplative beat.

Implementation was a one-line swap at the existing loading gate: the spinner screen in `PracticeFlow` becomes a `Threshold` component, and the `isDynamicLoading` gate widens with a `thresholdElapsed` state that flips via `setTimeout`. The threshold is a reanimated fade-in of a single Latin word — no fade-out logic needed since the gate just flips to the flow when both conditions clear.

Design trade-off I considered and rejected: varying the word by practice (*"Silentium"* for mental prayer, *"Adoremus"* for adoration, *"Deus in adiutorium"* for the Office). Would have required threading practice metadata and felt decorative. One universal *Oremus* keeps the mental model clean — same threshold for every prayer act — and the Latin is the kind of thing a Catholic user tomorrow morning will notice and smile at.

Had to register `threshold` as a new utility key in the `practice.*` i18n namespace — there's a parity test that enforces only `pray` and `noContent` sit alongside the practice IDs. One-line whitelist update.

Learned: the app's loading moments are a gift I hadn't seen. Every spinner is an opportunity to set a tone rather than just wait. Could do the same for the Bible reader, the catechism, the divine office — each has a different spiritual register and each could have its own threshold word.

---

## Iteration 9 — Horae (commit c090f53)

Below the liturgical header, a single italic line whispers which canonical hour the Church is in right now: *the hour of Vespers*, *the hour of Compline*. Eight hours, mapped to rough traditional time ranges (Matins 00–05, Lauds 05–08, Prime 08–09, Terce 09–12, Sext 12–15, None 15–17, Vespers 17–20, Compline 20–00). Refreshes every minute so it follows you through the day.

Smallest ship of the night — one new component, i18n keys, one line wired into the home screen. But the effect is disproportionate: the home screen now subtly tells you *when* you are in the Church's day, not just *what day*. The app is becoming a liturgical clock, not just a plan.

Why it's good: zero content burden (eight Latin-derived names in each locale), zero state, zero events. Pure ambient UI. And it pairs beautifully with Iteration 8's *Oremus* — the home reminds you of the hour, the practice opens with the universal prayer-beginning word. The app now feels liturgical in two new places.

Scope left for later: an actual visual strip of the eight hours with the current one highlighted would be beautiful but more invasive on a dense home screen; I kept the first ship to a single whisper. Also no tap affordance — if the hour grows into an entry point, it could route to a "pray the hour" flow (requires breviary content). That's a Track 10 (Breviary) conversation.

Learned: contemplative features compose. Oratio (candle) + Silentium (threshold word) + Horae (hour whisper) all share a visual and emotional register — dim, centered, scripted, single-Latin-word. They reinforce each other. The next wild feature should either live in this language or deliberately break from it.

---

## Iteration 10 — Breathing heart (commit 5a26a8e)

A single small polish: the Intentions home icon (the Heart) now opacity-pulses on a ~2.2s sine when any intention is open, and settles to a dim static state when all are answered. The app now gives a living signal that petitions are being carried.

Kept to its own commit so it can be reverted in isolation if the pulse feels like noise. The cycle is slow enough (sine, not linear) to read as breathing rather than blinking — an important distinction between "attention-demanding notification" and "ambient life." Filled when active, outline-only when idle, so the visual weight also tracks state.

---

## Iteration 11 — Memoria (feed of prayer life)

A day-grouped chronicle at `/memoria`: every completion, every intention offered, every intention answered — collapsed into a single reverse-chronological feed with day headers (Today, Yesterday, Friday Apr 10…). Home row appears the moment the feed has anything in it.

The implementation is intentionally store-derived rather than SQL-queried. The event store already projects completions (keyed Map) and intentions (keyed Map); a `useMemo` merges both streams into a union-typed entry list sorted by timestamp. This means the feed is *reactive by default* — add an intention, it appears instantly. No TanStack Query, no SQLite round-trip. The cost of merging 200 rows in memory is negligible; the cost of adding a query layer would've been a second source of truth.

A single lesson: when the projection is already comprehensive, don't build a query layer for it. Just select.

Chose the name "Memoria" over "Journal" mid-build. The aesthetic now has four Latin one-word features (Oratio, Silentium, Horae, Memoria) and a pattern emerging: these are all *contemplative* surfaces — spaces for attention rather than action. Saved as a memory so the next feature doesn't break the pattern accidentally.

---

## Iteration 12 — Dies Domini (weekly devotions)

An ancient Catholic practice: each day of the week is dedicated to a mystery. Sunday → Resurrection. Monday → Holy Souls. Tuesday → Holy Angels. Wednesday → St. Joseph. Thursday → Eucharist. Friday → Passion/Sacred Heart. Saturday → Our Lady.

Shipped as two surfaces: a one-line *ambient whisper* on the home screen ("Today, the Most Holy Eucharist.") and a full `/dies-domini` screen with all seven days, today highlighted, a short paragraph of tradition for each. Zero state, zero events, pure content.

This is the smallest "feature" I've shipped tonight by code, but the highest content density — fourteen paragraphs of doctrinal summary × two languages. The actual code is maybe 60 lines; the i18n payload is the feature. It's a reminder that in a content-centric app, the leverage is in the writing, not the scaffolding.

---

## Iteration 13 — Deo Gratias (gratitude journal)

A third event-sourced surface, parallel to Intentions. New event types (`GratitudeRecorded`, `GratitudeRemoved`), new Map on the store, new repo, new hooks, new screen, new home row — all following the exact pattern Intentions established. Also extended Memoria: gratitudes now appear in the chronicle alongside completions and answered intentions, each with its own icon (a flame).

Theological shape: Ignatian examen teaches that noticing graces is itself a spiritual practice — "Deo gratias" means "thanks to God." The feature asks the user to name one grace received. It's the inverse of Intentions: intentions look forward, gratitudes look backward. Together they form a petition-thanksgiving dialectic.

The event store paid dividends *again*. This entire feature — from zero code to shipped — was: one new event type union variant, one projection case, one three-line repo function, one hooks file, one screen. No migrations. No client-server sync. The store's uniformity made this feel like instantiating a template. Third time I've noticed the same compounding. Marking it: **the event store is not a dev tool — it's a product velocity multiplier.**

---

## Iteration 14 — Kyrie (a tap rope for the Jesus Prayer)

A pivot away from event-sourced surfaces into pure prayerable utility. `/kyrie` is a dark-background screen with a single large circle. Tap it, the ring pulses, haptic fires, count advances. Choose 33 / 50 / 100 / 150 (the lengths of a traditional prayer rope). When the target is reached, the ring glows gold and a success buzz confirms the round.

Above the circle, the invocation whispers in script: *"Lord Jesus Christ, Son of God, have mercy on me, a sinner."* Below, a thin progress line fills as you pray. The whole screen has one job — hold presence while you repeat.

Intentionally *not* event-sourced. Each session is ephemeral. Saving completions would turn a contemplative utility into a gamified thing; the whole point of repetitive short prayer is that no one is counting but God. The app provides the bead-feeling, not a streak.

This belongs to the same dark contemplative world as Oratio. Same palette (#0b0906 background, warm gold #f5d28a accents), same header structure, same aesthetic register. The app is starting to have two modes: the day-lit "plan and chronicle" world (home / plan / memoria) and the night-lit "one thing at a time" world (oratio / kyrie / silentium). I like that split.

Learned: haptic + visual + sound (the user's voice, here) is three-channel feedback. Each tap engages the body, the eyes, and the voice at once. Repetitive prayer works partly because it entrains all three — the app should lean into that, not abstract it away.

---

## Iteration 15 — On This Day (Memoria retrospective)

A top-of-feed callout in Memoria: "On This Day" — entries from previous years on the same month + day. Each row shows "One year ago · 2025" alongside the remembered completion or gratitude. Only appears when the user has history far enough back to have it.

~30 lines of code. Pure hook + render conditional. No new data model. The existing event store already had every datum needed; it was a matter of adding a date filter and a time-distance label. Fourth time noticing: when your projection is comprehensive, new surfaces cost nearly nothing.

The emotional shape matters more than the code: a year ago today, you prayed Compline. The app remembers with you. This is what liturgical memory looks like encoded in software — *anamnēsis*, rendered.

---

## Iteration 16 — Vestment Color Bar

The LiturgicalHeader already drew a small 40×3 accent stripe beneath the season name — but it was always `$accent` (a theme-bound warm gold). Today it wears the actual vestment color of the day: violet for Advent and Lent, white for Easter and Christmas (and feasts), red for the martyrs and Pentecost, rose for Gaudete and Laetare Sundays, green for ordinary time.

Three small parts: `LiturgicalHeader` accepts a new optional `rose?: boolean` (the header can't compute Gaudete/Laetare alone because that needs the Easter anchor, and that computation already lives at the home screen). The home screen already had `themeName` in its `useMemo`; I refactored it to compute `isRose` instead and pass it down. Inside the header, `getLiturgicalColor(season)` maps season → vestment, overridden by `rose` when true. A tiny `vestmentHex` record holds the actual colors.

Why hex and not theme tokens: vestment colors are liturgical facts, not aesthetic choices. Violet for penance doesn't change with dark mode. Tokens would let the theme drift the meaning; hex pins it.

Sublimination-sized change — one 3px bar — but it's the kind of detail that rewards the liturgically-attentive user: the ornament at the top of their prayer app speaks in the same language as the priest's chasuble at Mass today. The app knows what color the Church wears.

---

## Iteration 17 — Bead row on Kyrie

The Kyrie screen has a continuous progress bar under the tap counter. That bar moves one pixel per tap — smooth but abstract. A physical prayer rope gives a different signal: you feel each knot as a landmark. Ten taps in, you've reached something.

Added a small row of dots below the progress bar, one per ten-count "decad." Dots fade from dim to bright as you pass through each: filled (past), lit-in-progress (current, opacity ramps as you pass through 10), dim (future). Hidden when the target is under 10 (the bar is enough for those).

Ten-by-ten granularity matches the traditional rhythm — Eastern chotki have knots in tens, the Rosary decads are ten Aves, Greek prayer ropes often have 33/50/100 knots with dividers every 25 or 33. Users who pray 100 now see ten dots under the counter; 150 shows fifteen; 33 shows four. The current decad lights up gradually as you tap through it.

Small addition (~25 lines), but it reinforces the bead-feeling the screen is after: each decad is a thing you *reach*, not just a percentage you cross.

---

## Iteration 18 — Aspiratio (daily aspiration)

A tradition older than the Rosary: brief ejaculatory prayers — "aspirations" — fired off throughout the day. "Jesu, mercy." "Cor Jesu, confidio in te." "Ad majorem Dei gloriam." Short, memorable, weapon-like. Carried in the heart.

Added a single rotating Latin aspiration as the closing whisper of the home screen — below the ornamental page break, a script-font italic line at 70% opacity. One aspiration per day, deterministic (hash of day-index into a 15-entry list).

Chose Latin without translation. These are culturally recognizable — any Catholic who's prayed the Litany of the Sacred Heart knows "Cor Jesu, miserere nobis." Displaying a translation would flatten them; leaving them in their tongue keeps the connection to the tradition that minted them. A user who doesn't know what "Fiat voluntas tua" means will learn it by seeing it once a month.

~40 lines total (component + data + wire-up). No state, no events, no translation work, one new home row that costs almost nothing to look at but stays with you.

---

## Iteration 19 — Pax Christi (completion whisper)

When the user completes every practice in their plan for a given day, a single Latin line appears in the Fidelity section: *Pax Christi*. Golden script font. No animation, no modal, no sound. Just a quiet marker above the "N of N completed" count.

Pax Christi — "the peace of Christ" — is the greeting exchanged in the liturgy after the Lord's Prayer and before Communion. It's the peace given, not earned. Framed this way, finishing the day's prayer plan doesn't produce a streak-score or a trophy; it produces a moment of acknowledged peace.

Deliberately no animation or celebratory dopamine. This is the opposite of the streak counter — the mark of a complete day is supposed to feel like quiet rest, not achievement unlocked. If you don't finish today's plan, there's no punishment either. You simply don't see *Pax Christi*. Tomorrow is another day.

Three lines of JSX. One of the tinier features of the night, but I wanted to note it because the restraint is the feature.

---

## Iteration 20 — Examen (Ignatian examination)

The Ignatian examen — five movements of prayerful review at the end of a day — is one of the most accessible traditional practices in Catholic spirituality. Every retreat teaches it, every spiritual director recommends it, but it's absent from most prayer apps. Added it.

Five phases, Latin names, user-paced (not time-boxed): **Praesentia** (presence — rest under God's loving gaze), **Gratia** (gratitude — review the day), **Affectus** (affections — notice the heart's movements), **Peccatum** (contrition — acknowledge failings), **Propositum** (resolve — look toward tomorrow), then a brief closing. Each phase shows one prompt in script font. A row of five dots below marks progress.

Dark contemplative mode, same register as Oratio and Kyrie. No timer — the examen traditionally takes as long as it takes. A "Continue" button walks the user forward; the final phase closes with "Amen" and returns home with a success haptic.

Deliberately simple: one prompt per phase, no free-text capture. I considered letting the user write a gratitude during the Gratia phase (feeds into Deo Gratias) but decided against it — too clever, pulls focus from the praying. The examen is about *being with God*, not recording output. If the user wants to write a gratitude, it's one tap from home. That separation is right.

New home row (Compass icon, between Kyrie and Intentions) so the examen sits visibly alongside the other contemplative utilities. The app's "chapel" — Oratio, Kyrie, Examen — is starting to cohere: three named Latin practices, same visual register, each with a distinct shape. Chronos, logos, and kairos.

---

## Iteration 21 — Memoria filters

The Memoria feed grows monotonically — every prayer, intention, gratitude adds a row. For a long-time user this becomes unwieldy when they want to answer a specific question: *when did I last pray the Rosary?*, *what have I been thankful for this month?*

Added four filter chips at the top of the Memoria screen: **All** / **Prayers** / **Intentions** / **Gratitudes**. Tap to narrow. Horizontal-scrollable, reuses the existing pill aesthetic from Kyrie's target picker. The On This Day callout hides when a filter is active (it's a general retrospective, not scoped to the current filter).

Default is All — no behavior change for new users, instant value for returning ones. The filter state is ephemeral (not persisted) — when you leave and return, you start fresh on All.

Could later add date-range filters ("This Month", "This Year") but the four type chips cover most real needs. Keeping it minimal.

---

## Iteration 22 — Simplify pass on the #130 language toggle (commit 5362207)

After the overnight loop came back, I ran the simplify skill against the #130 fix. Three parallel sub-agents returned two real findings:

1. The outer `YStack > XStack(justifyContent="flex-end")` was doing the work that `alignSelf="flex-end"` on the Pressable can do alone. Flattened.
2. The `'↔'` fallback branch and the two ternaries guarding `toggleTargetLang` were dead code: `localizeBilingual` in `apps/app/src/lib/i18n/index.ts:62` only emits `content.secondary` when a secondary language is set, so by the time `TapToSwitch` renders, `secondaryLanguage` is guaranteed defined. Dropped both branches and documented the invariant in one line.

Net: -8 LOC, one fewer layout node per bilingual block, clearer types.

---

## Iteration 23 — Oblatio (daily offering)

The traditional Catholic day begins with a *Morning Offering* — giving the day's prayers, works, joys, and sufferings to God before anything else happens. The app had no explicit marker for this.

Shipped as a tiny invitation right below the liturgical header: *"Offer this day to the Lord ✟"* in the app's script/accent style. Tap → success haptic → the line fades out over 500ms and the act is recorded. Once offered, the line stays hidden for the rest of that day — it doesn't nag, and there's no gamification of what should be a free gift.

Mechanically the smallest possible addition:
- New event types `DayOffered` + `DayOfferingRevoked` — date keyed by `yyyy-MM-dd`.
- Projection adds `offeredDays: Map<string, number>` (date → offered-at timestamp).
- `offerDay(date)` repo function is idempotent — emits nothing if already offered that day.
- `useDayOffered(date)` returns the timestamp or undefined.
- `OblatioLine` component: reanimated opacity withTiming for the fade.
- Memoria integration: new entry kind `day-offered` with a Sunrise icon; appears under the "Prayers" filter alongside practice completions; On This Day surfaces old offerings too.

Design choice: kept the fade-out mounted (pointerEvents="none" when offered) rather than unmounting on a shared-value threshold — reanimated shared values aren't reactive in React's render cycle, so a conditional unmount would have snapped visibly instead of finishing the fade. Small cost to keep a zero-opacity view in the tree; cleaner semantics.

No dedicated screen yet — a traditional Morning Offering prayer page is a natural follow-up, but kept the ship lean: the act of offering is the core, not the text.

---

## Iteration 24 — Confessio (sacrament of penance tracker)

The sacrament most prone to quiet avoidance needed a gentle, non-shaming presence in the app. *"When did I last go?"* is the question the traditional Examen ends with — and the app had no way to answer it.

Shipped a three-part feature:
1. **`/confessio` screen** — a "days since" pill with a *"I received the Sacrament today"* button, the full Act of Contrition (traditional form) pinned in a bordered card, and a deletable history of past confession dates.
2. **ConfessioLine on home** — a single whisper line at the very bottom of home (*"Penance · N days ago"*) that only appears once a confession has been recorded. No "record your first" nag for someone who's never touched the feature.
3. **Examen closing-phase link** — inside the Ignatian Examen's fifth phase (*Tomorrow / Firm Purpose*), a tappable line offers *"Or, if the Lord invites, seek Confession"*. This is the traditional pairing: examen of conscience naturally flows toward the sacrament when grave matter surfaces.

Event store added `ConfessionRecorded` + `ConfessionRemoved`, a `confessions: Map<number, ConfessionState>` projection, and a `nextConfessionId` counter. Same pattern as Deo Gratias — a list of dated records with no schema constraints beyond what the UI needs.

Memoria integration: new entry kind `confession` with a Key icon (key → sacrament of the keys), appears under the "Prayers" filter, and is surfaced by On This Day. No separate "confessions this year" count — the days-since number on the screen is already the memento mori that matters.

Design choice: no score, no streak, no guilt. The days-since number is presented in the app's italic script register, same family as Horae and Aspiratio — a contemplative datum, not a metric. The Act of Contrition is the *only* block of prayer text on the screen, because that's what you actually need in-hand after Confession when the priest says *"make a good Act of Contrition."*

Simplify pass caught four fixes before commit: `useShallow` was wrapped around a single-object selector in `useLastConfession` (useless), `useConfessions` was re-sorting on every store event (fixed with Map-identity + useMemo), the screen had an `as any` cast on a fontSize token (dropped), and the `ConfessionRow` component was split out but used exactly once (inlined).

---

## Iteration 25 — Angelus (thrice-daily Marian bell)

The app had Horae (hour whisper), Oblatio (morning offering), Confessio (days-since), but nothing yet inhabited **the three Marian pivots** that traditionally punctuate a Catholic's working day: 6 a.m., noon, 6 p.m. Every feature tonight has been Christocentric or Ignatian; the gap was Our Lady.

Shipped:
- **`/angelus` screen** — three slot chips (morning/noon/evening) each toggleable; the full traditional prayer in the script register; auto-swaps to **Regina Cæli** during Eastertide. The liturgical-season swap goes through `useLiturgicalTheme` so it honors the user's OF/EF calendar preference.
- **AngelusLine on home** — a subtle italic "The bell rings. Angelus." (or "Regina Cæli." in Eastertide) that only appears during the canonical ±1h windows AND only if today's slot hasn't been prayed yet. No nagging after you've prayed.
- **Memoria integration** — new `angelus` entry kind with a Bell icon; appears under the Prayers filter; On This Day surfaces past Angelus prayers.

Event store: `AngelusPrayed` + `AngelusRevoked` keyed by `date:slot`, projection is `Map<string, number>` (e.g. `"2026-04-18:noon" → 1729500000000`). This composite-key pattern is the simplest way to model "per-day, per-slot" state without a nested Map — the same trick Oblatio uses with just a date key.

Design choice: one screen, three chips. An earlier sketch had per-slot navigation, but pairing all three with a single prayer block keeps the focus on the fact that these are **the same prayer prayed thrice** — the shape of the day as lived tradition, not three separate screens.

Simplify pass caught three fixes before commit: the home line was subscribing to `noon` timestamps outside the Angelus windows (fixed with a guarded `.has()` selector); the screen and `slots.ts` both maintained a `['morning', 'noon', 'evening']` literal (fixed by exporting `angelusSlots` once); and `SlotChip` had an odd "onPrayed(alreadyPrayed)" callback inversion (pushed the toggle into the child so each chip owns its mutation calls). The Eastertide switch also now goes through `useLiturgicalTheme()` so it respects the user's calendar form like the rest of the app.

---

## Iteration 26 — Memento Mori (Four Last Things nightly reflection)

After a long run of event-sourced features (Oblatio, Confessio, Angelus), I wanted one feature that was **pure content** — no store, no projection, no mutation — to prove the app's contemplative register still works without any state-tracking machinery. The Four Last Things (Mors, Iudicium, Caelum, Infernum) are the classical Ignatian + Carthusian evening meditation: nightfall, bed, a single honest sentence about death, judgement, heaven, hell.

Shipped:
- **`/memento` screen** — today's pillar and reflection highlighted, plus four pillar cards with one-sentence descriptions, so the larger structure is visible at a glance.
- **MementoLine on home** — a single script-italic whisper ("The Four Last Things. Memento mori.") visible **only after 19:00 local time**, natural pre-sleep cadence with Compline.
- **28 reflections × EN + PT-BR**, interleaved so a typical week rotates through all four themes rather than clustering on one.

Rotation is a pure `dayOfEpoch % 28` lookup against a precomputed interleaved `order[]`. No "meditated today" tracking — the feature explicitly doesn't want streak pressure on a memento mori. If you read it, you read it.

Simplify pass caught a real bug: `useIsMementoEvening` was calling `useToday()`, which returns a `normalizeDate()`-normalized Date (midnight), so `.getHours()` was always `0` and the line would have **never rendered**. Fixed to use `new Date().getHours()` with a 60s `setInterval` so the evening toggle flips without a full re-render (the same pattern `HoraLine` uses for hour updates). Also simplified `reflectionForDay` to the `Math.floor(date.getTime() / 86400000) % N` idiom Aspiratio already uses — the hand-rolled `new Date(year, 0, 1)` start-of-year was an outlier.

Learning: **`useToday()` is a day-only abstraction.** Anything that cares about the hour of day must use `new Date().getHours()` directly (or interval-poll like HoraLine). Easy to miss because the hook returns a Date object; the fact that the time component is zeroed out isn't visible in the type. Worth a journal note for future iterations.

---

## Iteration 27 — Benedictio (grace before and after meals) + Angelus bug fix

Next gap in the daily Catholic rhythm: the oldest prayer of any Christian home — grace at meals. Structurally I took the Angelus template verbatim (three time-of-day slots, event-sourced, `date:slot` composite key, home whisper during windows). Content is the traditional Latin-rooted "Benedic, Domine" + "Agimus tibi gratias."

Shipped:
- **`/benedictio` screen** — three slot chips (breakfast/lunch/dinner), two prayer blocks (before / after) in the script register. Simple, calm, extensible.
- **BenedictioLine home whisper** — "Bless this breakfast / meal / supper" copy varies by current slot. Only appears when a meal window is open AND the current slot hasn't been blessed yet.
- **Memoria integration** — `Utensils` icon, "Meal blessed · {{slot}}" body, Prayers filter picks it up.

**Silent Angelus bug caught** by running the simplify pattern against this iteration. The previous Angelus iteration (iteration 25) had the same `useToday()`-returns-midnight trap I discovered in the Memento Mori simplify pass — so the Angelus bell has been invisible since it shipped. Fixed by:
1. Extracting `useCurrentAngelusSlot()` that uses `new Date()` + a 60s `setInterval` (mirroring the new `useCurrentMealSlot`).
2. Replacing the buggy `currentAngelusSlot(useToday())` calls on both the home line and the `/angelus` screen.
3. Adding a warning comment to both `slots.ts` files telling future contributors *never* to pass `useToday()` into the window-matching functions.

This is the kind of bug that would have festered for weeks if not for the compounding simplify passes. The pattern lesson (documented in iteration 26's learning) caught a real production issue one iteration later. Worth every token.

Simplify agent also flagged potential duplication between Angelus and Benedictio (both have slot windows + interval hooks + SlotChip components). Kept them separate for now — N=2, and they'll diverge when Benedictio gets per-meal variants (e.g., feast-day graces) or Angelus grows its own slot UI. Abstract when the third one lands, not before.

---

## Iteration 28 — useToday() hour-math audit

The previous two iterations surfaced the same latent trap — `useToday()` returns a date normalized to midnight, so any downstream `.getHours()` call silently reads as 0. Memento Mori had it, Angelus had it shipped for a whole iteration before the simplify pass caught it. This iteration: take the pattern seriously before a third feature repeats it.

Grepped `.getHours()` / `.getMinutes()` across the app, and every hit is now either:
- operating on a fresh `new Date()` inside a `setInterval`-backed hook (Angelus, Benedictio, Memento, Hora), or
- formatting a user-picked time on `SlotConfigurator` (unrelated),
- or `src/app/index.tsx` which uses `new Date()` directly.

No remaining bugs. The audit is clean.

Preventive fix: rewrote the `useToday` / `getToday` JSDoc to name the trap explicitly. It now says *don't call `.getHours()` on the result* and points to the Angelus hook for the correct pattern. Comments in two `slots.ts` files already warn at the call site; the hook-level warning closes the loop so future contributors read it when they first reach for the hook.

Learning: a JSDoc warning is cheap, permanent, and reaches readers before they write the bug. An ESLint rule would be stronger but much heavier; one docstring and two strategic comments are the right weight for a two-incident trap in a solo project.

---

## Iteration 29 — ShortcutRow extraction

The home screen accumulated six nearly identical home-row shortcut blocks (Oratio / Kyrie / Examen / Intentions / Gratias / Memoria). Each was a 30-line `FadeInView + AnimatedPressable + XStack + icon slot + title + tagline + ChevronRight` chain varying only in the leading element, strings, and route. N=6 is past the point where the simplify guidance "three similar lines is better than a premature abstraction" gives way — the copy-paste was hiding missing a11y labels and making future rows (a Pax row, a Lectio row) needlessly expensive.

Extracted `ShortcutRow` to `features/home/components/`. Props: `leading` (ReactNode for icon/custom element), `title`, `tagline`, `onPress`. Ships with `accessibilityRole="link"` + `accessibilityLabel` + `accessibilityHint` baked in — every home row now gets screen-reader support automatically.

Net: `apps/app/src/app/index.tsx` loses ~130 lines. Future shortcut rows are a single 6-line call.

Why now, not earlier: the first few rows shipped across many iterations. Only once they converged visually did the right abstraction become obvious — pulling one out after Oratio shipped would have locked in the wrong shape. N=2 is too early; N=6 with a seventh on the horizon is exactly right.

---

## Iteration 30 — Aspiratio pool 15 → 30

Pure content. With 15 aspirations on a daily rotation, each prayer repeats ~24 times a year. Doubling to 30 halves that, preserving novelty without sacrificing cycle length (30 days is still memorable, not random-feeling).

Fifteen additions, all traditional Latin ejaculatory prayers from the wider tradition: Thomas's confession (`Dominus meus et Deus meus`), the Jerusalem Cross hymn (`Ave crux, spes unica`), Christ's last words (`In manus tuas, Domine` / `Sitio`), the Jesus Prayer (`Domine Iesu, miserere mei`), Marian pillars (`Sancta Maria, Mater Dei` / `Tota pulchra es, Maria`), eschatological (`Maranatha`). Each one short enough that the script-font whisper at the bottom of the home screen stays quiet.

No code change beyond the array. Zero-risk iteration — pure breadth improvement. This is the kind of thing a community could contribute without needing to touch app internals.

---

## Iteration 31 — Memoria anniversary predicate extraction

`useOnThisDayEntries` had the same 3-part date comparison (`ts.getMonth() === month && ts.getDate() === day && ts.getFullYear() < year`) repeated six times — once per memoria entry source. Each copy also re-constructed a Date from the timestamp. Not a bug, just noise.

Extracted `isPriorAnniversary(timestamp, month, day, year)` to the bottom of the hooks file. The six inner loops drop from ~6 lines to ~3. A local arrow `onPriorAnniversary` closes over the date values once, keeping each call site readable.

No behavior change (tests: 102/102 green). Pure local simplify — the kind the simplify reviewer would flag on a code review.

Why it's worth the turn even though it's small: future memoria sources (a Kyrie session log, a Pax journal, an Oratio timer history) each add a new loop. Without the helper, each addition copy-pastes the date logic. With it, the new loop is a 3-line `for … if onPriorAnniversary(ts) … push` — one less place to subtly drift.

---

## Iteration 32 — WhisperLine extraction

Second home-screen refactor of the night. Four whisper components — AngelusLine, BenedictioLine, MementoLine, ConfessioLine — all shared the same shape: a `Pressable` wrapping a centered, italicized, script-font `Text`. They differed only in two tonal registers:

- **Bright** (Angelus, Benedictio): `$accent` color, fontSize `$3`, opacity 0.85, hitSlop 8. The "something to do now" whispers tied to a window.
- **Quiet** (Memento, Confessio): `$colorSecondary`, fontSize `$2`, opacity 0.75, hitSlop 6. The "something to reflect on" whispers.

Extracted `WhisperLine` with a `tone?: 'bright' | 'quiet'` prop defaulting to bright. All four callers are now 5-8 lines of distinguishing logic (when to render, what label, where to route) plus a single `<WhisperLine>` invocation — zero presentation boilerplate.

Matched with the earlier ShortcutRow extraction: the home screen now has two shared render primitives for its two row patterns (tappable shortcut card, tappable whisper). Future whisper additions — a Pax nightly reconciliation whisper, a Lectio morning verse whisper — are a 3-line `<WhisperLine>` call.

102/102 tests still green. No visual regression (same tokens, same layout, just encapsulated).

---

## Iteration 33 — SlotChip extraction

Third refactor in the simplify arc. The `/angelus` and `/benedictio` screens each had a local `SlotChip` component that differed only in:
- slot type (`AngelusSlot` vs `MealSlot`)
- hook names (`usePrayAngelus`/`useRevokeAngelus` vs `useBlessMeal`/`useRevokeMealBlessing`)
- i18n prefix (`angelus.slot.` vs `benedictio.slot.`)

The presentational JSX — rounded 999 pill, border in `$accent` when active, fill in `$accent` when done, white check icon + white label when done — was literally identical byte-for-byte.

Extracted to `components/SlotChip.tsx` with props `{ label, active, done, onToggle }`. The feature-specific chip wrappers (`AngelusSlotChip`, `MealSlotChip`) now hold only the hook wiring and invoke the shared chip with four props. The screen-level `.map((slot) => <FooSlotChip …/>)` loop is unchanged.

Thought about overreaching to also unify the Memoria filter chips (same rounded-pill shape). Declined — they have different selected semantics (single selected from a group vs two independent boolean states), different text colors in the selected state, and no check icon. Unifying would add more branching than it saves.

Three refactors in a row. Getting a good sense of the app's presentational vocabulary: `ShortcutRow` (card-shaped shortcut), `WhisperLine` (script-font whisper, two tones), `SlotChip` (pill-shaped window indicator). Future features that need any of these are now 3-line calls.

---

## Session wrap

Shipped tonight, in order:

1. Fix #130 — text selection works again (no long-press language hijack)
2. Missing i18n keys — 3 practices, unblocks parity test
3. Fix #152 — archive/re-add respects the invariant correctly
4. Fix #142 — prose bold/italic fonts resolve via config instead of hardcoded strings
5. **Oratio** — full-screen mental prayer timer, animated candle
6. Oratio polish — barrel imports, cleaner tick logic
7. **Intentions** — event-sourced prayer journal, home row with open count
8. Simplify pass on Intentions — collapsed row variants, primitive count selector
9. **Silentium** — *Oremus* threshold beat before practices (replaced the spinner)
10. **Horae** — canonical hour whisper below the liturgical header
11. Journal catchup (6–9)
12. **Breathing heart** — intentions icon pulses while petitions are open
13. **Memoria** — day-grouped feed of completions, intentions, gratitudes
14. **Dies Domini** — weekly devotions whisper + full seven-day screen
15. **Deo Gratias** — event-sourced gratitude journal, integrated into Memoria
16. **Kyrie** — Jesus Prayer tap counter, three-channel contemplative feedback
17. **On This Day** — Memoria surfaces entries from same month+day in prior years
18. **Vestment color bar** — liturgical header stripe wears today's actual vestment color
19. **Kyrie bead row** — ten-count knots under the tap counter for rope-prayer landmarks
20. **Aspiratio** — a rotating Latin aspiration closes the home screen, one per day
21. **Pax Christi** — a quiet golden whisper when the day's rule is fully kept
22. **Aspiratio tap** — aspiration cycles on tap for explore-at-leisure
23. **Examen** — the Ignatian five-phase examination of conscience
24. **Examen fade** — prompts fade between phases for a gentler walk
25. **Memoria filters** — by-type chips (All / Prayers / Intentions / Gratitudes)
26. Simplify pass on #130 — flatten toggle stack, drop dead fallback branches
27. **Oblatio** — daily "offer this day to the Lord" invitation, event-sourced, surfaces in Memoria
28. **Confessio** — sacrament of penance tracker: days-since card, Act of Contrition, history, Examen link, home whisper
29. **Angelus** — thrice-daily Marian bell: three slot chips, traditional prayer + Regina Cæli swap, home whisper in canonical windows
30. **Memento Mori** — Four Last Things nightly reflection: 28 rotating one-sentence meditations across Mors/Iudicium/Caelum/Infernum; evening-only home whisper (≥19:00) pairs with Compline as pre-sleep contemplation
31. **Benedictio** — grace before/after meals: three slot chips (breakfast/lunch/dinner), traditional Benedic Domine + Agimus tibi gratias, home whisper during meal windows, Memoria integration. Also fixed a silent Angelus bug where `currentAngelusSlot(useToday())` always returned undefined (same useToday-is-midnight trap the Memento Mori simplify pass surfaced).
32. useToday hour-math audit — grepped every `.getHours()` call, confirmed no remaining traps, and tightened the `useToday` / `getToday` JSDoc so future contributors read the warning before reaching for the hook.
33. ShortcutRow extraction — six copy-pasted home rows collapsed to a single reusable component, with built-in `accessibilityRole="link"` / label / hint for screen readers.
34. Aspiratio pool doubled — 15 → 30 traditional Latin ejaculatory prayers; each one's annual repetition halved.
35. Memoria anniversary predicate extracted — six repeated `month/day/year<` checks in `useOnThisDayEntries` collapsed to `isPriorAnniversary(ts, …)`.
36. WhisperLine component — four home whispers (Angelus/Benedictio/Memento/Confessio) collapsed onto one shared `<WhisperLine tone="bright|quiet" />`.
37. SlotChip extraction — shared pill-chip component now powers both the Angelus and Benedictio slot rows; per-feature wrappers hold only the hook wiring.

Bold = new visible features, not bug fixes.

**Meta-learnings from the night:**

- **Parallel sub-agents earned their keep.** The simplify + brainstorm pair in the same turn returned in under 2 minutes combined. Orchestrator's job was framing the questions well and acting on the findings, not doing the searches.
- **The event store compounded.** Once you've got a schema-less JSON append log + projections, adding a new feature is `type + projection + repo + hook + screen`. No migrations, no DB plumbing. Intentions went from "no code" to "shipped" in one session.
- **Loading moments are gifts.** Every spinner is a chance to set tone. Silentium proved that turning the blank-screen beat into an intentional word changes how the app *feels* without changing what it does. Same could be done at the Bible reader, the catechism, the divine office.
- **Single-Latin-word design.** Three features shipped with the same visual register (dim, centered, script font, one word). The app's contemplative voice is becoming load-bearing design language. Hold it lightly — overuse will cheapen it.
- **Tiny != unimportant.** The breathing heart is 40 lines. Horae is 40 lines. Neither has data backing them, but both shift the emotional register of the app. Small animations + ambient cues are higher leverage than I instinctively weighted them.

Ground rules for the night:
- Keep each change scoped and committable on its own.
- Run `pnpm test` before each commit when I touch code paths with tests.
- Never amend or force-push. Always fresh commits.
- Update this journal after every iteration.
- Respect existing patterns (cycle + program + day data) when adding novenas.

