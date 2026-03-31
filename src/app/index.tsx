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
import { getSeasonalSymbol } from '@/components/SectionDivider'
import { getManifest } from '@/content/practices'
import {
  CelebrationOfDay,
  LiturgicalHeader,
  SeasonalContext,
  TimeBlockSection,
} from '@/features/home'
import {
  type BlockState,
  buildTieredWallData,
  enrichPractice,
  filterPracticesForDate,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  type TimeBlock,
  toCompletedSet,
  useCompletionRange,
  useCompletionsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { useToday } from '@/hooks/useToday'

export default function HomeScreen() {
  const { t } = useTranslation()
  const now = useToday()
  const today = format(now, 'yyyy-MM-dd')
  const hour = new Date().getHours()
  const currentBlock = getCurrentTimeBlock(hour)

  const { season, themeName } = useLiturgicalTheme()
  const router = useRouter()
  const { data: practices = [] } = usePractices()
  const { data: todayCompletions = [] } = useCompletionsForDate(today)
  const toggle = useTogglePractice()

  const handlePressPractice = useCallback(
    (id: string) => {
      const manifest = getManifest(id)
      if (!manifest) {
        router.push(`/plan/${id}` as any)
        return
      }
      if (manifest.hours?.length && !manifest.forms?.length) {
        router.push(`/plan/${id}` as any)
      } else {
        router.push(`/pray/${id}` as any)
      }
    },
    [router],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const { data: wallLogs = [] } = useCompletionRange(wallStart, today)

  const todayPractices = useMemo(() => filterPracticesForDate(practices, today), [practices, today])
  const completedIds = useMemo(() => toCompletedSet(todayCompletions), [todayCompletions])
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
  const completedCount = todayPractices.filter((p) => completedIds.has(p.practice_id)).length

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <LiturgicalHeader date={now} season={season} themeName={themeName} />

        <FadeInView>
          <SeasonalContext date={now} season={season} />
        </FadeInView>

        <FadeInView>
          <CelebrationOfDay />
        </FadeInView>

        <SectionDivider symbol={getSeasonalSymbol(themeName)} />

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
              const blockPracticeIds = def.practices.map((p) => p.practice_id)
              const { completed, total } = getBlockCompletion(blockPracticeIds, completedIds)
              const autoState = getBlockState(block, currentBlock, completedIds, blockPracticeIds)
              const state = overrides[block] ?? autoState

              return (
                <FadeInView key={block} index={index + 2}>
                  <TimeBlockSection
                    label={t(`timeBlock.${block}`)}
                    practices={def.practices.map((p) => enrichPractice(p, t))}
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

        <PageBreakOrnament />
      </YStack>
    </ScreenLayout>
  )
}
