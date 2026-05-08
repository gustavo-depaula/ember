# Contributing to Ember

Ember is a free Catholic prayer app and an open platform for the Catholic literary tradition — spiritual classics, Church Fathers, formation guides, liturgical texts — in open formats, freely available to all.

Contributions are welcome — whether you're fixing a bug, adding a prayer, translating a spiritual classic, or improving documentation.

## Licensing — Public Domain Dedication

Everything in this repository is [dedicated to the public domain](LICENSE). By submitting a pull request, you agree to dedicate your contribution to the public domain under the same terms.

In jurisdictions where public domain dedication is not legally recognized:
- **Code** falls back to [0BSD](https://opensource.org/license/0bsd)
- **Content** (prayers, translations, liturgical data, books) falls back to [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

You may only contribute content you have the right to release. Public domain source texts are ideal. If your source is under a specific license (e.g., CC BY), note it clearly in your PR.

The fruits of Catholic tradition should be freely available to all. No one should own what belongs to the Church and to humanity.

## Ways to Contribute

- **Report bugs or suggest features** — [open an issue](https://github.com/gustavo-depaula/prayer/issues)
- **Contribute code** — bug fixes, new features, engine improvements
- **Contribute content** — prayers, practices, books, translations, collections
- **Improve documentation** — specs, guides, corrections

## Code Contributions

1. Fork the repo and create a branch from `main`
2. Read the [Conventions](docs/CONVENTIONS.md) and [Architecture](docs/ARCHITECTURE.md) before writing code
3. Follow the docs-first workflow: if your feature doesn't have a spec in `docs/features/`, write one first
4. Run `pnpm biome check --write .` before submitting
5. Run `pnpm test` to verify nothing is broken
6. Open a PR with a clear description of what changed and why

## Content Contributions

All content is distributed as a **content-addressed corpus** at `https://ember.dpgu.me/hearth/v2/`. Every prayer, practice, book chapter, Mass proper, and collection is a first-class corpus item with a stable kind-prefixed id (`practice/rosary`, `prayer/our-father`, `book/montfort-true-devotion`, `collection/carmelite`). Source files live flat-by-kind under `content/`; the build pipeline hashes them into immutable blobs.

- **Practices** are pure JSON — a `manifest.json` + `flow.json` describe the prayer flow. No app code needed.
- **Books** are HTML or Markdown chapters organized by language.
- **Prayers** are reusable text assets with multilingual support.
- **Collections** are tiny JSON manifests that reference other corpus items to group them under a curated heading.

To understand the content model:
- [Content & Collections](docs/features/corpus.md) — corpus format, pinning, content distribution
- [Book format](docs/content/book-format.md)
- [Content sources & licensing](docs/content/content-sources.md)
- [Content pipeline](docs/content/PIPELINE.md) — see what's published, in progress, and where help is needed

Content lives at the corpus root, one folder per kind: `content/prayers/`, `content/practices/`, `content/chapters/`, `content/books/`, `content/collections/`, etc. Just placing a file under the right folder is enough — the next `pnpm build:corpus` picks it up.

### Add your first practice in 10 minutes

A walkthrough adding a single short prayer (the Memorare).

1. **Find an existing practice to model on** — open any folder under `content/practices/` (e.g. `content/practices/angelus/`) to see the pattern. The numbered examples (`01-trivial-prayer/`, `02-bilingual-prayer/`, `04-rosary-with-macros/`, `05-mass-of-with-choice-rich-text/`) each demonstrate one DSL primitive end-to-end and are hidden from the user-facing list — copy one as a starting point.

2. **Create a directory:**

   ```bash
   mkdir -p content/practices/my-memorare
   ```

3. **Write `manifest.json`:**

   ```json
   {
     "id": "my-memorare",
     "icon": "prayer",
     "name": { "en-US": "Memorare", "pt-BR": "Memorare" },
     "categories": ["devotional"],
     "estimatedMinutes": 1,
     "description": {
       "en-US": "A brief Marian prayer of confidence.",
       "pt-BR": "Uma breve oração mariana de confiança."
     },
     "flowMode": "scroll",
     "completion": "manual",
     "flow": "flow.json",
     "defaults": { "sortOrder": 100 }
   }
   ```

4. **Write `flow.json`:**

   ```json
   {
     "sections": [
       { "type": "heading", "text": { "en-US": "Memorare", "pt-BR": "Memorare" } },
       {
         "type": "prayer",
         "title": { "en-US": "Memorare", "pt-BR": "Memorare" },
         "inline": {
           "en-US": "Remember, O most gracious Virgin Mary…",
           "pt-BR": "Lembrai-vos, ó piíssima Virgem Maria…"
         }
       }
     ]
   }
   ```

5. **(Optional) Group it in a collection** — if the practice belongs alongside others under a curated heading, add `{ "ref": "practice/my-memorare" }` to the matching `content/collections/<id>.json`. A practice doesn't need to be in any collection to ship; it'll show up in `/practices` either way.

6. **Validate:** `pnpm validate-flows` should print `✓ all flows + manifests valid`.

7. **Run:** `pnpm hearth` runs `build-corpus.py` and serves the result at `http://localhost:4100`; `pnpm start:web` boots the dev server. Your practice appears on the home page.

### Reference examples

The numbered practices under `content/practices/` (`01-trivial-prayer`, `02-bilingual-prayer`, `04-rosary-with-macros`, `05-mass-of-with-choice-rich-text`) are a curated set, each demonstrating one DSL primitive end-to-end. They're hidden from the user-facing list. Copy any of them as a starting point.

| Example | Demonstrates |
|---|---|
| `01-trivial-prayer` | the simplest possible flow — heading + prayer |
| `02-bilingual-prayer` | rubrics, multilingual text, versicle/response pattern |
| `04-rosary-with-macros` | macros (the `call` primitive) — define a parameterized fragment once, call it 5× with different mystery args |
| `05-mass-of-with-choice-rich-text` | consume the `mass-of` DataSource, branch on rite, render variable slots via `choice-rich-text` |

### Common patterns

**Multilingual text:**

```json
{ "en-US": "Hello", "pt-BR": "Olá" }
```

**Liturgical-day content** (today's content depends on the liturgical calendar): see Liguori's Meditações in `content/practices/meditacoes-ligorio/`. The `resolve` step binds today's match from a `liturgical-map.json` data file.

**Macros (reusable fragments):** define under `flow.fragments`, invoke via `{ "type": "call", "ref": "name", "args": {...} }`. Args are accessible inside the fragment body as `{{paramName}}` (or nested: `{{paramName.field}}`). See example `04-rosary-with-macros`.

**Today's Mass:** declare `{ "load": [{ "as": "day", "source": "mass-of", "calendar": "of" }] }`. Then `day.celebrations[]` is an array of today's celebrations (most days: 1; Holy Thursday: 2 — Chrism Mass + Lord's Supper; Christmas: 4). Branch on rite via `select on celebration.rite`, render variable slots via `choice-rich-text`. See example `05-mass-of-with-choice-rich-text`.

**Mass-specific primitives** (in `content/practices/mass/flow.json`):

- `celebration-banner` — hero block. `{ "from": "celebration.primary", "cycleFrom": "day.cycle" }` reads the celebration's title + liturgical color + rank, plus the day's lectionary cycle, and renders a missal-style title card.
- `liturgical-color` — small color swatch + label. `{ "from": "celebration.primary.liturgicalColor" }`.
- `liturgical-color-scope` — wraps a body and propagates the color to descendants via React Context. `{ "from": "celebration.primary.liturgicalColor", "sections": [...] }`. Section-marker rules and selected option-card borders pick up the color as a fallback when their own color isn't set.
- `section-marker` — typographic break for major Mass divisions (Initial Rites, Liturgy of the Word, etc.). Centered uppercase title between thin horizontal rules. Optional `colorFrom` tints the rules in the day's vestment color.
- `collapsible` — title visible, body hidden until tapped. Use for silent priest prayers (Preparação das Oferendas) and lengthy explanatory rubrics that overwhelm the audible flow. `{ "title": {...}, "sections": [...], "defaultOpen": false }`.
- `choice-rich-text` — per-slot rich-text picker (Tmp / Snt / Com chips). Tag with `"pickerStyle": "cards"` for vertical cards with title + 2-line excerpt; selected card expands inline with the full body. Used for prefaces, readings, and any slot where the chip label alone doesn't tell the user what they're picking.
- `options` — same `pickerStyle: 'cards'` extension applies. Engine derives the excerpt from the first prayer (or rubric, fallback) inside each option's resolved sections. Used for Eucharistic Prayer, Memorial Acclamation, Penitential Act, Greeting, Dismissal, Final Blessing.

### Validation

`pnpm validate-flows` runs at pre-commit (via husky) and CI. It catches:
- Unknown section `type`
- `call.ref` / `fragment.ref` pointing at a fragment not defined in scope
- `manifest.flow` or `manifest.data[*]` pointing at non-existent files
- Malformed `select.from` (missing `as` / `body`)
- Malformed `choice-rich-text` (missing `slot` / `label`)

## Development Setup

**Prerequisites:** Node.js, pnpm

```bash
pnpm install          # Install dependencies
pnpm start            # Expo dev server
pnpm start:web        # Web dev server
pnpm ios              # iOS simulator
pnpm android          # Android emulator
pnpm test             # Run all tests
pnpm biome check --write .  # Format & lint
```

**Monorepo structure:**

| Directory | Description |
|-----------|-------------|
| `apps/app/` | Expo app (iOS, Android, web) |
| `packages/content-engine/` | Practice-agnostic flow resolution engine |
| `packages/liturgical/` | Liturgical calendar, seasons, psalter |
| `packages/mass-propers/` | EF Mass propers resolution engine |
| `content/` | Corpus source — flat by kind (`prayers/`, `practices/`, `chapters/`, `books/`, `collections/`, ...) |
| `docs/` | Architecture, specs, conventions, dev journal |

For the full picture, see [Architecture](docs/ARCHITECTURE.md) and the [project overview](docs/README.md).

## Docs-First Workflow

This project follows a strict docs-first approach:

1. **Before starting work:** read the relevant spec in `docs/features/`. If none exists, write one first.
2. **After completing work:** update docs to reflect changes and add non-obvious learnings to `docs/journal.md`.

---

*Ad maiorem Dei gloriam.*
