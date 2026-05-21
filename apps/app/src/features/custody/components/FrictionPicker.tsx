import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { Friction, FrictionConfig } from '../types'

const FRICTIONS: Friction[] = ['none', 'wait', 'prayer', 'confession-only']

export function FrictionPicker({
  value,
  config,
  onChange,
}: {
  value: Friction
  config: FrictionConfig | null
  onChange: (friction: Friction, config: FrictionConfig | null) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const handleChange = (friction: Friction) => {
    let nextConfig: FrictionConfig | null = null
    switch (friction) {
      case 'none':
      case 'confession-only':
        nextConfig = { kind: friction }
        break
      case 'wait':
        nextConfig = {
          kind: 'wait',
          waitSeconds: config?.kind === 'wait' ? config.waitSeconds : 300,
        }
        break
      case 'prayer':
        nextConfig = {
          kind: 'prayer',
          prayerRef: config?.kind === 'prayer' ? config.prayerRef : 'prayer/anima-christi',
        }
        break
    }
    onChange(friction, nextConfig)
  }

  return (
    <YStack gap="$sm">
      {FRICTIONS.map((fr) => {
        const selected = fr === value
        return (
          <Pressable
            key={fr}
            onPress={() => handleChange(fr)}
            accessibilityRole="radio"
            accessibilityLabel={t(`custody.friction.${fr}.label`)}
            accessibilityState={{ selected }}
          >
            <YStack
              gap="$xs"
              padding="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor={selected ? '$accent' : '$borderColor'}
              backgroundColor={selected ? '$accentSubtle' : 'transparent'}
            >
              <Text fontFamily="$body" fontSize="$2" color="$color">
                {t(`custody.friction.${fr}.label`)}
              </Text>
              {selected && fr === 'wait' && config?.kind === 'wait' && (
                <XStack alignItems="center" gap="$xs">
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    Wait for
                  </Text>
                  <TextInput
                    value={String(Math.round(config.waitSeconds / 60))}
                    keyboardType="number-pad"
                    onChangeText={(v) => {
                      const minutes = Number.parseInt(v, 10)
                      if (!Number.isNaN(minutes) && minutes > 0) {
                        onChange('wait', { kind: 'wait', waitSeconds: minutes * 60 })
                      }
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.borderColor.val,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      minWidth: 48,
                      color: theme.color.val,
                    }}
                  />
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    minutes
                  </Text>
                </XStack>
              )}
            </YStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}
