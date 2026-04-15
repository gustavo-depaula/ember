# Ember

> A beautiful companion for the Catholic life of prayer — helping souls grow in holiness, one day at a time.

## Mission

Ember exists to preserve, translate, and freely distribute the richness of Catholic tradition — Sacred Scripture, the Church Fathers, spiritual classics, catechisms, liturgical books, sacred art — and to put it in the hands of the faithful as a daily companion for prayer. We believe these treasures should be lavishly open, overcoming the language barriers, copyright restrictions, and practical obstacles that keep them hidden and fragmented.

The app meets Catholics where they are — from first steps in prayer to deep devotion — and walks with them daily, multilingual (English and Brazilian Portuguese), through three pillars:

### Wisdom — "Learn from 2000 years of prayer"

We provide the rich content that grounds spiritual growth and formation. Formation guides teach how to pray. A Catholic library offers saints' writings, spiritual classics, and hagiographies. Study tools deepen understanding of Scripture and the Catechism. Every prayer comes with its history and tradition.

### Fidelity — "Build and keep your rule of life"

The heart of Ember and our apostolate. We help users build, maintain, and grow their Plan of Life — a structured daily rhythm of prayer and spiritual practices. Track consistency, build holy habits, and see your fidelity grow over time.

### Devotion — "Grow through the communion of saints"

We keep users engaged and inspired through meaningful encounters with the saints. Collectible holy cards earned through sustained practice carry real hagiographic content — not trophies, but introductions to holy lives that inspire your own. A patron saint companion walks with you on your journey. Fun, but not vain: always a nudge toward deeper prayer grounded in formation and tradition.

**Wisdom is the foundation — the tradition we preserve and share. Fidelity puts it into daily practice. Devotion keeps you inspired along the way.**

> **Unapologetically Catholic** · **Against artificial barriers of intellectual property** · **Integrity and beauty**

---

## Target Audience

Broad spectrum — from curious seekers to devout daily communicants. The app meets people where they are:

- **Beginners** — guided onboarding, suggested practices, explanations of each prayer and devotion
- **Growing** — structured Plan of Life, Divine Office, formation content that teaches how to pray better
- **Devout** — deep library, Latin texts, Extraordinary Form, lectio continua through all of Scripture and the Catechism

---

## What's Built

### Core Features

| Feature | Description | Spec |
|---------|-------------|------|
| **Content Libraries** | 8 downloadable `.pray` libraries (91 practices, 16 books, 49 prayer assets), content resolution engine | [ARCHITECTURE.md](ARCHITECTURE.md#content--libraries), [prayer-books.md](features/prayer-books.md) |
| **Flow Engine** | Practice-agnostic DSL — select, repeat, cycle, prose, proper — describes any prayer from a simple devotion to the Mass | [features-overview.md](features/features-overview.md#practice-content-architecture) |
| **Plan of Life** | Tier-based daily practice checklist, multi-hue fidelity wall, streaks, time blocks, notifications | [features-overview.md](features/features-overview.md#plan-of-life) |
| **Bible Reader** | Bundled Douay-Rheims (73 books) + online translations via Bolls.life API | [features-overview.md](features/features-overview.md#other-features) |
| **Catechism Reader** | Full CCC (2,865 paragraphs), 5-level collapsible TOC, segment navigation | [features-overview.md](features/features-overview.md#other-features) |
| **Ordo Missae** | Complete Mass ordinary (OF + EF), bilingual Latin/English, EF propers daily, OF propers (PT-BR complete, EN readings) | [features-overview.md](features/features-overview.md#other-features) |
| **Book Reader** | Long-form prose from `.pray` libraries, WebView with CSS column pagination | [salty-book-format.md](content/salty-book-format.md) |
| **Liturgical Seasons** | OF + EF season calculation, 347-entry sanctoral cycle, seasonal theming | [features-overview.md](features/features-overview.md#liturgical-seasons) |
| **Saints Feed** | Daily saints and commemorations | — |

### Platform & UX

- Cross-platform: web, iOS, Android (Expo SDK 55+)
- Local storage only — no accounts, no backend, fully offline-capable
- Dark/light/system themes
- Internationalization: English + Brazilian Portuguese
- Reading config: 7 serif fonts, adjustable size/spacing/margins/alignment
- Illuminated manuscript aesthetic (ornamental dividers, gold accents)

---

## Roadmap

### Fidelity (Plan of Life)

- Practice recommendations by vocation/state of life
- Guided onboarding for beginners
- Spiritual progress insights and milestones
- Push notification reminders (infrastructure ready)

### Devotion (Engagement)

- **Saints cards** — collectible holy cards earned through sustained practice, with hagiographic content and prayer. Each card is a window into a holy life, not a trophy.
- **Patron saint companion** — assigned or chosen, accompanies the user's journey with quotes, feast day reminders, and context
- **Liturgical milestones** — completing a book of the Bible, finishing the Catechism, praying through a liturgical season
- **Seasonal devotions** tied to the liturgical calendar

### Wisdom (Content & Tradition)

- **Formation guides** — how to pray the Rosary, mental prayer, examination of conscience, lectio divina
- **More spiritual classics** — expanding the library beyond Montfort and Liguori (see [prayer-books-roadmap.md](content/prayer-books-roadmap.md))
- **Prayer history** — origin and tradition of each prayer and devotion
- **Study Bible features** — commentary, cross-references, context
- **OF Mass readings (EN)** — English collects/antiphons blocked by ICEL copyright (see [content-sources.md](content/content-sources.md#daily-mass-readings--propers))

### Polish & Infrastructure

- Animations (Moti fade transitions, checkbox toggles, wall cell animations)
- Empty states and first-launch experience
- Error states and offline fallback notices
- Responsive layout (tablet/web)
- App icon and splash screen
- Cross-platform testing

---

## Documentation

### Specs & Architecture

- [Architecture](ARCHITECTURE.md) — tech stack, content & libraries, data model, storage, folder structure
- [Conventions](CONVENTIONS.md) — code style guide
- [Features Overview](features/features-overview.md) — flow DSL, schedules, programs, plan of life, liturgical seasons
- [Library System](features/prayer-books.md) — `.pray` format, library distribution, content resolution
- [Salty Book Format](content/salty-book-format.md) — book manifest, chapter format, ID conventions
- [Design System](design/design-system.md) — colors, typography, illuminated manuscript aesthetic
- [Content Sources](content/content-sources.md) — Bible, CCC, hymns, daily readings — APIs, licensing, bundling
- [Library Roadmap](content/prayer-books-roadmap.md) — planned content libraries
- [Dev Journal](journal.md) — accumulated learnings (APIs, licensing, technical)
