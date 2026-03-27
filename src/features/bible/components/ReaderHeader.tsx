import { ChevronDown } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

export function ReaderHeader({
  bookName,
  chapter,
  onBookPress,
  onChapterPress,
}: {
  bookName: string
  chapter: number
  onBookPress: () => void
  onChapterPress: () => void
}) {
  const theme = useTheme()

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$sm">
      <Pressable onPress={onBookPress} style={{ flex: 1 }}>
        <XStack alignItems="center" gap="$xs">
          <Text fontFamily="$heading" fontSize="$5" color="$color" numberOfLines={1} flexShrink={1}>
            {bookName}
          </Text>
          <ChevronDown size={18} color={theme.color.val} />
        </XStack>
      </Pressable>

      <Pressable onPress={onChapterPress} style={{ paddingLeft: 32, paddingVertical: 8 }}>
        <Text fontFamily="$heading" fontSize="$5" color="$colorSecondary">
          {chapter}
        </Text>
      </Pressable>
    </XStack>
  )
}
