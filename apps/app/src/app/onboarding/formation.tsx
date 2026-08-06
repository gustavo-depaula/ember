import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'
import { createProgramCursor } from '@/db/repositories/cursors'
import { saveItem } from '@/db/repositories/savedItems'
import {
  type ArtChoice,
  ArtChoiceCard,
  ArtChoiceFeatureCard,
} from '@/features/explore/ArtChoiceCard'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import {
  type FormationOption,
  type FormationOptionId,
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

/**
 * A reading offered exactly as a tradition is. A catechism has no painting of
 * its own, so each is shown under the doctor or catechist it belongs to, using
 * the corpus's own illuminated saint cards.
 */
function useReadingChoice(id: FormationOptionId): ArtChoice {
  const { t } = useTranslation()
  return {
    title: t(`onboarding.formation.options.${id}.name`),
    description: t(`onboarding.formation.options.${id}.desc`),
    image: artFor(`reading/${id}`),
    tone: toneByIndex(toneIndexForId(id)),
    fit: 'cover',
  }
}

export default function OnboardingFormationScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time } = useOnboardingState()
  const enableSlots = useEnableSlotsForPractice()
  const createPractice = useCreatePractice()

  const recommended = recommendFormation({ prayerStage, formationStage, time })
  const busy = enableSlots.isPending || createPractice.isPending

  const featured = formationOptions.find((o) => o.id === recommended)
  const others = formationOptions.filter((o) => o.id !== recommended)

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

  // Choosing a reading *is* the commit — the same as choosing a tradition on the
  // step before. A confirm button after a single choice only asks the user to say
  // the same thing twice.
  async function choose(opt: FormationOption) {
    if (busy) return
    // A failed enrolment must not strand the user mid-flow: the reading is a
    // suggestion, and everything here is reachable later from the library.
    await enroll(opt).catch((err) => console.warn('[onboarding] enroll failed:', err))
    router.push(nextRoute('formation'))
  }

  return (
    <OnboardingScaffold
      marker={t('onboarding.formation.marker')}
      title={t('onboarding.formation.title')}
      subtitle={t('onboarding.formation.subtitle')}
      progress={stepProgress('formation')}
      onSkip={() => router.push(nextRoute('formation'))}
      skipLabel={t('common.notNow')}
    >
      <YStack gap="$xl" opacity={busy ? 0.5 : 1}>
        {featured ? <Reading opt={featured} featured onChoose={choose} /> : null}

        <YStack gap="$md">
          <Typography
            variant="label"
            tone="muted"
            textTransform="uppercase"
            letterSpacing={1.5}
            fontSize="$1"
          >
            {t('onboarding.formation.otherReadings')}
          </Typography>
          <XStack flexWrap="wrap" justifyContent="space-between" rowGap="$lg">
            {others.map((opt) => (
              <YStack key={opt.id} width="48%">
                <Reading opt={opt} onChoose={choose} />
              </YStack>
            ))}
          </XStack>
        </YStack>
      </YStack>
    </OnboardingScaffold>
  )
}

function Reading({
  opt,
  featured = false,
  onChoose,
}: {
  opt: FormationOption
  featured?: boolean
  onChoose: (opt: FormationOption) => void
}) {
  const { t } = useTranslation()
  const choice = useReadingChoice(opt.id)

  return (
    <AnimatedPressable
      onPress={() => {
        selectionTick()
        onChoose(opt)
      }}
      accessibilityRole="button"
      accessibilityLabel={choice.title}
    >
      {featured ? (
        <ArtChoiceFeatureCard
          choice={choice}
          // A saint card is a whole illuminated page on a cream ground — its
          // name belongs beneath it, not set over it in cream. The art is
          // 1024×1535 (0.667); a hair wider only trims the printed border.
          overlay={false}
          aspectRatio={0.72}
          marker={`${t(tagKey(opt))} · ${t('onboarding.formation.recommended')}`}
        />
      ) : (
        <ArtChoiceCard
          choice={choice}
          aspectRatio={0.72}
          marker={t(tagKey(opt))}
          // A catechism's full title is long — hero size breaks it mid-word in
          // a two-up tile.
          titleSize={20}
          titleLineHeight={26}
        />
      )}
    </AnimatedPressable>
  )
}
