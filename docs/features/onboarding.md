# Onboarding

> **Status:** Spec-of-record for v1 (MVP). **Track:** Onboarding.
> A warm, short, fully skippable first-run flow. This is **not** the spiritual-checkup
> decision tree (`docs/features/spiritual-checkup-profiles/`) — that approach was set aside
> for onboarding.

## 0. Goal & posture

A new user opens Ember to an empty Plan of Life and ~190 practices with no guidance — the
classic cold-start problem. Onboarding solves it gently: it introduces what Ember does, sets
up language, seeds a sensible starter rule of life, offers a formation reading, and asks for
notification permission. Then it gets out of the way.

**Guiding constraint: onboarding orchestrates and records — it does not build downstream
features.** Where a deeper capability isn't ready (N-language rendering; per-catechism reading
programs), onboarding reuses what exists and persists the user's choice/intent for a separate,
later effort.

### Non-goals
- Not the spiritual-checkup / archetype decision tree.
- Not a personality test, not gamified, no badges.
- Does not build multi-language (3+) rendering.
- Does not author new formation programs (only the already-built Morrow + Compendium enroll).
- Fully skippable from any step; shown once.

## 1. Flow

Seven steps, one screen each, under the `onboarding/` route group. Progress dots at top;
**Skip** available on every step (persists whatever was set so far, then completes).

1. **Intro / features overview** — a few swipeable slides giving an honest, concrete tour of
   what Ember does today: build & keep a Plan of Life with fidelity tracking; pray beautiful
   guided practices; a Catholic library + Catechism + saints; bilingual incl. Latin; fully
   offline. (Not framed as the old "three pillars.") Revisitable later from Settings.
2. **Language** — confirm interface language (auto-detected via `detectLanguage()`) and choose
   a multi-select **"languages you know"** so the user can see cross-language content.
3. **Profiler** — three light questions: prayer-life stage, formation stage, time available
   per day. Pure in-flow state; feeds the two recommendations below.
4. **Starter plan** — default everyone toward the built `beginner-minimum` template; recommend
   others for non-beginners; allow adding practices. Reuses the template + `AdoptSheet` system.
5. **Formation reading** — nudge to Morrow's *My Catholic Faith* by default; a picker lets the
   user override (Compendium, CCC, Roman/Trent, Pius X short/larger).
6. **Notifications** — opt-in; pre-fill reminder times from the seeded plan. Skipped on web.
7. **Done** — closing screen; marks onboarding complete and routes to `/today`.

## 2. Routing & gating

- New preference `hasOnboarded: boolean` (KV key `has-onboarded`, `'1'`/`'0'`), hydrated like
  `bookReaderHintSeen`.
- In `apps/app/src/app/_layout.tsx`, once the app is `ready` (catalog seeded — onboarding needs
  warm templates/books) and prefs are hydrated, redirect to `/onboarding` when `!hasOnboarded`.
  Register `<Stack.Screen name="onboarding" />` beside `(tabs)`.
- **`hasOnboarded` is independent of `firstLaunch`.** `firstLaunch` is derived from
  `hasCachedCatalog()` and only governs the boot loader; reusing it would re-onboard a
  returning user who cleared their cache. Keep them separate.
- `completeOnboarding()` sets `hasOnboarded` and `router.replace('/today')`. Skip calls the same.

## 3. "Languages you know" model (renderer stays at two languages)

- New preference `knownLanguages: ContentLanguage[]` (KV key `known-languages`, JSON array),
  validated against the content-language set on hydrate; setter `setKnownLanguages`.
- The bilingual renderer (`localizeBilingual` + `BilingualBlock`) is **hard-capped at two
  languages** (primary + one secondary). Onboarding does **not** change that. It derives, via
  the existing setters (so React Query cache keys + persistence stay correct):
  - `contentLanguage` (primary) = interface `language` if it's a content language, else the
    first known language;
  - `secondaryLanguage` = the first known language that differs from primary (when the user
    has more than one known language).
- **Deferred (separate track):** true N-language rendering / cycling. The stored
  `knownLanguages` pool is what makes that possible later without re-touching onboarding.

## 4. Formation picker mechanism (no new content/programs)

- **Default — Morrow** (`practice/catechetical-formation`): pre-selected; enroll =
  `useEnableSlotsForPractice()` on that practice id (enables its seeded daily slot). Programs
  tolerate a null cursor and anchor on first completion — no cursor pre-seed needed.
- **Override — Compendium of the CCC** (`practice/compendium`): same enroll path (ready program).
- **Book-only catechisms (Pius X short/larger, Trent) + full CCC**: presented as "read at your
  own pace" — pin the book / deep-link the CCC reader; choice recorded, marked "no day-by-day
  plan yet" (mirrors `AdoptSheet`'s placeholder idiom).
- **Deferred (content track):** authoring program + per-day session data for Pius X / Trent so
  they can become true reading plans.

## 5. New preference keys (no migration — KV store)

