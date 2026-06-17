import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  interactiveDismissDisabled,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { Church, Search, SlidersHorizontal } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Skeleton, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatDistanceKm, formatTimeOfDay } from '../format'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchesMap } from './ChurchesMap'
import { ChurchListItem } from './ChurchListItem'
import { SavedChurches } from './SavedChurches'

// The whole map + sheet surface, the Apple Maps way. Everything lives in ONE SwiftUI `Host`: the map
// is the Host's background content (so `presentationBackgroundInteraction` keeps it LIVE behind the
// sheet), and the native `BottomSheet` rides over it. Per Expo's own example, the RN list scrolls
// inside the sheet via `RNHostView` + a `flex:1` view + `nestedScrollEnabled`.
export function ChurchSheet({
  nearby,
  locale,
  filterCount,
  onSelectChurch,
  onSearch,
  onOpenFilters,
}: {
  nearby: MassTimesNearby
  locale: string
  filterCount: number
  onSelectChurch: (church: NearbyChurch) => void
  onSearch: () => void
  onOpenFilters: () => void
}) {
  return (
    <Host style={StyleSheet.absoluteFill}>
      <RNHostView>
        <View style={{ flex: 1 }}>
          <ChurchesMap nearby={nearby} onSelectChurch={onSelectChurch} bottomInset={150} />
        </View>
      </RNHostView>

      <BottomSheet isPresented onIsPresentedChange={noop}>
        <Group
          modifiers={[
            presentationDetents([{ fraction: 0.16 }, { fraction: 0.55 }, 'large']),
            presentationBackgroundInteraction('enabled'),
            interactiveDismissDisabled(true),
            presentationDragIndicator('visible'),
          ]}
        >
          <RNHostView>
            <View style={{ flex: 1 }}>
              <SheetContent
                nearby={nearby}
                locale={locale}
                filterCount={filterCount}
                onSearch={onSearch}
                onOpenFilters={onOpenFilters}
              />
            </View>
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
      style={styles.list}
      nestedScrollEnabled
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
                width={42}
                height={42}
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
      backgroundColor="$backgroundSurface"
      borderRadius="$lg"
      borderLeftWidth={3}
      borderLeftColor="$accent"
      paddingVertical="$sm"
      paddingHorizontal="$md"
      gap="$md"
      alignItems="center"
    >
      <Church size={20} color={theme.accent?.val} />
      <YStack flex={1} gap={1}>
        <Typography variant="reference" color="$accent">
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

const styles = StyleSheet.create({
  list: { flex: 1 },
})
