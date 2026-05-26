import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function NewScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout tabBar>
      <YStack flex={1} alignItems="center" justifyContent="center" paddingTop="$xl">
        <Text fontFamily="$heading" fontSize="$5" color="$color">
          {t('nav.new')}
        </Text>
      </YStack>
    </ScreenLayout>
  )
}
