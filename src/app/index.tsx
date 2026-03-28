import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import {
  FadeInView,
  GreenWall,
  HeaderFlourish,
  PageBreakOrnament,
  ScreenLayout,
} from '@/components'
import { getManifest } from '@/content/practices'
import { AppShortcuts, TimeBlockSection } from '@/features/home'
import {
  type BlockState,
  buildTieredWallData,
  filterPracticesForDate,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  getPracticeName,
  type TimeBlock,
  toCompletedSet,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'
import i18n from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return i18n.t('home.greetingMorning')
  if (hour >= 12 && hour < 17) return i18n.t('home.greetingAfternoon')
  return i18n.t('home.greetingEvening')
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const currentBlock = getCurrentTimeBlock(hour)

  const router = useRouter()
  const { data: practices = [] } = usePractices()
  const { data: todayLogs = [] } = usePracticeLogsForDate(today)
  const toggle = useTogglePractice()

  const handlePressPractice = useCallback(
    (id: string) => {
      const practice = practices.find((p) => p.id === id)
      const manifestId = practice?.manifest_id ?? id
      const manifest = getManifest(manifestId)
      if (!manifest) {
        router.push(`/plan/${id}` as any)
        return
      }
      if (manifest.hours?.length && !manifest.forms?.length) {
        router.push(`/plan/${id}` as any)
      } else {
        router.push(`/pray/${manifestId}` as any)
      }
    },
    [router, practices],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const { data: wallLogs = [] } = usePracticeLogRange(wallStart, today)

  const todayPractices = useMemo(() => filterPracticesForDate(practices, today), [practices, today])
  const completedIds = useMemo(() => toCompletedSet(todayLogs), [todayLogs])
  const wallData = useMemo(() => buildTieredWallData(wallLogs, practices), [wallLogs, practices])

  const [overrides, setOverrides] = useState<Partial<Record<TimeBlock, BlockState>>>({})

  const toggleBlockCollapse = useCallback((block: TimeBlock) => {
    setOverrides((prev) => {
      const current = prev[block]
      if (current === 'expanded') {
        return { ...prev, [block]: 'collapsed' }
      }
      return { ...prev, [block]: 'expanded' }
    })
  }, [])

  const activeBlocks = useMemo(() => getActiveBlocks(todayPractices), [todayPractices])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        {/* Header */}
        <YStack gap="$xs" alignItems="center">
          <HeaderFlourish />
          <Text fontFamily="$heading" fontSize="$5" color="$color">
            {greeting}
          </Text>
          <Text fontFamily="$script" fontSize="$4" color="$colorSecondary">
            {formatLocalized(now, 'EEE, MMMM d')}
          </Text>
        </YStack>

        {/* 1. Fidelity Wall */}
        {wallData.length > 0 && (
          <FadeInView>
            <YStack alignItems="center" gap="$sm">
              <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$accent">
                {t('home.fidelity')}
              </Text>
              <GreenWall data={wallData} weeks={10} tiered />
            </YStack>
          </FadeInView>
        )}

        {/* 2. App Shortcuts */}
        <FadeInView index={1}>
          <AppShortcuts />
        </FadeInView>

        {/* 3. Today's Plan of Life */}
        {todayPractices.length > 0 && (
          <YStack gap="$md">
            {activeBlocks.map(({ block, def }) => {
              const blockPracticeIds = def.practices.map((p) => p.id)
              const { completed, total } = getBlockCompletion(blockPracticeIds, completedIds)
              const autoState = getBlockState(block, currentBlock, completedIds, blockPracticeIds)
              const state = overrides[block] ?? autoState

              return (
                <TimeBlockSection
                  key={block}
                  label={t(`timeBlock.${block}`)}
                  practices={def.practices.map((p) => ({ ...p, name: getPracticeName(p, t) }))}
                  completedIds={completedIds}
                  state={state}
                  completed={completed}
                  total={total}
                  onToggle={(id, done) =>
                    toggle.mutate({ practiceId: id, date: today, completed: done })
                  }
                  onToggleCollapse={() => toggleBlockCollapse(block)}
                  onPressPractice={handlePressPractice}
                />
              )
            })}
          </YStack>
        )}

        <PageBreakOrnament />
      </YStack>
    </ScreenLayout>
  )
}
