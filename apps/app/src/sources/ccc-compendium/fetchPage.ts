import { sourceUrl } from './chapters'
import type { Lang } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// vatican.va serves the Compendium as a single ISO-8859-1 page per language
// and blocks fetches without a browser-like User-Agent.
export async function fetchPage(lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = sourceUrl(lang)
  const res = await fetchImpl(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`Compendium fetch failed: ${url} → ${res.status}`)
  const buf = await res.arrayBuffer()
  return new TextDecoder('iso-8859-1').decode(buf)
}
