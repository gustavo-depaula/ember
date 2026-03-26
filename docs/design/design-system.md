# Design System

## Aesthetic: Digital Book of Hours

The app should feel like a **digital Book of Hours** — reverent, calm, warm, readable, structured around prayer. Visually inspired by illuminated manuscripts, but not visually heavy. The interface should feel light, sacred, quiet, and intentional.

**Guiding principle:** ornament supports prayer; it must never compete with usability.

---

## Implementation: Tamagui

The design system is implemented as a Tamagui configuration — a single `createTamagui()` call that defines all tokens, themes, and fonts. This config is portable and can be extracted as a standalone package (`@ember/design-system`) for reuse across projects.

Key Tamagui concepts used:
- **Tokens** — design primitives (colors, spacing, radii, font sizes) accessible via `$tokenName`
- **Themes** — named sets of semantic color mappings (light, dark, advent, lent, etc.) that cascade and compose
- **Fonts** — font family + weight + size + line-height definitions, loaded via expo-font
- **styled()** — creates themed components that resolve `$tokens` at build time via the compiler

All custom components (DropCap, SectionDivider, GreenWall, etc.) are built with Tamagui's `styled()` and reference theme tokens, so they automatically adapt to light/dark/liturgical themes.

---

## Color Palette

### Light Mode (parchment)
| Role | Color | Hex |
|------|-------|-----|
| Background | Warm cream / parchment | `#FAF6F0` |
| Surface (cards) | Slightly lighter cream | `#FFFDF9` |
| Text (primary) | Warm dark brown | `#2C2418` |
| Text (secondary) | Muted brown | `#6B5D4F` |
| Accent (gold) | Amber gold | `#C9A84C` |
| Accent (gold hover) | Deeper gold | `#A8872E` |
| Accent (subtle) | Light gold | `#D4C088` |
| Dividers / borders | Light warm gray | `#E5DDD2` |
| Burgundy | Section titles | `#6B1D2A` |
| Muted blue | References, citations | `#3D5A80` |
| Cloister green | Completion states | `#2D6A4F` |

### Dark Mode (warm espresso/leather — not cold navy)
| Role | Color | Hex |
|------|-------|-----|
| Background | Deep espresso / aged leather | `#1C1710` |
| Surface (cards) | Dark parchment | `#2A2318` |
| Text (primary) | Soft cream | `#F0E6D3` |
| Text (secondary) | Muted cream | `#A89F91` |
| Accent (gold) | Amber gold | `#C9A84C` |
| Accent (subtle) | Muted gold | `#6B5D3A` |
| Dividers / borders | Warm olive-brown | `#3D3528` |
| Burgundy | Section titles (lightened) | `#C4707E` |
| Muted blue | References (lightened) | `#7BA0C4` |
| Cloister green | Completion (brightened) | `#5AAA7E` |

### Secondary Accent Usage
- **Burgundy** — hour titles in PrayerFlow, canticle/hymn titles, HeroCTA office label
- **Muted blue** — psalm references, Bible references, CCC paragraph numbers
- **Cloister green** — "Completed" state, "Done" badges, GreenWall full intensity
- **Gold** — DropCap, RubricLabel, SectionDivider, active tab, primary buttons, HeroCTA border
- **Subtle gold** — ornamental rules, card top borders, tab bar separator

### Green Wall (Contribution Heatmap)
| Intensity | Light Mode | Dark Mode |
|-----------|------------|-----------|
| Empty (0%) | `#E8E4D9` | `#2A2419` |
| Low (1-25%) | `#C5D5C0` | `#2D4A3A` |
| Medium (26-50%) | `#8FB88A` | `#2D6A4F` |
| High (51-75%) | `#5A9A55` | `#3D8B5E` |
| Full (76-100%) | `#2D6A4F` | `#4FAA6E` |

### Liturgical Season Accents
| Season | Color | Usage |
|--------|-------|-------|
| Advent | Deep purple | `#5B2C6F` — accent override |
| Christmas | White/gold | `#F5F0E0` / `#C9A84C` |
| Lent | Penitential purple | `#7D3C98` |
| Easter | White/gold | `#F5F0E0` / `#C9A84C` |
| Ordinary Time | Green | `#2D6A4F` |
| Martyrs/feasts | Red | `#922B21` |

---

## Typography (4-tier font system)

### Font Families

| Tier | Font | Tamagui Key | Role | Weight |
|------|------|-------------|------|--------|
| Display | UnifrakturMaguntia | `$display` | Decorative moments, drop caps, major titles | 400 |
| Heading | Cinzel | `$heading` | Section headers, rubric labels, tab labels | 400, 700 |
| Body | EB Garamond | `$body` | Prayer text, readings, UI text | 400, 400i, 500, 600 |
| Script | Pinyon Script | `$script` | Sublabels, date lines, blessings | 400 |

### Where Each Font Appears
- **UnifrakturMaguntia**: DropCap first letter, PrayerFlow hour title ("Morning Prayer"), HeroCTA office label, "Day complete" text
- **Cinzel**: RubricLabel ("PSALMODY", "HYMN"), time block labels, tab labels, office hour card titles, "Begin" text
- **EB Garamond**: PrayerText, psalm content, Bible readings, catechism text, practice names, settings, all body copy
- **Pinyon Script**: date display on home screen, "Lauds"/"Vespers"/"Compline" sublabels, "Your next practice", "Rest well. See you tomorrow."

### Scale

