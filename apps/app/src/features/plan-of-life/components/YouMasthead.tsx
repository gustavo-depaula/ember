import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'

/**
 * The You masthead — a tracked-caps tagline over the title in the manuscript
 * hand, twinned with `LibraryMasthead` and `AlmanacMasthead`. Names the user's
 * own life of prayer rather than a utility `PageHeader`.
 */
export function YouMasthead() {
  const { t } = useTranslation()
  return (
    <YStack marginTop="$-md" marginBottom="$-sm" gap="$xs">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('you.tagline')}
      </Typography>
      <Typography variant="screen-title">{t('you.pageTitle')}</Typography>
    </YStack>
  )
}
