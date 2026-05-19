import { sourceUrl } from './chapters'
import type { Lang } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ISO-8859-1 (Latin-1) is a direct byte-to-codepoint mapping: each byte
// 0x00–0xFF maps to the same Unicode code point. Hermes' TextDecoder
// only supports 'utf-8', so we decode inline. Build a char array and join
// rather than .apply(null, [...thousands]) which has tripped over Hermes'
// call-stack budget in the wild.
function decodeLatin1(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  const chars = new Array<string>(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    chars[i] = String.fromCharCode(bytes[i])
  }
  return chars.join('')
}

// vatican.va serves the Compendium as a single ISO-8859-1 page per language
// and blocks fetches without a browser-like User-Agent. 5s is short — if
// the server is responsive at all, we'll get the ~1MB payload back inside
// that window; anything slower is almost certainly a hang (no network,
// AppTransportSecurity block, etc.) and should surface as an error rather
// than spinning the practice on the threshold screen forever.
const FETCH_TIMEOUT_MS = 5_000

export async function fetchPage(lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = sourceUrl(lang)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetchImpl(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Compendium fetch timeout: ${url} (>${FETCH_TIMEOUT_MS}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`Compendium fetch failed: ${url} → ${res.status}`)
  const buf = await res.arrayBuffer()
  return decodeLatin1(buf)
}
