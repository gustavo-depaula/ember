import {
  Host,
  ModalBottomSheet,
  type ModalBottomSheetRef,
  RNHostView,
} from '@expo/ui/jetpack-compose'
import { type ReactElement, useEffect, useRef } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useTheme } from 'tamagui'

import { dismissed, pullDown, type SheetController } from './sheetController'

export { createSheet, pullDown, type SheetController } from './sheetController'

function noop() {}

/**
 * The Android counterpart of the iOS sheet: a Material modal bottom sheet
 * opening to `fraction` of the screen. Material's sheet has no free detents —
 * only "half" and "full" — so it stays at the one height and its list scrolls
 * from the start; the handle, the scrim and Back dismiss it.
 */
export function NativeSheet({
  sheet,
  fraction = 0.6,
  children,
}: {
  sheet: SheetController
  fraction?: number
  /** iOS only: Material's sheet is modal. */
  letsThrough?: boolean
  children: (state: {
    scroll: { scrollEnabled: boolean } & ReturnType<typeof pullDown>
    height: number
    bodyShown: boolean
  }) => ReactElement
}) {
  const phase = sheet.store((s) => s.phase)
  const bodyShown = sheet.store((s) => s.bodyShown)
  const theme = useTheme()
  const { width, height } = useWindowDimensions()
  const sheetRef = useRef<ModalBottomSheetRef>(null)
  const contentHeight = height * fraction

  // Leaving the screen with the sheet mid-way would strand it "closing".
  useEffect(() => () => sheet.store.setState({ phase: 'closed', reopen: false }), [sheet])

  // A row asked to close: slide away first, so the sheet doesn't just vanish.
  useEffect(() => {
    if (phase !== 'closing') return
    // `hide` rejects when the row also navigated and the sheet's composition
    // is already torn down — gone either way, and unmounting removes it.
    const gone = () => dismissed(sheet)
    const hiding = sheetRef.current?.hide() ?? Promise.resolve()
    hiding.then(gone, gone)
  }, [phase, sheet])

  if (phase === 'closed') return null

  return (
    <Host style={{ position: 'absolute', width }} pointerEvents="none">
      <ModalBottomSheet
        ref={sheetRef}
        skipPartiallyExpanded
        containerColor={theme.background.val}
        onDismissRequest={() => dismissed(sheet)}
      >
        <RNHostView matchContents>
          <View style={{ width, height: contentHeight }}>
            {children({
              scroll: { scrollEnabled: true, ...pullDown(noop) },
              height: contentHeight,
              bodyShown,
            })}
          </View>
        </RNHostView>
      </ModalBottomSheet>
    </Host>
  )
}
