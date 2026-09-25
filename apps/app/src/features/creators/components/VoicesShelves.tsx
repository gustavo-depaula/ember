import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getEntriesByKind, getEntry } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import type { FeedItemRow } from '@/features/creators/db/feedItems'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

import { useFollows, useLatestForFollowed } from '../hooks'
import { feedItemHref } from '../routes'
import { CreatorGridCard } from './CreatorGridCard'

const isMeta = (id: string) => /example|starter|sandbox/.test(id)

/** A feed item as a cover card, subtitled with its creator. Opens the item. */
export function FeedItemCoverCard({ item }: { item: FeedItemRow }) {
  const router = useRouter()
  const creator = getEntry(item.creatorId)
  return (
    <ArtCoverCard
      title={item.title}
      subtitle={creator ? localizeContent(creator.name ?? {}) : undefined}
      image={item.imageUrl ? { uri: item.imageUrl } : undefined}
      tone={toneForKey(item.itemId)}
      size={140}
      onPress={() => router.push(feedItemHref(item))}
    />
  )
}

/** Every creator in the catalog, as a browsing row. */
export function VoicesCarousel() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const creators = useMemo(
    () => getEntriesByKind('creator').filter(([id]) => !isMeta(id)),
    [catalogVersion],
  )
  if (creators.length === 0) return null
  return (
    <ArtCarousel title={t('explore.voices')}>
      {creators.slice(0, 18).map(([id]) => (
        <CreatorGridCard key={id} creatorId={id} size={150} />
      ))}
    </ArtCarousel>
  )
}

/** The creators the user follows, then their latest items. */
export function FollowedVoicesShelves() {
  const { t } = useTranslation()
  const { data: follows } = useFollows()
  const { data: latest } = useLatestForFollowed()
  const followList = follows ?? []
  const latestItems = latest ?? []
  return (
    <>
      {followList.length > 0 && (
        <ArtCarousel title={t('library.voices')}>
          {followList.map((f) => (
            <CreatorGridCard key={f.creatorId} creatorId={f.creatorId} size={150} />
          ))}
        </ArtCarousel>
      )}

      {latestItems.length > 0 && (
        <ArtCarousel title={t('library.latestFromVoices')}>
          {latestItems.map((item) => (
            <FeedItemCoverCard key={item.itemId} item={item} />
          ))}
        </ArtCarousel>
      )}
    </>
  )
}
