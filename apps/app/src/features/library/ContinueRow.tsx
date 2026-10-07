import type { ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ribbonTones, useBibleResume, useOpenBiblePlace } from '@/features/bible'
import { useBooksInProgress } from '@/features/books/useBooksInProgress'
import { coverFor, type TileCover } from '@/features/covers'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { type BlockTone, toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type Item = {
  key: string
  updatedAt: number
  title: string
  subtitle?: string
  image?: ImageSource
  cover?: TileCover
  tone?: BlockTone
  onPress: () => void
}

/**
 * "Continue" — the strip on Today: every book in progress plus the Bible, most
 * recently read first. Hidden entirely when nothing is in progress, so a fresh
 * Today doesn't open on a stale rail.
 */
export function ContinueRow() {
  const { t } = useTranslation()
  const router = useRouter()
  const books = useBooksInProgress()
  const bible = useBibleResume()
  const openPlace = useOpenBiblePlace()

  const items: Item[] = books.map(({ bookId, entry, chapterTitle, updatedAt }) => ({
    key: `book/${bookId}`,
    updatedAt,
    title: localizeContent(entry.name ?? entry.title ?? {}),
    subtitle: chapterTitle,
    image: artFor(`book/${bookId}`),
    cover: coverFor(entry),
    onPress: () => router.push({ pathname: '/browse/book/[bookId]/read', params: { bookId } }),
  }))
  if (bible)
    items.push({
      key: `bible/${bible.bookId}`,
      updatedAt: bible.updatedAt,
      title: `${bible.bookName} ${bible.chapter}`,
      subtitle: t('bible.discovery.continueReading'),
      cover: { kind: 'book', format: 'missal' },
      tone: ribbonTones[bible.ribbon % ribbonTones.length],
      onPress: () => openPlace(bible.bookId, bible.chapter),
    })

  if (items.length === 0) return null

  items.sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <ArtCarousel title={t('library.continue')}>
      {items.map(({ key, tone, ...item }) => (
        <ArtCoverCard
          key={key}
          {...item}
          tone={tone ?? toneForKey(key)}
          size={118}
          aspectRatio={1.5}
          radius={4}
        />
      ))}
    </ArtCarousel>
  )
}
