import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import {
  FadeInView,
  GreenWall,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getManifest } from '@/content/practices'
import { LiturgicalHeader, SaintOfDay, TimeBlockSection } from '@/features/home'
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

export default function HomeScreen() {
  const { t } = useTranslation()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()
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
  const totalPractices = todayPractices.length
  const completedCount = todayPractices.filter((p) => completedIds.has(p.id)).length

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        {/* 1. Liturgical Header */}
        <LiturgicalHeader date={now} />

        {/* 2. Saint of the Day */}
        <FadeInView>
          <SaintOfDay />
        </FadeInView>

        {/* 3. Divider */}
        <SectionDivider symbol="✞" />

        {/* 4. Practices — Your Rule of Life */}
        {todayPractices.length > 0 && (
          <YStack gap="$md">
            <FadeInView index={1}>
              <Text
                fontFamily="$heading"
                fontSize="$4"
                color="$accent"
                textAlign="center"
                letterSpacing={1}
              >
                {t('home.ruleOfLife')}
              </Text>
            </FadeInView>

            {activeBlocks.map(({ block, def }, index) => {
              const blockPracticeIds = def.practices.map((p) => p.id)
              const { completed, total } = getBlockCompletion(blockPracticeIds, completedIds)
              const autoState = getBlockState(block, currentBlock, completedIds, blockPracticeIds)
              const state = overrides[block] ?? autoState

              return (
                <FadeInView key={block} index={index + 2}>
                  <TimeBlockSection
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
                </FadeInView>
              )
            })}
          </YStack>
        )}

        {/* 5. Fidelity Wall (compact, at bottom) */}
        {wallData.length > 0 && (
          <>
            <SectionDivider />
            <FadeInView index={activeBlocks.length + 3}>
              <YStack alignItems="center" gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$accent">
                  {t('home.fidelity')}
                </Text>
                <GreenWall data={wallData} weeks={10} tiered />
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('home.todayProgress', {
                    completed: completedCount,
                    total: totalPractices,
                  })}
                </Text>
              </YStack>
            </FadeInView>
          </>
        )}

        {/* 6. Page Footer */}
        <PageBreakOrnament />
      </YStack>
    </ScreenLayout>
  )
}
