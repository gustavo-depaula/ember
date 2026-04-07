import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import type { PracticeManifest } from '@/content/types'
import { localizeContent } from '@/lib/i18n'

export function VariantSelector({
  manifest,
  selectedVariantId,
  onSelectVariant,
}: {
  manifest: PracticeManifest
  selectedVariantId: string | undefined
  onSelectVariant?: (variantId: string) => void
}) {
  const { t } = useTranslation()

  if (!manifest.variants?.length) return null

  const activeId = selectedVariantId ?? manifest.variants[0].id

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$3" color="$accent">
        {t('catalog.variant')}
      </Text>
      {manifest.variants.map((v) => {
        const isActive = v.id === activeId
        return (
          <Pressable key={v.id} onPress={() => onSelectVariant?.(v.id)} disabled={!onSelectVariant}>
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$md"
              padding="$md"
              borderWidth={1}
              borderColor={isActive ? '$accent' : '$borderColor'}
              gap={4}
            >
              <Text fontFamily="$heading" fontSize="$2" color={isActive ? '$accent' : '$color'}>
                {localizeContent(v.name)}
              </Text>
              {v.description && (
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {localizeContent(v.description)}
                </Text>
              )}
            </YStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
