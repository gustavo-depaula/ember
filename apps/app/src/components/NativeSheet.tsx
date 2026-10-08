import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  type PresentationDetent,
  presentationBackground,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { type ReactElement, useEffect } from 'react'
import { Platform, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { dismissed, pullDown, type SheetController } from './sheetController'

export { createSheet, pullDown, type SheetController } from './sheetController'

// Opens part-way; drags up to the full screen for a long list. Kept as stable
// values: the native selection compares them.
const detentsFor = new Map<number, PresentationDetent[]>()
function sheetDetents(fraction: number): PresentationDetent[] {
  const detents = detentsFor.get(fraction) ?? [{ fraction }, 'large']
  detentsFor.set(fraction, detents)
  return detents
}

/**
 * A native iOS sheet over the screen, opening to `fraction` of it. `children`
 * gets the props for its list, the height its content should fill, and whether
 * the costly body may render yet.
 */
export function NativeSheet({
  sheet,
  fraction = 0.6,
  letsThrough = false,
  children,
}: {
  sheet: SheetController
  fraction?: number
  /** Part-way up, the screen behind stays in use: it scrolls and takes taps, undimmed. */
  letsThrough?: boolean
  children: (state: {
    scroll: { scrollEnabled: boolean } & ReturnType<typeof pullDown>
    height: number
    bodyShown: boolean
  }) => ReactElement
}) {
  const phase = sheet.store((s) => s.phase)
  const detent = sheet.store((s) => s.detent)
  const bodyShown = sheet.store((s) => s.bodyShown)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const detents = sheetDetents(fraction)
  const expanded = detent === detents.length - 1
  // The native sheet hosts its content at a fixed size, so the content follows
  // the detent; the full one sits under the status bar.
  const contentHeight = expanded ? height - insets.top : height * fraction
  // Part-way up, a drag moves the sheet rather than the list, so the list
  // scrolls only at full height — and a pull at its top there brings the sheet
  // back down part-way, where the native drag takes over.
  const scroll = {
    scrollEnabled: expanded,
    ...pullDown(() => sheet.store.setState({ detent: 0 })),
  }

  // Leaving the screen with the sheet mid-way would strand it "closing".
  useEffect(() => () => sheet.store.setState({ phase: 'closed', reopen: false }), [sheet])

  return (
    // On web a stand-in draws the sheet inside the Host, so there it spans the
    // screen and lets taps through to the screen.
    <Host
      style={Platform.OS === 'web' ? StyleSheet.absoluteFill : { position: 'absolute', width }}
      pointerEvents={Platform.OS === 'web' ? 'box-none' : 'none'}
    >
      <BottomSheet
        isPresented={phase === 'open'}
        onIsPresentedChange={(presented) => !presented && sheet.close()}
        onDismiss={() => dismissed(sheet)}
      >
        <Group
          modifiers={[
            presentationDetents(detents, {
              selection: detents[detent],
              onSelectionChange: (d) =>
                sheet.store.setState({ detent: d === 'large' ? detents.length - 1 : 0 }),
            }),
            presentationDragIndicator('visible'),
            presentationBackground(theme.background.val),
            ...(letsThrough
              ? [
                  presentationBackgroundInteraction({
                    type: 'enabledUpThrough',
                    detent: detents[0],
                  }),
                ]
              : []),
          ]}
        >
          <RNHostView>{children({ scroll, height: contentHeight, bodyShown })}</RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}
