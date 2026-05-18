# Content Producers

A small extension point for content that needs to be **computed at runtime** instead of declared in JSON. Producers coexist with the static declarative model — they are opt-in per item, addressable by ref, composable into static flows. Most content stays declarative.

> See `docs/features/features-overview.md` for the flow DSL and the static model. See `docs/content/book-format.md` for the bundled-book format that external books extend. See `docs/ARCHITECTURE.md` for the corpus model.

---

## Why

Three pressures push past pure-static content:

1. **The Mass flow is split-brain.** `packages/mass-of/src/source.ts` already owns the gnarly logic (precedence, Gloria gating, preface hydration, memorial fold-in). `content/practices/mass/flow.json` + 37 fragments mirror those decisions structurally. Maintenance touches both sides. Code should own the flow shape too.

2. **Some books can't be bundled.** CCC (vatican.va), iBreviary, Lírio Católico, Escriva works, papal documents. Copyright posture forbids redistribution through Hearth. They must be fetched at runtime from the source and rendered in our reader — with catalog entries + addressability in Hearth, but content bytes never on `ember.dpgu.me`.

3. **Daily snippets should drop into static practices.** "Today's gospel," "word of the day," "today's office reading" — block-level, composable into any morning routine. The extension point can't be "swap a whole practice"; it must inline at any depth in any flow.

All three want: content computed at runtime, addressable by ref, composable into static flows, treated uniformly by pinning / caching / search. One small abstraction covers them.

---

## The Producer

A **producer** is a built-in code function in its own package:

```ts
produce(ctx: ProduceContext): Promise<FlowBlock[] | { html: string; anchors: AnchorIndex }>
```

Registered by id in a registry. Invoked through the catalog. Output type matches the consumer:

- **Flow producers** (Mass, gospel-of-the-day) emit `FlowBlock[]` — the same type the content-engine renders today.
- **Reader-content producers** (external book chapters, excerpts) emit cleaned HTML + a small sidecar of anchor ids → offsets/metadata. The existing book WebView (`apps/app/src/features/books/bookReader.ts`) consumes HTML; producers slot in without rewriting the reader.

Attribution, cache behavior, and any per-source policy live inside the producer's own code — there are no declarative manifest fields for them. A catalog entry is just `{ id, kind: 'flow' | 'reader' }` (alongside the standard `name`, `description`, etc.).

Producers are explicitly opt-in per item; the flow DSL keeps all its existing primitives unchanged.

### When to reach for a producer vs. static JSON

Default to static JSON. Reach for a producer when one or more of:

- The shape branches on context the flow DSL can't express ergonomically (Mass: rite + season + day + propers + sanctoral precedence).
- The content lives off-corpus (external book chapters, third-party APIs).
- The content varies daily by external state we don't bundle (today's gospel from a readings API).

A fixed-day novena is static. A plain prayer is static. A Rosary with day-of-week mystery selection is static (the existing `select` + `repeat` primitives handle it). The Catechism of the Catholic Church chapters are a producer (vatican.va fetch). The Mass flow is a producer.

---

## The `include` primitive

New element in the flow DSL — the load-bearing piece for composability:

```json
{ "type": "include", "ref": "producer/gospel-of-the-day", "params": { "translation": "drb" } }
{ "type": "include", "ref": "producer/breviary-of-the-day", "params": { "hour": "vespers", "rite": "of" } }
{ "type": "include", "ref": "producer/mass-flow", "params": { "rite": "of" } }
{ "type": "include", "ref": "book/ccc#507-509" }
```

`include` resolves the ref at render time, merges `params` into the current `FlowContext`, invokes the producer, and inlines the result. Usable at any depth: inside `select` branches, inside `repeat` loops, inside `cycle` sections, at the top level of a flow. The same primitive handles producer refs and anchored book refs (for inline excerpts) — the resolver dispatches on ref kind.

This is what makes the composable case trivial:

```json
// content/practices/my-morning-routine/flow.json
{
  "sections": [
    { "type": "prayer", "ref": "morning-offering" },
    { "type": "include", "ref": "producer/gospel-of-the-day" },
    { "type": "include", "ref": "producer/word-of-the-pope" },
    { "type": "prayer", "ref": "our-father" }
  ]
}
```

The Mass case is the same primitive at the root:

```json
// content/practices/mass/flow.json
{ "sections": [{ "type": "include", "ref": "producer/mass-flow", "params": { "rite": "of" } }] }
```

`practice/mass` is a normal practice with a normal static manifest; nothing about the practice schema changes. The flow itself is the only thing that delegates.

For reader content (excerpts rendered outside the flow engine), the equivalent is `<Excerpt ref="…" />` — same indirection, same resolver path.

