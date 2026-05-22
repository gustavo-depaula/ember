import { Platform } from 'react-native'
import { Text, YStack } from 'tamagui'

export function AppTargetPickerPlaceholder() {
  const label =
    Platform.OS === 'ios'
      ? 'Coming on iOS — app selection will use Apple’s Family Activity Picker.'
      : Platform.OS === 'android'
        ? 'Coming on Android in v2.'
        : 'App selection is iOS / Android only.'
  return (
    <YStack
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      borderStyle="dashed"
      backgroundColor="$backgroundSurface"
    >
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        {label}
      </Text>
    </YStack>
  )
}
