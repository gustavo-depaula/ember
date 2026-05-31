import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { dayKeys } from '@/config/constants'
import type { SlotState } from '@/db/events'
import type { Tier } from '@/db/schema'
import { lightTap } from '@/lib/haptics'

import { parseSchedule, type Schedule } from '../schedule'
import { TierSelector } from './TierSelector'
import { TimeInput } from './TimeInput'

// The compact, edit-in-place editor that opens under a tapped slot branch.
// Shows only the everyday knobs — time, tier, and a daily/days-of-week cadence
// quick-pick. The full SchedulePicker (times-per, nth-weekday, holy days,
// notifications, delete, program tracks) lives on the deep /plan/[practiceId]
// page, reached by tapping the practice header.
export function SlotQuickEdit({
  slot,
  onUpdate,
}: {
  slot: SlotState
  onUpdate: (data: Record<string, unknown>) => void
}) {
  const { t } = useTranslation()

  const [tier, setTier] = useState<Tier>(slot.tier)
  const schedule = parseSchedule(slot.schedule)

  return (
    <YStack gap="$lg" paddingTop="$md" paddingLeft="$md">
      <YStack gap="$sm">
        <Typography variant="label" tone="muted">
          {t('editor.timeOfDay')}
        </Typography>
        <TimeInput value={slot.time} onChange={(time) => onUpdate({ time })} />
      </YStack>

      <YStack gap="$sm">
        <Typography variant="label" tone="muted">
          {t('editor.tier')}
        </Typography>
        <TierSelector
          value={tier}
          onChange={(next) => {
            setTier(next)
            onUpdate({ tier: next })
          }}
        />
      </YStack>

      <YStack gap="$sm">
        <Typography variant="label" tone="muted">
          {t('plan.cadence')}
        </Typography>
        <CadenceQuickPick
          schedule={schedule}
          onChange={(s) => onUpdate({ schedule: JSON.stringify(s) })}
        />
      </YStack>
    </YStack>
  )
}

// A two-mode cadence subset: daily or specific days-of-week. Anything richer
// (times-per, nth-weekday, holy days, seasons) is preserved untouched when the
// slot already carries it — we show its label and route the user to the deep
// page rather than clobbering it.
function CadenceQuickPick({
  schedule,
  onChange,
}: {
  schedule: Schedule
  onChange: (s: Schedule) => void
}) {
  const { t } = useTranslation()
  const seasons = schedule.seasons
  const seasonBase = seasons?.length ? { seasons } : {}

  const isDaily = schedule.type === 'daily' || schedule.type === 'fixed-program'
  const isWeekly = schedule.type === 'days-of-week'
  const isAdvanced = !isDaily && !isWeekly

  if (isAdvanced) {
    return (
      <Typography tone="muted" fontSize="$2" fontStyle="italic">
        {advancedLabel(schedule, t)}
      </Typography>
    )
  }

  return (
    <YStack gap="$sm">
      <XStack gap="$xs">
        {(
          [
            { value: 'daily', label: t('frequency.daily'), selected: isDaily },
            { value: 'days-of-week', label: t('frequency.weekly'), selected: isWeekly },
          ] as const
        ).map((m) => (
          <Pressable
            key={m.value}
            onPress={() => {
              lightTap()
              if (m.value === 'daily') onChange({ type: 'daily', ...seasonBase })
              else onChange({ type: 'days-of-week', days: [0], ...seasonBase })
            }}
            accessibilityRole="radio"
            accessibilityLabel={m.label}
            accessibilityState={{ selected: m.selected }}
          >
            <YStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$md"
              borderWidth={1}
              borderColor={m.selected ? '$accent' : '$borderColor'}
              backgroundColor={m.selected ? '$accent' : 'transparent'}
            >
              <Typography fontSize="$2" color={m.selected ? 'white' : '$color'}>
                {m.label}
              </Typography>
            </YStack>
          </Pressable>
        ))}
      </XStack>

      {isWeekly && schedule.type === 'days-of-week' && (
        <XStack gap="$xs" flexWrap="wrap">
          {dayKeys.map((key, i) => {
            const selected = schedule.days.includes(i)
            const label = t(`day.${key}`)
            return (
              <Pressable
                key={key}
                onPress={() => {
                  lightTap()
                  const next = selected
                    ? schedule.days.filter((d) => d !== i)
                    : [...schedule.days, i]
                  if (next.length > 0) onChange({ ...schedule, days: next })
                }}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
              >
                <YStack
                  width={40}
                  height={36}
                  borderRadius="$sm"
                  borderWidth={1}
                  borderColor={selected ? '$accent' : '$borderColor'}
                  backgroundColor={selected ? '$accent' : 'transparent'}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography fontSize="$1" color={selected ? 'white' : '$colorSecondary'}>
                    {label}
                  </Typography>
                </YStack>
              </Pressable>
            )
          })}
        </XStack>
      )}
    </YStack>
  )
}

function advancedLabel(schedule: Schedule, t: TFunction): string {
  switch (schedule.type) {
    case 'times-per':
      return t('frequency.timesPer', { count: schedule.count })
    case 'day-of-month':
      return t('frequency.monthly')
    case 'nth-weekday':
      return t('frequency.nthWeekday')
    case 'holy-days-of-obligation':
      return t('frequency.holyDays')
    default:
      return t('frequency.label')
  }
}
