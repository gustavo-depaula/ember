import { useLocalSearchParams, useRouter } from 'expo-router'
import { Check, ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getManifest, getManifestIconKey, loadPracticeData } from '@/content/registry'
import type { CycleData } from '@/content/types'
import { useProgramProgress } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

function getDayTitles(cycleData: Record<string, CycleData> | undefined): string[] {
  if (!cycleData) return []
  const data = Object.values(cycleData).find((d) => d.indexBy === 'program-day')
  if (!data) return []
  const entries = Object.values(data.entries)[0] as Record<string, unknown>[] | undefined
  if (!entries) return []
  return entries.map((entry) => {
    const title = entry.dayTitle
    if (typeof title === 'object' && title !== null && 'en-US' in title) {
      return localizeContent(title as { 'en-US'?: string; 'pt-BR'?: string })
    }
    return typeof title === 'string' ? title : ''
  })
}

export default function ProgramDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const { data: progress } = useProgramProgress(manifest?.id ?? '', manifest?.program)

  const cycleData = manifestId ? loadPracticeData(manifestId) : undefined
  const dayTitles = useMemo(() => getDayTitles(cycleData), [cycleData])

  if (!manifest?.program || !progress) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
            {t('common.loading')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const { programDay, totalDays } = progress
  const iconKey = getManifestIconKey(manifest.id)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color?.val} />
          </Pressable>
          <PracticeIcon name={iconKey} size={28} />
          <YStack flex={1} gap={2}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {localizeContent(manifest.name)}
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
              {t('program.dayOf', { day: programDay + 1, total: totalDays })}
            </Text>
          </YStack>
        </XStack>

        <YStack
          backgroundColor="$backgroundSurface"
          borderRadius="$lg"
          height={6}
          overflow="hidden"
        >
          <YStack
            backgroundColor="$accent"
            height={6}
            borderRadius="$lg"
            width={`${((programDay + 1) / totalDays) * 100}%`}
          />
        </YStack>

        <YStack gap="$xs">
          {Array.from({ length: totalDays }, (_, dayIndex) => {
            const dayNum = dayIndex + 1
            const dayKey = `day-${dayNum}`
            const isCurrent = dayIndex === programDay
            const isCompleted = dayIndex < programDay
            const isFuture = dayIndex > programDay
            const title = dayTitles[dayIndex]

            return (
              <DayRow
                key={dayKey}
                dayNum={dayNum}
                title={title}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                isFuture={isFuture}
                onPress={() => router.push(`/pray/${manifest.id}?programDay=${dayIndex}` as any)}
              />
            )
          })}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

function DayRow({
  dayNum,
  title,
  isCurrent,
  isCompleted,
  isFuture,
  onPress,
}: {
  dayNum: number
  title: string
  isCurrent: boolean
  isCompleted: boolean
  isFuture: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress}>
      <XStack
        backgroundColor={isCurrent ? '$accent' : '$backgroundSurface'}
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor={isCurrent ? '$accent' : '$borderColor'}
        opacity={isFuture ? 0.5 : 1}
      >
        <YStack
          width={32}
          height={32}
          borderRadius={16}
          backgroundColor={
            isCompleted ? '$accent' : isCurrent ? 'rgba(255,255,255,0.2)' : '$backgroundSurface'
          }
          borderWidth={isCompleted || isCurrent ? 0 : 1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
        >
          {isCompleted ? (
            <Check size={16} color="white" />
          ) : (
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color={isCurrent ? 'white' : '$colorSecondary'}
            >
              {dayNum}
            </Text>
          )}
        </YStack>
        <YStack flex={1} gap={2}>
          {title ? (
            <Text
              fontFamily="$heading"
              fontSize="$3"
              color={isCurrent ? 'white' : '$color'}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <Text fontFamily="$heading" fontSize="$3" color={isCurrent ? 'white' : '$color'}>
              Day {dayNum}
            </Text>
          )}
        </YStack>
        {isCurrent && !isCompleted && (
          <Text fontFamily="$body" fontSize="$2" color="rgba(255,255,255,0.7)">
            ›
          </Text>
        )}
      </XStack>
    </AnimatedPressable>
  )
}
