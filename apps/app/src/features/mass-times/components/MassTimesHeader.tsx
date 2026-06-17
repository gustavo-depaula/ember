import { ChevronLeft, List, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'

export type ViewMode = 'list' | 'map'

// The one header for both the map and the list, so the two modes read as a single feature rather
// than two screens. Same Junicode title voice and gold marks as the church cards (the centerpiece);
// `variant="glass"` floats it over the map as a single bar, `variant="plain"` sits it on the list.
export function MassTimesHeader({
  variant,
  view,
  filterCount,
  onBack,
  onToggleView,
  onOpenFilters,
  onSearch,
}: {
  variant: 'glass' | 'plain'
  view: ViewMode
  filterCount: number
  onBack: () => void
  onToggleView: () => void
  onOpenFilters: () => void
  onSearch?: () => void
}) {
  const { t } = useTranslation()
  const isDark = useThemeName().startsWith('dark')
  const glass = variant === 'glass'

  const back = <HeaderButton icon={ChevronLeft} label={t('massTimes.back')} onPress={onBack} />
  const actions = (
    <>
      {onSearch ? (
        <HeaderButton icon={Search} label={t('massTimes.searchPlaceholder')} onPress={onSearch} />
      ) : null}
      <HeaderButton
        icon={SlidersHorizontal}
        label={t('massTimes.filters')}
        active={filterCount > 0}
        badge={filterCount > 0}
        onPress={onOpenFilters}
      />
      <HeaderButton
        icon={view === 'map' ? List : MapIcon}
        label={t(view === 'map' ? 'massTimes.list' : 'massTimes.map')}
        onPress={() => {
          void selectionTick()
          onToggleView()
        }}
      />
    </>
  )

  // Same compact manuscript title both ways (matching the church-card names), so the map bar and the
  // list header read as one control. The map centers it as a nav bar; the list keeps the app's
  // left-aligned screen-title convention.
  if (glass) {
    return (
      <GlassSurface isDark={isDark} style={{ borderRadius: 24 }}>
        <XStack alignItems="center" paddingHorizontal="$xs" paddingVertical="$xs">
          <XStack flex={1} alignItems="center" justifyContent="flex-start">
            {back}
          </XStack>
          <Typography variant="sacred-title" fontSize={28} lineHeight={34} numberOfLines={1}>
            {t('massTimes.title')}
          </Typography>
          <XStack flex={1} alignItems="center" justifyContent="flex-end">
            {actions}
          </XStack>
        </XStack>
      </GlassSurface>
    )
  }

  return (
    <XStack alignItems="center" gap="$xs">
      {back}
      <Typography
        variant="sacred-title"
        textAlign="left"
        fontSize={30}
        lineHeight={36}
        numberOfLines={1}
        flex={1}
        marginLeft="$xs"
      >
        {t('massTimes.title')}
      </Typography>
      {actions}
    </XStack>
  )
}

function HeaderButton({
  icon: Icon,
  label,
  onPress,
  active,
  badge,
}: {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  onPress: () => void
  active?: boolean
  badge?: boolean
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <YStack padding="$sm">
        <Icon size={20} color={active ? theme.accent?.val : theme.colorSecondary?.val} />
        {badge ? (
          <YStack
            position="absolute"
            top={2}
            right={2}
            width={9}
            height={9}
            borderRadius={5}
            backgroundColor="$accent"
            borderWidth={2}
            borderColor={theme.background?.val}
          />
        ) : null}
      </YStack>
    </AnimatedPressable>
  )
}
