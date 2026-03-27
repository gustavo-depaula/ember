import { Text, YStack } from 'tamagui'

import { tierConfig } from '@/config/constants'
import type { Tier } from '@/db/schema'

export function TierBadge({ tier }: { tier: Tier }) {
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
        {config.label}
      </Text>
    </YStack>
  )
}
