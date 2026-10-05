import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AnimatedCheckbox, AnimatedPressable, Typography } from '@/components'
import type { ProgramConfig } from '@/content/types'
import { useStableToday } from '@/hooks/useToday'
import { lightTap } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'

import {
  useBackfillMissedDays,
  useProgramDayDates,
  useProgramProgress,
  useRestartProgram,
} from '../hooks'
import { computeAllDayStates } from '../program'

/**
 * The way out of a program that a missed day sends back to its start: each
 * missed day as a line to tick if it was prayed after all, and the way back to
 * day I with the date it falls on.
 */
export function MissedDays({
  practiceId,
  program,
}: {
  practiceId: string
  program: ProgramConfig
}) {
  const { t } = useTranslation()
  const today = useStableToday()
  const progress = useProgramProgress(practiceId, program, today)
  const dates = useProgramDayDates(practiceId, program)
  const restartDates = useProgramDayDates(practiceId, program, { restarted: true })
  const restart = useRestartProgram()
  const backfill = useBackfillMissedDays()
  if (!progress) return undefined

  const missedDates = computeAllDayStates(progress).flatMap((s, i) =>
    s.isMissed && dates[i] ? [dates[i] as string] : [],
  )
  const firstDay = restartDates[0]
  const restartLabel = t('program.restartFromOne')

  return (
    <YStack alignSelf="stretch">
      {missedDates.map((date) => {
        // pt-BR weekdays come lowercase; this one opens a line.
        const lower = formatLocalized(parseISO(date), t('program.dayDateFormat'))
        const dayLabel = lower.charAt(0).toUpperCase() + lower.slice(1)
        const prayed = t('program.prayedUnlogged', { count: 1 })
        // Logged on the missed day's own date: a First Friday counts only on a Friday.
        const tick = () => {
          lightTap()
          backfill.mutate({ practiceId, dates: [date] })
        }
        return (
          // The checkbox is the control a screen reader meets; the row only
          // widens its touch target.
          <Pressable key={date} onPress={tick} accessible={false}>
            <XStack
              alignItems="center"
              gap="$md"
              paddingVertical="$md"
              paddingHorizontal="$xs"
              borderBottomWidth={0.5}
              borderColor="$borderColor"
            >
              <AnimatedCheckbox
                checked={false}
                size={24}
                subtle
                onToggle={tick}
                accessibilityLabel={`${dayLabel}, ${prayed}`}
              />
              <YStack flex={1}>
                <Typography fontSize="$4">{dayLabel}</Typography>
                <Typography tone="muted" fontSize="$2">
                  {prayed}
                </Typography>
              </YStack>
            </XStack>
          </Pressable>
        )
      })}
      <AnimatedPressable
        onPress={() => restart.mutate({ practiceId })}
        accessibilityRole="button"
        accessibilityLabel={restartLabel}
        style={{ paddingTop: 20 }}
      >
        <YStack
          paddingVertical="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$accentSubtle"
          alignItems="center"
        >
          <Typography variant="label" fontSize="$2" letterSpacing={1.5} color="$accent">
            {restartLabel}
          </Typography>
        </YStack>
      </AnimatedPressable>
      {firstDay && firstDay !== format(today, 'yyyy-MM-dd') ? (
        <Typography
          tone="muted"
          fontStyle="italic"
          fontSize="$2"
          textAlign="center"
          paddingTop="$sm"
        >
          {t('program.restartFallsOn', {
            date: formatLocalized(parseISO(firstDay), t('program.dateFormat')),
          })}
        </Typography>
      ) : null}
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
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ minHeight: 48, justifyContent: 'center' }}
    >
      <Typography tone="muted" fontSize="$4">
        {chevron ? `${label} ›` : label}
      </Typography>
    </AnimatedPressable>
  )
}
