import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { tierConfig } from '@/config/constants'
import type { Tier } from '@/db/schema'

export function TierBadge({ tier }: { tier: Tier }) {
  const { t } = useTranslation()
  const config = tierConfig[tier]

  return (
    <YStack
      backgroundColor={config.color}
      borderRadius="$sm"
      paddingHorizontal="$xs"
      paddingVertical={2}
      opacity={0.85}
    >
      <Text fontFamily="$body" fontSize={10} color="white" textTransform="uppercase">
        {t(`tier.${tier}`)}
      </Text>
    </YStack>
  )
}
