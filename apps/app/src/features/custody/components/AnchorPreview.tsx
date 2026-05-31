import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import type { Anchor } from '../types'

// Renders a session-runner anchor (text / image / prayer / lectio / silence).
// The iOS shield doesn't use this — it pulls from the rotating message pool.
export function AnchorPreview({ anchor }: { anchor: Anchor | null }) {
  const { t } = useTranslation()
  if (!anchor || anchor.kind === 'silence') {
    return (
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        {t('custody.anchor.kinds.silence')}
      </Text>
    )
  }
  if (anchor.kind === 'text') {
    return (
      <YStack gap="$xs" alignItems="center">
        <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
          {anchor.text}
        </Text>
        {anchor.attribution && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            {anchor.attribution}
          </Text>
        )}
      </YStack>
    )
  }
  if (anchor.kind === 'prayer') {
    return (
      <Text selectable fontFamily="$body" fontSize="$3" color="$color" textAlign="center">
        {anchor.rendered}
      </Text>
    )
  }
  if (anchor.kind === 'lectio') {
    return (
      <YStack gap="$xs" alignItems="center">
        <Text selectable fontFamily="$body" fontSize="$3" color="$color" textAlign="center">
          {anchor.rendered}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {anchor.reference}
        </Text>
      </YStack>
    )
  }
  return (
    <YStack gap="$xs" alignItems="center">
      <Image
        source={anchor.imageRef}
        style={{ width: 240, height: 240, borderRadius: 12 }}
        accessibilityLabel={anchor.caption ?? t('custody.anchor.kinds.image')}
      />
      {anchor.caption && (
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {anchor.caption}
        </Text>
      )}
    </YStack>
  )
}
