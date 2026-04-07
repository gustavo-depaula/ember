import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { usePreferencesStore } from '@/stores/preferencesStore'

const languageLabel: Record<ContentLanguage, string> = {
  'en-US': 'EN',
  'pt-BR': 'PT',
  la: 'LA',
}

export function BilingualBlock({
  content,
  renderText,
}: {
  content: BilingualText
  renderText: (text: string) => React.ReactNode
}) {
  const displayMode = usePreferencesStore((s) => s.displayMode)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)

  if (!content.secondary) {
    return (
      <YStack>
        {renderText(content.primary)}
        {content.secondaryMissing && secondaryLanguage && (
          <Text
            fontFamily="$heading"
            fontSize={10}
            color="$colorSecondary"
            opacity={0.4}
            textDecorationLine="line-through"
          >
            {languageLabel[secondaryLanguage]}
          </Text>
        )}
      </YStack>
    )
  }

  if (displayMode === 'side-by-side') {
    return (
      <XStack gap="$sm">
        <YStack flex={1}>{renderText(content.primary)}</YStack>
        <View width={1} backgroundColor="$borderColor" />
        <YStack flex={1} opacity={0.85}>
          {renderText(content.secondary)}
        </YStack>
      </XStack>
    )
  }

  return (
    <TapToSwitch primary={content.primary} secondary={content.secondary} renderText={renderText} />
  )
}

function TapToSwitch({
  primary,
  secondary,
  renderText,
}: {
  primary: string
  secondary: string
  renderText: (text: string) => React.ReactNode
}) {
  const [showSecondary, setShowSecondary] = useState(false)
  const activeText = showSecondary ? secondary : primary

  return (
    <Pressable
      onPress={() => setShowSecondary((v) => !v)}
      accessibilityRole="button"
      accessibilityHint="Tap to switch language"
    >
      <YStack>{renderText(activeText)}</YStack>
    </Pressable>
  )
}
