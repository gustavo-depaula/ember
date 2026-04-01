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

All custom components (SectionDivider, GreenWall, etc.) are built with Tamagui's `styled()` and reference theme tokens, so they automatically adapt to light/dark/liturgical themes.

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

### Dark Mode — "Tenebrae" (gothic cathedral / Caravaggio chiaroscuro)

Inspired by Gothic architecture stained glass (Sainte-Chapelle), memento mori, catacombs, and Caravaggio's dramatic lighting. Deep stone darkness with jewel-tone accents glowing like stained glass, gold catching candlelight.

| Role | Color | Hex |
|------|-------|-----|
| Background | Cathedral void (near-black stone) | `#0E0D0C` |
| Surface (cards) | Shadowed stone | `#1A1816` |
| Text (primary) | Bone white (aged vellum) | `#EDE4D8` |
| Text (secondary) | Catacomb dust | `#918880` |
| Accent (gold) | Reliquary gold | `#D4A63A` |
| Accent (hover) | Burnished gold | `#B8902A` |
| Accent (subtle) | Ember gold | `#5C4D2A` |
| Dividers / borders | Shadow line (stone mortar) | `#2A2622` |
| Burgundy | Garnet (stained glass) | `#C75B6B` |
| Muted blue | Sapphire (stained glass) | `#7A9EC8` |
| Cloister green | Verdigris (aged bronze) | `#52A878` |

### Secondary Accent Usage
- **Burgundy** — hour titles in PrayerFlow, canticle/hymn titles, HeroCTA office label
- **Muted blue** — psalm references, Bible references, CCC paragraph numbers
- **Cloister green** — "Completed" state, "Done" badges, GreenWall full intensity
- **Gold** — RubricLabel, SectionDivider, active tab, primary buttons, HeroCTA border
- **Subtle gold** — ornamental rules, card top borders, ornamental separators

### Fidelity Wall (Multi-Hue Contribution Heatmap)

The fidelity wall uses 4 color families based on practice tier completion:

| Level | Tier | Light Mode | Dark Mode |
|-------|------|------------|-----------|
| Empty | None | `#E8E4D9` | `#1A1816` |
| Extra (partial) | Extra only | `#E8D9A0` | `#3A3018` |
| Extra (full) | Extra done | `#C9A84C` | `#D4A63A` |
| Ideal (partial) | Ideal done, essentials missed | `#A8C4D9` | `#1E3448` |
| Ideal (full) | All ideal done | `#3D5A80` | `#7A9EC8` |
| Essential (partial) | Some essentials | `#8FB88A` | `#286848` |
| Essential (full) | All essentials | `#2D6A4F` | `#48A868` |
| Perfect | All tiers complete | `#6B1D2A` | `#C75B6B` |

Individual practice detail views use a legacy single-color green wall:

| Intensity | Light Mode | Dark Mode |
|-----------|------------|-----------|
| Empty (0%) | `#E8E4D9` | `#1A1816` |
| Low (1-25%) | `#C5D5C0` | `#1E3A2E` |
| Medium (26-50%) | `#8FB88A` | `#286848` |
| High (51-75%) | `#5A9A55` | `#388A58` |
| Full (76-100%) | `#2D6A4F` | `#48A868` |

### Liturgical Season Accents

Light and dark modes use separate liturgical accent values — dark mode accents are brighter to remain visible against the near-black background.

| Season | Light | Dark | Usage | Forms |
|--------|-------|------|-------|-------|
| Advent | `#5B2C6F` | `#7B3E9A` (amethyst) | accent override | both |
| Christmas | `#C9A84C` | `#D4A63A` (reliquary gold) | accent override | both |
| Epiphany | `#2D6A4F` | `#3A8A5A` (bright cloister) | accent override | EF only |
| Septuagesima | `#5B2C6F` | `#7B3E9A` (amethyst) | accent override | EF only |
| Lent | `#7D3C98` | `#9B50B8` (violet glass) | accent override | both |
| Easter | `#C9A84C` | `#D4A63A` (reliquary gold) | accent override | both |
| Ordinary Time | `#2D6A4F` | `#3A8A5A` (bright cloister) | accent override | OF only |
| Post-Pentecost | `#2D6A4F` | `#3A8A5A` (bright cloister) | accent override | EF only |
| Martyrs/feasts | `#922B21` | `#B83828` (blood red) | accent override | both |

---

## Typography (4-tier font system)

### Font Families

