import { getLiturgicalSeason } from '@ember/liturgical'
import { findBookImage, loadBook } from '@/content/books'
import { getEntry } from '@/content/contentIndex'
import { pickSpotlight } from '@/features/collections/seasonalSpotlight'
import { artFor } from '@/features/explore/artMap'
import { type BlockTone, jewelTones, toneForSeason } from '@/features/explore/bgColor'
import { meditationRow, weekdayDevotion } from '@/features/explore/pickFeatured'
import { loadSaintOfDayIndex, saintOfDayKey } from '@/features/saints/data/saintOfDay'
import { hearthUrl } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import { transfersForJurisdiction } from '@/lib/missal/loaders'
import { blobUrl } from '~/platform/store'
import { href } from '~/routes'
import { entryTitle, type TileData, tileFor } from './catalog'
import { bibleRefFor } from './citations'
import { bootCorpus } from './corpus'
import { loadEfDay, loadOfDay } from './liturgy'
import { jurisdiction, type Locale, translator, withLocale } from './locale'
import { saintsCatalog } from './saints'

export type Feature = {
  kicker: string
  title: string
  subtitle?: string
  href: string
  art?: string
  tone: BlockTone
}

// Practices whose text is fetched from its publisher at runtime: the app can
// show them, a built page cannot.
const appOnly = new Set(['practice/opus-dei-meditation', 'practice/patristic-reading'])

const evangelists = new Set(['matthew', 'mark', 'luke', 'john'])

export async function loadHome(date: Date, locale: Locale) {
  await bootCorpus()
  const t = translator(locale)
  const pt = locale === 'pt-BR'
  const [of, ef, index, catalog] = await Promise.all([
    loadOfDay(date, locale),
    loadEfDay(date, locale),
    loadSaintOfDayIndex(),
    saintsCatalog(locale),
  ])
  return withLocale(locale, async () => {
    const features: Feature[] = []
    const dayIndex = Math.floor(date.getTime() / 86_400_000)

    const gospel = of.readings.find((r) => r.slot === 'gospel')
    const gospelRef = gospel && bibleRefFor(gospel.citation, locale)
    features.push({
      kicker: pt ? 'Missa do dia' : 'Mass of the day',
      title: of.celebrations[0]?.title ?? of.dayName,
      subtitle: of.readings.map((r) => r.citation).join(' · '),
      href: href.mass(locale),
      art:
        gospelRef && evangelists.has(gospelRef.book)
          ? hearthUrl(`art/evangelist-${gospelRef.book}-${(((dayIndex % 3) + 3) % 3) + 1}.jpg`)
          : undefined,
      tone: toneForSeason(of.season),
    })

    const saint = index?.[saintOfDayKey(date)]
    if (saint) {
      const book = await loadBook('pictorial-lives-of-saints')
      const image = book && findBookImage(book, `images/${saint.chapter}.webp`)
      const card = catalog.saints.find((s) => s.lifeChapter === saint.chapter)
      features.push({
        kicker: t('explore.saintOfDay'),
        title: localizeContent(saint.name),
        subtitle: saint.reflection
          ? localizeContent(saint.reflection)
          : t('explore.saintReadingTagline'),
        href: card
          ? href.saint(locale, card.id)
          : href.bookChapter(
              book?.languages?.includes(locale) ? locale : 'en-US',
              'book/pictorial-lives-of-saints',
              saint.chapter,
            ),
        art: image && blobUrl(image.hash),
        tone: jewelTones.red,
      })
    }

    const devotion = weekdayDevotion(date)
    const devotionEntry = getEntry(devotion.collectionId)
    if (devotionEntry) {
      features.push({
        kicker: t('explore.todaysDevotion'),
        title: t(`explore.devotionTheme.${devotion.themeKey}`),
        subtitle: entryTitle(devotionEntry),
        href: href.collection(locale, devotion.collectionId),
        art: artFor(devotion.collectionId)?.uri,
        tone: jewelTones.marian,
      })
    }

    const spotlight = pickSpotlight(
      getLiturgicalSeason(date, 'of', transfersForJurisdiction(jurisdiction[locale])),
      date,
    )
    const spotlightEntry = getEntry(spotlight.collectionId)
    if (spotlightEntry) {
      features.push({
        kicker: t('explore.forThisSeason'),
        title: entryTitle(spotlightEntry),
        subtitle: t(spotlight.taglineKey, { defaultValue: '' }) || undefined,
        href: href.collection(locale, spotlight.collectionId),
        art: artFor(spotlight.collectionId)?.uri,
        tone: jewelTones.gold,
      })
    }

    const pray = [
      'practice/rosary',
      'practice/angelus',
      'practice/chaplet-of-divine-mercy',
      'practice/examination-of-conscience',
      'practice/mental-prayer',
      'practice/saint-of-the-day',
      'practice/act-of-contrition',
      'practice/memorare',
    ].flatMap((id) => tileFor(id, locale) ?? [])

    const meditations = meditationRow
      .filter((card) => !appOnly.has(card.id) && getEntry(card.id))
      .flatMap((card): (TileData & { tagline: string })[] => {
        const tile = tileFor(card.id, locale)
        return tile ? [{ ...tile, tagline: t(card.subtitleKey) }] : []
      })

    return { of, ef, features, pray, meditations }
  })
}
