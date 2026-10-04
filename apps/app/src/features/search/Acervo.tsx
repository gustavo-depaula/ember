import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { Typography } from '@/components/typography'
import { getEntriesByKind, getEntry, isMetaId } from '@/content/contentIndex'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, GeneratedCover } from '@/features/covers'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

const doorHeight = 132
// Three covers held like a hand of cards: left, top, tilt.
const fanSlots = [
  { left: 2, top: 28, rotate: '-9deg' },
  { left: 40, top: 18, rotate: '-1deg' },
  { left: 80, top: 26, rotate: '8deg' },
]

const prayerArt = ['collection/sacred-heart', 'collection/marian', 'collection/divine-mercy']
const collectionArt = [
  'collection/carmelite',
  'collection/josemaria-escriva',
  'collection/thomas-aquinas',
]
const fannedBooks = [
  'book/kempis-imitation-of-christ',
  'book/augustine-confessions',
  'book/sales-introduction-to-the-devout-life',
]

/**
 * The whole corpus behind three doors — prayers, books, collections — each
 * naming how much is inside. Search's empty state is a lobby; the catalogue
 * itself lives on the screens these open.
 */
export function Acervo() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as manifests warm in.
  const counts = useMemo(
    () => ({
      prayers: getAllManifests().filter((m) => !isAlternateForm(m) && !isMetaId(m.id)).length,
      books: getEntriesByKind('book').filter(([id]) => !isMetaId(id)).length,
      collections: getEntriesByKind('collection').length,
    }),
    [catalogVersion],
  )

  return (
    <YStack gap="$md">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('search.acervo')}
      </Typography>
      <Door
        count={counts.prayers}
        title={t('search.prayers')}
        subtitle={t('search.prayersHint')}
        href="/browse/prayers"
      >
        <ArtFan ids={prayerArt} />
      </Door>
      <Door
        count={counts.books}
        title={t('search.books')}
        subtitle={t('search.booksHint')}
        href="/browse/books"
      >
        <BookFan />
      </Door>
      <Door
        count={counts.collections}
        title={t('search.sectionCollections')}
        subtitle={t('search.collectionsHint')}
        href="/browse/all"
      >
        <ArtFan ids={collectionArt} />
      </Door>
    </YStack>
  )
}

function Door({
  count,
  title,
  subtitle,
  href,
  children,
}: {
  count: number
  title: string
  subtitle: string
  href: Href
  children: ReactNode
}) {
  return (
    <ZoomLink href={href}>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={`${title}, ${count}`}>
        <XStack
          height={doorHeight}
          borderRadius={16}
          alignItems="center"
          backgroundColor="$backgroundSurface"
        >
          <YStack flex={1} paddingLeft="$lg" gap={2}>
            {/* Tall line box: iOS crops an italic display numeral at a tight one. */}
            <Typography variant="screen-title" fontSize={40} lineHeight={52} color="$accent">
              {count > 0 ? count : ' '}
            </Typography>
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {title}
            </Typography>
            <Typography variant="caption" numberOfLines={2}>
              {subtitle}
            </Typography>
          </YStack>
          <YStack
            width={150}
            height={doorHeight}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {children}
          </YStack>
        </XStack>
      </AnimatedPressable>
    </ZoomLink>
  )
}

function Fanned({ index, children }: { index: number; children: ReactNode }) {
  const slot = fanSlots[index]
  return (
    <YStack
      position="absolute"
      left={slot.left}
      top={slot.top}
      transform={[{ rotate: slot.rotate }]}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 6 }}
      shadowOpacity={0.4}
      shadowRadius={10}
    >
      {children}
    </YStack>
  )
}

function ArtFan({ ids }: { ids: string[] }) {
  const images = ids.map(artFor).filter((image): image is ImageSource => !!image)
  return images.map((image, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed hand of three, never reordered
    <Fanned key={i} index={i}>
      <Image
        source={image}
        style={{ width: 74, height: 96, borderRadius: 8 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </Fanned>
  ))
}

function BookFan() {
  useCatalogVersion()
  return fannedBooks.map((id, i) => {
    const entry = getEntry(id)
    const cover = entry && coverFor(entry)
    if (!entry || !cover) return null
    return (
      <Fanned key={id} index={i}>
        <GeneratedCover
          cover={cover}
          title={localizeContent(entry.name ?? {})}
          tone={toneForKey(id)}
          width={66}
        />
      </Fanned>
    )
  })
}
