# Phase E — Polish, locales, docs

> Scope: pt-BR catechetical vocabulary review, anchor pool curation, store listing assets, journal entries.
> Complexity: **Low per task; the pt-BR theological review needs care** — these are the words a confessor would use, and they carry weight.
> Depends on: Phases A–D landed. Phase E is the closing pass before v1 ships.

## Goal

The bones of v1 are in place after Phases A–D. Phase E is the difference between "shippable" and "delightful, accurate, and Catholic." Three pillars:

1. **Voice** — pt-BR theological vocabulary correct in every surface; en-US copy reviewed for tone (custody, mortification, *firm purpose of amendment* are all theological terms; mishandling them is worse than not having them).
2. **Anchor content** — a curated pool of saint quotes, Scripture aspirations, and sacred-art cards that make the prayer-shield genuinely formative on first launch.
3. **Store and docs** — App Store / Play Store listings, screenshots, privacy disclosures, and the journal entries documenting what we learned.

After Phase E, Custody v1 is ready to ship.

---

## Major decisions

### E1. pt-BR review without a Brazilian reviewer

This is a solo project. There's no pt-BR catechetical reviewer on the team. Three options:

- **(a) Self-translate using authoritative sources.** Cross-reference the *Catecismo da Igreja Católica* (CNBB edition), the CNBB's published prayer translations, and the *Liturgia das Horas* official translations. Slow but correct.
- **(b) Hire a one-time freelance reviewer.** A canonist or seminarian via a Catholic freelance network. Fastest path to confidence; modest cost.
- **(c) Open a public review thread.** Post the glossary on the project's GitHub and ask Brazilian Catholic users to review.

**Decision: (a) for v1, (b) before public release.** Build the glossary against authoritative sources; ship to TestFlight and a small pt-BR alpha group with the glossary visible; commission a one-time review before public release. (c) introduces variance and timing dependency that doesn't fit a launch.

The glossary is checked into `docs/features/custody/i18n-glossary.md` and referenced from every PR that touches `custody.*` keys.

### E2. Saint-quote pool: ~30 starters, theological breadth

Six is the v1.x starter count. Expand to ~30 in Phase E to give variety and avoid first-launch déjà vu. Sources:

- **Scripture aspirations** (Psalms 23, 33, 50; Phil 4:8; Jn 3:30; Mt 5:8) — short, memorizable
- **Augustine** (Confessions, on disordered loves)
- **Francis de Sales** (*Introduction to the Devout Life*, custody of the eyes, custody of the heart)
- **Imitation of Christ** (book 1, on contempt of the world)
- **John Bosco** (on sensuality and innocence)
- **Josemaría Escrivá** (*The Way*, on mortification)
- **Catechism of the Catholic Church** §§2517–2520 (purity of heart)
- **Liturgical antiphons** (Ash Wednesday, Septuagesima)

Each entry: `{ id, en, pt, attribution, sourceRef }`. Bilingual at authoring time — no machine translation. Stored in `apps/app/src/features/custody/anchors/quotes.ts`.

The quote pool seeds two surfaces: ShieldAnchorPicker's "Curated text" tab, and a daily auto-rotating default for users who don't pick a custom anchor.

### E3. Sacred-art cards: ~6 starters, public domain or licensed

Anchor cards are images that fit the iOS shield's icon slot (~120×120 displayed, render at 360×360 PNG for retina). Six starters:

| Card | Source | License |
|---|---|---|
| Sacred Heart of Jesus | Pompeo Batoni, 1740 (Public domain) | PD |
| Christ Crucified | Velázquez, *Christ Crucified* 1632 (Public domain) | PD |
| Our Lady of Sorrows | Carlo Dolci, *Mater Dolorosa* (Public domain) | PD |
| Christ in Gethsemane | Heinrich Hofmann, *Christ in Gethsemane* (Public domain status varies; verify) | PD or licensed |
| St. Michael the Archangel | Guido Reni, *Archangel Michael* 1635 (Public domain) | PD |
| The Annunciation | Fra Angelico, *Annunciation* (Public domain) | PD |

