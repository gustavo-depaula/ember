import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { useGridCells, useWidthClass } from '@/components/pageWidth'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { TemplateCard, type TemplateListItem, useTemplateList } from '@/features/templates'

/**
 * The catalog entry carries the localized name / description / icon, so the
 * list needs no manifest fetch; the painting comes from the app-side artMap.
 */
export default function TemplatesScreen() {
  const { t } = useTranslation()
  const templates = useTemplateList()

  return (
    <ScreenLayout measure="wide">
      <YStack marginTop="$sm" marginBottom="$lg" gap="$xs">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('templates.subtitle')}
        </Typography>
        <Typography variant="screen-title">{t('templates.title')}</Typography>
      </YStack>

      <TemplateGrid templates={templates} />
    </ScreenLayout>
  )
}

// Two abreast on a phone; a wide page takes as many as keep a painting legible.
function TemplateGrid({ templates }: { templates: TemplateListItem[] }) {
  const gap = useWidthClass().medium ? 28 : 14
  const { cell } = useGridCells(240, gap, 2)
  return (
    <XStack flexWrap="wrap" columnGap={gap} rowGap="$xl">
      {templates.map((item) => (
        <TemplateCard key={item.id} item={item} width={cell} />
      ))}
    </XStack>
  )
}
