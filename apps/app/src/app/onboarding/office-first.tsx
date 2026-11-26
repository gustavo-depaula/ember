import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { ScreenLayout, Slab, Typography } from '@/components'
import { OtherPrayerLine, useOfficeHours } from '@/features/onboarding'
import { HourToggle } from '@/features/plan-of-life/components/HourToggle'
import { type Office, offices } from '@/features/plan-of-life/offices'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { localizeContent } from '@/lib/i18n'

// A newcomer begins with one of the Liturgy's three proposed hours: Lauds,
// Vespers or Compline, which as the shortest is offered first.
const liturgy = offices[0]

/** For one new to the Office: what it is, and one hour to begin with. */
export default function OnboardingOfficeFirst() {
  const { t } = useTranslation()
  const router = useRouter()
  const [first, setFirst] = useState('compline')
  const { hours, add } = useOfficeHours(liturgy.practiceId)
  const offered = hours.filter((h) => (liturgy.hours as readonly string[]).includes(h.id))
  const chosen = offered.find((h) => h.id === first)

  return (
    <ScreenLayout modal>
      <YStack paddingVertical="$lg" gap="$lg">
        <PracticeHeader
          onBack={() => router.back()}
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
          {offered.map((h) => (
            <HourToggle
              key={h.id}
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
          onPress={() => add.mutate([first])}
        />
        <OtherPrayerLine />
      </YStack>
    </ScreenLayout>
  )
}
