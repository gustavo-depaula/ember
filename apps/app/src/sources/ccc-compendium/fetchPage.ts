import { fetchVaticanPage } from '../vatican/fetchPage'
import { sourceUrl } from './chapters'
import type { Lang } from './types'

// The Compendium is a single ISO-8859-1 page per language. 5s is short — if the
// server responds at all we get the ~1MB payload inside that window; anything
// slower is almost certainly a hang and should surface as an error rather than
// spinning the practice on the threshold screen forever.
export async function fetchPage(lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string> {
  return fetchVaticanPage(sourceUrl(lang), fetchImpl)
}
