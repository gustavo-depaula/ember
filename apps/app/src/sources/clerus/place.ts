// Biblia Clerus, the Dicastery for the Clergy's online library: static pages,
// several numbered sections to each, every section under its own anchor.
const baseUrl = 'https://www.clerus.org/bibliaclerusonline/pt'

// The bytes 0x80–0x9F of windows-1252 that the pages use; the rest of the
// encoding is Latin-1, where a byte is its own code point. Hermes has no
// TextDecoder for it.
const windows1252: Record<number, string> = {
  133: '…',
  145: '‘',
  146: '’',
  147: '“',
  148: '”',
  149: '•',
  150: '–',
  151: '—',
}

export function decodeWindows1252(bytes: Uint8Array): string {
  const chars = new Array<string>(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    chars[i] = windows1252[bytes[i]] ?? String.fromCharCode(bytes[i])
  }
  return chars.join('')
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' }

/**
 * The section of a Clerus page that sits under `anchor`, as paragraphs of
 * plain text. A section runs to the next anchor; a document's footnotes are
 * printed after the section that calls them ("<b>95</b>. Conc. Ecum. …"), and
 * are left out, as are the numbers that call them.
 */
export function parseClerusPlace(page: string, anchor: string): string[] {
  const opening = new RegExp(`<a name=${anchor}>`, 'i').exec(page)
  if (!opening) return []
  const rest = page.slice(opening.index + opening[0].length)
  const next = rest.search(/<a name=\w+>/i)
  const section = (next < 0 ? rest : rest.slice(0, next))
    // The section's own number opens it; the reader has it in the label.
    .replace(/^\s*<b>\d+<\/b>\.?/, '')
    .split(/<br>\s*<b>\d+<\/b>\./i)[0]
  return section
    .split(/(?:<br\s*\/?>\s*){2,}/i)
    .map((paragraph) =>
      paragraph
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&(\w+);/g, (whole, name: string) => entities[name] ?? whole)
        .replace(/­/g, '')
        // A footnote's call: a bare number after a word or a closing quotation
        // mark, glued to the stop that ends a sentence, or closing the paragraph.
        .replace(/(?<=[»”"\p{L}]) \d{1,3}(?=[\s,.;:)])/gu, '')
        .replace(/(?<=[»”"][.,;:])\d{1,3}(?=\s|$)/g, '')
        .replace(/(?<=[.!?»”"]) \d{1,3}$/, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}

/** A numbered section of a document on Clerus, read from the site. */
export async function fetchClerusPlace(file: string, anchor: string): Promise<string[]> {
  const url = `${baseUrl}/${file}.htm`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Biblia Clerus: ${url} answered ${res.status}`)
  const paragraphs = parseClerusPlace(
    decodeWindows1252(new Uint8Array(await res.arrayBuffer())),
    anchor,
  )
  if (paragraphs.length === 0) throw new Error(`Biblia Clerus: nothing at ${url}#${anchor}`)
  return paragraphs
}
