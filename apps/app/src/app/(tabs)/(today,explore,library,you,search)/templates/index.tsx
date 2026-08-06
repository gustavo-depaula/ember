import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { bareId } from '@/content/contentIndex'
import {
  TemplateCard,
  type TemplateListItem,
  templateName,
  useTemplateList,
} from '@/features/templates'

/**
 * Browse the living traditions — a masthead over a two-column grid of
 * image-forward cards, each a tradition's masterpiece with its name and a line
 * beneath. The card itself is `TemplateCard`, shared with onboarding so a
 * tradition is offered the same way wherever it appears.
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
          <TemplateGridItem key={item.id} item={item} />
        ))}
      </XStack>
    </ScreenLayout>
  )
}

function TemplateGridItem({ item }: { item: TemplateListItem }) {
  const templateId = bareId(item.id)

  return (
    <YStack width="48%">
      <ZoomLink href={{ pathname: '/templates/[templateId]', params: { templateId } }}>
        <AnimatedPressable accessibilityRole="link" accessibilityLabel={templateName(item)}>
          <TemplateCard item={item} />
        </AnimatedPressable>
      </ZoomLink>
    </YStack>
  )
}
