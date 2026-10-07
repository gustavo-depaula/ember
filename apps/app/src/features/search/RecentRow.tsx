import type { ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ribbonTones, useBibleResume } from '@/features/bible'
import { useBooksInProgress } from '@/features/books/useBooksInProgress'
import { coverFor, type TileCover } from '@/features/covers'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { type BlockTone, toneForKey } from '@/features/explore/bgColor'
import { planCardSize } from '@/features/home/components/PlanOfLifeCard'
import { useMostPrayed } from '@/features/home/useMostPrayed'
import { practiceHref } from '@/features/practices/practiceHref'
import { localizeContent } from '@/lib/i18n'
import { useBibleStore } from '@/stores/bibleStore'

type Recent = {
  key: string
  at: number
  title: string
  subtitle?: string
  image?: ImageSource
  cover?: TileCover
  href: Href
  tone?: BlockTone
  onPress?: () => void
  book?: boolean
}

const maxRecents = 12
// A book cover is 1.5× as tall as wide; this width stands it level with the square tiles.
const bookWidth = Math.round(planCardSize / 1.5)

/**
 * "Recents" — what was last prayed or read, newest first, in Today's tiles:
 * the practices prayed this month, the books in progress and the Bible.
 * Hidden when there is nothing yet.
 */
export function RecentRow() {
  const { t } = useTranslation()
  const prayed = useMostPrayed({ days: 30, limit: maxRecents, order: 'recent' })
  const books = useBooksInProgress()
  const bible = useBibleResume()

  const items: Recent[] = [
    ...prayed.map(({ id, entry, last }) => ({
      key: `practice/${id}`,
      at: last,
      title: localizeContent(entry.name ?? {}),
      image: artFor(`practice/${id}`),
      cover: coverFor(entry),
      href: practiceHref(id),
    })),
    ...books.map(({ bookId, entry, chapterTitle, updatedAt }) => ({
      key: `book/${bookId}`,
      at: updatedAt,
      title: localizeContent(entry.name ?? entry.title ?? {}),
      subtitle: chapterTitle,
      image: artFor(`book/${bookId}`),
      cover: coverFor(entry),
      href: { pathname: '/browse/book/[bookId]/read', params: { bookId } } as const,
      book: true,
    })),
  ]
  if (bible)
    items.push({
      key: `bible/${bible.bookId}`,
      at: bible.updatedAt,
      title: `${bible.bookName} ${bible.chapter}`,
      cover: { kind: 'book', format: 'missal' },
      tone: ribbonTones[bible.ribbon % ribbonTones.length],
      href: '/bible/reader',
      // The reader shows wherever the store points: aim it at this place.
      onPress: () => useBibleStore.getState().setPosition(bible.bookId, bible.chapter),
      book: true,
    })

  if (items.length === 0) return null

  items.sort((a, b) => b.at - a.at)

  return (
    <ArtCarousel title={t('search.recents')}>
      {items.slice(0, maxRecents).map(({ key, at: _at, book, tone, ...item }) => (
        <ArtCoverCard
          key={key}
          {...item}
          tone={tone ?? toneForKey(key)}
          {...(book ? { size: bookWidth, aspectRatio: 1.5, radius: 4 } : { size: planCardSize })}
        />
      ))}
    </ArtCarousel>
  )
}
