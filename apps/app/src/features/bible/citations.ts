import { fetchHearth } from '@/lib/hearth'

/**
 * A passage as Biblia Clerus divides the chapter, with where the Church cites
 * it. `from`/`to` are the verses it covers in this chapter; `passage` is its
 * whole reference ("2,23-3,15"), which can run into the next chapter.
 */
export type PassageCitations = {
  from: number
  to: number
  passage: string
  /** Paragraphs of the Catechism of the Catholic Church that cite it. */
  ccc: number[]
  /** The homilies on it that the corpus holds, each a chapter of a book. */
  homilies?: Homily[]
  /** The councils' and popes' documents that cite it, in Portuguese on Clerus. */
  magisterium?: CitingDocument[]
  /**
   * Which of the passage's verses each place cites, as runs [first, last]:
   * by a paragraph's number, or a document's place as "page#anchor".
   */
  verses?: Record<string, [number, number][]>
}

/**
 * A document and the numbered sections of it that cite a passage. A place is
 * [number, page, anchor]: the section's number, and where Clerus has its text.
 */
export type CitingDocument = { work: string; places: [string, string, string][] }

/**
 * A Father's treatment of a passage: `kind` is what the work calls its parts
 * and `n` which one, as its own edition numbers them (an exposition of a psalm
 * goes by the Hebrew number, one past the Douay's for most).
 */
export type Homily = {
  author: 'john-chrysostom' | 'augustine'
  kind: 'homily' | 'tractate' | 'exposition' | 'book'
  n: number
  book: string
  chapter: string
}

export async function getChapterCitations(
  bookId: string,
  chapter: number,
): Promise<PassageCitations[]> {
  const book = await fetchHearth<Record<string, PassageCitations[]>>(`bible/clerus/${bookId}.json`)
  return book[String(chapter)] ?? []
}

/**
 * The passage a verse belongs to. Passages rarely overlap; where they do, the
 * shortest is the one about this verse in particular.
 */
export function citationsForVerse(
  passages: PassageCitations[],
  verse: number,
): PassageCitations | undefined {
  return passages
    .filter((p) => p.from <= verse && verse <= p.to)
    .sort((a, b) => a.to - a.from - (b.to - b.from))
    .at(0)
}

/** "1:1–18", or "2:23–3:15" for a passage that runs into the next chapter. */
export function passageLabel(passage: string): string {
  return passage.replace(/,/g, ':').replace('-', '–')
}

/** Whether a place (a paragraph's number, a document's "page#anchor") cites the verse itself. */
export function citesVerse(passage: PassageCitations, key: string, verse: number): boolean {
  return (passage.verses?.[key] ?? []).some(([from, to]) => from <= verse && verse <= to)
}

/**
 * A passage's citations as they bear on one verse: what cites the verse
 * itself (a citation of 1:10–20 cites 1:15), and what cites only its
 * neighbours in the passage.
 */
export function splitByVerse(
  passage: PassageCitations,
  verse: number,
): {
  ccc: { here: number[]; elsewhere: number[] }
  magisterium: { here: CitingDocument[]; elsewhere: CitingDocument[] }
} {
  const documents = (here: boolean) =>
    (passage.magisterium ?? [])
      .map((document) => ({
        work: document.work,
        places: document.places.filter(
          ([, page, anchor]) => citesVerse(passage, `${page}#${anchor}`, verse) === here,
        ),
      }))
      .filter((document) => document.places.length > 0)
  return {
    ccc: {
      here: passage.ccc.filter((n) => citesVerse(passage, String(n), verse)),
      elsewhere: passage.ccc.filter((n) => !citesVerse(passage, String(n), verse)),
    },
    magisterium: { here: documents(true), elsewhere: documents(false) },
  }
}
