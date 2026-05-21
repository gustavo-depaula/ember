import { Platform } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getCustodyNative } from '../native'
import { selectionIdFor } from '../native/ios'
import type { Target } from '../types'

// The real Family Activity Picker is a SwiftUI view that has to be mounted
// in the React tree. RNDA exposes it as DeviceActivitySelectionViewPersisted,
// which auto-persists the (opaque) selection to UserDefaults under the
// `familyActivitySelectionId` we provide. We use `custody.selection.<id>` so
// `applyShield(id)` later resolves to the same key via `selectionIdFor`.
//
// Loaded conditionally because the import only resolves on iOS with RNDA's
// native module present.

let DeviceActivitySelectionViewPersisted:
  | React.ComponentType<{
      style?: object
      familyActivitySelectionId: string
      headerText?: string | null
      footerText?: string | null
      includeEntireCategory?: boolean
      // biome-ignore lint: RNDA-defined callback signature
      onSelectionChange?: (event: any) => void
    }>
  | undefined

if (Platform.OS === 'ios') {
  try {
    // biome-ignore lint: conditional require for platform-specific module
    DeviceActivitySelectionViewPersisted =
      require('react-native-device-activity').DeviceActivitySelectionViewPersisted
  } catch {
    DeviceActivitySelectionViewPersisted = undefined
  }
}

export function AppTargetPickerIOS({
  commitmentId,
  targets,
  onChange,
}: {
  commitmentId: string
  targets: Target[]
  onChange: (next: Target[]) => void
}) {
  const native = getCustodyNative()

  if (Platform.OS !== 'ios' || !native.isSupported() || !DeviceActivitySelectionViewPersisted) {
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

  const others = targets.filter((t) => t.kind !== 'ios-app' && t.kind !== 'ios-category')
  const selectionId = selectionIdFor(commitmentId)

  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
        Apple keeps your selection private. Ember can't see which apps you pick.
      </Text>
      <DeviceActivitySelectionViewPersisted
        style={{ height: 320, borderRadius: 12, overflow: 'hidden' }}
        familyActivitySelectionId={selectionId}
        includeEntireCategory={true}
        onSelectionChange={(event) => {
          const meta = event?.nativeEvent
          const hasAny =
            (meta?.applicationCount ?? 0) +
              (meta?.categoryCount ?? 0) +
              (meta?.webDomainCount ?? 0) >
            0
          const next = hasAny
            ? [...others, { kind: 'ios-app' as const, tokenRef: selectionId }]
            : others
          onChange(next)
        }}
      />
    </YStack>
  )
}
