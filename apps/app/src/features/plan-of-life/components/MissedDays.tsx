import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { ProgramConfig } from '@/content/types'
import { useStableToday } from '@/hooks/useToday'
import { formatLocalized } from '@/lib/i18n/dateLocale'

import {
  useBackfillMissedDays,
  useProgramDayDates,
  useProgramProgress,
  useRestartProgram,
} from '../hooks'
import { phrasing } from '../phrasing'
import { computeAllDayStates } from '../program'

/**
 * A program that a missed day sends back to its start: which days went by,
 * the way back to day I and when it falls, and the days prayed but not logged.
 */
export function MissedDays({
  practiceId,
  program,
}: {
  practiceId: string
  program: ProgramConfig
}) {
  const { t, i18n } = useTranslation()
  const today = useStableToday()
  const progress = useProgramProgress(practiceId, program, today)
  const dates = useProgramDayDates(practiceId, program)
  const restartDates = useProgramDayDates(practiceId, program, { restarted: true })
  const restart = useRestartProgram()
  const backfill = useBackfillMissedDays()
  if (!progress) return undefined

  const todayStr = format(today, 'yyyy-MM-dd')
  const fullDate = (date: string) => formatLocalized(parseISO(date), t('program.dateFormat'))
  const missedDates = computeAllDayStates(progress).flatMap((s, i) =>
    s.isMissed && dates[i] ? [dates[i] as string] : [],
  )
  const count = missedDates.length || progress.missedDays
  const named = missedDates.slice(-3).map(fullDate)
  const list =
    named.length < 2
      ? named.join('')
      : `${named.slice(0, -1).join(', ')} ${phrasing(i18n.language).and} ${named.at(-1)}`
  const firstDay = restartDates[0]

  return (
    <YStack alignItems="center">
      <Typography
        variant="sacred-title"
        fontSize={30}
        lineHeight={38}
        fontStyle="italic"
        textAlign="center"
      >
        {t('program.missedTitle', { count })}
      </Typography>
      {list ? (
        <Typography tone="muted" fontSize="$3" textAlign="center" paddingTop="$sm">
          {t('program.missedWhen', { count, dates: list })}
        </Typography>
      ) : null}
      <PrayBar label={t('program.restartFromOne')} onPress={() => restart.mutate({ practiceId })} />
      {firstDay && firstDay !== todayStr ? (
        <Typography tone="muted" fontStyle="italic" fontSize="$2" paddingTop="$sm">
          {t('program.restartFallsOn', { date: fullDate(firstDay) })}
        </Typography>
      ) : null}
      {/* Logged on the missed days' own dates: a First Friday counts only on a Friday. */}
      <FootLink
        label={t('program.prayedUnlogged', { count })}
        onPress={() => backfill.mutate({ practiceId, dates: missedDates })}
      />
    </YStack>
  )
}

export function PrayBar({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'stretch', paddingHorizontal: 30, paddingTop: 24 }}
    >
      <YStack
        height={50}
        borderRadius={25}
        backgroundColor="$accent"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="label" letterSpacing={1.5} color="$background">
          {label}
        </Typography>
      </YStack>
    </AnimatedPressable>
  )
}

export function FootLink({
  label,
  chevron,
  onPress,
}: {
  label: string
  chevron?: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Typography tone="muted" fontSize="$2" minHeight={44} paddingTop="$sm">
        {chevron ? `${label} ›` : label}
      </Typography>
    </AnimatedPressable>
  )
}
