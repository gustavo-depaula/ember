# Galleries

> Grouped images — captioned carousels for browsing, side-by-side rows for composition. One primitive, one renderer, two surfaces.

Today, multi-image content is fragmented: the chapter `type: "gallery"` section type exists but is flattened to individual `image` primitives before render (`apps/app/src/content/preprocessFlow.ts:95`), so the `title` field is silently dropped and the carousel component (`apps/app/src/components/prayer/GalleryBlock.tsx`) is vestigial. Books have no multi-image authoring affordance at all — only single markdown images.

This spec consolidates both into a single `gallery` primitive with three display modes, authored via JSON in practice/chapter flows and via two markdown directives (`:::gallery`, `:::row`) in book chapters.

---

## Authoring model

### Schema

```ts
// packages/content-engine/src/types.ts
export type GalleryPrimitive = {
  type: 'gallery'
  display: 'carousel' | 'stack' | 'row'   // default: 'carousel'
  items: Array<{
    src: string
    alt?: BilingualText                    // a11y label, not shown
    title?: BilingualText                  // shown if present
    attribution?: BilingualText            // shown if present
    caption?: BilingualText                // shown if present; markdown allowed
  }>
  caption?: BilingualText                  // shared caption under the whole group
  weights?: number[]                       // row-only; defaults to uniform; length must match items.length
}
```

`src` is the only required field per item. Every display mode accepts every optional field; missing fields render nothing, never a placeholder.

### Display modes

| Mode | Use it for | Layout |
|---|---|---|
| `carousel` | Browsing one image at a time with captions worth reading | Snap-scroll, one slide visible at a time, dots, peek of next slide at edge |
| `stack` | Long-form captions; multiple images embedded in reading flow | Vertical block flow; each image a full-width figure |
| `row` | Side-by-side composition (before/after, comparison, two paintings) | Equal-width grid when items fit; bleed-and-swipe when they don't |

### Row sizing rule

`row` does not wrap and does not have a hard item cap. The renderer picks layout based on whether items fit comfortably (target minimum ~140px per image):

- **Items fit** → CSS grid, equal widths (or `weights`-driven), no scroll, no bleed.
- **Items don't fit** → horizontal scroll-snap with the next image bleeding in at the edge. The bleed itself is the swipe affordance — no dots, no chrome.

A `row` of 6 narrow images on a phone becomes a swipeable strip; the same row on a tablet shows all six side-by-side. No author intervention.

Validator soft-warns above 4 items so authors are nudged toward `:::gallery` when the intent is browsing, not composition. No hard error.

---

## Markdown directives (Books)

Two directives, same emitted HTML, different default `display`. Implemented as one [container-directive](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) marked extension.

### `:::gallery`

```markdown
:::gallery
![Sacred Heart of Jesus](images/batoni.jpg "Pompeo Batoni, 1767")
The most influential Sacred Heart painting. Batoni's composition became the
definitive iconographic model.

![Pietà](images/bouguereau.jpg "William-Adolphe Bouguereau, 1876")
Bouguereau's luminous Academic realism depicts the pierced Christ in Mary's arms.
:::
```

### `:::row`

```markdown
:::row
![](images/before.jpg)
![](images/after.jpg)
:::

The altar before and after the 1947 restoration.
```

The trailing paragraph is *not* part of the row — it's regular markdown prose. For a shared caption inside the figure, use the `caption` attribute (rare; usually inline prose reads better).

### Field mapping

Inside both directives, items are standard markdown image lines. The mapping is identical:

| Markdown | Primitive field |
|---|---|
| `![alt](src)` alt text | `title` |
| `![](src "title")` markdown's third arg | `attribution` |
| Paragraph immediately following the image | `caption` (markdown formatting preserved) |

A blank paragraph break separates one item from the next. The mapping is symmetric across directives so authors don't need to learn two grammars.

### Attribute form

For the rare cases markdown can't express:

```markdown
:::row{weights="2,1"}
![](images/main.jpg)
![](images/detail.jpg)
:::
```

Supported attributes: `display`, `weights`, `caption`.

