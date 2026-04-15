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
- [Salty book format](docs/content/salty-book-format.md)
- [Content sources & licensing](docs/content/content-sources.md)

Content lives in `content/libraries/`. Each library has its own directory with a `library.json` manifest.

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
