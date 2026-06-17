import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { ScreenLayout, Typography } from '@/components'
import { ChurchDetail } from '@/features/mass-times'

export default function ChurchDetailScreen() {
  const { churchId } = useLocalSearchParams<{ churchId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout>
      <YStack paddingVertical="$md" gap="$lg">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <XStack alignItems="center" gap="$xs">
            <ChevronLeft size={20} color={theme.accent?.val} />
            <Typography variant="interface" color="$accent">
              {t('massTimes.title')}
            </Typography>
          </XStack>
        </Pressable>
        <ChurchDetail churchId={churchId} />
      </YStack>
    </ScreenLayout>
  )
}
