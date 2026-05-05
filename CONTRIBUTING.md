# Contributing to Ember & Salty

Ember is a free Catholic prayer app. Salty is the broader effort to preserve and translate the Catholic literary tradition — spiritual classics, Church Fathers, formation guides, liturgical texts — in open formats, freely available to all. This repo is home to both.

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
- **Contribute content** — prayers, translations, books, libraries
- **Improve documentation** — specs, guides, corrections

## Code Contributions

1. Fork the repo and create a branch from `main`
2. Read the [Conventions](docs/CONVENTIONS.md) and [Architecture](docs/ARCHITECTURE.md) before writing code
3. Follow the docs-first workflow: if your feature doesn't have a spec in `docs/features/`, write one first
4. Run `pnpm biome check --write .` before submitting
5. Run `pnpm test` to verify nothing is broken
6. Open a PR with a clear description of what changed and why

## Content Contributions

Content in this project is packaged into **libraries** — self-contained `.pray` files (zip archives) that bundle prayers, practices, books, and chapters.

- **Practices** are pure JSON — a `manifest.json` + `flow.json` describe the prayer flow. No app code needed.
- **Books** are HTML or Markdown chapters organized by language.
- **Prayers** are reusable text assets with multilingual support.

To understand the content model:
- [Library system & .pray format](docs/features/prayer-books.md)
- [Book format](docs/content/book-format.md)
- [Content sources & licensing](docs/content/content-sources.md)
- [Content pipeline](docs/content/PIPELINE.md) — see what's published, in progress, and where help is needed

Content lives in `content/libraries/`. Each library has its own directory with a `library.json` manifest.

### Add your first practice in 10 minutes

A walkthrough adding a single short prayer (the Memorare).

1. **Pick a library** — `content/libraries/devotions/` is a good target. Open it and look at any existing practice (e.g. `practices/seven-sorrows/`) to see the pattern.

2. **Create a directory:**

   ```bash
   mkdir -p content/libraries/devotions/practices/my-memorare
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

5. **Register the practice** — open `content/libraries/devotions/library.json` and add `"my-memorare"` to the `practices` array.

6. **Validate:** `pnpm validate-flows` should print `✓ all flows + manifests valid`.

7. **Run:** `pnpm hearth` rebuilds .pray archives + serves them locally; `pnpm start:web` boots the dev server. Your practice appears on the home page.

### Reference examples

The `content/libraries/examples/` library is a curated set of practices, each demonstrating one DSL primitive end-to-end. Copy any of them as a starting point.

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

**Liturgical-day content** (today's content depends on the liturgical calendar): see Liguori's Meditações in `content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/`. The `resolve` step binds today's match from a `liturgical-map.json` data file.

**Macros (reusable fragments):** define under `flow.fragments`, invoke via `{ "type": "call", "ref": "name", "args": {...} }`. Args are accessible inside the fragment body as `{{paramName}}` (or nested: `{{paramName.field}}`). See example `04-rosary-with-macros`.

**Today's Mass:** declare `{ "load": [{ "as": "day", "source": "mass-of", "calendar": "of" }] }`. Then `day.celebrations[]` is an array of today's celebrations (most days: 1; Holy Thursday: 2 — Chrism Mass + Lord's Supper; Christmas: 4). Branch on rite via `select on celebration.rite`, render variable slots via `choice-rich-text`. See example `05-mass-of-with-choice-rich-text`.

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
| `content/libraries/` | Source content for prayer libraries |
| `docs/` | Architecture, specs, conventions, dev journal |

For the full picture, see [Architecture](docs/ARCHITECTURE.md) and the [project overview](docs/README.md).

## Docs-First Workflow

This project follows a strict docs-first approach:

1. **Before starting work:** read the relevant spec in `docs/features/`. If none exists, write one first.
2. **After completing work:** update docs to reflect changes and add non-obvious learnings to `docs/journal.md`.

---

*Ad maiorem Dei gloriam.*
