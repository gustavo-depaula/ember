import { createTokens } from 'tamagui'

export const tokens = createTokens({
  color: {
    // Light mode
    cream: '#FAF6F0',
    surface: '#FFFDF9',
    brown: '#2C2418',
    brownMuted: '#6B5D4F',
    gold: '#C9A84C',
    goldDeep: '#A8872E',
    goldSubtle: '#D4C088',
    borderLight: '#E5DDD2',

    // Dark mode (Tenebrae — gothic cathedral)
    espresso: '#0E0D0C',
    espressoSurface: '#1A1816',
    creamSoft: '#EDE4D8',
    creamMuted: '#918880',
    borderDark: '#2A2622',

    // Secondary accents
    burgundy: '#6B1D2A',
    burgundyLight: '#C75B6B',
    mutedBlue: '#3D5A80',
    mutedBlueLight: '#7A9EC8',
    cloisterGreen: '#2D6A4F',
    cloisterGreenLight: '#52A878',
    goldMuted: '#5C4D2A',
    goldBright: '#D4A63A',

    // Ornament palette (Book of Hours)
    floralRed: '#B83A3A',
    floralRedLight: '#D4706F',
    floralBlue: '#4A6FA0',
    floralBlueLight: '#7BA0C4',
    floralOrange: '#D4883A',
    floralOrangeLight: '#E8B87A',
    vineGreen: '#3A7A4A',
    vineGreenLight: '#6AAE6A',
    vineGreenDark: '#2A5A3A',

    // Dark mode ornament palette (stained-glass jewel tones)
    floralRedDark: '#9A2E2E',
    floralBlueDark: '#3B5E8A',
    floralOrangeDark: '#B87830',
    vineGreenDarkMode: '#2D6840',

    // Green wall — light
    wallEmptyLight: '#E8E4D9',
    wallLowLight: '#C5D5C0',
    wallMediumLight: '#8FB88A',
    wallHighLight: '#5A9A55',
    wallFullLight: '#2D6A4F',

    // Green wall — dark
    wallEmptyDark: '#1A1816',
    wallLowDark: '#1E3A2E',
    wallMediumDark: '#286848',
    wallHighDark: '#388A58',
    wallFullDark: '#48A868',

    // Liturgical
    advent: '#5B2C6F',
    christmas: '#F5F0E0',
    lent: '#7D3C98',
    easter: '#F5F0E0',
    ordinary: '#2D6A4F',
    martyr: '#922B21',

    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    true: 16,
  },

  size: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    true: 16,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
    true: 12,
  },

  zIndex: {
    low: 1,
    mid: 10,
    high: 100,
    true: 1,
  },
})
