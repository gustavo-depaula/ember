import { styled, Text } from 'tamagui'

/**
 * The Ladder of Reverence, as one component. `variant` names the rung; `tone` is
 * the single orthogonal modifier; everything else is a pass-through Tamagui
 * `Text` prop (`fontSize`, `color`, `textAlign`, `fontWeight`, `letterSpacing`,
 * `numberOfLines`, `maxWidth`…). Each variant sets sensible *defaults* that call
 * sites override exactly where context demands (a hero `sacred-title` at `$5`,
 * the same in a list row at `$3`).
 *
 * Screens reach for `<Typography variant="…">` by intent and never set a raw
 * `fontFamily` — that discipline is what keeps the type system from drifting.
 * The app is all-serif: chrome recedes via size/weight/color/case, never a sans.
 *
 * Color is a rationed second channel: gold (`$accent`) = preciousness only;
 * burgundy (`$colorBurgundy`) = sacred labels/rubrics only; UI stays neutral.
 *
 *   variant         rung  face       role
 *   interface       1     $body      quiet UI chrome (default)
 *   screen-title    1     $title     italic utility screen hero
 *   rubric          2a    $body      italic instructions, burgundy
 *   annotation      2b    $body      base marginalia, muted
 *   reference       2b    $body      citations / cross-refs, muted + tracked
 *   verse-number    2b    $body      inline verse marker, muted (caller sizes)
 *   caption         2b    $body      image captions, muted italic
 *   whisper         2b    $body      devotional line — upright, muted
 *   label           5     $heading   tracked-caps signpost, burgundy
 *   marker          5     $heading   UPPERCASE wide-tracked centered division
 *   sacred-title    6     $title     centered manuscript name of a sacred thing
 *   ceremonial      7     $display   ✠ / fleuron / blackletter, gold (≤1/screen)
 *   drop-cap        7     $title     illuminated opening versal (opt-in)
 *
 * Not here, by design: the reading & prayer body (`PrayerText` / `PrayerLines`,
 * rungs 3–4) stays its own component — it consumes `useReadingStyle` (the user's
 * font/size/leading + measure cap), and a styled component can't call hooks.
 */
export const Typography = styled(Text, {
  name: 'Typography',
  fontFamily: '$body',
  color: '$color',

  variants: {
    variant: {
      interface: {},
      'screen-title': {
        fontFamily: '$title',
        // Numeric, not a token: a styled(Text)'s size type is inferred from the
        // default $body font (1–5), so a hero size must be raw.
        fontSize: 48,
        lineHeight: 56,
        fontStyle: 'italic',
      },
      rubric: { fontSize: '$2', fontStyle: 'italic', color: '$colorBurgundy' },
      annotation: { fontSize: '$1', color: '$colorSecondary' },
      reference: { fontSize: '$1', color: '$colorSecondary', letterSpacing: 0.5 },
      'verse-number': { color: '$colorSecondary' },
      caption: { fontSize: '$1', fontStyle: 'italic', color: '$colorSecondary' },
      whisper: { color: '$colorSecondary' },
      label: {
        fontFamily: '$heading',
        fontSize: '$3',
        letterSpacing: 0.5,
      },
      marker: {
        fontFamily: '$heading',
        fontSize: '$3',
        color: '$colorBurgundy',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textAlign: 'center',
      },
      'sacred-title': { fontFamily: '$title', fontSize: '$4', textAlign: 'center' },
      'section-title': {
        fontFamily: '$title',
        fontSize: '$4',
        fontStyle: 'italic',
      },
      ceremonial: { fontFamily: '$display', color: '$accent' },
      'drop-cap': {
        fontFamily: '$title',
        // Numeric, not a token (see screen-title) — a large versal, ~2.4× body.
        fontSize: 46,
        lineHeight: 46,
        color: '$colorBurgundy',
      },
    },

    // Applied after `variant` (defined later → wins on color), so a muted label
    // or quiet chrome line drops to the secondary ink without a manual color.
    tone: {
      default: {},
      muted: { color: '$colorSecondary' },
    },
  } as const,

  defaultVariants: {
    variant: 'interface',
  },
})
