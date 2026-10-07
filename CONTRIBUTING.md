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
- **Improve documentation** — guides, corrections

## Code Contributions

1. Fork the repo and create a branch from `main`
2. Follow the code style in [CLAUDE.md](CLAUDE.md#code-style) — it doubles as the style guide
3. Run `pnpm biome check --write .` before submitting
4. Run `pnpm test` to verify nothing is broken
5. Open a PR with a clear description of what changed and why

## Content Contributions

All content is distributed as a **content-addressed corpus** at `https://ember.dpgu.me/hearth/v2/`. Every prayer, practice, book chapter, Mass proper, and collection is a first-class corpus item with a stable kind-prefixed id (`practice/rosary`, `book/montfort-true-devotion`, `collection/carmelite`). Source files live flat-by-kind under `content/`; the build pipeline hashes them into immutable blobs.

- **Practices** are pure JSON — a `manifest.json` + `flow.json` describe the prayer flow. No app code needed. A short prayer (Our Father, Memorare) is just a practice.
- **Books** are HTML or Markdown chapters organized by language.
- **Collections** are tiny JSON manifests that reference other corpus items to group them under a curated heading.

To understand the content model:
- [Authoring practices](docs/content/primitives-guide.md) — how to write a prayer flow
- [Book format](docs/content/book-format.md)
- [Content sources](docs/content/content-sources.md)

Content lives at the corpus root, one folder per kind: `content/practices/`, `content/chapters/`, `content/books/`, `content/collections/`, etc. Just placing a file under the right folder is enough — the next `pnpm build:corpus` picks it up.

### Add your first practice in 10 minutes

A walkthrough adding a single short prayer (the Memorare).

1. **Find an existing practice to model on** — open any folder under `content/practices/` (e.g. `content/practices/angelus/`) and copy the closest match.

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
     "completion": "flow-end",
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

### Common patterns

- **Multilingual text:** `{ "en-US": "Hello", "pt-BR": "Olá" }`
- **Content that follows the liturgical calendar:** see `content/practices/meditacoes-ligorio/`, which binds today's entry from a `liturgical-map.json` data file.
- **Branching** (day of week, season, the user's choice): the `select` section. See `content/practices/rosary/` and `content/practices/mass/`.

### Validation

`pnpm validate-flows` checks section types, fragment refs, file references in manifests, and malformed `select` / `choice-rich-text` sections. Run it before opening a PR.

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

See the [README](README.md#monorepo-structure) for the monorepo layout.

---

*Ad maiorem Dei gloriam.*
