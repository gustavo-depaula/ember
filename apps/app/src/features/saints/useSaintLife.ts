import { useQuery } from '@tanstack/react-query'

import { loadBookChapterText } from '@/content/books'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'

const livesBook = 'pictorial-lives-of-saints'

type Life = {
  /** The chapter's opening: its engraving and first paragraph. */
  opening: string
  /** The rest of the life, shown once the reader asks for it. */
  rest?: string
  minutes: number
}

// The chapter as the book prints it opens with its date-and-name heading and
// closes with a reflection. The page titles the life itself and sets the
// reflection apart (it ships on the card), so both come off here.
function splitLife(text: string): Life | undefined {
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

/**
 * A card's life from the Pictorial Lives of the Saints, by the chapter the card
 * names as its own. Undefined while it loads, and for a card with no chapter.
 */
export function useSaintLife(chapter: string | undefined): Life | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-life', catalogVersion, chapter, lang],
    enabled: !!chapter,
    queryFn: async (): Promise<Life | null> => {
      if (!chapter) return null
      const text =
        (await loadBookChapterText(livesBook, chapter, lang)) ??
        (await loadBookChapterText(livesBook, chapter, 'en-US'))
      return (text && splitLife(text)) || null
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
