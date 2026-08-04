import type { ReactNode } from 'react'
import { View } from 'react-native'

import { BottomSheet as CommunityBottomSheet } from './bottom-sheet'

/**
 * Web stand-in for `@expo/ui/swift-ui` and `@expo/ui/swift-ui/modifiers`.
 *
 * SwiftUI hosts are iOS-only. On web the wrappers collapse to plain views and
 * every modifier becomes an inert token, so a screen that reaches for them
 * renders its children instead of crashing the bundle.
 */
export function Host({ children, style }: { children?: ReactNode; style?: object }) {
  return <View style={style}>{children}</View>
}

export function Group({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export function RNHostView({ children, style }: { children?: ReactNode; style?: object }) {
  return <View style={style}>{children}</View>
}

export const BottomSheet = CommunityBottomSheet

// Modifiers are opaque descriptors on native; nothing reads them here.
const modifier = () => ({}) as never

export const ignoreSafeArea = modifier
export const interactiveDismissDisabled = modifier
export const presentationBackgroundInteraction = modifier
export const presentationDetents = modifier
export const presentationDragIndicator = modifier

export type PresentationDetent = 'medium' | 'large' | number
