import { useMemo } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

import { resolvePrayer } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

const essentialPrayerIds = [
  'sign-of-cross',
  'our-father',
  'hail-mary',
  'glory-be',
  'apostles-creed',
  'act-of-contrition',
  'anima-christi',
  'memorare',
] as const

export function EssentialPrayersRow({ onSelect }: { onSelect: (prayerId: string) => void }) {
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps when starter / catalog finishes warming.
  const items = useMemo(() => {
    const out: { id: string; title: string }[] = []
    for (const id of essentialPrayerIds) {
      const asset = resolvePrayer(id)
      if (!asset) continue
      out.push({ id, title: localizeContent(asset.title) })
    }
    return out
  }, [catalogVersion])

  if (items.length === 0) return undefined

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item.id)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <YStack
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$xl"
            backgroundColor="$backgroundSurface"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontFamily="$body" fontSize="$2" color="$color">
              {item.title}
            </Text>
          </YStack>
        </Pressable>
      ))}
    </ScrollView>
  )
}
