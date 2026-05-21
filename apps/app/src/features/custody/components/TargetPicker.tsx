import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import type { Target } from '../types'

import { AppTargetPickerIOS } from './AppTargetPickerIOS'
import { AppTargetPickerPlaceholder } from './AppTargetPickerPlaceholder'

// Apple's FamilyActivityPicker covers both apps AND web-domain categories
// and is the only path that surfaces our prayer shield. We give it the
// entire primary area of the sheet. The curated JSON lists below are
// ADDITIVE — they layer on top of any apps the user picked. They route
// through setWebContentFilterPolicy (NEFilter), so they only block Safari
// and don't trigger the shield; the helper text calls that out.

type CuratedKey = 'porn' | 'gambling' | 'social' | 'news'

// Short, dignified chip labels. The JSON files have longer localized names
// that read clinically and wrap awkwardly in a chip row.
const CURATED: { key: CuratedKey; label: string; emoji: string }[] = [
  { key: 'porn', label: 'Adult', emoji: '🔞' },
  { key: 'social', label: 'Social', emoji: '💬' },
  { key: 'news', label: 'News', emoji: '📰' },
  { key: 'gambling', label: 'Gambling', emoji: '🎰' },
]

const ACCENT_INK = '#0E0D0C'

export function TargetPicker({
  commitmentId,
  targets,
  onChange,
}: {
  commitmentId: string
  targets: Target[]
  onChange: (next: Target[]) => void
}) {
  const { t } = useTranslation()
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
    <YStack flex={1} gap="$md">
      {/* Privacy note — small, dignified, doesn't compete with the picker. */}
      <Text
        fontFamily="$body"
        fontSize="$1"
        color="$colorSecondary"
        textAlign="center"
        paddingHorizontal="$md"
      >
        {t('custody.targets.privacy')}
      </Text>

      {/* The iOS picker fills all available height between the privacy note
          and the curated chips footer. Bleeds past the sheet's `$lg` (24px)
          padding via negative margin so the embedded SwiftUI view gets the
          full visual width — leaving an 8px gutter on each side for breathing
          room next to the sheet's rounded corners. */}
      <View flex={1} marginHorizontal={-16}>
        {Platform.OS === 'ios' ? (
          <AppTargetPickerIOS commitmentId={commitmentId} targets={targets} onChange={onChange} />
        ) : (
          <AppTargetPickerPlaceholder />
        )}
      </View>

      {/* Additive section — explicit heading rather than a divider so the
          user reads it as "and also" rather than "or". */}
      <YStack gap="$xs">
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          {t('custody.targets.shortcutsHeading')}
        </Text>
        <XStack gap="$xs" flexWrap="wrap">
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
                  borderColor={selected ? '$accent' : '$borderColor'}
                  backgroundColor={selected ? '$accent' : 'transparent'}
                >
                  <Text fontSize={14}>{list.emoji}</Text>
                  <Text fontFamily="$body" fontSize="$2" color={selected ? ACCENT_INK : '$color'}>
                    {list.label}
                  </Text>
                </XStack>
              </Pressable>
            )
          })}
        </XStack>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
          {t('custody.targets.shortcutsHelp')}
        </Text>
      </YStack>
    </YStack>
  )
}
