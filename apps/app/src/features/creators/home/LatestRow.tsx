import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { useFollows, useLatestForFollowed } from '@/features/creators/hooks'
import { routeFor } from '../components/feedItemRoute'
import { KindIcon } from '../components/KindIcon'

export function LatestRow() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { data: follows } = useFollows()
  const { data: items = [] } = useLatestForFollowed(8)
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language || 'en-US', { month: 'short', day: 'numeric' }),
    [i18n.language],
  )

  if (!follows || follows.length === 0) return null
  if (items.length === 0) return null

  return (
    <YStack gap="$sm">
      <Text
        fontFamily="$heading"
        fontSize="$2"
        color="$accent"
        letterSpacing={2}
        textTransform="uppercase"
        paddingHorizontal="$md"
      >
        {t('creators.latest')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
      >
        {items.map((item) => (
          <AnimatedPressable
            key={item.itemId}
            onPress={() => router.push(routeFor(item))}
            accessibilityRole="link"
            accessibilityLabel={item.title}
          >
            <YStack
              width={180}
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$md"
              gap="$sm"
            >
              <XStack gap="$sm" alignItems="center">
                <KindIcon kind={item.channelKind} size={14} />
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {dateFmt.format(new Date(item.publishedAt))}
                </Text>
              </XStack>
              <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={3}>
                {item.title}
              </Text>
            </YStack>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </YStack>
  )
}