| Tier | Font | Tamagui Key | Role | Weight |
|------|------|-------------|------|--------|
| Display | UnifrakturMaguntia | `$display` | Decorative moments, major titles | 400 |
| Heading | Cinzel | `$heading` | Section headers, rubric labels, tab labels | 400, 700 |
| Body | EB Garamond | `$body` | Prayer text, readings, UI text | 400, 400i, 500, 600 |
| Script | Pinyon Script | `$script` | Sublabels, date lines, blessings | 400 |

### Where Each Font Appears
- **UnifrakturMaguntia**: PrayerFlow hour title ("Morning Prayer"), HeroCTA office label, "Day complete" text
- **Cinzel**: RubricLabel ("PSALMODY", "HYMN"), time block labels, tab labels, office hour card titles, "Begin" text
- **Reading font** (user-configurable, default EB Garamond): PrayerText, psalm content, Bible readings, catechism text — all reading body copy. See `docs/features/features-overview.md` for reading config details
- **EB Garamond**: UI text, practice names, settings, non-reading body copy
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

### Ornamental Rules (`OrnamentalRule` component)
- Image-based decorative divider for PrayerFlow sections
- Uses `horizontal_marker.png` texture from `assets/textures/`
- Replaces plain `SectionDivider` in prayer context

### Header Flourish (`HeaderFlourish` component)
- Image-based ornamental divider (260px wide) above major headings
- Uses `horizontal_marker_3.png` texture
- Used above "Morning Prayer", "Evening Prayer", "Divine Office" titles

### Corner Flourish (`CornerFlourish` component)
- 36x36 SVG vine/scroll stroke with 4 rotation orientations
- Vine curves and leaf accents using theme colors (gold, vineGreen, vineGreenDark)
- Available for decorative framing (PrayerFlow header area)

### VineBar (`VineBar` component)
- Vertical vine SVG ornament with leaves and berries
- Used as sidebar decoration in manuscript frames

### PageBreakOrnament (`PageBreakOrnament` component)
- Image-based chalice ornament (`horizontal_marker_chalice.png`)
- Used as major section break in prayer flows

### ManuscriptFrame (`ManuscriptFrame` component)
- Framing component with optional `ornate` prop for full decorative borders
- Uses corner texture images from `assets/textures/`

### PageBorder (`PageBorder` component)
- Full-page decorative border using image-based assets

### RibbonBookmarks (`RibbonBookmarks` component)
- Decorative ribbon bookmarks in the app layout

### FloralCorner (`FloralCorner` component)
- SVG-based floral corner with multi-color ornament (gold, red, blue, green)
- Rich illuminated manuscript style

### FloralVineBorder (`FloralVineBorder` component)
- SVG vine border decoration with leaves and berries

### WatercolorIcon (`WatercolorIcon` component)
- Stylized icons (sunrise, book, rosary, moon, quill, cross) rendered as multi-layer SVG
- Watercolor effect with theme-aware colors

### Section Divider (`SectionDivider` component)
- Simple horizontal lines with centered fleuron (`✦`)
- Used on non-prayer screens (home, plan of life)
- Color: `$borderColor` lines, `$accent` symbol

### Ornament Level by Screen

| Area | Level | Elements |
|------|-------|----------|
| PrayerFlow | Rich | OrnamentalRule, HeaderFlourish, PageBreakOrnament, CornerFlourish, ManuscriptFrame |
| Office index | Moderate | HeaderFlourish, ManuscriptFrame, gold top-border on cards |
| Home screen | Moderate | AppFrame, NavigationMedallion, WatercolorIcon, SectionDivider, RibbonBookmarks |
| Plan of Life | Light | AppFrame, SectionDivider, GreenWall |
| Settings | Minimal | AppFrame, BackToHome |

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
- **Stack navigation** with home-as-hub pattern (no bottom tab bar)
- Home screen uses `NavigationMedallion` circular buttons to navigate to Office and Plan of Life
- Sub-screens use `BackToHome` component for return navigation
- Simple line icons from lucide-react-native throughout UI

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
- **Size:** 24px for navigation, 20px for inline, 32px for feature cards

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
│  Blessed is the man who     │
│    walks not in the         │
│    counsel of the wicked... │  <- EB Garamond body
│                             │
│  ——◆—— ✠ ——◆——             │
│                             │
│  READING                    │  <- Cinzel rubric label
│  Genesis 1:1-31             │  <- EB Garamond, muted blue
│                             │
│  In the beginning God       │
│    created the heavens...   │  <- EB Garamond body
│                             │
│  ┌─────────────────────┐    │
│  │   Mark as Complete   │   │  <- Cinzel, gold bg, subtle border
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```
