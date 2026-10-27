import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { ProgramConfig } from '@/content/types'
import { DayStars, dayWindow } from '@/features/plan-of-life/components/DayStars'
import {
  useProgramDayDates,
  useProgramProgress,
  useSlotsForPractice,
  useUpdateSlot,
} from '@/features/plan-of-life/hooks'
import { computeAllDayStates, traditionalStart } from '@/features/plan-of-life/program'
import { parseSchedule } from '@/features/plan-of-life/schedule'
import { useStableToday } from '@/hooks/useToday'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

// The parts every end of a program is drawn from — kept whole (the modal after the last Amém),
// its days gone by, a run broken (the program page and the sheet on Today) — so the three read as
// one family: the name in small caps, a title, one plain line, the day stars, what comes next, the
// card's envelope, one button.

/** A fixed feast, as a holy card keeps it. */
export type CardFeast = { month: number; day: number }

/**
 * The day a novena leads up to: its card's feast when the card keeps one (the Holy Souls novena
 * ends on All Souls itself, St. Philomena's two days before her day), else the day after its last.
 * Undefined for a program with no feast, or one whose feast falls on one of its own days.
 */
export function useProgramFeast(
  practiceId: string,
  program: ProgramConfig | undefined,
  cardFeast?: CardFeast,
) {
  const today = useStableToday()
  const last = useProgramDayDates(practiceId, program).at(-1)
  if (!program?.ends || !last) return undefined
  const lastDay = parseISO(last)
  const feastDay = cardFeast
    ? new Date(lastDay.getFullYear(), cardFeast.month - 1, cardFeast.day)
    : addDays(lastDay, 1)
  if (differenceInCalendarDays(feastDay, lastDay) <= 0) return undefined
  const date = format(feastDay, 'yyyy-MM-dd')
  const away = differenceInCalendarDays(feastDay, today)
  return { date, past: away < 0, tomorrow: away === 1 }
}

// `name` in small caps over the title; left off where the screen's header already names it.
// `display`: the moment itself (the modal after the last Amém) — a larger title, centred, so it
// reads as an arrival; on the program page the title sits at the page's own size.
export function EndingHead({
  name,
  title,
  lede,
  display = false,
}: {
  name?: string
  title: string
  lede?: string
  display?: boolean
}) {
  const align = display ? 'center' : 'left'
  return (
    <YStack gap="$xs" alignItems={display ? 'center' : 'stretch'}>
      {name ? (
        <Typography
          variant="label"
          fontSize="$1"
          tone="muted"
          textTransform="uppercase"
          letterSpacing={1.5}
          textAlign={align}
        >
          {name}
        </Typography>
      ) : null}
      <Typography
        variant="sacred-title"
        fontSize={display ? 40 : 30}
        lineHeight={display ? 52 : 38}
        fontStyle="italic"
        textAlign={align}
        paddingVertical={display ? '$xs' : 0}
      >
        {title}
      </Typography>
      {lede ? (
        <Typography tone="muted" fontSize="$3" lineHeight={24} textAlign={align}>
          {lede}
        </Typography>
      ) : null}
    </YStack>
  )
}

/**
 * The line under "You persevered": the days and the dates they ran, and — on a novena's eve —
 * whose day tomorrow is.
 */
export function useKeptLede(
  practiceId: string,
  program: ProgramConfig | undefined,
  saint?: { name: string; feast?: CardFeast },
): string {
  const { t } = useTranslation()
  const dates = useProgramDayDates(practiceId, program)
  const feast = useProgramFeast(practiceId, program, saint?.feast)
  const first = dates[0]
  const last = dates.at(-1)
  const kept = (() => {
    const count = program?.totalDays ?? dates.length
    if (!first || !last) return t('program.ending.daysPrayed', { count })
    const from = parseISO(first)
    const to = parseISO(last)
    // "de 16 a 24 de outubro": the month said once when both days share it.
    const sameMonth = from.getMonth() === to.getMonth()
    return t('program.ending.daysPrayedRange', {
      count,
      from: formatLocalized(from, t(sameMonth ? 'program.ending.rangeFrom' : 'program.dateFormat')),
      to: formatLocalized(to, t(sameMonth ? 'program.ending.rangeTo' : 'program.dateFormat')),
    })
  })()
  return feast?.tomorrow && saint
    ? `${kept} ${t('program.ending.tomorrowIs', { name: saint.name })}`
    : kept
}

/** The program's days as stars, a novena's feast after them. */
export function EndingStars({
  practiceId,
  program,
  cardFeast,
}: {
  practiceId: string
  program: ProgramConfig
  cardFeast?: CardFeast
}) {
  const today = useStableToday()
  const progress = useProgramProgress(practiceId, program, today)
  const dates = useProgramDayDates(practiceId, program)
  const feast = useProgramFeast(practiceId, program, cardFeast)
  if (!progress) return null
  const states = computeAllDayStates(progress)
  return (
    <DayStars
      days={dayWindow(progress.programDay, progress.totalDays).map((i) => ({
        state: states[i],
        date: dates[i],
      }))}
      feast={feast}
    />
  )
}

export function EndingSection({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <YStack>
      {label ? (
        <Typography
          variant="label"
          fontSize="$1"
          tone="muted"
          textTransform="uppercase"
          letterSpacing={1.5}
          paddingBottom="$xs"
        >
          {label}
        </Typography>
      ) : null}
      {children}
    </YStack>
  )
}

export function EndingLink({
  title,
  detail,
  onPress,
}: {
  title: string
  detail?: string
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="link" accessibilityLabel={title}>
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$md"
        borderBottomWidth={0.5}
        borderColor="$borderColor"
      >
        <YStack flex={1}>
          <Typography fontSize="$4">{title}</Typography>
          {detail ? (
            <Typography tone="muted" fontSize="$2">
              {detail}
            </Typography>
          ) : null}
        </YStack>
        <Typography tone="muted" fontSize="$4">
          ›
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}

/**
 * "Pray it again next October": a novena dated by its feast joined as standing begins again by
 * itself when the feast next comes round (see `nextStandingStart`). Only for such a novena.
 */
export function NextYearSwitch({
  practiceId,
  program,
}: {
  practiceId: string
  program: ProgramConfig
}) {
  const { t } = useTranslation()
  const today = useStableToday()
  const transfers = useOfTransfers()
  const slot = useSlotsForPractice(practiceId)[0]
  const updateSlot = useUpdateSlot()
  const schedule = slot ? parseSchedule(slot.schedule) : undefined
  // Asked well past this year's feast, the program's next first day is next year's.
  const next = traditionalStart(program, addDays(today, 40), transfers)
  if (!slot || !next || schedule?.type !== 'fixed-program') return null

  const standing = schedule.standing === true
  const set = (value: boolean) => {
    const { standing: _, ...rest } = schedule
    updateSlot.mutate({
      id: slot.id,
      data: { schedule: JSON.stringify(value ? { ...rest, standing: true } : rest) },
    })
  }
  const nextDate = parseISO(next)
  const label = t('program.ending.again', { date: formatLocalized(nextDate, 'LLLL yyyy') })

  return (
    <XStack alignItems="center" gap="$md" paddingVertical="$sm">
      <YStack flex={1}>
        <Typography fontSize="$4">{label}</Typography>
        <Typography tone="muted" fontSize="$2">
          {t('program.ending.againStarts', {
            date: formatLocalized(nextDate, t('program.dateFormat')),
          })}
        </Typography>
      </YStack>
      <Switch value={standing} onValueChange={set} accessibilityLabel={label} />
    </XStack>
  )
}
