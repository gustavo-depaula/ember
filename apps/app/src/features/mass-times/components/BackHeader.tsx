import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, XStack } from 'tamagui'
import { Typography } from '@/components'

// Back affordance for the pushed Mass Times routes (detail, search). The shared stack already does
// the slide + swipe-back; this is the visible control since native headers are hidden app-wide.
export function BackHeader({ label }: { label: string }) {
  const router = useRouter()
  const theme = useTheme()
  return (
    <Pressable onPress={() => router.back()} hitSlop={12}>
      <XStack alignItems="center" gap="$xs">
        <ChevronLeft size={20} color={theme.accent?.val} />
        <Typography variant="interface" color="$accent">
          {label}
        </Typography>
      </XStack>
    </Pressable>
  )
}
