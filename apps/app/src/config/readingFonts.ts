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
  family: string
}

export const readingFonts: ReadingFontDef[] = [
  {
    id: 'eb-garamond',
    label: 'EB Garamond',
    description: 'Renaissance old-style serif',
    family: 'EBGaramond_400Regular',
  },
  {
    id: 'crimson-pro',
    label: 'Crimson Pro',
    description: 'Garamond-inspired, larger x-height',
    family: 'CrimsonPro_400Regular',
  },
  {
    id: 'lora',
    label: 'Lora',
    description: 'Calligraphic warmth, brushed curves',
    family: 'Lora_400Regular',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    description: 'Elegant and literary',
    family: 'CormorantGaramond_400Regular',
  },
  {
    id: 'libre-baskerville',
    label: 'Libre Baskerville',
    description: 'Clean transitional serif',
    family: 'LibreBaskerville_400Regular',
  },
  {
    id: 'source-serif-4',
    label: 'Source Serif',
    description: 'Modern clarity, screen-optimized',
    family: 'SourceSerif4_400Regular',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    description: 'Sturdy slab serif, highly legible',
    family: 'Merriweather_400Regular',
  },
]

export function getFontFamily(id: ReadingFontId): string {
  return readingFonts.find((f) => f.id === id)?.family ?? 'EBGaramond_400Regular'
}
