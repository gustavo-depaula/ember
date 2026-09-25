import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { toneForKey } from '@/features/explore/bgColor'
import { useBibleStore } from '@/stores/bibleStore'

/**
 * "Continue" — the strip on Today: resume the Bible where the user left off.
 * Hidden entirely when there's nothing in progress (Bible at its Genesis-1
 * default), so a fresh Today doesn't open on a stale rail.
 */
export function ContinueRow() {
  const { t } = useTranslation()
  const router = useRouter()
  const { bookId, chapter, hydrated } = useBibleStore()

  const showBible = hydrated && !(bookId === 'genesis' && chapter === 1)

  if (!showBible) return null

  const bookName = t(`bookName.${bookId}`, { defaultValue: bookId })

  return (
    <ArtCarousel title={t('library.continue')}>
      <ArtCoverCard
        title={`${bookName} ${chapter}`}
        subtitle={t('bible.discovery.continueReading')}
        tone={toneForKey(`bible/${bookId}`)}
        size={140}
        onPress={() => router.push('/bible/reader')}
      />
    </ArtCarousel>
  )
}
