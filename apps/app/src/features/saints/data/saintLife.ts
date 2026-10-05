import { loadBookChapterText } from '@/content/books'

const livesBook = 'pictorial-lives-of-saints'

export type SaintLife = {
  /** The chapter's opening: its engraving and first paragraph. */
  opening: string
  /** The rest of the life, shown once the reader asks for it. */
  rest?: string
  minutes: number
}

// The chapter as the book prints it opens with its date-and-name heading and
// closes with a reflection. The page titles the life itself and sets the
// reflection apart (it ships on the card), so both come off here.
function splitLife(text: string): SaintLife | undefined {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('#') && !/^\*\*(Reflection|Reflexão)\*\*/.test(b))
  const firstParagraph = blocks.findIndex((b) => !b.startsWith('!['))
  if (firstParagraph < 0) return undefined
  const rest = blocks.slice(firstParagraph + 1)
  const words = blocks.join(' ').split(/\s+/).length
  return {
    opening: blocks.slice(0, firstParagraph + 1).join('\n\n'),
    rest: rest.length > 0 ? rest.join('\n\n') : undefined,
    minutes: Math.max(1, Math.round(words / 200)),
  }
}

/** The life in `lang`, falling back to English where the book has no translation. */
export async function loadSaintLife(chapter: string, lang: string): Promise<SaintLife | undefined> {
  const text =
    (await loadBookChapterText(livesBook, chapter, lang)) ??
    (await loadBookChapterText(livesBook, chapter, 'en-US'))
  return text ? splitLife(text) : undefined
}