| Key | Field | Notes |
|---|---|---|
| `has-onboarded` | `hasOnboarded: boolean` | one-time gate, `'1'`/`'0'` |
| `known-languages` | `knownLanguages: ContentLanguage[]` | JSON array |
| `today-tour-seen` | `todayTourSeen: boolean` | (follow-up) gates the spotlight tour |

The profiler's time-per-day answer may optionally be persisted for future re-recommendation;
other profiler answers stay ephemeral (in-flow state).

## 6. Files

New route group **`apps/app/src/app/onboarding/`**: `_layout.tsx` + `intro.tsx`, `language.tsx`,
`profiler.tsx`, `plan.tsx`, `formation.tsx`, `notifications.tsx`, `done.tsx`.

Shared **`apps/app/src/features/onboarding/`**: `useOnboardingState` (carries profiler answers
across steps), `recommendations.ts` (profiler → template + formation defaults), `IntroSlides.tsx`
(shared by step 1 and the Settings revisit entry), `OnboardingProgress.tsx`, `completeOnboarding`,
barrel `index.ts`.

Reuses: `ScreenLayout`, `PageHeader`, `Typography`, `Card`, `AnimatedPressable`, `FadeInView`,
`PillSelector`, `AnimatedCheckbox`; the `GalleryBlock` carousel pattern; `LanguageSettings`;
`useTemplateList`/`useTemplateManifest` + `AdoptSheet`; `useEnableSlotsForPractice`, `useSlots`,
`useUpdateSlot`; `requestNotificationPermission`; `detectLanguage`. i18n: `onboarding.*` keys in
`apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts`.

### Native feel

The flow follows the app-wide tactile convention (`@/lib/haptics`): `selectionTick()` for every
selection (pills, plan/formation cards, language checkboxes) and for carousel page turns;
`lightTap()` for primary navigation (Continue, Preview) and the quiet Skip; `successBuzz()` for
the final **Begin**. Haptics live in the shared `OnboardingButtons` (so every step inherits them)
and in `PillSelector`. The carousel ticks only on a real swipe — a `buttonDriven` ref suppresses
the tick when Continue drives the scroll, so it never double-fires with the button's tap. Progress
and carousel dots (`OnboardingProgress.tsx`) spring their width and tween their fill via Reanimated
rather than swapping props instantly. `PillSelector` also runs through `AnimatedPressable` for
press-scale feedback consistent with the cards and CTAs.

## 7. Phasing

- **MVP:** routing + `hasOnboarded`; steps 1, 2 (language incl. `knownLanguages` pool), 4
  (starter plan, default `beginner-minimum`), 5 (formation: Morrow + Compendium enroll, others
  browse/pin), 6 (notifications, native only), 7 (done). Step 3 profiler ships light (sets
  expectations + a simple time→template hint).
- **Follow-ups:** richer profiler-driven recommendations; true multi-language rendering; program
  data for Pius X / Trent; Settings "revisit tour" entry; the **guided spotlight tour** below.

### Follow-up: guided spotlight tour (post-MVP)

A coach-mark tour of the **Today** screen, shown the first time it's reached *after* onboarding —
separate from the linear flow so it never entangles with boot/redirect.

- **Guided "Next," not forced-tap.** A root-portal overlay dims the screen, highlights one
  element at a time (ref + reanimated `measure()`), shows a tooltip, advances via a Next button.
  Avoids the fragile touch-passthrough + cross-tab re-measurement of a must-tap multi-screen tour.
- **Build custom** rather than adopting `rn-tourguide`/`react-native-copilot` (Expo SDK 55 /
  new-architecture / Tamagui friction). **Precedent:** `ReaderTapHint.tsx` (one-time reader
  overlay) — same "show once + dismiss" shape, gated by `today-tour-seen`.
- **Targets (initial, ~3):** the time-block checklist, the fidelity wall, the "add practice"
  entry. Single screen only.

## 8. Verification

1. **Reset**: clear `has-onboarded` (or `ember://dev/reset`, which wipes the DB). Confirm
   `usePreferencesStore().hasOnboarded === false`.
2. **Run**: `pnpm ios` (native) / `pnpm start:web` (no-notifications path). Boot → `/onboarding/intro`.
3. **Walk it**: swipe slides; set interface + known languages (verify `known-languages` written,
   `secondaryLanguage` derived); answer profiler; confirm `beginner-minimum` pre-selected,
   adopt → verify slots on Today; pick Morrow → verify `catechetical-formation` slot enabled;
   grant notifications + confirm times → verify via `getAllScheduledNotificationsAsync()` (native).
4. **Skip path**: Skip from any step → `/today`, `hasOnboarded` set.
5. **Persistence + regression**: relaunch → onboarding does NOT reappear; a returning user with
   a cleared *catalog cache* (boot loader shows) must NOT re-onboard.
6. **Revisit**: Settings → "Tour / What is Ember" opens `IntroSlides` in revisit mode.
7. **i18n**: switch to `pt-BR` mid-flow; all copy localizes.
8. `pnpm test` + `pnpm biome check`.
