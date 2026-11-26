import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, Slab, Typography } from '@/components'
import type { SlotState } from '@/db/events'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { getSlotPinLabel } from '../getPracticeName'
import { autoPinForPlan } from '../hooks'
import { keptHours, type Office, officeHours, offices, setOfficeHours } from '../offices'
import { HourToggle } from './HourToggle'

/** The Offices the plan keeps, each as "book: its hours", for the Office's row on the sheet. */
export function keptOffices(slots: SlotState[], t: (key: string) => string) {
  return offices
    .map((o) => {
      const hours = slots
        .filter((s) => s.practice_id === o.practiceId)
        .map((s) => getSlotPinLabel(s))
        .filter(Boolean)
      return hours.length ? `${t(`plan.offices.${o.key}`)}: ${hours.join(' · ')}` : undefined
    })
    .filter(Boolean)
}

/**
 * The Divine Office, opened from its row on the plan sheet: which book, then
 * which of its hours join the string — Lauds, Vespers and Compline proposed
 * for a book not yet kept, the kept hours otherwise.
 */
export function OfficeStep({ slots, onDone }: { slots: SlotState[]; onDone: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const hoursOf = (o: Office) => {
    const kept = keptHours(slots, o.practiceId)
    return kept.length ? kept : o.hours
  }
  const [office, setOffice] = useState<Office>(
    () => offices.find((o) => keptHours(slots, o.practiceId).length) ?? offices[0],
  )
  const [chosen, setChosen] = useState<readonly string[]>(() => hoursOf(office))
  const already = keptHours(slots, office.practiceId).length > 0
  const hours = useQuery({
    queryKey: ['office-hours', office.practiceId],
    queryFn: () => officeHours(office.practiceId),
  })
  const save = useMutation({
    mutationFn: () => setOfficeHours(office.practiceId, chosen),
    onSuccess: () => {
      autoPinForPlan(office.practiceId)
      onDone()
    },
    onError: (e) =>
      confirm({
        title: t('error.somethingWrong'),
        description: e instanceof Error ? e.message : String(e),
        singleAction: true,
      }),
  })

  return (
    <YStack gap="$md">
      <XStack alignItems="center" gap="$xs">
        <AnimatedPressable
          testID="plan-office-back"
          onPress={onDone}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={26} strokeWidth={1.75} color={theme.accent.val} />
        </AnimatedPressable>
        <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
          {t('plan.office')}
        </Typography>
      </XStack>
      <YStack gap="$xs">
        <Typography variant="screen-title" fontSize="$5">
          {t('plan.officeTitle')}
        </Typography>
        <Typography variant="caption">{t('plan.officeHoursLede')}</Typography>
      </YStack>

      <YStack>
        <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
          {t('plan.officeBook')}
        </Typography>
        {offices.map((o) => {
          const on = o.key === office.key
          return (
            <AnimatedPressable
              key={o.key}
              testID={`plan-office-${o.key}`}
              onPress={() => {
                lightTap()
                setOffice(o)
                setChosen(hoursOf(o))
              }}
              accessibilityRole="radio"
              accessibilityLabel={t('a11y.chooseOfficeBook', { name: t(`plan.offices.${o.key}`) })}
              accessibilityState={{ selected: on }}
            >
              {/* Chosen typographically: ink and a gold rule under the name, the rest muted. */}
              <YStack paddingVertical="$sm" gap={3}>
                <YStack
                  alignSelf="flex-start"
                  borderBottomWidth={2}
                  borderColor={on ? '$accent' : 'transparent'}
                >
                  <Typography fontSize="$4" tone={on ? undefined : 'muted'}>
                    {t(`plan.offices.${o.key}`)}
                  </Typography>
                </YStack>
                <Typography variant="caption" fontStyle="italic">
                  {t(`plan.offices.${o.key}About`)}
                </Typography>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </YStack>

      <YStack>
        <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
          {t('plan.officeHours')}
        </Typography>
        {(hours.data ?? []).map((h) => {
          const on = chosen.includes(h.id)
          return (
            <HourToggle
              key={h.id}
              testID={`plan-hour-${h.id}`}
              label={localizeContent(h.label)}
              time={h.time}
              on={on}
              onToggle={() =>
                setChosen((prev) => (on ? prev.filter((id) => id !== h.id) : [...prev, h.id]))
              }
            />
          )
        })}
      </YStack>
      <Slab
        testID="plan-office-add"
        label={already ? t('plan.officeSave') : t('plan.officeAdd', { count: chosen.length })}
        busy={save.isPending}
        disabled={chosen.length === 0}
        onPress={() => save.mutate()}
      />
    </YStack>
  )
}
