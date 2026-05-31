# Plan of Life Templates — Overview

> **Status:** spec-of-record for v1. Implements Workstream C of the Você redesign plan.
>
> **Source of content:** `docs/features/plan-of-life-templates.md` (research) catalogs the 15 living Catholic plans of life — their cadences, emphases, audiences, and primary sources. That file is the *content* source; this file is the *spec*. When authoring a template manifest, quote the research; do not re-derive it here.
>
> Related: `docs/features/spiritual-threads/04-plan-of-life.md` (the rule-of-life screen the templates feed into), `docs/features/corpus.md` (corpus kinds + resolution).

## Goal

A user facing an empty rule of life has no starting point. **Templates** let them inherit a living tradition's plan — Opus Dei, Salesian, the Beginner's Minimum — as a set of practices with sensible defaults and a manifesto explaining the school. Adoption is **non-destructive and cherry-pickable**: the user previews the proposed practices, toggles which to take, and the rest of their rule is untouched.

## 1. What a template is

A template is a **starter pack**, not a new data model. It composes:

1. **Practice refs** — global kind-prefixed ids (`practice/rosary`, `practice/mass`) that already exist in the corpus.
2. **Defaults per practice** — tier (`essential` / `ideal` / `extra`), schedule (the Schedule DSL), and an optional time (which derives the time block).
3. **A manifesto** — 1–3 paragraphs of "what this plan is and who it's for," shown on the template detail page.
4. **Optional resolutions** — suggested standing resolutions to pre-fill in the Resolutions panel.
5. **Optional collections** — book/chapter/proper collections to pin alongside (e.g. the Carmelite template pins *Interior Castle*, *Story of a Soul*).

Adopting a template **replays the user's own slot mutations** (`useCreatePractice` / `useAddSlot`). It does not introduce any new persistence: an adopted template leaves no "I adopted X" record — the user just ends up with practices in their rule.

## 2. Data model

A new manifest type in `apps/app/src/content/manifestTypes.ts`, reusing `LocalizedText` (from `./types`) and `Schedule` (from `@/features/plan-of-life/schedule`):

```ts
type PlanOfLifeTemplateManifest = {
  id: string                       // plan-of-life-template/opus-dei
  name: LocalizedText
  description: LocalizedText        // short blurb for the browse list
  manifesto: LocalizedText          // 1–3 para: what this is / who it's for
  attribution?: LocalizedText       // founder + primary sources
  icon?: string
  tags?: string[]
  practices: {
    ref: string                     // practice/rosary
    tier: 'essential' | 'ideal' | 'extra'
    schedule: Schedule              // reuses the existing Schedule DSL
    time?: string                   // "HH:MM" → derives time_block
    enabled?: boolean               // default true
  }[]
  resolutions?: { title: LocalizedText; text: LocalizedText }[]
  collections?: string[]            // collection/carmelite … to pre-pin
}
```

Notes:
- `tier` mirrors the app's `Tier` union; `essential` / `ideal` / `extra` matches the recolored `tierConfig`.
- `practices[].schedule` reuses the Schedule DSL verbatim (`daily`, `days-of-week`, `nth-weekday`, monthly), so a template can express "Mass daily, confession weekly, recollection monthly" without a parallel cadence model.
- `time` is optional; absent → the practice lands in the **Anytime** block.

## 3. Corpus kind

Templates are a first-class corpus kind, resolved like other deferred manifests.

- **Kind:** add `'plan-of-life-template'` to `CatalogItemKind` in `manifestTypes.ts`.
- **Authoring location:** `content/plan-of-life-templates/<id>.json` (one file per template, flat — mirrors `content/collections/`).
- **Build:** `scripts/build-corpus.py` gains `build_templates(b)`, modeled on `build_collections`: read each JSON, validate, hash to a blob, and emit a catalog entry. Called from `main()`.
- **Catalog entry shape** (`add_catalog('plan-of-life-template/<id>', …)`), hint metadata for browse-without-fetch:
  ```jsonc
  {
    "kind": "plan-of-life-template",
    "hash": "<sha256>", "size": <bytes>,
    "name": { ... }, "description": { ... },
    "icon": "❦", "tags": ["lay", "marian"]
  }
  ```
- **Resolution + warming:** resolved through `contentIndex.ts` + `store.ts` like any deferred manifest. Templates are **not** part of the offline starter pack — they warm in with the rest of the deferred kinds after boot. Add `plan-of-life-template` to the deferred-kind list in `content/resolver.ts` / `contentIndex.ts` as appropriate.

