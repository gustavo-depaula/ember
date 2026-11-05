import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack } from 'tamagui'

import { Typography } from '@/components'

/** The chant library's top line: back, and the page's name when it has one there. */
export function BackHeader({ title, gutter = 20 }: { title?: string; gutter?: number }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  return (
    <XStack alignItems="center" gap="$md" paddingVertical="$md" paddingHorizontal={gutter}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.goBack')}
      >
        <ChevronLeft size={24} color={theme.color.val} />
      </Pressable>
      {title && (
        <Typography flex={1} fontSize="$3" numberOfLines={1}>
          {title}
        </Typography>
      )}
    </XStack>
  )
}
