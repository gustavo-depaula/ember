import { sourceUrl } from './chapters'
import type { Lang } from './types'

// vatican.va serves the Compendium as a single ISO-8859-1 page per language.
// Returns the raw HTML decoded to UTF-8.
export async function fetchPage(lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string> {
  const url = sourceUrl(lang)
  const res = await fetchImpl(url, {
    headers: {
      // vatican.va blocks fetch without a browser-like UA.
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      accept: 'text/html',
    },
  })
  if (!res.ok) throw new Error(`Compendium fetch failed: ${url} → ${res.status}`)
  const buf = await res.arrayBuffer()
  return decodeLatin1(new Uint8Array(buf))
}

function decodeLatin1(bytes: Uint8Array): string {
  // Latin-1 maps byte → codepoint 1:1 in the 0x00..0xFF range.
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i])
  return out
}
