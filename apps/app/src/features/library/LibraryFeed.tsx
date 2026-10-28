import { useRouter } from 'expo-router'
import { Plus, Star } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, userCollectionCover } from '@/features/covers'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneForKey } from '@/features/explore/bgColor'
import { useHeldCards, useSaintsCatalog } from '@/features/saints'
import { localizeContent } from '@/lib/i18n'
import { CreateCollectionSheet } from './CreateCollectionSheet'
import { favoritesId, favoritesTone, isFavoritable } from './favorites'
import { useSavedItems } from './savedHooks'
import { useUserCollections } from './userCollectionHooks'

const newCollectionTone = toneForKey('new-collection')

/**
 * The user's own shelf, shown on Me: a gallery of holy cards and one row of
 * collections — Favorites first (every favorited prayer and book), then the
 * collections they authored and the corpus collections they saved. Derived off
 * the live catalog, so the row fills in as deferred manifests warm
 * (`useCatalogVersion`).
 */
export function LibraryFeed() {
  const { t } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()
  const { data: saved } = useSavedItems()
  const { data: userCollections } = useUserCollections()
  const { byId: saintsById } = useSaintsCatalog()
  const held = useHeldCards()
  // The cards held, the latest received first (held keys run latest first).
  const holyCards = useMemo(
    () => [...held.keys()].flatMap((id) => (saintsById[id] ? [saintsById[id]] : [])),
    [held, saintsById],
  )
  const [creating, setCreating] = useState(false)

  // Re-derive only when the saved set or the catalog changes, not on every tick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const savedCollections = useMemo(
    () =>
      (saved ?? []).flatMap((s): Array<[id: string, entry: CatalogEntry]> => {
        const entry = getEntry(s.itemId)
        return entry?.kind === 'collection' ? [[s.itemId, entry]] : []
      }),
    [saved, catalogVersion],
  )

  const myCollections = userCollections ?? []
  const hasPersonal =
    (saved ?? []).some((s) => isFavoritable(s.itemId)) ||
    savedCollections.length > 0 ||
    myCollections.length > 0

  const goCollection = (id: string) =>
    router.push({ pathname: '/browse/[collectionId]', params: { collectionId: bareId(id) } })
  // The gallery first, so closing the card lands on it rather than back here.
  const goCard = (id: string) => {
    router.push('/saints')
    router.push({ pathname: '/saints/[index]', params: { index: id } })
  }

  return (
    <>
      {holyCards.length > 0 && (
        <ArtCarousel title={t('library.holyCards')} href="/saints">
          {holyCards.map((s) => (
            <ArtCoverCard
              key={s.id}
              title={s.name}
              image={s.cardThumb}
              tone={toneForKey(s.id)}
              size={120}
              aspectRatio={1.5}
              radius={4}
              onPress={() => goCard(s.id)}
            />
          ))}
        </ArtCarousel>
      )}

      <ArtCarousel title={t('library.yourCollections')}>
        <ArtCoverCard
          title={t('library.favorites')}
          tone={favoritesTone}
          cover={userCollectionCover}
          glyph={<Star size={40} color={favoritesTone.from} strokeWidth={1.5} />}
          href={{ pathname: '/browse/my/[collectionId]', params: { collectionId: favoritesId } }}
        />
        {myCollections.map((c) => (
          <ArtCoverCard
            key={c.id}
            title={c.name}
            subtitle={c.description}
            cover={userCollectionCover}
            tone={toneByIndex(c.coverTone)}
            href={{ pathname: '/browse/my/[collectionId]', params: { collectionId: c.id } }}
          />
        ))}
        {savedCollections.map(([id, entry]) => (
          <ArtCoverCard
            key={id}
            title={localizeContent(entry.name ?? {})}
            image={artFor(id)}
            cover={coverFor(entry)}
            tone={toneForKey(id)}
            onPress={() => goCollection(id)}
          />
        ))}
        <ArtCoverCard
          title={t('library.newCollection')}
          tone={newCollectionTone}
          cover={userCollectionCover}
          glyph={<Plus size={40} color={newCollectionTone.from} strokeWidth={1.5} />}
          onPress={() => setCreating(true)}
        />
      </ArtCarousel>

      {!hasPersonal && (
        <YStack gap="$xs" paddingVertical="$sm">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('library.emptyTitle')}
          </Typography>
          <Typography variant="whisper">{t('library.emptyBody')}</Typography>
        </YStack>
      )}

      <CreateCollectionSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) =>
          router.push({ pathname: '/browse/my/[collectionId]', params: { collectionId: id } })
        }
      />
    </>
  )
}
