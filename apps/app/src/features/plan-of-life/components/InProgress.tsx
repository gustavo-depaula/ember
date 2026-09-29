import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { getSlotName } from '../getPracticeName'
import { useProgramProgress } from '../hooks'

// Past this many days a program reads as one bar rather than a bead per day.
const maxSegments = 12

/** The novenas and other programs under way — time-bound, apart from the rule. */
export function InProgress({ slots }: { slots: SlotState[] }) {
  const { t } = useTranslation()
  // One card per program, however many times it holds.
  const programs = [...new Map(slots.map((s) => [s.practice_id, s])).values()]
  if (programs.length === 0) return undefined

  return (
    <YStack gap="$md">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('plan.inProgress')}
      </Typography>
      {programs.map((slot) => (
        <ProgramCard key={slot.practice_id} slot={slot} />
      ))}
    </YStack>
  )
}

function ProgramCard({ slot }: { slot: SlotState }) {
  const { t } = useTranslation()
  const router = useRouter()
  const program = getManifest(slot.practice_id)?.program
  const progress = useProgramProgress(slot.practice_id, program)
  const name = getSlotName(slot, t)
  if (!progress) return undefined
  const total = progress.totalDays
  const done = Math.min(progress.completionCount, total)
  // The day to pray next, as the program's own page names it; the bars hold the days prayed.
  const day = progress.isComplete
    ? t('program.complete')
    : t('program.dayOf', { day: progress.programDay + 1, total })

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
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md" gap="$sm">
        <XStack alignItems="baseline" justifyContent="space-between" gap="$md">
          <Typography flex={1} fontSize="$3" numberOfLines={1}>
            {name}
          </Typography>
          <Typography variant="label" fontSize="$1" color="$accent" letterSpacing={1}>
            {day}
          </Typography>
        </XStack>
        {total <= maxSegments ? (
          <XStack gap={4}>
            {Array.from({ length: total }, (_, i) => (
              <YStack
                // biome-ignore lint/suspicious/noArrayIndexKey: the days are positional
                key={i}
                flex={1}
                height={3}
                borderRadius={2}
                backgroundColor={i < done ? '$accent' : '$accentSubtle'}
                opacity={i < done ? 1 : 0.4}
              />
            ))}
          </XStack>
        ) : (
          <YStack height={3} borderRadius={2} overflow="hidden">
            <YStack position="absolute" inset={0} backgroundColor="$accentSubtle" opacity={0.4} />
            <YStack
              height={3}
              borderRadius={2}
              width={`${(done / total) * 100}%`}
              backgroundColor="$accent"
            />
          </YStack>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
