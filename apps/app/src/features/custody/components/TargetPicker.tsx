import { Platform, Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import type { Target } from '../types'

import { AppTargetPickerIOS } from './AppTargetPickerIOS'
import { AppTargetPickerPlaceholder } from './AppTargetPickerPlaceholder'

// Apple's FamilyActivityPicker already covers both apps AND web-domain
// categories — and is the only path that surfaces our prayer shield. So we
// give it the entire sheet. The curated JSON lists (porn / social / news /
// gambling) are kept as a small fallback chip row below for users who want
// a one-tap web-only quick block; they route through
// setWebContentFilterPolicy (NEFilter), so they only block Safari/WebKit and
// don't trigger the shield. The label calls that out explicitly. We dropped
// the manual "type a domain" tab — it's a niche power-user crutch and the
// picker already lets users pick specific web domains by tap.

type CuratedKey = 'porn' | 'gambling' | 'social' | 'news'

// Short, dignified chip labels. The JSON files have longer localized names
// (e.g. "Pornographic websites") that read clinically and wrap awkwardly in
// a chip row. These are tighter and meant for the quick-shortcut surface.
const CURATED: { key: CuratedKey; label: string; emoji: string }[] = [
  { key: 'porn', label: 'Adult', emoji: '🔞' },
  { key: 'social', label: 'Social', emoji: '💬' },
  { key: 'news', label: 'News', emoji: '📰' },
  { key: 'gambling', label: 'Gambling', emoji: '🎰' },
]

export function TargetPicker({
  commitmentId,
  targets,
  onChange,
}: {
  commitmentId: string
  targets: Target[]
  onChange: (next: Target[]) => void
}) {
  const selectedCurated = new Set(
    targets
      .filter((x) => x.kind === 'domain-list')
      .map((x) => (x as { listKey: CuratedKey }).listKey),
  )
  const nonCurated = targets.filter((x) => x.kind !== 'domain-list')

  const toggleCurated = (key: CuratedKey) => {
    const next = new Set(selectedCurated)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    const lists: Target[] = [...next].map((k) => ({ kind: 'domain-list', listKey: k }))
    onChange([...nonCurated, ...lists])
  }

  return (
    <YStack gap="$md">
      {Platform.OS === 'ios' ? (
        <AppTargetPickerIOS commitmentId={commitmentId} targets={targets} onChange={onChange} />
      ) : (
        <AppTargetPickerPlaceholder />
      )}

      <XStack alignItems="center" gap="$sm">
        <View flex={1} height={1} backgroundColor="$borderColor" opacity={0.4} />
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          Or quick web shortcut
        </Text>
        <View flex={1} height={1} backgroundColor="$borderColor" opacity={0.4} />
      </XStack>

      <XStack gap="$xs" flexWrap="wrap" justifyContent="center">
        {CURATED.map((list) => {
          const selected = selectedCurated.has(list.key)
          return (
            <Pressable
              key={list.key}
              onPress={() => toggleCurated(list.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <XStack
                alignItems="center"
                gap={6}
                paddingHorizontal={14}
                paddingVertical={8}
                borderRadius={999}
                borderWidth={1}
                borderColor={selected ? '$accent' : 'rgba(255,255,255,0.12)'}
                backgroundColor={selected ? '$accent' : 'transparent'}
              >
                <Text fontSize={14}>{list.emoji}</Text>
                <Text fontFamily="$body" fontSize="$2" color={selected ? '#0E0D0C' : '$color'}>
                  {list.label}
                </Text>
              </XStack>
            </Pressable>
          )
        })}
      </XStack>

      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
        Shortcuts block sites in Safari only — no prayer shield.
      </Text>
    </YStack>
  )
}
