/**
 * Web stand-in for `@expo/ui`.
 *
 * Every `@expo/ui` entry point calls `requireNativeView(...)` at *module scope*,
 * which throws `UnavailabilityError` on web. Because the call runs on import
 * rather than on render, a single `<BottomSheet>` anywhere in the tree takes the
 * whole web bundle down at boot — not just that component. Metro rewrites
 * `@expo/ui*` to this module for `platform === 'web'` (see metro.config.js).
 *
 * These aren't no-ops: the sheets and the segmented control are real, if plain,
 * web implementations, so the app is navigable in a browser. The SwiftUI-only
 * surface (`Host`, `Group`, `RNHostView`, and the presentation modifiers) has no
 * web meaning and passes through.
 */
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

type Children = { children?: ReactNode }

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sheet: {
    backgroundColor: 'white',
    maxHeight: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  segment: { flexDirection: 'row', gap: 4 },
  segmentItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#00000010',
  },
  segmentItemOn: { backgroundColor: '#00000028' },
})

/**
 * `index` (community API) is -1 when closed; `isOpened` / `isPresented` are the
 * boolean variants. Honouring them matters — a passthrough that always renders
 * children drops every sheet in the app inline on the page.
 */
export function BottomSheet({
  children,
  index,
  isOpened,
  isPresented,
  onClose,
}: Children & {
  index?: number
  isOpened?: boolean
  isPresented?: boolean
  onClose?: () => void
}) {
  const open = index !== undefined ? index >= 0 : (isOpened ?? isPresented ?? false)
  if (!open) return null
  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView>{children}</ScrollView>
      </View>
    </View>
  )
}

export function SegmentedControl({
  values = [],
  selectedIndex = 0,
  onChange,
}: {
  values?: string[]
  selectedIndex?: number
  onChange?: (e: { nativeEvent: { selectedSegmentIndex: number } }) => void
}) {
  return (
    <View style={styles.segment}>
      {values.map((label, i) => (
        <Pressable
          key={label}
          style={[styles.segmentItem, i === selectedIndex && styles.segmentItemOn]}
          onPress={() => onChange?.({ nativeEvent: { selectedSegmentIndex: i } })}
        >
          <Text>{label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

// SwiftUI containers — no web analogue, so they just carry their children.
export function Host({ children, style }: Children & { style?: unknown }) {
  return <View style={style as never}>{children}</View>
}
export const Group = ({ children }: Children) => <>{children}</>
export const RNHostView = ({ children }: Children) => <>{children}</>

// Presentation modifiers describe sheet behaviour the web sheet doesn't model.
const modifier = () => undefined
export const ignoreSafeArea = modifier
export const interactiveDismissDisabled = modifier
export const presentationBackgroundInteraction = modifier
export const presentationDetents = modifier
export const presentationDragIndicator = modifier

// Covers a namespace/default import (`import ExpoUI from '@expo/ui'`). A *named*
// import of something not exported above lands as `undefined` and fails where
// it's rendered — noisy, but local to that component rather than a boot crash.
// Add the export here when a new @expo/ui component starts being used.
const passthrough = ({ children }: Children) => <>{children}</>
const named: Record<string, unknown> = {
  BottomSheet,
  SegmentedControl,
  Host,
  Group,
  RNHostView,
  ignoreSafeArea,
  interactiveDismissDisabled,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
}

export default new Proxy(named, {
  get: (target, key: string) => (key in target ? target[key] : passthrough),
})