---

## Anchored refs

Ref grammar extension for sub-document addressability:

| Form | Meaning |
|---|---|
| `kind/id` | Whole item (existing). |
| `kind/id#anchor` | Point within the item. For books, `anchor` is a paragraph id, heading slug, or producer-defined string. |
| `kind/id#a-b` | Inclusive range (for excerpts and reading blocks). |

The resolver (`apps/app/src/content/resolver.ts`) extends to return `{ chapter, anchorRange }` when given an anchored book ref. Two entry points share the resolution:

- `openBook(ref)` — full reader navigation; scrolls to the anchor and (optionally) highlights it.
- `<Excerpt ref="…" />` — inline excerpt; extracts the HTML subtree between anchor ids and renders it with attribution and a tap-to-open-full affordance.

Examples:

- `book/ccc#507` — opens CCC at paragraph 507.
- `book/ccc#507-509` — three-paragraph excerpt.
- `practice/mass#collect` — addresses today's Collect inside the Mass flow (producers populate ids on well-known slots).

---

## External books

Books that fetch from a third-party source at runtime extend the existing `BookEntry` shape (`apps/app/src/content/manifestTypes.ts:155-166`) with three optional fields:

- `source?: { type: 'external'; producer: string; homepage: string }` — presence means chapters are produced at runtime. `producer` is the producer id (e.g. `producer/ccc-chapter`). `homepage` is the link surfaced in the reader chrome.
- `chapters[chapterId][lang]` becomes a discriminated union: existing `{ type: 'blob'; hash; size; format? }` or new `{ type: 'external'; url: string }`.
- `anchors?: Record<anchor, { chapter: string }>` — optional anchor → chapter index, used to resolve `book/<id>#<anchor>` to the right chapter URL without scanning. Producers can compute the index implicitly when URL structure encodes anchors (e.g. vatican.va CCC has deterministic `__P<N>.HTM` files); for hand-authored books the build pipeline emits it from heading ids.

### Reader changes

The existing WebView reader (`apps/app/src/features/books/bookReader.ts`) gains three small, localized additions:

1. **`data-ref` click handler** — WebView JS catches clicks on `<a data-ref="bible/mt-5:3">` (or any other ref), postMessages the ref to RN, which dispatches via the resolver. Bible refs open the Bible reader; book refs open the book reader at the anchor; producer refs invoke the producer.
2. **`scrollToAnchor(id)` message** — uses native `element.scrollIntoView()` within the column-paginated layout.
3. **Subtree extraction helper** — small DOM helper that pulls the HTML between two anchor ids; used by `<Excerpt>`.

Producers for reader content emit HTML with `<a data-ref="…">` for tappable refs (scripture citations, internal cross-references) and `id` attributes on addressable paragraphs. Bundled markdown continues through `marked` as today.

### Cache & pinning

External chapters cache in a new SQLite table keyed by `(book, chapter, lang, producerVersion)` storing cleaned HTML + the anchor sidecar. TTL set by the producer; "Fetched X ago" badge in the reader chrome; manual refresh.

Pinning extends the existing collector (`apps/app/src/features/pinning/pinningManager.ts`) to walk an external book's ToC and fetch each chapter into the cache. Reuses the existing LRU (`apps/app/src/content/store.ts:204-231`); same 200MB soft cap; pinned external content protected from eviction like pinned blobs.

The cache lives **only on-device**. Hearth never holds third-party bytes — that's the legal load-bearing decision.

---

## Mass producer

New built-in producer `producer/mass-flow` in `packages/mass-producer/` (new package). Consolidates the split-brain between code and JSON.

**Producer surface:**

```ts
produce(ctx: { date; rite: 'of' | 'ef'; lang; userPrefs? }): Promise<FlowBlock[]>
```

Internally calls `massOfSource.load(ctx)` (existing, in `packages/mass-of/src/source.ts`) for `DayLiturgies`, then assembles the flow blocks: introduction, penitential act, conditional Gloria, Liturgy of the Word (cycle-aware slot pickers), profession of faith on Sundays/Solemnities, Universal Prayer, Liturgy of the Eucharist (preface alternatives), communion rite, dismissal. All gating that today lives in `deriveIncludeGloria`, `applyPrecedence`, `hydratePreface`, sanctoral precedence is a flow-shape decision in code — the structural mirror in fragments goes away.

**What changes on disk:**

- `content/practices/mass/manifest.json` — preserved as-is; no schema change.
- `content/practices/mass/flow.json` — collapses to a single `include` of `producer/mass-flow`.
- `content/practices/mass/fragments/*` — deleted or migrated into small builder functions inside the producer package (`packages/mass-producer/blocks/introductoryRites.ts`, `actOfContrition.ts`, `dismissal.ts`). Each is testable in isolation.

