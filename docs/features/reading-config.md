# Reading Configuration

## Overview

A shared reading configuration system that controls typography and layout across all reading experiences in the app (Bible reader, Catechism reader, Divine Office PrayerFlow, and future readers). Users configure their preferences once in Settings, and all reading surfaces reflect the changes.

---

## Settings

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| Font | 7 curated serif fonts | EB Garamond | Controls the body text font family |
| Font Size | Steps 1-5 (16, 19, 22, 26, 32px) | 3 (22px) | Controls body text size using a reading-specific scale |
| Line Spacing | Steps 1-5 (24, 28, 34, 40, 48px) | 3 (34px) | Controls line height. Must be >= font size step |
| Text Alignment | Left, Justify | Justify | Controls text alignment for reading content |
| Margins | Narrow, Normal, Wide | Normal | Controls horizontal padding around reading content |

### Curated Font List

Defined in `src/config/readingFonts.ts`. All are serif fonts chosen for extended devotional reading:

| ID | Font | Description |
|----|------|-------------|
| `eb-garamond` | EB Garamond | Renaissance old-style serif (default) |
| `crimson-pro` | Crimson Pro | Garamond-inspired, larger x-height |
| `lora` | Lora | Calligraphic warmth, brushed curves |
| `cormorant-garamond` | Cormorant Garamond | Elegant and literary |
| `libre-baskerville` | Libre Baskerville | Clean transitional serif |
| `source-serif-4` | Source Serif | Modern clarity, screen-optimized |
| `merriweather` | Merriweather | Sturdy slab serif, highly legible |

All fonts are loaded via `expo-font` in `_layout.tsx` at app startup. To add a new font: install the `@expo-google-fonts/*` package, add the import and `useFonts` entry in `_layout.tsx`, and add an entry to the `readingFonts` array in `readingFonts.ts`.

Margin presets map to Tamagui space tokens: Narrow = `$sm` (8px), Normal = `$md` (16px), Wide = `$lg` (24px). These are applied as additional `paddingHorizontal` on reading content containers, on top of `ScreenLayout` padding.

---

## Architecture

### Font Config: `src/config/readingFonts.ts`

Defines the curated font list with IDs, labels, descriptions, and raw font family names. Exports `readingFonts` array and `getFontFamily(id)` helper.

### Store: `src/stores/readingConfigStore.ts`

Zustand + immer store with AsyncStorage persistence, following the same pattern as `themeStore` and `preferencesStore`. AsyncStorage keys: `reading-font-family`, `reading-font-size`, `reading-line-height`, `reading-margin`, `reading-text-align`.

The `setFontSizeStep` setter auto-bumps `lineHeightStep` when it would fall below the new font size step, ensuring readability.

Hydrated at app startup in `src/app/_layout.tsx` alongside other stores.

### Hook: `src/hooks/useReadingStyle.ts`

Exports a reading-specific scale (`readingScale`) with font sizes and line heights tuned for extended reading (larger than the body font token scale). Three hooks for consuming reading config:

- `useReadingStyle()` — returns `{ fontFamily, fontSize, lineHeight, textAlign }` spreadable onto `Text` components. Font size and line height are raw pixel numbers from `readingScale`
- `useReadingFontSizePx()` — returns the current font size in pixels
- `useReadingMargin()` — returns the margin space token for container `paddingHorizontal`

### Component: `src/components/PrayerText.tsx`

Converted from a `styled(Text)` to a function component that calls `useReadingStyle()` and spreads the values. All consumers of `PrayerText` automatically pick up reading config.

---

## Consumers

Components that read from the reading config:

| Component | What it uses |
|-----------|-------------|
| `PrayerText` | `useReadingStyle()` — font family, font size, line height, alignment |
| `IlluminatedInitial` | `useReadingStyle()` on the rest-of-text block |
| `ChapterContent` (Bible) | `useReadingStyle()` + `useReadingMargin()` |
| `SegmentContent` (Catechism) | `useReadingStyle()` + `useReadingMargin()` |
| `PrayerFlow` (Divine Office) | `useReadingMargin()` on ManuscriptFrame content; text handled via `PrayerText` |
| Settings preview | `useReadingStyle()` + `useReadingMargin()` for live preview |

---

## Settings UI

### Full Settings Page

Located in `src/app/settings/index.tsx` under the "Reading" section heading, between Theme and "Mark Books as Already Read".

### In-Reader Modal

`ReadingConfigModal` and `ReadingConfigBadge` in `src/components/ReadingConfigModal.tsx`. The badge appears in the left panel of both the Bible reader and Catechism reader, below other panel controls. Pressing it opens a page-sheet modal with the same reading config controls as the Settings page, allowing users to adjust typography without leaving the reading experience.

### Controls (shared between both UIs)

- **Font** — list of curated fonts, each row shows the font name rendered in that font with a description. Selected font highlighted with accent background
- **Font Size** and **Line Spacing** — stepper buttons (minus/plus) with current px value displayed
- **Text Alignment** — segmented pill selector (Left / Justify)
- **Margins** — segmented pill selector (Narrow / Normal / Wide)
- **Live preview** — sample paragraph (Hail Mary) rendered with current settings in a surface-colored card

---

## Adding a New Reader

To make a new reading experience respect the shared config:

1. Call `useReadingStyle()` and spread onto body text `<Text>` components (provides fontFamily, fontSize, lineHeight, textAlign)
2. Call `useReadingMargin()` and apply as `paddingHorizontal` on the content container
3. Use `<PrayerText>` for prayer/body text lines — it reads from the config automatically

## Adding a New Font

1. Install `@expo-google-fonts/<font-name>`
2. Import the `400Regular` export in `src/app/_layout.tsx` and add to `useFonts()`
3. Add an entry to `readingFonts` in `src/config/readingFonts.ts` with the font family name, label, and description
