# Ember

> A beautiful companion for the Catholic life of prayer — helping souls grow in holiness, one day at a time.

## Mission

Ember meets Catholics where they are — from first steps in prayer to deep devotion — and walks with them daily. The app is multilingual (currently English and Brazilian Portuguese) and makes the richness of Catholic tradition accessible, beautiful, and practical through three pillars:

### Fidelity — "Build and keep your rule of life"

The heart of Ember and our apostolate. We help users build, maintain, and grow their Plan of Life — a structured daily rhythm of prayer and spiritual practices. Track consistency, build holy habits, and see your fidelity grow over time.

### Devotion — "Grow through the communion of saints"

We keep users engaged and inspired through meaningful encounters with the saints. Collectible holy cards earned through sustained practice carry real hagiographic content — not trophies, but introductions to holy lives that inspire your own. A patron saint companion walks with you on your journey. Fun, but not vain: always a nudge toward deeper prayer grounded in formation and tradition.

### Wisdom — "Learn from 2000 years of prayer"

We provide the rich content that grounds spiritual growth and formation. Formation guides teach how to pray. A Catholic library offers saints' writings, spiritual classics, and hagiographies. Study tools deepen understanding of Scripture and the Catechism. Every prayer comes with its history and tradition.

**Fidelity is essential — it's why the app exists. Devotion is how we attract and retain users. Wisdom is what fuels the growth that Fidelity tracks.**

---

## Target Audience

Broad spectrum — from curious seekers to devout daily communicants. The app meets people where they are:

- **Beginners** — guided onboarding, suggested practices, explanations of each prayer and devotion
- **Growing** — structured Plan of Life, Divine Office, formation content that teaches how to pray better
- **Devout** — deep library, Latin texts, Extraordinary Form, lectio continua through all of Scripture and the Catechism

---

## What's Built

Ember has a complete MVP (Phases 0–9a).

### Core Features

| Feature | Description | Spec |
|---------|-------------|------|
| **Plan of Life** | 16 practices (essential/ideal/extra) + custom, fidelity wall, streaks, time blocks, notifications | [features-overview.md](features/features-overview.md#plan-of-life) |
| **Divine Office** | Morning/Evening/Compline, 30-day DWDO psalter, lectio continua (OT + NT + CCC in a year) | [features-overview.md](features/features-overview.md#divine-office) |
| **Bible Reader** | Bundled Douay-Rheims (73 books) + online translations via Bolls.life API | [features-overview.md](features/features-overview.md#other-features) |
| **Catechism Reader** | Full CCC (2,865 paragraphs), 5-level collapsible TOC, segment navigation | [features-overview.md](features/features-overview.md#other-features) |
| **Ordo Missae** | Complete Mass ordinary (OF + EF), bilingual Latin/English, proper slot placeholders | [features-overview.md](features/features-overview.md#other-features) |
| **Liturgical Seasons** | OF + EF season calculation, user calendar preference, Marian antiphon rotation | [features-overview.md](features/features-overview.md#liturgical-seasons) |
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
- **Catholic library** — saints' writings, spiritual classics, devotional texts
- **Prayer history** — origin and tradition of each prayer and devotion
- **Study Bible features** — commentary, cross-references, context
- **Daily Mass readings** — EF ready via Missale Meum API; OF partially via Evangelizo (see [content-sources.md](content/content-sources.md#daily-mass-readings--propers))

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

- [Architecture](ARCHITECTURE.md) — tech stack, data models, screen map, storage
- [Conventions](CONVENTIONS.md) — code style guide
- [Design System](design/design-system.md) — colors, typography, illuminated manuscript aesthetic
- [Content Sources](content/content-sources.md) — Bible, CCC, hymns, daily readings — APIs, licensing, bundling
- [Features Overview](features/features-overview.md) — domain knowledge, design rationale, and capabilities for all features
- [Dev Journal](journal.md) — accumulated learnings (APIs, licensing, technical)
