import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { getManifest } from '@/content/resolver'
import type { ProgramConfig } from '@/content/types'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { EndingHead } from '@/features/practices/components/ProgramEnding'
import { useStableToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'

import { useProgramDayDates, useProgramProgress, useRestartNeededPractices } from '../hooks'
import { computeAllDayStates } from '../program'
import { DayStars, dayWindow } from './DayStars'
import { FootLink, MissedDays } from './MissedDays'

const sheet = createSheet()

// Loaded when the sheet shows: the card's envelope brings the saints feature with it.
const CardEnvelope = lazy(() =>
  import('@/features/practices/components/ProgramCardEnvelope').then((m) => ({
    default: m.CardEnvelope,
  })),
)

// The day the sheet last rose: it warns once a day, not on every return to Today.
const shownOnKey = 'missed-days-shown-on'

/**
 * Rises over Today when a program a missed day sends back to its start — the
 * First Fridays, a triduum — is waiting on the choice to restart.
 */
export function MissedDaysSheet() {
  const insets = useSafeAreaInsets()
  const ids = [...useRestartNeededPractices()].sort()
  const key = ids.join(',')
  const day = format(useStableToday(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!key) return sheet.close()
    let live = true
    void getPreference(shownOnKey).then(async (last) => {
      if (!live || last === day) return
      sheet.open()
      await setPreference(shownOnKey, day)
    })
    return () => {
      live = false
    }
  }, [key, day])

  return (
    <NativeSheet sheet={sheet} fraction={0.55}>
      {({ scroll, height, bodyShown }) => (
        <YStack height={height} paddingTop="$xl">
          <ScrollView showsVerticalScrollIndicator={false} {...scroll}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48} gap="$xl">
              {bodyShown &&
                ids.map((id) => {
                  const manifest = getManifest(id)
                  if (!manifest?.program) return null
                  return (
                    <MissedProgram
                      key={id}
                      practiceId={id}
                      name={localizeContent(manifest.name)}
                      program={manifest.program}
                    />
                  )
                })}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}

// One program's notice: its row of days with the gap, then the way out.
function MissedProgram({
  practiceId,
  name,
  program,
}: {
  practiceId: string
  name: string
  program: ProgramConfig
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useStableToday()
  const progress = useProgramProgress(practiceId, program, today)
  const dates = useProgramDayDates(practiceId, program)
  if (!progress) return null

  const cards = [getManifest(practiceId)?.holyCard ?? []].flat()
  const states = computeAllDayStates(progress)
  const count = states.filter((s) => s.isMissed).length || progress.missedDays

  return (
    <YStack gap="$md">
      <EndingHead
        name={name}
        title={t('program.missedTitle', { count })}
        lede={t('program.ending.unbroken')}
      />
      <DayStars
        days={dayWindow(progress.programDay, progress.totalDays).map((i) => ({
          state: states[i],
          date: dates[i],
        }))}
      />
      <MissedDays practiceId={practiceId} program={program} />
      <Suspense fallback={null}>
        <CardEnvelope practiceId={practiceId} cards={cards} won={false} />
      </Suspense>
      <YStack alignItems="center">
        <FootLink
          label={t('program.openProgram')}
          chevron
          onPress={() => {
            sheet.close()
            router.push({
              pathname: '/practices/[manifestId]/program',
              params: { manifestId: practiceId },
            })
          }}
        />
      </YStack>
    </YStack>
  )
}
