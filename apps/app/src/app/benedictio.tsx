import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import type { MealSlot } from '@/db/events/types'
import {
  mealSlots,
  useBlessMeal,
  useCurrentMealSlot,
  useMealBlessedAt,
  useRevokeMealBlessing,
} from '@/features/benedictio'
import { useToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'

export default function BenedictioScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const today = useToday()
  const dateKey = format(today, 'yyyy-MM-dd')
  const activeSlot = useCurrentMealSlot()

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {t('benedictio.title')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {t('benedictio.subtitle')}
              </Text>
            </YStack>
          </XStack>

          <XStack gap="$sm" justifyContent="center">
            {mealSlots.map((slot) => (
              <SlotChip key={slot} slot={slot} active={slot === activeSlot} dateKey={dateKey} />
            ))}
          </XStack>

          <YStack
            gap="$sm"
            padding="$md"
            borderRadius="$md"
            borderLeftWidth={3}
            borderLeftColor="$accent"
            backgroundColor="$backgroundSurface"
          >
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$accent"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              {t('benedictio.before')}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$color" lineHeight={26}>
              {t('benedictio.beforePrayer')}
            </Text>
          </YStack>

          <YStack
            gap="$sm"
            padding="$md"
            borderRadius="$md"
            borderLeftWidth={3}
            borderLeftColor="$accent"
            backgroundColor="$backgroundSurface"
          >
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$accent"
              letterSpacing={1.5}
              textTransform="uppercase"
            >
              {t('benedictio.after')}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$color" lineHeight={26}>
              {t('benedictio.afterPrayer')}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function SlotChip({ slot, active, dateKey }: { slot: MealSlot; active: boolean; dateKey: string }) {
  const { t } = useTranslation()
  const bless = useBlessMeal()
  const revoke = useRevokeMealBlessing()
  const blessedAt = useMealBlessedAt(dateKey, slot)
  const blessed = blessedAt !== undefined

  const onToggle = () => {
    if (blessed) {
      revoke.mutate({ date: dateKey, slot })
      return
    }
    successBuzz()
    bless.mutate({ date: dateKey, slot })
  }

  return (
    <AnimatedPressable onPress={onToggle}>
      <XStack
        alignItems="center"
        gap="$xs"
        paddingVertical="$xs"
        paddingHorizontal="$md"
        borderRadius={999}
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        backgroundColor={blessed ? '$accent' : 'transparent'}
      >
        {blessed && <Check size={12} color="white" />}
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color={blessed ? 'white' : active ? '$accent' : '$colorSecondary'}
          letterSpacing={1}
        >
          {t(`benedictio.slot.${slot}`).toUpperCase()}
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}
