import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import type { AngelusSlot } from '@/db/events/types'
import {
  angelusSlots,
  currentAngelusSlot,
  useAngelusPrayedAt,
  usePrayAngelus,
  useRevokeAngelus,
} from '@/features/angelus'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { useToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'

export default function AngelusScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const now = useToday()
  const { season } = useLiturgicalTheme()
  const dateKey = format(now, 'yyyy-MM-dd')
  const activeSlot = currentAngelusSlot(now)

  const eastertide = season === 'easter'
  const prayerKey = eastertide ? 'angelus.reginaCaeli' : 'angelus.prayer'
  const titleKey = eastertide ? 'angelus.reginaCaeliTitle' : 'angelus.title'
  const subtitleKey = eastertide ? 'angelus.reginaCaeliSubtitle' : 'angelus.subtitle'

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
                {t(titleKey)}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {t(subtitleKey)}
              </Text>
            </YStack>
          </XStack>

          <XStack gap="$sm" justifyContent="center">
            {angelusSlots.map((slot) => (
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
            <Text fontFamily="$script" fontSize="$3" color="$color" lineHeight={26}>
              {t(prayerKey)}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function SlotChip({
  slot,
  active,
  dateKey,
}: {
  slot: AngelusSlot
  active: boolean
  dateKey: string
}) {
  const { t } = useTranslation()
  const pray = usePrayAngelus()
  const revoke = useRevokeAngelus()
  const prayedAt = useAngelusPrayedAt(dateKey, slot)
  const prayed = prayedAt !== undefined

  const onToggle = () => {
    if (prayed) {
      revoke.mutate({ date: dateKey, slot })
      return
    }
    successBuzz()
    pray.mutate({ date: dateKey, slot })
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
        backgroundColor={prayed ? '$accent' : 'transparent'}
      >
        {prayed && <Check size={12} color="white" />}
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color={prayed ? 'white' : active ? '$accent' : '$colorSecondary'}
          letterSpacing={1}
        >
          {t(`angelus.slot.${slot}`).toUpperCase()}
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}