All cropped to a square aspect ratio, color-graded for visibility against the shield's background blur, stored in `apps/app/src/features/custody/anchors/cards/`. Licensing verification is a real task — Hofmann in particular has murky US/EU PD status; either confirm PD or substitute a clearly-PD piece.

### E4. Default anchor for fresh commitments

When a user creates a commitment without explicitly picking an anchor, what shows on the shield?

Three options:

- **(a) Empty / generic** — Apple's default shield, or a plain "Custody" card. Boring; loses the product.
- **(b) Tier-default** — `bound` commitments get the Sacred Heart card + a default verse; `firm` shows a plain card. Predictable.
- **(c) Daily-rotating** — pick a different starter quote each day from the pool, weighted toward the liturgical season. Always fresh.

**Decision: (c).** The cost is one extra rotation table; the benefit is that a user who never picks a custom anchor still gets ~30 different shields over a month. Liturgical-season weighting comes from the existing `LiturgicalSeason` resolver: in Lent, weight Augustine and Imitation; in Advent, weight Annunciation and de Sales; in Ordinary Time, weight Scripture aspirations.

The rotation is computed in the main app on snapshot sync — the iOS extension doesn't pick at trigger time (no network, deterministic-only). On each daily sync (or on app foreground if more than 24h since last sync), recompute the day's default anchor for any commitment without a custom anchor.

### E5. Anchor refresh affordance

When a prayer or lectio anchor's underlying corpus text changes (e.g., translation fix), the inlined text in the commitment goes stale. Phase A documented the trade-off; Phase E adds the affordance.

UI: in CommitmentEditor's anchor row, when the inlined text differs from the current resolver output, show a one-line note "Prayer text updated upstream — [Refresh]." Tap re-renders against the current corpus and saves.

Detection: store the prayer's `revisionId` (a hash of the resolver output at save time) alongside the rendered text. On open, compare to current. If different, surface the affordance. Cheap.

### E6. Store listings: explicit Catholic framing

App Store and Play Store listings for Ember already exist. Phase E adds Custody to the feature list with explicit Catholic framing:

> **Custody** — Build and keep a rule of life. Declare resolutions to abstain from pornographic websites, social-media doomscrolling, or any specific app. On iOS, the OS shields blocked apps with a prayer of your choice — turning each moment of temptation into a moment of grace. Single-user only: no parents, no remote control.

This copy is *deliberately* explicit about porn-blocking — the audience this serves should find it without ambiguity. App Review may push back on the specificity; if so, soften "pornographic websites" to "adult content" but keep the rest.

### E7. Privacy disclosure: foreground

Both stores require privacy disclosures. Custody adds:

- **Data not collected** (the truthful answer). Custody data — commitments, falls, sessions, opaque tokens, lock states — is local-only. No cloud sync, no analytics on Custody usage.
- **Permissions** (iOS): Family Controls, App Group, deep-linking to Settings.
- **Permissions** (Android, v1): None beyond what Phase D needs — a deep-link to Private DNS Settings does not require any new manifest permission.

The privacy listing is more important than usual because Custody is sensitive — porn-blocking implies the user has admitted that need, and that admission must never become product surface for a second party.

### E8. Journal entries: capture institutional knowledge

Custody is the project's first native module + first Apple entitlement + first non-trivial cross-platform asymmetry. Future devs (including future-you) will retread this ground if it isn't documented.

Required `docs/journal.md` entries by end of Phase E:

- **2026-XX — Family Controls entitlement, Individual mode**: what we filed, the demo video URL, Apple's response, screenshots of the approval email.
- **2026-XX — kingstinct/react-native-device-activity in Expo**: how we wired it, what we forked or extended, gotchas.
- **2026-XX — Shield title/subtitle character limits**: actual measured limits per device, not Apple's documented limits.
- **2026-XX — App Group write coalescing**: the hard-won knowledge of when UserDefaults changes propagate to extensions.
- **2026-XX — Schedule flattening**: when `ScheduleRule` ↔ `DeviceActivitySchedule` translation hit edge cases.
- **2026-XX — pt-BR catechetical glossary**: the chosen translations and why.
- **2026-XX — DNS provider landscape, May 2026**: state of free DNS providers; reasoning for Cloudflare default.
- **2026-XX — Custody and the Plan of Life integration**: how falls roll into the fidelity wall, what a fall counts as.

