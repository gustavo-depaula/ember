import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Card } from '@/components/Card'
import { Typography } from '@/components/typography'
import { saveItem } from '@/db/repositories/savedItems'
import {
  completeOnboarding,
  type FormationOption,
  formationOptions,
  nextRoute,
  OnboardingScaffold,
  recommendFormation,
  stepProgress,
  useOnboardingState,
} from '@/features/onboarding'
import { useCreatePractice, useEnableSlotsForPractice } from '@/features/plan-of-life'
import { selectionTick } from '@/lib/haptics'

const dailySchedule = JSON.stringify({ type: 'daily' })

function tagKey(opt: FormationOption): string {
  if (opt.kind === 'book') return 'onboarding.formation.tag.book'
  if (opt.kind === 'ccc') return 'onboarding.formation.tag.reader'
  return 'onboarding.formation.tag.program'
}

export default function OnboardingFormationScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time } = useOnboardingState()
  const enableSlots = useEnableSlotsForPractice()
  const createPractice = useCreatePractice()

  const recommended = recommendFormation({ prayerStage, formationStage, time })
  const [selected, setSelected] = useState(recommended)
  const busy = enableSlots.isPending || createPractice.isPending

  async function enroll(opt: FormationOption) {
    if (opt.kind === 'program-enroll') {
      await enableSlots.mutateAsync(opt.practiceId)
    } else if (opt.kind === 'program-create') {
      await createPractice.mutateAsync({
        id: opt.practiceId,
        slot: { tier: 'ideal', time: '07:00', schedule: dailySchedule },
      })
    } else if (opt.kind === 'book') {
      // Lightweight record — adds to the library without a full offline download.
      await saveItem(opt.bookId, 'book')
    }
    // ccc: nothing to enroll — the Catechism reader is always available.
  }

  async function onContinue() {
    if (busy) return
    const opt = formationOptions.find((o) => o.id === selected)
    if (opt) await enroll(opt)
    router.push(nextRoute('formation'))
  }

  return (
    <OnboardingScaffold
      title={t('onboarding.formation.title')}
      subtitle={t('onboarding.formation.subtitle')}
      progress={stepProgress('formation')}
      onContinue={onContinue}
      continueDisabled={busy}
      onSkip={completeOnboarding}
    >
      <YStack gap="$md">
        {formationOptions.map((opt) => {
          const isSelected = opt.id === selected
          return (
            <AnimatedPressable
              key={opt.id}
              onPress={() => {
                selectionTick()
                setSelected(opt.id)
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={t(`onboarding.formation.options.${opt.id}.name`)}
            >
              <Card ornate={isSelected}>
                <YStack gap="$xs">
                  <XStack justifyContent="space-between" alignItems="center" gap="$sm">
                    <Typography
                      variant="label"
                      fontSize="$3"
                      color={isSelected ? '$accent' : undefined}
                      flex={1}
                    >
                      {t(`onboarding.formation.options.${opt.id}.name`)}
                    </Typography>
                    <Typography variant="reference" tone="muted">
                      {t(tagKey(opt))}
                    </Typography>
                  </XStack>
                  <Typography variant="whisper">
                    {t(`onboarding.formation.options.${opt.id}.desc`)}
                  </Typography>
                  {opt.id === recommended ? (
                    <Typography variant="reference" color="$accent">
                      {t('onboarding.formation.recommended')}
                    </Typography>
                  ) : null}
                </YStack>
              </Card>
            </AnimatedPressable>
          )
        })}
      </YStack>
    </OnboardingScaffold>
  )
}
