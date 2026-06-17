import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { Typography } from '@/components'
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
          <Pressable
            key={opt.key ?? 'all'}
            onPress={() => onChange(opt.key)}
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
          </Pressable>
        )
      })}
    </XStack>
  )
}
