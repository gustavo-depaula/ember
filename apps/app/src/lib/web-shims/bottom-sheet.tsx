import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'

/**
 * Web stand-in for `@expo/ui/community/bottom-sheet`.
 *
 * `@expo/ui` is native-only — its components call `requireNativeViewManager`,
 * which throws on web. `ConfirmHost` mounts a sheet at the root of every screen,
 * so without this the whole app is a blank page in a browser. Metro swaps this
 * in for `platform === 'web'` (see `metro.config.js`).
 *
 * Deliberately plain: a fixed backdrop plus a panel docked to the bottom. No
 * gestures — `enablePanDownToClose` has no web equivalent, and the backdrop tap
 * covers the same intent.
 */
export function BottomSheet({
  index = -1,
  onClose,
  backgroundStyle,
  children,
}: {
  index?: number
  snapPoints?: string[]
  enablePanDownToClose?: boolean
  onClose?: () => void
  backgroundStyle?: { backgroundColor?: string }
  children?: ReactNode
}) {
  if (index < 0) return null

  return (
    <View
      // A modal sheet outranks every other layer, including the dev LogBox
      // toast that otherwise docks over its primary action.
      style={{ position: 'fixed', inset: 0, zIndex: 2147483000, justifyContent: 'flex-end' }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
      />
      <View
        style={{
          // `position: relative` is load-bearing: the backdrop is absolutely
          // positioned, and a positioned element paints above a static sibling
          // regardless of DOM order — without this the backdrop swallows every
          // tap meant for the sheet.
          position: 'relative',
          backgroundColor: backgroundStyle?.backgroundColor ?? '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '90%',
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  )
}
