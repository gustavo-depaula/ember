import { useMutation, useQuery } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable, confirm, Slab, Typography } from '@/components'
import type { SlotState } from '@/db/events'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { getSlotPinLabel } from '../getPracticeName'
import { autoPinForPlan, useSlots } from '../hooks'
import { keptHours, type Office, officeHours, offices, setOfficeHours } from '../offices'
import { HourToggle } from './HourToggle'

/** The Offices the plan keeps, each as "book: its hours". */
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
 * The Divine Office as a page, from onboarding and from the plan sheet alike:
 * which book, then which of its hours join the plan — every hour proposed for
 * a book not yet kept, the kept hours otherwise. Each book remembers its own
 * choice while another is looked at.
 */
export function OfficeChooser({
  title,
  onBack,
  onSaved,
  children,
}: {
  title: string
  onBack: () => void
  onSaved: () => void
  /** Below the button: onboarding's word on adding any other prayer. */
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const slots = useSlots()
  // The plan as the page opened: saving changes it, and the choices shouldn't jump under the finger.
  const [proposed] = useState(() =>
    Object.fromEntries(
      offices.map((o) => {
        const kept = keptHours(slots, o.practiceId)
        return [o.key, { kept: kept.length > 0, hours: kept.length ? kept : undefined }]
      }),
    ),
  )
  const [office, setOffice] = useState<Office>(
    () => offices.find((o) => proposed[o.key].kept) ?? offices[0],
  )
  // A book not yet kept, and not yet touched, proposes all its hours: they come with its flow.
  const [chosen, setChosen] = useState<Record<string, readonly string[] | undefined>>(() =>
    Object.fromEntries(offices.map((o) => [o.key, proposed[o.key].hours])),
  )
  const hours = useQuery({
    queryKey: ['office-hours', office.practiceId],
    queryFn: () => officeHours(office.practiceId),
  })
  const kept = chosen[office.key] ?? (hours.data ?? []).map((h) => h.id)
  const save = useMutation({
    mutationFn: () => setOfficeHours(office.practiceId, kept),
    onSuccess: () => {
      autoPinForPlan(office.practiceId)
      onSaved()
    },
    onError: (e) =>
      confirm({
        title: t('error.somethingWrong'),
        description: e instanceof Error ? e.message : String(e),
        singleAction: true,
      }),
  })
  const toggle = (id: string) =>
    setChosen((prev) => ({
      ...prev,
      [office.key]: kept.includes(id) ? kept.filter((h) => h !== id) : [...kept, id],
    }))

  return (
    <YStack paddingVertical="$lg" gap="$lg">
      <PracticeHeader onBack={onBack} name={title} caption={t('plan.office')} />

      <YStack>
        {offices.map((o) => {
          const selected = o.key === office.key
          const name = t(`plan.offices.${o.key}`)
          return (
            <AnimatedPressable
              key={o.key}
              testID={`office-book-${o.key}`}
              onPress={() => {
                lightTap()
                setOffice(o)
              }}
              accessibilityRole="radio"
              accessibilityLabel={t('a11y.chooseOfficeBook', { name })}
              accessibilityState={{ selected }}
            >
              <YStack paddingVertical="$sm" minHeight={52} justifyContent="center">
                <Typography fontSize={20} lineHeight={25} tone={selected ? undefined : 'muted'}>
                  {name}
                </Typography>
                <YStack
                  height={2}
                  width={selected ? 36 : 0}
                  backgroundColor="$accent"
                  marginVertical={3}
                />
                <Typography variant="caption">{t(`plan.offices.${o.key}About`)}</Typography>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </YStack>

      <YStack gap="$xs">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('plan.officeHours')}
        </Typography>
        <Typography variant="caption">{t('plan.officeHoursLede')}</Typography>
      </YStack>
      <YStack>
        {(hours.data ?? []).map((h, i, all) => (
          <HourToggle
            key={h.id}
            index={i}
            count={all.length}
            testID={`office-hour-${h.id}`}
            label={localizeContent(h.label)}
            time={h.time}
            on={kept.includes(h.id)}
            onToggle={() => toggle(h.id)}
          />
        ))}
      </YStack>

      <Slab
        testID="office-save"
        label={
          proposed[office.key].kept
            ? t('plan.officeSave')
            : t('plan.officeAdd', { count: kept.length })
        }
        busy={save.isPending}
        disabled={kept.length === 0}
        onPress={() => save.mutate()}
      />
      {children}
    </YStack>
  )
}
