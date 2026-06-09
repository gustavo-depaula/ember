# Primitives Guide — How to Author Prayer Content

This is the semantic layer over the schema. The schema lives in:

- `packages/content-engine/src/types.ts` — `FlowSection` (what you write in `flow.json`)
- `apps/app/src/content/primitives.ts` — `Primitive` (what the renderer dispatches on)
- `apps/app/src/content/preprocessFlow.ts` — how `FlowSection` becomes `Primitive`

Read this guide before authoring practice JSON. The schema will tell you *what's allowed*; this doc tells you *what to pick* and why.

---

## The core distinction: stage direction vs prayed text

When something between two prayers needs to be expressed, ask one question:

> **Will the praying person say these words aloud (or silently as part of the prayer)?**

| Answer | Use | Renders as |
|---|---|---|
| No — it instructs the user what to do, who speaks next, when this prayer applies, etc. | `rubric` | Burgundy italic instruction text |
| Yes — it's a short utterance, aspiration, or invocation prayed in the moment | `prayer` (inline, **no title**) | Plain body prayer text |
| Yes — it's a complete prayer with a name (Pater Noster, Salve Regina, etc.) | `prayer` (`ref` *or* inline with title) | Collapsible prayer block, title visible by default |
| Reflective text the user reads (rosary mystery, novena meditation) | `meditation` | Italic body text |
| A new top-level section of the practice | `heading` (or `section-marker` / `subheading`) | Section title |

### `rubric` — instructions only

A rubric is liturgical *instruction*. It explains what to do, when, or who speaks. The renderer paints it burgundy italic so the eye skips over it during prayer.

**Good rubrics** (lifted from the corpus):

```json
{ "type": "rubric", "text": {
  "en-US": "At the following verse, all bow profoundly. On the Annunciation (25 March) and Christmas (25 December), all genuflect.",
  "pt-BR": "No versículo seguinte, todos se inclinam profundamente. Na Anunciação (25 de março) e no Natal (25 de dezembro), todos se ajoelham."
}}
```
*(`content/practices/angelus/flow.json`)*

```json
{ "type": "rubric", "text": {
  "en-US": "Pause one minute in silence with your guardian angel.",
  "pt-BR": "Pause um minuto em silêncio com o seu anjo da guarda."
}}
```
*(`content/practices/tuesday-angels/flow.json`)*

```json
{ "type": "rubric", "text": {
  "en-US": "The Creed is said on Sundays, on feasts of I and II class…",
  "pt-BR": "O Credo é recitado aos domingos, nas festas de I e II classe…"
}}
```
*(`content/practices/mass/fragments/ef-credo.json` — contextual teaching about when a prayer applies)*

**Bad rubric** — text the user actually prays:

```json
{ "type": "rubric", "text": {
  "en-US": "For purity of body.",
  "pt-BR": "Pela pureza do corpo."
}}
```

"For purity of body" is an aspiration the user prays before each Hail Mary. It's prayer text, not a stage direction. Use an inline `prayer` (no title) instead — see below.

### `prayer` (inline, no title) — short prayed text

Use when the user prays a brief line that isn't a memorized full prayer with a name.

```json
{ "type": "prayer", "inline": {
  "en-US": "For purity of body.",
  "pt-BR": "Pela pureza do corpo."
}}
```

The preprocessor collapses inline prayers without a title to a plain `text` primitive — it renders as normal body prayer text, always visible, no collapse chrome. (`preprocessFlow.ts:198–199`.)

> `defaultOpen` is **not** meaningful here. It only applies to titled prayers and to `collapsible` blocks. Don't set it on inline-no-title prayers.

### `prayer` (with title or `ref`) — full prayer

For prayers that have a name and a body — Pater Noster, Hail Mary, Anima Christi, Te Deum, etc. The block renders with the title visible and the body collapsible.

```json
{ "type": "prayer", "ref": "hail-mary" }
```

