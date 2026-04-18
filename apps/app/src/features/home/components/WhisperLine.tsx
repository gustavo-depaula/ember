import { Pressable } from 'react-native'
import { Text } from 'tamagui'

type Tone = 'bright' | 'quiet'

export function WhisperLine({
  onPress,
  label,
  accessibilityLabel,
  tone = 'bright',
}: {
  onPress: () => void
  label: string
  accessibilityLabel: string
  tone?: Tone
}) {
  const bright = tone === 'bright'
  return (
    <Pressable
      onPress={onPress}
      hitSlop={bright ? 8 : 6}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        fontFamily="$script"
        fontSize={bright ? '$3' : '$2'}
        color={bright ? '$accent' : '$colorSecondary'}
        fontStyle="italic"
        textAlign="center"
        paddingVertical="$xs"
        opacity={bright ? 0.85 : 0.75}
      >
        {label}
      </Text>
    </Pressable>
  )
}
