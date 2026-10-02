import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { create, type StoreApi, type UseBoundStore } from 'zustand'

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

/** The native sheet is gone: settle, and honour a tap that asked for it meanwhile. */
export function dismissed(sheet: SheetController) {
  const { reopen } = sheet.store.getState()
  sheet.store.setState({ phase: 'closed' })
  if (reopen) sheet.open()
}
