import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const [showSecondary, setShowSecondary] = useState(false)
  const activeText = showSecondary ? secondary : primary
  // secondaryLanguage is guaranteed defined here: localizeBilingual only emits
  // content.secondary when a secondary language is set.
  const toggleTargetLang = (showSecondary ? contentLanguage : secondaryLanguage) as ContentLanguage

  return (
    <YStack>
      <Pressable
        onPress={() => setShowSecondary((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.switchLanguage', {
          language: t(`languages.${toggleTargetLang}`),
        })}
        hitSlop={8}
        style={{ alignSelf: 'flex-end' }}
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
      </Pressable>
      {renderText(activeText)}
    </YStack>
  )
}
