import { darkTheme, illuminatedTheme, lightTheme } from '@/config/themes'

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}

function declarations(theme: Record<string, string>): string {
  return Object.entries(theme)
    .map(([key, value]) => `--${kebab(key)}:${value}`)
    .join(';')
}

// The palette is the app's own theme objects, emitted as custom properties, so
// a color changed in the app changes here on the next build. Dark is "Tenebrae";
// `.illuminated` is the brighter lettering used on jewel-ground cards.
export const themeCss = [
  `:root{color-scheme:light;${declarations(lightTheme)}}`,
  `@media (prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;${declarations(darkTheme)}}}`,
  `:root[data-theme=dark]{color-scheme:dark;${declarations(darkTheme)}}`,
  `.illuminated{${declarations(illuminatedTheme)}}`,
].join('')