## 4. Adopt flow (preview & cherry-pick — NON-DESTRUCTIVE)

1. **Template detail** (`templates/[templateId].tsx`) — frontispiece + manifesto (rendered via `PrologueProse`) + the list of proposed practices with their tier/cadence. Reuses the illuminated detail idiom from the redesigned prayer/book pages.
2. **Adopt sheet** — a checkbox per proposed practice:
   - Practices **already in the user's rule** render disabled with a "já na sua regra" note (unchecked, not selectable).
   - All other practices are checked by default.
3. **Confirm** — the CTA reads "Acrescentar N práticas" (N = count of checked, not-already-present practices). On tap, for each checked practice it calls the existing `useCreatePractice` / `useAddSlot` mutations with the template's tier / schedule / time.
4. **Optional extras** — if the template has `resolutions`, pre-fill them into the Resolutions panel; if it has `collections`, pin them. Both are best-effort and skippable.

**No new persistence.** Adoption is purely a batch of the existing slot mutations. The user's existing rule is never overwritten, deduplicated against, or destroyed — only added to.

## 5. Entry points

Per the "link new screens" rule, templates are reachable from:

- **Você · "A REGRA" section** — a `⊹ Inspirar-se numa tradição →` row beneath the rule tree (the primary entry).
- **Explore feed** — a row pointing at the templates list.
- **Onboarding wizard (future)** — recommends 2–3 templates derived from the spiritual-checkup profile (see Open questions).

Screens live under `apps/app/src/app/(tabs)/(today,explore,library,you)/templates/`: `index.tsx` (browse list) and `[templateId].tsx` (detail + adopt).

## 6. v1 template ordering

From the research doc's "first-cut ordering," sized to the likely audience. Ship the first seven first; the rest follow.

**First wave (author now):**

1. `beginner-minimum` — The Beginner's Bare Minimum (default; the keepable plan)
2. `salesian` — Salesian, *Introduction to the Devout Life* (the friendliest real plan)
3. `opus-dei` — Opus Dei, Norms of Piety (the most complete, most-requested)
4. `ignatian` — Jesuit / Ignatian (the discerner's plan)
5. `little-way` — The Little Way of Thérèse (gentle / scrupulous)
6. `marian-consecration` — Marian Total Consecration (very pt-BR-relevant)
7. `sacred-heart` — Sacred Heart / First Fridays (pairs with pt-BR devotion)

**Second wave (the remaining 8):**

8. `carmelite` · 9. `dominican` · 10. `franciscan` · 11. `benedictine` · 12. `cursillo` (strong pt-BR Cursillo culture) · 13. `legion-of-mary` · 14. `sulpician` · 15. `byzantine` (Eastern Catholic).

Practice refs should map to corpus practices that already exist (`mass`, `rosary`, `examination-of-conscience`, `mental-prayer`, `morning-offering`, `morning-offering-sacred-heart`, `angelus`, `confession`, `holy-hour`, `little-office-bvm`, `gospel-of-the-day`, `first-friday-devotion`, `total-consecration`, `our-father`, …). Any practice a template needs but the corpus lacks is flagged `todo` for separate content work (see below). Names + manifestos are localized en-US / pt-BR.

## 7. Open questions / future

- **Onboarding integration.** The spiritual-checkup profile (`docs/features/spiritual-checkup-profiles/`) should drive a 2–3 template recommendation in the onboarding wizard. The mapping from profile → templates is undecided and parked until onboarding is built.
- **Missing-practice content TODOs.** The Byzantine template is the only v1 entry needing significant *new* practice content (daily morning/evening prayer rule, a Jesus Prayer practice, the *Trisagion*, a Byzantine fasting calendar). Templates that reference a not-yet-authored practice carry a `todo` flag until that practice ships; until then those refs are omitted from the manifest rather than dangling.
- **The remaining 8 templates.** Authored in the second wave once the first seven are validated in the running app.
- **Couples / state-of-life variants.** The research's "Holy Family — married-couple plan" honorable mention could ship as a variant layer over any template; not in v1.
- **Layer-style schools.** Brother Lawrence's *Practice of the Presence of God* and the Charismatic Renewal read as a *layer* on top of another plan rather than a standalone template; deferred.