Each entry is short (≤200 words) but specific. The journal is what saves the next person from the failure paths we already mapped.

### E9. Empty-state copy as catechesis

The Custody empty state is a teaching moment. v1 first-launch state shows:

> **A rule of life is not only what you do.**
> It is also what you refuse.
> Custody helps you keep that "no" — by reminding you, by logging your falls for examen, and (on iOS) by your phone itself.
>
> *"Custodi linguam tuam a malo, et labia tua ne loquantur dolum." — Salmo 33:14*
>
> [ Begin your first commitment ]

This is in the design system already (Tamagui empty-state component); Phase E writes the copy. pt-BR uses the Vulgate Latin verbatim (Latin retains for both locales) plus a translated paraphrase below.

---

## Architecture

### File layout added in Phase E

```
apps/app/src/features/custody/
  anchors/
    quotes.ts                                30 bilingual entries
    cards/                                   6 PNGs + manifest
    rotation.ts                              Daily-default picker
    refresh.ts                               Detect stale rendered text
  empty-state/
    EmptyState.tsx                           Catechesis empty state

apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts   [final pass: every custody.* key reviewed]

docs/features/custody/
  i18n-glossary.md                           pt-BR theological vocabulary glossary

docs/journal.md                              [edited: ~8 new entries]

apps/app/store-listings/
  app-store/
    ember-en.txt                             Custody section added
    ember-pt-BR.txt
    screenshots/custody-*.png
  play-store/
    ember-en.txt
    ember-pt-BR.txt
    screenshots/custody-*.png
```

### pt-BR glossary entries (excerpt)

```
custody (of the eyes/senses)        custódia dos olhos / dos sentidos
firm purpose of amendment           firme propósito de emenda
mortification                       mortificação
ascetical resolution                propósito ascético / propósito firme
chastity                            castidade
penitence                           penitência
self-restraint                      domínio próprio / autodomínio
contrition                          contrição
fall (moral)                        queda
spiritual combat                    combate espiritual
abstinence                          abstinência
custody session (focus block)       sessão de recolhimento
recollection                        recolhimento
devout life                         vida devota
purity of heart                     pureza do coração
```

The glossary is mandatory reference for any PR touching pt-BR copy. Source citations point at the CNBB Catechism, *Imitação de Cristo*, and the official *Liturgia das Horas*.

---

## Tasks

### T-E1. Author the pt-BR theological glossary

`docs/features/custody/i18n-glossary.md`. Source-cited entries for all theological terms used in `custody.*` i18n keys. Cross-reference CNBB Catechism, the *Liturgia das Horas*, and the official Catholic Bible Brazilian-Portuguese translations. Mark each entry with the source in a footnote.

### T-E2. pt-BR copy review pass

Read every `custody.*` key in `pt-BR.ts` against the glossary. Where a term diverges, fix. Where a term has no glossary entry, add one. Where copy uses a phrase the glossary doesn't cover (e.g., a tooltip), check the surrounding theological context for accuracy. This pass is the bulk of Phase E's effort.

### T-E3. Curate the saint-quote pool

`apps/app/src/features/custody/anchors/quotes.ts`. Thirty bilingual entries with source attribution. Each entry: `{ id, en, pt, attribution, sourceRef, season?: LiturgicalSeason }`. The optional `season` field weights the daily-default rotation (E4).

### T-E4. License-verify and bundle the six sacred-art cards

For each card from E3:

1. Verify public-domain status (or obtain license).
2. Crop to square aspect ratio.
3. Render at 360×360 PNG (retina-ready) and 120×120 (smaller variant for memory).
4. Add to `apps/app/src/features/custody/anchors/cards/` with a manifest `cards.ts` (id, displayName, attribution, paths).