### Degradation

If the marked extension is missing (e.g. rendered outside Ember), `:::gallery` and `:::row` become regular fenced blocks displaying the literal text, while the `![]()` lines inside still render as standalone images. The content survives; only the layout is lost.

---

## Practice / Chapter JSON

Same shape as the schema. Two examples:

### Carousel chapter (Sacred Heart in art)

```jsonc
{
  "type": "gallery",
  "display": "carousel",
  "items": [
    {
      "src": "images/batoni-sacred-heart.jpg",
      "title":       { "en-US": "Sacred Heart of Jesus", "pt-BR": "Sagrado Coração de Jesus" },
      "attribution": { "en-US": "Pompeo Batoni, 1767",    "pt-BR": "Pompeo Batoni, 1767" },
      "caption":     { "en-US": "The most influential...", "pt-BR": "A pintura mais influente..." }
    }
  ]
}
```

`content/chapters/sacred-heart-in-art/content.json` already matches this shape (minus `display`, which defaults to `carousel`). No content migration needed.

### Side-by-side comparison

```jsonc
{
  "type": "gallery",
  "display": "row",
  "items": [
    { "src": "images/before.jpg", "alt": { "en-US": "Altar before restoration", "pt-BR": "Altar antes da restauração" } },
    { "src": "images/after.jpg",  "alt": { "en-US": "Altar after restoration",  "pt-BR": "Altar após a restauração" } }
  ],
  "caption": { "en-US": "The altar before and after 1947.", "pt-BR": "O altar antes e depois de 1947." }
}
```

---

## Rendering

### Practices (React Native)

`GalleryBlock` already implements the carousel case. Extend it:

```tsx
// apps/app/src/components/prayer/GalleryBlock.tsx
function GalleryBlock({ display, items, caption, weights }: GalleryPrimitive) {
  if (display === 'stack') return <Stack items={items} caption={caption} />
  if (display === 'row')   return <Row items={items} caption={caption} weights={weights} />
  return <Carousel items={items} caption={caption} />
}
```

- **Carousel** — existing implementation: FlatList with `snapToInterval`, 24px peek, dots, tap → `ImageViewer` lightbox.
- **Stack** — vertical `<YStack>` of figures; each figure is title / attribution / image / caption.
- **Row** — flex layout. Measure container width on mount; if `items.length * 140 <= containerWidth`, render as `<XStack>` with equal/weighted widths; else render as `FlatList` with `snapToInterval = containerWidth * 0.85`, no dots (bleed is the affordance). Tap → lightbox seeded to tapped index.

All three modes share the same lightbox (`ImageViewer`) and accessibility hooks.

Per-item captions render below each image in `stack` and `row`; in `carousel` they render below the dots, anchored to the current slide.

### Books (WebView)

The marked extension emits a uniform HTML shape with `data-display`:

```html
<figure class="ember-gallery" data-display="row" data-count="2">
  <div class="ember-gallery-track">
    <div class="ember-gallery-slide" data-weight="1">
      <img src="images/before.jpg" alt="Altar before restoration" />
      <figcaption><p>Photographed 1947.</p></figcaption>
    </div>
    <div class="ember-gallery-slide" data-weight="1">
      <img src="images/after.jpg" alt="Altar after restoration" />
      <figcaption><p>Photographed 2018.</p></figcaption>
    </div>
  </div>
  <figcaption class="ember-gallery-caption">The altar before and after 1947.</figcaption>
</figure>
```

CSS in the WebView reads `data-display` and `data-count`:

```css
.ember-gallery[data-display="row"] .ember-gallery-track {
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  gap: 12px;
}

/* Bleed-and-swipe when items don't fit (container-query based) */
@container (max-width: calc(140px * var(--count) + 12px * (var(--count) - 1))) {
  .ember-gallery[data-display="row"] .ember-gallery-track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
  }
  .ember-gallery[data-display="row"] .ember-gallery-slide {
    flex: 0 0 75%;
    scroll-snap-align: start;
  }
}

.ember-gallery[data-display="carousel"] .ember-gallery-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.ember-gallery[data-display="carousel"] .ember-gallery-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.ember-gallery[data-display="stack"] .ember-gallery-slide {
  display: block;
  margin-block: 24px;
}
```

