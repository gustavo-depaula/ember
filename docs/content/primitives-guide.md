# Primitives Guide: How to Author Prayer Content

The schema says what's allowed: `FlowSection` in `packages/content-engine/src/types.ts` (what you write in `flow.json`), `Primitive` in `apps/app/src/content/primitives.ts` (what the renderer dispatches on), and `apps/app/src/content/preprocessFlow.ts` between them. This guide says what to pick, and why. For worked examples of the flow DSL (`select`, `repeat`, `cycle`, `fragment`), read `content/practices/rosary/`.

## Stage direction or prayed text?

Ask one question of anything between two prayers: **will the praying person say these words?**

| Answer | Use | Renders as |
|---|---|---|
| No: it says what to do, who speaks, when this applies | `rubric` | Red italic instruction |
| Yes: a short aspiration or invocation | `prayer` with `inline` | Plain prayer text, always visible |
| Yes: a complete named prayer (Pater Noster, Salve Regina) | `prayer` with `ref`, or `title` + `sections` | Collapsible block, title visible |
| No: reflective text to read (rosary mystery, novena meditation) | `meditation` | Italic body text |
| A new division of the practice | `heading`, `subheading`, `section-marker` | Section title |

### `rubric`: instructions only

A rubric is instruction. It renders red italic so the eye skips it during prayer.

```json
{ "type": "rubric", "text": {
  "en-US": "At the following verse, all bow profoundly. On the Annunciation (25 March) and Christmas (25 December), all genuflect.",
  "pt-BR": "No versículo seguinte, todos se inclinam profundamente. Na Anunciação (25 de março) e no Natal (25 de dezembro), todos se ajoelham."
}}
```
*(`content/practices/angelus/flow.json`)*

"For purity of body", prayed before each Hail Mary, is **not** a rubric: the person says it. It is an inline `prayer`.

Rubrics take the same `*italic*` / `**bold**` / `***both***` markdown as prayer bodies, resolved against an italic baseline. Because the rubric is already italic, `*x*` flips to **roman**, the printer's convention for emphasis inside italics. `**x**` keeps the slant and adds weight; `***x***` is bold roman. Use emphasis as a missal does: titles of works (`the encyclical *Quamquam Pluries*`), foreign terms, quoted prayer text, and the one clause the eye must not skip. Emphasizing half a sentence lights nothing.

### `prayer`: three forms

- **`inline`** (no title): a short prayed line. The preprocessor turns it into a plain `text` primitive with no collapse chrome, so it takes no `defaultOpen`.
- **`ref`**: a named prayer from the corpus (`{ "type": "prayer", "ref": "hail-mary" }`). Collapsible.
- **`title` + `sections`**: a named prayer written in place. Collapsible.

### `meditation`

For text to be read and contemplated, not recited. Pick it by intent, never to get italic on a prayed line; the engine won't italicize a `prayer` for you.

### `psalm`: a cento, one reference per verse

