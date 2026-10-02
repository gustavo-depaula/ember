import type { ReadingFontId } from '@/config/readingFonts'
import type { ReaderFontFace } from './foliate/FoliateReader'

const none: ReaderFontFace[] = []

/**
 * The font files the reader's WebView must be handed for a reading font, or
 * `undefined` while they load. None here: WebKit resolves the fonts the app
 * registered by their PostScript name, and the web build's iframe has them
 * from the page.
 */
export function useReaderFontFaces(_fontId: ReadingFontId): ReaderFontFace[] | undefined {
  return none
}
