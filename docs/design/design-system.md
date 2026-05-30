# Design System

## Aesthetic: Digital Book of Hours

The app should feel like a **digital Book of Hours** — reverent, calm, warm, readable, structured around prayer. Visually inspired by illuminated manuscripts, but not visually heavy. The interface should feel light, sacred, quiet, and intentional.

**Guiding principle:** ornament supports prayer; it must never compete with usability.

---

## Implementation: Tamagui

The design system is implemented as a Tamagui configuration — a single `createTamagui()` call that defines all tokens, themes, and fonts. This config is portable and can be extracted as a standalone package (`@ember/design-system`) for reuse across projects.

Key Tamagui concepts used:
- **Tokens** — design primitives (colors, spacing, radii, font sizes) accessible via `$tokenName`
- **Themes** — named sets of semantic color mappings (`light`, `dark`, `illuminated`) that cascade and compose
- **Fonts** — font family + weight + size + line-height definitions, loaded via expo-font
- **styled()** — creates themed components that resolve `$tokens` at build time via the compiler

All custom components (SectionDivider, GreenWall, etc.) are built with Tamagui's `styled()` and reference theme tokens, so they automatically adapt to the light/dark/illuminated themes.

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
| Surface (cards) | Candlelit stone | `#252220` |
| Text (primary) | Bone white (aged vellum) | `#EDE4D8` |
| Text (secondary) | Sandstone | `#A89A8C` |
| Accent (gold) | Reliquary gold | `#D4A63A` |
| Accent (hover) | Burnished gold | `#B8902A` |
| Accent (subtle) | Ember gold | `#6E5C32` |
| Dividers / borders | Mortar line | `#5C5248` |
| Burgundy | Garnet (stained glass) | `#C75B6B` |
| Muted blue | Sapphire (stained glass) | `#7A9EC8` |
| Cloister green | Verdigris (aged bronze) | `#52A878` |

### Secondary Accent Usage
- **Burgundy** — hour titles in PrayerFlow, canticle/hymn titles, HeroCTA office label
- **Muted blue** — psalm references, Bible references, CCC paragraph numbers
- **Cloister green** — "Completed" state, "Done" badges, GreenWall full intensity
- **Gold** — SectionDivider, active tab, primary buttons, HeroCTA border (rubrics are **burgundy**, not gold — see the Ladder)
- **Subtle gold** — ornamental rules, card top borders, ornamental separators

### Fidelity Wall (Multi-Hue Contribution Heatmap)

The fidelity wall uses 4 color families based on practice tier completion:

| Level | Tier | Light Mode | Dark Mode |
|-------|------|------------|-----------|
| Empty | None | `#E8E4D9` | `#252220` |
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
| Empty (0%) | `#E8E4D9` | `#252220` |
| Low (1-25%) | `#C5D5C0` | `#1E3A2E` |
| Medium (26-50%) | `#8FB88A` | `#286848` |
| High (51-75%) | `#5A9A55` | `#388A58` |
| Full (76-100%) | `#2D6A4F` | `#48A868` |

### Liturgical Season Accents

The app **does not** re-theme itself by liturgical season — the whole palette (gold
`$accent`, burgundy, walls, etc.) is season-neutral, the same all year. The *only* element
still tinted by the season is the **Fraktur season hero** in the home `LiturgicalHeader`,
which paints itself with the color below via `useSeasonAccentColor` (`seasonalAccent` map
in `config/themes.ts`). Light and dark use separate values — dark accents are brighter to
stay visible against the near-black background.

