import { createTamagui } from 'tamagui'

import { bodyFont, displayFont, headingFont, scriptFont } from './fonts'
import { darkTheme, lightTheme, liturgicalSubThemes } from './themes'
import { tokens } from './tokens'

export const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    light_advent: { ...lightTheme, ...liturgicalSubThemes.advent },
    dark_advent: { ...darkTheme, ...liturgicalSubThemes.advent },
    light_lent: { ...lightTheme, ...liturgicalSubThemes.lent },
    dark_lent: { ...darkTheme, ...liturgicalSubThemes.lent },
    light_christmas: { ...lightTheme, ...liturgicalSubThemes.christmas },
    dark_christmas: { ...darkTheme, ...liturgicalSubThemes.christmas },
    light_easter: { ...lightTheme, ...liturgicalSubThemes.easter },
    dark_easter: { ...darkTheme, ...liturgicalSubThemes.easter },
    light_ordinary: { ...lightTheme, ...liturgicalSubThemes.ordinary },
    dark_ordinary: { ...darkTheme, ...liturgicalSubThemes.ordinary },
    light_martyr: { ...lightTheme, ...liturgicalSubThemes.martyr },
    dark_martyr: { ...darkTheme, ...liturgicalSubThemes.martyr },
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
