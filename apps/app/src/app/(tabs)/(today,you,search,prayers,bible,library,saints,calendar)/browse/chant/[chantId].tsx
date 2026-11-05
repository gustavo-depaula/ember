import { Stack, useLocalSearchParams } from 'expo-router'

import { chantSummary } from '@/features/chant'
import { ChantSheet } from '@/features/chant/ChantSheet'

// One chant on its own sheet: a prayer of the hymns-and-antiphons book, or a
// chant a search or a list found.
export default function ChantScreen() {
  const { chantId } = useLocalSearchParams<{ chantId: string }>()
  const id = `chant/${chantId}`
  const { name } = chantSummary(id)
  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <ChantSheet title={name} chants={[id]} />
    </>
  )
}