**Runtime dispatch.** The `include` primitive in the flow engine sees `ref: 'producer/mass-flow'`, looks up the producer in the registry, inlines the returned blocks. No new mass-specific runtime path — the same machinery composable producers use.

**Rite split (OF vs EF):** the spec leaves the mechanic open. Options: one producer with a rite branch, or two producer ids (`producer/mass-of-flow`, `producer/mass-ef-flow`) selected by the manifest based on user preference. Recommend the latter — `mass-of` is already a self-contained package; an EF flavor lives parallel.

**Migration.** Register the producer behind a flag (e.g. catalog entry exists but `flow.json` still uses fragments). Diff producer output against the current rendered shape day-by-day across a representative liturgical year (Christmas, Holy Week, Easter Vigil, Pentecost, Corpus Christi, weekday OT, sanctoral solemnity vs Sunday, etc.). Once parity holds, replace `flow.json` with the single `include` and delete the fragments.

**Anchored refs into Mass.** Producer emits flow blocks with `id` set on well-known slots (`collect`, `gospel`, `preface`, etc.). Other content can cite "today's collect" or "this Sunday's Gospel" via `practice/mass#collect`, etc.

---

## Planned producers

| Producer id | Source | Notes |
|---|---|---|
| `producer/mass-flow` | `packages/mass-of` + new code | Spec'd above. Consolidates the Mass flow. |
| `producer/ccc-chapter` | vatican.va CCC | First external book. Replaces `apps/app/src/lib/catechism.ts` + `app/catechism/index.tsx`. |
| `producer/breviary-of-the-day` | iBreviary (https://www.ibreviary.org/en/tools/ibreviary-on-your-website.html) | Friendly integration — lang/rite/hour parameters. |
| `producer/gospel-of-the-day` | Catholic readings API (TBD source) | Composable example. |
| `producer/word-of-the-pope` | vaticannews.va word-of-the-day | Composable example. |
| `producer/encyclical-section` | vatican.va archives | Shared producer package with `ccc-chapter`. |
| `producer/lirio-chapter` | liriocatolico.com.br | Partnership-gated. |
| `producer/escriva-chapter` | escrivaworks.org | Legal-gated. |

Each producer lives in its own package under `packages/producers/<id>/` (or alongside related code where it makes sense — `packages/mass-producer/`). Each package owns its fetch/parse/cache logic.

---

## Deferred — future directions

These are mentioned here so we don't pretend they don't exist; they are not designed in this spec and should not be built until a concrete need appears.

- **Declarative-recipe runtime.** Once 3–4 built-in producers converge on the same shape (likely HTML extraction with selectors + linkify + anchors), extract the shared pieces into a JSON recipe interpreted by an in-app runtime. Until then, each producer is its own code — premature abstraction risk outweighs the duplication.
- **Reader IR / unified `Block` type.** Today's WebView+HTML reader is sufficient. Adding a structured IR pays off only when we want multiple render targets (audio reader, summary cards), structured highlights synced to a data model, or complex programmatic composition across producers. Doing it later is cheap because IR would be internal — convert HTML↔IR adapter-side, consumers stay the same.
- **Web parity for external fetching.** Native uses `fetch()` directly. Web needs either a thin no-store CORS proxy or a "open original" fallback. Resolve when a real source forces the decision.
- **Lírio Católico partnership.** Approach the site owner about a JSON endpoint instead of scraping — better for both sides.
- **Escriva legal posture.** Confirm transient display with attribution is acceptable before any adapter work.
- **iBreviary terms-of-use review** before shipping the producer.

---

## Decisions captured

- Static declarative content stays the default. Producers are opt-in per item, addressable by ref.
- Producers emit the shape their consumer already understands: `FlowBlock[]` for flow producers, cleaned HTML + anchor sidecar for reader producers. No unified type upfront.
- Composition via the new `include` primitive — usable at any depth, supports `params`. Whole-practice producers (Mass) are just `include` at the root.
- Producers are built-in code packages in the initial design. No shared declarative-adapter runtime; iBreviary, vatican.va, and Lírio each live as their own package with whatever fetch/parse code they need.
- Tappable refs and anchored navigation in the reader work via `data-ref` attributes and HTML `id`s, caught by the WebView shell. No new rendering pipeline.
- Sub-document addressability via anchored refs (`kind/id#anchor[-anchor]`) is first-class and uniform across bundled books, external books, and producer-emitted flow content.
- Cache for third-party content lives only on-device. Hearth never holds third-party bytes.
