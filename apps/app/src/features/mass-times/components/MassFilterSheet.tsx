import type { ServiceKind } from '@ember/api'
import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'
import { kindLabel, serviceKindOrder } from '../format'
import { countActiveFilters, emptyFilter, type MassFilter } from '../useMassTimesNearby'
import { ChipButton } from './ChipButton'

// The one filter surface: a bottom sheet that narrows the nearby churches by service, "has times
// today", and saved-only — replacing the inline pills (which answered "has Mass ever?" rather than
// the question that matters, "has Mass today?").
export function MassFilterSheet({
  open,
  filter,
  onChange,
  onClose,
}: {
  open: boolean
  filter: MassFilter
  onChange: (filter: MassFilter) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const kinds: Array<{ key?: ServiceKind; label: string }> = [
    { key: undefined, label: t('massTimes.all') },
    ...serviceKindOrder.map((k) => ({ key: k, label: kindLabel(k, t) })),
  ]

  return (
    <BottomSheet
      index={open ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$md" paddingBottom={insets.bottom + 24} gap="$lg">
        <XStack justifyContent="space-between" alignItems="center">
          <Typography variant="screen-title" textAlign="left">
            {t('massTimes.filters')}
          </Typography>
          {countActiveFilters(filter) > 0 ? (
            <AnimatedPressable
              onPress={() => {
                void selectionTick()
                onChange(emptyFilter)
              }}
              accessibilityRole="button"
            >
              <Typography variant="interface" fontSize="$3" color="$accent">
                {t('massTimes.reset')}
              </Typography>
            </AnimatedPressable>
          ) : null}
        </XStack>

        <YStack gap="$sm">
          <Typography variant="label">{t('massTimes.service')}</Typography>
          <XStack gap="$sm" flexWrap="wrap">
            {kinds.map((k) => (
              <ChipButton
                key={k.key ?? 'all'}
                label={k.label}
                selected={filter.kind === k.key}
                onPress={() => {
                  void selectionTick()
                  onChange({ ...filter, kind: k.key })
                }}
              />
            ))}
          </XStack>
        </YStack>

        <ToggleRow
          label={t('massTimes.todayOnly')}
          hint={t('massTimes.todayOnlyHint')}
          value={filter.today}
          onToggle={() => {
            void selectionTick()
            onChange({ ...filter, today: !filter.today })
          }}
        />
        <ToggleRow
          label={t('massTimes.favoritesOnly')}
          value={filter.favoritesOnly}
          onToggle={() => {
            void selectionTick()
            onChange({ ...filter, favoritesOnly: !filter.favoritesOnly })
          }}
        />
      </YStack>
    </BottomSheet>
  )
}

function ToggleRow({
  label,
  hint,
  value,
  onToggle,
}: {
  label: string
  hint?: ReactNode
  value: boolean
  onToggle: () => void
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        alignItems="center"
        gap="$md"
      >
        <YStack flex={1} gap={2}>
          <Typography variant="interface" fontSize="$4" textAlign="left">
            {label}
          </Typography>
          {hint ? <Typography variant="annotation">{hint}</Typography> : null}
        </YStack>
        <XStack
          width={26}
          height={26}
          borderRadius={13}
          alignItems="center"
          justifyContent="center"
          backgroundColor={value ? '$accent' : 'transparent'}
          borderWidth={value ? 0 : 1}
          borderColor="$borderColor"
        >
          {value ? <Check size={16} color={theme.background?.val} /> : null}
        </XStack>
      </XStack>
    </AnimatedPressable>
  )
}
