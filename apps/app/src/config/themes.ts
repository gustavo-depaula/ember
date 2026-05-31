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
  // Votive wall — warm ember on cream, glow intensity rises with value (no tier hue)
  wallEmpty: '#ECE6DA',
  wallLow: '#E6CF9A',
  wallMedium: '#D9A94E',
  wallHigh: '#C2832C',
  wallFull: '#A8651C',
  wallExtra1: '#E9D6A6',
  wallExtra2: '#DFC177',
  wallIdeal1: '#D9A94E',
  wallIdeal2: '#CC9438',
  wallEssential1: '#C2832C',
  wallEssential2: '#B0721F',
  wallPerfect: '#995C12',
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
  // Votive wall — warm gold flames on near-black; value index = glow intensity,
  // not tier hue. Empty is faint ash; the brightest steps are a radiant flame core.
  wallEmpty: '#2A2320',
  wallLow: '#7A4E1E',
  wallMedium: '#C8862E',
  wallHigh: '#E0A23A',
  wallFull: '#F0BE55',
  wallExtra1: '#4A3418',
  wallExtra2: '#7A4E1E',
  wallIdeal1: '#A66A22',
  wallIdeal2: '#C8862E',
  wallEssential1: '#E0A23A',
  wallEssential2: '#F0BE55',
  wallPerfect: '#FFE08A',
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
