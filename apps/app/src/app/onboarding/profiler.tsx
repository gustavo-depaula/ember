import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PillSelector } from '@/components/PillSelector'
import {
  completeOnboarding,
  type FormationStage,
  nextRoute,
  OnboardingScaffold,
  type PrayerStage,
  stepProgress,
  type TimeAvailable,
  useOnboardingState,
} from '@/features/onboarding'

export default function OnboardingProfilerScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time, setAnswers } = useOnboardingState()

  const prayerOptions: { value: PrayerStage; label: string }[] = [
    { value: 'new', label: t('onboarding.profiler.prayer.new') },
    { value: 'some', label: t('onboarding.profiler.prayer.some') },
    { value: 'experienced', label: t('onboarding.profiler.prayer.experienced') },
  ]
  const formationOptions: { value: FormationStage; label: string }[] = [
    { value: 'new', label: t('onboarding.profiler.formation.new') },
    { value: 'some', label: t('onboarding.profiler.formation.some') },
    { value: 'formed', label: t('onboarding.profiler.formation.formed') },
  ]
  const timeOptions: { value: TimeAvailable; label: string }[] = [
    { value: 'short', label: t('onboarding.profiler.time.short') },
    { value: 'medium', label: t('onboarding.profiler.time.medium') },
    { value: 'long', label: t('onboarding.profiler.time.long') },
  ]

  return (
    <OnboardingScaffold
      title={t('onboarding.profiler.title')}
      subtitle={t('onboarding.profiler.subtitle')}
      progress={stepProgress('profiler')}
      onContinue={() => router.push(nextRoute('profiler'))}
      onSkip={completeOnboarding}
    >
      <YStack gap="$lg">
        <PillSelector
          label={t('onboarding.profiler.prayer.question')}
          options={prayerOptions}
          value={prayerStage ?? ('' as PrayerStage)}
          onChange={(v) => setAnswers({ prayerStage: v })}
        />
        <PillSelector
          label={t('onboarding.profiler.formation.question')}
          options={formationOptions}
          value={formationStage ?? ('' as FormationStage)}
          onChange={(v) => setAnswers({ formationStage: v })}
        />
        <PillSelector
          label={t('onboarding.profiler.time.question')}
          options={timeOptions}
          value={time ?? ('' as TimeAvailable)}
          onChange={(v) => setAnswers({ time: v })}
        />
      </YStack>
    </OnboardingScaffold>
  )
}
