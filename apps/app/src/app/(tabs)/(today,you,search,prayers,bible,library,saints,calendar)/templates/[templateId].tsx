import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { AdoptSheet, TemplateView, useTemplateManifest } from '@/features/templates'

export default function TemplateDetailScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [adopting, setAdopting] = useState(false)

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
        action={{ label: t('templates.adopt'), onPress: () => setAdopting(true) }}
      />
      <AdoptSheet
        template={manifest}
        open={adopting}
        onClose={() => setAdopting(false)}
        onAdopted={() => router.push('/you')}
      />
    </>
  )
}
