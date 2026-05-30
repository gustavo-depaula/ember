import { createTamagui } from 'tamagui'

import { bodyFont, displayFont, headingFont, scriptFont, titleFont } from './fonts'
import { darkTheme, illuminatedTheme, lightTheme } from './themes'
import { tokens } from './tokens'

export const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    illuminated: illuminatedTheme,
  },
  fonts: {
    display: displayFont,
    title: titleFont,
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
