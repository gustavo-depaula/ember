import { isGreek } from '@/lib/typography/greek'
import { isHebrew } from '@/lib/typography/hebrew'

export type ReadingFontId =
  | 'eb-garamond'
  | 'crimson-pro'
  | 'lora'
  | 'cormorant-garamond'
  | 'libre-baskerville'
  | 'source-serif-4'
  | 'merriweather'
  | 'ezra-sil'

type ReadingFontDef = {
  id: ReadingFontId
  label: string
  description: string
  family: string
  /** Draws polytonic Greek (breathings, circumflex, iota subscript). */
  greek?: true
  /** A face for one script only, set wherever that script is and never offered
   *  in the font picker: the reader's choice of face is for the Latin alphabet. */
  script?: 'hebrew'
}

export const readingFonts: ReadingFontDef[] = [
  {
    id: 'eb-garamond',
    label: 'EB Garamond',
    description: 'Renaissance old-style serif',
    family: 'EBGaramond_400Regular',
    greek: true,
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
  {
    id: 'ezra-sil',
    label: 'Ezra SIL',
    description: 'Biblical Hebrew, after the Biblia Hebraica Stuttgartensia',
    family: 'EzraSIL',
    script: 'hebrew',
  },
]

/** The faces a reader chooses between. */
export const pickableReadingFonts = readingFonts.filter((f) => !f.script)

/**
 * The face text in `language` is set in: the reader's own, unless it cannot
 * draw the language. Only EB Garamond has polytonic Greek; in the others a
 * Greek page falls back glyph by glyph to a system face, accented letters in
 * one face and bare ones in another.
 */
export function readingFontFor(chosen: ReadingFontId, language: string): ReadingFontId {
  // None of the reading faces has the Hebrew points and cantillation; Ezra SIL
  // stacks them as the printed Hebrew Bible does.
  if (isHebrew(language)) return 'ezra-sil'
  if (!isGreek(language) || readingFonts.find((f) => f.id === chosen)?.greek) return chosen
  return 'eb-garamond'
}

export function getFontFamily(id: ReadingFontId): string {
  return readingFonts.find((f) => f.id === id)?.family ?? 'EBGaramond_400Regular'
}

// WebKit (inside react-native-webview) addresses bundled fonts by their
// PostScript name (e.g. `EBGaramond-Regular`), not the expo-font key
// (`EBGaramond_400Regular`). The underscore form silently falls back to a
// system serif inside the iframe.
export function getCssFontFamily(id: ReadingFontId): string {
  return getFontFamily(id).replace(/_\d+(?=[A-Z])/, '-')
}
