import { CloudOff } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack } from 'tamagui'

import { useNetworkState } from '@/lib/network'

/** Floats the offline chip in the top-right safe area. Mounted at layout. */
export function FloatingOfflineChip() {
  const insets = useSafeAreaInsets()
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        right: insets.right + 12,
      }}
    >
      <OfflineChip />
    </View>
  )
}

export function OfflineChip() {
  const { t } = useTranslation()
  const theme = useTheme()
  const network = useNetworkState()
  if (network.isOnline) return null
  return (
    <XStack
      alignItems="center"
      gap="$xs"
      paddingHorizontal="$sm"
      paddingVertical={2}
      borderRadius="$md"
      backgroundColor="$backgroundSurface"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <CloudOff size={12} color={theme.colorSecondary.val} />
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
        {t('creators.offline')}
      </Text>
    </XStack>
  )
}
