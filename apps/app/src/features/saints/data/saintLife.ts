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

export const encyclopediaBook = 'catholic-encyclopedia'

/**
 * A Catholic Encyclopedia article, as a card's About shows it: its first
 * paragraph, and how long the whole article takes, for the link to the rest.
 * The article opens with its title and a one-line summary in italics, which
 * the first paragraph repeats; both come off. English only, as the book is.
 */
export async function loadEncyclopediaArticle(chapter: string): Promise<SaintLife | undefined> {
  const text = await loadBookChapterText(encyclopediaBook, chapter, 'en-US')
  if (!text) return undefined
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('#') && !/^\*[^*].*\*$/.test(b))
  if (blocks.length === 0) return undefined
  const words = blocks.join(' ').split(/\s+/).length
  return { opening: blocks[0], minutes: Math.max(1, Math.round(words / 200)) }
}
