/**
 * Shared fetcher for vatican.va archive pages (Compendium, full Catechism).
 *
 * vatican.va serves these as ISO-8859-1 (Latin-1) HTML and blocks requests
 * without a browser-like User-Agent. Hermes' TextDecoder only supports UTF-8,
 * so we decode Latin-1 inline (each byte 0x00–0xFF maps to the same code point).
 */

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Build a char array and join rather than String.fromCharCode.apply(null, [...])
// which has tripped over Hermes' call-stack budget on large pages.
function decodeLatin1(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  const chars = new Array<string>(bytes.length)
  for (let i = 0; i < bytes.length; i++) chars[i] = String.fromCharCode(bytes[i])
  return chars.join('')
}

const DEFAULT_TIMEOUT_MS = 5_000

export async function fetchVaticanPage(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res: Response
  try {
    res = await fetchImpl(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`vatican.va fetch timeout: ${url} (>${timeoutMs}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`vatican.va fetch failed: ${url} → ${res.status}`)
  return decodeLatin1(await res.arrayBuffer())
}
