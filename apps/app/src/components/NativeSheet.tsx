import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  type PresentationDetent,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { type ReactElement, useEffect } from 'react'
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'
import { create, type StoreApi, type UseBoundStore } from 'zustand'

// Opens part-way; drags up to the full screen for a long list. Kept as stable
// values: the native selection compares them.
const detentsFor = new Map<number, PresentationDetent[]>()
function sheetDetents(fraction: number): PresentationDetent[] {
  const detents = detentsFor.get(fraction) ?? [{ fraction }, 'large']
  detentsFor.set(fraction, detents)
  return detents
}

// The sheet follows the native one step by step rather than by timing:
// iOS can't present while the last sheet is still sliding away, and a guess at
// how long that takes loses on a busy JS thread — the native side then replays
// the toggles it missed as a run of opens and closes. So "closing" lasts until
// the native sheet reports it gone, and a tap meanwhile opens it only then.
// Kept out of the screen's state, so toggling it doesn't re-render the screen.
type Phase = 'closed' | 'open' | 'closing'
type SheetState = { phase: Phase; reopen: boolean; detent: number; bodyShown: boolean }

export type SheetController = {
  open: () => void
  close: () => void
  store: UseBoundStore<StoreApi<SheetState>>
}

export function createSheet(): SheetController {
  const store = create<SheetState>(() => ({
    phase: 'closed',
    reopen: false,
    detent: 0,
    bodyShown: false,
  }))

  function present() {
    store.setState({ phase: 'open', reopen: false, detent: 0, bodyShown: false })
    // The native sheet presents only once its content has committed, so the
    // body — the costly part — follows the header a couple of frames later,
    // while the sheet is already rising.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        store.setState((s) => (s.phase === 'open' ? { bodyShown: true } : s)),
      ),
    )
  }

  return {
    store,
    open() {
      const { phase } = store.getState()
      if (phase === 'closed') present()
      else if (phase === 'closing') store.setState({ reopen: true })
    },
    /** Starts the sheet sliding away — from a row, or the user's swipe. */
    close() {
      store.setState((s) => (s.phase === 'open' ? { phase: 'closing', reopen: false } : s))
    },
  }
}

// The native sheet takes a drag that starts with the list at its top, but once
// a list has scrolled a drag is the list's to the end: the sheet can't see a
// React Native list, so pulling it past its top only rubber-bands. This reads
// that pull as the finger lifts — the props for any list inside a sheet, native
// or `@expo/ui`'s BottomSheet.
const pullDistance = 60

export function pullDown(onPull: () => void) {
  return {
    onScrollEndDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (e.nativeEvent.contentOffset.y < -pullDistance) onPull()
    },
  }
}

function dismissed(sheet: SheetController) {
  const { reopen } = sheet.store.getState()
  sheet.store.setState({ phase: 'closed' })
  if (reopen) sheet.open()
}

/**
 * A native iOS sheet over the screen, opening to `fraction` of it. `children`
 * gets the props for its list, the height its content should fill, and whether
 * the costly body may render yet.
 */
export function NativeSheet({
  sheet,
  fraction = 0.6,
  children,
}: {
  sheet: SheetController
  fraction?: number
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
          ]}
        >
          <RNHostView>{children({ scroll, height: contentHeight, bodyShown })}</RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}
