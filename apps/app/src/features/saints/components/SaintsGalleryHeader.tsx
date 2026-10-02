import { SegmentedControl } from '@expo/ui/community/segmented-control'
import { Link } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native'
import { YStack } from 'tamagui'
import { PageFlourish } from '@/components'
import { SegmentedSelector } from '@/components/SegmentedSelector'
import { Typography } from '@/components/typography'
import { useToday } from '@/hooks/useToday'
import { selectionTick } from '@/lib/haptics'
import type { SaintEntry } from '../data/catalog'
import { useHeldCards } from '../data/collection'
import { SaintCardTile } from './SaintCardTile'
import type { SaintGrouping } from './SaintWall'

const flourishDark = require('../../../../assets/textures/notch_explore_dark.png')
const flourishLight = require('../../../../assets/textures/notch_explore_light.png')
const flourishAspect = 2172 / 438
const flourishLightAspect = 2143 / 416

const groupings: SaintGrouping[] = ['shelves', 'collected', 'calendar', 'alpha']

export function SaintsGalleryHeader({
  saints,
  grouping,
  onGrouping,
}: {
  saints: SaintEntry[]
  grouping: SaintGrouping
  onGrouping: (g: SaintGrouping) => void
}) {
  const { t } = useTranslation()
  const today = useToday()
  const held = useHeldCards()
  const total = saints.length
  const collectedCount = useMemo(() => saints.filter((s) => held.has(s.id)).length, [saints, held])

  const todays = useMemo(() => {
    const month = today.getMonth() + 1
    const day = today.getDate()
    return saints.filter((s) => s.feast?.month === month && s.feast?.day === day).slice(0, 4)
  }, [saints, today])

  const segmentValues = useMemo(() => groupings.map((g) => t(`saints.group.${g}`)), [t])

  return (
    <YStack>
      <PageFlourish
        dark={flourishDark}
        light={flourishLight}
        aspectRatio={flourishAspect}
        lightAspectRatio={flourishLightAspect}
      />

      <YStack gap="$xs" paddingTop="$sm" marginTop="$-md">
        {total > 0 && (
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {collectedCount < total
              ? t('saints.metCount', { collected: collectedCount, total })
              : t('saints.cardCount', { count: total })}
          </Typography>
        )}
        <Typography variant="screen-title">{t('saints.title')}</Typography>
      </YStack>

      {todays.length > 0 && (
        <YStack gap="$sm" paddingTop="$lg">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('saints.today')}
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
          >
            {todays.map((saint) => (
              <LiveCard
                key={saint.id}
                saint={saint}
                label={t('saints.cardLink', { name: saint.name })}
              />
            ))}
          </ScrollView>
        </YStack>
      )}

      <YStack paddingTop="$lg" paddingBottom="$xs">
        {Platform.OS === 'android' ? (
          // Material's segmented buttons carry their own type, tick and
          // outline, none of which belong to the page.
          <SegmentedSelector
            values={segmentValues}
            selectedIndex={groupings.indexOf(grouping)}
            onChange={(i) => {
              selectionTick()
              onGrouping(groupings[i] ?? 'shelves')
            }}
          />
        ) : (
          <SegmentedControl
            values={segmentValues}
            selectedIndex={groupings.indexOf(grouping)}
            onChange={(e) => {
              selectionTick()
              onGrouping(groupings[e.nativeEvent.selectedSegmentIndex] ?? 'shelves')
            }}
          />
        )}
      </YStack>
    </YStack>
  )
}

const liveWidth = 104

function LiveCard({ saint, label }: { saint: SaintEntry; label: string }) {
  return (
    <Link href={{ pathname: '/saints/[index]', params: { index: saint.id } }} push asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={label} style={styles.liveCard}>
        <SaintCardTile saint={saint} width={liveWidth} />
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  // Room for a held card's stacked copies, which peek below and to the right.
  strip: { paddingRight: 24, paddingBottom: 8 },
  liveCard: { marginRight: 12 },
})
