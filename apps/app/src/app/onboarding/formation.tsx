import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Card } from '@/components/Card'
import { Typography } from '@/components/typography'
import { createProgramCursor } from '@/db/repositories/cursors'
import { saveItem } from '@/db/repositories/savedItems'
import { blockInk, toneByIndex } from '@/features/explore/bgColor'
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

/** A spine — the jewel-tone ground and versal the app falls back to when a work has no painting. */
function Spine({ index, label }: { index: number; label: string }) {
  // Keyed on position, not the id: these ids are short and similar enough that
  // the id hash lands them all on the same tone.
  const tone = toneByIndex(index)
  return (
    <YStack
      width={56}
      height={78}
      borderRadius="$sm"
      overflow="hidden"
      backgroundColor={tone.from}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontFamily="$title" fontSize={40} lineHeight={46} color={blockInk} opacity={0.4}>
        {label.trim().charAt(0).toUpperCase() || '✠'}
      </Text>
    </YStack>
  )
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
      // A program with no cursor projects as invisible (`program.ts`), so an
      // enabled slot alone would never reach the day's plan. Same pairing the
      // practice detail screen's enrol does.
      await createProgramCursor(opt.practiceId)
    } else if (opt.kind === 'program-create') {
      await createPractice.mutateAsync({
        id: opt.practiceId,
        slot: { tier: 'ideal', time: '07:00', schedule: dailySchedule },
      })
      await createProgramCursor(opt.practiceId)
    } else if (opt.kind === 'book') {
      // Lightweight record — adds to the library without a full offline download.
      await saveItem(opt.bookId, 'book')
    }
    // ccc: nothing to enroll — the Catechism reader is always available.
  }

  async function onContinue() {
    if (busy) return
    const opt = formationOptions.find((o) => o.id === selected)
    // A failed enrolment must not strand the user mid-flow: the reading is a
    // suggestion, and everything here is reachable later from the library.
    if (opt) await enroll(opt).catch((err) => console.warn('[onboarding] enroll failed:', err))
    router.push(nextRoute('formation'))
  }

  return (
    <OnboardingScaffold
      marker={t('onboarding.formation.marker')}
      title={t('onboarding.formation.title')}
      subtitle={t('onboarding.formation.subtitle')}
      progress={stepProgress('formation')}
      onContinue={onContinue}
      continueDisabled={busy}
      onSkip={completeOnboarding}
    >
      <YStack gap="$md">
        {formationOptions.map((opt, index) => {
          const isSelected = opt.id === selected
          const name = t(`onboarding.formation.options.${opt.id}.name`)
          return (
            <AnimatedPressable
              key={opt.id}
              onPress={() => {
                selectionTick()
                setSelected(opt.id)
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={name}
            >
              <Card ornate={isSelected}>
                <XStack gap="$md" alignItems="center">
                  <Spine index={index} label={name} />
                  <YStack flex={1} gap="$xs">
                    <Typography
                      variant="label"
                      fontSize="$3"
                      color={isSelected ? '$accent' : undefined}
                    >
                      {name}
                    </Typography>
                    <Typography variant="whisper" fontSize="$1">
                      {t(`onboarding.formation.options.${opt.id}.desc`)}
                    </Typography>
                    <XStack gap="$sm" alignItems="center" paddingTop={2}>
                      <Typography
                        variant="reference"
                        textTransform="uppercase"
                        letterSpacing={1.2}
                        color={isSelected ? '$accent' : undefined}
                      >
                        {t(tagKey(opt))}
                      </Typography>
                      {opt.id === recommended ? (
                        <Typography variant="reference" color="$accent">
                          · {t('onboarding.formation.recommended')}
                        </Typography>
                      ) : null}
                    </XStack>
                  </YStack>
                </XStack>
              </Card>
            </AnimatedPressable>
          )
        })}
      </YStack>
    </OnboardingScaffold>
  )
}
