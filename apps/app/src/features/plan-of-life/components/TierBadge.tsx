import { useTranslation } from 'react-i18next'

import { Typography } from '@/components'
import { tierConfig } from '@/config/constants'
import type { Tier } from '@/db/schema'

// A tracked-caps signpost in the tier's liturgical color — no filled pill.
export function TierBadge({ tier }: { tier: Tier }) {
  const { t } = useTranslation()
  const config = tierConfig[tier]

  return (
    <Typography
      fontFamily="$heading"
      fontSize="$1"
      color={config.color}
      textTransform="uppercase"
      letterSpacing={1.5}
    >
      {t(`tier.${tier}`)}
    </Typography>
  )
}
