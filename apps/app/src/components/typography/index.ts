/**
 * The Ladder of Reverence — one intent-named component, `Typography`, whose
 * `variant` prop is the rung. See `Typography.tsx` for the full variant table.
 *
 * Screens reach for `<Typography variant="…">` and never set a raw `fontFamily`
 * for text. The reading & prayer body (rungs 3–4) lives in `../PrayerText`
 * (`PrayerText` / `PrayerLines`), since it consumes the user's reading prefs.
 */
export { Typography } from './Typography'
