import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout, SlotChip } from '@/components'
import type { AngelusSlot } from '@/db/events/types'
import {
  angelusSlots,
  useAngelusPrayedAt,
  useCurrentAngelusSlot,
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
  const activeSlot = useCurrentAngelusSlot()

  const eastertide = season === 'easter'
  const prayerKey = eastertide ? 'angelus.reginaCaeli' : 'angelus.prayer'
  const titleKey = eastertide ? 'angelus.reginaCaeliTitle' : 'angelus.title'
  const subtitleKey = eastertide ? 'angelus.reginaCaeliSubtitle' : 'angelus.subtitle'

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
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
              <AngelusSlotChip
                key={slot}
                slot={slot}
                active={slot === activeSlot}
                dateKey={dateKey}
              />
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
            <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={26}>
              {t(prayerKey)}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function AngelusSlotChip({
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
    <SlotChip label={t(`angelus.slot.${slot}`)} active={active} done={prayed} onToggle={onToggle} />
  )
}
