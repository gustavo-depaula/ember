import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { ReadingLanguage } from '../ReadingParagraph'

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
  renderText: (text: string, side: 'primary' | 'secondary') => React.ReactNode
}) {
  const displayMode = usePreferencesStore((s) => s.displayMode)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  // Each column is hyphenated and broken in its own language, however far down
  // the reading surface that draws it sits.
  const render = (text: string, side: 'primary' | 'secondary') => (
    <ReadingLanguage language={side === 'secondary' ? secondaryLanguage : contentLanguage}>
      {renderText(text, side)}
    </ReadingLanguage>
  )

  if (!content.secondary || !secondaryLanguage) {
    return (
      <YStack>
        {render(content.primary, 'primary')}
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
        <YStack flex={1}>{render(content.primary, 'primary')}</YStack>
        <View width={1} backgroundColor="$borderColor" />
        <YStack flex={1} opacity={0.85}>
          {render(content.secondary, 'secondary')}
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
      renderText={render}
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
  renderText: (text: string, side: 'primary' | 'secondary') => React.ReactNode
}) {
  const { t } = useTranslation()
  const [showSecondary, setShowSecondary] = useState(false)
  const activeText = showSecondary ? secondary : primary
  const toggleTargetLang = showSecondary ? primaryLanguage : secondaryLanguage
  const toggle = () => setShowSecondary((v) => !v)
  const a11yLabel = t('a11y.switchLanguage', {
    language: t(`languages.${toggleTargetLang}`),
  })

  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={a11yLabel}>
      {renderText(activeText, showSecondary ? 'secondary' : 'primary')}
    </Pressable>
  )
}
