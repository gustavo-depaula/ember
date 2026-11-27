import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import type { PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { AdoptSheet, TemplateView, useTemplateManifest } from '@/features/templates'

export default function TemplateDetailScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  // The template to adopt, with the customs picked on the page; none while the sheet is shut.
  const [adopting, setAdopting] = useState<PlanOfLifeTemplateManifest>()

  const { data: manifest, entryExists, catalogReady } = useTemplateManifest(templateId)

  if (!manifest) {
    // Unknown id once the catalog has loaded; otherwise still warming.
    if (catalogReady && !entryExists) {
      return (
        <YStack flex={1} backgroundColor="$background" paddingTop={insets.top + 48} padding="$lg">
          <Typography variant="interface" tone="muted">
            {t('templates.notFound')}
          </Typography>
        </YStack>
      )
    }
    return <YStack flex={1} backgroundColor="$background" />
  }

  return (
    <>
      <TemplateView
        manifest={manifest}
        action={{ label: t('onboarding.adopt'), onPress: setAdopting }}
      />
      <AdoptSheet
        // Its picks start from the template it opens with, customs included.
        key={adopting?.practices.length ?? 0}
        template={adopting ?? manifest}
        open={!!adopting}
        onClose={() => setAdopting(undefined)}
        onAdopted={() => router.push('/you')}
      />
    </>
  )
}
