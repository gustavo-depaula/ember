import { createFont } from 'tamagui'

export const displayFont = createFont({
  family: 'UnifrakturMaguntia',
  size: {
    1: 14,
    2: 17,
    3: 22,
    4: 28,
    5: 36,
    6: 48,
    7: 56,
    true: 36,
  },
  lineHeight: {
    1: 18,
    2: 22,
    3: 28,
    4: 34,
    5: 42,
    6: 56,
    7: 64,
    true: 42,
  },
  weight: {
    4: '400',
    true: '400',
  },
  face: {
    400: { normal: 'UnifrakturMaguntia' },
  },
})

export const headingFont = createFont({
  family: 'Cinzel_400Regular',
  size: {
    1: 13,
    2: 15,
    3: 18,
    4: 22,
    5: 28,
    6: 32,
    7: 36,
    true: 22,
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 24,
    4: 29,
    5: 34,
    6: 38,
    7: 42,
    true: 29,
  },
  weight: {
    4: '400',
    true: '400',
  },
  face: {
    400: { normal: 'Cinzel_400Regular' },
    700: { normal: 'Cinzel_700Bold' },
  },
})

export const bodyFont = createFont({
  family: 'EBGaramond_400Regular',
  size: {
    1: 14,
    2: 16,
    3: 19,
    4: 21,
    5: 24,
    true: 19,
  },
  lineHeight: {
    1: 20,
    2: 23,
    3: 27,
    4: 30,
    5: 34,
    true: 27,
  },
  weight: {
    3: '400',
    4: '400',
    5: '500',
    true: '400',
  },
  face: {
    400: { normal: 'EBGaramond_400Regular', italic: 'EBGaramond_400Regular_Italic' },
    500: { normal: 'EBGaramond_500Medium' },
    600: { normal: 'EBGaramond_600SemiBold' },
  },
})

export const scriptFont = createFont({
  family: 'PinyonScript_400Regular',
  size: {
    1: 14,
    2: 16,
    3: 19,
    4: 22,
    5: 28,
    true: 19,
  },
  lineHeight: {
    1: 20,
    2: 24,
    3: 28,
    4: 32,
    5: 38,
    true: 28,
  },
  weight: {
    4: '400',
    true: '400',
  },
  face: {
    400: { normal: 'PinyonScript_400Regular' },
  },
})
