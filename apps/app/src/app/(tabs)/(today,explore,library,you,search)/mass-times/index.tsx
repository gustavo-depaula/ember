import type { ServiceKind } from '@ember/api'
import { useRouter } from 'expo-router'
import { List, Search } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, PageHeader, ScreenLayout, Typography } from '@/components'
import {
  ChurchesMap,
  KindFilter,
  LocationBar,
  MassTimesList,
  type MassTimesNearby,
  useMassTimesNearby,
  type ViewMode,
  ViewToggle,
} from '@/features/mass-times'
import { selectionTick } from '@/lib/haptics'

// Mass Times root: the map is the primary surface — it stretches edge to edge with the controls
// floating on top — and a list mode is one tap away. Both share one location + query
// (useMassTimesNearby), and the search icon opens full-text lookup by name.
export default function MassTimesScreen() {
  const [mode, setMode] = useState<ViewMode>('map')
  const [kind, setKind] = useState<ServiceKind | undefined>(undefined)
  const nearby = useMassTimesNearby(kind)

  // Ask for location up front: this is what lights the blue dot and pulls real nearby results. iOS
  // shows the system dialog only once; later calls just read the status, so a guarded single fire.
  const askedRef = useRef(false)
  useEffect(() => {
    if (askedRef.current) return
    askedRef.current = true
    void nearby.location.request()
  }, [nearby.location])

  const props = { nearby, kind, onKind: setKind, mode, onMode: setMode }
  return mode === 'map' ? <MapView {...props} /> : <ListView {...props} />
}

type ViewProps = {
  nearby: MassTimesNearby
  kind?: ServiceKind
  onKind: (kind?: ServiceKind) => void
  mode: ViewMode
  onMode: (mode: ViewMode) => void
}

const glassCircle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
} as const

// Full-bleed map with floating glass controls. `box-none` on the overlay lets map gestures pass
// through the gaps so only the actual buttons and the filter strip capture touches.
function MapView({ nearby, kind, onKind, onMode }: ViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ChurchesMap nearby={nearby} />
      <YStack
        position="absolute"
        top={insets.top + 8}
        left={0}
        right={0}
        gap="$sm"
        paddingHorizontal="$md"
        pointerEvents="box-none"
      >
        <XStack alignItems="center" gap="$sm" pointerEvents="box-none">
          <GlassCircleButton
            isDark={isDark}
            label={t('massTimes.list')}
            onPress={() => {
              void selectionTick()
              onMode('list')
            }}
          >
            <List size={20} color={theme.colorSecondary?.val} />
          </GlassCircleButton>
          <YStack flex={1} alignItems="center" pointerEvents="box-none">
            <GlassSurface
              isDark={isDark}
              style={{ borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
            >
              <Typography variant="interface" fontSize="$5">
                {t('massTimes.title')}
              </Typography>
            </GlassSurface>
          </YStack>
          <GlassCircleButton
            isDark={isDark}
            label={t('massTimes.searchPlaceholder')}
            onPress={() => router.push('/mass-times/search')}
          >
            <Search size={20} color={theme.colorSecondary?.val} />
          </GlassCircleButton>
        </XStack>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <KindFilter value={kind} onChange={onKind} />
        </ScrollView>
        {/* Surface a real location problem right on the map (never silently swallowed) so a missing
            blue dot is explainable; the recenter button alone covers the healthy states. */}
        {nearby.location.error || nearby.location.status === 'denied' ? (
          <XStack alignItems="center" pointerEvents="box-none">
            <GlassSurface
              isDark={isDark}
              style={{ borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <LocationBar location={nearby.location} />
            </GlassSurface>
          </XStack>
        ) : null}
      </YStack>
    </YStack>
  )
}

function GlassCircleButton({
  isDark,
  label,
  onPress,
  children,
}: {
  isDark: boolean
  label: string
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <GlassSurface isDark={isDark} style={glassCircle}>
        {children}
      </GlassSurface>
    </AnimatedPressable>
  )
}

// List mode keeps the standard padded screen with a header toggle back to the map.
function ListView({ nearby, kind, onKind, mode, onMode }: ViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <PageHeader
          title={t('massTimes.title')}
          action={
            <XStack alignItems="center" gap="$md">
              <AnimatedPressable
                onPress={() => router.push('/mass-times/search')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.searchPlaceholder')}
              >
                <Search size={20} color={theme.colorSecondary?.val} />
              </AnimatedPressable>
              <ViewToggle value={mode} onChange={onMode} />
            </XStack>
          }
        />
        <KindFilter value={kind} onChange={onKind} />
        <MassTimesList nearby={nearby} />
      </YStack>
    </ScreenLayout>
  )
}
