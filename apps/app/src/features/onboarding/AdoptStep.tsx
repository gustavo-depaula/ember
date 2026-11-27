import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { TemplateView, useAdoptTemplate, useTemplateManifest } from '@/features/templates'

import { reportFailure } from './failure'
import { OtherPrayerLine } from './OtherPrayerLine'

/** A tradition's page where the way in adopts its whole rule and moves on to reminders. */
export function AdoptStep({ templateId }: { templateId: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const adopt = useAdoptTemplate()
  const { data: manifest } = useTemplateManifest(templateId)

  if (!manifest) return <YStack flex={1} backgroundColor="$background" />

  return (
    <TemplateView
      manifest={manifest}
      action={{
        label: t('onboarding.adopt'),
        busy: adopt.isPending,
        onPress: (template) =>
          adopt.mutate(
            { template },
            {
              onSuccess: () => router.push('/onboarding/reminders'),
              onError: reportFailure,
            },
          ),
      }}
      footer={<OtherPrayerLine />}
    />
  )
}
