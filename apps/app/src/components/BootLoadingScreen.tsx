import { ActivityIndicator } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

import { CandleFlame } from './CandleFlame'

/**
 * Shown after fonts/theme are ready but before the corpus is fully warmed.
 * Replaces the long-frozen native splash screen with a calm progress page.
 */
export function BootLoadingScreen({ status }: { status?: string }) {
  const theme = useTheme()
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      gap="$lg"
      padding="$xl"
      backgroundColor="$background"
    >
      <CandleFlame size={64} />
      <Text fontFamily="$heading" fontSize="$5" color="$accent">
        Ember
      </Text>
      <YStack alignItems="center" gap="$sm">
        <ActivityIndicator color={theme.accent?.val ?? '#a07a3a'} />
        {status && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
            {status}
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
