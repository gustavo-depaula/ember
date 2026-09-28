# Design System

## Aesthetic: a digital Book of Hours

Reverent, calm, warm, readable, structured around prayer. It draws on illuminated manuscripts and printed missals without their weight: light, quiet, intentional. **Ornament supports prayer; it never competes with usability.**

Standing decisions, which override anything below that seems to conflict:

- **Hierarchy comes from type, space and printer's ornament**: rules, fleurons, a small inline ✠. Not bordered pills, boxes or card chrome. A border only delimits a genuine region (a sheet, an input, an image frame).
- **No radial glows or halos.**
- **`$script` and italic are rare accents**, never prayer bodies.

Tokens, themes and fonts are one Tamagui config: `apps/app/src/config/tokens.ts`, `themes.ts`, `fonts.ts`, `tamagui.config.ts`.

## Palette roles

Use the theme keys, never hex values. Values live in `apps/app/src/config/themes.ts`.

| Key | Role |
|---|---|
| `background` / `backgroundSurface` | Page / raised surface |
| `color` | Ink: all reading and prayer text |
| `colorSecondary` | Muted ink: apparatus, quiet chrome, `tone="muted"` |
| `colorBurgundy` | Rubric red: rubrics, liturgical labels, drop caps. In dark mode a clear missal red (not a muddy rose) so rubrics stay legible |
| `accent` / `accentHover` / `accentSubtle` | Gold: preciousness |
| `colorMutedBlue` | Tappable cross-reference links (a link affordance) |
| `colorGreen` | Completion |
| `wall*` | The votive wall. Value is glow intensity (ember on cream, flame on near-black), not a hue per tier |

