# Design System

## Aesthetic: Modern Minimal Sacred + Illuminated Manuscript Tendencies

The app should feel like a **digital sacred space** — calm, beautiful, and reverent. Think of a well-lit monastery library: spacious, quiet, intentional. The illuminated manuscript touches add warmth and tradition without making it feel dated.

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

### Light Mode
| Role | Color | Hex |
|------|-------|-----|
| Background | Warm cream / parchment | `#FAF6F0` |
| Surface (cards) | Slightly lighter cream | `#FFFDF9` |
| Text (primary) | Warm dark brown | `#2C2418` |
| Text (secondary) | Muted brown | `#6B5D4F` |
| Accent (gold) | Amber gold | `#C9A84C` |
| Accent (gold hover) | Deeper gold | `#A8872E` |
| Dividers / borders | Light warm gray | `#E5DDD2` |

### Dark Mode
| Role | Color | Hex |
|------|-------|-----|
| Background | Deep navy / charcoal | `#1A1A2E` |
| Surface (cards) | Slightly lighter navy | `#232340` |
| Text (primary) | Soft cream | `#F0E6D3` |
| Text (secondary) | Muted cream | `#A89F91` |
| Accent (gold) | Amber gold | `#C9A84C` |
| Dividers / borders | Dark warm gray | `#3A3555` |

### Green Wall (Contribution Heatmap)
| Intensity | Light Mode | Dark Mode |
|-----------|------------|-----------|
| Empty (0%) | `#E8E4D9` | `#2A2A3E` |
| Low (1-25%) | `#C5D5C0` | `#2D4A3A` |
| Medium (26-50%) | `#8FB88A` | `#2D6A4F` |
| High (51-75%) | `#5A9A55` | `#3D8B5E` |
| Full (76-100%) | `#2D6A4F` | `#4FAA6E` |

### Liturgical Season Accents
| Season | Color | Usage |
|--------|-------|-------|
| Advent | Deep purple | `#5B2C6F` — accent bar, hymn headers |
| Christmas | White/gold | `#F5F0E0` / `#C9A84C` |
| Lent | Penitential purple | `#7D3C98` |
| Easter | White/gold | `#F5F0E0` / `#C9A84C` |
| Ordinary Time | Green | `#2D6A4F` |
| Martyrs/feasts | Red | `#922B21` |

---

## Typography

### Font Families

| Use | Font | Fallback | Weight |
|-----|------|----------|--------|
| Headings | Cormorant Garamond | Georgia, serif | 600 (SemiBold) |
| Body text | Source Serif Pro | Georgia, serif | 400 (Regular) |
| Prayers & psalms | Source Serif Pro | Georgia, serif | 400, italic for rubrics |
| UI labels / nav | Source Serif Pro | system-ui | 500 (Medium) |

### Scale

| Element | Size | Line Height |
|---------|------|-------------|
| Screen title | 28px | 1.2 |
| Section heading | 22px | 1.3 |
| Body text | 17px | 1.6 |
| Prayer text | 19px | 1.8 (extra generous for prayerful reading) |
| Caption / metadata | 14px | 1.4 |
| Small label | 12px | 1.3 |

---

## Illuminated Manuscript Touches

These should be **subtle, not overwhelming** — hints of the tradition, not a theme park.

### Drop Caps
- First letter of each Scripture reading and psalm is rendered as a **decorative drop cap**
- 3-4 lines tall, gold color (`#C9A84C`), Cormorant Garamond Bold
- Only on the prayer flow screens (office hours), not on lists or settings

### Ornamental Dividers
- Thin horizontal line between sections of the office
- Centered small cross or fleuron symbol on the line
- Color: gold accent on light mode, muted gold on dark mode
- Example: `——— + ———` or `——— ✦ ———`

### Section Headers
- Subtle gold flourish accent (small decorative line) above major section titles in the office
- Keep it minimal — a short horizontal line with a slight curve, not a full border

### Background Texture (optional, subtle)
- Very faint watermark-style cross or sacred geometry pattern
- Barely visible — should not interfere with readability
- Only on the prayer flow screens, not on lists/settings

---

## Layout Principles

### Spacing
- Generous whitespace throughout — the app should breathe
- Minimum 16px padding on all screen edges
- 24px between major sections
- 12px between related elements within a section

### Cards
- Soft shadow: `0 2px 8px rgba(0,0,0,0.06)` (light), `0 2px 8px rgba(0,0,0,0.3)` (dark)
- Rounded corners: 12px
- Internal padding: 16px
- Background: surface color (slightly offset from page background)

### Navigation
- **Bottom tab bar** with 4 tabs: Home, Office, Plan of Life, Settings
- Simple line icons with calligraphic quality
- Active tab: gold accent color
- Inactive tab: secondary text color
- No labels on small screens; icon + label on larger screens

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

### Key Icons Needed
| Element | Icon Concept |
|---------|-------------|
| Home | Simple house / chapel silhouette |
| Office | Open book |
| Plan of Life | Grid / calendar |
| Settings | Gear |
| Morning Prayer | Sun rising |
| Evening Prayer | Moon / sunset |
| Compline | Stars / night |
| Completed | Checkmark in circle |
| Streak | Flame |
| Progress | Ascending bar chart |

---

## Prayer Flow Layout (Office Screens)

The prayer experience should feel like reading from a beautiful breviary:

```
┌─────────────────────────────┐
│     MORNING PRAYER          │  <- section title, Cormorant Garamond
│     Wednesday, March 25     │  <- date, secondary text
│                             │
│  ——————— ✦ ———————          │  <- ornamental divider
│                             │
│  OPENING VERSE              │  <- rubric label (small, gold)
│                             │
│  O God, come to my          │
│  assistance. O Lord, make   │  <- prayer text, generous line height
│  haste to help me.          │
│                             │
│  ——————— ✦ ———————          │
│                             │
│  HYMN                       │  <- rubric label
│                             │
│  [Full hymn text here]      │
│                             │
│  ——————— ✦ ———————          │
│                             │
│  PSALMODY                   │  <- rubric label
│  Psalms 1-5                 │  <- psalm reference
│                             │
│  B lessed is the man who    │  <- drop cap on first letter
│    walks not in the         │
│    counsel of the wicked... │
│                             │
│  [... continues ...]        │
│                             │
│  ——————— ✦ ———————          │
│                             │
│  READING                    │  <- rubric label
│  Genesis 1:1-31             │  <- reference
│                             │
│  I n the beginning God      │  <- drop cap
│    created the heavens and  │
│    the earth...             │
│                             │
│  [... continues ...]        │
│                             │
│  ┌─────────────────────┐    │
│  │   Mark as Complete   │   │  <- primary button, gold accent
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```
