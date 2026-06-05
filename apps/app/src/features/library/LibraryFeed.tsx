import { useRouter } from 'expo-router'
import { Library as LibraryIcon, Plus } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CreatorGridCard } from '@/features/creators/components/CreatorGridCard'
import { routeFor } from '@/features/creators/components/feedItemRoute'
import { useFollows, useLatestForFollowed } from '@/features/creators/hooks'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { blockInk, toneByIndex, toneForKey } from '@/features/explore/bgColor'
import { ShortcutRow } from '@/features/home'
import { saints } from '@/features/saints'
import { localizeContent } from '@/lib/i18n'

import { ContinueRow } from './ContinueRow'
import { CreateCollectionSheet } from './CreateCollectionSheet'
import { useSavedItems } from './savedHooks'
import { useUserCollections } from './userCollectionHooks'

// A saved catalog entry carried with the moment it was kept, so each shelf can
// surface the most recently saved items first.
type Shelf = Array<[id: string, entry: CatalogEntry, savedAt: number]>

/**
 * The Library body: the user's own shelf, built from what they've gathered. A
 * "Continue" strip, their own collections, shelves of saved books, prayers, and
 * collections, the latest from the voices they follow, and a gallery of holy
 * cards. Saving is a lightweight bookmark (offline is separate), so a shelf can
 * be deep without costing storage. Derived off the live catalog, so a shelf
 * fills in as deferred manifests warm (`useCatalogVersion`).
 */
export function LibraryFeed() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()
  const { data: saved } = useSavedItems()
  const { data: follows } = useFollows()
  const { data: latest } = useLatestForFollowed()
  const { data: userCollections } = useUserCollections()
  const [creating, setCreating] = useState(false)

  // Re-derive only when the saved set or the catalog changes, not on every tick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const shelves = useMemo(() => {
    const books: Shelf = []
    const prayers: Shelf = []
    const collections: Shelf = []
    for (const s of saved ?? []) {
      if (s.kind === 'usercollection') continue // surfaced by their own shelf
      const entry = getEntry(s.itemId)
      if (!entry) continue
      const row: Shelf[number] = [s.itemId, entry, s.savedAt]
      if (entry.kind === 'book') books.push(row)
      else if (entry.kind === 'collection') collections.push(row)
      else if (entry.kind === 'practice' || entry.kind === 'mass') prayers.push(row)
    }
    const byRecent = (a: Shelf[number], b: Shelf[number]) => b[2] - a[2]
    books.sort(byRecent)
    prayers.sort(byRecent)
    collections.sort(byRecent)
    return { books, prayers, collections }
  }, [saved, catalogVersion])

  const followList = follows ?? []
  const myCollections = userCollections ?? []
  const latestItems = latest ?? []
  const hasPersonal =
    shelves.books.length > 0 ||
    shelves.prayers.length > 0 ||
    shelves.collections.length > 0 ||
    myCollections.length > 0 ||
    followList.length > 0

  const goBook = (id: string) =>
    router.push({ pathname: '/browse/book/[bookId]', params: { bookId: bareId(id) } })
  const goCollection = (id: string) =>
    router.push({ pathname: '/browse/[collectionId]', params: { collectionId: bareId(id) } })
  const goPractice = (id: string) =>
    router.push({ pathname: '/practices/[manifestId]', params: { manifestId: bareId(id) } })

  return (
    <>
      <ContinueRow />

      <ArtCarousel title={t('library.yourCollections')}>
        {myCollections.map((c) => (
          <ArtCoverCard
            key={c.id}
            title={c.name}
            subtitle={c.description}
            tone={toneByIndex(c.coverTone)}
            href={{ pathname: '/browse/my/[collectionId]', params: { collectionId: c.id } }}
          />
        ))}
        <ArtCoverCard
          title={t('library.newCollection')}
          tone={toneForKey('new-collection')}
          glyph={<Plus size={44} color={blockInk} strokeWidth={1.5} />}
          onPress={() => setCreating(true)}
        />
      </ArtCarousel>

      {shelves.books.length > 0 && (
        <ArtCarousel title={t('library.savedBooks')}>
          {shelves.books.map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? entry.title ?? {})}
              subtitle={entry.author ? localizeContent(entry.author) : undefined}
              image={artFor(id)}
              tone={toneForKey(id)}
              size={118}
              aspectRatio={1.5}
              radius={4}
              onPress={() => goBook(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {shelves.prayers.length > 0 && (
        <ArtCarousel title={t('library.savedPrayers')}>
          {shelves.prayers.map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? entry.title ?? {})}
              image={artFor(id)}
              tone={toneForKey(id)}
              onPress={() => goPractice(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {shelves.collections.length > 0 && (
        <ArtCarousel title={t('library.savedCollections')}>
          {shelves.collections.map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? {})}
              image={artFor(id)}
              tone={toneForKey(id)}
              onPress={() => goCollection(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {followList.length > 0 && (
        <ArtCarousel title={t('library.voices')}>
          {followList.map((f) => (
            <CreatorGridCard key={f.creatorId} creatorId={f.creatorId} size={150} />
          ))}
        </ArtCarousel>
      )}

      {latestItems.length > 0 && (
        <ArtCarousel title={t('library.latestFromVoices')}>
          {latestItems.map((item) => {
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
      )}

      {!hasPersonal && (
        <YStack gap="$xs" paddingVertical="$sm">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('library.emptyTitle')}
          </Typography>
          <Typography variant="whisper">{t('library.emptyBody')}</Typography>
        </YStack>
      )}

      <ArtCarousel title={t('library.holyCards')}>
        {saints.map((s) => (
          <ArtCoverCard
            key={s.id}
            title={t(s.nameKey)}
            image={s.image}
            tone={toneForKey(s.id)}
            size={120}
            aspectRatio={1.5}
            radius={4}
            onPress={() => router.push('/saints')}
          />
        ))}
      </ArtCarousel>

      <ShortcutRow
        leading={<LibraryIcon size={22} color={theme.accent?.val} />}
        title={t('library.browse')}
        tagline={t('library.browseHint')}
        onPress={() => router.push('/browse/all')}
      />

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
