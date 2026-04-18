import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout, SlotChip } from '@/components'
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
              <MealSlotChip key={slot} slot={slot} active={slot === activeSlot} dateKey={dateKey} />
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
            <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={26}>
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
            <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={26}>
              {t('benedictio.afterPrayer')}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function MealSlotChip({
  slot,
  active,
  dateKey,
}: {
  slot: MealSlot
  active: boolean
  dateKey: string
}) {
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
    <SlotChip
      label={t(`benedictio.slot.${slot}`)}
      active={active}
      done={blessed}
      onToggle={onToggle}
    />
  )
}
