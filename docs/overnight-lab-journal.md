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

