import { XStack, YStack } from 'tamagui'

import { Skeleton } from '@/components'

export function FeedItemListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <YStack marginHorizontal={-24}>
      {Array.from({ length: count }).map((_, i) => (
        <YStack
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable identity
          key={i}
          paddingHorizontal="$lg"
          paddingVertical="$md"
          gap="$sm"
          borderTopWidth={i === 0 ? 0 : 1}
          borderTopColor="$borderColor"
        >
          <XStack gap="$md" alignItems="flex-start">
            <YStack flex={1} gap="$sm">
              <Skeleton width={70} height={10} />
              <Skeleton width="85%" height={18} />
              <Skeleton width="65%" height={14} />
            </YStack>
            <Skeleton width={72} height={72} borderRadius={10} />
          </XStack>
          <XStack gap="$md" alignItems="center" paddingTop="$xs">
            <Skeleton width={70} height={26} borderRadius={999} />
          </XStack>
        </YStack>
      ))}
    </YStack>
  )
}
