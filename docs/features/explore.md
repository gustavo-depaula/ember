# Explore — "The Almanac"

> Status: building (v1). Track: Polish / Sacred Art. Replaces the collection-icon
> `DiscoverySections` Explore with an illuminated, daily-fresh editorial front page.

## Why

The old Explore (`LatestRow` + `DiscoverySections`) rendered everything as a 40px-icon
collection card hand-picked into ~8 hardcoded rows (`sectionLayout.ts`). The real catalog
was unreachable, the app's best asset (sacred art, holy cards, manuscript type) went
unused, and the page never changed. Result: ugly, static, hard to find things.

Explore is now the **living front page of the Church + Ember's discovery magazine** —
imagery/illumination-forward, block-based, carousel-driven, and **fresh every day** off the
liturgical calendar. Search and Library remain separate tabs; Explore is free to be a
magazine, not a catalog.

## Shape

Structurally modeled on Apple Podcasts' **New** tab (featured editorial carousel up top,
titled cover-card carousels below), wearing **Ember's illuminated skin** (EB Garamond /
Cinzel / manuscript faces, parchment/Tenebrae, gold/burgundy, gold-bordered art cards).

Top-to-bottom:

1. **Masthead** — weekday · liturgical season · the date, with the season's accent. No imagery.
2. **Featured carousel** — horizontally-paged full-bleed **art blocks** with the next card
   peeking: **Gospel of the Day** (lead) → **Saint of the Day** → **Today's Devotion** (the
   dies-domini weekday cycle, when one is mapped) → **For this Season** → **Featured
   Reading**. Each block = art background (or solid liturgical-color block) + Cinzel
   tracked-caps label + manuscript headline + tap target; no border (flat, rounded).
   The Gospel block pulls today's Gospel from `useGospelOfTheDay` (the `mass-of` source) —
   citation as headline, text preview as subtitle — and links to the gospel practice.
3. **The Library** — carousel of square cover cards → book reader.
4. **Voices** — carousel of square creator cards (reuses `CreatorGridCard`) → creator pages.
5. **Collection rows** — Devotions + Schools & Traditions, as cover cards.

**Weekday devotion (dies domini):** `pickFeatured.weekdayDevotion(date)` maps Mon→Holy Souls
(`for-the-dead`), Thu→Blessed Sacrament (`eucharistic`), Fri→Sacred Heart (`sacred-heart`),
Sat→Our Lady (`marian`); other days fall back to the seasonal block.

(Future slots, not built: From Rome / Vatican News, new encyclicals, on-this-day history,
personalization to the rule of life.)

## Daily-fresh logic

- The liturgical day comes from `useToday()` (4am cutoff; honors time-travel) +
  `getLiturgicalSeason(today, form)` + `getCelebrationsForDate(calendar, today)`.
- **Saint of the Day** = the day's `principal` celebration (`useSaintOfDay`). Its art is
  resolved by mapping the calendar `entry.id` (e.g. `st-therese-of-lisieux`) → a saint-art id
  via `saintArtMap.ts`. Bio is a **stub** for now (label says so); real bios land later.
- **For this Season / Featured Reading / collection rows** come from `pickFeatured(season,
  date)`, which extends the existing `seasonalSpotlight.pickSpotlight`.

## Imagery & fallback rules

- Art is an **app-side map** (`artMap` / `saintArtMap`) from a content id → a
  `hearthAssetUrl('saints/…' | 'art/…')` path, so blocks render without a manifest fetch.
  Public-domain (PD-Art) paintings are sourced into `content/saints/` + `content/art/`.
- When no art is mapped, a block/card falls back to a **solid liturgical-color background**
  (`bgColor.ts`, derived from the season/category palette in `config/themes.ts`) with the
  title set in the manuscript face. A `LinearGradient` darkens the lower half so overlaid
  cream/white text stays legible — the page never looks broken.
- Book covers: the catalog hint has no `image` field (it lives in the deferred `BookEntry`
  manifest, and 0/30 are populated), so v1 Library cards are typographic-on-color, upgraded
  via `artMap` as covers are sourced.

## Key files

- `apps/app/src/features/explore/` — `AlmanacMasthead`, `FeaturedCarousel`, `FeatureBlock`,
  `ArtCarousel`, `ArtCoverCard`, `useSaintOfDay`, `pickFeatured`, `saintArtMap`, `artMap`,
  `bgColor`.
- `apps/app/src/app/(tabs)/(today,explore,library,you)/explore.tsx` — composes the above.
- Reuses: `Typography` (Ladder of Reverence), `ScreenLayout`, `useToday`, `@/lib/liturgical`,
  `getEntriesByKind`/`getEntry`/`getCollectionItems`, `useResolvedImageUri`, `hearthAssetUrl`,
  `CreatorGridCard`, `saints` data + `SaintCard`.
- Retired from Explore (kept for `/browse`): `DiscoverySections`, `HeroCard`, `SeasonCard`,
  `sectionLayout`, `LatestRow`.
