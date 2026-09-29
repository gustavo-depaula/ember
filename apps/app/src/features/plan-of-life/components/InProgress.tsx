import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { getSlotName } from '../getPracticeName'
import { useProgramProgress, useProgramsUnderWay } from '../hooks'
import { computeAllDayStates } from '../program'

// Past this many days the marks would run off the line; the day count says it alone.
const maxMarks = 12

/** The novenas and other programs under way — time-bound, apart from the rule. */
export function InProgress({ slots }: { slots: SlotState[] }) {
  const { t } = useTranslation()
  // One line per program, however many times it holds.
  const programs = useProgramsUnderWay([...new Map(slots.map((s) => [s.practice_id, s])).values()])
  if (programs.length === 0) return undefined

  return (
    <YStack gap="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('plan.inProgress')}
      </Typography>
      <YStack>
        {programs.map((slot) => (
          <ProgramLine key={slot.practice_id} slot={slot} />
        ))}
      </YStack>
    </YStack>
  )
}

// A program as its own page draws it, in small: the name, the day to pray
// next, and its days in the page's marks — a star prayed, a ring missed, an
// open star today, a dot still to come.
function ProgramLine({ slot }: { slot: SlotState }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const program = getManifest(slot.practice_id)?.program
  const progress = useProgramProgress(slot.practice_id, program)
  const name = getSlotName(slot, t)
  if (!progress) return undefined
  const total = progress.totalDays
  const states = computeAllDayStates(progress)
  const day = (() => {
    if (progress.isComplete) return t('program.complete')
    if (progress.shouldPromptRestart) return t('program.restartNeeded')
    if (states.every((s) => s.isCompleted || s.isMissed)) return t('program.ended')
    return t('program.dayOf', { day: progress.programDay + 1, total })
  })()
  const marks = states.map((state) => {
    if (state.isCompleted) return { char: '✦', size: 11, color: theme.accent.val }
    if (state.isCurrent) return { char: '✧', size: 11, color: theme.colorSecondary.val }
    if (state.isMissed) return { char: '○', size: 7, color: theme.colorSecondary.val }
    return { char: '●', size: 3, color: theme.wallEmpty.val }
  })

  return (
    <AnimatedPressable
      onPress={() => {
        lightTap()
        router.push({
          pathname: '/practices/[manifestId]/program',
          params: { manifestId: slot.practice_id },
        })
      }}
      accessibilityRole="link"
      accessibilityLabel={`${name}, ${day}`}
    >
      <YStack paddingVertical="$md" gap={6} borderBottomWidth={0.5} borderColor="$borderColor">
        <XStack alignItems="baseline" gap="$md">
          <Typography flex={1} fontSize="$3" numberOfLines={1}>
            {name}
          </Typography>
          <Typography
            fontSize="$2"
            fontStyle="italic"
            color={progress.isComplete ? '$accent' : '$colorSecondary'}
          >
            {`${day.toLocaleLowerCase()} ›`}
          </Typography>
        </XStack>
        {total <= maxMarks ? (
          <XStack
            gap={10}
            height={16}
            alignItems="center"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {marks.map((m, i) => (
              <YStack
                // biome-ignore lint/suspicious/noArrayIndexKey: the days are positional
                key={i}
                width={12}
                alignItems="center"
              >
                <Typography fontSize={m.size} lineHeight={16} color={m.color}>
                  {m.char}
                </Typography>
              </YStack>
            ))}
          </XStack>
        ) : undefined}
      </YStack>
    </AnimatedPressable>
  )
}
