import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { TemplateCard, useTemplateList } from '@/features/templates'

/**
 * The catalog entry carries the localized name / description / icon, so the
 * list needs no manifest fetch; the painting comes from the app-side artMap.
 */
export default function TemplatesScreen() {
  const { t } = useTranslation()
  const templates = useTemplateList()

  return (
    <ScreenLayout>
      <YStack marginTop="$sm" marginBottom="$lg" gap="$xs">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('templates.subtitle')}
        </Typography>
        <Typography variant="screen-title">{t('templates.title')}</Typography>
      </YStack>

      <XStack flexWrap="wrap" justifyContent="space-between" rowGap="$xl">
        {templates.map((item) => (
          <TemplateCard key={item.id} item={item} />
        ))}
      </XStack>
    </ScreenLayout>
  )
}
