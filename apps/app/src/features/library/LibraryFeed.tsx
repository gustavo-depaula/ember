import { useRouter } from 'expo-router'
import { Library as LibraryIcon } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { bareId, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CreatorGridCard } from '@/features/creators/components/CreatorGridCard'
import { useFollows } from '@/features/creators/hooks'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex } from '@/features/explore/bgColor'
import { ShortcutRow } from '@/features/home'
import { usePinnedItems } from '@/features/pinning/hooks'
import { saints } from '@/features/saints'
import { localizeContent } from '@/lib/i18n'

import { ContinueRow } from './ContinueRow'

// A pinned catalog entry carried with the moment it was saved, so each shelf can
// surface the most recently kept items first.
type Shelf = Array<[id: string, entry: CatalogEntry, pinnedAt: number]>

/**
 * The Library body: the user's own shelf, built entirely from data they've
 * already gathered. A "Continue" strip, then shelves of saved books, prayers,
 * and collections (pinned items, grouped by kind), the voices they follow, and a
 * gallery of holy cards. When nothing personal is here yet, a quiet invitation
 * stands in — the page never opens barren. Derived off the live catalog, so a
 * shelf fills in as deferred manifests warm (`useCatalogVersion`).
 */
export function LibraryFeed() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()
  const { data: pinned } = usePinnedItems()
  const { data: follows } = useFollows()

  // Re-derive only when the saved set or the catalog changes, not on every tick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const shelves = useMemo(() => {
    const books: Shelf = []
    const prayers: Shelf = []
    const collections: Shelf = []
    for (const p of pinned ?? []) {
      const entry = getEntry(p.id)
      if (!entry) continue
      const row: Shelf[number] = [p.id, entry, p.pinnedAt]
      if (entry.kind === 'book') books.push(row)
      else if (entry.kind === 'collection') collections.push(row)
      else if (entry.kind === 'practice' || entry.kind === 'mass') prayers.push(row)
    }
    const byRecent = (a: Shelf[number], b: Shelf[number]) => b[2] - a[2]
    books.sort(byRecent)
    prayers.sort(byRecent)
    collections.sort(byRecent)
    return { books, prayers, collections }
  }, [pinned, catalogVersion])

  const followList = follows ?? []
  const hasPersonal =
    shelves.books.length > 0 ||
    shelves.prayers.length > 0 ||
    shelves.collections.length > 0 ||
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

      {shelves.books.length > 0 && (
        <ArtCarousel title={t('library.savedBooks')}>
          {shelves.books.map(([id, entry], i) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? entry.title ?? {})}
              subtitle={entry.author ? localizeContent(entry.author) : undefined}
              image={artFor(id)}
              tone={toneByIndex(i)}
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
          {shelves.prayers.map(([id, entry], i) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? entry.title ?? {})}
              image={artFor(id)}
              tone={toneByIndex(i + 2)}
              onPress={() => goPractice(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {shelves.collections.length > 0 && (
        <ArtCarousel title={t('library.savedCollections')}>
          {shelves.collections.map(([id, entry], i) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? {})}
              image={artFor(id)}
              tone={toneByIndex(i + 5)}
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

      {!hasPersonal && (
        <YStack gap="$xs" paddingVertical="$sm">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('library.emptyTitle')}
          </Typography>
          <Typography variant="whisper">{t('library.emptyBody')}</Typography>
        </YStack>
      )}

      <ArtCarousel title={t('library.holyCards')}>
        {saints.map((s, i) => (
          <ArtCoverCard
            key={s.id}
            title={t(s.nameKey)}
            image={s.image}
            tone={toneByIndex(i)}
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
        onPress={() => router.push('/browse')}
      />
    </>
  )
}
