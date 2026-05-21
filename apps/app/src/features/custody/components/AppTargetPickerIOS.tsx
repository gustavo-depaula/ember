import { Platform } from 'react-native'
import { Text, YStack } from 'tamagui'

import { useBottomSheetSettled } from '@/components'

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
  // The SwiftUI picker lays itself out synchronously at full size when
  // mounted — if we mount it mid sheet-slide, the user sees the picker pop
  // into existence above the still-sliding sheet. Defer mount until the
  // sheet reports settled.
  const settled = useBottomSheetSettled()

  if (Platform.OS !== 'ios' || !native.isSupported() || !DeviceActivitySelectionViewPersisted) {
    return (
      <YStack
        flex={1}
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          App selection is iOS only (and requires the Custody dev client).
        </Text>
      </YStack>
    )
  }

  const others = targets.filter((t) => t.kind !== 'ios-app' && t.kind !== 'ios-category')
  const selectionId = selectionIdFor(commitmentId)

  if (!settled) {
    // Placeholder while the sheet animates in. Roughly matches the picker
    // footprint so the layout doesn't jump on settle.
    return <YStack flex={1} borderRadius={14} backgroundColor="$backgroundSurface" opacity={0.4} />
  }

  return (
    <DeviceActivitySelectionViewPersisted
      style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
      familyActivitySelectionId={selectionId}
      includeEntireCategory={true}
      onSelectionChange={(event) => {
        const meta = event?.nativeEvent
        const hasAny =
          (meta?.applicationCount ?? 0) + (meta?.categoryCount ?? 0) + (meta?.webDomainCount ?? 0) >
          0
        const next = hasAny
          ? [...others, { kind: 'ios-app' as const, tokenRef: selectionId }]
          : others
        onChange(next)
      }}
    />
  )
}
