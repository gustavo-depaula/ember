# QA Findings — 2026-04-18

Deep QA pass across the app in-browser. Features tested: see overnight journal (~40 iterations shipped 2026-04-17/18). This file is the single source of truth for issues found and the fix plan.

Severity: **P0** = blocking/broken, **P1** = serious UX damage, **P2** = polish, **P3** = nit.

---

## Findings

### F1 · CandleFlame layout broken on web (Oratio, home row icon) — **P0**

**Symptom.** On `/oratio`, the candle flame halo renders at the very top of the page (absolute-positioned up to y=0), separated from the candle body by ~400px. The flame looks like a disembodied dim oval near the title instead of a candle lit at the center of the screen.

**Root cause.** `apps/app/src/components/CandleFlame.tsx:65` — outer `<View width height>` has no `position="relative"`. React Native Web compiles to `position: static`, and the inner `position: absolute` flame group walks up until it finds the `YStack` with `position: relative` far above, anchoring there.

**Fix.** Add `position="relative"` to the outer `<View>` in CandleFlame. Also verify on the home Oratio row (small flame — same component, same bug, probably also visible on web).

---

### F2 · useKeepAwake() crashes on web — **P0 (blocker for web)**

**Symptom.** Any navigation triggers the Expo dev-server red-box:
```
NotAllowedError: Failed to execute 'request' on 'WakeLock': The requesting page is not visible
    at activate (expo-keep-awake)
    at activateKeepAwakeAsync
```
In production this would surface as an uncaught promise rejection on every route change.

**Root cause.** `apps/app/src/app/_layout.tsx:57` — `useKeepAwake()` added in commit `e99c3e3`. On web, expo-keep-awake calls `navigator.wakeLock.request('screen')`. Browsers reject the request unless the document is `visible` at call time — during mount / fast route transitions the page is not yet visible, so the promise rejects.

**Fix.** Either (a) guard with `Platform.OS !== 'web'`, or (b) catch + re-try on visibilitychange. (a) is simpler — Wake Lock on web is unreliable anyway (browsers may throttle). Keep screen-awake behavior on native only.

**Status.** Fixed in `49f1553` — `src/hooks/useKeepAwake.ts` wraps the RN API with a `Platform.OS === 'web'` no-op.

---

### F3 · Destructive confirmations use `Alert.alert` — **P2 (web) / P3 (native)**

**Symptom.** Deleting a confession (and any other event-sourced record: intentions, gratitude, plan slots, library books, practices) opens a native browser `confirm()` dialog on web. Grey OS chrome over a reverent liturgical UI — breaks immersion. On native it uses the proper platform Alert, which is acceptable but still modal-heavy for a single-line "are you sure" on a one-row delete.

**Scope.** 8 files currently use `Alert.alert`:
- `app/confessio/index.tsx`, `app/gratias/index.tsx`, `app/intentions/index.tsx`
- `app/plan/[practiceId].tsx`, `app/library/index.tsx`, `app/library/[libraryId].tsx`
- `app/settings/index.tsx`, `features/plan-of-life/components/SlotConfigurator.tsx`

**Fix.** Add a small Tamagui `ConfirmSheet` (bottom sheet style) or a tap-again-to-confirm affordance that matches the rest of the app's chrome. Migrate destructive flows one by one. Avoids the web polyfill entirely and gives native a quieter confirm UX.

---

### F4 · Confessio "Received today." header is redundant with the disabled button — **P3**

**Symptom.** After recording, the card renders "Received today." (from `confessio.sinceToday`) directly above a disabled pill that reads "✓ RECEIVED TODAY". Same information twice, no hierarchy.

**Fix.** When `recordedToday` is true, suppress the `sinceLabel` line. The pill carries the state on its own. Alternatively: keep the `sinceLabel` only for the N>0 days-since case.

---

### F5 · Raw `<TextInput>` shows a glaring blue browser focus ring on web — **P1**

**Symptom.** Focusing the intention composer (and any other `TextInput` on web) paints a bright 2-3px blue `outline` around the entire input — jars badly against the dim liturgical palette. Visible on `/intentions`; the same pattern is used on `/gratias`, Deo Gratias, `/plan/[practiceId]` notes, and every other text-entry surface.

