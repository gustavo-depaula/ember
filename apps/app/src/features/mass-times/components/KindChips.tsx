import type { Service } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { XStack } from 'tamagui'
import { Typography } from '@/components'
import { kindLabel, serviceKindOrder } from '../format'
import { OutlineChip } from './OutlineChip'

// The distinct service kinds a church offers, in a fixed liturgical order, as quiet chips.
export function KindChips({ services }: { services: Service[] }) {
  const { t } = useTranslation()
  const present = serviceKindOrder.filter((kind) => services.some((s) => s.kind === kind))
  if (present.length === 0) return null

  return (
    <XStack gap="$xs" flexWrap="wrap">
      {present.map((kind) => (
        <OutlineChip key={kind} paddingHorizontal="$sm" paddingVertical={2}>
          <Typography variant="reference">{kindLabel(kind, t)}</Typography>
        </OutlineChip>
      ))}
    </XStack>
  )
}
