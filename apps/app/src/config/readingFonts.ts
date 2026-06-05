export type ReadingFontId =
  | 'eb-garamond'
  | 'crimson-pro'
  | 'lora'
  | 'cormorant-garamond'
  | 'libre-baskerville'
  | 'source-serif-4'
  | 'merriweather'

type ReadingFontDef = {
  id: ReadingFontId
  label: string
  description: string
  /** Native (expo-font + Tamagui) family name. */
  family: string
  /** CSS font-family name as Google Fonts publishes it. Used inside the book
   *  reader's DOM Component WebView, where the expo-font registry isn't
   *  available and only @font-face-loaded names resolve. */
  cssFamily: string
}

export const readingFonts: ReadingFontDef[] = [
  {
    id: 'eb-garamond',
    label: 'EB Garamond',
    description: 'Renaissance old-style serif',
    family: 'EBGaramond_400Regular',
    cssFamily: 'EB Garamond',
  },
  {
    id: 'crimson-pro',
    label: 'Crimson Pro',
    description: 'Garamond-inspired, larger x-height',
    family: 'CrimsonPro_400Regular',
    cssFamily: 'Crimson Pro',
  },
  {
    id: 'lora',
    label: 'Lora',
    description: 'Calligraphic warmth, brushed curves',
    family: 'Lora_400Regular',
    cssFamily: 'Lora',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    description: 'Elegant and literary',
    family: 'CormorantGaramond_400Regular',
    cssFamily: 'Cormorant Garamond',
  },
  {
    id: 'libre-baskerville',
    label: 'Libre Baskerville',
    description: 'Clean transitional serif',
    family: 'LibreBaskerville_400Regular',
    cssFamily: 'Libre Baskerville',
  },
  {
    id: 'source-serif-4',
    label: 'Source Serif',
    description: 'Modern clarity, screen-optimized',
    family: 'SourceSerif4_400Regular',
    cssFamily: 'Source Serif 4',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    description: 'Sturdy slab serif, highly legible',
    family: 'Merriweather_400Regular',
    cssFamily: 'Merriweather',
  },
]

export function getFontFamily(id: ReadingFontId): string {
  return readingFonts.find((f) => f.id === id)?.family ?? 'EBGaramond_400Regular'
}

/** CSS font-family stack for the DOM Component reader WebView. */
export function getCssFontFamily(id: ReadingFontId): string {
  const family = readingFonts.find((f) => f.id === id)?.cssFamily ?? 'EB Garamond'
  return `'${family}', Georgia, 'Times New Roman', serif`
}
