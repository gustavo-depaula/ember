import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Typography } from '@/components/typography'
import {
  nextRoute,
  OnboardingScaffold,
  recommendTemplates,
  stepProgress,
  useOnboardingState,
} from '@/features/onboarding'
import {
  AdoptSheet,
  TemplateCard,
  TemplateFeatureCard,
  templateName,
  useTemplateList,
  useTemplateManifest,
} from '@/features/templates'
import { lightTap } from '@/lib/haptics'

function bareTemplateId(id: string): string {
  return id.slice(id.indexOf('/') + 1)
}

/**
 * The suggested tradition is held out as a frontispiece — its masterpiece under
 * a gold marker — with the rest offered as the same two-column art grid the
 * `/templates` browser uses. There is no passive way past this step: choosing a
 * tradition always opens the adopt sheet to confirm which practices enter the
 * rule, and the only alternative is to decline outright.
 */
export default function OnboardingPlanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time } = useOnboardingState()
  const templates = useTemplateList()

  const rec = useMemo(
    () => recommendTemplates({ prayerStage, formationStage, time }),
    [prayerStage, formationStage, time],
  )

  const byBareId = useMemo(() => {
    const map = new Map<string, (typeof templates)[number]>()
    for (const item of templates) map.set(bareTemplateId(item.id), item)
    return map
  }, [templates])

  const featured = byBareId.get(rec.primary)
  const others = useMemo(
    () => rec.alsoConsider.filter((id) => id !== rec.primary).map((id) => byBareId.get(id)),
    [rec, byBareId],
  )

  // Tapping a tradition selects it and asks for the sheet; the sheet opens as
  // soon as that template's manifest resolves (it may not be warm yet).
  const [selected, setSelected] = useState(rec.primary)
  const [wantSheet, setWantSheet] = useState(false)
  const manifest = useTemplateManifest(selected)
  const opening = wantSheet && !manifest.data

  const advance = () => router.push(nextRoute('plan'))

  function choose(id: string) {
    lightTap()
    setSelected(id)
    setWantSheet(true)
  }

  return (
    <OnboardingScaffold
      marker={t('onboarding.plan.marker')}
      title={t('onboarding.plan.title')}
      subtitle={t('onboarding.plan.subtitle')}
      progress={stepProgress('plan')}
      onSkip={advance}
      skipLabel={t('onboarding.plan.notNow')}
    >
      <YStack gap="$xl" opacity={opening ? 0.5 : 1}>
        {featured ? (
          <AnimatedPressable
            onPress={() => choose(bareTemplateId(featured.id))}
            accessibilityRole="button"
            accessibilityLabel={templateName(featured)}
          >
            <TemplateFeatureCard item={featured} marker={t('onboarding.plan.recommended')} />
          </AnimatedPressable>
        ) : null}

        {others.length > 0 ? (
          <YStack gap="$md">
            <Typography
              variant="label"
              tone="muted"
              textTransform="uppercase"
              letterSpacing={1.5}
              fontSize="$1"
            >
              {t('onboarding.plan.otherTraditions')}
            </Typography>
            <XStack flexWrap="wrap" justifyContent="space-between" rowGap="$lg">
              {others.map((item) =>
                item ? (
                  <YStack key={item.id} width="48%">
                    <AnimatedPressable
                      onPress={() => choose(bareTemplateId(item.id))}
                      accessibilityRole="button"
                      accessibilityLabel={templateName(item)}
                    >
                      <TemplateCard item={item} />
                    </AnimatedPressable>
                  </YStack>
                ) : null,
              )}
            </XStack>
          </YStack>
        ) : null}
      </YStack>

      {manifest.data ? (
        <AdoptSheet
          template={manifest.data}
          open={wantSheet}
          onClose={() => setWantSheet(false)}
          onAdopted={advance}
        />
      ) : null}
    </OnboardingScaffold>
  )
}
