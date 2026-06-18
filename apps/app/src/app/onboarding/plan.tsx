import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { Card } from '@/components/Card'
import { Typography } from '@/components/typography'
import {
  completeOnboarding,
  nextRoute,
  OnboardingScaffold,
  recommendTemplates,
  stepProgress,
  useOnboardingState,
} from '@/features/onboarding'
import { AdoptSheet } from '@/features/templates/AdoptSheet'
import { useTemplateList, useTemplateManifest } from '@/features/templates/hooks'
import { lightTap, selectionTick } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

function bareTemplateId(id: string): string {
  return id.slice(id.indexOf('/') + 1)
}

export default function OnboardingPlanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { prayerStage, formationStage, time } = useOnboardingState()
  const templates = useTemplateList()

  const rec = useMemo(
    () => recommendTemplates({ prayerStage, formationStage, time }),
    [prayerStage, formationStage, time],
  )

  // Show the recommended template first, then the others worth considering.
  const order = useMemo(() => {
    const ids = [rec.primary, ...rec.alsoConsider]
    return [...new Set(ids)]
  }, [rec])

  const byBareId = useMemo(() => {
    const map = new Map<string, (typeof templates)[number]>()
    for (const item of templates) map.set(bareTemplateId(item.id), item)
    return map
  }, [templates])

  const [selected, setSelected] = useState(rec.primary)
  const [sheetOpen, setSheetOpen] = useState(false)
  const manifest = useTemplateManifest(selected)

  const advance = () => router.push(nextRoute('plan'))

  return (
    <OnboardingScaffold
      title={t('onboarding.plan.title')}
      subtitle={t('onboarding.plan.subtitle')}
      progress={stepProgress('plan')}
      continueLabel={t('common.continue')}
      onContinue={advance}
      onSkip={completeOnboarding}
    >
      <YStack gap="$md">
        {order.map((id) => {
          const item = byBareId.get(id)
          if (!item) return null
          const isSelected = id === selected
          const name = item.entry.name ? localizeContent(item.entry.name) : id
          const description = item.entry.description ? localizeContent(item.entry.description) : ''
          return (
            <AnimatedPressable
              key={id}
              onPress={() => {
                selectionTick()
                setSelected(id)
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={name}
            >
              <Card ornate={isSelected}>
                <YStack gap="$xs">
                  <Typography
                    variant="label"
                    fontSize="$3"
                    color={isSelected ? '$accent' : undefined}
                  >
                    {name}
                  </Typography>
                  <Typography variant="whisper">{description}</Typography>
                  {id === rec.primary ? (
                    <Typography variant="reference" color="$accent">
                      {t('onboarding.plan.recommended')}
                    </Typography>
                  ) : null}
                </YStack>
              </Card>
            </AnimatedPressable>
          )
        })}

        <AnimatedPressable
          onPress={() => {
            if (!manifest.data) return
            lightTap()
            setSheetOpen(true)
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !manifest.data }}
          accessibilityLabel={t('onboarding.plan.preview')}
        >
          <YStack
            borderWidth={1}
            borderColor="$accent"
            borderRadius="$md"
            padding="$md"
            alignItems="center"
            opacity={manifest.data ? 1 : 0.45}
          >
            <Typography variant="label" fontSize="$3" color="$accent">
              {t('onboarding.plan.preview')}
            </Typography>
          </YStack>
        </AnimatedPressable>
      </YStack>

      {manifest.data ? (
        <AdoptSheet
          template={manifest.data}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onAdopted={advance}
        />
      ) : null}
    </OnboardingScaffold>
  )
}
