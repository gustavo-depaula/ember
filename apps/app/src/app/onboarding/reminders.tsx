import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Bell, BellOff } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, Slab, Typography } from '@/components'
import type { SlotState } from '@/db/events'
import { weekdayName } from '@/features/mass-times/format'
import {
  confirmReminders,
  movableDay,
  onWeekday,
  reminderGroups,
  reportFailure,
  TextLink,
} from '@/features/onboarding'
import { useSlots, useUpdateSlot } from '@/features/plan-of-life'
import { TimeWheel } from '@/features/plan-of-life/components/RuleSheets'
import { nextHalfHour } from '@/features/plan-of-life/defaultSlot'
import { enrichSlot } from '@/features/plan-of-life/getPracticeName'
import { phrasing } from '@/features/plan-of-life/phrasing'
import { formatSlotTime } from '@/features/plan-of-life/ruleString'
import { parseSchedule } from '@/features/plan-of-life/schedule'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { lightTap } from '@/lib/haptics'
import { track } from '@/lib/usage'

/**
 * Every prayer of the new plan with a reminder at its hour: one line each, the
 * hour and (for a weekly or monthly one) the day editable in place, a bell to
 * silence it. One button turns them on and asks the device's leave.
 */
export default function OnboardingReminders() {
  const { t } = useTranslation()
  const router = useRouter()
  const slots = useSlots()
  const [muted, setMuted] = useState<ReadonlySet<string>>(new Set())
  const [denied, setDenied] = useState(false)
  const { parts, weekly } = reminderGroups(slots)

  const next = (reminders: 'on' | 'off' | 'denied') => {
    track('onboarding_reminders', { reminders })
    router.push('/onboarding/pray')
  }
  const confirm = useMutation({
    mutationFn: () => confirmReminders(slots, muted),
    onSuccess: (granted) => (granted ? next('on') : setDenied(true)),
    onError: reportFailure,
  })
  const toggle = (id: string) =>
    setMuted((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(id)) nextSet.delete(id)
      else nextSet.add(id)
      return nextSet
    })

  return (
    <ScreenLayout modal>
      <YStack paddingVertical="$lg" gap="$md">
        <PracticeHeader onBack={() => router.back()} name={t('onboarding.reminders.title')} />
        <Typography variant="caption" textAlign="center">
          {t('onboarding.reminders.lede')}
        </Typography>

        <YStack paddingTop="$sm">
          {parts.map(({ part, slots: inPart }) => (
            <YStack
              key={part}
              borderBottomWidth={0.5}
              borderColor="$borderColor"
              paddingVertical={3}
            >
              {inPart.map((slot, i) => (
                <ReminderRow
                  key={slot.id}
                  slot={slot}
                  part={i === 0 ? t(`dayPart.${part}`) : ''}
                  on={!muted.has(slot.id)}
                  onBell={() => toggle(slot.id)}
                />
              ))}
            </YStack>
          ))}
        </YStack>

        {weekly.length > 0 ? (
          <YStack gap="$xs" paddingTop="$md">
            <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
              {t('onboarding.reminders.weekly')}
            </Typography>
            {weekly.map((slot) => (
              <ReminderRow
                key={slot.id}
                slot={slot}
                on={!muted.has(slot.id)}
                onBell={() => toggle(slot.id)}
              />
            ))}
          </YStack>
        ) : null}

        {denied ? (
          <Typography
            variant="caption"
            color="$colorBurgundy"
            paddingTop="$md"
            testID="onboarding-denied"
          >
            {t('onboarding.reminders.denied')}
          </Typography>
        ) : null}

        <YStack gap="$sm" paddingTop="$lg">
          <Slab
            testID="onboarding-reminders-confirm"
            label={denied ? t('onboarding.continue') : t('onboarding.reminders.confirm')}
            busy={confirm.isPending}
            onPress={() => (denied ? next('denied') : confirm.mutate())}
          />
          {denied ? null : (
            <TextLink
              testID="onboarding-reminders-none"
              label={t('onboarding.reminders.none')}
              onPress={() => next('off')}
            />
          )}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

/**
 * One prayer: its part of the day (named on the first of the part; a weekly or
 * monthly prayer has none), name, day, hour and bell.
 */
function ReminderRow({
  slot,
  part,
  on,
  onBell,
}: {
  slot: SlotState
  part?: string
  on: boolean
  onBell: () => void
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const update = useUpdateSlot()
  const [turning, setTurning] = useState(false)
  const [picking, setPicking] = useState(false)
  const name = enrichSlot(slot, t).name
  const schedule = parseSchedule(slot.schedule)
  const weekly = part === undefined
  const day = movableDay(slot, schedule)
  const time = slot.time ?? ''
  const words = phrasing(i18n.language)
  const BellIcon = on ? Bell : BellOff

  return (
    <YStack testID={`reminder-row-${slot.practice_id}`}>
      <XStack alignItems="center" gap="$sm" minHeight={48}>
        {weekly ? null : (
          <Typography
            variant="label"
            tone="muted"
            fontSize={10.5}
            letterSpacing={1.4}
            width={78}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {part.toUpperCase()}
          </Typography>
        )}
        <Typography flex={1} fontSize={17.5} lineHeight={22} tone={on ? undefined : 'muted'}>
          {name}
        </Typography>
        {weekly && day === undefined ? (
          <Typography tone="muted" fontSize={15}>
            {words.days(schedule)}
          </Typography>
        ) : null}
        {weekly && day !== undefined ? (
          <InlineEdit
            testID={`reminder-day-${slot.practice_id}`}
            label={words.days(schedule)}
            a11y={t('a11y.reminderDay', { name, day: words.days(schedule) })}
            open={picking}
            onPress={() => setPicking((x) => !x)}
          />
        ) : null}
        <InlineEdit
          testID={`reminder-time-${slot.practice_id}`}
          label={formatSlotTime(time, i18n.language)}
          a11y={t('a11y.reminderTime', { name, time: formatSlotTime(time, i18n.language) })}
          open={turning}
          onPress={() => setTurning((x) => !x)}
        />
        <AnimatedPressable
          testID={`reminder-bell-${slot.practice_id}`}
          onPress={() => {
            lightTap()
            onBell()
          }}
          accessibilityRole="switch"
          accessibilityLabel={t('a11y.reminderBell', { name })}
          accessibilityState={{ checked: on }}
          hitSlop={6}
        >
          <YStack width={40} height={44} alignItems="center" justifyContent="center">
            <BellIcon
              size={22}
              strokeWidth={1.5}
              color={on ? theme.accent.val : theme.colorSecondary.val}
            />
          </YStack>
        </AnimatedPressable>
      </XStack>

      {picking && day !== undefined ? (
        <XStack justifyContent="space-between" paddingBottom="$sm">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <AnimatedPressable
              key={d}
              testID={`reminder-weekday-${d}`}
              onPress={() => {
                lightTap()
                update.mutate({
                  id: slot.id,
                  data: { schedule: JSON.stringify(onWeekday(schedule, d)) },
                })
                setPicking(false)
              }}
              accessibilityRole="radio"
              accessibilityLabel={weekdayName(d, i18n.language)}
              accessibilityState={{ selected: d === day }}
            >
              <YStack minWidth={40} minHeight={44} alignItems="center" justifyContent="center">
                <Typography fontSize={15} color={d === day ? '$accent' : '$colorSecondary'}>
                  {weekdayName(d, i18n.language, 'short')}
                </Typography>
              </YStack>
            </AnimatedPressable>
          ))}
        </XStack>
      ) : null}

      {turning ? (
        <TimeWheel
          value={time || nextHalfHour()}
          onChange={(next) => update.mutate({ id: slot.id, data: { time: next } })}
          onDone={() => setTurning(false)}
        />
      ) : null}
    </YStack>
  )
}

/** A value changed in place, underlined in gold dots: a day, an hour. */
function InlineEdit({
  testID,
  label,
  a11y,
  open,
  onPress,
}: {
  testID: string
  label: string
  a11y: string
  open: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        lightTap()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ expanded: open }}
      hitSlop={8}
    >
      <Typography
        fontSize={16}
        color="$accentHover"
        textDecorationLine="underline"
        textDecorationStyle="dotted"
      >
        {label}
      </Typography>
    </AnimatedPressable>
  )
}
