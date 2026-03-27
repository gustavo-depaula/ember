import { ChevronDown } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

export function CatechismHeader({
  sectionName,
  paragraphRange,
  onTocPress,
  onSectionPress,
}: {
  sectionName: string
  paragraphRange: string
  onTocPress: () => void
  onSectionPress: () => void
}) {
  const theme = useTheme()

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$sm">
      <Pressable onPress={onTocPress} style={{ flex: 1, marginRight: 12 }}>
        <XStack alignItems="center" gap="$xs">
          <Text fontFamily="$heading" fontSize="$5" color="$color" numberOfLines={1} flex={1}>
            {sectionName}
          </Text>
          <ChevronDown size={18} color={theme.color.val} />
        </XStack>
      </Pressable>

      <Pressable onPress={onSectionPress}>
        <Text fontFamily="$heading" fontSize="$5" color="$colorSecondary">
          {paragraphRange}
        </Text>
      </Pressable>
    </XStack>
  )
}
