import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { usePreferencesStore } from '@/stores/preferencesStore'

const languageLabel: Record<ContentLanguage, string> = {
  'en-US': 'EN',
  'pt-BR': 'PT',
  la: 'LA',
}

const webTapStyle = { cursor: 'pointer', userSelect: 'text' } as const

export function BilingualBlock({
  content,
  renderText,
}: {
  content: BilingualText
  renderText: (text: string) => React.ReactNode
}) {
  const displayMode = usePreferencesStore((s) => s.displayMode)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)

  if (!content.secondary || !secondaryLanguage) {
    return (
      <YStack>
        {renderText(content.primary)}
        {content.secondaryMissing && secondaryLanguage && (
          <Text
            fontFamily="$heading"
            fontSize="$1"
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
    <TapToSwitch
      primary={content.primary}
      secondary={content.secondary}
      primaryLanguage={contentLanguage}
      secondaryLanguage={secondaryLanguage}
      renderText={renderText}
    />
  )
}

function TapToSwitch({
  primary,
  secondary,
  primaryLanguage,
  secondaryLanguage,
  renderText,
}: {
  primary: string
  secondary: string
  primaryLanguage: ContentLanguage
  secondaryLanguage: ContentLanguage
  renderText: (text: string) => React.ReactNode
}) {
  const { t } = useTranslation()
  const [showSecondary, setShowSecondary] = useState(false)
  const activeText = showSecondary ? secondary : primary
  const toggleTargetLang = showSecondary ? primaryLanguage : secondaryLanguage
  const toggle = () => setShowSecondary((v) => !v)
  const a11yLabel = t('a11y.switchLanguage', {
    language: t(`languages.${toggleTargetLang}`),
  })

  if (Platform.OS === 'web') {
    return (
      // biome-ignore lint/a11y/useSemanticElements: <button> collapses child text selection; we need tap-to-toggle AND selectable prayer text
      <div
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={a11yLabel}
        style={webTapStyle}
      >
        {renderText(activeText)}
      </div>
    )
  }

  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={a11yLabel}>
      {renderText(activeText)}
    </Pressable>
  )
}