If a card's PD status is uncertain (Hofmann's *Christ in Gethsemane*), substitute a verified-PD alternative.

### T-E5. Daily-default anchor rotation

`apps/app/src/features/custody/anchors/rotation.ts`. Function `pickDailyDefaultAnchor(seed: { date: Date; season?: LiturgicalSeason; commitmentId: string }): Anchor`. Deterministic given the seed (so the iOS extension and main app converge). Weighted by season; salted by commitmentId so two commitments don't both show the same daily default.

Hook into the snapshot sync (Phase C) — recompute on each sync for any commitment without a user-set anchor.

### T-E6. Anchor refresh affordance

`apps/app/src/features/custody/anchors/refresh.ts`. Compare a saved anchor's `revisionId` to the current resolver output. If stale, surface a `<RefreshAnchorButton commitmentId>` in CommitmentEditor's anchor row. On tap: re-render and save.

### T-E7. Empty-state component

`apps/app/src/features/custody/empty-state/EmptyState.tsx`. Catechesis copy from E9, Tamagui-styled, en-US and pt-BR. Mounted in `apps/app/src/app/custody/index.tsx` when commitment list is empty. Include the Latin verse + translated paraphrase.

### T-E8. App Store / Play Store listings update

Add the Custody copy block (E6) to both store listings, both locales. Capture seven screenshots:

1. Commitments list with three example commitments
2. CommitmentEditor with the severity picker visible
3. The prayer-shield (real shield captured on a physical device)
4. Custody session running with an anchor
5. Examen with falls surfaced
6. Confessio with the falls log
7. Empty state (catechesis)

Save under `apps/app/store-listings/{app-store,play-store}/screenshots/custody-*.png`.

### T-E9. Privacy listing pass

For both stores, update the privacy disclosures per E7. The Apple App Store privacy nutrition label needs the Family Controls usage explicitly marked; the Play Store needs the matching declaration. Cross-reference the actual data handling against what we've written — the disclosures must be true, not just plausible.

### T-E10. Journal entries

Write the eight entries from E8 in `docs/journal.md`. Reference the relevant phase docs. Each entry is concrete (file paths, decision rationale, what surprised us); none are abstract reflections.

### T-E11. Smoke test the polished experience

End-to-end on a physical iPhone and a physical Android device:

- First launch shows the catechesis empty state in the active locale.
- Creating a commitment without picking an anchor shows a daily-rotating default that matches season weighting.
- Updating a prayer in the corpus surfaces the refresh affordance in the editor.
- pt-BR mode renders every key with a glossary-correct translation.
- Empty quote/card pools render fallback copy gracefully.

---

## Verification

- pt-BR glossary covers every theological term in the i18n keys.
- All six anchor cards verified PD or licensed.
- Daily-default rotation produces the same output on iOS extension and main app for the same seed.
- Anchor refresh surfaces correctly when a corpus prayer is edited and re-pulled.
- Store listings approved (App Store + Play Store) on first or second submission.

## Risks

| Risk | Mitigation |
|---|---|
| Self-authored pt-BR review misses a theological subtlety | Mark v1 release as "translation review pending"; commission the freelance review before stable v1.0 announcement; fix in a fast-follow patch. |
| Sacred-art card licensing incorrectly verified | Substitute conservative PD pieces if any source is uncertain; document the verification process in `docs/journal.md`. |
| App Store rejection on Custody copy specificity ("pornographic websites") | Soften to "adult content" if pushed; the underlying functionality is unchanged. |
| Apple privacy nutrition label flagged for Family Controls usage | The pre-prepared justification (Phase C) covers this; resubmit with refined disclosure. |
| Daily-rotation drift between extension and main app | Deterministic seed function; unit-test parity between the JS implementation and a Swift port. |
| Glossary terms drift from canonical CNBB usage over time | Glossary linked from PR template; periodic review documented in `docs/journal.md`. |
