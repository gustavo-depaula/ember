import { type Href, useFocusEffect, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageFlourish, ScreenLayout, Typography } from '@/components'
import { artFor } from '@/features/explore/artMap'
import {
  ChoiceRow,
  clearOnboardingPlan,
  planSlotIds,
  reasons,
  reportFailure,
  TextLink,
} from '@/features/onboarding'
import { track } from '@/lib/usage'
import { usePreferencesStore } from '@/stores/preferencesStore'

const flourishDark = require('../../../assets/textures/notch_you_dark.png')
const flourishLight = require('../../../assets/textures/notch_you_light.png')

/** The one question: what brings this person here. Each answer is its own way in. */
export default function OnboardingReason() {
  const { t } = useTranslation()
  const router = useRouter()
  const setOnboarding = usePreferencesStore((s) => s.setOnboarding)

  // The first arrival notes the plan as it stands; any later one (a relaunch,
  // a step back) undoes what onboarding has added since, and only that. On
  // focus, not mount: stepping back uncovers this screen without remounting it.
  useFocusEffect(
    useCallback(() => {
      const { onboarding, onboardingKept, setOnboardingKept } = usePreferencesStore.getState()
      if (onboarding === 'new') {
        setOnboardingKept(planSlotIds())
        setOnboarding('started')
        return
      }
      clearOnboardingPlan(new Set(onboardingKept)).catch(reportFailure)
    }, [setOnboarding]),
  )

  return (
    <ScreenLayout modal>
      <PageFlourish
        dark={flourishDark}
        light={flourishLight}
        aspectRatio={2172 / 457}
        lightAspectRatio={2172 / 386}
      />
      <YStack gap="$xs" paddingTop="$sm">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('onboarding.reason.kicker')}
        </Typography>
        <Typography variant="screen-title">{t('onboarding.reason.title')}</Typography>
        <Typography variant="caption" paddingTop="$xs">
          {t('onboarding.reason.lede')}
        </Typography>
      </YStack>

      <YStack paddingTop="$lg">
        {reasons.map((r, i) => (
          <ChoiceRow
            key={r.key}
            testID={`onboarding-reason-${r.key}`}
            first={i === 0}
            title={t(`onboarding.reason.${r.key}`)}
            hint={t(`onboarding.reason.${r.key}Hint`)}
            image={artFor(r.art)}
            onPress={() => {
              track('onboarding_reason', { reason: r.key })
              router.push(`/onboarding/${r.key}` as Href)
            }}
          />
        ))}
      </YStack>

      <YStack marginTop="$xl">
        <TextLink
          testID="onboarding-skip"
          label={t('onboarding.reason.skip')}
          onPress={() => {
            setOnboarding('done')
            track('onboarding_done', { path: 'skip', reminders: 'off' })
            router.replace('/')
          }}
        />
      </YStack>
    </ScreenLayout>
  )
}
