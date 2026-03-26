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

    // Dark mode
    espresso: '#1C1710',
    espressoSurface: '#2A2318',
    creamSoft: '#F0E6D3',
    creamMuted: '#A89F91',
    borderDark: '#3D3528',

    // Secondary accents
    burgundy: '#6B1D2A',
    burgundyLight: '#C4707E',
    mutedBlue: '#3D5A80',
    mutedBlueLight: '#7BA0C4',
    cloisterGreen: '#2D6A4F',
    cloisterGreenLight: '#5AAA7E',
    goldMuted: '#6B5D3A',
    goldBright: '#D4B44C',

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

    // Dark mode ornament palette (muted jewel tones)
    floralRedDark: '#8A3030',
    floralBlueDark: '#3A5570',
    floralOrangeDark: '#A06A30',
    vineGreenDarkMode: '#2A5A3A',

    // Green wall — light
    wallEmptyLight: '#E8E4D9',
    wallLowLight: '#C5D5C0',
    wallMediumLight: '#8FB88A',
    wallHighLight: '#5A9A55',
    wallFullLight: '#2D6A4F',

    // Green wall — dark
    wallEmptyDark: '#2A2419',
    wallLowDark: '#2D4A3A',
    wallMediumDark: '#2D6A4F',
    wallHighDark: '#3D8B5E',
    wallFullDark: '#4FAA6E',

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
