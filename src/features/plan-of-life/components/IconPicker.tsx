import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'

import { availableIconKeys, getPracticeIcon } from '@/db/seed'

export function IconPicker({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (icon: string) => void
}) {
  return (
    <XStack gap="$xs" flexWrap="wrap">
      {availableIconKeys.map((icon) => (
        <Pressable key={icon} onPress={() => onSelect(icon)}>
          <XStack
            width={44}
            height={44}
            borderRadius="$md"
            borderWidth={2}
            borderColor={selected === icon ? '$accent' : 'transparent'}
            backgroundColor={selected === icon ? '$backgroundSurface' : 'transparent'}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={22}>{getPracticeIcon(icon)}</Text>
          </XStack>
        </Pressable>
      ))}
    </XStack>
  )
}
