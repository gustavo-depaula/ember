import { format, parseISO } from 'date-fns'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { formatLocalized } from '@/lib/i18n/dateLocale'

import type { DayState } from '../program'

// A long course shows the stretch around today rather than every day.
export const windowSize = 9

/** The days a long program shows at once: a window around the day it is on. */
export function dayWindow(programDay: number, totalDays: number): number[] {
  const start =
    totalDays <= windowSize
      ? 0
      : Math.min(Math.max(programDay - Math.floor(windowSize / 2), 0), totalDays - windowSize)
  return Array.from({ length: Math.min(windowSize, totalDays) }, (_, k) => start + k)
}

// The days as the fidelity wall draws them: a lit star for a day prayed, an
// open one for today, a dot for a day still to come — and an empty ring for
// one that passed unprayed, so a gap reads as a gap.
export function DayStars({ days }: { days: { state: DayState; date?: string }[] }) {
  const theme = useTheme()
  const parsed = days.map((d) => (d.date ? parseISO(d.date) : undefined))
  const months = [...new Set(parsed.filter(Boolean).map((d) => formatLocalized(d as Date, 'LLLL')))]
  // A day a month (the First Fridays) heads each cell with its month, where
  // the weekday would only repeat itself.
  const monthly = months.length === parsed.filter(Boolean).length && months.length > 2
  const head = (date: Date) =>
    formatLocalized(date, monthly ? 'LLL' : 'EEE')
      .replace('.', '')
      .slice(0, 3)
      .toUpperCase()

  return (
    <YStack
      paddingVertical="$md"
      borderBottomWidth={0.5}
      borderColor="$borderColor"
      gap="$sm"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* A handful of days (a triduum, the Ember days) gather at the middle. */}
      <XStack justifyContent={days.length < 5 ? 'space-evenly' : 'space-between'}>
        {days.map(({ state }, k) => {
          const date = parsed[k]
          const glyph = (() => {
            if (state.isCompleted) return { char: '✦', size: 18, color: theme.accent.val }
            if (state.isCurrent) return { char: '✧', size: 18, color: theme.colorSecondary.val }
            if (state.isMissed) return { char: '○', size: 10, color: theme.colorSecondary.val }
            return { char: '●', size: 4, color: theme.wallEmpty.val }
          })()
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the cells are positional
            <YStack key={k} alignItems="center" gap={4} width={34}>
              <Typography variant="label" fontSize={10} letterSpacing={1} tone="muted">
                {date ? head(date) : ''}
              </Typography>
              <YStack height={26} justifyContent="center">
                <Typography fontSize={glyph.size} lineHeight={26} color={glyph.color}>
                  {glyph.char}
                </Typography>
              </YStack>
              <Typography fontSize="$2" color={state.isCurrent ? '$color' : '$colorSecondary'}>
                {date ? format(date, 'd') : ''}
              </Typography>
            </YStack>
          )
        })}
      </XStack>
      {months.length > 0 && !monthly && (
        <XStack justifyContent="space-between">
          {months.slice(0, 2).map((m) => (
            <Typography key={m} variant="label" fontSize={10} letterSpacing={1.5} tone="muted">
              {m.toUpperCase()}
            </Typography>
          ))}
        </XStack>
      )}
    </YStack>
  )
}