**Root cause.** `apps/app/src/app/intentions/index.tsx:87-101` (and siblings) render a bare RN `<TextInput>` without overriding the default browser `outline`. RN Web passes `outline` through.

**Fix.** One of:
- Add `outlineStyle: 'none'` (plus a softer focus treatment — e.g., border tone change) to the `TextInput` style — local per call site.
- Better: extract a small `<SoftTextInput>` wrapper in `components/` with dim-friendly focus styling and migrate every `TextInput` caller to it.

---

### F7 · Dies Domini buries today's devotion below the Sunday-first list — **P1**

**Symptom.** The page lists all seven days Sun→Sat with identical visual weight. Today's section is marked only with a small gold italic "today" chip next to the weekday heading. On Saturday (today), users must scroll past 5 sections before reaching the relevant devotion.

**Why it matters.** The primary use case is "what is today's devotion?" — one-question, one-answer. Requiring scroll for the answer is friction, and the uniform typography means the "today" chip is easy to miss.

**Fix options.**
- (a) Anchor today's section at the top; render the rest of the week below, either collapsed or in a secondary list ("The rest of the week").
- (b) Keep the weekly order but auto-scroll to today on mount, and visually elevate today's section (accent border, larger heading, bolder background).

Prefer (a) — stronger information hierarchy, no auto-scroll surprise.

---

### F8 · Memento Mori "aspect" cards look pressable but aren't — **P2**

**Symptom.** On `/memento`, the four aspect rows (Death, Judgement, Heaven, Hell) render as rounded cards with borders and padding identical to interactive cards elsewhere in the app (e.g., confessio history rows, plan slots). They invite tapping but do nothing — the meditation cycles automatically nightly and users can't switch aspects on demand.

**Fix options.**
- (a) Make the cards actually interactive: tap to expand into a deeper meditation on that aspect (adds value).
- (b) Visually demote the rows so they clearly look like a static index/legend (lose the card chrome, render as simple list items with a gold dot or "·" separator).

(a) is the richer feature (memento could become a browsable meditation library), but (b) is the minimum fix for the false-affordance bug. Pick (b) for the polish pass and track (a) separately.

---

### F9 · Nocturne has no completion record — no journal entry, no nightly tracking — **P2**

**Symptom.** `/nocturne` renders four read-only prayer cards. Closing the screen leaves no trace — the Memoria (journal) feed never records that compline was prayed tonight.

**Context.** Sibling features (Confessio, Oblatio, Angelus, Examen) all record a completion event that surfaces on the journal. Nocturne is the only full-screen devotional without it.

**Fix.** Add a "Compline prayed — commend the day" button at the bottom of the screen that writes an event (same event-sourced pattern as oblatio/confessio). Rolls into the Memoria feed. Could also dim the whisper line on home once recorded.

---

### F6 · "0 seconds ago" timestamp is jarring for a devotional act — **P3**

**Symptom.** Immediately after adding an intention the row reads `0 seconds ago`, which reads as software clock noise rather than a devotional gesture. Same effect on gratias entries.

**Root cause.** `IntentionRow` (intentions/index.tsx:218) uses `formatDistanceToNowStrict(timestamp, { addSuffix: true })` which always returns a numeric distance, including `0 seconds`.

**Fix.** Replace with a softer formatter: `just now` for <30s, `a moment ago` for <1m, then fall through to `formatDistanceToNowStrict` for older entries. Wrap in a reusable helper (e.g. `formatSoftRelative`) since this phrasing also belongs on memoria entries.

---

### F10 · Bible reader — section heading concatenated with verse 1 — **P2**

**Symptom.** On `/bible/reader` Genesis 1 renders `" 1  Six Days of Creation and the Sabbath In the beginning God created..."` as a single block — the RSV section heading ("Six Days of Creation and the Sabbath") is welded directly onto verse 1 with no formatting break. Every chapter opener with a translator-supplied heading will look like this.

**Fix.** Detect RSV heading pattern (all-caps or known heading format) and promote to a separate bold/accent line above the verse. Alternatively, strip translator headings from the payload so only scriptural text remains.

---

### F11 · Default text alignment is justified, producing rivers on narrow columns — **P2**

**Symptom.** Reading bodies (Bible reader, prayer bodies, Hail Mary preview in Settings) default to full-justified alignment. On mobile-width column this creates wide gaps between words ("The earth was without form and void, and darkness"). Readability suffers for the reverent typography goal.

