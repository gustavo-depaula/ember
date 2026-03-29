import { createTamagui } from 'tamagui'

import { bodyFont, displayFont, headingFont, scriptFont } from './fonts'
import { darkTheme, lightTheme, liturgicalSubThemes, liturgicalSubThemesDark } from './themes'
import { tokens } from './tokens'

export const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    light_advent: { ...lightTheme, ...liturgicalSubThemes.advent },
    dark_advent: { ...darkTheme, ...liturgicalSubThemesDark.advent },
    light_christmas: { ...lightTheme, ...liturgicalSubThemes.christmas },
    dark_christmas: { ...darkTheme, ...liturgicalSubThemesDark.christmas },
    light_epiphany: { ...lightTheme, ...liturgicalSubThemes.epiphany },
    dark_epiphany: { ...darkTheme, ...liturgicalSubThemesDark.epiphany },
    light_septuagesima: { ...lightTheme, ...liturgicalSubThemes.septuagesima },
    dark_septuagesima: { ...darkTheme, ...liturgicalSubThemesDark.septuagesima },
    light_lent: { ...lightTheme, ...liturgicalSubThemes.lent },
    dark_lent: { ...darkTheme, ...liturgicalSubThemesDark.lent },
    light_easter: { ...lightTheme, ...liturgicalSubThemes.easter },
    dark_easter: { ...darkTheme, ...liturgicalSubThemesDark.easter },
    light_ordinary: { ...lightTheme, ...liturgicalSubThemes.ordinary },
    dark_ordinary: { ...darkTheme, ...liturgicalSubThemesDark.ordinary },
    'light_post-pentecost': { ...lightTheme, ...liturgicalSubThemes['post-pentecost'] },
    'dark_post-pentecost': { ...darkTheme, ...liturgicalSubThemesDark['post-pentecost'] },
    light_martyr: { ...lightTheme, ...liturgicalSubThemes.martyr },
    dark_martyr: { ...darkTheme, ...liturgicalSubThemesDark.martyr },
  },
  fonts: {
    display: displayFont,
    heading: headingFont,
    body: bodyFont,
    script: scriptFont,
  },
  media: {
    sm: { maxWidth: 640 },
    md: { maxWidth: 768 },
    lg: { maxWidth: 1024 },
  },
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