Add `defaultOpen` deliberately — see the [Default-open behavior](#default-open-behavior) section.

### `meditation` — italic reflective text

For text meant to be read and contemplated, not recited:

```json
{ "type": "meditation", "text": {
  "en-US": "At the foot of the cross, Mary watches…",
  "pt-BR": "Ao pé da cruz, Maria contempla…"
}}
```

Renders as italic prayer text. Use for rosary mystery meditations, novena reflections, daily mystery introductions. Don't reach for `meditation` just because you want italic styling on a *prayer* line — the right tool there is an inline prayer; if you specifically want italic, the engine will not give it to you for `prayer`. Pick by intent.

---

## Bilingual pairing — one block per translation pair

Each language gets its own key inside `LocalizedContent`. **Never stack two languages inside one key.**

The renderer (`apps/app/src/components/prayer/BilingualBlock.tsx`) selects `primary` and `secondary` from the user's `contentLanguage` / `secondaryLanguage` preferences via `ec.localize()`. Side-by-side mode shows primary left / secondary right; tap-to-switch toggles between them. A `\n` inside a single language key means *a line break in that language* (multi-stanza hymn, multi-line antiphon) — it does **not** mean "now I'm switching to a different language."

**Wrong** — Latin and Portuguese stacked in the `pt-BR` key:

```json
{ "type": "prayer", "inline": {
  "en-US": "Mater purissima, ora pro nobis.\nMother most pure, pray for us.",
  "pt-BR": "Mater purissima, ora pro nobis.\nMãe puríssima, rogai por nós."
}}
```

A user reading in pt-BR sees Latin and Portuguese concatenated as one paragraph. The secondary-language toggle is disabled because the renderer can't distinguish the two halves.

**Right** — one key per language:

```json
{ "type": "prayer", "inline": {
  "la": "Mater purissima, ora pro nobis.",
  "en-US": "Mother most pure, pray for us.",
  "pt-BR": "Mãe puríssima, rogai por nós."
}}
```

With primary=`pt-BR` and secondary=`la`, side-by-side mode shows Portuguese left, Latin right. The user can also switch their secondary language to English and see the Latin/English pairing instead. One source of truth, three audiences.

Multi-stanza prayer in a single language uses `\n` correctly:

```json
{ "type": "prayer", "inline": {
  "pt-BR": "Santo, Santo, Santo, é o Senhor Deus dos Exércitos.\nO céu e a terra proclamam a vossa glória.\nGlória a Vós, Senhor altíssimo.",
  "la": "Sanctus, Sanctus, Sanctus, Dóminus Deus Sábaoth.\nPleni sunt cæli et terra glória tua.\nGlória tibi, Dómine altíssime."
}}
```
*(`content/practices/tuesday-angels/flow.json` — three lines of one prayer, in two languages)*

---

## Default-open behavior

Both `prayer` (titled form / `ref` form) and `collapsible` accept `defaultOpen?: boolean` (default: `false`). The engine docs at `packages/content-engine/src/types.ts:89–93` describe the intent: open when the text being on the page matters, closed when the user knows the prayer by heart.

### Stay collapsed (omit `defaultOpen`) — memorized standards

Prayers the user prays from memory. The collapsed title is a navigation cue; expanding is a deliberate "I need the words" gesture.

- Pater Noster, Ave Maria, Gloria Patri, Sign of the Cross
- Anima Christi, Salve Regina, Sub Tuum Praesidium
- Memorare, Magnificat (after frequent use)

```json
{ "type": "prayer", "ref": "hail-mary" }
```

### `defaultOpen: true` — the text *is* the moment

When the user is meant to see the words: meditations, unfamiliar prayers, day-varying content, brief invocations the user can't memorize because they change.

- Te Deum, Marian antiphons, the Leonine St. Michael, the *En ego*
- Rosary mystery meditations, novena reflections
- Daily-cycle content (the day's intention, this week's resolution)
- The Opus Dei `Mater purissima` closing aspiration

```json
{ "type": "prayer", "ref": "prayer-st-michael", "defaultOpen": true }
```
*(`content/practices/tuesday-angels/flow.json`)*

### `defaultOpenFrom: "dotted.path"` — open based on runtime context

When the answer depends on `FlowContext` — e.g., the Mass `Gloria` opens only when the day's celebration includes it. The engine resolves the path; if it coerces to a boolean, that boolean wins. If the path is missing, `defaultOpen` is the fallback.

```json
{
  "type": "collapsible",
  "title": { "en-US": "Gloria", "pt-BR": "Glória" },
  "defaultOpenFrom": "celebration.primary.includeGloria",
  "defaultOpen": false,
  "sections": [ "..." ]
}
```

### When `defaultOpen` is ignored

Inline prayers without a title (`{ type: "prayer", inline: { ... } }` with no `title` field) are not collapsible — they render as plain prayer text, always visible. Setting `defaultOpen` on them has no effect; the schema doesn't even accept it on this form. Don't write it.

### Don't use `defaultOpen` as a UX nudge

If you find yourself thinking "I'll force-open this to make the user read it once," stop. That belongs in the manifest's teaching text or in onboarding, not in a per-block flag. The flag answers a content question (does the text need to be visible for this prayer to make sense?), not a behavioral one.

---

## The `voice` field — who speaks

`voice?: 'priest' | 'people' | 'all'` appears on the `text` primitive (engine output) and on the `liturgical-prayer` container behavior. In flow JSON, you set `speaker` on an inline prayer:

```json
{ "type": "prayer", "speaker": "priest", "inline": {
  "la": "Dóminus vobíscum.",
  "en-US": "The Lord be with you.",
  "pt-BR": "O Senhor esteja convosco."
}}
```

The preprocessor turns this into a `liturgical-prayer` container that labels who speaks. Use it for Mass dialogues, the Preces' priestly invocations, and any call-and-response where the speaker role is liturgically significant.

If everyone says the line together and there's no other voice in the same exchange, leave `speaker` out — the role is implicit.

---

## Litany call-and-response

Use the `response` flow section with `verses: [{ v, r }]` — one entry per invocation. Each `v` and `r` is a `LocalizedContent`, so Latin + vernacular live together.

```json
{
  "type": "response",
  "verses": [
    {
      "v": { "la": "Mater purissima,",          "en-US": "Mother most pure,",          "pt-BR": "Mãe puríssima," },
      "r": { "la": "ora pro nobis.",            "en-US": "pray for us.",                "pt-BR": "rogai por nós." }
    },
    {
      "v": { "la": "Mater castissima,",         "en-US": "Mother most chaste,",         "pt-BR": "Mãe castíssima," },
      "r": { "la": "ora pro nobis.",            "en-US": "pray for us.",                "pt-BR": "rogai por nós." }
    }
  ]
}
```

Do **not** use the `verses` *primitive* (numbered list with `style: 'numbered' | 'vr'`) for litanies — that primitive is the engine's internal output for versicle/response and numbered lists. Authors use `response`; the engine produces the verse-list primitive.

---

## Quick reference — other flow section types

One paragraph each. See `types.ts` for the full schema.

- **`heading`** — section label inside a prayer flow (e.g., "Antiphon", "Mystery I"). Use sparingly — too many headings turn a prayer into a table of contents.
- **`subheading`** — smaller label below a heading. Used for nested structure.
- **`section-marker`** — Mass-style major division ("Initial Rites", "Liturgy of the Word"). Centered uppercase between thin rules.
- **`divider`** — horizontal rule. Use between independent prayers; don't sprinkle to "look nice."
- **`hymn`** / **`canticle`** — like `prayer`, but with a different rendered chrome. Use `ref` to point at an asset, or `inline` with a title for one-off hymns.
- **`response`** — see above.
- **`prose`** — Markdown body, either a `file` path or a `book` + `chapter` lookup. For long-form content rendered by the prose pipeline.
- **`image`**, **`gallery`**, **`holy-card`** — visual content. `gallery` supports `carousel` / `stack` / `row` layouts.
- **`select`** / **`options`** — branching. `select` picks ONE option (by context or user choice); `options` shows ALL alternatives. See `docs/features/unified-flow-system.md`.
- **`repeat`** — expand a template N times, optionally iterating over flow-local data.
- **`cycle`** / **`lectio`** / **`proper`** / **`include`** — dynamic content resolved at runtime (day-of-month/week data, lectio reading progress, Mass propers, content producers).
- **`fragment`** / **`call`** — invoke a reusable section block. `call` is the runtime variant with optional `args`.
- **`group`** — wrap sections so they collapse together (or disappear if `skipIfEmpty` and the body resolves to chrome).
- **`collapsible`** — explicit collapsible block with a title; takes `defaultOpen` / `defaultOpenFrom`. Use for dense rubric blocks or silent-priest prayers (Preparação das Oferendas, etc.) that overwhelm the audible flow.
- **`liturgical-color-scope`** / **`liturgical-color`** / **`celebration-banner`** — Mass chrome that threads the day's vestment color through descendant sections.
- **`offering`** / **`capture-movement`** / **`capture-resolution`** / **`review-resolution`** — interactive sections (intentions, thanksgivings, daily resolutions). See `docs/features/features-overview.md`.

---

## Authoring checklist

Before you commit practice JSON, run through this list:

- [ ] Every `rubric` is a genuine direction to the user, not text said aloud. (Test: "would the praying person say these words?" — if yes, it's not a rubric.)
- [ ] Latin and vernacular lines of the **same utterance** live in separate language keys (`la`, `en-US`, `pt-BR`) — never stacked in one string.
- [ ] `\n` inside a language key is for line breaks within that language only.
- [ ] Litanies use `response` + `{ v, r }`, not numbered `verses`.
- [ ] `defaultOpen` is set deliberately:
  - Omit it for memorized standard prayers.
  - Set `true` when the text must be visible (meditations, unfamiliar prayers, day-varying content).
  - Use `defaultOpenFrom` when the answer depends on `FlowContext`.
  - Don't set it on inline-no-title prayers — it has no effect.
- [ ] Multi-language `LocalizedContent` keys are written in a stable order across the corpus (`la`, `en-US`, `pt-BR` is the convention in mixed-language blocks; vernacular-only blocks order `en-US` before `pt-BR`).
- [ ] `speaker` is set on liturgical dialogues where the role matters; left out when everyone says the line together.
- [ ] After editing, run `pnpm build:corpus` and verify the practice renders the way you expect on `pnpm start:web --port 8082`.
