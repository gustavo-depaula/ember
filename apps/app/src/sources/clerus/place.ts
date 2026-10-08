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

// A footnote where it is printed, in the ways the documents set one:
// "<b>95</b>. …", "(95) …", "[95] …" and "95. …".
const note = /<br>\s*(?:<b>(\d+)<\/b>\.?|\((\d+)\)|\[(\d+)\]|(\d+)\.) /gi

/** Where a section's footnotes begin, or its whole length when it prints none. */
function notesStart(section: string): number {
  for (const match of section.matchAll(note)) {
    const before = section.slice(0, match.index)
    // "12. …" opening a line is a footnote only if the text above calls it:
    // a section can number its own points.
    const plain = match[4]
    if (plain === undefined || before.includes(`(${plain})`) || before.includes(`[${plain}]`)) {
      return match.index
    }
  }
  return section.length
}

/**
 * The section of a Clerus page that sits under `anchor`, as paragraphs of
 * plain text. A section runs to the next numbered one or the page's footer; a
 * document's footnotes are printed after a section that calls them, and are
 * left out, as are the numbers that call them and the headings set between
 * sections.
 */
export function parseClerusPlace(page: string, anchor: string): string[] {
  const opening = new RegExp(`<a name=${anchor}>`).exec(page)
  if (!opening) return []
  const rest = page.slice(opening.index + opening[0].length)
  // A heading has an anchor of its own ("<a Name=dq><h2>"), so only a
  // numbered anchor ends the section.
  const next = rest.search(/<a name=\w+><b>\d+<\/b>|<hr><center>/)
  const block = (next < 0 ? rest : rest.slice(0, next))
    // The section's own number opens it; the reader has it in the label.
    .replace(/^\s*<b>\d+<\/b>\.?/, '')
    .replace(/<h\d>.*?<\/h\d>/gis, '<br><br>')
  return paragraphsOf(block)
}

/**
 * A stretch of a page as paragraphs of plain text, without the footnotes
 * printed after it or the numbers that call them.
 */
export function paragraphsOf(markup: string): string[] {
  return markup
    .slice(0, notesStart(markup))
    .split(/(?:<br\s*\/?>\s*){2,}/i)
    .map((paragraph) => {
      // A linked reference ("Ap 1,13") has numbers of its own, which are set
      // aside (under marks no page uses) while the calls are taken out.
      const links: string[] = []
      const held = paragraph.replace(/<a href=[^>]*>([^<]*)<\/a>/gi, (_whole, text: string) => {
        links.push(text)
        return `⟦${links.length - 1}⟧`
      })
      return (
        held
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<[^>]+>/g, '')
          .replace(/&(\w+);/g, (whole, name: string) => entities[name] ?? whole)
          .replace(/\u00ad/g, '')
          // A footnote's call: a number in brackets, or a bare one after a word
          // or a closing quotation mark, glued to a word ("Tarso46") or to the
          // stop that ends a sentence, between a stop and the next sentence
          // (". 116 Se"), or closing the paragraph.
          .replace(/ ?[([]\d{1,3}[)\]]/g, '')
          // After a word, only before a stop: "tem 12 apóstolos" is the text's own.
          .replace(/(?<=[»”"]) \d{1,3}(?=[\s,.;:)])/g, '')
          .replace(/(?<=\p{L}) \d{1,3}(?=[,.;:)])/gu, '')
          .replace(/(?<=[»”"][.,;:]) ?\d{1,3}(?=\s|$)/g, '')
          .replace(/(?<=\p{Ll}{3})\d{1,3}(?=[\s,.;:)]|$)/gu, '')
          .replace(/(?<=[\p{L}»”"][.!?]) \d{1,3}(?= \p{Lu})/gu, '')
          .replace(/(?<=[.!?»”"]) \d{1,3}$/, '')
          .replace(/⟦(\d+)⟧/g, (_whole, i: string) => links[Number(i)])
          .replace(/\s+/g, ' ')
          .trim()
      )
    })
    .filter(Boolean)
}

/** A page of the library, decoded. */
export async function fetchClerusPage(file: string): Promise<string> {
  const url = `${baseUrl}/${file}.htm`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Biblia Clerus: ${url} answered ${res.status}`)
  return decodeWindows1252(new Uint8Array(await res.arrayBuffer()))
}

/** A numbered section of a document on Clerus, read from the site. */
export async function fetchClerusPlace(file: string, anchor: string): Promise<string[]> {
  const paragraphs = parseClerusPlace(await fetchClerusPage(file), anchor)
  if (paragraphs.length === 0) {
    throw new Error(`Biblia Clerus: nothing at ${baseUrl}/${file}.htm#${anchor}`)
  }
  return paragraphs
}
