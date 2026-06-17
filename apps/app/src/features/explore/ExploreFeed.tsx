import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { bareId, getEntriesByKind, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useCelebrationDisplay } from '@/features/calendar'
import { collectionHref, warmCollection } from '@/features/collections'
import { CreatorGridCard } from '@/features/creators/components/CreatorGridCard'
import { todayKey, useSaintOfDayBookImage, useSaintOfDayIndex } from '@/features/saints'
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
import { FeatureTile } from './FeatureTile'
import { FromOpusDei } from './FromOpusDei'
import { FromRome } from './FromRome'
import { useMeditationSubtitle } from './meditationSubtitle'
import { collectionRow, pickFeatured, practiceRow, weekdayDevotion } from './pickFeatured'
import { useSaintOfDay } from './useSaintOfDay'

const dayMs = 86_400_000
const isMeta = (id: string) => /example|starter|sandbox/.test(id)

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
  const celebrationDisplay = useCelebrationDisplay(saint?.celebration)
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const meditations = useMemo(
    () => practiceRow(featured.meditationRow),
    [catalogVersion, featured.meditationRow],
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

  blocks.push({
    key: 'mass-times',
    label: t('massTimes.title'),
    title: t('massTimes.exploreTagline'),
    tone: toneForKey('mass-times'),
    onPress: () => router.push('/mass-times'),
  })

  if (saint) {
    blocks.push({
      key: 'celebration',
      label: t('explore.celebrationOfDay'),
      title: celebrationDisplay.name,
      subtitle: t(`calendar.rank.${saint.celebration.rank}`),
      tone: toneForCelebration(saint.celebration.entry.category, season),
      onPress: () => router.push('/saints/today'),
    })
  }

  // Saint of the Day — the fixed day-by-day saint from Pictorial Lives of the
  // Saints (distinct from the liturgical celebration above). Opens the
  // `saint-of-the-day` practice (today's life + reflection from the book).
  const saintIndex = useSaintOfDayIndex()
  const saintEntry = saintIndex?.[todayKey(today)]
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

      {meditations.length > 0 && (
        <ArtCarousel title={t('explore.dailyMeditations')}>
          {meditations.map(([id, entry, subtitleKey]) => (
            <MeditationTile key={id} id={id} entry={entry} subtitleKey={subtitleKey} />
          ))}
        </ArtCarousel>
      )}

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

      <FromOpusDei />
    </>
  )
}

/**
 * One Daily Meditations card. Lazily resolves today's meditation title/theme
 * (Alphonsus/Divine Intimacy chapter heading, the Opus Dei title, the Patristic
 * reading's source) and shows it as the subtitle, falling back to the card's
 * fixed tagline while loading or on web/error.
 */
function MeditationTile({
  id,
  entry,
  subtitleKey,
}: {
  id: string
  entry: CatalogEntry
  subtitleKey: string
}) {
  const { t } = useTranslation()
  const dynamicSubtitle = useMeditationSubtitle(id)
  return (
    <FeatureTile
      title={localizeContent(entry.name ?? {})}
      subtitle={dynamicSubtitle ?? t(subtitleKey)}
      image={artFor(id)}
      tone={toneForKey(id)}
      href={{ pathname: '/pray/[practiceId]', params: { practiceId: bareId(id) } }}
    />
  )
}
