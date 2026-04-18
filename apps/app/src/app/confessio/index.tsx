import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, ScreenLayout } from '@/components'
import type { ConfessionState } from '@/db/events/state'
import {
  useConfessions,
  useLastConfession,
  useRecordConfession,
  useRemoveConfession,
} from '@/features/confessio'
import { useToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'

export default function ConfessioScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const now = useToday()

  const confessions = useConfessions()
  const last = useLastConfession()
  const record = useRecordConfession()
  const remove = useRemoveConfession()

  const todayKey = format(now, 'yyyy-MM-dd')
  const recordedToday = last?.date === todayKey

  const daysSince = last ? differenceInCalendarDays(now, parseISO(last.date)) : undefined
  const sinceLabel =
    daysSince === undefined
      ? t('confessio.noneRecorded')
      : daysSince === 0
        ? t('confessio.sinceToday')
        : daysSince === 1
          ? t('confessio.sinceYesterday')
          : t('confessio.sinceDays', { count: daysSince })

  const onRecord = () => {
    if (recordedToday) return
    successBuzz()
    record.mutate(todayKey)
  }

  const onDelete = async (confession: ConfessionState) => {
    const ok = await confirm({
      title: t('confessio.confirmDeleteTitle'),
      description: formatLocalized(parseISO(confession.date), 'PPP'),
      confirmLabel: t('common.remove'),
      destructive: true,
    })
    if (ok) remove.mutate(confession.id)
  }

  return (
    <ScreenLayout>
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
              {t('confessio.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('confessio.subtitle')}
            </Text>
          </YStack>
        </XStack>

        <YStack
          gap="$sm"
          padding="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$backgroundSurface"
          alignItems="center"
        >
          {!recordedToday && (
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
              {sinceLabel}
            </Text>
          )}
          <AnimatedPressable
            onPress={onRecord}
            disabled={recordedToday}
            accessibilityRole="button"
            accessibilityLabel={
              recordedToday ? t('confessio.recordedToday') : t('confessio.recordToday')
            }
          >
            <XStack
              alignItems="center"
              gap="$sm"
              paddingVertical="$sm"
              paddingHorizontal="$lg"
              borderRadius={999}
              borderWidth={1}
              borderColor="$accent"
              backgroundColor={recordedToday ? '$backgroundSurface' : '$accent'}
              opacity={recordedToday ? 0.5 : 1}
            >
              <Check size={14} color={recordedToday ? theme.accent?.val : 'white'} />
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color={recordedToday ? '$accent' : 'white'}
                letterSpacing={0.5}
              >
                {recordedToday ? t('confessio.recordedToday') : t('confessio.recordToday')}
              </Text>
            </XStack>
          </AnimatedPressable>
        </YStack>

        <YStack
          gap="$sm"
          padding="$md"
          borderRadius="$md"
          borderLeftWidth={3}
          borderLeftColor="$accent"
          backgroundColor="$backgroundSurface"
        >
          <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
            {t('confessio.actOfContritionHeading').toUpperCase()}
          </Text>
          <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={28}>
            {t('confessio.actOfContrition')}
          </Text>
        </YStack>

        {confessions.length > 0 && (
          <YStack gap="$xs">
            <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
              {t('confessio.historyHeading').toUpperCase()}
            </Text>
            {confessions.map((c) => (
              <Animated.View
                key={c.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition.duration(200)}
              >
                <XStack
                  gap="$md"
                  alignItems="center"
                  paddingVertical="$sm"
                  paddingHorizontal="$md"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  backgroundColor="$backgroundSurface"
                >
                  <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
                    {formatLocalized(parseISO(c.date), 'PPP')}
                  </Text>
                  <AnimatedPressable
                    onPress={() => onDelete(c)}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.remove')}
                  >
                    <Trash2 size={14} color={theme.colorSecondary?.val} />
                  </AnimatedPressable>
                </XStack>
              </Animated.View>
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
