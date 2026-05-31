import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { getEntry } from '@/content/contentIndex'
import { routeFor } from '@/features/creators/components/feedItemRoute'
import { useInProgressMedia } from '@/features/creators/hooks'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'
import { useBibleStore } from '@/stores/bibleStore'

/**
 * "Continue" — the hybrid strip atop the Library: resume the Bible where the
 * user left off and pick up any started-but-unfinished creator media. Both feed
 * the same edge-bleeding `ArtCarousel`, so they read as one shelf. Hidden
 * entirely when there's nothing in progress (Bible at its Genesis-1 default and
 * no touched media), keeping a fresh Library from opening on a stale rail.
 */
export function ContinueRow() {
  const { t } = useTranslation()
  const router = useRouter()
  const { bookId, chapter, hydrated } = useBibleStore()
  const { data: media } = useInProgressMedia()

  const showBible = hydrated && !(bookId === 'genesis' && chapter === 1)
  const mediaItems = media ?? []

  if (!showBible && mediaItems.length === 0) return null

  const bookName = t(`bookName.${bookId}`, { defaultValue: bookId })

  return (
    <ArtCarousel title={t('library.continue')}>
      {showBible && (
        <ArtCoverCard
          title={`${bookName} ${chapter}`}
          subtitle={t('bible.discovery.continueReading')}
          tone={toneForKey(`bible/${bookId}`)}
          size={140}
          onPress={() => router.push('/bible/reader')}
        />
      )}
      {mediaItems.map((item) => {
        const creator = getEntry(item.creatorId)
        return (
          <ArtCoverCard
            key={item.itemId}
            title={item.title}
            subtitle={creator ? localizeContent(creator.name ?? {}) : undefined}
            image={item.imageUrl ? { uri: item.imageUrl } : undefined}
            tone={toneForKey(item.itemId)}
            size={140}
            onPress={() => router.push(routeFor(item))}
          />
        )
      })}
    </ArtCarousel>
  )
}
