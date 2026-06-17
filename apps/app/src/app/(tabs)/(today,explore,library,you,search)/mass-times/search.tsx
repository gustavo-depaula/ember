import { Stack } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChurchSearch } from '@/features/mass-times'

// Native iOS search header (matches the Search tab) — a proper full-width search bar + native back,
// not a cramped inline input. The query drives the results below.
export default function MassTimesSearchScreen() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('massTimes.title'),
          headerBackTitle: t('massTimes.title'),
          headerSearchBarOptions: {
            placeholder: t('massTimes.searchPlaceholder'),
            autoFocus: true,
            hideWhenScrolling: false,
            onChangeText: (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <ChurchSearch query={query} />
    </>
  )
}
