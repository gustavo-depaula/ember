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
