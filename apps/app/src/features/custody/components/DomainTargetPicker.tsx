import { X } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { Target } from '../types'

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

function isValidDomain(value: string): boolean {
  return /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)
}

export function DomainTargetPicker({
  domains,
  onChange,
}: {
  domains: Target[]
  onChange: (next: Target[]) => void
}) {
  const theme = useTheme()
  const [draft, setDraft] = useState('')
  const domainTargets = domains.filter((t): t is Target & { kind: 'domain' } => t.kind === 'domain')
  const otherTargets = domains.filter((t) => t.kind !== 'domain')

  const add = () => {
    const value = normalizeDomain(draft)
    if (!value || !isValidDomain(value)) return
    if (domainTargets.some((t) => t.domain === value)) return
    onChange([...otherTargets, ...domainTargets, { kind: 'domain', domain: value }])
    setDraft('')
  }

  const remove = (domain: string) => {
    onChange(domains.filter((t) => !(t.kind === 'domain' && t.domain === domain)))
  }

  return (
    <YStack gap="$sm">
      <XStack gap="$xs" alignItems="center">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="example.com"
          placeholderTextColor={theme.colorSecondary.val}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={add}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.borderColor.val,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            color: theme.color.val,
          }}
        />
        <Pressable onPress={add} accessibilityRole="button" accessibilityLabel="Add domain">
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$accent"
            paddingHorizontal="$md"
            paddingVertical="$xs"
          >
            + Add
          </Text>
        </Pressable>
      </XStack>

      <YStack gap="$xs">
        {domainTargets.map((t) => (
          <XStack
            key={t.domain}
            alignItems="center"
            gap="$sm"
            paddingHorizontal="$md"
            paddingVertical="$xs"
            borderRadius="$md"
            backgroundColor="$backgroundSurface"
          >
            <Text flex={1} fontFamily="$body" fontSize="$2" color="$color">
              {t.domain}
            </Text>
            <Pressable
              onPress={() => remove(t.domain)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${t.domain}`}
            >
              <X size={16} color={theme.colorSecondary.val} />
            </Pressable>
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}
