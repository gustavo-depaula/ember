# Ember

A Catholic prayer app for building a consistent spiritual life.

Ember helps you maintain a **Plan of Life** — tracking daily prayer practices with a visual contribution wall — and pray a **Custom Divine Office** that reads through the entire Bible and Catechism in a year via lectio continua.

Built with Expo for web, iOS, and Android. Local storage only — no accounts, no backend.

---

## Features

- **[Plan of Life](features/plan-of-life.md)** — Track daily spiritual practices with a GitHub-style green wall
- **[Divine Office](features/divine-office.md)** — Morning, Evening, and Compline with lectio continua through all of Scripture + CCC

## Technical Docs

- **[Architecture](ARCHITECTURE.md)** — Tech stack, data models, screen map, storage strategy
- **[Conventions](CONVENTIONS.md)** — Engineering style guide (code style, naming, patterns, formatting)
- **[Design System](design/design-system.md)** — Colors, typography, layout, illuminated manuscript aesthetic
- **[Content Sources](content/content-sources.md)** — Bible text, Catechism, hymns — APIs, licensing, bundling strategy

---

## MVP Scope

**In scope:**
1. Plan of Life with 8 fixed practices + green contribution walls
2. Divine Office (Morning, Evening, Compline) with lectio continua
3. Mark already-read books / customize starting point
4. Reading progress tracking (% Bible, % Catechism complete)
5. Beautiful, reverent UI (modern minimal sacred + illuminated manuscript touches)
6. Local storage only (expo-sqlite + AsyncStorage)
7. Dark / light mode

**Out of scope for MVP:**
- Custom practices (future: preset + fully customizable)
- User accounts / sync / backend
- Push notifications / reminders
- Liturgical calendar integration
- Social features
- Audio / text-to-speech
- Multiple bundled translations (online translations via Bolls.life API, Douay-Rheims bundled offline)
