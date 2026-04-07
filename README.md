# Ember

> A beautiful companion for the Catholic life of prayer — helping souls grow in holiness, one day at a time.

Multilingual Catholic prayer app (English + Brazilian Portuguese) built with Expo (web + iOS + Android). Local storage only, no backend.

## Monorepo Structure

| Directory | Description |
|-----------|-------------|
| `apps/app/` | Expo app (iOS, Android, web) |
| `packages/liturgical/` | Liturgical calendar, seasons, psalter, obligations |
| `packages/mass-propers/` | EF Mass propers resolution engine |
| `packages/content-engine/` | Practice flow rendering engine + types |
| `docs/` | All specs, architecture, conventions, journal |

## Getting Started

```bash
pnpm install
pnpm start          # Expo dev server
pnpm start:web      # Web dev server
pnpm ios            # Build & run on iOS simulator
pnpm android        # Build & run on Android
pnpm test           # Run all tests
```

## Documentation

- [Project overview & roadmap](docs/README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Conventions](docs/CONVENTIONS.md)
- [Design system](docs/design/design-system.md)
- [Content sources](docs/content/content-sources.md)
- [Features overview](docs/features/features-overview.md)
- [Dev journal](docs/journal.md)
