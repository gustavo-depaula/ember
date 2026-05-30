import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components/typography'

/**
 * The Library masthead — a tracked-caps tagline over the title in the manuscript
 * hand, twinned with Explore's `AlmanacMasthead`. Where the Almanac announces
 * *today in the Church*, this one names *what the soul has gathered*: the user's
 * own shelf, not a utility `PageHeader`.
 */
export function LibraryMasthead() {
  const { t } = useTranslation()
  return (
    <YStack marginTop="$-md" marginBottom="$-sm" gap="$xs">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('library.tagline')}
      </Typography>
      <Typography variant="screen-title">{t('nav.library')}</Typography>
    </YStack>
  )
}
