import { Minus, Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import type { Friction, FrictionConfig } from '../types'

const FRICTIONS: Friction[] = ['none', 'wait', 'prayer']
const WAIT_STEP_MINUTES = 1
const WAIT_MIN_MINUTES = 1
const WAIT_MAX_MINUTES = 60
const DEFAULT_WAIT_MINUTES = 5

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
        nextConfig = { kind: 'none' }
        break
      case 'wait':
        nextConfig = {
          kind: 'wait',
          waitSeconds: config?.kind === 'wait' ? config.waitSeconds : DEFAULT_WAIT_MINUTES * 60,
        }
        break
      case 'prayer':
        nextConfig = {
          kind: 'prayer',
          depth: config?.kind === 'prayer' ? (config.depth ?? 'shallow') : 'shallow',
        }
        break
    }
    onChange(friction, nextConfig)
  }

  const bumpWait = (delta: number) => {
    if (config?.kind !== 'wait') return
    const minutes = Math.round(config.waitSeconds / 60)
    const next = Math.max(WAIT_MIN_MINUTES, Math.min(WAIT_MAX_MINUTES, minutes + delta))
    onChange('wait', { kind: 'wait', waitSeconds: next * 60 })
  }

  const setPrayerDepth = (depth: 'shallow' | 'deep') => {
    onChange('prayer', { kind: 'prayer', depth })
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
              gap="$sm"
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
                <XStack alignItems="center" gap="$sm">
                  <Stepper
                    onMinus={() => bumpWait(-WAIT_STEP_MINUTES)}
                    onPlus={() => bumpWait(WAIT_STEP_MINUTES)}
                    color={theme.color.val}
                    label={`${Math.round(config.waitSeconds / 60)} min`}
                  />
                </XStack>
              )}

              {selected && fr === 'prayer' && (
                <YStack gap="$xs">
                  <Text
                    fontFamily="$body"
                    fontSize="$1"
                    color="$colorSecondary"
                    letterSpacing={1.5}
                    textTransform="uppercase"
                  >
                    {t('custody.frictionDepth.label')}
                  </Text>
                  <XStack gap="$xs">
                    {(['shallow', 'deep'] as const).map((d) => {
                      const active =
                        (config?.kind === 'prayer' ? (config.depth ?? 'shallow') : 'shallow') === d
                      return (
                        <Pressable
                          key={d}
                          onPress={() => setPrayerDepth(d)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: active }}
                          style={{ flex: 1 }}
                        >
                          <YStack
                            paddingVertical="$xs"
                            paddingHorizontal="$sm"
                            borderRadius="$md"
                            borderWidth={1}
                            borderColor={active ? '$accent' : '$borderColor'}
                            backgroundColor={active ? '$accent' : 'transparent'}
                            alignItems="center"
                          >
                            <Text
                              fontFamily="$body"
                              fontSize="$2"
                              color={active ? '#0E0D0C' : '$color'}
                            >
                              {t(`custody.frictionDepth.${d}.label`)}
                            </Text>
                          </YStack>
                        </Pressable>
                      )
                    })}
                  </XStack>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {t(
                      `custody.frictionDepth.${
                        config?.kind === 'prayer' ? (config.depth ?? 'shallow') : 'shallow'
                      }.help`,
                    )}
                  </Text>
                </YStack>
              )}
            </YStack>
          </Pressable>
        )
      })}
    </YStack>
  )
}

function Stepper({
  onMinus,
  onPlus,
  label,
  color,
}: {
  onMinus: () => void
  onPlus: () => void
  label: string
  color: string
}) {
  return (
    <XStack alignItems="center" gap="$sm">
      <Pressable onPress={onMinus} accessibilityRole="button" hitSlop={8}>
        <View
          width={32}
          height={32}
          borderRadius={16}
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
        >
          <Minus size={14} color={color} />
        </View>
      </Pressable>
      <Text fontFamily="$body" fontSize="$2" color="$color" minWidth={56} textAlign="center">
        {label}
      </Text>
      <Pressable onPress={onPlus} accessibilityRole="button" hitSlop={8}>
        <View
          width={32}
          height={32}
          borderRadius={16}
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
        >
          <Plus size={14} color={color} />
        </View>
      </Pressable>
    </XStack>
  )
}
