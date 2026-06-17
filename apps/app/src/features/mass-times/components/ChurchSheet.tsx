import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  interactiveDismissDisabled,
  presentationBackground,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { Church, Search, SlidersHorizontal } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Skeleton, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatDistanceKm, formatTimeOfDay } from '../format'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchListItem } from './ChurchListItem'
import { SavedChurches } from './SavedChurches'

// The map-backed browse sheet — the *native* iOS sheet (SwiftUI `BottomSheet`), so the drag, detents,
// and material are the OS itself, exactly like Apple Maps. `presentationBackgroundInteraction` keeps
// the map live behind it; our React Native list is embedded via `RNHostView`. Peek shows search +
// "next Mass near you"; drag up for the full list.
export function ChurchSheet(props: {
  nearby: MassTimesNearby
  locale: string
  filterCount: number
  onSearch: () => void
  onOpenFilters: () => void
}) {
  const theme = useTheme()

  return (
    <Host style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet isPresented onIsPresentedChange={noop}>
        <Group
          modifiers={[
            presentationDetents([{ fraction: 0.16 }, { fraction: 0.55 }, 'large']),
            presentationBackgroundInteraction({ type: 'enabledUpThrough', detent: 'large' }),
            interactiveDismissDisabled(true),
            presentationDragIndicator('visible'),
            presentationBackground(theme.background?.val ?? '#0E0D0C'),
          ]}
        >
          <RNHostView>
            <SheetContent {...props} />
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}

function noop() {}

function SheetContent({
  nearby,
  locale,
  filterCount,
  onSearch,
  onOpenFilters,
}: {
  nearby: MassTimesNearby
  locale: string
  filterCount: number
  onSearch: () => void
  onOpenFilters: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const churches = nearby.churches ?? []

  return (
    <FlatList
      style={{ flex: 1 }}
      data={churches}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => <ChurchListItem church={item} locale={locale} kind={nearby.kind} />}
      ItemSeparatorComponent={() => <YStack height="$sm" />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <YStack gap="$md" paddingTop="$xs" paddingBottom="$md">
          <XStack gap="$sm" alignItems="center">
            <AnimatedPressable style={{ flex: 1 }} onPress={onSearch} accessibilityRole="search">
              <XStack
                flex={1}
                backgroundColor="$backgroundSurface"
                borderRadius="$lg"
                paddingHorizontal="$md"
                paddingVertical="$sm"
                alignItems="center"
                gap="$sm"
              >
                <Search size={18} color={theme.colorSecondary?.val} />
                <Typography variant="annotation">{t('massTimes.searchPlaceholder')}</Typography>
              </XStack>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={onOpenFilters}
              accessibilityRole="button"
              accessibilityLabel={t('massTimes.filters')}
            >
              <YStack
                backgroundColor="$backgroundSurface"
                borderRadius="$lg"
                alignItems="center"
                justifyContent="center"
                width={40}
                height={40}
              >
                <SlidersHorizontal
                  size={18}
                  color={filterCount > 0 ? theme.accent?.val : theme.colorSecondary?.val}
                />
              </YStack>
            </AnimatedPressable>
          </XStack>

          <NextMassNearby churches={churches} locale={locale} />
          <SavedChurches />
          {churches.length > 0 ? (
            <Typography variant="label">{t('massTimes.nearbyHeading')}</Typography>
          ) : null}
        </YStack>
      }
      ListEmptyComponent={
        nearby.isLoading ? (
          <YStack gap="$sm">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={88} borderRadius={12} />
            ))}
          </YStack>
        ) : (
          <YStack gap="$xs" paddingTop="$md" alignItems="center">
            <Typography variant="interface">{t('massTimes.empty')}</Typography>
            <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
          </YStack>
        )
      }
    />
  )
}

// The devotional peek line: the soonest upcoming Mass among the nearby churches — "where can I pray
// soon?" answered the instant the screen opens.
function NextMassNearby({ churches, locale }: { churches: NearbyChurch[]; locale: string }) {
  const { t } = useTranslation()
  const theme = useTheme()

  const soonest = useMemo(() => {
    let best: { church: NearbyChurch; instant: Date; date: Date; startTime: string } | undefined
    for (const church of churches) {
      const next = nextService(church.services, { timezone: church.timezone, kind: 'mass' })
      if (!next) continue
      if (!best || next.instant < best.instant) {
        best = {
          church,
          instant: next.instant,
          date: next.occurrence.date,
          startTime: next.occurrence.startTime,
        }
      }
    }
    return best
  }, [churches])

  if (!soonest) return null
  const now = wallClockNow(soonest.church.timezone)

  return (
    <XStack
      backgroundColor="$accentSubtle"
      borderRadius="$lg"
      padding="$md"
      gap="$md"
      alignItems="center"
    >
      <Church size={22} color={theme.accent?.val} />
      <YStack flex={1} gap={1}>
        <Typography variant="label" color="$accent">
          {t('massTimes.nextMassNearby')}
        </Typography>
        <Typography variant="interface" fontSize="$3" numberOfLines={1}>
          {soonest.church.name} · {dayLabel(soonest.date, now, t, locale)}{' '}
          {formatTimeOfDay(soonest.startTime, locale)}
        </Typography>
      </YStack>
      <Typography variant="annotation">
        {formatDistanceKm(soonest.church.distanceKm, locale)}
      </Typography>
    </XStack>
  )
}
