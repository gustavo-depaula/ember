import { MotiView } from 'moti'
import { ActivityIndicator, Image } from 'react-native'
import { Text, YStack } from 'tamagui'

const splashBackground = '#0E0D0C'
const accentGold = '#D4A63A'
const mutedCream = '#A89A8C'

/**
 * Shown after fonts/theme are ready but before the corpus is fully warmed.
 * Forced to the warm-vigil dark shell so the cold-launch native splash hands
 * off without a flash, regardless of the user's system theme.
 */
export function BootLoadingScreen({ status }: { status?: string }) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      gap="$lg"
      padding="$xl"
      backgroundColor={splashBackground}
    >
      <MotiView
        from={{ opacity: 0.88 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 3500, loop: true }}
      >
        <Image source={require('../../assets/icon.png')} style={{ width: 72, height: 72 }} />
      </MotiView>
      <Text fontFamily="$heading" fontSize="$5" color={accentGold}>
        Ember
      </Text>
      <YStack alignItems="center" gap="$sm">
        <ActivityIndicator color={accentGold} />
        {status && (
          <Text fontFamily="$body" fontSize="$2" color={mutedCream} fontStyle="italic">
            {status}
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
