import { CirclePlus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack } from 'tamagui'

import { Typography } from '@/components'

/**
 * The rule page's lesson in one quiet line, under a plan being adopted: any
 * prayer joins the plan from its own page, by the ⊕ beside its title.
 */
export function OtherPrayerLine() {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <XStack
      gap="$md"
      alignItems="flex-start"
      paddingTop="$md"
      borderTopWidth={0.5}
      borderColor="$borderColor"
    >
      <CirclePlus size={22} strokeWidth={1.5} color={theme.accentHover.val} />
      <Typography variant="caption" flex={1}>
        <Typography variant="caption" fontStyle="normal" color="$color">
          {t('onboarding.otherPrayer.title')}
        </Typography>{' '}
        {t('onboarding.otherPrayer.body')}
      </Typography>
    </XStack>
  )
}