- **Dark mode is "Tenebrae"**: near-black stone, bone-white ink, gold catching candlelight.
- **The `illuminated` theme** brightens the dark palette for text on the vivid jewel-ground cards (home carousel), where the dark theme's secondary ink is too dim.
- **The app does not re-theme by liturgical season.** The palette is the same all year; the season is named in text, not tinted. Vestment colors appear only where the liturgy itself shows them (the Mass's `liturgical-color` blocks and section-marker rules).

## Typography: the Ladder of Reverence

Type is a sign system for use and reverence. A glance should tell the reader *how to use* a piece of text (pray it, read it, do it, tap it) before they read a word, the way a missal's red ink, versals and inscriptional caps do.

**The app is all-serif.** A quiet sans for interface text was tried and rejected: it read as generic-app chrome against the manuscript character. Chrome recedes by size, weight, color and case, never by switching typeface. The families: **EB Garamond** `$body` (reading, prayer, quiet UI), **Cinzel** `$heading` (labels), **Junicode** `$title` (sacred titles; full weight range, local OFL files in `apps/app/assets/fonts/`), **UnifrakturMaguntia** `$display` (the rare ceremonial peak).

The ladder is one component, `Typography` (`apps/app/src/components/typography/Typography.tsx`); its `variant` is the rung. Screens use `<Typography variant="…">`, never a raw `fontFamily`. The reading and prayer body (rungs 3–4) is the one carve-out: `PrayerText` / `PrayerLines` consume the user's reading preferences through `useReadingStyle`, and a styled component can't call hooks.

| Rung | Register | Face | Color | `variant` |
|---|---|---|---|---|
| 1 | **Interface**: tabs, buttons, settings, counts, times, dates | `$body` | neutral ink; never gold or red | `interface` (default); utility-screen hero `screen-title` |
| 2a | **Rubric**: liturgical instructions ("All stand") | `$body` italic | rubric red | `rubric` |
| 2b | **Apparatus**: verse numbers, citations, captions, devotional whispers | small `$body` | muted ink | `annotation`, `reference`, `verse-number`, `caption`, `whisper` |
| 3 | **Reading**: books, catechism, scripture, articles | user's reading serif | ink | *(`PrayerText`)* |
| 4 | **Prayer**: prayers, psalms, antiphons | same serif, line-set, with air and an optional drop cap | ink | *(`PrayerLines`)* |
| 5 | **Liturgical label**: section labels, hours | `$heading`, tracked caps | ink or rubric red | `label`; major division ("PSALMODY") `marker` |
| 6 | **Sacred title**: feast and season names, hour titles, book titles, sacred page headers | `$title`, mixed case | ink or rubric red | `sacred-title`; italic section heading `section-title` |
| 7 | **Ceremonial peak**: illuminated drop cap, ✠, fleuron, blackletter | `$title` / `$display` | gold or red | `drop-cap`, `ceremonial` |

`tone="muted"` drops any variant to `colorSecondary`. Every other style is a pass-through `Text` prop: variants set defaults that call sites override (a hero `sacred-title` at `$5`, the same in a list row at `$3`).

Rungs 3 and 4 are treatments, not fonts: reading is a *river* (paragraphs, measure, flow); prayer is *architecture* (sense-lines, air, a versal opening).

### Disciplines

1. **Use the lowest adequate rung.** Roughly 90 % of pixels are rungs 1–3.
2. **One rung-7 peak per screen.** `drop-cap` and `ceremonial` are opt-in, never automatic.
3. **Color is rationed like ornament.** Red for rubrics and liturgical labels, gold for preciousness, neutral ink for UI. The one exception is `colorMutedBlue` on tappable cross-references.
4. **Ornament marks beginnings and ends, never the middle.**
5. **No font does two jobs.** A needed style that no variant covers becomes a variant; don't set `fontFamily` or `fontSize` inline.

### Per-screen choreography

The deeper into prayer, the higher a screen's center of gravity climbs the ladder and the more rung-1 chrome recedes.

- **Home**: interface-dominant; its one peak is the italic date title, which is also the day scrubber (`DateScrubber`).
- **Reader** (Bible, book): reading-dominant; header controls are quiet `interface`, verse numbers muted.
- **Prayer flow**: prayer-dominant; chrome nearly vanishes: `sacred-title` hour, `label` parts, red `rubric`, line-set prayer, a single peak.

### Scale and leading

EB Garamond's x-height is small next to a system sans, so reading sizes run generous. **Reading leading is a ratio** of the font size (`leadingRatio` in `apps/app/src/hooks/useReadingStyle.ts`), so it stays comfortable at every size. `useReadingMaxWidth()` caps the reading **column** at 34 em on wide screens; never cap individual lines, which breaks bilingual side-by-side. Line breaking and justification: `docs/design/typography-justification.md`.

## Layout

- **Generous whitespace.** At least 16 px at screen edges, 24 px between major sections, 12 px between related elements.
- **Ornament is concentrated where prayer is**: richest in the prayer flow, light on Home, absent on utility screens (settings, editors).
- **Corners are bookish, not bubbly** (≈8 px) wherever a genuine region needs a frame.

### Motion

Gentle and measured (200–300 ms), never bouncy. Transitions carry hierarchy, never a blanket fade:

- **Drill-down** → the native push (slide, parallax, interactive swipe-back). Stacks set no `animation` override, only `contentStyle` to avoid a white flash mid-slide.
- **Hero → detail** → the iOS zoom morph via `ZoomLink` (`Link.AppleZoom`) for collection tiles, book covers and saint cards. Its child must be a single pressable that forwards `onPress`.
- **Player or editor** → `presentation: 'fullScreenModal'` (book reader, audio player, custody editor). Zoom morphs need this presentation.
- **Tab switches** → `NativeTabs`; the stack doesn't animate them.

### Iconography

Line icons from `lucide-react-native`: thin strokes, secondary ink when inactive. The exception is the tab bar, whose tabs are full-color illuminated medallion PNGs (`apps/app/assets/nav-icons/`) rendered with `renderingMode="original"` so they keep their gold. Tab labels set Junicode through `NativeTabs labelStyle` using the font's **PostScript name** (`Junicode-Light`), not the `useFonts` key or the `$title` token.
