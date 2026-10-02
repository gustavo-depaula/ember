import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond'
import { CrimsonPro_400Regular } from '@expo-google-fonts/crimson-pro'
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic } from '@expo-google-fonts/eb-garamond'
import { LibreBaskerville_400Regular } from '@expo-google-fonts/libre-baskerville'
import { Lora_400Regular } from '@expo-google-fonts/lora'
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather'
import { SourceSerif4_400Regular } from '@expo-google-fonts/source-serif-4'
import { useQuery } from '@tanstack/react-query'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { getCssFontFamily, type ReadingFontId } from '@/config/readingFonts'
import type { ReaderFontFace } from './foliate/FoliateReader'

type FaceFile = { module: number; style: 'normal' | 'italic' }

// The upright face of each reading font, plus Garamond's true italic. Bold and
// the other italics are left for the WebView to synthesize: every file crosses
// to the WebView as base64, and a Garamond face is half a megabyte.
const faceFiles: Record<ReadingFontId, FaceFile[]> = {
  'eb-garamond': [
    { module: EBGaramond_400Regular, style: 'normal' },
    { module: EBGaramond_400Regular_Italic, style: 'italic' },
  ],
  'crimson-pro': [{ module: CrimsonPro_400Regular, style: 'normal' }],
  lora: [{ module: Lora_400Regular, style: 'normal' }],
  'cormorant-garamond': [{ module: CormorantGaramond_400Regular, style: 'normal' }],
  'libre-baskerville': [{ module: LibreBaskerville_400Regular, style: 'normal' }],
  'source-serif-4': [{ module: SourceSerif4_400Regular, style: 'normal' }],
  merriweather: [{ module: Merriweather_400Regular, style: 'normal' }],
}

async function loadFaces(fontId: ReadingFontId): Promise<ReaderFontFace[]> {
  const family = getCssFontFamily(fontId)
  return Promise.all(
    faceFiles[fontId].map(async ({ module, style }) => {
      const asset = await Asset.fromModule(module).downloadAsync()
      if (!asset.localUri) throw new Error(`Reading font ${fontId} has no local file`)
      return { family, weight: 400, style, base64: await new File(asset.localUri).base64() }
    }),
  )
}

/**
 * The font files the reader's WebView must be handed for a reading font, or
 * `undefined` while they load. An Android WebView cannot see the fonts the app
 * loaded, so without them every book sets in the system serif whatever the
 * reader chose.
 */
export function useReaderFontFaces(fontId: ReadingFontId): ReaderFontFace[] | undefined {
  const { data, error } = useQuery({
    queryKey: ['reader-font-faces', fontId],
    queryFn: () => loadFaces(fontId),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })
  if (error) throw error
  return data
}
