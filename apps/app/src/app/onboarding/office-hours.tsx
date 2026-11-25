import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, Slab, Typography } from '@/components'
import { HourToggle, OtherPrayerLine, offices, useOfficeHours } from '@/features/onboarding'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { localizeContent } from '@/lib/i18n'

type Office = (typeof offices)[number]

/** For one who prays the Office: which book, then which of its hours make the plan. */
export default function OnboardingOfficeHours() {
  const { t } = useTranslation()
  const router = useRouter()
  const [office, setOffice] = useState<Office>(offices[0])
  const [chosen, setChosen] = useState<Record<string, readonly string[]>>(() =>
    Object.fromEntries(offices.map((o) => [o.key, o.hours])),
  )
  const kept = chosen[office.key]
  const { hours, add } = useOfficeHours(office.practiceId)

  const toggle = (id: string) =>
    setChosen((prev) => ({
      ...prev,
      [office.key]: kept.includes(id) ? kept.filter((h) => h !== id) : [...kept, id],
    }))

  return (
    <ScreenLayout modal>
      <YStack paddingVertical="$lg" gap="$lg">
        <PracticeHeader
          onBack={() => router.back()}
          name={t('onboarding.office.which')}
          caption={t('onboarding.office.kicker')}
        />

        <YStack>
          {offices.map((o) => {
            const selected = o.key === office.key
            const name = t(`onboarding.office.forms.${o.key}`)
            return (
              <AnimatedPressable
                key={o.key}
                testID={`onboarding-office-form-${o.key}`}
                onPress={() => setOffice(o)}
                accessibilityRole="radio"
                accessibilityLabel={name}
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
                  <Typography variant="caption">
                    {t(`onboarding.office.forms.${o.key}Hint`)}
                  </Typography>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </YStack>

        <YStack gap="$xs">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('onboarding.office.hours')}
          </Typography>
          <Typography variant="caption">{t('onboarding.office.hoursLede')}</Typography>
        </YStack>
        <YStack>
          {hours.map((h) => (
            <HourToggle
              key={h.id}
              testID={`onboarding-hour-${h.id}`}
              label={localizeContent(h.label)}
              time={h.time}
              on={kept.includes(h.id)}
              onToggle={() => toggle(h.id)}
            />
          ))}
        </YStack>

        <Slab
          testID="onboarding-adopt-hours"
          label={t('onboarding.office.adoptHours')}
          busy={add.isPending}
          disabled={kept.length === 0}
          onPress={() => add.mutate(kept)}
        />
        <OtherPrayerLine />
      </YStack>
    </ScreenLayout>
  )
}
