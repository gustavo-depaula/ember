import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { XStack } from 'tamagui'
import { selectionTick } from '@/lib/haptics'
import { kindLabel, serviceKindOrder } from '../format'
import { ChipButton } from './ChipButton'

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
      {options.map((opt) => (
        <ChipButton
          key={opt.key ?? 'all'}
          label={opt.label}
          dense
          selected={value === opt.key}
          onPress={() => {
            void selectionTick()
            onChange(opt.key)
          }}
        />
      ))}
    </XStack>
  )
}
