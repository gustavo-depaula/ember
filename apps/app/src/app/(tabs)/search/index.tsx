import { Stack } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function SearchScreen() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerSearchBarOptions: {
            placeholder: t('nav.searchPlaceholder'),
            onChangeText: (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <ScreenLayout tabBar>
        <YStack flex={1} alignItems="center" justifyContent="center" paddingTop="$xl">
          <Text fontFamily="$heading" fontSize="$5" color="$color">
            {query.trim() ? query : t('nav.searchPlaceholder')}
          </Text>
        </YStack>
      </ScreenLayout>
    </>
  )
}
