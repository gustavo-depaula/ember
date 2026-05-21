import { useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getCustodyNative } from '../native'
import type { Target } from '../types'

export function AppTargetPickerIOS({
  commitmentId,
  targets,
  onChange,
  includeWebDomains = false,
}: {
  commitmentId: string
  targets: Target[]
  onChange: (next: Target[]) => void
  includeWebDomains?: boolean
}) {
  const native = getCustodyNative()
  const [busy, setBusy] = useState(false)

  if (Platform.OS !== 'ios' || !native.isSupported()) {
    return (
      <YStack
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
      >
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          App selection is iOS only (and requires the Custody dev client).
        </Text>
      </YStack>
    )
  }

  const iosAppTarget = targets.find((t) => t.kind === 'ios-app')
  const others = targets.filter((t) => t.kind !== 'ios-app' && t.kind !== 'ios-category')

  return (
    <YStack gap="$xs">
      <Pressable
        disabled={busy}
        onPress={async () => {
          setBusy(true)
          try {
            const result = await native.presentPicker(commitmentId, includeWebDomains)
            if (result) {
              onChange([...others, { kind: 'ios-app', tokenRef: result.tokenRef }])
            }
          } finally {
            setBusy(false)
          }
        }}
      >
        <YStack padding="$md" borderRadius="$md" backgroundColor="$accent" alignItems="center">
          <Text fontFamily="$heading" fontSize="$2" color="white">
            {iosAppTarget ? 'Re-pick apps' : 'Pick apps'}
          </Text>
        </YStack>
      </Pressable>
      {iosAppTarget && (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          Selection saved (opaque token — we cannot show which apps).
        </Text>
      )}
    </YStack>
  )
}