For a psalm stitched from verses drawn from all over Scripture (St Francis' offices are built this way), so every line carries its own citation:

```json
{ "type": "psalm", "verses": [
  { "ref": { "en-US": "Ps. 55:9", "pt-BR": "Sl 55,9" },
    "text": { "en-US": "O God, I have declared to Thee my life…",
              "pt-BR": "Ó Deus, eu vos expus a minha vida…" } }
]}
```

**Never bake the citation into the prayed text.** Inside a `prayer`, `"Ps. 55:9. O God…"` renders the reference at the weight of the words prayed. `ref` renders as a muted lead-in that a screen reader skips. It is localized because the conventions differ: English `Ps. 55:9`, Portuguese `Sl 55,9`. Omit `ref` on a doxology or any line that isn't a quotation.

Use `psalm` only for centos. A psalm recited whole belongs in an `include` of `producer/psalmody` (resolved from the psalter by reference), or, if short and fixed, an inline `prayer`.

## One language per key

Each language gets its own key in `LocalizedContent`. **Never stack two languages in one key.** The renderer (`apps/app/src/components/prayer/BilingualBlock.tsx`) picks primary and secondary from the user's language preferences for side-by-side or tap-to-switch; it cannot split a stacked string.

```json
{ "type": "prayer", "inline": {
  "la": "Mater purissima, ora pro nobis.",
  "en-US": "Mother most pure, pray for us.",
  "pt-BR": "Mãe puríssima, rogai por nós."
}}
```

Written this way, one source serves pt-BR/Latin, pt-BR/English and English/Latin readers. Writing `"pt-BR": "Mater purissima, ora pro nobis.\nMãe puríssima, rogai por nós."` shows both as one paragraph and disables the secondary-language toggle.

`\n` inside a key is a line break *in that language* (hymn stanzas, a multi-line antiphon), never a language switch.

Order keys consistently: `la`, `en-US`, `pt-BR` in mixed blocks; `en-US` before `pt-BR` otherwise.

## `defaultOpen`

Titled `prayer`s (`ref` or `title` form) and `collapsible` take `defaultOpen` (default `false`). It answers a content question: does the text need to be on the page for this prayer to make sense?

- **Omit it** for prayers said from memory: Pater Noster, Ave Maria, Gloria Patri, Sign of the Cross, Anima Christi, Salve Regina, Sub Tuum Praesidium, Memorare. The collapsed title is a navigation cue; expanding is a deliberate "I need the words."
- **`true`** when the words are the moment: Te Deum, Marian antiphons, the Leonine St. Michael, the *En ego*, litanies, mystery meditations, novena reflections, day-varying content (the day's intention, this week's resolution).
- **`defaultOpenFrom: "dotted.path"`** (on `collapsible`) when the answer depends on `FlowContext`, e.g. the Mass Gloria opens on `celebration.primary.includeGloria`. If the path resolves to a boolean it wins; otherwise `defaultOpen` applies.

Never use it as a nudge ("force it open so they read it once"). That belongs in the manifest's teaching text.

## `speaker`: who speaks

Set `speaker: 'priest' | 'people' | 'all'` on an inline `prayer` for Mass dialogues, the Preces, and any call-and-response where the role is liturgically significant. The preprocessor turns it into a `liturgical-prayer` container that labels the speaker. When everyone says the line and no other voice shares the exchange, leave it out.

## Litanies

Use `response` with `verses: [{ v, r }]`, one entry per invocation, each `v` and `r` a `LocalizedText`:

```json
{ "type": "response", "verses": [
  { "v": { "la": "Mater purissima,", "en-US": "Mother most pure,", "pt-BR": "Mãe puríssima," },
    "r": { "la": "ora pro nobis.", "en-US": "pray for us.", "pt-BR": "rogai por nós." } }
]}
```

The `verses` *primitive* is engine output, not something authors write.

## Pinning a select

`pin: true` on a top-level `select` (with an `as` key) lets a plan slot fix one option, so the slot becomes that option: an office's Prime, or the rosary's Glorious Mysteries, gets its own row in Today. Pin only when the choice is *what* is prayed, not *how* (the Mass form and the gospel commentary are preferences, not pins). An option opts out with `pin: false` and may set a default slot `time`.

## Other section types

- **`heading`** / **`subheading`**: short labels only. Both render at display size, so a descriptive clause becomes four lines of display italic; put the description in the block below. Too many headings turn a prayer into a table of contents.
- **`section-marker`**: a major Mass division ("Liturgy of the Word"); `colorFrom` tints its rules in the day's vestment color.
- **`divider`**: between independent prayers only, never for decoration.
- **`hymn`** (`ref` or `inline`) / **`canticle`** (`ref`, or `inline` with `title`): like `prayer`, with their own chrome.
- **`prose`**: markdown from a `file`, or a `book` + `chapter`.
- **`image`**, **`gallery`** (`carousel` / `stack` / `row`), **`holy-card`**.
- **`select`** shows one option (chosen by context or by the user); **`options`** offers every alternative as a picker.
- **`repeat`**: a template N times, or once per item of flow-local data (`from`).
- **`cycle`** / **`lectio`** / **`include`**: content resolved at runtime (day-indexed data, reading-plan progress, content sources).
- **`fragment`** / **`call`**: invoke a reusable block; `call` passes `args`.
- **`group`**: sections that belong together; `skipIfEmpty` drops it when its body resolves to chrome only.
- **`collapsible`**: a titled block, for dense rubrics or silent priest's prayers (Preparação das Oferendas) that would swamp the audible flow.
- **`liturgical-color-scope`** / **`liturgical-color`** / **`celebration-banner`** / **`choice-rich-text`**: Mass chrome driven by the day's celebration.

## Checklist

- Every `rubric` is a direction, not words said aloud; emphasis in it marks a span worth spotlighting.
- Headings are short labels.
- One language per key; `\n` only for line breaks within a language.
- Litanies use `response`.
- `defaultOpen` is set deliberately, and never on an inline prayer.
- `speaker` is set where the role matters.
- `pnpm validate-flows`, then `pnpm build:corpus` with `pnpm hearth` serving, and check the practice in the app.
