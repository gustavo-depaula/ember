import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { bareId, getEntriesByKind, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { collectionHref, warmCollection } from '@/features/collections'
import { CreatorGridCard } from '@/features/creators/components/CreatorGridCard'
import { saintOfDay, useSaintOfDayBookImage } from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { getLiturgicalSeason, type LiturgicalCalendarForm } from '@/lib/liturgical'
import { useGospelOfTheDay } from '@/lib/mass-of/use-gospel-of-the-day'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { ArtCarousel } from './ArtCarousel'
import { ArtCoverCard } from './ArtCoverCard'
import { artFor } from './artMap'
import { toneForCelebration, toneForKey, toneForSeason } from './bgColor'
import { evangelistArtFor } from './evangelistArt'
import type { FeatureBlockData } from './FeatureBlock'
import { FeaturedCarousel } from './FeaturedCarousel'
import { FromRome } from './FromRome'
import { pickFeatured, weekdayDevotion } from './pickFeatured'
import { useSaintOfDay } from './useSaintOfDay'

const dayMs = 86_400_000
const isMeta = (id: string) => /example|starter|sandbox/.test(id)

// Resolve a list of collection ids against the live catalog, dropping any that
// aren't present yet (or aren't collections). Pure — depends only on the catalog.
const collectionRow = (ids: string[]) =>
  ids
    .map((id) => [id, getEntry(id)] as const)
    .filter((pair): pair is [string, CatalogEntry] => !!pair[1] && pair[1].kind === 'collection')

/**
 * The Explore feed body: a featured carousel (Gospel of the Day → Saint of the
 * Day → today's weekday devotion → For this Season → Featured Reading), then
 * imagery-rich rows (The Library, Voices, and a couple of curated collection
 * rows). Derived off the liturgical day and re-derived as deferred catalog
 * manifests warm (`useCatalogVersion`).
 */
export function ExploreFeed() {
  const router = useRouter()
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const today = useToday()
  const form = usePreferencesStore((s) => s.liturgicalCalendar) as LiturgicalCalendarForm
  const season = getLiturgicalSeason(today, form)
  const saint = useSaintOfDay()
  const { data: gospel } = useGospelOfTheDay()
  const featured = pickFeatured(season, today)
  const dayIndex = Math.floor(today.getTime() / dayMs)

  // Re-derive only when the catalog warms in (catalogVersion), not on every
  // unrelated re-render (clock tick, theme, gospel/saint query settling).
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const books = useMemo(
    () => getEntriesByKind('book').filter(([id]) => !isMeta(id)),
    [catalogVersion],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const creators = useMemo(
    () => getEntriesByKind('creator').filter(([id]) => !isMeta(id)),
    [catalogVersion],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const devotions = useMemo(
    () => collectionRow(featured.devotionRow),
    [catalogVersion, featured.devotionRow],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const traditions = useMemo(
    () => collectionRow(featured.traditionRow),
    [catalogVersion, featured.traditionRow],
  )

  const bookHref = (id: string): Href => ({
    pathname: '/browse/book/[bookId]',
    params: { bookId: bareId(id) },
  })
  const goBook = (id: string) => router.push(bookHref(id))
  const goCollection = (id: string) => {
    warmCollection(id)
    router.push(collectionHref(id))
  }

  const blocks: FeatureBlockData[] = []

  if (gospel) {
    const preview =
      gospel.text.length > 130 ? `${gospel.text.slice(0, 130).trimEnd()}…` : gospel.text
    blocks.push({
      key: 'gospel',
      label: t('bible.discovery.gospelOfTheDay'),
      title: gospel.citation ?? t('bible.discovery.gospelOfTheDay'),
      subtitle: preview,
      image: evangelistArtFor(gospel.citation, dayIndex),
      tone: toneForKey('gospel-of-the-day'),
      onPress: () =>
        router.push({
          pathname: '/pray/[practiceId]',
          params: { practiceId: 'gospel-of-the-day' },
        }),
    })
  }

  if (saint) {
    blocks.push({
      key: 'celebration',
      label: t('explore.celebrationOfDay'),
      title: localizeContent(saint.celebration.entry.name),
      subtitle: t(`calendar.rank.${saint.celebration.rank}`),
      image: saint.image,
      tone: toneForCelebration(saint.celebration.entry.category, season),
      onPress: () => router.push('/saints/today'),
    })
  }

  // Saint of the Day — the fixed day-by-day saint from Pictorial Lives of the
  // Saints (distinct from the liturgical celebration above). Opens the
  // `saint-of-the-day` practice (today's life + reflection from the book).
  const saintEntry =
    saintOfDay[
      `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    ]
  const saintBookImage = useSaintOfDayBookImage(saintEntry?.chapter)
  if (saintEntry) {
    const reflection = saintEntry.reflection ? localizeContent(saintEntry.reflection) : undefined
    blocks.push({
      key: 'saint',
      label: t('explore.saintOfDay'),
      title: localizeContent(saintEntry.name),
      subtitle: reflection ?? t('explore.saintReadingTagline'),
      image: saintBookImage,
      tone: toneForKey('saint-of-the-day'),
      onPress: () =>
        router.push({ pathname: '/pray/[practiceId]', params: { practiceId: 'saint-of-the-day' } }),
    })
  }

  const wd = weekdayDevotion(today)
  const wdColl = getEntry(wd.collectionId)
  if (wdColl) {
    blocks.push({
      key: 'weekday',
      label: t('explore.todaysDevotion'),
      title: localizeContent(wdColl.name ?? {}),
      subtitle: t(`explore.devotionTheme.${wd.themeKey}`),
      image: artFor(wd.collectionId),
      tone: toneForKey(wd.collectionId),
      onPress: () => goCollection(wd.collectionId),
    })
  }

  const seasonColl = getEntry(featured.seasonCollectionId)
  if (seasonColl) {
    blocks.push({
      key: 'season',
      label: t('explore.forThisSeason'),
      title: localizeContent(seasonColl.name ?? {}),
      subtitle: t(featured.seasonTaglineKey),
      image: artFor(featured.seasonCollectionId),
      tone: toneForSeason(season),
      onPress: () => goCollection(featured.seasonCollectionId),
    })
  }

  if (books.length > 0) {
    // Rotate the featured reading weekly, not daily — the page shouldn't churn
    // for its own sake (the Saint of the Day carries the per-day freshness).
    const weekIndex = Math.floor(dayIndex / 7)
    const [bookId, bookEntry] = books[weekIndex % books.length]
    blocks.push({
      key: 'reading',
      label: t('explore.featuredReading'),
      title: localizeContent(bookEntry.name ?? bookEntry.title ?? {}),
      subtitle: bookEntry.author ? localizeContent(bookEntry.author) : undefined,
      image: artFor(bookId),
      tone: toneForKey(bookId),
      onPress: () => goBook(bookId),
    })
  }

  return (
    <>
      <FeaturedCarousel blocks={blocks} />

      {books.length > 0 && (
        <ArtCarousel title={t('explore.theLibrary')}>
          {books.slice(0, 18).map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? entry.title ?? {})}
              subtitle={entry.author ? localizeContent(entry.author) : undefined}
              image={artFor(id)}
              tone={toneForKey(id)}
              size={118}
              aspectRatio={1.5}
              radius={4}
              href={bookHref(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {creators.length > 0 && (
        <ArtCarousel title={t('explore.voices')}>
          {creators.slice(0, 18).map(([id]) => (
            <CreatorGridCard key={id} creatorId={id} size={150} />
          ))}
        </ArtCarousel>
      )}

      {devotions.length > 0 && (
        <ArtCarousel title={t('explore.devotions')}>
          {devotions.map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? {})}
              image={artFor(id)}
              tone={toneForKey(id)}
              href={collectionHref(id)}
              onPress={() => warmCollection(id)}
            />
          ))}
        </ArtCarousel>
      )}

      {traditions.length > 0 && (
        <ArtCarousel title={t('explore.traditions')}>
          {traditions.map(([id, entry]) => (
            <ArtCoverCard
              key={id}
              title={localizeContent(entry.name ?? {})}
              image={artFor(id)}
              tone={toneForKey(id)}
              href={collectionHref(id)}
              onPress={() => warmCollection(id)}
            />
          ))}
        </ArtCarousel>
      )}

      <FromRome />
    </>
  )
}