**Verified.** The Reading section of Settings has an `Align` toggle with two options; switching to left-align immediately fixes the preview rivers. Default is justified.

**Fix.** Change the default reading alignment preference to `left`. Justify works for print but degrades on narrow screens without hyphenation. Users can still opt into justify from Settings > Reading.

---

### F12 · Bible/Catechism drawer pushes content instead of overlaying — **P1**

**Symptom.** Tapping the book picker (`Genesis ⌄`) or section picker on `/catechism` opens a left drawer that **shifts** the reader content right instead of overlaying it. No scrim/backdrop; tapping the now-shifted content does not close the drawer. Book names in the drawer are flush-left against the viewport edge (zero left padding). Closing requires clicking the picker toggle again — there's no X, no escape-on-outside-click.

**Root cause suspected.** Drawer component probably uses an `XStack`/flex layout that expands the viewport instead of `position: absolute` + scrim.

**Fix.** Convert to overlay: `position: absolute; left: 0; top: 0; bottom: 0` with translucent scrim behind, tap-outside-to-close, and proper internal padding.

---

### F13 · Catechism stuck on "Loading..." — **P0 (blocker)**

**Symptom.** `/catechism` renders a header ("Catechism") and a centered "Loading..." forever — no content appears after waiting 5+ seconds. No error toast, no retry.

**Hypothesis.** CCC content either (a) is fetched from Hearth and the request is failing silently, or (b) the catechism store hydration is stuck. Console shows no catechism-specific error; the bundle resolves fine.

**Fix.** Investigate CatechismScreen's data-loading path (`apps/app/src/stores/catechismStore.ts` + the route component). Add an error state + retry; surface fetch failures instead of an infinite spinner. Also the "Loading…" string is too plain — use a `$body` muted line or a soft pulse.

---

### F14 · Plain "Loading..." text as loading state — **P2**

**Symptom.** Catechism (and possibly other screens on slow paths) shows a bare "Loading..." centered on black. No icon, no candle, no pulse. Breaks the liturgical tone the rest of the app carefully maintains.

**Fix.** Use a shared `PrayerSpinner` / subtle dim pulsing sigil for loading states across the app.

---

### F15 · First completion shows "50% Completion Rate" — **P2**

**Symptom.** On practice detail page, after a user's first-ever completion of a daily practice, stats read: Current Streak 1, Longest Streak 1, Total Days 1, Completion Rate **50%**. Expected: 100%. User just did the only prayer scheduled — the metric should reflect that.

**Hypothesis.** Completion rate denominator is counting a future slot (e.g., the "weekly Morning Offering at 07:00" is being counted twice — once for today and once for today-in-the-past?), or it's computing over a 2-day window that includes yesterday (when the practice didn't exist in the plan). Either way, the first-ever completion reading 50% is confusing and demotivating.

**Fix.** Review completion-rate denominator logic. Rate should be `completions / (scheduled slots since plan-add date, up to now)`, floored at 0, capped at 100. Don't count slots before the practice was added to the plan.

---

### F16 · Small-caps / Title-case heading style mixed in Settings — **P3**

**Symptom.** `/settings` uses SMALL CAPS for some section headings ("BIBLE TRANSLATION", "READING", "TIME TRAVEL") and Title Case for others ("Theme", "Interface Language", "Liturgical Calendar"). Inconsistent hierarchy — reader can't tell the difference between a major and minor section.

**Fix.** Pick one. Probably: `$heading` + SMALL CAPS for major sections, `$body` Title Case for sub-fields within a section.

---

### F17 · Prayer opener date uses $script font, conflicts with script-restraint policy — **P3**

**Symptom.** `/pray/:id` opens with the date ("Saturday, April 18, 2026") rendered in the Pinyon-Script/italic accent font. Per `feedback_script_italic_restraint` memory + commits e46c00b / 3fca848, the project retired `$script`/italic from readable text.

**Context.** This is a one-off accent on a prayer-opener screen (not a repeating body or whisper), so it may be intentional. Flagging only because it runs close to the spirit of the rule.

**Fix (if needed).** Drop to `$heading` small-caps or keep as-is — at author's discretion.

---

