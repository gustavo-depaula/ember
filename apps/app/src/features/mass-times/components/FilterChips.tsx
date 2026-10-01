import { Heart } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useTheme, XStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'
import { kindLabel, serviceKindOrder } from '../format'
import type { MassFilter } from '../useMassTimesNearby'
import { useGlassTile } from './glass'

// The filters as one scrolling chip row under the search bar, in the church sheet itself. A second
// sheet can't be used here: presenting one replaces the native church sheet, which never returns.
// A service chip toggles (tapping the active one clears it); Today and Saved are independent.
export function FilterChips({
  filter,
  onChange,
}: {
  filter: MassFilter
  onChange: (filter: MassFilter) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const set = (next: MassFilter) => {
    void selectionTick()
    onChange(next)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {serviceKindOrder.map((kind) => (
        <Chip
          key={kind}
          label={kindLabel(kind, t)}
          selected={filter.kind === kind}
          onPress={() => set({ ...filter, kind: filter.kind === kind ? undefined : kind })}
        />
      ))}
      <Chip
        label={t('massTimes.today')}
        selected={filter.today}
        onPress={() => set({ ...filter, today: !filter.today })}
      />
      <Chip
        label={t('massTimes.savedSection')}
        icon={
          <Heart
            size={14}
            color={filter.favoritesOnly ? theme.background?.val : theme.colorBurgundy?.val}
            fill={filter.favoritesOnly ? theme.background?.val : 'transparent'}
          />
        }
        selected={filter.favoritesOnly}
        onPress={() => set({ ...filter, favoritesOnly: !filter.favoritesOnly })}
      />
    </ScrollView>
  )
}

function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string
  icon?: ReactNode
  selected: boolean
  onPress: () => void
}) {
  const tile = useGlassTile(true)
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <XStack
        alignItems="center"
        gap={6}
        height={32}
        paddingHorizontal="$md"
        borderRadius={16}
        backgroundColor={selected ? '$color' : tile}
      >
        {icon}
        <Typography variant="interface" fontSize="$2" color={selected ? '$background' : '$color'}>
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
