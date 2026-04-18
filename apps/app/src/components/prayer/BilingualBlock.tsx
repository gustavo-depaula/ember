import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, XStack, YStack } from 'tamagui'
import { AnimatedPressable } from '@/components/AnimatedPressable'
import { usePreferencesStore } from '@/stores/preferencesStore'

const languageLabel: Record<ContentLanguage, string> = {
  'en-US': 'EN',
  'pt-BR': 'PT',
  la: 'LA',
}

const toggleAlignEnd = { alignSelf: 'flex-end' } as const
const toggleHitSlop = { top: 12, bottom: 12, left: 16, right: 16 }

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

  return (
    <YStack>
      <AnimatedPressable
        onPress={() => setShowSecondary((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.switchLanguage', {
          language: t(`languages.${toggleTargetLang}`),
        })}
        hitSlop={toggleHitSlop}
        style={toggleAlignEnd}
      >
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$colorSecondary"
          opacity={0.55}
          paddingHorizontal="$xs"
        >
          {languageLabel[toggleTargetLang]}
        </Text>
      </AnimatedPressable>
      {renderText(activeText)}
    </YStack>
  )
}
