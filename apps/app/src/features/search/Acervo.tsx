import { useQuery } from '@tanstack/react-query'
import type { ImageSource } from 'expo-image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { usePageWidth } from '@/components'
import { Typography } from '@/components/typography'
import { getEntriesByKind, isMetaId } from '@/content/contentIndex'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { loadChant, ScoreView } from '@/features/chant'
import { artFor } from '@/features/explore/artMap'
import { BookFan, Door, Fanned, ImageFan } from '@/features/explore/Door'

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

// Room a door needs for its count, its name and its fan.
const doorMin = 300
const doorGap = 16

/**
 * The whole corpus behind its doors — prayers, books, collections, chant — each
 * naming how much is inside. Search's empty state is a lobby; the catalogue
 * itself lives on the screens these open.
 */
export function Acervo() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const pageWidth = usePageWidth()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as manifests warm in.
  const counts = useMemo(
    () => ({
      prayers: getAllManifests().filter((m) => !isAlternateForm(m) && !isMetaId(m.id)).length,
      books: getEntriesByKind('book').filter(([id]) => !isMetaId(id)).length,
      collections: getEntriesByKind('collection').length,
      chants: getEntriesByKind('chant').length,
    }),
    [catalogVersion],
  )
  const doors = counts.chants > 0 ? 4 : 3
  const perRow = (() => {
    if (pageWidth >= doors * doorMin) return doors
    if (pageWidth >= 2 * doorMin) return 2
    return 1
  })()
  const doorWidth = (pageWidth - doorGap * (perRow - 1)) / perRow

  return (
    <YStack gap="$md">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('search.acervo')}
      </Typography>
      {/* The doors in one row where they all fit, two by two where they don't. */}
      <XStack flexWrap="wrap" gap={doorGap}>
        <YStack width={doorWidth}>
          <Door
            count={counts.prayers}
            title={t('search.prayers')}
            subtitle={t('search.prayersHint')}
            href="/browse/prayers"
          >
            <ArtFan ids={prayerArt} />
          </Door>
        </YStack>
        <YStack width={doorWidth}>
          <Door
            count={counts.books}
            title={t('search.books')}
            subtitle={t('search.booksHint')}
            href="/browse/books"
          >
            <BookFan ids={fannedBooks} />
          </Door>
        </YStack>
        <YStack width={doorWidth}>
          <Door
            count={counts.collections}
            title={t('search.sectionCollections')}
            subtitle={t('search.collectionsHint')}
            href="/browse/all"
          >
            <ArtFan ids={collectionArt} />
          </Door>
        </YStack>
        {/* An app update can reach a phone before the corpus that holds its chants. */}
        {counts.chants > 0 && (
          <YStack width={doorWidth}>
            <Door
              count={counts.chants}
              title={t('search.chant')}
              subtitle={t('search.chantHint')}
              href="/browse/chant"
            >
              <LeafFan />
            </Door>
          </YStack>
        )}
      </XStack>
    </YStack>
  )
}

function ArtFan({ ids }: { ids: string[] }) {
  return <ImageFan images={ids.map(artFor).filter((image): image is ImageSource => !!image)} />
}

// Three leaves of the Kyriale, fanned as the other doors fan their art. A leaf
// is parchment and ink in either theme, as a painting keeps its own colours.
const chantLeaves = ['chant/kyrie-xi', 'chant/sanctus-xi', 'chant/agnus-dei-xi']
const leafPalette = { ink: '#2B2118', rubric: '#8C1D2B' }

function LeafFan() {
  return chantLeaves.map((id, i) => (
    <Fanned key={id} index={i}>
      <Leaf id={id} />
    </Fanned>
  ))
}

function Leaf({ id }: { id: string }) {
  const catalogVersion = useCatalogVersion()
  const chant = useQuery({
    queryKey: ['chant', id, catalogVersion],
    queryFn: async () => (await loadChant(id)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  }).data
  return (
    <YStack
      width={74}
      height={96}
      borderRadius={8}
      overflow="hidden"
      backgroundColor="#EFE4CB"
      paddingLeft={6}
      paddingTop={2}
    >
      {/* Set wider than the leaf and cut by its edge, as the fan cuts a painting. */}
      {chant && (
        <ScoreView
          score={chant.score}
          width={132}
          scale={0.5}
          label={chant.name}
          lines={3}
          palette={leafPalette}
        />
      )}
    </YStack>
  )
}
