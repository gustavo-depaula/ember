import { XStack, YStack } from 'tamagui'

import { Skeleton } from '@/components'

export function FeedItemListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <YStack gap="$xs">
      {Array.from({ length: count }).map((_, i) => (
        <XStack
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable identity
          key={i}
          padding="$md"
          gap="$md"
          backgroundColor="$backgroundSurface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
        >
          <Skeleton width={80} height={60} borderRadius={6} />
          <YStack flex={1} gap="$sm">
            <Skeleton width="85%" height={14} />
            <Skeleton width="40%" height={10} />
          </YStack>
        </XStack>
      ))}
    </YStack>
  )
}
