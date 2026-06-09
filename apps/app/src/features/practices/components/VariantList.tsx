import { Eye } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import type { AlternativeGroup } from '@/content/resolver'
import { lightTap } from '@/lib/haptics'

export function VariantList({
  group,
  activeVariant,
  onSelect,
  onPreview,
}: {
  group: AlternativeGroup
  activeVariant: string
  onSelect: (qualifiedId: string) => void
  onPreview: (qualifiedId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <YStack gap="$md">
      <Typography variant="label" fontSize="$1" textAlign="center" color="$colorSecondary">
        {t('practice.variants')}
      </Typography>
      <YStack gap="$sm">
        {group.members.map((member) => {
          const id = member.manifest.id
          const isActive = id === activeVariant
          return (
            <XStack
              key={id}
              borderRadius="$md"
              borderWidth={1}
              borderColor={isActive ? '$accent' : '$borderColor'}
              backgroundColor={isActive ? '$accent' : 'transparent'}
              overflow="hidden"
            >
              <AnimatedPressable
                style={{ flex: 1 }}
                onPress={() => {
                  if (isActive) return
                  lightTap()
                  onSelect(id)
                }}
                disabled={isActive}
                accessibilityRole="radio"
                accessibilityLabel={t('practice.selectVariant', { name: member.label })}
                accessibilityState={{ selected: isActive }}
              >
                <YStack paddingHorizontal="$md" paddingVertical="$sm" gap="$xxs">
                  <Text
                    fontFamily="$heading"
                    fontSize="$2"
                    color={isActive ? '$background' : '$color'}
                    letterSpacing={0.5}
                  >
                    {member.label}
                  </Text>
                  <Text
                    fontFamily="$body"
                    fontSize="$1"
                    color={isActive ? '$background' : '$colorSecondary'}
                    opacity={isActive ? 0.85 : 1}
                    numberOfLines={2}
                    fontStyle="italic"
                  >
                    {member.description}
                  </Text>
                </YStack>
              </AnimatedPressable>
              <Pressable
                onPress={() => {
                  lightTap()
                  onPreview(id)
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('practice.previewVariant', { name: member.label })}
                style={{
                  paddingHorizontal: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'stretch',
                }}
              >
                <Eye size={20} color={isActive ? theme.background.val : theme.colorSecondary.val} />
              </Pressable>
            </XStack>
          )
        })}
      </YStack>
    </YStack>
  )
}
