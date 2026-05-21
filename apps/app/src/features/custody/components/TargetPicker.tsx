import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import type { Target } from '../types'

import { AppTargetPickerIOS } from './AppTargetPickerIOS'
import { AppTargetPickerPlaceholder } from './AppTargetPickerPlaceholder'
import { DomainListTargetPicker } from './DomainListTargetPicker'
import { DomainTargetPicker } from './DomainTargetPicker'

type TargetType = 'apps' | 'domain' | 'domain-list'

const TYPES: { value: TargetType; label: string; key: string }[] = [
  { value: 'domain', label: 'Domains', key: 'custody.targets.domain' },
  { value: 'domain-list', label: 'Curated lists', key: 'custody.targets.lists' },
  { value: 'apps', label: 'Apps', key: 'custody.targets.apps' },
]

export function TargetPicker({
  commitmentId,
  targets,
  onChange,
}: {
  commitmentId: string
  targets: Target[]
  onChange: (next: Target[]) => void
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<TargetType>('domain')

  return (
    <YStack gap="$sm">
      <XStack gap="$xs">
        {TYPES.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => setMode(type.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === type.value }}
          >
            <YStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$md"
              borderWidth={1}
              borderColor={mode === type.value ? '$accent' : '$borderColor'}
              backgroundColor={mode === type.value ? '$accentSubtle' : 'transparent'}
            >
              <Text fontFamily="$body" fontSize="$2" color="$color">
                {t(type.key, { defaultValue: type.label })}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>

      {mode === 'domain' && <DomainTargetPicker domains={targets} onChange={onChange} />}
      {mode === 'domain-list' && <DomainListTargetPicker targets={targets} onChange={onChange} />}
      {mode === 'apps' &&
        (Platform.OS === 'ios' ? (
          <AppTargetPickerIOS commitmentId={commitmentId} targets={targets} onChange={onChange} />
        ) : (
          <AppTargetPickerPlaceholder />
        ))}
    </YStack>
  )
}
