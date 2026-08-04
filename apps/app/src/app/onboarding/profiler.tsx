import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import {
  ArtQuestionDeck,
  completeOnboarding,
  type DeckQuestion,
  type FormationStage,
  nextRoute,
  type PrayerStage,
  type TimeAvailable,
  useOnboardingState,
} from '@/features/onboarding'

export default function OnboardingProfilerScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time, setAnswers } = useOnboardingState()

  // One painting per question — a soul at prayer, the teaching doctor, the
  // day's own light.
  const questions: DeckQuestion<PrayerStage | FormationStage | TimeAvailable>[] = [
    {
      artId: 'collection/carmelite',
      marker: t('onboarding.profiler.marker'),
      question: t('onboarding.profiler.prayer.question'),
      value: prayerStage,
      onAnswer: (v) => setAnswers({ prayerStage: v as PrayerStage }),
      answers: [
        { value: 'new', label: t('onboarding.profiler.prayer.new') },
        { value: 'some', label: t('onboarding.profiler.prayer.some') },
        { value: 'experienced', label: t('onboarding.profiler.prayer.experienced') },
      ],
    },
    {
      artId: 'collection/thomas-aquinas',
      marker: t('onboarding.profiler.marker'),
      question: t('onboarding.profiler.formation.question'),
      value: formationStage,
      onAnswer: (v) => setAnswers({ formationStage: v as FormationStage }),
      answers: [
        { value: 'new', label: t('onboarding.profiler.formation.new') },
        { value: 'some', label: t('onboarding.profiler.formation.some') },
        { value: 'formed', label: t('onboarding.profiler.formation.formed') },
      ],
    },
    {
      artId: 'collection/dies-sunday',
      marker: t('onboarding.profiler.marker'),
      question: t('onboarding.profiler.time.question'),
      value: time,
      onAnswer: (v) => setAnswers({ time: v as TimeAvailable }),
      answers: [
        { value: 'short', label: t('onboarding.profiler.time.short') },
        { value: 'medium', label: t('onboarding.profiler.time.medium') },
        { value: 'long', label: t('onboarding.profiler.time.long') },
      ],
    },
  ]

  return (
    <ArtQuestionDeck
      questions={questions}
      onDone={() => router.push(nextRoute('profiler'))}
      onSkip={completeOnboarding}
    />
  )
}
