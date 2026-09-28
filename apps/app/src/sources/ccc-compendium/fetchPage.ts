import { fetchVaticanPage } from '../vatican/fetchPage'
import { sourceUrl } from './chapters'
import type { Lang } from './types'

// The Compendium is a single ~1MB ISO-8859-1 page per language. fetchVaticanPage's
// 5s timeout is enough if the server responds at all; anything slower is a hang
// and should surface as an error rather than spin the practice forever.
export async function fetchPage(lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string> {
  return fetchVaticanPage(sourceUrl(lang), fetchImpl)
}