| Season | Light | Dark |
|--------|-------|------|
| Advent | `#5B2C6F` | `#7B3E9A` (amethyst) |
| Christmas | `#C9A84C` | `#D4A63A` (reliquary gold) |
| Epiphany | `#2D6A4F` | `#3A8A5A` (bright cloister) |
| Septuagesima | `#5B2C6F` | `#7B3E9A` (amethyst) |
| Lent | `#7D3C98` | `#9B50B8` (violet glass) |
| Easter | `#C9A84C` | `#D4A63A` (reliquary gold) |
| Ordinary Time | `#2D6A4F` | `#3A8A5A` (bright cloister) |
| Post-Pentecost | `#2D6A4F` | `#3A8A5A` (bright cloister) |
| Rose (Gaudete / Laetare) | `#C27083` | `#D98A9A` |

---

## Typography — the Ladder of Reverence

Type is a **sign system for use and reverence**, not decoration. A glance should tell
the reader *how to use* a piece of text (pray it / read it / do it / tap it) before
they read a word — the way a missal's red ink, versals, and inscriptional caps do.

The app is **all-serif by design.** A quiet sans (Alegreya Sans) was tried for the
interface rung and rejected — it sucked the soul out, reading as generic-app chrome
against the manuscript character. So chrome recedes via *size, weight, color, and case*,
never by switching typeface. Four type families do everything: **EB Garamond** (reading,
prayer, and quiet UI), **Cinzel** (labels), the **medievalist** face (sacred titles), and
**UnifrakturMaguntia** blackletter (the rare ceremonial peak) — plus Pinyon Script kept
as a single exception (the home date carousel only).

