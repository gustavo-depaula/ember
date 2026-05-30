import type { LiturgicalSeason } from '@/lib/liturgical'

export const lightTheme = {
  background: '#FFFFFF',
  backgroundSurface: '#F5F5F5',
  color: '#2C2418',
  colorSecondary: '#6B5D4F',
  accent: '#C9A84C',
  accentHover: '#A8872E',
  accentSubtle: '#D4C088',
  borderColor: '#E5DDD2',
  colorBurgundy: '#6B1D2A',
  colorMutedBlue: '#3D5A80',
  colorGreen: '#2D6A4F',
  colorDestructive: '#B4322A',
  wallEmpty: '#E8E4D9',
  wallLow: '#C5D5C0',
  wallMedium: '#8FB88A',
  wallHigh: '#5A9A55',
  wallFull: '#2D6A4F',
  // Multi-hue wall: extra (gold), ideal (blue), essential (green), perfect (burgundy)
  wallExtra1: '#E8D9A0',
  wallExtra2: '#C9A84C',
  wallIdeal1: '#A8C4D9',
  wallIdeal2: '#3D5A80',
  wallEssential1: '#8FB88A',
  wallEssential2: '#2D6A4F',
  wallPerfect: '#6B1D2A',
  floralRed: '#B83A3A',
  floralBlue: '#4A6FA0',
  floralOrange: '#D4883A',
  vineGreen: '#3A7A4A',
  vineGreenDark: '#2A5A3A',
  goldBright: '#D4B44C',
}

export const darkTheme = {
  background: '#0E0D0C',
  backgroundSurface: '#252220',
  color: '#EDE4D8',
  colorSecondary: '#A89A8C',
  accent: '#D4A63A',
  accentHover: '#B8902A',
  accentSubtle: '#6E5C32',
  borderColor: '#5C5248',
  // Liturgical rubric red on the near-black page — a clear missal red, not a muddy
  // rose, so rubrics and burgundy labels read legibly in dark mode.
  colorBurgundy: '#D45A4C',
  colorMutedBlue: '#7A9EC8',
  colorGreen: '#52A878',
  colorDestructive: '#D4584E',
  wallEmpty: '#252220',
  wallLow: '#1E3A2E',
  wallMedium: '#286848',
  wallHigh: '#388A58',
  wallFull: '#48A868',
  // Multi-hue wall: extra (gold), ideal (blue), essential (green), perfect (burgundy)
  wallExtra1: '#3A3018',
  wallExtra2: '#D4A63A',
  wallIdeal1: '#1E3448',
  wallIdeal2: '#7A9EC8',
  wallEssential1: '#286848',
  wallEssential2: '#48A868',
  wallPerfect: '#C75B6B',
  floralRed: '#9A2E2E',
  floralBlue: '#3B5E8A',
  floralOrange: '#B87830',
  vineGreen: '#2D6840',
  vineGreenDark: '#1E5030',
  goldBright: '#D4A63A',
}

// Lettering palette for the vivid jewel-ground cards (home carousel). Based on
// the dark theme but brighter across the board so cream/gold/parchment text
// stays legible on deep saturated grounds — the dark theme's muted secondary
// (tuned for a near-black background) was too dim on a mid-tone jewel ground.
export const illuminatedTheme = {
  ...darkTheme,
  color: '#F5EEE1',
  colorSecondary: '#DACAB2',
  accent: '#E6C158',
  accentHover: '#E6C158',
  accentSubtle: '#C2A24E',
  colorBurgundy: '#EAAAB2',
}

// The app no longer re-themes itself by liturgical season — the only thing that
// still shifts color by season is the Fraktur season hero in the home
// LiturgicalHeader. This is its palette: the vestment-ish accent per season
// (plus `rose` for Gaudete / Laetare), in light and dark.
export const seasonalAccent: Record<LiturgicalSeason | 'rose', { light: string; dark: string }> = {
  advent: { light: '#5B2C6F', dark: '#7B3E9A' },
  christmas: { light: '#C9A84C', dark: '#D4A63A' },
  epiphany: { light: '#2D6A4F', dark: '#3A8A5A' },
  septuagesima: { light: '#5B2C6F', dark: '#7B3E9A' },
  lent: { light: '#7D3C98', dark: '#9B50B8' },
  easter: { light: '#C9A84C', dark: '#D4A63A' },
  ordinary: { light: '#2D6A4F', dark: '#3A8A5A' },
  'post-pentecost': { light: '#2D6A4F', dark: '#3A8A5A' },
  rose: { light: '#C27083', dark: '#D98A9A' },
}