| Element | Size | Line Height |
|---------|------|-------------|
| Display title (PrayerFlow) | 36px | 42px |
| Screen title | 28px | 34px |
| Section heading | 22px | 29px |
| Body text | 17px | 27px |
| Prayer text | 19px | 36px (extra generous for prayerful reading) |
| Caption / metadata | 14px | 20px |
| Small label | 12px | 16px |

---

## Illuminated Manuscript Ornament

**Principle:** ornament is concentrated in the prayer experience (PrayerFlow), moderate on the Office index, light on the Home screen, and absent on utility screens (Plan, Settings).

### Drop Caps (`DropCap` component)
- First letter of each Scripture reading, psalm, and canticle
- UnifrakturMaguntia (blackletter), 56px, gold color (`#C9A84C`)
- Only on prayer flow screens, not on lists or settings

### Ornamental Rules (`OrnamentalRule` component)
- SVG-based decorative divider for PrayerFlow sections
- Thin line with diamond endpoints and centered cross symbol
- Colors: `$accentSubtle` for lines, `$accent` for symbol
- Replaces plain `SectionDivider` in prayer context

### Header Flourish (`HeaderFlourish` component)
- Small SVG ornamental curve (48px wide) above major headings
- Used above "Morning Prayer", "Evening Prayer", "Divine Office" titles
- Color: `$accentSubtle`

### Corner Flourish (`CornerFlourish` component)
- 24x24 SVG vine/scroll stroke with 4 rotation orientations
- Available for decorative framing (PrayerFlow header area)
- Color: `$accentSubtle`

### Section Divider (`SectionDivider` component)
- Simple horizontal lines with centered fleuron (`✦`)
- Used on non-prayer screens (home, plan of life)
- Color: `$borderColor` lines, `$accent` symbol

### Ornament Level by Screen

| Area | Level | Elements |
|------|-------|----------|
| PrayerFlow | Rich | OrnamentalRule, HeaderFlourish, CornerFlourish, DropCap |
| Office index | Moderate | HeaderFlourish, gold top-border on cards |
| Home screen | Light | SectionDivider, subtle gold accent on HeroCTA |
| Plan of Life | Minimal | Clean utilitarian tracking |
| Settings | None | Pure utility |

---

## Layout Principles

### Spacing
- Generous whitespace throughout — the app should breathe
- Minimum 16px padding on all screen edges
- 24px between major sections
- 12px between related elements within a section

### Cards
- Soft shadow: `0 2px 8px rgba(0,0,0,0.06)` (light), `0 2px 8px rgba(0,0,0,0.3)` (dark)
- Rounded corners: 8px (bookish, not bubbly)
- Internal padding: 16px
- Subtle gold top border: 1px `$accentSubtle`
- Background: surface color (slightly offset from page background)
- `ornate` variant adds full 1px `$accentSubtle` border

### Navigation
- **Bottom tab bar** with 4 tabs: Home, Office, Plan of Life, Settings
- Simple line icons (lucide-react-native)
- Active tab: gold accent color
- Inactive tab: secondary text color
- Tab bar separator: 0.5px `$accentSubtle` (gold hairline)

### Animations (Reanimated + Moti)
- Smooth, gentle transitions (200-300ms)
- Fade in/out for screen transitions
- No bouncy or playful animations — everything should feel measured and calm
- Checkbox toggle: subtle scale + color fill animation (Moti `AnimatePresence`)
- Green wall cells: gentle fade-in when data loads (Moti `MotiView` with staggered delay)
- Use Moti's declarative API for simple animations, Reanimated worklets for gesture-driven or complex ones

---

## Iconography

- **Style:** Simple line icons with a slight calligraphic quality (thin, elegant strokes)
- **Active state:** Gold accent fill or stroke
- **Inactive state:** Secondary text color
- **Size:** 24px for tab bar, 20px for inline, 32px for feature cards

---

## Prayer Flow Layout (Office Screens)

The prayer experience should feel like reading from a beautiful breviary:

```
┌─────────────────────────────┐
│         ~flourish~          │  <- HeaderFlourish SVG
│     Morning Prayer          │  <- UnifrakturMaguntia, burgundy
│     Wednesday, March 25     │  <- Pinyon Script, secondary
│                             │
│  ——◆—— ✠ ——◆——             │  <- OrnamentalRule (SVG + cross)
│                             │
│  OPENING VERSE              │  <- Cinzel, gold, uppercase
│                             │
│  O God, come to my          │
│  assistance. O Lord, make   │  <- EB Garamond, generous line height
│  haste to help me.          │
│                             │
│  ——◆—— ✠ ——◆——             │
│                             │
│  HYMN                       │  <- Cinzel rubric label
│                             │
│  [Full hymn text here]      │
│                             │
│  ——◆—— ✠ ——◆——             │
│                             │
│  PSALMODY                   │  <- Cinzel rubric label
│  Psalms 1-5                 │  <- EB Garamond, muted blue
│                             │
│  B lessed is the man who    │  <- UnifrakturMaguntia drop cap
│    walks not in the         │
│    counsel of the wicked... │  <- EB Garamond body
│                             │
│  ——◆—— ✠ ——◆——             │
│                             │
│  READING                    │  <- Cinzel rubric label
│  Genesis 1:1-31             │  <- EB Garamond, muted blue
│                             │
│  I n the beginning God      │  <- UnifrakturMaguntia drop cap
│    created the heavens...   │  <- EB Garamond body
│                             │
│  ┌─────────────────────┐    │
│  │   Mark as Complete   │   │  <- Cinzel, gold bg, subtle border
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```
