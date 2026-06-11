import {
  BookOpen,
  Church,
  CloudSun,
  Compass,
  Flame,
  GraduationCap,
  Library as LibraryIcon,
  Moon,
  Plus,
  ScrollText,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { PageFlourish, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { collectionHref, warmCollection } from '@/features/collections'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { collectionRow, devotionRow, traditionRow } from '@/features/explore/pickFeatured'
import { useCreatePractice } from '@/features/plan-of-life'
import type { PracticeFormData } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import { ShortcutGrid, type ShortcutTileData } from '@/features/search'
import { localizeContent } from '@/lib/i18n'

const flourishDark = require('../../../../../assets/textures/notch_search_dark.png')
const flourishLight = require('../../../../../assets/textures/notch_search_light.png')
const flourishAspect = 2172 / 478
const flourishLightAspect = 2153 / 334

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * The Orar (Pray) catalog: an illuminated portfolio of every way to pray,
 * structured for browsing rather than scanning a flat list. No header search
 * bar here — corpus search lives in the tab bar's search role (the circular
 * affordance that expands into a field, à la Apple Podcasts), so the page
 * stays a clean stack of curated sections (Por momento → Caminhos → Devoções
 * → Por tipo → Personalizadas). The flat virtualized list lives one tap
 * deeper at `/practices/all` and is pre-filterable via URL params
 * (`?category=…&moment=…`).
 */
export default function PracticeCatalogScreen() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()

  const [showEditor, setShowEditor] = useState(false)
  const createPractice = useCreatePractice()

  function handleSave(data: PracticeFormData) {
    createPractice.mutate({
      id: slugify(data.name),
      customName: data.name,
      customIcon: data.icon,
      customDesc: data.description,
      slot: {
        tier: data.tier,
        time: undefined,
        schedule: JSON.stringify(data.schedule),
      },
    })
    setShowEditor(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred collection manifests warm in.
  const traditions = useMemo(() => collectionRow(traditionRow), [catalogVersion])
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred collection manifests warm in.
  const devotions = useMemo(() => collectionRow(devotionRow), [catalogVersion])

  // Tiles answering "what should I pray right now?" — each links to the flat
  // catalog pre-filtered by moment, except Santa Missa which is an event, not
  // a filter, so it routes straight to the Mass practice.
  const momentTiles: ShortcutTileData[] = [
    {
      key: 'moment-morning',
      title: t('catalog.moment.morning'),
      icon: Sunrise,
      href: { pathname: '/practices/all', params: { moment: 'morning' } },
    },
    {
      key: 'moment-mass',
      title: t('catalog.moment.mass'),
      icon: Church,
      href: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
    },
    {
      key: 'moment-midday',
      title: t('catalog.moment.midday'),
      icon: Sun,
      href: { pathname: '/practices/all', params: { moment: 'midday' } },
    },
    {
      key: 'moment-afternoon',
      title: t('catalog.moment.afternoon'),
      icon: CloudSun,
      href: { pathname: '/practices/all', params: { moment: 'afternoon' } },
    },
    {
      key: 'moment-evening',
      title: t('catalog.moment.evening'),
      icon: Sunset,
      href: { pathname: '/practices/all', params: { moment: 'evening' } },
    },
    {
      key: 'moment-night',
      title: t('catalog.moment.night'),
      icon: Moon,
      href: { pathname: '/practices/all', params: { moment: 'night' } },
    },
  ]

  // Practice-type filter shortcuts — each maps to a `categories` filter on the
  // flat catalog. Curated to the 6 most legible buckets in the actual corpus.
  const typeTiles: ShortcutTileData[] = [
    {
      key: 'type-marian',
      title: t('catalog.type.marian'),
      icon: Sparkles,
      href: { pathname: '/practices/all', params: { category: 'marian' } },
    },
    {
      key: 'type-eucharist',
      title: t('catalog.type.eucharist'),
      icon: Flame,
      href: { pathname: '/practices/all', params: { category: 'eucharist' } },
    },
    {
      key: 'type-litany',
      title: t('catalog.type.litany'),
      icon: ScrollText,
      href: { pathname: '/practices/all', params: { category: 'litany' } },
    },
    {
      key: 'type-program',
      title: t('catalog.type.program'),
      icon: BookOpen,
      href: { pathname: '/practices/all', params: { category: 'program' } },
    },
    {
      key: 'type-meditation',
      title: t('catalog.type.meditation'),
      icon: Compass,
      href: { pathname: '/practices/all', params: { category: 'meditation' } },
    },
    {
      key: 'type-formation',
      title: t('catalog.type.formation'),
      icon: GraduationCap,
      href: { pathname: '/practices/all', params: { category: 'formation' } },
    },
  ]

  const personalTiles: ShortcutTileData[] = [
    {
      key: 'custom-practice',
      title: t('catalog.custom'),
      icon: Plus,
      onPress: () => setShowEditor(true),
    },
    {
      key: 'all-practices',
      title: t('catalog.allPracticesTile'),
      icon: LibraryIcon,
      href: '/practices/all',
    },
  ]

  // Each tile keeps a stable hue keyed on its identity, not its position.
  const withTones = (tiles: ShortcutTileData[]): ShortcutTileData[] =>
    tiles.map((tile) => ({ ...tile, tone: toneForKey(tile.key) }))

  return (
    <>
      <ScreenLayout>
        <PageFlourish
          dark={flourishDark}
          light={flourishLight}
          aspectRatio={flourishAspect}
          lightAspectRatio={flourishLightAspect}
        />
        <YStack gap="$xl" paddingTop="$sm" paddingBottom="$lg">
          <PageHeader title={t('catalog.title')} />

          <Section title={t('catalog.byMoment')}>
            <ShortcutGrid items={withTones(momentTiles)} />
          </Section>

          {traditions.length > 0 && (
            <ArtCarousel title={t('catalog.traditions')}>
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

          {devotions.length > 0 && (
            <ArtCarousel title={t('catalog.devotions')}>
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

          <Section title={t('catalog.byType')}>
            <ShortcutGrid items={withTones(typeTiles)} />
          </Section>

          <Section title={t('catalog.personal')}>
            <ShortcutGrid items={withTones(personalTiles)} />
          </Section>
        </YStack>
      </ScreenLayout>

      <Modal
        visible={showEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditor(false)}
      >
        <YStack flex={1} justifyContent="flex-end">
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onPress={() => setShowEditor(false)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeModal')}
          />
          <PracticeEditSheet onSave={handleSave} onClose={() => setShowEditor(false)} />
        </YStack>
      </Modal>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$md">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {title}
      </Typography>
      {children}
    </YStack>
  )
}
