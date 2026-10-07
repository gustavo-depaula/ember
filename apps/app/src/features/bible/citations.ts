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