A small JS shim in the WebView host:
- Tracks scroll position on `carousel` → updates dot indicators.
- Listens for `click` on `<img>` → `postMessage` to React host → opens `ImageViewer` lightbox seeded with all sibling items.

Image inlining at `bookReader.ts:428` continues to substitute `<img src="…">` with base64 data URIs unchanged — wrapper HTML is irrelevant to that pass.

### Reader pagination interaction

The reader paginates via CSS columns. `carousel` and `row`-in-bleed-mode contain horizontal scroll inside one column page. To prevent column-fragmentation breaking a gallery across pages, every `.ember-gallery` gets `break-inside: avoid`.

When a gallery is too tall for the remaining column space, it pushes to the next column page in full. This is intended.

---

## Workshop preview

`apps/workshop/src/features/flow-editor/FlowNodeForm.tsx` already understands gallery; extend the form with:

- `display` selector (carousel / stack / row).
- `weights` field, visible only when `display === 'row'`.
- Live preview rendering the chosen mode.

---

## Validation

`scripts/validate-flows.ts` and `packages/content-engine/src/types.ts`:

- `items.length >= 1`. Empty galleries fail.
- `display ∈ { 'carousel', 'stack', 'row' }`. Default `'carousel'`.
- `weights?.length === items.length` when `weights` is present.
- `weights` only valid when `display === 'row'`.
- **Soft warning** (not error): `display === 'row' && items.length > 4` → suggest considering `carousel`.
- `src` must resolve against the practice / chapter / book image manifest.

---

## Implementation plan

In dependency order:

1. **Types** — `GalleryPrimitive` in `packages/content-engine/src/types.ts` and `apps/app/src/content/primitives.ts`.
2. **Engine pass-through** — `packages/content-engine/src/engine/resolve.ts` stops flattening; `apps/app/src/content/preprocessFlow.ts:95` emits the primitive.
3. **Validator + Workshop form** — `scripts/validate-flows.ts`, `apps/workshop/src/features/flow-editor/FlowNodeForm.tsx`.
4. **GalleryBlock extension** — add `stack` and `row` branches; restore `title`; expose `display` prop.
5. **PrimitiveBlock wiring** — `case 'gallery'` in the switch.
6. **Marked extension** — `:::gallery` and `:::row` container directive in `apps/app/src/features/books/bookReader.ts`.
7. **WebView CSS + JS shim** — `apps/app/src/features/books/ReaderWebView.tsx`.
8. **Lightbox seeding** — `ImageViewer` accepts an array of sibling items and an initial index, in both RN and WebView paths.
9. **Backfill content** — Sacred Heart in Art becomes a carousel by default; one row example added to a Liguori chapter to exercise the book path.
10. **Journal entry** — note the marked-extension pattern, since it's the first non-footnote markdown extension and future authors will reach for it.

---

## Non-goals

- Video, animated GIF, audio.
- Lazy-loaded remote galleries — pinning/blob pipeline is untouched.
- Authoring UI for images (paste-from-clipboard, drag-to-reorder) — Workshop form is JSON-edit only.
- Per-item navigation links ("tap this mystery to open it") — separate concern, not bundled here.
- Print / EPUB export styling — handled if/when the EPUB pipeline lands.

---

## Open implementation questions

- **Container queries support** — the WebView's column-paginated layout may or may not support `@container` on every target. Fallback: a small JS measurement on `resize` + `data-overflow` attribute toggling between `grid` and `flex`. Resolve during the WebView CSS task.
- **Tap vs. swipe disambiguation on row** — RN's FlatList + Pressable interaction is fine, but verify on iOS where horizontal pan competes with the reader's swipe-to-next-page gesture. May need a small drag-threshold tweak.
- **Image dimensions for layout stability** — currently `<img>` has no width/height set, so reflow happens on load. The book manifest could carry width/height per image; if not, defer to a v1.1 polish.
