import { format } from 'date-fns'
import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { bareId, getEntriesByKind, getEntry, isMetaId } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useCelebrationDisplay } from '@/features/calendar'
import { collectionHref, warmCollection } from '@/features/collections'
import { coverFor } from '@/features/covers'
import { usePrayedOn } from '@/features/plan-of-life'
import { practiceHref } from '@/features/practices/practiceHref'
import {
  todayKey,
  usePendingHolyCards,
  useSaintOfDayBookImage,
  useSaintOfDayIndex,
} from '@/features/saints'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { getLiturgicalSeason } from '@/lib/liturgical'
import { useGospelOfTheDay } from '@/lib/mass-of/use-gospel-of-the-day'
import { ArtCarousel } from './ArtCarousel'
import { artFor } from './artMap'
import { toneForCelebration, toneForKey, toneForSeason } from './bgColor'
import { evangelistArtFor } from './evangelistArt'
import type { FeatureBlockData } from './FeatureBlock'
import { FeaturedCarousel } from './FeaturedCarousel'
import { FeatureTile } from './FeatureTile'
import { HolyCardEnvelopes } from './HolyCardEnvelopes'
import { useMeditationSubtitle } from './meditationSubtitle'
import { pickFeatured, practiceRow, weekdayDevotion } from './pickFeatured'
import { useSaintOfDay } from './useSaintOfDay'

const dayMs = 86_400_000
// Temporarily off: the Celebration of the Day card is hidden from the carousel.
const showCelebrationCard = false
// Temporarily off: the For this Season card is hidden from the carousel.
const showSeasonCard = false
const bookHref = (id: string): Href => ({
  pathname: '/browse/book/[bookId]',
  params: { bookId: bareId(id) },
})

/**
 * The daily featured carousel (holy cards waiting → Gospel of the Day → Saint of the Day → today's
 * weekday devotion → For this Season → Featured Reading), heading Today.
 * Derived off the liturgical day and re-derived as deferred catalog manifests
 * warm (`useCatalogVersion`).
 */
export function ExploreFeatured({ leading }: { leading?: ReactNode }) {
  const router = useRouter()
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const today = useToday()
  const season = getLiturgicalSeason(today)
  const saint = useSaintOfDay()
  const celebrationDisplay = useCelebrationDisplay(saint?.celebration)
  const { data: gospel } = useGospelOfTheDay()
  const featured = pickFeatured(season, today)
  const envelopes = usePendingHolyCards()
  const dayIndex = Math.floor(today.getTime() / dayMs)

  // Re-derive only when the catalog warms in (catalogVersion), not on every
  // unrelated re-render (clock tick, theme, gospel/saint query settling).
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const books = useMemo(
    () => getEntriesByKind('book').filter(([id]) => !isMetaId(id)),
    [catalogVersion],
  )
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

  if (showCelebrationCard && saint) {
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
      // The name already carries the day's theme ("Domingo — A Trindade…"),
      // so the card reads on into the collection's own opening words.
      subtitle: wdColl.description
        ? localizeContent(wdColl.description).replace(/\*/g, '')
        : t(`explore.devotionTheme.${wd.themeKey}`),
      image: artFor(wd.collectionId),
      cover: coverFor(wdColl),
      coverTitle: localizeContent(wdColl.name ?? {}),
      tone: toneForKey(wd.collectionId),
      onPress: () => goCollection(wd.collectionId),
    })
  }

  const seasonColl = getEntry(featured.seasonCollectionId)
  if (showSeasonCard && seasonColl) {
    blocks.push({
      key: 'season',
      label: t('explore.forThisSeason'),
      title: localizeContent(seasonColl.name ?? {}),
      subtitle: t(featured.seasonTaglineKey),
      image: artFor(featured.seasonCollectionId),
      cover: coverFor(seasonColl),
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
      cover: coverFor(bookEntry),
      tone: toneForKey(bookId),
      onPress: () => goBook(bookId),
    })
  }

  return (
    <FeaturedCarousel
      blocks={blocks}
      leading={[
        envelopes && envelopes.length > 0 && <HolyCardEnvelopes pending={envelopes} />,
        leading,
      ]}
    />
  )
}

/** The Daily Meditations row, shown on Today below the plan. */
export function DailyMeditations() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const today = useToday()
  const featured = pickFeatured(getLiturgicalSeason(today), today)
  const prayed = usePrayedOn(format(today, 'yyyy-MM-dd'))

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on catalogVersion
  const meditations = useMemo(
    () => practiceRow(featured.meditationRow),
    [catalogVersion, featured.meditationRow],
  )

  if (meditations.length === 0) return null

  return (
    <ArtCarousel title={t('explore.dailyMeditations')}>
      {meditations.map(([id, entry, subtitleKey]) => (
        <MeditationTile
          key={id}
          id={id}
          entry={entry}
          subtitleKey={subtitleKey}
          prayed={prayed.has(bareId(id))}
        />
      ))}
    </ArtCarousel>
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
  prayed,
}: {
  id: string
  entry: CatalogEntry
  subtitleKey: string
  prayed: boolean
}) {
  const { t } = useTranslation()
  const dynamicSubtitle = useMeditationSubtitle(id)
  return (
    <FeatureTile
      title={localizeContent(entry.name ?? {})}
      subtitle={dynamicSubtitle ?? t(subtitleKey)}
      image={artFor(id)}
      tone={toneForKey(id)}
      prayed={prayed}
      href={practiceHref(bareId(id))}
    />
  )
}
