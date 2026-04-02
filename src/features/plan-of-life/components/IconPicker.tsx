import { Pressable } from 'react-native'
import { XStack } from 'tamagui'

import { PracticeIcon } from '@/components'
import { practiceIconNames } from '@/components/ornaments/WatercolorIcon'

export function IconPicker({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (icon: string) => void
}) {
  return (
    <XStack gap="$xs" flexWrap="wrap">
      {practiceIconNames.map((icon) => (
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
            <PracticeIcon name={icon} size={22} />
          </XStack>
        </Pressable>
      ))}
    </XStack>
  )
}
