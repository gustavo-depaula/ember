import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { DivineOfficePage } from '@/features/divine-office/DivineOfficePage'

// Opened from an Office holy card, `saints` (comma-separated) and `date` name
// the card the Office wins.
export default function DivineOfficeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { saints, date } = useLocalSearchParams<{ saints?: string; date?: string }>()
  const card = saints && date ? { saints: saints.split(','), date } : undefined

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('office.title') }} />
      <YStack gap="$lg" paddingVertical="$lg">
        <AnimatedPressable
          onPress={() => router.back()}
          accessibilityRole="link"
          accessibilityLabel={t('common.back')}
        >
          <Typography variant="reference">‹ {t('common.back')}</Typography>
        </AnimatedPressable>
        <DivineOfficePage card={card} />
      </YStack>
    </ScreenLayout>
  )
}
