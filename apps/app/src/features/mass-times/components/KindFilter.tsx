import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { XStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'
import { kindLabel, serviceKindOrder } from '../format'
import { OutlineChip } from './OutlineChip'

// Filter the nearby churches to those offering a given service: All / Mass / Confession / Adoration.
export function KindFilter({
  value,
  onChange,
}: {
  value?: ServiceKind
  onChange: (kind?: ServiceKind) => void
}) {
  const { t } = useTranslation()
  const options: Array<{ key?: ServiceKind; label: string }> = [
    { key: undefined, label: t('massTimes.all') },
    ...serviceKindOrder.map((kind) => ({ key: kind, label: kindLabel(kind, t) })),
  ]

  return (
    <XStack gap="$sm" flexWrap="wrap">
      {options.map((opt) => {
        const active = value === opt.key
        return (
          <AnimatedPressable
            key={opt.key ?? 'all'}
            onPress={() => {
              void selectionTick()
              onChange(opt.key)
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <OutlineChip
              paddingHorizontal="$md"
              paddingVertical="$xs"
              backgroundColor={active ? '$accent' : 'transparent'}
            >
              <Typography
                variant="interface"
                fontSize="$3"
                color={active ? '$background' : '$color'}
              >
                {opt.label}
              </Typography>
            </OutlineChip>
          </AnimatedPressable>
        )
      })}
    </XStack>
  )
}