These map onto semantic **rungs**, ordered from quiet interface up to sacred peak. The
whole ladder is **one component** — `Typography` (`apps/app/src/components/typography/`) —
whose **`variant` prop is the rung**. Screens reach for `<Typography variant="…">`, never
raw `fontFamily`/`fontSize`; that single, typed surface is what keeps the system from
drifting. (The reading & prayer body, rungs 3–4, is the one carve-out: `PrayerText` /
`PrayerLines` stay their own components because they consume the user's reading prefs via
`useReadingStyle`, and a styled component can't call hooks.)

| Rung | Register | Typeface → token | Color rule | `variant` |
|------|----------|------------------|------------|-----------|
| 1 | **Interface** — tabs, buttons, settings, toggles, schedules, counts/times/dates | EB Garamond (quiet) → `$body` | neutral (`$color`/`$colorSecondary`); **never** gold/burgundy | `interface` (default); utility screen hero → `screen-title` |
| 2a | **Rubric** — liturgical instructions ("All stand") | EB Garamond italic → `$body` | **burgundy** (the missal's red ink) | `rubric` |
| 2b | **Apparatus** — verse #, citations, captions, devotional whispers | small `$body` | **muted** (`$colorSecondary`); not red/gold | `annotation`, `reference`, `verse-number`, `caption`, `whisper` |
| 3 | **Reading** — books, catechism, scripture body, articles | EB Garamond (user-configurable) → `$body` | ink (`$color`) | *(separate: `PrayerText`)* |
| 4 | **Prayer** — prayers, psalms, antiphons | same reading serif, **line-set** + air + optional drop-cap | ink (`$color`) | *(separate: `PrayerLines`)* |
| 5 | **Liturgical label** — section labels, hours, feast banners | Cinzel → `$heading` | burgundy, tracked caps | `label`; major division ("PSALMODY") → `marker` |
| 6 | **Sacred title** — feast/season names, hour titles, sacred screen heroes, book titles, **sacred page-header titles** | medievalist → `$title` | burgundy/ink, mixed case | `sacred-title` |
| 7 | **Ceremonial peak** (≤1/screen) — illuminated drop-cap, ✠/fleurons, Fraktur season hero | `$title` / UnifrakturMaguntia `$display` | gold = preciousness | `ceremonial` (✠/Fraktur), `drop-cap` |

The one orthogonal modifier is **`tone`** (`default` | `muted`): it drops any variant's
ink to `$colorSecondary` for de-emphasized chrome or muted labels, without a manual color.
Every other style (`fontSize`, `color`, `textAlign`, `letterSpacing`…) is a pass-through
`Text` prop — variants set sensible defaults that call sites override per context (a hero
`sacred-title` at `$5`, the same in a list row at `$3`).

Rungs **2 and 4 are treatments, not new fonts.** Reading is a *river* (paragraphs,
measure, flow); prayer is *architecture* (sense-lines, air, a versal opening).

**`$title` is Junicode.** The full family (Light→Bold + italics) ships as local OFL
assets under `assets/fonts/`. (IM FELL English was trialed as an alternate behind a
flag and dropped — Junicode is warmer and carries the full weight range.)

### Governing disciplines
1. **Default to the lowest adequate rung** — ~90% of pixels are rungs 1–3.
2. **One peak per screen** — at most one rung-7 element visible. `variant="drop-cap"` / `variant="ceremonial"` are opt-in, never auto-applied.
3. **Color is a second reverence channel, rationed like ornament:** gold (`$accent`) = preciousness only; burgundy (`$colorBurgundy`) = sacred labels/rubrics only; UI stays neutral. *Exception:* tappable cross-reference links keep `$colorMutedBlue` as a link affordance.
4. **Ornament marks beginnings and ends, never the middle.**
5. **No font does two jobs** — reach for `<Typography variant="…">`, never raw `fontFamily`/`fontSize`.

### Axis 2 — per-screen choreography
The deeper into prayer, the higher the screen's center of gravity climbs the ladder and
the more rung-1 chrome recedes:
- **Home** — interface-dominant: quiet EB Garamond chrome, the one peak being the Fraktur season name + the Pinyon date carousel.
- **Reader** (Bible/book) — reading-dominant: header selectors recede to quiet `variant="interface"`; verse numbers are muted, not gold; the column is capped to a comfortable measure (~34em) on wide screens.
- **Prayer flow** — prayer-dominant: chrome nearly vanishes; `variant="sacred-title"` hour, `variant="label"` parts, burgundy `variant="rubric"`, line-set prayer text, and a single ✠/drop-cap peak.

### Scale & leading
EB Garamond has a smaller x-height (~65-70%) than a system sans, so reading sizes run
generous to compensate for perceived size. **Reading leading is a ratio** (`leadingRatio`, default
≈ 1.5) applied to the chosen font size — `lineHeight = round(fontSize × ratio)` — so it
stays comfortable at every size instead of cramping at large sizes (the old absolute-px
array hit ~1.1). `useReadingMaxWidth()` caps the reading column at ~34em on wide screens.

The one sanctioned exception to the ladder: **Pinyon Script** survives only on the home
day carousel (`DateScrubber`), where it's subtle. Every other former `$script` use was
rehomed (counts → `variant="interface"`, whispers → `variant="whisper"`, blessings →
`variant="sacred-title"`).

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

### Page Flourish (`PageFlourish` component)
- Rectangular `expo-image` banner that bleeds up into the safe-area notch as a tab's
  header art; the page title renders **below** it in normal flow.
- One transparent PNG per tab in `assets/textures/` (`notch_{explore,library,search,you}_dark.png`).
  Theme-aware via a `dark`/optional `light` pair; until the light art is generated,
  `light` falls back to `dark` on both themes.
- Full-bleed: `marginTop={-insets.top}` pulls it into the notch, `marginHorizontal="$-lg"`
  breaks out of `ScreenLayout`'s side padding (capped at the 640px column on web/desktop).
- Distinct from the Today screen's corner flourish (`frame_corner_{dark,light}.png`), whose
  shape is a baked-in transparent **cutout** rather than a rectangle.

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
│            ✠                │  <- variant="ceremonial" (the one peak)
│     Morning Prayer          │  <- variant="sacred-title" (medievalist), burgundy
│     Wednesday, March 25     │  <- variant="interface" tone="muted" (rung 1 data)
│                             │
│  ——◆—— ✠ ——◆——             │  <- OrnamentalRule (SVG + cross)
│                             │
│  OPENING VERSE              │  <- variant="label" (Cinzel), burgundy
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
