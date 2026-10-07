import { cnbbPages } from './cnbbPages'
import { fetchOk, type Verse, type WebBible } from './types'

// The Dicastery for the Clergy publishes the CNBB translation (2002) in its
// Biblia Clerus: static pages on opaque names, several chapters to each.
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
  const chunks: string[] = []
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)))
  }
  return chunks.join('').replace(/[\x80-\x9f]/g, (c) => windows1252[c.charCodeAt(0)] ?? '')
}

// Markers the markup is reduced to before the tags go, in signs the pages never
// use: a chapter number, a verse number, and a bare number that is a verse
// number only if it is the one expected next.
const chapterMark = '¤'
const verseMark = '¦'
const looseMark = '¬'
const tokens = /([¤¦¬])(\d+)\1([^¤¦¬]*)/g

const consonant = 'b-df-hj-np-tv-z'

function clean(text: string): string {
  return (
    text
      // A question mark between letters stands where the export lost a space.
      .replace(/(?<=\p{L})\?(?=\p{L})/gu, ' ')
      // What is left of "[b-4]", the note for a verse the translation omits.
      .replace(/\[\s*\w?\s*-\s*\]|\(\s*\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/ ([.,;:”’])/g, '$1')
      .replace(/\( /g, '(')
      .replace(/(?<!\.)\.\.(?!\.)/g, '.')
      .trim()
  )
}

/**
 * The chapters of one Biblia Clerus page. The pages are a lossy export: where
 * a verse number is not marked up it survives as a bare figure in the text, a
 * chapter number may be missing altogether, and the numbers of a second
 * numbering are scattered in italics. What the page lost stays lost, so a
 * chapter can skip verses.
 */
export function parseClerusPage(page: string): Record<number, Verse[]> {
  const body = page
    .slice(page.indexOf('<hr>'), page.lastIndexOf('<hr>'))
    .replace(/[\u00ad\\§*]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/g, '')
    // A heading is not text, except the one that swallowed the verses under it.
    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gis, (_, heading: string) =>
      heading.length > 150 ? heading.replace(/~/g, '') : ' ',
    )
    .replace(/<i>\d+<\/i>/g, ' ')
    .replace(
      /<a name=\w+>\s*<b>\s*(\d+)\s*<\/b>(?:\s*\(\w+\))?/gi,
      (_, n: string) => `${chapterMark}${n}${chapterMark}`,
    )
    .replace(
      /<sup>\s*<font size=-1>\s*(\d+)\s*<\/font>\s*<\/sup>(?:<a name=\w+>)?(?:[a-z](?=\s))?/gi,
      (_, n: string) => `${verseMark}${n}${verseMark}`,
    )
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/Livro [IVX]+ \(Ps[^)]*\)/g, '')
    // "[21]": a verse the translation leaves out, number and all.
    .replace(/\[(?:[\s\d¦-]|(?<![a-z])[a-z](?![a-z]))*\]/g, '')
    // "2-3": two verses printed as one, kept under the first number.
    .replace(/(¦\d+¦)\s*-\s*\d+/g, '$1')
    // The text spells its numbers out, so every figure left is a verse number:
    // this numbering's where the markup was lost, or the other numbering's
    // ("5,1", "3a", "13h"), which goes.
    .replace(/\d+,\d+/g, '')
    .replace(new RegExp(`\\d+[a-z](?=\\s?[A-ZÀ-Ý“‘]|[${consonant}])`, 'g'), '')
    .replace(/(?<![¤¦\d])\d+(?![¤¦\d])/g, (n) => `${looseMark}${n}${looseMark}`)

  const chapters: Record<number, Map<number, string>> = {}
  let chapter = 0
  let verse = 0
  const append = (text: string) => {
    if (!chapter || !verse) return
    const verses = chapters[chapter]
    verses.set(verse, `${verses.get(verse) ?? ''} ${text}`)
  }
  const open = (n: number) => {
    chapter = n
    verse = 0
    chapters[chapter] ??= new Map()
  }

  const marks = [...body.matchAll(tokens)]
  for (const [i, [, kind, digits, text]] of marks.entries()) {
    // A number already used, where the next one shows a verse went missing
    // between: a misprint for that verse ("22, 21, 24").
    const misprint =
      kind === verseMark &&
      Number(digits) < verse &&
      marks[i + 1]?.[1] === verseMark &&
      Number(marks[i + 1][2]) === verse + 2
    const n = misprint ? verse + 1 : Number(digits)
    if (kind === chapterMark) {
      open(n)
      // A first verse with no number of its own.
      if (clean(text)) {
        verse = 1
        append(text)
      }
    } else if (kind === looseMark) {
      // The next verse, unless the verse in hand has no text yet: then it is
      // the other numbering's figure, glued to the verse's first word.
      const started = verse === 0 || clean(chapters[chapter]?.get(verse) ?? '') !== ''
      if (chapter > 0 && started && n === verse + 1) verse = n
      append(text)
    } else {
      // Verse 1 again with no chapter number before it: the next chapter,
      // whose number trails the verse just ended.
      if (n === 1 && verse > 1) {
        const verses = chapters[chapter]
        const last = verses.get(verse) ?? ''
        verses.set(verse, last.replace(new RegExp(`\\s*${chapter + 1}\\s*$`), ''))
        open(chapter + 1)
      }
      verse = n
      append(text)
    }
  }

  return Object.fromEntries(
    Object.entries(chapters).map(([n, verses]) => [
      n,
      [...verses]
        .map(([verse, text]) => ({ verse, text: clean(text) }))
        .filter((v) => v.text)
        .sort((a, b) => a.verse - b.verse),
    ]),
  )
}

function pageOf(book: string, chapter: number): string {
  const page = cnbbPages[book]?.findLast(([first]) => first <= chapter)
  if (!page) throw new Error(`CNBB: no page for ${book} ${chapter}`)
  return page[1]
}

export const cnbb: WebBible = {
  // The Hebrew canon's divisions, and Esther with the Greek additions set in
  // the chapters they belong to.
  chapters: { esther: 10, joel: 4, malachias: 3 },
  fetchChapters: async (book, chapter) => {
    const res = await fetchOk(`${baseUrl}/${pageOf(book, chapter)}.htm`, 'Biblia Clerus')
    return parseClerusPage(decodeWindows1252(new Uint8Array(await res.arrayBuffer())))
  },
}
