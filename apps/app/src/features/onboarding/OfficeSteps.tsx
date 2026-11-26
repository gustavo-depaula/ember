import { useMutation, useQuery } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Slab, Typography } from '@/components'
import { artFor } from '@/features/explore/artMap'
import { HourToggle } from '@/features/plan-of-life/components/HourToggle'
import { autoPinForPlan } from '@/features/plan-of-life/hooks'
import { officeHours, offices, setOfficeHours } from '@/features/plan-of-life/offices'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { localizeContent } from '@/lib/i18n'

import { reportFailure } from './failure'
import { ChoiceRow } from './parts'

/**
 * Whether the Office is already prayed: the regular keep their own book and
 * hours, the new start with one hour. Asked in onboarding and by an empty plan.
 */
export function OfficeAsk({
  onBack,
  onRegular,
  onNew,
}: {
  onBack: () => void
  onRegular: () => void
  onNew: () => void
}) {
  const { t } = useTranslation()
  return (
    <YStack paddingVertical="$lg" gap="$lg">
      <PracticeHeader
        onBack={onBack}
        name={t('onboarding.office.ask')}
        caption={t('onboarding.office.kicker')}
      />
      <YStack>
        <ChoiceRow
          testID="onboarding-office-regular"
          first
          title={t('onboarding.office.regular')}
          hint={t('onboarding.office.regularHint')}
          image={artFor('practice/patristic-reading')}
          onPress={onRegular}
        />
        <ChoiceRow
          testID="onboarding-office-new"
          title={t('onboarding.office.new')}
          hint={t('onboarding.office.newHint')}
          image={artFor('practice/opus-dei-meditation')}
          onPress={onNew}
        />
      </YStack>
    </YStack>
  )
}

// A newcomer begins with one of the Liturgy's three proposed hours: Lauds,
// Vespers or Compline, which as the shortest is offered first.
const liturgy = offices[0]

/** For one new to the Office: what it is, and one hour to begin with. */
export function OfficeFirst({
  onBack,
  onAdded,
  children,
}: {
  onBack: () => void
  onAdded: () => void
  /** Below the button: onboarding's word on adding any other prayer. */
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const [first, setFirst] = useState('compline')
  const hours = useQuery({
    queryKey: ['office-hours', liturgy.practiceId],
    queryFn: () => officeHours(liturgy.practiceId),
  })
  const add = useMutation({
    mutationFn: () => setOfficeHours(liturgy.practiceId, [first]),
    onSuccess: () => {
      autoPinForPlan(liturgy.practiceId)
      onAdded()
    },
    onError: reportFailure,
  })
  const offered = (hours.data ?? []).filter((h) =>
    (liturgy.hours as readonly string[]).includes(h.id),
  )
  const chosen = offered.find((h) => h.id === first)

  return (
    <YStack paddingVertical="$lg" gap="$lg">
      <PracticeHeader
        onBack={onBack}
        name={t('onboarding.office.introTitle')}
        caption={t('onboarding.office.kicker')}
      />
      <Typography fontSize={18} lineHeight={27}>
        {t('onboarding.office.introText')}
      </Typography>
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('onboarding.office.firstHour')}
      </Typography>
      <YStack>
        {offered.map((h, i, all) => (
          <HourToggle
            key={h.id}
            index={i}
            count={all.length}
            testID={`onboarding-first-${h.id}`}
            label={localizeContent(h.label)}
            hint={t(`onboarding.office.${h.id as (typeof liturgy.hours)[number]}`)}
            time={h.time}
            on={h.id === first}
            onToggle={() => setFirst(h.id)}
          />
        ))}
      </YStack>
      <Slab
        testID="onboarding-adopt-first"
        label={t('onboarding.office.beginWith', {
          hour: chosen ? localizeContent(chosen.label) : '',
        })}
        busy={add.isPending}
        disabled={!chosen}
        onPress={() => add.mutate()}
      />
      {children}
    </YStack>
  )
}
