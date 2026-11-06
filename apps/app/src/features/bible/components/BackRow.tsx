import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack } from 'tamagui'

import { Typography } from '@/components'

/** "‹ place": the way back to where the reader came from. */
export function BackRow({ place, onPress }: { place: string; onPress: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.backToPlace', { place })}
    >
      <XStack alignItems="center" gap="$xs" minHeight={36} paddingHorizontal="$lg">
        <ChevronLeft size={16} color={theme.colorSecondary.val} />
        <Typography variant="annotation" fontSize="$2">
          {place}
        </Typography>
      </XStack>
    </Pressable>
  )
}
