import { format } from 'date-fns'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Text, XStack } from 'tamagui'

import { useDayOffered, useOfferDay } from '@/features/oblatio'
import { successBuzz } from '@/lib/haptics'

export function OblatioLine({ date }: { date: Date }) {
  const { t } = useTranslation()
  const dateKey = format(date, 'yyyy-MM-dd')
  const offeredAt = useDayOffered(dateKey)
  const offer = useOfferDay()

  const opacity = useSharedValue(offeredAt ? 0 : 1)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // biome-ignore lint/correctness/useExhaustiveDependencies: opacity is a stable shared ref
  useEffect(() => {
    opacity.value = withTiming(offeredAt ? 0 : 1, { duration: 500 })
  }, [offeredAt])

  const handlePress = () => {
    if (offeredAt) return
    successBuzz()
    offer.mutate(dateKey)
  }

  return (
    <Animated.View style={style} pointerEvents={offeredAt ? 'none' : 'auto'}>
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('oblatio.a11yOfferThisDay')}
      >
        <XStack justifyContent="center" paddingVertical="$xs">
          <Text fontFamily="$body" fontSize="$2" color="$accent" textAlign="center" opacity={0.9}>
            {t('oblatio.offerThisDay')}
          </Text>
        </XStack>
      </Pressable>
    </Animated.View>
  )
}
